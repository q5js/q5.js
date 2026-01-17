// q5.js shader documentation:
// https://github.com/q5js/q5.js/wiki/Custom-Shaders-in-q5-WebGPU

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
	keyIsPressed: f32,
	yUp: f32
}

struct Ellipse {
	center: vec2f,
	size: vec2f,
	startAngle: f32,
	endAngle: f32,
	strokeWeight: f32,
	fillIndex: f32,
	strokeIndex: f32,
	matrixIndex: f32,
	padding0: vec2f,
	padding1: vec4f
};

struct VertexParams {
	@builtin(vertex_index) vertIndex: u32,
	@builtin(instance_index) instIndex: u32
};

struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) outerEdge: vec2f,
	@location(1) fillEdge: vec2f,
	@location(2) innerEdge: vec2f,
	@location(3) strokeWeight: f32,
	@location(4) fill: vec4f,
	@location(5) stroke: vec4f,
	@location(6) blend: vec4f
};

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

@group(1) @binding(0) var<storage, read> ellipses: array<Ellipse>;

const PI = 3.141592653589793;
const segments = 6.0;
const expansion = 1.0 / cos(PI / segments);
const antiAlias = 0.015625; // 1/64
const transparent = vec4f(0.0);

fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
	var vert = vec4f(pos, 0.0, 1.0);
	vert = transforms[i32(matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	return vert;
}

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	let ellipse = ellipses[v.instIndex];
	var pos = ellipse.center;
	var local = vec2f(0.0);
	let start = ellipse.startAngle;
	let end = ellipse.endAngle;
	let arc = end - start;
	let halfStrokeSize = vec2f(ellipse.strokeWeight * 0.5);

	let fanSize = (ellipse.size + halfStrokeSize) * expansion;

	if (v.vertIndex != 0) {
		let theta = start + (f32(v.vertIndex - 1) / segments) * arc;
		local = vec2f(cos(theta), sin(theta));
		pos = ellipse.center + local * fanSize;
	}

	let dist = pos - ellipse.center;

	var f: FragParams;
	f.position = transformVertex(pos, ellipse.matrixIndex);
	f.outerEdge = dist / (ellipse.size + halfStrokeSize);
	f.fillEdge = dist / ellipse.size;
	f.innerEdge = dist / (ellipse.size - halfStrokeSize);
	f.strokeWeight = ellipse.strokeWeight;

	let fill = colors[i32(ellipse.fillIndex)];
	let stroke = colors[i32(ellipse.strokeIndex)];
	f.fill = fill;
	f.stroke = stroke;

	// Source-over blend: stroke over fill (pre-multiplied alpha)
	if (fill.a != 0.0 && stroke.a != 1.0) {
		let outAlpha = stroke.a + fill.a * (1.0 - stroke.a);
		let outColor = stroke.rgb * stroke.a + fill.rgb * fill.a * (1.0 - stroke.a);
		f.blend = vec4f(outColor / max(outAlpha, 1e-5), outAlpha);
	}
	return f;
}

@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let fillEdge = length(f.fillEdge);

	// disable AA for very thin strokes
	let aa = select(antiAlias, 0.0, f.strokeWeight <= 1.0);

	if (f.fill.a != 0.0 && f.strokeWeight == 0.0) {
		if (fillEdge > 1.0) {
			return transparent;
		}
		let fillAlpha = 1.0 - smoothstep(1.0 - aa, 1.0, fillEdge);
		return vec4f(f.fill.rgb, f.fill.a * fillAlpha);
	}

	let innerEdge = length(f.innerEdge);
	
	if (f.fill.a != 0.0 && fillEdge < 1.0) {
		if (innerEdge < 1.0) {
			return f.fill;
		}
		let tInner = smoothstep(1.0, 1.0 + aa, innerEdge);
		let tOuter = smoothstep(1.0 - aa, 1.0, fillEdge);
		if (f.stroke.a != 1.0) {
			let fillBlend = mix(f.fill, f.blend, tInner);
			return mix(fillBlend, f.stroke, tOuter);
		} else {
			let fillBlend = mix(f.fill, f.stroke, tInner);
			return mix(fillBlend, f.stroke, tOuter);
		}
	}
	
	if (innerEdge < 1.0) {
		return transparent;
	}

	let outerEdge = length(f.outerEdge);
	let outerAlpha = 1.0 - smoothstep(1.0 - aa, 1.0, outerEdge);
	let innerAlpha = smoothstep(1.0, 1.0 + aa, innerEdge);
	let strokeAlpha = innerAlpha * outerAlpha;
	return vec4f(f.stroke.rgb, f.stroke.a * strokeAlpha);
}
