Q5.renderers.webgpu = {};

Q5.renderers.webgpu.canvas = ($, q) => {
	let c = $.canvas;

	c.width = $.width = 500;
	c.height = $.height = 500;

	$._g = $.createGraphics(1, 1, { renderer: 'c2d' });

	if ($.colorMode) $.colorMode('rgb', 1);

	let pass,
		mainView,
		frameA,
		frameB,
		frameSampler,
		framePipeline,
		frameBindGroup,
		colorIndex = 1,
		colorStackIndex = 8;

	$._pipelineConfigs = [];
	$._pipelines = [];
	$._buffers = [];

	// local variables used for slightly better performance
	// stores pipeline shifts and vertex counts/image indices
	let drawStack = ($.drawStack = []);

	// colors used for each draw call
	let colorStack = ($.colorStack = new Float32Array(1e6));

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
				visibility: GPUShaderStage.VERTEX,
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

	$.bindGroupLayouts = [mainLayout];

	let uniformBuffer = Q5.device.createBuffer({
		size: 8, // Size of two floats
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

		$._frameA = frameA = Q5.device.createTexture({ size, format, usage });
		$._frameB = frameB = Q5.device.createTexture({ size, format, usage });

		let finalShader = Q5.device.createShaderModule({
			code: `
@vertex fn v(@builtin(vertex_index)i:u32)->@builtin(position)vec4<f32>{
	const pos=array(vec2(-1f,-1f),vec2(1f,-1f),vec2(-1f,1f),vec2(1f,1f));
	return vec4(pos[i],0f,1f);
}
@group(0) @binding(0) var s: sampler;
@group(0) @binding(1) var t: texture_2d<f32>;
@fragment fn f(@builtin(position)c:vec4<f32>)->@location(0)vec4<f32>{
	let uv=c.xy/vec2(${w}, ${h});
	return textureSample(t,s,uv);
}`
		});

		frameSampler = Q5.device.createSampler({
			magFilter: 'linear',
			minFilter: 'linear'
		});

		// Create a pipeline for rendering
		framePipeline = Q5.device.createRenderPipeline({
			layout: 'auto',
			vertex: { module: finalShader, entryPoint: 'v' },
			fragment: {
				module: finalShader,
				entryPoint: 'f',
				targets: [{ format, writeMask: GPUColorWrite.ALL }]
			},
			primitive: { topology: 'triangle-strip' },
			multisample: { count: 4 }
		});
	};

	$._createCanvas = (w, h, opt) => {
		q.ctx = q.drawingContext = c.getContext('webgpu');

		opt.format ??= navigator.gpu.getPreferredCanvasFormat();
		opt.device ??= Q5.device;
		if (opt.alpha) opt.alphaMode = 'premultiplied';

		$.ctx.configure(opt);

		Q5.device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([$.canvas.hw, $.canvas.hh]));

		createMainView();
		return c;
	};

	$._resizeCanvas = (w, h) => {
		$._setCanvasSize(w, h);
		createMainView();
	};

	$.pixelDensity = (v) => {
		if (!v || v == $._pixelDensity) return $._pixelDensity;
		$._pixelDensity = v;
		$._setCanvasSize(c.w, c.h);
		createMainView();
		return v;
	};

	// current color index, used to associate a vertex with a color
	let addColor = (r, g, b, a = 1) => {
		if (typeof r == 'string') r = $.color(r);
		else if (b == undefined) {
			// grayscale mode `fill(1, 0.5)`
			a = g ?? 1;
			g = b = r;
		}
		if (r._q5Color) {
			a = r.a;
			b = r.b;
			g = r.g;
			r = r.r;
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

	$.translate = (x, y, z) => {
		if (!x && !y && !z) return;
		// update the translation values
		matrix[12] += x;
		matrix[13] -= y;
		matrix[14] += z || 0;
		$._matrixDirty = true;
	};

	$.rotate = (a) => {
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

	// function to save the current matrix state if dirty
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
		let hw = w / 2;
		let hh = h / 2;

		// left, right, top, bottom
		let l, r, t, b;
		if (!mode || mode == 'corner') {
			l = x;
			r = x + w;
			t = -y;
			b = -(y + h);
		} else if (mode == 'center') {
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

	// other blend modes are not supported yet
	const blendModes = {
		normal: [2, 3, 0, 2, 3, 0],
		// destination_over: [6, 1, 0, 6, 1, 0],
		additive: [1, 1, 0, 1, 1, 0]
		// source_in: [5, 0, 0, 5, 0, 0],
		// destination_in: [0, 2, 0, 0, 2, 0],
		// source_out: [6, 0, 0, 6, 0, 0],
		// destination_out: [0, 3, 0, 0, 3, 0],
		// source_atop: [5, 3, 0, 5, 3, 0],
		// destination_atop: [6, 2, 0, 6, 2, 0]
	};

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

	$._blendMode = 'normal';

	$.blendMode = (mode) => {
		if (mode == $._blendMode) return;
		if (mode == 'source-over') mode = 'normal';
		if (mode == 'lighter') mode = 'additive';
		mode = mode.toLowerCase().replace(/[ -]/g, '_');
		$._blendMode = mode;

		for (let i = 0; i < $._pipelines.length; i++) {
			$._pipelineConfigs[i].fragment.targets[0].blend = $.blendConfigs[mode];
			$._pipelines[i] = Q5.device.createRenderPipeline($._pipelineConfigs[i]);
		}
	};

	let shouldClear = false;
	$.clear = () => {
		shouldClear = true;
	};

	const _drawFrame = () => {
		pass.setPipeline(framePipeline);
		pass.setBindGroup(0, frameBindGroup);
		pass.draw(4);
	};

	$._beginRender = () => {
		// swap the frame textures
		const temp = frameA;
		frameA = frameB;
		frameB = temp;

		$.encoder = Q5.device.createCommandEncoder();

		let target = shouldClear ? $.ctx.getCurrentTexture().createView() : frameA.createView();

		pass = q.pass = $.encoder.beginRenderPass({
			label: 'q5-webgpu',
			colorAttachments: [
				{
					view: mainView,
					resolveTarget: target,
					loadOp: 'clear',
					storeOp: 'store',
					clearValue: [0, 0, 0, 0]
				}
			]
		});

		if (!shouldClear) {
			frameBindGroup = Q5.device.createBindGroup({
				layout: framePipeline.getBindGroupLayout(0),
				entries: [
					{ binding: 0, resource: frameSampler },
					{ binding: 1, resource: frameB.createView() }
				]
			});

			_drawFrame();
		}
	};

	$._render = () => {
		let transformBuffer = Q5.device.createBuffer({
			size: matrices.length * MATRIX_SIZE * 4, // 4 bytes per float
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		new Float32Array(transformBuffer.getMappedRange()).set(transforms.slice(0, matrices.length * MATRIX_SIZE));
		transformBuffer.unmap();

		let colorsBuffer = Q5.device.createBuffer({
			size: colorStackIndex * 4,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		new Float32Array(colorsBuffer.getMappedRange()).set(colorStack.slice(0, colorStackIndex));
		colorsBuffer.unmap();

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

			if (curPipelineIndex != drawStack[i]) {
				curPipelineIndex = drawStack[i];
				pass.setPipeline($._pipelines[curPipelineIndex]);
			}

			if (curPipelineIndex == 0) {
				// draw a shape
				// v is the number of vertices
				pass.draw(v, 1, drawVertOffset);
				drawVertOffset += v;
			} else if (curPipelineIndex <= 2) {
				// draw an image or video frame
				// v is the texture index
				pass.setBindGroup(1, $._textureBindGroups[v]);
				pass.draw(4, 1, imageVertOffset);
				imageVertOffset += 4;
			} else if (curPipelineIndex == 3) {
				// draw text
				let o = drawStack[i + 2];
				pass.setBindGroup(1, $._fonts[o].bindGroup);
				pass.setBindGroup(2, $._textBindGroup);

				// v is the number of characters in the text
				pass.draw(4, v, 0, textCharOffset);
				textCharOffset += v;
				i++;
			}
		}
	};

	$._finishRender = () => {
		pass.end();

		if (!shouldClear) {
			pass = $.encoder.beginRenderPass({
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
				layout: framePipeline.getBindGroupLayout(0),
				entries: [
					{ binding: 0, resource: frameSampler },
					{ binding: 1, resource: frameA.createView() }
				]
			});
			_drawFrame();
			pass.end();
			shouldClear = false;
		}

		Q5.device.queue.submit([$.encoder.finish()]);

		// destroy buffers
		Q5.device.queue.onSubmittedWorkDone().then(() => {
			for (let b of $._buffers) b.destroy();
			$._buffers = [];
		});

		q.pass = $.encoder = null;

		// clear the stacks for the next frame
		$.drawStack = drawStack = [];
		colorIndex = 1;
		colorStackIndex = 8;
		matrices = [matrices[0]];
		matricesIndexStack = [];

		for (let m of $._hooks.postRender) m();
	};
};

Q5.initWebGPU = async () => {
	if (!navigator.gpu) {
		console.warn('q5 WebGPU not supported on this browser! Use Google Chrome or Edge.');
		return false;
	}
	if (!Q5.device) {
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

Q5.webgpu = async function (scope, parent) {
	if (!scope || scope == 'global') Q5._hasGlobal = true;
	if (!(await Q5.initWebGPU())) {
		return new Q5(scope, parent, 'webgpu-fallback');
	}
	return new Q5(scope, parent, 'webgpu');
};
