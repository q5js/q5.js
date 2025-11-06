# core

Welcome to q5's documentation! 🤩

First time coding? Check out the [q5 Beginner's Brief](https://github.com/q5js/q5.js/wiki/q5-Beginner's-Brief).

On these Learn pages, you can experiment with editing the
interactive mini examples. Have fun! 😎

## draw

The draw function is run 60 times per second by default.

### webgpu

````js
Q5.draw = function () {
	background('silver');
	circle((frameCount % 200) - 100, 0, 80);
}
````

### c2d

````js
function draw() {
  background('silver');
	circle(frameCount % 200, 100, 80);
}
````

## setup

The setup function is run once, when the program starts.

It can also be defined as an async function and used to load assets.

### c2d

````js
function setup() {
	createCanvas(200, 100);
	background('aqua');
}
````

````js
let logo;

async function setup() {
	logo = await loadImage('/q5js_logo.avif');
}

function draw() {
	background(logo);
}
````

## preload

Load assets in the preload function to ensure that they'll be
ready to use in the setup and draw functions.

q5's preload system can also be used without a preload function
if you create a canvas first, as shown in the second example.

### c2d

````js
let logo;

function preload() {
	logo = loadImage('/q5js_logo.avif');
}

function draw() {
	background(logo);
}
````

````js
createCanvas(200, 100);

let logo = loadImage('/q5js_logo.avif');

function draw() {
	background(logo);
}
````

## frameCount

The number of frames that have been displayed since the program started.

### webgpu

````js
Q5.draw = function () {
	background(0.8);
	textSize(64);
	text(frameCount, -92, 20);
}
````

### c2d

````js
function draw() {
	background(200);
	textSize(64);
	text(frameCount, 8, 120);
}
````

## noLoop

Stops the draw loop.

### webgpu

````js
Q5.draw = function () {
	circle((frameCount * 5) - 100, 0, 80);
	noLoop();
}
````

### c2d

````js
function draw() {
  circle(frameCount * 5, 100, 80);
  noLoop();
}
````

## redraw

Redraws the canvas n times. If no input parameter is provided,
it calls the draw function once.

This is an async function.

```
@param {number} [n] number of times to redraw the canvas, default is 1
```

### webgpu

````js
await createCanvas(200);
noLoop();

Q5.draw = function () {
	circle((frameCount * 5) - 100, 0, 80);
}
Q5.mousePressed = function () {
	redraw(10);
}
````

### c2d

````js
createCanvas(200);
noLoop();

function draw() {
  circle(frameCount * 5, 100, 80);
}
function mousePressed() {
  redraw(10);
}
````

## loop

Starts the draw loop again if it was stopped.

### webgpu

````js
await createCanvas(200);
noLoop();

Q5.draw = function () {
	circle((frameCount * 5) - 100, 0, 80);
}
Q5.mousePressed = function () {
	loop();
}
````

### c2d

````js
createCanvas(200);
noLoop();

function draw() {
  circle(frameCount * 5, 100, 80);
}
function mousePressed() {
  loop();
}
````

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

````js
Q5.draw = function () {
	background(0.8);

	if (mouseIsPressed) frameRate(10);
	else frameRate(60);

	circle((frameCount % 200) - 100, 0, 80);
}
````

````js
Q5.draw = function () {
	background(0.8);
	textSize(64);
	text(round(frameRate()), -35, 20);
}
````

### c2d

````js
function draw() {
	background(200);

	if (mouseIsPressed) frameRate(10);
	else frameRate(60);

	circle(frameCount % 200, 100, 80);
}
````

````js
function draw() {
	background(200);
	textSize(64);
	text(round(frameRate()), 65, 120);
}
````

## getTargetFrameRate

The desired frame rate of the sketch.

```
@returns {number} target frame rate
```

### webgpu

````js
Q5.draw = function () {
	background(0.8);
	textSize(64);

	text(getTargetFrameRate(), -35, 20);
}
````

### c2d

````js
function draw() {
	background(200);
	textSize(64);

	text(getTargetFrameRate(), 65, 120);
}
````

## getFPS

Gets the current FPS, in terms of how many frames could be generated
in one second, which can be higher than the target frame rate.

Use your web browser's developer tools for more in-depth
performance analysis.

```
@returns {number} frames per second
```

### webgpu

````js
Q5.draw = function () {
	background(0.8);
	frameRate(1);
	textSize(64);

	text(getFPS(), -92, 20);
}
````

### c2d

````js
function draw() {
	background(200);
	frameRate(1);
	textSize(64);

	text(getFPS(), 8, 120);
}
````

## log

Logs a message to the JavaScript console. Alias for the standard
[`console.log`](https://developer.mozilla.org/docs/Web/API/console/log_static) function.

You can open web developer tools in most browsers by using the
keyboard shortcut `Ctrl + Shift + i` or `command + option + i`,
then click the "Console" tab.

```
@param {*} message message to log
```

## postProcess

Runs after each `draw` function call and post draw hooks.

Useful for adding post-processing effects when it's not possible
to do so at the end of the `draw` function, such as when using
addons like p5play that auto-draw to the canvas after the `draw`
function is run.

### webgpu

````js
Q5.draw = function () {
	background(0.8);
	circle((frameCount % 200) - 100, 0, 80);
}

Q5.postProcess = function () {
	// filter(INVERT);
}
````

### c2d

````js
function draw() {
	background(200);
	circle(frameCount % 200, 100, 80);
}

function postProcess() {
	filter(INVERT);
}
````

## windowWidth

The width of the window.

### webgpu

````js
Q5.draw = function () {
	background(0.8);
	textSize(64);
	textAlign(CENTER, CENTER);
	text(windowWidth, 0, 0);
}
````

### c2d

````js
function draw() {
	background(200);
	textSize(64);
	textAlign(CENTER, CENTER);
	text(windowWidth, 100, 100);
}
````

## windowHeight

The height of the window.

### webgpu

````js
Q5.draw = function () {
	background(0.8);
	textSize(64);
	textAlign(CENTER, CENTER);
	text(windowHeight, 0, 0);
}
````

### c2d

````js
function draw() {
	background(200);
	textSize(64);
	textAlign(CENTER, CENTER);
	text(windowHeight, 100, 100);
}
````

## deltaTime

The time passed since the last frame was drawn.

With the default frame rate of 60, delta time will be
approximately 16.6

Can be used to keep movements tied to real time if the sketch
is often dropping below the target frame rate. Although if frame 
rates are consistently low, consider reducing the target frame
rate instead.

### webgpu

````js
Q5.draw = function () {
	background(0.8);
	text(deltaTime, -40, 6);
}
````

````js
let x = -100;
Q5.draw = function () {
	background(0.8);
	// simulate frame rate drops
	frameRate(random(30, 60));

	x += deltaTime * 0.2;
	if (x > 100) x = -100;
	circle(x, 0, 20);
}
````

### c2d

````js
function draw() {
	background(200);
	text(deltaTime, 60, 106);
}
````

````js
let x = 0;
function draw() {
	background(200);
	// simulate frame rate drops
	frameRate(random(30, 60));

	x += deltaTime * 0.2;
	circle(x % 200, 100, 20);
}
````

## usePromiseLoading

By default, q5 supports the p5.js v1 
[preload](https://q5js.org/learn/#preload)
system, which uses
[`Promise.all`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
behind the scenes to load assets in parallel.

To match p5.js v2 behavior, q5 automatically makes
load* functions, such as `loadImage`, return promises
in `setup` if it's defined as an async function.

This function can be used at any point in your sketch
to make load* functions return promises or not. Yet, consider 
using [`load`](https://q5js.org/learn/#load) instead.

```
@param {boolean} [val] Whether load* functions should return promises or not. If this parameter is undefined the value is set to true.
```

### webgpu

````js
await createCanvas(200);

usePromiseLoading();

let logo = await loadImage('/q5js_logo.avif');
background(logo);
````

### c2d

````js
createCanvas(200);

usePromiseLoading();

let logo = await loadImage('/q5js_logo.avif');
background(logo);
````

## Q5.constructor

Creates an instance of Q5.

Running `new Q5()` starts q5 in top-level global mode,
enabling use of q5 functions and variables on the file level, 
outside of `setup` and `draw`. You can also start Q5 in this mode
by running [`createCanvas`](https://q5js.org/learn/#createCanvas) 
on the file level.

If you don't create a new instance of Q5, an 
instance will be created automatically, replicating
p5's limited global mode. p5's instance mode is supported by 
this constructor as well but its use is deprecated, use
[q5's namespaced instance mode](https://github.com/q5js/q5.js/wiki/Instance-Mode) instead.

```
@param {string | Function} [scope]
@param {HTMLElement} [parent] element that the canvas will be placed inside
```

### c2d

````js
let q = new Q5('instance');
q.createCanvas(200, 100);
q.circle(100, 50, 20);
````

## Q5.draw

The draw function is run 60 times per second by default.

## Q5.setup

The setup function is run once, when the program starts.

## Q5.preload

Load assets in the preload function to ensure that they'll be
ready to use in the setup and draw functions.

q5's preload system can also be used without a preload function
if you create a canvas first.

## Q5.postProcess

The number of frames that have been displayed since the program
started.

