# q5.js Source Code

This section contains information about q5's source code for developers who want to contribute to q5.js.

For information about how to use q5, see the [q5.js documentation](https://q5js.org/learn) and the [q5.js wiki pages](https://github.com/q5js/q5.js/wiki).

## Table of Contents

- [q5.js Source Code](#q5js-source-code)
  - [Table of Contents](#table-of-contents)
  - [q5-core](#q5-core)
  - [q5-canvas](#q5-canvas)
  - [q5-c2d-canvas](#q5-c2d-canvas)
  - [q5-c2d-shapes](#q5-c2d-shapes)
  - [q5-c2d-image](#q5-c2d-image)
  - [q5-c2d-soft-filters](#q5-c2d-soft-filters)
  - [q5-c2d-text](#q5-c2d-text)
  - [q5-webgpu](#q5-webgpu)
    - [webgpu-canvas](#webgpu-canvas)
    - [webgpu-shapes](#webgpu-shapes)
    - [webgpu-image](#webgpu-image)
    - [webgpu-text](#webgpu-text)
    - [webgpu-shaders](#webgpu-shaders)
  - [q5-math](#q5-math)
  - [q5-noisier](#q5-noisier)

## q5-core

The core module provides the absolute basic functionality necessary to run q5.

It loads other modules by passing `$` an alias for `this`, which is the q5 instance. `q` in global mode is a proxy for `this` and `window` or `global`, in instance mode it's equivalent to `this`.

Properties on `$` that are prefixed with a `_` are "soft private" props that are accessible to the user and can be used, but are not part of the public API. Mostly these are used by other q5 modules.

## q5-canvas

The canvas module provides shared functionality for all canvas renderers, such as adding the canvas to the DOM, resizing the canvas, setting pixel density.

## q5-c2d-canvas

Adds CanvasRenderingContext2D (aka Canvas2D) rendering support to q5.

All other c2d modules depend on this module.

Though loading q5-color is recommend, it's not required since `fill` and `stroke` can be set to a CSS color string.

## q5-c2d-shapes

Adds Canvas2D shape drawing functions to q5.

## q5-c2d-image

Adds Canvas2D image support to q5.

Image filters use the [CanvasRenderingContext2D.filter](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) property to apply native hardware-accelerated filters to images.

## q5-c2d-soft-filters

Software based image filters, which are slow.

This module includes additional filters and legacy filter support for Safari which lacks hardware-accelerated filters. As of Feb 2025, Safari Technology Preview only supports `ctx.filter` under a flag.

## q5-c2d-text

Adds Canvas2D text rendering support to q5.

Image based features in this module require the q5-c2d-image module.

## q5-webgpu

Adds WebGPU rendering support to q5.

The q5 WebGPU renderer is contained within a single file because using local variables within a single scope is faster than sharing data between scopes via properties on an object. This is tradeoff made with intent to favor performance over modularity and best practices for code organization.

The goal with q5 WebGPU is to push JavaScript to its limits and achieve the best performance possible!

### webgpu-canvas

Just like with the Canvas2D renderer, anything drawn to the q5 WebGPU canvas is permanent, unless cleared or overwritten. Achieving this effect in WebGPU is complicated because the canvas texture can not be read back to the CPU. Two textures are used that can be read from and copied to. Each frame cycle, the previous frame is drawn onto the current frame.

Note that `colorStack` and `transforms` are Float32Arrays which enable faster mapping to GPU buffers at the cost of being harder to work with than JS arrays. These arrays are directly modified for best performance, over using `set`.

### webgpu-shapes

Uses "triangle-strip" primitive topology to render shapes and strokes.

Each vertex of a custom polygon can have its own color, which is interpolated between vertices. This is a simple way to achieve gradients.

Performance is the primary goal of q5 WebGPU, not replicating all the advanced drawing features of Canvas2D or SVG. Achieving similar effects may require using images or image based animations. There are no plans to add support for stroke patterns or different line caps. Also concave shapes can't be drawn as a single custom polygon, instead, they must be broken down into multiple convex polygons.

### webgpu-image

Loads images as a `Q5.Image` object backed by an `HTMLCanvasElement` that use the Canvas2D renderer. When loaded or modified, the image is converted into a GPU texture that can be drawn on the WebGPU canvas. This is a slow process and should be avoided if possible. It'd be better to use WebGPU shaders to filter images.

### webgpu-text

Uses the state of the art MSDF text rendering technique.

### webgpu-shaders

The `plane` function is actually inside the `webgpu-shapes` module. I tried creating an entirely new pipeline just for drawing planes, but I couldn't get it to be any faster than drawing rects with the shapes pipeline. I liked the idea of having a simple function for drawing planes though, in q5 they are centered rectangles with no stroke.

## q5-math

`PerlinNoise` is q5's default noise algorithm. Kevin Perlin won an Academy Award for his work on the original algorithm for the 1982 movie Tron. The JavaScript implementation of it in q5 was authored by Tezumie.

`noiseMode` enables users to switch between noise algorithms, although only "perlin" is included in q5-math.

## q5-noisier

Adds additional noise functions to q5.

`SimplexNoise` is a simplex noise implementation in JavaScript by Tezumie. Kevin Perlin's patent on simplex noise expired in 2022. Simplex noise is slightly faster but arguably less visually appealing than perlin noise.

`BlockyNoise` is similar to p5's default `noise` function, which is not actually perlin noise, despite its claims to be. It looks closer to value noise but is not a standard implementation of that either. When visualized in 2d it's a bit blocky at 1 octave, hence its name in q5. When over 4 octaves are used, it's good at outputting noise from less than 3 inputs, even from a single parameter.
