# sombreadores

¡Shaders personalizados escritos en WGSL (WebGPU Shading Language) pueden ser
usados para crear efectos visuales avanzados en q5!

## crearShader

Crea un shader que q5 puede usar para dibujar formas.

Afecta a las siguientes funciones:
`triángulo`, `quad`, `plano`,
`curva`, `bezier`, `empezarForma`/`terminarForma`,
y `fondo` (a menos que se use una imagen).

Usa esta función para personalizar una copia del
[shader de formas por defecto](https://github.com/q5js/q5.js/blob/main/src/shaders/shapes.wgsl).

Para más información sobre los parámetros de entrada de las funciones de vértice y fragmento,
datos, y funciones auxiliares disponibles para usar
en tu código de shader personalizado, lee la página wiki
["Custom Shaders in q5 WebGPU"](https://github.com/q5js/q5.js/wiki/Custom-Shaders-in-q5-WebGPU).

```
@param {string} codigo extracto de código shader WGSL
@returns {GPUShaderModule} un programa shader
```

### webgpu

```js
await crearLienzo(200);

let wobble = crearShader(`
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

q5.dibujar = function () {
	limpiar();
	shader(wobble);
	plano(0, 0, 100);
};
```

```js
await crearLienzo(200);

let stripes = crearShader(`
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let r = cos((q.mouseY + f.position.y) * 0.2);
	return vec4(r, 0.0, 1, 1);
}`);

q5.dibujar = function () {
	shader(stripes);
	triángulo(-50, -50, 0, 50, 50, -50);
};
```

## plano

Un plano es un rectángulo centrado sin trazo.

```
@param {number} x centro x
@param {number} y centro y
@param {number} w ancho o longitud del lado
@param {number} [h] alto
```

### webgpu

```js
await crearLienzo(200);
plano(0, 0, 100);
```

## shader

Aplica un shader.

```
@param {GPUShaderModule} moduloShader un programa shader
```

## reiniciarShader

Hace que q5 use el shader de formas por defecto.

### webgpu

```js
await crearLienzo(200);

let stripes = crearShader(`
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let g = cos((q.mouseY + f.position.y) * 0.05);
	return vec4(1, g, 0, 1);
}`);

q5.dibujar = function () {
	shader(stripes);
	fondo(0);

	reiniciarShader();
	triángulo(-50, -50, 0, 50, 50, -50);
};
```

## reiniciarShaderFotograma

Hace que q5 use el shader de fotograma por defecto.

## reiniciarShaderImagen

Hace que q5 use el shader de imagen por defecto.

## reiniciarShaderVideo

Hace que q5 use el shader de video por defecto.

## reiniciarShaderTexto

Hace que q5 use el shader de texto por defecto.

## reiniciarShaders

Hace que q5 use todos los shaders por defecto.

## crearShaderFotograma

Crea un shader que q5 puede usar para dibujar fotogramas.

`crearLienzo` debe ejecutarse antes de usar esta función.

Usa esta función para personalizar una copia del
[shader de fotograma por defecto](https://github.com/q5js/q5.js/blob/main/src/shaders/frame.wgsl).

### webgpu

```js
await crearLienzo(200);

let boxy = crearShaderFotograma(`
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let x = sin(f.texCoord.y * 4 + q.time * 0.002);
	let y = cos(f.texCoord.x * 4 + q.time * 0.002);
	let uv = f.texCoord + vec2f(x, y);
	return textureSample(tex, samp, uv);
}`);

q5.dibujar = function () {
	trazo(1);
	grosorTrazo(8);
	línea(ratónX, ratónY, pRatónX, pRatónY);
	ratónPresionado ? reiniciarShaders() : shader(boxy);
};
```

## crearShaderImagen

Crea un shader que q5 puede usar para dibujar imágenes.

Usa esta función para personalizar una copia del
[shader de imagen por defecto](https://github.com/q5js/q5.js/blob/main/src/shaders/image.wgsl).

```
@param {string} codigo extracto de código shader WGSL
@returns {GPUShaderModule} un programa shader
```

### webgpu

```js
await crearLienzo(200);
modoImagen(CENTER);

let logo = cargarImagen('/q5js_logo.avif');

let grate = crearShaderImagen(`
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	var texColor = textureSample(tex, samp, f.texCoord);
	texColor.b += (q.mouseX + f.position.x) % 20 / 10;
	return texColor;
}`);

q5.dibujar = function () {
	fondo(0.7);
	shader(grate);
	imagen(logo, 0, 0, 180, 180);
};
```

## crearShaderVideo

Crea un shader que q5 puede usar para dibujar fotogramas de video.

Usa esta función para personalizar una copia del
[shader de video por defecto](https://github.com/q5js/q5.js/blob/main/src/shaders/video.wgsl).

```
@param {string} codigo extracto de código shader WGSL
@returns {GPUShaderModule} un programa shader
```

### webgpu

```js
await crearLienzo(200, 600);

let vid = crearVideo('/assets/apollo4.mp4');
vid.hide();

let flipper = crearShaderVideo(`
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

q5.dibujar = function () {
	limpiar();
	if (ratónPresionado) vid.play();
	shader(flipper);
	imagen(vid, -100, 150, 200, 150);
};
```

## crearShaderTexto

Crea un shader que q5 puede usar para dibujar texto.

Usa esta función para personalizar una copia del
[shader de texto por defecto](https://github.com/q5js/q5.js/blob/main/src/shaders/text.wgsl).

```
@param {string} codigo extracto de código shader WGSL
@returns {GPUShaderModule} un programa shader
```

### webgpu

```js
await crearLienzo(200);
alineaciónTexto(CENTER, CENTER);

let spin = crearShaderTexto(`
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

q5.dibujar = function () {
	limpiar();
	shader(spin);
	relleno(1, 0, 1);
	tamañoTexto(32);
	texto('Hello, World!', 0, 0);
};
```
