# q5.js Modular Use

For ES6 modular use, the "q5-core.js" module must be loaded first, which adds `Q5` to the global scope.

```js
import 'https://q5js.org/src/q5-core.js';
```

These modules are included in the default "q5.js" bundle:

```js
import 'https://q5js.org/src/q5-core.js';
import 'https://q5js.org/src/q5-canvas.js';

import 'https://q5js.org/src/q5-2d-canvas.js';
import 'https://q5js.org/src/q5-2d-drawing.js';
import 'https://q5js.org/src/q5-2d-image.js';
import 'https://q5js.org/src/q5-2d-soft-filters.js';
import 'https://q5js.org/src/q5-2d-text.js';

import 'https://q5js.org/src/q5-ai.js';
import 'https://q5js.org/src/q5-color.js';
import 'https://q5js.org/src/q5-display.js';
import 'https://q5js.org/src/q5-input.js';
import 'https://q5js.org/src/q5-math.js';
import 'https://q5js.org/src/q5-sound.js';
import 'https://q5js.org/src/q5-util.js';
import 'https://q5js.org/src/q5-vector.js';

import 'https://q5js.org/src/q5-webgpu-canvas.js';
import 'https://q5js.org/src/q5-webgpu-drawing.js';
import 'https://q5js.org/src/q5-webgpu-image.js';
import 'https://q5js.org/src/q5-webgpu-text.js';
```

Additional modules:

```js
import 'https://q5js.org/src/q5-dom.js';
import 'https://q5js.org/src/q5-noisier.js';
import 'https://q5js.org/src/q5-sensors.js';
```

# q5.js Source Code

This section contains information about q5's source code for developers who want to contribute to q5.js.

- [q5.js Modular Use](#q5js-modular-use)
- [q5.js Source Code](#q5js-source-code)
  - [q5-core](#q5-core)
  - [q5-canvas](#q5-canvas)
  - [c2d-canvas](#c2d-canvas)
  - [c2d-drawing](#c2d-drawing)
  - [c2d-image](#c2d-image)
  - [c2d-soft-filters](#c2d-soft-filters)
  - [c2d-text](#c2d-text)
  - [webgpu-canvas](#webgpu-canvas)
  - [webgpu-drawing](#webgpu-drawing)
  - [webgpu-image](#webgpu-image)
  - [webgpu-text](#webgpu-text)
  - [math](#math)
  - [noisier](#noisier)

## q5-core

The core module provides the absolute basic functionality necessary to run q5.

It loads other modules by passing `$` (alias for `this`) and `q` (which in global mode is a proxy for `this` and `window` or `global`).

## q5-canvas

The canvas module provides shared functionality for all canvas renderers, such as adding the canvas to the DOM, resizing the canvas, setting pixel density.

## c2d-canvas

Adds CanvasRenderingContext2D (aka Canvas2D) rendering support to q5.

All other c2d modules depend on this module.

Though loading q5-color is recommend, it's not required since `fill` and `stroke` can be set to a CSS color string.

## c2d-drawing

Adds Canvas2D drawing functions to q5.

## c2d-image

Adds Canvas2D image support to q5.

Image filters use the [CanvasRenderingContext2D.filter](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) property to apply native hardware-accelerated filters to images.

## c2d-soft-filters

Software based image filters, which are slow.

This module includes additional filters and legacy filter support for Safari which lacks hardware-accelerated filters. As of Feb 2025, Safari Technology Preview only supports `ctx.filter` under a flag.

## c2d-text

Adds Canvas2D text rendering support to q5.

Image based features in this module require the q5-c2d-image module.

## webgpu-canvas

Adds WebGPU rendering support to q5.

Just like with the Canvas2D renderer, anything drawn to the q5 WebGPU canvas is permanent, unless cleared or overwritten. Achieving this effect in WebGPU is complicated because the canvas texture can not be read back to the CPU. Two textures are used that can be read and copied. One is for rendering and one stores the previous frame. Each frame cycle, the previous frame is drawn onto the current frame, which is how the drawing permanence effect is achieved.

Note that `colorStack` and `transforms` are Float32Arrays which enable faster mapping to GPU buffers at the cost of being harder to work with than JS arrays. These arrays are directly modified for best performance, over using `set`.

## webgpu-drawing

Uses "triangle-strip" primitive topology to render shapes and strokes.

Each vertex of a custom polygon can have its own color, which is interpolated between vertices. This is a simple way to achieve gradients.

Performance is the primary goal of q5 WebGPU, not replicating all the advanced drawing features of Canvas2D or SVG. Achieving similar effects may require using images or image based animations. There are no plans to add support for stroke patterns or different line caps. Also concave shapes can't be drawn as a single custom polygon, instead, they must be broken down into multiple convex polygons.

## webgpu-image

Loads images as a `Q5.Image` object backed by an `HTMLCanvasElement` that use the Canvas2D renderer. When loaded or modified, the image is converted into a GPU texture that can be drawn on the WebGPU canvas. This is a slow process and should be avoided if possible. It would probably be better to use WebGPU shaders to filter images.

## webgpu-text

Uses the state of the art MSDF text rendering technique.

## math

`PerlinNoise` is q5's default noise algorithm. Kevin Perlin won an Academy Award for his work on the original algorithm for the 1982 movie Tron. The JavaScript implementation of it in q5 was authored by Tezumie.

`noiseMode` enables users to switch between noise algorithms, although only "perlin" is included in q5-math.

## noisier

Adds additional noise functions to q5.

`SimplexNoise` is a simplex noise implementation in JavaScript by Tezumie. Kevin Perlin's patent on simplex noise expired in 2022. Simplex noise is slightly faster but arguably less visually appealing than perlin noise.

`BlockyNoise` is similar to p5's default `noise` function, which is not actually perlin noise, despite its claims to be. It looks closer to value noise but is not a standard implementation of that either. When visualized in 2d it's a bit blocky at 1 octave, hence its name in q5. When over 4 octaves are used, it's good at outputting noise from less than 3 inputs, even from a single parameter.
