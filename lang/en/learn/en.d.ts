declare global {
	// ⭐️ core

	function draw(): void;

	function setup(): void;

	function preload(): void;

	var frameCount: number;

	function noLoop(): void;

	function redraw(n?: number): void;

	function loop(): void;

	function frameRate(hertz?: number): number;

	function getTargetFrameRate(): number;

	function getFPS(): number;

	function log(message: any): void;

	function postProcess(): void;

	var windowWidth: number;

	var windowHeight: number;

	var deltaTime: number;

	function usePromiseLoading(val?: boolean): void;

	class Q5 {
		constructor(scope?: string | Function, parent?: HTMLElement);

		static disableFriendlyErrors: boolean;

		static canvasOptions: {};

		static supportsHDR: boolean;

		static errorTolerant: boolean;

		static MAX_RECTS: number;

		static MAX_ELLIPSES: number;

		static modules: {};

		static Image: {
			new (w: number, h: number, opt?: any): Q5.Image;
		};

		static WebGPU(): Q5;

		static registerAddon(addon: Function): void; //-

		draw(): void; //-

		setup(): void; //-

		preload(): void; //-

		postProcess(): void; //-
	}

	namespace Q5 {
		interface Image {
			width: number; //-
			height: number; //-
		}
	}

	// ⬜️ canvas

	function createCanvas(w?: number, h?: number, options?: CanvasRenderingContext2DSettings): HTMLCanvasElement;

	var canvas: HTMLCanvasElement;

	function clear(): void;

	function fill(color: Color): void;

	function stroke(color: Color): void;

	function noFill(): void;

	function noStroke(): void;

	function strokeWeight(weight: number): void;

	function opacity(alpha: number): void;

	function shadow(color: string | Color): void;

	function noShadow(): void;

	function shadowBox(offsetX: number, offsetY: number, blur: number): void;

	var width: number;

	var height: number;

	var halfWidth: number;

	var halfHeight: number;

	function translate(x: number, y: number): void;

	function rotate(angle: number): void;

	function scale(x: number, y?: number): void;

	function shearX(angle: number): void;

	function shearY(angle: number): void;

	function applyMatrix(a: number, b: number, c: number, d: number, e: number, f: number): void;

	function resetMatrix(): void;

	function pushMatrix(): void;

	function popMatrix(): void;

	function pushStyles(): void;

	function popStyles(): void;

	function push(): void;

	function pop(): void;

	function resizeCanvas(w: number, h: number): void;

	function pixelDensity(v: number): number;

	function displayDensity(): number;

	function createGraphics(w: number, h: number, opt?: any): Q5;

	var ctx: CanvasRenderingContext2D;

	var drawingContext: CanvasRenderingContext2D;

	// 🎨 color

	function color(c0: string | number | Color | number[], c1?: number, c2?: number, c3?: number): Color;

	function colorMode(mode: 'rgb' | 'oklch', format: 1 | 255, gamut: 'srgb' | 'display-p3'): void;

	const RGB: 'rgb';

	const OKLCH: 'oklch';

	const HSL: 'hsl';

	const HSB: 'hsb';

	const SRGB: 'srgb';

	const DISPLAY_P3: 'display-p3';

	class Color {
		constructor(c0: number, c1: number, c2: number, c3: number);

		equals(other: Color): boolean;

		isSameColor(other: Color): boolean;

		toString(): string;

		levels: number[];
	}

	// 💻 display

	function displayMode(mode: string, renderQuality: string, scale: string | number): void;

	function fullscreen(v?: boolean): void;

	const MAXED: 'maxed';

	const SMOOTH: 'smooth';

	const PIXELATED: 'pixelated';

	// 🧑‍🎨 shapes

	function background(filler: Color | Q5.Image): void;

	function rect(x: number, y: number, w: number, h?: number, tl?: number, tr?: number, br?: number, bl?: number): void;

	function square(x: number, y: number, size: number, tl?: number, tr?: number, br?: number, bl?: number): void;

	function circle(x: number, y: number, diameter: number): void;

	function ellipse(x: number, y: number, width: number, height?: number): void;

	function arc(x: number, y: number, w: number, h: number, start: number, stop: number, mode?: number): void;

	function line(x1: number, y1: number, x2: number, y2: number): void;

	function capsule(x1: number, y1: number, x2: number, y2: number, r: number): void;

	function point(x: number, y: number): void;

	function blendMode(val: string): void;

	function strokeCap(val: CanvasLineCap): void;

	function strokeJoin(val: CanvasLineJoin): void;

	function rectMode(mode: string): void;

	function ellipseMode(mode: string): void;

	function curve(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	function curveDetail(val: number): void;

	function beginShape(): void;

	function endShape(): void;

	function beginContour(): void;

	function endContour(): void;

	function vertex(x: number, y: number): void;

	function bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

	function quadraticVertex(cp1x: number, cp1y: number, x: number, y: number): void;

	function bezier(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	function triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

	function quad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	function erase(fillAlpha?: number, strokeAlpha?: number): void;

	function noErase(): void;

	function inFill(x: number, y: number): boolean;

	function inStroke(x: number, y: number): boolean;

	const CORNER: 'corner';

	const RADIUS: 'radius';

	const CORNERS: 'corners';

	// 🌆 image

	function loadImage(url: string): Q5.Image | Promise<Q5.Image>;

	function image(
		img: Q5.Image | HTMLVideoElement,
		dx: number,
		dy: number,
		dw?: number,
		dh?: number,
		sx?: number,
		sy?: number,
		sw?: number,
		sh?: number
	): void;

	function imageMode(mode: string): void;

	function defaultImageScale(scale: number): number;

	function resize(w: number, h: number): void;

	function trim(): Q5.Image;

	function smooth(): void;

	function noSmooth(): void;

	function tint(color: string | number): void;

	function noTint(): void;

	function mask(img: Q5.Image): void;

	function copy(): Q5.Image;

	function inset(sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;

	function get(x: number, y: number, w?: number, h?: number): Q5.Image | number[];

	function set(x: number, y: number, val: any): void;

	var pixels: number[];

	function loadPixels(): void;

	function updatePixels(): void;

	function filter(type: string, value?: number): void;

	const THRESHOLD: 1;

	const GRAY: 2;

	const OPAQUE: 3;

	const INVERT: 4;

	const POSTERIZE: 5;

	const DILATE: 6;

	const ERODE: 7;

	const BLUR: 8;

	function createImage(w: number, h: number, opt?: any): Q5.Image;

	// ✍️ text

	function text(str: string, x: number, y: number, wrapWidth?: number, lineLimit?: number): void;

	function loadFont(url: string): FontFace | Promise<FontFace>;

	function textFont(fontName: string): void;

	function textSize(size?: number): number | void;

	function textLeading(leading?: number): number | void;

	function textStyle(style: 'normal' | 'italic' | 'bold' | 'bolditalic'): void;

	function textAlign(horiz: 'left' | 'center' | 'right', vert?: 'top' | 'middle' | 'bottom' | 'alphabetic'): void;

	function textWeight(weight: number | string): void;

	function textWidth(str: string): number;

	function textAscent(str: string): number;

	function textDescent(str: string): number;

	function createTextImage(str: string, wrapWidth: number, lineLimit: number): Q5.Image;

	function textImage(img: Q5.Image | String, x: number, y: number): void;

	function nf(n: number, l: number, r: number): string;

	const NORMAL: 'normal';

	const ITALIC: 'italic';

	const BOLD: 'bold';

	const BOLDITALIC: 'italic bold';

	const LEFT: 'left';

	const CENTER: 'center';

	const RIGHT: 'right';

	const TOP: 'top';

	const BOTTOM: 'bottom';

	const BASELINE: 'alphabetic';

	// 🖲️ input

	let mouseX: number;

	let mouseY: number;

	let pmouseX: number;

	let pmouseY: number;

	let mouseButton: string;

	let mouseIsPressed: boolean;

	function mousePressed(): void;

	function mouseReleased(): void;

	function mouseMoved(): void;

	function mouseDragged(): void;

	function doubleClicked(): void;

	let key: string;

	let keyIsPressed: boolean;

	function keyIsDown(key: string): boolean;

	function keyPressed(): void;

	function keyReleased(): void;

	let touches: any[];

	function touchStarted(): void;

	function touchEnded(): void;

	function touchMoved(): void;

	let pointers: {};

	function cursor(name: string, x?: number, y?: number): void;

	function noCursor(): void;

	function mouseWheel(event: any): void;

	function pointerLock(unadjustedMovement: boolean): void;

	// 🧮 math

	function random(low?: number | any[], high?: number): number | any;

	function jit(amount: number): number;

	function noise(x?: number, y?: number, z?: number): number;

	function dist(x1: number, y1: number, x2: number, y2: number): number;

	function map(val: number, start1: number, stop1: number, start2: number, stop2: number): number;

	function angleMode(mode: 'degrees' | 'radians'): void;

	function radians(degrees: number): number;

	function degrees(radians: number): number;

	function lerp(start: number, stop: number, amt: number): number;

	function constrain(n: number, low: number, high: number): number;

	function norm(n: number, start: number, stop: number): number;

	function fract(n: number): number;

	function abs(n: number): number;

	function round(n: number, d: number): number;

	function ceil(n: number): number;

	function floor(n: number): number;

	function min(...args: number[]): number;

	function max(...args: number[]): number;

	function pow(base: number, exponent: number): number;

	function sq(n: number): number;

	function sqrt(n: number): number;

	function loge(n: number): number;

	function exp(exponent: number): number;

	function randomSeed(seed: number): void;

	function randomGenerator(method: any): void;

	function randomGaussian(mean: number, std: number): number;

	function randomExponential(): number;

	function noiseMode(mode: 'perlin' | 'simplex' | 'blocky'): void;

	function noiseSeed(seed: number): void;

	function noiseDetail(lod: number, falloff: number): void;

	const PI: number;

	const TWO_PI: number;

	const TAU: number;

	const HALF_PI: number;

	const QUARTER_PI: number;

	// 🔊 sound


	function loadSound(url: string): Sound | Promise<Sound>;

	function loadAudio(url: string): HTMLAudioElement | Promise<HTMLAudioElement>;

	function getAudioContext(): AudioContext | void;

	function userStartAudio(): Promise<void>;

	class Sound {
		constructor();

		volume: number;

		pan: number;

		loop: boolean;

		loaded: boolean;

		paused: boolean;

		ended: boolean;

		play(): void;

		pause(): void;

		stop(): void;
	}

	// 📑 dom

	function createElement(tag: string, content?: string): HTMLElement;

	function createA(href: string, text?: string): HTMLAnchorElement;

	function createButton(content?: string): HTMLButtonElement;

	function createCheckbox(label?: string, checked?: boolean): HTMLInputElement;

	function createColorPicker(value?: string): HTMLInputElement;

	function createImg(src: string): HTMLImageElement;

	function createInput(value?: string, type?: string): HTMLInputElement;

	function createP(content?: string): HTMLParagraphElement;

	function createRadio(groupName?: string): HTMLDivElement;

	function createSelect(placeholder?: string): HTMLSelectElement;

	function createSlider(min: number, max: number, value?: number, step?: number): HTMLInputElement;

	function createVideo(src: string): HTMLVideoElement | Promise<HTMLVideoElement>;

	function createCapture(type?: string, flipped?: boolean): HTMLVideoElement | Promise<HTMLVideoElement>;

	function findElement(selector: string): HTMLElement;

	function findElements(selector: string): HTMLElement[];

	// 🎞️ record

	function createRecorder(): HTMLElement;

	function record(): void;

	function pauseRecording(): void;

	function deleteRecording(): void;

	function saveRecording(fileName: string): void;

	var recording: boolean;

	// 🛠️ utilities

	function load(...urls: string[]): Promise<any[]>;

	function save(data?: object, fileName?: string): void;

	function loadText(url: string): object | Promise<object>;

	function loadJSON(url: string): any | Promise<any>;

	function loadCSV(url: string): object[] | Promise<object[]>;

	function loadXML(url: string): object | Promise<Element>;

	function nf(num: number, digits: number): string;

	function shuffle(arr: any[]): any[];

	function storeItem(key: string, val: string): void;

	function getItem(key: string): string;

	function removeItem(key: string): void;

	function clearStorage(): void;

	function year(): number;

	function day(): number;

	function hour(): number;

	function minute(): number;

	function second(): number;

	// ↗️ vector

	class Vector {
		constructor(x: number, y: number, z?: number);

		x: number;

		y: number;

		z: number;

		add(v: Vector): Vector;

		sub(v: Vector): Vector;

		mult(n: number | Vector): Vector;

		div(n: number | Vector): Vector;

		mag(): number;

		normalize(): Vector;

		setMag(len: number): Vector;

		dot(v: Vector): number;

		cross(v: Vector): Vector;

		dist(v: Vector): number;

		copy(): Vector;

		set(x: number, y: number, z?: number): void;

		limit(max: number): Vector;

		heading(): number;

		setHeading(angle: number): Vector;

		rotate(angle: number): Vector;

		lerp(v: Vector, amt: number): Vector;

		slerp(v: Vector, amt: number): Vector;

		static fromAngle(angle: number, length?: number): Vector;
	}

	// ⚡️ shaders

	function createShader(code: string): GPUShaderModule;

	function plane(x: number, y: number, w: number, h?: number): void;

	function shader(shaderModule: GPUShaderModule): void;

	function resetShader(): void;

	function resetFrameShader(): void;

	function resetImageShader(): void;

	function resetVideoShader(): void;

	function resetTextShader(): void;

	function resetShaders(): void;

	function createFrameShader(code: string): GPUShaderModule;

	function createImageShader(code: string): GPUShaderModule;

	function createVideoShader(code: string): GPUShaderModule;

	function createTextShader(code: string): GPUShaderModule;
}

export {};
