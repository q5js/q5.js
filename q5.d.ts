/**
 * q5.d.ts
 * 
 * TypeScript definitions for q5.js for use with IDEs like VSCode
 * for autocompletion, hover over documentation, and type checking.
 */
declare global {
	// ⭐️ core

	class Q5 {
		/** ⭐️
		 * Creates an instance of Q5.
		 *
		 * Running `new Q5()` enables the use of q5 functions and variables
		 * anywhere in your code. You can also start Q5 in global mode by 
		 * running [`createCanvas`](https://q5js.org/learn/#canvas-createCanvas).
		 * @param {string | Function} [scope] -
		 *   - "global": (default) top-level global mode, adds q5 functions
		 * and variables to the global scope
		 *   - "auto": if users don't create a new instance of Q5 themselves, an instance will be created automatically with this scope, which replicates p5's global mode
		 *   - "instance": enables users to [assign a Q5 instance to a variable](https://github.com/q5js/q5.js/wiki/Instance-Mode), not to the global scope
		 * @param {HTMLElement} [parent] - element that the canvas will be placed inside
		 * @example
		 * new Q5();
		 * createCanvas(200, 100);
		 * circle(100, 50, 80);
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
	}

	/** ⭐️
	 * The draw function is run 60 times per second by default.
	 * @example
function draw() {
  background('lightgray');
	circle(frameCount % 200, 100, 80);
}
	 */
	function draw(): void;

	/** ⭐️
	 * The setup function is called once when the program starts.
	 * @example
function setup() {
	createCanvas(200, 100);
	background('aqua');
}
	 */
	function setup(): void;

	/** ⭐️
	 * Use preload to load assets before the sketch starts and the
	 * setup and draw functions are run.
	 * @example
let logo;
function preload() {
	logo = loadImage('/q5js_logo.webp');
}
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
	 * @param {number} [n] - number of times to redraw the canvas, default is 1
	 * @example
createCanvas(200, 200);
noLoop();

function draw() {
  circle(frameCount * 5, 100, 80);
}
function mouseClicked() {
  redraw();
}
	 */
	function redraw(n?: number): void;

	/** ⭐️
	 * Starts the draw loop again if it was stopped.
	 * @example
createCanvas(200, 200);
noLoop();

function draw() {
  circle(frameCount * 5, 100, 80);
}
function mouseClicked() {
  loop();
}
	 */
	function loop(): void;

	/** ⭐️
	 * Sets the target frame rate or gets the sketch's current frame rate.
	 * @param {number} [hertz] - target frame rate, default is 60
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
	 * in one second, which can be higher than the target frame rate. Useful
	 * for analyzing performance.
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
	 * [`console.log`](https://developer.mozilla.org/en-US/docs/Web/API/console/log_static) function.
	 * @param {*} message - message to log
	 */
	function log(message: any): void;

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

	// ⬜️ canvas

	/** ⬜️
	 * Creates a canvas element. If no input parameters are provided, the
	 * canvas will be the size of the window.
	 * 
	 * You can start q5 in top level global mode by running this function
	 * before the rest of your code.
	 *
	 * If this function is not run by the user, a 200x200 canvas will be
	 * created automatically.
	 * @param {number} [w] - width of the canvas
	 * @param {number} [h] - height of the canvas
	 * @param {Object} [options] - options for the canvas
	 * @param {boolean} [options.alpha] - whether the canvas should have an alpha channel that allows it to be seen through, default is false
	 * @param {string} [options.colorSpace] - color space of the canvas, either "srgb" or "display-p3", default is "display-p3" for devices that support HDR colors
	 * @returns {HTMLCanvasElement} created canvas element
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
	 */
	var canvas: HTMLCanvasElement;

	/** ⬜️
	 * The width of the canvas.
	 * Can also be accessed via `canvas.w`/`canvas.width`.
	 */
	var width: number;

	/** ⬜️
	 * The height of the canvas.
	 * Can also be accessed via `canvas.h`/`canvas.height`.
	 */
	var height: number;

	/** ⬜️
	 * Clears the canvas, making every pixel completely transparent.
	 *
	 * The canvas can only be seen through if it has an alpha channel though.
	 */
	function clear(): void;

	/** ⬜️
	 * Sets the fill color for shapes. The default is white.
	 * 
	 * Like the [`color`](https://q5js.org/learn/#color) function, this function can accept colors in a wide range of formats: CSS color string, hex string, grayscale value, and color component values.
	 * @param {string | Color} color - fill color
	 * @example
function draw() {
	background(200);

  fill('red');
  circle(80, 80, 80);

	fill('lime');
  square(80, 80, 80);
}
	 */
	function fill(color: string | Color): void;

	/** ⬜️
	 * Sets the stroke (outline) color for shapes. The default is black.
	 * 
	 * Like the [`color`](https://q5js.org/learn/#color) function, this function can accept colors in a wide range of formats: CSS color string, hex string, grayscale value, and color component values.
	 * @param {string | Color} color - stroke color
	 * @example
function draw() {
  background(200);
	fill(36);

  stroke('red');
  circle(80, 80, 80);
	stroke('lime');
  square(80, 80, 80);
}
	 */
	function stroke(color: string | Color): void;

	/** ⬜️
	 * After calling this function, shapes will not be filled.
	 * @example
function draw() {
  background(200);

	noFill();
  stroke('red');
  circle(80, 80, 80);
	stroke('lime');
  square(80, 80, 80);
}
	 */
	function noFill(): void;

	/** ⬜️
	 * After calling this function, shapes will not have a stroke (outline).
	 * @example
function draw() {
  background(200);
  fill(36);
  stroke('red');
  circle(80, 80, 80);

	noStroke();
  square(80, 80, 80);
}
	 */
	function noStroke(): void;

	/** ⬜️
	 * Sets the size of the stroke used for lines and the border around shapes.
	 * @param {number} weight - size of the stroke in pixels
	 * @example
function setup() {
	createCanvas(200, 200);
	background(200);
	stroke('red');
  circle(50, 100, 80);

  strokeWeight(20);
  circle(150, 100, 80)
}
	 */
	function strokeWeight(weight: number): void;

	/** ⬜️
	 * Sets the global opacity, which affects all subsequent drawing operations, except `background`. Default is 1, fully opaque.
	 * @param {number} alpha - opacity level, ranging from 0 to 1
	 * @example
function draw() {
	background(200);
	
	opacity(1);
	circle(80, 80, 80);

	opacity(0.2);
	square(80, 80, 80);
}
	 */
	function opacity(alpha: number): void;

	/** ⬜️
	 * Translates the origin of the drawing context.
	 * @param {number} x - translation along the x-axis
	 * @param {number} y - translation along the y-axis
	 */
	function translate(x: number, y: number): void;

	/** ⬜️
	 * Rotates the drawing context.
	 * @param {number} angle - rotation angle in radians
	 */
	function rotate(angle: number): void;

	/** ⬜️
	 * Scales the drawing context.
	 * @param {number} x - scaling factor along the x-axis
	 * @param {number} [y] - scaling factor along the y-axis
	 */
	function scale(x: number, y?: number): void;

	/** ⬜️
	 * Shears the drawing context along the x-axis.
	 * @param {number} angle - shear angle in radians
	 */
	function shearX(angle: number): void;

	/** ⬜️
	 * Shears the drawing context along the y-axis.
	 * @param {number} angle - shear angle in radians
	 */
	function shearY(angle: number): void;

	/** ⬜️
	 * Applies a transformation matrix.
	 *
	 * Accepts a 3x3 or 4x4 matrix as either an array or multiple arguments.
	 * @param {number} a - horizontal scaling
	 * @param {number} b - horizontal skewing
	 * @param {number} c - vertical skewing
	 * @param {number} d - vertical scaling
	 * @param {number} e - horizontal moving
	 * @param {number} f - vertical moving
	 */
	function applyMatrix(a: number, b: number, c: number, d: number, e: number, f: number): void;

	/** ⬜️
	 * Resets the transformation matrix.
	 */
	function resetMatrix(): void;

	/** ⬜️
	 * Saves the current transformation matrix.
	 */
	function pushMatrix(): void;

	/** ⬜️
	 * Restores the previously saved transformation matrix.
	 */
	function popMatrix(): void;

	/** ⬜️
	 * Saves the current drawing style settings.
	 *
	 * This includes the fill, stroke, stroke weight, tint, image mode, rect mode, ellipse mode, text size, text align, and text baseline.
	 */
	function pushStyles(): void;

	/** ⬜️
	 * Restores the previously saved drawing style settings.
	 */
	function popStyles(): void;

	/** ⬜️
	 * Saves the current drawing style settings and transformations.
	 */
	function push(): void;

	/** ⬜️
	 * Restores the previously saved drawing style settings and transformations.
	 */
	function pop(): void;

	/** ⬜️
	 * Resizes the canvas to the specified width and height.
	 * @param {number} w - width of the canvas
	 * @param {number} h - height of the canvas
	 */
	function resizeCanvas(w: number, h: number): void;

	/** ⬜️
	 * Sets the pixel density of the canvas.
	 * @param {number} v - pixel density value
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
	 * @param {boolean} [v] - boolean indicating whether to enable or disable fullscreen mode
	 * @returns {void | boolean} true if fullscreen mode is enabled, false otherwise
	 */
	function fullscreen(v?: boolean): void | boolean;

	/** ⬜️
	 * Any position coordinates or dimensions you use will be scaled based
	 * on the unit provided to this function.
	 * @param {number} unit - unit to scale by
	 * @example
createCanvas(200, 200);
flexibleCanvas(100);
// rect will appear in the middle of the canvas
rect(20, 20, 60, 60);
	 */
	function flexibleCanvas(unit: number): void;

	/** ⬜️
	 * Creates a graphics buffer.
	 * @param {number} w - width
	 * @param {number} h - height
	 * @param {Object} [opt] - options
	 * @returns {Q5} a new Q5 graphics buffer
	 */
	function createGraphics(w: number, h: number, opt?: CanvasRenderingContext2DSettings): Q5;

	/** ⬜️
	 * The 2D rendering context for the canvas.
	 */
	var ctx: CanvasRenderingContext2D;

	/** ⬜️
	 * Alias for `ctx`, the 2D rendering context for the canvas.
	 */
	var drawingContext: CanvasRenderingContext2D;

	// 💻 display

	/** 💻
	 * The `displayMode` function lets you customize how your canvas is presented.
	 * @param {string} mode -
	 *   - "normal": (default) no styling to canvas or its parent element
	 *   - "centered": canvas will be centered horizontally and vertically within its parent and if it's display size is bigger than its parent it will not clip
	 *   - "maxed": canvas will fill the parent element, same as fullscreen for a global mode canvas inside a `main` element
	 *   - "fullscreen": canvas will fill the screen with letterboxing if necessary to preserve its aspect ratio, like css object-fit contain
	 * @param {string} renderQuality -
	 *   - "smooth": (default) no changes to the default render quality
	 *   - "pixelated": pixelDensity set to 1 and various css styles are applied to the canvas to make it render without image smoothing
	 * @param {number} scale - can be given as a string (for example "x2") or a number
	 */
	function displayMode(mode: string, renderQuality: string, scale: string | number): void;

	// 🧑‍🎨 drawing

	/** 🧑‍🎨
	 * Draws over the entire canvas with a color or image.
	 * @param {string | number} color - color or image to draw
	 */
	function background(color: string | number): void;

	/** 🧑‍🎨
	 * Draws a rectangle.
	 * @param {number} x - x-coordinate
	 * @param {number} y - y-coordinate
	 * @param {number} w - width of the rectangle
	 * @param {number} [h] - height of the rectangle
	 * @param {number} [tl] - top-left radius for rounded corners
	 * @param {number} [tr] - top-right radius for rounded corners
	 * @param {number} [br] - bottom-right radius for rounded corners
	 * @param {number} [bl] - bottom-left radius for rounded corners
	 */
	function rect(x: number, y: number, w: number, h?: number, tl?: number, tr?: number, br?: number, bl?: number): void;

	/** 🧑‍🎨
	 * Draws a square.
	 * @param {number} x - x-coordinate
	 * @param {number} y - y-coordinate
	 * @param {number} size - size of the sides of the square
	 * @param {number} [tl] - top-left radius for rounded corners
	 * @param {number} [tr] - top-right radius for rounded corners
	 * @param {number} [br] - bottom-right radius for rounded corners
	 * @param {number} [bl] - bottom-left radius for rounded corners
	 */
	function square(x: number, y: number, size: number, tl?: number, tr?: number, br?: number, bl?: number): void;

	/** 🧑‍🎨
	 * Draws a circle.
	 * @param {number} x - x-coordinate
	 * @param {number} y - y-coordinate
	 * @param {number} diameter - diameter of the circle
	 */
	function circle(x: number, y: number, diameter: number): void;

	/** 🧑‍🎨
	 * Draws an ellipse.
	 * @param {number} x - x-coordinate
	 * @param {number} y - y-coordinate
	 * @param {number} width - width of the ellipse
	 * @param {number} [height] - height of the ellipse
	 */
	function ellipse(x: number, y: number, width: number, height?: number): void;

	/** 🧑‍🎨
	 * Draws an arc.
	 * @param {number} x - x-coordinate
	 * @param {number} y - y-coordinate
	 * @param {number} w - width of the arc
	 * @param {number} h - height of the arc
	 * @param {number} start - angle to start the arc
	 * @param {number} stop - angle to stop the arc
	 * @param {number} [mode] - drawing mode, can be `PIE`, `CHORD`, or `OPEN`
	 * @param {number} [detail] - resolution of the arc
	 */
	function arc(x: number, y: number, w: number, h: number, start: number, stop: number, mode?: number, detail?: number): void;

	/** 🧑‍🎨
	 * Draws a line on the canvas.
	 * @param {number} x1 - x-coordinate of the first point
	 * @param {number} y1 - y-coordinate of the first point
	 * @param {number} x2 - x-coordinate of the second point
	 * @param {number} y2 - y-coordinate of the second point
	 */
	function line(x1: number, y1: number, x2: number, y2: number): void;

	/** 🧑‍🎨
	 * Draws a point on the canvas.
	 * @param {number} x - x-coordinate
	 * @param {number} y - y-coordinate
	 */
	function point(x: number, y: number): void;

	/** 🧑‍🎨
	 * Sets the global composite operation for the canvas context.
	 * @param {string} val - composite operation to set
	 */
	function blendMode(val: string): void;

	/** 🧑‍🎨
	 * Sets the line cap style for the canvas context.
	 * @param {CanvasLineCap} val - line cap style to set ('butt', 'round', 'square')
	 */
	function strokeCap(val: CanvasLineCap): void;

	/** 🧑‍🎨
	 * Sets the line join style for the canvas context.
	 * @param {CanvasLineJoin} val - line join style to set ('round', 'bevel', 'miter')
	 */
	function strokeJoin(val: CanvasLineJoin): void;

	/** 🧑‍🎨
	 * Sets the ellipse mode.
	 * @param {string} val - ellipse mode to set
	 */
	function ellipseMode(val: string): void;

	/** 🧑‍🎨
	 * Sets the rectangle mode.
	 * @param {string} val - rectangle mode to set
	 */
	function rectMode(val: string): void;

	/** 🧑‍🎨
	 * Sets the curve detail level.
	 * @param {number} val - curve detail level to set
	 */
	function curveDetail(val: number): void;

	/** 🧑‍🎨
	 * Sets the curve alpha value.
	 * @param {number} val - curve alpha value to set
	 */
	function curveAlpha(val: number): void;

	/** 🧑‍🎨
	 * Sets the curve tightness value.
	 * @param {number} val - curve tightness value to set
	 */
	function curveTightness(val: number): void;

	/** 🧑‍🎨
	 * Starts recording vertices for a shape.
	 */
	function beginShape(): void;

	/** 🧑‍🎨
	 * Starts recording vertices for a shape to be used as a contour.
	 */
	function beginContour(): void;

	/** 🧑‍🎨
	 * Ends recording vertices for a shape.
	 */
	function endContour(): void;

	/** 🧑‍🎨
	 * Specifies a vertex in a shape.
	 * @param {number} x - x-coordinate
	 * @param {number} y - y-coordinate
	 */
	function vertex(x: number, y: number): void;

	/** 🧑‍🎨
	 * Specifies a Bezier vertex in a shape.
	 * @param {number} cp1x - x-coordinate of the first control point
	 * @param {number} cp1y - y-coordinate of the first control point
	 * @param {number} cp2x - x-coordinate of the second control point
	 * @param {number} cp2y - y-coordinate of the second control point
	 * @param {number} x - x-coordinate of the anchor point
	 * @param {number} y - y-coordinate of the anchor point
	 */
	function bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

	/** 🧑‍🎨
	 * Specifies a quadratic Bezier vertex in a shape.
	 * @param {number} cp1x - x-coordinate of the control point
	 * @param {number} cp1y - y-coordinate of the control point
	 * @param {number} x - x-coordinate of the anchor point
	 * @param {number} y - y-coordinate of the anchor point
	 */
	function quadraticVertex(cp1x: number, cp1y: number, x: number, y: number): void;

	/** 🧑‍🎨
	 * Draws a Bezier curve.
	 * @param {number} x1 - x-coordinate of the first anchor point
	 * @param {number} y1 - y-coordinate of the first anchor point
	 * @param {number} x2 - x-coordinate of the first control point
	 * @param {number} y2 - y-coordinate of the first control point
	 * @param {number} x3 - x-coordinate of the second control point
	 * @param {number} y3 - y-coordinate of the second control point
	 * @param {number} x4 - x-coordinate of the second anchor point
	 * @param {number} y4 - y-coordinate of the second anchor point
	 */
	function bezier(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	/** 🧑‍🎨
	 * Draws a triangle.
	 * @param {number} x1 - x-coordinate of the first vertex
	 * @param {number} y1 - y-coordinate of the first vertex
	 * @param {number} x2 - x-coordinate of the second vertex
	 * @param {number} y2 - y-coordinate of the second vertex
	 * @param {number} x3 - x-coordinate of the third vertex
	 * @param {number} y3 - y-coordinate of the third vertex
	 */
	function triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

	/** 🧑‍🎨
	 * Draws a quadrilateral.
	 * @param {number} x1 - x-coordinate of the first vertex
	 * @param {number} y1 - y-coordinate of the first vertex
	 * @param {number} x2 - x-coordinate of the second vertex
	 * @param {number} y2 - y-coordinate of the second vertex
	 * @param {number} x3 - x-coordinate of the third vertex
	 * @param {number} y3 - y-coordinate of the third vertex
	 * @param {number} x4 - x-coordinate of the fourth vertex
	 * @param {number} y4 - y-coordinate of the fourth vertex
	 */
	function quad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	/** 🧑‍🎨
	 * Sets the canvas to erase mode, where shapes will erase what's underneath them instead of drawing over it.
	 * @param {number} [fillAlpha] - opacity level of the fill color from 0 to 255
	 * @param {number} [strokeAlpha] - opacity level of the stroke color from 0 to 255
	 */
	function erase(fillAlpha?: number, strokeAlpha?: number): void;

	/** 🧑‍🎨
	 * Resets the canvas from erase mode to normal drawing mode.
	 */
	function noErase(): void;

	/** 🧑‍🎨
	 * Checks if a given point is within the current path's fill area.
	 * @param {number} x - x-coordinate of the point
	 * @param {number} y - y-coordinate of the point
	 * @returns {boolean} true if the point is within the fill area, false otherwise
	 */
	function inFill(x: number, y: number): boolean;

	/** 🧑‍🎨
	 * Checks if a given point is within the current path's stroke.
	 * @param {number} x - x-coordinate of the point
	 * @param {number} y - y-coordinate of the point
	 * @returns {boolean} true if the point is within the stroke, false otherwise
	 */
	function inStroke(x: number, y: number): boolean;

	// 🌆 image

	/** 🌆
	 * Loads an image from a URL and optionally runs a callback function.
	 * @param {string} url - url of the image to load
	 * @param {(img: any) => void} [cb] - callback function after the image is loaded
	 * @param {any} [opt] - optional parameters for loading the image
	 * @example
createCanvas(200, 200);

let logo = loadImage('/q5js_logo.webp');

function draw() {
	image(logo, 0, 0, 200, 200);
}
	 */
	function loadImage(url: string, cb?: (img: any) => void, opt?: any): void;

	/** 🌆
	 * Draws an image to the canvas.
	 * @param {any} img - image to draw
	 * @param {number} dx - x position to draw the image at
	 * @param {number} dy - y position to draw the image at
	 * @param {number} [dw] - width of the destination image
	 * @param {number} [dh] - height of the destination image
	 * @param {number} [sx] - x position in the source to start clipping a subsection from
	 * @param {number} [sy] - y position in the source to start clipping a subsection from
	 * @param {number} [sw] - width of the subsection of the source image
	 * @param {number} [sh] - height of the subsection of the source image
	 * @example
createCanvas(200, 200);

let logo = loadImage('/q5js_logo.webp');

function draw() {
  image(logo, 0, 0, 200, 200, 256, 256, 512, 512);
}
	 */
	function image(img: any, dx: number, dy: number, dw?: number, dh?: number, sx?: number, sy?: number, sw?: number, sh?: number): void;

	/** 🌆
	 * Sets the image mode, which determines the position and alignment of images drawn on the canvas.
	 * - `CORNER`: (default) images will be drawn from the top-left corner
	 * - `CORNERS`: images will be drawn from the top-left to the bottom-right corner
	 * - `CENTER`: images will be drawn centered at (dx, dy)
	 * @param {string} mode
	 * @example
createCanvas(200, 200);

let logo = loadImage('/q5js_logo.webp');

function draw() {
	imageMode(CENTER);
	image(logo, 100, 100, 200, 200);
}
	 */
	function imageMode(mode: string): void;

	/** 🌆
	 * Resizes the image.
	 * @param {number} w - new width
	 * @param {number} h - new height
	 * @example
createCanvas(200, 200);

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
	function trim(): Image;

	/** 🌆
	 * Enables smooth image rendering.
	 */
	function smooth(): void;

	/** 🌆
	 * Disables smooth image rendering for a pixelated look.
	 */
	function noSmooth(): void;

	/** 🌆
	 * Applies a tint (color overlay) to the drawing.
	 * Tinting affects all subsequent images drawn.
	 * @param {string | number} color - tint color
	 */
	function tint(color: string | number): void;

	/** 🌆
	 * Images drawn after this function is run will not be tinted.
	 */
	function noTint(): void;

	/** 🌆
	 * Masks the image with another image.
	 * @param {Image} img - image to use as a mask
	 */
	function mask(img: Image): void;

	/** 🌆
	 * Saves the image.
	 * @param {string} filename - filename or path
	 * @param {string} extension - file extension
	 * @param {number} [quality] - quality of the saved image
	 */
	function save(filename: string, extension: string, quality?: number): void;

	/** 🌆
	 * Displays a region of the image on another region of the image.
	 * Can be used to create a detail inset, aka a magnifying glass effect.
	 * @param {number} sx - x-coordinate of the source region
	 * @param {number} sy - y-coordinate of the source region
	 * @param {number} sw - width of the source region
	 * @param {number} sh - height of the source region
	 * @param {number} dx - x-coordinate of the destination region
	 * @param {number} dy - y-coordinate of the destination region
	 * @param {number} dw - width of the destination region
	 * @param {number} dh - height of the destination region
	 * @example
let logo;
function preload() {
  logo = loadImage('/q5js_logo.webp');
}
function setup() {
	logo.inset(256, 256, 512, 512, 0, 0, 200, 200);
}
function draw() {
  
}
	 */
	function inset(sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;

	/** 🌆
	 * Returns a copy of the image.
	 * @returns {Image}
	 */
	function copy(): Image;

	/** 🌆
	 * Retrieves a subsection of an image or canvas, as a q5 Image.
	 * Or if width and height are both 1, returns the color of the pixel at the given coordinates in `[R, G, B, A]` array format.
	 * To edit the color value of multiple pixels, it's faster to use `loadPixels` and `updatePixels`.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} [w] - width of the area
	 * @param {number} [h] - height of the area
	 * @returns {Image | number[]}
	 */
	function get(x: number, y: number, w?: number, h?: number): Image | number[];

	/** 🌆
	 * Sets a pixel's color in the image or canvas.
	 * Or if a canvas or image is provided, it's drawn on top of the destination image or canvas ignoring its tint setting.
	 * @param {number} x
	 * @param {number} y
	 * @param {any} c - color, canvas, or image
	 */
	function set(x: number, y: number, c: any): void;

	/** 🌆
	 * Array of pixels in the canvas or image. Use `loadPixels` to load the pixel data.
	 */
	var pixels: number[];

	/** 🌆
	 * Loads pixel data into the image's `pixels` array.
	 */
	function loadPixels(): void;

	/** 🌆
	 * Updates the image's `pixels` array to the canvas.
	 */
	function updatePixels(): void;

	/** 🌆
	 * Masks the image with another image.
	 * @param {Image} img - image to use as a mask
	 */
	function mask(img: Image): void;

	/** 🌆
	 * Applies a filter to the image.
	 * @param {string} type - type of filter
	 * @param {number} [value] - optional parameter, depending on filter type
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
	 * @param {number} w - width
	 * @param {number} h - height
	 * @param {any} [opt] - optional settings for the image
	 * @returns {Image}
	 */
	function createImage(w: number, h: number, opt?: any): Image;

	// ✍️ text

	/** ✍️
	 * Renders text to the screen. Text can be positioned with the x and y
	 * parameters and can optionally be constrained within a bounding box.
	 * @param {string} str - string of text to display
	 * @param {number} x - x-coordinate of the text's position
	 * @param {number} y - y-coordinate of the text's position
	 * @param {number} [w] - width of the bounding box
	 * @param {number} [h] - height of the bounding box
	 */
	function text(str: string, x: number, y: number, w?: number, h?: number): void;

	/** ✍️
	 * Loads a font from a URL and optionally runs a callback function with the font name once it's loaded.
	 *
	 * WebGPU: Fonts must be in MSDF format with the file ending
	 * "-msdf.json". If no font is loaded before `text` is run, then
	 * the default font is loaded:
	 * https://q5js.org/fonts/YaHei-msdf.json
	 * @param {string} url - uRL of the font to load
	 * @param {(fontName: string) => void} [cb] - optional callback function that receives the font name as an argument once the font is loaded
	 * @returns {string} name of the loaded font
	 */
	function loadFont(url: string, cb?: (fontName: string) => void): string;

	/** ✍️
	 * Sets the current font to be used for rendering text.
	 * @param {string} fontName - name of the font
	 */
	function textFont(fontName: string): void;

	/** ✍️
	 * Sets or gets the current font size. If no argument is provided, returns the current font size.
	 * @param {number} [size] - size of the font in pixels
	 * @returns {number | void} current font size when no argument is provided
	 */
	function textSize(size?: number): number | void;

	/** ✍️
	 * Sets or gets the current line height. If no argument is provided, returns the current line height.
	 * @param {number} [leading] - line height in pixels
	 * @returns {number | void} current line height when no argument is provided
	 */
	function textLeading(leading?: number): number | void;

	/** ✍️
	 * Sets the current text style.
	 * @param {'normal' | 'italic' | 'bold' | 'bolditalic'} style - font style
	 */
	function textStyle(style: 'normal' | 'italic' | 'bold' | 'bolditalic'): void;

	/** ✍️
	 * Sets the horizontal and vertical alignment of text.
	 * @param {'left' | 'center' | 'right'} horiz - horizontal alignment
	 * @param {'top' | 'middle' | 'bottom' | 'alphabetic'} [vert] - vertical alignment
	 */
	function textAlign(horiz: 'left' | 'center' | 'right', vert?: 'top' | 'middle' | 'bottom' | 'alphabetic'): void;

	/** ✍️
	 * Calculates and returns the width of a given string of text.
	 * @param {string} str - string to measure
	 * @returns {number} width of the text in pixels
	 */
	function textWidth(str: string): number;

	/** ✍️
	 * Calculates and returns the ascent (the distance from the baseline to the top of the highest character) of the current font.
	 * @param {string} str - string to measure
	 * @returns {number} ascent of the text in pixels
	 */
	function textAscent(str: string): number;

	/** ✍️
	 * Calculates and returns the descent (the distance from the baseline to the bottom of the lowest character) of the current font.
	 * @param {string} str - string to measure
	 * @returns {number} descent of the text in pixels
	 */
	function textDescent(str: string): number;

	/** ✍️
	 * Creates an image from a string of text. Width and height
	 * will not be the width and height of the text image, but of
	 * the bounding box that the text will be constrained within.
	 * @param {string} str - string of text
	 * @param {number} w - width of the bounding box
	 * @param {number} h - height of the bounding box
	 * @returns {Q5} an image object representing the rendered text
	 */
	function createTextImage(str: string, w: number, h: number): Q5;

	/** ✍️
	 * Renders an image generated from text onto the canvas. The
	 * positioning of the image can be affected by the current text
	 * alignment and baseline settings.
	 * @param {HTMLImageElement} img - image object to render, typically generated from text
	 * @param {number} x - x-coordinate where the image should be placed
	 * @param {number} y - y-coordinate where the image should be placed
	 */
	function textImage(img: HTMLImageElement, x: number, y: number): void;

	/** ✍️
	 * Number formatter, can be used to display a number as a string with
	 * a specified number of digits before and after the decimal point,
	 * optionally adding padding with zeros.
	 * @param {number} n - number to format
	 * @param {number} l - minimum number of digits to appear before the decimal point; the number is padded with zeros if necessary
	 * @param {number} r - number of digits to appear after the decimal point
	 * @returns {string} a string representation of the number, formatted accordingly
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
	 * Align text to the center.
	 */
	const CENTER: 'center';

	/** ✍️
	 * Align text to the left.
	 */
	const LEFT: 'left';

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

	// ✨ ai

	/** ✨
	 * Run this function before a line of code that isn't working as expected.
	 * @param {string} [question] - question to ask the AI
	 */
	function askAI(question?: string): void;

	// 🎨 color

	/** 🎨
	 * Sets the color mode for the sketch. Changes the type of color object created by color functions.
	 *
	 * In WebGPU, the default color mode is 'rgb' in float format.
	 * @param {'rgb' | 'srgb' | 'oklch'} mode - color mode
	 * @param {1 | 255} format - color format (1 for float, 255 for integer)
	 */
	function colorMode(mode: 'rgb' | 'srgb' | 'oklch', format: 1 | 255): void;

	/** 🎨
	 * Creates a new `Color` object. It can parse different
	 * color representations depending on the current `colorMode`.
	 * @param {string | number | Color | number[]} c0 - first color component, or a string representing the color, or a `Color` object, or an array of components
	 * @param {number} [c1] - second color component
	 * @param {number} [c2] - third color component
	 * @param {number} [c3] - fourth color component (alpha)
	 * @returns {Color} a new `Color` object
	 */
	function color(c0: string | number | Color | number[], c1?: number, c2?: number, c3?: number): Color;

	// 🖲️ input

	/** 🖲️
	 * Current X position of the mouse.
	 */
	let mouseX: number;

	/** 🖲️
	 * Current Y position of the mouse.
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
	 * Array of current touches, each touch being an object with x, y, id, etc.
	 */
	let touches: any[];

	/** 🖲️
	 * The current button being pressed ('left', 'right', 'center'), or null if no button is pressed.
	 */
	let mouseButton: string;

	/** 🖲️
	 * True if a key is currently pressed, false otherwise.
	 */
	let keyIsPressed: boolean;

	/** 🖲️
	 * True if the mouse is currently pressed, false otherwise.
	 */
	let mouseIsPressed: boolean;

	/** 🖲️
	 * The value of the last key pressed.
	 */
	let key: string;

	/** 🖲️
	 * The keyCode of the last key pressed.
	 */
	let keyCode: number;

	/** 🖲️
	 * Sets the cursor to a specified type or image path.
	 * If an image is provided, optional x and y coordinates can
	 * specify the active point of the cursor.
	 * https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
	 * @param {string} name - name of the cursor or the path to an image
	 * @param {number} [x] - x-coordinate of the cursor's hot spot
	 * @param {number} [y] - y-coordinate of the cursor's hot spot
	 */
	function cursor(name: string, x?: number, y?: number): void;

	/** 🖲️
	 * Hides the cursor.
	 */
	function noCursor(): void;

	/** 🖲️
	 * Requests that the pointer be locked to the document body, hiding the cursor and allowing for unlimited movement.
	 */
	function requestPointerLock(): void;

	/** 🖲️
	 * Exits pointer lock, showing the cursor again and stopping the unlimited movement.
	 */
	function exitPointerLock(): void;

	/** 🖲️
	 * Returns true if the user is pressing the specified key, false otherwise. Accepts case-insensitive key names.
	 * @param {string} key - key to check
	 * @returns {boolean} true if the key is pressed, false otherwise
	 */
	function keyIsDown(key: string): boolean;

	// 🧮 math

	/** 🧮
	 * Calculates the distance between two points.
	 * @param {number} x1 - x-coordinate of the first point
	 * @param {number} y1 - y-coordinate of the first point
	 * @param {number} x2 - x-coordinate of the second point
	 * @param {number} y2 - y-coordinate of the second point
	 * @returns {number} distance between the points
	 */
	function dist(x1: number, y1: number, x2: number, y2: number): number;

	/** 🧮
	 * Maps a number from one range to another.
	 * @param {number} value - incoming value to be converted
	 * @param {number} start1 - lower bound of the value's current range
	 * @param {number} stop1 - upper bound of the value's current range
	 * @param {number} start2 - lower bound of the value's target range
	 * @param {number} stop2 - upper bound of the value's target range
	 * @returns {number} mapped value
	 */
	function map(value: number, start1: number, stop1: number, start2: number, stop2: number): number;

	/** 🧮
	 * Sets the mode for interpreting and drawing angles. Can be either 'degrees' or 'radians'.
	 * @param {'degrees' | 'radians'} mode - mode to set for angle interpretation
	 */
	function angleMode(mode: 'degrees' | 'radians'): void;

	/** 🧮
	 * Converts degrees to radians.
	 * @param {number} degrees - angle in degrees
	 * @returns {number} angle in radians
	 */
	function radians(degrees: number): number;

	/** 🧮
	 * Converts radians to degrees.
	 * @param {number} radians - angle in radians
	 * @returns {number} angle in degrees
	 */
	function degrees(radians: number): number;

	/** 🧮
	 * Calculates a number between two numbers at a specific increment.
	 * @param {number} start - first number
	 * @param {number} stop - second number
	 * @param {number} amt - amount to interpolate between the two values
	 * @returns {number} interpolated number
	 */
	function lerp(start: number, stop: number, amt: number): number;

	/** 🧮
	 * Constrains a value between a minimum and maximum value.
	 * @param {number} n - number to constrain
	 * @param {number} low - lower bound
	 * @param {number} high - upper bound
	 * @returns {number} constrained value
	 */
	function constrain(n: number, low: number, high: number): number;

	/** 🧮
	 * Normalizes a number from another range into a value between 0 and 1.
	 * @param {number} n - number to normalize
	 * @param {number} start - lower bound of the range
	 * @param {number} stop - upper bound of the range
	 * @returns {number} normalized number
	 */
	function norm(n: number, start: number, stop: number): number;

	/** 🧮
	 * Calculates the square of a number.
	 * @param {number} n - number to square
	 * @returns {number} square of the number
	 */
	function sq(n: number): number;

	/** 🧮
	 * Calculates the fractional part of a number.
	 * @param {number} n - number whose fractional part is to be calculated
	 * @returns {number} fractional part of the number
	 */
	function fract(n: number): number;

	/** 🧮
	 * Sets the seed for the random number generator.
	 * @param {number} seed - seed value
	 */
	function randomSeed(seed: number): void;

	/** 🧮
	 * Generates random numbers. If no arguments are provided, returns a random number between 0 and 1.
	 * If one number argument is provided, returns a random number between 0 and the provided value.
	 * If two number arguments are provided, returns a random number between the two values.
	 * If an array is provided, returns a random element from the array.
	 * @param {number | any[]} [a] - lower bound (inclusive) or an array
	 * @param {number} [b] - upper bound (exclusive)
	 * @returns {number | any} a random number or element
	 */
	function random(a?: number | any[], b?: number): number | any;

	/** 🧮
	 * Sets the random number generation method.
	 * @param {any} method - method to use for random number generation
	 */
	function randomGenerator(method: any): void;

	/** 🧮
	 * Generates a random number following a Gaussian (normal) distribution.
	 * @param {number} mean - mean (center) of the distribution
	 * @param {number} std - standard deviation (spread or "width") of the distribution
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
	 * @param {'perlin' | 'simplex' | 'blocky'} mode - noise generation mode
	 */
	function noiseMode(mode: 'perlin' | 'simplex' | 'blocky'): void;

	/** 🧮
	 * Sets the seed value for noise generation.
	 * @param {number} seed - seed value
	 */
	function noiseSeed(seed: number): void;

	/** 🧮
	 * Generates a noise value based on the x, y, and z inputs.
	 * @param {number} [x] - x-coordinate input
	 * @param {number} [y] - y-coordinate input
	 * @param {number} [z] - z-coordinate input
	 * @returns {number} a noise value
	 */
	function noise(x?: number, y?: number, z?: number): number;

	/** 🧮
	 * Sets the level of detail for noise generation.
	 * @param {number} lod - level of detail (number of octaves)
	 * @param {number} falloff - falloff rate for each octave
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

	// 🔊 sound

	/** 🔊
	 * Represents a sound object, extending the native `Audio` to
	 * add panning and for deprecated p5.sound v1 compatibility.
	 */
	class Sound extends Audio {
		/** 🔊
		 * Creates a new `Sound` object.
		 * @param {string} path - path to the sound file
		 */
		constructor(path: string);

		/** 🔊
		 * Sets the volume of the sound.
		 * @param {number} level - volume level, between 0.0 and 1.0
		 * @deprecated Set the `.volume` property instead.
		 */
		setVolume(level: number): void;

		/** 🔊
		 * Sets whether the sound should loop.
		 * @param {boolean} loop - a boolean indicating whether to loop the sound
		 * @deprecated Set the `.loop` property instead.
		 */
		setLoop(loop: boolean): void;

		/** 🔊
		 * Sets the stereo panning of the sound.
		 * @param {number} value - panning value, between -1 (full left) and 1 (full right)
		 * @deprecated Set the `.pan` property instead.
		 */
		setPan(value: number): void;
	}

	/** 🔊
	 * Loads a sound file and returns an enhanced Audio object with additional methods.
	 * @param {string} path - path to the sound file
	 * @param {(a: Sound) => void} [cb] - an optional callback function that is called when the sound is ready to play
	 * @returns {Sound} an enhanced Audio object with additional methods for volume, looping, and panning
	 */
	function loadSound(path: string, cb?: (a: Sound) => void): Sound;

	/** 🔊
	 * Returns the AudioContext used by the library. Creates a new one if it doesn't exist.
	 * @returns {AudioContext} AudioContext instance
	 */
	function getAudioContext(): AudioContext;

	/** 🔊
	 * Resumes the AudioContext if it has been suspended.
	 * @returns {Promise<void>} a promise that resolves when the AudioContext is resumed
	 */
	function userStartAudio(): Promise<void>;

	// 🛠️ utilities

	/** 🛠️
	 * Loads a text file from the specified path. Result is one string.
	 * @param {string} path - path to the text file
	 * @param {(result: string) => void} cb - a callback function that is run when the file is loaded
	 */
	function loadText(path: string, cb: (result: string) => void): void;

	/** 🛠️
	 * Loads a JSON file from the specified path. Result depends on the
	 * JSON file's contents, but is typically an object or array.
	 * @param {string} path - path to the JSON file
	 * @param {(result: any) => void} cb - a callback function that is run when the file is loaded
	 */
	function loadJSON(path: string, cb: (result: any) => void): void;

	/** 🛠️
	 * Loads a CSV file from the specified path. Result is an array of objects.
	 * @param {string} path - path to the CSV file
	 * @param {(result: object[]) => void} cb - a callback function that is run when the file is loaded
	 */
	function loadCSV(path: string, cb: (result: object[]) => void): void;

	/** 🛠️
	 * Stores an item in localStorage.
	 * @param {string} key - key under which to store the item
	 * @param {string} value - value to store
	 */
	function storeItem(key: string, value: string): void;

	/** 🛠️
	 * Retrieves an item from localStorage.
	 * @param {string} key - key of the item to retrieve
	 * @returns {string} value of the retrieved item
	 */
	function getItem(key: string): string;

	/** 🛠️
	 * Removes an item from localStorage.
	 * @param {string} key - key of the item to remove
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
		 * @param {number} x - x component of the vector
		 * @param {number} y - y component of the vector
		 * @param {number} [z] - optional. The z component of the vector
		 */
		constructor(x: number, y: number, z?: number);

		/** ↗️
		 * Adds a vector to this vector.
		 * @param {Vector} v - vector to add
		 * @returns {Vector} resulting vector after addition
		 */
		add(v: Vector): Vector;

		/** ↗️
		 * Subtracts a vector from this vector.
		 * @param {Vector} v - vector to subtract
		 * @returns {Vector} resulting vector after subtraction
		 */
		sub(v: Vector): Vector;

		/** ↗️
		 * Multiplies this vector by a scalar or element-wise by another vector.
		 * @param {number | Vector} n - scalar to multiply by, or a vector for element-wise multiplication
		 * @returns {Vector} resulting vector after multiplication
		 */
		mult(n: number | Vector): Vector;

		/** ↗️
		 * Divides this vector by a scalar or element-wise by another vector.
		 * @param {number | Vector} n - scalar to divide by, or a vector for element-wise division
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
		 * @param {number} len - new length of the vector
		 * @returns {Vector} this vector after setting magnitude
		 */
		setMag(len: number): Vector;

		/** ↗️
		 * Calculates the dot product of this vector and another vector.
		 * @param {Vector} v - other vector
		 * @returns {number} dot product
		 */
		dot(v: Vector): number;

		/** ↗️
		 * Calculates the cross product of this vector and another vector.
		 * @param {Vector} v - other vector
		 * @returns {Vector} a new vector that is the cross product of this vector and the given vector
		 */
		cross(v: Vector): Vector;

		/** ↗️
		 * Calculates the distance between this vector and another vector.
		 * @param {Vector} v - other vector
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
		 * @param {number} x - x component
		 * @param {number} y - y component
		 * @param {number} [z] - optional. The z component
		 * @returns {void}
		 */
		set(x: number, y: number, z?: number): void;

		/** ↗️
		 * Limits the magnitude of the vector to the value used for the max parameter.
		 * @param {number} max - maximum magnitude for the vector
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
		 * @param {number} angle - angle in radians to set the heading to
		 * @returns {Vector} this vector after setting the heading
		 */
		setHeading(angle: number): Vector;

		/** ↗️
		 * Rotates the vector by the given angle (only 2D vectors).
		 * @param {number} angle - angle of rotation in radians
		 * @returns {Vector} this vector after rotation
		 */
		rotate(angle: number): Vector;

		/** ↗️
		 * Linearly interpolates between this vector and another vector.
		 * @param {Vector} v - vector to interpolate towards
		 * @param {number} amt - amount of interpolation; a number between 0.0 (close to the current vector) and 1.0 (close to the target vector)
		 * @returns {Vector} this vector after interpolation
		 */
		lerp(v: Vector, amt: number): Vector;

		/** ↗️
		 * Linearly interpolates between this vector and another vector, including the magnitude.
		 * @param {Vector} v - vector to interpolate towards
		 * @param {number} amt - amount of interpolation; a number between 0.0 (close to the current vector) and 1.0 (close to the target vector)
		 * @returns {Vector} this vector after spherical interpolation
		 */
		slerp(v: Vector, amt: number): Vector;

		/** ↗️
		 * Static method to create a new 2D vector from an angle.
		 * @param {number} angle - angle in radians
		 * @param {number} [length] - length of the vector. The default is 1
		 * @returns {Vector} a new 2D vector pointing in the direction of the given angle
		 */
		static fromAngle(angle: number, length?: number): Vector;
	}
}

export {};
