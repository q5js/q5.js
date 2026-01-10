# transforms

## translate

Translates the origin of the drawing context.

```
@param {number} x translation along the x-axis
@param {number} y translation along the y-axis
```

### webgpu

```js
q5.draw = function () {
	background(0.8);

	translate(50, 50);
	circle(0, 0, 80);
};
```

### c2d

```js
function draw() {
	background(200);

	translate(150, 150);
	circle(0, 0, 80);
}
```

## rotate

Rotates the drawing context.

```
@param {number} angle rotation angle in radians
```

### webgpu

```js
q5.draw = function () {
	background(0.8);

	rotate(mouseX / 50);

	rectMode(CENTER);
	square(0, 0, 120);
};
```

### c2d

```js
function draw() {
	background(200);

	translate(100, 100);
	rotate(mouseX / 50);

	rectMode(CENTER);
	square(0, 0, 50);
}
```

## scale

Scales the drawing context.

If only one input parameter is provided,
the drawing context will be scaled uniformly.

```
@param {number} x scaling factor along the x-axis
@param {number} [y] scaling factor along the y-axis
```

### webgpu

```js
q5.draw = function () {
	background(0.8);

	scale(mouseX / 10);
	circle(0, 0, 20);
};
```

### c2d

```js
function draw() {
	background(200);

	scale(mouseX / 10);
	circle(0, 0, 20);
}
```

## shearX

Shears the drawing context along the x-axis.

```
@param {number} angle shear angle in radians
```

### webgpu

```js
q5.draw = function () {
	background(0.8);

	translate(-75, -40);
	shearX(mouseX / 100);
	square(0, 0, 80);
};
```

### c2d

```js
function draw() {
	background(200);

	translate(25, 60);
	shearX(mouseX / 100);
	square(0, 0, 80);
}
```

## shearY

Shears the drawing context along the y-axis.

```
@param {number} angle shear angle in radians
```

### webgpu

```js
q5.draw = function () {
	background(0.8);

	translate(-75, -40);
	shearY(mouseX / 100);
	square(0, 0, 80);
};
```

### c2d

```js
function draw() {
	background(200);

	translate(25, 60);
	shearY(mouseX / 100);
	square(0, 0, 80);
}
```

## applyMatrix

Applies a transformation matrix.

Accepts a 3x3 matrix as either an array or multiple arguments.

```
@param {number} a
@param {number} b
@param {number} c
@param {number} d
@param {number} e
@param {number} f
```

### webgpu

Note that in q5 WebGPU, the identity matrix (default)
has a negative y scale to flip the y-axis to match
the Canvas2D renderer.

```js
q5.draw = function () {
	background(0.8);

	applyMatrix(2, -1, 1, -1);
	circle(0, 0, 80);
};
```

### c2d

```js
function draw() {
	background(200);

	applyMatrix(2, 1, 1, 1, 100, 100);
	circle(0, 0, 80);
}
```

## resetMatrix

Resets the transformation matrix.

q5 runs this function before every time the `draw` function is run,
so that transformations don't carry over to the next frame.

### webgpu

```js
await Canvas(200);
background(0.8);

translate(50, 50);
circle(0, 0, 80);

resetMatrix();
square(0, 0, 50);
```

### c2d

```js
createCanvas(200);
background(200);

translate(100, 100);
circle(0, 0, 80);

resetMatrix();
square(0, 0, 50);
```

## pushMatrix

Saves the current transformation matrix.

### webgpu

```js
await Canvas(200);
background(0.8);

pushMatrix();
rotate(QUARTER_PI);
ellipse(0, 0, 120, 40);
popMatrix();

ellipse(0, 0, 120, 40);
```

### c2d

```js
createCanvas(200);
background(200);
translate(100, 100);

pushMatrix();
rotate(QUARTER_PI);
ellipse(0, 0, 120, 40);
popMatrix();

ellipse(0, 0, 120, 40);
```

## popMatrix

Restores the previously saved transformation matrix.

### webgpu

```js
await Canvas(200);
background(0.8);

pushMatrix();
rotate(QUARTER_PI);
ellipse(0, 0, 120, 40);
popMatrix();

ellipse(0, 0, 120, 40);
```

### c2d

```js
createCanvas(200);
background(200);
translate(100, 100);

pushMatrix();
rotate(QUARTER_PI);
ellipse(0, 0, 120, 40);
popMatrix();

ellipse(0, 0, 120, 40);
```

## push

Saves the current drawing style settings and transformations.

### webgpu

```js
await Canvas(200);

push();
fill('blue');
translate(50, 50);
circle(0, 0, 80);
pop();

square(0, 0, 50);
```

### c2d

```js
createCanvas(200);

push();
fill('blue');
translate(100, 100);
circle(0, 0, 80);
pop();

square(0, 0, 50);
```

## pop

Restores the previously saved drawing style settings and transformations.

### webgpu

```js
await Canvas(200);

push();
fill('blue');
translate(50, 50);
circle(0, 0, 80);
pop();

square(0, 0, 50);
```

### c2d

```js
createCanvas(200);

push();
fill('blue');
translate(100, 100);
circle(0, 0, 80);
pop();

square(0, 0, 50);
```
