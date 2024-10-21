/**
 * q5-webgpu
 *
 * EXPERIMENTAL, for developer testing only!
 */
Q5.renderers.webgpu = {};

Q5.renderers.webgpu.canvas = ($, q) => {
	let c = $.canvas;

	c.width = $.width = 500;
	c.height = $.height = 500;

	if ($.colorMode) $.colorMode('rgb', 1);

	let pass,
		mainView,
		colorsLayout,
		colorIndex = 1,
		colorStackIndex = 8;

	$._pipelineConfigs = [];
	$._pipelines = [];

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

	$._transformLayout = Q5.device.createBindGroupLayout({
		label: 'transformLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX,
				buffer: {
					type: 'uniform',
					hasDynamicOffset: false
				}
			},
			{
				binding: 1,
				visibility: GPUShaderStage.VERTEX,
				buffer: {
					type: 'read-only-storage',
					hasDynamicOffset: false
				}
			}
		]
	});

	colorsLayout = Q5.device.createBindGroupLayout({
		label: 'colorsLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: {
					type: 'read-only-storage',
					hasDynamicOffset: false
				}
			}
		]
	});

	$.bindGroupLayouts = [$._transformLayout, colorsLayout];

	let uniformBuffer = Q5.device.createBuffer({
		size: 8, // Size of two floats
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
	});

	let createMainView = () => {
		mainView = Q5.device
			.createTexture({
				size: [$.canvas.width, $.canvas.height],
				sampleCount: 4,
				format: 'bgra8unorm',
				usage: GPUTextureUsage.RENDER_ATTACHMENT
			})
			.createView();
	};

	$._createCanvas = (w, h, opt) => {
		q.ctx = q.drawingContext = c.getContext('webgpu');

		opt.format ??= navigator.gpu.getPreferredCanvasFormat();
		opt.device ??= Q5.device;

		// needed for other blend modes but couldn't get it working
		// opt.alphaMode = 'premultiplied';

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

	$._fillIndex = $._strokeIndex = 0;
	$._doFill = $._doStroke = true;

	$.fill = (r, g, b, a) => {
		addColor(r, g, b, a);
		$._doFill = $._fillSet = true;
		$._fillIndex = colorIndex;
	};
	$.stroke = (r, g, b, a) => {
		addColor(r, g, b, a);
		$._doStroke = $._strokeSet = true;
		$._strokeIndex = colorIndex;
	};

	$.noFill = () => ($._doFill = false);
	$.noStroke = () => ($._doStroke = false);

	$._strokeWeight = 1;
	$.strokeWeight = (v) => ($._strokeWeight = Math.abs(v));

	$.resetMatrix = () => {
		// Initialize the transformation matrix as 4x4 identity matrix

		// prettier-ignore
		$._matrix = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
		$._transformIndex = 0;
	};
	$.resetMatrix();

	// tracks if the matrix has been modified
	$._matrixDirty = false;

	// array to store transformation matrices for the render pass
	let transformStates = [$._matrix.slice()];

	// stack to keep track of transformation matrix indexes
	$._transformIndexStack = [];

	$.translate = (x, y, z) => {
		if (!x && !y && !z) return;
		// Update the translation values
		$._matrix[12] += x;
		$._matrix[13] -= y;
		$._matrix[14] += z || 0;
		$._matrixDirty = true;
	};

	$.rotate = (a) => {
		if (!a) return;
		if ($._angleMode) a *= $._DEGTORAD;

		let cosR = Math.cos(a);
		let sinR = Math.sin(a);

		let m = $._matrix;

		let m0 = m[0],
			m1 = m[1],
			m4 = m[4],
			m5 = m[5];

		if (!m0 && !m1 && !m4 && !m5) {
			m[0] = cosR;
			m[1] = sinR;
			m[4] = -sinR;
			m[5] = cosR;
		} else {
			m[0] = m0 * cosR + m4 * sinR;
			m[1] = m1 * cosR + m5 * sinR;
			m[4] = m4 * cosR - m0 * sinR;
			m[5] = m5 * cosR - m1 * sinR;
		}

		$._matrixDirty = true;
	};

	$.scale = (x = 1, y, z = 1) => {
		y ??= x;

		let m = $._matrix;

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

		let tanAng = Math.tan(ang);

		let m0 = $._matrix[0],
			m1 = $._matrix[1],
			m4 = $._matrix[4],
			m5 = $._matrix[5];

		$._matrix[0] = m0 + m4 * tanAng;
		$._matrix[1] = m1 + m5 * tanAng;

		$._matrixDirty = true;
	};

	$.shearY = (ang) => {
		if (!ang) return;
		if ($._angleMode) ang *= $._DEGTORAD;

		let tanAng = Math.tan(ang);

		let m0 = $._matrix[0],
			m1 = $._matrix[1],
			m4 = $._matrix[4],
			m5 = $._matrix[5];

		$._matrix[4] = m4 + m0 * tanAng;
		$._matrix[5] = m5 + m1 * tanAng;

		$._matrixDirty = true;
	};

	$.applyMatrix = (...args) => {
		let m;
		if (args.length == 1) m = args[0];
		else m = args;

		if (m.length == 9) {
			// Convert 3x3 matrix to 4x4 matrix
			m = [m[0], m[1], 0, m[2], m[3], m[4], 0, m[5], 0, 0, 1, 0, m[6], m[7], 0, m[8]];
		} else if (m.length != 16) {
			throw new Error('Matrix must be a 3x3 or 4x4 array.');
		}

		// Overwrite the current transformation matrix
		$._matrix = m.slice();
		$._matrixDirty = true;
	};

	// Function to save the current matrix state if dirty
	$._saveMatrix = () => {
		transformStates.push($._matrix.slice());
		$._transformIndex = transformStates.length - 1;
		$._matrixDirty = false;
	};

	// Push the current matrix index onto the stack
	$.pushMatrix = () => {
		if ($._matrixDirty) $._saveMatrix();
		$._transformIndexStack.push($._transformIndex);
	};
	$.popMatrix = () => {
		if (!$._transformIndexStack.length) {
			return console.warn('Matrix index stack is empty!');
		}
		// Pop the last matrix index and set it as the current matrix index
		let idx = $._transformIndexStack.pop();
		$._matrix = transformStates[idx].slice();
		$._transformIndex = idx;
		$._matrixDirty = false;
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

	$.clear = () => {};

	$._beginRender = () => {
		$.encoder = Q5.device.createCommandEncoder();

		pass = q.pass = $.encoder.beginRenderPass({
			label: 'q5-webgpu',
			colorAttachments: [
				{
					view: mainView,
					resolveTarget: $.ctx.getCurrentTexture().createView(),
					loadOp: 'clear',
					storeOp: 'store'
				}
			]
		});
	};

	$._render = () => {
		if (transformStates.length > 1 || !$._transformBindGroup) {
			let transformBuffer = Q5.device.createBuffer({
				size: transformStates.length * 64, // 64 is the size of 16 floats
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
				mappedAtCreation: true
			});

			new Float32Array(transformBuffer.getMappedRange()).set(transformStates.flat());
			transformBuffer.unmap();

			$._transformBindGroup = Q5.device.createBindGroup({
				layout: $._transformLayout,
				entries: [
					{ binding: 0, resource: { buffer: uniformBuffer } },
					{ binding: 1, resource: { buffer: transformBuffer } }
				]
			});
		}

		pass.setBindGroup(0, $._transformBindGroup);

		let colorsBuffer = Q5.device.createBuffer({
			size: colorStackIndex * 4,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		new Float32Array(colorsBuffer.getMappedRange()).set(colorStack.slice(0, colorStackIndex));
		colorsBuffer.unmap();

		$._colorsBindGroup = Q5.device.createBindGroup({
			layout: colorsLayout,
			entries: [{ binding: 0, resource: { buffer: colorsBuffer } }]
		});

		$.pass.setBindGroup(1, $._colorsBindGroup);

		for (let m of $._hooks.preRender) m();

		let drawVertOffset = 0,
			imageVertOffset = 0,
			textCharOffset = 0,
			curPipelineIndex = -1,
			curTextureIndex = -1;

		for (let i = 0; i < drawStack.length; i += 2) {
			let v = drawStack[i + 1];

			if (curPipelineIndex != drawStack[i]) {
				curPipelineIndex = drawStack[i];
				pass.setPipeline($._pipelines[curPipelineIndex]);
			}

			if (curPipelineIndex == 0) {
				// v is the number of vertices
				pass.draw(v, 1, drawVertOffset);
				drawVertOffset += v;
			} else if (curPipelineIndex == 1) {
				if (curTextureIndex != v) {
					// v is the texture index
					pass.setBindGroup(2, $._textureBindGroups[v]);
				}
				pass.draw(4, 1, imageVertOffset);
				imageVertOffset += 4;
			} else if (curPipelineIndex == 2) {
				let o = drawStack[i + 2];
				pass.setBindGroup(2, $._fonts[o].bindGroup);
				pass.setBindGroup(3, $._textBindGroup);

				// v is the number of characters in the text
				pass.draw(4, v, 0, textCharOffset);
				textCharOffset += v;
				i++;
			}
		}

		for (let m of $._hooks.postRender) m();
	};

	$._finishRender = () => {
		pass.end();
		let commandBuffer = $.encoder.finish();
		Q5.device.queue.submit([commandBuffer]);

		q.pass = $.encoder = null;

		// clear the stacks for the next frame
		$.drawStack.length = 0;
		colorIndex = 1;
		colorStackIndex = 8;
		rotation = 0;
		transformStates.length = 1;
		$._transformIndexStack.length = 0;
	};
};

Q5.initWebGPU = async () => {
	if (!navigator.gpu) {
		console.warn('q5 WebGPU not supported on this browser!');
		return false;
	}
	if (!Q5.device) {
		let adapter = await navigator.gpu.requestAdapter();
		if (!adapter) throw new Error('No appropriate GPUAdapter found.');
		Q5.device = await adapter.requestDevice();
	}
	return true;
};

Q5.webgpu = async function (scope, parent) {
	if (!scope || scope == 'global') Q5._hasGlobal = true;
	if (!(await Q5.initWebGPU())) {
		let q = new Q5(scope, parent);
		q.colorMode('rgb', 1);
		q._beginRender = () => q.translate(q.canvas.hw, q.canvas.hh);
		return q;
	}
	return new Q5(scope, parent, 'webgpu');
};
