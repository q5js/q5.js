# image

## loadImage

Loads an image from a URL.

By default, assets are loaded in parallel before q5 runs `draw`. Use `await` to wait for an image to load.

```
@param {string} url url of the image to load
@returns {Q5.Image & PromiseLike<Q5.Image>} image
```

### webgpu

```js
await createCanvas(200);

let logo = loadImage('/q5js_logo.avif');

q5.draw = function () {
	background(logo);
};
```

```js
await createCanvas(200);

let logo = await loadImage('/q5js_logo.avif');
background(logo);
```

### c2d

```js
createCanvas(200);

let logo = loadImage('/q5js_logo.avif');

function draw() {
	background(logo);
}
```

## image

Draws an image or video frame to the canvas.

```
@param {Q5.Image | HTMLVideoElement} img image or video to draw
@param {number} dx x position to draw the image at
@param {number} dy y position to draw the image at
@param {number} [dw] width of the destination image
@param {number} [dh] height of the destination image
@param {number} [sx] x position in the source to start clipping a subsection from
@param {number} [sy] y position in the source to start clipping a subsection from
@param {number} [sw] width of the subsection of the source image
@param {number} [sh] height of the subsection of the source image
```

### webgpu

```js
await createCanvas(200);

let logo = loadImage('/q5js_logo.avif');

q5.draw = function () {
	image(logo, -100, -100, 200, 200);
};
```

```js
await createCanvas(200);

let logo = loadImage('/q5js_logo.avif');

q5.draw = function () {
	image(logo, -100, -100, 200, 200, 256, 256, 512, 512);
};
```

### c2d

```js
createCanvas(200);

let logo = loadImage('/q5js_logo.avif');

function draw() {
	image(logo, 0, 0, 200, 200);
}
```

```js
createCanvas(200);

let logo = loadImage('/q5js_logo.avif');

function draw() {
	image(logo, 0, 0, 200, 200, 256, 256, 512, 512);
}
```

## imageMode

Set to `CORNER` (default), `CORNERS`, or `CENTER`.

Changes how inputs to `image` are interpreted.

```
@param {string} mode
```

### webgpu

```js
await createCanvas(200);
let logo = loadImage('/q5js_logo.avif');

q5.draw = function () {
	imageMode(CORNER);

	//   ( img,  x,  y,   w,   h)
	image(logo, -50, -50, 100, 100);
};
```

```js
await createCanvas(200);
let logo = loadImage('/q5js_logo.avif');

q5.draw = function () {
	imageMode(CENTER);

	//   ( img,  cX,  cY,   w,   h)
	image(logo, 0, 0, 100, 100);
};
```

```js
await createCanvas(200);
let logo = loadImage('/q5js_logo.avif');

q5.draw = function () {
	imageMode(CORNERS);

	//   ( img, x1, y1,  x2,  y2)
	image(logo, -50, -50, 50, 50);
};
```

### c2d

```js
createCanvas(200);
let logo = loadImage('/q5js_logo.avif');

function draw() {
	imageMode(CORNER);

	//   ( img,  x,  y,   w,   h)
	image(logo, 50, 50, 100, 100);
}
```

```js
createCanvas(200);
let logo = loadImage('/q5js_logo.avif');

function draw() {
	imageMode(CENTER);

	//   ( img,  cX,  cY,   w,   h)
	image(logo, 100, 100, 100, 100);
}
```

```js
createCanvas(200);
let logo = loadImage('/q5js_logo.avif');

function draw() {
	imageMode(CORNERS);

	//   ( img, x1, y1,  x2,  y2)
	image(logo, 50, 50, 100, 100);
}
```

## defaultImageScale

Sets the default image scale, which is applied to images when
they are drawn without a specified width or height.

By default it is 0.5 so images appear at their actual size
when pixel density is 2. Images will be drawn at a consistent
default size relative to the canvas regardless of pixel density.

This function must be called before images are loaded to
have an effect.

```
@param {number} scale
@returns {number} default image scale
```

## resize

Resizes the image.

```
@param {number} w new width
@param {number} h new height
```

### webgpu

```js
await createCanvas(200);

let logo = await load('/q5js_logo.avif');

logo.resize(128, 128);
image(logo, -100, -100, 200, 200);
```

### c2d

```js
createCanvas(200);

let logo = loadImage('/q5js_logo.avif');

function setup() {
	logo.resize(128, 128);
	image(logo, 0, 0, 200, 200);
}
```

## trim

Returns a trimmed image, cropping out transparent pixels from the edges.

```
@returns {Q5.Image}
```

## smooth

Enables smooth rendering of images displayed larger than
their actual size. This is the default setting, so running this
function only has an effect if `noSmooth` has been called.

### webgpu

```js
await createCanvas(200);
let icon = await load('/q5js_icon.png');
image(icon, -100, -100, 200, 200);
```

### c2d

```js
createCanvas(200);

let icon = loadImage('/q5js_icon.png');

function setup() {
	image(icon, 0, 0, 200, 200);
}
```

## noSmooth

Disables smooth image rendering for a pixelated look.

### webgpu

```js
await createCanvas(200);

let icon = await load('/q5js_icon.png');

noSmooth();
image(icon, -100, -100, 200, 200);
```

### c2d

```js
createCanvas(200);

let icon = loadImage('/q5js_icon.png');

function setup() {
	noSmooth();
	image(icon, 0, 0, 200, 200);
}
```

## tint

Applies a tint (color overlay) to the drawing.

The alpha value of the tint color determines the
strength of the tint. To change an image's opacity,
use the `opacity` function.

Tinting affects all subsequent images drawn. The tint
color is applied to images using the "multiply" blend mode.

Since the tinting process is performance intensive, each time
an image is tinted, q5 caches the result. `image` will draw the
cached tinted image unless the tint color has changed or the
image being tinted was edited.

If you need to draw an image multiple times each frame with
different tints, consider making copies of the image and tinting
each copy separately.

```
@param {string | number} color tint color
```

### webgpu

```js
await createCanvas(200);

let logo = await load('/q5js_logo.avif');

tint(1, 0, 0, 0.5);
image(logo, -100, -100, 200, 200);
```

### c2d

```js
createCanvas(200);

let logo = loadImage('/q5js_logo.avif');

function setup() {
	tint(255, 0, 0, 128);
	image(logo, 0, 0, 200, 200);
}
```

## noTint

Images drawn after this function is run will not be tinted.

## mask

Masks the image with another image.

```
@param {Q5.Image} img image to use as a mask
```

## copy

Returns a copy of the image.

```
@returns {Q5.Image}
```

## inset

Displays a region of the image on another region of the image.
Can be used to create a detail inset, aka a magnifying glass effect.

```
@param {number} sx x-coordinate of the source region
@param {number} sy y-coordinate of the source region
@param {number} sw width of the source region
@param {number} sh height of the source region
@param {number} dx x-coordinate of the destination region
@param {number} dy y-coordinate of the destination region
@param {number} dw width of the destination region
@param {number} dh height of the destination region
```

### webgpu

```js
await createCanvas(200);

let logo = await load('/q5js_logo.avif');

logo.inset(256, 256, 512, 512, 0, 0, 256, 256);
image(logo, -100, -100, 200, 200);
```

### c2d

```js
createCanvas(200);

let logo = loadImage('/q5js_logo.avif');

function setup() {
	logo.inset(256, 256, 512, 512, 0, 0, 256, 256);
	image(logo, 0, 0, 200, 200);
}
```

## get

Retrieves a subsection of an image or canvas as a new Q5 Image
or the color of a pixel in the image or canvas.

If only x and y are specified, this function returns the color of the pixel
at the given coordinate in `[R, G, B, A]` array format. If `loadPixels`
has never been run, it's run by this function.

If you make changes to the canvas or image, you must call `loadPixels`
before using this function to get current color data.

Not applicable to WebGPU canvases.

```
@param {number} x
@param {number} y
@param {number} [w] width of the area, default is 1
@param {number} [h] height of the area, default is 1
@returns {Q5.Image | number[]}
```

### webgpu

```js
await createCanvas(200);

let logo = await load('/q5js_logo.avif');

let cropped = logo.get(256, 256, 512, 512);
image(cropped, -100, -100, 200, 200);
```

### c2d

```js
function draw() {
	background(200);
	noStroke();
	circle(100, 100, frameCount % 200);

	loadPixels();
	let col = get(mouseX, mouseY);
	text(col, mouseX, mouseY);
}
```

```js
createCanvas(200);

let logo = loadImage('/q5js_logo.avif');

function setup() {
	let cropped = logo.get(256, 256, 512, 512);
	image(cropped, 0, 0, 200, 200);
}
```

## set

Sets a pixel's color in the image or canvas. Color mode must be RGB.

Or if a canvas or image is provided, it's drawn on top of the
destination image or canvas, ignoring its tint setting.

Run `updatePixels` to apply the changes.

Not applicable to WebGPU canvases.

```
@param {number} x
@param {number} y
@param {any} val color, canvas, or image
```

### webgpu

```js
await createCanvas(200);

let c = color('lime');
let img = createImage(50, 50);

q5.draw = function () {
	img.set(random(50), random(50), c);
	img.updatePixels();

	background(img);
};
```

### c2d

```js
createCanvas(200);
let c = color('lime');

function draw() {
	set(random(200), random(200), c);
	updatePixels();
}
```

## pixels

Array of pixel color data from a canvas or image.

Empty by default, populate by running `loadPixels`.

Each pixel is represented by four consecutive values in the array,
corresponding to its red, green, blue, and alpha channels.

The top left pixel's data is at the beginning of the array
and the bottom right pixel's data is at the end, going from
left to right and top to bottom.

## loadPixels

Loads pixel data into `pixels` from the canvas or image.

The example below sets some pixels' green channel
to a random value.

Not applicable to WebGPU canvases.

### webgpu

```js
frameRate(5);
let icon = loadImage('/q5js_icon.png');

q5.draw = function () {
	icon.loadPixels();
	for (let i = 0; i < icon.pixels.length; i += 16) {
		icon.pixels[i + 1] = random(1);
	}
	icon.updatePixels();
	background(icon);
};
```

### c2d

```js
frameRate(5);
let icon = loadImage('/q5js_icon.png');

function draw() {
	icon.loadPixels();
	for (let i = 0; i < icon.pixels.length; i += 16) {
		icon.pixels[i + 1] = random(255);
	}
	icon.updatePixels();
	background(icon);
}
```

## updatePixels

Applies changes in the `pixels` array to the canvas or image.

Not applicable to WebGPU canvases.

### webgpu

```js
await createCanvas(200);
let c = color('pink');

let img = createImage(50, 50);
for (let x = 0; x < 50; x += 3) {
	for (let y = 0; y < 50; y += 3) {
		img.set(x, y, c);
	}
}
img.updatePixels();

background(img);
```

### c2d

```js
createCanvas(200);

for (let x = 0; x < 200; x += 5) {
	for (let y = 0; y < 200; y += 5) {
		set(x, y, color('pink'));
	}
}
updatePixels();
```

## filter

Applies a filter to the image.

See the documentation for q5's filter constants below for more info.

A CSS filter string can also be used.
https://developer.mozilla.org/docs/Web/CSS/filter

Not applicable to WebGPU canvases.

```
@param {string} type filter type or a CSS filter string
@param {number} [value] optional value, depends on filter type
```

### webgpu

```js
await createCanvas(200);
let logo = await load('/q5js_logo.avif');
logo.filter(INVERT);
image(logo, -100, -100, 200, 200);
```

### c2d

```js
createCanvas(200);
let logo = loadImage('/q5js_logo.avif');

function setup() {
	logo.filter(INVERT);
	image(logo, 0, 0, 200, 200);
}
```

## THRESHOLD

Converts the image to black and white pixels depending if they are above or below a certain threshold.

## GRAY

Converts the image to grayscale by setting each pixel to its luminance.

## OPAQUE

Sets the alpha channel to fully opaque.

## INVERT

Inverts the color of each pixel.

## POSTERIZE

Limits each channel of the image to the number of colors specified as an argument.

## DILATE

Increases the size of bright areas.

## ERODE

Increases the size of dark areas.

## BLUR

Applies a Gaussian blur to the image.

## createImage

Creates a new image.

```
@param {number} w width
@param {number} h height
@param {any} [opt] optional settings for the image
@returns {Q5.Image}
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
