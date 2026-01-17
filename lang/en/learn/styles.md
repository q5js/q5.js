# styles

## fill

Sets the fill color. The default is white.

Like the [`color`](https://q5js.org/learn/#color) function, this function
can accept colors in a wide range of formats: as a CSS color string,
a `Color` object, grayscale value, or color component values.

```
@param {Color} color fill color
```

### webgpu

```js
await Canvas(200);
background(0.8);

fill('red');
circle(-20, -20, 80);

fill('lime');
square(-20, -20, 80);
```

### c2d

```js
createCanvas(200);
background(200);

fill('red');
circle(80, 80, 80);

fill('lime');
square(80, 80, 80);
```

## stroke

Sets the stroke (outline) color. The default is black.

Like the [`color`](https://q5js.org/learn/#color) function, this function
can accept colors in a wide range of formats: as a CSS color string,
a `Color` object, grayscale value, or color component values.

```
@param {Color} color stroke color
```

### webgpu

```js
await Canvas(200);
background(0.8);
fill(0.14);

stroke('red');
circle(-20, -20, 80);

stroke('lime');
square(-20, -20, 80);
```

### c2d

```js
createCanvas(200);
background(200);
fill(36);

stroke('red');
circle(80, 80, 80);

stroke('lime');
square(80, 80, 80);
```

## noFill

After calling this function, drawing will not be filled.

### webgpu

```js
await Canvas(200);
background(0.8);

noFill();

stroke('red');
circle(-20, -20, 80);
stroke('lime');
square(-20, -20, 80);
```

### c2d

```js
createCanvas(200);
background(200);

noFill();

stroke('red');
circle(80, 80, 80);
stroke('lime');
square(80, 80, 80);
```

## noStroke

After calling this function, drawing will not have a stroke (outline).

### webgpu

```js
await Canvas(200);
background(0.8);
fill(0.14);
stroke('red');
circle(-20, -20, 80);

noStroke();
square(-20, -20, 80);
```

### c2d

```js
createCanvas(200);
background(200);
fill(36);
stroke('red');
circle(80, 80, 80);

noStroke();
square(80, 80, 80);
```

## strokeWeight

Sets the size of the stroke used for lines and the border around drawings.

```
@param {number} weight size of the stroke in pixels
```

### webgpu

```js
await Canvas(200);
background(0.8);
stroke('red');
circle(-50, 0, 80);

strokeWeight(12);
circle(50, 0, 80);
```

### c2d

```js
createCanvas(200);
background(200);
stroke('red');
circle(50, 100, 80);

strokeWeight(12);
circle(150, 100, 80);
```

## opacity

Sets the global opacity, which affects all subsequent drawing operations, except `background`. Default is 1, fully opaque.

In q5 WebGPU this function only affects images.

```
@param {number} alpha opacity level, ranging from 0 to 1
```

### webgpu

```js
await Canvas(200);
background(0.8);

opacity(1);
circle(-20, -20, 80);

opacity(0.2);
square(-20, -20, 80);
```

### c2d

```js
createCanvas(200);
background(200);

opacity(1);
circle(80, 80, 80);

opacity(0.2);
square(80, 80, 80);
```

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

### c2d

```js
createCanvas(200);
background(200);

noFill();
shadow('black');
rect(64, 60, 80, 80);
```

```js
createCanvas(200);
let logo = loadImage('/assets/p5play_logo.webp');

function setup() {
	background(200);
	shadow(0);
	image(logo, 36, 36, 128, 128);
}
```

## noShadow

Disables the shadow effect.

Not available in q5 WebGPU.

### c2d

```js
createCanvas(200);
background(200);
noStroke();
shadow('black');
rect(14, 14, 80, 80);

noShadow();
rect(104, 104, 80, 80);
```

## shadowBox

Sets the shadow offset and blur radius.

When q5 starts, shadow offset is (10, 10) with a blur of 10.

Not available in q5 WebGPU.

```
@param {number} offsetX horizontal offset of the shadow
@param {number} offsetY vertical offset of the shadow, defaults to be the same as offsetX
@param {number} blur blur radius of the shadow, defaults to 0
```

### c2d

```js
createCanvas(200);
noStroke();
shadow(50);

function draw() {
	background(200);
	shadowBox(-20, mouseY, 10);
	circle(100, 100, 80, 80);
}
```

```js
createCanvas(200);
background(200);
noStroke();

shadow('aqua');
shadowBox(20);
rect(50, 50, 100, 100);
textSize(64);
text('q5', 60, 115);
```

## blendMode

Set the global composite operation for the canvas context.

Not available in q5 WebGPU.

```
@param {string} val composite operation
```

## strokeCap

Set the line cap style to `ROUND`, `SQUARE`, or `PROJECT`.

Not available in q5 WebGPU.

```
@param {CanvasLineCap} val line cap style
```

### c2d

```js
createCanvas(200);
background(200);
strokeWeight(20);

strokeCap(ROUND);
line(50, 50, 150, 50);

strokeCap(SQUARE);
line(50, 100, 150, 100);

strokeCap(PROJECT);
line(50, 150, 150, 150);
```

## strokeJoin

Set the line join style to `ROUND`, `BEVEL`, or `MITER`.

Not available in q5 WebGPU.

```
@param {CanvasLineJoin} val line join style
```

### c2d

```js
createCanvas(200);
background(200);
strokeWeight(10);

strokeJoin(ROUND);
triangle(50, 20, 150, 20, 50, 70);

strokeJoin(BEVEL);
triangle(150, 50, 50, 100, 150, 150);

strokeJoin(MITER);
triangle(50, 130, 150, 180, 50, 180);
```

## erase

Sets the canvas to erase mode, where shapes will erase what's
underneath them instead of drawing over it.

Not available in q5 WebGPU.

```
@param {number} [fillAlpha] opacity level of the fill color
@param {number} [strokeAlpha] opacity level of the stroke color
```

## noErase

Resets the canvas from erase mode to normal drawing mode.

Not available in q5 WebGPU.

## pushStyles

Saves the current drawing style settings.

This includes the fill, stroke, stroke weight, tint, image mode,
rect mode, ellipse mode, text size, text align, text baseline, and
shadow settings.

### webgpu

```js
await Canvas(200);
background(0.8);

pushStyles();
fill('blue');
circle(-50, -50, 80);

popStyles();
circle(50, 50, 80);
```

### c2d

```js
createCanvas(200);
background(200);

pushStyles();
fill('blue');
circle(50, 50, 80);

popStyles();
circle(150, 150, 80);
```

## popStyles

Restores the previously saved drawing style settings.

### webgpu

```js
await Canvas(200);
background(0.8);

pushStyles();
fill('blue');
circle(-50, -50, 80);

popStyles();
circle(50, 50, 80);
```

### c2d

```js
createCanvas(200);
background(200);

pushStyles();
fill('blue');
circle(50, 50, 80);

popStyles();
circle(150, 150, 80);
```

## clear

Clears the canvas, making every pixel completely transparent.

Note that the canvas can only be seen through if it has an alpha channel.

### webgpu

```js
await Canvas(200, { alpha: true });

q5.draw = function () {
	clear();
	circle((frameCount % 200) - 100, 0, 80);
};
```

### c2d

```js
createCanvas(200, 200, { alpha: true });

function draw() {
	clear();
	circle(frameCount % 200, 100, 80);
}
```

## inFill

Checks if a given point is within the current path's fill area.

Not available in q5 WebGPU.

```
@param {number} x x-coordinate of the point
@param {number} y y-coordinate of the point
@returns {boolean} true if the point is within the fill area, false otherwise
```

## inStroke

Checks if a given point is within the current path's stroke.

Not available in q5 WebGPU.

```
@param {number} x x-coordinate of the point
@param {number} y y-coordinate of the point
@returns {boolean} true if the point is within the stroke, false otherwise
```
