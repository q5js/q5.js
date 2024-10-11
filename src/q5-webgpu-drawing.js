Q5.renderers.webgpu.drawing = ($, q) => {
	let c = $.canvas,
		drawStack = $.drawStack,
		vertexStack = new Float32Array(1e7),
		indexStack = new Uint32Array(1e6),
		vertIndex = 0,
		vertCount = 0,
		idxBufferIndex = 0,
		colorIndex;

	let vertexShader = Q5.device.createShaderModule({
		label: 'drawingVertexShader',
		code: `
struct VertexInput {
	@location(0) pos: vec2f,
	@location(1) colorIndex: f32,
	@location(2) transformIndex: f32
}
struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) color: vec4f
}
struct Uniforms {
	halfWidth: f32,
	halfHeight: f32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;

@group(1) @binding(0) var<storage> colors : array<vec4f>;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
	var vert = vec4f(input.pos, 0.0, 1.0);
	vert = transforms[i32(input.transformIndex)] * vert;
	vert.x /= uniforms.halfWidth;
	vert.y /= uniforms.halfHeight;

	var output: VertexOutput;
	output.position = vert;
	output.color = colors[i32(input.colorIndex)];
	return output;
}
`
	});

	let fragmentShader = Q5.device.createShaderModule({
		label: 'drawingFragmentShader',
		code: `
@fragment
fn fragmentMain(@location(0) color: vec4f) -> @location(0) vec4f {
	return color;
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
		primitive: { topology: 'triangle-list' },
		multisample: {
			count: 4
		}
	};

	$._pipelines[0] = Q5.device.createRenderPipeline($._pipelineConfigs[0]);

	const addVert = (x, y, ci, ti) => {
		let v = vertexStack,
			i = vertIndex;
		v[i++] = x;
		v[i++] = y;
		v[i++] = ci;
		v[i++] = ti;
		vertIndex = i;
		vertCount++;
	};

	const addIndex = (i1, i2, i3) => {
		let is = indexStack,
			ii = idxBufferIndex;
		is[ii++] = i1;
		is[ii++] = i2;
		is[ii++] = i3;
		idxBufferIndex = ii;
	};

	const addQuad = (x1, y1, x2, y2, x3, y3, x4, y4, ci, ti) => {
		let v = vertexStack,
			i = vertIndex;

		let i1 = vertCount++;
		v[i++] = x1;
		v[i++] = y1;
		v[i++] = ci;
		v[i++] = ti;

		let i2 = vertCount++;
		v[i++] = x2;
		v[i++] = y2;
		v[i++] = ci;
		v[i++] = ti;

		let i3 = vertCount++;
		v[i++] = x3;
		v[i++] = y3;
		v[i++] = ci;
		v[i++] = ti;

		let i4 = vertCount++;
		v[i++] = x4;
		v[i++] = y4;
		v[i++] = ci;
		v[i++] = ti;

		vertIndex = i;

		let is = indexStack,
			ii = idxBufferIndex;
		is[ii++] = i1;
		is[ii++] = i2;
		is[ii++] = i3;
		is[ii++] = i1;
		is[ii++] = i3;
		is[ii++] = i4;
		idxBufferIndex = ii;

		drawStack.push(0, 6, 4);
	};

	const addEllipse = (x, y, a, b, n, ci, ti) => {
		let t = 0,
			angleIncrement = $.TAU / n,
			indicesStart = vertIndex / 4;
		addVert(x, y, ci, ti); // Center vertex
		for (let i = 0; i <= n; i++) {
			let vx = x + a * Math.cos(t),
				vy = y + b * Math.sin(t);
			addVert(vx, vy, ci, ti);
			if (i > 0) {
				addIndex(indicesStart, indicesStart + i, indicesStart + i + 1);
			}
			t += angleIncrement;
		}
		drawStack.push(0, n * 3, n + 2);
	};

	$.rectMode = (x) => ($._rectMode = x);

	$.rect = (x, y, w, h) => {
		let [l, r, t, b] = $._calcBox(x, y, w, h, $._rectMode);
		let ci, ti;
		if ($._matrixDirty) $._saveMatrix();
		ti = $._transformIndex;

		if ($._doStroke) {
			ci = $._strokeIndex;

			// outer rectangle coordinates
			let sw = $._strokeWeight / 2;
			let to = t + sw,
				bo = b - sw,
				lo = l - sw,
				ro = r + sw;

			// stroke is simply a bigger rectangle drawn first
			addQuad(lo, to, ro, to, ro, bo, lo, bo, ci, ti);

			// inner rectangle coordinates
			t -= sw;
			b += sw;
			l += sw;
			r -= sw;
		}

		if ($._doFill) {
			ci = colorIndex ?? $._fillIndex;

			// two triangles make a rectangle
			addQuad(l, t, r, t, r, b, l, b, ci, ti);
		}
	};

	$.square = (x, y, s) => $.rect(x, y, s, s);

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
		let n = getArcSegments(w == h ? w : Math.max(w, h));
		let a = Math.max(w, 1) / 2;
		let b = w == h ? a : Math.max(h, 1) / 2;
		let ci;
		if ($._matrixDirty) $._saveMatrix();
		let ti = $._transformIndex;
		if ($._doStroke) {
			let sw = $._strokeWeight / 2;
			addEllipse(x, y, a + sw, b + sw, n, $._strokeIndex, ti);
			a -= sw;
			b -= sw;
		}
		if ($._doFill) {
			addEllipse(x, y, a, b, n, colorIndex ?? $._fillIndex, ti);
		}
	};

	$.circle = (x, y, d) => $.ellipse(x, y, d, d);

	$.point = (x, y) => {
		colorIndex = $._strokeIndex;
		$._doStroke = false;
		let sw = $._strokeWeight;
		if (sw < 2) {
			sw = Math.round(sw);
			$.rect(x, y, sw, sw);
		} else $.ellipse(x, y, sw, sw);
		$._doStroke = true;
		colorIndex = null;
	};

	$.line = (x1, y1, x2, y2) => {
		colorIndex = $._strokeIndex;

		$.push();
		$._doStroke = false;
		$.translate(x1, -y1);
		$.rotate($.atan2(y2 - y1, x2 - x1));
		let length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
		let sw = $._strokeWeight,
			hsw = sw / 2;
		$._rectMode = 'corner';
		if (sw < 4) {
			$.rect(-hsw, -hsw, length + hsw, sw);
		} else {
			$._ellipseMode = 'center';
			$.ellipse(0, 0, sw, sw);
			$.ellipse(length, 0, sw, sw);
			$.rect(0, -hsw, length, sw);
		}

		$.pop();

		colorIndex = null;
	};

	let shapeVertCount;

	$.beginShape = () => {
		shapeVertCount = 0;
	};

	$.vertex = (x, y) => {
		if ($._matrixDirty) $._saveMatrix();
		addVert(x, -y, $._fillIndex, $._transformIndex);
		shapeVertCount++;
	};

	$.endShape = (close) => {
		if (shapeVertCount < 3) {
			throw new Error('A shape must have at least 3 vertices.');
		}

		let firstVert = vertCount - shapeVertCount;

		if ($._doFill) {
			// make a simple triangle fan, starting from the first vertex
			for (let i = firstVert + 1; i < vertCount - 1; i++) {
				addIndex(firstVert, i, i + 1);
			}
			drawStack.push(0, (shapeVertCount - 2) * 3, shapeVertCount);
		}

		if ($._doStroke) {
			let first = firstVert * 4,
				last = vertIndex - 4;
			for (let i = first; i < last; i += 4) {
				let x1 = vertexStack[i],
					y1 = vertexStack[i + 1],
					x2 = vertexStack[i + 4],
					y2 = vertexStack[i + 5];
				$.line(x1, y1, x2, y2);
			}
			if (close) {
				let x1 = vertexStack[last],
					y1 = vertexStack[last + 1],
					x2 = vertexStack[first],
					y2 = vertexStack[first + 1];
				$.line(x1, y1, x2, y2);
			}
		}

		shapeVertCount = 0;
	};

	$.triangle = (x1, y1, x2, y2, x3, y3) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.endShape();
	};

	$.quad = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.vertex(x4, y4);
		$.endShape();
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

	$._hooks.preRender.push(() => {
		$.pass.setPipeline($._pipelines[0]);

		let vertexBuffer = Q5.device.createBuffer({
			size: vertIndex * 4,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		new Float32Array(vertexBuffer.getMappedRange()).set(vertexStack.slice(0, vertIndex));
		vertexBuffer.unmap();

		$.pass.setVertexBuffer(0, vertexBuffer);

		let indexBuffer = Q5.device.createBuffer({
			size: idxBufferIndex * 4,
			usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		new Uint32Array(indexBuffer.getMappedRange()).set(indexStack.slice(0, idxBufferIndex));
		indexBuffer.unmap();

		$.pass.setIndexBuffer(indexBuffer, 'uint32');
	});

	$._hooks.postRender.push(() => {
		vertIndex = 0;
		vertCount = 0;
		idxBufferIndex = 0;
	});
};
