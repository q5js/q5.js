struct VertexParams {
	@builtin(vertex_index) vertexIndex : u32,
	@location(0) pos: vec2f,
	@location(1) colorIndex: f32,
	@location(2) matrixIndex: f32
}
struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) color: vec4f
}

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
	var vert = vec4f(pos, 0.0, 1.0);
	vert = transforms[i32(matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	return vert;
}

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var vert = transformVertex(v.pos, v.matrixIndex);

	var f: FragParams;
	f.position = vert;
	f.color = colors[i32(v.colorIndex)];
	return f;
}

@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	return f.color;
}
