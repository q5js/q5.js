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

	if ($.colorMode) $.colorMode('rgb', 'float');

	let pass;

	$.pipelines = [];

	// local variables used for slightly better performance
	// stores pipeline shifts and vertex counts/image indices
	let drawStack = ($.drawStack = []);

	// colors used for each draw call
	let colorsStack = ($.colorsStack = [1, 1, 1, 1]);

	$._envLayout = Q5.device.createBindGroupLayout({
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX,
				buffer: {
					type: 'uniform',
					hasDynamicOffset: false
				}
			}
		]
	});

	$._transformLayout = Q5.device.createBindGroupLayout({
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX,
				buffer: {
					type: 'read-only-storage',
					hasDynamicOffset: false
				}
			}
		]
	});

	$.bindGroupLayouts = [$._envLayout, $._transformLayout];

	const uniformBuffer = Q5.device.createBuffer({
		size: 8, // Size of two floats
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
	});

	$._createCanvas = (w, h, opt) => {
		q.ctx = q.drawingContext = c.getContext('webgpu');

		opt.format = navigator.gpu.getPreferredCanvasFormat();
		opt.device = Q5.device;

		$.ctx.configure(opt);

		Q5.device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([$.canvas.hw, $.canvas.hh]));

		$._envBindGroup = Q5.device.createBindGroup({
			layout: $._envLayout,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: uniformBuffer
					}
				}
			]
		});

		return c;
	};

	$._resizeCanvas = (w, h) => {
		$._setCanvasSize(w, h);
	};

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

	// Boolean to track if the matrix has been modified
	$._matrixDirty = false;

	// Array to store transformation matrices for the render pass
	$.transformStates = [$._matrix.slice()];

	// Stack to keep track of transformation matrix indexes
	$._transformIndexStack = [];

	$.push = $.pushMatrix = () => {
		// Push the current matrix index onto the stack
		$._transformIndexStack.push($._transformIndex);
		$._pushStyles();
	};

	$.pop = $.popMatrix = () => {
		if (!$._transformIndexStack.length) {
			return console.warn('Matrix index stack is empty!');
		}
		// Pop the last matrix index from the stack and set it as the current matrix index
		let idx = $._transformIndexStack.pop();
		$._matrix = $.transformStates[idx].slice();
		$._transformIndex = idx;
		$._matrixDirty = false;
		$._popStyles();
	};

	$.translate = (x, y, z) => {
		if (!x && !y && !z) return;
		// Update the translation values
		$._matrix[3] += x;
		$._matrix[7] -= y;
		$._matrix[11] += z || 0;
		$._matrixDirty = true;
	};

	$.rotate = (r) => {
		if (!r) return;
		if ($._angleMode) r *= $._DEGTORAD;

		let cosR = Math.cos(r);
		let sinR = Math.sin(r);

		let m0 = $._matrix[0],
			m1 = $._matrix[1],
			m4 = $._matrix[4],
			m5 = $._matrix[5];
		if (!m0 && !m1 && !m4 && !m5) {
			$._matrix[0] = cosR;
			$._matrix[1] = sinR;
			$._matrix[4] = -sinR;
			$._matrix[5] = cosR;
		} else {
			$._matrix[0] = m0 * cosR + m4 * sinR;
			$._matrix[1] = m1 * cosR + m5 * sinR;
			$._matrix[4] = m0 * -sinR + m4 * cosR;
			$._matrix[5] = m1 * -sinR + m5 * cosR;
		}

		$._matrixDirty = true;
	};

	$.scale = (sx = 1, sy, sz = 1) => {
		sy ??= sx;

		$._matrix[0] *= sx;
		$._matrix[5] *= sy;
		$._matrix[10] *= sz;

		$._matrixDirty = true;
	};

	// Function to save the current matrix state if dirty
	$._saveMatrix = () => {
		$.transformStates.push($._matrix.slice());
		$._transformIndex = $.transformStates.length - 1;
		$._matrixDirty = false;
	};

	// current color index, used to associate a vertex with a color
	let colorIndex = 0;
	const addColor = (r, g, b, a = 1) => {
		if (typeof r == 'string') r = $.color(r);
		else if (b == undefined) {
			// grayscale mode `fill(1, 0.5)`
			a = g ?? 1;
			g = b = r;
		}
		if (r._q5Color) colorsStack.push(r.r, r.g, r.b, r.a);
		else colorsStack.push(r, g, b, a);
		colorIndex++;
	};

	$.fill = (r, g, b, a) => {
		addColor(r, g, b, a);
		$._doFill = true;
		$._fillIndex = colorIndex;
	};
	$.stroke = (r, g, b, a) => {
		addColor(r, g, b, a);
		$._doStroke = true;
		$._strokeIndex = colorIndex;
	};

	$.noFill = () => ($._doFill = false);
	$.noStroke = () => ($._doStroke = false);

	$._strokeWeight = 1;
	$.strokeWeight = (v) => ($._strokeWeight = Math.abs(v));

	$._calcBox = (x, y, w, h, mode) => {
		let hw = w / 2;
		let hh = h / 2;

		// left, right, top, bottom
		let l, r, t, b;
		if (!mode || mode == 'corner') {
			// CORNER
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

	$.clear = () => {};

	$._beginRender = () => {
		$.encoder = Q5.device.createCommandEncoder();

		pass = q.pass = $.encoder.beginRenderPass({
			label: 'q5-webgpu',
			colorAttachments: [
				{
					view: ctx.getCurrentTexture().createView(),
					loadOp: 'clear',
					storeOp: 'store'
				}
			]
		});
	};

	$._render = () => {
		if (transformStates.length > 1 || !$._transformBindGroup) {
			const transformBuffer = Q5.device.createBuffer({
				size: transformStates.length * 64, // Size of 16 floats
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
			});

			Q5.device.queue.writeBuffer(transformBuffer, 0, new Float32Array(transformStates.flat()));

			$._transformBindGroup = Q5.device.createBindGroup({
				layout: $._transformLayout,
				entries: [
					{
						binding: 0,
						resource: {
							buffer: transformBuffer
						}
					}
				]
			});
		}

		pass.setBindGroup(0, $._envBindGroup);
		pass.setBindGroup(1, $._transformBindGroup);

		for (let m of $._hooks.preRender) m();

		let drawVertOffset = 0;
		let imageVertOffset = 0;
		let curPipelineIndex = -1;
		let curTextureIndex = -1;

		pass.setPipeline($.pipelines[0]);

		for (let i = 0; i < drawStack.length; i += 2) {
			let v = drawStack[i + 1];

			if (curPipelineIndex != drawStack[i]) {
				curPipelineIndex = drawStack[i];
				pass.setPipeline($.pipelines[curPipelineIndex]);
			}

			if (curPipelineIndex == 0) {
				pass.draw(v, 1, drawVertOffset, 0);
				drawVertOffset += v;
			} else if (curPipelineIndex == 1) {
				if (curTextureIndex != v) {
					pass.setBindGroup(3, $._textureBindGroups[v]);
				}
				pass.draw(6, 1, imageVertOffset, 0);
				imageVertOffset += 6;
			}
		}

		for (let m of $._hooks.postRender) m();
	};

	$._finishRender = () => {
		pass.end();
		const commandBuffer = $.encoder.finish();
		Q5.device.queue.submit([commandBuffer]);
		q.pass = $.encoder = null;

		// clear the stacks for the next frame
		$.drawStack.length = 0;
		$.colorsStack.length = 4;
		colorIndex = 0;
		rotation = 0;
		$.transformStates.length = 1;
		$._transformIndexStack.length = 0;
	};
};

Q5.webgpu = async function (scope, parent) {
	if (!scope || scope == 'global') Q5._hasGlobal = true;
	if (!navigator.gpu) {
		console.warn('q5 WebGPU not supported on this browser!');
		let q = new Q5(scope, parent);
		q.colorMode('rgb', 1);
		q._beginRender = () => q.translate(q.canvas.hw, q.canvas.hh);
		return q;
	}
	let adapter = await navigator.gpu.requestAdapter();
	if (!adapter) throw new Error('No appropriate GPUAdapter found.');
	Q5.device = await adapter.requestDevice();

	return new Q5(scope, parent, 'webgpu');
};
