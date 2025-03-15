/**
 * q5.d.ts
 * 
 * TypeScript definitions for q5.js for use with IDEs like VSCode
 * for autocompletion, hover over documentation, and type checking.
 */
declare global {
	// ⭐️ core

	/** ⭐️
	 * Welcome to q5's documentation! 🤩
	 * 
	 * First time coding? Check out the [q5 Beginner's Brief](https://github.com/q5js/q5.js/wiki/q5-Beginner's-Brief).
	 * 
	 * On these Learn pages, you can experiment with editing the 
	 * interactive mini examples. Have fun! 😎
	 */

	/** ⭐️
	 * The draw function is run 60 times per second by default.
	 * @example
function draw() {
  background('silver');
	circle(frameCount % 200, 100, 80);
}
	 */
	function draw(): void;

	/** ⭐️
	 * The setup function is run once, when the program starts.
	 * @example
function setup() {
	createCanvas(200, 100);
	background('aqua');
}
	 */
	function setup(): void;

	/** ⭐️
	 * Load assets in the preload function to ensure that they'll be
	 * ready to use in the setup and draw functions.
	 * 
	 * q5's preload system can also be used without a preload function
	 * if you create a canvas first, as shown in the second example.
	 * @example
let logo;

function preload() {
	logo = loadImage('/q5js_logo.webp');
}

function draw() {
	background(logo);
}
	 * @example
createCanvas(200, 100);

let logo = loadImage('/q5js_logo.webp');

function draw() {
	background(logo);
}
	 */
	function preload(): void;

	/** ⭐️
	 * The number of frames that have been displayed since the program started.
	 * @example
function draw() {
	background(200);
	textSize(64);
	text(frameCount, 8, 120);
}
	 */
	var frameCount: number;

	/** ⭐️
	 * Stops the draw loop.
	 * @example
function draw() {
  circle(frameCount * 5, 100, 80);
  noLoop();
}
	 */
	function noLoop(): void;

	/** ⭐️
	 * Redraws the canvas n times. If no input parameter is provided,
	 * it calls the draw function once.
	 * @param {number} [n] number of times to redraw the canvas, default is 1
	 * @example
createCanvas(200);
noLoop();

function draw() {
  circle(frameCount * 5, 100, 80);
}
function mousePressed() {
  redraw(10);
}
	 */
	function redraw(n?: number): void;

	/** ⭐️
	 * Starts the draw loop again if it was stopped.
	 * @example
createCanvas(200);
noLoop();

function draw() {
  circle(frameCount * 5, 100, 80);
}
function mousePressed() {
  loop();
}
	 */
	function loop(): void;

	/** ⭐️
	 * Sets the target frame rate or gets an approximation of the
	 * sketch's current frame rate.
	 * 
	 * Even when the sketch is running at a consistent frame rate,
	 * the current frame rate value will fluctuate. Use your web browser's
	 * developer tools for more accurate performance analysis.
	 * @param {number} [hertz] target frame rate, default is 60
	 * @returns {number} current frame rate
	 * @example
function draw() {
	background(200);

	if (mouseIsPressed) frameRate(10);
	else frameRate(60);

	circle(frameCount % 200, 100, 80);
}
	 * @example
function draw() {
	background(200);
	textSize(64);
	text(round(frameRate()), 65, 120);
}
	 */
	function frameRate(hertz?: number): number;

	/** ⭐️
	 * The desired frame rate of the sketch.
	 * @returns {number} target frame rate
	 * @example
function draw() {
	background(200);
	textSize(64);

	text(getTargetFrameRate(), 65, 120);
}
	 */
	function getTargetFrameRate(): number;

	/** ⭐️
	 * Gets the current FPS, in terms of how many frames could be generated
	 * in one second, which can be higher than the target frame rate.
	 * 
	 * Use your web browser's developer tools for more in-depth
	 * performance analysis.
	 * @returns {number} frames per second
	 * @example
function draw() {
	background(200);
	frameRate(1);
	textSize(64);

	text(getFPS(), 8, 120);
}
	 */
	function getFPS(): number;

	/** ⭐️
	 * Logs a message to the JavaScript console. Alias for the standard
	 * [`console.log`](https://developer.mozilla.org/docs/Web/API/console/log_static) function.
	 * 
	 * You can open web developer tools in most browsers by using the 
	 * keyboard shortcut `Ctrl + Shift + i` or `command + option + i`,
	 * then click the "Console" tab.
	 * @param {*} message message to log
	 */
	function log(message: any): void;

	/** ⭐️
	 * Runs after each `draw` function call and post draw hooks.
	 * 
	 * Useful for adding post-processing effects when it's not possible
	 * to do so at the end of the `draw` function, such as when using
	 * libraries like p5play that draw to the canvas after the `draw`
	 * function is run.
	 * @example
function draw() {
	background(200);
	circle(frameCount % 200, 100, 80);
}

function postProcess() {
	filter(INVERT);
}
	 */
	function postProcess(): void;

	/** ⭐️
	 * The width of the window.
	 * @example
function draw() {
	background(200);
	textSize(64);
	textAlign(CENTER, CENTER);
	text(windowWidth, 100, 100);
}
	 */
	var windowWidth: number;

	/** ⭐️
	 * The height of the window.
	 * @example
function draw() {
	background(200);
	textSize(64);
	textAlign(CENTER, CENTER);
	text(windowHeight, 100, 100);
}
	 */
	var windowHeight: number;

	/** ⭐️
	 * The time passed since the last frame was drawn.
	 * 
	 * With the default frame rate of 60, delta time will be
	 * approximately 16.6
	 * 
	 * Can be used to keep movements tied to real time if the sketch
	 * is often dropping below the target frame rate. Although if frame 
	 * rates are consistently low, consider reducing the target frame
	 * rate instead.
	 * @example
function draw() {
	background(200);
	text(deltaTime, 60, 106);
}
	 * @example
let x = 0;
function draw() {
	background(200);
	// simulate frame rate drops
	frameRate(random(30, 60));

	x += deltaTime * 0.2;
	circle(x % 200, 100, 20);
}
	 */
	var deltaTime: number;

	/** ⭐️
	 * q5 uses the same preload system as p5.js v1
	 * to load assets asynchronously, before the setup and draw
	 * functions are run. It makes it very easy for users to
	 * load many images, sounds, and other assets at the same time.
	 * 
	 * In p5.js v2, the preload system was entirely removed in
	 * favor of having load* functions, such as `loadImage`,
	 * return promises.
	 * 
	 * In q5 the [`load`](https://q5js.org/learn/#load) function can be used to load a file or
	 * multiple files, and it returns a promise that resolves
	 * when the file(s) are loaded.
	 * 
	 * Disable the preload system in q5 to make load* functions
	 * return promises, to match p5.js v2 behavior.
	 * @example
new Q5();
disablePreloadSystem();

logo = await loadImage('/q5js_logo.webp');

function draw() {
	background(logo);
}
	 */
	function disablePreloadSystem(): void;

	class Q5 {
		/** ⭐️
		 * Creates an instance of Q5.
		 *
		 * Running `new Q5()` starts q5 in top-level global mode,
		 * enabling use of q5 functions and variables on the file level, 
		 * outside of `setup` and `draw`. You can also start Q5 in this mode
		 * by running [`createCanvas`](https://q5js.org/learn/#createCanvas) 
		 * on the file level.
		 * 
		 * If users don't create a new instance of Q5 themselves, an 
		 * instance will be created automatically, replicating
		 * p5's limited global mode. p5's instance mode is supported by 
		 * this constructor as well but its use is deprecated, use
		 * [q5's namespaced instance mode](https://github.com/q5js/q5.js/wiki/Instance-Mode) instead.
		 * 
		 * Run [`Q5.webgpu()`](https://github.com/q5js/q5.js/wiki/q5-WebGPU-renderer) instead of this constructor to use
		 * q5's WebGPU renderer.
		 * @param {string | Function} [scope]
		 *   - "global": (default) adds q5 functions and variables to the global scope
		 *   - "instance": does not add q5 functions or variables to the global scope
		 * @param {HTMLElement} [parent] element that the canvas will be placed inside
		 * @example
new Q5();
createCanvas(200, 100);
circle(100, 50, 80);
		 * @example
let q = new Q5('instance');
q.createCanvas(200, 100);
q.circle(100, 50, 20);
		 */
		constructor(scope?: string | Function, parent?: HTMLElement);

		/** ⭐️
		 * Q5 reformats some errors to make them more readable for beginners.
		 * @default false
		 */
		static disableFriendlyErrors: boolean;

		/** ⭐️
		 * Sets the default canvas context attributes for all Q5 instances
		 * and graphics.
		 * @default { alpha: false, colorSpace: 'display-p3' }
		 */
		static canvasOptions: {};

		/** ⭐️
		 * True if the device supports HDR (the display-p3 colorspace).
		 */
		static supportsHDR: boolean;

		/** ⭐️
		 * Modules added to this object will be added to new Q5 instances.
		 */
		static modules: {};

		static Image: {
			new(w: number, h: number, opt?: any): Q5.Image;
		}

		/** ⭐️
		 * Creates a new Q5 instance with the q5.js WebGPU renderer.
		 */
		static WebGPU(): Q5;
	}

	namespace Q5 {
		interface Image {
			width: number;
			height: number;
		}
	}

	// ⬜️ canvas

	/** ⬜️
	 * Creates a canvas element, a section of the screen your program
	 * can draw on.
	 * 
	 * Run this function to start using q5. If this function is not run
	 * by the user, a 200x200 canvas will be created automatically before
	 * the draw loop starts.
	 * 
	 * In q5 WebGPU, this function must be run before running other
	 * q5 functions.
	 * @param {number} [w] width or size of the canvas
	 * @param {number} [h] height of the canvas
	 * @param {Object} [opt] options for the canvas
	 * @param {boolean} [opt.alpha] whether the canvas should have an alpha channel that allows it to be seen through, default is false
	 * @param {string} [opt.colorSpace] color space of the canvas, either "srgb" or "display-p3", default is "display-p3" for devices that support HDR colors
	 * @returns {HTMLCanvasElement} created canvas element
	 * @example
createCanvas(200, 100);
circle(100, 50, 80);
	 * @example
createCanvas(200, 200, { alpha: true });

function draw() {
	clear();
	circle(frameCount % 200, 100, 80);
}
	 */
	function createCanvas(w?: number, h?: number, options?: CanvasRenderingContext2DSettings): HTMLCanvasElement;

	/** ⬜️
	 * The canvas element associated with the Q5 instance.
	 * 
	 * @prop {number} w
	 * @prop {number} width
	 * @prop {number} h
	 * @prop {number} height
	 * @prop {number} hw half the width
	 * @prop {number} hh half the height
	 * @prop {string} renderer either "c2d" (Canvas2D) or "webgpu"
	 */
	var canvas: HTMLCanvasElement;

	/** ⬜️
	 * Clears the canvas, making every pixel completely transparent.
	 *
	 * Note that the canvas can only be seen through if it has an alpha channel.
	 */
	function clear(): void;

	/** ⬜️
	 * Sets the fill color for shapes. The default is white.
	 * 
	 * Like the [`color`](https://q5js.org/learn/#color) function, this function
	 * can accept colors in a wide range of formats: as a CSS color string,
	 * a `Color` object, grayscale value, or color component values.
	 * @param {Color} color fill color
	 * @example
createCanvas(200);
background(200);

fill('red');
circle(80, 80, 80);

fill('lime');
square(80, 80, 80);
	 */
	function fill(color: Color): void;

	/** ⬜️
	 * Sets the stroke (outline) color for shapes. The default is black.
	 * 
	 * Like the [`color`](https://q5js.org/learn/#color) function, this function
	 * can accept colors in a wide range of formats: as a CSS color string,
	 * a `Color` object, grayscale value, or color component values.
	 * @param {Color} color stroke color
	 * @example
createCanvas(200);
background(200);
fill(36);

stroke('red');
circle(80, 80, 80);

stroke('lime');
square(80, 80, 80);
	 */
	function stroke(color: Color): void;

	/** ⬜️
	 * After calling this function, shapes will not be filled.
	 * @example
createCanvas(200);
background(200);

noFill();

stroke('red');
circle(80, 80, 80);
stroke('lime');
square(80, 80, 80);
	 */
	function noFill(): void;

	/** ⬜️
	 * After calling this function, shapes will not have a stroke (outline).
	 * @example
createCanvas(200);
background(200);
fill(36);
stroke('red');
circle(80, 80, 80);

noStroke();
square(80, 80, 80);
	 */
	function noStroke(): void;

	/** ⬜️
	 * Sets the size of the stroke used for lines and the border around shapes.
	 * @param {number} weight size of the stroke in pixels
	 * @example
createCanvas(200);
background(200);
stroke('red');
circle(50, 100, 80);

strokeWeight(20);
circle(150, 100, 80);
	 */
	function strokeWeight(weight: number): void;

	/** ⬜️
	 * Sets the global opacity, which affects all subsequent drawing operations, except `background`. Default is 1, fully opaque.
	 * @param {number} alpha opacity level, ranging from 0 to 1
	 * @example
createCanvas(200);
background(200);

opacity(1);
circle(80, 80, 80);

opacity(0.2);
square(80, 80, 80);
	 */
	function opacity(alpha: number): void;

	/** ⬜️
	 * Sets the shadow color. The default is transparent (no shadow).
	 * 
	 * Shadows apply to anything drawn to the canvas, including filled
	 * shapes, strokes, text, and images.
	 * 
	 * Like the [`color`](https://q5js.org/learn/#color) function, this function
	 * can accept colors in a wide range of formats: as a CSS color string,
	 * a `Color` object, grayscale value, or color component values.
	 * 
	 * Not available in q5 WebGPU.
	 * @param {Color} color shadow color
	 * @example
createCanvas(200);
background(200);

noFill();
shadow('black');
rect(64, 60, 80, 80);
text('q5', 100, 100);
	 * @example
createCanvas(200);
let logo = loadImage('/assets/p5play_logo.webp');

function setup() {
	background(200);
	shadow(0);
	image(logo, 36, 36, 128, 128);
}
	 */
	function shadow(color: string | Color): void;

	/** ⬜️
	 * Disables the shadow effect.
	 * @example
createCanvas(200);
background(200);
noStroke();
shadow('black');
rect(14, 14, 80, 80);

noShadow();
rect(104, 104, 80, 80);
	 */
	function noShadow(): void;

	/** ⬜️
	 * Sets the shadow offset and blur radius.
	 * 
	 * When q5 starts, shadow offset is (10, 10) with a blur of 10.
	 * @param {number} offsetX horizontal offset of the shadow
	 * @param {number} offsetY vertical offset of the shadow, defaults to be the same as offsetX
	 * @param {number} blur blur radius of the shadow, defaults to 0
	 * @example
createCanvas(200);
noStroke();
shadow(50);

function draw() {
  background(200);
	shadowBox(-20, mouseY, 10);
	circle(100, 100, 80, 80);
}
	 * @example
createCanvas(200);
background(200);
noStroke();

shadow('aqua');
shadowBox(20);
rect(50, 50, 100, 100);
textSize(64);
text('q5', 60, 115);
	 */
	function shadowBox(offsetX: number, offsetY: number, blur: number): void;

	/** ⬜️
	 * The width of the canvas.
	 */
	var width: number;

	/** ⬜️
	 * The height of the canvas.
	 */
	var height: number;

	/**	⬜️
	 * Half the width of the canvas.
	 */
	var halfWidth: number;

	/** ⬜️
	 * Half the height of the canvas.
	 */
	var halfHeight: number;

	/** ⬜️
	 * Translates the origin of the drawing context.
	 * @param {number} x translation along the x-axis
	 * @param {number} y translation along the y-axis
	 * @example
function draw() {
	background(200);
	
	translate(100, 100);
	circle(0, 0, 80);
}
	 */
	function translate(x: number, y: number): void;

	/** ⬜️
	 * Rotates the drawing context.
	 * @param {number} angle rotation angle in radians
	 * @example
function draw() {
	background(200);
	
	translate(100, 100);
	rotate(QUARTER_PI);

	// drawn from its top-left corner by default
	square(0, 0, 50);
}
	 */
	function rotate(angle: number): void;

	/** ⬜️
	 * Scales the drawing context.
	 * 
	 * If only one input parameter is provided,
	 * the drawing context will be scaled uniformly.
	 * @param {number} x scaling factor along the x-axis
	 * @param {number} [y] scaling factor along the y-axis
	 * @example
function draw() {
	background(200);
	
	scale(4);
	circle(0, 0, 80);
}
	 */
	function scale(x: number, y?: number): void;

	/** ⬜️
	 * Shears the drawing context along the x-axis.
	 * @param {number} angle shear angle in radians
	 * @example
function draw() {
	background(200);
	
	translate(25, 60);
	shearX(QUARTER_PI);
	square(0, 0, 80);
}
	 */
	function shearX(angle: number): void;

	/** ⬜️
	 * Shears the drawing context along the y-axis.
	 * @param {number} angle shear angle in radians
	 * @example
function draw() {
	background(200);
	
	translate(25, 60);
	shearY(QUARTER_PI);
	square(0, 0, 80);
}
	 */
	function shearY(angle: number): void;

	/** ⬜️
	 * Applies a transformation matrix.
	 *
	 * Accepts a 3x3 or 4x4 matrix as either an array or multiple arguments.
	 * @param {number} a horizontal scaling
	 * @param {number} b horizontal skewing
	 * @param {number} c vertical skewing
	 * @param {number} d vertical scaling
	 * @param {number} e horizontal moving
	 * @param {number} f vertical moving
	 * @example
function draw() {
	background(200);

	applyMatrix(2, 1, 1, 1, 100, 100);
	circle(0, 0, 80);
}
	 */
	function applyMatrix(a: number, b: number, c: number, d: number, e: number, f: number): void;

	/** ⬜️
	 * Resets the transformation matrix.
	 * 
	 * q5 runs this function before every time the `draw` function is run,
	 * so that transformations don't carry over to the next frame.
	 * @example
createCanvas(200);
background(200);

translate(100, 100);
circle(0, 0, 80);

resetMatrix();
square(0, 0, 50);
	 */
	function resetMatrix(): void;

	/** ⬜️
	 * Saves the current transformation matrix.
	 * @example
createCanvas(200);
background(200);
translate(100, 100);
pushMatrix();
rotate(QUARTER_PI);
ellipse(0, 0, 120, 40);
popMatrix();
ellipse(0, 0, 120, 40);
	 */
	function pushMatrix(): void;

	/** ⬜️
	 * Restores the previously saved transformation matrix.
	 * @example
createCanvas(200);
background(200);
translate(100, 100);
pushMatrix();
rotate(QUARTER_PI);
ellipse(0, 0, 120, 40);
popMatrix();
ellipse(0, 0, 120, 40);
	 */
	function popMatrix(): void;

	/** ⬜️
	 * Saves the current drawing style settings.
	 *
	 * This includes the fill, stroke, stroke weight, tint, image mode, 
	 * rect mode, ellipse mode, text size, text align, text baseline, and
	 * shadow settings.
	 * @example
function draw() {
	background(200);

	pushStyles();
	fill('blue');
	circle(50, 50, 80);
	popStyles();
	circle(150, 150, 80);
}
	 */
	function pushStyles(): void;

	/** ⬜️
	 * Restores the previously saved drawing style settings.
	 */
	function popStyles(): void;

	/** ⬜️
	 * Saves the current drawing style settings and transformations.
	 * @example
createCanvas(200);

push();
fill('blue');
translate(100, 100);
circle(0, 0, 80);
pop();

square(0, 0, 50);
	 */
	function push(): void;

	/** ⬜️
	 * Restores the previously saved drawing style settings and transformations.
	 */
	function pop(): void;

	/** ⬜️
	 * Resizes the canvas to the specified width and height.
	 * @param {number} w width of the canvas
	 * @param {number} h height of the canvas
	 */
	function resizeCanvas(w: number, h: number): void;

	/** ⬜️
	 * Sets the pixel density of the canvas.
	 * @param {number} v pixel density value
	 * @returns {number} pixel density
	 */
	function pixelDensity(v: number): number;

	/** ⬜️
	 * Returns the current display density.
	 * @returns {number} display density
	 */
	function displayDensity(): number;

	/** ⬜️
	 * Enables or disables fullscreen mode.
	 * @param {boolean} [v] boolean indicating whether to enable or disable fullscreen mode
	 * @returns {void | boolean} true if fullscreen mode is enabled, false otherwise
	 */
	function fullscreen(v?: boolean): void | boolean;

	/** ⬜️
	 * Any position coordinates or dimensions you use will be scaled based
	 * on the unit provided to this function.
	 * 
	 * Not available in q5 WebGPU.
	 * @param {number} unit unit to scale by
	 * @example
createCanvas(200);
flexibleCanvas(100);
// rect will appear in the middle of the canvas
rect(20, 20, 60, 60);
	 */
	function flexibleCanvas(unit: number): void;

	/** ⬜️
	 * Creates a graphics buffer.
	 * 
	 * Not recommended for use in q5 WebGPU.
	 * @param {number} w width
	 * @param {number} h height
	 * @param {Object} [opt] options
	 * @returns {Q5} a new Q5 graphics buffer
	 */
	function createGraphics(w: number, h: number, opt?: any): Q5;

	/** ⬜️
	 * The 2D rendering context for the canvas, if using the Canvas2D
	 * renderer.
	 */
	var ctx: CanvasRenderingContext2D;

	/** ⬜️
	 * Alias for `ctx`, the 2D rendering context for the canvas.
	 */
	var drawingContext: CanvasRenderingContext2D;

	// 🎨 color

	/** 🎨
	 * Creates a new `Color` object, which is primarily useful for storing
	 * a color that your sketch will reuse or modify later.
	 * 
	 * With the default RGB color mode, colors have these components:
	 * 
	 * `r`/`red`, `g`/`green`, `b`/`blue`, and `a`/`alpha`.
	 * 
	 * The default color format is integer, so set color components
	 * to values between 0 and 255.
	 * 
	 * In q5 WebGPU, the default color mode is RGB in float format, so
	 * set color components to values between 0 and 1.
	 * 
	 * The [`fill`](https://q5js.org/learn/#fill), [`stroke`](https://q5js.org/learn/#stroke), and [`background`](https://q5js.org/learn/#background) functions
	 * accept the same wide range of color representations as this function.
	 * 
	 * Here are some examples of valid use:
	 * 
	 * - `color(255)` (grayscale)
	 * - `color(255, 200)` (grayscale, alpha)
	 * - `color(255, 0, 0)` (r, g, b)
	 * - `color(255, 0, 0, 10)` (r, g, b, a)
	 * - `color('red')` (colorName)
	 * - `color('#ff0000')` (hexColor)
	 * - `color([255, 0, 0])` (colorComponents)
	 * @param {string | number | Color | number[]} c0 color or first color component
	 * @param {number} [c1] second color component
	 * @param {number} [c2] third color component
	 * @param {number} [c3] fourth color component (alpha)
	 * @returns {Color} a new `Color` object
	 * @example
createCanvas(200);
rect(0, 0, 100, 200);

//                ( r,   g,   b,   a)
let bottle = color(90, 100, 255, 100);
fill(bottle);
stroke(bottle);
strokeWeight(30);
circle(100, 100, 155);
	 * @example
createCanvas(200);
//          (gray, alpha)
let c = color(200, 50);

function draw() {
	background(c);
	circle(mouseX, mouseY, 50);
	c.g = (c.g + 1) % 255;
}
	 */
	function color(c0: string | number | Color | number[], c1?: number, c2?: number, c3?: number): Color;

	/** 🎨
	 * Sets the color mode for the sketch, which changes how colors are
	 * interpreted and displayed.
	 * 
	 * The default color mode is RGB in legacy integer format.
	 *
	 * In WebGPU, the default is RGB in float format (best performance).
	 * 
	 * Color gamut is 'display-p3' by default, if the device supports HDR.
	 * 
	 * @param {'rgb' | 'oklch' | 'hsl' | 'hsb'} mode color mode
	 * @param {1 | 255} format color format (1 for float, 255 for integer)
	 * @param {'srgb' | 'display-p3'} [gamut] color gamut
	 * @example
createCanvas(200);

colorMode(RGB, 1);
fill(1, 0, 0);
rect(0, 0, 66, 200);
fill(0, 1, 0);
rect(66, 0, 67, 200);
fill(0, 0, 1);
rect(133, 0, 67, 200);
	 * @example
createCanvas(200);

colorMode(OKLCH);

fill(0.25, 0.15, 0);
rect(0, 0, 100, 200);

fill(0.75, 0.15, 0)
rect(100, 0, 100, 200);
	 */
	function colorMode(mode: 'rgb' | 'oklch', format: 1 | 255, gamut: 'srgb' | 'display-p3'): void;

	/** 🎨
	 * RGB colors have components `r`/`red`, `g`/`green`, `b`/`blue`,
	 * and `a`/`alpha`.
	 * 
	 * By default when a canvas is using the HDR "display-p3" color space,
	 * rgb colors are mapped to the full P3 gamut, even when they use the
	 * legacy integer 0-255 format.
	 * @example
createCanvas(200, 100);

colorMode(RGB);

background(255, 0, 0);
	 */
	const RGB: 'rgb';

	/** 🎨
	 * OKLCH colors have components `l`/`lightness`, `c`/`chroma`,
	 * `h`/`hue`, and `a`/`alpha`. It's more intuitive for humans
	 * to work with color in these terms than RGB.
	 * 
	 * OKLCH is perceptually uniform, meaning colors at the
	 * same lightness and chroma (colorfulness) will appear to
	 * have equal luminance, regardless of the hue.
	 *
	 * OKLCH can accurately represent all colors visible to the
	 * human eye, unlike many other color spaces that are bounded
	 * to a gamut. The maximum lightness and chroma values that
	 * correspond to sRGB or P3 gamut limits vary depending on
	 * the hue. Colors that are out of gamut will be clipped to
	 * the nearest in-gamut color.
	 * 
	 * Use the [OKLCH color picker](https://oklch.com) to find
	 * in-gamut colors.
	 * 
	 * - `lightness`: 0 to 1
	 * - `chroma`: 0 to ~0.4
	 * - `hue`: 0 to 360
	 * - `alpha`: 0 to 1
	 * @example
createCanvas(200, 100);

colorMode(OKLCH);

background(0.64, 0.3, 30);
	 * @example
createCanvas(200);
colorMode(OKLCH);

function draw() {
	background(0.7, 0.16, frameCount % 360);
}
	 */
	const OKLCH: 'oklch';

	/** 🎨
	 * HSL colors have components `h`/`hue`, `s`/`saturation`,
	 * `l`/`lightness`, and `a`/`alpha`.
	 * 
	 * HSL was created in the 1970s to approximate human perception
	 * of color, trading accuracy for simpler computations. It's
	 * not perceptually uniform, so colors with the same lightness
	 * can appear darker or lighter, depending on their hue
	 * and saturation. Yet, the lightness and saturation values that
	 * correspond to gamut limits are always 100, regardless of the
	 * hue. This can make HSL easier to work with than OKLCH.
	 * 
	 * HSL colors are mapped to the full P3 gamut when
	 * using the "display-p3" color space.
	 * 
	 * - `hue`: 0 to 360
	 * - `saturation`: 0 to 100
	 * - `lightness`: 0 to 100
	 * - `alpha`: 0 to 1
	 * @example
createCanvas(200, 100);

colorMode(HSL);

background(0, 100, 50);
	 * @example
createCanvas(200, 220);
noStroke();

colorMode(HSL);
for (let h = 0; h < 360; h += 10) {
  for (let l = 0; l <= 100; l += 10) {
    fill(h, 100, l);
    rect(h * (11/20), l * 2, 6, 20);
  }
}
	 */
	const HSL: 'hsl';

	/** 🎨
	 * HSB colors have components `h`/`hue`, `s`/`saturation`,
	 * `b`/`brightness` (aka `v`/`value`), and `a`/`alpha`.
	 * 
	 * HSB is similar to HSL, but instead of lightness
	 * (black to white), it uses brightness (black to
	 * full color). To produce white, set brightness
	 * to 100 and saturation to 0.
	 * 
	 * - `hue`: 0 to 360
	 * - `saturation`: 0 to 100
	 * - `brightness`: 0 to 100
	 * - `alpha`: 0 to 1
	 * @example
createCanvas(200, 100);

colorMode(HSB);

background(0, 100, 100);
	 * @example
createCanvas(200, 220);
noStroke();

colorMode(HSB);
for (let h = 0; h < 360; h += 10) {
  for (let b = 0; b <= 100; b += 10) {
    fill(h, 100, b);
    rect(h * (11/20), b * 2, 6, 20);
  }
}
	 */
	const HSB: 'hsb';

	/** 🎨
	 * Limits the color gamut to the sRGB color space.
	 * 
	 * If your display is HDR capable, note that full red appears
	 * less saturated and darker in this example, as it would on
	 * an SDR display.
	 * @example
createCanvas(200, 100);

colorMode(RGB, 255, SRGB);

background(255, 0, 0);
	 */
	const SRGB: 'srgb';

	/** 🎨
	 * Expands the color gamut to the P3 color space.
	 * 
	 * This is the default color gamut on devices that support HDR.
	 * 
	 * If your display is HDR capable, note that full red appears
	 * fully saturated and bright in the following example.
	 * @example
createCanvas(200, 100);

colorMode(RGB, 255, DISPLAY_P3);

background(255, 0, 0);
	 */
	const DISPLAY_P3: 'display-p3';

	class Color {
		/** 🎨
		 * This constructor strictly accepts 4 numbers, which are the color 
		 * components.
		 * 
		 * Use the `color` function for greater flexibility, it runs
		 * this constructor internally.
		 * 
		 * `Color` is not actually a class itself, it's a reference to a
		 * Q5 color class based on the color mode, format, and gamut.
		 */
		constructor(c0: number, c1: number, c2: number, c3: number);
	}

	// 💻 display

	/** 💻
	 * Customize how your canvas is presented.
	 * @param {string} mode
	 *   - "normal": (default) canvas is not repositioned
	 *   - "centered": canvas is moved to the center of its parent
	 *   - "maxed": canvas will be scaled to fill the parent element, with letterboxing if necessary to preserve its aspect ratio
	 * @param {string} renderQuality
	 *   - "smooth": (default) smooth upscaling if the canvas is scaled
	 *   - "pixelated": pixels rendered as sharp squares
	 * @param {number} scale can also be given as a string (for example "x2")
	 * @example
createCanvas(50, 25);

displayMode('centered', 'pixelated', 4);

circle(25, 12.5, 16);
	 */
	function displayMode(mode: string, renderQuality: string, scale: string | number): void;

	// 🧑‍🎨 shapes

	/** 🧑‍🎨
	 * Draws over the entire canvas with a color or image.
	 * 
	 * Like the [`color`](https://q5js.org/learn/#color) function,
	 * this function can accept colors in a wide range of formats:
	 * CSS color string, grayscale value, and color component values.
	 * @param {Color | Q5.Image} filler a color or image to draw
	 * @example
createCanvas(200, 100);
background('crimson');
	 * @example
function draw() {
	background(128, 100);
	circle(mouseX, mouseY, 20);
}
	 */
	function background(filler: Color | Q5.Image): void;

	/** 🧑‍🎨
	 * Draws a rectangle or a rounded rectangle.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 * @param {number} w width of the rectangle
	 * @param {number} [h] height of the rectangle
	 * @param {number} [tl] top-left radius
	 * @param {number} [tr] top-right radius
	 * @param {number} [br] bottom-right radius
	 * @param {number} [bl] bottom-left radius
	 * @example
createCanvas(200);
background(200);

rect(30, 20, 40, 60);
rect(80, 70, 40, 60, 10);
rect(130, 120, 40, 60, 30, 2, 8, 20);
	 */
	function rect(x: number, y: number, w: number, h?: number, tl?: number, tr?: number, br?: number, bl?: number): void;

	/** 🧑‍🎨
	 * Draws a square or a rounded square.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 * @param {number} size size of the sides of the square
	 * @param {number} [tl] top-left radius
	 * @param {number} [tr] top-right radius
	 * @param {number} [br] bottom-right radius
	 * @param {number} [bl] bottom-left radius
	 * @example
createCanvas(200);
background(200);

square(30, 30, 40);
square(80, 80, 40, 10);
square(130, 130, 40, 30, 2, 8, 20);
	 */
	function square(x: number, y: number, size: number, tl?: number, tr?: number, br?: number, bl?: number): void;

	/** 🧑‍🎨
	 * Draws a circle.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 * @param {number} diameter diameter of the circle
	 * @example
createCanvas(200, 100);
circle(100, 50, 80);
	 */
	function circle(x: number, y: number, diameter: number): void;

	/** 🧑‍🎨
	 * Draws an ellipse.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 * @param {number} width width of the ellipse
	 * @param {number} [height] height of the ellipse
	 * @example
createCanvas(200, 100);
ellipse(100, 50, 160, 80);
	 */
	function ellipse(x: number, y: number, width: number, height?: number): void;

	/** 🧑‍🎨
	 * Draws an arc, which is a section of an ellipse.
	 * 
	 * `ellipseMode` affects how the arc is drawn.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 * @param {number} w width of the ellipse
	 * @param {number} h height of the ellipse
	 * @param {number} start angle to start the arc
	 * @param {number} stop angle to stop the arc
	 * @param {number} [mode] shape and stroke style setting, default is `PIE_OPEN` for a pie shape with an unclosed stroke, can be `PIE`, `CHORD`, or `CHORD_OPEN`
	 * @example
createCanvas(200);
background(200);

arc(40, 40, 40, 40, 0.8, -0.8);
arc(80, 80, 40, 40, 0.8, -0.8, PIE);
arc(120, 120, 40, 40, 0.8, -0.8, CHORD_OPEN);
arc(160, 160, 40, 40, 0.8, -0.8, CHORD);
	 */
	function arc(x: number, y: number, w: number, h: number, start: number, stop: number, mode?: number): void;

	/** 🧑‍🎨
	 * Draws a line on the canvas.
	 * @param {number} x1 x-coordinate of the first point
	 * @param {number} y1 y-coordinate of the first point
	 * @param {number} x2 x-coordinate of the second point
	 * @param {number} y2 y-coordinate of the second point
	 * @example
createCanvas(200, 100);
stroke('lime');
line(20, 20, 180, 80);
	 */
	function line(x1: number, y1: number, x2: number, y2: number): void;

	/** 🧑‍🎨
	 * Draws a point on the canvas.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 * @example
createCanvas(200, 100);
stroke('white');
point(75, 50);

strokeWeight(10);
point(125, 50);
	 */
	function point(x: number, y: number): void;

	/** 🧑‍🎨
	 * Sets the global composite operation for the canvas context.
	 * @param {string} val composite operation to set
	 */
	function blendMode(val: string): void;

	/** 🧑‍🎨
	 * Sets the line cap style for the canvas context.
	 * @param {CanvasLineCap} val line cap style to set ('butt', 'round', 'square')
	 */
	function strokeCap(val: CanvasLineCap): void;

	/** 🧑‍🎨
	 * Sets the line join style for the canvas context.
	 * @param {CanvasLineJoin} val line join style to set ('round', 'bevel', 'miter')
	 */
	function strokeJoin(val: CanvasLineJoin): void;

	/** 🧑‍🎨
	 * Sets the ellipse mode.
	 * @param {string} val ellipse mode to set
	 */
	function ellipseMode(val: string): void;

	/** 🧑‍🎨
	 * Sets the rectangle mode.
	 * @param {string} val rectangle mode to set
	 */
	function rectMode(val: string): void;

	/** 🧑‍🎨
	 * Sets the curve detail level.
	 * @param {number} val curve detail level to set
	 */
	function curveDetail(val: number): void;

	/** 🧑‍🎨
	 * Sets the curve alpha value.
	 * @param {number} val curve alpha value to set
	 */
	function curveAlpha(val: number): void;

	/** 🧑‍🎨
	 * Sets the curve tightness value.
	 * @param {number} val curve tightness value to set
	 */
	function curveTightness(val: number): void;

	/** 🧑‍🎨
	 * Starts storing vertices for a convex shape.
	 */
	function beginShape(): void;

	/** 🧑‍🎨
	 * Ends storing vertices for a convex shape.
	 */
	function endShape(): void;

	/** 🧑‍🎨
	 * Starts storing vertices for a contour.
	 */
	function beginContour(): void;

	/** 🧑‍🎨
	 * Ends storing vertices for a contour.
	 */
	function endContour(): void;

	/** 🧑‍🎨
	 * Specifies a vertex in a shape.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 */
	function vertex(x: number, y: number): void;

	/** 🧑‍🎨
	 * Specifies a Bezier vertex in a shape.
	 * @param {number} cp1x x-coordinate of the first control point
	 * @param {number} cp1y y-coordinate of the first control point
	 * @param {number} cp2x x-coordinate of the second control point
	 * @param {number} cp2y y-coordinate of the second control point
	 * @param {number} x x-coordinate of the anchor point
	 * @param {number} y y-coordinate of the anchor point
	 */
	function bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

	/** 🧑‍🎨
	 * Specifies a quadratic Bezier vertex in a shape.
	 * @param {number} cp1x x-coordinate of the control point
	 * @param {number} cp1y y-coordinate of the control point
	 * @param {number} x x-coordinate of the anchor point
	 * @param {number} y y-coordinate of the anchor point
	 */
	function quadraticVertex(cp1x: number, cp1y: number, x: number, y: number): void;

	/** 🧑‍🎨
	 * Draws a Bezier curve.
	 * @param {number} x1 x-coordinate of the first anchor point
	 * @param {number} y1 y-coordinate of the first anchor point
	 * @param {number} x2 x-coordinate of the first control point
	 * @param {number} y2 y-coordinate of the first control point
	 * @param {number} x3 x-coordinate of the second control point
	 * @param {number} y3 y-coordinate of the second control point
	 * @param {number} x4 x-coordinate of the second anchor point
	 * @param {number} y4 y-coordinate of the second anchor point
	 */
	function bezier(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	/** 🧑‍🎨
	 * Draws a triangle.
	 * @param {number} x1 x-coordinate of the first vertex
	 * @param {number} y1 y-coordinate of the first vertex
	 * @param {number} x2 x-coordinate of the second vertex
	 * @param {number} y2 y-coordinate of the second vertex
	 * @param {number} x3 x-coordinate of the third vertex
	 * @param {number} y3 y-coordinate of the third vertex
	 */
	function triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

	/** 🧑‍🎨
	 * Draws a quadrilateral.
	 * @param {number} x1 x-coordinate of the first vertex
	 * @param {number} y1 y-coordinate of the first vertex
	 * @param {number} x2 x-coordinate of the second vertex
	 * @param {number} y2 y-coordinate of the second vertex
	 * @param {number} x3 x-coordinate of the third vertex
	 * @param {number} y3 y-coordinate of the third vertex
	 * @param {number} x4 x-coordinate of the fourth vertex
	 * @param {number} y4 y-coordinate of the fourth vertex
	 */
	function quad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	/** 🧑‍🎨
	 * Sets the canvas to erase mode, where shapes will erase what's underneath them instead of drawing over it.
	 * @param {number} [fillAlpha] opacity level of the fill color from 0 to 255
	 * @param {number} [strokeAlpha] opacity level of the stroke color from 0 to 255
	 */
	function erase(fillAlpha?: number, strokeAlpha?: number): void;

	/** 🧑‍🎨
	 * Resets the canvas from erase mode to normal drawing mode.
	 */
	function noErase(): void;

	/** 🧑‍🎨
	 * Checks if a given point is within the current path's fill area.
	 * 
	 * Not available in q5 WebGPU.
	 * @param {number} x x-coordinate of the point
	 * @param {number} y y-coordinate of the point
	 * @returns {boolean} true if the point is within the fill area, false otherwise
	 */
	function inFill(x: number, y: number): boolean;

	/** 🧑‍🎨
	 * Checks if a given point is within the current path's stroke.
	 * 
	 * Not available in q5 WebGPU.
	 * @param {number} x x-coordinate of the point
	 * @param {number} y y-coordinate of the point
	 * @returns {boolean} true if the point is within the stroke, false otherwise
	 */
	function inStroke(x: number, y: number): boolean;

	// 🌆 image

	/** 🌆
	 * Loads an image from a URL and optionally runs a callback function.
	 * @param {string} url url of the image to load
	 * @param {(img: any) => void} [cb] callback function after the image is loaded
	 * @param {any} [opt] optional parameters for loading the image
	 * @returns {Q5.Image} image
	 * @example
createCanvas(200);

let logo = loadImage('/q5js_logo.webp');

function draw() {
	image(logo, 0, 0, 200, 200);
}
	 */
	function loadImage(url: string, cb?: (img: any) => void, opt?: any): Q5.Image;

	/** 🌆
	 * Draws an image to the canvas.
	 * @param {any} img image to draw
	 * @param {number} dx x position to draw the image at
	 * @param {number} dy y position to draw the image at
	 * @param {number} [dw] width of the destination image
	 * @param {number} [dh] height of the destination image
	 * @param {number} [sx] x position in the source to start clipping a subsection from
	 * @param {number} [sy] y position in the source to start clipping a subsection from
	 * @param {number} [sw] width of the subsection of the source image
	 * @param {number} [sh] height of the subsection of the source image
	 * @example
createCanvas(200);

let logo = loadImage('/q5js_logo.webp');

function draw() {
  image(logo, 0, 0, 200, 200, 256, 256, 512, 512);
}
	 */
	function image(img: any, dx: number, dy: number, dw?: number, dh?: number, sx?: number, sy?: number, sw?: number, sh?: number): void;

	/** 🌆
	 * Sets the image mode, which determines the position and alignment of images drawn on the canvas.
	 * `CORNER`: (default) images will be drawn from the top-left corner
	 * `CORNERS`: images will be drawn from the top-left to the bottom-right corner
	 * `CENTER`: images will be drawn centered at (dx, dy)
	 * @param {string} mode
	 * @example
createCanvas(200);

let logo = loadImage('/q5js_logo.webp');

function draw() {
	imageMode(CENTER);
	image(logo, 100, 100, 200, 200);
}
	 */
	function imageMode(mode: string): void;

	/** 🌆
	 * Sets the default image scale, which is applied to images when
	 * they are drawn without a specified width or height.
	 * 
	 * By default it is 0.5 so images appear at their actual size
	 * when pixel density is 2. Images will be drawn at a consistent
	 * default size relative to the canvas regardless of pixel density.
	 * 
	 * This function must be called before images are loaded to
	 * have an effect.
	 * @param {number} scale
	 * @returns {number} default image scale
	 */
	function defaultImageScale(scale: number): number;

	/** 🌆
	 * Resizes the image.
	 * @param {number} w new width
	 * @param {number} h new height
	 * @example
createCanvas(200);

let logo = loadImage('/q5js_logo.webp');

function setup() {
	logo.resize(128, 128);
	image(logo, 0, 0, 200, 200);
}
	 */
	function resize(w: number, h: number): void;

	/** 🌆
	 * Returns a trimmed image, cropping out transparent pixels from the edges.
	 * @returns {Image}
	 */
	function trim(): Q5.Image;

	/** 🌆
	 * Enables smooth rendering of images displayed larger than
	 * their actual size. This is the default setting, so running this
	 * function only has an effect if `noSmooth` has been called.
	 * @example
createCanvas(200);

let icon = loadImage('/q5js_icon.png');

function setup() {
	image(icon, 0, 0, 200, 200);
}
	 */
	function smooth(): void;

	/** 🌆
	 * Disables smooth image rendering for a pixelated look.
	 * @example
createCanvas(200);

let icon = loadImage('/q5js_icon.png');

function setup() {
	noSmooth();
	image(icon, 0, 0, 200, 200);
}
	 */
	function noSmooth(): void;

	/** 🌆
	 * Applies a tint (color overlay) to the drawing.
	 * 
	 * The alpha value of the tint color determines the 
	 * strength of the tint. To change an image's opacity,
	 * use the `opacity` function.
	 * 
	 * Tinting affects all subsequent images drawn. The tint
	 * color is applied to images using the "multiply" blend mode.
	 * 
	 * Since the tinting process is performance intensive, each time
	 * an image is tinted, q5 caches the result. `image` will draw the 
	 * cached tinted image unless the tint color has changed or the
	 * image being tinted was edited.
	 * 
	 * If you need to draw an image multiple times each frame with 
	 * different tints, consider making copies of the image and tinting
	 * each copy separately.
	 * @param {string | number} color tint color
	 * @example
createCanvas(200);

let logo = loadImage('/q5js_logo.webp');

function setup() {
	tint(255, 0, 0, 128);
	image(logo, 0, 0, 200, 200);
}
	 */
	function tint(color: string | number): void;

	/** 🌆
	 * Images drawn after this function is run will not be tinted.
	 */
	function noTint(): void;

	/** 🌆
	 * Masks the image with another image.
	 * @param {Q5.Image} img image to use as a mask
	 */
	function mask(img: Q5.Image): void;

	/** 🌆
	 * Retrieves a subsection of an image or canvas, as a q5 Image.
	 * Or if width and height are both 1, returns the color of the pixel at the given coordinates in `[R, G, B, A]` array format.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} [w] width of the area
	 * @param {number} [h] height of the area
	 * @returns {Image | number[]}
	 * @example
createCanvas(200);

let logo = loadImage('/q5js_logo.webp');

function setup() {
	let cropped = logo.get(256, 256, 512, 512);
	image(cropped, 0, 0, 200, 200);
}
	 */
	function get(x: number, y: number, w?: number, h?: number): Q5.Image | number[];

	/** 🌆
	 * Sets a pixel's color in the image or canvas.
	 * 
	 * Or if a canvas or image is provided, it's drawn on top of the 
	 * destination image or canvas, ignoring its tint setting.
	 * 
	 * Run `updatePixels` to apply the changes.
	 * @param {number} x
	 * @param {number} y
	 * @param {any} c color, canvas, or image
	 * @example
createCanvas(200);
let c = color('lime');

function draw() {
	set(randomX(), randomY(), c);
	updatePixels();
}
	 */
	function set(x: number, y: number, c: any): void;

	/** 🌆
	 * Returns a copy of the image.
	 * @returns {Q5.Image}
	 */
	function copy(): Q5.Image;

	/** 🌆
	 * Displays a region of the image on another region of the image.
	 * Can be used to create a detail inset, aka a magnifying glass effect.
	 * @param {number} sx x-coordinate of the source region
	 * @param {number} sy y-coordinate of the source region
	 * @param {number} sw width of the source region
	 * @param {number} sh height of the source region
	 * @param {number} dx x-coordinate of the destination region
	 * @param {number} dy y-coordinate of the destination region
	 * @param {number} dw width of the destination region
	 * @param {number} dh height of the destination region
	 * @example
createCanvas(200);

let logo = loadImage('/q5js_logo.webp');

function setup() {
	logo.inset(256, 256, 512, 512, 0, 0, 256, 256);
	image(logo, 0, 0, 200, 200);
}
	 */
	function inset(sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;

	/** 🌆
	 * Array of pixels in the canvas or image. Use `loadPixels` to load the pixel data.
	 */
	var pixels: number[];

	/** 🌆
	 * Loads pixel data into the canvas' or image's `pixels` array.
	 * @example
createCanvas(200);
let icon = loadImage('/q5js_icon.png');

function setup() {
	icon.loadPixels();
	for (let i=0; i < 65536; i+=16) icon.pixels[i] = 255;
	icon.updatePixels();
	image(icon, 0, 0, 200, 200);
}
	 */
	function loadPixels(): void;

	/** 🌆
	 * Applies changes in the `pixels` array to the canvas or image.
	 * @example
createCanvas(200);
function setup() {
	for (let x = 0; x < 200; x += 5) {
		for (let y = 0; y < 200; y += 5) {
			set(x, y, color('red'));
		}
	}
	updatePixels();
}
	 */
	function updatePixels(): void;

	/** 🌆
	 * Applies a filter to the image.
	 * 
	 * See the documentation for q5's filter constants below for more info.
	 * 
	 * A CSS filter string can also be used.
	 * https://developer.mozilla.org/docs/Web/CSS/filter
	 * @param {string} type filter type or a CSS filter string
	 * @param {number} [value] optional value, depends on filter type
	 * @example
createCanvas(200);
let logo = loadImage('/q5js_logo.webp');

function setup() {
	logo.filter(INVERT);
	image(logo, 0, 0, 200, 200);
}
	 */
	function filter(type: string, value?: number): void;

	/** 🌆
	 * Converts the image to black and white pixels depending if they are above or below a certain threshold.
	 */
	const THRESHOLD: 1;

	/** 🌆
	 * Converts the image to grayscale by setting each pixel to its luminance.
	 */
	const GRAY: 2;

	/** 🌆
	 * Sets the alpha channel to fully opaque.
	 */
	const OPAQUE: 3;

	/** 🌆
	 * Inverts the color of each pixel.
	 */
	const INVERT: 4;

	/** 🌆
	 * Limits each channel of the image to the number of colors specified as an argument.
	 */
	const POSTERIZE: 5;

	/** 🌆
	 * Increases the size of bright areas.
	 */
	const DILATE: 6;

	/** 🌆
	 * Increases the size of dark areas.
	 */
	const ERODE: 7;

	/** 🌆
	 * Applies a Gaussian blur to the image.
	 */
	const BLUR: 8;

	/** 🌆
	 * Creates a new image.
	 * @param {number} w width
	 * @param {number} h height
	 * @param {any} [opt] optional settings for the image
	 * @returns {Q5.Image}
	 */
	function createImage(w: number, h: number, opt?: any): Q5.Image;

	// ✍️ text

	/** ✍️
	 * Renders text to the screen. Text can be positioned with the x and y
	 * parameters and can optionally be constrained.
	 * @param {string} str string of text to display
	 * @param {number} x x-coordinate of the text's position
	 * @param {number} y y-coordinate of the text's position
	 * @param {number} [wrapWidth] maximum line width in characters
	 * @param {number} [lineLimit] maximum number of lines
	 * @example
createCanvas(200);
background('silver');

textSize(32);
text('Hello, world!', 12, 106);
	 * @example
createCanvas(200);
background(200);
textSize(20);

let info = "q5.js is a JavaScript library for creative coding. It's a sequel to p5.js that's optimized for interactive art.";

text(info, 12, 30, 20, 6);
//
//
	 */
	function text(str: string, x: number, y: number, wrapWidth?: number, lineLimit?: number): void;

	/** ✍️
	 * Loads a font from a URL and optionally runs a callback function
	 * with the font name once it's loaded.
	 * 
	 * In q5 c2d, you can load fonts in any format accepted in CSS, such as
	 * .ttf and .otf files.
	 * 
	 * The example below loads "Robotica.ttf" created by Courtney Novits:
	 * https://www.dafont.com/robotica-courtney.font
	 *
	 * In q5 WebGPU, fonts must be in MSDF format with the file ending
	 * "-msdf.json". If no font is loaded before `text` is run, then
	 * the default sans serif font, Microsoft YaHei, is loaded:
	 * https://q5js.org/fonts/sans-serif-msdf.json
	 * https://q5js.org/fonts/sans-serif.png
	 * @param {string} url uRL of the font to load
	 * @param {(font: FontFace) => void} [cb] optional callback function that receives the font name as an argument once the font is loaded
	 * @returns {FontFace} font
	 * @example
createCanvas(200);

loadFont('/assets/Robotica.ttf');

function setup() {
	background(200);
	textSize(48);
	text('Hello!', 12, 114);
}
	 */
	function loadFont(url: string, cb?: (font: FontFace) => void): string;

	/** ✍️
	 * Sets the current font to be used for rendering text.
	 * 
	 * By default, the font is set to "sans-serif" or the last font
	 * loaded.
	 * 
	 * In q5 c2d, you can set the font to any font accepted in CSS,
	 * such as "serif" or "monospace".
	 * https://developer.mozilla.org/docs/Web/CSS/font-family
	 * @param {string} fontName name of the font family or a FontFace object
	 * @example
createCanvas(200);
background(200);

textFont('serif');

textSize(32);
text('Hello, world!', 12, 106);
	 */
	function textFont(fontName: string): void;

	/** ✍️
	 * Sets or gets the current font size. If no argument is provided, returns the current font size.
	 * @param {number} [size] size of the font in pixels
	 * @returns {number | void} current font size when no argument is provided
	 * @example
function draw() {
	background(200);

	textSize(abs(mouseX));
	text('A', 10, 190);
}
	 */
	function textSize(size?: number): number | void;

	/** ✍️
	 * Sets or gets the current line height. If no argument is provided, returns the current line height.
	 * @param {number} [leading] line height in pixels
	 * @returns {number | void} current line height when no argument is provided
	 * @example
function draw() {
	background(200);

	textSize(abs(mouseX));
	text('A', 10, 190);
	rect(10, 190, 5, -textLeading());
}
	 */
	function textLeading(leading?: number): number | void;

	/** ✍️
	 * Sets the current text style.
	 * @param {'normal' | 'italic' | 'bold' | 'bolditalic'} style font style
	 * @example
createCanvas(200);
background(200);

textStyle(ITALIC);

textSize(32);
text('Hello, world!', 12, 106);
	 */
	function textStyle(style: 'normal' | 'italic' | 'bold' | 'bolditalic'): void;

	/** ✍️
	 * Sets the horizontal and vertical alignment of text.
	 * @param {'left' | 'center' | 'right'} horiz horizontal alignment
	 * @param {'top' | 'middle' | 'bottom' | 'alphabetic'} [vert] vertical alignment
	 * @example
createCanvas(200);
background(200);

textAlign(CENTER, MIDDLE);

textSize(32);
text('Hello, world!', 100, 100);
	 */
	function textAlign(horiz: 'left' | 'center' | 'right', vert?: 'top' | 'middle' | 'bottom' | 'alphabetic'): void;

	/** ✍️
	 * Calculates and returns the width of a given string of text.
	 * @param {string} str string to measure
	 * @returns {number} width of the text in pixels
	 * @example
function draw() {
	background(200);

	textSize(abs(mouseX));
	rect(10, 190, textWidth('A'), -textLeading());
	text('A', 10, 190);
}
	 */
	function textWidth(str: string): number;

	/** ✍️
	 * Calculates and returns the ascent (the distance from the baseline to the top of the highest character) of the current font.
	 * @param {string} str string to measure
	 * @returns {number} ascent of the text in pixels
	 * @example
function draw() {
	background(200);

	textSize(abs(mouseX));
	rect(10, 190, textWidth('A'), -textAscent());
	text('A', 10, 190);
}
	 */
	function textAscent(str: string): number;

	/** ✍️
	 * Calculates and returns the descent (the distance from the baseline to the bottom of the lowest character) of the current font.
	 * @param {string} str string to measure
	 * @returns {number} descent of the text in pixels
	 * @example
createCanvas(200);
	background(200);
	textSize(64);

	rect(0, 100, 200, textDescent('q5'));
	text('q5', 10, 100);
	 */
	function textDescent(str: string): number;

	/** ✍️
	 * Creates an image from a string of text.
	 * @param {string} str string of text
	 * @param {number} [wrapWidth] maximum line width in characters
	 * @param {number} [lineLimit] maximum number of lines
	 * @returns {Q5.Image} an image object representing the rendered text
	 * @example
createCanvas(200, 200);
textSize(80);
let img = createTextImage('🐶');
img.filter(INVERT);

function draw() {
	background(200);
	text('🐶', 10, 75);
	image(img, 110, 75);
}
	 */
	function createTextImage(str: string, wrapWidth: number, lineLimit: number): Q5.Image;

	/** ✍️
	 * Renders an image generated from text onto the canvas.
	 * 
	 * The positioning of the image is affected by the current text
	 * alignment and baseline settings.
	 * 
	 * If the first parameter is a string, an image of the text is
	 * created automatically, then drawn.
	 * @param {Q5.Image} img image object or text
	 * @param {number} x x-coordinate where the image should be placed
	 * @param {number} y y-coordinate where the image should be placed
	 * @example
createCanvas(200, 200);
textSize(80);
textAlign(CENTER, CENTER);

function draw() {
	background(200);
	textImage('🐶', 100, 100);
}
	 */
	function textImage(img: HTMLImageElement, x: number, y: number): void;

	/** ✍️
	 * Number formatter, can be used to display a number as a string with
	 * a specified number of digits before and after the decimal point,
	 * optionally adding padding with zeros.
	 * @param {number} n number to format
	 * @param {number} l minimum number of digits to appear before the decimal point; the number is padded with zeros if necessary
	 * @param {number} r number of digits to appear after the decimal point
	 * @returns {string} a string representation of the number, formatted accordingly
	 * @example
createCanvas(200, 100);
background(200);

textSize(32);
text(nf(PI, 4, 2), 10, 60);
	 */
	function nf(n: number, l: number, r: number): string;

	/** ✍️
	 * Normal font weight.
	 */
	const NORMAL: 'normal';

	/** ✍️
	 * Italic font style.
	 */
	const ITALIC: 'italic';

	/** ✍️
	 * Bold font weight.
	 */
	const BOLD: 'bold';

	/** ✍️
	 * Bold and italic font style.
	 */
	const BOLDITALIC: 'italic bold';

	/** ✍️
	 * Align text to the left.
	 */
	const LEFT: 'left';

	/** ✍️
	 * Align text to the center.
	 */
	const CENTER: 'center';

	/** ✍️
	 * Align text to the right.
	 */
	const RIGHT: 'right';

	/** ✍️
	 * Align text to the top.
	 */
	const TOP: 'top';

	/** ✍️
	 * Align text to the bottom.
	 */
	const BOTTOM: 'bottom';

	/** ✍️
	 * Align text to the baseline (alphabetic).
	 */
	const BASELINE: 'alphabetic';

	// 🖲️ input

	/** 🖲️
	 * Current X position of the mouse.
	 * @example
function draw() {
	background(200);
	textSize(64);
	text(round(mouseX), 50, 120);
}
	 */
	let mouseX: number;

	/** 🖲️
	 * Current Y position of the mouse.
	 * @example
function draw() {
	background(200);
	circle(100, mouseY, 100);
}
	 */
	let mouseY: number;

	/** 🖲️
	 * Previous X position of the mouse.
	 */
	let pmouseX: number;

	/** 🖲️
	 * Previous Y position of the mouse.
	 */
	let pmouseY: number;

	/** 🖲️
	 * The current button being pressed: 'left', 'right', 'center').
	 * 
	 * The default value is an empty string.
	 * @example
function draw() {
	background(200);
	textSize(64);
	text(mouseButton, 20, 120);
}
	 */
	let mouseButton: string;

	/** 🖲️
	 * True if the mouse is currently pressed, false otherwise.
	 * @example
function draw() {
	if (mouseIsPressed) background(100);
	else background(200);
}
	 */
	let mouseIsPressed: boolean;

	/** 🖲️
	 * Define this function to respond to mouse events immediately.
	 * 
	 * There can be a delay of up to one frame between a mouse event
	 * and the next time the `draw` function is run.
	 * 
	 * Useful for playing sounds.
	 * @example
createCanvas(200, 100);

let gray = 100;
function mousePressed() {
	background(gray);
	gray += 10;
}
	 */
	function mousePressed(): void;

	/** 🖲️
	 * The name of the last key pressed.
	 * @example
function draw() {
	background(200);
	textSize(64);
	text(key, 20, 120);
}
	 */
	let key: string;

	/** 🖲️
	 * True if a key is currently pressed, false otherwise.
	 * @example
function draw() {
	if (keyIsPressed) background(100);
	else background(200);
}
	 */
	let keyIsPressed: boolean;

	/** 🖲️
	 * Returns true if the user is pressing the specified key, false otherwise. Accepts case-insensitive key names.
	 * @param {string} key key to check
	 * @returns {boolean} true if the key is pressed, false otherwise
	 * @example
function draw() {
	background(200);
	
	if (keyIsDown('f') && keyIsDown('j')) {
		rect(50, 50, 100, 100);
	}
}
	 */
	function keyIsDown(key: string): boolean;

	/** 🖲️
	 * Define this function to respond to key press events immediately.
	 * 
	 * There can be a delay of up to one frame between a key press event
	 * and the next time the `draw` function is run.
	 * 
	 * Useful for playing sounds.
	 * @example
createCanvas(200, 100);

let gray = 100;
function keyPressed() {
	background(gray);
	gray += 10;
}
	 */
	function keyPressed(): void;

	/** 🖲️
	 * Array of current touches, each touch being an object with
	 * id, x, and y properties.
	 */
	let touches: any[];

	/** 🖲️
	 * Sets the cursor to a [CSS cursor type](https://developer.mozilla.org/docs/Web/CSS/cursor) or image.
	 * If an image is provided, optional x and y coordinates can
	 * specify the active point of the cursor.
	 * @param {string} name name of the cursor or the url to an image
	 * @param {number} [x] x-coordinate of the cursor's point
	 * @param {number} [y] y-coordinate of the cursor's point
	 * @example
createCanvas(200, 100);
cursor('pointer');
	 */
	function cursor(name: string, x?: number, y?: number): void;

	/** 🖲️
	 * Hides the cursor within the bounds of the canvas.
	 * @example
createCanvas(200, 100);
noCursor();
	 */
	function noCursor(): void;

	/** 🖲️
	 * Prevents mouse wheel events from propagating and causing
	 * the page to scroll when the mouse is inside the canvas.
	 * 
	 * Useful for games and interactive art that fill the screen.
	 * @example
createCanvas(200, 100);
noScroll();
	 */
	function noScroll(): void;

	/** 🖲️
	 * Define this function to respond to mouse wheel events.
	 * 
	 * `event.deltaX` and `event.deltaY` are the horizontal and vertical
	 * scroll amounts, respectively.
	 * 
	 * Return false to prevent the default behavior of scrolling the page.
	 * @example
let x = y = 100;
function draw() {
	circle(x, y, 10);
}
function mouseWheel(e) {
	x += e.deltaX;
	y += e.deltaY;
	return false;
}
	 */
	function mouseWheel(event: any): void;

	/** 🖲️
	 * Requests that the pointer be locked to the document body, hiding the cursor and allowing for unlimited movement.
	 */
	function requestPointerLock(): void;

	/** 🖲️
	 * Exits pointer lock, showing the cursor again and stopping the unlimited movement.
	 */
	function exitPointerLock(): void;

	// 🧮 math

		/** 🧮
	 * Generates random numbers. If no arguments are provided, returns a random number between 0 and 1.
	 * If one number argument is provided, returns a random number between 0 and the provided value.
	 * If two number arguments are provided, returns a random number between the two values.
	 * If an array is provided, returns a random element from the array.
	 * @param {number | any[]} [low] lower bound (inclusive) or an array
	 * @param {number} [high] upper bound (exclusive)
	 * @returns {number | any} a random number or element
	 * @example
createCanvas(200);
background(200);
frameRate(5);

function draw() {
	circle(100, 100, random(200));
}
	 */
	function random(low?: number | any[], high?: number): number | any;

	/** 🧮
	 * Generates a random number within the range of the canvas width.
	 * @param {number} [margin] distance to extend (positive) or contract (negative) the range from canvas edges
	 * @returns {number} random x value
	 * @example
createCanvas(200, 100);
background(200);

function draw() {
	circle(randomX(), 50, random(50));
}
	 */
	function randomX(margin?: number): number;

	/** 🧮
	 * Generates a random number within the range of the canvas height.
	 * @param {number} [margin] distance to extend (positive) or contract (negative) the range from canvas edges
	 * @returns {number} random y value
	 * @example
createCanvas(200);
background(200);

function draw() {
	circle(100, randomY(), random(50));
}
	 * @example
createCanvas(200);
background(200);

function draw() {
	circle(randomX(), randomY(-60), 10);
}
	 */
	function randomY(margin?: number): number;

	/** 🧮
	 * Calculates the distance between two points.
	 * 
	 * This function also accepts two objects with `x` and `y` properties.
	 * @param {number} x1 x-coordinate of the first point
	 * @param {number} y1 y-coordinate of the first point
	 * @param {number} x2 x-coordinate of the second point
	 * @param {number} y2 y-coordinate of the second point
	 * @returns {number} distance between the points
	 * @example
function draw() {
	background(200);
	circle(100, 100, 20);
	circle(mouseX, mouseY, 20);

	let d = dist(100, 100, mouseX, mouseY);
	text(round(d), 20, 20);
}
	 */
	function dist(x1: number, y1: number, x2: number, y2: number): number;

	/** 🧮
	 * Maps a number from one range to another.
	 * @param {number} value incoming value to be converted
	 * @param {number} start1 lower bound of the value's current range
	 * @param {number} stop1 upper bound of the value's current range
	 * @param {number} start2 lower bound of the value's target range
	 * @param {number} stop2 upper bound of the value's target range
	 * @returns {number} mapped value
	 */
	function map(value: number, start1: number, stop1: number, start2: number, stop2: number): number;

	/** 🧮
	 * Sets the mode for interpreting and drawing angles. Can be either 'degrees' or 'radians'.
	 * @param {'degrees' | 'radians'} mode mode to set for angle interpretation
	 */
	function angleMode(mode: 'degrees' | 'radians'): void;

	/** 🧮
	 * Converts degrees to radians.
	 * @param {number} degrees angle in degrees
	 * @returns {number} angle in radians
	 */
	function radians(degrees: number): number;

	/** 🧮
	 * Converts radians to degrees.
	 * @param {number} radians angle in radians
	 * @returns {number} angle in degrees
	 */
	function degrees(radians: number): number;

	/** 🧮
	 * Calculates a number between two numbers at a specific increment.
	 * @param {number} start first number
	 * @param {number} stop second number
	 * @param {number} amt amount to interpolate between the two values
	 * @returns {number} interpolated number
	 */
	function lerp(start: number, stop: number, amt: number): number;

	/** 🧮
	 * Constrains a value between a minimum and maximum value.
	 * @param {number} n number to constrain
	 * @param {number} low lower bound
	 * @param {number} high upper bound
	 * @returns {number} constrained value
	 */
	function constrain(n: number, low: number, high: number): number;

	/** 🧮
	 * Normalizes a number from another range into a value between 0 and 1.
	 * @param {number} n number to normalize
	 * @param {number} start lower bound of the range
	 * @param {number} stop upper bound of the range
	 * @returns {number} normalized number
	 */
	function norm(n: number, start: number, stop: number): number;

	/** 🧮
	 * Calculates the square of a number.
	 * @param {number} n number to square
	 * @returns {number} square of the number
	 */
	function sq(n: number): number;

	/** 🧮
	 * Calculates the fractional part of a number.
	 * @param {number} n number whose fractional part is to be calculated
	 * @returns {number} fractional part of the number
	 */
	function fract(n: number): number;

	/** 🧮
	 * Sets the seed for the random number generator.
	 * @param {number} seed seed value
	 */
	function randomSeed(seed: number): void;

	/** 🧮
	 * Sets the random number generation method.
	 * @param {any} method method to use for random number generation
	 */
	function randomGenerator(method: any): void;

	/** 🧮
	 * Generates a random number following a Gaussian (normal) distribution.
	 * @param {number} mean mean (center) of the distribution
	 * @param {number} std standard deviation (spread or "width") of the distribution
	 * @returns {number} a random number following a Gaussian distribution
	 */
	function randomGaussian(mean: number, std: number): number;

	/** 🧮
	 * Generates a random number following an exponential distribution.
	 * @returns {number} a random number following an exponential distribution
	 */
	function randomExponential(): number;

	/** 🧮
	 * Sets the noise generation mode.
	 * 
	 * Only the default mode, "perlin", is included in q5.js. Use of the 
	 * other modes requires the q5-noiser module.
	 * @param {'perlin' | 'simplex' | 'blocky'} mode noise generation mode
	 */
	function noiseMode(mode: 'perlin' | 'simplex' | 'blocky'): void;

	/** 🧮
	 * Generates a noise value based on the x, y, and z inputs.
	 * @param {number} [x] x-coordinate input
	 * @param {number} [y] y-coordinate input
	 * @param {number} [z] z-coordinate input
	 * @returns {number} a noise value
	 * @example
function draw() {
	background(200);
	let n = noise(frameCount * 0.01);
	square(n * 200, n * 200, 10);
}
	 */
	function noise(x?: number, y?: number, z?: number): number;

	/** 🧮
	 * Sets the seed value for noise generation.
	 * @param {number} seed seed value
	 */
	function noiseSeed(seed: number): void;

	/** 🧮
	 * Sets the level of detail for noise generation.
	 * @param {number} lod level of detail (number of octaves)
	 * @param {number} falloff falloff rate for each octave
	 */
	function noiseDetail(lod: number, falloff: number): void;

	/** 🧮
	 * The ratio of a circle's circumference to its diameter.
	 * Approximately 3.14159.
	 */
	const PI: number;

	/** 🧮
	 * 2 * PI.
	 * Approximately 6.28319.
	 */
	const TWO_PI: number;

	/** 🧮
	 * Alias for 2 * PI.
	 * Approximately 6.28319.
	 */
	const TAU: number;

	/** 🧮
	 * Half of PI.
	 * Approximately 1.5708.
	 */
	const HALF_PI: number;

	/** 🧮
	 * A quarter of PI.
	 * Approximately 0.7854.
	 */
	const QUARTER_PI: number;

	// 🔊 sound

	/** 🔊
	 * q5.js includes low latency sound playback and basic mixing powered
	 * by WebAudio.
	 * 
	 * For audio filtering, synthesis, and analysis, consider using
	 * [p5.sound](https://p5js.org/reference/p5.sound/).
	 */

	/** 🔊
	 * Loads audio data from a file and returns a `Q5.Sound` object.
	 * 
	 * Use functions like `play`, `pause`, and `stop` to 
	 * control playback. Note that sounds can only be played after the 
	 * first user interaction with the page!
	 * 
	 * Set `volume` to a value between 0 (silent) and 1 (full volume).
	 * Set `pan` to a value between -1 (left) and 1 (right) to adjust
	 * the sound's stereo position. Set `loop` to true to loop the sound.
	 * 
	 * Use `loaded`, `paused`, and `ended` to check the sound's status.
	 * 
	 * For backwards compatibility with the p5.sound API, the functions 
	 * `setVolume`, `setLoop`, `setPan`, `isLoaded`, and `isPlaying`
	 * are also implemented, but their use is deprecated.
	 * @param {string} url sound file
	 * @returns {Sound} a new `Sound` object
	 * @example
createCanvas(200);

let sound = loadSound('/assets/jump.wav');
sound.volume = 0.3;

function mousePressed() {
	sound.play();
}
	 */
	function loadSound(url: string): Sound;

	/**
	 * Loads audio data from a file and returns an [HTMLAudioElement](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement).
	 * 
	 * Audio is considered loaded when the [canplaythrough event](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event) is fired.
	 * 
	 * Note that audio can only be played after the first user 
	 * interaction with the page!
	 * @param url audio file
	 * @returns {HTMLAudioElement} an HTMLAudioElement
	 * @example
createCanvas(200);

let audio = loadAudio('/assets/retro.flac');
audio.volume = 0.4;

function mousePressed() {
	audio.play();
}
	 */
	function loadAudio(url: string): HTMLAudioElement;

	/** 🔊
	 * Returns the AudioContext in use or undefined if it doesn't exist.
	 * @returns {AudioContext} AudioContext instance
	 */
	function getAudioContext(): AudioContext | void;

	/** 🔊
	 * Creates a new AudioContext or resumes it if it was suspended.
	 * @returns {Promise<void>} a promise that resolves when the AudioContext is resumed
	 */
	function userStartAudio(): Promise<void>;

	class Sound {
		/** 🔊
		 * Creates a new `Q5.Sound` object.
		 */
		constructor();

		/** 🔊
		 * Set the sound's volume to a value between
		 * 0 (silent) and 1 (full volume).
		 */
		volume: number;

		/** 🔊
		 * Set the sound's stereo position between -1 (left) and 1 (right).
		 */
		pan: number;

		/** 🔊
		 * Set to true to make the sound loop continuously.
		 */
		loop: boolean;

		/** 🔊
		 * True if the sound data has finished loading.
		 */
		loaded: boolean;

		/** 🔊
		 * True if the sound is currently paused.
		 */
		paused: boolean;

		/** 🔊
		 * True if the sound has finished playing.
		 */
		ended: boolean;

		/** 🔊
		 * Plays the sound.
		 * 
		 * If this function is run when the sound is already playing,
		 * a new playback will start, causing a layering effect.
		 * 
		 * If this function is run when the sound is paused,
		 * all playback instances will be resumed.
		 */
		play(): void;

		/** 🔊
		 * Pauses the sound, allowing it to be resumed.
		 */
		pause(): void;

		/** 🔊
		 * Stops the sound, resetting its playback position
		 * to the beginning.
		 * 
		 * Removes all playback instances.
		 */
		stop(): void;
	}

	// 📑 dom

	/** 📑
	 * The Document Object Model (DOM) is an interface for
	 * creating and editing web pages with JavaScript.
	 */

	/** 📑
	 * Creates a new HTML element and adds it to the page. `createEl` is
	 * an alias.
	 * 
	 * Modify the element's CSS [`style`](https://developer.mozilla.org/docs/Web/API/HTMLElement/style) to change its appearance.
	 * 
	 * Use [`addEventListener`](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener) to respond to events such as:
	 * - "click": when the element is clicked
	 * - "mouseover": when the mouse hovers over the element
	 * - "mouseout": when the mouse stops hovering over the element
	 * - "input": when a form element's value changes
	 * 
	 * q5 adds some extra functionality to the elements it creates:
	 * 
	 * - the `position` function makes it easy to place the element
	 * relative to the canvas
	 * - the `size` function sets the width and height of the element
	 * - alternatively, use the element's `x`, `y`, `width`, and `height` properties
	 * @param {string} tag tag name of the element
	 * @param {string} [content] content of the element
	 * @returns {HTMLElement} element
	 * @example
createCanvas(200);

let el = createEl('div', '*');
el.position(50, 50);
el.size(100, 100);
el.style.fontSize = '136px';
el.style.textAlign = 'center';
el.style.backgroundColor = 'blue';
el.style.color = 'white';
	 */
	function createElement(tag: string, content?: string): HTMLElement;

	/** 📑
	 * Creates a link element.
	 * @param {string} href url
	 * @param {string} [text] text content
	 * @param {boolean} [newTab] whether to open the link in a new tab
	 * @example
createCanvas(200);

let link = createA('https://q5js.org', 'q5.js');
link.position(16, 42);
link.style.fontSize = '80px';

link.addEventListener('mouseover', () => {
	background('blue');
});
	 */
	function createA(href: string, text?: string): HTMLAnchorElement;

	/** 📑
	 * Creates a button element.
	 * @param {string} [content] text content
	 * @example
createCanvas(200, 100);

let btn = createButton('Click me!');

btn.addEventListener('click', () => {
	background(random(100, 255));
});
	 */
	function createButton(content?: string): HTMLButtonElement;

	/** 📑
	 * Creates a checkbox element.
	 * 
	 * Use the `checked` property to get or set the checkbox's state.
	 * 
	 * The `label` property is the text label element next to the checkbox.
	 * @param {string} [label] text label placed next to the checkbox
	 * @param {boolean} [checked] initial state
	 * @example
createCanvas(200, 100);

let box = createCheckbox('Check me!');
box.label.style.color = 'lime';

box.addEventListener('input', () => {
	if (box.checked) background('lime');
	else background('black');
});
	 */
	function createCheckbox(label?: string, checked?: boolean): HTMLInputElement;

	/** 📑
	 * Creates a color input element.
	 * 
	 * Use the `value` property to get or set the color value.
	 * @param {string} [value] initial color value
	 * @example
createCanvas(200, 100);

let picker = createColorPicker();
picker.value = '#fd7575';

function draw() {
	background(picker.value);
}
	 */
	function createColorPicker(value?: string): HTMLInputElement;

	/** 📑
	 * Creates an image element.
	 * @param {string} src url of the image
	 * @example
createCanvas(200, 100);

let img = createImg('/assets/p5play_logo.webp')
	.position(0, 0)
	.size(100, 100);
	 */
	function createImg(src: string): HTMLImageElement;

	/** 📑
	 * Creates an input element.
	 * 
	 * Use the `value` property to get or set the input's value.
	 * 
	 * Use the `placeholder` property to set label text that appears
	 * inside the input when it's empty.
	 * 
	 * See MDN's [input documentation](https://developer.mozilla.org/docs/Web/HTML/Element/input#input_types) for the full list of input types.
	 * @param {string} [value] initial value
	 * @param {string} [type] text input type, can be 'text', 'password', 'email', 'number', 'range', 'search', 'tel', 'url'
	 * @example
createCanvas(200, 100);
textSize(64);

let input = createInput();
input.placeholder = 'Type here!';
input.size(200, 32);

input.addEventListener('input', () => {
	background('orange');
	text(input.value, 10, 70);
});
	 */
	function createInput(value?: string, type?: string): HTMLInputElement;

	/** 📑
	 * Creates a paragraph element.
	 * @param {string} [content] text content
	 * @example
createCanvas(200, 50);
background('coral');

let p = createP('Hello, world!');
p.style.color = 'pink';
	 */
	function createP(content?: string): HTMLParagraphElement;

	/** 📑
	 * Creates a radio button group.
	 * 
	 * Use the `option(label, value)` function to add new radio buttons
	 * to the group.
	 * 
	 * Use the `value` property to get or set the value of the selected radio button.
	 * @param {string} [groupName]
	 * @example
createCanvas(200, 100);

let radio = createRadio()
	.option('square', '1')
	.option('circle', '2');

function draw() {
	background(200);
	if (radio.value == '1') square(75, 25, 50);
	if (radio.value == '2') circle(100, 50, 50);
}
	 */
	function createRadio(groupName): HTMLDivElement;

	/** 📑
	 * Creates a select element.
	 * 
	 * Use the `option(label, value)` function to add new options to
	 * the select element.
	 * 
	 * Set `multiple` to `true` to allow multiple options to be selected.
	 * 
	 * Use the `value` property to get or set the selected option value.
	 * 
	 * Use the `selected` property get the labels of the selected 
	 * options or set the selected options by label. Can be a single 
	 * string or an array of strings.
	 * @param {string} [placeholder] optional placeholder text that appears before an option is selected
	 * @example
createCanvas(200, 100);

let sel = createSelect('Select a color')
	.option('Red', '#f55')
	.option('Green', '#5f5');

sel.addEventListener('change', () => {
	background(sel.value);
});
	 */
	function createSelect(placeholder): HTMLSelectElement;

	/** 📑
	 * Creates a slider element.
	 * 
	 * Use the `value` property to get or set the slider's value.
	 * 
	 * Use the `val` function to get the slider's value as a number.
	 * @param {number} min minimum value
	 * @param {number} max maximum value
	 * @param {number} [value] initial value
	 * @param {number} [step] step size
	 * @example
createCanvas(200);

let slider = createSlider(0, 255)
	.position(10, 10)
	.size(180);

function draw() {
	background(slider.val());
}
	 */
	function createSlider(min: number, max: number, value?: number, step?: number): HTMLInputElement;

	/** 📑
	 * Creates a video element.
	 * 
	 * Note that videos must be muted to autoplay and the `play` and 
	 * `pause` functions can only be run after a user interaction.
	 * 
	 * The video element can be hidden and its content can be
	 * displayed on the canvas using the `image` function.
	 * @param {string} src url of the video
	 * @example
createCanvas(0);

let vid = createVideo('/assets/apollo4.mp4');
vid.size(200, 150);
vid.autoplay = vid.muted = vid.loop = true;
vid.controls = true;

	 * @example
createCanvas(200, 150);
let vid = createVideo('/assets/apollo4.mp4');
vid.hide();

function mousePressed() {
	vid.currentTime = 0;
	vid.play();
}
function draw() {
	image(vid, 0, 0, 200, 150);
	filter(HUE_ROTATE, 90);
}
	 */
	function createVideo(src: string): HTMLVideoElement;

	/** 📑
	 * Creates a capture from a connected camera, such as a webcam.
	 * 
	 * The capture video element can be hidden and its content can be
	 * displayed on the canvas using the `image` function.
	 * 
	 * Can preload to ensure the capture is ready to use when your 
	 * sketch starts.
	 * 
	 * Requests the highest video resolution from the user facing camera 	
	 * by default. The first parameter to this function can be used to 
	 * specify the constraints for the capture. See [`getUserMedia`](https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia)
	 * for more info.
	 * @param {string} [type] type of capture, can be only `VIDEO` or only `AUDIO`, the default is to use both video and audio
	 * @param {boolean} [flipped] whether to mirror the video horizontally, true by default
	 * @param {(vid: HTMLVideoElement) => void} [cb] callback function after the capture is created
	 * @example
createCanvas(200);

function mousePressed() {
	let cap = createCapture(VIDEO);
	cap.size(200, 112.5);
	canvas.remove();
}
	 * @example
createCanvas(200);

let cap;
function mousePressed() {
  cap = createCapture(VIDEO);
  cap.hide();
}

function draw() {
  let y = frameCount % height;
  image(cap, 0, y, 200, 200);
}
	* @example
createCanvas(200);

function mousePressed() {
	let cap = createCapture({
		video: { width: 640, height: 480 }
	});
	cap.size(200, 150);
	canvas.remove();
}
	 */
	function createCapture(type?: string, flipped?: boolean, cb?: (vid: HTMLVideoElement) => void): HTMLVideoElement;

	/** 📑
	 * Finds the first element in the DOM that matches the given [CSS selector](https://developer.mozilla.org/docs/Learn_web_development/Core/Styling_basics/Basic_selectors).
	 * @param {string} selector
	 * @returns {HTMLElement} element
	 */
	function findElement(selector: string): HTMLElement;

	/** 📑
	 * Finds all elements in the DOM that match the given [CSS selector](https://developer.mozilla.org/docs/Learn_web_development/Core/Styling_basics/Basic_selectors).
	 * @param {string} selector
	 * @returns {HTMLElement[]} elements
	 */
	function findElements(selector: string): HTMLElement[];

	// 🎞️ record

	/** 🎞️
	 * q5's built-in canvas recorder is powered by
	 * [`MediaRecorder`](https://developer.mozilla.org/docs/Web/API/MediaRecorder/MediaRecorder), which prioritizes low-latency recording, so note
	 * that consistent frame rates are not guaranteed.
	 * 
	 * Recording large canvases is an intensive process, so your
	 * computer may not be able to do it in real time. If real time
	 * interaction while recording is a priority, consider reducing
	 * the canvas' size, frame rate, and/or recording bitrate.
	 * 
	 * I recommend recording at the high bitrates set by default
	 * for the best video quality, then re-encoding the video at a
	 * consistent frame rate and higher compression level using a tool
	 * like ffmpeg or HandBrake.
	 * 
	 * HDR video encoding is not yet supported by any web browser.
	 * For that and other advanced features, consider using
	 * a screen capture tool like [OBS Studio](https://obsproject.com).
	 */

	/** 🎞️
	 * Creates a recorder. Simply hit record to start recording!
	 * 
	 * The following properties can be set via the recorder UI or
	 * programmatically.
	 * 
	 * - `format` is set to "H.264" by default.
	 * - `bitrate` is a number in megabits per second (mbps). Its default
	 * value is determined by the height of the canvas. Increasing the
	 * bitrate will increase the quality and file size of the recording.
	 * - `captureAudio` is set to true by default. Set to false to disable
	 * audio recording.
	 * @returns {HTMLElement} a recorder, q5 DOM element
	 * @example
createCanvas(200);

let rec = createRecorder();
rec.bitrate = 10;

function draw() {
	circle(mouseX, randomY(), 10);
}
	 */
	function createRecorder(): HTMLElement;

	/** 🎞️
	 * Starts recording the canvas or resumes recording if it was paused.
	 * 
	 * If no recorder exists, one is created but not displayed.
	 */
	function record(): void;

	/** 🎞️
	 * Pauses the canvas recording, if one is in progress.
	 */
	function pauseRecording(): void;

	/** 🎞️
	 * Discards the current recording.
	 */
	function deleteRecording(): void;

	/** 🎞️
	 * Saves the current recording as a video file.
	 * @param {string} fileName
	 * @example
function draw() {
	square(mouseX, randomY(), 10);
}

function mousePressed() {
	if (!recording) record();
	else saveRecording('squares');
}
	 */
	function saveRecording(fileName): void;

	/** 🎞️
	 * True if the canvas is currently being recorded.
	 */
	var recording: boolean;

	// 🛠️ utilities

	/** 🛠️
	 * Loads a file or multiple files.
	 * 
	 * File type is determined by file extension. q5 supports loading
	 * text, json, csv, font, audio, and image files.
	 * 
	 * To load many files, it may be easier to use load* functions,
	 * like `loadImage`, with q5's preload system.
	 * @param {...string} urls
	 * @returns {Promise<any[]>} a promise that resolves with objects
	 * @example
let logo;

async function setup() {
	logo = await load('/q5js_logo.webp');
}

function draw() {
	image(logo, 0, 0, 200, 200);
}
	 * @example
new Q5();
createCanvas(200);

// use with top level await in a module
await load('/assets/Robotica.ttf');

background(255);
textSize(24);
text('Hello, world!', 16, 100);
	 * @example
let q = new Q5();
createCanvas(200);

let [jump, retro] = await load(
		'/assets/jump.wav', '/assets/retro.flac'
	);

q.mousePressed = () => {
	mouseButton == 'left' ? jump.play() : retro.play();
};
	 */
	function load(...urls: string[]): Promise<any[]>;

	/** 🛠️
	 * Saves data to a file.
	 * 
	 * If data is not specified, the canvas will be saved.
	 * 
	 * If no arguments are provided, the canvas will be saved as
	 * an image file named "untitled.png".
	 * @param {object} [data] canvas, image, or JS object
	 * @param {string} [fileName] filename to save as
	 * @example
createCanvas(200);
background(200);
circle(100, 100, 50);

function mousePressed() {
	save('circle.png');
}
	 * @example
createCanvas(200);

textSize(180);
let bolt = createTextImage('⚡️');
image(bolt, 16, -56);

function mousePressed() {
	save(bolt, 'bolt.png');
}
	 */
	function save(data?: object, fileName?: string): void;

	/** 🛠️
	 * Loads a text file from the specified url. Result is one string.
	 * @param {string} url text file
	 * @param {(result: string) => void} cb a callback function that is run when the file is loaded
	 */
	function loadText(url: string, cb: (result: string) => void): void;

	/** 🛠️
	 * Loads a JSON file from the specified url. Result depends on the
	 * JSON file's contents, but is typically an object or array.
	 * @param {string} url JSON file
	 * @param {(result: any) => void} cb a callback function that is run when the file is loaded
	 */
	function loadJSON(url: string, cb: (result: any) => void): void;

	/** 🛠️
	 * Loads a CSV file from the specified url. Result is an array of objects.
	 * @param {string} url CSV file
	 * @param {(result: object[]) => void} cb a callback function that is run when the file is loaded
	 */
	function loadCSV(url: string, cb: (result: object[]) => void): void;

	/** 🛠️
	 * Stores an item in localStorage.
	 * @param {string} key key under which to store the item
	 * @param {string} value value to store
	 */
	function storeItem(key: string, value: string): void;

	/** 🛠️
	 * Retrieves an item from localStorage.
	 * @param {string} key key of the item to retrieve
	 * @returns {string} value of the retrieved item
	 */
	function getItem(key: string): string;

	/** 🛠️
	 * Removes an item from localStorage.
	 * @param {string} key key of the item to remove
	 */
	function removeItem(key: string): void;

	/** 🛠️
	 * Clears all items from localStorage.
	 */
	function clearStorage(): void;

	/** 🛠️
	 * Returns the current year.
	 * @returns {number} current year
	 */
	function year(): number;

	/** 🛠️
	 * Returns the current day of the month.
	 * @returns {number} current day
	 */
	function day(): number;

	/** 🛠️
	 * Returns the current hour.
	 * @returns {number} current hour
	 */
	function hour(): number;

	/** 🛠️
	 * Returns the current minute.
	 * @returns {number} current minute
	 */
	function minute(): number;

	/** 🛠️
	 * Returns the current second.
	 * @returns {number} current second
	 */
	function second(): number;

	// ↗️ vector

	/** ↗️
	 * Represents a 2D or 3D vector. This class offers a variety of operations for vector math.
	 */
	class Vector {
		/** ↗️
		 * The x component of the vector.
		 */
		x: number;

		/** ↗️
		 * The y component of the vector.
		 */
		y: number;

		/** ↗️
		 * The z component of the vector, if applicable.
		 */
		z?: number;

		/** ↗️
		 * Constructs a new Vector object.
		 * @param {number} x x component of the vector
		 * @param {number} y y component of the vector
		 * @param {number} [z] optional. The z component of the vector
		 */
		constructor(x: number, y: number, z?: number);

		/** ↗️
		 * Adds a vector to this vector.
		 * @param {Vector} v vector to add
		 * @returns {Vector} resulting vector after addition
		 */
		add(v: Vector): Vector;

		/** ↗️
		 * Subtracts a vector from this vector.
		 * @param {Vector} v vector to subtract
		 * @returns {Vector} resulting vector after subtraction
		 */
		sub(v: Vector): Vector;

		/** ↗️
		 * Multiplies this vector by a scalar or element-wise by another vector.
		 * @param {number | Vector} n scalar to multiply by, or a vector for element-wise multiplication
		 * @returns {Vector} resulting vector after multiplication
		 */
		mult(n: number | Vector): Vector;

		/** ↗️
		 * Divides this vector by a scalar or element-wise by another vector.
		 * @param {number | Vector} n scalar to divide by, or a vector for element-wise division
		 * @returns {Vector} resulting vector after division
		 */
		div(n: number | Vector): Vector;

		/** ↗️
		 * Calculates the magnitude (length) of the vector.
		 * @returns {number} magnitude of the vector
		 */
		mag(): number;

		/** ↗️
		 * Normalizes the vector to a length of 1 (making it a unit vector).
		 * @returns {Vector} this vector after normalization
		 */
		normalize(): Vector;

		/** ↗️
		 * Sets the magnitude of the vector to the specified length.
		 * @param {number} len new length of the vector
		 * @returns {Vector} this vector after setting magnitude
		 */
		setMag(len: number): Vector;

		/** ↗️
		 * Calculates the dot product of this vector and another vector.
		 * @param {Vector} v other vector
		 * @returns {number} dot product
		 */
		dot(v: Vector): number;

		/** ↗️
		 * Calculates the cross product of this vector and another vector.
		 * @param {Vector} v other vector
		 * @returns {Vector} a new vector that is the cross product of this vector and the given vector
		 */
		cross(v: Vector): Vector;

		/** ↗️
		 * Calculates the distance between this vector and another vector.
		 * @param {Vector} v other vector
		 * @returns {number} distance
		 */
		dist(v: Vector): number;

		/** ↗️
		 * Copies this vector.
		 * @returns {Vector} a new vector with the same components as this one
		 */
		copy(): Vector;

		/** ↗️
		 * Sets the components of the vector.
		 * @param {number} x x component
		 * @param {number} y y component
		 * @param {number} [z] optional. The z component
		 * @returns {void}
		 */
		set(x: number, y: number, z?: number): void;

		/** ↗️
		 * Limits the magnitude of the vector to the value used for the max parameter.
		 * @param {number} max maximum magnitude for the vector
		 * @returns {Vector} this vector after limiting
		 */
		limit(max: number): Vector;

		/** ↗️
		 * Calculates the angle of rotation for this vector (only 2D vectors).
		 * @returns {number} angle of rotation
		 */
		heading(): number;

		/** ↗️
		 * Rotates the vector to a specific angle without changing its magnitude.
		 * @param {number} angle angle in radians to set the heading to
		 * @returns {Vector} this vector after setting the heading
		 */
		setHeading(angle: number): Vector;

		/** ↗️
		 * Rotates the vector by the given angle (only 2D vectors).
		 * @param {number} angle angle of rotation in radians
		 * @returns {Vector} this vector after rotation
		 */
		rotate(angle: number): Vector;

		/** ↗️
		 * Linearly interpolates between this vector and another vector.
		 * @param {Vector} v vector to interpolate towards
		 * @param {number} amt amount of interpolation; a number between 0.0 (close to the current vector) and 1.0 (close to the target vector)
		 * @returns {Vector} this vector after interpolation
		 */
		lerp(v: Vector, amt: number): Vector;

		/** ↗️
		 * Linearly interpolates between this vector and another vector, including the magnitude.
		 * @param {Vector} v vector to interpolate towards
		 * @param {number} amt amount of interpolation; a number between 0.0 (close to the current vector) and 1.0 (close to the target vector)
		 * @returns {Vector} this vector after spherical interpolation
		 */
		slerp(v: Vector, amt: number): Vector;

		/** ↗️
		 * Static method to create a new 2D vector from an angle.
		 * @param {number} angle angle in radians
		 * @param {number} [length] length of the vector. The default is 1
		 * @returns {Vector} a new 2D vector pointing in the direction of the given angle
		 */
		static fromAngle(angle: number, length?: number): Vector;
	}

	// ✨ ai

	/** ✨
	 * Run this function before a line of code that isn't working as expected.
	 * @param {string} [question] question to ask the AI
	 */
	function askAI(question?: string): void;

	// ⚡️ shaders

	/** ⚡️
	 * Custom shaders written in WGSL (WebGPU Shading Language) can be
	 * used to create advanced visual effects in q5!
	 * 
	 * For more information on the vertex and fragment function
	 * input parameters, data, and helper functions made available for use 
	 * in your custom shader code, read the ["Custom Shaders in q5 WebGPU"](https://github.com/q5js/q5.js/wiki/Custom-Shaders-in-q5-WebGPU)
	 * wiki page.
	 */

	/** ⚡️
	 * Creates a shader that q5 can use to draw shapes.
	 * 
	 * Use this function to customize a copy of the
	 * [default shapes shader](https://github.com/q5js/q5.js/blob/main/src/shaders/shapes.wgsl).
	 * @param {string} code WGSL shader code excerpt
	 * @returns {GPUShaderModule} a shader program
	 * @example
let q = await Q5.webgpu();

let wobble = createShader(`
@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var vert = transformVertex(v.pos, v.matrixIndex);

  let i = f32(v.vertexIndex) % 4 * 100;
  vert.x += cos((q.time + i) * 0.01) * 0.1;

	var f: FragParams;
	f.position = vert;
	f.color = vec4f(1, 0, 0, 1);
	return f;
}`);

q.draw = () => {
	clear();
	shader(wobble);
	plane(0, 0, 100);
};
	 * @example
let q = await Q5.webgpu();

let stripes = createShader(`
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let r = cos((q.mouseY + f.position.y) * 0.2);
	return vec4(r, 0.0, 1, 1);
}`);

q.draw = () => {
	shader(stripes);
	triangle(-50, -50, 0, 50, 50, -50);
};
	 */
	function createShader(code: string): GPUShaderModule;

	/** ⚡️
	 * A plane is a centered rectangle with no stroke.
	 * @param {number} x center x
	 * @param {number} y center y
	 * @param {number} w width or side length
	 * @param {number} [h] height
	 * @example
let q = await Q5.webgpu();
createCanvas(200);
plane(0, 0, 100);
	 */
	function plane(x: number, y: number, w: number, h?: number): void;

	/** ⚡️
	 * Applies a shader.
	 * @param {GPUShaderModule} shaderModule a shader program
	 */
	function shader(shaderModule: GPUShaderModule): void;

	/** ⚡️
	 * Makes q5 use a default shader.
	 * @param {string} [type] can be "shapes" (default), "image", "video", or "text"
	 * @example
let q = await Q5.webgpu();

let stripes = createShader(`
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let g = cos((q.mouseY + f.position.y) * 0.05);
	return vec4(1, g, 0, 1);
}`);

q.draw = () => {
	shader(stripes);
	background(0);

	resetShader();
	triangle(-50, -50, 0, 50, 50, -50);
};
*/
	function resetShader(type?: string): void;

	/** ⚡️
	 * Makes q5 use default shaders.
	 */
	function resetShaders(): void;

	/** ⚡️
	 * Creates a shader that q5 can use to draw frames.
	 * 
	 * `createCanvas` must be run before using this function.
	 * 
	 * Use this function to customize a copy of the
	 * [default frame shader](https://github.com/q5js/q5.js/blob/main/src/shaders/frame.wgsl).
	 * @example
let q = await Q5.webgpu();
createCanvas(200);

let boxy = createFrameShader(`
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let x = sin(f.texCoord.y * 4 + q.time * 0.002);
	let y = cos(f.texCoord.x * 4 + q.time * 0.002);
	let uv = f.texCoord + vec2f(x, y);
	return textureSample(tex, samp, uv);
}`);

q.draw = () => {
	stroke(1);
	strokeWeight(8);
	line(mouseX, mouseY, pmouseX, pmouseY);
	mouseIsPressed ? resetShaders() : shader(boxy);
};
	 */
	function createFrameShader(code: string): GPUShaderModule;

	/** ⚡️
	 * Creates a shader that q5 can use to draw images.
	 * 
	 * Use this function to customize a copy of the
	 * [default image shader](https://github.com/q5js/q5.js/blob/main/src/shaders/image.wgsl).
	 * @param {string} code WGSL shader code excerpt
	 * @returns {GPUShaderModule} a shader program
	 * @example
let q = await Q5.webgpu();
imageMode(CENTER);

let logo = loadImage('/q5js_logo.webp');

let grate = createImageShader(`
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	var texColor = textureSample(tex, samp, f.texCoord);
	texColor.b += (q.mouseX + f.position.x) % 20 / 10;
	return texColor;
}`);

q.draw = () => {
	background(0.7);
	shader(grate);
	image(logo, 0, 0, 180, 180);
};
	 */
	function createImageShader(code: string): GPUShaderModule;

	/** ⚡️
	 * Creates a shader that q5 can use to draw video frames.
	 * 
	 * Use this function to customize a copy of the
	 * [default video shader](https://github.com/q5js/q5.js/blob/main/src/shaders/video.wgsl).
	 * @param {string} code WGSL shader code excerpt
	 * @returns {GPUShaderModule} a shader program
	 * @example
let q = await Q5.webgpu();
createCanvas(200, 600);

let vid = createVideo('/assets/apollo4.mp4');
vid.hide();

let flipper = createVideoShader(`
@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var vert = transformVertex(v.pos, v.matrixIndex);

	vert.y *= cos((q.frameCount + f32(v.vertexIndex) * 10) * 0.03);

	var f: FragParams;
	f.position = vert;
	f.texCoord = v.texCoord;
	return f;
}
	
@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	var texColor = textureSampleBaseClampToEdge(tex, samp, f.texCoord);
	texColor.r = 0;
	texColor.b *= 2;
	return texColor;
}`);

q.draw = () => {
	clear();
	if (mouseIsPressed) vid.play();
	shader(flipper);
	image(vid, -100, 150, 200, 150);
};
//
	 */
	function createVideoShader(code: string): GPUShaderModule;

	/** ⚡️
	 * Creates a shader that q5 can use to draw text.
	 * 
	 * Use this function to customize a copy of the
	 * [default text shader](https://github.com/q5js/q5.js/blob/main/src/shaders/text.wgsl).
	 * @param {string} code WGSL shader code excerpt
	 * @returns {GPUShaderModule} a shader program
	 * @example
let q = await Q5.webgpu();
textAlign(CENTER, CENTER);

let spin = createTextShader(`
@vertex
fn vertexMain(v : VertexParams) -> FragParams {
	let char = textChars[v.instanceIndex];
	let text = textMetadata[i32(char.w)];
	let fontChar = fontChars[i32(char.z)];
	let pos = calcPos(v.vertexIndex, char, fontChar, text);

	var vert = transformVertex(pos, text.matrixIndex);

	let i = f32(v.instanceIndex + 1);
	vert.y *= cos((q.frameCount - 5 * i) * 0.05);

	var f : FragParams;
	f.position = vert;
	f.texCoord = calcUV(v.vertexIndex, fontChar);
	f.fillColor = colors[i32(text.fillIndex)];
	f.strokeColor = colors[i32(text.strokeIndex)];
	f.strokeWeight = text.strokeWeight;
	return f;
}`);

q.draw = () => {
	clear();
	shader(spin);
	fill(1, 0, 1);
	textSize(32);
	text('Hello, World!', 0, 0);
};
	 */
	function createTextShader(code: string): GPUShaderModule;
}

export {};
