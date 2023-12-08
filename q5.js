/**
 * q5.js
 * @version 1.9
 * @author quinton-ashley and LingDong-
 * @license GPL-3.0-only
 */

/**
 * @type {Q5}
 */
function Q5(scope, parent) {
	let preloadCnt = 0;
	if (typeof scope == 'undefined') {
		scope = 'global';
		preloadCnt++;
		setTimeout(() => preloadCnt--, 32);
	}
	if (scope == 'auto') {
		if (typeof window.setup == 'undefined') return;
		else scope = 'global';
	}
	if (arguments.length == 1 && typeof scope != 'string' && typeof scope != 'function') {
		parent = arguments[0];
		scope = null;
	}
	if (scope == 'global') Q5._hasGlobal = true;

	let $ = this;
	$.canvas = document.createElement('canvas');
	let ctx = ($._ctx = $.canvas.getContext('2d'));
	$.canvas.classList.add('p5Canvas', 'q5Canvas');
	$.canvas.id = 'defaultCanvas' + Q5._instanceCount++;

	$.width = 100;
	$.height = 100;
	$.canvas.width = $.width;
	$.canvas.height = $.height;
	$._windowResizedFn = () => {};

	if (scope != 'graphics' && scope != 'image') {
		$._setupDone = false;
		$._resize = () => {
			if ($.frameCount > 1) $._shouldResize = true;
		};
		$.canvas.parent = (el) => {
			if (typeof el == 'string') el = document.getElementById(el);
			el.append($.canvas);

			if (typeof ResizeObserver != 'undefined') {
				if ($._ro) $._ro.disconnect();
				$._ro = new ResizeObserver($._resize);
				$._ro.observe(parent);
			} else if ($.frameCount == 0) {
				addEventListener('resize', $._resize);
			}
		};
		function appendCanvas() {
			parent ??= document.getElementsByTagName('main')[0];
			if (!parent) {
				parent = document.createElement('main');
				document.body.append(parent);
			}
			$.canvas.parent(parent);
		}
		if (document.body) appendCanvas();
		else window.addEventListener('load', appendCanvas);
	}

	defaultStyle();

	$.MAGIC = 0x9a0ce55;
	$.pixels = [];
	let imgData = null;

	$.createCanvas = function (width, height) {
		$.width = width;
		$.height = height;
		$.canvas.width = width;
		$.canvas.height = height;
		defaultStyle();
		if (scope != 'image') {
			let pd = $.displayDensity();
			if (scope == 'graphics') pd = this._pixelDensity;
			$.pixelDensity(Math.ceil(pd));
		} else this._pixelDensity = 1;
		return $.canvas;
	};
	$._createCanvas = $.createCanvas;

	//================================================================
	// IMAGE
	//================================================================

	$.loadPixels = () => {
		imgData = ctx.getImageData(0, 0, $.canvas.width, $.canvas.height);
		$.pixels = imgData.data;
	};
	$.updatePixels = () => {
		if (imgData != null) ctx.putImageData(imgData, 0, 0);
	};

	let filterImpl = {};
	filterImpl[$.THRESHOLD] = (data, thresh) => {
		if (thresh === undefined) thresh = 127.5;
		else thresh *= 255;
		for (let i = 0; i < data.length; i += 4) {
			const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
			data[i] = data[i + 1] = data[i + 2] = gray >= thresh ? 255 : 0;
		}
	};
	filterImpl[$.GRAY] = (data) => {
		for (let i = 0; i < data.length; i += 4) {
			const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
			data[i] = data[i + 1] = data[i + 2] = gray;
		}
	};
	filterImpl[$.OPAQUE] = (data) => {
		for (let i = 0; i < data.length; i += 4) {
			data[i + 3] = 255;
		}
	};
	filterImpl[$.INVERT] = (data) => {
		for (let i = 0; i < data.length; i += 4) {
			data[i] = 255 - data[i];
			data[i + 1] = 255 - data[i + 1];
			data[i + 2] = 255 - data[i + 2];
		}
	};
	filterImpl[$.POSTERIZE] = (data, lvl) => {
		let lvl1 = lvl - 1;
		for (let i = 0; i < data.length; i += 4) {
			data[i] = (((data[i] * lvl) >> 8) * 255) / lvl1;
			data[i + 1] = (((data[i + 1] * lvl) >> 8) * 255) / lvl1;
			data[i + 2] = (((data[i + 2] * lvl) >> 8) * 255) / lvl1;
		}
	};

	filterImpl[$.DILATE] = (data) => {
		makeTmpBuf();
		tmpBuf.set(data);
		let [w, h] = [ctx.canvas.width, ctx.canvas.height];
		for (let i = 0; i < h; i++) {
			for (let j = 0; j < w; j++) {
				let l = 4 * Math.max(j - 1, 0);
				let r = 4 * Math.min(j + 1, w - 1);
				let t = 4 * Math.max(i - 1, 0) * w;
				let b = 4 * Math.min(i + 1, h - 1) * w;
				let oi = 4 * i * w;
				let oj = 4 * j;
				for (let k = 0; k < 4; k++) {
					let kt = k + t;
					let kb = k + b;
					let ko = k + oi;
					data[oi + oj + k] = Math.max(
						/*tmpBuf[kt+l],*/ tmpBuf[kt + oj] /*tmpBuf[kt+r],*/,
						tmpBuf[ko + l],
						tmpBuf[ko + oj],
						tmpBuf[ko + r],
						/*tmpBuf[kb+l],*/ tmpBuf[kb + oj] /*tmpBuf[kb+r],*/
					);
				}
			}
		}
	};
	filterImpl[$.ERODE] = (data) => {
		makeTmpBuf();
		tmpBuf.set(data);
		let [w, h] = [ctx.canvas.width, ctx.canvas.height];
		for (let i = 0; i < h; i++) {
			for (let j = 0; j < w; j++) {
				let l = 4 * Math.max(j - 1, 0);
				let r = 4 * Math.min(j + 1, w - 1);
				let t = 4 * Math.max(i - 1, 0) * w;
				let b = 4 * Math.min(i + 1, h - 1) * w;
				let oi = 4 * i * w;
				let oj = 4 * j;
				for (let k = 0; k < 4; k++) {
					let kt = k + t;
					let kb = k + b;
					let ko = k + oi;
					data[oi + oj + k] = Math.min(
						/*tmpBuf[kt+l],*/ tmpBuf[kt + oj] /*tmpBuf[kt+r],*/,
						tmpBuf[ko + l],
						tmpBuf[ko + oj],
						tmpBuf[ko + r],
						/*tmpBuf[kb+l],*/ tmpBuf[kb + oj] /*tmpBuf[kb+r],*/
					);
				}
			}
		}
	};

	filterImpl[$.BLUR] = (data, rad) => {
		rad = rad || 1;
		rad = Math.floor(rad * $._pixelDensity);
		makeTmpBuf();
		tmpBuf.set(data);

		let ksize = rad * 2 + 1;

		function gauss1d(ksize) {
			let im = new Float32Array(ksize);
			let sigma = 0.3 * rad + 0.8;
			let ss2 = sigma * sigma * 2;
			for (let i = 0; i < ksize; i++) {
				let x = i - ksize / 2;
				let z = Math.exp(-(x * x) / ss2) / (2.5066282746 * sigma);
				im[i] = z;
			}
			return im;
		}

		let kern = gauss1d(ksize);
		let [w, h] = [ctx.canvas.width, ctx.canvas.height];
		for (let i = 0; i < h; i++) {
			for (let j = 0; j < w; j++) {
				let s0 = 0,
					s1 = 0,
					s2 = 0,
					s3 = 0;
				for (let k = 0; k < ksize; k++) {
					let jk = Math.min(Math.max(j - rad + k, 0), w - 1);
					let idx = 4 * (i * w + jk);
					s0 += tmpBuf[idx] * kern[k];
					s1 += tmpBuf[idx + 1] * kern[k];
					s2 += tmpBuf[idx + 2] * kern[k];
					s3 += tmpBuf[idx + 3] * kern[k];
				}
				let idx = 4 * (i * w + j);
				data[idx] = s0;
				data[idx + 1] = s1;
				data[idx + 2] = s2;
				data[idx + 3] = s3;
			}
		}
		tmpBuf.set(data);
		for (let i = 0; i < h; i++) {
			for (let j = 0; j < w; j++) {
				let s0 = 0,
					s1 = 0,
					s2 = 0,
					s3 = 0;
				for (let k = 0; k < ksize; k++) {
					let ik = Math.min(Math.max(i - rad + k, 0), h - 1);
					let idx = 4 * (ik * w + j);
					s0 += tmpBuf[idx] * kern[k];
					s1 += tmpBuf[idx + 1] * kern[k];
					s2 += tmpBuf[idx + 2] * kern[k];
					s3 += tmpBuf[idx + 3] * kern[k];
				}
				let idx = 4 * (i * w + j);
				data[idx] = s0;
				data[idx + 1] = s1;
				data[idx + 2] = s2;
				data[idx + 3] = s3;
			}
		}
	};

	function makeTmpCtx(w, h) {
		if (tmpCtx == null) {
			tmpCtx = document.createElement('canvas').getContext('2d');
		}
		h ??= w || ctx.canvas.height;
		w ??= ctx.canvas.width;
		if (tmpCtx.canvas.width != w || tmpCtx.canvas.height != h) {
			tmpCtx.canvas.width = w;
			tmpCtx.canvas.height = h;
		}
	}
	function makeTmpCt2(w, h) {
		if (tmpCt2 == null) {
			tmpCt2 = document.createElement('canvas').getContext('2d');
		}
		h ??= w || ctx.canvas.height;
		w ??= ctx.canvas.width;
		if (tmpCt2.canvas.width != w || tmpCt2.canvas.height != h) {
			tmpCt2.canvas.width = w;
			tmpCt2.canvas.height = h;
		}
	}

	function makeTmpBuf() {
		let l = ctx.canvas.width * ctx.canvas.height * 4;
		if (!tmpBuf || l != tmpBuf.length) {
			tmpBuf = new Uint8ClampedArray(l);
		}
	}

	function nativeFilter(filtstr) {
		tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
		tmpCtx.filter = filtstr;
		tmpCtx.drawImage(ctx.canvas, 0, 0);
		ctx.save();
		ctx.resetTransform();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(tmpCtx.canvas, 0, 0);
		ctx.restore();
	}

	$.filter = (typ, x) => {
		let support = $.HARDWARE_FILTERS && ctx.filter != undefined;
		if (support) {
			makeTmpCtx();
			if (typ == $.THRESHOLD) {
				x ??= 0.5;
				x = Math.max(x, 0.00001);
				let b = Math.floor((0.5 / x) * 100);
				nativeFilter(`saturate(0%) brightness(${b}%) contrast(1000000%)`);
			} else if (typ == $.GRAY) {
				nativeFilter(`saturate(0%)`);
			} else if (typ == $.OPAQUE) {
				tmpCtx.fillStyle = 'black';
				tmpCtx.fillRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
				tmpCtx.drawImage(ctx.canvas, 0, 0);
				ctx.save();
				ctx.resetTransform();
				ctx.drawImage(tmpCtx.canvas, 0, 0);
				ctx.restore();
			} else if (typ == $.INVERT) {
				nativeFilter(`invert(100%)`);
			} else if (typ == $.BLUR) {
				nativeFilter(`blur(${Math.ceil((x * $._pixelDensity) / 1) || 1}px)`);
			} else {
				let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
				filterImpl[typ](imgData.data, x);
				ctx.putImageData(imgData, 0, 0);
			}
		} else {
			let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
			filterImpl[typ](imgData.data, x);
			ctx.putImageData(imgData, 0, 0);
		}
	};

	$.resize = (w, h) => {
		makeTmpCtx();
		tmpCtx.drawImage(ctx.canvas, 0, 0);
		$.width = w;
		$.height = h;
		ctx.canvas.width = w * $._pixelDensity;
		ctx.canvas.height = h * $._pixelDensity;
		ctx.save();
		ctx.resetTransform();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(tmpCtx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.restore();
	};

	$.get = (x, y, w, h) => {
		let pd = $._pixelDensity || 1;
		if (x !== undefined && w === undefined) {
			let c = ctx.getImageData(x * pd, y * pd, 1, 1).data;
			return new Q5.Color(c[0], c[1], c[2], c[3] / 255);
		}
		x = (x || 0) * pd;
		y = (y || 0) * pd;
		let _w = (w = w || $.width);
		let _h = (h = h || $.height);
		w *= pd;
		h *= pd;
		let img = $.createImage(w, h);
		let imgData = ctx.getImageData(x, y, w, h);
		img.canvas.getContext('2d').putImageData(imgData, 0, 0);
		img._pixelDensity = pd;
		img.width = _w;
		img.height = _h;
		return img;
	};

	$.set = (x, y, c) => {
		if (c.MAGIC == $.MAGIC) {
			let old = $._tint;
			$._tint = null;
			$.image(c, x, y);
			$._tint = old;
			return;
		}
		let mod = $._pixelDensity || 1;
		for (let i = 0; i < mod; i++) {
			for (let j = 0; j < mod; j++) {
				let idx = 4 * ((y * mod + i) * ctx.canvas.width + x * mod + j);
				$.pixels[idx] = c._r;
				$.pixels[idx + 1] = c._g;
				$.pixels[idx + 2] = c._b;
				$.pixels[idx + 3] = c._a * 255;
			}
		}
	};

	$.tinted = function (col) {
		let alpha = col._a;
		col._a = 1;
		makeTmpCtx();
		tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
		tmpCtx.fillStyle = col;
		tmpCtx.fillRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
		tmpCtx.globalCompositeOperation = 'multiply';
		tmpCtx.drawImage(ctx.canvas, 0, 0);
		tmpCtx.globalCompositeOperation = 'source-over';

		ctx.save();
		ctx.resetTransform();
		let old = ctx.globalCompositeOperation;
		ctx.globalCompositeOperation = 'source-in';
		ctx.drawImage(tmpCtx.canvas, 0, 0);
		ctx.globalCompositeOperation = old;
		ctx.restore();

		tmpCtx.globalAlpha = alpha;
		tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
		tmpCtx.drawImage(ctx.canvas, 0, 0);
		tmpCtx.globalAlpha = 1;

		ctx.save();
		ctx.resetTransform();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(tmpCtx.canvas, 0, 0);
		ctx.restore();
	};
	$.tint = function () {
		$._tint = $.color(...Array.from(arguments));
	};
	$.noTint = () => ($._tint = null);

	$.mask = (img) => {
		ctx.save();
		ctx.resetTransform();
		let old = ctx.globalCompositeOperation;
		ctx.globalCompositeOperation = 'destination-in';
		ctx.drawImage(img.canvas, 0, 0);
		ctx.globalCompositeOperation = old;
		ctx.restore();
	};

	$._save = (data, name, ext) => {
		name = name || 'untitled';
		ext = ext || 'png';
		if (ext == 'jpg' || ext == 'png') data = data.toDataURL();
		else {
			let type = 'text/plain';
			if (ext == 'json') {
				if (typeof data != 'string') data = JSON.stringify(data);
				type = 'text/json';
			}
			data = new Blob([data], { type });
			data = URL.createObjectURL(data);
		}
		let a = document.createElement('a');
		a.href = data;
		a.download = name + '.' + ext;
		document.body.append(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(a.href);
	};
	$.save = (a, b, c) => {
		if (!a || (typeof a == 'string' && (!b || (!c && b.length < 5)))) {
			c = b;
			b = a;
			a = ctx.canvas;
		}
		if (c) return $._save(a, b, c);
		if (b) {
			b = b.split('.');
			$._save(a, b[0], b.at(-1));
		} else $._save(a);
	};
	$.canvas.save = $.save;
	$.saveCanvas = $.save;

	//================================================================
	// PRIVATE VARS
	//================================================================
	let looper = null;
	let firstVertex = true;
	let curveBuff = [];
	let keysHeld = {};
	let millisStart = 0;
	let tmpCtx = null;
	let tmpCt2 = null;
	let tmpBuf = null;

	if (scope == 'image') return;

	$.remove = () => {
		$.noLoop();
		$.canvas.remove();
	};

	//================================================================
	// CONSTANTS
	//================================================================

	$.RGB = 0;
	$.HSV = 1;
	$.HSB = 1;

	$.CHORD = 0;
	$.PIE = 1;
	$.OPEN = 2;

	$.RADIUS = 'radius';
	$.CORNER = 'corner';
	$.CORNERS = 'corners';

	$.ROUND = 'round';
	$.SQUARE = 'butt';
	$.PROJECT = 'square';
	$.MITER = 'miter';
	$.BEVEL = 'bevel';

	$.CLOSE = 1;

	$.BLEND = 'source-over';
	$.REMOVE = 'destination-out';
	$.ADD = 'lighter';
	$.DARKEST = 'darken';
	$.LIGHTEST = 'lighten';
	$.DIFFERENCE = 'difference';
	$.SUBTRACT = 'subtract';
	$.EXCLUSION = 'exclusion';
	$.MULTIPLY = 'multiply';
	$.SCREEN = 'screen';
	$.REPLACE = 'copy';
	$.OVERLAY = 'overlay';
	$.HARD_LIGHT = 'hard-light';
	$.SOFT_LIGHT = 'soft-light';
	$.DODGE = 'color-dodge';
	$.BURN = 'color-burn';

	$.NORMAL = 'normal';
	$.ITALIC = 'italic';
	$.BOLD = 'bold';
	$.BOLDITALIC = 'italic bold';

	$.CENTER = 'center';
	$.LEFT = 'left';
	$.RIGHT = 'right';
	$.TOP = 'top';
	$.BOTTOM = 'bottom';
	$.BASELINE = 'alphabetic';

	$.LANDSCAPE = 'landscape';
	$.PORTRAIT = 'portrait';

	$.ALT = 18;
	$.BACKSPACE = 8;
	$.CONTROL = 17;
	$.DELETE = 46;
	$.DOWN_ARROW = 40;
	$.ENTER = 13;
	$.ESCAPE = 27;
	$.LEFT_ARROW = 37;
	$.OPTION = 18;
	$.RETURN = 13;
	$.RIGHT_ARROW = 39;
	$.SHIFT = 16;
	$.TAB = 9;
	$.UP_ARROW = 38;

	$.DEGREES = 'degrees';
	$.RADIANS = 'radians';

	$.HALF_PI = Math.PI / 2;
	$.PI = Math.PI;
	$.QUARTER_PI = Math.PI / 4;
	$.TAU = Math.PI * 2;
	$.TWO_PI = Math.PI * 2;

	$.THRESHOLD = 1;
	$.GRAY = 2;
	$.OPAQUE = 3;
	$.INVERT = 4;
	$.POSTERIZE = 5;
	$.DILATE = 6;
	$.ERODE = 7;
	$.BLUR = 8;

	$.ARROW = 'default';
	$.CROSS = 'crosshair';
	$.HAND = 'pointer';
	$.MOVE = 'move';
	$.TEXT = 'text';

	$.VIDEO = { video: true, audio: false };
	$.AUDIO = { video: false, audio: true };

	$.SHR3 = 1;
	$.LCG = 2;

	$.HARDWARE_FILTERS = true;
	$.hint = (prop, val) => {
		$[prop] = val;
	};

	//================================================================
	// PUBLIC PROPERTIES
	//================================================================
	$.frameCount = 0;
	$.deltaTime = 16;
	$.mouseX = 0;
	$.mouseY = 0;
	$.mouseButton = null;
	$.keyIsPressed = false;
	$.mouseIsPressed = false;
	$.key = null;
	$.keyCode = null;
	$.accelerationX = 0;
	$.accelerationY = 0;
	$.accelerationZ = 0;
	$.rotationX = 0;
	$.rotationY = 0;
	$.rotationZ = 0;
	$.relRotationX = 0;
	$.relRotationY = 0;
	$.relRotationZ = 0;

	$.pmouseX = 0;
	$.pmouseY = 0;
	$.pAccelerationX = 0;
	$.pAccelerationY = 0;
	$.pAccelerationZ = 0;
	$.pRotationX = 0;
	$.pRotationY = 0;
	$.pRotationZ = 0;
	$.pRelRotationX = 0;
	$.pRelRotationY = 0;
	$.pRelRotationZ = 0;

	$.touches = [];

	$._colorMode = $.RGB;
	$._doStroke = true;
	$._doFill = true;
	$._strokeSet = false;
	$._fillSet = false;
	$._ellipseMode = $.CENTER;
	$._rectMode = $.CORNER;
	$._curveDetail = 20;
	$._curveAlpha = 0.0;
	$._loop = true;

	$._textFont = 'sans-serif';
	$._textSize = 12;
	$._textLeading = 15;
	$._textLeadDiff = 3;
	$._textStyle = 'normal';

	$._pixelDensity = 1;
	$._lastFrameTime = 0;
	$._targetFrameRate = null;
	$._frameRate = $._fps = 60;

	$._tint = null;

	//================================================================
	// ALIAS PROPERTIES
	//================================================================

	Object.defineProperty($, 'deviceOrientation', {
		get: () => window.screen?.orientation?.type
	});

	Object.defineProperty($, 'windowWidth', {
		get: () => window.innerWidth
	});

	Object.defineProperty($, 'windowHeight', {
		get: () => window.innerHeight
	});

	Object.defineProperty($, 'drawingContext', {
		get: () => ctx
	});

	//================================================================
	// CANVAS
	//================================================================

	function cloneCtx() {
		let c = {};
		for (let prop in ctx) {
			if (typeof ctx[prop] != 'function') c[prop] = ctx[prop];
		}
		delete c.canvas;
		return c;
	}

	$.resizeCanvas = (width, height) => {
		$.width = width;
		$.height = height;
		let c = cloneCtx();
		$.canvas.width = width * $._pixelDensity;
		$.canvas.height = height * $._pixelDensity;
		ctx = $._ctx = $.canvas.getContext('2d');
		for (let prop in c) $._ctx[prop] = c[prop];
		if (scope != 'image') $.pixelDensity($._pixelDensity);
	};

	$.createGraphics = function (width, height) {
		let g = new Q5('graphics');
		g._createCanvas.call($, width, height);
		return g;
	};
	$.createImage = (width, height) => {
		return new Q5.Image(width, height);
	};
	$.displayDensity = () => window.devicePixelRatio;
	$.pixelDensity = (n) => {
		if (n === undefined) return $._pixelDensity;
		$._pixelDensity = n;

		let c = cloneCtx();
		$.canvas.width = Math.ceil($.width * n);
		$.canvas.height = Math.ceil($.height * n);
		$.canvas.style.width = $.width + 'px';
		$.canvas.style.height = $.height + 'px';
		ctx = $._ctx = $.canvas.getContext('2d');
		for (let prop in c) $._ctx[prop] = c[prop];

		ctx.scale($._pixelDensity, $._pixelDensity);
		return $._pixelDensity;
	};

	//================================================================
	// MATH
	//================================================================

	$.map = (value, istart, istop, ostart, ostop, clamp) => {
		let val = ostart + (ostop - ostart) * (((value - istart) * 1.0) / (istop - istart));
		if (!clamp) {
			return val;
		}
		if (ostart < ostop) {
			return Math.min(Math.max(val, ostart), ostop);
		} else {
			return Math.min(Math.max(val, ostop), ostart);
		}
	};
	$.lerp = (a, b, t) => a * (1 - t) + b * t;
	$.constrain = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
	$.dist = function () {
		if (arguments.length == 4) {
			return Math.hypot(arguments[0] - arguments[2], arguments[1] - arguments[3]);
		} else {
			return Math.hypot(arguments[0] - arguments[3], arguments[1] - arguments[4], arguments[2] - arguments[5]);
		}
	};
	$.norm = (value, start, stop) => $.map(value, start, stop, 0, 1);
	$.sq = (x) => x * x;
	$.fract = (x) => x - Math.floor(x);
	$.angleMode = (mode) => ($._angleMode = mode);
	$._DEGTORAD = Math.PI / 180;
	$._RADTODEG = 180 / Math.PI;
	$.degrees = (x) => x * $._RADTODEG;
	$.radians = (x) => x * $._DEGTORAD;
	$.abs = Math.abs;
	$.ceil = Math.ceil;
	$.exp = Math.exp;
	$.floor = Math.floor;
	$.log = Math.log;
	$.mag = Math.hypot;
	$.max = Math.max;
	$.min = Math.min;
	$.round = Math.round;
	$.pow = Math.pow;
	$.sqrt = Math.sqrt;
	$.sin = (a) => {
		if ($._angleMode == 'degrees') a = $.radians(a);
		return Math.sin(a);
	};
	$.cos = (a) => {
		if ($._angleMode == 'degrees') a = $.radians(a);
		return Math.cos(a);
	};
	$.tan = (a) => {
		if ($._angleMode == 'degrees') a = $.radians(a);
		return Math.tan(a);
	};
	$.asin = (x) => {
		let a = Math.asin(x);
		if ($._angleMode == 'degrees') a = $.degrees(a);
		return a;
	};
	$.acos = (x) => {
		let a = Math.acos(x);
		if ($._angleMode == 'degrees') a = $.degrees(a);
		return a;
	};
	$.atan = (x) => {
		let a = Math.atan(x);
		if ($._angleMode == 'degrees') a = $.degrees(a);
		return a;
	};
	$.atan2 = (y, x) => {
		let a = Math.atan2(y, x);
		if ($._angleMode == 'degrees') a = $.degrees(a);
		return a;
	};
	$.nf = (n, l, r) => {
		let neg = n < 0;
		let s = n.toString();
		if (neg) s = s.slice(1);
		s = s.padStart(l, '0');
		if (r > 0) {
			if (s.indexOf('.') == -1) s += '.';
			s = s.padEnd(l + 1 + r, '0');
		}
		if (neg) s = '-' + s;
		return s;
	};
	$.createVector = (x, y, z) => new Q5.Vector(x, y, z, $);

	//================================================================
	// CURVE QUERY
	//================================================================
	//https://github.com/processing/p5.js/blob/1.1.9/src/core/shape/curves.js

	$.curvePoint = (a, b, c, d, t) => {
		const t3 = t * t * t,
			t2 = t * t,
			f1 = -0.5 * t3 + t2 - 0.5 * t,
			f2 = 1.5 * t3 - 2.5 * t2 + 1.0,
			f3 = -1.5 * t3 + 2.0 * t2 + 0.5 * t,
			f4 = 0.5 * t3 - 0.5 * t2;
		return a * f1 + b * f2 + c * f3 + d * f4;
	};
	$.bezierPoint = (a, b, c, d, t) => {
		const adjustedT = 1 - t;
		return (
			Math.pow(adjustedT, 3) * a +
			3 * Math.pow(adjustedT, 2) * t * b +
			3 * adjustedT * Math.pow(t, 2) * c +
			Math.pow(t, 3) * d
		);
	};
	$.curveTangent = (a, b, c, d, t) => {
		const t2 = t * t,
			f1 = (-3 * t2) / 2 + 2 * t - 0.5,
			f2 = (9 * t2) / 2 - 5 * t,
			f3 = (-9 * t2) / 2 + 4 * t + 0.5,
			f4 = (3 * t2) / 2 - t;
		return a * f1 + b * f2 + c * f3 + d * f4;
	};
	$.bezierTangent = (a, b, c, d, t) => {
		const adjustedT = 1 - t;
		return (
			3 * d * Math.pow(t, 2) -
			3 * c * Math.pow(t, 2) +
			6 * c * adjustedT * t -
			6 * b * adjustedT * t +
			3 * b * Math.pow(adjustedT, 2) -
			3 * a * Math.pow(adjustedT, 2)
		);
	};

	//================================================================
	// COLORS
	//================================================================

	$.Color = Q5.Color;
	$.colorMode = (mode) => {
		$._colorMode = mode;
	};

	let basicColors = {
		aqua: [0, 255, 255],
		black: [0, 0, 0],
		blue: [0, 0, 255],
		brown: [165, 42, 42],
		crimson: [220, 20, 60],
		darkviolet: [148, 0, 211],
		gold: [255, 215, 0],
		green: [0, 128, 0],
		gray: [128, 128, 128],
		grey: [128, 128, 128],
		hotpink: [255, 105, 180],
		indigo: [75, 0, 130],
		khaki: [240, 230, 140],
		lightgreen: [144, 238, 144],
		lime: [0, 255, 0],
		magenta: [255, 0, 255],
		navy: [0, 0, 128],
		orange: [255, 165, 0],
		olive: [128, 128, 0],
		peachpuff: [255, 218, 185],
		pink: [255, 192, 203],
		purple: [128, 0, 128],
		red: [255, 0, 0],
		skyblue: [135, 206, 235],
		tan: [210, 180, 140],
		turquoise: [64, 224, 208],
		transparent: [0, 0, 0, 0],
		white: [255, 255, 255],
		violet: [238, 130, 238],
		yellow: [255, 255, 0]
	};

	$.color = function () {
		let args = arguments;
		if (args.length == 1) {
			if (typeof args[0] == 'string') {
				if (args[0][0] == '#') {
					return new Q5.Color(
						parseInt(args[0].slice(1, 3), 16),
						parseInt(args[0].slice(3, 5), 16),
						parseInt(args[0].slice(5, 7), 16),
						1
					);
				} else {
					if (basicColors[args[0]]) {
						return new Q5.Color(...basicColors[args[0]], 1);
					}
					return new Q5.Color(0, 0, 0, 1);
				}
			}
			if (typeof args[0] != 'number' && args[0].MAGIC == 0xc010a) {
				return args[0];
			}
		}
		if ($._colorMode == $.RGB) {
			if (args.length == 1) {
				return new Q5.Color(args[0], args[0], args[0], 1);
			} else if (args.length == 2) {
				return new Q5.Color(args[0], args[0], args[0], args[1] / 255);
			} else if (args.length == 3) {
				return new Q5.Color(args[0], args[1], args[2], 1);
			} else if (args.length == 4) {
				return new Q5.Color(args[0], args[1], args[2], args[3] / 255);
			}
		} else {
			if (args.length == 1) {
				return new Q5.Color(...Q5.Color._hsv2rgb(0, 0, args[0] / 100), 1);
			} else if (args.length == 2) {
				return new Q5.Color(...Q5.Color._hsv2rgb(0, 0, args[0] / 100), args[1] / 255);
			} else if (args.length == 3) {
				return new Q5.Color(...Q5.Color._hsv2rgb(args[0], args[1] / 100, args[2] / 100), 1);
			} else if (args.length == 4) {
				return new Q5.Color(...Q5.Color._hsv2rgb(args[0], args[1] / 100, args[2] / 100), args[3]);
			}
		}
		return null;
	};

	$.red = (c) => {
		return c._r;
	};
	$.green = (c) => {
		return c._g;
	};
	$.blue = (c) => {
		return c._b;
	};
	$.alpha = (c) => {
		return c._a * 255;
	};
	$.hue = (c) => {
		c._inferHSV();
		return c._h;
	};
	$.saturation = (c) => {
		c._inferHSV();
		return c._s;
	};
	$.brightness = (c) => {
		c._inferHSV();
		return c._v;
	};
	$.lightness = (c) => {
		return ((0.2126 * c._r + 0.7152 * c._g + 0.0722 * c._b) * 100) / 255;
	};

	function lerpHue(h0, h1, t) {
		var methods = [
			[Math.abs(h1 - h0), $.map(t, 0, 1, h0, h1)],
			[Math.abs(h1 + 360 - h0), $.map(t, 0, 1, h0, h1 + 360)],
			[Math.abs(h1 - 360 - h0), $.map(t, 0, 1, h0, h1 - 360)]
		];
		methods.sort((x, y) => x[0] - y[0]);
		return (methods[0][1] + 720) % 360;
	}

	$.lerpColor = (a, b, t) => {
		if ($._colorMode == $.RGB) {
			return new Q5.Color(
				$.constrain($.lerp(a._r, b._r, t), 0, 255),
				$.constrain($.lerp(a._g, b._g, t), 0, 255),
				$.constrain($.lerp(a._b, b._b, t), 0, 255),
				$.constrain($.lerp(a._a, b._a, t), 0, 1)
			);
		} else {
			a._inferHSV();
			b._inferHSV();
			return new Q5.Color(
				$.constrain(lerpHue(a._h, b._h, t), 0, 360),
				$.constrain($.lerp(a._s, b._s, t), 0, 100),
				$.constrain($.lerp(a._v, b._v, t), 0, 100),
				$.constrain($.lerp(a._a, b._a, t), 0, 1)
			);
		}
	};

	//================================================================
	// DRAWING SETTING
	//================================================================

	function defaultStyle() {
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'black';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'miter';
		ctx.textAlign = 'left';
	}

	$.strokeWeight = (n) => {
		if (!n) $._doStroke = false;
		ctx.lineWidth = n || 0.0001;
	};
	$.stroke = function () {
		$._doStroke = true;
		$._strokeSet = true;
		if (typeof arguments[0] == 'string') {
			ctx.strokeStyle = arguments[0];
			return;
		}
		let col = $.color(...arguments);
		if (col._a <= 0) {
			$._doStroke = false;
			return;
		}
		ctx.strokeStyle = col;
	};
	$.noStroke = () => ($._doStroke = false);
	$.fill = function () {
		$._doFill = true;
		$._fillSet = true;
		if (typeof arguments[0] == 'string') {
			ctx.fillStyle = arguments[0];
			return;
		}
		let col = $.color(...arguments);
		if (col._a <= 0) {
			$._doFill = false;
			return;
		}
		ctx.fillStyle = col;
	};
	$.noFill = () => ($._doFill = false);
	$.smooth = () => ($._smooth = true);
	$.noSmooth = () => ($._smooth = false);
	$.blendMode = (x) => (ctx.globalCompositeOperation = x);
	$.strokeCap = (x) => (ctx.lineCap = x);
	$.strokeJoin = (x) => (ctx.lineJoin = x);
	$.ellipseMode = (x) => ($._ellipseMode = x);
	$.rectMode = (x) => ($._rectMode = x);
	$.curveDetail = (x) => ($._curveDetail = x);
	$.curveAlpha = (x) => ($._curveAlpha = x);
	$.curveTightness = (x) => ($._curveAlpha = x);

	//================================================================
	// DRAWING
	//================================================================

	$.clear = () => {
		ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
	};

	$.background = function () {
		if (arguments[0] && arguments[0].MAGIC == $.MAGIC) {
			return $.image(arguments[0], 0, 0, $.width, $.height);
		}
		ctx.save();
		ctx.resetTransform();
		if (typeof arguments[0] == 'string') {
			ctx.fillStyle = arguments[0];
		} else {
			ctx.fillStyle = $.color(...Array.from(arguments));
		}
		ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
		ctx.restore();
	};

	$.line = (x0, y0, x1, y1) => {
		if ($._doStroke) {
			ctx.beginPath();
			ctx.moveTo(x0, y0);
			ctx.lineTo(x1, y1);
			ctx.stroke();
		}
	};

	function normAng(x) {
		let mid = $._angleMode == $.DEGREES ? 180 : Math.PI;
		let full = mid * 2;
		if (0 <= x && x <= full) return x;
		while (x < 0) {
			x += full;
		}
		while (x >= mid) {
			x -= full;
		}
		return x;
	}

	function arcImpl(x, y, w, h, start, stop, mode, detail) {
		if (!$._doFill && !$._doStroke) return;
		let lo = normAng(start);
		let hi = normAng(stop);
		if (lo > hi) [lo, hi] = [hi, lo];
		if (lo == 0) {
			if (hi == 0) return;
			if (($._angleMode == $.DEGREES && hi == 360) || hi == $.TAU) {
				return $.ellipse(x, y, w, h);
			}
		}
		ctx.beginPath();
		for (let i = 0; i < detail + 1; i++) {
			let t = i / detail;
			let a = $.lerp(lo, hi, t);
			let dx = ($.cos(a) * w) / 2;
			let dy = ($.sin(a) * h) / 2;
			ctx[i ? 'lineTo' : 'moveTo'](x + dx, y + dy);
		}
		if (mode == $.CHORD) {
			ctx.closePath();
		} else if (mode == $.PIE) {
			ctx.lineTo(x, y);
			ctx.closePath();
		}
		if ($._doFill) ctx.fill();
		if ($._doStroke) ctx.stroke();
	}
	$.arc = (x, y, w, h, start, stop, mode, detail) => {
		if (start == stop) return $.ellipse(x, y, w, h);
		detail ??= 25;
		mode ??= $.PIE;
		if ($._ellipseMode == $.CENTER) {
			arcImpl(x, y, w, h, start, stop, mode, detail);
		} else if ($._ellipseMode == $.RADIUS) {
			arcImpl(x, y, w * 2, h * 2, start, stop, mode, detail);
		} else if ($._ellipseMode == $.CORNER) {
			arcImpl(x + w / 2, y + h / 2, w, h, start, stop, mode, detail);
		} else if ($._ellipseMode == $.CORNERS) {
			arcImpl((x + w) / 2, (y + h) / 2, w - x, h - y, start, stop, mode, detail);
		}
	};

	function ellipseImpl(x, y, w, h) {
		if (!$._doFill && !$._doStroke) return;
		ctx.beginPath();
		ctx.ellipse(x, y, w / 2, h / 2, 0, 0, $.TAU);
		if ($._doFill) ctx.fill();
		if ($._doStroke) ctx.stroke();
	}
	$.ellipse = (x, y, w, h) => {
		h ??= w;
		if ($._ellipseMode == $.CENTER) {
			ellipseImpl(x, y, w, h);
		} else if ($._ellipseMode == $.RADIUS) {
			ellipseImpl(x, y, w * 2, h * 2);
		} else if ($._ellipseMode == $.CORNER) {
			ellipseImpl(x + w / 2, y + h / 2, w, h);
		} else if ($._ellipseMode == $.CORNERS) {
			ellipseImpl((x + w) / 2, (y + h) / 2, w - x, h - y);
		}
	};
	$.circle = (x, y, r) => {
		return $.ellipse(x, y, r, r);
	};
	$.point = (x, y) => {
		if (x.x) {
			y = x.y;
			x = x.x;
		}
		ctx.beginPath();
		ctx.ellipse(x, y, 0.4, 0.4, 0, 0, $.TAU);
		ctx.stroke();
	};
	function rectImpl(x, y, w, h) {
		if ($._doFill) ctx.fillRect(x, y, w, h);
		if ($._doStroke) ctx.strokeRect(x, y, w, h);
	}
	function roundedRectImpl(x, y, w, h, tl, tr, br, bl) {
		if (!$._doFill && !$._doStroke) return;
		if (tl === undefined) {
			return rectImpl(x, y, w, h);
		}
		if (tr === undefined) {
			return roundedRectImpl(x, y, w, h, tl, tl, tl, tl);
		}
		const hh = Math.min(Math.abs(h), Math.abs(w)) / 2;
		tl = Math.min(hh, tl);
		tr = Math.min(hh, tr);
		bl = Math.min(hh, bl);
		br = Math.min(hh, br);
		ctx.beginPath();
		ctx.moveTo(x + tl, y);
		ctx.arcTo(x + w, y, x + w, y + h, tr);
		ctx.arcTo(x + w, y + h, x, y + h, br);
		ctx.arcTo(x, y + h, x, y, bl);
		ctx.arcTo(x, y, x + w, y, tl);
		ctx.closePath();
		if ($._doFill) ctx.fill();
		if ($._doStroke) ctx.stroke();
	}

	$.rect = (x, y, w, h, tl, tr, br, bl) => {
		if ($._rectMode == $.CENTER) {
			roundedRectImpl(x - w / 2, y - h / 2, w, h, tl, tr, br, bl);
		} else if ($._rectMode == $.RADIUS) {
			roundedRectImpl(x - w, y - h, w * 2, h * 2, tl, tr, br, bl);
		} else if ($._rectMode == $.CORNER) {
			roundedRectImpl(x, y, w, h, tl, tr, br, bl);
		} else if ($._rectMode == $.CORNERS) {
			roundedRectImpl(x, y, w - x, h - y, tl, tr, br, bl);
		}
	};
	$.square = (x, y, s, tl, tr, br, bl) => {
		return $.rect(x, y, s, s, tl, tr, br, bl);
	};

	function clearBuff() {
		curveBuff = [];
	}

	$.beginShape = () => {
		clearBuff();
		ctx.beginPath();
		firstVertex = true;
	};
	$.beginContour = () => {
		ctx.closePath();
		clearBuff();
		firstVertex = true;
	};
	$.endContour = () => {
		clearBuff();
		firstVertex = true;
	};
	$.vertex = (x, y) => {
		clearBuff();
		if (firstVertex) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
		firstVertex = false;
	};
	$.bezierVertex = (cp1x, cp1y, cp2x, cp2y, x, y) => {
		clearBuff();
		ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	};
	$.quadraticVertex = (cp1x, cp1y, x, y) => {
		clearBuff();
		ctx.quadraticCurveTo(cp1x, cp1y, x, y);
	};
	$.bezier = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.bezierVertex(x2, y2, x3, y3, x4, y4);
		$.endShape();
	};
	$.triangle = (x1, y1, x2, y2, x3, y3) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.endShape($.CLOSE);
	};
	$.quad = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.vertex(x4, y4);
		$.endShape($.CLOSE);
	};
	$.endShape = (close) => {
		clearBuff();
		if (close) {
			ctx.closePath();
		}
		if ($._doFill) ctx.fill();
		if ($._doStroke) ctx.stroke();
		if (!$._doFill && !$._doStroke) {
			// eh.
			ctx.save();
			ctx.fillStyle = 'none';
			ctx.fill();
			ctx.restore();
		}
	};
	function catmullRomSpline(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, numPts, alpha) {
		//https://en.wikipedia.org/wiki/Centripetal_CatmullÃ¢â‚¬â€œRom_spline
		function catmullromSplineGetT(t, p0x, p0y, p1x, p1y, alpha) {
			let a = Math.pow(p1x - p0x, 2.0) + Math.pow(p1y - p0y, 2.0);
			let b = Math.pow(a, alpha * 0.5);
			return b + t;
		}
		let pts = [];

		let t0 = 0.0;
		let t1 = catmullromSplineGetT(t0, p0x, p0y, p1x, p1y, alpha);
		let t2 = catmullromSplineGetT(t1, p1x, p1y, p2x, p2y, alpha);
		let t3 = catmullromSplineGetT(t2, p2x, p2y, p3x, p3y, alpha);

		for (let i = 0; i < numPts; i++) {
			let t = t1 + (i / (numPts - 1)) * (t2 - t1);
			let s = [
				(t1 - t) / (t1 - t0),
				(t - t0) / (t1 - t0),
				(t2 - t) / (t2 - t1),
				(t - t1) / (t2 - t1),
				(t3 - t) / (t3 - t2),
				(t - t2) / (t3 - t2),
				(t2 - t) / (t2 - t0),
				(t - t0) / (t2 - t0),
				(t3 - t) / (t3 - t1),
				(t - t1) / (t3 - t1)
			];
			for (let j = 0; j < s.length; j += 2) {
				if (isNaN(s[j])) {
					s[j] = 1;
					s[j + 1] = 0;
				}
				if (!isFinite(s[j])) {
					if (s[j] > 0) {
						s[j] = 1;
						s[j + 1] = 0;
					} else {
						s[j] = 0;
						s[j + 1] = 1;
					}
				}
			}
			let a1x = p0x * s[0] + p1x * s[1];
			let a1y = p0y * s[0] + p1y * s[1];
			let a2x = p1x * s[2] + p2x * s[3];
			let a2y = p1y * s[2] + p2y * s[3];
			let a3x = p2x * s[4] + p3x * s[5];
			let a3y = p2y * s[4] + p3y * s[5];
			let b1x = a1x * s[6] + a2x * s[7];
			let b1y = a1y * s[6] + a2y * s[7];
			let b2x = a2x * s[8] + a3x * s[9];
			let b2y = a2y * s[8] + a3y * s[9];
			let cx = b1x * s[2] + b2x * s[3];
			let cy = b1y * s[2] + b2y * s[3];
			pts.push([cx, cy]);
		}
		return pts;
	}

	$.curveVertex = (x, y) => {
		curveBuff.push([x, y]);
		if (curveBuff.length < 4) {
			return;
		}
		let p0 = curveBuff[curveBuff.length - 4];
		let p1 = curveBuff[curveBuff.length - 3];
		let p2 = curveBuff[curveBuff.length - 2];
		let p3 = curveBuff[curveBuff.length - 1];
		let pts = catmullRomSpline(...p0, ...p1, ...p2, ...p3, $._curveDetail, $._curveAlpha);
		for (let i = 0; i < pts.length; i++) {
			if (firstVertex) {
				ctx.moveTo(...pts[i]);
			} else {
				ctx.lineTo(...pts[i]);
			}
			firstVertex = false;
		}
	};
	$.curve = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.curveVertex(x1, y1);
		$.curveVertex(x2, y2);
		$.curveVertex(x3, y3);
		$.curveVertex(x4, y4);
		$.endShape();
	};

	//================================================================
	// DRAWING MATRIX
	//================================================================
	$.translate = (x, y) => ctx.translate(x, y);
	$.rotate = (r) => {
		if ($._angleMode == 'degrees') r = $.radians(r);
		ctx.rotate(r);
	};

	$.scale = (x, y) => {
		y ??= x;
		ctx.scale(x, y);
	};
	$.applyMatrix = (a, b, c, d, e, f) => {
		ctx.transform(a, b, c, d, e, f);
	};
	$.shearX = (ang) => {
		ctx.transform(1, 0, $.tan(ang), 1, 0, 0);
	};
	$.shearY = (ang) => {
		ctx.transform(1, $.tan(ang), 0, 1, 0, 0);
	};

	$.resetMatrix = () => {
		ctx.resetTransform();
		ctx.scale($._pixelDensity, $._pixelDensity);
	};

	$._styleNames = [
		'_doStroke',
		'_doFill',
		'_strokeSet',
		'_fillSet',
		'_tint',
		'_imageMode',
		'_rectMode',
		'_ellipseMode',
		'_textFont',
		'_textLeading',
		'_leadingSet',
		'_textSize',
		'_textAlign',
		'_textBaseline',
		'_textStyle',
		'_textWrap'
	];

	$._ctxStyleNames = ['strokeStyle', 'fillStyle', 'lineWidth', 'lineCap', 'lineJoin'];

	$._styles = [];
	$._ctxStyles = [];

	$.pushMatrix = $.push = () => {
		ctx.save();
		let styles = {};
		for (let s of $._styleNames) styles[s] = $[s];
		$._styles.push(styles);
		let ctxStyles = {};
		for (let s of $._ctxStyleNames) ctxStyles[s] = ctx[s];
		$._ctxStyles.push(ctxStyles);
	};
	$.popMatrix = $.pop = () => {
		ctx.restore();
		let styles = $._styles.pop();
		for (let s of $._styleNames) $[s] = styles[s];
		let ctxStyles = $._ctxStyles.pop();
		for (let s of $._ctxStyleNames) ctx[s] = ctxStyles[s];
	};

	//================================================================
	// IMAGING
	//================================================================
	$.imageMode = (mode) => ($._imageMode = mode); // TODO
	$.image = (img, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight) => {
		let drawable = img.MAGIC == $.MAGIC ? img.canvas : img;
		function reset() {
			if (img.MAGIC != $.MAGIC || !$._tint) return;
			let c = img.canvas.getContext('2d');
			c.save();
			c.resetTransform();
			c.clearRect(0, 0, c.canvas.width, c.canvas.height);
			c.drawImage(tmpCt2.canvas, 0, 0);
			c.restore();
		}
		if (img.MAGIC == $.MAGIC && $._tint != null) {
			makeTmpCt2(img.canvas.width, img.canvas.height);
			tmpCt2.drawImage(img.canvas, 0, 0);
			img.tinted($._tint);
		}
		if (!dWidth) {
			if (img.MAGIC == $.MAGIC || img.width) {
				dWidth = img.width;
				dHeight = img.height;
			} else {
				dWidth = img.videoWidth;
				dHeight = img.videoHeight;
			}
		}
		if ($._imageMode == 'center') {
			dx -= dWidth * 0.5;
			dy -= dHeight * 0.5;
		}
		let pd = img._pixelDensity;
		sx ??= 0;
		sy ??= 0;
		if (!sWidth) sWidth = drawable.width;
		else sWidth *= pd;
		if (!sHeight) sHeight = drawable.height;
		else sHeight *= pd;
		ctx.drawImage(drawable, sx * pd, sy * pd, sWidth, sHeight, dx, dy, dWidth, dHeight);
		reset();
	};

	$._incrementPreload = () => preloadCnt++;
	$._decrementPreload = () => preloadCnt--;

	$.loadImage = (url, cb) => {
		preloadCnt++;
		let g = $.createImage(1, 1);
		let c = g.canvas.getContext('2d');
		let img = new window.Image();
		img.src = url;
		img.crossOrigin = 'Anonymous';
		img._pixelDensity = 1;
		img.onload = () => {
			g.width = c.canvas.width = img.naturalWidth;
			g.height = c.canvas.height = img.naturalHeight;
			c.drawImage(img, 0, 0);
			preloadCnt--;
			if (cb) cb(g);
		};
		img.onerror = (e) => {
			preloadCnt--;
			throw e;
		};
		return g;
	};

	$._clearTemporaryBuffers = () => {
		tmpCtx = null;
		tmpCt2 = null;
		tmpBuf = null;
	};

	//================================================================
	// TYPOGRAPHY
	//================================================================

	$.loadFont = (url, cb) => {
		preloadCnt++;
		let sp = url.split('/');
		let name = sp[sp.length - 1].split('.')[0].replace(' ', '');
		let f = new FontFace(name, 'url(' + url + ')');
		document.fonts.add(f);
		f.load().then(() => {
			preloadCnt--;
			if (cb) cb(name);
		});
		return name;
	};
	$.textFont = (x) => ($._textFont = x);
	$.textSize = (x) => {
		if (x === undefined) return $._textSize;
		$._textSize = x;
		if (!$._leadingSet) {
			$._textLeading = x * 1.25;
			$._textLeadDiff = $._textLeading - x;
		}
	};
	$.textLeading = (x) => {
		if (x === undefined) return $._textLeading;
		$._textLeading = x;
		$._textLeadDiff = x - $._textSize;
		$._leadingSet = true;
	};
	$.textStyle = (x) => ($._textStyle = x);
	$.textAlign = (horiz, vert) => {
		ctx.textAlign = horiz;
		if (vert) {
			ctx.textBaseline = vert == $.CENTER ? 'middle' : vert;
		}
	};
	$.textWidth = (str) => {
		ctx.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;
		return ctx.measureText(str).width;
	};
	$.textAscent = (str) => {
		ctx.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;
		return ctx.measureText(str).actualBoundingBoxAscent;
	};
	$.textDescent = (str) => {
		ctx.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;
		return ctx.measureText(str).actualBoundingBoxDescent;
	};
	$._textCache = true;
	$._TimedCache = class extends Map {
		constructor() {
			super();
			this.maxSize = 500;
		}
		set(k, v) {
			v.lastAccessed = Date.now();
			super.set(k, v);
			if (this.size > this.maxSize) this.gc();
		}
		get(k) {
			const v = super.get(k);
			if (v) v.lastAccessed = Date.now();
			return v;
		}
		gc() {
			let t = Infinity;
			let oldest;
			let i = 0;
			for (const [k, v] of this.entries()) {
				if (v.lastAccessed < t) {
					t = v.lastAccessed;
					oldest = i;
				}
				i++;
			}
			i = oldest;
			for (const k of this.keys()) {
				if (i == 0) {
					oldest = k;
					break;
				}
				i--;
			}
			this.delete(oldest);
		}
	};
	$._tic = new $._TimedCache();
	$.textCache = (b, maxSize) => {
		if (maxSize) $._tic.maxSize = maxSize;
		if (b !== undefined) $._textCache = b;
		return $._textCache;
	};
	function _genTextImageKey(str, w, h) {
		return (
			str.slice(0, 200) +
			$._textStyle +
			$._textSize +
			$._textFont +
			($._doFill ? ctx.fillStyle : '') +
			'_' +
			($._doStroke && $._strokeSet ? ctx.lineWidth + ctx.strokeStyle + '_' : '') +
			(w || '') +
			(h ? 'x' + h : '')
		);
	}
	$.createTextImage = (str, w, h) => {
		let og = $._textCache;
		$._textCache = true;
		$._useCache = true;
		$.text(str, 0, 0, w, h);
		$._useCache = false;
		let k = _genTextImageKey(str, w, h);
		$._textCache = og;
		return $._tic.get(k);
	};
	$.text = (str, x, y, w, h) => {
		if (str === undefined) return;
		str = str.toString();
		if (!$._doFill && !$._doStroke) return;
		let c, ti, tg, k, cX, cY, _ascent, _descent;
		let pd = 1;
		let t = ctx.getTransform();
		let useCache = $._useCache || ($._textCache && (t.b != 0 || t.c != 0));
		if (!useCache) {
			c = ctx;
			cX = x;
			cY = y;
		} else {
			k = _genTextImageKey(str, w, h);
			ti = $._tic.get(k);
			if (ti) {
				$.textImage(ti, x, y);
				return;
			}
			tg = $.createGraphics.call($, 1, 1);
			c = tg._ctx;
			pd = $._pixelDensity;
		}
		c.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;
		let lines = str.split('\n');
		if (useCache) {
			cX = 0;
			cY = $._textLeading * lines.length;
			let m = c.measureText(' ');
			_ascent = m.fontBoundingBoxAscent;
			_descent = m.fontBoundingBoxDescent;
			h ??= cY + _descent;
			tg.resizeCanvas(Math.ceil(c.measureText(str).width), Math.ceil(h));

			c.fillStyle = ctx.fillStyle;
			c.strokeStyle = ctx.strokeStyle;
			c.lineWidth = ctx.lineWidth;
		}
		let f = c.fillStyle;
		if (!$._fillSet) c.fillStyle = 'black';
		for (let i = 0; i < lines.length; i++) {
			if ($._doStroke && $._strokeSet) c.strokeText(lines[i], cX, cY);
			if ($._doFill) c.fillText(lines[i], cX, cY);
			cY += $._textLeading;
			if (cY > h) break;
		}
		if (!$._fillSet) c.fillStyle = f;
		if (useCache) {
			ti = tg.get();
			ti._ascent = _ascent;
			ti._descent = _descent;
			$._tic.set(k, ti);
			$.textImage(ti, x, y);
		}
	};
	$.textImage = (img, x, y) => {
		let og = $._imageMode;
		$._imageMode = 'corner';
		if (ctx.textAlign == 'center') x -= img.width * 0.5;
		else if (ctx.textAlign == 'right') x -= img.width;
		if (ctx.textBaseline == 'alphabetic') y -= $._textLeading;
		if (ctx.textBaseline == 'middle') y -= img._descent + img._ascent * 0.5 + $._textLeadDiff;
		else if (ctx.textBaseline == 'bottom') y -= img._ascent + img._descent + $._textLeadDiff;
		else if (ctx.textBaseline == 'top') y -= img._descent + $._textLeadDiff;
		$.image(img, x, y);
		$._imageMode = og;
	};

	//================================================================
	// RANDOM
	//================================================================

	//https://github.com/processing/p5.js/blob/1.1.9/src/math/noise.js
	var PERLIN_YWRAPB = 4;
	var PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
	var PERLIN_ZWRAPB = 8;
	var PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
	var PERLIN_SIZE = 4095;
	var perlin_octaves = 4;
	var perlin_amp_falloff = 0.5;
	var scaled_cosine = (i) => {
		return 0.5 * (1.0 - Math.cos(i * Math.PI));
	};
	var p_perlin;

	$.noise = (x, y, z) => {
		y ??= 0;
		z ??= 0;
		if (p_perlin == null) {
			p_perlin = new Array(PERLIN_SIZE + 1);
			for (var i = 0; i < PERLIN_SIZE + 1; i++) {
				p_perlin[i] = Math.random();
			}
		}
		if (x < 0) x = -x;
		if (y < 0) y = -y;
		if (z < 0) z = -z;
		var xi = Math.floor(x),
			yi = Math.floor(y),
			zi = Math.floor(z);
		var xf = x - xi;
		var yf = y - yi;
		var zf = z - zi;
		var rxf, ryf;
		var r = 0;
		var ampl = 0.5;
		var n1, n2, n3;
		for (var o = 0; o < perlin_octaves; o++) {
			var of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
			rxf = scaled_cosine(xf);
			ryf = scaled_cosine(yf);
			n1 = p_perlin[of & PERLIN_SIZE];
			n1 += rxf * (p_perlin[(of + 1) & PERLIN_SIZE] - n1);
			n2 = p_perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
			n2 += rxf * (p_perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
			n1 += ryf * (n2 - n1);
			of += PERLIN_ZWRAP;
			n2 = p_perlin[of & PERLIN_SIZE];
			n2 += rxf * (p_perlin[(of + 1) & PERLIN_SIZE] - n2);
			n3 = p_perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
			n3 += rxf * (p_perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
			n2 += ryf * (n3 - n2);
			n1 += scaled_cosine(zf) * (n2 - n1);
			r += n1 * ampl;
			ampl *= perlin_amp_falloff;
			xi <<= 1;
			xf *= 2;
			yi <<= 1;
			yf *= 2;
			zi <<= 1;
			zf *= 2;
			if (xf >= 1.0) {
				xi++;
				xf--;
			}
			if (yf >= 1.0) {
				yi++;
				yf--;
			}
			if (zf >= 1.0) {
				zi++;
				zf--;
			}
		}
		return r;
	};

	$.noiseDetail = (lod, falloff) => {
		if (lod > 0) {
			perlin_octaves = lod;
		}
		if (falloff > 0) {
			perlin_amp_falloff = falloff;
		}
	};
	const Lcg = () => {
		const m = 4294967296;
		const a = 1664525;
		const c = 1013904223;
		let seed, z;
		return {
			setSeed(val) {
				z = seed = (val == null ? Math.random() * m : val) >>> 0;
			},
			getSeed() {
				return seed;
			},
			rand() {
				z = (a * z + c) % m;
				return z / m;
			}
		};
	};
	const Shr3 = () => {
		let jsr, seed;
		let m = 4294967295;
		return {
			setSeed(val) {
				jsr = seed = (val == null ? Math.random() * m : val) >>> 0;
			},
			getSeed() {
				return seed;
			},
			rand() {
				jsr ^= jsr << 17;
				jsr ^= jsr >> 13;
				jsr ^= jsr << 5;
				return (jsr >>> 0) / m;
			}
		};
	};
	let rng1 = Shr3();
	rng1.setSeed();

	$.noiseSeed = (seed) => {
		let jsr = seed === undefined ? Math.random() * 4294967295 : seed;
		if (!p_perlin) {
			p_perlin = new Float32Array(PERLIN_SIZE + 1);
		}
		for (var i = 0; i < PERLIN_SIZE + 1; i++) {
			jsr ^= jsr << 17;
			jsr ^= jsr >> 13;
			jsr ^= jsr << 5;
			p_perlin[i] = (jsr >>> 0) / 4294967295;
		}
	};
	$.randomSeed = (seed) => rng1.setSeed(seed);
	$.random = (a, b) => {
		if (a === undefined) return rng1.rand();
		if (typeof a == 'number') {
			if (b !== undefined) {
				return rng1.rand() * (b - a) + a;
			} else {
				return rng1.rand() * a;
			}
		} else {
			return a[~~(a.length * rng1.rand())];
		}
	};
	$.randomGenerator = (method) => {
		if (method == $.LCG) rng1 = Lcg();
		else if (method == $.SHR3) rng1 = Shr3();
		rng1.setSeed();
	};

	var ziggurat = new (function () {
		//http://ziggurat.glitch.me/
		var iz;
		var jz;
		var kn = new Array(128);
		var ke = new Array(256);
		var hz;
		var wn = new Array(128);
		var fn = new Array(128);
		var we = new Array(256);
		var fe = new Array(256);
		var SHR3 = () => {
			return rng1.rand() * 4294967296 - 2147483648;
		};
		var UNI = () => {
			return 0.5 + (SHR3() << 0) * 0.2328306e-9;
		};

		var RNOR = () => {
			hz = SHR3();
			iz = hz & 127;
			return Math.abs(hz) < kn[iz] ? hz * wn[iz] : nfix();
		};
		var REXP = () => {
			jz = SHR3() >>> 0;
			iz = jz & 255;
			return jz < kn[iz] ? jz * we[iz] : efix();
		};
		var nfix = () => {
			var r = 3.44262;
			var x, y;
			var u1, u2;
			for (;;) {
				x = hz * wn[iz];
				if (iz == 0) {
					do {
						u1 = UNI();
						u2 = UNI();
						x = -Math.log(u1) * 0.2904764;
						y = -Math.log(u2);
					} while (y + y < x * x);
					return hz > 0 ? r + x : -r - x;
				}

				if (fn[iz] + UNI() * (fn[iz - 1] - fn[iz]) < Math.exp(-0.5 * x * x)) {
					return x;
				}
				hz = SHR3();
				iz = hz & 127;
				if (Math.abs(hz) < kn[iz]) {
					return hz * wn[iz];
				}
			}
		};
		var efix = () => {
			var x;
			for (;;) {
				if (iz == 0) {
					return 7.69711 - Math.log(UNI());
				}
				x = jz * we[iz];
				if (fe[iz] + UNI() * (fe[iz - 1] - fe[iz]) < Math.exp(-x)) {
					return x;
				}
				jz = SHR3();
				iz = jz & 255;
				if (jz < ke[iz]) {
					return jz * we[iz];
				}
			}
		};

		var zigset = () => {
			var m1 = 2147483648;
			var m2 = 4294967296;
			var dn = 3.442619855899;
			var tn = dn;
			var vn = 9.91256303526217e-3;
			var q;
			var de = 7.697117470131487;
			var te = de;
			var ve = 3.949659822581572e-3;
			var i;

			/* Tables for RNOR */
			q = vn / Math.exp(-0.5 * dn * dn);
			kn[0] = Math.floor((dn / q) * m1);
			kn[1] = 0;
			wn[0] = q / m1;
			wn[127] = dn / m1;
			fn[0] = 1;
			fn[127] = Math.exp(-0.5 * dn * dn);
			for (i = 126; i >= 1; i--) {
				dn = Math.sqrt(-2 * Math.log(vn / dn + Math.exp(-0.5 * dn * dn)));
				kn[i + 1] = Math.floor((dn / tn) * m1);
				tn = dn;
				fn[i] = Math.exp(-0.5 * dn * dn);
				wn[i] = dn / m1;
			}
			/*Tables for REXP */
			q = ve / Math.exp(-de);
			ke[0] = Math.floor((de / q) * m2);
			ke[1] = 0;
			we[0] = q / m2;
			we[255] = de / m2;
			fe[0] = 1;
			fe[255] = Math.exp(-de);
			for (i = 254; i >= 1; i--) {
				de = -Math.log(ve / de + Math.exp(-de));
				ke[i + 1] = Math.floor((de / te) * m2);
				te = de;
				fe[i] = Math.exp(-de);
				we[i] = de / m2;
			}
		};
		this.SHR3 = SHR3;
		this.UNI = UNI;
		this.RNOR = RNOR;
		this.REXP = REXP;
		this.zigset = zigset;
	})();
	ziggurat.hasInit = false;

	$.randomGaussian = (mean, std) => {
		if (!ziggurat.hasInit) {
			ziggurat.zigset();
			ziggurat.hasInit = true;
		}
		return ziggurat.RNOR() * std + mean;
	};

	$.randomExponential = () => {
		if (!ziggurat.hasInit) {
			ziggurat.zigset();
			ziggurat.hasInit = true;
		}
		return ziggurat.REXP();
	};

	//================================================================
	// ENVIRONMENT
	//================================================================

	$.print = console.log;
	$.cursor = (name, x, y) => {
		let pfx = '';
		if (name.includes('.')) {
			name = `url("${name}")`;
			pfx = ', auto';
		}
		if (x !== undefined) {
			name += ' ' + x + ' ' + y;
		}
		$.canvas.style.cursor = name + pfx;
	};
	$.noCursor = () => {
		$.canvas.style.cursor = 'none';
	};

	//================================================================
	// DOM
	//================================================================

	$.createCapture = (x) => {
		var vid = document.createElement('video');
		vid.playsinline = 'playsinline';
		vid.autoplay = 'autoplay';
		navigator.mediaDevices.getUserMedia(x).then((stream) => {
			vid.srcObject = stream;
		});
		vid.style.position = 'absolute';
		vid.style.opacity = 0.00001;
		vid.style.zIndex = -1000;
		document.body.append(vid);
		return vid;
	};

	function _draw() {
		let pre = performance.now();
		if ($._loop) {
			if (!$._targetFrameRate) {
				looper = requestAnimationFrame(_draw);
			} else {
				looper = setTimeout(_draw, 1000 / $._targetFrameRate);
			}
		} else if ($.frameCount > 0) return;
		if (looper && $.frameCount != 0) {
			let time_since_last = pre - $._lastFrameTime;
			let target_time_between_frames = 1000 / ($._targetFrameRate || 60);
			if (time_since_last < target_time_between_frames - 5) return;
		}
		$.deltaTime = pre - $._lastFrameTime;
		$._frameRate = 1000 / $.deltaTime;
		$.frameCount++;
		if ($._shouldResize) {
			$._windowResizedFn();
			$._shouldResize = false;
		}
		for (let m of Q5.prototype._methods.pre) m.call($);
		clearBuff();
		firstVertex = true;
		ctx.save();
		$._drawFn();
		for (let m of Q5.prototype._methods.post) m.call($);
		ctx.restore();
		$.resetMatrix();
		let post = performance.now();
		$._fps = Math.round(1000 / (post - pre));
		$._lastFrameTime = pre;
		$.pmouseX = $.mouseX;
		$.pmouseY = $.mouseY;
	}

	$.noLoop = () => {
		$._loop = false;
		looper = null;
	};
	$.loop = () => {
		$._loop = true;
		if (looper == null) _draw();
	};
	$.redraw = () => _draw();
	$.frameRate = (fps) => {
		if (fps) $._targetFrameRate = fps;
		return $._frameRate;
	};
	$.getFrameRate = () => $._frameRate;
	$.getFPS = () => $._fps;

	$._updateMouse = function (e) {
		let $ = this;
		let rect = $.canvas.getBoundingClientRect();
		let sx = $.canvas.scrollWidth / $.width || 1;
		let sy = $.canvas.scrollHeight / $.height || 1;
		$.mouseX = (e.clientX - rect.left) / sx;
		$.mouseY = (e.clientY - rect.top) / sy;
	}.bind($);

	$._onmousemove = function (e) {
		$._updateMouse(e);
		if (this.mouseIsPressed) this._mouseDraggedFn(e);
		else this._mouseMovedFn(e);
	}.bind($);
	$._onmousedown = (e) => {
		$._updateMouse(e);
		$.mouseIsPressed = true;
		$.mouseButton = [$.LEFT, $.CENTER, $.RIGHT][e.button];
		$._mousePressedFn(e);
	};
	$._onmouseup = (e) => {
		$._updateMouse(e);
		$.mouseIsPressed = false;
		$._mouseReleasedFn(e);
	};
	$._onclick = (e) => {
		$._updateMouse(e);
		$.mouseIsPressed = true;
		$._mouseClickedFn(e);
		$.mouseIsPressed = false;
	};
	$._onkeydown = (e) => {
		if (e.repeat) return;
		$.keyIsPressed = true;
		$.key = e.key;
		$.keyCode = e.keyCode;
		keysHeld[$.keyCode] = true;
		$._keyPressedFn(e);
		if (e.key.length == 1) {
			$._keyTypedFn(e);
		}
	};
	$._onkeyup = (e) => {
		$.keyIsPressed = false;
		$.key = e.key;
		$.keyCode = e.keyCode;
		keysHeld[$.keyCode] = false;
		$._keyReleasedFn(e);
	};

	$.canvas.onmousedown = (e) => $._onmousedown(e);
	$.canvas.onmouseup = (e) => $._onmouseup(e);
	$.canvas.onclick = (e) => $._onclick(e);
	$.keyIsDown = (x) => !!keysHeld[x];

	function getTouchInfo(touch) {
		const rect = $.canvas.getBoundingClientRect();
		const sx = $.canvas.scrollWidth / $.width || 1;
		const sy = $.canvas.scrollHeight / $.height || 1;
		return {
			x: (touch.clientX - rect.left) / sx,
			y: (touch.clientY - rect.top) / sy,
			id: touch.identifier
		};
	}
	function isTouchUnaware() {
		return $._touchStartedFn.isPlaceHolder && $._touchMovedFn.isPlaceHolder && $._touchEndedFn.isPlaceHolder;
	}
	$._ontouchstart = (e) => {
		$.touches = [...e.touches].map(getTouchInfo);
		if (isTouchUnaware()) {
			$.mouseX = $.touches[0].x;
			$.mouseY = $.touches[0].y;
			$.mouseIsPressed = true;
			$.mouseButton = $.LEFT;
			if (!$._mousePressedFn(e)) e.preventDefault();
		}
		if (!$._touchStartedFn(e)) e.preventDefault();
	};
	$._ontouchmove = (e) => {
		$.touches = [...e.touches].map(getTouchInfo);
		if (isTouchUnaware()) {
			$.mouseX = $.touches[0].x;
			$.mouseY = $.touches[0].y;
			if (!$._mouseDraggedFn(e)) e.preventDefault();
		}
		if (!$._touchMovedFn(e)) e.preventDefault();
	};
	$._ontouchend = (e) => {
		$.touches = [...e.touches].map(getTouchInfo);
		if (isTouchUnaware() && !$.touches.length) {
			$.mouseIsPressed = false;
			if (!$._mouseReleasedFn(e)) e.preventDefault();
		}
		if (!$._touchEndedFn(e)) e.preventDefault();
	};
	$.canvas.ontouchstart = (e) => $._ontouchstart(e);
	$.canvas.ontouchmove = (e) => $._ontouchmove(e);
	$.canvas.ontouchcancel = $.canvas.ontouchend = (e) => $._ontouchend(e);

	$.hasSensorPermission =
		(!window.DeviceOrientationEvent && !window.DeviceMotionEvent) ||
		!(DeviceOrientationEvent.requestPermission || DeviceMotionEvent.requestPermission);
	$.requestSensorPermissions = () => {
		if (DeviceOrientationEvent.requestPermission) {
			DeviceOrientationEvent.requestPermission()
				.then((response) => {
					if (response == 'granted') {
						if (DeviceMotionEvent.requestPermission) {
							DeviceMotionEvent.requestPermission()
								.then((response) => {
									if (response == 'granted') {
										$.hasSensorPermission = true;
									}
								})
								.catch(alert);
						}
					}
				})
				.catch(alert);
		}
	};

	//================================================================
	// SENSORS
	//================================================================

	// 3d transformation helpers
	let ROTX = (a) => [1, 0, 0, 0, 0, $.cos(a), -$.sin(a), 0, 0, $.sin(a), $.cos(a), 0, 0, 0, 0, 1];
	let ROTY = (a) => [$.cos(a), 0, $.sin(a), 0, 0, 1, 0, 0, -$.sin(a), 0, $.cos(a), 0, 0, 0, 0, 1];
	let MULT = (A, B) => [
		A[0] * B[0] + A[1] * B[4] + A[2] * B[8] + A[3] * B[12],
		A[0] * B[1] + A[1] * B[5] + A[2] * B[9] + A[3] * B[13],
		A[0] * B[2] + A[1] * B[6] + A[2] * B[10] + A[3] * B[14],
		A[0] * B[3] + A[1] * B[7] + A[2] * B[11] + A[3] * B[15],
		A[4] * B[0] + A[5] * B[4] + A[6] * B[8] + A[7] * B[12],
		A[4] * B[1] + A[5] * B[5] + A[6] * B[9] + A[7] * B[13],
		A[4] * B[2] + A[5] * B[6] + A[6] * B[10] + A[7] * B[14],
		A[4] * B[3] + A[5] * B[7] + A[6] * B[11] + A[7] * B[15],
		A[8] * B[0] + A[9] * B[4] + A[10] * B[8] + A[11] * B[12],
		A[8] * B[1] + A[9] * B[5] + A[10] * B[9] + A[11] * B[13],
		A[8] * B[2] + A[9] * B[6] + A[10] * B[10] + A[11] * B[14],
		A[8] * B[3] + A[9] * B[7] + A[10] * B[11] + A[11] * B[15],
		A[12] * B[0] + A[13] * B[4] + A[14] * B[8] + A[15] * B[12],
		A[12] * B[1] + A[13] * B[5] + A[14] * B[9] + A[15] * B[13],
		A[12] * B[2] + A[13] * B[6] + A[14] * B[10] + A[15] * B[14],
		A[12] * B[3] + A[13] * B[7] + A[14] * B[11] + A[15] * B[15]
	];
	let TRFM = (A, v) => [
		(A[0] * v[0] + A[1] * v[1] + A[2] * v[2] + A[3]) / (A[12] * v[0] + A[13] * v[1] + A[14] * v[2] + A[15]),
		(A[4] * v[0] + A[5] * v[1] + A[6] * v[2] + A[7]) / (A[12] * v[0] + A[13] * v[1] + A[14] * v[2] + A[15]),
		(A[8] * v[0] + A[9] * v[1] + A[10] * v[2] + A[11]) / (A[12] * v[0] + A[13] * v[1] + A[14] * v[2] + A[15])
	];

	if (typeof window !== 'undefined') {
		window.ondeviceorientation = (e) => {
			$.pRotationX = $.rotationX;
			$.pRotationY = $.rotationY;
			$.pRotationZ = $.rotationZ;
			$.pRelRotationX = $.relRotationX;
			$.pRelRotationY = $.relRotationY;
			$.pRelRotationZ = $.relRotationZ;

			$.rotationX = e.beta * (Math.PI / 180.0);
			$.rotationY = e.gamma * (Math.PI / 180.0);
			$.rotationZ = e.alpha * (Math.PI / 180.0);
			$.relRotationX = [-$.rotationY, -$.rotationX, $.rotationY][~~(window.orientation / 90) + 1];
			$.relRotationY = [-$.rotationX, $.rotationY, $.rotationX][~~(window.orientation / 90) + 1];
			$.relRotationZ = $.rotationZ;
		};
		window.ondevicemotion = (e) => {
			$.pAccelerationX = $.accelerationX;
			$.pAccelerationY = $.accelerationY;
			$.pAccelerationZ = $.accelerationZ;
			if (!e.acceleration) {
				// devices that don't support plain acceleration
				// compute gravitational acceleration's component on X Y Z axes based on gyroscope
				// g = ~ 9.80665
				let grav = TRFM(MULT(ROTY($.rotationY), ROTX($.rotationX)), [0, 0, -9.80665]);
				$.accelerationX = e.accelerationIncludingGravity.x + grav[0];
				$.accelerationY = e.accelerationIncludingGravity.y + grav[1];
				$.accelerationZ = e.accelerationIncludingGravity.z - grav[2];
			}
		};
	}

	//================================================================
	// TIME
	//================================================================

	$.year = () => new Date().getFullYear();
	$.day = () => new Date().getDay();
	$.hour = () => new Date().getHours();
	$.minute = () => new Date().getMinutes();
	$.second = () => new Date().getSeconds();
	$.millis = () => performance.now() - millisStart;

	$.storeItem = localStorage.setItem;
	$.getItem = localStorage.getItem;
	$.removeItem = localStorage.removeItem;
	$.clearStorage = localStorage.clear;

	$._loadFile = (path, cb, type) => {
		preloadCnt++;
		let ret = {};
		fetch(path)
			.then((r) => {
				if (type == 'json') return r.json();
				if (type == 'text') return r.text();
			})
			.then((r) => {
				preloadCnt--;
				Object.assign(ret, r);
				if (cb) cb(r);
			});
		return ret;
	};

	$.loadStrings = (path, cb) => $._loadFile(path, cb, 'text');
	$.loadJSON = (path, cb) => $._loadFile(path, cb, 'json');

	$.loadSound = (path, cb) => {
		preloadCnt++;
		let a = new Audio(path);
		a.addEventListener('canplaythrough', () => {
			preloadCnt--;
			if (cb) cb(a);
		});
		a.load();
		a.setVolume = (l) => (a.volume = l);
		a.setLoop = (l) => (a.loop = l);
		return a;
	};

	$.Element = function (a) {
		this.elt = a;
	};
	$._elements = [];

	if (scope == 'global') {
		// delete $.name;
		// delete $.length;
		Object.assign(Q5, $);
		// $.name = '';
		// $.length = 0;
		delete Q5.Q5;
	}
	Q5.Image ??= _Q5Image;

	for (let m of Q5.prototype._methods.init) m.call($);

	for (let [n, fn] of Object.entries(Q5.prototype)) {
		if (n[0] != '_' && typeof $[n] == 'function') $[n] = fn.bind($);
	}

	if (scope == 'global') {
		let props = Object.getOwnPropertyNames($);
		for (let p of props) {
			if (typeof $[p] == 'function') window[p] = $[p];
			else {
				Object.defineProperty(window, p, {
					get: () => $[p],
					set: (v) => ($[p] = v)
				});
			}
		}
	}

	if (typeof scope == 'function') scope($);

	function _init() {
		let o = scope == 'global' ? window : $;
		let eventNames = [
			'setup',
			'draw',
			'preload',
			'mouseMoved',
			'mousePressed',
			'mouseReleased',
			'mouseDragged',
			'mouseClicked',
			'keyPressed',
			'keyReleased',
			'keyTyped',
			'touchStarted',
			'touchMoved',
			'touchEnded',
			'windowResized'
		];
		for (let k of eventNames) {
			let intern = '_' + k + 'Fn';
			$[intern] = () => {};
			$[intern].isPlaceHolder = true;
			if (o[k]) {
				$[intern] = o[k];
			} else {
				Object.defineProperty($, k, {
					set: (fun) => {
						$[intern] = fun;
					}
				});
			}
		}

		if (scope != 'graphics' || scope != 'image') {
			$._preloadFn();
			millisStart = performance.now();
			function _start() {
				if (preloadCnt > 0) return requestAnimationFrame(_start);
				ctx.save();
				$._setupFn();
				$._setupDone = true;
				ctx.restore();
				$.resetMatrix();
				requestAnimationFrame(_draw);
			}
			_start();
		}
		addEventListener('mousemove', (e) => $._onmousemove(e), false);
		addEventListener('keydown', (e) => $._onkeydown(e), false);
		addEventListener('keyup', (e) => $._onkeyup(e), false);
	}
	if (scope == 'global') _init();
	else requestAnimationFrame(_init);
}

Q5.Color = class {
	constructor(r, g, b, a) {
		this.MAGIC = 0xc010a;
		this._r = r;
		this._g = g;
		this._b = b;
		this._a = a;
		this._h = 0;
		this._s = 0;
		this._v = 0;
		this._hsvInferred = false;
	}

	setRed(x) {
		this._r = x;
		this._hsvInferred = false;
	}
	setGreen(x) {
		this._g = x;
		this._hsvInferred = false;
	}
	setBlue(x) {
		this._b = x;
		this._hsvInferred = false;
	}
	setAlpha(x) {
		this._a = x / 255;
		this._hsvInferred = false;
	}
	get levels() {
		return [this._r, this._g, this._b, this._a * 255];
	}
	_inferHSV() {
		if (!this._hsvInferred) {
			[this._h, this._s, this._v] = Q5.Color._rgb2hsv(this._r, this._g, this._b);
			this._hsvInferred = true;
		}
	}
	toString() {
		return `rgba(${Math.round(this._r)},${Math.round(this._g)},${Math.round(this._b)},${~~(this._a * 1000) / 1000})`;
	}
};
Q5._instanceCount = 0;
Q5.Color._rgb2hsv = (r, g, b) => {
	//https://stackoverflow.com/questions/3018313/algorithm-to-convert-rgb-to-hsv-and-hsv-to-rgb-in-range-0-255-for-both
	let rgbMin, rgbMax;
	let h, s, v;
	rgbMin = r < g ? (r < b ? r : b) : g < b ? g : b;
	rgbMax = r > g ? (r > b ? r : b) : g > b ? g : b;
	v = (rgbMax * 100) / 255;
	if (v == 0) {
		h = 0;
		s = 0;
		return [h, s, v];
	}
	s = (100 * (rgbMax - rgbMin)) / rgbMax;
	if (s == 0) {
		h = 0;
		return [h, s, v];
	}
	if (rgbMax == r) h = 0 + (60 * (g - b)) / (rgbMax - rgbMin);
	else if (rgbMax == g) h = 120 + (60 * (b - r)) / (rgbMax - rgbMin);
	else h = 240 + (60 * (r - g)) / (rgbMax - rgbMin);
	return [h, s, v];
};
Q5.Color._hsv2rgb = (h, s, v) => {
	//https://stackoverflow.com/questions/3018313/algorithm-to-convert-rgb-to-hsv-and-hsv-to-rgb-in-range-0-255-for-both
	let r, g, b;
	let hh, i, ff, p, q, t;
	if (s == 0) {
		r = v;
		g = v;
		b = v;
		return [r * 255, g * 255, b * 255];
	}
	hh = h;
	if (hh > 360) hh = 0;
	hh /= 60;
	i = ~~hh;
	ff = hh - i;
	p = v * (1.0 - s);
	q = v * (1.0 - s * ff);
	t = v * (1.0 - s * (1.0 - ff));
	switch (i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		default:
			r = v;
			g = p;
			b = q;
			break;
	}
	return [r * 255, g * 255, b * 255];
};

//================================================================
// VECTOR
//================================================================
Q5.Vector = class {
	constructor(_x, _y, _z, _$) {
		this.x = _x || 0;
		this.y = _y || 0;
		this.z = _z || 0;
		this._$ = _$ || window;
		this._cn = null;
		this._cnsq = null;
	}

	set(_x, _y, _z) {
		this.x = _x || 0;
		this.y = _y || 0;
		this.z = _z || 0;
	}
	copy() {
		return new Q5.Vector(this.x, this.y, this.z);
	}
	_arg2v(x, y, z) {
		if (x.x !== undefined) return x;
		if (y !== undefined) {
			return { x, y, z: z || 0 };
		}
		return { x: x, y: x, z: x };
	}
	_calcNorm() {
		if (this._cnsq == null) {
			this._cnsq = this.x * this.x + this.y * this.y + this.z * this.z;
			this._cn = Math.sqrt(this._cnsq);
		}
	}
	_deprecNorm() {
		this._cnsq = null;
		this._cn = null;
	}
	add() {
		let u = this._arg2v(...arguments);
		this.x += u.x;
		this.y += u.y;
		this.z += u.z;
		this._deprecNorm();
		return this;
	}
	rem() {
		let u = this._arg2v(...arguments);
		this.x %= u.x;
		this.y %= u.y;
		this.z %= u.z;
		this._deprecNorm();
		return this;
	}
	sub() {
		let u = this._arg2v(...arguments);
		this.x -= u.x;
		this.y -= u.y;
		this.z -= u.z;
		this._deprecNorm();
		return this;
	}
	mult() {
		let u = this._arg2v(...arguments);
		this.x *= u.x;
		this.y *= u.y;
		this.z *= u.z;
		this._deprecNorm();
		return this;
	}
	div() {
		let u = this._arg2v(...arguments);
		if (u.x) this.x /= u.x;
		else this.x = 0;
		if (u.y) this.y /= u.y;
		else this.y = 0;
		if (u.z) this.z /= u.z;
		else this.z = 0;
		this._deprecNorm();
		return this;
	}
	mag() {
		this._calcNorm();
		return this._cn;
	}
	magSq() {
		this._calcNorm();
		return this._cnsq;
	}
	dot() {
		let u = this._arg2v(...arguments);
		return this.x * u.x + this.y * u.y + this.z * u.z;
	}
	dist() {
		let u = this._arg2v(...arguments);
		let x = this.x - u.x;
		let y = this.y - u.y;
		let z = this.z - u.z;
		return Math.sqrt(x * x + y * y + z * z);
	}
	cross() {
		let u = this._arg2v(...arguments);
		let x = this.y * u.z - this.z * u.y;
		let y = this.z * u.x - this.x * u.z;
		let z = this.x * u.y - this.y * u.x;
		this.x = x;
		this.y = y;
		this.z = z;
		this._deprecNorm();
		return this;
	}
	normalize() {
		this._calcNorm();
		let n = this._cn;
		if (n != 0) {
			this.x /= n;
			this.y /= n;
			this.z /= n;
		}
		this._cn = 1;
		this._cnsq = 1;
		return this;
	}
	limit(m) {
		this._calcNorm();
		let n = this._cn;
		if (n > m) {
			let t = m / n;
			this.x *= t;
			this.y *= t;
			this.z *= t;
			this._cn = m;
			this._cnsq = m * m;
		}
		return this;
	}
	setMag(m) {
		this._calcNorm();
		let n = this._cn;
		let t = m / n;
		this.x *= t;
		this.y *= t;
		this.z *= t;
		this._cn = m;
		this._cnsq = m * m;
		return this;
	}
	heading() {
		return this._$.atan2(this.y, this.x);
	}
	rotate(ang) {
		let costh = this._$.cos(ang);
		let sinth = this._$.sin(ang);
		let vx = this.x * costh - this.y * sinth;
		let vy = this.x * sinth + this.y * costh;
		this.x = vx;
		this.y = vy;
		return this;
	}
	angleBetween() {
		let u = this._arg2v(...arguments);
		let o = Q5.Vector.cross(this, u);
		let ang = this._$.atan2(o.mag(), this.dot(u));
		return ang * Math.sign(o.z || 1);
	}
	lerp() {
		let args = [...arguments];
		let u = this._arg2v(...args.slice(0, -1));
		let amt = args[args.length - 1];
		this.x += (u.x - this.x) * amt;
		this.y += (u.y - this.y) * amt;
		this.z += (u.z - this.z) * amt;
		this._deprecNorm();
		return this;
	}
	reflect(n) {
		n.normalize();
		return this.sub(n.mult(2 * this.dot(n)));
	}
	array() {
		return [this.x, this.y, this.z];
	}
	equals(u, epsilon) {
		epsilon ??= Number.EPSILON || 0;
		return Math.abs(u.x - this.x) < epsilon && Math.abs(u.y - this.y) < epsilon && Math.abs(u.z - this.z) < epsilon;
	}
	fromAngle(th, l) {
		if (l === undefined) l = 1;
		this._cn = l;
		this._cnsq = l * l;
		this.x = l * this._$.cos(th);
		this.y = l * this._$.sin(th);
		this.z = 0;
		return this;
	}
	fromAngles(th, ph, l) {
		if (l === undefined) l = 1;
		this._cn = l;
		this._cnsq = l * l;
		const cosph = this._$.cos(ph);
		const sinph = this._$.sin(ph);
		const costh = this._$.cos(th);
		const sinth = this._$.sin(th);
		this.x = l * sinth * sinph;
		this.y = -l * costh;
		this.z = l * sinth * cosph;
		return this;
	}
	random2D() {
		this._cn = this._cnsq = 1;
		return this.fromAngle(Math.random() * Math.PI * 2);
	}
	random3D() {
		this._cn = this._cnsq = 1;
		return this.fromAngles(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
	}
	toString() {
		return `[${this.x}, ${this.y}, ${this.z}]`;
	}
};
Q5.Vector.add = (v, u) => v.copy().add(u);
Q5.Vector.cross = (v, u) => v.copy().cross(u);
Q5.Vector.dist = (v, u) => Math.hypot(v.x - u.x, v.y - u.y, v.z - u.z);
Q5.Vector.div = (v, u) => v.copy().div(u);
Q5.Vector.dot = (v, u) => v.copy().dot(u);
Q5.Vector.equals = (v, u, epsilon) => v.equals(u, epsilon);
Q5.Vector.lerp = (v, u, amt) => v.copy().lerp(u, amt);
Q5.Vector.limit = (v, m) => v.copy().limit(m);
Q5.Vector.heading = (v) => this._$.atan2(v.y, v.x);
Q5.Vector.magSq = (v) => v.x * v.x + v.y * v.y + v.z * v.z;
Q5.Vector.mag = (v) => Math.sqrt(Q5.Vector.magSq(v));
Q5.Vector.mult = (v, u) => v.copy().mult(u);
Q5.Vector.normalize = (v) => v.copy().normalize();
Q5.Vector.rem = (v, u) => v.copy().rem(u);
Q5.Vector.sub = (v, u) => v.copy().sub(u);
for (let k of ['fromAngle', 'fromAngles', 'random2D', 'random3D']) {
	Q5.Vector[k] = (u, v, t) => new Q5.Vector()[k](u, v, t);
}

class _Q5Image extends Q5 {
	constructor(width, height) {
		super('image');
		this.createCanvas(width, height);
		delete this.createCanvas;
		this._loop = false;
	}
	get w() {
		return this.width;
	}
	get h() {
		return this.height;
	}
}

Q5._friendlyError = (msg, func) => {
	throw func + ': ' + msg;
};
Q5.prototype._methods = {
	init: [],
	pre: [],
	post: [],
	remove: []
};
Q5.prototype.registerMethod = (m, fn) => Q5.prototype._methods[m].push(fn);
Q5.prototype.registerPreloadMethod = (n, fn) => (Q5.prototype[n] = fn[n]);
Q5._validateParameters = () => true;

if (typeof module != 'undefined') module.exports = Q5;
else window.p5 ??= Q5;

document.addEventListener('DOMContentLoaded', () => {
	if (!Q5._hasGlobal) new Q5('auto');
});
