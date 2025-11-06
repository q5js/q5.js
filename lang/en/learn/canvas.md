# canvas

## createCanvas

Creates a canvas element, a section of the screen your program
can draw on.

Run this function to start using q5. If this function is not run
by the user, a 200x200 canvas will be created automatically before
the draw loop starts.

When using q5 WebGPU, create a canvas before using any other
q5 functions. The origin of a WebGPU canvas is at its center.

```
@param {number} [w] width or size of the canvas
@param {number} [h] height of the canvas
@param {object} [opt] options for the canvas
@param {boolean} [opt.alpha] whether the canvas should have an alpha channel that allows it to be seen through, default is false
@param {string} [opt.colorSpace] color space of the canvas, either "srgb" or "display-p3", default is "display-p3" for devices that support HDR colors
@returns {HTMLCanvasElement} created canvas element
```

### webgpu

````js
await createCanvas(200, 100);
circle(0, 0, 80);
````

````js
await createCanvas(200, { alpha: true });

Q5.draw = function () {
	clear();
	circle((frameCount % 200) - 100, 0, 80);
}
````

### c2d

````js
createCanvas(200, 100);
circle(100, 50, 80);
````

````js
createCanvas(200, 200, { alpha: true });

function draw() {
	clear();
	circle(frameCount % 200, 100, 80);
}
````

## canvas

The canvas element associated with the Q5 instance.

## clear

Clears the canvas, making every pixel completely transparent.

Note that the canvas can only be seen through if it has an alpha channel.

## fill

Sets the fill color for shapes. The default is white.

Like the [`color`](https://q5js.org/learn/#color) function, this function
can accept colors in a wide range of formats: as a CSS color string,
a `Color` object, grayscale value, or color component values.

```
@param {Color} color fill color
```

### webgpu

````js
await createCanvas(200);
background(0.8);

fill('red');
circle(-20, -20, 80);

fill('lime');
square(-20, -20, 80);
````

### c2d

````js
createCanvas(200);
background(200);

fill('red');
circle(80, 80, 80);

fill('lime');
square(80, 80, 80);
````

## stroke

Sets the stroke (outline) color for shapes. The default is black.

Like the [`color`](https://q5js.org/learn/#color) function, this function
can accept colors in a wide range of formats: as a CSS color string,
a `Color` object, grayscale value, or color component values.

```
@param {Color} color stroke color
```

### webgpu

````js
await createCanvas(200);
background(0.8);
fill(0.14);

stroke('red');
circle(-20, -20, 80);

stroke('lime');
square(-20, -20, 80);
````

### c2d

````js
createCanvas(200);
background(200);
fill(36);

stroke('red');
circle(80, 80, 80);

stroke('lime');
square(80, 80, 80);
````

## noFill

After calling this function, shapes will not be filled.

### webgpu

````js
await createCanvas(200);
background(0.8);

noFill();

stroke('red');
circle(-20, -20, 80);
stroke('lime');
square(-20, -20, 80);
````

### c2d

````js
createCanvas(200);
background(200);

noFill();

stroke('red');
circle(80, 80, 80);
stroke('lime');
square(80, 80, 80);
````

## noStroke

After calling this function, shapes will not have a stroke (outline).

### webgpu

````js
await createCanvas(200);
background(0.8);
fill(0.14);
stroke('red');
circle(-20, -20, 80);

noStroke();
square(-20, -20, 80);
````

### c2d

````js
createCanvas(200);
background(200);
fill(36);
stroke('red');
circle(80, 80, 80);

noStroke();
square(80, 80, 80);
````

## strokeWeight

Sets the size of the stroke used for lines and the border around shapes.

```
@param {number} weight size of the stroke in pixels
```

### webgpu

````js
await createCanvas(200);
background(0.8);
stroke('red');
circle(-50, 0, 80);

strokeWeight(12);
circle(50, 0, 80);
````

### c2d

````js
createCanvas(200);
background(200);
stroke('red');
circle(50, 100, 80);

strokeWeight(12);
circle(150, 100, 80);
````

## opacity

Sets the global opacity, which affects all subsequent drawing operations, except `background`. Default is 1, fully opaque.

In q5 WebGPU this function only affects images.

```
@param {number} alpha opacity level, ranging from 0 to 1
```

### webgpu

````js
await createCanvas(200);
background(0.8);

opacity(1);
circle(-20, -20, 80);

opacity(0.2);
square(-20, -20, 80);
````

### c2d

````js
createCanvas(200);
background(200);

opacity(1);
circle(80, 80, 80);

opacity(0.2);
square(80, 80, 80);
````

## shadow

Sets the shadow color. The default is transparent (no shadow).

Shadows apply to anything drawn to the canvas, including filled
shapes, strokes, text, and images.

Like the [`color`](https://q5js.org/learn/#color) function, this function
can accept colors in a wide range of formats: as a CSS color string,
a `Color` object, grayscale value, or color component values.

Not available in q5 WebGPU.

```
@param {Color} color shadow color
```

### webgpu

````js
await createCanvas(200);
background(200);

noFill();
shadow('black');
rect(64, 60, 80, 80);
````

````js
await createCanvas(200);
let logo = await load('/assets/p5play_logo.webp');

background(200);
shadow(0);
image(logo, 36, 36, 128, 128);
````

### c2d

````js
createCanvas(200);
background(200);

noFill();
shadow('black');
rect(64, 60, 80, 80);
````

````js
createCanvas(200);
let logo = loadImage('/assets/p5play_logo.webp');

function setup() {
	background(200);
	shadow(0);
	image(logo, 36, 36, 128, 128);
}
````

## noShadow

Disables the shadow effect.

Not available in q5 WebGPU.

### webgpu

````js
await createCanvas(200);
background(200);
noStroke();
shadow('black');
rect(14, 14, 80, 80);

noShadow();
rect(104, 104, 80, 80);
````

### c2d

````js
createCanvas(200);
background(200);
noStroke();
shadow('black');
rect(14, 14, 80, 80);

noShadow();
rect(104, 104, 80, 80);
````

## shadowBox

Sets the shadow offset and blur radius.

When q5 starts, shadow offset is (10, 10) with a blur of 10.

Not available in q5 WebGPU.

```
@param {number} offsetX horizontal offset of the shadow
@param {number} offsetY vertical offset of the shadow, defaults to be the same as offsetX
@param {number} blur blur radius of the shadow, defaults to 0
```

### webgpu

````js
await createCanvas(200);
noStroke();
shadow(50);

Q5.draw = function () {
  background(200);
	shadowBox(-20, mouseY, 10);
	circle(100, 100, 80, 80);
}
````

````js
await createCanvas(200);
background(200);
noStroke();

shadow('aqua');
shadowBox(20);
rect(50, 50, 100, 100);
textSize(64);
text('q5', 60, 115);
````

### c2d

````js
createCanvas(200);
noStroke();
shadow(50);

function draw() {
  background(200);
	shadowBox(-20, mouseY, 10);
	circle(100, 100, 80, 80);
}
````

````js
createCanvas(200);
background(200);
noStroke();

shadow('aqua');
shadowBox(20);
rect(50, 50, 100, 100);
textSize(64);
text('q5', 60, 115);
````

## width

The width of the canvas.

## height

The height of the canvas.

## halfWidth

Half the width of the canvas.

## halfHeight

Half the height of the canvas.

## translate

Translates the origin of the drawing context.

```
@param {number} x translation along the x-axis
@param {number} y translation along the y-axis
```

### webgpu

````js
Q5.draw = function () {
	background(0.8);
	
	translate(50, 50);
	circle(0, 0, 80);
}
````

### c2d

````js
function draw() {
	background(200);
	
	translate(100, 100);
	circle(0, 0, 80);
}
````

## rotate

Rotates the drawing context.

```
@param {number} angle rotation angle in radians
```

### webgpu

````js
Q5.draw = function () {
	background(0.8);
	
	rotate(QUARTER_PI);

	// drawn from its top-left corner by default
	square(0, 0, 50);
}
````

### c2d

````js
function draw() {
	background(200);
	
	translate(100, 100);
	rotate(QUARTER_PI);

	// drawn from its top-left corner by default
	square(0, 0, 50);
}
````

## scale

Scales the drawing context.

If only one input parameter is provided,
the drawing context will be scaled uniformly.

```
@param {number} x scaling factor along the x-axis
@param {number} [y] scaling factor along the y-axis
```

### webgpu

````js
Q5.draw = function () {
	background(0.8);
	
	scale(8);
	circle(0, 0, 20);
}
````

### c2d

````js
function draw() {
	background(200);
	
	scale(4);
	circle(0, 0, 80);
}
````

## shearX

Shears the drawing context along the x-axis.

```
@param {number} angle shear angle in radians
```

### webgpu

````js
Q5.draw = function () {
	background(0.8);
	
	translate(-75, -40);
	shearX(QUARTER_PI);
	square(0, 0, 80);
}
````

### c2d

````js
function draw() {
	background(200);
	
	translate(25, 60);
	shearX(QUARTER_PI);
	square(0, 0, 80);
}
````

## shearY

Shears the drawing context along the y-axis.

```
@param {number} angle shear angle in radians
```

### webgpu

````js
Q5.draw = function () {
	background(0.8);
	
	translate(-75, -40);
	shearY(QUARTER_PI);
	square(0, 0, 80);
}
````

### c2d

````js
function draw() {
	background(200);
	
	translate(25, 60);
	shearY(QUARTER_PI);
	square(0, 0, 80);
}
````

## applyMatrix

Applies a transformation matrix.

Accepts a 3x3 or 4x4 matrix as either an array or multiple arguments.

Note that in q5 WebGPU, the identity matrix (default)
has a negative y scale, so the y-axis is flipped to match
the Canvas2D renderer.

```
@param {number} a horizontal scaling
@param {number} b horizontal skewing
@param {number} c vertical skewing
@param {number} d vertical scaling
@param {number} e horizontal moving
@param {number} f vertical moving
```

### webgpu

````js
Q5.draw = function () {
	background(0.8);

	applyMatrix(2, 1, 1, 1, 0, 0);
	circle(0, 0, 80);
}
````

### c2d

````js
function draw() {
	background(200);

	applyMatrix(2, 1, 1, 1, 100, 100);
	circle(0, 0, 80);
}
````

## resetMatrix

Resets the transformation matrix.

q5 runs this function before every time the `draw` function is run,
so that transformations don't carry over to the next frame.

### webgpu

````js
await createCanvas(200);
background(0.8);

translate(50, 50);
circle(0, 0, 80);

resetMatrix();
square(0, 0, 50);
````

### c2d

````js
createCanvas(200);
background(200);

translate(100, 100);
circle(0, 0, 80);

resetMatrix();
square(0, 0, 50);
````

## pushMatrix

Saves the current transformation matrix.

### webgpu

````js
await createCanvas(200);
background(0.8);
pushMatrix();
rotate(QUARTER_PI);
ellipse(0, 0, 120, 40);
popMatrix();
ellipse(0, 0, 120, 40);
````

### c2d

````js
createCanvas(200);
background(200);
translate(100, 100);
pushMatrix();
rotate(QUARTER_PI);
ellipse(0, 0, 120, 40);
popMatrix();
ellipse(0, 0, 120, 40);
````

## popMatrix

Restores the previously saved transformation matrix.

### webgpu

````js
await createCanvas(200);
background(0.8);
pushMatrix();
rotate(QUARTER_PI);
ellipse(0, 0, 120, 40);
popMatrix();
ellipse(0, 0, 120, 40);
````

### c2d

````js
createCanvas(200);
background(200);
translate(100, 100);
pushMatrix();
rotate(QUARTER_PI);
ellipse(0, 0, 120, 40);
popMatrix();
ellipse(0, 0, 120, 40);
````

## pushStyles

Saves the current drawing style settings.

This includes the fill, stroke, stroke weight, tint, image mode, 
rect mode, ellipse mode, text size, text align, text baseline, and
shadow settings.

### webgpu

````js
Q5.draw = function () {
	background(0.8);

	pushStyles();
	fill('blue');
	circle(-50, -50, 80);
	popStyles();
	circle(50, 50, 80);
}
````

### c2d

````js
function draw() {
	background(200);

	pushStyles();
	fill('blue');
	circle(50, 50, 80);
	popStyles();
	circle(150, 150, 80);
}
````

## popStyles

Restores the previously saved drawing style settings.

## push

Saves the current drawing style settings and transformations.

### webgpu

````js
await createCanvas(200);

push();
fill('blue');
translate(50, 50);
circle(0, 0, 80);
pop();

square(0, 0, 50);
````

### c2d

````js
createCanvas(200);

push();
fill('blue');
translate(100, 100);
circle(0, 0, 80);
pop();

square(0, 0, 50);
````

## pop

Restores the previously saved drawing style settings and transformations.

## resizeCanvas

Resizes the canvas to the specified width and height.

```
@param {number} w width of the canvas
@param {number} h height of the canvas
```

## pixelDensity

Sets the pixel density of the canvas.

```
@param {number} v pixel density value
@returns {number} pixel density
```

## displayDensity

Returns the current display density.

```
@returns {number} display density
```

## createGraphics

Creates a graphics buffer.

Disabled by default in q5 WebGPU.
See issue [#104](https://github.com/q5js/q5.js/issues/104) for details.

```
@param {number} w width
@param {number} h height
@param {object} [opt] options
@returns {Q5} a new Q5 graphics buffer
```

## ctx

The 2D rendering context for the canvas, if using the Canvas2D
renderer.

## drawingContext

Alias for `ctx`, the 2D rendering context for the canvas.

