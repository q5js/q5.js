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

	let colorsStack;

	$._createCanvas = (w, h, opt) => {
		q.ctx = q.drawingContext = c.getContext('webgpu');

		$._canvasFormat = navigator.gpu.getPreferredCanvasFormat();
		opt.format = $._canvasFormat;
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
		colorsStack = $.colorsStack = [];

		// current color index, used to associate a vertex with a color
		$._colorIndex = -1;
	};

	$._resizeCanvas = (w, h) => {
		$._setCanvasSize(w, h);
	};

	$.resetMatrix = () => {};
	$.translate = () => {};

	$._beginRender = () => {
		$.encoder = Q5.device.createCommandEncoder();

		q.pass = $.encoder.beginRenderPass({
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
		// run pre-render methods
		for (let m of $._hooks.preRender) m();

		$.pass.setPipeline($.pipelines[0]);

		let drawStack = $.drawStack; // local variables used for performance
		let o = 0; // vertex offset
		for (let i = 0; i < drawStack.length; i++) {
			$.pass.draw(drawStack[i], 1, o, 0);
			o += drawStack[i];
		}
	};

	$._finishRender = () => {
		$.pass.end();
		const commandBuffer = $.encoder.finish();
		Q5.device.queue.submit([commandBuffer]);
		q.pass = $.encoder = null;

		// clear the stacks for the next frame
		$.verticesStack.length = 0;
		$.drawStack.length = 0;
		$.colorsStack.length = 0;
		$.pipelinesStack.length = 0;
		$._colorIndex = -1;
	};

	$.fill = (r, g, b, a = 1) => {
		// grayscale mode `fill(1, 0.5)`
		if (b == undefined) {
			a = g;
			g = b = r;
		}
		let levels;
		if (r._q5Color) levels = r.levels;
		else levels = [r, g, b, a];

		colorsStack.push(...levels);
		$._colorIndex++;
	};
};

Q5.webgpu = async function (scope, parent) {
	if (!navigator.gpu) {
		console.error('q5 WebGPU not supported on this browser!');
		return new Q5(scope, parent);
	}
	let adapter = await navigator.gpu.requestAdapter();
	if (!adapter) throw new Error('No appropriate GPUAdapter found.');
	Q5.device = await adapter.requestDevice();

	return new Q5(scope, parent, 'webgpu');
};
