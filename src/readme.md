# Modular Use

To use q5 modules, "q5.js" (the default bundle) or the "q5-core.js" module must be loaded first!

```html
<script src="https://q5js.org/src/q5-core.js"></script>
```

These modules are included in the default "q5.js" bundle:

```html
<script src="https://q5js.org/src/q5-2d-canvas.js"></script>
<script src="https://q5js.org/src/q5-2d-drawing.js"></script>
<script src="https://q5js.org/src/q5-2d-image.js"></script>
<script src="https://q5js.org/src/q5-2d-soft-filters.js"></script>
<script src="https://q5js.org/src/q5-2d-text.js"></script>
<script src="https://q5js.org/src/q5-ai.js"></script>
<script src="https://q5js.org/src/q5-color.js"></script>
<script src="https://q5js.org/src/q5-display.js"></script>
<script src="https://q5js.org/src/q5-input.js"></script>
<script src="https://q5js.org/src/q5-math.js"></script>
<script src="https://q5js.org/src/q5-sound.js"></script>
<script src="https://q5js.org/src/q5-util.js"></script>
<script src="https://q5js.org/src/q5-vector.js"></script>
```

Additional modules:

```html
<script src="https://q5js.org/src/q5-dom.js"></script>
<script src="https://q5js.org/src/q5-noisier.js"></script>
<script src="https://q5js.org/src/q5-sensors.js"></script>
```

WebGPU rendering modules are in development:

```html
<script src="https://q5js.org/src/q5-webgpu-canvas.js"></script>
<script src="https://q5js.org/src/q5-webgpu-drawing.js"></script>
```

# Module Info

- [Modular Use](#modular-use)
- [Module Info](#module-info)
  - [core](#core)
  - [canvas](#canvas)
  - [q2d-canvas](#q2d-canvas)
  - [q2d-drawing](#q2d-drawing)
  - [q2d-image](#q2d-image)
  - [q2d-soft-filters](#q2d-soft-filters)
  - [q2d-text](#q2d-text)
  - [webgpu-canvas](#webgpu-canvas)
  - [webgpu-drawing](#webgpu-drawing)
  - [math](#math)
  - [noisier](#noisier)

## core

The core module provides the absolute basic functionality necessary to run q5.

It loads other modules by passing `$` (alias for `this`) and `q` (which in global mode is a proxy for `this` and `window` or `global`).

## canvas

The canvas module provides shared functionality for all canvas renderers, such as adding the canvas to the DOM, resizing the canvas, setting pixel density,

## q2d-canvas

Adds canvas 2D rendering support to q5.

All other 2D modules depend on this module.

## q2d-drawing

Adds canvas 2D drawing functions to q5.

Though loading q5-color is recommend, it's not required since `fill` and `stroke` can be set to a CSS color string.

## q2d-image

Adds canvas 2D image support to q5.

The filters in q5-image use the [CanvasRenderingContext2D.filter](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) property to apply native hardware-accelerated filters to images.

## q2d-soft-filters

Software implementation of image filters.

This module includes additional filters not implemented in q5-image and legacy filter support for Safari which lacks `ctx.filter`.

These filters are slow. Real-time use of them is not recommended.

As of April 2024, Safari Technology Preview supports `ctx.filter` under a flag. Hopefully in the near future this module can be omitted from the default bundle.

## q2d-text

Adds canvas 2D text rendering support to q5.

Image based features in this module require the q5-2d-image module.

`createTextImage(str, w, h)` provides a simple way for users to create images from text.

`textImage(img, x, y)` displays text images, complying with the user's text position settings instead of their image position settings. The idea is that text will appear in the same place as it would if it were drawn with the `text` function.

`textCache(bool, maxSize)` enables or disables text caching. As of June 2024, drawing rotated text is super slow in all browsers, so q5 creates and stores images of text and rotates that instead. Can improve rendering performance 90x but uses more memory. `maxSize` param determines the maximum number of text images to cache, default is 500 since these images will typically be quite small. The text image cache (tic) is a timed cache, so the oldest images are removed first.

## webgpu-canvas

> ⚠️ Experimental features! ⚠️

To use q5's WebGPU renderer, run `Q5.webgpu()` at the top of your sketch. Explicit use of `createCanvas` is required.

```js
Q5.webgpu();

function setup() {
	createCanvas(200, 200);
	noStroke();
}

function draw() {
	clear();
	rect(50, 50, 100, 100);
}
```

For now, be sure to set `noStroke` in your setup code and `clear` the canvas at the start of your `draw` function to match current q5 webgpu limitations.

The sketches you create with the q5-webgpu renderer will still display properly if WebGPU is not supported on a viewer's browser. q5 will put a warning in the console and fall back to the q2d renderer. A compatibility layer is applied which sets the color mode to "rgba" in float format and translates the origin to the center of the canvas on every frame.

Use of top level global mode with the WebGPU renderer requires that you make your sketch file a js module and await the `Q5.webgpu()` function.

```html
<script type="module" src="sketch.js">
```

```js
let q = await Q5.webgpu();

createCanvas(200, 200);
noStroke();

q.draw = () => {
	clear();
	rect(50, 50, 100, 100);
};
```

Implemented functions:

`createCanvas`, `resizeCanvas`, `fill`, `clear`, `push`, `pop`, `resetMatrix`, `translate`, `rotate`, `scale`

## webgpu-drawing

> Uses `colorMode('rgb', 'float')` by default. Changing it to 'oklch' is not supported yet for the webgpu renderer.

All basic shapes are drawn from their center. Strokes are not implemented yet.

q5's WebGPU renderer drawing functions like `rect` don't immediately draw on the canvas. Instead, they prepare vertex and color data to be sent to the GPU in bulk, which occurs after the user's `draw` function and any post-draw functions are run. This approach better utilizes the GPU, so it doesn't have to repeatedly wait for the CPU to send small chunks of data that describe each individual shape. It's why WebGPU is faster than Canvas2D.

Implemented functions:

`rect`, `circle`, `ellipse`, `triangle`, `beginShape`, `vertex`, `endShape`, `blendMode`

## math

`PerlinNoise` is q5's default noise algorithm. Kevin Perlin won an Academy Award for his work on the original algorithm for the 1982 movie Tron. The JavaScript implementation of it in q5 was authored by Tezumie.

`noiseMode` enables users to switch between noise algorithms, although only "perlin" is included in q5-math.

## noisier

Adds additional noise functions to q5.

`SimplexNoise` is a simplex noise implementation in JavaScript by Tezumie. Kevin Perlin's patent on simplex noise expired in 2022. Simplex noise is slightly faster but arguably less visually appealing than perlin noise.

`BlockyNoise` is similar to p5's default `noise` function, which is a bit notorious in the gen art community for not actually being perlin noise, despite its claims to be. It looks closer to value noise but is not a standard implementation of that either. When visualized in 2d it's a bit blocky at 1 octave, hence the name.
