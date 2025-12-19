# core

Welcome to q5's documentation! 🤩

First time coding? Check out the [q5 Beginner's Brief](https://github.com/q5js/q5.js/wiki/q5-Beginner's-Brief).

On these Learn pages, you can experiment with editing the
interactive mini examples. Have fun! 😎

## createCanvas

Creates a canvas element, a section of the screen your program
can draw on.

Run this function to start using q5!

Note that in this example, the circle is located at position [0, 0], the origin of the canvas.

```
@param {number} [w] width or side lengths of the canvas
@param {number} [h] height of the canvas
@param {object} [opt] [options](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getContextAttributes)
@returns {Promise<HTMLCanvasElement>} created canvas element
```

### webgpu

```js
// WebGPU
await createCanvas(200, 100);
background('silver');
circle(0, 0, 80);
```

### c2d

```js
// Canvas2D
createCanvas(200, 100);
background('silver');
circle(0, 0, 80);
```

## draw

The q5 draw function is run 60 times per second by default.

### webgpu

```js
q5.draw = function () {
	background('silver');
	circle(mouseX, mouseY, 80);
};
```

### c2d

```js
function draw() {
	background('silver');
	circle(mouseX, mouseY, 80);
}
```

## log

Logs a message to the JavaScript console.

To view the console, open your browser's web developer tools
via the keyboard shortcut `Ctrl + Shift + i` or `command + option + i`,
then click the "Console" tab.

This is an alias for the standard
[`console.log`](https://developer.mozilla.org/docs/Web/API/console/log_static) function.

When you're curious about what your code is doing, use `log()`!

```
@param {*} message
```

### webgpu

```js
q5.draw = function () {
	circle(mouseX, mouseY, 80);
	log('The mouse is at:', mouseX, mouseY);
};
```

### c2d

```js
function draw() {
	circle(mouseX, mouseY, 80);
	log('The mouse is at:', mouseX, mouseY);
}
```
