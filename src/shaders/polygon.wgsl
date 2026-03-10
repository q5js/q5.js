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

struct VertexParams {
	@builtin(vertex_index) vertexIndex : u32,
	@location(0) pos: vec2f,
	@location(1) polyStart: f32,
	@location(2) polyCount: f32,
	@location(3) fillIndex: f32,
	@location(4) strokeIndex: f32,
	@location(5) strokeWeight: f32,
	@location(6) matrixIndex: f32
}

struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) localPos: vec2f,
	@location(1) @interpolate(flat) polyStart: u32,
	@location(2) @interpolate(flat) polyCount: u32,
	@location(3) @interpolate(flat) fillIndex: f32,
	@location(4) @interpolate(flat) strokeIndex: f32,
	@location(5) @interpolate(flat) strokeWeight: f32,
	@location(6) @interpolate(flat) isClosed: f32
}

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

@group(1) @binding(0) var<storage, read> polyPts: array<vec4f>;

fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
	var vert = vec4f(pos, 0.0, 1.0);
	vert = transforms[i32(matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	return vert;
}

fn getPolyColor(p: vec2f, start: u32, count: u32, fIdx: f32) -> vec4f {
	let uniformColor = colors[i32(fIdx)];
	if (uniformColor.a == 0.0) {
		return uniformColor;
	}

	var sumWeight: f32 = 0.0;
	var sumColor = vec4f(0.0);
	for (var i: u32 = 0u; i < count; i = i + 1u) {
		let pt = polyPts[start + i];
		let d = distance(p, pt.xy);
		if (d < 0.1) {
			return colors[i32(pt.z)];
		}
		let w = 1.0 / (d * d * d);
		sumWeight += w;
		sumColor += colors[i32(pt.z)] * w;
	}
	return sumColor / sumWeight;
}

fn sdPolygon(p: vec2f, start: u32, count: u32, isClosed: f32) -> f32 {
	var d: f32 = dot(p - polyPts[start].xy, p - polyPts[start].xy);
	var s: f32 = 1.0;
	var j: u32 = count - 1u;
	for (var i: u32 = 0u; i < count; i = i + 1u) {
		let vi = polyPts[start + i].xy;
		let vj = polyPts[start + j].xy;
		let e = vj - vi;
		let w = p - vi;
		let b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
		let bSq = dot(b, b);
		if (isClosed != 0.0 || i != 0u) {
			if (bSq < d) { d = bSq; }
		}
		
		let condX = p.y >= vi.y;
		let condY = p.y < vj.y;
		let condZ = e.x * w.y > e.y * w.x;
		if ((condX && condY && condZ) || (!condX && !condY && !condZ)) {
			s = -s;
		}
		j = i;
	}
	if (isClosed == 0.0) {
		return sqrt(d);
	}
	return s * sqrt(d);
}

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var f: FragParams;
	
	// manually apply transform
	var vert = vec4f(v.pos, 0.0, 1.0);
	vert = transforms[i32(v.matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	
	f.position = vert;
	f.localPos = v.pos;
	f.polyStart = u32(v.polyStart + 0.1);
	f.polyCount = u32(abs(v.polyCount) + 0.1);
	f.isClosed = step(0.0, v.polyCount);
	f.fillIndex = v.fillIndex;
	f.strokeIndex = v.strokeIndex;
	f.strokeWeight = v.strokeWeight;
	return f;
}

@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let dist = sdPolygon(f.localPos, f.polyStart, f.polyCount, f.isClosed);
	let fill = getPolyColor(f.localPos, f.polyStart, f.polyCount, f.fillIndex);
	let stroke = colors[i32(f.strokeIndex)];
	
	let dpdx_d = dpdx(dist);
	let dpdy_d = dpdy(dist);
	let distGrad = sqrt(dpdx_d * dpdx_d + dpdy_d * dpdy_d);
	let aa = clamp(distGrad * 1.5, 0.001, 2.0);
	
	let halfStroke = f.strokeWeight * 0.5;
	
	var outFragColor: vec4f;

	if (fill.a != 0.0 && f.strokeWeight == 0.0) {
		let fillAlpha = 1.0 - smoothstep(-aa, aa, dist);
		if (fillAlpha <= 0.0) { discard; }
		outFragColor = vec4f(fill.rgb, fill.a * fillAlpha);
	} else if (fill.a != 0.0) {
		let fillAlpha = 1.0 - smoothstep(-aa, aa, dist);
		let strokeDist = abs(dist) - halfStroke;
		let strokeAlphaMask = 1.0 - smoothstep(-aa, aa, strokeDist);
		
		if (fillAlpha <= 0.0 && strokeAlphaMask <= 0.0) { discard; }
		
		let sA = stroke.a * strokeAlphaMask;
		let fA = fill.a * fillAlpha;
		let outAlpha = sA + fA * (1.0 - sA);
		let outCol = stroke.rgb * sA + fill.rgb * fA * (1.0 - sA);
		outFragColor = vec4f(outCol / max(outAlpha, 1e-5), outAlpha);
	} else {
		let strokeDist = abs(dist) - halfStroke;
		let strokeAlpha = 1.0 - smoothstep(-aa, aa, strokeDist);
		
		if (strokeAlpha <= 0.0) { discard; }
		outFragColor = vec4f(stroke.rgb, stroke.a * strokeAlpha);
	}
	return outFragColor;
}
