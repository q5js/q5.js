Q5.renderers.webgpu = {};

Q5.renderers.webgpu.canvas = ($, q) => {
	let c = $.canvas;

	if ($.colorMode) $.colorMode('rgb', 1);

	$._baseShaderCode = /* wgsl */ `
struct Q5 {
	width: f32,
	height: f32,
	halfWidth: f32,
	halfHeight: f32,
	pixelDensity: f32,
	frameCount: f32,
	time: f32,
	deltaTime: f32,
	mouseX: f32,
	mouseY: f32,
	mouseIsPressed: f32,
	keyCode: f32,
	keyIsPressed: f32
}`;

	$._g = $.createGraphics(1, 1, 'c2d');
	if ($._g.colorMode) $._g.colorMode($.RGB, 1);

	let encoder,
		pass,
		mainView,
		frameA,
		frameB,
		frameLayout,
		frameSampler,
		frameBindGroup,
		colorIndex = 1,
		colorStackIndex = 8;

	$._pipelineConfigs = [];
	$._pipelines = [];
	$._buffers = [];
	$._prevFramePL = 0;
	$._framePL = 0;

	// local variables used for slightly better performance

	// stores pipeline shifts and vertex counts/image indices
	let drawStack = ($._drawStack = []);

	// colors used for each draw call
	let colorStack = ($._colorStack = new Float32Array(1e6));

	// prettier-ignore
	colorStack.set([
		0, 0, 0, 1, // black
		1, 1, 1, 1 // white
	]);

	let mainLayout = Q5.device.createBindGroupLayout({
		label: 'mainLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: { type: 'uniform' }
			},
			{
				binding: 1,
				visibility: GPUShaderStage.VERTEX,
				buffer: { type: 'read-only-storage' }
			},
			{
				binding: 2,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: { type: 'read-only-storage' }
			}
		]
	});

	$._bindGroupLayouts = [mainLayout];

	let uniformBuffer = Q5.device.createBuffer({
		size: 64,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
	});

	let createMainView = () => {
		let w = $.canvas.width,
			h = $.canvas.height,
			size = [w, h],
			format = 'bgra8unorm';

		mainView = Q5.device
			.createTexture({
				size,
				sampleCount: 4,
				format,
				usage: GPUTextureUsage.RENDER_ATTACHMENT
			})
			.createView();

		let usage =
			GPUTextureUsage.COPY_SRC |
			GPUTextureUsage.COPY_DST |
			GPUTextureUsage.TEXTURE_BINDING |
			GPUTextureUsage.RENDER_ATTACHMENT;

		// start swapped so that beginRender will make frameA the first frame
		$._frameA = frameB = Q5.device.createTexture({ label: 'frameA', size, format, usage });
		$._frameB = frameA = Q5.device.createTexture({ label: 'frameB', size, format, usage });

		$._frameShaderCode =
			$._baseShaderCode +
			/* wgsl */ `
struct VertexParams {
	@builtin(vertex_index) vertexIndex: u32
}
struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) texCoord: vec2f
}

const ndc = array(vec2f(-1,-1), vec2f(1,-1), vec2f(-1,1), vec2f(1,1));
const quad = array(vec2f(0,1), vec2f(1,1), vec2f(0,0), vec2f(1,0));

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var tex: texture_2d<f32>;

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var f: FragParams;
	f.position = vec4f(ndc[v.vertexIndex], 0.0, 1.0);
	f.texCoord = quad[v.vertexIndex];
	return f;
}

@fragment
fn fragMain(f: FragParams ) -> @location(0) vec4f {
	return textureSample(tex, samp, f.texCoord);
}`;

		let frameShader = Q5.device.createShaderModule({
			label: 'frameShader',
			code: $._frameShaderCode
		});

		frameSampler = Q5.device.createSampler({
			magFilter: 'linear',
			minFilter: 'linear'
		});

		frameLayout = Q5.device.createBindGroupLayout({
			label: 'frameLayout',
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: { type: 'uniform' }
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: { type: 'filtering' }
				},
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					texture: { viewDimension: '2d', sampleType: 'float' }
				}
			]
		});

		let framePipelineLayout = Q5.device.createPipelineLayout({
			bindGroupLayouts: [frameLayout]
		});

		$._pipelineConfigs[0] = {
			layout: framePipelineLayout,
			vertex: { module: frameShader, entryPoint: 'vertexMain' },
			fragment: {
				module: frameShader,
				entryPoint: 'fragMain',
				targets: [{ format }]
			},
			primitive: { topology: 'triangle-strip' },
			multisample: { count: 4 }
		};

		// Create a pipeline for rendering frames
		$._pipelines[0] = Q5.device.createRenderPipeline($._pipelineConfigs[0]);
	};

	$._createCanvas = (w, h, opt) => {
		q.ctx = q.drawingContext = c.getContext('webgpu');

		opt.format ??= navigator.gpu.getPreferredCanvasFormat();
		opt.device ??= Q5.device;
		if (opt.alpha) opt.alphaMode = 'premultiplied';

		$.ctx.configure(opt);

		createMainView();
		return c;
	};

	$._resizeCanvas = (w, h) => {
		$._setCanvasSize(w, h);
		createMainView();
	};

	// since these values are checked so often in `addColor`,
	// they're stored in local variables for better performance
	let usingRGB = true,
		colorFormat = 1;

	if ($.colorMode) {
		let cm = $.colorMode;
		$.colorMode = function () {
			cm(...arguments);
			usingRGB = $._colorMode == 'rgb';
			colorFormat = $._colorFormat;
		};
	}

	let addColor = (r, g, b, a) => {
		if (typeof r === 'string' || usingRGB === false) {
			r = $.color(r, g, b, a);
		} else if (b === undefined) {
			// grayscale mode `fill(1, 0.5)`
			a = g ?? colorFormat;
			g = b = r;
		}
		a ??= colorFormat;
		if (r._q5Color) {
			let c = r;
			if (c.r != undefined) ({ r, g, b, a } = c);
			else {
				a = c.a;
				if (c.c != undefined) c = Q5.OKLCHtoRGB(c.l, c.c, c.h);
				else if (c.l != undefined) c = Q5.HSLtoRGB(c.h, c.s, c.l);
				else c = Q5.HSLtoRGB(...Q5.HSBtoHSL(c.h, c.s, c.b));
				[r, g, b] = c;
			}
		}

		if (colorFormat === 255) {
			r /= 255;
			g /= 255;
			b /= 255;
			a /= 255;
		}

		let cs = colorStack,
			i = colorStackIndex;
		cs[i++] = r;
		cs[i++] = g;
		cs[i++] = b;
		cs[i++] = a;
		colorStackIndex = i;

		colorIndex++;
	};

	$._stroke = 0;
	$._fill = $._tint = $._globalAlpha = 1;
	$._doFill = $._doStroke = true;

	$.fill = (r, g, b, a) => {
		addColor(r, g, b, a);
		$._doFill = $._fillSet = true;
		$._fill = colorIndex;
	};
	$.stroke = (r, g, b, a) => {
		addColor(r, g, b, a);
		$._doStroke = $._strokeSet = true;
		$._stroke = colorIndex;
	};
	$.tint = (r, g, b, a) => {
		addColor(r, g, b, a);
		$._tint = colorIndex;
	};
	$.opacity = (a) => ($._globalAlpha = a);
	$.noFill = () => ($._doFill = false);
	$.noStroke = () => ($._doStroke = false);
	$.noTint = () => ($._tint = 1);

	$._strokeWeight = 1;
	$._hsw = 0.5;
	$._scaledSW = 1;

	$.strokeWeight = (v) => {
		v = Math.abs(v);
		$._strokeWeight = v;
		$._scaledSW = v * $._scale;
		$._hsw = v / 2;
	};

	const MAX_TRANSFORMS = $._graphics ? 1000 : 1e7,
		MATRIX_SIZE = 16, // 4x4 matrix
		transforms = new Float32Array(MAX_TRANSFORMS * MATRIX_SIZE);

	let matrix,
		matrices = [],
		matricesIndexStack = [];

	// tracks if the matrix has been modified
	$._matrixDirty = false;

	// initialize with a 4x4 identity matrix
	// prettier-ignore
	matrices.push([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);

	transforms.set(matrices[0]);

	$.resetMatrix = () => {
		matrix = matrices[0].slice();
		$._matrixIndex = 0;
	};
	$.resetMatrix();

	$.translate = (x, y, z = 0) => {
		if (!x && !y && !z) return;
		// update the translation values
		let m = matrix;
		m[12] += x * m[0];
		m[13] -= y * m[5];
		m[14] += z * m[10];
		$._matrixDirty = true;
	};

	$.rotate = $.rotateZ = (a) => {
		if (!a) return;
		if ($._angleMode) a *= $._DEGTORAD;

		let cosR = Math.cos(a),
			sinR = Math.sin(a),
			m = matrix,
			m0 = m[0],
			m1 = m[1],
			m4 = m[4],
			m5 = m[5];

		// if identity matrix, just set the rotation values
		if (m0 == 1 && !m1 && !m4 && m5 == 1) {
			m[0] = cosR;
			m[1] = -sinR;
			m[4] = sinR;
			m[5] = cosR;
		} else {
			// combine the current rotation with the new rotation
			m[0] = m0 * cosR + m1 * sinR;
			m[1] = m1 * cosR - m0 * sinR;
			m[4] = m4 * cosR + m5 * sinR;
			m[5] = m5 * cosR - m4 * sinR;
		}

		$._matrixDirty = true;
	};

	$._scale = 1;

	$.scale = (x = 1, y, z = 1) => {
		y ??= x;

		$._scale = Math.max(Math.abs(x), Math.abs(y));
		$._scaledSW = $._strokeWeight * $._scale;

		let m = matrix;

		m[0] *= x;
		m[1] *= x;
		m[2] *= x;
		m[3] *= x;
		m[4] *= y;
		m[5] *= y;
		m[6] *= y;
		m[7] *= y;
		m[8] *= z;
		m[9] *= z;
		m[10] *= z;
		m[11] *= z;

		$._matrixDirty = true;
	};

	$.shearX = (ang) => {
		if (!ang) return;
		if ($._angleMode) ang *= $._DEGTORAD;

		let tanAng = Math.tan(ang),
			m = matrix,
			m0 = m[0],
			m1 = m[1],
			m4 = m[4],
			m5 = m[5];

		m[0] = m0 + m4 * tanAng;
		m[1] = m1 + m5 * tanAng;

		$._matrixDirty = true;
	};

	$.shearY = (ang) => {
		if (!ang) return;
		if ($._angleMode) ang *= $._DEGTORAD;

		let tanAng = Math.tan(ang),
			m = matrix,
			m0 = m[0],
			m1 = m[1],
			m4 = m[4],
			m5 = m[5];

		m[4] = m4 + m0 * tanAng;
		m[5] = m5 + m1 * tanAng;

		$._matrixDirty = true;
	};

	$.applyMatrix = (...args) => {
		let m;
		if (args.length == 1) m = args[0];
		else m = args;

		if (m.length == 9) {
			// convert 3x3 matrix to 4x4 matrix
			m = [m[0], m[1], 0, m[2], m[3], m[4], 0, m[5], 0, 0, 1, 0, m[6], m[7], 0, m[8]];
		} else if (m.length != 16) {
			throw new Error('Matrix must be a 3x3 or 4x4 array.');
		}

		// overwrite the current transformation matrix
		matrix = m.slice();
		$._matrixDirty = true;
	};

	// saves the current matrix state
	$._saveMatrix = () => {
		transforms.set(matrix, matrices.length * MATRIX_SIZE);
		$._matrixIndex = matrices.length;
		matrices.push(matrix.slice());
		$._matrixDirty = false;
	};

	// push the current matrix index onto the stack
	$.pushMatrix = () => {
		if ($._matrixDirty) $._saveMatrix();
		matricesIndexStack.push($._matrixIndex);
	};

	$.popMatrix = () => {
		if (!matricesIndexStack.length) {
			return console.warn('Matrix index stack is empty!');
		}
		// pop the last matrix index and set it as the current matrix index
		let idx = matricesIndexStack.pop();
		matrix = matrices[idx].slice();
		$._matrixIndex = idx;
		$._matrixDirty = false;
	};

	let _pushStyles = $.pushStyles;
	$.pushStyles = () => {
		_pushStyles();
		$.strokeWeight($._strokeWeight);
	};

	$.push = () => {
		$.pushMatrix();
		$.pushStyles();
	};

	$.pop = () => {
		$.popMatrix();
		$.popStyles();
	};

	$._calcBox = (x, y, w, h, mode) => {
		// left, right, top, bottom
		let l, r, t, b;
		if (!mode || mode == 'corner') {
			l = x;
			r = x + w;
			t = -y;
			b = -(y + h);
		} else if (mode == 'center') {
			let hw = w / 2,
				hh = h / 2;
			l = x - hw;
			r = x + hw;
			t = -(y - hh);
			b = -(y + hh);
		} else {
			// CORNERS
			l = x;
			r = w;
			t = -y;
			b = -h;
		}

		return [l, r, t, b];
	};

	// prettier-ignore
	let blendFactors = [
		'zero',                // 0
		'one',                 // 1
		'src-alpha',           // 2
		'one-minus-src-alpha', // 3
		'dst',                 // 4
		'dst-alpha',           // 5
		'one-minus-dst-alpha', // 6
		'one-minus-src'        // 7
	];
	let blendOps = [
		'add', // 0
		'subtract', // 1
		'reverse-subtract', // 2
		'min', // 3
		'max' // 4
	];

	const blendModes = {
		'source-over': [2, 3, 0, 2, 3, 0],
		'destination-over': [6, 1, 0, 6, 1, 0],
		'source-in': [5, 0, 0, 5, 0, 0],
		'destination-in': [0, 2, 0, 0, 2, 0],
		'source-out': [6, 0, 0, 6, 0, 0],
		'destination-out': [0, 3, 0, 0, 3, 0],
		'source-atop': [5, 3, 0, 5, 3, 0],
		'destination-atop': [6, 2, 0, 6, 2, 0],
		lighter: [1, 1, 0, 1, 1, 0],
		darken: [1, 1, 3, 3, 5, 0],
		lighten: [1, 1, 4, 3, 5, 0],
		replace: [1, 0, 0, 1, 0, 0]
	};

	$._blendModeNames = Object.keys(blendModes);

	$.blendConfigs = {};

	for (const [name, mode] of Object.entries(blendModes)) {
		$.blendConfigs[name] = {
			color: {
				srcFactor: blendFactors[mode[0]],
				dstFactor: blendFactors[mode[1]],
				operation: blendOps[mode[2]]
			},
			alpha: {
				srcFactor: blendFactors[mode[3]],
				dstFactor: blendFactors[mode[4]],
				operation: blendOps[mode[5]]
			}
		};
	}

	$._blendMode = 'source-over';

	$.blendMode = (mode) => {
		if (mode == $._blendMode) return;
		$._blendMode = mode;
		let i = $._blendModeNames.indexOf(mode);
		if (i == -1) {
			console.error(`Blend mode "${mode}" not supported in q5.js WebGPU.`);
			return;
		}
		drawStack.push(0, i);
	};

	let shouldClear;

	$.clear = () => {
		shouldClear = true;
	};

	$.background = (r, g, b, a) => {
		$.push();
		$.resetMatrix();
		if (r.canvas) {
			let img = r;
			$._imageMode = 'corner';
			$.image(img, -c.hw, -c.hh, c.w, c.h);
		} else {
			$._rectMode = 'corner';
			$.fill(r, g, b, a);
			$._doStroke = false;
			$.rect(-c.hw, -c.hh, c.w, c.h);
		}
		$.pop();
	};

	$._beginRender = () => {
		// swap the frame textures
		const temp = frameA;
		frameA = frameB;
		frameB = temp;

		encoder = Q5.device.createCommandEncoder();

		$._pass = pass = encoder.beginRenderPass({
			label: 'q5-webgpu',
			colorAttachments: [
				{
					view: mainView,
					resolveTarget: frameA.createView(),
					loadOp: 'clear',
					storeOp: 'store',
					clearValue: [0, 0, 0, 0]
				}
			]
		});

		frameBindGroup = Q5.device.createBindGroup({
			layout: frameLayout,
			entries: [
				{ binding: 0, resource: { buffer: uniformBuffer } },
				{ binding: 1, resource: frameSampler },
				{ binding: 2, resource: frameB.createView() }
			]
		});

		if (!shouldClear) {
			pass.setPipeline($._pipelines[$._prevFramePL]);
			pass.setBindGroup(0, frameBindGroup);
			pass.draw(4);
		}
		shouldClear = false;
	};

	$._render = () => {
		let transformBuffer = Q5.device.createBuffer({
			size: matrices.length * MATRIX_SIZE * 4, // 4 bytes per float
			usage: GPUBufferUsage.STORAGE,
			mappedAtCreation: true
		});

		new Float32Array(transformBuffer.getMappedRange()).set(transforms.slice(0, matrices.length * MATRIX_SIZE));
		transformBuffer.unmap();

		$._buffers.push(transformBuffer);

		let colorsBuffer = Q5.device.createBuffer({
			size: colorStackIndex * 4,
			usage: GPUBufferUsage.STORAGE,
			mappedAtCreation: true
		});

		new Float32Array(colorsBuffer.getMappedRange()).set(colorStack.slice(0, colorStackIndex));
		colorsBuffer.unmap();

		$._buffers.push(colorsBuffer);

		$._uniforms = [
			$.width,
			$.height,
			$.halfWidth,
			$.halfHeight,
			$._pixelDensity,
			$.frameCount,
			performance.now(),
			$.deltaTime,
			$.mouseX,
			$.mouseY,
			$.mouseIsPressed ? 1 : 0,
			$.keyCode,
			$.keyIsPressed ? 1 : 0
		];

		Q5.device.queue.writeBuffer(uniformBuffer, 0, new Float32Array($._uniforms));

		let mainBindGroup = Q5.device.createBindGroup({
			layout: mainLayout,
			entries: [
				{ binding: 0, resource: { buffer: uniformBuffer } },
				{ binding: 1, resource: { buffer: transformBuffer } },
				{ binding: 2, resource: { buffer: colorsBuffer } }
			]
		});

		pass.setBindGroup(0, mainBindGroup);

		for (let m of $._hooks.preRender) m();

		let drawVertOffset = 0,
			imageVertOffset = 0,
			textCharOffset = 0,
			curPipelineIndex = -1;

		for (let i = 0; i < drawStack.length; i += 2) {
			let v = drawStack[i + 1];

			if (drawStack[i] != curPipelineIndex) {
				if (drawStack[i] == 0) {
					// change blend mode
					let mode = $._blendModeNames[v];
					for (let i = 1; i < $._pipelines.length; i++) {
						$._pipelineConfigs[i].fragment.targets[0].blend = $.blendConfigs[mode];
						$._pipelines[i] = Q5.device.createRenderPipeline($._pipelineConfigs[i]);
					}
					continue;
				}

				curPipelineIndex = drawStack[i];
				pass.setPipeline($._pipelines[curPipelineIndex]);
			}

			if (curPipelineIndex == 4 || curPipelineIndex >= 4000) {
				// draw text
				let o = drawStack[i + 2];
				pass.setBindGroup(1, $._fonts[o].bindGroup);
				pass.setBindGroup(2, $._textBindGroup);

				// v is the number of characters in the text
				pass.draw(4, v, 0, textCharOffset);
				textCharOffset += v;
				i++;
			} else if (curPipelineIndex == 2 || curPipelineIndex == 3 || curPipelineIndex >= 2000) {
				// draw an image or video frame
				// v is the texture index
				pass.setBindGroup(1, $._textureBindGroups[v]);
				pass.draw(4, 1, imageVertOffset);
				imageVertOffset += 4;
			} else {
				// draw a shape
				// v is the number of vertices
				pass.draw(v, 1, drawVertOffset);
				drawVertOffset += v;
			}
		}
	};

	$._finishRender = () => {
		pass.end();

		pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: mainView,
					resolveTarget: $.ctx.getCurrentTexture().createView(),
					loadOp: 'clear',
					storeOp: 'store',
					clearValue: [0, 0, 0, 0]
				}
			]
		});

		frameBindGroup = Q5.device.createBindGroup({
			layout: frameLayout,
			entries: [
				{ binding: 0, resource: { buffer: uniformBuffer } },
				{ binding: 1, resource: frameSampler },
				{ binding: 2, resource: frameA.createView() }
			]
		});

		pass.setPipeline($._pipelines[$._framePL]);
		pass.setBindGroup(0, frameBindGroup);
		pass.draw(4);
		pass.end();

		Q5.device.queue.submit([encoder.finish()]);
		$._pass = pass = encoder = null;

		// clear the stacks for the next frame
		drawStack.splice(0, drawStack.length);
		colorIndex = 1;
		colorStackIndex = 8;
		matrices = [matrices[0]];
		matricesIndexStack = [];

		$._texture = frameA;

		for (let m of $._hooks.postRender) m();

		// destroy buffers
		Q5.device.queue.onSubmittedWorkDone().then(() => {
			for (let b of $._buffers) b.destroy();
			$._buffers = [];
		});
	};
};

Q5.initWebGPU = async () => {
	if (!navigator.gpu) {
		console.warn('q5 WebGPU not supported on this browser! Use Google Chrome or Edge.');
		return false;
	}
	if (!Q5.requestedGPU) {
		let adapter = await navigator.gpu.requestAdapter();
		if (!adapter) {
			console.warn('q5 WebGPU could not start! No appropriate GPUAdapter found, vulkan may need to be enabled.');
			return false;
		}
		Q5.device = await adapter.requestDevice();

		Q5.device.lost.then((e) => {
			console.error('WebGPU crashed!');
			console.error(e);
		});
	}
	return true;
};

Q5.WebGPU = async function (scope, parent) {
	if (!scope || scope == 'global') Q5._hasGlobal = true;
	if (!(await Q5.initWebGPU())) {
		return new Q5(scope, parent, 'webgpu-fallback');
	}
	return new Q5(scope, parent, 'webgpu');
};

Q5.webgpu = Q5.WebGPU;
