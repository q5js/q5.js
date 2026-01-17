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

struct Rect {
	center: vec2f,
	extents: vec2f,
	roundedRadius: f32,
	strokeWeight: f32,
	fillIndex: f32,
	strokeIndex: f32,
	matrixIndex: f32,
	padding0: f32, // can't use vec3f for alignment
	padding1: vec2f,
	padding2: vec4f
};

struct VertexParams {
	@builtin(vertex_index) vertIndex: u32,
	@builtin(instance_index) instIndex: u32
};

struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) local: vec2f,
	@location(1) extents: vec2f,
	@location(2) roundedRadius: f32,
	@location(3) strokeWeight: f32,
	@location(4) fill: vec4f,
	@location(5) stroke: vec4f,
	@location(6) blend: vec4f
};

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

@group(1) @binding(0) var<storage, read> rects: array<Rect>;

const quad = array(
	vec2f(-1.0, -1.0),
	vec2f( 1.0, -1.0),
	vec2f(-1.0,  1.0),
	vec2f( 1.0,  1.0)
);
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
	let rect = rects[v.instIndex];

	let halfStrokeSize = vec2f(rect.strokeWeight * 0.5);
	let quadSize = rect.extents + halfStrokeSize;
	let pos = (quad[v.vertIndex] * quadSize) + rect.center;

	let local = pos - rect.center;

	var f: FragParams;
	f.position = transformVertex(pos, rect.matrixIndex);

	f.local = local;
	f.extents = rect.extents;
	f.roundedRadius = rect.roundedRadius;
	f.strokeWeight = rect.strokeWeight;

	let fill = colors[i32(rect.fillIndex)];
	let stroke = colors[i32(rect.strokeIndex)];
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

fn sdRoundRect(p: vec2f, extents: vec2f, radius: f32) -> f32 {
	let q = abs(p) - extents + vec2f(radius);
	return length(max(q, vec2f(0.0))) - radius + min(max(q.x, q.y), 0.0);
}

@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let dist = select(
		max(abs(f.local.x) - f.extents.x, abs(f.local.y) - f.extents.y), // sharp
		sdRoundRect(f.local, f.extents, f.roundedRadius),                  // rounded
		f.roundedRadius > 0.0
	);

	// fill only
	if (f.fill.a != 0.0 && f.strokeWeight == 0.0) {
		if (dist <= 0.0) {
			return f.fill;
		}
		return transparent;
	}

	let halfStroke = f.strokeWeight * 0.5;
	let inner = dist + halfStroke;

	if (f.fill.a != 0.0) {
		if (inner <= 0.0) {
			return f.fill;
		}
		if (dist <= 0.0 && f.stroke.a != 1.0) {
			return f.blend;
		}
	}

	let outer = dist - halfStroke;

	if (outer <= 0.0 && inner >= 0.0) {
		return f.stroke;
	}

	return transparent;
}
