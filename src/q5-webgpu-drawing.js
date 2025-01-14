Q5.renderers.webgpu.drawing = ($, q) => {
	let c = $.canvas,
		drawStack = $.drawStack,
		vertexStack = new Float32Array(1e7),
		vertIndex = 0;
	const TAU = Math.PI * 2;
	const HALF_PI = Math.PI / 2;

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

	const addArc = (x, y, a, b, startAngle, endAngle, n, ci, ti) => {
		let angleRange = endAngle - startAngle;
		let angleIncrement = angleRange / n;
		let t = startAngle;

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

		vertIndex = i;
		drawStack.push(0, (n + 1) * 2);
	};

	const addArcStroke = (x, y, outerA, outerB, innerA, innerB, startAngle, endAngle, n, ci, ti) => {
		let angleRange = endAngle - startAngle;
		let angleIncrement = angleRange / n;
		let t = startAngle;

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
		drawStack.push(0, (n + 1) * 2);
	};

	$.rectMode = (x) => ($._rectMode = x);

	$.rect = (x, y, w, h, rr = 0) => {
		let [l, r, t, b] = $._calcBox(x, y, w, h, $._rectMode);
		let ci, ti;
		if ($._matrixDirty) $._saveMatrix();
		ti = $._matrixIndex;

		if (!rr) {
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
			return;
		}

		l += rr;
		r -= rr;
		t -= rr;
		b += rr;

		// Clamp radius
		rr = Math.min(rr, Math.min(w, h) / 2);

		let n = getArcSegments(rr * $._scale);

		let trr = t + rr,
			brr = b - rr,
			lrr = l - rr,
			rrr = r + rr;

		if ($._doFill) {
			ci = $._fill;
			// Corner arcs
			addArc(r, b, rr, rr, -HALF_PI, 0, n, ci, ti);
			addArc(l, b, rr, rr, -Math.PI, -HALF_PI, n, ci, ti);
			addArc(l, t, rr, rr, Math.PI, HALF_PI, n, ci, ti);
			addArc(r, t, rr, rr, 0, HALF_PI, n, ci, ti);

			addRect(l, trr, r, trr, r, brr, l, brr, ci, ti); // center
			addRect(l, t, lrr, t, lrr, b, l, b, ci, ti); // Left
			addRect(rrr, t, r, t, r, b, rrr, b, ci, ti); // Right
		}

		if ($._doStroke) {
			ci = $._stroke;
			let hsw = $._hsw;

			let outerA = rr + hsw,
				outerB = rr + hsw,
				innerA = rr - hsw,
				innerB = rr - hsw;
			// Corner arc strokes
			addArcStroke(r, b, outerA, outerB, innerA, innerB, -HALF_PI, 0, n, ci, ti);
			addArcStroke(l, b, outerA, outerB, innerA, innerB, -Math.PI, -HALF_PI, n, ci, ti);
			addArcStroke(l, t, outerA, outerB, innerA, innerB, Math.PI, HALF_PI, n, ci, ti);
			addArcStroke(r, t, outerA, outerB, innerA, innerB, 0, HALF_PI, n, ci, ti);

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

	$._ellipseMode = Q5.CENTER;
	$.ellipseMode = (x) => ($._ellipseMode = x);

	$.ellipse = (x, y, w, h) => {
		let n = getArcSegments(Math.max(Math.abs(w), Math.abs(h)) * $._scale);
		let a = w / 2;
		let b = w == h ? a : h / 2;

		if ($._matrixDirty) $._saveMatrix();
		let ti = $._matrixIndex;

		if ($._doFill) {
			addArc(x, -y, a, b, 0, TAU, n, $._fill, ti);
		}
		if ($._doStroke) {
			let sw = $._strokeWeight / 2;
			// Draw the stroke as a ring using triangle strips
			addArcStroke(x, -y, a + sw, b + sw, a - sw, b - sw, 0, TAU, n, $._stroke, ti);
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
		if ($._ellipseMode == $.CENTER) {
			a = w / 2;
			b = h / 2;
		} else if ($._ellipseMode == $.RADIUS) {
			a = w;
			b = h;
		} else if ($._ellipseMode == $.CORNER) {
			x += w / 2;
			y += h / 2;
			a = w / 2;
			b = h / 2;
		} else if ($._ellipseMode == $.CORNERS) {
			x = (x + w) / 2;
			y = (y + h) / 2;
			a = (w - x) / 2;
			b = (h - y) / 2;
		}

		let ti = $._matrixIndex;
		if ($._matrixDirty) $._saveMatrix();
		let n = getArcSegments(Math.max(Math.abs(w), Math.abs(h)) * $._scale);

		// Draw fill
		if ($._doFill) {
			addArc(x, -y, a, b, start, stop, n, $._fill, ti);
		}

		// Draw stroke
		if ($._doStroke) {
			let sw = $._strokeWeight;
			addArcStroke(x, -y, a + sw, b + sw, a - sw, b - sw, start, stop, n, $._stroke, ti);
		}
	};

	$.point = (x, y) => {
		if ($._matrixDirty) $._saveMatrix();
		let ti = $._matrixIndex,
			ci = $._stroke,
			sw = $._strokeWeight;

		if ($._scaledSW < 2) {
			let [l, r, t, b] = $._calcBox(x, y, sw, sw, 'corner');
			addRect(l, t, r, t, r, b, l, b, ci, ti);
		} else {
			let n = getArcSegments($._scaledSW);
			sw /= 2;
			addArc(x, -y, sw, sw, 0, TAU, n, ci, ti);
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
			hsw = $._hsw;

		// calculate the direction vector and length
		let dx = x2 - x1,
			dy = y2 - y1,
			length = Math.hypot(dx, dy);

		// calculate the perpendicular vector for line thickness
		let px = -(dy / length) * hsw,
			py = (dx / length) * hsw;

		addRect(x1 + px, -y1 - py, x1 - px, -y1 + py, x2 - px, -y2 + py, x2 + px, -y2 - py, ci, ti);

		if ($._scaledSW > 2 && $._strokeJoin != 'none') {
			let n = getArcSegments($._scaledSW);
			addArc(x1, -y1, hsw, hsw, 0, TAU, n, ci, ti);
			addArc(x2, -y2, hsw, hsw, 0, TAU, n, ci, ti);
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

			// calculate catmull-rom spline curve points
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
			let hsw = $._hsw,
				n = getArcSegments($._scaledSW),
				ti = $._matrixIndex,
				ogStrokeJoin = $._strokeJoin;
			$._strokeJoin = 'none';
			// draw lines between vertices
			for (let i = 0; i < shapeVertCount - 1; i++) {
				let v1 = i * 4;
				let v2 = (i + 1) * 4;
				$.line(sv[v1], -sv[v1 + 1], sv[v2], -sv[v2 + 1]);

				addArc(sv[v1], sv[v1 + 1], hsw, hsw, 0, TAU, n, $._stroke, ti);
			}
			if (close) {
				let v1 = (shapeVertCount - 1) * 4;
				let v2 = 0;
				$.line(sv[v1], -sv[v1 + 1], sv[v2], -sv[v2 + 1]);
			}
			$._strokeJoin = ogStrokeJoin;
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
		$.push();
		$.resetMatrix();
		if (r.src) {
			let img = r;
			$._imageMode = 'corner';
			$.image(img, -c.hw, -c.hh, c.w, c.h);
		} else {
			$._rectMode = 'corner';
			$.fill(r, g, b, a);
			$._doStroke = false;
			$.rect(-c.hw, -c.hh, c.w, c.h);
		}
		$.pop();
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
