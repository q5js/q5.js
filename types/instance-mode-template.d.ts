declare class Q5 {
  /** ⭐️
	 * Creates an instance of Q5.
	 *
	 * Running `new Q5()` starts q5 in top-level global mode,
	 * enabling use of q5 functions and variables on the file level,
	 * outside of `setup` and `draw`. You can also start Q5 in this mode
	 * by running [`createCanvas`](https://q5js.org/learn/#createCanvas)
	 * on the file level.
	 *
	 * If you don't create a new instance of Q5, an
	 * instance will be created automatically, replicating
	 * p5's limited global mode. p5's instance mode is supported by
	 * this constructor as well but its use is deprecated, use
	 * [q5's namespaced instance mode](https://github.com/q5js/q5.js/wiki/Instance-Mode) instead.
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
   * Set to true to keep draw looping after an error. False by default.
   */
  static errorTolerant: boolean;

  /** ⭐️
   * The maximum number of rectangles that can be drawn in a single
   * draw call.
   * @default 200200
   */
  static MAX_RECTS: number;

  /** ⭐️
   * The maximum number of ellipses that can be drawn in a single
   * draw call.
   * @default 200200
   */
  static MAX_ELLIPSES: number;

  /** ⭐️
   * Modules added to this object will be added to new Q5 instances.
   */
  static modules: {};

  static Image: {
    new (w: number, h: number, opt?: any): Q5.Image;
  };

  /** ⭐️
	 * Creates a new Q5 instance that uses [q5's WebGPU renderer](https://github.com/q5js/q5.js/wiki/q5-WebGPU-renderer).
	 * @example
  let q = await Q5.WebGPU();

  q.draw = () => {
	background(0.8);
	circle(mouseX, 0, 80);
  };
	 */
  static WebGPU(): Q5;

  /** ⭐️
	 * ___Experimental! Might be changed.___
	 *
	 * Registers an addon with q5.js.
	 *
	 * Addons can augment q5 with new functionality and register
	 * functions to be executed at specific points in the q5 lifecycle:
	 * init, presetup, postsetup, predraw, postdraw, and remove.
	 *
	 * @param {Function} addon A function that receives `Q5`, `Q5.prototype`, and a `lifecycles` object.
	 * @example
  // addon.js
  Q5.registerAddon((Q5, proto, lifecycles) => {
   lifecycles.postsetup = function () {
		this.background('blue');
	};
  });

  // sketch.js
  createCanvas(200);
	 */
  static registerAddon(addon: Function): void; //-

  // %Q5_FRAMEWORK_TYPES% (this line is replaced with typeDefs for all framework functions)
}
