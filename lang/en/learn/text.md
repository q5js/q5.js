# text

## text

Renders text on the canvas.

Text can be positioned with the x and y
parameters and can optionally be constrained.

```
@param {string} str string of text to display
@param {number} x x-coordinate of the text's position
@param {number} y y-coordinate of the text's position
@param {number} [wrapWidth] maximum line width in characters
@param {number} [lineLimit] maximum number of lines
```

### webgpu

```js
await createCanvas(200, 100);
background('silver');

textSize(32);
text('Hello, world!', -88, 10);
```

```js
await createCanvas(200);
background(0.8);
textSize(20);

let info =
	'q5.js was designed to make creative coding fun and accessible for a new generation of artists, designers, educators, and beginners.';

text(info, -88, -70, 20, 6);
//
//
```

### c2d

```js
createCanvas(200, 100);
background('silver');

textSize(32);
text('Hello, world!', 12, 60);
```

```js
createCanvas(200);
background(200);
textSize(20);

let info =
	'q5.js was designed to make creative coding fun and accessible for a new generation of artists, designers, educators, and beginners.';

text(info, 12, 30, 20, 6);
//
//
```

## loadFont

Loads a font from a URL.

The font file can be in any format accepted in CSS, such as
.ttf and .otf files. The first example below loads
[Robotica](https://www.dafont.com/robotica-courtney.font).

Also supports loading [Google fonts](https://fonts.google.com/).
The second example loads
[Pacifico](https://fonts.google.com/specimen/Pacifico).

If no fonts are loaded, the default sans-serif font is used.

In q5 WebGPU, fonts in [MSDF format](https://github.com/q5js/q5.js/wiki/q5-WebGPU-renderer#text-rendering)
with the file ending "-msdf.json" can be used for high performance text rendering. Make your own using the [MSDF font converter](https://msdf-bmfont.donmccurdy.com/).

By default, assets are loaded in parallel before q5 runs `draw`. Use `await` to wait for a font to load.

```
@param {string} url URL of the font to load
@returns {FontFace & PromiseLike<FontFace>} font
```

### webgpu

```js
await createCanvas(200, 56);

await loadFont('/assets/Robotica.ttf');

fill('skyblue');
textSize(64);
textImage('Hello!', -98, 24);
```

```js
await createCanvas(200, 74);

loadFont('fonts.googleapis.com/css2?family=Pacifico');

q5.draw = function () {
	fill('hotpink');
	textSize(68);
	textImage('Hello!', -98, 31);
};
```

```js
await createCanvas(200, 74);

await loadFont('sans-serif'); // msdf

fill('white');
textSize(68);
textImage('Hello!', -98, 31);
```

### c2d

```js
createCanvas(200, 56);

loadFont('/assets/Robotica.ttf');

function setup() {
	fill('skyblue');
	textSize(64);
	text('Hello!', 2, 54);
}
```

```js
createCanvas(200, 74);

loadFont('fonts.googleapis.com/css2?family=Pacifico');

function setup() {
	fill('hotpink');
	textSize(68);
	text('Hello!', 2, 68);
}
```

## textFont

Sets the current font to be used for rendering text.

By default, the font is set to the [CSS font family](https://developer.mozilla.org/docs/Web/CSS/font-family)
"sans-serif" or the last font loaded.

```
@param {string} fontName name of the font family or a FontFace object
```

### webgpu

```js
await createCanvas(200, 160);
background(0.8);

textFont('serif');

q5.draw = function () {
	textSize(32);
	text('Hello, world!', -96, 10);
};
```

```js
await createCanvas(200);
background(0.8);

textFont('monospace');

q5.draw = function () {
	text('Hello, world!', -68, 10);
};
```

### c2d

```js
createCanvas(200, 160);
background(200);

textFont('serif');

textSize(32);
text('Hello, world!', 15, 90);
```

```js
createCanvas(200);
background(200);

textFont('monospace');

textSize(24);
text('Hello, world!', 15, 90);
```

## textSize

Sets or gets the current font size. If no argument is provided, returns the current font size.

```
@param {number} [size] size of the font in pixels
@returns {number | void} current font size when no argument is provided
```

### webgpu

```js
q5.draw = function () {
	background(0.8);

	textSize(abs(mouseX));
	text('A', -90, 90);
};
```

### c2d

```js
function draw() {
	background(200);

	textSize(abs(mouseX));
	text('A', 10, 190);
}
```

## textLeading

Sets or gets the current line height. If no argument is provided, returns the current line height.

```
@param {number} [leading] line height in pixels
@returns {number | void} current line height when no argument is provided
```

### webgpu

```js
q5.draw = function () {
	background(0.8);

	textSize(abs(mouseX));
	text('A', -90, 90);
	rect(-90, 90, 5, -textLeading());
};
```

### c2d

```js
function draw() {
	background(200);

	textSize(abs(mouseX));
	text('A', 10, 190);
	rect(10, 190, 5, -textLeading());
}
```

## textStyle

Sets the current text style.

```
@param {'normal' | 'italic' | 'bold' | 'bolditalic'} style font style
```

### webgpu

```js
await createCanvas(200);
background(0.8);

textStyle(ITALIC);

textSize(32);
text('Hello, world!', -88, 6);
```

### c2d

```js
createCanvas(200);
background(200);

textStyle(ITALIC);

textSize(32);
text('Hello, world!', 12, 106);
```

## textAlign

Sets the horizontal and vertical alignment of text.

```
@param {'left' | 'center' | 'right'} horiz horizontal alignment
@param {'top' | 'middle' | 'bottom' | 'alphabetic'} [vert] vertical alignment
```

### webgpu

```js
await createCanvas(200);
background(0.8);
textSize(32);

textAlign(CENTER, MIDDLE);
text('Hello, world!', 0, 0);
```

### c2d

```js
createCanvas(200);
background(200);
textSize(32);

textAlign(CENTER, MIDDLE);
text('Hello, world!', 100, 100);
```

## textWeight

Sets the text weight.

- 100: thin
- 200: extra-light
- 300: light
- 400: normal/regular
- 500: medium
- 600: semi-bold
- 700: bold
- 800: bolder/extra-bold
- 900: black/heavy

```
@param {number | string} weight font weight
```

### webgpu

```js
await createCanvas(200);
background(0.8);
textSize(32);
textAlign(CENTER, MIDDLE);

textWeight(100);
text('Hello, world!', 0, 0);
```

### c2d

```js
createCanvas(200);
background(200);
textSize(32);
textAlign(CENTER, MIDDLE);

textWeight(100);
text('Hello, world!', 100, 100);
```

## textWidth

Calculates and returns the width of a given string of text.

```
@param {string} str string to measure
@returns {number} width of the text in pixels
```

### webgpu

```js
q5.draw = function () {
	background(0.8);

	textSize(abs(mouseX));
	rect(-90, 90, textWidth('A'), -textLeading());
	text('A', -90, 90);
};
```

### c2d

```js
function draw() {
	background(200);

	textSize(abs(mouseX));
	rect(10, 190, textWidth('A'), -textLeading());
	text('A', 10, 190);
}
```

## textAscent

Calculates and returns the ascent (the distance from the baseline to the top of the highest character) of the current font.

```
@param {string} str string to measure
@returns {number} ascent of the text in pixels
```

### webgpu

```js
q5.draw = function () {
	background(0.8);

	textSize(abs(mouseX));
	rect(-90, 90, textWidth('A'), -textAscent());
	text('A', -90, 90);
};
```

### c2d

```js
function draw() {
	background(200);

	textSize(abs(mouseX));
	rect(10, 190, textWidth('A'), -textAscent());
	text('A', 10, 190);
}
```

## textDescent

Calculates and returns the descent (the distance from the baseline to the bottom of the lowest character) of the current font.

```
@param {string} str string to measure
@returns {number} descent of the text in pixels
```

### webgpu

```js
await createCanvas(200);
background(0.8);
textSize(64);

rect(-100, 0, 200, textDescent('q5'));
text('q5', -90, 0);
```

### c2d

```js
createCanvas(200);
background(200);
textSize(64);

rect(0, 100, 200, textDescent('q5'));
text('q5', 10, 100);
```

## createTextImage

Creates an image from a string of text.

```
@param {string} str string of text
@param {number} [wrapWidth] maximum line width in characters
@param {number} [lineLimit] maximum number of lines
@returns {Q5.Image} an image object representing the rendered text
```

### webgpu

```js
await createCanvas(200);
textSize(96);

let img = createTextImage('🐶');
img.filter(INVERT);

q5.draw = function () {
	image(img, -45, -90);
};
```

### c2d

```js
createCanvas(200);
textSize(96);

let img = createTextImage('🐶');
img.filter(INVERT);

function draw() {
	image(img, 55, 10);
}
```

## textImage

Renders an image generated from text onto the canvas.

If the first parameter is a string, an image of the text will be
created and cached automatically.

The positioning of the image is affected by the current text
alignment and baseline settings.

In q5 WebGPU, this function is the only way to draw multi-colored
text, like emojis, and to use fonts that aren't in MSDF format.
Using this function to draw text that changes every frame has
a very high performance cost.

```
@param {Q5.Image | string} img image or text
@param {number} x x-coordinate where the image should be placed
@param {number} y y-coordinate where the image should be placed
```

### webgpu

```js
await createCanvas(200);
background(0.8);
textSize(96);
textAlign(CENTER, CENTER);

textImage('🐶', 0, 0);
```

```js
await createCanvas(200);

await load('/assets/Robotica.ttf');

background(0.8);
textSize(66);
textImage('Hello!', -100, -100);
```

### c2d

```js
createCanvas(200);
background(200);
textSize(96);
textAlign(CENTER, CENTER);

textImage('🐶', 100, 100);
```

```js
createCanvas(200);

loadFont('/assets/Robotica.ttf');

function setup() {
	background(200);
	textSize(66);
	textImage('Hello!', 0, 0);
}
```

## nf

Number formatter, can be used to display a number as a string with
a specified number of digits before and after the decimal point,
optionally adding padding with zeros.

```
@param {number} n number to format
@param {number} l minimum number of digits to appear before the decimal point; the number is padded with zeros if necessary
@param {number} r number of digits to appear after the decimal point
@returns {string} a string representation of the number, formatted accordingly
```

### webgpu

```js
await createCanvas(200, 100);
background(0.8);

textSize(32);
text(nf(PI, 4, 5), -90, 10);
```

### c2d

```js
createCanvas(200, 100);
background(200);

textSize(32);
text(nf(PI, 4, 5), 10, 60);
```

## NORMAL

Normal font style.

## ITALIC

Italic font style.

## BOLD

Bold font weight.

## BOLDITALIC

Bold and italic font style.

## LEFT

Align text to the left.

## CENTER

Align text to the center.

## RIGHT

Align text to the right.

## TOP

Align text to the top.

## BOTTOM

Align text to the bottom.

## BASELINE

Align text to the baseline (alphabetic).
