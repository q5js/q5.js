/**
 * q5.js
 * @version 1.9
 * @author quinton-ashley and LingDong-
 * @license AGPL-3.0
 */

/**
 * @class Q5
 */
function Q5(scope, parent) {
	let $ = this;
	$._q5 = true;
	let preloadCnt = 0;
	if (!scope) scope = 'global';
	if (scope == 'auto') {
		if (!(window.setup || window.draw)) return;
		else scope = 'global';
	}
	if (scope == 'global') Q5._hasGlobal = $._isGlobal = true;

	// CANVAS

	let _OffscreenCanvas =
		window.OffscreenCanvas ||
		function () {
			return document.createElement('canvas');
		};

	let imgData = null;
	let ctx = ($.ctx = $.drawingContext = null);
	$.canvas = null;
	$.pixels = [];

	$.noCanvas = () => {
		if ($.canvas?.remove) $.canvas.remove();
		$.canvas = 0;
		ctx = $.ctx = $.drawingContext = 0;
	};

	if (Q5._nodejs) {
		if (Q5._createNodeJSCanvas) {
			$.canvas = Q5._createNodeJSCanvas(100, 100);
		}
	} else if (scope == 'image' || scope == 'graphics') {
		$.canvas = new _OffscreenCanvas(100, 100);
	}
	if (!$.canvas) {
		if (typeof document == 'object') {
			$.canvas = document.createElement('canvas');
			$.canvas.id = 'defaultCanvas' + Q5._instanceCount++;
			$.canvas.classList.add('p5Canvas', 'q5Canvas');
		} else {
			$.noCanvas();
		}
	}

	$.canvas.width = $.width = 100;
	$.canvas.height = $.height = 100;

	if ($.canvas && scope != 'graphics' && scope != 'image') {
		$._setupDone = false;
		$._resize = () => {
			if ($.frameCount > 1) $._shouldResize = true;
		};
		if (parent && typeof parent == 'string') {
			parent = document.getElementById(parent);
		}
		$.canvas.parent = (el) => {
			if (typeof el == 'string') el = document.getElementById(el);
			el.append($.canvas);

			if (typeof ResizeObserver == 'function') {
				if ($._ro) $._ro.disconnect();
				$._ro = new ResizeObserver($._resize);
				$._ro.observe(parent);
			} else if (!$.frameCount) {
				window.addEventListener('resize', $._resize);
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
		else document.addEventListener('DOMContentLoaded', appendCanvas);
	}

	$.createCanvas = function (width, height, renderer, options) {
		if (renderer == 'webgl') throw `webgl renderer is not supported in q5, use '2d'`;
		$.width = $.canvas.width = width;
		$.height = $.canvas.height = height;
		$.canvas.renderer = '2d';
		let opt = Object.assign({}, Q5.canvasOptions);
		if (options) Object.assign(opt, options);

		ctx = $.ctx = $.drawingContext = $.canvas.getContext('2d', opt);
		Object.assign($.canvas, opt);
		if ($._colorMode == 'rgb') $.colorMode('rgb');
		defaultStyle();
		ctx.save();
		if (scope != 'image') {
			let pd = $.displayDensity();
			if (scope == 'graphics') pd = this._pixelDensity;
			$.pixelDensity(Math.ceil(pd));
		} else this._pixelDensity = 1;
		return $.canvas;
	};
	$._createCanvas = $.createCanvas;

	// IMAGE

	$.loadPixels = () => {
		imgData = ctx.getImageData(0, 0, $.canvas.width, $.canvas.height);
		$.pixels = imgData.data;
	};
	$.updatePixels = () => {
		if (imgData != null) ctx.putImageData(imgData, 0, 0);
	};

	function makeTmpCtx(w, h) {
		h ??= w || $.canvas.height;
		w ??= $.canvas.width;
		if (tmpCtx == null) {
			tmpCtx = new _OffscreenCanvas(w, h).getContext('2d', {
				colorSpace: $.canvas.colorSpace
			});
		}
		if (tmpCtx.canvas.width != w || tmpCtx.canvas.height != h) {
			tmpCtx.canvas.width = w;
			tmpCtx.canvas.height = h;
		}
	}

	function makeTmpCt2(w, h) {
		h ??= w || $.canvas.height;
		w ??= $.canvas.width;
		if (tmpCt2 == null) {
			tmpCt2 = new _OffscreenCanvas(w, h).getContext('2d', {
				colorSpace: $.canvas.colorSpace
			});
		}
		if (tmpCt2.canvas.width != w || tmpCt2.canvas.height != h) {
			tmpCt2.canvas.width = w;
			tmpCt2.canvas.height = h;
		}
	}

	function makeTmpBuf() {
		let l = $.canvas.width * $.canvas.height * 4;
		if (!tmpBuf || l != tmpBuf.length) {
			tmpBuf = new Uint8ClampedArray(l);
		}
	}

	function initSoftFilters() {
		$._filters = [];
		$._filters[$.THRESHOLD] = (data, thresh) => {
			if (thresh === undefined) thresh = 127.5;
			else thresh *= 255;
			for (let i = 0; i < data.length; i += 4) {
				const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
				data[i] = data[i + 1] = data[i + 2] = gray >= thresh ? 255 : 0;
			}
		};
		$._filters[$.GRAY] = (data) => {
			for (let i = 0; i < data.length; i += 4) {
				const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
				data[i] = data[i + 1] = data[i + 2] = gray;
			}
		};
		$._filters[$.OPAQUE] = (data) => {
			for (let i = 0; i < data.length; i += 4) {
				data[i + 3] = 255;
			}
		};
		$._filters[$.INVERT] = (data) => {
			for (let i = 0; i < data.length; i += 4) {
				data[i] = 255 - data[i];
				data[i + 1] = 255 - data[i + 1];
				data[i + 2] = 255 - data[i + 2];
			}
		};
		$._filters[$.POSTERIZE] = (data, lvl) => {
			lvl ??= 4;
			let lvl1 = lvl - 1;
			for (let i = 0; i < data.length; i += 4) {
				data[i] = (((data[i] * lvl) >> 8) * 255) / lvl1;
				data[i + 1] = (((data[i + 1] * lvl) >> 8) * 255) / lvl1;
				data[i + 2] = (((data[i + 2] * lvl) >> 8) * 255) / lvl1;
			}
		};
		$._filters[$.DILATE] = (data) => {
			makeTmpBuf();
			tmpBuf.set(data);
			let [w, h] = [$.canvas.width, $.canvas.height];
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
		$._filters[$.ERODE] = (data) => {
			makeTmpBuf();
			tmpBuf.set(data);
			let [w, h] = [$.canvas.width, $.canvas.height];
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
		$._filters[$.BLUR] = (data, rad) => {
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
			let [w, h] = [$.canvas.width, $.canvas.height];
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
	}

	function softFilter(typ, x) {
		if (!$._filters) initSoftFilters();
		let imgData = ctx.getImageData(0, 0, $.canvas.width, $.canvas.height);
		$._filters[typ](imgData.data, x);
		ctx.putImageData(imgData, 0, 0);
	}

	function nativeFilter(filtstr) {
		tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
		tmpCtx.filter = filtstr;
		tmpCtx.drawImage($.canvas, 0, 0);
		ctx.save();
		ctx.resetTransform();
		ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
		ctx.drawImage(tmpCtx.canvas, 0, 0);
		ctx.restore();
	}

	$.filter = (typ, x) => {
		if (!ctx.filter) return softFilter(typ, x);
		makeTmpCtx();
		if (typeof typ == 'string') {
			nativeFilter(typ);
		} else if (typ == $.THRESHOLD) {
			x ??= 0.5;
			x = Math.max(x, 0.00001);
			let b = Math.floor((0.5 / x) * 100);
			nativeFilter(`saturate(0%) brightness(${b}%) contrast(1000000%)`);
		} else if (typ == $.GRAY) {
			nativeFilter(`saturate(0%)`);
		} else if (typ == $.OPAQUE) {
			tmpCtx.fillStyle = 'black';
			tmpCtx.fillRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
			tmpCtx.drawImage($.canvas, 0, 0);
			ctx.save();
			ctx.resetTransform();
			ctx.drawImage(tmpCtx.canvas, 0, 0);
			ctx.restore();
		} else if (typ == $.INVERT) {
			nativeFilter(`invert(100%)`);
		} else if (typ == $.BLUR) {
			nativeFilter(`blur(${Math.ceil((x * $._pixelDensity) / 1) || 1}px)`);
		} else {
			softFilter(typ, x);
		}
	};

	$.resize = (w, h) => {
		makeTmpCtx();
		tmpCtx.drawImage($.canvas, 0, 0);
		$.width = w;
		$.height = h;
		$.canvas.width = w * $._pixelDensity;
		$.canvas.height = h * $._pixelDensity;
		ctx.save();
		ctx.resetTransform();
		ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
		ctx.drawImage(tmpCtx.canvas, 0, 0, $.canvas.width, $.canvas.height);
		ctx.restore();
	};

	$.get = (x, y, w, h) => {
		let pd = $._pixelDensity || 1;
		if (x !== undefined && w === undefined) {
			let c = ctx.getImageData(x * pd, y * pd, 1, 1).data;
			return new $.Color(c[0], c[1], c[2], c[3] / 255);
		}
		x = (x || 0) * pd;
		y = (y || 0) * pd;
		let _w = (w = w || $.width);
		let _h = (h = h || $.height);
		w *= pd;
		h *= pd;
		let img = $.createImage(w, h);
		let imgData = ctx.getImageData(x, y, w, h);
		img.ctx.putImageData(imgData, 0, 0);
		img._pixelDensity = pd;
		img.width = _w;
		img.height = _h;
		return img;
	};

	$.set = (x, y, c) => {
		if (c._q5) {
			let old = $._tint;
			$._tint = null;
			$.image(c, x, y);
			$._tint = old;
			return;
		}
		if (!$.pixels.length) $.loadPixels();
		let mod = $._pixelDensity || 1;
		for (let i = 0; i < mod; i++) {
			for (let j = 0; j < mod; j++) {
				let idx = 4 * ((y * mod + i) * $.canvas.width + x * mod + j);
				$.pixels[idx] = c.r ?? c.l;
				$.pixels[idx + 1] = c.g ?? c.c;
				$.pixels[idx + 2] = c.b ?? c.h;
				$.pixels[idx + 3] = c.a;
			}
		}
	};

	$.tinted = function (col) {
		let alpha = col.a;
		col.a = 255;
		makeTmpCtx();
		tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
		tmpCtx.fillStyle = col.toString();
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

		tmpCtx.globalAlpha = alpha / 255;
		tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
		tmpCtx.drawImage(ctx.canvas, 0, 0);
		tmpCtx.globalAlpha = 1;

		ctx.save();
		ctx.resetTransform();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(tmpCtx.canvas, 0, 0);
		ctx.restore();
	};
	$.tint = function (c) {
		$._tint = c._q5Color ? c : $.color(...arguments);
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
		if (ext == 'jpg' || ext == 'png' || ext == 'webp') {
			data = data.toDataURL('image/' + ext);
		} else {
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
			a = $.canvas;
		}
		if (c) return $._save(a, b, c);
		if (b) {
			b = b.split('.');
			$._save(a, b[0], b.at(-1));
		} else $._save(a);
	};
	$.canvas.save = $.save;
	$.saveCanvas = $.save;

	// PRIVATE VARS

	let looper = null;
	let firstVertex = true;
	let curveBuff = [];
	let keysHeld = {};
	let millisStart = 0;
	let tmpCtx = null;
	let tmpCt2 = null;
	let tmpBuf = null;

	// CONSTANTS

	$.THRESHOLD = 1;
	$.GRAY = 2;
	$.OPAQUE = 3;
	$.INVERT = 4;
	$.POSTERIZE = 5;
	$.DILATE = 6;
	$.ERODE = 7;
	$.BLUR = 8;

	if (scope == 'image') return;

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

	$.RGB = 'rgb';
	$.RGBA = 'rgb';
	$.HSB = 'hsb';

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

	$.ARROW = 'default';
	$.CROSS = 'crosshair';
	$.HAND = 'pointer';
	$.MOVE = 'move';
	$.TEXT = 'text';

	$.VIDEO = { video: true, audio: false };
	$.AUDIO = { video: false, audio: true };

	$.SHR3 = 1;
	$.LCG = 2;

	$.hint = (prop, val) => {
		$[prop] = val;
	};

	// PUBLIC PROPERTIES

	$.frameCount = 0;
	$.deltaTime = 16;
	$.mouseX = 0;
	$.mouseY = 0;
	$.touches = [];
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

	Object.defineProperty($, 'deviceOrientation', {
		get: () => window.screen?.orientation?.type
	});
	Object.defineProperty($, 'windowWidth', {
		get: () => window.innerWidth
	});
	Object.defineProperty($, 'windowHeight', {
		get: () => window.innerHeight
	});

	// PRIVATE PROPERTIES

	$._colorMode = 'rgb';
	$._doStroke = true;
	$._doFill = true;
	$._strokeSet = false;
	$._fillSet = false;
	$._tint = null;
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
	$._targetFrameRate = 0;
	$._targetFrameDuration = 16.666666666666668;
	$._frameRate = $._fps = 60;

	// CANVAS

	function cloneCtx() {
		let c = {};
		for (let prop in ctx) {
			if (typeof ctx[prop] != 'function') c[prop] = ctx[prop];
		}
		delete c.canvas;
		return c;
	}

	function _resizeCanvas(w, h) {
		$.width = w;
		$.height = h;
		let c = cloneCtx();
		$.canvas.width = Math.ceil(w * $._pixelDensity);
		$.canvas.height = Math.ceil(h * $._pixelDensity);
		if (!$.canvas.fullscreen && $.canvas.style) {
			$.canvas.style.width = w + 'px';
			$.canvas.style.height = h + 'px';
		}
		for (let prop in c) $.ctx[prop] = c[prop];
		ctx.scale($._pixelDensity, $._pixelDensity);
	}

	$.resizeCanvas = (w, h) => {
		if (w == $.width && h == $.height) return;
		_resizeCanvas(w, h);
	};

	$.createGraphics = function (w, h, opt) {
		let g = new Q5('graphics');
		opt ??= {};
		opt.alpha ??= true;
		g._createCanvas.call($, w, h, opt);
		return g;
	};
	$.createImage = (w, h, opt) => {
		return new Q5.Image(w, h, opt);
	};

	$.displayDensity = () => window.devicePixelRatio;
	$.pixelDensity = (v) => {
		if (!v || v == $._pixelDensity) return $._pixelDensity;
		$._pixelDensity = v;
		_resizeCanvas($.width, $.height);
		return v;
	};

	$.fullscreen = (v) => {
		if (v === undefined) return document.fullscreenElement;
		if (v) document.body.requestFullscreen();
		else document.body.exitFullscreen();
	};

	// MATH

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
		let a = arguments;
		if (a.length == 4) return Math.hypot(a[0] - a[2], a[1] - a[3]);
		else return Math.hypot(a[0] - a[3], a[1] - a[4], a[2] - a[5]);
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
		n = Math.abs(n);
		let parts = n.toFixed(r).split('.');
		parts[0] = parts[0].padStart(l, '0');
		let s = parts.join('.');
		if (neg) s = '-' + s;
		return s;
	};
	$.createVector = (x, y, z) => new Q5.Vector(x, y, z, $);

	// CURVES

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

	// COLOR

	if (Q5.supportsHDR) $.Color = Q5.ColorRGBA_P3;
	else $.Color = Q5.ColorRGBA;

	$.colorMode = (mode) => {
		$._colorMode = mode;
		if (mode == 'oklch') {
			$.Color = Q5.ColorOKLCH;
		} else if (mode == 'rgb') {
			if ($.canvas.colorSpace == 'srgb') $.Color = Q5.ColorRGBA;
			else $.Color = Q5.ColorRGBA_P3;
		} else if (mode == 'srgb') {
			$.Color = Q5.ColorRGBA;
			$._colorMode = 'rgb';
		}
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

	$.color = function (c0, c1, c2, c3) {
		let C = $.Color;
		if (c0._q5Color) return new C(...c0.levels);
		let args = arguments;
		if (args.length == 1) {
			if (typeof c0 == 'string') {
				if (c0[0] == '#') {
					return new C(
						parseInt(c0.slice(1, 3), 16),
						parseInt(c0.slice(3, 5), 16),
						parseInt(c0.slice(5, 7), 16),
						c0.length != 9 ? null : parseInt(c0.slice(7, 9), 16)
					);
				} else if (basicColors[c0]) return new C(...basicColors[c0]);
				else return new C(0, 0, 0);
			} else if (Array.isArray(c0)) return new C(...c0);
		}
		if ($._colorMode == 'rgb') {
			if (args.length == 1) return new C(c0, c0, c0);
			else if (args.length == 2) return new C(c0, c0, c0, c1);
			else if (args.length == 3) return new C(c0, c1, c2);
			else if (args.length == 4) return new C(c0, c1, c2, c3);
		}
	};

	$.red = (c) => c.r;
	$.green = (c) => c.g;
	$.blue = (c) => c.b;
	$.alpha = (c) => c.a;
	$.lightness = (c) => {
		return ((0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) * 100) / 255;
	};

	$.lerpColor = (a, b, t) => {
		if ($._colorMode == 'rgb') {
			return new $.Color(
				$.constrain($.lerp(a.r, b.r, t), 0, 255),
				$.constrain($.lerp(a.g, b.g, t), 0, 255),
				$.constrain($.lerp(a.b, b.b, t), 0, 255),
				$.constrain($.lerp(a.a, b.a, t), 0, 255)
			);
		} else {
			let deltaH = b.h - a.h;
			if (deltaH > 180) deltaH -= 360;
			if (deltaH < -180) deltaH += 360;
			let h = a.h + t * deltaH;
			if (h < 0) h += 360;
			if (h > 360) h -= 360;
			return new $.Color(
				$.constrain($.lerp(a.l, b.l, t), 0, 100),
				$.constrain($.lerp(a.c, b.c, t), 0, 100),
				h,
				$.constrain($.lerp(a.a, b.a, t), 0, 255)
			);
		}
	};

	// DRAWING SETTINGS

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
	$.stroke = function (c) {
		$._doStroke = true;
		$._strokeSet = true;
		if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
		if (c.a <= 0) return ($._doStroke = false);
		ctx.strokeStyle = c.toString();
	};
	$.noStroke = () => ($._doStroke = false);
	$.fill = function (c) {
		$._doFill = true;
		$._fillSet = true;
		if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
		if (c.a <= 0) return ($._doFill = false);
		ctx.fillStyle = c.toString();
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

	// DRAWING

	$.clear = () => {
		ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
	};

	$.background = function (c) {
		if (c._q5) return $.image(c, 0, 0, $.width, $.height);
		ctx.save();
		ctx.resetTransform();
		if (!c._q5color && typeof c != 'string') c = $.color(...arguments);
		ctx.fillStyle = c.toString();
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
	};
	function catmullRomSpline(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, numPts, alpha) {
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
	$.opacity = (a) => (ctx.globalAlpha = a);

	// DRAWING MATRIX

	$.translate = (x, y) => ctx.translate(x, y);
	$.rotate = (r) => {
		if ($._angleMode == 'degrees') r = $.radians(r);
		ctx.rotate(r);
	};
	$.scale = (x, y) => {
		y ??= x;
		ctx.scale(x, y);
	};
	$.applyMatrix = (a, b, c, d, e, f) => ctx.transform(a, b, c, d, e, f);
	$.shearX = (ang) => ctx.transform(1, 0, $.tan(ang), 1, 0, 0);
	$.shearY = (ang) => ctx.transform(1, $.tan(ang), 0, 1, 0, 0);
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
	$._styles = [];

	$.push = $.pushMatrix = () => {
		ctx.save();
		let styles = {};
		for (let s of $._styleNames) styles[s] = $[s];
		$._styles.push(styles);
	};
	$.pop = $.popMatrix = () => {
		ctx.restore();
		let styles = $._styles.pop();
		for (let s of $._styleNames) $[s] = styles[s];
	};

	// IMAGING

	$.imageMode = (mode) => ($._imageMode = mode);
	$.image = (img, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight) => {
		let drawable = img._q5 ? img.canvas : img;
		if (Q5._createNodeJSCanvas) {
			drawable = drawable.context.canvas;
		}
		function reset() {
			if (!img._q5 || !$._tint) return;
			let c = img.ctx;
			c.save();
			c.resetTransform();
			c.clearRect(0, 0, c.canvas.width, c.canvas.height);
			c.drawImage(tmpCt2.canvas, 0, 0);
			c.restore();
		}
		if (img._q5 && $._tint != null) {
			makeTmpCt2(img.canvas.width, img.canvas.height);
			tmpCt2.drawImage(img.canvas, 0, 0);
			img.tinted($._tint);
		}
		dWidth ??= img.width || img.videoWidth;
		dHeight ??= img.height || img.videoHeight;
		if ($._imageMode == 'center') {
			dx -= dWidth * 0.5;
			dy -= dHeight * 0.5;
		}
		let pd = img._pixelDensity || 1;
		sx ??= 0;
		sy ??= 0;
		if (!sWidth) {
			sWidth = drawable.width || drawable.videoWidth;
		} else sWidth *= pd;
		if (!sHeight) {
			sHeight = drawable.height || drawable.videoHeight;
		} else sHeight *= pd;
		ctx.drawImage(drawable, sx * pd, sy * pd, sWidth, sHeight, dx, dy, dWidth, dHeight);
		reset();
	};

	$._incrementPreload = () => preloadCnt++;
	$._decrementPreload = () => preloadCnt--;

	$.loadImage = function (url, cb, opt) {
		preloadCnt++;
		let last = [...arguments].at(-1);
		opt = typeof last == 'object' ? last : true;
		let g = $.createImage(1, 1, opt.alpha);
		let c = g.ctx;
		if (Q5._nodejs && global.CairoCanvas) {
			CairoCanvas.loadImage(url)
				.then((img) => {
					g.width = c.canvas.width = img.width;
					g.height = c.canvas.height = img.height;
					c.drawImage(img, 0, 0);
					preloadCnt--;
					if (cb) cb(g);
				})
				.catch((e) => {
					preloadCnt--;
					throw e;
				});
		} else {
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
		}
		return g;
	};

	$._clearTemporaryBuffers = () => {
		tmpCtx = null;
		tmpCt2 = null;
		tmpBuf = null;
	};

	// TYPOGRAPHY

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
			c = tg.ctx;
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

	// RANDOM

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
			return a[Math.trunc(a.length * rng1.rand())];
		}
	};
	$.randomGenerator = (method) => {
		if (method == $.LCG) rng1 = Lcg();
		else if (method == $.SHR3) rng1 = Shr3();
		rng1.setSeed();
	};

	var ziggurat = new (function () {
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

	// DOM

	$.Element = function (a) {
		this.elt = a;
	};
	$._elements = [];

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

	// ENVIRONMENT

	$.print = console.log;
	$.describe = () => {};

	function _draw(timestamp) {
		let ts = timestamp || performance.now();
		$._lastFrameTime ??= ts - $._targetFrameDuration;

		if ($._loop) looper = raf(_draw);
		else if ($.frameCount && !$._redraw) return;

		if (looper && $.frameCount) {
			let time_since_last = ts - $._lastFrameTime;
			if (time_since_last < $._targetFrameDuration - 1) return;
		}
		$.deltaTime = ts - $._lastFrameTime;
		$._frameRate = 1000 / $.deltaTime;
		$.frameCount++;
		if ($._shouldResize) {
			$.windowResized();
			$._shouldResize = false;
		}
		let pre = performance.now();
		for (let m of Q5.prototype._methods.pre) m.call($);
		clearBuff();
		firstVertex = true;
		if (ctx) ctx.save();
		$.draw();
		for (let m of Q5.prototype._methods.post) m.call($);
		if (ctx) {
			ctx.restore();
			$.resetMatrix();
		}
		$.pmouseX = $.mouseX;
		$.pmouseY = $.mouseY;
		$._lastFrameTime = ts;
		let post = performance.now();
		$._fps = Math.round(1000 / (post - pre));
	}
	$.noLoop = () => {
		$._loop = false;
		looper = null;
	};
	$.loop = () => {
		$._loop = true;
		if (looper == null) _draw();
	};
	$.redraw = (n) => {
		n ??= 1;
		$._redraw = true;
		for (let i = 0; i < n; i++) {
			_draw();
		}
		$._redraw = false;
	};
	$.remove = () => {
		$.noLoop();
		$.canvas.remove();
	};

	$.frameRate = (hz) => {
		if (hz) {
			$._targetFrameRate = hz;
			$._targetFrameDuration = 1000 / hz;
		}
		return $._frameRate;
	};
	$.getTargetFrameRate = () => $._targetFrameRate;
	$.getFPS = () => $._fps;

	if (typeof localStorage == 'object') {
		$.storeItem = localStorage.setItem;
		$.getItem = localStorage.getItem;
		$.removeItem = localStorage.removeItem;
		$.clearStorage = localStorage.clear;
	}
	// USER INPUT

	$._updateMouse = (e) => {
		if (e.changedTouches) return;
		let rect = $.canvas.getBoundingClientRect();
		let sx = $.canvas.scrollWidth / $.width || 1;
		let sy = $.canvas.scrollHeight / $.height || 1;
		$.mouseX = (e.clientX - rect.left) / sx;
		$.mouseY = (e.clientY - rect.top) / sy;
	};
	$._onmousedown = (e) => {
		$._updateMouse(e);
		$.mouseIsPressed = true;
		$.mouseButton = [$.LEFT, $.CENTER, $.RIGHT][e.button];
		$.mousePressed(e);
	};
	$._onmousemove = (e) => {
		$._updateMouse(e);
		if ($.mouseIsPressed) $.mouseDragged(e);
		else $.mouseMoved(e);
	};
	$._onmouseup = (e) => {
		$._updateMouse(e);
		$.mouseIsPressed = false;
		$.mouseReleased(e);
	};
	$._onclick = (e) => {
		$._updateMouse(e);
		$.mouseIsPressed = true;
		$.mouseClicked(e);
		$.mouseIsPressed = false;
	};
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

	$._onkeydown = (e) => {
		if (e.repeat) return;
		$.keyIsPressed = true;
		$.key = e.key;
		$.keyCode = e.keyCode;
		keysHeld[$.keyCode] = true;
		$.keyPressed(e);
		if (e.key.length == 1) {
			$.keyTyped(e);
		}
	};
	$._onkeyup = (e) => {
		$.keyIsPressed = false;
		$.key = e.key;
		$.keyCode = e.keyCode;
		keysHeld[$.keyCode] = false;
		$.keyReleased(e);
	};

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
	$._ontouchstart = (e) => {
		$.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware) {
			$.mouseX = $.touches[0].x;
			$.mouseY = $.touches[0].y;
			$.mouseIsPressed = true;
			$.mouseButton = $.LEFT;
			if (!$.mousePressed(e)) e.preventDefault();
		}
		if (!$.touchStarted(e)) e.preventDefault();
	};
	$._ontouchmove = (e) => {
		$.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware) {
			$.mouseX = $.touches[0].x;
			$.mouseY = $.touches[0].y;
			if (!$.mouseDragged(e)) e.preventDefault();
		}
		if (!$.touchMoved(e)) e.preventDefault();
	};
	$._ontouchend = (e) => {
		$.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware && !$.touches.length) {
			$.mouseIsPressed = false;
			if (!$.mouseReleased(e)) e.preventDefault();
		}
		if (!$.touchEnded(e)) e.preventDefault();
	};

	if (scope != 'graphics') {
		$.keyIsDown = (x) => !!keysHeld[x];
		$.canvas.onmousedown = (e) => $._onmousedown(e);
		$.canvas.onmouseup = (e) => $._onmouseup(e);
		$.canvas.onclick = (e) => $._onclick(e);
		$.canvas.ontouchstart = (e) => $._ontouchstart(e);
		$.canvas.ontouchmove = (e) => $._ontouchmove(e);
		$.canvas.ontouchcancel = $.canvas.ontouchend = (e) => $._ontouchend(e);
	}

	// SENSORS

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
		$.relRotationX = [-$.rotationY, -$.rotationX, $.rotationY][Math.trunc(window.orientation / 90) + 1];
		$.relRotationY = [-$.rotationX, $.rotationY, $.rotationX][Math.trunc(window.orientation / 90) + 1];
		$.relRotationZ = $.rotationZ;
	};
	window.ondevicemotion = (e) => {
		$.pAccelerationX = $.accelerationX;
		$.pAccelerationY = $.accelerationY;
		$.pAccelerationZ = $.accelerationZ;
		if (!e.acceleration) {
			let grav = TRFM(MULT(ROTY($.rotationY), ROTX($.rotationX)), [0, 0, -9.80665]);
			$.accelerationX = e.accelerationIncludingGravity.x + grav[0];
			$.accelerationY = e.accelerationIncludingGravity.y + grav[1];
			$.accelerationZ = e.accelerationIncludingGravity.z - grav[2];
		}
	};

	// TIME

	$.year = () => new Date().getFullYear();
	$.day = () => new Date().getDay();
	$.hour = () => new Date().getHours();
	$.minute = () => new Date().getMinutes();
	$.second = () => new Date().getSeconds();
	$.millis = () => performance.now() - millisStart;

	// LOAD FILES

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

	// INIT

	if (scope == 'global') {
		Object.assign(Q5, $);
		delete Q5.Q5;
	}
	Q5.Image ??= _Q5Image;

	for (let m of Q5.prototype._methods.init) m.call($);

	for (let [n, fn] of Object.entries(Q5.prototype)) {
		if (n[0] != '_' && typeof $[n] == 'function') $[n] = fn.bind($);
	}

	if (scope == 'global') {
		let props = Object.getOwnPropertyNames($);
		let t = !Q5._nodejs ? window : global;
		for (let p of props) {
			if (typeof $[p] == 'function') t[p] = $[p];
			else {
				Object.defineProperty(t, p, {
					get: () => $[p],
					set: (v) => ($[p] = v)
				});
			}
		}
	}

	if (typeof scope == 'function') scope($);

	if (scope == 'image') return;

	let raf =
		window.requestAnimationFrame ||
		function (cb) {
			const idealFrameTime = $._lastFrameTime + $._targetFrameDuration;
			return setTimeout(() => {
				cb(idealFrameTime);
			}, idealFrameTime - performance.now());
		};

	let t = scope == 'global' ? (!Q5._nodejs ? window : global) : $;
	let preloadDefined = t.preload;
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
		if (!t[k]) $[k] = () => {};
		else if ($._isGlobal) $[k] = t[k];
	}

	$._isTouchAware = $.touchStarted || $.touchMoved || $.mouseReleased;

	if (window && scope != 'graphics') {
		window.addEventListener('mousemove', (e) => $._onmousemove(e), false);
		window.addEventListener('keydown', (e) => $._onkeydown(e), false);
		window.addEventListener('keyup', (e) => $._onkeyup(e), false);
	}

	if (!($.setup || $.draw)) return;

	$._startDone = false;

	function _start() {
		$._startDone = true;
		if (preloadCnt > 0) return raf(_start);
		millisStart = performance.now();
		$.setup();
		if ($.frameCount) return;
		if (ctx === null) $.createCanvas(100, 100);
		$._setupDone = true;
		if (ctx) $.resetMatrix();
		raf(_draw);
	}

	if ((arguments.length && scope != 'namespace') || preloadDefined) {
		$.preload();
		_start();
	} else {
		t.preload = $.preload = () => {
			if (!$._startDone) _start();
		};
		setTimeout($.preload, 32);
	}
}

// COLOR CLASSES

Q5.Color = class {
	constructor() {
		this._q5Color = true;
	}
};
Q5.ColorOKLCH = class extends Q5.Color {
	constructor(l, c, h, a) {
		super();
		this.l = l;
		this.c = c;
		this.h = h;
		this.a = a ?? 1;
	}
	toString() {
		return `color(oklch ${this.l} ${this.c} ${this.h} / ${this.a})`;
	}
};
Q5.ColorRGBA = class extends Q5.Color {
	constructor(r, g, b, a) {
		super();
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a ?? 255;
	}
	setRed(v) {
		this.r = v;
	}
	setGreen(v) {
		this.g = v;
	}
	setBlue(v) {
		this.b = v;
	}
	setAlpha(v) {
		this.a = v;
	}
	get levels() {
		return [this.r, this.g, this.b, this.a];
	}
	toString() {
		return `rgb(${this.r} ${this.g} ${this.b} / ${this.a / 255})`;
	}
};
Q5.ColorRGBA_P3 = class extends Q5.ColorRGBA {
	constructor(r, g, b, a) {
		super(r, g, b, a);
		this._edited = true;
	}
	get r() {
		return this._r;
	}
	set r(v) {
		this._r = v;
		this._edited = true;
	}
	get g() {
		return this._g;
	}
	set g(v) {
		this._g = v;
		this._edited = true;
	}
	get b() {
		return this._b;
	}
	set b(v) {
		this._b = v;
		this._edited = true;
	}
	get a() {
		return this._a;
	}
	set a(v) {
		this._a = v;
		this._edited = true;
	}
	toString() {
		if (this._edited) {
			let r = (this._r / 255).toFixed(3);
			let g = (this._g / 255).toFixed(3);
			let b = (this._b / 255).toFixed(3);
			let a = (this._a / 255).toFixed(3);
			this._css = `color(display-p3 ${r} ${g} ${b} / ${a})`;
			this._edited = false;
		}
		return this._css;
	}
};

// VECTOR

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
		this._cnsq = this.x * this.x + this.y * this.y + this.z * this.z;
		this._cn = Math.sqrt(this._cnsq);
	}
	add() {
		let u = this._arg2v(...arguments);
		this.x += u.x;
		this.y += u.y;
		this.z += u.z;
		return this;
	}
	rem() {
		let u = this._arg2v(...arguments);
		this.x %= u.x;
		this.y %= u.y;
		this.z %= u.z;
		return this;
	}
	sub() {
		let u = this._arg2v(...arguments);
		this.x -= u.x;
		this.y -= u.y;
		this.z -= u.z;
		return this;
	}
	mult() {
		let u = this._arg2v(...arguments);
		this.x *= u.x;
		this.y *= u.y;
		this.z *= u.z;
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

// IMAGE CLASS

class _Q5Image extends Q5 {
	constructor(w, h, opt) {
		super('image');
		delete this.createCanvas;
		opt ??= {};
		opt.alpha ??= true;
		this._createCanvas(w, h, '2d', opt);
		this._loop = false;
	}
	get w() {
		return this.width;
	}
	get h() {
		return this.height;
	}
}

// Q5

if (typeof window != 'object') window = 0;

Q5._nodejs = typeof process == 'object';

Q5.canvasOptions = {
	alpha: false,
	desynchronized: false,
	colorSpace: 'display-p3'
};

if (!window.matchMedia || !matchMedia('(dynamic-range: high) and (color-gamut: p3)').matches) {
	Q5.canvasOptions.colorSpace = 'srgb';
} else Q5.supportsHDR = true;

Q5._instanceCount = 0;
Q5._friendlyError = (msg, func) => {
	throw func + ': ' + msg;
};
Q5._validateParameters = () => true;

Q5.prototype._methods = {
	init: [],
	pre: [],
	post: [],
	remove: []
};
Q5.prototype.registerMethod = (m, fn) => Q5.prototype._methods[m].push(fn);
Q5.prototype.registerPreloadMethod = (n, fn) => (Q5.prototype[n] = fn[n]);

if (typeof module == 'object') {
	global.p5 ??= Q5;
	module.exports = global.Q5 = Q5;
} else {
	window.p5 ??= Q5;
	window.Q5 = Q5;
}

if (typeof document == 'object') {
	document.addEventListener('DOMContentLoaded', () => {
		if (!Q5._hasGlobal) new Q5('auto');
	});
}
