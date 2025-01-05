Q5.renderers.webgpu.drawing = ($, q) => {
	let c = $.canvas,
		drawStack = $.drawStack,
		vertexStack = new Float32Array(1e7),
		vertIndex = 0;

	let drawingShader = Q5.device.createShaderModule({
		label: 'drawingShader',
		code: `
struct Uniforms {
	halfWidth: f32,
	halfHeight: f32
}
struct VertexParams {
	@location(0) pos: vec2f,
	@location(1) colorIndex: f32,
	@location(2) matrixIndex: f32
}
struct FragmentParams {
	@builtin(position) position: vec4f,
	@location(0) color: vec4f
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

@vertex
fn vertexMain(v: VertexParams) -> FragmentParams {
	var vert = vec4f(v.pos, 0.0, 1.0);
	vert = transforms[i32(v.matrixIndex)] * vert;
	vert.x /= uniforms.halfWidth;
	vert.y /= uniforms.halfHeight;

	var f: FragmentParams;
	f.position = vert;
	f.color = colors[i32(v.colorIndex)];
	return f;
}

@fragment
fn fragmentMain(@location(0) color: vec4f) -> @location(0) vec4f {
	return color;
}
`
	});

	let vertexBufferLayout = {
		arrayStride: 16, // 4 floats * 4 bytes
		attributes: [
			{ format: 'float32x2', offset: 0, shaderLocation: 0 }, // position
			{ format: 'float32', offset: 8, shaderLocation: 1 }, // colorIndex
			{ format: 'float32', offset: 12, shaderLocation: 2 } // matrixIndex
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
			module: drawingShader,
			entryPoint: 'vertexMain',
			buffers: [vertexBufferLayout]
		},
		fragment: {
			module: drawingShader,
			entryPoint: 'fragmentMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs.normal }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
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
	};

	const addRect = (x1, y1, x2, y2, x3, y3, x4, y4, ci, ti) => {
		let v = vertexStack,
			i = vertIndex;

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

		vertIndex = i;
		drawStack.push(0, 4);
	};

	const addEllipse = (x, y, a, b, n, ci, ti) => {
		y = -y;
		let t = 0,
			angleIncrement = $.TAU / n;

		let v = vertexStack,
			i = vertIndex;

		for (let j = 0; j <= n; j++) {
			// add center vertex
			v[i++] = x;
			v[i++] = y;
			v[i++] = ci;
			v[i++] = ti;

			// calculate perimeter vertex
			let vx = x + a * Math.cos(t);
			let vy = y + b * Math.sin(t);

			// add perimeter vertex
			v[i++] = vx;
			v[i++] = vy;
			v[i++] = ci;
			v[i++] = ti;

			t += angleIncrement;
		}

		// close the triangle strip
		// add center vertex
		v[i++] = x;
		v[i++] = y;
		v[i++] = ci;
		v[i++] = ti;

		// add first perimeter vertex
		v[i++] = x + a;
		v[i++] = y;
		v[i++] = ci;
		v[i++] = ti;

		vertIndex = i;
		drawStack.push(0, (n + 1) * 2 + 2);
	};

	const addEllipseStroke = (x, y, outerA, outerB, innerA, innerB, n, ci, ti) => {
		y = -y;
		let angleIncrement = $.TAU / n;
		let t = 0;

		let v = vertexStack,
			i = vertIndex;

		for (let j = 0; j <= n; j++) {
			// Outer vertex
			let vxOuter = x + outerA * Math.cos(t);
			let vyOuter = y + outerB * Math.sin(t);

			// Inner vertex
			let vxInner = x + innerA * Math.cos(t);
			let vyInner = y + innerB * Math.sin(t);

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

		vertIndex = i;
		drawStack.push(0, (n + 1) * 2); // Use triangle strip
	};

	$.rectMode = (x) => ($._rectMode = x);

	$.rect = (x, y, w, h) => {
		let [l, r, t, b] = $._calcBox(x, y, w, h, $._rectMode);
		let ci, ti;
		if ($._matrixDirty) $._saveMatrix();
		ti = $._matrixIndex;

		if ($._doFill) {
			ci = $._fill;
			addRect(l, t, r, t, r, b, l, b, ci, ti);
		}

		if ($._doStroke) {
			ci = $._stroke;
			let sw = $._strokeWeight / 2;

			// Calculate stroke positions
			let lsw = l - sw,
				rsw = r + sw,
				tsw = t + sw,
				bsw = b - sw,
				lpsw = l + sw,
				rpsw = r - sw,
				tpsw = t - sw,
				bpsw = b + sw;

			addRect(lsw, tpsw, rsw, tpsw, rsw, tsw, lsw, tsw, ci, ti); // Top
			addRect(lsw, bsw, rsw, bsw, rsw, bpsw, lsw, bpsw, ci, ti); // Bottom

			// Adjust side strokes to avoid overlapping corners
			tsw = t - sw;
			bsw = b + sw;

			addRect(lsw, tsw, lpsw, tsw, lpsw, bsw, lsw, bsw, ci, ti); // Left
			addRect(rpsw, tsw, rsw, tsw, rsw, bsw, rpsw, bsw, ci, ti); // Right
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
		let n = getArcSegments(Math.max(Math.abs(w), Math.abs(h)) * $._scale);
		let a = w / 2;
		let b = w == h ? a : h / 2;

		if ($._matrixDirty) $._saveMatrix();
		let ti = $._matrixIndex;

		if ($._doFill) {
			addEllipse(x, y, a, b, n, $._fill, ti);
		}
		if ($._doStroke) {
			let sw = $._strokeWeight / 2;
			// Draw the stroke as a ring using triangle strips
			addEllipseStroke(x, y, a + sw, b + sw, a - sw, b - sw, n, $._stroke, ti);
		}
	};

	$.circle = (x, y, d) => $.ellipse(x, y, d, d);

	$.point = (x, y) => {
		if ($._matrixDirty) $._saveMatrix();
		let ti = $._matrixIndex,
			ci = $._stroke,
			sw = $._strokeWeight;

		if (sw < 2) {
			let [l, r, t, b] = $._calcBox(x, y, sw, sw, 'corner');
			addRect(l, t, r, t, r, b, l, b, ci, ti);
		} else {
			let n = getArcSegments(sw);
			sw /= 2;
			addEllipse(x, y, sw, sw, n, ci, ti);
		}
	};

	$._strokeJoin = 'round';

	$.strokeJoin = (x) => {
		$._strokeJoin = x;
	};

	$.line = (x1, y1, x2, y2) => {
		if ($._matrixDirty) $._saveMatrix();
		let ti = $._matrixIndex,
			ci = $._stroke,
			sw = $._strokeWeight,
			hsw = sw / 2;

		// calculate the direction vector and length
		let dx = x2 - x1,
			dy = y2 - y1,
			length = Math.hypot(dx, dy);

		// calculate the perpendicular vector for line thickness
		let px = -(dy / length) * hsw,
			py = (dx / length) * hsw;

		addRect(x1 + px, -y1 - py, x1 - px, -y1 + py, x2 - px, -y2 + py, x2 + px, -y2 - py, ci, ti);

		if (sw > 2 && $._strokeJoin != 'none') {
			let n = getArcSegments(sw);
			addEllipse(x1, y1, hsw, hsw, n, ci, ti);
			addEllipse(x2, y2, hsw, hsw, n, ci, ti);
		}
	};

	let shapeVertCount;
	let sv = []; // shape vertices
	let curveVertices = []; // curve vertices

	$.beginShape = () => {
		shapeVertCount = 0;
		sv = [];
		curveVertices = [];
	};

	$.vertex = (x, y) => {
		if ($._matrixDirty) $._saveMatrix();
		sv.push(x, -y, $._fill, $._matrixIndex);
		shapeVertCount++;
	};

	$.curveVertex = (x, y) => {
		if ($._matrixDirty) $._saveMatrix();
		curveVertices.push({ x: x, y: -y });
	};

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

			for (let i = 0; i < points.length - 3; i++) {
				let p0 = points[i];
				let p1 = points[i + 1];
				let p2 = points[i + 2];
				let p3 = points[i + 3];

				for (let t = 0; t <= 1; t += 0.1) {
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

					sv.push(x, y, $._fill, $._matrixIndex);
					shapeVertCount++;
				}
			}
		}

		if (shapeVertCount < 3) {
			throw new Error('A shape must have at least 3 vertices.');
		}

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

		if ($._doFill) {
			if (shapeVertCount == 5) {
				// for quads, draw two triangles
				addVert(sv[0], sv[1], sv[2], sv[3]); // v0
				addVert(sv[4], sv[5], sv[6], sv[7]); // v1
				addVert(sv[12], sv[13], sv[14], sv[15]); // v3
				addVert(sv[8], sv[9], sv[10], sv[11]); // v2
				drawStack.push(0, 4);
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
				drawStack.push(0, (shapeVertCount - 2) * 3);
			}
		}

		if ($._doStroke) {
			// draw lines between vertices
			for (let i = 0; i < shapeVertCount - 1; i++) {
				let v1 = i * 4;
				let v2 = (i + 1) * 4;
				$.line(sv[v1], -sv[v1 + 1], sv[v2], -sv[v2 + 1]);
			}
			if (close) {
				let v1 = (shapeVertCount - 1) * 4;
				let v2 = 0;
				$.line(sv[v1], -sv[v1 + 1], sv[v2], -sv[v2 + 1]);
			}
		}

		// reset for the next shape
		shapeVertCount = 0;
		sv = [];
		curveVertices = [];
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

	$.background = (r, g, b, a) => {
		let mi = $._matrixIndex;
		$._matrixIndex = 0;
		$._doStroke = false;
		if (r.src) {
			let img = r;
			let im = $._imageMode;
			$._imageMode = 'corner';
			$.image(img, -c.hw, -c.hh, c.w, c.h);
			$._imageMode = im;
		} else {
			let rm = $._rectMode;
			$._rectMode = 'corner';
			let fill = $._fill;
			$.fill(r, g, b, a);
			$.rect(-c.hw, -c.hh, c.w, c.h);
			$._rectMode = rm;
			$._fill = fill;
		}
		$._doStroke = true;
		$._matrixIndex = mi;
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
	});

	$._hooks.postRender.push(() => {
		drawStack = $.drawStack;
		vertIndex = 0;
	});
};
