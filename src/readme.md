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

# Module Info

## core

The core module provides the absolute basic functionality necessary to run q5.

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

This module includes additional filters not implemented in q5-image and legacy filter support for Safari which lacks ctx.filter.

These filters are slow, real-time use of them is not recommended.

As of April 2024, Safari Technology Preview supports ctx.filter under a flag. Hopefully in the near future mainline Safari will support ctx.filter and this module can be omitted from the default bundle.

## q2d-text

Adds canvas 2D text rendering support to q5.

`createTextImage(str, w, h)` provides a simple way for users to create images from text.

`textImage(img, x, y)` displays text images, complying with the user's text position settings instead of their image position settings. The idea is that text will appear in the same place as it would if it were drawn with the `text` function.

`textCache(bool, maxSize)` enables or disables text caching. As of June 2024, drawing rotated text is super slow in all browsers, so q5 creates and stores images of text and rotates that instead. Can improve rendering performance 90x but uses more memory. `maxSize` param determines the maximum number of text images to cache, default is 500 since these images will typically be quite small. The text image cache (tic) is a timed cache, so the oldest images are removed first.

Of course, use of these image based features requires the q5-2d-image module.

## math

`PerlinNoise` is q5's default noise algorithm. Kevin Perlin won an Academy Award for his work on the original algorithm for the 1982 movie Tron. q5's JavaScript implementation was authored by Tezumie.

`noiseMode` enables users to switch between noise algorithms, although only "perlin" is included in q5-math.

## noisier

Adds additional noise functions to q5.

`SimplexNoise` is a simplex noise implementation in JavaScript by Tezumie. Kevin Perlin's patent on simplex noise expired in 2022. Simplex noise is slightly faster but arguably less visually appealing than perlin noise.

`BlockyNoise` is similar to p5's default `noise` function, which is a bit notorious in the gen art community for not actually being perlin noise, despite its claims to be. It looks closer to value noise but is not a standard implementation of that either. It's a bit blocky at 1 octave, hence the name.
