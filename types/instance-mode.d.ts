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

draw: typeof draw;
setup: typeof setup;
preload: typeof preload;
frameCount: typeof frameCount;
noLoop: typeof noLoop;
redraw: typeof redraw;
loop: typeof loop;
frameRate: typeof frameRate;
getTargetFrameRate: typeof getTargetFrameRate;
getFPS: typeof getFPS;
log: typeof log;
postProcess: typeof postProcess;
windowWidth: typeof windowWidth;
windowHeight: typeof windowHeight;
deltaTime: typeof deltaTime;
usePromiseLoading: typeof usePromiseLoading;
createCanvas: typeof createCanvas;
canvas: typeof canvas;
clear: typeof clear;
fill: typeof fill;
stroke: typeof stroke;
noFill: typeof noFill;
noStroke: typeof noStroke;
strokeWeight: typeof strokeWeight;
opacity: typeof opacity;
shadow: typeof shadow;
noShadow: typeof noShadow;
shadowBox: typeof shadowBox;
width: typeof width;
height: typeof height;
halfWidth: typeof halfWidth;
halfHeight: typeof halfHeight;
translate: typeof translate;
rotate: typeof rotate;
scale: typeof scale;
shearX: typeof shearX;
shearY: typeof shearY;
applyMatrix: typeof applyMatrix;
resetMatrix: typeof resetMatrix;
pushMatrix: typeof pushMatrix;
popMatrix: typeof popMatrix;
pushStyles: typeof pushStyles;
popStyles: typeof popStyles;
push: typeof push;
pop: typeof pop;
resizeCanvas: typeof resizeCanvas;
pixelDensity: typeof pixelDensity;
displayDensity: typeof displayDensity;
createGraphics: typeof createGraphics;
ctx: typeof ctx;
drawingContext: typeof drawingContext;
color: typeof color;
colorMode: typeof colorMode;
RGB: typeof RGB;
OKLCH: typeof OKLCH;
HSL: typeof HSL;
HSB: typeof HSB;
SRGB: typeof SRGB;
DISPLAY_P3: typeof DISPLAY_P3;
Color: typeof Color;
displayMode: typeof displayMode;
fullscreen: typeof fullscreen;
MAXED: typeof MAXED;
SMOOTH: typeof SMOOTH;
PIXELATED: typeof PIXELATED;
background: typeof background;
rect: typeof rect;
square: typeof square;
circle: typeof circle;
ellipse: typeof ellipse;
arc: typeof arc;
line: typeof line;
capsule: typeof capsule;
point: typeof point;
blendMode: typeof blendMode;
strokeCap: typeof strokeCap;
strokeJoin: typeof strokeJoin;
rectMode: typeof rectMode;
ellipseMode: typeof ellipseMode;
curve: typeof curve;
curveDetail: typeof curveDetail;
beginShape: typeof beginShape;
endShape: typeof endShape;
beginContour: typeof beginContour;
endContour: typeof endContour;
vertex: typeof vertex;
bezierVertex: typeof bezierVertex;
quadraticVertex: typeof quadraticVertex;
bezier: typeof bezier;
triangle: typeof triangle;
quad: typeof quad;
erase: typeof erase;
noErase: typeof noErase;
inFill: typeof inFill;
inStroke: typeof inStroke;
CORNER: typeof CORNER;
RADIUS: typeof RADIUS;
CORNERS: typeof CORNERS;
loadImage: typeof loadImage;
image: typeof image;
imageMode: typeof imageMode;
defaultImageScale: typeof defaultImageScale;
resize: typeof resize;
trim: typeof trim;
smooth: typeof smooth;
noSmooth: typeof noSmooth;
tint: typeof tint;
noTint: typeof noTint;
mask: typeof mask;
copy: typeof copy;
inset: typeof inset;
get: typeof get;
set: typeof set;
pixels: typeof pixels;
loadPixels: typeof loadPixels;
updatePixels: typeof updatePixels;
filter: typeof filter;
THRESHOLD: typeof THRESHOLD;
GRAY: typeof GRAY;
OPAQUE: typeof OPAQUE;
INVERT: typeof INVERT;
POSTERIZE: typeof POSTERIZE;
DILATE: typeof DILATE;
ERODE: typeof ERODE;
BLUR: typeof BLUR;
createImage: typeof createImage;
text: typeof text;
loadFont: typeof loadFont;
textFont: typeof textFont;
textSize: typeof textSize;
textLeading: typeof textLeading;
textStyle: typeof textStyle;
textAlign: typeof textAlign;
textWeight: typeof textWeight;
textWidth: typeof textWidth;
textAscent: typeof textAscent;
textDescent: typeof textDescent;
createTextImage: typeof createTextImage;
textImage: typeof textImage;
nf: typeof nf;
NORMAL: typeof NORMAL;
ITALIC: typeof ITALIC;
BOLD: typeof BOLD;
BOLDITALIC: typeof BOLDITALIC;
LEFT: typeof LEFT;
CENTER: typeof CENTER;
RIGHT: typeof RIGHT;
TOP: typeof TOP;
BOTTOM: typeof BOTTOM;
BASELINE: typeof BASELINE;
mouseX: typeof mouseX;
mouseY: typeof mouseY;
pmouseX: typeof pmouseX;
pmouseY: typeof pmouseY;
mouseButton: typeof mouseButton;
mouseIsPressed: typeof mouseIsPressed;
mousePressed: typeof mousePressed;
mouseReleased: typeof mouseReleased;
mouseMoved: typeof mouseMoved;
mouseDragged: typeof mouseDragged;
doubleClicked: typeof doubleClicked;
key: typeof key;
keyIsPressed: typeof keyIsPressed;
keyIsDown: typeof keyIsDown;
keyPressed: typeof keyPressed;
keyReleased: typeof keyReleased;
touches: typeof touches;
touchStarted: typeof touchStarted;
touchEnded: typeof touchEnded;
touchMoved: typeof touchMoved;
pointers: typeof pointers;
cursor: typeof cursor;
noCursor: typeof noCursor;
mouseWheel: typeof mouseWheel;
pointerLock: typeof pointerLock;
random: typeof random;
jit: typeof jit;
noise: typeof noise;
dist: typeof dist;
map: typeof map;
angleMode: typeof angleMode;
radians: typeof radians;
degrees: typeof degrees;
lerp: typeof lerp;
constrain: typeof constrain;
norm: typeof norm;
fract: typeof fract;
abs: typeof abs;
round: typeof round;
ceil: typeof ceil;
floor: typeof floor;
min: typeof min;
max: typeof max;
pow: typeof pow;
sq: typeof sq;
sqrt: typeof sqrt;
loge: typeof loge;
exp: typeof exp;
randomSeed: typeof randomSeed;
randomGenerator: typeof randomGenerator;
randomGaussian: typeof randomGaussian;
randomExponential: typeof randomExponential;
noiseMode: typeof noiseMode;
noiseSeed: typeof noiseSeed;
noiseDetail: typeof noiseDetail;
PI: typeof PI;
TWO_PI: typeof TWO_PI;
TAU: typeof TAU;
HALF_PI: typeof HALF_PI;
QUARTER_PI: typeof QUARTER_PI;
loadSound: typeof loadSound;
loadAudio: typeof loadAudio;
getAudioContext: typeof getAudioContext;
userStartAudio: typeof userStartAudio;
Sound: typeof Sound;
createElement: typeof createElement;
createA: typeof createA;
createButton: typeof createButton;
createCheckbox: typeof createCheckbox;
createColorPicker: typeof createColorPicker;
createImg: typeof createImg;
createInput: typeof createInput;
createP: typeof createP;
createRadio: typeof createRadio;
createSelect: typeof createSelect;
createSlider: typeof createSlider;
createVideo: typeof createVideo;
createCapture: typeof createCapture;
findElement: typeof findElement;
findElements: typeof findElements;
createRecorder: typeof createRecorder;
record: typeof record;
pauseRecording: typeof pauseRecording;
deleteRecording: typeof deleteRecording;
saveRecording: typeof saveRecording;
recording: typeof recording;
load: typeof load;
save: typeof save;
loadText: typeof loadText;
loadJSON: typeof loadJSON;
loadCSV: typeof loadCSV;
loadXML: typeof loadXML;
shuffle: typeof shuffle;
storeItem: typeof storeItem;
getItem: typeof getItem;
removeItem: typeof removeItem;
clearStorage: typeof clearStorage;
year: typeof year;
day: typeof day;
hour: typeof hour;
minute: typeof minute;
second: typeof second;
Vector: typeof Vector;
createShader: typeof createShader;
plane: typeof plane;
shader: typeof shader;
resetShader: typeof resetShader;
resetFrameShader: typeof resetFrameShader;
resetImageShader: typeof resetImageShader;
resetVideoShader: typeof resetVideoShader;
resetTextShader: typeof resetTextShader;
resetShaders: typeof resetShaders;
createFrameShader: typeof createFrameShader;
createImageShader: typeof createImageShader;
createVideoShader: typeof createVideoShader;
createTextShader: typeof createTextShader;
}
