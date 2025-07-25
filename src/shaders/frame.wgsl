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
	@builtin(vertex_index) vertexIndex: u32
}
struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) texCoord: vec2f
}

const ndc = array(vec2f(-1,-1), vec2f(1,-1), vec2f(-1,1), vec2f(1,1));
const quad = array(vec2f(0,1), vec2f(1,1), vec2f(0,0), vec2f(1,0));

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var tex: texture_2d<f32>;

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var f: FragParams;
	f.position = vec4f(ndc[v.vertexIndex], 0.0, 1.0);
	f.texCoord = quad[v.vertexIndex];
	return f;
}

@fragment
fn fragMain(f: FragParams ) -> @location(0) vec4f {
	return textureSample(tex, samp, f.texCoord);
}
