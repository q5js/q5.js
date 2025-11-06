# shapes

## background

Draws over the entire canvas with a color or image.

Like the [`color`](https://q5js.org/learn/#color) function,
this function can accept colors in a wide range of formats:
CSS color string, grayscale value, and color component values.

```
@param {Color | Q5.Image} filler a color or image to draw
```

### webgpu

````js
await createCanvas(200, 100);
background('crimson');
````

````js
await createCanvas(200);

Q5.draw = function () {
	background(0.5, 0.4);
	circle(mouseX, mouseY, 20);
};
````

### c2d

````js
createCanvas(200, 100);
background('crimson');
````

````js
function draw() {
	background(128, 110);
	circle(mouseX, mouseY, 20);
}
````

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

````js
await createCanvas(200);
background(0.8);

rect(-70, -80, 40, 60);
rect(-20, -30, 40, 60, 10);
rect(30, 20, 40, 60, 30, 2, 8, 20);
````

### c2d

````js
createCanvas(200);
background(200);

rect(30, 20, 40, 60);
rect(80, 70, 40, 60, 10);
rect(130, 120, 40, 60, 30, 2, 8, 20);
````

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

````js
await createCanvas(200);
background(0.8);

square(-70, -70, 40);
square(-20, -20, 40, 10);
square(30, 30, 40, 30, 2, 8, 20);
````

### c2d

````js
createCanvas(200);
background(200);

square(30, 30, 40);
square(80, 80, 40, 10);
square(130, 130, 40, 30, 2, 8, 20);
````

## circle

Draws a circle.

```
@param {number} x x-coordinate
@param {number} y y-coordinate
@param {number} diameter diameter of the circle
```

### webgpu

````js
await createCanvas(200, 100);
circle(0, 0, 80);
````

### c2d

````js
createCanvas(200, 100);
circle(100, 50, 80);
````

## ellipse

Draws an ellipse.

```
@param {number} x x-coordinate
@param {number} y y-coordinate
@param {number} width width of the ellipse
@param {number} [height] height of the ellipse
```

### webgpu

````js
await createCanvas(200, 100);
ellipse(0, 0, 160, 80);
````

### c2d

````js
createCanvas(200, 100);
ellipse(100, 50, 160, 80);
````

## arc

Draws an arc, which is a section of an ellipse.

`ellipseMode` affects how the arc is drawn.

q5 WebGPU only supports the default `PIE_OPEN` mode.

```
@param {number} x x-coordinate
@param {number} y y-coordinate
@param {number} w width of the ellipse
@param {number} h height of the ellipse
@param {number} start angle to start the arc
@param {number} stop angle to stop the arc
@param {number} [mode] shape and stroke style setting, default is `PIE_OPEN` for a pie shape with an unclosed stroke, can be `PIE`, `CHORD`, or `CHORD_OPEN`
```

### webgpu

````js
await createCanvas(200);
background(0.8);

arc(-60, -60, 40, 40, 0.8, -0.8);
arc(-20, -20, 40, 40, 0.8, -0.8, PIE);
arc(20, 20, 40, 40, 0.8, -0.8, CHORD_OPEN);
arc(60, 60, 40, 40, 0.8, -0.8, CHORD);
````

### c2d

````js
createCanvas(200);
background(200);

arc(40, 40, 40, 40, 0.8, -0.8);
arc(80, 80, 40, 40, 0.8, -0.8, PIE);
arc(120, 120, 40, 40, 0.8, -0.8, CHORD_OPEN);
arc(160, 160, 40, 40, 0.8, -0.8, CHORD);
````

## line

Draws a line on the canvas.

```
@param {number} x1 x-coordinate of the first point
@param {number} y1 y-coordinate of the first point
@param {number} x2 x-coordinate of the second point
@param {number} y2 y-coordinate of the second point
```

### webgpu

````js
await createCanvas(200, 100);
stroke('lime');
line(-80, -30, 80, 30);
````

### c2d

````js
createCanvas(200, 100);
stroke('lime');
line(20, 20, 180, 80);
````

## capsule

Draws a capsule, which is pill shaped.

```
@param {number} x1 x-coordinate of the first point
@param {number} y1 y-coordinate of the first point
@param {number} x2 x-coordinate of the second point
@param {number} y2 y-coordinate of the second point
@param {number} r radius of the capsule semi-circle ends
```

### webgpu

````js
await createCanvas(200, 100);
background(0.8);
strokeWeight(5);
capsule(-60, -10, 60, 10, 10);
````

````js
await createCanvas(200);

Q5.draw = function () {
	background(0.8);
	strokeWeight(10);
	capsule(0, 0, mouseX, mouseY, 20);
}
````

### c2d

````js
createCanvas(200, 100);
background(200);
strokeWeight(5);
capsule(40, 40, 160, 60, 10);
````

````js
function draw() {
	background(200);
	strokeWeight(10);
	capsule(100, 100, mouseX, mouseY, 20);
}
````

## point

Draws a point on the canvas.

```
@param {number} x x-coordinate
@param {number} y y-coordinate
```

### webgpu

````js
await createCanvas(200, 100);
stroke('white');
point(-25, 0);

strokeWeight(10);
point(25, 0);
````

### c2d

````js
createCanvas(200, 100);
stroke('white');
point(75, 50);

strokeWeight(10);
point(125, 50);
````

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

### webgpu

````js
await createCanvas(200);
background(200);
strokeWeight(20);

strokeCap(ROUND);
line(50, 50, 150, 50);

strokeCap(SQUARE);
line(50, 100, 150, 100);

strokeCap(PROJECT);
line(50, 150, 150, 150);
````

### c2d

````js
createCanvas(200);
background(200);
strokeWeight(20);

strokeCap(ROUND);
line(50, 50, 150, 50);

strokeCap(SQUARE);
line(50, 100, 150, 100);

strokeCap(PROJECT);
line(50, 150, 150, 150);
````

## strokeJoin

Set the line join style to `ROUND`, `BEVEL`, or `MITER`.

Not available in q5 WebGPU.

```
@param {CanvasLineJoin} val line join style
```

### webgpu

````js
await createCanvas(200);
background(200);
strokeWeight(10);

strokeJoin(ROUND);
triangle(50, 20, 150, 20, 50, 70);

strokeJoin(BEVEL);
triangle(150, 50, 50, 100, 150, 150);

strokeJoin(MITER);
triangle(50, 130, 150, 180, 50, 180);
````

### c2d

````js
createCanvas(200);
background(200);
strokeWeight(10);

strokeJoin(ROUND);
triangle(50, 20, 150, 20, 50, 70);

strokeJoin(BEVEL);
triangle(150, 50, 50, 100, 150, 150);

strokeJoin(MITER);
triangle(50, 130, 150, 180, 50, 180);
````

## rectMode

Set to `CORNER` (default), `CENTER`, `RADIUS`, or `CORNERS`.

Changes how the first four inputs to
`rect` and `square` are interpreted.

```
@param {string} mode
```

### webgpu

````js
await createCanvas(200, 100);
background(0.8);
rectMode(CORNER);

//  ( x,  y,   w,  h)
rect(-50, -25, 100, 50);
````

````js
await createCanvas(200, 100);
background(0.8);
rectMode(CENTER);

//  ( cX, cY,   w,  h)
rect(0, 0, 100, 50);
````

````js
await createCanvas(200, 100);
background(0.8);
rectMode(RADIUS);

//  ( cX, cY, rX, rY)
rect(0, 0, 50, 25);
````

````js
await createCanvas(200, 100);
background(0.8);
rectMode(CORNERS);

//  ( x1, y1, x2, y2)
rect(-50, -25, 50, 25);
````

### c2d

````js
createCanvas(200, 100);
background(200);
rectMode(CORNER);

//  ( x,  y,   w,  h)
rect(50, 25, 100, 50);
````

````js
createCanvas(200, 100);
background(200);
rectMode(CENTER);

//  ( cX, cY,   w,  h)
rect(100, 50, 100, 50);
````

````js
createCanvas(200, 100);
background(200);
rectMode(RADIUS);

//  ( cX, cY, rX, rY)
rect(100, 50, 50, 25);
````

````js
createCanvas(200, 100);
background(200);
rectMode(CORNERS);

//  ( x1, y1, x2, y2)
rect(50, 25, 150, 75);
````

## ellipseMode

Set to `CENTER` (default), `RADIUS`, `CORNER`, or `CORNERS`.

Changes how the first four inputs to
`ellipse`, `circle`, and `arc` are interpreted.

```
@param {string} mode
```

### webgpu

````js
await createCanvas(200, 100);
background(0.8);
ellipseMode(CENTER);

//     (  x,  y,   w,  h)
ellipse(0, 0, 100, 50);
````

````js
await createCanvas(200, 100);
background(0.8);
ellipseMode(RADIUS);

//     (  x,  y, rX, rY)
ellipse(0, 0, 50, 25);
````

````js
await createCanvas(200, 100);
background(0.8);
ellipseMode(CORNER);

//     (lX, tY,   w,  h)
ellipse(-50, -25, 100, 50);
````

````js
await createCanvas(200, 100);
background(0.8);
ellipseMode(CORNERS);

//     ( x1, y1, x2, y2)
ellipse(-50, -25, 50, 25);
````

### c2d

````js
createCanvas(200, 100);
background(200);
ellipseMode(CENTER);

//     (  x,  y,   w,  h)
ellipse(100, 50, 100, 50);
````

````js
createCanvas(200, 100);
background(200);
ellipseMode(RADIUS);

//     (  x,  y, rX, rY)
ellipse(100, 50, 50, 25);
````

````js
createCanvas(200, 100);
background(200);
ellipseMode(CORNER);

//     (lX, tY,   w,  h)
ellipse(50, 25, 100, 50);
````

````js
createCanvas(200, 100);
background(200);
ellipseMode(CORNERS);

//     ( x1, y1, x2, y2)
ellipse(50, 25, 150, 75);
````

## curve

Draws a curve.

## curveDetail

Sets the amount of straight line segments used to make a curve.

Only takes effect in q5 WebGPU.

```
@param {number} val curve detail level, default is 20
```

### webgpu

````js
await Q5.WebGPU();

curveDetail(4);

strokeWeight(10);
stroke(0, 1, 1);
noFill();
curve(-100, -200, -50, 0, 50, 0, 100, -200);
````

## beginShape

Starts storing vertices for a convex shape.

## endShape

Ends storing vertices for a convex shape.

## beginContour

Starts storing vertices for a contour.

Not available in q5 WebGPU.

## endContour

Ends storing vertices for a contour.

Not available in q5 WebGPU.

## vertex

Specifies a vertex in a shape.

```
@param {number} x x-coordinate
@param {number} y y-coordinate
```

## bezierVertex

Specifies a Bezier vertex in a shape.

```
@param {number} cp1x x-coordinate of the first control point
@param {number} cp1y y-coordinate of the first control point
@param {number} cp2x x-coordinate of the second control point
@param {number} cp2y y-coordinate of the second control point
@param {number} x x-coordinate of the anchor point
@param {number} y y-coordinate of the anchor point
```

## quadraticVertex

Specifies a quadratic Bezier vertex in a shape.

```
@param {number} cp1x x-coordinate of the control point
@param {number} cp1y y-coordinate of the control point
@param {number} x x-coordinate of the anchor point
@param {number} y y-coordinate of the anchor point
```

## bezier

Draws a Bezier curve.

```
@param {number} x1 x-coordinate of the first anchor point
@param {number} y1 y-coordinate of the first anchor point
@param {number} x2 x-coordinate of the first control point
@param {number} y2 y-coordinate of the first control point
@param {number} x3 x-coordinate of the second control point
@param {number} y3 y-coordinate of the second control point
@param {number} x4 x-coordinate of the second anchor point
@param {number} y4 y-coordinate of the second anchor point
```

## triangle

Draws a triangle.

```
@param {number} x1 x-coordinate of the first vertex
@param {number} y1 y-coordinate of the first vertex
@param {number} x2 x-coordinate of the second vertex
@param {number} y2 y-coordinate of the second vertex
@param {number} x3 x-coordinate of the third vertex
@param {number} y3 y-coordinate of the third vertex
```

## quad

Draws a quadrilateral.

```
@param {number} x1 x-coordinate of the first vertex
@param {number} y1 y-coordinate of the first vertex
@param {number} x2 x-coordinate of the second vertex
@param {number} y2 y-coordinate of the second vertex
@param {number} x3 x-coordinate of the third vertex
@param {number} y3 y-coordinate of the third vertex
@param {number} x4 x-coordinate of the fourth vertex
@param {number} y4 y-coordinate of the fourth vertex
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

## CORNER

## RADIUS

## CORNERS

