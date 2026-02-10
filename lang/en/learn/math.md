# math

## random

Generates a random value.

- If no inputs are provided, returns a number between 0 and 1.
- If one numerical input is provided, returns a number between 0 and the provided value.
- If two numerical inputs are provided, returns a number between the two values.
- If an array is provided, returns a random element from the array.

```
@param {number | any[]} [low] lower bound (inclusive) or an array
@param {number} [high] upper bound (exclusive)
@returns {number | any} a random number or element
```

### webgpu

```js
await Canvas(200);
background(0.8);
frameRate(5);

q5.draw = function () {
	circle(0, 0, random(200));
};
```

```js
q5.draw = function () {
	circle(random(-100, 100), random(-10, 10), 10);
};
```

### c2d

```js
createCanvas(200);
background(200);
frameRate(5);

function draw() {
	circle(100, 100, random(20, 200));
}
```

```js
function draw() {
	circle(random(200), random(50, 150), 10);
}
```

## jit

Generates a random number within a symmetric range around zero.

Can be used to create a jitter effect (random displacement).

Equivalent to `random(-amount, amount)`.

```
@param {number} [amount] absolute maximum amount of jitter, default is 1
@returns {number} random number between -val and val
```

### webgpu

```js
q5.draw = function () {
	circle(mouseX + jit(3), mouseY + jit(3), 5);
};
```

```js
await Canvas(200);

q5.draw = function () {
	circle(jit(50), 0, random(50));
};
```

### c2d

```js
function draw() {
	circle(mouseX + jit(3), mouseY + jit(3), 5);
}
```

```js
let q = await Q5.WebGPU();
createCanvas(200, 100);

q.draw = () => {
	circle(jit(50), 0, random(50));
};
```

## noise

Generates a noise value based on the x, y, and z inputs.

Uses [Perlin Noise](https://en.wikipedia.org/wiki/Perlin_noise) by default.

```
@param {number} [x] x-coordinate input
@param {number} [y] y-coordinate input
@param {number} [z] z-coordinate input
@returns {number} a noise value
```

### webgpu

```js
q5.draw = function () {
	background(0.8);
	let n = noise(frameCount * 0.01);
	circle(0, 0, n * 200);
};
```

```js
q5.draw = function () {
	background(0.8);
	let t = (frameCount + mouseX) * 0.02;
	for (let x = -5; x < 220; x += 10) {
		let n = noise(t, x * 0.1);
		circle(x - 100, 0, n * 40);
	}
};
```

```js
q5.draw = function () {
	noStroke();
	let t = millis() * 0.002;
	for (let x = -100; x < 100; x += 5) {
		for (let y = -100; y < 100; y += 5) {
			fill(noise(t, (mouseX + x) * 0.05, y * 0.05));
			square(x, y, 5);
		}
	}
};
```

### c2d

```js
function draw() {
	background(200);
	let n = noise(frameCount * 0.01);
	circle(100, 100, n * 200);
}
```

```js
function draw() {
	background(200);
	let t = (frameCount + mouseX) * 0.02;
	for (let x = -5; x < 220; x += 10) {
		let n = noise(t, x * 0.1);
		circle(x, 100, n * 40);
	}
}
```

## dist

Calculates the distance between two points.

This function also accepts two objects with `x` and `y` properties.

```
@param {number} x1 x-coordinate of the first point
@param {number} y1 y-coordinate of the first point
@param {number} x2 x-coordinate of the second point
@param {number} y2 y-coordinate of the second point
@returns {number} distance between the points
```

### webgpu

```js
q5.draw = function () {
	background(0.8);
	line(0, 0, mouseX, mouseY);

	let d = dist(0, 0, mouseX, mouseY);
	text(round(d), -80, -80);
};
```

### c2d

```js
function draw() {
	background(200);
	circle(100, 100, 20);
	circle(mouseX, mouseY, 20);

	let d = dist(100, 100, mouseX, mouseY);
	text(round(d), 20, 20);
}
```

## map

Maps a number from one range to another.

```
@param {number} val incoming value to be converted
@param {number} start1 lower bound of the value's current range
@param {number} stop1 upper bound of the value's current range
@param {number} start2 lower bound of the value's target range
@param {number} stop2 upper bound of the value's target range
@returns {number} mapped value
```

## angleMode

Sets the mode for interpreting and drawing angles. Can be either 'degrees' or 'radians'.

```
@param {'degrees' | 'radians'} mode mode to set for angle interpretation
```

## radians

Converts degrees to radians.

```
@param {number} degrees angle in degrees
@returns {number} angle in radians
```

## degrees

Converts radians to degrees.

```
@param {number} radians angle in radians
@returns {number} angle in degrees
```

## lerp

Calculates a number between two numbers at a specific increment.

```
@param {number} start first number
@param {number} stop second number
@param {number} amt amount to interpolate between the two values
@returns {number} interpolated number
```

## constrain

Constrains a value between a minimum and maximum value.

```
@param {number} n number to constrain
@param {number} low lower bound
@param {number} high upper bound
@returns {number} constrained value
```

## norm

Normalizes a number from another range into a value between 0 and 1.

```
@param {number} n number to normalize
@param {number} start lower bound of the range
@param {number} stop upper bound of the range
@returns {number} normalized number
```

## fract

Calculates the fractional part of a number.

```
@param {number} n a number
@returns {number} fractional part of the number
```

## abs

Calculates the absolute value of a number.

```
@param {number} n a number
@returns {number} absolute value of the number
```

## round

Rounds a number.

```
@param {number} n number to round
@param {number} [d] number of decimal places to round to
@returns {number} rounded number
```

### webgpu

```js
await Canvas(200, 100);
background(0.8);
textSize(32);
text(round(PI, 5), -90, 10);
```

### c2d

```js
createCanvas(200, 100);
background(200);
textSize(32);
text(round(PI, 5), 10, 60);
```

## ceil

Rounds a number up.

```
@param {number} n a number
@returns {number} rounded number
```

### webgpu

```js
await Canvas(200, 100);
background(0.8);
textSize(32);
text(ceil(PI), -90, 10);
```

### c2d

```js
createCanvas(200, 100);
background(200);
textSize(32);
text(ceil(PI), 10, 60);
```

## floor

Rounds a number down.

```
@param {number} n a number
@returns {number} rounded number
```

### webgpu

```js
await Canvas(200, 100);
background(0.8);
textSize(32);
text(floor(-PI), -90, 10);
```

### c2d

```js
createCanvas(200, 100);
background(200);
textSize(32);
text(floor(-PI), 10, 60);
```

## min

Returns the smallest value in a sequence of numbers.

```
@param {...number} args numbers to compare
@returns {number} minimum
```

### webgpu

```js
q5.draw = function () {
	background(min(-mouseX / 100, 0.5));
	circle(min(mouseX, 0), 0, 80);
};
```

### c2d

```js
function draw() {
	background(min(mouseX, 100));
	circle(min(mouseX, 100), 0, 80);
}
```

## max

Returns the largest value in a sequence of numbers.

```
@param {...number} args numbers to compare
@returns {number} maximum
```

### webgpu

```js
q5.draw = function () {
	background(max(-mouseX / 100, 0.5));
	circle(max(mouseX, 0), 0, 80);
};
```

### c2d

```js
function draw() {
	background(max(mouseX, 100));
	circle(max(mouseX, 100), 0, 80);
}
```

## pow

Calculates the value of a base raised to a power.

For example, `pow(2, 3)` calculates 2 _ 2 _ 2 which is 8.

```
@param {number} base base
@param {number} exponent exponent
@returns {number} base raised to the power of exponent
```

## sq

Calculates the square of a number.

```
@param {number} n number to square
@returns {number} square of the number
```

## sqrt

Calculates the square root of a number.

```
@param {number} n a number
@returns {number} square root of the number
```

## loge

Calculates the natural logarithm (base e) of a number.

```
@param {number} n a number
@returns {number} natural logarithm of the number
```

## exp

Calculates e raised to the power of a number.

```
@param {number} exponent power to raise e to
@returns {number} e raised to the power of exponent
```

## randomSeed

Sets the seed for the random number generator.

```
@param {number} seed seed value
```

## randomGenerator

Sets the random number generation method.

```
@param {any} method method to use for random number generation
```

## randomGaussian

Generates a random number following a Gaussian (normal) distribution.

```
@param {number} mean mean (center) of the distribution
@param {number} std standard deviation (spread or "width") of the distribution
@returns {number} a random number following a Gaussian distribution
```

## randomExponential

Generates a random number following an exponential distribution.

```
@returns {number} a random number following an exponential distribution
```

## noiseMode

Sets the noise generation mode.

Only the default mode, "perlin", is included in q5.js. Use of the
other modes requires the q5-noiser module.

```
@param {'perlin' | 'simplex' | 'blocky'} mode noise generation mode
```

## noiseSeed

Sets the seed value for noise generation.

```
@param {number} seed seed value
```

## noiseDetail

Sets the level of detail for noise generation.

```
@param {number} lod level of detail (number of octaves)
@param {number} falloff falloff rate for each octave
```

## PI

The ratio of a circle's circumference to its diameter.
Approximately 3.14159.

## TWO_PI

2 \* PI.
Approximately 6.28319.

## TAU

2 \* PI.
Approximately 6.28319.

## HALF_PI

Half of PI.
Approximately 1.5708.

## QUARTER_PI

A quarter of PI.
Approximately 0.7854.
