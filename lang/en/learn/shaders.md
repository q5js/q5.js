# shaders

Custom shaders written in WGSL (WebGPU Shading Language) can be
used to create advanced visual effects in q5!

## createShader

Creates a shader that q5's WebGPU renderer can use.

If `type` is not specified, this function customizes a copy of the [default shapes shader](https://github.com/q5js/q5.js/blob/main/src/shaders/shapes.wgsl), which affects the following functions:

`triangle`, `quad`, `plane`,
`curve`, `bezier`, `beginShape`/`endShape`,
and `background` (unless an image is used).

For more information on the vertex and fragment function
input parameters, data, and helper functions made available for use
in your custom shader code, read the
["Custom Shaders in q5 WebGPU"](https://github.com/q5js/q5.js/wiki/Custom-Shaders-in-q5-WebGPU)
wiki page.

```
@param {string} code WGSL shader code excerpt
@param {string} [type] defaults to "shapes"
@param {Float32Array} [data] only for use with [fully custom shaders](https://github.com/q5js/q5.js/wiki/Custom-Shaders-in-q5-WebGPU#fully-custom-shaders)
@returns {GPUShaderModule} a shader program
```

### webgpu

```js
await Canvas(200);

let wobble = createShader(`
@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var vert = transformVertex(v.pos, v.matrixIndex);

  let i = f32(v.vertexIndex) % 4 * 100;
  vert.x += cos((q.time + i) * 0.01) * 0.1;

	var f: FragParams;
	f.position = vert;
	f.color = vec4f(1, 0, 0, 1);
	return f;
}`);

q5.draw = function () {
	clear();
	shader(wobble);
	plane(0, 0, 100);
};
```

```js
await Canvas(200);

let stripes = createShader(`
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let r = cos((q.mouseY + f.position.y) * 0.2);
	return vec4(r, 0.0, 1, 1);
}`);

q5.draw = function () {
	shader(stripes);
	triangle(-50, -50, 0, 50, 50, -50);
};
```

## plane

A plane is a centered rectangle with no stroke.

```
@param {number} x center x
@param {number} y center y
@param {number} w width or side length
@param {number} [h] height
```

### webgpu

```js
await Canvas(200);
plane(0, 0, 100);
```

## shader

Applies a shader.

```
@param {GPUShaderModule} shaderModule a shader program
```

## resetShader

Make q5 use the default shapes shader.

### webgpu

```js
await Canvas(200);

let stripes = createShader(`
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let g = cos((q.mouseY + f.position.y) * 0.05);
	return vec4(1, g, 0, 1);
}`);

q5.draw = function () {
	shader(stripes);
	background(0);

	resetShader();
	triangle(-50, -50, 0, 50, 50, -50);
};
```

## resetFrameShader

Make q5 use the default frame shader.

## resetImageShader

Make q5 use the default image shader.

## resetVideoShader

Make q5 use the default video shader.

## resetTextShader

Make q5 use the default text shader.

## resetShaders

Make q5 use all default shaders.

## createFrameShader

Creates a shader that q5 can use to draw frames.

You must create a canvas before using this function.

Use this function to customize a copy of the
[default frame shader](https://github.com/q5js/q5.js/blob/main/src/shaders/frame.wgsl).

### webgpu

```js
await Canvas(200);

let boxy = createFrameShader(`
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let x = sin(f.texCoord.y * 4 + q.time * 0.002);
	let y = cos(f.texCoord.x * 4 + q.time * 0.002);
	let uv = f.texCoord + vec2f(x, y);
	return textureSample(tex, samp, uv);
}`);

q5.draw = function () {
	stroke(1);
	strokeWeight(8);
	line(mouseX, mouseY, pmouseX, pmouseY);
	mouseIsPressed ? resetShaders() : shader(boxy);
};
```

## createImageShader

Creates a shader that q5 can use to draw images.

Use this function to customize a copy of the
[default image shader](https://github.com/q5js/q5.js/blob/main/src/shaders/image.wgsl).

```
@param {string} code WGSL shader code excerpt
@returns {GPUShaderModule} a shader program
```

### webgpu

```js
await Canvas(200);
imageMode(CENTER);

let logo = loadImage('/q5js_logo.avif');

let grate = createImageShader(`
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	var texColor = textureSample(tex, samp, f.texCoord);
	texColor.b += (q.mouseX + f.position.x) % 20 / 10;
	return texColor;
}`);

q5.draw = function () {
	background(0.7);
	shader(grate);
	image(logo, 0, 0, 180, 180);
};
//
```

## createVideoShader

Creates a shader that q5 can use to draw video frames.

Use this function to customize a copy of the
[default video shader](https://github.com/q5js/q5.js/blob/main/src/shaders/video.wgsl).

```
@param {string} code WGSL shader code excerpt
@returns {GPUShaderModule} a shader program
```

### webgpu

```js
await Canvas(200, 600);

let vid = createVideo('/assets/apollo4.mp4');
vid.hide();

let flipper = createVideoShader(`
@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var vert = transformVertex(v.pos, v.matrixIndex);

	var vi = f32(v.vertexIndex);
	vert.y *= cos((q.frameCount + vi * 10) * 0.03);

	var f: FragParams;
	f.position = vert;
	f.texCoord = v.texCoord;
	return f;
}
	
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	var texColor =
		textureSampleBaseClampToEdge(tex, samp, f.texCoord);
	texColor.r = 0;
	texColor.b *= 2;
	return texColor;
}`);

q5.draw = function () {
	clear();
	if (mouseIsPressed) vid.play();
	shader(flipper);
	image(vid, -100, 150, 200, 150);
};
```

## createTextShader

Creates a shader that q5 can use to draw text.

Use this function to customize a copy of the
[default text shader](https://github.com/q5js/q5.js/blob/main/src/shaders/text.wgsl).

```
@param {string} code WGSL shader code excerpt
@returns {GPUShaderModule} a shader program
```

### webgpu

```js
await Canvas(200);
textAlign(CENTER, CENTER);

let spin = createTextShader(`
@vertex
fn vertexMain(v : VertexParams) -> FragParams {
	let char = textChars[v.instanceIndex];
	let text = textMetadata[i32(char.w)];
	let fontChar = fontChars[i32(char.z)];
	let pos = calcPos(v.vertexIndex, char, fontChar, text);

	var vert = transformVertex(pos, text.matrixIndex);

	let i = f32(v.instanceIndex + 1);
	vert.y *= cos((q.frameCount - 5 * i) * 0.05);

	var f : FragParams;
	f.position = vert;
	f.texCoord = calcUV(v.vertexIndex, fontChar);
	f.fillColor = colors[i32(text.fillIndex)];
	f.strokeColor = colors[i32(text.strokeIndex)];
	f.strokeWeight = text.strokeWeight;
	f.edge = text.edge;
	return f;
}`);

q5.draw = function () {
	clear();
	shader(spin);
	fill(1, 0, 1);
	textSize(32);
	text('Hello, World!', 0, 0);
};
```
