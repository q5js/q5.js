Q5.renderers.webgpu = {};

Q5.renderers.webgpu.canvas = ($, q) => {
	const c = $.canvas;

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
		colorStackIndex = 8,
		prevFramePL = 0,
		framePL = 0;

	$._pipelineConfigs = [];
	$._pipelines = [];
	$._buffers = [];

	// local variables used for slightly better performance

	// stores pipeline shifts and vertex counts/image indices
	let drawStack = [];

	// colors used for each draw call
	let colorStack = new Float32Array(1e6);

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
		_colorMode = 'rgb',
		_colorFormat = 1;

	if ($.colorMode) {
		let colorMode = $.colorMode;
		$.colorMode = function () {
			colorMode(...arguments);
			_colorMode = $._colorMode;
			usingRGB = _colorMode == 'rgb';
			_colorFormat = $._colorFormat;
		};
	}

	const addColor = (r, g, b, a) => {
		if (usingRGB === false || (g === undefined && !r._q5Color && typeof r !== 'number')) {
			if (usingRGB === false || typeof r == 'string' || !Array.isArray(r)) {
				r = $.color(r, g, b, a);
			} else {
				[r, g, b, a] = r;
			}
		} else if (b === undefined) {
			// grayscale mode `fill(1, 0.5)`
			a = g ?? _colorFormat;
			g = b = r;
		}
		a ??= _colorFormat;

		if (r._q5Color) {
			let c = r;
			if (usingRGB) ({ r, g, b, a } = c);
			else {
				a = c.a;
				if (c.c != undefined) c = Q5.OKLCHtoRGB(c.l, c.c, c.h);
				else if (c.l != undefined) c = Q5.HSLtoRGB(c.h, c.s, c.l);
				else c = Q5.HSLtoRGB(...Q5.HSBtoHSL(c.h, c.s, c.b));
				[r, g, b] = c;
			}
		}

		if (_colorFormat === 255) {
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

	let doFill = true,
		doStroke = true,
		fillSet = false,
		strokeSet = false,
		strokeIdx = 0,
		fillIdx = 1,
		tintIdx = 1,
		globalAlpha = 1,
		sw = 1, // stroke weight
		hsw = 0.5, // half the stroke weight
		scaledSW = 1;

	$.fill = (r, g, b, a) => {
		addColor(r, g, b, a);
		doFill = fillSet = true;
		fillIdx = colorIndex;
	};
	$.stroke = (r, g, b, a) => {
		addColor(r, g, b, a);
		doStroke = strokeSet = true;
		strokeIdx = colorIndex;
	};
	$.tint = (r, g, b, a) => {
		addColor(r, g, b, a);
		tintIdx = colorIndex;
	};
	$.opacity = (a) => (globalAlpha = a);
	$.noFill = () => (doFill = false);
	$.noStroke = () => (doStroke = false);
	$.noTint = () => (tintIdx = 1);

	$.strokeWeight = (v) => {
		if (v === undefined) return sw;
		v = Math.abs(v);
		sw = v;
		scaledSW = v * _scale;
		hsw = v / 2;
	};

	$._getFillIdx = () => fillIdx;
	$._setFillIdx = (v) => (fillIdx = v);
	$._doFill = () => (doFill = true);
	$._getStrokeIdx = () => strokeIdx;
	$._setStrokeIdx = (v) => (strokeIdx = v);
	$._doStroke = () => (doStroke = true);

	const MAX_TRANSFORMS = $._graphics ? 1000 : 1e7,
		MATRIX_SIZE = 16, // 4x4 matrix
		transforms = new Float32Array(MAX_TRANSFORMS * MATRIX_SIZE);

	let matrix,
		matrices = [],
		matricesIdxStack = [],
		matrixIdx = 0,
		matrixDirty = false; // tracks if the matrix has been modified

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
		matrixIdx = 0;
	};
	$.resetMatrix();

	$.translate = (x, y, z = 0) => {
		if (!x && !y && !z) return;
		// update the translation values
		let m = matrix;
		m[12] += x * m[0];
		m[13] -= y * m[5];
		m[14] += z * m[10];
		matrixDirty = true;
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

		matrixDirty = true;
	};

	let _scale = 1;

	$.scale = (x = 1, y, z = 1) => {
		y ??= x;

		_scale = Math.max(Math.abs(x), Math.abs(y));
		scaledSW = sw * _scale;

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

		matrixDirty = true;
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

		matrixDirty = true;
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

		matrixDirty = true;
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
		matrixDirty = true;
	};

	// saves the current matrix state
	const saveMatrix = () => {
		transforms.set(matrix, matrices.length * MATRIX_SIZE);
		matrixIdx = matrices.length;
		matrices.push(matrix.slice());
		matrixDirty = false;
	};

	// push the current matrix index onto the stack
	$.pushMatrix = () => {
		if (matrixDirty) saveMatrix();
		matricesIdxStack.push(matrixIdx);
	};

	$.popMatrix = () => {
		if (!matricesIdxStack.length) {
			return console.warn('Matrix index stack is empty!');
		}
		// pop the last matrix index and set it as the current matrix index
		let idx = matricesIdxStack.pop();
		matrix = matrices[idx].slice();
		matrixIdx = idx;
		matrixDirty = false;
	};

	let styles = [];

	$.pushStyles = () => {
		styles.push([
			fillIdx,
			strokeIdx,
			sw,
			hsw,
			scaledSW,
			doFill,
			doStroke,
			fillSet,
			strokeSet,
			tintIdx,
			_textSize,
			_textAlign,
			_textBaseline,
			_imageMode,
			_rectMode,
			_ellipseMode,
			usingRGB,
			_colorMode,
			_colorFormat,
			Color
		]);
	};

	$.popStyles = () => {
		let s = styles.pop();

		// array destructuring to local variables is way better
		// for performance than copying from one object to another
		[
			fillIdx,
			strokeIdx,
			sw,
			hsw,
			scaledSW,
			doFill,
			doStroke,
			fillSet,
			strokeSet,
			tintIdx,
			_textSize,
			_textAlign,
			_textBaseline,
			_imageMode,
			_rectMode,
			_ellipseMode,
			usingRGB,
			_colorMode,
			_colorFormat
		] = s;

		// since these values are used outside of q5-webgpu
		// they need to be stored on the instance
		$._colorFormat = _colorFormat;
		$._colorMode = _colorMode;
		$.Color = s.at(-1);
	};

	$.push = () => {
		$.pushMatrix();
		$.pushStyles();
	};

	$.pop = () => {
		$.popMatrix();
		$.popStyles();
	};

	const calcBox = (x, y, w, h, mode) => {
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

	let blendModeNames = Object.keys(blendModes);

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

	let _blendMode = 'source-over';

	$.blendMode = (mode) => {
		if (mode == _blendMode) return;
		_blendMode = mode;
		let i = blendModeNames.indexOf(mode);
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
		if (r.canvas) {
			$.push();
			$.resetMatrix();
			let img = r;
			_imageMode = 'corner';
			$.image(img, -c.hw, -c.hh, c.w, c.h);
			$.pop();
		} else {
			addColor(r, g, b, a);
			addRect(-c.hw, c.hh, c.hw, c.hh, c.hw, -c.hh, -c.hw, -c.hh, colorIndex, 0);
		}
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
			pass.setPipeline($._pipelines[prevFramePL]);
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

		// prepare to render shapes

		$._pass.setPipeline($._pipelines[1]); // shapes pipeline

		let shapesVertBuff = Q5.device.createBuffer({
			size: shapesVertIdx * 4,
			usage: GPUBufferUsage.VERTEX,
			mappedAtCreation: true
		});

		new Float32Array(shapesVertBuff.getMappedRange()).set(shapesVertStack.slice(0, shapesVertIdx));
		shapesVertBuff.unmap();

		$._pass.setVertexBuffer(0, shapesVertBuff);

		$._buffers.push(shapesVertBuff);

		// prepare to render images and videos

		if (imgVertIdx) {
			$._pass.setPipeline($._pipelines[2]); // images pipeline

			let imgVertBuff = Q5.device.createBuffer({
				size: imgVertIdx * 5,
				usage: GPUBufferUsage.VERTEX,
				mappedAtCreation: true
			});

			new Float32Array(imgVertBuff.getMappedRange()).set(imgVertStack.slice(0, imgVertIdx));
			imgVertBuff.unmap();

			$._pass.setVertexBuffer(1, imgVertBuff);

			$._buffers.push(imgVertBuff);

			if (vidFrames) {
				$._pass.setPipeline($._pipelines[3]); // video pipeline
				$._pass.setVertexBuffer(1, imgVertBuff);
			}
		}

		if (charStack.length) {
			// calculate total buffer size for text data
			let totalTextSize = 0;
			for (let charsData of charStack) {
				totalTextSize += charsData.length * 4;
			}

			// create a single buffer for all the char data
			let charBuffer = Q5.device.createBuffer({
				size: totalTextSize,
				usage: GPUBufferUsage.STORAGE,
				mappedAtCreation: true
			});

			// copy all the text data into the buffer
			new Float32Array(charBuffer.getMappedRange()).set(charStack.flat());
			charBuffer.unmap();

			// calculate total buffer size for metadata
			let totalMetadataSize = textStack.length * 8 * 4;

			// create a single buffer for all metadata
			let textBuffer = Q5.device.createBuffer({
				label: 'textBuffer',
				size: totalMetadataSize,
				usage: GPUBufferUsage.STORAGE,
				mappedAtCreation: true
			});

			// copy all metadata into the buffer
			new Float32Array(textBuffer.getMappedRange()).set(textStack.flat());
			textBuffer.unmap();

			$._buffers.push(charBuffer, textBuffer);

			// create a single bind group for the text buffer and metadata buffer
			$._textBindGroup = Q5.device.createBindGroup({
				label: 'textBindGroup',
				layout: textBindGroupLayout,
				entries: [
					{ binding: 0, resource: { buffer: charBuffer } },
					{ binding: 1, resource: { buffer: textBuffer } }
				]
			});
		}

		let drawVertOffset = 0,
			imageVertOffset = 0,
			textCharOffset = 0,
			curPipelineIndex = -1;

		for (let i = 0; i < drawStack.length; i += 2) {
			let v = drawStack[i + 1];

			if (drawStack[i] != curPipelineIndex) {
				if (drawStack[i] == 0) {
					// change blend mode
					let mode = blendModeNames[v];
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
				pass.setBindGroup(1, fontsArr[o].bindGroup);
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
		// finish rendering frameA
		pass.end();

		// create a new render pass to render frameA to the canvas
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

		pass.setPipeline($._pipelines[framePL]);
		pass.setBindGroup(0, frameBindGroup);
		pass.draw(4);
		pass.end();

		// submit the commands to the GPU
		Q5.device.queue.submit([encoder.finish()]);
		$._pass = pass = encoder = null;

		// clear the stacks for the next frame
		drawStack.splice(0, drawStack.length);
		colorIndex = 1;
		colorStackIndex = 8;
		matrices = [matrices[0]];
		matricesIdxStack = [];

		// frameA can now be saved when saveCanvas is run
		$._texture = frameA;

		// reset
		shapesVertIdx = 0;
		imgVertIdx = 0;
		$._textureBindGroups.splice(tIdx, vidFrames);
		vidFrames = 0;
		charStack = [];
		textStack = [];

		// destroy buffers
		Q5.device.queue.onSubmittedWorkDone().then(() => {
			for (let b of $._buffers) b.destroy();
			$._buffers = [];
		});
	};

	/* SHAPES */

	let shapesPL = 1;

	$._shapesShaderCode =
		$._baseShaderCode +
		/* wgsl */ `
struct VertexParams {
	@builtin(vertex_index) vertexIndex : u32,
	@location(0) pos: vec2f,
	@location(1) colorIndex: f32,
	@location(2) matrixIndex: f32
}
struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) color: vec4f
}

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
	var vert = vec4f(pos, 0.0, 1.0);
	vert = transforms[i32(matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	return vert;
}

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var vert = transformVertex(v.pos, v.matrixIndex);

	var f: FragParams;
	f.position = vert;
	f.color = colors[i32(v.colorIndex)];
	return f;
}

@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	return f.color;
}
`;

	let shapesShader = Q5.device.createShaderModule({
		label: 'shapesShader',
		code: $._shapesShaderCode
	});

	let shapesVertStack = new Float32Array($._graphics ? 1000 : 1e7),
		shapesVertIdx = 0;
	const TAU = Math.PI * 2;
	const HALF_PI = Math.PI / 2;

	let shapesVertBuffLayout = {
		arrayStride: 16, // 4 floats * 4 bytes
		attributes: [
			{ format: 'float32x2', offset: 0, shaderLocation: 0 }, // position
			{ format: 'float32', offset: 8, shaderLocation: 1 }, // colorIndex
			{ format: 'float32', offset: 12, shaderLocation: 2 } // matrixIndex
		]
	};

	let pipelineLayout = Q5.device.createPipelineLayout({
		label: 'shapesPipelineLayout',
		bindGroupLayouts: $._bindGroupLayouts
	});

	$._pipelineConfigs[1] = {
		label: 'shapesPipeline',
		layout: pipelineLayout,
		vertex: {
			module: shapesShader,
			entryPoint: 'vertexMain',
			buffers: [shapesVertBuffLayout]
		},
		fragment: {
			module: shapesShader,
			entryPoint: 'fragMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs['source-over'] }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[1] = Q5.device.createRenderPipeline($._pipelineConfigs[1]);

	const addVert = (x, y, ci, ti) => {
		let v = shapesVertStack,
			i = shapesVertIdx;
		v[i++] = x;
		v[i++] = y;
		v[i++] = ci;
		v[i++] = ti;
		shapesVertIdx = i;
	};

	const addRect = (x1, y1, x2, y2, x3, y3, x4, y4, ci, ti) => {
		let v = shapesVertStack,
			i = shapesVertIdx;

		v[i++] = x1;
		v[i++] = y1;
		v[i++] = ci;
		v[i++] = ti;

		v[i++] = x2;
		v[i++] = y2;
		v[i++] = ci;
		v[i++] = ti;

		v[i++] = x4;
		v[i++] = y4;
		v[i++] = ci;
		v[i++] = ti;

		v[i++] = x3;
		v[i++] = y3;
		v[i++] = ci;
		v[i++] = ti;

		shapesVertIdx = i;
		drawStack.push(shapesPL, 4);
	};

	const addArc = (x, y, a, b, startAngle, endAngle, n, ci, ti) => {
		let angleRange = endAngle - startAngle;
		let angleIncrement = angleRange / n;
		let t = startAngle;

		let v = shapesVertStack,
			i = shapesVertIdx;

		for (let j = 0; j <= n; j++) {
			// add center vertex
			v[i++] = x;
			v[i++] = y;
			v[i++] = ci;
			v[i++] = ti;

			// calculate perimeter vertex
			let vx = x + a * Math.cos(t);
			let vy = y - b * Math.sin(t);

			// add perimeter vertex
			v[i++] = vx;
			v[i++] = vy;
			v[i++] = ci;
			v[i++] = ti;

			t += angleIncrement;
		}

		shapesVertIdx = i;
		drawStack.push(shapesPL, (n + 1) * 2);
	};

	const addArcStroke = (x, y, outerA, outerB, innerA, innerB, startAngle, endAngle, n, ci, ti) => {
		let angleRange = endAngle - startAngle;
		let angleIncrement = angleRange / n;
		let t = startAngle;

		let v = shapesVertStack,
			i = shapesVertIdx;

		for (let j = 0; j <= n; j++) {
			// Outer vertex
			let vxOuter = x + outerA * Math.cos(t);
			let vyOuter = y - outerB * Math.sin(t);

			// Inner vertex
			let vxInner = x + innerA * Math.cos(t);
			let vyInner = y - innerB * Math.sin(t);

			// Add vertices for triangle strip
			v[i++] = vxOuter;
			v[i++] = vyOuter;
			v[i++] = ci;
			v[i++] = ti;

			v[i++] = vxInner;
			v[i++] = vyInner;
			v[i++] = ci;
			v[i++] = ti;

			t += angleIncrement;
		}

		shapesVertIdx = i;
		drawStack.push(shapesPL, (n + 1) * 2);
	};

	let _rectMode = 'corner';

	$.rectMode = (x) => (_rectMode = x);

	$.rect = (x, y, w, h, rr = 0) => {
		h ??= w;
		let [l, r, t, b] = calcBox(x, y, w, h, _rectMode);
		let ci, ti;
		if (matrixDirty) saveMatrix();
		ti = matrixIdx;

		if (!rr) {
			if (doFill) {
				ci = fillIdx;
				addRect(l, t, r, t, r, b, l, b, ci, ti);
			}

			if (doStroke) {
				ci = strokeIdx;

				// Calculate stroke positions
				let lsw = l - hsw,
					rsw = r + hsw,
					tsw = t + hsw,
					bsw = b - hsw,
					lpsw = l + hsw,
					rpsw = r - hsw,
					tpsw = t - hsw,
					bpsw = b + hsw;

				addRect(lsw, tpsw, rsw, tpsw, rsw, tsw, lsw, tsw, ci, ti); // Top
				addRect(lsw, bsw, rsw, bsw, rsw, bpsw, lsw, bpsw, ci, ti); // Bottom

				// Adjust side strokes to avoid overlapping corners
				tsw = t - hsw;
				bsw = b + hsw;

				addRect(lsw, tsw, lpsw, tsw, lpsw, bsw, lsw, bsw, ci, ti); // Left
				addRect(rpsw, tsw, rsw, tsw, rsw, bsw, rpsw, bsw, ci, ti); // Right
			}
			return;
		}

		l += rr;
		r -= rr;
		t -= rr;
		b += rr;

		// Clamp radius
		rr = Math.min(rr, Math.min(w, h) / 2);

		let n = getArcSegments(rr * _scale);

		let trr = t + rr,
			brr = b - rr,
			lrr = l - rr,
			rrr = r + rr;

		if (doFill) {
			ci = fillIdx;
			// Corner arcs
			addArc(r, b, rr, rr, 0, HALF_PI, n, ci, ti);
			addArc(l, b, rr, rr, Math.PI, HALF_PI, n, ci, ti);
			addArc(l, t, rr, rr, -Math.PI, -HALF_PI, n, ci, ti);
			addArc(r, t, rr, rr, -HALF_PI, 0, n, ci, ti);

			addRect(l, trr, r, trr, r, brr, l, brr, ci, ti); // center
			addRect(l, t, lrr, t, lrr, b, l, b, ci, ti); // Left
			addRect(rrr, t, r, t, r, b, rrr, b, ci, ti); // Right
		}

		if (doStroke) {
			ci = strokeIdx;

			let outerA = rr + hsw,
				outerB = rr + hsw,
				innerA = rr - hsw,
				innerB = rr - hsw;
			// Corner arc strokes
			addArcStroke(r, b, outerA, outerB, innerA, innerB, 0, HALF_PI, n, ci, ti);
			addArcStroke(l, b, outerA, outerB, innerA, innerB, Math.PI, HALF_PI, n, ci, ti);
			addArcStroke(l, t, outerA, outerB, innerA, innerB, -Math.PI, -HALF_PI, n, ci, ti);
			addArcStroke(r, t, outerA, outerB, innerA, innerB, -HALF_PI, 0, n, ci, ti);

			let lrrMin = lrr - hsw,
				lrrMax = lrr + hsw,
				rrrMin = rrr - hsw,
				rrrMax = rrr + hsw,
				trrMin = trr - hsw,
				trrMax = trr + hsw,
				brrMin = brr - hsw,
				brrMax = brr + hsw;

			// Side strokes - positioned outside
			addRect(lrrMin, t, lrrMax, t, lrrMax, b, lrrMin, b, ci, ti); // Left
			addRect(rrrMin, t, rrrMax, t, rrrMax, b, rrrMin, b, ci, ti); // Right
			addRect(l, trrMin, r, trrMin, r, trrMax, l, trrMax, ci, ti); // Top
			addRect(l, brrMin, r, brrMin, r, brrMax, l, brrMax, ci, ti); // Bottom
		}
	};

	$.square = (x, y, s) => $.rect(x, y, s, s);

	$.plane = (x, y, w, h) => {
		h ??= w;
		let [l, r, t, b] = calcBox(x, y, w, h, 'center');
		if (matrixDirty) saveMatrix();
		addRect(l, t, r, t, r, b, l, b, fillIdx, matrixIdx);
	};

	// prettier-ignore
	const getArcSegments = (d) =>
		d < 4 ? 6 :
		d < 6 ? 8 :
		d < 10 ? 10 :
		d < 16 ? 12 :
		d < 20 ? 14 :
		d < 22 ? 16 :
		d < 24 ? 18 :
		d < 28 ? 20 :
		d < 34 ? 22 :
		d < 42 ? 24 :
		d < 48 ? 26 :
		d < 56 ? 28 :
		d < 64 ? 30 :
		d < 72 ? 32 :
		d < 84 ? 34 :
		d < 96 ? 36 :
		d < 98 ? 38 :
		d < 113 ? 40 :
		d < 149 ? 44 :
		d < 199 ? 48 :
		d < 261 ? 52 :
		d < 353 ? 56 :
		d < 461 ? 60 :
		d < 585 ? 64 :
		d < 1200 ? 70 :
		d < 1800 ? 80 :
		d < 2400 ? 90 :
		100;

	let _ellipseMode = 'center';

	$.ellipseMode = (x) => (_ellipseMode = x);

	$.ellipse = (x, y, w, h) => {
		let n = getArcSegments(Math.max(Math.abs(w), Math.abs(h)) * _scale);
		let a = w / 2;
		let b = w == h ? a : h / 2;

		if (matrixDirty) saveMatrix();
		let ti = matrixIdx;

		if (doFill) {
			addArc(x, -y, a, b, 0, TAU, n, fillIdx, ti);
		}
		if (doStroke) {
			// Draw the stroke as a ring using triangle strips
			addArcStroke(x, -y, a + hsw, b + hsw, a - hsw, b - hsw, 0, TAU, n, strokeIdx, ti);
		}
	};

	$.circle = (x, y, d) => $.ellipse(x, y, d, d);

	$.arc = (x, y, w, h, start, stop) => {
		if (start === stop) return $.ellipse(x, y, w, h);

		// Convert angles if needed
		if ($._angleMode) {
			start = $.radians(start);
			stop = $.radians(stop);
		}

		// Normalize angles
		start %= TAU;
		stop %= TAU;
		if (start < 0) start += TAU;
		if (stop < 0) stop += TAU;
		if (start > stop) stop += TAU;
		if (start == stop) return $.ellipse(x, y, w, h);

		// Calculate position based on ellipseMode
		let a, b;
		if (_ellipseMode == $.CENTER) {
			a = w / 2;
			b = h / 2;
		} else if (_ellipseMode == $.RADIUS) {
			a = w;
			b = h;
		} else if (_ellipseMode == $.CORNER) {
			x += w / 2;
			y += h / 2;
			a = w / 2;
			b = h / 2;
		} else if (_ellipseMode == $.CORNERS) {
			x = (x + w) / 2;
			y = (y + h) / 2;
			a = (w - x) / 2;
			b = (h - y) / 2;
		}

		if (matrixDirty) saveMatrix();
		let ti = matrixIdx;
		let n = getArcSegments(Math.max(Math.abs(w), Math.abs(h)) * _scale);

		// Draw fill
		if (doFill) {
			addArc(x, -y, a, b, start, stop, n, fillIdx, ti);
		}

		// Draw stroke
		if (doStroke) {
			addArcStroke(x, -y, a + hsw, b + hsw, a - hsw, b - hsw, start, stop, n, strokeIdx, ti);
			if (_strokeCap == 'round') {
				addArc(x + a * Math.cos(start), -y - b * Math.sin(start), hsw, hsw, 0, TAU, n, strokeIdx, ti);
				addArc(x + a * Math.cos(stop), -y - b * Math.sin(stop), hsw, hsw, 0, TAU, n, strokeIdx, ti);
			}
		}
	};

	$.point = (x, y) => {
		if (matrixDirty) saveMatrix();
		let ti = matrixIdx,
			ci = strokeIdx;

		if (scaledSW < 2) {
			let [l, r, t, b] = calcBox(x, y, sw, sw, 'corner');
			addRect(l, t, r, t, r, b, l, b, ci, ti);
		} else {
			let n = getArcSegments(scaledSW);
			sw /= 2;
			addArc(x, -y, sw, sw, 0, TAU, n, ci, ti);
		}
	};

	let _strokeCap = 'round',
		_strokeJoin = 'round';

	$.strokeCap = (x) => (_strokeCap = x);
	$.strokeJoin = (x) => (_strokeJoin = x);
	$.lineMode = () => {
		_strokeCap = 'square';
		_strokeJoin = 'none';
	};

	$.line = (x1, y1, x2, y2) => {
		if (matrixDirty) saveMatrix();
		let ti = matrixIdx,
			ci = strokeIdx;

		// calculate the direction vector and length
		let dx = x2 - x1,
			dy = y2 - y1,
			length = Math.hypot(dx, dy);

		// calculate the perpendicular vector for line thickness
		let px = -(dy / length) * hsw,
			py = (dx / length) * hsw;

		addRect(x1 + px, -y1 - py, x1 - px, -y1 + py, x2 - px, -y2 + py, x2 + px, -y2 - py, ci, ti);

		if (scaledSW > 2 && _strokeCap != 'square') {
			let n = getArcSegments(scaledSW);
			addArc(x1, -y1, hsw, hsw, 0, TAU, n, ci, ti);
			addArc(x2, -y2, hsw, hsw, 0, TAU, n, ci, ti);
		}
	};

	let curveSegments = 20;
	$.curveDetail = (v) => (curveSegments = v);

	let bezierSegments = 20;
	$.bezierDetail = (v) => (bezierSegments = v);

	let shapeVertCount;
	let sv = []; // shape vertices
	let curveVertices = []; // curve vertices

	$.beginShape = () => {
		shapeVertCount = 0;
		sv = [];
		curveVertices = [];
	};

	$.vertex = (x, y) => {
		if (matrixDirty) saveMatrix();
		sv.push(x, -y, fillIdx, matrixIdx);
		shapeVertCount++;
	};

	$.curveVertex = (x, y) => {
		if (matrixDirty) saveMatrix();
		curveVertices.push({ x: x, y: -y });
	};

	$.bezierVertex = function (cx1, cy1, cx2, cy2, x, y) {
		if (shapeVertCount === 0) throw new Error('Shape needs a vertex()');
		if (matrixDirty) saveMatrix();

		// Get the last vertex as the starting point (P₀)
		let prevIndex = (shapeVertCount - 1) * 4;
		let startX = sv[prevIndex];
		let startY = sv[prevIndex + 1];

		let step = 1 / bezierSegments;

		let vx, vy;
		let quadratic = arguments.length == 4;
		if (quadratic) {
			x = cx2;
			y = cy2;
		}

		let end = 1 + step;
		for (let t = step; t <= end; t += step) {
			// Start from 0.1 to avoid duplicating the start point
			let t2 = t * t;

			let mt = 1 - t;
			let mt2 = mt * mt;

			if (quadratic) {
				vx = mt2 * startX + 2 * mt * t * cx1 + t2 * x;
				vy = mt2 * startY + 2 * mt * t * -cy1 + t2 * -y;
			} else {
				let t3 = t2 * t;
				let mt3 = mt2 * mt;

				// Cubic Bezier formula
				vx = mt3 * startX + 3 * mt2 * t * cx1 + 3 * mt * t2 * cx2 + t3 * x;
				vy = mt3 * startY + 3 * mt2 * t * -cy1 + 3 * mt * t2 * -cy2 + t3 * -y;
			}

			sv.push(vx, vy, fillIdx, matrixIdx);
			shapeVertCount++;
		}
	};

	$.quadraticVertex = (cx, cy, x, y) => $.bezierVertex(cx, cy, x, y);

	$.endShape = (close) => {
		if (curveVertices.length > 0) {
			// duplicate start and end points if necessary
			let points = [...curveVertices];
			if (points.length < 4) {
				// duplicate first and last points
				while (points.length < 4) {
					points.unshift(points[0]);
					points.push(points[points.length - 1]);
				}
			}

			// Use curveSegments to determine step size
			let step = 1 / curveSegments;

			// calculate catmull-rom spline curve points
			for (let i = 0; i < points.length - 3; i++) {
				let p0 = points[i];
				let p1 = points[i + 1];
				let p2 = points[i + 2];
				let p3 = points[i + 3];

				for (let t = 0; t <= 1; t += step) {
					let t2 = t * t;
					let t3 = t2 * t;

					let x =
						0.5 *
						(2 * p1.x +
							(-p0.x + p2.x) * t +
							(2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
							(-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

					let y =
						0.5 *
						(2 * p1.y +
							(-p0.y + p2.y) * t +
							(2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
							(-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

					sv.push(x, y, fillIdx, matrixIdx);
					shapeVertCount++;
				}
			}
		}

		if (!shapeVertCount) return;
		if (shapeVertCount == 1) return $.point(sv[0], -sv[1]);
		if (shapeVertCount == 2) return $.line(sv[0], -sv[1], sv[4], -sv[5]);

		// close the shape if requested
		if (close) {
			let firstIndex = 0;
			let lastIndex = (shapeVertCount - 1) * 4;

			let firstX = sv[firstIndex];
			let firstY = sv[firstIndex + 1];
			let lastX = sv[lastIndex];
			let lastY = sv[lastIndex + 1];

			if (firstX !== lastX || firstY !== lastY) {
				sv.push(firstX, firstY, sv[firstIndex + 2], sv[firstIndex + 3]);
				shapeVertCount++;
			}
		}

		if (doFill) {
			if (shapeVertCount == 5) {
				// for quads, draw two triangles
				addVert(sv[0], sv[1], sv[2], sv[3]); // v0
				addVert(sv[4], sv[5], sv[6], sv[7]); // v1
				addVert(sv[12], sv[13], sv[14], sv[15]); // v3
				addVert(sv[8], sv[9], sv[10], sv[11]); // v2
				drawStack.push(shapesPL, 4);
			} else {
				// triangulate the shape
				for (let i = 1; i < shapeVertCount - 1; i++) {
					let v0 = 0;
					let v1 = i * 4;
					let v2 = (i + 1) * 4;

					addVert(sv[v0], sv[v0 + 1], sv[v0 + 2], sv[v0 + 3]);
					addVert(sv[v1], sv[v1 + 1], sv[v1 + 2], sv[v1 + 3]);
					addVert(sv[v2], sv[v2 + 1], sv[v2 + 2], sv[v2 + 3]);
				}
				drawStack.push(shapesPL, (shapeVertCount - 2) * 3);
			}
		}

		if (doStroke) {
			let n = getArcSegments(scaledSW),
				ti = matrixIdx,
				ogStrokeCap = _strokeCap;
			_strokeCap = 'square';
			// draw lines between vertices
			for (let i = 0; i < shapeVertCount - 1; i++) {
				let v1 = i * 4;
				let v2 = (i + 1) * 4;
				$.line(sv[v1], -sv[v1 + 1], sv[v2], -sv[v2 + 1]);

				addArc(sv[v1], sv[v1 + 1], hsw, hsw, 0, TAU, n, strokeIdx, ti);
			}
			let v1 = (shapeVertCount - 1) * 4;
			let v2 = 0;
			if (close) $.line(sv[v1], -sv[v1 + 1], sv[v2], -sv[v2 + 1]);
			addArc(sv[v1], sv[v1 + 1], hsw, hsw, 0, TAU, n, strokeIdx, ti);
			_strokeCap = ogStrokeCap;
		}

		// reset for the next shape
		shapeVertCount = 0;
		sv = [];
		curveVertices = [];
	};

	$.curve = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.curveVertex(x1, y1);
		$.curveVertex(x2, y2);
		$.curveVertex(x3, y3);
		$.curveVertex(x4, y4);
		$.endShape();
	};

	$.bezier = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.bezierVertex(x2, y2, x3, y3, x4, y4);
		$.endShape();
	};

	$.triangle = (x1, y1, x2, y2, x3, y3) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.endShape(true);
	};

	$.quad = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.vertex(x4, y4);
		$.endShape(true);
	};

	/* IMAGE */

	let imagePL = 2,
		videoPL = 3;

	$._imageShaderCode =
		$._baseShaderCode +
		/* wgsl */ `
	struct VertexParams {
		@builtin(vertex_index) vertexIndex : u32,
		@location(0) pos: vec2f,
		@location(1) texCoord: vec2f,
		@location(2) tintIndex: f32,
		@location(3) matrixIndex: f32,
		@location(4) imageAlpha: f32
	}
	struct FragParams {
		@builtin(position) position: vec4f,
		@location(0) texCoord: vec2f,
		@location(1) tintColor: vec4f,
		@location(2) imageAlpha: f32
	}
	
	@group(0) @binding(0) var<uniform> q: Q5;
	@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
	@group(0) @binding(2) var<storage> colors : array<vec4f>;
	
	@group(1) @binding(0) var samp: sampler;
	@group(1) @binding(1) var tex: texture_2d<f32>;
	
	fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
		var vert = vec4f(pos, 0f, 1f);
		vert = transforms[i32(matrixIndex)] * vert;
		vert.x /= q.halfWidth;
		vert.y /= q.halfHeight;
		return vert;
	}
	
	fn applyTint(texColor: vec4f, tintColor: vec4f) -> vec4f {
		// apply the tint color to the sampled texture color at full strength
		let tinted = vec4f(texColor.rgb * tintColor.rgb, texColor.a);
		// mix in the tint using the tint alpha as the blend strength
		return mix(texColor, tinted, tintColor.a);
	}
	
	@vertex
	fn vertexMain(v: VertexParams) -> FragParams {
		var vert = transformVertex(v.pos, v.matrixIndex);
	
		var f: FragParams;
		f.position = vert;
		f.texCoord = v.texCoord;
		f.tintColor = colors[i32(v.tintIndex)];
		f.imageAlpha = v.imageAlpha;
		return f;
	}
	
	@fragment
	fn fragMain(f: FragParams) -> @location(0) vec4f {
		var texColor = textureSample(tex, samp, f.texCoord);
		texColor.a *= f.imageAlpha;
		return applyTint(texColor, f.tintColor);
	}
	`;

	let imageShader = Q5.device.createShaderModule({
		label: 'imageShader',
		code: $._imageShaderCode
	});

	$._videoShaderCode = $._imageShaderCode
		.replace('texture_2d<f32>', 'texture_external')
		.replace('textureSample', 'textureSampleBaseClampToEdge');

	let videoShader = Q5.device.createShaderModule({
		label: 'videoShader',
		code: $._videoShaderCode
	});

	let imgVertStack = new Float32Array($._graphics ? 1000 : 1e7),
		imgVertIdx = 0;

	let imgVertBuffLayout = {
		arrayStride: 28,
		attributes: [
			{ shaderLocation: 0, offset: 0, format: 'float32x2' },
			{ shaderLocation: 1, offset: 8, format: 'float32x2' },
			{ shaderLocation: 2, offset: 16, format: 'float32' }, // tintIndex
			{ shaderLocation: 3, offset: 20, format: 'float32' }, // matrixIndex
			{ shaderLocation: 4, offset: 24, format: 'float32' } // imageAlpha
		]
	};

	let textureLayout = Q5.device.createBindGroupLayout({
		label: 'textureLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: { type: 'filtering' }
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				texture: { viewDimension: '2d', sampleType: 'float' }
			}
		]
	});

	let videoTextureLayout = Q5.device.createBindGroupLayout({
		label: 'videoTextureLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: { type: 'filtering' }
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				externalTexture: {}
			}
		]
	});

	let imagePipelineLayout = Q5.device.createPipelineLayout({
		label: 'imagePipelineLayout',
		bindGroupLayouts: [...$._bindGroupLayouts, textureLayout]
	});

	let videoPipelineLayout = Q5.device.createPipelineLayout({
		label: 'videoPipelineLayout',
		bindGroupLayouts: [...$._bindGroupLayouts, videoTextureLayout]
	});

	$._pipelineConfigs[2] = {
		label: 'imagePipeline',
		layout: imagePipelineLayout,
		vertex: {
			module: imageShader,
			entryPoint: 'vertexMain',
			buffers: [{ arrayStride: 0, attributes: [] }, imgVertBuffLayout]
		},
		fragment: {
			module: imageShader,
			entryPoint: 'fragMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs['source-over'] }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[2] = Q5.device.createRenderPipeline($._pipelineConfigs[2]);

	$._pipelineConfigs[3] = {
		label: 'videoPipeline',
		layout: videoPipelineLayout,
		vertex: {
			module: videoShader,
			entryPoint: 'vertexMain',
			buffers: [{ arrayStride: 0, attributes: [] }, imgVertBuffLayout]
		},
		fragment: {
			module: videoShader,
			entryPoint: 'fragMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs['source-over'] }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[3] = Q5.device.createRenderPipeline($._pipelineConfigs[3]);

	$._textureBindGroups = [];

	if (c) {
		// polyfill for canvas.convertToBlob
		c.convertToBlob = async (opt) => {
			let makeFrame = $._drawStack?.length;
			if (makeFrame) {
				$._render();
				$._finishRender();
			}

			let texture = $._texture;

			// this changes the value of $._texture
			if (makeFrame) $._beginRender();

			let w = texture.width,
				h = texture.height,
				bytesPerRow = Math.ceil((w * 4) / 256) * 256;

			let buffer = Q5.device.createBuffer({
				size: bytesPerRow * h,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
			});

			let en = Q5.device.createCommandEncoder();

			en.copyTextureToBuffer({ texture }, { buffer, bytesPerRow, rowsPerImage: h }, { width: w, height: h });

			Q5.device.queue.submit([en.finish()]);

			await buffer.mapAsync(GPUMapMode.READ);

			let pad = new Uint8Array(buffer.getMappedRange());
			let data = new Uint8Array(w * h * 4); // unpadded data

			// Remove padding from each row and swap BGR to RGB
			for (let y = 0; y < h; y++) {
				const p = y * bytesPerRow; // padded row offset
				const u = y * w * 4; // unpadded row offset
				for (let x = 0; x < w; x++) {
					const pp = p + x * 4; // padded pixel offset
					const up = u + x * 4; // unpadded pixel offset
					data[up + 0] = pad[pp + 2]; // R <- B
					data[up + 1] = pad[pp + 1]; // G <- G
					data[up + 2] = pad[pp + 0]; // B <- R
					data[up + 3] = pad[pp + 3]; // A <- A
				}
			}

			buffer.unmap();

			let colorSpace = $.canvas.colorSpace;
			data = new Uint8ClampedArray(data.buffer);
			data = new ImageData(data, w, h, { colorSpace });

			let cnv = new OffscreenCanvas(w, h);
			let ctx = cnv.getContext('2d', { colorSpace });
			ctx.putImageData(data, 0, 0);

			$._buffers.push(buffer);

			return await cnv.convertToBlob(opt);
		};
	}

	let makeSampler = (filter) => {
		$._imageSampler = Q5.device.createSampler({
			magFilter: filter,
			minFilter: filter
		});
	};

	$.smooth = () => makeSampler('linear');
	$.noSmooth = () => makeSampler('nearest');

	$.smooth();

	let tIdx = 0,
		vidFrames = 0;

	$._addTexture = (img, texture) => {
		let cnv = img.canvas || img;

		if (!texture) {
			let textureSize = [cnv.width, cnv.height, 1];

			texture = Q5.device.createTexture({
				size: textureSize,
				format: 'bgra8unorm',
				usage:
					GPUTextureUsage.TEXTURE_BINDING |
					GPUTextureUsage.COPY_SRC |
					GPUTextureUsage.COPY_DST |
					GPUTextureUsage.RENDER_ATTACHMENT
			});

			Q5.device.queue.copyExternalImageToTexture(
				{ source: cnv },
				{
					texture,
					colorSpace: $.canvas.colorSpace
				},
				textureSize
			);
		}

		texture.index = tIdx + vidFrames;
		img._texture = texture;

		$._textureBindGroups[texture.index] = Q5.device.createBindGroup({
			label: img.src || texture.label || 'canvas',
			layout: textureLayout,
			entries: [
				{ binding: 0, resource: $._imageSampler },
				{ binding: 1, resource: texture.createView() }
			]
		});

		tIdx++;
	};

	$.loadImage = (src, cb) => {
		let g = $._g.loadImage(src, () => {
			$._extendImage(g);
			if (cb) cb(g);
		});
		return g;
	};

	$._extendImage = (g) => {
		$._addTexture(g);
		let _copy = g.copy;
		g.copy = function () {
			let copy = _copy();
			$._addTexture(copy);
			return copy;
		};
		g.modified = true;
	};

	$.createImage = (w, h, opt) => {
		let g = $._g.createImage(w, h, opt);
		$._extendImage(g);
		return g;
	};

	let _createGraphics = $.createGraphics;

	$.createGraphics = (w, h, opt = {}) => {
		if (!Q5.experimental) {
			throw new Error(
				'createGraphics is disabled by default in q5 WebGPU. See issue https://github.com/q5js/q5.js/issues/104 for details.'
			);
		}
		if (typeof opt == 'string') opt = { renderer: opt };
		opt.renderer ??= 'c2d';
		let g = _createGraphics(w, h, opt);
		if (g.canvas.webgpu) {
			$._addTexture(g, g._frameA);
			$._addTexture(g, g._frameB);
			g._beginRender();
		} else $._extendImage(g);
		return g;
	};

	let _imageMode = 'corner';

	$.imageMode = (x) => (_imageMode = x);

	const addImgVert = (x, y, u, v, ci, ti, ia) => {
		let s = imgVertStack,
			i = imgVertIdx;
		s[i++] = x;
		s[i++] = y;
		s[i++] = u;
		s[i++] = v;
		s[i++] = ci;
		s[i++] = ti;
		s[i++] = ia;
		imgVertIdx = i;
	};

	$.image = (img, dx = 0, dy = 0, dw, dh, sx = 0, sy = 0, sw, sh) => {
		let isVideo;
		if (img._texture == undefined) {
			isVideo = img.tagName == 'VIDEO';
			if (!isVideo || !img.width || !img.currentTime) return;
			if (img.flipped) $.scale(-1, 1);
		}

		if (matrixDirty) saveMatrix();

		let cnv = img.canvas || img,
			w = cnv.width,
			h = cnv.height,
			pd = img._pixelDensity || 1,
			makeFrame = img._graphics && img._drawStack?.length;

		if (makeFrame) {
			img._render();
			img._finishRender();
		}

		if (img.modified) {
			Q5.device.queue.copyExternalImageToTexture(
				{ source: cnv },
				{ texture: img._texture, colorSpace: $.canvas.colorSpace },
				[w, h, 1]
			);
			img.frameCount++;
			img.modified = false;
		}

		dw ??= img.defaultWidth || img.videoWidth;
		dh ??= img.defaultHeight || img.videoHeight;
		sw ??= w;
		sh ??= h;
		sx *= pd;
		sy *= pd;

		let [l, r, t, b] = calcBox(dx, dy, dw, dh, _imageMode);

		let u0 = sx / w,
			v0 = sy / h,
			u1 = (sx + sw) / w,
			v1 = (sy + sh) / h,
			ti = matrixIdx,
			ci = tintIdx,
			ia = globalAlpha;

		addImgVert(l, t, u0, v0, ci, ti, ia);
		addImgVert(r, t, u1, v0, ci, ti, ia);
		addImgVert(l, b, u0, v1, ci, ti, ia);
		addImgVert(r, b, u1, v1, ci, ti, ia);

		if (!isVideo) {
			drawStack.push(imagePL, img._texture.index);

			if (makeFrame) {
				img.resetMatrix();
				img._beginRender();
				img.frameCount++;
			}
		} else {
			// render video
			let externalTexture = Q5.device.importExternalTexture({ source: img });

			// Create bind group for the external texture that will
			// only exist for this frame
			$._textureBindGroups.push(
				Q5.device.createBindGroup({
					layout: videoTextureLayout,
					entries: [
						{ binding: 0, resource: $._imageSampler },
						{ binding: 1, resource: externalTexture }
					]
				})
			);

			drawStack.push(videoPL, $._textureBindGroups.length - 1);

			if (img.flipped) $.scale(-1, 1);
		}
	};

	/* TEXT */

	let textPL = 4;

	$._textShaderCode =
		$._baseShaderCode +
		/* wgsl */ `
struct VertexParams {
	@builtin(vertex_index) vertexIndex : u32,
	@builtin(instance_index) instanceIndex : u32
}
struct FragParams {
	@builtin(position) position : vec4f,
	@location(0) texCoord : vec2f,
	@location(1) fillColor : vec4f,
	@location(2) strokeColor : vec4f,
	@location(3) strokeWeight : f32,
	@location(4) edge : f32
}
struct Char {
	texOffset: vec2f,
	texExtent: vec2f,
	size: vec2f,
	offset: vec2f,
}
struct Text {
	pos: vec2f,
	scale: f32,
	matrixIndex: f32,
	fillIndex: f32,
	strokeIndex: f32,
	strokeWeight: f32,
	edge: f32
}

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

@group(1) @binding(0) var fontTexture: texture_2d<f32>;
@group(1) @binding(1) var fontSampler: sampler;
@group(1) @binding(2) var<storage> fontChars: array<Char>;

@group(2) @binding(0) var<storage> textChars: array<vec4f>;
@group(2) @binding(1) var<storage> textMetadata: array<Text>;

const quad = array(vec2f(0, -1), vec2f(1, -1), vec2f(0, 0), vec2f(1, 0));
const uvs = array(vec2f(0, 1), vec2f(1, 1), vec2f(0, 0), vec2f(1, 0));

fn calcPos(i: u32, char: vec4f, fontChar: Char, text: Text) -> vec2f {
	return ((quad[i] * fontChar.size + char.xy + fontChar.offset) *
		text.scale) + text.pos;
}

fn calcUV(i: u32, fontChar: Char) -> vec2f {
	return uvs[i] * fontChar.texExtent + fontChar.texOffset;
}

fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
	var vert = vec4f(pos, 0.0, 1.0);
	vert = transforms[i32(matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	return vert;
}

fn calcDist(texCoord: vec2f, edgeWidth: f32) -> f32 {
	let c = textureSample(fontTexture, fontSampler, texCoord);
	let sigDist = max(min(c.r, c.g), min(max(c.r, c.g), c.b)) - edgeWidth;

	let pxRange = 4.0;
	let sz = vec2f(textureDimensions(fontTexture, 0));
	let dx = sz.x * length(vec2f(dpdxFine(texCoord.x), dpdyFine(texCoord.x)));
	let dy = sz.y * length(vec2f(dpdxFine(texCoord.y), dpdyFine(texCoord.y)));
	let toPixels = pxRange * inverseSqrt(dx * dx + dy * dy);
	return sigDist * toPixels;
}

@vertex
fn vertexMain(v : VertexParams) -> FragParams {
	let char = textChars[v.instanceIndex];
	let text = textMetadata[i32(char.w)];
	let fontChar = fontChars[i32(char.z)];
	let pos = calcPos(v.vertexIndex, char, fontChar, text);

	var vert = transformVertex(pos, text.matrixIndex);

	var f : FragParams;
	f.position = vert;
	f.texCoord = calcUV(v.vertexIndex, fontChar);
	f.fillColor = colors[i32(text.fillIndex)];
	f.strokeColor = colors[i32(text.strokeIndex)];
	f.strokeWeight = text.strokeWeight;
	f.edge = text.edge;
	return f;
}

@fragment
fn fragMain(f : FragParams) -> @location(0) vec4f {
	let edge = f.edge;
	let dist = calcDist(f.texCoord, edge);

	if (f.strokeWeight == 0.0) {
		let fillAlpha = smoothstep(-edge, edge, dist);
		let color = vec4f(f.fillColor.rgb, f.fillColor.a * fillAlpha);
		if (color.a < 0.01) {
			discard;
		}
		return color;
	}

	let halfStroke = f.strokeWeight / 2.0;
	let fillAlpha = smoothstep(-edge, edge, dist - halfStroke);
	let strokeAlpha = smoothstep(-edge, edge, dist + halfStroke);
	var color = mix(f.strokeColor, f.fillColor, fillAlpha);
	color = vec4f(color.rgb, color.a * strokeAlpha);
	if (color.a < 0.01) {
		discard;
	}
	return color;
}
`;

	let textShader = Q5.device.createShaderModule({
		label: 'textShader',
		code: $._textShaderCode
	});

	let textBindGroupLayout = Q5.device.createBindGroupLayout({
		label: 'textBindGroupLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: { type: 'read-only-storage' }
			},
			{
				binding: 1,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: { type: 'read-only-storage' }
			}
		]
	});

	let fontSampler = Q5.device.createSampler({
		minFilter: 'linear',
		magFilter: 'linear',
		mipmapFilter: 'linear',
		maxAnisotropy: 16
	});

	let fontBindGroupLayout = Q5.device.createBindGroupLayout({
		label: 'fontBindGroupLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				texture: {}
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: {}
			},
			{
				binding: 2,
				visibility: GPUShaderStage.VERTEX,
				buffer: { type: 'read-only-storage' }
			}
		]
	});

	let fontPipelineLayout = Q5.device.createPipelineLayout({
		bindGroupLayouts: [...$._bindGroupLayouts, fontBindGroupLayout, textBindGroupLayout]
	});

	$._pipelineConfigs[4] = {
		label: 'textPipeline',
		layout: fontPipelineLayout,
		vertex: { module: textShader, entryPoint: 'vertexMain' },
		fragment: {
			module: textShader,
			entryPoint: 'fragMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs['source-over'] }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[4] = Q5.device.createRenderPipeline($._pipelineConfigs[4]);

	class MsdfFont {
		constructor(bindGroup, lineHeight, chars, kernings) {
			this.bindGroup = bindGroup;
			this.lineHeight = lineHeight;
			this.chars = chars;
			this.kernings = kernings;
			let charArray = Object.values(chars);
			this.charCount = charArray.length;
			this.defaultChar = charArray[0];
		}
		getChar(charCode) {
			return this.chars[charCode] ?? this.defaultChar;
		}
		// Gets the distance in pixels a line should advance for a given
		// character code. If the upcoming character code is given any
		// kerning between the two characters will be taken into account.
		getXAdvance(charCode, nextCharCode = -1) {
			let char = this.getChar(charCode);
			if (nextCharCode >= 0) {
				let kerning = this.kernings.get(charCode);
				if (kerning) {
					return char.xadvance + (kerning.get(nextCharCode) ?? 0);
				}
			}
			return char.xadvance;
		}
	}

	let fontsArr = [];
	let fonts = {};

	async function createFont(fontJsonUrl, fontName, cb) {
		let res = await fetch(fontJsonUrl);
		if (res.status == 404) return '';

		let atlas = await res.json();

		let slashIdx = fontJsonUrl.lastIndexOf('/');
		let baseUrl = slashIdx != -1 ? fontJsonUrl.substring(0, slashIdx + 1) : '';
		// load font image
		res = await fetch(baseUrl + atlas.pages[0]);
		let img = await createImageBitmap(await res.blob());

		// convert image to texture
		let imgSize = [img.width, img.height, 1];
		let texture = Q5.device.createTexture({
			label: `MSDF ${fontName}`,
			size: imgSize,
			format: 'rgba8unorm',
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
		});
		Q5.device.queue.copyExternalImageToTexture({ source: img }, { texture }, imgSize);

		// chars and kernings can be stored as csv strings, making the file
		// size smaller, but they need to be parsed into arrays of objects
		if (typeof atlas.chars == 'string') {
			atlas.chars = $.CSV.parse(atlas.chars, ' ');
			atlas.kernings = $.CSV.parse(atlas.kernings, ' ');
		}

		let charCount = atlas.chars.length;
		let charsBuffer = Q5.device.createBuffer({
			size: charCount * 32,
			usage: GPUBufferUsage.STORAGE,
			mappedAtCreation: true
		});

		let fontChars = new Float32Array(charsBuffer.getMappedRange());
		let u = 1 / atlas.common.scaleW;
		let v = 1 / atlas.common.scaleH;
		let chars = {};
		let o = 0; // offset
		for (let [i, char] of atlas.chars.entries()) {
			chars[char.id] = char;
			chars[char.id].charIndex = i;
			fontChars[o] = char.x * u; // texOffset.x
			fontChars[o + 1] = char.y * v; // texOffset.y
			fontChars[o + 2] = char.width * u; // texExtent.x
			fontChars[o + 3] = char.height * v; // texExtent.y
			fontChars[o + 4] = char.width; // size.x
			fontChars[o + 5] = char.height; // size.y
			fontChars[o + 6] = char.xoffset; // offset.x
			fontChars[o + 7] = -char.yoffset; // offset.y
			o += 8;
		}
		charsBuffer.unmap();

		let fontBindGroup = Q5.device.createBindGroup({
			label: 'fontBindGroup',
			layout: fontBindGroupLayout,
			entries: [
				{ binding: 0, resource: texture.createView() },
				{ binding: 1, resource: fontSampler },
				{ binding: 2, resource: { buffer: charsBuffer } }
			]
		});

		let kernings = new Map();
		if (atlas.kernings) {
			for (let kerning of atlas.kernings) {
				let charKerning = kernings.get(kerning.first);
				if (!charKerning) {
					charKerning = new Map();
					kernings.set(kerning.first, charKerning);
				}
				charKerning.set(kerning.second, kerning.amount);
			}
		}

		$._font = new MsdfFont(fontBindGroup, atlas.common.lineHeight, chars, kernings);

		$._font.index = fontsArr.length;
		fontsArr.push($._font);
		fonts[fontName] = $._font;

		if (cb) cb(fontName);
	}

	$.loadFont = (url, cb) => {
		if (url.startsWith('https://fonts.googleapis.com/css')) {
			return $._g.loadFont(url, cb);
		}

		let ext = url.slice(url.lastIndexOf('.') + 1);
		if (url == ext) return $._loadDefaultFont(url, cb);
		if (ext != 'json') return $._g.loadFont(url, cb);
		let fontName = url.slice(url.lastIndexOf('/') + 1, url.lastIndexOf('-'));
		let f = { family: fontName };
		f.promise = createFont(url, fontName, () => {
			delete f.promise;
			if (cb) cb(f);
		});
		$._preloadPromises.push(f.promise);

		if (!$._usePreload) return f.promise;
		return f;
	};

	$._loadDefaultFont = (fontName, cb) => {
		fonts[fontName] = null;
		let url = `https://q5js.org/fonts/${fontName}-msdf.json`;
		if (!navigator.onLine) {
			url = `/node_modules/q5/builtinFonts/${fontName}-msdf.json`;
		}
		return $.loadFont(url, cb);
	};

	let _textSize = 18,
		_textAlign = 'left',
		_textBaseline = 'alphabetic',
		leadingSet = false,
		leading = 22.5,
		leadDiff = 4.5,
		leadPercent = 1.25;

	$.textFont = (fontName) => {
		if (!fontName) return $._font;
		if (typeof fontName != 'string') fontName = fontName.family;
		let font = fonts[fontName];
		if (font) $._font = font;
		else if (font === undefined) return $._loadDefaultFont(fontName);
	};

	$.textSize = (size) => {
		if (size == undefined) return _textSize;
		_textSize = size;
		if (!leadingSet) {
			leading = size * leadPercent;
			leadDiff = leading - size;
		}
	};

	let weights = {
		thin: 100,
		extralight: 200,
		light: 300,
		normal: 400,
		regular: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
		bolder: 800,
		extrabold: 800,
		black: 900,
		heavy: 900
	};

	// ranges from 0.35 (black) to 0.65 (thin)
	let textEdge = 0.5;

	$.textWeight = (weight) => {
		if (!weight) return $._textWeight;
		if (typeof weight == 'string') {
			weight = weights[weight.toLowerCase().replace(/[ _-]/g, '')];
			if (!weight) throw new Error(`Invalid font weight: ${weight}`);
		}
		textEdge = 0.6875 - weight * 0.000375;
	};

	$.textLeading = (lineHeight) => {
		$._font.lineHeight = leading = lineHeight;
		leadDiff = leading - _textSize;
		leadPercent = leading / _textSize;
		leadingSet = true;
	};

	$.textAlign = (horiz, vert) => {
		_textAlign = horiz;
		if (vert) _textBaseline = vert;
	};

	let charStack = [],
		textStack = [];

	let measureText = (font, text, charCallback) => {
		let maxWidth = 0,
			offsetX = 0,
			offsetY = 0,
			line = 0,
			printedCharCount = 0,
			lineWidths = [],
			nextCharCode = text.charCodeAt(0);

		for (let i = 0; i < text.length; ++i) {
			let charCode = nextCharCode;
			nextCharCode = i < text.length - 1 ? text.charCodeAt(i + 1) : -1;
			switch (charCode) {
				case 10: // newline
					lineWidths.push(offsetX);
					line++;
					maxWidth = Math.max(maxWidth, offsetX);
					offsetX = 0;
					offsetY -= font.lineHeight * leadPercent;
					break;
				case 13: // CR
					break;
				case 32: // space
					// advance the offset without actually adding a character
					offsetX += font.getXAdvance(charCode);
					break;
				case 9: // tab
					offsetX += font.getXAdvance(charCode) * 2;
					break;
				default:
					if (charCallback) {
						charCallback(offsetX, offsetY, line, font.getChar(charCode));
					}
					offsetX += font.getXAdvance(charCode, nextCharCode);
					printedCharCount++;
			}
		}
		lineWidths.push(offsetX);
		maxWidth = Math.max(maxWidth, offsetX);
		return {
			width: maxWidth,
			height: lineWidths.length * font.lineHeight * leadPercent,
			lineWidths,
			printedCharCount
		};
	};

	$.text = (str, x, y, w, h) => {
		if (!$._font) {
			// if the default font hasn't been loaded yet, try to load it
			if ($._font !== null) $.textFont('sans-serif');
			return;
		}

		let type = typeof str;
		if (type != 'string') {
			if (type == 'object') str = str.toString();
			else str = str + '';
		}

		if (str.length > w) {
			let wrapped = [];
			let i = 0;
			while (i < str.length && wrapped.length < h) {
				let max = i + w;
				if (max >= str.length) {
					wrapped.push(str.slice(i));
					break;
				}
				let end = str.lastIndexOf(' ', max);
				if (end == -1 || end < i) end = max;
				wrapped.push(str.slice(i, end));
				i = end + 1;
			}
			str = wrapped.join('\n');
		}

		let spaces = 0, // whitespace char count, not literal spaces
			hasNewline;
		for (let i = 0; i < str.length; i++) {
			let c = str[i];
			switch (c) {
				case '\n':
					hasNewline = true;
				case '\r':
				case '\t':
				case ' ':
					spaces++;
			}
		}

		let charsData = [];

		let ta = _textAlign,
			tb = _textBaseline,
			textIndex = textStack.length,
			o = 0, // offset
			measurements;

		if (ta == 'left' && !hasNewline) {
			measurements = measureText($._font, str, (textX, textY, line, char) => {
				charsData[o] = textX;
				charsData[o + 1] = textY;
				charsData[o + 2] = char.charIndex;
				charsData[o + 3] = textIndex;
				o += 4;
			});

			if (tb == 'alphabetic') y -= _textSize;
			else if (tb == 'center') y -= _textSize * 0.5;
			else if (tb == 'bottom') y -= leading;
		} else {
			// measure the text to get the line widths before setting
			// the x position to properly align the text
			measurements = measureText($._font, str);

			let offsetY = 0;
			if (tb == 'alphabetic') y -= _textSize;
			else if (tb == 'center') offsetY = measurements.height * 0.5;
			else if (tb == 'bottom') offsetY = measurements.height;

			measureText($._font, str, (textX, textY, line, char) => {
				let offsetX = 0;
				if (ta == 'center') {
					offsetX = measurements.width * -0.5 - (measurements.width - measurements.lineWidths[line]) * -0.5;
				} else if (ta == 'right') {
					offsetX = -measurements.lineWidths[line];
				}
				charsData[o] = textX + offsetX;
				charsData[o + 1] = textY + offsetY;
				charsData[o + 2] = char.charIndex;
				charsData[o + 3] = textIndex;
				o += 4;
			});
		}
		charStack.push(charsData);

		let txt = [];

		if (matrixDirty) saveMatrix();

		txt[0] = x;
		txt[1] = -y;
		txt[2] = _textSize / 42;
		txt[3] = matrixIdx;
		txt[4] = doFill && fillSet ? fillIdx : 0;
		txt[5] = strokeIdx;
		txt[6] = doStroke && strokeSet ? sw : 0;
		txt[7] = textEdge;

		textStack.push(txt);
		drawStack.push(textPL, measurements.printedCharCount, $._font.index);
	};

	$.textWidth = (str) => {
		if (!$._font) return 0;
		return measureText($._font, str).width;
	};

	$.createTextImage = (str, w, h) => {
		$._g.textSize(_textSize);

		if (doFill && fillSet) {
			let fi = fillIdx * 4;
			$._g.fill(colorStack.slice(fi, fi + 4));
		}
		if (doStroke && strokeSet) {
			let si = strokeIdx * 4;
			$._g.stroke(colorStack.slice(si, si + 4));
		}

		let g = $._g.createTextImage(str, w, h);
		$._extendImage(g);
		return g;
	};

	$.textImage = (img, x, y) => {
		if (typeof img == 'string') img = $.createTextImage(img);

		let og = _imageMode;
		_imageMode = 'corner';

		let ta = _textAlign;
		if (ta == 'center') x -= img.canvas.hw;
		else if (ta == 'right') x -= img.width;

		let bl = _textBaseline;
		if (bl == 'alphabetic') y -= img._leading;
		else if (bl == 'center') y -= img._middle;
		else if (bl == 'bottom') y -= img._bottom;
		else if (bl == 'top') y -= img._top;

		$.image(img, x, y);
		_imageMode = og;
	};

	/* SHADERS */

	let pipelineTypes = ['frame', 'shapes', 'image', 'video', 'text'];

	let plCounters = {
		frame: 10,
		shapes: 1000,
		image: 2000,
		video: 3000,
		text: 4000
	};

	$._createShader = (code, type = 'shapes') => {
		code = code.trim();

		// default shader code
		let def = $['_' + type + 'ShaderCode'];

		let defVertIdx = def.indexOf('@vertex');
		let defFragIdx = def.indexOf('@fragment');

		if (!code.includes('@fragment')) {
			// replace @vertex section
			code = def.slice(0, defVertIdx) + code + '\n\n' + def.slice(defFragIdx);
		} else if (!code.includes('@vertex')) {
			// replace @fragment section
			code = def.slice(0, defFragIdx) + code;
		} else {
			// replace @vertex and @fragment sections
			code = def.slice(0, defVertIdx) + code;
		}

		let shader = Q5.device.createShaderModule({
			label: type + 'Shader',
			code: code
		});
		shader.type = type;

		let pipelineIndex = pipelineTypes.indexOf(type);
		let config = Object.assign({}, $._pipelineConfigs[pipelineIndex]);
		config.vertex.module = config.fragment.module = shader;

		let pl = plCounters[type];
		$._pipelines[pl] = Q5.device.createRenderPipeline(config);
		$._pipelines[pl].shader = shader;
		shader.pipelineIndex = pl;

		plCounters[type]++;

		return shader;
	};

	$.createShader = $.createShapesShader = $._createShader;
	$.createFrameShader = (code) => $._createShader(code, 'frame');
	$.createImageShader = (code) => $._createShader(code, 'image');
	$.createVideoShader = (code) => $._createShader(code, 'video');
	$.createTextShader = (code) => $._createShader(code, 'text');

	$.shader = (shader) => {
		let type = shader.type;
		let idx = shader.pipelineIndex;

		if (type == 'frame') {
			if (shader.applyBeforeDraw) prevFramePL = idx;
			else framePL = idx;
		} else if (type == 'shapes') shapesPL = idx;
		else if (type == 'image') imagePL = idx;
		else if (type == 'video') videoPL = idx;
		else if (type == 'text') textPL = idx;
	};

	$.resetShader = $.resetShapesShader = () => (shapesPL = 1);
	$.resetFrameShader = () => (prevFramePL = framePL = 0);
	$.resetImageShader = () => (imagePL = 2);
	$.resetVideoShader = () => (videoPL = 3);
	$.resetTextShader = () => (textPL = 4);

	$.resetShaders = () => {
		prevFramePL = framePL = 0;
		shapesPL = 1;
		imagePL = 2;
		videoPL = 3;
		textPL = 4;
	};
};

Q5.THRESHOLD = 1;
Q5.GRAY = 2;
Q5.OPAQUE = 3;
Q5.INVERT = 4;
Q5.POSTERIZE = 5;
Q5.DILATE = 6;
Q5.ERODE = 7;
Q5.BLUR = 8;

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
