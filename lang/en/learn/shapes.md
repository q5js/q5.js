# shapes

## circle

Draws a circle.

```
@param {number} x x-coordinate
@param {number} y y-coordinate
@param {number} diameter diameter of the circle
```

### webgpu

```js
await createCanvas(200, 100);
circle(0, 0, 80);
```

### c2d

```js
createCanvas(200, 100);
circle(100, 50, 80);
```

## ellipse

Draws an ellipse.

```
@param {number} x x-coordinate
@param {number} y y-coordinate
@param {number} width width of the ellipse
@param {number} [height] height of the ellipse
```

### webgpu

```js
await createCanvas(200, 100);
ellipse(0, 0, 160, 80);
```

### c2d

```js
createCanvas(200, 100);
ellipse(100, 50, 160, 80);
```

## rect

Draws a rectangle or a rounded rectangle.

```
@param {number} x x-coordinate
@param {number} y y-coordinate
@param {number} w width of the rectangle
@param {number} [h] height of the rectangle
@param {number} [tl] top-left radius
@param {number} [tr] top-right radius
@param {number} [br] bottom-right radius
@param {number} [bl] bottom-left radius
```

### webgpu

```js
await createCanvas(200);
background(0.8);

rect(-70, -80, 40, 60);
rect(-20, -30, 40, 60, 10);
rect(30, 20, 40, 60, 30, 2, 8, 20);
```

### c2d

```js
createCanvas(200);
background(200);

rect(30, 20, 40, 60);
rect(80, 70, 40, 60, 10);
rect(130, 120, 40, 60, 30, 2, 8, 20);
```

## square

Draws a square or a rounded square.

```
@param {number} x x-coordinate
@param {number} y y-coordinate
@param {number} size size of the sides of the square
@param {number} [tl] top-left radius
@param {number} [tr] top-right radius
@param {number} [br] bottom-right radius
@param {number} [bl] bottom-left radius
```

### webgpu

```js
await createCanvas(200);
background(0.8);

square(-70, -70, 40);
square(-20, -20, 40, 10);
square(30, 30, 40, 30, 2, 8, 20);
```

### c2d

```js
createCanvas(200);
background(200);

square(30, 30, 40);
square(80, 80, 40, 10);
square(130, 130, 40, 30, 2, 8, 20);
```

## point

Draws a point on the canvas.

```
@param {number} x x-coordinate
@param {number} y y-coordinate
```

### webgpu

```js
await createCanvas(200, 100);
stroke('white');
point(-25, 0);

strokeWeight(10);
point(25, 0);
```

### c2d

```js
createCanvas(200, 100);
stroke('white');
point(75, 50);

strokeWeight(10);
point(125, 50);
```

## line

Draws a line on the canvas.

```
@param {number} x1 x-coordinate of the first point
@param {number} y1 y-coordinate of the first point
@param {number} x2 x-coordinate of the second point
@param {number} y2 y-coordinate of the second point
```

### webgpu

```js
await createCanvas(200, 100);
stroke('lime');
line(-80, -30, 80, 30);
```

### c2d

```js
createCanvas(200, 100);
stroke('lime');
line(20, 20, 180, 80);
```

### c2d

```js
createCanvas(200, 100);
background(200);
strokeWeight(5);
capsule(40, 40, 160, 60, 10);
```

```js
function draw() {
	background(200);
	strokeWeight(10);
	capsule(100, 100, mouseX, mouseY, 20);
}
```

## capsule

Draws a capsule.

```
@param {number} x1 x-coordinate of the first point
@param {number} y1 y-coordinate of the first point
@param {number} x2 x-coordinate of the second point
@param {number} y2 y-coordinate of the second point
@param {number} r radius of the capsule semi-circle ends
```

### webgpu

```js
await createCanvas(200, 100);
background(0.8);
strokeWeight(5);
capsule(-60, -10, 60, 10, 10);
```

```js
q5.draw = function () {
	background(0.8);
	strokeWeight(10);
	capsule(0, 0, mouseX, mouseY, 20);
};
```

## rectMode

Set to `CORNER` (default), `CENTER`, `RADIUS`, or `CORNERS`.

Changes how the first four inputs to
`rect` and `square` are interpreted.

```
@param {string} mode
```

### webgpu

```js
await createCanvas(200, 100);
background(0.8);
rectMode(CORNER);

//  ( x,  y,   w,  h)
rect(-50, -25, 100, 50);
```

```js
await createCanvas(200, 100);
background(0.8);
rectMode(CENTER);

//  ( cX, cY,   w,  h)
rect(0, 0, 100, 50);
```

```js
await createCanvas(200, 100);
background(0.8);
rectMode(RADIUS);

//  ( cX, cY, rX, rY)
rect(0, 0, 50, 25);
```

```js
await createCanvas(200, 100);
background(0.8);
rectMode(CORNERS);

//  ( x1, y1, x2, y2)
rect(-50, -25, 50, 25);
```

### c2d

```js
createCanvas(200, 100);
background(200);
rectMode(CORNER);

//  ( x,  y,   w,  h)
rect(50, 25, 100, 50);
```

```js
createCanvas(200, 100);
background(200);
rectMode(CENTER);

//  ( cX, cY,   w,  h)
rect(100, 50, 100, 50);
```

```js
createCanvas(200, 100);
background(200);
rectMode(RADIUS);

//  ( cX, cY, rX, rY)
rect(100, 50, 50, 25);
```

```js
createCanvas(200, 100);
background(200);
rectMode(CORNERS);

//  ( x1, y1, x2, y2)
rect(50, 25, 150, 75);
```

## ellipseMode

Set to `CENTER` (default), `RADIUS`, `CORNER`, or `CORNERS`.

Changes how the first four inputs to
`ellipse`, `circle`, and `arc` are interpreted.

```
@param {string} mode
```

### webgpu

```js
await createCanvas(200, 100);
background(0.8);
ellipseMode(CENTER);

//     (  x,  y,   w,  h)
ellipse(0, 0, 100, 50);
```

```js
await createCanvas(200, 100);
background(0.8);
ellipseMode(RADIUS);

//     (  x,  y, rX, rY)
ellipse(0, 0, 50, 25);
```

```js
await createCanvas(200, 100);
background(0.8);
ellipseMode(CORNER);

//     (lX, tY,   w,  h)
ellipse(-50, -25, 100, 50);
```

```js
await createCanvas(200, 100);
background(0.8);
ellipseMode(CORNERS);

//     ( x1, y1, x2, y2)
ellipse(-50, -25, 50, 25);
```

### c2d

```js
createCanvas(200, 100);
background(200);
ellipseMode(CENTER);

//     (  x,  y,   w,  h)
ellipse(100, 50, 100, 50);
```

```js
createCanvas(200, 100);
background(200);
ellipseMode(RADIUS);

//     (  x,  y, rX, rY)
ellipse(100, 50, 50, 25);
```

```js
createCanvas(200, 100);
background(200);
ellipseMode(CORNER);

//     (lX, tY,   w,  h)
ellipse(50, 25, 100, 50);
```

```js
createCanvas(200, 100);
background(200);
ellipseMode(CORNERS);

//     ( x1, y1, x2, y2)
ellipse(50, 25, 150, 75);
```

## CORNER

Shape alignment mode, for use in `rectMode` and `ellipseMode`.

## RADIUS

Shape alignment mode, for use in `rectMode` and `ellipseMode`.

## CORNERS

Shape alignment mode, for use in `rectMode` and `ellipseMode`.
