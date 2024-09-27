/**
 * q5.d.ts
 * 
 * TypeScript definitions for q5.js for use with IDEs like VSCode
 * for autocompletion, hover over documentation, and type checking.
 */
declare global {
	class Q5 {
		// ⭐️ core

		/** ⭐️
		 * Creates an instance of Q5.
		 *
		 * Scopes:
		 * - "global": the default if scope is undefined, which enables top level global use Q5 functions and variables
		 * - "auto": if users don't create a new instance of Q5 themselves, an instance will be created automatically with this scope, which replicates p5's global mode
		 * - "namespace": enables users to assign a Q5 instance to a variable
		 *
		 * The first param can also be a function, called when the instance is created, replicating p5's instance mode. Use of the "namespace" scope is recommended.
		 * @param scope
		 * @param parent - element that the canvas will be placed inside
		 */
		constructor(scope?: string | Function, parent?: HTMLElement);

		/** ⭐️
		 * Sets the default canvas context attributes for all Q5 instances and graphics.
		 */
		static canvasOptions: {
			alpha: boolean;
			colorSpace: 'display-p3' | 'srgb';
		};

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
	 * The canvas element created by Q5.
	 */
	var canvas: HTMLCanvasElement | null;

	/** ⭐️
	 * The 2D rendering context for the canvas.
	 */
	var ctx: CanvasRenderingContext2D | null;

	/** ⭐️
	 * Alias for `ctx`, the 2D rendering context for the canvas.
	 */
	var drawingContext: CanvasRenderingContext2D | null;

	/** ⭐️
	 * Array of pixels in the canvas.
	 */
	var pixels: number[];

	/** ⭐️
	 * The number of frames that have been displayed since the program started.
	 */
	var frameCount: number;

	/** ⭐️
	 * The time passed since the last frame was drawn.
	 */
	var deltaTime: number;

	/** ⭐️
	 * The width of the window.
	 */
	var windowWidth: number;

	/** ⭐️
	 * The height of the window.
	 */
	var windowHeight: number;

	/** ⭐️
	 * The current orientation of the device.
	 */
	var deviceOrientation: string | null;

	/** ⭐️
	 * Use preload to load assets before the sketch starts and the
	 * setup function is run.
	 */
	function preload(): void;

	/** ⭐️
	 * The setup function is called once when the program starts.
	 */
	function setup(): void;

	/** ⭐️
	 * The draw function is run 60 times per second by default.
	 */
	function draw(): void;

	/** ⭐️
	 * Stops the draw loop.
	 */
	function noLoop(): void;

	/** ⭐️
	 * Starts the draw loop, which calls the `draw` function at the target frame rate.
	 */
	function loop(): void;

	/** ⭐️
	 * Redraws the canvas n times.
	 * @param n - number of times to redraw the canvas
	 */
	function redraw(n?: number): void;

	/** ⭐️
	 * Sets the target frame rate or gets the sketch's current frame rate.
	 * @param hz - desired frame rate
	 * @returns current frame rate
	 */
	function frameRate(hz?: number): number;

	/** ⭐️
	 * The desired frame rate of the sketch.
	 * @returns target frame rate.
	 */
	function getTargetFrameRate(): number;

	/** ⭐️
	 * @returns frames per second.
	 */
	function getFPS(): number;

	/** ⭐️
	 * Logs a message to the JavaScript console. Alias for the standard `console.log` function.
	 * @param message
	 */
	function log(message: any): void;

	/** ⭐️
	 * Prints a message to the JavaScript console.
	 * @param message The message to print.
	 */
	function print(message: any): void;

	/** ⭐️
	 * The constant for TWO_PI (2*PI).
	 */
	const TWO_PI: number;

	/** ⭐️
	 * The constant for TAU (2*PI).
	 */
	const TAU: number;

	// ⬜️ canvas

	/** ⬜️
	 * The canvas element associated with the Q5 instance.
	 */
	var canvas: HTMLCanvasElement;

	/** ⬜️
	 * The width of the canvas.
	 */
	var width: number;

	/** ⬜️
	 * The height of the canvas.
	 */
	var height: number;

	/** ⬜️
	 * Creates a canvas element.
	 * @param w - width of the canvas
	 * @param h - height of the canvas
	 * @param options - options for the canvas.
	 */
	function createCanvas(w: number, h: number, options?: CanvasRenderingContext2DSettings): HTMLCanvasElement;

	/** ⬜️
	 * Any position coordinates or dimensions you use will be scaled based on the unit
	 * provided to this function.
	 * @param unit
	 * @example
	 * new Q5();
	 * createCanvas(1000, 1000);
	 *
	 * flexibleCanvas(400);
	 * // rect will appear in the middle of the canvas
	 * rect(100, 100, 200, 200);
	 */
	function flexibleCanvas(unit: number): void;

	/** ⬜️
	 * Resizes the canvas to the specified width and height.
	 * @param w - width of the canvas
	 * @param h - height of the canvas
	 */
	function resizeCanvas(w: number, h: number): void;

	/** ⬜️
	 * Sets the pixel density of the canvas.
	 * @param v - pixel density value
	 */
	function pixelDensity(v: number): number;

	/** ⬜️
	 * Returns the current display density.
	 */
	function displayDensity(): number;

	/** ⬜️
	 * Enables or disables fullscreen mode.
	 * @param v - boolean indicating whether to enable or disable fullscreen mode
	 * @returns true if fullscreen mode is enabled, false otherwise
	 */
	function fullscreen(v?: boolean): void | boolean;

	/** ⬜️
	 * Creates a graphics buffer.
	 * @param w - width
	 * @param h - height
	 * @param opt - options
	 */
	function createGraphics(w: number, h: number, opt?: CanvasRenderingContext2DSettings): Q5;

	/** ⬜️
	 * Sets the fill color for shapes.
	 * @param color
	 */
	function fill(color: string | number): void;

	/** ⬜️
	 * Sets the stroke (outline) color for shapes.
	 * @param color
	 */
	function stroke(color: string | number): void;

	/** ⬜️
	 * After calling this function, shapes will not be filled.
	 */
	function noFill(): void;

	/** ⬜️
	 * After calling this function, shapes will not have a stroke (outline).
	 */
	function noStroke(): void;

	/** ⬜️
	 * Sets the size of the stroke used for lines and the border around shapes.
	 * @param weight - size of the stroke in pixels
	 */
	function strokeWeight(weight: number): void;

	/** ⬜️
	 * Sets the global opacity, `ctx.globalAlpha`, which
	 * affects all subsequent drawing operations.
	 * 0 is completely transparent, 255 is completely opaque.
	 * @param alpha - opacity level
	 */
	function opacity(alpha: number): void;

	/** ⬜️
	 * Translates the origin of the drawing context.
	 * @param x
	 * @param y
	 */
	function translate(x: number, y: number): void;

	/** ⬜️
	 * Rotates the drawing context.
	 * @param angle
	 */
	function rotate(angle: number): void;

	/** ⬜️
	 * Scales the drawing context.
	 * @param x - scaling factor along the x-axis
	 * @param y - scaling factor along the y-axis
	 */
	function scale(x: number, y?: number): void;

	/** ⬜️
	 * Shears the drawing context along the x-axis.
	 * @param angle
	 */
	function shearX(angle: number): void;

	/** ⬜️
	 * Shears the drawing context along the y-axis.
	 * @param angle
	 */
	function shearY(angle: number): void;

	/** ⬜️
	 * Applies a transformation matrix.
	 *
	 * Accepts a 3x3 or 4x4 matrix as either an array or multiple arguments.
	 * @param a - Horizontal scaling
	 * @param b - Horizontal skewing
	 * @param c - Vertical skewing
	 * @param d - Vertical scaling
	 * @param e - Horizontal moving
	 * @param f - Vertical moving
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
	 * The 2D drawing context for the canvas.
	 */
	var ctx: CanvasRenderingContext2D;

	// 💻 display

	/** 💻
	 * The `displayMode` function lets you customize how your canvas is presented.
	 *
	 * Display modes:
	 * - "normal": no styling to canvas or its parent element
	 * - "centered": canvas will be centered horizontally and vertically within its parent and if it's display size is bigger than its parent it will not clip
	 * - "maxed": canvas will fill the parent element, same as fullscreen for a global mode canvas inside a `main` element
	 * - "fullscreen": canvas will fill the screen with letterboxing if necessary to persevere its aspect ratio, like css object-fit contain
	 *
	 * Render qualities:
	 * - "default": pixelDensity set to displayDensity
	 * - "pixelated": pixelDensity set to 1 and various css styles are applied to the canvas to make it render without image smoothing
	 *
	 * Display scale can be set to make small canvases appear larger.
	 * @param displayMode
	 * @param renderQuality
	 * @param displayScale - can be given as a string (ex. "x2") or a number
	 */
	function displayMode(displayMode: string, renderQuality: string, displayScale: string | number): void;

	// 🧑‍🎨 drawing

	/** 🧑‍🎨
	 * Draws over the entire canvas with a color or image.
	 * @param color
	 */
	function background(color: string | number): void;

	/** 🧑‍🎨
	 * Draws a rectangle.
	 * @param x
	 * @param y
	 * @param w - width
	 * @param h - height
	 * @param tl - top-left radius for rounded corners
	 * @param tr - top-right radius for rounded corners
	 * @param br - bottom-right radius for rounded corners
	 * @param bl - bottom-left radius for rounded corners
	 */
	function rect(x: number, y: number, w: number, h?: number, tl?: number, tr?: number, br?: number, bl?: number): void;

	/** 🧑‍🎨
	 * Draws a square.
	 * @param x
	 * @param y
	 * @param size - size of the sides of the square
	 * @param tl - top-left radius for rounded corners
	 * @param tr - top-right radius for rounded corners
	 * @param br - bottom-right radius for rounded corners
	 * @param bl - bottom-left radius for rounded corners
	 */
	function square(x: number, y: number, size: number, tl?: number, tr?: number, br?: number, bl?: number): void;

	/** 🧑‍🎨
	 * Draws a circle.
	 * @param x
	 * @param y
	 * @param diameter
	 */
	function circle(x: number, y: number, diameter: number): void;

	/** 🧑‍🎨
	 * Draws an ellipse.
	 * @param x
	 * @param y
	 * @param width
	 * @param height
	 */
	function ellipse(x: number, y: number, width: number, height?: number): void;

	/** 🧑‍🎨
	 * Draws an arc.
	 * @param x
	 * @param y
	 * @param w - width
	 * @param h - height
	 * @param start - angle to start the arc
	 * @param stop - angle to stop the arc
	 * @param mode - drawing mode, can be `PIE`, `CHORD`, or `OPEN`
	 * @param detail - resolution of the arc
	 */
	function arc(
		x: number,
		y: number,
		w: number,
		h: number,
		start: number,
		stop: number,
		mode?: number,
		detail?: number
	): void;

	/** 🧑‍🎨
	 * Draws a line on the canvas.
	 * @param x1 - x-coordinate of the first point
	 * @param y1 - y-coordinate of the first point
	 * @param x2 - x-coordinate of the second point
	 * @param y2 - y-coordinate of the second point
	 */
	function line(x1: number, y1: number, x2: number, y2: number): void;

	/** 🧑‍🎨
	 * Draws a point on the canvas.
	 * @param x
	 * @param y
	 */
	function point(x: number, y: number): void;

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
	 * @param x
	 * @param y
	 */
	function vertex(x: number, y: number): void;

	/** 🧑‍🎨
	 * Specifies a Bezier vertex in a shape.
	 * @param cp1x - x-coordinate of the first control point
	 * @param cp1y - y-coordinate of the first control point
	 * @param cp2x - x-coordinate of the second control point
	 * @param cp2y - y-coordinate of the second control point
	 * @param x - x-coordinate of the anchor point
	 * @param y - y-coordinate of the anchor point
	 */
	function bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

	/** 🧑‍🎨
	 * Specifies a quadratic Bezier vertex in a shape.
	 * @param cp1x - x-coordinate of the control point
	 * @param cp1y - y-coordinate of the control point
	 * @param x - x-coordinate of the anchor point
	 * @param y - y-coordinate of the anchor point
	 */
	function quadraticVertex(cp1x: number, cp1y: number, x: number, y: number): void;

	/** 🧑‍🎨
	 * Draws a Bezier curve.
	 * @param x1 - x-coordinate of the first anchor point
	 * @param y1 - y-coordinate of the first anchor point
	 * @param x2 - x-coordinate of the first control point
	 * @param y2 - y-coordinate of the first control point
	 * @param x3 - x-coordinate of the second control point
	 * @param y3 - y-coordinate of the second control point
	 * @param x4 - x-coordinate of the second anchor point
	 * @param y4 - y-coordinate of the second anchor point
	 */
	function bezier(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	/** 🧑‍🎨
	 * Draws a triangle.
	 * @param x1 - x-coordinate of the first vertex
	 * @param y1 - y-coordinate of the first vertex
	 * @param x2 - x-coordinate of the second vertex
	 * @param y2 - y-coordinate of the second vertex
	 * @param x3 - x-coordinate of the third vertex
	 * @param y3 - y-coordinate of the third vertex
	 */
	function triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

	/** 🧑‍🎨
	 * Draws a quadrilateral.
	 * @param x1 - x-coordinate of the first vertex
	 * @param y1 - y-coordinate of the first vertex
	 * @param x2 - x-coordinate of the second vertex
	 * @param y2 - y-coordinate of the second vertex
	 * @param x3 - x-coordinate of the third vertex
	 * @param y3 - y-coordinate of the third vertex
	 * @param x4 - x-coordinate of the fourth vertex
	 * @param y4 - y-coordinate of the fourth vertex
	 */
	function quad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4): void;

	/** 🧑‍🎨
	 * Sets the canvas to erase mode, where shapes will erase what's underneath them instead of drawing over it.
	 * @param fillAlpha - opacity level of the fill color from 0 to 255, where 0 is completely transparent and 255 is completely opaque
	 * @param strokeAlpha - opacity level of the stroke color from 0 to 255, where 0 is completely transparent and 255 is completely opaque
	 */
	function erase(fillAlpha?: number, strokeAlpha?: number): void;

	/** 🧑‍🎨
	 * Resets the canvas from erase mode to normal drawing mode.
	 */
	function noErase(): void;

	/** 🧑‍🎨
	 * Checks if a given point is within the current path's fill area.
	 * @returns {boolean} True if the point is within the fill area, false otherwise
	 */
	function inFill(x: number, y: number): boolean;

	/** 🧑‍🎨
	 * Checks if a given point is within the current path's stroke.
	 * @returns {boolean} True if the point is within the stroke, false otherwise
	 */
	function inStroke(x: number, y: number): boolean;

	// 🌆 image

	/** 🌆
	 * Applies a filter to the image
	 * @param typ - the type of filter
	 * @param x - optional parameter, depending on filter type
	 */
	function filter(typ: string, x?: number): void;

	/** 🌆
	 * Resizes the image
	 * @param w - new width
	 * @param h - new height
	 */
	function resize(w: number, h: number): void;

	/** 🌆
	 * Trims the image, cropping out transparent pixels from the edges.
	 */
	function trim(): void;

	/** 🌆
	 * Masks the image with another image
	 * @param img - the image to use as a mask
	 */
	function mask(img: Image): void;

	/** 🌆
	 * Saves the image
	 * @param a - filename or path
	 * @param b - file extension
	 * @param c - quality of the saved image
	 */
	function save(a: string, b: string, c?: number): void;

	/** 🌆
	 * Retrieves pixel data from an image.
	 * @param x
	 * @param y
	 * @param w - width of the area
	 * @param h - height of the area
	 */
	function get(x: number, y: number, w?: number, h?: number): any;

	/** 🌆
	 * Sets pixel data in the image.
	 * @param x
	 * @param y
	 * @param c - color or pixel data
	 */
	function set(x: number, y: number, c: any): void;

	/** 🌆
	 * Loads pixel data into the image's pixel array.
	 */
	function loadPixels(): void;

	/** 🌆
	 * Updates the image's pixels array to the canvas.
	 */
	function updatePixels(): void;

	/** 🌆
	 * Enables smooth image rendering
	 */
	function smooth(): void;

	/** 🌆
	 * Disables smooth image rendering for a pixelated look.
	 */
	function noSmooth(): void;

	/** 🌆
	 * Applies a tint (color overlay) to the drawing.
	 * Tinting affects all subsequent images drawn.
	 * @param c - tint color
	 */
	function tint(c: string | number): void;

	/** 🌆
	 * Images drawn after this function is run will not be tinted.
	 */
	function noTint(): void;

	/** 🌆
	 * Creates a new image.
	 * @param w - width
	 * @param h - height
	 * @param opt - optional settings for the image
	 */
	function createImage(w: number, h: number, opt?: any): Image;

	/** 🌆
	 * Sets the image mode, which determines the position and alignment of images drawn on the canvas.
	 * - 'CORNER': by default images will be drawn from the top-left corner (set dx, dy)
	 * - 'CORNERS': images will be drawn from top-left corner (set dx, dy) and bottom-right corner (set dWidth, dHeight) to draw the image, enabling easy scaling
	 * - 'CENTER': draws the image centered at (dx, dy)
	 * @param mode
	 */
	var imageMode: (mode: 'corner' | 'corners' | 'center') => void;

	/** 🌆
	 * Draws an image to the canvas
	 * @param img - image to draw
	 * @param dx - x-coordinate of the destination corner
	 * @param dy - y-coordinate of the destination corner
	 * @param dWidth - width of the destination image
	 * @param dHeight - height of the destination image
	 * @param sx - x-coordinate of the source corner; defaults to 0
	 * @param sy - y-coordinate of the source corner; defaults to 0
	 * @param sWidth - width of the source image
	 * @param sHeight - height of the source image
	 */
	function image(
		img: any,
		dx: number,
		dy: number,
		dWidth: number,
		dHeight: number,
		sx?: number,
		sy?: number,
		sWidth?: number,
		sHeight?: number
	): void;

	/** 🌆
	 * Loads an image from a URL and optionally runs a callback function
	 * @param url - URL of the image to load
	 * @param cb - callback function to run after the image is loaded
	 * @param opt - optional parameters for loading the image
	 */
	function loadImage(url: string, cb?: (img: any) => void, opt?: any): void;

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

	// ✍️ text

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

	/** ✍️
	 * Loads a font from a URL and optionally runs a callback function with the font name once it's loaded
	 *
	 * WebGPU: Fonts must be in MSDF format with the file ending
	 * "-msdf.json". If no font is loaded before `text` is run, then 
	 * the default font is loaded:
	 * https://q5js.org/fonts/YaHei-msdf.json
	 * @param url - URL of the font to load
	 * @param cb - Optional callback function that receives the font name as an argument once the font is loaded
	 * @returns name of the loaded font
	 */
	function loadFont(url: string, cb?: (fontName: string) => void): string;

	/** ✍️
	 * Sets the current font to be used for rendering text
	 * @param fontName - name of the font
	 */
	function textFont(fontName: string): void;

	/** ✍️
	 * Sets or gets the current font size. If no argument is provided, returns the current font size
	 * @param size - size of the font in pixels
	 * @returns current font size when no argument is provided
	 */
	function textSize(size?: number): number | void;

	/** ✍️
	 * Sets or gets the current line height. If no argument is provided, returns the current line height
	 * @param leading - line height in pixels
	 * @returns current line height when no argument is provided
	 */
	function textLeading(leading?: number): number | void;

	/** ✍️
	 * Sets the current text style
	 * @param style - font style ('normal', 'italic', 'bold', 'bolditalic')
	 */
	function textStyle(style: 'normal' | 'italic' | 'bold' | 'bolditalic'): void;

	/** ✍️
	 * Sets the horizontal and vertical alignment of text
	 * @param horiz - horizontal alignment ('left', 'center', 'right')
	 * @param vert - vertical alignment ('top', 'middle', 'bottom', 'alphabetic')
	 */
	function textAlign(horiz: 'left' | 'center' | 'right', vert?: 'top' | 'center' | 'bottom' | 'alphabetic'): void;

	/** ✍️
	 * Calculates and returns the width of a given string of text
	 * @param str - string to measure
	 * @returns width of the text in pixels
	 */
	function textWidth(str: string): number;

	/** ✍️
	 * Calculates and returns the ascent (the distance from the baseline to the top of the highest character) of the current font
	 * @param str - string to measure
	 * @returns ascent of the text in pixels
	 */
	function textAscent(str: string): number;

	/** ✍️
	 * Calculates and returns the descent (the distance from the baseline to the bottom of the lowest character) of the current font
	 * @param str - string to measure
	 * @returns descent of the text in pixels
	 */
	function textDescent(str: string): number;

	/** ✍️
	 * Creates an image from a string of text. Width and height
	 * will not be the width and height of the text image, but of
	 * the bounding box that the text will be constrained within.
	 * @param str - string of text
	 * @param w - width of the bounding box
	 * @param h - height of the bounding box
	 * @returns An image object representing the rendered text.
	 */
	function createTextImage(str: string, w: number, h: number): Q5;

	/** ✍️
	 * Renders text to the screen. Text can be positioned with the x and y
	 * parameters and can optionally be constrained within a bounding box.
	 * @param str - string of text to display
	 * @param x - x-coordinate of the text's position
	 * @param y - y-coordinate of the text's position
	 * @param w - width of the bounding box
	 * @param h - height of the bounding box
	 */
	function text(str: string, x: number, y: number, w?: number, h?: number): void;

	/** ✍️
	 * Renders an image generated from text onto the canvas. The
	 * positioning of the image can be affected by the current text
	 * alignment and baseline settings.
	 * @param img - image object to render, typically generated from text
	 * @param x - x-coordinate where the image should be placed
	 * @param y - y-coordinate where the image should be placed
	 */
	function textImage(img: HTMLImageElement, x: number, y: number): void;

	/** ✍️
	 * Number formatter, can be used to display number as a string with
	 * a specified number of digits before and after the decimal point,
	 * optionally adding padding with zeros.
	 * @param n - number to format
	 * @param l - minimum number of digits to appear before the decimal point, the number is padded with zeros if necessary.
	 * @param r - number of digits to appear after the decimal point
	 * @returns A string representation of the number, formatted according to the specified conditions.
	 */
	function nf(n: number, l: number, r: number): string;

	// ✨ ai

	/** ✨
	 * Run this function before a line of code that isn't working as expected.
	 * @example
	 * function draw() {
	 * 	askAI();
	 * 	text('Hello!');
	 * }
	 */
	function askAI(): void;

	// 🎨 color

	/** 🎨
	 * Sets the color mode for the sketch. Changes the type of color object created by color functions.
	 *
	 * In WebGPU, the default color mode is 'rgb' in float format.
	 * @param mode - color mode ('rgb', 'srgb', or 'oklch')
	 * @param format - color format (1 or 255) for floating point or legacy 8-bit integer representation
	 */
	function colorMode(mode: 'rgb' | 'srgb' | 'oklch', format: 1 | 255): void;

	/** 🎨
	 * A function to create a new `Color` object. It can parse different
	 * color representations depending on the current `colorMode`.
	 * @param c0 - first color component, or a string representing the color, or a `Color` object, or an array of components.
	 * @param c1 - second color component
	 * @param c2 - third color component
	 * @param c3 - fourth color component (alpha)
	 * @returns A new `Color` object.
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
	let mouseButton: string | null;

	/** 🖲️
	 * True if a key is currently pressed, false otherwise.
	 */
	let keyIsPressed: boolean;

	/** 🖲️
	 * True if the mouse is currently pressed, false otherwise.
	 */
	let mouseIsPressed: boolean;

	/** 🖲️
	 * The value of the last key pressed, or null if no key is pressed.
	 */
	let key: string | null;

	/** 🖲️
	 * The keyCode of the last key pressed, or null if no key is pressed.
	 */
	let keyCode: number | null;

	/** 🖲️
	 * Sets the cursor to a specified type or image path.
	 * If an image is provided, optional x and y coordinates can
	 * specify the active point of the cursor.
	 * https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
	 * @param name - name of the cursor or the path to an image
	 * @param x - x-coordinate of the cursor's hot spot
	 * @param y - y-coordinate of the cursor's hot spot
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
	 * Returns true if the key is the user is pressing the key, false otherwise. Accepts case-insensitive key names.
	 * @param key
	 */
	function keyIsDown(key: string): boolean;

	// 🧮 math

	/** 🧮
	 * Calculates the distance between two points.
	 * @param x1 - x-coordinate of the first point
	 * @param y1 - y-coordinate of the first point
	 * @param x2 - x-coordinate of the second point
	 * @param y2 - y-coordinate of the second point
	 * @returns - distance between the points
	 */
	function dist(x1: number, y1: number, x2: number, y2: number): number;

	/** 🧮
	 * Maps a number from one range to another.
	 * @param value - incoming value to be converted
	 * @param start1 - Lower bound of the value's current range
	 * @param stop1 - Upper bound of the value's current range
	 * @param start2 - Lower bound of the value's target range
	 * @param stop2 - Upper bound of the value's target range
	 * @returns mapped value
	 */
	function map(value: number, start1: number, stop1: number, start2: number, stop2: number): number;

	/** 🧮
	 * Sets the mode for interpreting and drawing angles. Can be either 'degrees' or 'radians'.
	 * @param mode - The mode to set for angle interpretation ('degrees' or 'radians').
	 */
	function angleMode(mode: 'degrees' | 'radians'): void;

	/** 🧮
	 * Converts degrees to radians.
	 * @param degrees - The angle in degrees.
	 * @returns The angle in radians.
	 */
	function radians(degrees: number): number;

	/** 🧮
	 * Converts radians to degrees.
	 * @param radians - The angle in radians.
	 * @returns The angle in degrees.
	 */
	function degrees(radians: number): number;

	/** 🧮
	 * Calculates a number between two numbers at a specific increment.
	 * @param start - The first number.
	 * @param stop - The second number.
	 * @param amt - The amount to interpolate between the two values.
	 * @returns The interpolated number.
	 */
	function lerp(start: number, stop: number, amt: number): number;

	/** 🧮
	 * Constrains a value between a minimum and maximum value.
	 * @param n - The number to constrain.
	 * @param low - The lower bound.
	 * @param high - The upper bound.
	 * @returns The constrained value.
	 */
	function constrain(n: number, low: number, high: number): number;

	/** 🧮
	 * Normalizes a number from another range into a value between 0 and 1.
	 * @param n - The number to normalize.
	 * @param start - Lower bound of the range.
	 * @param stop - Upper bound of the range.
	 * @returns The normalized number.
	 */
	function norm(n: number, start: number, stop: number): number;

	/** 🧮
	 * Calculates the square of a number.
	 * @param n - The number to square.
	 * @returns The square of the number.
	 */
	function sq(n: number): number;

	/** 🧮
	 * Calculates the fractional part of a number.
	 * @param n - The number whose fractional part is to be calculated.
	 * @returns The fractional part of the number.
	 */
	function fract(n: number): number;

	/** 🧮
	 * Sets the seed for the random number generator.
	 * @param seed - The seed value.
	 */
	function randomSeed(seed: number): void;

	/** 🧮
	 * Generates random numbers. If no arguments are provided, returns a random number between 0 and 1.
	 * If one number argument is provided, returns a random number between 0 and the provided value.
	 * If two number arguments are provided, returns a random number between the two values.
	 * If an array is provided, returns a random element from the array.
	 * @param a - lower bound (inclusive) or an array.
	 * @param b - upper bound (exclusive).
	 * @returns A random number or element.
	 */
	function random(a?: number | any[], b?: number): number | any;

	/** 🧮
	 * Sets the random number generation method.
	 * @param method - method to use for random number generation.
	 */
	function randomGenerator(method: any): void;

	/** 🧮
	 * Generates a random number following a Gaussian (normal) distribution.
	 * @param mean - mean (center) of the distribution.
	 * @param std - standard deviation (spread or "width") of the distribution.
	 * @returns A random number following a Gaussian distribution.
	 */
	function randomGaussian(mean: number, std: number): number;

	/** 🧮
	 * Generates a random number following an exponential distribution.
	 * @returns A random number following an exponential distribution.
	 */
	function randomExponential(): number;

	/** 🧮
	 * Sets the noise generation mode.
	 * @param mode - noise generation mode ('perlin', 'simplex', or 'blocky').
	 */
	function noiseMode(mode: 'perlin' | 'simplex' | 'blocky'): void;

	/** 🧮
	 * Sets the seed value for noise generation.
	 * @param seed
	 */
	function noiseSeed(seed: number): void;

	/** 🧮
	 * Generates a noise value based on the x, y, and z inputs.
	 * @param x
	 * @param y
	 * @param z
	 * @returns a noise value
	 */
	function noise(x?: number, y?: number, z?: number): number;

	/** 🧮
	 * Sets the level of detail for noise generation.
	 * @param lod - level of detail (number of octaves)
	 * @param falloff - falloff rate for each octave
	 */
	function noiseDetail(lod: number, falloff: number): void;

	// 🔊 sound

	/** 🔊
	 * Represents a sound object, extending the native `Audio` to
	 * add panning and for deprecated p5.sound v1 compatibility.
	 */
	class Sound extends Audio {
		/** 🔊
		 * Creates a new `Sound` object.
		 * @param path - path to the sound file
		 */
		constructor(path: string);

		/** 🔊
		 * Sets the volume of the sound.
		 * @param level - volume level, between 0.0 and 1.0
		 * @deprecated Set the `.volume` property instead.
		 */
		setVolume(level: number): void;

		/** 🔊
		 * Sets whether the sound should loop.
		 * @param loop - A boolean indicating whether to loop the sound.
		 * @deprecated Set the `.loop` property instead.
		 */
		setLoop(loop: boolean): void;

		/** 🔊
		 * Sets the stereo panning of the sound.
		 * @param value - The panning value, between -1 (full left) and 1 (full right).
		 * @deprecated Set the `.pan` property instead.
		 */
		setPan(value: number): void;
	}

	/** 🔊
	 * Loads a sound file and returns an enhanced Audio object with additional methods.
	 * @param path - The path to the sound file.
	 * @param cb - An optional callback function that is called when the sound is ready to play.
	 * @returns An enhanced Audio object with additional methods for volume, looping, and panning.
	 */
	function loadSound(path: string, cb?: (a: Sound) => void): Sound;

	/** 🔊
	 * Returns the AudioContext used by the library. Creates a new one if it doesn't exist.
	 * @returns The AudioContext instance.
	 */
	function getAudioContext(): AudioContext;

	/** 🔊
	 * Resumes the AudioContext if it has been suspended.
	 */
	function userStartAudio(): Promise<void>;

	// 🛠️ utilities

	/** 🛠️
	 * Loads a text file from the specified path and returns an array of strings.
	 * @param path - The path to the text file.
	 * @param cb - A callback function that is called when the file is loaded.
	 */
	function loadStrings(path: string, cb: (result: string[]) => void): void;

	/** 🛠️
	 * Loads a JSON file from the specified path.
	 * @param path - The path to the JSON file.
	 * @param cb - A callback function that is called when the file is loaded.
	 */
	function loadJSON(path: string, cb: (result: object) => void): void;

	/** 🛠️
	 * Stores an item in localStorage.
	 * @param key - The key under which to store the item.
	 * @param value - The value to store.
	 */
	function storeItem(key: string, value: string): void;

	/** 🛠️
	 * Retrieves an item from localStorage.
	 * @param key - The key of the item to retrieve.
	 * @returns The value of the retrieved item.
	 */
	function getItem(key: string): string | null;

	/** 🛠️
	 * Removes an item from localStorage.
	 * @param key - The key of the item to remove.
	 */
	function removeItem(key: string): void;

	/** 🛠️
	 * Clears all items from localStorage.
	 */
	function clearStorage(): void;

	/** 🛠️
	 * Returns the current year.
	 * @returns The current year.
	 */
	function year(): number;

	/** 🛠️
	 * Returns the current day of the week.
	 * @returns The current day of the week.
	 */
	function day(): number;

	/** 🛠️
	 * Returns the current hour.
	 * @returns The current hour.
	 */
	function hour(): number;

	/** 🛠️
	 * Returns the current minute.
	 * @returns The current minute.
	 */
	function minute(): number;

	/** 🛠️
	 * Returns the current second.
	 * @returns The current second.
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
		 * @param x - The x component of the vector.
		 * @param y - The y component of the vector.
		 * @param z - Optional. The z component of the vector.
		 */
		constructor(x: number, y: number, z?: number);

		/** ↗️
		 * Adds a vector to this vector.
		 * @param v - The vector to add.
		 */
		add(v: Vector): Vector;

		/** ↗️
		 * Subtracts a vector from this vector.
		 * @param v - The vector to subtract.
		 */
		sub(v: Vector): Vector;

		/** ↗️
		 * Multiplies this vector by a scalar or element-wise by another vector.
		 * @param n - The scalar to multiply by, or a vector for element-wise multiplication.
		 */
		mult(n: number | Vector): Vector;

		/** ↗️
		 * Divides this vector by a scalar or element-wise by another vector.
		 * @param n - The scalar to divide by, or a vector for element-wise division.
		 */
		div(n: number | Vector): Vector;

		/** ↗️
		 * Calculates the magnitude (length) of the vector.
		 * @returns The magnitude of the vector.
		 */
		mag(): number;

		/** ↗️
		 * Normalizes the vector to a length of 1 (making it a unit vector).
		 */
		normalize(): Vector;

		/** ↗️
		 * Sets the magnitude of the vector to the specified length.
		 * @param len - The new length of the vector.
		 */
		setMag(len: number): Vector;

		/** ↗️
		 * Calculates the dot product of this vector and another vector.
		 * @param v - The other vector.
		 * @returns The dot product.
		 */
		dot(v: Vector): number;

		/** ↗️
		 * Calculates the cross product of this vector and another vector.
		 * @param v - The other vector.
		 * @returns A new vector that is the cross product of this vector and the given vector.
		 */
		cross(v: Vector): Vector;

		/** ↗️
		 * Calculates the distance between this vector and another vector.
		 * @param v - The other vector.
		 * @returns The distance.
		 */
		dist(v: Vector): number;

		/** ↗️
		 * Copies this vector.
		 * @returns A new vector with the same components as this one.
		 */
		copy(): Vector;

		/** ↗️
		 * Sets the components of the vector.
		 * @param x - The x component.
		 * @param y - The y component.
		 * @param z - Optional. The z component.
		 */
		set(x: number, y: number, z?: number): void;

		/** ↗️
		 * Limits the magnitude of the vector to the value used for the max parameter.
		 * @param max - The maximum magnitude for the vector.
		 */
		limit(max: number): Vector;

		/** ↗️
		 * Calculates the angle of rotation for this vector (only 2D vectors).
		 * @returns The angle of rotation.
		 */
		heading(): number;

		/** ↗️
		 * Rotates the vector to a specific angle without changing its magnitude.
		 */
		setHeading(angle: number): Vector;

		/** ↗️
		 * Rotates the vector by the given angle (only 2D vectors).
		 * @param angle - The angle of rotation in radians.
		 */
		rotate(angle: number): Vector;

		/** ↗️
		 * Linearly interpolates between this vector and another vector.
		 * @param v - The vector to interpolate towards.
		 * @param amt - The amount of interpolation; a number between 0.0 (close to the current vector) and 1.0 (close to the target vector).
		 */
		lerp(v: Vector, amt: number): Vector;

		/** ↗️
		 * Linearly interpolates between this vector and another vector, including the magnitude.
		 * @param v - The vector to interpolate towards.
		 * @param amt - The amount of interpolation; a number between 0.0 (close to the current vector) and 1.0 (close to the target vector).
		 */
		slerp(v: Vector, amt: number): Vector;

		/** ↗️
		 * Static method to create a new 2D vector from an angle.
		 * @param angle - The angle in radians.
		 * @param length - Optional. The length of the vector. The default is 1.
		 * @returns A new 2D vector pointing in the direction of the given angle.
		 */
		static fromAngle(angle: number, length?: number): Vector;
	}
}

export {};
