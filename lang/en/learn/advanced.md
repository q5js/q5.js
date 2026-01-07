# advanced

## Q5.constructor

Creates an [instance](https://github.com/q5js/q5.js/wiki/Instance-Mode) of Q5.

Used by the global `createCanvas` function.

```
@param {string | Function} [scope]
  - "global": (default) adds q5 functions and variables to the global scope
  - "namespace": does not add q5 functions or variables to the global scope
@param {HTMLElement} [parent] element that the canvas will be placed inside
```

### c2d

```js
let q = new Q5('namespace');
q.createCanvas(200, 100);
q.circle(100, 50, 20);
```

## Q5.version

The current minor version of q5.

```
@returns {string} the q5 version
```

### webgpu

```js
await createCanvas(200);
background(0.8);
textSize(64);
textAlign(CENTER, CENTER);
text('v' + Q5.version, 0, 0);
```

## Q5.lang

Set to a language code other than 'en' (English) to use q5 in an additional language.

Currently supported languages:

- 'es' (Spanish)

```
@default 'en'
```

## Q5.disableFriendlyErrors

Turn off q5's friendly error messages.

```
@default false
```

## Q5.errorTolerant

Set to true to keep draw looping after an error.

```
@default false
```

## Q5.supportsHDR

True if the device supports HDR (the display-p3 colorspace).

## Q5.canvasOptions

Sets the default canvas context attributes used for newly created
canvases and internal graphics. These options are overwritten by any
per-canvas options you pass to `createCanvas`.

```
@default { alpha: false, colorSpace: 'display-p3' }
```

## Q5.MAX_TRANSFORMS

A WebGPU memory allocation limit.

The maximum number of transformation matrixes
that can be used in a single draw call.

```
@default 1000000
```

## Q5.MAX_RECTS

A WebGPU memory allocation limit.

The maximum number of rectangles
(calls to `rect`, `square`, `capsule`)
that can be drawn in a single draw call.

```
@default 200200
```

## Q5.MAX_ELLIPSES

A WebGPU memory allocation limit.

The maximum number of ellipses
(calls to `ellipse`, `circle`, and `arc`)
that can be drawn in a single draw call.

```
@default 200200
```

## Q5.MAX_CHARS

A WebGPU memory allocation limit.

The maximum number of text characters
that can be drawn in a single draw call.

```
@default 100000
```

## Q5.MAX_TEXTS

A WebGPU memory allocation limit.

The maximum number of separate calls to `text`
that can be drawn in a single draw call.

```
@default 10000
```

## Q5.WebGPU

Creates a new Q5 instance that uses [q5's WebGPU renderer](https://github.com/q5js/q5.js/wiki/q5-WebGPU-renderer).

### webgpu

```js
let q = await Q5.WebGPU('namespace');
q.createCanvas(200, 100);

q.draw = () => {
	q.background(0.8);
	q.circle(q.mouseX, 0, 80);
};
```

## Q5.addHook

Addons can augment q5 with new functionality by adding hooks,
functions to be run at specific phases in the q5 lifecycle.

Inside the function, `this` refers to the Q5 instance.

```
@param {string} lifecycle 'init', 'presetup', 'postsetup', 'predraw', 'postdraw', or 'remove'
@param {Function} fn The function to be run at the specified lifecycle phase.
```

### webgpu

```js
Q5.addHook('predraw', function () {
	this.background('cyan');
});

q5.draw = function () {
	circle(mouseX, mouseY, 80);
};
```

## Q5.registerAddon

p5.js v2 compatible way to register an addon with q5.

```
@param {Function} addon A function that receives `Q5`, `Q5.prototype`, and a `lifecycles` object.
```

### webgpu

```js
// addon.js
Q5.registerAddon((Q5, proto, lifecycles) => {
	lifecycles.predraw = function () {
		this.background('pink');
	};
});

// sketch.js
await createCanvas(200);
```

## Q5.modules

An object containing q5's modules, functions that run when q5 loads.

Each function receives two input parameters:

- the q5 instance
- a proxy for editing the q5 instance and corresponding properties of the global scope

## Q5.draw

The q5 draw function is run 60 times per second by default.

## Q5.postProcess

Runs after each `draw` function call and post-draw q5 addon processes, if any.

Useful for adding post-processing effects when it's not possible
to do so at the end of the `draw` function, such as when using
addons like p5play that auto-draw to the canvas after the `draw`
function is run.

## q5

Alias for `Q5`.
