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

	let pass, colorsStack, envBindGroup, transformBindGroup;

	$._createCanvas = (w, h, opt) => {
		q.ctx = q.drawingContext = c.getContext('webgpu');

		opt.format = navigator.gpu.getPreferredCanvasFormat();
		opt.device = Q5.device;

		$.ctx.configure(opt);

		$.pipelines = [];

		// pipeline changes for each draw call
		$.pipelinesStack = [];

		// vertices for each draw call
		$.verticesStack = [];

		// number of vertices for each draw call
		$.drawStack = [];

		// colors used for each draw call
		colorsStack = $.colorsStack = [1, 1, 1, 1];

		// current color index, used to associate a vertex with a color
		$._colorIndex = 0;

		let envLayout = Q5.device.createBindGroupLayout({
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

		let transformLayout = Q5.device.createBindGroupLayout({
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

		$.bindGroupLayouts = [envLayout, transformLayout];

		const uniformBuffer = Q5.device.createBuffer({
			size: 8, // Size of two floats
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});

		Q5.device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([$.canvas.hw, $.canvas.hh]));

		envBindGroup = Q5.device.createBindGroup({
			layout: envLayout,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: uniformBuffer
					}
				}
			]
		});
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

	$.push = () => {
		// Push the current matrix index onto the stack
		$._transformIndexStack.push($._transformIndex);
	};

	$.pop = () => {
		if ($._transformIndexStack.length > 0) {
			// Pop the last matrix index from the stack and set it as the current matrix index
			let idx = $._transformIndexStack.pop();
			$._matrix = $.transformStates[idx].slice();
			$._transformIndex = idx;
		} else {
			console.warn('Matrix index stack is empty!');
		}
	};

	$.translate = (x, y, z) => {
		if (!x && !y && !z) return;
		// Update the translation values
		$._matrix[3] += x;
		$._matrix[7] += y;
		$._matrix[11] += z || 0;
		$._matrixDirty = true;
	};

	$.rotate = (r) => {
		if (!r) return;
		if ($._angleMode == 'degrees') r = $.radians(r);

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

	$._beginRender = () => {
		$.encoder = Q5.device.createCommandEncoder();

		pass = q.pass = $.encoder.beginRenderPass({
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
		pass.setBindGroup(0, envBindGroup);

		if (transformStates.length > 1 || !transformBindGroup) {
			const transformBuffer = Q5.device.createBuffer({
				size: transformStates.length * 64, // Size of 16 floats
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
			});

			Q5.device.queue.writeBuffer(transformBuffer, 0, new Float32Array(transformStates.flat()));

			transformBindGroup = Q5.device.createBindGroup({
				layout: $.bindGroupLayouts[1],
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

		pass.setBindGroup(1, transformBindGroup);

		// run pre-render methods
		for (let m of $._hooks.preRender) m();

		// local variables used for performance
		let drawStack = $.drawStack;

		let drawVertOffset = 0;
		let curPipelineIndex = -1;

		for (let i = 0; i < drawStack.length; i += 2) {
			if (curPipelineIndex != drawStack[i]) {
				curPipelineIndex = drawStack[i];
				pass.setPipeline($.pipelines[curPipelineIndex]);
			}

			let vertCount = drawStack[i + 1];
			pass.draw(vertCount, 1, drawVertOffset, 0);
			drawVertOffset += vertCount;
		}
	};

	$._finishRender = () => {
		pass.end();
		const commandBuffer = $.encoder.finish();
		Q5.device.queue.submit([commandBuffer]);
		q.pass = $.encoder = null;

		// clear the stacks for the next frame
		$.verticesStack.length = 0;
		$.drawStack.length = 0;
		$.colorsStack.length = 4;
		$.pipelinesStack.length = 0;
		$._colorIndex = 0;
		rotation = 0;
		$.resetMatrix();
		$._matrixDirty = false;
		$.transformStates.length = 1;
		$._transformIndexStack.length = 0;
	};

	function addColor(r, g, b, a = 1) {
		if (typeof r == 'string') r = Q5.color(r);
		// grayscale mode `fill(1, 0.5)`
		if (b == undefined) {
			a = g;
			g = b = r;
		}
		if (r._q5Color) colorsStack.push(...r.levels);
		else colorsStack.push(r, g, b, a);
		$._colorIndex++;
	}

	$.fill = function () {
		addColor(...arguments);
		$._doFill = true;
		$._fillIndex = $._colorIndex;
	};
	$.stroke = function () {
		addColor(...arguments);
		$._doStroke = true;
		$._fillIndex = $._colorIndex;
	};

	$.noFill = () => ($._doFill = false);
	$.noStroke = () => ($._doStroke = false);

	$._strokeWeight = 1;
	$.strokeWeight = (v) => ($._strokeWeight = v);

	$.clear = () => {};
};

Q5.webgpu = async function (scope, parent) {
	if (!scope || scope == 'global') Q5._hasGlobal = true;
	if (!navigator.gpu) {
		console.error('q5 WebGPU not supported on this browser!');
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
