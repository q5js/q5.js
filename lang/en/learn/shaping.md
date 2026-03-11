# shaping

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

```js
await Canvas(200);
background(0.8);

arc(0, 0, 160, 160, 0.8, -0.8);
```

### c2d

```js
createCanvas(200);
background(200);

arc(40, 40, 40, 40, 0.8, -0.8);
arc(80, 80, 40, 40, 0.8, -0.8, PIE);
arc(120, 120, 40, 40, 0.8, -0.8, CHORD_OPEN);
arc(160, 160, 40, 40, 0.8, -0.8, CHORD);
```

## curve

Draws a curve.

### webgpu

```js
await Canvas(200, 100);
background(0.8);

curve(-100, -200, -50, 0, 50, 0, 100, -200);
```

## curveDetail

Sets the amount of straight line segments used to make a curve.

Only takes effect in q5 WebGPU.

```
@param {number} val curve detail level, default is 20
```

### webgpu

```js
await Canvas(200);

curveDetail(4);

strokeWeight(10);
stroke(0, 1, 1);
curve(-100, -200, -50, 0, 50, 0, 100, -200);
```

## beginShape

Starts storing vertices for a shape.

## endShape

Ends storing vertices for a shape.

```
@param {boolean} [close] whether to close the shape by connecting the last vertex to the first vertex, default is false
```

## vertex

Specifies a vertex in a shape.

```
@param {number} x x-coordinate
@param {number} y y-coordinate
```

### webgpu

Each vertex can have its own fill color. Useful for creating gradients.

```js
await Canvas(200);

stroke(1, 0.5);
strokeWeight(20);

beginShape();
fill(1, 0, 0);
vertex(-80, -80);
vertex(40, -60);
fill(0, 0, 1);
vertex(80, 60);
vertex(-60, 80);
endShape(true);
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

## beginContour

Starts storing vertices for a contour.

Not available in q5 WebGPU.

## endContour

Ends storing vertices for a contour.

Not available in q5 WebGPU.
