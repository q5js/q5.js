# display

## displayMode

Customize how your canvas is presented.

```
@param {string} mode NORMAL, CENTER, or MAXED
@param {string} renderQuality SMOOTH or PIXELATED
@param {number} scale can also be given as a string (for example "x2")
```

### webgpu

```js
await createCanvas(50, 25);

displayMode(CENTER, PIXELATED, 4);

circle(0, 0, 16);
```

### c2d

```js
createCanvas(50, 25);

displayMode(CENTER, PIXELATED, 4);

circle(25, 12.5, 16);
```

## MAXED

A `displayMode` setting.

The canvas will be scaled to fill the parent element,
with letterboxing if necessary to preserve its aspect ratio.

## SMOOTH

A `displayMode` render quality.

Smooth upscaling is used if the canvas is scaled.

## PIXELATED

A `displayMode` render quality.

Pixels are rendered as sharp squares if the canvas is scaled.

## fullscreen

Enables or disables fullscreen mode.

```
@param {boolean} [v] boolean indicating whether to enable or disable fullscreen mode
```

## windowWidth

The width of the window.

### webgpu

```js
q5.draw = function () {
	background(0.8);
	textSize(64);
	textAlign(CENTER, CENTER);
	text(windowWidth, 0, 0);
};
```

### c2d

```js
function draw() {
	background(200);
	textSize(64);
	textAlign(CENTER, CENTER);
	text(windowWidth, 100, 100);
}
```

## windowHeight

The height of the window.

### webgpu

```js
q5.draw = function () {
	background(0.8);
	textSize(64);
	textAlign(CENTER, CENTER);
	text(windowHeight, 0, 0);
};
```

### c2d

```js
function draw() {
	background(200);
	textSize(64);
	textAlign(CENTER, CENTER);
	text(windowHeight, 100, 100);
}
```

## width

The width of the canvas.

### webgpu

```js
await createCanvas(200, 120);
circle(0, 0, width);
```

## height

The height of the canvas.

### webgpu

```js
await createCanvas(200, 80);
circle(0, 0, height);
```

## halfWidth

Half the width of the canvas.

### webgpu

```js
await createCanvas(200, 80);
circle(0, 0, halfWidth);
```

## halfHeight

Half the height of the canvas.

### webgpu

```js
await createCanvas(200, 80);
circle(0, 0, halfHeight);
```

## canvas

The canvas element associated with the Q5 instance.

If a canvas is not explicitly created with `createCanvas()`, but a q5 function like `draw` or `mousePressed` is defined, a default canvas of size 200x200 will be created automatically.

## resizeCanvas

Resizes the canvas to the specified width and height.

```
@param {number} w width of the canvas
@param {number} h height of the canvas
```

### webgpu

```js
await createCanvas(200, 100);

q5.draw = function () {
	background(0.8);
};

q5.mousePressed = function () {
	resizeCanvas(200, 200);
};
```

### c2d

```js
createCanvas(200, 100);

function draw() {
	background(200);
}

function mousePressed() {
	resizeCanvas(200, 200);
}
```

## frameCount

The number of frames that have been displayed since the program started.

### webgpu

```js
q5.draw = function () {
	background(0.8);
	textSize(64);
	text(frameCount, -92, 20);
};
```

### c2d

```js
function draw() {
	background(200);
	textSize(64);
	text(frameCount, 8, 120);
}
```

## noLoop

Stops the draw loop.

### webgpu

```js
q5.draw = function () {
	circle(frameCount * 5 - 100, 0, 80);
	noLoop();
};
```

### c2d

```js
function draw() {
	circle(frameCount * 5, 100, 80);
	noLoop();
}
```

## redraw

Redraws the canvas n times. If no input parameter is provided,
it calls the draw function once.

This is an async function.

```
@param {number} [n] number of times to redraw the canvas, default is 1
```

### webgpu

```js
await createCanvas(200);
noLoop();

q5.draw = function () {
	circle(frameCount * 5 - 100, 0, 80);
};
q5.mousePressed = function () {
	redraw(10);
};
```

### c2d

```js
createCanvas(200);
noLoop();

function draw() {
	circle(frameCount * 5, 100, 80);
}
function mousePressed() {
	redraw(10);
}
```

## loop

Starts the draw loop again if it was stopped.

### webgpu

```js
await createCanvas(200);
noLoop();

q5.draw = function () {
	circle(frameCount * 5 - 100, 0, 80);
};
q5.mousePressed = function () {
	loop();
};
```

### c2d

```js
createCanvas(200);
noLoop();

function draw() {
	circle(frameCount * 5, 100, 80);
}
function mousePressed() {
	loop();
}
```

## frameRate

Sets the target frame rate or gets an approximation of the
sketch's current frame rate.

Even when the sketch is running at a consistent frame rate,
the current frame rate value will fluctuate. Use your web browser's
developer tools for more accurate performance analysis.

```
@param {number} [hertz] target frame rate, default is 60
@returns {number} current frame rate
```

### webgpu

```js
q5.draw = function () {
	background(0.8);

	if (mouseIsPressed) frameRate(10);
	else frameRate(60);

	circle((frameCount % 200) - 100, 0, 80);
};
```

```js
q5.draw = function () {
	background(0.8);
	textSize(64);
	text(round(frameRate()), -35, 20);
};
```

### c2d

```js
function draw() {
	background(200);

	if (mouseIsPressed) frameRate(10);
	else frameRate(60);

	circle(frameCount % 200, 100, 80);
}
```

```js
function draw() {
	background(200);
	textSize(64);
	text(round(frameRate()), 65, 120);
}
```

## getTargetFrameRate

The desired frame rate of the sketch.

```
@returns {number} target frame rate
```

### webgpu

```js
q5.draw = function () {
	background(0.8);
	textSize(64);

	text(getTargetFrameRate(), -35, 20);
};
```

### c2d

```js
function draw() {
	background(200);
	textSize(64);

	text(getTargetFrameRate(), 65, 120);
}
```

## getFPS

Gets the current FPS, in terms of how many frames could be generated
in one second, which can be higher than the target frame rate.

Use your web browser's developer tools for more in-depth
performance analysis.

```
@returns {number} frames per second
```

### webgpu

```js
q5.draw = function () {
	background(0.8);
	frameRate(1);
	textSize(64);

	text(getFPS(), -92, 20);
};
```

### c2d

```js
function draw() {
	background(200);
	frameRate(1);
	textSize(64);

	text(getFPS(), 8, 120);
}
```

## postProcess

Runs after each `draw` function call and post-draw q5 addon processes, if any.

Useful for adding post-processing effects when it's not possible
to do so at the end of the `draw` function, such as when using
addons like p5play that auto-draw to the canvas after the `draw`
function is run.

### c2d

```js
function draw() {
	background(200);
	circle(frameCount % 200, 100, 80);
}

function postProcess() {
	filter(INVERT);
}
```

## pixelDensity

Sets the pixel density of the canvas.

```
@param {number} v pixel density value
@returns {number} pixel density
```

### webgpu

```js
await createCanvas(200, 100);
background(0.8);
pixelDensity(1);
circle(0, 0, 80);
```

### c2d

```js
createCanvas(200, 100);
background(200);
pixelDensity(1);
circle(100, 50, 80);
```

## displayDensity

Returns the current display density.

On most modern displays, this value will be 2 or 3.

```
@returns {number} display density
```

### webgpu

```js
await createCanvas(200, 100);
background(0.8);
textSize(64);
text(displayDensity(), -90, 6);
```

### c2d

```js
createCanvas(200, 100);
background(200);
textSize(64);
text(displayDensity(), 10, 20);
```

## deltaTime

The time passed since the last frame was drawn.

With the default frame rate of 60, delta time will be
approximately 16.6

Can be used to keep movements tied to real time if the sketch
is often dropping below the target frame rate. Although if frame
rates are consistently low, consider reducing the target frame
rate instead.

### webgpu

```js
q5.draw = function () {
	background(0.8);
	text(deltaTime, -90, 6);
};
```

```js
let x = -100;
q5.draw = function () {
	background(0.8);
	// simulate frame rate drops
	frameRate(random(30, 60));

	x += deltaTime * 0.2;
	if (x > 100) x = -100;
	circle(x, 0, 20);
};
```

### c2d

```js
function draw() {
	background(200);
	text(deltaTime, 60, 106);
}
```

```js
let x = 0;
function draw() {
	background(200);
	// simulate frame rate drops
	frameRate(random(30, 60));

	x += deltaTime * 0.2;
	circle(x % 200, 100, 20);
}
```

## ctx

The 2D rendering context for the canvas, if using the Canvas2D
renderer.
