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
	keyIsPressed: f32
}
struct VertexParams {
	@builtin(vertex_index) vertexIndex : u32,
	@location(0) pos: vec2f,
	@location(1) texCoord: vec2f,
	@location(2) tintIndex: f32,
	@location(3) matrixIndex: f32,
	@location(4) imageAlpha: f32
}
struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) texCoord: vec2f,
	@location(1) tintColor: vec4f,
	@location(2) imageAlpha: f32
}

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

@group(1) @binding(0) var samp: sampler;
@group(1) @binding(1) var tex: texture_2d<f32>;

fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
	var vert = vec4f(pos, 0.0, 1.0);
	vert = transforms[i32(matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	return vert;
}

fn applyTint(texColor: vec4f, tintColor: vec4f) -> vec4f {
	// apply the tint color to the sampled texture color at full strength
	let tinted = vec4f(texColor.rgb * tintColor.rgb, texColor.a);
	// mix in the tint using the tint alpha as the blend strength
	return mix(texColor, tinted, tintColor.a);
}

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var vert = transformVertex(v.pos, v.matrixIndex);

	var f: FragParams;
	f.position = vert;
	f.texCoord = v.texCoord;
	f.tintColor = colors[i32(v.tintIndex)];
	f.imageAlpha = v.imageAlpha;
	return f;
}

@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	var texColor = textureSample(tex, samp, f.texCoord);
	texColor.a *= f.imageAlpha;
	return applyTint(texColor, f.tintColor);
}
