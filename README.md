# q5.js

q5.js is intended to be a drop-in replacement for the 2D portion of p5.js.

Not only is the file size of q5.min.js over 25x smaller than p5.min.js, it also runs faster!

q5.js doesn't include any friendly error messages though. If you're a beginner, stick with p5.js while developing a sketch and only use q5.js for finished sketches.

## Usage

```html
<script src="https://quinton-ashley.github.io/q5js/q5.js"></script>
```

## Dev Log

- added `registerMethod` functionality for supporting p5.js addons such as p5.play!
- automatic global instance creation, can also be user instantiated as well with `new Q5('global')` like with the previous version of q5xjs
- added `angleMode` functionality
- fixed `pixelDensity` bugs
- added a `loadSound` function that returns a barebones sound object with `play`, `pause`, and `setVolume` methods
- made `instanceof` checks work for q5.js objects of the `Color`, `Vector`, and `Image` classes
- the `push` and `pop` functions now save and restore style properties like `rectMode` and `strokeWeight`
- added `pow` function alias to `Math.pow`
- fixed `mouseX` and `mouseY` not updating when the mouse is outside the canvas

## Size Comparison

- p5.min.js 898kb
- p5.sound.min.js 200kb

- q5.min.js 34kb

- planck.min.js 193kb
- p5play.min.js 66kb
