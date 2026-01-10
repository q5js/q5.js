# color

## color

Creates a new `Color` object, which is primarily useful for storing
a color that your sketch will reuse or modify later.

With the default color mode, RGB, colors have `r`/`red`, `g`/`green`,
`b`/`blue`, and `a`/`alpha` components.

The [`fill`](https://q5js.org/learn/#fill), [`stroke`](https://q5js.org/learn/#stroke), and [`background`](https://q5js.org/learn/#background)
functions accept the same wide range of color representations as this function.

```
@param {string | number | Color | number[]} c0 color or first color component
@param {number} [c1] second color component
@param {number} [c2] third color component
@param {number} [c3] fourth color component (alpha)
@returns {Color} a new `Color` object
```

### webgpu

The default color format is "float", so
set color components to values between 0 and 1.

Here are some examples of valid use:

- `color(1)` (grayscale)
- `color(1, 0.8)` (grayscale, alpha)
- `color(1, 0, 0)` (r, g, b)
- `color(1, 0, 0, 0.1)` (r, g, b, a)
- `color('red')` (colorName)
- `color('#ff0000')` (hexColor)
- `color([1, 0, 0])` (colorComponents)

```js
await Canvas(200);
rect(-100, -100, 100, 200);

//                ( r,   g,   b,   a)
let bottle = color(0.35, 0.39, 1, 0.4);
fill(bottle);
stroke(bottle);
strokeWeight(30);
circle(0, 0, 155);
```

```js
await Canvas(200);
//          (gray, alpha)
let c = color(0.8, 0.2);

q5.draw = function () {
	background(c);
	circle(mouseX, mouseY, 50);
	c.g = (c.g + 0.005) % 1;
};
```

```js
await Canvas(200);

//           (r, g, b,   a)
let c = color(0, 1, 1, 0.2);

q5.draw = function () {
	fill(c);
	circle(mouseX, mouseY, 50);
};
```

### c2d

The default color format is "integer",
so set components to values between 0 and 255.

Here are some examples of valid use:

- `color(255)` (grayscale)
- `color(255, 200)` (grayscale, alpha)
- `color(255, 0, 0)` (r, g, b)
- `color(255, 0, 0, 10)` (r, g, b, a)
- `color('red')` (colorName)
- `color('#ff0000')` (hexColor)
- `color([255, 0, 0])` (colorComponents)

```js
createCanvas(200);
rect(0, 0, 100, 200);

//                ( r,   g,   b,   a)
let bottle = color(90, 100, 255, 100);
fill(bottle);
stroke(bottle);
strokeWeight(30);
circle(100, 100, 155);
```

```js
createCanvas(200);
//          (gray, alpha)
let c = color(200, 50);

function draw() {
	background(c);
	circle(mouseX, mouseY, 50);
	c.g = (c.g + 1) % 256;
}
```

```js
createCanvas(200);

//           (r,   g,   b,  a)
let c = color(0, 255, 255, 50);

function draw() {
	fill(c);
	circle(mouseX, mouseY, 50);
}
```

## colorMode

Sets the color mode for the sketch, which changes how colors are
interpreted and displayed.

Color gamut is 'display-p3' by default, if the device supports HDR.

```
@param {'rgb' | 'oklch' | 'hsl' | 'hsb'} mode color mode
@param {1 | 255} format color format (1 for float, 255 for integer)
@param {'srgb' | 'display-p3'} [gamut] color gamut
```

### webgpu

The default color mode is RGB in float format.

```js
await Canvas(200);

colorMode(RGB, 1);
fill(1, 0, 0);
rect(-100, -100, 66, 200);
fill(0, 1, 0);
rect(-34, -100, 67, 200);
fill(0, 0, 1);
rect(33, -100, 67, 200);
```

```js
await Canvas(200);

colorMode(OKLCH);

fill(0.25, 0.15, 0);
rect(-100, -100, 100, 200);

fill(0.75, 0.15, 0);
rect(0, -100, 100, 200);
```

### c2d

The default color mode is RGB in legacy integer format.

```js
createCanvas(200);

colorMode(RGB, 1);
fill(1, 0, 0);
rect(0, 0, 66, 200);
fill(0, 1, 0);
rect(66, 0, 67, 200);
fill(0, 0, 1);
rect(133, 0, 67, 200);
```

```js
createCanvas(200);

colorMode(OKLCH);

fill(0.25, 0.15, 0);
rect(0, 0, 100, 200);

fill(0.75, 0.15, 0);
rect(100, 0, 100, 200);
```

## RGB

RGB colors have components `r`/`red`, `g`/`green`, `b`/`blue`,
and `a`/`alpha`.

By default when a canvas is using the HDR "display-p3" color space,
rgb colors are mapped to the full P3 gamut, even when they use the
legacy integer 0-255 format.

### webgpu

```js
await Canvas(200, 100);

colorMode(RGB);

background(1, 0, 0);
```

### c2d

```js
createCanvas(200, 100);

colorMode(RGB);

background(255, 0, 0);
```

## OKLCH

OKLCH colors have components `l`/`lightness`, `c`/`chroma`,
`h`/`hue`, and `a`/`alpha`. It's more intuitive for humans
to work with color in these terms than RGB.

OKLCH is perceptually uniform, meaning colors at the
same lightness and chroma (colorfulness) will appear to
have equal luminance, regardless of the hue.

OKLCH can accurately represent all colors visible to the
human eye, unlike many other color spaces that are bounded
to a gamut. The maximum lightness and chroma values that
correspond to sRGB or P3 gamut limits vary depending on
the hue. Colors that are out of gamut will be clipped to
the nearest in-gamut color.

Use the [OKLCH color picker](https://oklch.com) to find
in-gamut colors.

- `lightness`: 0 to 1
- `chroma`: 0 to ~0.4
- `hue`: 0 to 360
- `alpha`: 0 to 1

### webgpu

```js
await Canvas(200, 100);

colorMode(OKLCH);

background(0.64, 0.3, 30);
```

```js
await Canvas(200);
colorMode(OKLCH);

q5.draw = function () {
	background(0.7, 0.16, frameCount % 360);
};
```

### c2d

```js
createCanvas(200, 100);

colorMode(OKLCH);

background(0.64, 0.3, 30);
```

```js
createCanvas(200);
colorMode(OKLCH);

function draw() {
	background(0.7, 0.16, frameCount % 360);
}
```

## HSL

HSL colors have components `h`/`hue`, `s`/`saturation`,
`l`/`lightness`, and `a`/`alpha`.

HSL was created in the 1970s to approximate human perception
of color, trading accuracy for simpler computations. It's
not perceptually uniform, so colors with the same lightness
can appear darker or lighter, depending on their hue
and saturation. Yet, the lightness and saturation values that
correspond to gamut limits are always 100, regardless of the
hue. This can make HSL easier to work with than OKLCH.

HSL colors are mapped to the full P3 gamut when
using the "display-p3" color space.

- `hue`: 0 to 360
- `saturation`: 0 to 100
- `lightness`: 0 to 100
- `alpha`: 0 to 1

### webgpu

```js
await Canvas(200, 100);

colorMode(HSL);

background(0, 100, 50);
```

```js
await Canvas(200, 220);
noStroke();

colorMode(HSL);
for (let h = 0; h < 360; h += 10) {
	for (let l = 0; l <= 100; l += 10) {
		fill(h, 100, l);
		rect(h * (11 / 20) - 100, l * 2 - 110, 6, 20);
	}
}
```

### c2d

```js
createCanvas(200, 100);

colorMode(HSL);

background(0, 100, 50);
```

```js
createCanvas(200, 220);
noStroke();

colorMode(HSL);
for (let h = 0; h < 360; h += 10) {
	for (let l = 0; l <= 100; l += 10) {
		fill(h, 100, l);
		rect(h * (11 / 20), l * 2, 6, 20);
	}
}
```

## HSB

HSB colors have components `h`/`hue`, `s`/`saturation`,
`b`/`brightness` (aka `v`/`value`), and `a`/`alpha`.

HSB is similar to HSL, but instead of lightness
(black to white), it uses brightness (black to
full color). To produce white, set brightness
to 100 and saturation to 0.

- `hue`: 0 to 360
- `saturation`: 0 to 100
- `brightness`: 0 to 100
- `alpha`: 0 to 1

### webgpu

```js
await Canvas(200, 100);

colorMode(HSB);

background(0, 100, 100);
```

```js
await Canvas(200, 220);
noStroke();

colorMode(HSB);
for (let h = 0; h < 360; h += 10) {
	for (let b = 0; b <= 100; b += 10) {
		fill(h, 100, b);
		rect(h * (11 / 20) - 100, b * 2 - 110, 6, 20);
	}
}
```

### c2d

```js
createCanvas(200, 100);

colorMode(HSB);

background(0, 100, 100);
```

```js
createCanvas(200, 220);
noStroke();

colorMode(HSB);
for (let h = 0; h < 360; h += 10) {
	for (let b = 0; b <= 100; b += 10) {
		fill(h, 100, b);
		rect(h * (11 / 20), b * 2, 6, 20);
	}
}
```

## SRGB

Limits the color gamut to the sRGB color space.

If your display is HDR capable, note that full red appears
less saturated and darker in this example, as it would on
an SDR display.

### webgpu

```js
await Canvas(200, 100);

colorMode(RGB, 1, SRGB);

background(1, 0, 0);
```

### c2d

```js
createCanvas(200, 100);

colorMode(RGB, 255, SRGB);

background(255, 0, 0);
```

## DISPLAY_P3

Expands the color gamut to the P3 color space.

This is the default color gamut on devices that support HDR.

If your display is HDR capable, note that full red appears
fully saturated and bright in the following example.

### webgpu

```js
await Canvas(200, 100);

colorMode(RGB, 1, DISPLAY_P3);

background(1, 0, 0);
```

### c2d

```js
createCanvas(200, 100);

colorMode(RGB, 255, DISPLAY_P3);

background(255, 0, 0);
```

## background

Draws over the entire canvas with a color or image.

Like the [`color`](https://q5js.org/learn/#color) function,
this function can accept colors in a wide range of formats:
CSS color string, grayscale value, and color component values.

```
@param {Color | Q5.Image} filler a color or image to draw
```

### webgpu

```js
await Canvas(200, 100);
background('crimson');
```

```js
q5.draw = function () {
	background(0.5, 0.2);
	circle(mouseX, mouseY, 20);
};
```

### c2d

```js
createCanvas(200, 100);
background('crimson');
```

```js
function draw() {
	background(128, 32);
	circle(mouseX, mouseY, 20);
}
```

## Color.constructor

This constructor strictly accepts 4 numbers, which are the color
components.

Use the `color` function for greater flexibility, it runs
this constructor internally.

`Color` is not actually a class itself, it's a reference to a
Q5 color class based on the color mode, format, and gamut.

## Color.equals

Checks if this color is exactly equal to another color.

## Color.isSameColor

Checks if the color is the same as another color,
disregarding their alpha values.

## Color.toString

Produces a CSS color string representation.

## Color.levels

An array of the color's components.
