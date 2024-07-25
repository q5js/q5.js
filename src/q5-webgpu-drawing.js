Q5.renderers.webgpu.drawing = ($, q) => {
	$.CLOSE = 1;

	let verticesStack, drawStack, colorsStack;

	$._hooks.postCanvas.push(() => {
		verticesStack = $.verticesStack;
		drawStack = $.drawStack;
		colorsStack = $.colorsStack;

		let vertexBufferLayout = {
			arrayStride: 12, // 2 coordinates + 1 color index * 4 bytes each
			attributes: [
				{
					format: 'float32x2',
					offset: 0,
					shaderLocation: 0 // position
				},
				{
					format: 'float32',
					offset: 8,
					shaderLocation: 1 // colorIndex
				}
			]
		};

		let vertexShader = Q5.device.createShaderModule({
			code: `
struct VertexOutput {
	@builtin(position) position: vec4<f32>,
	@location(1) colorIndex: f32
};

@vertex
fn vertexMain(@location(0) pos: vec2<f32>, @location(1) colorIndex: f32) -> VertexOutput {
	var output: VertexOutput;
	output.position = vec4<f32>(pos, 0.0, 1.0);
	output.colorIndex = colorIndex;
	return output;
}
`
		});

		let fragmentShader = Q5.device.createShaderModule({
			code: `
@group(0) @binding(0) var<storage, read> uColors : array<vec4<f32>>;

@fragment
fn fragmentMain(@location(1) colorIndex: f32) -> @location(0) vec4<f32> {
	let index = u32(colorIndex);
	return mix(uColors[index], uColors[index + 1u], fract(colorIndex));
}
`
		});

		let bindGroupLayout = Q5.device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: 'read-only-storage',
						hasDynamicOffset: false
					}
				}
			]
		});

		let pipelineLayout = Q5.device.createPipelineLayout({
			bindGroupLayouts: [bindGroupLayout]
		});

		$.pipelines[0] = Q5.device.createRenderPipeline({
			layout: pipelineLayout,
			vertex: {
				module: vertexShader,
				entryPoint: 'vertexMain',
				buffers: [vertexBufferLayout]
			},
			fragment: {
				module: fragmentShader,
				entryPoint: 'fragmentMain',
				targets: [
					{
						format: $._canvasFormat
					}
				]
			},
			primitive: {
				topology: 'triangle-list'
			}
		});
	});

	let shapeVertices;

	$.beginShape = () => {
		shapeVertices = [];
	};

	$.vertex = (x, y) => {
		shapeVertices.push(x / $.canvas.hw, -y / $.canvas.hh, $._colorIndex);
	};

	$.endShape = (close) => {
		if (shapeVertices.length < 6) {
			throw new Error('A shape must have at least 3 vertices.');
		}
		if (close) {
			// Close the shape by adding the first vertex at the end
			shapeVertices.push(shapeVertices[0], shapeVertices[1], shapeVertices[2]);
		}
		// Convert the shape to triangles
		let triangles = [];
		for (let i = 3; i < shapeVertices.length; i += 3) {
			triangles.push(
				shapeVertices[0],
				shapeVertices[1],
				shapeVertices[2], // First vertex
				shapeVertices[i - 3],
				shapeVertices[i - 2],
				shapeVertices[i - 1], // Previous vertex
				shapeVertices[i],
				shapeVertices[i + 1],
				shapeVertices[i + 2] // Current vertex
			);
		}

		verticesStack.push(...triangles);
		drawStack.push(triangles.length / 3);
		shapeVertices = [];
	};

	$.triangle = (x1, y1, x2, y2, x3, y3) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.endShape(1);
	};

	$.rect = (x, y, w, h) => {
		let hw = w / 2;
		let hh = h / 2;
		// convert the coordinates from pixel space to NDC space
		let left = (x - hw) / $.canvas.hw;
		let right = (x + hw) / $.canvas.hw;
		let top = -(y - hh) / $.canvas.hh; // y is inverted in WebGPU
		let bottom = -(y + hh) / $.canvas.hh; // y is inverted in WebGPU

		let ci = $._colorIndex;
		// two triangles make a rectangle
		verticesStack.push(
			left,
			top,
			ci,
			right,
			top,
			ci,
			left,
			bottom,
			ci,
			right,
			top,
			ci,
			left,
			bottom,
			ci,
			right,
			bottom,
			ci
		);
		drawStack.push(6);
	};

	/**
	 * Derived from: ceil(Math.log(d) * 7) * 2 - ceil(28)
	 * This lookup table is used for better performance.
	 * @param {Number} d diameter of the circle
	 * @returns n number of segments
	 */
	// prettier-ignore
	const getArcSegments = (d) => 
    d < 14 ? 8 :
    d < 16 ? 10 :
    d < 18 ? 12 :
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

	$.ellipse = (x, y, w, h) => {
		const n = getArcSegments(w == h ? w : Math.max(w, h));

		let a = Math.max(w, 1) / 2;
		let b = w == h ? a : Math.max(h, 1) / 2;

		x /= $.canvas.hw;
		y /= -$.canvas.hh;
		a /= $.canvas.hw;
		b /= -$.canvas.hh;

		let t = 0; // theta
		const angleIncrement = $.TAU / n;
		const ci = $._colorIndex;
		let vx1, vy1, vx2, vy2;
		for (let i = 0; i <= n; i++) {
			vx1 = vx2;
			vy1 = vy2;
			vx2 = x + a * Math.cos(t);
			vy2 = y + b * Math.sin(t);
			t += angleIncrement;

			if (i == 0) continue;

			verticesStack.push(x, y, ci, vx1, vy1, ci, vx2, vy2, ci);
		}

		drawStack.push(n * 3);
	};

	$.circle = (x, y, d) => $.ellipse(x, y, d, d);

	$.noStroke = () => {};

	$.background = () => {};

	$._hooks.preRender.push(() => {
		const vertexBuffer = Q5.device.createBuffer({
			size: verticesStack.length * 6,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});

		Q5.device.queue.writeBuffer(vertexBuffer, 0, new Float32Array(verticesStack));
		$.pass.setVertexBuffer(0, vertexBuffer);

		const colorBuffer = Q5.device.createBuffer({
			size: colorsStack.length * 4,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
		});

		Q5.device.queue.writeBuffer(colorBuffer, 0, new Float32Array(colorsStack));

		const bindGroup = Q5.device.createBindGroup({
			layout: $.pipelines[0].getBindGroupLayout(0),
			entries: [
				{
					binding: 0,
					resource: {
						buffer: colorBuffer,
						offset: 0,
						size: colorsStack.length * 4
					}
				}
			]
		});

		// set the bind group once before rendering
		$.pass.setBindGroup(0, bindGroup);
	});
};
