Q5.renderers.webgpu.drawing = ($, q) => {
	let c = $.canvas,
		drawStack = $.drawStack,
		verticesStack = [],
		colorIndex;

	let vertexShader = Q5.device.createShaderModule({
		label: 'drawingVertexShader',
		code: `
struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) colorIndex: f32
};

struct Uniforms {
	halfWidth: f32,
	halfHeight: f32
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> transforms: array<mat4x4<f32>>;

@vertex
fn vertexMain(@location(0) pos: vec2f, @location(1) colorIndex: f32, @location(2) transformIndex: f32) -> VertexOutput {
	var vert = vec4f(pos, 0.0, 1.0);
	vert = transforms[i32(transformIndex)] * vert;
	vert.x /= uniforms.halfWidth;
	vert.y /= uniforms.halfHeight;

	var output: VertexOutput;
	output.position = vert;
	output.colorIndex = colorIndex;
	return output;
}
`
	});

	let fragmentShader = Q5.device.createShaderModule({
		label: 'drawingFragmentShader',
		code: `
@group(1) @binding(0) var<storage, read> colors : array<vec4f>;

@fragment
fn fragmentMain(@location(0) colorIndex: f32) -> @location(0) vec4f {
	let index = i32(colorIndex);
	return mix(colors[index], colors[index + 1], fract(colorIndex));
}
`
	});

	let vertexBufferLayout = {
		arrayStride: 16, // 2 coordinates + 1 color index + 1 transform index * 4 bytes each
		attributes: [
			{ format: 'float32x2', offset: 0, shaderLocation: 0 }, // position
			{ format: 'float32', offset: 8, shaderLocation: 1 }, // colorIndex
			{ format: 'float32', offset: 12, shaderLocation: 2 } // transformIndex
		]
	};

	let pipelineLayout = Q5.device.createPipelineLayout({
		label: 'drawingPipelineLayout',
		bindGroupLayouts: $.bindGroupLayouts
	});

	$._pipelineConfigs[0] = {
		label: 'drawingPipeline',
		layout: pipelineLayout,
		vertex: {
			module: vertexShader,
			entryPoint: 'vertexMain',
			buffers: [vertexBufferLayout]
		},
		fragment: {
			module: fragmentShader,
			entryPoint: 'fragmentMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs.normal }]
		},
		primitive: { topology: 'triangle-list' }
	};

	$._pipelines[0] = Q5.device.createRenderPipeline($._pipelineConfigs[0]);

	let shapeVertices;

	$.beginShape = () => {
		shapeVertices = [];
	};

	$.vertex = (x, y) => {
		if ($._matrixDirty) $._saveMatrix();
		shapeVertices.push(x, -y, $._fillIndex, $._transformIndex);
	};

	$.endShape = (close) => {
		if (!$._doFill) {
			shapeVertices = [];
			return;
		}
		let v = shapeVertices;
		if (v.length < 12) {
			throw new Error('A shape must have at least 3 vertices.');
		}
		if (close) {
			// Close the shape by adding the first vertex at the end
			v.push(v[0], v[1], v[2], v[3]);
		}
		// Convert the shape to triangles
		let triangles = [];
		for (let i = 4; i < v.length; i += 4) {
			triangles.push(
				v[0], // First vertex
				v[1],
				v[2],
				v[3],
				v[i - 4], // Previous vertex
				v[i - 3],
				v[i - 2],
				v[i - 1],
				v[i], // Current vertex
				v[i + 1],
				v[i + 2],
				v[i + 3]
			);
		}
		shapeVertices = [];

		verticesStack.push(...triangles);
		drawStack.push(0, triangles.length / 4);
	};

	$.triangle = (x1, y1, x2, y2, x3, y3) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.endShape(1);
	};

	$.quad = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.vertex(x4, y4);
		$.endShape(1);
	};

	$.rectMode = (x) => ($._rectMode = x);

	$.rect = (x, y, w, h) => {
		let [l, r, t, b] = $._calcBox(x, y, w, h, $._rectMode);
		let ci, ti;

		if ($._doFill) {
			ci = colorIndex ?? $._fillIndex;
			if ($._matrixDirty) $._saveMatrix();
			ti = $._transformIndex;
			// two triangles make a rectangle
			// prettier-ignore
			verticesStack.push(
				l, t, ci, ti,
				r, t, ci, ti,
				l, b, ci, ti,
				r, t, ci, ti,
				l, b, ci, ti,
				r, b, ci, ti
			);
			drawStack.push(0, 6);
		}

		if ($._doStroke) {
			ci = $._strokeIndex;
			let sw = $._strokeWeight / 2;
			// Outer rectangle coordinates
			let to = t - sw,
				bo = b + sw,
				lo = l - sw,
				ro = r + sw;

			// Inner rectangle coordinates
			let ti = t + sw,
				bi = b - sw,
				li = l + sw,
				ri = r - sw;

			// Create vertices for the stroke as a shape
			// prettier-ignore
			verticesStack.push(
				lo, to, ci, ti, // Top side
				ro, to, ci, ti,
				lo, ti, ci, ti,
				lo, ti, ci, ti,
				ro, to, ci, ti,
				ro, ti, ci, ti,
				ro, to, ci, ti, // right side
				ro, bo, ci, ti,
				ri, to, ci, ti,
				ri, to, ci, ti,
				ro, bo, ci, ti,
				ri, bo, ci, ti,
				ro, bo, ci, ti, // Bottom side
				lo, bo, ci, ti,
				ro, bi, ci, ti,
				ro, bi, ci, ti,
				lo, bo, ci, ti,
				lo, bi, ci, ti,
				lo, bo, ci, ti, // Left side
				lo, to, ci, ti,
				li, bo, ci, ti,
				li, bo, ci, ti,
				lo, to, ci, ti,
				li, to, ci, ti
			);

			drawStack.push(0, 24);
		}
	};

	$.square = (x, y, s) => $.rect(x, y, s, s);

	$.point = (x, y) => {
		colorIndex = $._strokeIndex;
		let sw = $._strokeWeight;
		if (sw < 2) {
			sw = Math.round(sw);
			$.rect(x, y, sw, sw);
		} else $.ellipse(x, y, sw, sw);
		colorIndex = null;
	};

	$.line = (x1, y1, x2, y2) => {
		colorIndex = $._strokeIndex;

		$.push();
		$.translate(x1, y1);
		$.rotate($.atan2(y2 - y1, x2 - x1));
		let length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
		let sw = $._strokeWeight;
		$.rect(0, -sw / 2, length, sw);
		$.pop();

		colorIndex = null;
	};

	$.background = (r, g, b, a) => {
		$.push();
		$.resetMatrix();
		$._doStroke = false;
		if (r.src) {
			let og = $._imageMode;
			$._imageMode = 'corner';
			$.image(r, -c.hw, -c.hh, c.w, c.h);
			$._imageMode = og;
		} else {
			let og = $._rectMode;
			$._rectMode = 'corner';
			$.fill(r, g, b, a);
			$.rect(-c.hw, -c.hh, c.w, c.h);
			$._rectMode = og;
		}
		$.pop();
		if (!$._fillSet) $._fillIndex = 1;
	};

	/**
	 * Derived from: ceil(Math.log(d) * 7) * 2 - ceil(28)
	 * This lookup table is used for better performance.
	 * @param {Number} d diameter of the circle
	 * @returns n number of segments
	 */
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

	$.ellipseMode = (x) => ($._ellipseMode = x);

	$.ellipse = (x, y, w, h) => {
		const n = getArcSegments(w == h ? w : Math.max(w, h));

		let a = Math.max(w, 1) / 2;
		let b = w == h ? a : Math.max(h, 1) / 2;

		let t = 0; // theta
		const angleIncrement = $.TAU / n;
		const ci = colorIndex ?? $._fillIndex;
		if ($._matrixDirty) $._saveMatrix();
		const ti = $._transformIndex;
		let vx1, vy1, vx2, vy2;
		for (let i = 0; i <= n; i++) {
			vx1 = vx2;
			vy1 = vy2;
			vx2 = x + a * Math.cos(t);
			vy2 = y + b * Math.sin(t);
			t += angleIncrement;

			if (i == 0) continue;

			verticesStack.push(x, y, ci, ti, vx1, vy1, ci, ti, vx2, vy2, ci, ti);
		}

		drawStack.push(0, n * 3);
	};

	$.circle = (x, y, d) => $.ellipse(x, y, d, d);

	$._hooks.preRender.push(() => {
		$.pass.setPipeline($._pipelines[0]);

		const vertexBuffer = Q5.device.createBuffer({
			size: verticesStack.length * 4,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		new Float32Array(vertexBuffer.getMappedRange()).set(verticesStack);
		vertexBuffer.unmap();

		$.pass.setVertexBuffer(0, vertexBuffer);
	});

	$._hooks.postRender.push(() => {
		verticesStack.length = 0;
	});
};
