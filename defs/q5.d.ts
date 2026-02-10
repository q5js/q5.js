declare global {

	// ⭐ core

	/**
	 * Welcome to q5's documentation! 🤩
	 * 
	 * First time coding? Check out the [q5 Beginner's Brief](https://github.com/q5js/q5.js/wiki/q5-Beginner's-Brief).
	 * 
	 * On these Learn pages, you can experiment with editing the
	 * interactive mini examples. Have fun! 😎
	 * 
	 * [![](/assets/Authored-By-Humans-Not-By-AI-Badge.png)](https://notbyai.fyi/)
	 */

	/** ⭐
	 * Creates a canvas element, a section of the screen your program
	 * can draw on.
	 * 
	 * Run this function to start using q5!
	 * 
	 * Note that in this example, the circle is located at position [0, 0], the origin of the canvas.
	 * @param {number} [w] width or side lengths of the canvas
	 * @param {number} [h] height of the canvas
	 * @param {object} [opt] [options](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getContextAttributes)
	 * @returns {Promise<HTMLCanvasElement>} created canvas element
	 * @example
	 * // WebGPU
	 * await Canvas(200, 100);
	 * background('silver');
	 * circle(0, 0, 80);
	 */
	function Canvas(w?: number, h?: number, options?: object): Promise<HTMLCanvasElement>;

	/** ⭐
	 * The q5 draw function is run 60 times per second by default.
	 * @example
	 * q5.draw = function () {
	 * 	background('silver');
	 * 	circle(mouseX, mouseY, 80);
	 * };
	 */
	function draw(): void;

	/** ⭐
	 * Logs a message to the JavaScript [console](https://developer.mozilla.org/docs/Web/API/console/log_static).
	 * 
	 * To view the console, open your browser's web developer tools
	 * via the keyboard shortcut `Ctrl + Shift + i` or `command + option + i`,
	 * then click the "Console" tab.
	 * 
	 * Use `log` when you're curious about what your code is doing!
	 * @param {*} message
	 * @example
	 * q5.draw = function () {
	 * 	circle(mouseX, mouseY, 80);
	 * 	log('The mouse is at:', mouseX, mouseY);
	 * };
	 */
	function log(message: any): void;

	// 🧑‍🎨 shapes

	/** 🧑‍🎨
	 * Draws a circle.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 * @param {number} diameter diameter of the circle
	 * @example
	 * await Canvas(200, 100);
	 * circle(0, 0, 80);
	 */
	function circle(x: number, y: number, diameter: number): void;

	/** 🧑‍🎨
	 * Draws an ellipse.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 * @param {number} width width of the ellipse
	 * @param {number} height height of the ellipse
	 * @example
	 * await Canvas(200, 100);
	 * ellipse(0, 0, 160, 80);
	 */
	function ellipse(x: number, y: number, width: number, height: number): void;

	/** 🧑‍🎨
	 * Draws a rectangle or a rounded rectangle.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 * @param {number} w width of the rectangle
	 * @param {number} h height of the rectangle
	 * @param {number} [rounded] radius for all corners
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * rect(-70, -80, 40, 60);
	 * rect(-20, -30, 40, 60, 10);
	 * rect(30, 20, 40, 60, 30);
	 */
	function rect(x: number, y: number, w: number, h: number, rounded?: number): void;

	/** 🧑‍🎨
	 * Draws a square or a rounded square.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 * @param {number} size size of the sides of the square
	 * @param {number} [rounded] radius for all corners
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * square(-70, -70, 40);
	 * square(-20, -20, 40, 10);
	 * square(30, 30, 40, 30);
	 */
	function square(x: number, y: number, size: number, rounded?: number): void;

	/** 🧑‍🎨
	 * Draws a point on the canvas.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 * @example
	 * await Canvas(200, 100);
	 * stroke('white');
	 * point(-25, 0);
	 * 
	 * strokeWeight(10);
	 * point(25, 0);
	 */
	function point(x: number, y: number): void;

	/** 🧑‍🎨
	 * Draws a line on the canvas.
	 * @param {number} x1 x-coordinate of the first point
	 * @param {number} y1 y-coordinate of the first point
	 * @param {number} x2 x-coordinate of the second point
	 * @param {number} y2 y-coordinate of the second point
	 * @example
	 * await Canvas(200, 100);
	 * stroke('lime');
	 * line(-80, -30, 80, 30);
	 */
	function line(x1: number, y1: number, x2: number, y2: number): void;

	/** 🧑‍🎨
	 * Draws a capsule.
	 * @param {number} x1 x-coordinate of the first point
	 * @param {number} y1 y-coordinate of the first point
	 * @param {number} x2 x-coordinate of the second point
	 * @param {number} y2 y-coordinate of the second point
	 * @param {number} r radius of the capsule semi-circle ends
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * strokeWeight(5);
	 * capsule(-60, -10, 60, 10, 10);
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	fill('cyan');
	 * 	strokeWeight(10);
	 * 	capsule(0, 0, mouseX, mouseY, 20);
	 * };
	 */
	function capsule(x1: number, y1: number, x2: number, y2: number, r: number): void;

	/** 🧑‍🎨
	 * Set to `CORNER` (default), `CENTER`, `RADIUS`, or `CORNERS`.
	 * 
	 * Changes how the first four inputs to
	 * `rect` and `square` are interpreted.
	 * @param {string} mode
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * rectMode(CORNER);
	 * 
	 * //  (  x,   y,   w,  h)
	 * rect(-50, -25, 100, 50);
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * rectMode(CENTER);
	 * 
	 * //  (cX, cY, w,  h)
	 * rect(0, 0, 100, 50);
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * rectMode(RADIUS);
	 * 
	 * // (cX, cY, rX, rY)
	 * rect(0, 0, 50, 25);
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * rectMode(CORNERS);
	 * 
	 * //  ( x1,  y1, x2, y2)
	 * rect(-50, -25, 50, 25);
	 */
	function rectMode(mode: string): void;

	/** 🧑‍🎨
	 * Set to `CENTER` (default), `RADIUS`, `CORNER`, or `CORNERS`.
	 * 
	 * Changes how the first four inputs to
	 * `ellipse`, `circle`, and `arc` are interpreted.
	 * @param {string} mode
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * ellipseMode(CENTER);
	 * 
	 * //     (x, y,   w,  h)
	 * ellipse(0, 0, 100, 50);
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * ellipseMode(RADIUS);
	 * 
	 * //     (x, y, rX, rY)
	 * ellipse(0, 0, 50, 25);
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * ellipseMode(CORNER);
	 * 
	 * //     ( lX,  tY,   w,  h)
	 * ellipse(-50, -25, 100, 50);
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * ellipseMode(CORNERS);
	 * 
	 * //     ( x1,  y1, x2, y2)
	 * ellipse(-50, -25, 50, 25);
	 */
	function ellipseMode(mode: string): void;

	/** 🧑‍🎨
	 * Shape alignment mode, for use in `rectMode` and `ellipseMode`.
	 */
	const CORNER: 'corner';

	/** 🧑‍🎨
	 * Shape alignment mode, for use in `rectMode` and `ellipseMode`.
	 */
	const RADIUS: 'radius';

	/** 🧑‍🎨
	 * Shape alignment mode, for use in `rectMode` and `ellipseMode`.
	 */
	const CORNERS: 'corners';

	// 🌆 image

	/** 🌆
	 * Loads an image from a URL.
	 * 
	 * By default, assets are loaded in parallel before q5 runs `draw`. Use `await` to wait for an image to load.
	 * @param {string} url url of the image to load
	 * @returns {Q5.Image & PromiseLike<Q5.Image>} image
	 * @example
	 * await Canvas(200);
	 * 
	 * let logo = loadImage('/q5js_logo.avif');
	 * 
	 * q5.draw = function () {
	 * 	background(logo);
	 * };
	 * @example
	 * await Canvas(200);
	 * 
	 * let logo = await loadImage('/q5js_logo.avif');
	 * background(logo);
	 */
	function loadImage(url: string): Q5.Image & PromiseLike<Q5.Image>;

	/** 🌆
	 * Draws an image or video frame to the canvas.
	 * @param {Q5.Image | HTMLVideoElement} img image or video to draw
	 * @param {number} dx x position to draw the image at
	 * @param {number} dy y position to draw the image at
	 * @param {number} [dw] width of the destination image
	 * @param {number} [dh] height of the destination image
	 * @param {number} [sx] x position in the source to start clipping a subsection from
	 * @param {number} [sy] y position in the source to start clipping a subsection from
	 * @param {number} [sw] width of the subsection of the source image
	 * @param {number} [sh] height of the subsection of the source image
	 * @example
	 * await Canvas(200);
	 * 
	 * let logo = load('/q5js_logo.avif');
	 * 
	 * q5.draw = function () {
	 * 	image(logo, -100, -100, 200, 200);
	 * };
	 * @example
	 * await Canvas(200);
	 * 
	 * let logo = load('/q5js_logo.avif');
	 * 
	 * q5.draw = function () {
	 * 	image(logo, -100, -100, 200, 200, 256, 256, 512, 512);
	 * };
	 */
	function image(): void;

	/** 🌆
	 * Set to `CORNER` (default), `CORNERS`, or `CENTER`.
	 * 
	 * Changes how inputs to `image` are interpreted.
	 * @param {string} mode
	 * @example
	 * await Canvas(200);
	 * let logo = load('/q5js_logo.avif');
	 * 
	 * q5.draw = function () {
	 * 	imageMode(CORNER);
	 * 
	 * 	//   ( img,   x,   y,   w,   h)
	 * 	image(logo, -50, -50, 100, 100);
	 * };
	 * @example
	 * await Canvas(200);
	 * let logo = load('/q5js_logo.avif');
	 * 
	 * q5.draw = function () {
	 * 	imageMode(CENTER);
	 * 
	 * 	//   (img, cX, cY,  w,   h)
	 * 	image(logo, 0, 0, 100, 100);
	 * };
	 * @example
	 * await Canvas(200);
	 * let logo = load('/q5js_logo.avif');
	 * 
	 * q5.draw = function () {
	 * 	imageMode(CORNERS);
	 * 
	 * 	//   ( img,  x1,  y1, x2, y2)
	 * 	image(logo, -50, -50, 50, 50);
	 * };
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
	 * await Canvas(200);
	 * 
	 * let logo = await load('/q5js_logo.avif');
	 * 
	 * logo.resize(128, 128);
	 * image(logo, -100, -100, 200, 200);
	 */
	function resize(w: number, h: number): void;

	/** 🌆
	 * Returns a trimmed image, cropping out transparent pixels from the edges.
	 * @returns {Q5.Image}
	 */
	function trim(): Q5.Image;

	/** 🌆
	 * Enables smooth rendering of images displayed larger than
	 * their actual size. This is the default setting, so running this
	 * function only has an effect if `noSmooth` has been called.
	 * @example
	 * await Canvas(200);
	 * smooth();
	 * 
	 * let icon = await load('/q5js_icon.png');
	 * image(icon, -100, -100, 200, 200);
	 */
	function smooth(): void;

	/** 🌆
	 * Disables smooth image rendering for a pixelated look.
	 *
	 * This setting is applied to images when they're loaded.
	 * @example
	 * await Canvas(200);
	 * noSmooth();
	 * 
	 * let icon = await load('/q5js_icon.png');
	 * image(icon, -100, -100, 200, 200);
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
	 * await Canvas(200);
	 * 
	 * let logo = await load('/q5js_logo.avif');
	 * 
	 * tint(1, 0, 0, 0.5);
	 * image(logo, -100, -100, 200, 200);
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
	 * await Canvas(200);
	 * 
	 * let logo = await load('/q5js_logo.avif');
	 * 
	 * logo.inset(256, 256, 512, 512, 0, 0, 256, 256);
	 * image(logo, -100, -100, 200, 200);
	 */
	function inset(sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;

	/** 🌆
	 * Retrieves a subsection of an image or canvas as a new Q5 Image
	 * or the color of a pixel in the image or canvas.
	 * 
	 * If only x and y are specified, this function returns the color of the pixel
	 * at the given coordinate in `[R, G, B, A]` array format. If `loadPixels`
	 * has never been run, it's run by this function.
	 * 
	 * If you make changes to the canvas or image, you must call `loadPixels`
	 * before using this function to get current color data.
	 * 
	 * Not applicable to WebGPU canvases.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} [w] width of the area, default is 1
	 * @param {number} [h] height of the area, default is 1
	 * @returns {Q5.Image | number[]}
	 * @example
	 * await Canvas(200);
	 * 
	 * let logo = await load('/q5js_logo.avif');
	 * 
	 * let cropped = logo.get(256, 256, 512, 512);
	 * image(cropped, -100, -100, 200, 200);
	 */
	function get(x: number, y: number, w?: number, h?: number): Q5.Image | number[];

	/** 🌆
	 * Sets a pixel's color in the image or canvas. Color mode must be RGB.
	 * 
	 * Or if a canvas or image is provided, it's drawn on top of the
	 * destination image or canvas, ignoring its tint setting.
	 * 
	 * Run `updatePixels` to apply the changes.
	 * 
	 * Not applicable to WebGPU canvases.
	 * @param {number} x
	 * @param {number} y
	 * @param {any} val color, canvas, or image
	 * @example
	 * await Canvas(200);
	 * noSmooth();
	 * let c = color('lime');
	 * let img = createImage(50, 50);
	 * 
	 * q5.draw = function () {
	 * 	img.set(random(50), random(50), c);
	 * 	img.updatePixels();
	 * 	background(img);
	 * };
	 */
	function set(x: number, y: number, val: any): void;

	/** 🌆
	 * Array of pixel color data from a canvas or image.
	 * 
	 * Empty by default, get the data by running `loadPixels`.
	 * 
	 * Each pixel is represented by four consecutive values in the array,
	 * corresponding to its red, green, blue, and alpha channels.
	 * 
	 * The top left pixel's data is at the beginning of the array
	 * and the bottom right pixel's data is at the end, going from
	 * left to right and top to bottom.
	 */
	var pixels: number[];

	/** 🌆
	 * Loads pixel data into `pixels` from the canvas or image.
	 * 
	 * The example below sets some pixels' green channel
	 * to a random value.
	 * 
	 * Not applicable to WebGPU canvases.
	 * @example
	 * await Canvas(200);
	 * frameRate(5);
	 * let icon = load('/q5js_icon.png');
	 * 
	 * q5.draw = function () {
	 * 	icon.loadPixels();
	 * 	for (let i = 0; i < icon.pixels.length; i += 16) {
	 * 		icon.pixels[i + 1] = random(1);
	 * 	}
	 * 	icon.updatePixels();
	 * 	background(icon);
	 * };
	 */
	function loadPixels(): void;

	/** 🌆
	 * Applies changes in the `pixels` array to the canvas or image.
	 * 
	 * Not applicable to WebGPU canvases.
	 * @example
	 * await Canvas(200);
	 * let c = color('pink');
	 * 
	 * let img = createImage(50, 50);
	 * for (let x = 0; x < 50; x += 3) {
	 * 	for (let y = 0; y < 50; y += 3) {
	 * 		img.set(x, y, c);
	 * 	}
	 * }
	 * img.updatePixels();
	 * 
	 * background(img);
	 */
	function updatePixels(): void;

	/** 🌆
	 * Applies a filter to the image.
	 * 
	 * See the documentation for q5's filter constants below for more info.
	 * 
	 * A CSS filter string can also be used.
	 * https://developer.mozilla.org/docs/Web/CSS/filter
	 * 
	 * Not applicable to WebGPU canvases.
	 * @param {string} type filter type or a CSS filter string
	 * @param {number} [value] optional value, depends on filter type
	 * @example
	 * await Canvas(200);
	 * let logo = await load('/q5js_logo.avif');
	 * logo.filter(INVERT);
	 * image(logo, -100, -100, 200, 200);
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

	/** 🌆
	 * Creates a graphics buffer.
	 * 
	 * Graphics looping is disabled by default in q5 WebGPU.
	 * See issue [#104](https://github.com/q5js/q5.js/issues/104) for details.
	 * @param {number} w width
	 * @param {number} h height
	 * @param {object} [opt] options
	 * @returns {Q5} a new Q5 graphics buffer
	 * @example
	 * await Canvas(200);
	 * 
	 * let g = createGraphics(100);
	 * g.noLoop();
	 * g.stroke('pink');
	 * g.fill('red');
	 * g.circle(50, 50, 120);
	 * 
	 * image(g, -50, -50, 100, 100);
	 */
	function createGraphics(w: number, h: number, opt?: any): Q5;

	// 📘 text

	/** 📘
	 * Renders text on the canvas.
	 * @param {string} str string of text to display
	 * @param {number} x x-coordinate of the text's position
	 * @param {number} y y-coordinate of the text's position
	 * @param {number} [wrapWidth] maximum line width in characters
	 * @param {number} [lineLimit] maximum number of lines
	 * @example
	 * await Canvas(200, 100);
	 * background('silver');
	 * 
	 * textSize(32);
	 * text('Hello, world!', -88, 10);
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * textSize(20);
	 * 
	 * let info =
	 * 	'q5.js was designed to make creative coding fun and accessible for artists, designers, educators, and beginners.';
	 * 
	 * text(info, -88, -70, 20);
	 * //
	 * //
	 */
	function text(str: string, x: number, y: number, wrapWidth?: number, lineLimit?: number): void;

	/** 📘
	 * Loads a font from a URL.
	 * 
	 * The first example below loads [Robotica](https://www.dafont.com/robotica-courtney.font).
	 * 
	 * The second example loads
	 * [Pacifico](https://fonts.google.com/specimen/Pacifico) from [Google fonts](https://fonts.google.com/).
	 * 
	 * By default, assets are loaded in parallel before q5 runs `draw`. Use `await` to wait for a font to load.
	 *
	 * Fonts in [MSDF format](https://github.com/q5js/q5.js/wiki/q5-WebGPU-renderer#text-rendering)
	 * with the file ending "-msdf.json" can be used for high performance text rendering. Make your own using the [MSDF font converter](https://msdf-bmfont.donmccurdy.com/).
	 * 
	 * If no fonts are loaded, q5 WebGPU will lazy load the default MSDF font from q5js.org. Until it is loaded, the system's default sans-serif font will be used via `textImage`.
	 * @param {string} url URL of the font to load
	 * @returns {FontFace & PromiseLike<FontFace>} font
	 * @example
	 * await Canvas(200, 56);
	 * 
	 * await loadFont('/assets/Robotica.ttf');
	 * 
	 * fill('skyblue');
	 * textSize(64);
	 * text('Hello!', -98, 24);
	 * @example
	 * await Canvas(200, 74);
	 * 
	 * loadFont('fonts.googleapis.com/css2?family=Pacifico');
	 * 
	 * q5.draw = function () {
	 * 	fill('hotpink');
	 * 	textSize(68);
	 * 	text('Hello!', -98, 31);
	 * };
	 * //
	 * @example
	 * await Canvas(200, 74);
	 * 
	 * await loadFont('sans-serif'); // msdf
	 * 
	 * fill('white');
	 * textSize(68);
	 * text('Hello!', -98, 31);
	 */
	function loadFont(url: string): FontFace & PromiseLike<FontFace>;

	/** 📘
	 * Sets the current font to be used for rendering text.
	 * 
	 * By default, the font is set to the [CSS font family](https://developer.mozilla.org/docs/Web/CSS/font-family)
	 * "sans-serif" or the last font loaded.
	 * @param {string} fontName name of the font family or a FontFace object
	 * @example
	 * await Canvas(200, 160);
	 * background(0.8);
	 * 
	 * textFont('serif');
	 * 
	 * text('Hello, world!', -96, 10);
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * textFont('monospace');
	 * 
	 * text('Hello, world!', -96, 10);
	 */
	function textFont(fontName: string): void;

	/** 📘
	 * Sets or gets the current font size. If no argument is provided, returns the current font size.
	 * @param {number} [size] size of the font in pixels
	 * @returns {number | void} current font size when no argument is provided
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 
	 * 	textSize(abs(mouseX));
	 * 	text('A', -90, 90);
	 * };
	 */
	function textSize(size?: number): number | void;

	/** 📘
	 * Sets or gets the current line height. If no argument is provided, returns the current line height.
	 * @param {number} [leading] line height in pixels
	 * @returns {number | void} current line height when no argument is provided
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 
	 * 	textSize(abs(mouseX));
	 * 	text('A', -90, 90);
	 * 	rect(-90, 90, 5, -textLeading());
	 * };
	 */
	function textLeading(leading?: number): number | void;

	/** 📘
	 * Sets the current text style.
	 *
	 * Not applicable to MSDF fonts.
	 * @param {'normal' | 'italic' | 'bold' | 'bolditalic'} style font style
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * textStyle(ITALIC);
	 * 
	 * textSize(32);
	 * text('Hello, world!', -88, 6);
	 */
	function textStyle(style: 'normal' | 'italic' | 'bold' | 'bolditalic'): void;

	/** 📘
	 * Sets the horizontal and vertical alignment of text.
	 * 
	 * Alignment constants like `CENTER` can be used with this function.
	 * @param {'left' | 'center' | 'right'} horiz horizontal alignment
	 * @param {'top' | 'middle' | 'bottom' | 'alphabetic'} [vert] vertical alignment
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * textSize(32);
	 * 
	 * textAlign(CENTER, CENTER);
	 * text('Hello, world!', 0, 0);
	 */
	function textAlign(horiz: 'left' | 'center' | 'right', vert?: 'top' | 'middle' | 'bottom' | 'alphabetic'): void;

	/** 📘
	 * Sets the text weight.
	 * 
	 * - 100: thin
	 * - 200: extra-light
	 * - 300: light
	 * - 400: normal/regular
	 * - 500: medium
	 * - 600: semi-bold
	 * - 700: bold
	 * - 800: bolder/extra-bold
	 * - 900: black/heavy
	 * @param {number | string} weight font weight
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * textSize(32);
	 * textAlign(CENTER, CENTER);
	 * 
	 * textWeight(100);
	 * text('Hello, world!', 0, 0);
	 */
	function textWeight(weight: number | string): void;

	/** 📘
	 * Calculates and returns the width of a given string of text.
	 * @param {string} str string to measure
	 * @returns {number} width of the text in pixels
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 
	 * 	textSize(abs(mouseX));
	 * 	rect(-90, 90, textWidth('A'), -textLeading());
	 * 	text('A', -90, 90);
	 * };
	 */
	function textWidth(str: string): number;

	/** 📘
	 * Calculates and returns the ascent (the distance from the baseline to the top of the highest character) of the current font.
	 * @param {string} str string to measure
	 * @returns {number} ascent of the text in pixels
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 
	 * 	textSize(abs(mouseX));
	 * 	rect(-90, 90, textWidth('A'), -textAscent());
	 * 	text('A', -90, 90);
	 * };
	 */
	function textAscent(str: string): number;

	/** 📘
	 * Calculates and returns the descent (the distance from the baseline to the bottom of the lowest character) of the current font.
	 * @param {string} str string to measure
	 * @returns {number} descent of the text in pixels
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * textSize(64);
	 * 
	 * rect(-100, 0, 200, textDescent('q5'));
	 * text('q5', -90, 0);
	 */
	function textDescent(str: string): number;

	/** 📘
	 * Creates an image from a string of text.
	 * @param {string} str string of text
	 * @param {number} [wrapWidth] maximum line width in characters
	 * @param {number} [lineLimit] maximum number of lines
	 * @returns {Q5.Image} an image object representing the rendered text
	 * @example
	 * await Canvas(200);
	 * textSize(96);
	 * 
	 * let img = createTextImage('🐶');
	 * img.filter(INVERT);
	 * 
	 * q5.draw = function () {
	 * 	image(img, -45, -90);
	 * };
	 */
	function createTextImage(str: string, wrapWidth: number, lineLimit: number): Q5.Image;

	/** 📘
	 * Renders an image generated from text onto the canvas.
	 * 
	 * If the first parameter is a string, an image of the text will be
	 * created and cached automatically.
	 * 
	 * The positioning of the image is affected by the current text
	 * alignment and baseline settings.
	 *
	 * This function can be used to draw emojis, which can
	 * not be drawn with MSDF text rendering.
	 * 
	 * Using this function to draw text that changes every frame has a
	 * very high performance cost.
	 * @param {Q5.Image | string} img image or text
	 * @param {number} x x-coordinate where the image should be placed
	 * @param {number} y y-coordinate where the image should be placed
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * textSize(96);
	 * textAlign(CENTER, CENTER);
	 * 
	 * textImage('🐶', 0, 0);
	 */
	function textImage(img: Q5.Image | String, x: number, y: number): void;

	/** 📘
	 * Converts a string of text to an array of points.
	 * 
	 * Samples opaque pixels in a text image made with `createTextImage`.
	 * 
	 * It's influenced by text settings, such as font, size, and alignment.
	 * 
	 * Uses a [Z-order curve](https://wikipedia.org/wiki/Z-order_curve) to improve spatial distribution, which preserves the shape of text better than purely random sampling.
	 * @param {string} str string of text
	 * @param {number} [x=0] x coordinate of the text position
	 * @param {number} [y=0] y coordinate of the text position
	 * @param {number} [sampleRate=0.1] lower values increase dithering (1 = all points, 0.1 = ~10% of points)
	 * @param {number} [density=1] pixel density of the text
	 * @example
	 * await Canvas(200);
	 * textSize(220);
	 * textAlign(CENTER, CENTER);
	 * 
	 * let points = textToPoints('5');
	 * 
	 * for (let pt of points) {
	 * 	rect(pt.x, pt.y, 5, 20);
	 * }
	 * @example
	 * await Canvas(200, 296);
	 * textSize(340);
	 * noFill();
	 * stroke(1);
	 * strokeWeight(8);
	 * 
	 * let pts = textToPoints('q', -100, 56);
	 * 
	 * strokeWeight(1);
	 * for (let pt of pts) {
	 * 	ellipse(pt.x, pt.y, 10, 0.1);
	 * }
	 */
	function textToPoints(str: string, x?: number, y?: number, sampleRate?: number, density?: number): [];

	/** 📘
	 * Number formatter, can be used to display a number as a string with
	 * a specified number of digits before and after the decimal point,
	 * optionally adding padding with zeros.
	 * @param {number} n number to format
	 * @param {number} l minimum number of digits to appear before the decimal point; the number is padded with zeros if necessary
	 * @param {number} r number of digits to appear after the decimal point
	 * @returns {string} a string representation of the number, formatted accordingly
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * 
	 * textSize(32);
	 * text(nf(PI, 4, 5), -90, 10);
	 */
	function nf(num: number, digits: number): string;

	/** 📘
	 * Normal font style.
	 */
	const NORMAL: 'normal';

	/** 📘
	 * Italic font style.
	 */
	const ITALIC: 'italic';

	/** 📘
	 * Bold font weight.
	 */
	const BOLD: 'bold';

	/** 📘
	 * Bold and italic font style.
	 */
	const BOLDITALIC: 'italic bold';

	/** 📘
	 * Align text to the left.
	 */
	const LEFT: 'left';

	/** 📘
	 * Align text to the center.
	 */
	const CENTER: 'center';

	/** 📘
	 * Align text to the right.
	 */
	const RIGHT: 'right';

	/** 📘
	 * Align text to the top.
	 */
	const TOP: 'top';

	/** 📘
	 * Align text to the middle.
	 */
	const MIDDLE: 'middle';

	/** 📘
	 * Align text to the bottom.
	 */
	const BOTTOM: 'bottom';

	/** 📘
	 * Align text to the baseline (alphabetic).
	 */
	const BASELINE: 'alphabetic';

	// 🖲 input

	/**
	 * q5's input handling is very basic.
	 * 
	 * For better input handling, including game controller support, consider using the [p5play](https://p5play.org/) addon with q5.
	 * 
	 * Note that input responses inside `draw` can be delayed by
	 * up to one frame cycle: from the exact moment an input event occurs
	 * to the next time a frame is drawn.
	 * 
	 * Play sounds or trigger other non-visual feedback immediately
	 * by responding to input events inside functions like
	 * `mousePressed` and `keyPressed`.
	 */

	/** 🖲
	 * Current X position of the mouse.
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	textSize(64);
	 * 	text(round(mouseX), -50, 20);
	 * };
	 */
	let mouseX: number;

	/** 🖲
	 * Current Y position of the mouse.
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	circle(0, mouseY, 100);
	 * };
	 */
	let mouseY: number;

	/** 🖲
	 * Previous X position of the mouse.
	 */
	let pmouseX: number;

	/** 🖲
	 * Previous Y position of the mouse.
	 */
	let pmouseY: number;

	/** 🖲
	 * The current button being pressed: 'left', 'right', 'center').
	 * 
	 * The default value is an empty string.
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	textSize(64);
	 * 	text(mouseButton, -80, 20);
	 * };
	 */
	let mouseButton: string;

	/** 🖲
	 * True if the mouse is currently pressed, false otherwise.
	 * @example
	 * q5.draw = function () {
	 * 	if (mouseIsPressed) background(0.4);
	 * 	else background(0.8);
	 * };
	 */
	let mouseIsPressed: boolean;

	/** 🖲
	 * Define this function to respond to mouse down events.
	 * @example
	 * await Canvas(200);
	 * let gray = 0.4;
	 * 
	 * q5.mousePressed = function () {
	 * 	background(gray % 1);
	 * 	gray += 0.1;
	 * };
	 */
	function mousePressed(): void;

	/** 🖲
	 * Define this function to respond to mouse up events.
	 * @example
	 * await Canvas(200);
	 * let gray = 0.4;
	 * 
	 * q5.mouseReleased = function () {
	 * 	background(gray % 1);
	 * 	gray += 0.1;
	 * };
	 */
	function mouseReleased(): void;

	/** 🖲
	 * Define this function to respond to mouse move events.
	 * 
	 * On touchscreen devices this function is not called
	 * when the user drags their finger on the screen.
	 * @example
	 * await Canvas(200);
	 * let gray = 0.4;
	 * 
	 * q5.mouseMoved = function () {
	 * 	background(gray % 1);
	 * 	gray += 0.005;
	 * };
	 */
	function mouseMoved(): void;

	/** 🖲
	 * Define this function to respond to mouse drag events.
	 * 
	 * Dragging the mouse is defined as moving the mouse
	 * while a mouse button is pressed.
	 * @example
	 * await Canvas(200);
	 * let gray = 0.4;
	 * 
	 * q5.mouseDragged = function () {
	 * 	background(gray % 1);
	 * 	gray += 0.005;
	 * };
	 */
	function mouseDragged(): void;

	/** 🖲
	 * Define this function to respond to mouse double click events.
	 * @example
	 * await Canvas(200);
	 * let gray = 0.4;
	 * 
	 * q5.doubleClicked = function () {
	 * 	background(gray % 1);
	 * 	gray += 0.1;
	 * };
	 */
	function doubleClicked(): void;

	/** 🖲
	 * The name of the last key pressed.
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	textSize(64);
	 * 	text(key, -80, 20);
	 * };
	 */
	let key: string;

	/** 🖲
	 * True if a key is currently pressed, false otherwise.
	 * @example
	 * q5.draw = function () {
	 * 	if (keyIsPressed) background(0.4);
	 * 	else background(0.8);
	 * };
	 */
	let keyIsPressed: boolean;

	/** 🖲
	 * Returns true if the user is pressing the specified key, false
	 * otherwise. Accepts case-insensitive key names.
	 * @param {string} key key to check
	 * @returns {boolean} true if the key is pressed, false otherwise
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 
	 * 	if (keyIsDown('f') && keyIsDown('j')) {
	 * 		rect(-50, -50, 100, 100);
	 * 	}
	 * };
	 */
	function keyIsDown(key: string): boolean;

	/** 🖲
	 * Define this function to respond to key down events.
	 * @example
	 * await Canvas(200);
	 * let gray = 0.4;
	 * 
	 * q5.keyPressed = function () {
	 * 	background(gray % 1);
	 * 	gray += 0.1;
	 * };
	 */
	function keyPressed(): void;

	/** 🖲
	 * Define this function to respond to key up events.
	 * @example
	 * await Canvas(200);
	 * let gray = 0.4;
	 * 
	 * q5.keyReleased = function () {
	 * 	background(gray % 1);
	 * 	gray += 0.1;
	 * };
	 */
	function keyReleased(): void;

	/** 🖲
	 * Array containing all current touch points within the
	 * browser window. Each touch being an object with
	 * `id`, `x`, and `y` properties.
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	for (let touch of touches) {
	 * 		circle(touch.x, touch.y, 100);
	 * 	}
	 * };
	 */
	let touches: any[];

	/** 🖲
	 * Define this function to respond to touch down events
	 * on the canvas.
	 * 
	 * Return true to enable touch gestures like pinch-to-zoom
	 * and scroll, which q5 disables on the canvas by default.
	 * @example
	 * await Canvas(200);
	 * let gray = 0.4;
	 * 
	 * q5.touchStarted = function () {
	 * 	background(gray % 1);
	 * 	gray += 0.1;
	 * };
	 */
	function touchStarted(): void;

	/** 🖲
	 * Define this function to respond to touch down events
	 * on the canvas.
	 * 
	 * Return true to enable touch gestures like pinch-to-zoom
	 * and scroll, which q5 disables on the canvas by default.
	 * @example
	 * await Canvas(200);
	 * let gray = 0.4;
	 * 
	 * q5.touchEnded = function () {
	 * 	background(gray % 1);
	 * 	gray += 0.1;
	 * };
	 */
	function touchEnded(): void;

	/** 🖲
	 * Define this function to respond to touch move events
	 * on the canvas.
	 * 
	 * Return true to enable touch gestures like pinch-to-zoom
	 * and scroll, which q5 disables on the canvas by default.
	 * @example
	 * await Canvas(200);
	 * let gray = 0.4;
	 * 
	 * q5.touchMoved = function () {
	 * 	background(gray % 1);
	 * 	gray += 0.005;
	 * };
	 */
	function touchMoved(): void;

	/** 🖲
	 * Object containing all current pointers within the
	 * browser window.
	 * 
	 * This includes mouse, touch, and pen pointers.
	 * 
	 * Each pointer is an object with
	 * `event`, `x`, and `y` properties.
	 * The `event` property contains the original
	 * [PointerEvent](https://developer.mozilla.org/docs/Web/API/PointerEvent).
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	for (let pointerID in pointers) {
	 * 		let pointer = pointers[pointerID];
	 * 		circle(pointer.x, pointer.y, 100);
	 * 	}
	 * };
	 */
	let pointers: {};

	/** 🖲
	 * Sets the cursor to a [CSS cursor type](https://developer.mozilla.org/docs/Web/CSS/cursor) or image.
	 * If an image is provided, optional x and y coordinates can
	 * specify the active point of the cursor.
	 * @param {string} name name of the cursor or the url to an image
	 * @param {number} [x] x-coordinate of the cursor's point
	 * @param {number} [y] y-coordinate of the cursor's point
	 * @example
	 * await Canvas(200, 100);
	 * cursor('pointer');
	 */
	function cursor(name: string, x?: number, y?: number): void;

	/** 🖲
	 * Hides the cursor within the bounds of the canvas.
	 * @example
	 * await Canvas(200, 100);
	 * noCursor();
	 */
	function noCursor(): void;

	/** 🖲
	 * Define this function to respond to mouse wheel events.
	 * 
	 * `event.deltaX` and `event.deltaY` are the horizontal and vertical
	 * scroll amounts, respectively.
	 * 
	 * Return true to allow the default behavior of scrolling the page.
	 * @example
	 * let x = (y = 0);
	 * q5.draw = function () {
	 * 	circle(x, y, 10);
	 * };
	 * q5.mouseWheel = function (e) {
	 * 	x += e.deltaX;
	 * 	y += e.deltaY;
	 * 	return false;
	 * };
	 */
	function mouseWheel(event: any): void;

	/** 🖲
	 * Requests that the pointer be locked to the document body, hiding
	 * the cursor and allowing for unlimited movement.
	 * 
	 * Operating systems enable mouse acceleration by default, which is useful when you sometimes want slow precise movement (think about you might use a graphics package), but also want to move great distances with a faster mouse movement (think about scrolling, and selecting several files). For some games however, raw mouse input data is preferred for controlling camera rotation — where the same distance movement, fast or slow, results in the same rotation.
	 * 
	 * To exit pointer lock mode, call `document.exitPointerLock()`.
	 * @param {boolean} unadjustedMovement set to true to disable OS-level mouse acceleration and access raw mouse input
	 * @example
	 * q5.draw = function () {
	 * 	circle(mouseX / 10, mouseY / 10, 10);
	 * };
	 * 
	 * q5.doubleClicked = function () {
	 * 	if (!document.pointerLockElement) {
	 * 		pointerLock();
	 * 	} else {
	 * 		document.exitPointerLock();
	 * 	}
	 * };
	 */
	function pointerLock(unadjustedMovement: boolean): void;

	// 🎨 color

	/** 🎨
	 * Creates a new `Color` object, which is primarily useful for storing
	 * a color that your sketch will reuse or modify later.
	 * 
	 * With the default color mode, RGB, colors have `r`/`red`, `g`/`green`,
	 * `b`/`blue`, and `a`/`alpha` components.
	 * 
	 * The [`fill`](https://q5js.org/learn/#fill), [`stroke`](https://q5js.org/learn/#stroke), and [`background`](https://q5js.org/learn/#background)
	 * functions accept the same wide range of color representations as this function.
	 *
	 * The default color format is "float", so
	 * set color components to values between 0 and 1.
	 * 
	 * Here are some examples of valid use:
	 * 
	 * - `color(1)` (grayscale)
	 * - `color(1, 0.8)` (grayscale, alpha)
	 * - `color(1, 0, 0)` (r, g, b)
	 * - `color(1, 0, 0, 0.1)` (r, g, b, a)
	 * - `color('red')` (colorName)
	 * - `color('#ff0000')` (hexColor)
	 * - `color([1, 0, 0])` (colorComponents)
	 * @param {string | number | Color | number[]} c0 color or first color component
	 * @param {number} [c1] second color component
	 * @param {number} [c2] third color component
	 * @param {number} [c3] fourth color component (alpha)
	 * @returns {Color} a new `Color` object
	 * @example
	 * await Canvas(200);
	 * rect(-100, -100, 100, 200);
	 * 
	 * //                ( r,   g,   b,   a)
	 * let bottle = color(0.35, 0.39, 1, 0.4);
	 * fill(bottle);
	 * stroke(bottle);
	 * strokeWeight(30);
	 * circle(0, 0, 155);
	 * @example
	 * await Canvas(200);
	 * //          (gray, alpha)
	 * let c = color(0.8, 0.2);
	 * 
	 * q5.draw = function () {
	 * 	background(c);
	 * 	circle(mouseX, mouseY, 50);
	 * 	c.g = (c.g + 0.005) % 1;
	 * };
	 * @example
	 * await Canvas(200);
	 * 
	 * //           (r, g, b,   a)
	 * let c = color(0, 1, 1, 0.2);
	 * 
	 * q5.draw = function () {
	 * 	fill(c);
	 * 	circle(mouseX, mouseY, 50);
	 * };
	 */
	function color(c0: string | number | Color | number[], c1?: number, c2?: number, c3?: number): Color;

	/** 🎨
	 * Sets the color mode for the sketch, which changes how colors are
	 * interpreted and displayed.
	 * 
	 * Color gamut is 'display-p3' by default, if the device supports HDR.
	 *
	 * The default color mode is RGB in float format.
	 * @param {'rgb' | 'oklch' | 'hsl' | 'hsb'} mode color mode
	 * @param {1 | 255} format color format (1 for float, 255 for integer)
	 * @param {'srgb' | 'display-p3'} [gamut] color gamut
	 * @example
	 * await Canvas(200);
	 * 
	 * colorMode(RGB, 1);
	 * fill(1, 0, 0);
	 * rect(-100, -100, 66, 200);
	 * fill(0, 1, 0);
	 * rect(-34, -100, 67, 200);
	 * fill(0, 0, 1);
	 * rect(33, -100, 67, 200);
	 * @example
	 * await Canvas(200);
	 * 
	 * colorMode(OKLCH);
	 * 
	 * fill(0.25, 0.15, 0);
	 * rect(-100, -100, 100, 200);
	 * 
	 * fill(0.75, 0.15, 0);
	 * rect(0, -100, 100, 200);
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
	 * await Canvas(200, 100);
	 * 
	 * colorMode(RGB);
	 * 
	 * background(1, 0, 0);
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
	 * await Canvas(200, 100);
	 * 
	 * colorMode(OKLCH);
	 * 
	 * background(0.64, 0.3, 30);
	 * @example
	 * await Canvas(200);
	 * colorMode(OKLCH);
	 * 
	 * q5.draw = function () {
	 * 	background(0.7, 0.16, frameCount % 360);
	 * };
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
	 * await Canvas(200, 100);
	 * 
	 * colorMode(HSL);
	 * 
	 * background(0, 100, 50);
	 * @example
	 * await Canvas(200, 220);
	 * noStroke();
	 * 
	 * colorMode(HSL);
	 * for (let h = 0; h < 360; h += 10) {
	 * 	for (let l = 0; l <= 100; l += 10) {
	 * 		fill(h, 100, l);
	 * 		rect(h * (11 / 20) - 100, l * 2 - 110, 6, 20);
	 * 	}
	 * }
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
	 * await Canvas(200, 100);
	 * 
	 * colorMode(HSB);
	 * 
	 * background(0, 100, 100);
	 * @example
	 * await Canvas(200, 220);
	 * noStroke();
	 * 
	 * colorMode(HSB);
	 * for (let h = 0; h < 360; h += 10) {
	 * 	for (let b = 0; b <= 100; b += 10) {
	 * 		fill(h, 100, b);
	 * 		rect(h * (11 / 20) - 100, b * 2 - 110, 6, 20);
	 * 	}
	 * }
	 */
	const HSB: 'hsb';

	/** 🎨
	 * Limits the color gamut to the sRGB color space.
	 * 
	 * If your display is HDR capable, note that full red appears
	 * less saturated and darker in this example, as it would on
	 * an SDR display.
	 * @example
	 * await Canvas(200, 100);
	 * 
	 * colorMode(RGB, 1, SRGB);
	 * 
	 * background(1, 0, 0);
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
	 * await Canvas(200, 100);
	 * 
	 * colorMode(RGB, 1, DISPLAY_P3);
	 * 
	 * background(1, 0, 0);
	 */
	const DISPLAY_P3: 'display-p3';

	/** 🎨
	 * Draws over the entire canvas with a color or image.
	 * 
	 * Like the [`color`](https://q5js.org/learn/#color) function,
	 * this function can accept colors in a wide range of formats:
	 * CSS color string, grayscale value, and color component values.
	 * @param {Color | Q5.Image} filler a color or image to draw
	 * @example
	 * await Canvas(200, 100);
	 * background('crimson');
	 * @example
	 * q5.draw = function () {
	 * 	background(0.5, 0.2);
	 * 	circle(mouseX, mouseY, 20);
	 * };
	 */
	function background(filler: Color | Q5.Image): void;

	class Color {

		/** 🎨
		 * This constructor strictly accepts 4 numbers, which are the color
		 * components.
		 * 
		 * Use the `color` function for greater flexibility, it runs
		 * this constructor internally.
		 */
		constructor(c0: number, c1: number, c2: number, c3: number);

		/** 🎨
		 * Checks if this color is exactly equal to another color.
		 */
		equals(other: Color): boolean;

		/** 🎨
		 * Checks if the color is the same as another color,
		 * disregarding their alpha values.
		 */
		isSameColor(other: Color): boolean;

		/** 🎨
		 * Produces a CSS color string representation.
		 */
		toString(): string;

		/** 🎨
		 * An array of the color's components.
		 */
		levels: number[];
	}

	// 💅 styles

	/** 💅
	 * Sets the fill color. The default is white.
	 * 
	 * Like the [`color`](https://q5js.org/learn/#color) function, this function
	 * can accept colors in a wide range of formats: as a CSS color string,
	 * a `Color` object, grayscale value, or color component values.
	 * @param {Color} color fill color
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * fill('red');
	 * circle(-20, -20, 80);
	 * 
	 * fill('lime');
	 * square(-20, -20, 80);
	 */
	function fill(color: Color): void;

	/** 💅
	 * Sets the stroke (outline) color. The default is black.
	 * 
	 * Like the [`color`](https://q5js.org/learn/#color) function, this function
	 * can accept colors in a wide range of formats: as a CSS color string,
	 * a `Color` object, grayscale value, or color component values.
	 * @param {Color} color stroke color
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * fill(0.14);
	 * 
	 * stroke('red');
	 * circle(-20, -20, 80);
	 * 
	 * stroke('lime');
	 * square(-20, -20, 80);
	 */
	function stroke(color: Color): void;

	/** 💅
	 * After calling this function, drawing will not be filled.
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * noFill();
	 * 
	 * stroke('red');
	 * circle(-20, -20, 80);
	 * stroke('lime');
	 * square(-20, -20, 80);
	 */
	function noFill(): void;

	/** 💅
	 * After calling this function, drawing will not have a stroke (outline).
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * fill(0.14);
	 * stroke('red');
	 * circle(-20, -20, 80);
	 * 
	 * noStroke();
	 * square(-20, -20, 80);
	 */
	function noStroke(): void;

	/** 💅
	 * Sets the size of the stroke used for lines and the border around drawings.
	 * @param {number} weight size of the stroke in pixels
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * stroke('red');
	 * circle(-50, 0, 80);
	 * 
	 * strokeWeight(12);
	 * circle(50, 0, 80);
	 */
	function strokeWeight(weight: number): void;

	/** 💅
	 * Sets the global opacity, which affects all subsequent drawing operations, except `background`. Default is 1, fully opaque.
	 * 
	 * In q5 WebGPU this function only affects images.
	 * @param {number} alpha opacity level, ranging from 0 to 1
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * opacity(1);
	 * circle(-20, -20, 80);
	 * 
	 * opacity(0.2);
	 * square(-20, -20, 80);
	 */
	function opacity(alpha: number): void;

	/** 💅
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
	 */
	function shadow(color: string | Color): void;

	/** 💅
	 * Disables the shadow effect.
	 * 
	 * Not available in q5 WebGPU.
	 */
	function noShadow(): void;

	/** 💅
	 * Sets the shadow offset and blur radius.
	 * 
	 * When q5 starts, shadow offset is (10, 10) with a blur of 10.
	 * 
	 * Not available in q5 WebGPU.
	 * @param {number} offsetX horizontal offset of the shadow
	 * @param {number} offsetY vertical offset of the shadow, defaults to be the same as offsetX
	 * @param {number} blur blur radius of the shadow, defaults to 0
	 */
	function shadowBox(offsetX: number, offsetY: number, blur: number): void;

	/** 💅
	 * Set the global composite operation for the canvas context.
	 * 
	 * Not available in q5 WebGPU.
	 * @param {string} val composite operation
	 */
	function blendMode(val: string): void;

	/** 💅
	 * Set the line cap style to `ROUND`, `SQUARE`, or `PROJECT`.
	 * 
	 * Not available in q5 WebGPU.
	 * @param {CanvasLineCap} val line cap style
	 */
	function strokeCap(val: CanvasLineCap): void;

	/** 💅
	 * Set the line join style to `ROUND`, `BEVEL`, or `MITER`.
	 * 
	 * Not available in q5 WebGPU.
	 * @param {CanvasLineJoin} val line join style
	 */
	function strokeJoin(val: CanvasLineJoin): void;

	/** 💅
	 * Sets the canvas to erase mode, where shapes will erase what's
	 * underneath them instead of drawing over it.
	 * 
	 * Not available in q5 WebGPU.
	 * @param {number} [fillAlpha] opacity level of the fill color
	 * @param {number} [strokeAlpha] opacity level of the stroke color
	 */
	function erase(fillAlpha?: number, strokeAlpha?: number): void;

	/** 💅
	 * Resets the canvas from erase mode to normal drawing mode.
	 * 
	 * Not available in q5 WebGPU.
	 */
	function noErase(): void;

	/** 💅
	 * Saves the current drawing style settings.
	 * 
	 * This includes the fill, stroke, stroke weight, tint, image mode,
	 * rect mode, ellipse mode, text size, text align, text baseline, and
	 * shadow settings.
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * pushStyles();
	 * fill('blue');
	 * circle(-50, -50, 80);
	 * 
	 * popStyles();
	 * circle(50, 50, 80);
	 */
	function pushStyles(): void;

	/** 💅
	 * Restores the previously saved drawing style settings.
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * pushStyles();
	 * fill('blue');
	 * circle(-50, -50, 80);
	 * 
	 * popStyles();
	 * circle(50, 50, 80);
	 */
	function popStyles(): void;

	/** 💅
	 * Clears the canvas, making every pixel completely transparent.
	 * 
	 * Note that the canvas can only be seen through if it has an alpha channel.
	 * @example
	 * await Canvas(200, { alpha: true });
	 * 
	 * q5.draw = function () {
	 * 	clear();
	 * 	circle((frameCount % 200) - 100, 0, 80);
	 * };
	 */
	function clear(): void;

	/** 💅
	 * The 2D rendering context for the canvas.
	 * 
	 * You can use it to create [linear gradients](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createLinearGradient), [radial gradients](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createRadialGradient), [font stretching](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fontStretch), and
	 * other advanced drawing features.
	 * 
	 * Not available in q5 WebGPU.
	 */
	var ctx: CanvasRenderingContext2D;

	/** 💅
	 * Checks if a given point is within the current path's fill area.
	 * 
	 * Not available in q5 WebGPU.
	 * @param {number} x x-coordinate of the point
	 * @param {number} y y-coordinate of the point
	 * @returns {boolean} true if the point is within the fill area, false otherwise
	 */
	function inFill(x: number, y: number): boolean;

	/** 💅
	 * Checks if a given point is within the current path's stroke.
	 * 
	 * Not available in q5 WebGPU.
	 * @param {number} x x-coordinate of the point
	 * @param {number} y y-coordinate of the point
	 * @returns {boolean} true if the point is within the stroke, false otherwise
	 */
	function inStroke(x: number, y: number): boolean;

	// 🦋 transforms

	/** 🦋
	 * Translates the origin of the drawing context.
	 * @param {number} x translation along the x-axis
	 * @param {number} y translation along the y-axis
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 
	 * 	translate(50, 50);
	 * 	circle(0, 0, 80);
	 * };
	 */
	function translate(x: number, y: number): void;

	/** 🦋
	 * Rotates the drawing context.
	 * @param {number} angle rotation angle in radians
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 
	 * 	rotate(mouseX / 50);
	 * 
	 * 	rectMode(CENTER);
	 * 	square(0, 0, 120);
	 * };
	 */
	function rotate(angle: number): void;

	/** 🦋
	 * Scales the drawing context.
	 * 
	 * If only one input parameter is provided,
	 * the drawing context will be scaled uniformly.
	 * @param {number} x scaling factor along the x-axis
	 * @param {number} [y] scaling factor along the y-axis
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 
	 * 	scale(mouseX / 10);
	 * 	circle(0, 0, 20);
	 * };
	 */
	function scale(x: number, y?: number): void;

	/** 🦋
	 * Shears the drawing context along the x-axis.
	 * @param {number} angle shear angle in radians
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 
	 * 	translate(-75, -40);
	 * 	shearX(mouseX / 100);
	 * 	square(0, 0, 80);
	 * };
	 */
	function shearX(angle: number): void;

	/** 🦋
	 * Shears the drawing context along the y-axis.
	 * @param {number} angle shear angle in radians
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 
	 * 	translate(-75, -40);
	 * 	shearY(mouseX / 100);
	 * 	square(0, 0, 80);
	 * };
	 */
	function shearY(angle: number): void;

	/** 🦋
	 * Applies a transformation matrix.
	 * 
	 * Accepts a 3x3 matrix as either an array or multiple arguments.
	 *
	 * Note that in q5 WebGPU, the identity matrix (default)
	 * has a negative y scale to flip the y-axis to match
	 * the Canvas2D renderer.
	 * @param {number} a
	 * @param {number} b
	 * @param {number} c
	 * @param {number} d
	 * @param {number} e
	 * @param {number} f
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 
	 * 	applyMatrix(2, -1, 1, -1);
	 * 	circle(0, 0, 80);
	 * };
	 */
	function applyMatrix(a: number, b: number, c: number, d: number, e: number, f: number): void;

	/** 🦋
	 * Resets the transformation matrix.
	 * 
	 * q5 runs this function before every time the `draw` function is run,
	 * so that transformations don't carry over to the next frame.
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * translate(50, 50);
	 * circle(0, 0, 80);
	 * 
	 * resetMatrix();
	 * square(0, 0, 50);
	 */
	function resetMatrix(): void;

	/** 🦋
	 * Saves the current transformation matrix.
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * pushMatrix();
	 * rotate(QUARTER_PI);
	 * ellipse(0, 0, 120, 40);
	 * popMatrix();
	 * 
	 * ellipse(0, 0, 120, 40);
	 */
	function pushMatrix(): void;

	/** 🦋
	 * Restores the previously saved transformation matrix.
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * pushMatrix();
	 * rotate(QUARTER_PI);
	 * ellipse(0, 0, 120, 40);
	 * popMatrix();
	 * 
	 * ellipse(0, 0, 120, 40);
	 */
	function popMatrix(): void;

	/** 🦋
	 * Saves the current drawing style settings and transformations.
	 * @example
	 * await Canvas(200);
	 * 
	 * push();
	 * fill('blue');
	 * translate(50, 50);
	 * circle(0, 0, 80);
	 * pop();
	 * 
	 * square(0, 0, 50);
	 */
	function push(): void;

	/** 🦋
	 * Restores the previously saved drawing style settings and transformations.
	 * @example
	 * await Canvas(200);
	 * 
	 * push();
	 * fill('blue');
	 * translate(50, 50);
	 * circle(0, 0, 80);
	 * pop();
	 * 
	 * square(0, 0, 50);
	 */
	function pop(): void;

	// 💻 display

	/** 💻
	 * Customize how your canvas is presented.
	 * @param {string} mode NORMAL, CENTER, or MAXED
	 * @param {string} renderQuality SMOOTH or PIXELATED
	 * @param {number} scale can also be given as a string (for example "x2")
	 * @example
	 * await Canvas(50, 25);
	 * 
	 * displayMode(CENTER, PIXELATED, 4);
	 * 
	 * circle(0, 0, 16);
	 */
	function displayMode(mode: string, renderQuality: string, scale: string | number): void;

	/** 💻
	 * A `displayMode` setting.
	 * 
	 * The canvas will be scaled to fill the parent element,
	 * with letterboxing if necessary to preserve its aspect ratio.
	 */
	const MAXED: 'maxed';

	/** 💻
	 * A `displayMode` render quality.
	 * 
	 * Smooth upscaling is used if the canvas is scaled.
	 */
	const SMOOTH: 'smooth';

	/** 💻
	 * A `displayMode` render quality.
	 * 
	 * Pixels are rendered as sharp squares if the canvas is scaled.
	 */
	const PIXELATED: 'pixelated';

	/** 💻
	 * Enables or disables fullscreen mode.
	 * @param {boolean} [v] boolean indicating whether to enable or disable fullscreen mode
	 */
	function fullscreen(v?: boolean): void;

	/** 💻
	 * The width of the window.
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	textSize(64);
	 * 	textAlign(CENTER, CENTER);
	 * 	text(windowWidth, 0, 0);
	 * };
	 */
	var windowWidth: number;

	/** 💻
	 * The height of the window.
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	textSize(64);
	 * 	textAlign(CENTER, CENTER);
	 * 	text(windowHeight, 0, 0);
	 * };
	 */
	var windowHeight: number;

	/** 💻
	 * The width of the canvas.
	 * @example
	 * await Canvas(200, 120);
	 * circle(0, 0, width);
	 */
	var width: number;

	/** 💻
	 * The height of the canvas.
	 * @example
	 * await Canvas(200, 80);
	 * circle(0, 0, height);
	 */
	var height: number;

	/** 💻
	 * Half the width of the canvas.
	 * @example
	 * await Canvas(200, 80);
	 * circle(0, 0, halfWidth);
	 */
	var halfWidth: number;

	/** 💻
	 * Half the height of the canvas.
	 * @example
	 * await Canvas(200, 80);
	 * circle(0, 0, halfHeight);
	 */
	var halfHeight: number;

	/** 💻
	 * The canvas element associated with the Q5 instance.
	 */
	var canvas: HTMLCanvasElement;

	/** 💻
	 * Resizes the canvas to the specified width and height.
	 * @param {number} w width of the canvas
	 * @param {number} h height of the canvas
	 * @example
	 * await Canvas(200, 100);
	 * 
	 * q5.draw = function () {
	 * 	background(0.8);
	 * };
	 * 
	 * q5.mousePressed = function () {
	 * 	resizeCanvas(200, 200);
	 * };
	 */
	function resizeCanvas(w: number, h: number): void;

	/** 💻
	 * The number of frames that have been displayed since the program started.
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	textSize(64);
	 * 	text(frameCount, -92, 20);
	 * };
	 */
	var frameCount: number;

	/** 💻
	 * Stops the draw loop.
	 * @example
	 * q5.draw = function () {
	 * 	circle(frameCount * 5 - 100, 0, 80);
	 * 	noLoop();
	 * };
	 */
	function noLoop(): void;

	/** 💻
	 * Redraws the canvas n times. If no input parameter is provided,
	 * it calls the draw function once.
	 * 
	 * This is an async function.
	 * @param {number} [n] number of times to redraw the canvas, default is 1
	 * @example
	 * await Canvas(200);
	 * noLoop();
	 * 
	 * q5.draw = function () {
	 * 	circle(frameCount * 5 - 100, 0, 80);
	 * };
	 * q5.mousePressed = function () {
	 * 	redraw(10);
	 * };
	 */
	function redraw(n?: number): void;

	/** 💻
	 * Starts the draw loop again if it was stopped.
	 * @example
	 * await Canvas(200);
	 * noLoop();
	 * 
	 * q5.draw = function () {
	 * 	circle(frameCount * 5 - 100, 0, 80);
	 * };
	 * q5.mousePressed = function () {
	 * 	loop();
	 * };
	 */
	function loop(): void;

	/** 💻
	 * Sets the target frame rate or gets an approximation of the
	 * sketch's current frame rate.
	 * 
	 * Even when the sketch is running at a consistent frame rate,
	 * the current frame rate value will fluctuate. Use your web browser's
	 * developer tools for more accurate performance analysis.
	 * @param {number} [hertz] target frame rate, default is 60
	 * @returns {number} current frame rate
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 
	 * 	if (mouseIsPressed) frameRate(10);
	 * 	else frameRate(60);
	 * 
	 * 	circle((frameCount % 200) - 100, 0, 80);
	 * };
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	textSize(64);
	 * 	text(round(frameRate()), -35, 20);
	 * };
	 */
	function frameRate(hertz?: number): number;

	/** 💻
	 * The desired frame rate of the sketch.
	 * @returns {number} target frame rate
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	textSize(64);
	 * 
	 * 	text(getTargetFrameRate(), -35, 20);
	 * };
	 */
	function getTargetFrameRate(): number;

	/** 💻
	 * Gets the current FPS, in terms of how many frames could be generated
	 * in one second, which can be higher than the target frame rate.
	 * 
	 * Use your web browser's developer tools for more in-depth
	 * performance analysis.
	 * @returns {number} frames per second
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	frameRate(1);
	 * 	textSize(64);
	 * 
	 * 	text(getFPS(), -92, 20);
	 * };
	 */
	function getFPS(): number;

	/** 💻
	 * Runs after each `draw` function call and post-draw q5 addon processes, if any.
	 * 
	 * Useful for adding post-processing effects when it's not possible
	 * to do so at the end of the `draw` function, such as when using
	 * addons like p5play that auto-draw to the canvas after the `draw`
	 * function is run.
	 */
	function postProcess(): void;

	/** 💻
	 * Sets the pixel density of the canvas.
	 * @param {number} v pixel density value
	 * @returns {number} pixel density
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * pixelDensity(1);
	 * circle(0, 0, 80);
	 */
	function pixelDensity(v: number): number;

	/** 💻
	 * Returns the current display density.
	 * 
	 * On most modern displays, this value will be 2 or 3.
	 * @returns {number} display density
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * textSize(64);
	 * text(displayDensity(), -90, 6);
	 */
	function displayDensity(): number;

	/** 💻
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
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	text(deltaTime, -90, 6);
	 * };
	 * @example
	 * let x = -100;
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	// simulate frame rate drops
	 * 	frameRate(random(30, 60));
	 * 
	 * 	x += deltaTime * 0.2;
	 * 	if (x > 100) x = -100;
	 * 	circle(x, 0, 20);
	 * };
	 */
	var deltaTime: number;

	// 🧮 math

	/** 🧮
	 * Generates a random value.
	 * 
	 * - If no inputs are provided, returns a number between 0 and 1.
	 * - If one numerical input is provided, returns a number between 0 and the provided value.
	 * - If two numerical inputs are provided, returns a number between the two values.
	 * - If an array is provided, returns a random element from the array.
	 * @param {number | any[]} [low] lower bound (inclusive) or an array
	 * @param {number} [high] upper bound (exclusive)
	 * @returns {number | any} a random number or element
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * frameRate(5);
	 * 
	 * q5.draw = function () {
	 * 	circle(0, 0, random(200));
	 * };
	 * @example
	 * q5.draw = function () {
	 * 	circle(random(-100, 100), random(-10, 10), 10);
	 * };
	 */
	function random(low?: number | any[], high?: number): number | any;

	/** 🧮
	 * Generates a random number within a symmetric range around zero.
	 * 
	 * Can be used to create a jitter effect (random displacement).
	 * 
	 * Equivalent to `random(-amount, amount)`.
	 * @param {number} [amount] absolute maximum amount of jitter, default is 1
	 * @returns {number} random number between -val and val
	 * @example
	 * q5.draw = function () {
	 * 	circle(mouseX + jit(3), mouseY + jit(3), 5);
	 * };
	 * @example
	 * await Canvas(200);
	 * 
	 * q5.draw = function () {
	 * 	circle(jit(50), 0, random(50));
	 * };
	 */
	function jit(amount?: number): number;

	/** 🧮
	 * Generates a noise value based on the x, y, and z inputs.
	 * 
	 * Uses [Perlin Noise](https://en.wikipedia.org/wiki/Perlin_noise) by default.
	 * @param {number} [x] x-coordinate input
	 * @param {number} [y] y-coordinate input
	 * @param {number} [z] z-coordinate input
	 * @returns {number} a noise value
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	let n = noise(frameCount * 0.01);
	 * 	circle(0, 0, n * 200);
	 * };
	 * @example
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	let t = (frameCount + mouseX) * 0.02;
	 * 	for (let x = -5; x < 220; x += 10) {
	 * 		let n = noise(t, x * 0.1);
	 * 		circle(x - 100, 0, n * 40);
	 * 	}
	 * };
	 * @example
	 * q5.draw = function () {
	 * 	noStroke();
	 * 	let t = millis() * 0.002;
	 * 	for (let x = -100; x < 100; x += 5) {
	 * 		for (let y = -100; y < 100; y += 5) {
	 * 			fill(noise(t, (mouseX + x) * 0.05, y * 0.05));
	 * 			square(x, y, 5);
	 * 		}
	 * 	}
	 * };
	 */
	function noise(x?: number, y?: number, z?: number): number;

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
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	line(0, 0, mouseX, mouseY);
	 * 
	 * 	let d = dist(0, 0, mouseX, mouseY);
	 * 	text(round(d), -80, -80);
	 * };
	 */
	function dist(x1: number, y1: number, x2: number, y2: number): number;

	/** 🧮
	 * Maps a number from one range to another.
	 * @param {number} val incoming value to be converted
	 * @param {number} start1 lower bound of the value's current range
	 * @param {number} stop1 upper bound of the value's current range
	 * @param {number} start2 lower bound of the value's target range
	 * @param {number} stop2 upper bound of the value's target range
	 * @returns {number} mapped value
	 */
	function map(val: number, start1: number, stop1: number, start2: number, stop2: number): number;

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
	 * Calculates the fractional part of a number.
	 * @param {number} n a number
	 * @returns {number} fractional part of the number
	 */
	function fract(n: number): number;

	/** 🧮
	 * Calculates the absolute value of a number.
	 * @param {number} n a number
	 * @returns {number} absolute value of the number
	 */
	function abs(n: number): number;

	/** 🧮
	 * Rounds a number.
	 * @param {number} n number to round
	 * @param {number} [d] number of decimal places to round to
	 * @returns {number} rounded number
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * textSize(32);
	 * text(round(PI, 5), -90, 10);
	 */
	function round(n: number, d: number): number;

	/** 🧮
	 * Rounds a number up.
	 * @param {number} n a number
	 * @returns {number} rounded number
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * textSize(32);
	 * text(ceil(PI), -90, 10);
	 */
	function ceil(n: number): number;

	/** 🧮
	 * Rounds a number down.
	 * @param {number} n a number
	 * @returns {number} rounded number
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * textSize(32);
	 * text(floor(-PI), -90, 10);
	 */
	function floor(n: number): number;

	/** 🧮
	 * Returns the smallest value in a sequence of numbers.
	 * @param {...number} args numbers to compare
	 * @returns {number} minimum
	 * @example
	 * q5.draw = function () {
	 * 	background(min(-mouseX / 100, 0.5));
	 * 	circle(min(mouseX, 0), 0, 80);
	 * };
	 */
	function min(...args: number[]): number;

	/** 🧮
	 * Returns the largest value in a sequence of numbers.
	 * @param {...number} args numbers to compare
	 * @returns {number} maximum
	 * @example
	 * q5.draw = function () {
	 * 	background(max(-mouseX / 100, 0.5));
	 * 	circle(max(mouseX, 0), 0, 80);
	 * };
	 */
	function max(...args: number[]): number;

	/** 🧮
	 * Calculates the value of a base raised to a power.
	 * 
	 * For example, `pow(2, 3)` calculates 2 _ 2 _ 2 which is 8.
	 * @param {number} base base
	 * @param {number} exponent exponent
	 * @returns {number} base raised to the power of exponent
	 */
	function pow(base: number, exponent: number): number;

	/** 🧮
	 * Calculates the square of a number.
	 * @param {number} n number to square
	 * @returns {number} square of the number
	 */
	function sq(n: number): number;

	/** 🧮
	 * Calculates the square root of a number.
	 * @param {number} n a number
	 * @returns {number} square root of the number
	 */
	function sqrt(n: number): number;

	/** 🧮
	 * Calculates the natural logarithm (base e) of a number.
	 * @param {number} n a number
	 * @returns {number} natural logarithm of the number
	 */
	function loge(n: number): number;

	/** 🧮
	 * Calculates e raised to the power of a number.
	 * @param {number} exponent power to raise e to
	 * @returns {number} e raised to the power of exponent
	 */
	function exp(exponent: number): number;

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
	 * 2 \* PI.
	 * Approximately 6.28319.
	 */
	const TWO_PI: number;

	/** 🧮
	 * 2 \* PI.
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

	function sin(angle: number): number;

	function cos(angle: number): number;

	function tan(angle: number): number;

	function mag(val1: number, val2: number): number;

	function asin(n: number): number;

	function acos(n: number): number;

	function atan(n: number): number;

	function atan2(y: number, x: number): number;

	// 🔊 sound

	/**
	 * q5 includes low latency sound playback and basic mixing capabilities
	 * powered by WebAudio.
	 * 
	 * For audio filtering, synthesis, and analysis, consider using the
	 * [p5.sound](https://p5js.org/reference/p5.sound/) addon with q5.
	 */

	/** 🔊
	 * Loads audio data from a file and returns a `Sound` object.
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
	 * The entire sound file must be loaded before playback can start, use `await` to wait for a sound to load. To stream larger audio files use the `loadAudio` function instead.
	 * @param {string} url sound file
	 * @returns {Sound & PromiseLike<Sound>} sound
	 * @example
	 * await Canvas(200);
	 * 
	 * let sound = loadSound('/assets/jump.wav');
	 * sound.volume = 0.3;
	 * 
	 * q5.mousePressed = function () {
	 * 	sound.play();
	 * };
	 */
	function loadSound(url: string): Sound & PromiseLike<Sound>;

	/** 🔊
	 * Loads audio data from a file and returns an [HTMLAudioElement](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement).
	 * 
	 * Audio is considered loaded when the [canplaythrough event](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event) is fired.
	 * 
	 * Note that audio can only be played after the first user
	 * interaction with the page!
	 * @example
	 * await Canvas(200);
	 * 
	 * let audio = loadAudio('/assets/retro.flac');
	 * audio.volume = 0.4;
	 * 
	 * q5.mousePressed = function () {
	 * 	audio.play();
	 * };
	 */
	function loadAudio(url: string): HTMLAudioElement & PromiseLike<HTMLAudioElement>;

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
		 * 
		 * Use `await` to wait for the sound to finish playing.
		 * @returns {Promise<void>} a promise that resolves when the sound finishes playing
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

	/**
	 * The Document Object Model (DOM) is an interface for
	 * creating and editing web pages with JavaScript.
	 */

	/** 📑
	 * Creates a new HTML element and adds it to the page. `createElement` is
	 * an alias.
	 * 
	 * Modify the element's CSS [`style`](https://developer.mozilla.org/docs/Web/API/HTMLElement/style) to change its appearance.
	 * 
	 * Use [`addEventListener`](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener) to respond to events such as:
	 * 
	 * - "click": when the element is clicked
	 * - "mouseover": when the mouse hovers over the element
	 * - "mouseout": when the mouse stops hovering over the element
	 * - "input": when a form element's value changes
	 * 
	 * q5 adds some extra functionality to the elements it creates:
	 * 
	 * - the `position` function makes it easy to place the element
	 *   relative to the canvas
	 * - the `size` function sets the width and height of the element
	 * - alternatively, use the element's `x`, `y`, `width`, and `height` properties
	 * @param {string} tag tag name of the element
	 * @param {string} [content] content of the element
	 * @returns {HTMLElement} element
	 * @example
	 * await Canvas(200);
	 * 
	 * let el = createEl('div', '*');
	 * el.position(50, 50);
	 * el.size(100, 100);
	 * el.style.fontSize = '136px';
	 * el.style.textAlign = 'center';
	 * el.style.backgroundColor = 'blue';
	 * el.style.color = 'white';
	 */
	function createEl(tag: string, content?: string): HTMLElement;

	/** 📑
	 * Creates a link element.
	 * @param {string} href url
	 * @param {string} [text] text content
	 * @param {boolean} [newTab] whether to open the link in a new tab
	 * @example
	 * await Canvas(200);
	 * 
	 * let link = createA('https://q5js.org', 'q5.js');
	 * link.position(16, 42);
	 * link.style.fontSize = '80px';
	 * 
	 * link.addEventListener('mouseover', () => {
	 * 	background('cyan');
	 * });
	 */
	function createA(href: string, text?: string): HTMLAnchorElement;

	/** 📑
	 * Creates a button element.
	 * @param {string} [content] text content
	 * @example
	 * await Canvas(200, 100);
	 * 
	 * let btn = createButton('Click me!');
	 * 
	 * btn.addEventListener('click', () => {
	 * 	background(random(0.4, 1));
	 * });
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
	 * await Canvas(200, 100);
	 * 
	 * let box = createCheckbox('Check me!');
	 * box.label.style.color = 'lime';
	 * 
	 * box.addEventListener('input', () => {
	 * 	if (box.checked) background('lime');
	 * 	else background('black');
	 * });
	 */
	function createCheckbox(label?: string, checked?: boolean): HTMLInputElement;

	/** 📑
	 * Creates a color input element.
	 * 
	 * Use the `value` property to get or set the color value.
	 * @param {string} [value] initial color value
	 * @example
	 * await Canvas(200, 100);
	 * 
	 * let picker = createColorPicker();
	 * picker.value = '#fd7575';
	 * 
	 * q5.draw = function () {
	 * 	background(picker.value);
	 * };
	 */
	function createColorPicker(value?: string): HTMLInputElement;

	/** 📑
	 * Creates an image element.
	 * @param {string} src url of the image
	 * @example
	 * await Canvas(200, 100);
	 * 
	 * let img = createImg('/assets/p5play_logo.webp');
	 * img.position(0, 0).size(100, 100);
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
	 * await Canvas(200, 100);
	 * textSize(64);
	 * 
	 * let input = createInput();
	 * input.placeholder = 'Type here!';
	 * input.size(200, 32);
	 * 
	 * input.addEventListener('input', () => {
	 * 	background('orange');
	 * 	text(input.value, -90, 30);
	 * });
	 */
	function createInput(value?: string, type?: string): HTMLInputElement;

	/** 📑
	 * Creates a paragraph element.
	 * @param {string} [content] text content
	 * @example
	 * await Canvas(200, 50);
	 * background('coral');
	 * 
	 * let p = createP('Hello, world!');
	 * p.style.color = 'pink';
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
	 * await Canvas(200, 160);
	 * 
	 * let radio = createRadio();
	 * radio.option('square', '1');
	 * radio.option('circle', '2');
	 * 
	 * q5.draw = function () {
	 * 	background(0.8);
	 * 	if (radio.value == '1') square(-40, -40, 80);
	 * 	if (radio.value == '2') circle(0, 0, 80);
	 * };
	 */
	function createRadio(groupName?: string): HTMLDivElement;

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
	 * await Canvas(200, 100);
	 * 
	 * let sel = createSelect('Select an option');
	 * sel.option('Red', '#f55');
	 * sel.option('Green', '#5f5');
	 * 
	 * sel.addEventListener('change', () => {
	 * 	background(sel.value);
	 * });
	 */
	function createSelect(placeholder?: string): HTMLSelectElement;

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
	 * await Canvas(200);
	 * 
	 * let slider = createSlider(0, 1, 0.5, 0.1);
	 * slider.position(10, 10).size(180);
	 * 
	 * q5.draw = function () {
	 * 	background(slider.val());
	 * };
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
	 * @returns {HTMLVideoElement & PromiseLike<HTMLVideoElement>} a new video element
	 * @example
	 * await Canvas(1);
	 * 
	 * let vid = createVideo('/assets/apollo4.mp4');
	 * vid.size(200, 150);
	 * vid.autoplay = vid.muted = vid.loop = true;
	 * vid.controls = true;
	 * @example
	 * await Canvas(200, 150);
	 * let vid = createVideo('/assets/apollo4.mp4');
	 * vid.hide();
	 * 
	 * q5.mousePressed = function () {
	 * 	vid.currentTime = 0;
	 * 	vid.play();
	 * };
	 * q5.draw = function () {
	 * 	rotate(mouseX / 55);
	 * 	image(vid, -100, -75, 200, 150);
	 * };
	 */
	function createVideo(src: string): HTMLVideoElement & PromiseLike<HTMLVideoElement>;

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
	 * @param {boolean} [flipped] whether to mirror the video vertically, true by default
	 * @returns {HTMLVideoElement & PromiseLike<HTMLVideoElement>} a new video element
	 * @example
	 * q5.mousePressed = function () {
	 * 	let cap = createCapture(VIDEO);
	 * 	cap.size(200, 112.5);
	 * 	canvas.remove();
	 * };
	 * @example
	 * let cap;
	 * q5.mousePressed = function () {
	 * 	cap = createCapture(VIDEO);
	 * 	cap.hide();
	 * };
	 * 
	 * q5.draw = function () {
	 * 	let y = (frameCount % 200) - 100;
	 * 	image(cap, -100, y, 200, 200);
	 * };
	 * @example
	 * q5.mousePressed = function () {
	 * 	let cap = createCapture({
	 * 		video: { width: 640, height: 480 }
	 * 	});
	 * 	cap.size(200, 150);
	 * 	canvas.remove();
	 * };
	 */
	function createCapture(type?: string, flipped?: boolean): HTMLVideoElement & PromiseLike<HTMLVideoElement>;

	/** 📑
	 * Finds the first element in the DOM that matches the given [CSS selector](https://developer.mozilla.org/docs/Learn_web_development/Core/Styling_basics/Basic_selectors).
	 * 
	 * Alias for `document.querySelector`.
	 * @param {string} selector
	 * @returns {HTMLElement} element
	 */
	function findEl(selector: string): HTMLElement;

	/** 📑
	 * Finds all elements in the DOM that match the given [CSS selector](https://developer.mozilla.org/docs/Learn_web_development/Core/Styling_basics/Basic_selectors).
	 * 
	 * Alias for `document.querySelectorAll`.
	 * @param {string} selector
	 * @returns {HTMLElement[]} elements
	 */
	function findEls(selector: string): HTMLElement[];

	// 🎞 record

	/** 🎞
	 * Creates a recorder. Simply hit record to start recording!
	 * 
	 * The following properties can be set via the recorder UI or
	 * programmatically.
	 * 
	 * - `format` is set to "H.264" by default.
	 * - `bitrate` is a number in megabits per second (mbps). Its default
	 *   value is determined by the height of the canvas. Increasing the
	 *   bitrate will increase the quality and file size of the recording.
	 * - `captureAudio` is set to true by default. Set to false to disable
	 *   audio recording.
	 * 
	 * Note that recordings are done at a variable frame rate (VFR), which
	 * makes the output video incompatible with some editing software.
	 * For more info, see the
	 * ["Recording the Canvas"](https://github.com/q5js/q5.js/wiki/Recording-the-Canvas).
	 * wiki page.
	 * @returns {HTMLElement} a recorder, q5 DOM element
	 * @example
	 * await Canvas(200);
	 * 
	 * let rec = createRecorder();
	 * rec.bitrate = 10;
	 * 
	 * q5.draw = function () {
	 * 	circle(mouseX, jit(halfHeight), 10);
	 * };
	 */
	function createRecorder(): HTMLElement;

	/** 🎞
	 * Starts recording the canvas or resumes recording if it was paused.
	 * 
	 * If no recorder exists, one is created but not displayed.
	 */
	function record(): void;

	/** 🎞
	 * Pauses the canvas recording, if one is in progress.
	 */
	function pauseRecording(): void;

	/** 🎞
	 * Discards the current recording.
	 */
	function deleteRecording(): void;

	/** 🎞
	 * Saves the current recording as a video file.
	 * @param {string} fileName
	 * @example
	 * q5.draw = function () {
	 * 	square(mouseX, jit(100), 10);
	 * };
	 * 
	 * q5.mousePressed = function () {
	 * 	if (!recording) record();
	 * 	else saveRecording('squares');
	 * };
	 */
	function saveRecording(fileName: string): void;

	/** 🎞
	 * True if the canvas is currently being recorded.
	 */
	var recording: boolean;

	// 🛠 utilities

	/** 🛠
	 * Loads a file or multiple files.
	 * 
	 * File type is determined by file extension. q5 supports loading
	 * text, json, csv, font, audio, and image files.
	 * 
	 * By default, assets are loaded in parallel before q5 runs `draw`. Use `await` to wait for assets to load.
	 * @param {...string} urls
	 * @returns {Promise<any[]>} a promise that resolves with objects
	 * @example
	 * await Canvas(200);
	 * 
	 * let logo = load('/q5js_logo.avif');
	 * 
	 * q5.draw = function () {
	 * 	image(logo, -100, -100, 200, 200);
	 * };
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * await load('/assets/Robotica.ttf');
	 * 
	 * textSize(28);
	 * text('Hello, world!', -97, 100);
	 * @example
	 * await Canvas(200);
	 * 
	 * let [jump, retro] = await load('/assets/jump.wav', '/assets/retro.flac');
	 * 
	 * q5.mousePressed = function () {
	 * 	if (mouseButton == 'left') jump.play();
	 * 	if (mouseButton == 'right') retro.play();
	 * };
	 * //
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * textSize(32);
	 * 
	 * let xml = await load('/assets/animals.xml');
	 * let mammals = xml.querySelectorAll('mammal');
	 * let y = -90;
	 * for (let mammal of mammals) {
	 * 	text(mammal.textContent, -90, (y += 32));
	 * }
	 */
	function load(...urls: string[]): PromiseLike<any[]>;

	/** 🛠
	 * Saves data to a file.
	 * 
	 * If data is not specified, the canvas will be saved.
	 * 
	 * If no arguments are provided, the canvas will be saved as
	 * an image file named "untitled.png".
	 * @param {object} [data] canvas, image, or JS object
	 * @param {string} [fileName] filename to save as
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * circle(0, 0, 50);
	 * 
	 * q5.mousePressed = function () {
	 * 	save('circle.png');
	 * };
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * text('save me?', -90, 0);
	 * textSize(180);
	 * let bolt = createTextImage('⚡️');
	 * 
	 * q5.mousePressed = function () {
	 * 	save(bolt, 'bolt.png');
	 * };
	 */
	function save(data?: object, fileName?: string): void;

	/** 🛠
	 * Loads a text file from the specified url.
	 * 
	 * Using `await` to get the loaded text as a string is recommended.
	 * @param {string} url text file
	 * @returns {object & PromiseLike<string>} an object containing the loaded text in the property `obj.text` or use `await` to get the text string directly
	 */
	function loadText(url: string): object & PromiseLike<string>;

	/** 🛠
	 * Loads a JSON file from the specified url.
	 * 
	 * Using `await` to get the loaded JSON object or array is recommended.
	 * @param {string} url JSON file
	 * @returns {any & PromiseLike<any>} an object or array containing the loaded JSON
	 */
	function loadJSON(url: string): any & PromiseLike<any>;

	/** 🛠
	 * Loads a CSV file from the specified url.
	 * 
	 * Using `await` to get the loaded CSV as an array of objects is recommended.
	 * @param {string} url CSV file
	 * @returns {object[] & PromiseLike<object[]>} an array of objects containing the loaded CSV
	 */
	function loadCSV(url: string): object[] & PromiseLike<object[]>;

	/** 🛠
	 * Loads an xml file from the specified url.
	 * 
	 * Using `await` to get the loaded XML Element is recommended.
	 * @param {string} url xml file
	 * @returns {Element & PromiseLike<Element>} an object containing the loaded XML Element in a property called `obj.DOM` or use await to get the XML Element directly
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * textSize(32);
	 * 
	 * let xml = await load('/assets/animals.xml');
	 * let mammals = xml.querySelectorAll('mammal');
	 * let y = -90;
	 * for (let mammal of mammals) {
	 * 	text(mammal.textContent, -90, (y += 32));
	 * }
	 */
	function loadXML(url: string): object & PromiseLike<Element>;

	/** 🛠
	 * Wait for any assets that started loading to finish loading. By default q5 runs this before looping draw (which is called preloading), but it can be used even after draw starts looping.
	 * @returns {PromiseLike<any[]>} a promise that resolves with loaded objects
	 */
	function loadAll(): PromiseLike<any[]>;

	/** 🛠
	 * Disables the automatic preloading of assets before draw starts looping. This allows draw to start immediately, and assets can be lazy loaded or `loadAll()` can be used to wait for assets to finish loading later.
	 */
	function disablePreload(): void;

	/** 🛠
	 * nf is short for number format. It formats a number
	 * to a string with a specified number of digits.
	 * @param {number} num number to format
	 * @param {number} digits number of digits to format to
	 * @returns {string} formatted number
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * 
	 * textSize(32);
	 * text(nf(PI, 4, 5), -90, 10);
	 */
	function nf(num: number, digits: number): string;

	/** 🛠
	 * Shuffles the elements of an array.
	 * @param {any[]} arr array to shuffle
	 * @param {boolean} [modify] whether to modify the original array, false by default which copies the array before shuffling
	 * @returns {any[]} shuffled array
	 */
	function shuffle(arr: any[]): any[];

	/** 🛠
	 * Stores an item in localStorage.
	 * @param {string} key key under which to store the item
	 * @param {string} val value to store
	 */
	function storeItem(key: string, val: string): void;

	/** 🛠
	 * Retrieves an item from localStorage.
	 * @param {string} key key of the item to retrieve
	 * @returns {string} value of the retrieved item
	 */
	function getItem(key: string): string;

	/** 🛠
	 * Removes an item from localStorage.
	 * @param {string} key key of the item to remove
	 */
	function removeItem(key: string): void;

	/** 🛠
	 * Clears all items from localStorage.
	 */
	function clearStorage(): void;

	/** 🛠
	 * Returns the current year.
	 * @returns {number} current year
	 */
	function year(): number;

	/** 🛠
	 * Returns the current day of the month.
	 * @returns {number} current day
	 */
	function day(): number;

	/** 🛠
	 * Returns the current hour.
	 * @returns {number} current hour
	 */
	function hour(): number;

	/** 🛠
	 * Returns the current minute.
	 * @returns {number} current minute
	 */
	function minute(): number;

	/** 🛠
	 * Returns the current second.
	 * @returns {number} current second
	 */
	function second(): number;

	// ↗ vector

	class Vector {

		/** ↗
		 * Constructs a new Vector object.
		 * @param {number} x x component of the vector
		 * @param {number} y y component of the vector
		 * @param {number} [z] optional. The z component of the vector
		 * @example
		 * await Canvas(200);
		 * background(0.8);
		 * 
		 * let v = createVector(0, 0);
		 * circle(v.x, v.y, 50);
		 */
		constructor(x: number, y: number, z?: number);

		/** ↗
		 * The x component of the vector.
		 */
		x: number;

		/** ↗
		 * The y component of the vector.
		 */
		y: number;

		/** ↗
		 * The z component of the vector, if applicable.
		 */
		z: number;

		/** ↗
		 * Adds a vector to this vector.
		 * @param {Vector} v vector to add
		 * @returns {Vector} resulting vector after addition
		 */
		add(v: Vector): Vector;

		/** ↗
		 * Subtracts a vector from this vector.
		 * @param {Vector} v vector to subtract
		 * @returns {Vector} resulting vector after subtraction
		 */
		sub(v: Vector): Vector;

		/** ↗
		 * Multiplies this vector by a scalar or element-wise by another vector.
		 * @param {number | Vector} n scalar to multiply by, or a vector for element-wise multiplication
		 * @returns {Vector} resulting vector after multiplication
		 */
		mult(n: number | Vector): Vector;

		/** ↗
		 * Divides this vector by a scalar or element-wise by another vector.
		 * @param {number | Vector} n scalar to divide by, or a vector for element-wise division
		 * @returns {Vector} resulting vector after division
		 */
		div(n: number | Vector): Vector;

		/** ↗
		 * Calculates the magnitude (length) of the vector.
		 * @returns {number} magnitude of the vector
		 */
		mag(): number;

		/** ↗
		 * Normalizes the vector to a length of 1 (making it a unit vector).
		 * @returns {Vector} this vector after normalization
		 */
		normalize(): Vector;

		/** ↗
		 * Sets the magnitude of the vector to the specified length.
		 * @param {number} len new length of the vector
		 * @returns {Vector} this vector after setting magnitude
		 */
		setMag(len: number): Vector;

		/** ↗
		 * Calculates the dot product of this vector and another vector.
		 * @param {Vector} v other vector
		 * @returns {number} dot product
		 */
		dot(v: Vector): number;

		/** ↗
		 * Calculates the cross product of this vector and another vector.
		 * @param {Vector} v other vector
		 * @returns {Vector} a new vector that is the cross product of this vector and the given vector
		 */
		cross(v: Vector): Vector;

		/** ↗
		 * Calculates the distance between this vector and another vector.
		 * @param {Vector} v other vector
		 * @returns {number} distance
		 */
		dist(v: Vector): number;

		/** ↗
		 * Copies this vector.
		 * @returns {Vector} a new vector with the same components as this one
		 */
		copy(): Vector;

		/** ↗
		 * Sets the components of the vector.
		 * @param {number} x x component
		 * @param {number} y y component
		 * @param {number} [z] optional. The z component
		 * @returns {void}
		 */
		set(x: number, y: number, z?: number): void;

		/** ↗
		 * Limits the magnitude of the vector to the value used for the max parameter.
		 * @param {number} max maximum magnitude for the vector
		 * @returns {Vector} this vector after limiting
		 */
		limit(max: number): Vector;

		/** ↗
		 * Calculates the angle of rotation for this vector (only 2D vectors).
		 * @returns {number} angle of rotation
		 */
		heading(): number;

		/** ↗
		 * Rotates the vector to a specific angle without changing its magnitude.
		 * @param {number} angle angle in radians
		 * @returns {Vector} this vector after setting the heading
		 */
		setHeading(angle: number): Vector;

		/** ↗
		 * Rotates the vector by the given angle (only 2D vectors).
		 * @param {number} angle angle of rotation in radians
		 * @returns {Vector} this vector after rotation
		 */
		rotate(angle: number): Vector;

		/** ↗
		 * Linearly interpolates between this vector and another vector.
		 * @param {Vector} v vector to interpolate towards
		 * @param {number} amt amount of interpolation; a number between 0.0 (close to the current vector) and 1.0 (close to the target vector)
		 * @returns {Vector} this vector after interpolation
		 */
		lerp(v: Vector, amt: number): Vector;

		/** ↗
		 * Linearly interpolates between this vector and another vector, including the magnitude.
		 * @param {Vector} v vector to interpolate towards
		 * @param {number} amt amount of interpolation; a number between 0.0 (close to the current vector) and 1.0 (close to the target vector)
		 * @returns {Vector} this vector after spherical interpolation
		 */
		slerp(v: Vector, amt: number): Vector;
		static fromAngle(angle: number, length?: number): Vector;

	}

	// 🖌 shaping

	/** 🖌
	 * Draws an arc, which is a section of an ellipse.
	 * 
	 * `ellipseMode` affects how the arc is drawn.
	 * 
	 * q5 WebGPU only supports the default `PIE_OPEN` mode.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 * @param {number} w width of the ellipse
	 * @param {number} h height of the ellipse
	 * @param {number} start angle to start the arc
	 * @param {number} stop angle to stop the arc
	 * @param {number} [mode] shape and stroke style setting, default is `PIE_OPEN` for a pie shape with an unclosed stroke, can be `PIE`, `CHORD`, or `CHORD_OPEN`
	 * @example
	 * await Canvas(200);
	 * background(0.8);
	 * 
	 * arc(0, 0, 160, 160, 0.8, -0.8);
	 */
	function arc(x: number, y: number, w: number, h: number, start: number, stop: number, mode?: number): void;

	/** 🖌
	 * Draws a curve.
	 * @example
	 * await Canvas(200, 100);
	 * background(0.8);
	 * 
	 * curve(-100, -200, -50, 0, 50, 0, 100, -200);
	 */
	function curve(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	/** 🖌
	 * Sets the amount of straight line segments used to make a curve.
	 * 
	 * Only takes effect in q5 WebGPU.
	 * @param {number} val curve detail level, default is 20
	 * @example
	 * await Canvas(200);
	 * 
	 * curveDetail(4);
	 * 
	 * strokeWeight(10);
	 * stroke(0, 1, 1);
	 * curve(-100, -200, -50, 0, 50, 0, 100, -200);
	 */
	function curveDetail(val: number): void;

	/** 🖌
	 * Starts storing vertices for a convex shape.
	 */
	function beginShape(): void;

	/** 🖌
	 * Ends storing vertices for a convex shape.
	 */
	function endShape(): void;

	/** 🖌
	 * Starts storing vertices for a contour.
	 * 
	 * Not available in q5 WebGPU.
	 */
	function beginContour(): void;

	/** 🖌
	 * Ends storing vertices for a contour.
	 * 
	 * Not available in q5 WebGPU.
	 */
	function endContour(): void;

	/** 🖌
	 * Specifies a vertex in a shape.
	 * @param {number} x x-coordinate
	 * @param {number} y y-coordinate
	 */
	function vertex(x: number, y: number): void;

	/** 🖌
	 * Specifies a Bezier vertex in a shape.
	 * @param {number} cp1x x-coordinate of the first control point
	 * @param {number} cp1y y-coordinate of the first control point
	 * @param {number} cp2x x-coordinate of the second control point
	 * @param {number} cp2y y-coordinate of the second control point
	 * @param {number} x x-coordinate of the anchor point
	 * @param {number} y y-coordinate of the anchor point
	 */
	function bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

	/** 🖌
	 * Specifies a quadratic Bezier vertex in a shape.
	 * @param {number} cp1x x-coordinate of the control point
	 * @param {number} cp1y y-coordinate of the control point
	 * @param {number} x x-coordinate of the anchor point
	 * @param {number} y y-coordinate of the anchor point
	 */
	function quadraticVertex(cp1x: number, cp1y: number, x: number, y: number): void;

	/** 🖌
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

	/** 🖌
	 * Draws a triangle.
	 * @param {number} x1 x-coordinate of the first vertex
	 * @param {number} y1 y-coordinate of the first vertex
	 * @param {number} x2 x-coordinate of the second vertex
	 * @param {number} y2 y-coordinate of the second vertex
	 * @param {number} x3 x-coordinate of the third vertex
	 * @param {number} y3 y-coordinate of the third vertex
	 */
	function triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

	/** 🖌
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

	// ⚡ shaders

	/**
	 * Custom shaders written in WGSL (WebGPU Shading Language) can be
	 * used to create advanced visual effects in q5!
	 */

	/** ⚡
	 * Creates a shader that q5 can use to draw shapes.
	 * 
	 * Affects the following functions:
	 * `triangle`, `quad`, `plane`,
	 * `curve`, `bezier`, `beginShape`/`endShape`,
	 * and `background` (unless an image is used).
	 * 
	 * Use this function to customize a copy of the
	 * [default shapes shader](https://github.com/q5js/q5.js/blob/main/src/shaders/shapes.wgsl).
	 * 
	 * For more information on the vertex and fragment function
	 * input parameters, data, and helper functions made available for use
	 * in your custom shader code, read the
	 * ["Custom Shaders in q5 WebGPU"](https://github.com/q5js/q5.js/wiki/Custom-Shaders-in-q5-WebGPU)
	 * wiki page.
	 * @param {string} code WGSL shader code excerpt
	 * @returns {GPUShaderModule} a shader program
	 * @example
	 * await Canvas(200);
	 * 
	 * let wobble = createShader(`
	 * @vertex
	 * fn vertexMain(v: VertexParams) -> FragParams {
	 * 	var vert = transformVertex(v.pos, v.matrixIndex);
	 * 
	 *   let i = f32(v.vertexIndex) % 4 * 100;
	 *   vert.x += cos((q.time + i) * 0.01) * 0.1;
	 * 
	 * 	var f: FragParams;
	 * 	f.position = vert;
	 * 	f.color = vec4f(1, 0, 0, 1);
	 * 	return f;
	 * }`);
	 * 
	 * q5.draw = function () {
	 * 	clear();
	 * 	shader(wobble);
	 * 	plane(0, 0, 100);
	 * };
	 * @example
	 * await Canvas(200);
	 * 
	 * let stripes = createShader(`
	 * @fragment
	 * fn fragMain(f: FragParams) -> @location(0) vec4f {
	 * 	let r = cos((q.mouseY + f.position.y) * 0.2);
	 * 	return vec4(r, 0.0, 1, 1);
	 * }`);
	 * 
	 * q5.draw = function () {
	 * 	shader(stripes);
	 * 	triangle(-50, -50, 0, 50, 50, -50);
	 * };
	 */
	function createShader(code: string): GPUShaderModule;

	/** ⚡
	 * A plane is a centered rectangle with no stroke.
	 * @param {number} x center x
	 * @param {number} y center y
	 * @param {number} w width or side length
	 * @param {number} [h] height
	 * @example
	 * await Canvas(200);
	 * plane(0, 0, 100);
	 */
	function plane(x: number, y: number, w: number, h?: number): void;

	/** ⚡
	 * Applies a shader.
	 * @param {GPUShaderModule} shaderModule a shader program
	 */
	function shader(shaderModule: GPUShaderModule): void;

	/** ⚡
	 * Make q5 use the default shapes shader.
	 * @example
	 * await Canvas(200);
	 * 
	 * let stripes = createShader(`
	 * @fragment
	 * fn fragMain(f: FragParams) -> @location(0) vec4f {
	 * 	let g = cos((q.mouseY + f.position.y) * 0.05);
	 * 	return vec4(1, g, 0, 1);
	 * }`);
	 * 
	 * q5.draw = function () {
	 * 	shader(stripes);
	 * 	background(0);
	 * 
	 * 	resetShader();
	 * 	triangle(-50, -50, 0, 50, 50, -50);
	 * };
	 */
	function resetShader(): void;

	/** ⚡
	 * Make q5 use the default frame shader.
	 */
	function resetFrameShader(): void;

	/** ⚡
	 * Make q5 use the default image shader.
	 */
	function resetImageShader(): void;

	/** ⚡
	 * Make q5 use the default video shader.
	 */
	function resetVideoShader(): void;

	/** ⚡
	 * Make q5 use the default text shader.
	 */
	function resetTextShader(): void;

	/** ⚡
	 * Make q5 use all default shaders.
	 */
	function resetShaders(): void;

	/** ⚡
	 * Creates a shader that q5 can use to draw frames.
	 * 
	 * You must create a canvas before using this function.
	 * 
	 * Use this function to customize a copy of the
	 * [default frame shader](https://github.com/q5js/q5.js/blob/main/src/shaders/frame.wgsl).
	 * @example
	 * await Canvas(200);
	 * 
	 * let boxy = createFrameShader(`
	 * @fragment
	 * fn fragMain(f: FragParams) -> @location(0) vec4f {
	 * 	let x = sin(f.texCoord.y * 4 + q.time * 0.002);
	 * 	let y = cos(f.texCoord.x * 4 + q.time * 0.002);
	 * 	let uv = f.texCoord + vec2f(x, y);
	 * 	return textureSample(tex, samp, uv);
	 * }`);
	 * 
	 * q5.draw = function () {
	 * 	stroke(1);
	 * 	strokeWeight(8);
	 * 	line(mouseX, mouseY, pmouseX, pmouseY);
	 * 	mouseIsPressed ? resetShaders() : shader(boxy);
	 * };
	 */
	function createFrameShader(code: string): GPUShaderModule;

	/** ⚡
	 * Creates a shader that q5 can use to draw images.
	 * 
	 * Use this function to customize a copy of the
	 * [default image shader](https://github.com/q5js/q5.js/blob/main/src/shaders/image.wgsl).
	 * @param {string} code WGSL shader code excerpt
	 * @returns {GPUShaderModule} a shader program
	 * @example
	 * await Canvas(200);
	 * imageMode(CENTER);
	 * 
	 * let logo = loadImage('/q5js_logo.avif');
	 * 
	 * let grate = createImageShader(`
	 * @fragment
	 * fn fragMain(f: FragParams) -> @location(0) vec4f {
	 * 	var texColor = textureSample(tex, samp, f.texCoord);
	 * 	texColor.b += (q.mouseX + f.position.x) % 20 / 10;
	 * 	return texColor;
	 * }`);
	 * 
	 * q5.draw = function () {
	 * 	background(0.7);
	 * 	shader(grate);
	 * 	image(logo, 0, 0, 180, 180);
	 * };
	 */
	function createImageShader(code: string): GPUShaderModule;

	/** ⚡
	 * Creates a shader that q5 can use to draw video frames.
	 * 
	 * Use this function to customize a copy of the
	 * [default video shader](https://github.com/q5js/q5.js/blob/main/src/shaders/video.wgsl).
	 * @param {string} code WGSL shader code excerpt
	 * @returns {GPUShaderModule} a shader program
	 * @example
	 * await Canvas(200, 600);
	 * 
	 * let vid = createVideo('/assets/apollo4.mp4');
	 * vid.hide();
	 * 
	 * let flipper = createVideoShader(`
	 * @vertex
	 * fn vertexMain(v: VertexParams) -> FragParams {
	 * 	var vert = transformVertex(v.pos, v.matrixIndex);
	 * 
	 * 	var vi = f32(v.vertexIndex);
	 * 	vert.y *= cos((q.frameCount + vi * 10) * 0.03);
	 * 
	 * 	var f: FragParams;
	 * 	f.position = vert;
	 * 	f.texCoord = v.texCoord;
	 * 	return f;
	 * }
	 * 	
	 * @fragment
	 * fn fragMain(f: FragParams) -> @location(0) vec4f {
	 * 	var texColor =
	 * 		textureSampleBaseClampToEdge(tex, samp, f.texCoord);
	 * 	texColor.r = 0;
	 * 	texColor.b *= 2;
	 * 	return texColor;
	 * }`);
	 * 
	 * q5.draw = function () {
	 * 	clear();
	 * 	if (mouseIsPressed) vid.play();
	 * 	shader(flipper);
	 * 	image(vid, -100, 150, 200, 150);
	 * };
	 */
	function createVideoShader(code: string): GPUShaderModule;

	/** ⚡
	 * Creates a shader that q5 can use to draw text.
	 * 
	 * Use this function to customize a copy of the
	 * [default text shader](https://github.com/q5js/q5.js/blob/main/src/shaders/text.wgsl).
	 * @param {string} code WGSL shader code excerpt
	 * @returns {GPUShaderModule} a shader program
	 * @example
	 * await Canvas(200);
	 * textAlign(CENTER, CENTER);
	 * 
	 * let spin = createTextShader(`
	 * @vertex
	 * fn vertexMain(v : VertexParams) -> FragParams {
	 * 	let char = textChars[v.instanceIndex];
	 * 	let text = textMetadata[i32(char.w)];
	 * 	let fontChar = fontChars[i32(char.z)];
	 * 	let pos = calcPos(v.vertexIndex, char, fontChar, text);
	 * 
	 * 	var vert = transformVertex(pos, text.matrixIndex);
	 * 
	 * 	let i = f32(v.instanceIndex + 1);
	 * 	vert.y *= cos((q.frameCount - 5 * i) * 0.05);
	 * 
	 * 	var f : FragParams;
	 * 	f.position = vert;
	 * 	f.texCoord = calcUV(v.vertexIndex, fontChar);
	 * 	f.fillColor = colors[i32(text.fillIndex)];
	 * 	f.strokeColor = colors[i32(text.strokeIndex)];
	 * 	f.strokeWeight = text.strokeWeight;
	 * 	f.edge = text.edge;
	 * 	return f;
	 * }`);
	 * 
	 * q5.draw = function () {
	 * 	clear();
	 * 	shader(spin);
	 * 	fill(1, 0, 1);
	 * 	textSize(32);
	 * 	text('Hello, World!', 0, 0);
	 * };
	 */
	function createTextShader(code: string): GPUShaderModule;

	// ⚙ advanced

	/** ⚙
	 * Alias for `Q5`.
	 */
	const q5: typeof Q5;

	class Q5 {

		/** ⚙
		 * Creates an [instance](https://github.com/q5js/q5.js/wiki/Instance-Mode) of Q5.
		 * 
		 * Used by the global `Canvas` function.
		 * @param {string | Function} [scope]
		 * @param {HTMLElement} [parent] element that the canvas will be placed inside
		 */
		constructor(scope?: string | Function, parent?: HTMLElement);

		/** ⚙
		 * The current minor version of q5.
		 * @returns {string} the q5 version
		 * @example
		 * await Canvas(200);
		 * background(0.8);
		 * textSize(64);
		 * textAlign(CENTER, CENTER);
		 * text('v' + Q5.version, 0, 0);
		 */
		static version: string;

		/** ⚙
		 * Set to a language code other than 'en' (English) to use q5 in an additional language.
		 * 
		 * Currently supported languages:
		 * 
		 * - 'es' (Spanish)
		 */
		static lang: string;

		/** ⚙
		 * Turn off q5's friendly error messages.
		 */
		static disableFriendlyErrors: boolean;

		/** ⚙
		 * Set to true to keep draw looping after an error.
		 */
		static errorTolerant: boolean;

		/** ⚙
		 * True if the device supports HDR (the display-p3 colorspace).
		 */
		static supportsHDR: boolean;

		/** ⚙
		 * Sets the default canvas context attributes used for newly created
		 * canvases and internal graphics. These options are overwritten by any
		 * per-canvas options you pass to `Canvas`.
		 */
		static canvasOptions: object;

		/** ⚙
		 * A WebGPU memory allocation limit.
		 * 
		 * The maximum number of transformation matrixes
		 * that can be used in a single draw call.
		 */
		static MAX_TRANSFORMS: number;

		/** ⚙
		 * A WebGPU memory allocation limit.
		 * 
		 * The maximum number of rectangles
		 * (calls to `rect`, `square`, `capsule`)
		 * that can be drawn in a single draw call.
		 */
		static MAX_RECTS: number;

		/** ⚙
		 * A WebGPU memory allocation limit.
		 * 
		 * The maximum number of ellipses
		 * (calls to `ellipse`, `circle`, and `arc`)
		 * that can be drawn in a single draw call.
		 */
		static MAX_ELLIPSES: number;

		/** ⚙
		 * A WebGPU memory allocation limit.
		 * 
		 * The maximum number of text characters
		 * that can be drawn in a single draw call.
		 */
		static MAX_CHARS: number;

		/** ⚙
		 * A WebGPU memory allocation limit.
		 * 
		 * The maximum number of separate calls to `text`
		 * that can be drawn in a single draw call.
		 */
		static MAX_TEXTS: number;

		/** ⚙
		 * Creates a new Q5 instance that uses [q5's WebGPU renderer](https://github.com/q5js/q5.js/wiki/q5-WebGPU-renderer).
		 * @example
		 * let q = await Q5.WebGPU('namespace');
		 * q.Canvas(200, 100);
		 * 
		 * q.draw = () => {
		 * 	q.background(0.8);
		 * 	q.circle(q.mouseX, 0, 80);
		 * };
		 */
		static WebGPU(): Q5;

		/** ⚙
		 * Addons can augment q5 with new functionality by adding hooks,
		 * functions to be run at specific phases in the q5 lifecycle.
		 * 
		 * Inside the function, `this` refers to the Q5 instance.
		 * @param {string} lifecycle 'init', 'presetup', 'postsetup', 'predraw', 'postdraw', or 'remove'
		 * @param {Function} fn The function to be run at the specified lifecycle phase.
		 * @example
		 * Q5.addHook('predraw', function () {
		 * 	this.background('cyan');
		 * });
		 * 
		 * q5.draw = function () {
		 * 	circle(mouseX, mouseY, 80);
		 * };
		 */
		static addHook(lifecycle: string, fn: Function): void;

		/** ⚙
		 * p5.js v2 compatible way to register an addon with q5.
		 * @param {Function} addon A function that receives `Q5`, `Q5.prototype`, and a `lifecycles` object.
		 */
		static registerAddon(addon: Function): void;

		/** ⚙
		 * An object containing q5's modules, functions that run when q5 loads.
		 * 
		 * Each function receives two input parameters:
		 * 
		 * - the q5 instance
		 * - a proxy for editing the q5 instance and corresponding properties of the global scope
		 */
		static modules: object;

		/** ⚙
		 * The q5 draw function is run 60 times per second by default.
		 */
		draw(): void;

		/** ⚙
		 * Runs after each `draw` function call and post-draw q5 addon processes, if any.
		 * 
		 * Useful for adding post-processing effects when it's not possible
		 * to do so at the end of the `draw` function, such as when using
		 * addons like p5play that auto-draw to the canvas after the `draw`
		 * function is run.
		 */
		postProcess(): void;
		update(): void; //-

		drawFrame(): void; //-

		static Image: {
			new (w: number, h: number, opt?: any): Q5.Image;
			};

	}

	namespace Q5 {
		interface Image {
			width: number;
			height: number;
		}
	}

}

export {};
