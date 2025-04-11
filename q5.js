/**
 * q5.js
 * @version 2.27
 * @author quinton-ashley
 * @contributors Tezumie, LingDong-
 * @license LGPL-3.0
 * @class Q5
 */
function Q5(scope, parent, renderer) {
	let $ = this;
	$._q5 = true;
	$._parent = parent;
	if (renderer == 'webgpu-fallback') {
		$._renderer = 'c2d';
		$._webgpu = $._webgpuFallback = true;
	} else {
		$._renderer = renderer || Q5.render;
		$['_' + $._renderer] = true;
	}

	let autoLoaded = scope == 'auto';
	scope ??= 'global';
	if (scope == 'auto') {
		if (!(window.setup || window.update || window.draw)) return;
		scope = 'global';
	}
	$._scope = scope;
	let globalScope;
	if (scope == 'global') {
		Q5._hasGlobal = $._isGlobal = true;
		globalScope = Q5._esm ? globalThis : !Q5._server ? window : global;
	}
	if (scope == 'graphics') $._graphics = true;

	let q = new Proxy($, {
		set: (t, p, v) => {
			$[p] = v;
			if ($._isGlobal) globalScope[p] = v;
			return true;
		}
	});

	$.canvas = $.ctx = $.drawingContext = null;
	$.pixels = [];
	let looper = null,
		useRAF = true;

	$.frameCount = 0;
	$.deltaTime = 16;
	$._targetFrameRate = 0;
	$._targetFrameDuration = 16.666666666666668;
	$._frameRate = $._fps = 60;
	$._loop = true;
	$._hooks = {
		postCanvas: [],
		preRender: [],
		postRender: []
	};

	let millisStart = 0;
	$.millis = () => performance.now() - millisStart;

	$.noCanvas = () => {
		if ($.canvas?.remove) $.canvas.remove();
		$.canvas = 0;
		q.ctx = q.drawingContext = 0;
	};

	if (window) {
		$.windowWidth = window.innerWidth;
		$.windowHeight = window.innerHeight;
		$.deviceOrientation = window.screen?.orientation?.type;
	}

	$._preloadPromises = [];
	$._usePreload = true;
	$.usePreloadSystem = (v) => ($._usePreload = v);
	$.isPreloadSupported = () => $._usePreload;

	const resolvers = [];
	$._incrementPreload = () => {
		$._preloadPromises.push(new Promise((resolve) => resolvers.push(resolve)));
	};
	$._decrementPreload = () => {
		if (resolvers.length) resolvers.pop()();
	};

	$._draw = (timestamp) => {
		let ts = timestamp || performance.now();
		$._lastFrameTime ??= ts - $._targetFrameDuration;

		if ($._didResize) {
			$.windowResized();
			$._didResize = false;
		}

		if ($._loop) {
			if (useRAF) looper = raf($._draw);
			else {
				let nextTS = ts + $._targetFrameDuration;
				let frameDelay = nextTS - performance.now();
				while (frameDelay < 0) frameDelay += $._targetFrameDuration;
				looper = setTimeout(() => $._draw(nextTS), frameDelay);
			}
		} else if ($.frameCount && !$._redraw) return;

		if ($.frameCount && useRAF && !$._redraw) {
			let timeSinceLast = ts - $._lastFrameTime;
			if (timeSinceLast < $._targetFrameDuration - 4) return;
		}

		q.deltaTime = ts - $._lastFrameTime;
		$._frameRate = 1000 / $.deltaTime;
		q.frameCount++;
		let pre = performance.now();
		$.resetMatrix();
		if ($._beginRender) $._beginRender();
		for (let m of Q5.methods.pre) m.call($);
		try {
			$.draw();
		} catch (e) {
			if (!Q5.errorTolerant) $.noLoop();
			if ($._fes) $._fes(e);
			throw e;
		}
		for (let m of Q5.methods.post) m.call($);
		$.postProcess();
		if ($._render) $._render();
		if ($._finishRender) $._finishRender();
		q.pmouseX = $.mouseX;
		q.pmouseY = $.mouseY;
		q.moveX = q.moveY = 0;
		$._lastFrameTime = ts;
		let post = performance.now();
		$._fps = Math.round(1000 / (post - pre));
	};
	$.noLoop = () => {
		$._loop = false;
		if (looper != null) {
			if (useRAF) cancelAnimationFrame(looper);
			else clearTimeout(looper);
		}
		looper = null;
	};
	$.loop = () => {
		$._loop = true;
		if ($._setupDone && looper == null) $._draw();
	};
	$.isLooping = () => $._loop;
	$.redraw = (n = 1) => {
		$._redraw = true;
		for (let i = 0; i < n; i++) {
			$._draw();
		}
		$._redraw = false;
	};
	$.remove = () => {
		$.noLoop();
		$.canvas.remove();
	};

	$.frameRate = (hz) => {
		if (hz && hz != $._targetFrameRate) {
			$._targetFrameRate = hz;
			$._targetFrameDuration = 1000 / hz;

			if ($._loop && looper != null) {
				if (useRAF) cancelAnimationFrame(looper);
				else clearTimeout(looper);
				looper = null;
			}
			useRAF = hz <= 60;
			if ($._setupDone) {
				if (useRAF) looper = raf($._draw);
				else looper = setTimeout(() => $._draw(), $._targetFrameDuration);
			}
		}
		return $._frameRate;
	};
	$.getTargetFrameRate = () => $._targetFrameRate || 60;
	$.getFPS = () => $._fps;

	// shims for compatibility with p5.js libraries
	$.Element = function (a) {
		this.elt = a;
	};
	$._elements = [];
	$.describe = () => {};

	$.log = $.print = console.log;

	for (let m in Q5.modules) {
		Q5.modules[m]($, q);
	}

	let r = Q5.renderers[$._renderer];
	for (let m in r) {
		r[m]($, q);
	}

	// INIT

	for (let k in Q5) {
		if (k[1] != '_' && k[1] == k[1].toUpperCase()) {
			$[k] = Q5[k];
		}
	}

	if ($._graphics) return;

	if (scope == 'global') {
		let tmp = Object.assign({}, $);
		delete tmp.Color;
		Object.assign(Q5, tmp);
		delete Q5.Q5;
	}

	for (let m of Q5.methods.init) {
		m.call($);
	}

	for (let [n, fn] of Object.entries(Q5.prototype)) {
		if (n[0] != '_' && typeof $[n] == 'function') $[n] = fn.bind($);
	}

	for (let [n, fn] of Object.entries(Q5.preloadMethods)) {
		$[n] = function () {
			$._incrementPreload();
			return fn.apply($, arguments);
			// fn is responsible for calling $._decrementPreload
		};
	}

	if (scope == 'global') {
		let props = Object.getOwnPropertyNames($);
		for (let p of props) {
			if (p[0] != '_') globalScope[p] = $[p];
		}
		// to support p5.sound
		for (let p of ['_incrementPreload', '_decrementPreload']) {
			globalScope[p] = $[p];
		}
	}

	if (typeof scope == 'function') scope($);

	Q5._instanceCount++;

	let raf =
		window.requestAnimationFrame ||
		function (cb) {
			const idealFrameTime = $._lastFrameTime + $._targetFrameDuration;
			return setTimeout(() => {
				cb(idealFrameTime);
			}, idealFrameTime - performance.now());
		};

	let t = globalScope || $;

	$._isTouchAware = t.touchStarted || t.touchMoved || t.touchEnded;

	let userFns = [
		'setup',
		'postProcess',
		'mouseMoved',
		'mousePressed',
		'mouseReleased',
		'mouseDragged',
		'mouseClicked',
		'doubleClicked',
		'mouseWheel',
		'keyPressed',
		'keyReleased',
		'keyTyped',
		'touchStarted',
		'touchMoved',
		'touchEnded',
		'windowResized'
	];
	// shim if undefined
	for (let name of userFns) $[name] ??= () => {};

	function wrapWithFES(fn) {
		if (!t[fn]) $[fn] = () => {};
		else if ($._isGlobal) {
			$[fn] = (event) => {
				try {
					return t[fn](event);
				} catch (e) {
					if ($._fes) $._fes(e);
					throw e;
				}
			};
		}
	}

	async function _start() {
		wrapWithFES('preload');
		$.preload();
		await Promise.all($._preloadPromises);
		if ($._g) await Promise.all($._g._preloadPromises);

		for (let name of userFns) wrapWithFES(name);

		$.draw = t.draw || (() => {});

		millisStart = performance.now();
		await $.setup();
		$._setupDone = true;
		if ($.ctx === null) $.createCanvas(200, 200);
		if ($.frameCount) return;
		raf($._draw);
	}

	if (autoLoaded) _start();
	else setTimeout(_start, 32);
}

Q5.render = 'c2d';

Q5.renderers = {};
Q5.modules = {};

Q5._server = typeof process == 'object';
Q5._esm = this === undefined;

Q5._instanceCount = 0;
Q5._friendlyError = (msg, func) => {
	if (!Q5.disableFriendlyErrors) console.error(func + ': ' + msg);
};
Q5._validateParameters = () => true;

Q5.methods = {
	init: [],
	pre: [],
	post: [],
	remove: []
};
Q5.prototype.registerMethod = (m, fn) => Q5.methods[m].push(fn);

Q5.preloadMethods = {};
Q5.prototype.registerPreloadMethod = (n, fn) => (Q5.preloadMethods[n] = fn[n]);

if (Q5._server) global.p5 ??= global.Q5 = Q5;

if (typeof window == 'object') window.p5 ??= window.Q5 = Q5;
else global.window = 0;

function createCanvas(w, h, opt) {
	if (!Q5._hasGlobal) {
		let q = new Q5();
		q.createCanvas(w, h, opt);
	}
}

Q5.version = Q5.VERSION = '2.27';

if (typeof document == 'object') {
	document.addEventListener('DOMContentLoaded', () => {
		if (!Q5._hasGlobal) new Q5('auto');
	});
}
Q5.modules.canvas = ($, q) => {
	$._Canvas =
		window.OffscreenCanvas ||
		function () {
			return document.createElement('canvas');
		};

	if (Q5._server) {
		if (Q5._createServerCanvas) {
			q.canvas = Q5._createServerCanvas(100, 100);
		}
	} else if ($._scope == 'image' || $._scope == 'graphics') {
		q.canvas = new $._Canvas(100, 100);
	}

	if (!$.canvas) {
		if (typeof document == 'object') {
			q.canvas = document.createElement('canvas');
			$.canvas.id = 'q5Canvas' + Q5._instanceCount;
			$.canvas.classList.add('q5Canvas');
		} else $.noCanvas();
	}

	let c = $.canvas;
	$.width = 200;
	$.height = 200;
	$._pixelDensity = 1;

	$.displayDensity = () => window.devicePixelRatio || 1;

	if (c) {
		c.width = 200;
		c.height = 200;
		if ($._scope != 'image') {
			c.renderer = $._renderer;
			c[$._renderer] = true;

			$._pixelDensity = Math.ceil($.displayDensity());
		}
	}

	$._adjustDisplay = () => {
		if (c.style) {
			c.style.width = c.w + 'px';
			c.style.height = c.h + 'px';
		}
	};

	$.createCanvas = function (w, h, options) {
		if (typeof w == 'object') {
			options = w;
			w = null;
		}
		options ??= arguments[3];
		if (typeof options == 'string') options = { renderer: options };
		let opt = Object.assign({}, Q5.canvasOptions);
		if (typeof options == 'object') Object.assign(opt, options);

		if ($._scope != 'image') {
			if ($._scope == 'graphics') $._pixelDensity = this._pixelDensity;
			else if (!Q5._server) {
				// the canvas can become detached from the DOM
				// if the innerHTML of one of its parents is edited
				// check if canvas is still attached to the DOM
				let el = c;
				while (el && el.parentElement != document.body) {
					el = el.parentElement;
				}
				if (!el) {
					// reattach canvas to the DOM
					document.getElementById(c.id)?.remove();
					addCanvas();
				}

				if (window.IntersectionObserver) {
					let wasObserved = false;
					new IntersectionObserver((e) => {
						let isIntersecting = e[0].isIntersecting;

						if (!isIntersecting) {
							// the canvas might still be onscreen, just behind other elements
							let r = c.getBoundingClientRect();
							c.visible = r.top < window.innerHeight && r.bottom > 0 && r.left < window.innerWidth && r.right > 0;
						} else c.visible = true;

						if (!wasObserved) {
							$._wasLooping = $._loop;
							wasObserved = true;
						}

						if (c.visible) {
							if ($._wasLooping && !$._loop) $.loop();
						} else {
							$._wasLooping = $._loop;
							$.noLoop();
						}
					}).observe(c);
				}
			}
		}

		$._setCanvasSize(w, h);

		Object.assign(c, opt);
		let rend = $._createCanvas(c.w, c.h, opt);

		if ($._hooks) {
			for (let m of $._hooks.postCanvas) m();
		}

		if ($._addEventMethods) $._addEventMethods(c);

		return rend;
	};

	$.createGraphics = function (w, h, opt = {}) {
		if (typeof opt == 'string') opt = { renderer: opt };
		let g = new Q5('graphics', undefined, opt.renderer || ($._webgpuFallback ? 'webgpu-fallback' : $._renderer));
		opt.alpha ??= true;
		opt.colorSpace ??= $.canvas.colorSpace;
		g.createCanvas.call($, w, h, opt);
		let scale = g._pixelDensity * $._defaultImageScale;
		g.defaultWidth = w * scale;
		g.defaultHeight = h * scale;
		return g;
	};

	$._setCanvasSize = (w, h) => {
		if (w == undefined) h ??= window.innerHeight;
		else h ??= w;
		w ??= window.innerWidth;

		c.w = w = Math.ceil(w);
		c.h = h = Math.ceil(h);
		q.halfWidth = c.hw = w / 2;
		q.halfHeight = c.hh = h / 2;

		// changes the actual size of the canvas
		c.width = Math.ceil(w * $._pixelDensity);
		c.height = Math.ceil(h * $._pixelDensity);

		if (!$._da) {
			q.width = w;
			q.height = h;
		} else $.flexibleCanvas($._dau);

		if ($.displayMode && !c.displayMode) $.displayMode();
		else $._adjustDisplay();
	};

	$._setImageSize = (w, h) => {
		q.width = c.w = w;
		q.height = c.h = h;
		q.halfWidth = c.hw = w / 2;
		q.halfHeight = c.hh = h / 2;

		// changes the actual size of the canvas
		c.width = Math.ceil(w * $._pixelDensity);
		c.height = Math.ceil(h * $._pixelDensity);
	};

	$.defaultImageScale = (scale) => {
		if (!scale) return $._defaultImageScale;
		return ($._defaultImageScale = scale);
	};
	$.defaultImageScale(0.5);

	if ($._scope == 'image') return;

	if (c && $._scope != 'graphics') {
		c.parent = (el) => {
			if (c.parentElement) c.parentElement.removeChild(c);

			if (typeof el == 'string') el = document.getElementById(el);
			el.append(c);

			function parentResized() {
				if ($.frameCount > 1) {
					$._didResize = true;
					$._adjustDisplay();
				}
			}
			if (typeof ResizeObserver == 'function') {
				if ($._ro) $._ro.disconnect();
				$._ro = new ResizeObserver(parentResized);
				$._ro.observe(el);
			} else if (!$.frameCount) {
				window.addEventListener('resize', parentResized);
			}
		};

		function addCanvas() {
			let el = $._parent;
			el ??= document.getElementsByTagName('main')[0];
			if (!el) {
				el = document.createElement('main');
				document.body.append(el);
			}
			c.parent(el);
		}
		if (document.body) addCanvas();
		else document.addEventListener('DOMContentLoaded', addCanvas);
	}

	$.resizeCanvas = (w, h) => {
		if (!$.ctx) return $.createCanvas(w, h);
		if (w == c.w && h == c.h) return;

		$._resizeCanvas(w, h);
	};

	if (c && !Q5._createServerCanvas) c.resize = $.resizeCanvas;

	$.pixelDensity = (v) => {
		if (!v || v == $._pixelDensity) return $._pixelDensity;
		$._pixelDensity = v;
		$._resizeCanvas(c.w, c.h);
		return v;
	};

	$.flexibleCanvas = (unit = 400) => {
		if (unit) {
			$._da = c.width / (unit * $._pixelDensity);
			q.width = $._dau = unit;
			q.height = (c.h / c.w) * unit;
		} else $._da = 0;
	};

	$._styleNames = [
		'_fill',
		'_stroke',
		'_strokeWeight',
		'_doStroke',
		'_doFill',
		'_strokeSet',
		'_fillSet',
		'_shadow',
		'_doShadow',
		'_shadowOffsetX',
		'_shadowOffsetY',
		'_shadowBlur',
		'_tint',
		'_colorMode',
		'_colorFormat',
		'Color',
		'_imageMode',
		'_rectMode',
		'_ellipseMode',
		'_textSize',
		'_textAlign',
		'_textBaseline'
	];
	$._styles = [];

	$.pushStyles = () => {
		let styles = {};
		for (let s of $._styleNames) styles[s] = $[s];
		$._styles.push(styles);
	};
	$.popStyles = () => {
		let styles = $._styles.pop();
		for (let s of $._styleNames) $[s] = styles[s];

		if ($._webgpu) $.colorMode($._colorMode, $._colorFormat);
		else q.Color = styles.Color;
	};

	if (window && $._scope != 'graphics') {
		window.addEventListener('resize', () => {
			$._didResize = true;
			q.windowWidth = window.innerWidth;
			q.windowHeight = window.innerHeight;
			q.deviceOrientation = window.screen?.orientation?.type;
		});
	}
};

Q5.CENTER = 'center';
Q5.LEFT = 'left';
Q5.RIGHT = 'right';
Q5.TOP = 'top';
Q5.BOTTOM = 'bottom';

Q5.BASELINE = 'alphabetic';
Q5.MIDDLE = 'middle';

Q5.NORMAL = 'normal';
Q5.ITALIC = 'italic';
Q5.BOLD = 'bold';
Q5.BOLDITALIC = 'italic bold';

Q5.ROUND = 'round';
Q5.SQUARE = 'butt';
Q5.PROJECT = 'square';
Q5.MITER = 'miter';
Q5.BEVEL = 'bevel';
Q5.NONE = 'none';

Q5.SIMPLE = 'simple';

Q5.CHORD_OPEN = 0;
Q5.PIE_OPEN = 1;
Q5.PIE = 2;
Q5.CHORD = 3;

Q5.RADIUS = 'radius';
Q5.CORNER = 'corner';
Q5.CORNERS = 'corners';

Q5.OPEN = 0;
Q5.CLOSE = 1;

Q5.VIDEO = 'video';
Q5.AUDIO = 'audio';

Q5.LANDSCAPE = 'landscape';
Q5.PORTRAIT = 'portrait';

Q5.BLEND = 'source-over';
Q5.REMOVE = 'destination-out';
Q5.ADD = 'lighter';
Q5.DARKEST = 'darken';
Q5.LIGHTEST = 'lighten';
Q5.DIFFERENCE = 'difference';
Q5.SUBTRACT = 'subtract';
Q5.EXCLUSION = 'exclusion';
Q5.MULTIPLY = 'multiply';
Q5.SCREEN = 'screen';
Q5.REPLACE = 'copy';
Q5.OVERLAY = 'overlay';
Q5.HARD_LIGHT = 'hard-light';
Q5.SOFT_LIGHT = 'soft-light';
Q5.DODGE = 'color-dodge';
Q5.BURN = 'color-burn';

Q5.THRESHOLD = 1;
Q5.GRAY = 2;
Q5.OPAQUE = 3;
Q5.INVERT = 4;
Q5.POSTERIZE = 5;
Q5.DILATE = 6;
Q5.ERODE = 7;
Q5.BLUR = 8;
Q5.SEPIA = 9;
Q5.BRIGHTNESS = 10;
Q5.SATURATION = 11;
Q5.CONTRAST = 12;
Q5.HUE_ROTATE = 13;

Q5.C2D = Q5.P2D = Q5.P2DHDR = 'c2d';
Q5.WEBGL = 'webgl';
Q5.WEBGPU = 'webgpu';

Q5.canvasOptions = {
	alpha: false,
	colorSpace: 'display-p3'
};

if (!window.matchMedia || !matchMedia('(dynamic-range: high) and (color-gamut: p3)').matches) {
	Q5.canvasOptions.colorSpace = 'srgb';
} else Q5.supportsHDR = true;
Q5.renderers.c2d = {};

Q5.renderers.c2d.canvas = ($, q) => {
	let c = $.canvas;

	if ($.colorMode) $.colorMode('rgb', 255);

	$._createCanvas = function (w, h, options) {
		if (!c) {
			console.error('q5 canvas could not be created. skia-canvas and jsdom packages not found.');
			return;
		}
		q.ctx = q.drawingContext = c.getContext('2d', options);

		if ($._scope != 'image') {
			// default styles
			$.ctx.fillStyle = $._fill = 'white';
			$.ctx.strokeStyle = $._stroke = 'black';
			$.ctx.lineCap = 'round';
			$.ctx.lineJoin = 'miter';
			$.ctx.textAlign = 'left';
			$._strokeWeight = 1;
		}
		$.ctx.scale($._pixelDensity, $._pixelDensity);
		$.ctx.save();
		return c;
	};

	$.clear = () => {
		$.ctx.save();
		$.ctx.resetTransform();
		$.ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
		$.ctx.restore();
	};

	if ($._scope == 'image') return;

	$.background = function (c) {
		$.ctx.save();
		$.ctx.resetTransform();
		$.ctx.globalAlpha = 1;
		if (c.canvas) $.image(c, 0, 0, $.canvas.width, $.canvas.height);
		else {
			if (Q5.Color && !c._q5Color) c = $.color(...arguments);
			$.ctx.fillStyle = c.toString();
			$.ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
		}
		$.ctx.restore();
	};

	$._resizeCanvas = (w, h) => {
		let t = {};
		for (let prop in $.ctx) {
			if (typeof $.ctx[prop] != 'function') t[prop] = $.ctx[prop];
		}
		delete t.canvas;

		let o;
		if ($.frameCount > 1) {
			o = new $._Canvas(c.width, c.height);
			o.w = c.w;
			o.h = c.h;
			let oCtx = o.getContext('2d');
			oCtx.drawImage(c, 0, 0);
		}

		$._setCanvasSize(w, h);

		for (let prop in t) $.ctx[prop] = t[prop];
		$.scale($._pixelDensity);

		if (o) $.ctx.drawImage(o, 0, 0, o.w, o.h);
	};

	$.fill = function (c) {
		$._doFill = $._fillSet = true;
		if (Q5.Color) {
			if (!c._q5Color && (typeof c != 'string' || $._namedColors[c])) {
				c = $.color(...arguments);
			}
			if (c.a <= 0) return ($._doFill = false);
		}
		$.ctx.fillStyle = $._fill = c.toString();
	};

	$.stroke = function (c) {
		$._doStroke = $._strokeSet = true;
		if (Q5.Color) {
			if (!c._q5Color && (typeof c != 'string' || $._namedColors[c])) {
				c = $.color(...arguments);
			}
			if (c.a <= 0) return ($._doStroke = false);
		}
		$.ctx.strokeStyle = $._stroke = c.toString();
	};

	$.strokeWeight = (n) => {
		if (!n) $._doStroke = false;
		if ($._da) n *= $._da;
		$.ctx.lineWidth = $._strokeWeight = n || 0.0001;
	};

	$.noFill = () => ($._doFill = false);
	$.noStroke = () => ($._doStroke = false);
	$.opacity = (a) => ($.ctx.globalAlpha = a);

	$._doShadow = false;
	$._shadowOffsetX = $._shadowOffsetY = $._shadowBlur = 10;

	$.shadow = function (c) {
		if (Q5.Color) {
			if (!c._q5Color && (typeof c != 'string' || $._namedColors[c])) {
				c = $.color(...arguments);
			}
			if (c.a <= 0) return ($._doShadow = false);
		}
		$.ctx.shadowColor = $._shadow = c.toString();
		$._doShadow = true;

		$.ctx.shadowOffsetX ||= $._shadowOffsetX;
		$.ctx.shadowOffsetY ||= $._shadowOffsetY;
		$.ctx.shadowBlur ||= $._shadowBlur;
	};

	$.shadowBox = (offsetX, offsetY, blur) => {
		$.ctx.shadowOffsetX = $._shadowOffsetX = offsetX;
		$.ctx.shadowOffsetY = $._shadowOffsetY = offsetY || offsetX;
		$.ctx.shadowBlur = $._shadowBlur = blur || 0;
	};

	$.noShadow = () => {
		$._doShadow = false;
		$.ctx.shadowOffsetX = $.ctx.shadowOffsetY = $.ctx.shadowBlur = 0;
	};

	// DRAWING MATRIX

	$.translate = (x, y) => {
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		$.ctx.translate(x, y);
	};

	$.rotate = (r) => {
		if ($._angleMode) r = $.radians(r);
		$.ctx.rotate(r);
	};

	$.scale = (x, y) => {
		if (x.x) {
			y = x.y;
			x = x.x;
		}
		y ??= x;
		$.ctx.scale(x, y);
	};

	$.applyMatrix = (a, b, c, d, e, f) => $.ctx.transform(a, b, c, d, e, f);
	$.shearX = (ang) => $.ctx.transform(1, 0, $.tan(ang), 1, 0, 0);
	$.shearY = (ang) => $.ctx.transform(1, $.tan(ang), 0, 1, 0, 0);

	$.resetMatrix = () => {
		if ($.ctx) {
			$.ctx.resetTransform();
			$.scale($._pixelDensity);
			if ($._webgpu) $.translate($.halfWidth, $.halfHeight);
		}
	};

	$.pushMatrix = () => $.ctx.save();
	$.popMatrix = () => $.ctx.restore();

	let _popStyles = $.popStyles;

	$.popStyles = () => {
		_popStyles();

		$.ctx.fillStyle = $._fill;
		$.ctx.strokeStyle = $._stroke;
		$.ctx.lineWidth = $._strokeWeight;
		$.ctx.shadowColor = $._shadow;
		$.ctx.shadowOffsetX = $._doShadow ? $._shadowOffsetX : 0;
		$.ctx.shadowOffsetY = $._doShadow ? $._shadowOffsetY : 0;
		$.ctx.shadowBlur = $._doShadow ? $._shadowBlur : 0;
	};

	$.push = () => {
		$.ctx.save();
		$.pushStyles();
	};
	$.pop = () => {
		$.ctx.restore();
		_popStyles();
	};
};
Q5.renderers.c2d.shapes = ($) => {
	$._doStroke = true;
	$._doFill = true;
	$._strokeSet = false;
	$._fillSet = false;
	$._ellipseMode = Q5.CENTER;
	$._rectMode = Q5.CORNER;

	let firstVertex = true;
	let curveBuff = [];

	function ink() {
		if ($._doFill) $.ctx.fill();
		if ($._doStroke) $.ctx.stroke();
	}

	// DRAWING SETTINGS

	$.blendMode = (x) => ($.ctx.globalCompositeOperation = x);
	$.strokeCap = (x) => ($.ctx.lineCap = x);
	$.strokeJoin = (x) => ($.ctx.lineJoin = x);
	$.ellipseMode = (x) => ($._ellipseMode = x);
	$.rectMode = (x) => ($._rectMode = x);
	$.curveDetail = () => {};

	// DRAWING

	$.line = (x0, y0, x1, y1) => {
		if ($._doStroke) {
			$._da && ((x0 *= $._da), (y0 *= $._da), (x1 *= $._da), (y1 *= $._da));
			$.ctx.beginPath();
			$.ctx.moveTo(x0, y0);
			$.ctx.lineTo(x1, y1);
			$.ctx.stroke();
		}
	};

	const TAU = Math.PI * 2;

	function arc(x, y, w, h, lo, hi, mode) {
		if ($._angleMode) {
			lo = $.radians(lo);
			hi = $.radians(hi);
		}
		lo %= TAU;
		hi %= TAU;
		if (lo < 0) lo += TAU;
		if (hi < 0) hi += TAU;
		if (lo > hi) hi += TAU;
		if (lo == hi) return $.ellipse(x, y, w, h);

		w /= 2;
		h /= 2;

		w = Math.abs(w);
		h = Math.abs(h);

		if (!$._doFill && mode == $.PIE_OPEN) mode = $.CHORD_OPEN;

		$.ctx.beginPath();
		$.ctx.ellipse(x, y, w, h, 0, lo, hi);
		if (mode == $.PIE || mode == $.PIE_OPEN) $.ctx.lineTo(x, y);
		if ($._doFill) $.ctx.fill();

		if ($._doStroke) {
			if (mode == $.PIE || mode == $.CHORD) $.ctx.closePath();
			if (mode != $.PIE_OPEN) return $.ctx.stroke();

			$.ctx.beginPath();
			$.ctx.ellipse(x, y, w, h, 0, lo, hi);
			$.ctx.stroke();
		}
	}

	$.arc = (x, y, w, h, start, stop, mode) => {
		if (start == stop) return $.ellipse(x, y, w, h);

		if ($._da) {
			x *= $._da;
			y *= $._da;
			w *= $._da;
			h *= $._da;
		}
		mode ??= $.PIE_OPEN;

		if ($._ellipseMode == $.CENTER) {
			arc(x, y, w, h, start, stop, mode);
		} else if ($._ellipseMode == $.RADIUS) {
			arc(x, y, w * 2, h * 2, start, stop, mode);
		} else if ($._ellipseMode == $.CORNER) {
			arc(x + w / 2, y + h / 2, w, h, start, stop, mode);
		} else if ($._ellipseMode == $.CORNERS) {
			arc((x + w) / 2, (y + h) / 2, w - x, h - y, start, stop, mode);
		}
	};

	function ellipse(x, y, w, h) {
		$.ctx.beginPath();
		$.ctx.ellipse(x, y, Math.abs(w / 2), Math.abs(h / 2), 0, 0, TAU);
		ink();
	}

	$.ellipse = (x, y, w, h) => {
		h ??= w;
		if ($._da) {
			x *= $._da;
			y *= $._da;
			w *= $._da;
			h *= $._da;
		}
		if ($._ellipseMode == $.CENTER) {
			ellipse(x, y, w, h);
		} else if ($._ellipseMode == $.RADIUS) {
			ellipse(x, y, w * 2, h * 2);
		} else if ($._ellipseMode == $.CORNER) {
			ellipse(x + w / 2, y + h / 2, w, h);
		} else if ($._ellipseMode == $.CORNERS) {
			ellipse((x + w) / 2, (y + h) / 2, w - x, h - y);
		}
	};

	$.circle = (x, y, d) => {
		if ($._ellipseMode == $.CENTER) {
			if ($._da) {
				x *= $._da;
				y *= $._da;
				d *= $._da;
			}
			$.ctx.beginPath();
			$.ctx.arc(x, y, Math.abs(d / 2), 0, TAU);
			ink();
		} else $.ellipse(x, y, d, d);
	};

	$.point = (x, y) => {
		if ($._doStroke) {
			if (x.x) {
				y = x.y;
				x = x.x;
			}
			if ($._da) {
				x *= $._da;
				y *= $._da;
			}
			$.ctx.beginPath();
			$.ctx.moveTo(x, y);
			$.ctx.lineTo(x, y);
			$.ctx.stroke();
		}
	};

	function rect(x, y, w, h) {
		if ($._da) {
			x *= $._da;
			y *= $._da;
			w *= $._da;
			h *= $._da;
		}
		$.ctx.beginPath();
		$.ctx.rect(x, y, w, h);
		ink();
	}

	function roundedRect(x, y, w, h, tl, tr, br, bl) {
		if (tl === undefined) {
			return rect(x, y, w, h);
		}
		if (tr === undefined) {
			return roundedRect(x, y, w, h, tl, tl, tl, tl);
		}
		if ($._da) {
			x *= $._da;
			y *= $._da;
			w *= $._da;
			h *= $._da;
			tl *= $._da;
			tr *= $._da;
			bl *= $._da;
			br *= $._da;
		}
		$.ctx.roundRect(x, y, w, h, [tl, tr, br, bl]);
		ink();
	}

	$.rect = (x, y, w, h = w, tl, tr, br, bl) => {
		if ($._rectMode == $.CENTER) {
			roundedRect(x - w / 2, y - h / 2, w, h, tl, tr, br, bl);
		} else if ($._rectMode == $.RADIUS) {
			roundedRect(x - w, y - h, w * 2, h * 2, tl, tr, br, bl);
		} else if ($._rectMode == $.CORNER) {
			roundedRect(x, y, w, h, tl, tr, br, bl);
		} else if ($._rectMode == $.CORNERS) {
			roundedRect(x, y, w - x, h - y, tl, tr, br, bl);
		}
	};

	$.square = (x, y, s, tl, tr, br, bl) => {
		return $.rect(x, y, s, s, tl, tr, br, bl);
	};

	$.beginShape = () => {
		curveBuff = [];
		$.ctx.beginPath();
		firstVertex = true;
	};

	$.beginContour = () => {
		$.ctx.closePath();
		curveBuff = [];
		firstVertex = true;
	};

	$.endContour = () => {
		curveBuff = [];
		firstVertex = true;
	};

	$.vertex = (x, y) => {
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		curveBuff = [];
		if (firstVertex) {
			$.ctx.moveTo(x, y);
		} else {
			$.ctx.lineTo(x, y);
		}
		firstVertex = false;
	};

	$.bezierVertex = (cp1x, cp1y, cp2x, cp2y, x, y) => {
		if ($._da) {
			cp1x *= $._da;
			cp1y *= $._da;
			cp2x *= $._da;
			cp2y *= $._da;
			x *= $._da;
			y *= $._da;
		}
		curveBuff = [];
		$.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	};

	$.quadraticVertex = (cp1x, cp1y, x, y) => {
		if ($._da) {
			cp1x *= $._da;
			cp1y *= $._da;
			x *= $._da;
			y *= $._da;
		}
		curveBuff = [];
		$.ctx.quadraticCurveTo(cp1x, cp1y, x, y);
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
		curveBuff = [];
		if (close) $.ctx.closePath();
		ink();
	};

	$.curveVertex = (x, y) => {
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		curveBuff.push([x, y]);
		if (curveBuff.length < 4) return;

		let p0 = curveBuff.at(-4),
			p1 = curveBuff.at(-3),
			p2 = curveBuff.at(-2),
			p3 = curveBuff.at(-1);

		let cp1x = p1[0] + (p2[0] - p0[0]) / 6,
			cp1y = p1[1] + (p2[1] - p0[1]) / 6,
			cp2x = p2[0] - (p3[0] - p1[0]) / 6,
			cp2y = p2[1] - (p3[1] - p1[1]) / 6;

		if (firstVertex) {
			$.ctx.moveTo(p1[0], p1[1]);
			firstVertex = false;
		}
		$.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
	};

	$.curve = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.curveVertex(x1, y1);
		$.curveVertex(x2, y2);
		$.curveVertex(x3, y3);
		$.curveVertex(x4, y4);
		$.endShape();
	};

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

	$.erase = function (fillAlpha, strokeAlpha) {
		if ($._colorFormat == 255) {
			if (fillAlpha) fillAlpha /= 255;
			if (strokeAlpha) strokeAlpha /= 255;
		}
		$.ctx.save();
		$.ctx.globalCompositeOperation = 'destination-out';
		$.ctx.fillStyle = `rgb(0 0 0 / ${fillAlpha || 1})`;
		$.ctx.strokeStyle = `rgb(0 0 0 / ${strokeAlpha || 1})`;
	};

	$.noErase = function () {
		$.ctx.globalCompositeOperation = 'source-over';
		$.ctx.restore();
	};

	$.inFill = (x, y) => {
		const pd = $._pixelDensity;
		return $.ctx.isPointInPath(x * pd, y * pd);
	};

	$.inStroke = (x, y) => {
		const pd = $._pixelDensity;
		return $.ctx.isPointInStroke(x * pd, y * pd);
	};
};
Q5.renderers.c2d.image = ($, q) => {
	$._tint = null;
	let imgData = null;

	$.createImage = (w, h, opt) => {
		opt ??= {};
		opt.alpha ??= true;
		opt.colorSpace ??= $.canvas.colorSpace || Q5.canvasOptions.colorSpace;
		return new Q5.Image($, w, h, opt);
	};

	$.loadImage = function (url, cb, opt) {
		if (url.canvas) return url;
		if (url.slice(-3).toLowerCase() == 'gif') {
			throw new Error(
				`q5 doesn't support GIFs. Use a video or p5play animation instead. https://github.com/q5js/q5.js/issues/84`
			);
		}
		let last = [...arguments].at(-1);
		if (typeof last == 'object') {
			opt = last;
			cb = null;
		} else opt = null;

		let g = $.createImage(1, 1, opt);
		let pd = g._pixelDensity;

		let img = new window.Image();
		img.crossOrigin = 'Anonymous';

		g.promise = new Promise((resolve, reject) => {
			img.onload = () => {
				img._pixelDensity = pd;
				g.defaultWidth = img.width * $._defaultImageScale;
				g.defaultHeight = img.height * $._defaultImageScale;
				g.naturalWidth = img.naturalWidth || img.width;
				g.naturalHeight = img.naturalHeight || img.height;
				g._setImageSize(Math.ceil(g.naturalWidth / pd), Math.ceil(g.naturalHeight / pd));

				g.ctx.drawImage(img, 0, 0);
				if (cb) cb(g);
				delete g.promise;
				resolve(g);
			};
			img.onerror = reject;
		});
		$._preloadPromises.push(g.promise);

		g.src = img.src = url;

		if (!$._usePreload) return g.promise;
		return g;
	};

	$.imageMode = (mode) => ($._imageMode = mode);

	$.image = (img, dx, dy, dw, dh, sx = 0, sy = 0, sw, sh) => {
		if (!img) return;
		let drawable = img.canvas || img;

		dw ??= img.defaultWidth || drawable.width || img.videoWidth;
		dh ??= img.defaultHeight || drawable.height || img.videoHeight;
		if ($._imageMode == 'center') {
			dx -= dw * 0.5;
			dy -= dh * 0.5;
		}
		if ($._da) {
			dx *= $._da;
			dy *= $._da;
			dw *= $._da;
			dh *= $._da;
			sx *= $._da;
			sy *= $._da;
			sw *= $._da;
			sh *= $._da;
		}
		let pd = img._pixelDensity || 1;
		if (!sw) {
			sw = drawable.width || drawable.videoWidth;
		} else sw *= pd;
		if (!sh) {
			sh = drawable.height || drawable.videoHeight;
		} else sh *= pd;

		if ($._tint) {
			if (img._retint || img._tint != $._tint) {
				img._tintImg ??= $.createImage(img.w, img.h, { pixelDensity: pd });

				if (img._tintImg.width != img.width || img._tintImg.height != img.height) {
					img._tintImg.resize(img.w, img.h);
				}

				let tnt = img._tintImg.ctx;
				tnt.globalCompositeOperation = 'copy';
				tnt.fillStyle = $._tint;
				tnt.fillRect(0, 0, img.width, img.height);

				if (img.canvas.alpha) {
					tnt.globalCompositeOperation = 'destination-in';
					tnt.drawImage(drawable, 0, 0, img.width, img.height);
				}

				tnt.globalCompositeOperation = 'multiply';
				tnt.drawImage(drawable, 0, 0, img.width, img.height);

				img._tint = $._tint;
				img._retint = false;
			}

			drawable = img._tintImg.canvas;
		}

		if (img.flipped) {
			$.ctx.save();
			$.ctx.translate(dx + dw, 0);
			$.ctx.scale(-1, 1);
			dx = 0;
		}
		$.ctx.drawImage(drawable, sx * pd, sy * pd, sw, sh, dx, dy, dw, dh);
		if (img.flipped) $.ctx.restore();
	};

	$.filter = (type, value) => {
		$.ctx.save();

		let f = '';

		if ($.ctx.filter) {
			if (typeof type == 'string') {
				f = type;
			} else if (type == Q5.GRAY) {
				f = `saturate(0%)`;
			} else if (type == Q5.INVERT) {
				f = `invert(100%)`;
			} else if (type == Q5.BLUR) {
				let r = Math.ceil(value * $._pixelDensity) || 1;
				f = `blur(${r}px)`;
			} else if (type == Q5.THRESHOLD) {
				value ??= 0.5;
				let b = Math.floor((0.5 / Math.max(value, 0.00001)) * 100);
				f = `saturate(0%) brightness(${b}%) contrast(1000000%)`;
			} else if (type == Q5.SEPIA) {
				f = `sepia(${value ?? 1})`;
			} else if (type == Q5.BRIGHTNESS) {
				f = `brightness(${value ?? 1})`;
			} else if (type == Q5.SATURATION) {
				f = `saturate(${value ?? 1})`;
			} else if (type == Q5.CONTRAST) {
				f = `contrast(${value ?? 1})`;
			} else if (type == Q5.HUE_ROTATE) {
				let unit = $._angleMode == 0 ? 'rad' : 'deg';
				f = `hue-rotate(${value}${unit})`;
			}

			if (f) {
				$.ctx.filter = f;
				if ($.ctx.filter == 'none') {
					throw new Error(`Invalid filter format: ${type}`);
				}
			}
		}

		if (!f) $._softFilter(type, value);

		$.ctx.globalCompositeOperation = 'source-over';
		$.ctx.drawImage($.canvas, 0, 0, $.canvas.w, $.canvas.h);
		$.ctx.restore();
		$.modified = $._retint = true;
	};

	if ($._scope == 'image') {
		$.resize = (w, h) => {
			let c = $.canvas;
			let o = new $._Canvas(c.width, c.height);
			let tmpCtx = o.getContext('2d', {
				colorSpace: c.colorSpace
			});
			tmpCtx.drawImage(c, 0, 0);
			$._setImageSize(w, h);
			$.defaultWidth = c.width * $._defaultImageScale;
			$.defaultHeight = c.height * $._defaultImageScale;

			$.ctx.clearRect(0, 0, c.width, c.height);
			$.ctx.drawImage(o, 0, 0, c.width, c.height);

			$.modified = $._retint = true;
		};
	}

	$._getImageData = (x, y, w, h) => {
		return $.ctx.getImageData(x, y, w, h, { colorSpace: $.canvas.colorSpace });
	};

	$.trim = () => {
		let pd = $._pixelDensity || 1;
		let w = $.canvas.width;
		let h = $.canvas.height;
		let data = $._getImageData(0, 0, w, h).data;
		let left = w,
			right = 0,
			top = h,
			bottom = 0;

		let i = 3;
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				if (data[i] !== 0) {
					if (x < left) left = x;
					if (x > right) right = x;
					if (y < top) top = y;
					if (y > bottom) bottom = y;
				}
				i += 4;
			}
		}
		top = Math.floor(top / pd);
		bottom = Math.floor(bottom / pd);
		left = Math.floor(left / pd);
		right = Math.floor(right / pd);

		return $.get(left, top, right - left + 1, bottom - top + 1);
	};

	$.mask = (img) => {
		$.ctx.save();
		$.ctx.resetTransform();
		let old = $.ctx.globalCompositeOperation;
		$.ctx.globalCompositeOperation = 'destination-in';
		$.ctx.drawImage(img.canvas, 0, 0);
		$.ctx.globalCompositeOperation = old;
		$.ctx.restore();

		$.modified = $._retint = true;
	};

	$.inset = (x, y, w, h, dx, dy, dw, dh) => {
		let pd = $._pixelDensity || 1;
		$.ctx.drawImage($.canvas, x * pd, y * pd, w * pd, h * pd, dx, dy, dw, dh);

		$.modified = $._retint = true;
	};

	$.copy = () => {
		let img = $.get();
		for (let prop in $) {
			if (typeof $[prop] != 'function' && !/(canvas|ctx|texture)/.test(prop)) {
				img[prop] = $[prop];
			}
		}
		return img;
	};

	$.get = (x, y, w, h) => {
		let pd = $._pixelDensity || 1;
		if (x !== undefined && w === undefined) {
			let c = $._getImageData(x * pd, y * pd, 1, 1).data;
			return [c[0], c[1], c[2], c[3] / 255];
		}
		x = Math.floor(x || 0) * pd;
		y = Math.floor(y || 0) * pd;
		w ??= $.width;
		h ??= $.height;
		let img = $.createImage(w, h, { pixelDensity: pd });
		img.ctx.drawImage($.canvas, x, y, w * pd, h * pd, 0, 0, w, h);
		img.width = w;
		img.height = h;
		return img;
	};

	$.set = (x, y, c) => {
		x = Math.floor(x);
		y = Math.floor(y);
		$.modified = $._retint = true;
		if (c.canvas) {
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
				$.pixels[idx] = c.r;
				$.pixels[idx + 1] = c.g;
				$.pixels[idx + 2] = c.b;
				$.pixels[idx + 3] = c.a;
			}
		}
	};

	$.loadPixels = () => {
		imgData = $._getImageData(0, 0, $.canvas.width, $.canvas.height);
		q.pixels = imgData.data;
	};
	$.updatePixels = () => {
		if (imgData != null) {
			$.ctx.putImageData(imgData, 0, 0);
			$.modified = $._retint = true;
		}
	};

	$.smooth = () => ($.ctx.imageSmoothingEnabled = true);
	$.noSmooth = () => ($.ctx.imageSmoothingEnabled = false);

	if ($._scope == 'image') return;

	$._saveCanvas = async (data, ext) => {
		data = data.canvas || data;
		if (data instanceof OffscreenCanvas) {
			const blob = await data.convertToBlob({ type: 'image/' + ext });

			return await new Promise((resolve) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result);
				reader.readAsDataURL(blob);
			});
		}
		return data.toDataURL('image/' + ext);
	};

	$.tint = function (c) {
		$._tint = (c._q5Color ? c : $.color(...arguments)).toString();
	};
	$.noTint = () => ($._tint = null);
};

Q5.Image = class {
	constructor(q, w, h, opt = {}) {
		let $ = this;
		$._scope = 'image';
		$.canvas = $.ctx = $.drawingContext = null;
		$.pixels = [];
		Q5.modules.canvas($, $);
		let r = Q5.renderers.c2d;
		for (let m of ['canvas', 'image', 'softFilters']) {
			if (r[m]) r[m]($, $);
		}
		$._pixelDensity = opt.pixelDensity || 1;
		$.createCanvas(w, h, opt);
		let scale = $._pixelDensity * q._defaultImageScale;
		$.defaultWidth = w * scale;
		$.defaultHeight = h * scale;
		delete $.createCanvas;
		$._loop = false;
	}
	get w() {
		return this.width;
	}
	get h() {
		return this.height;
	}
};
/* software implementation of image filters */
Q5.renderers.c2d.softFilters = ($) => {
	let u = null; // uint8 temporary buffer

	function ensureBuf() {
		let l = $.canvas.width * $.canvas.height * 4;
		if (!u || u.length != l) u = new Uint8ClampedArray(l);
	}

	function initSoftFilters() {
		$._filters = [];
		$._filters[Q5.THRESHOLD] = (d, thresh) => {
			if (thresh === undefined) thresh = 127.5;
			else thresh *= 255;
			for (let i = 0; i < d.length; i += 4) {
				const gray = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
				d[i] = d[i + 1] = d[i + 2] = gray >= thresh ? 255 : 0;
			}
		};
		$._filters[Q5.GRAY] = (d) => {
			for (let i = 0; i < d.length; i += 4) {
				const gray = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
				d[i] = d[i + 1] = d[i + 2] = gray;
			}
		};
		$._filters[Q5.OPAQUE] = (d) => {
			for (let i = 0; i < d.length; i += 4) {
				d[i + 3] = 255;
			}
		};
		$._filters[Q5.INVERT] = (d) => {
			for (let i = 0; i < d.length; i += 4) {
				d[i] = 255 - d[i];
				d[i + 1] = 255 - d[i + 1];
				d[i + 2] = 255 - d[i + 2];
			}
		};
		$._filters[Q5.POSTERIZE] = (d, lvl = 4) => {
			let lvl1 = lvl - 1;
			for (let i = 0; i < d.length; i += 4) {
				d[i] = (((d[i] * lvl) >> 8) * 255) / lvl1;
				d[i + 1] = (((d[i + 1] * lvl) >> 8) * 255) / lvl1;
				d[i + 2] = (((d[i + 2] * lvl) >> 8) * 255) / lvl1;
			}
		};
		$._filters[Q5.DILATE] = (d, func) => {
			func ??= Math.max;
			ensureBuf();
			u.set(d);
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
						d[oi + oj + k] = func(u[kt + oj], u[ko + l], u[ko + oj], u[ko + r], u[kb + oj]);
					}
				}
			}
		};
		$._filters[Q5.ERODE] = (d) => {
			$._filters[Q5.DILATE](d, Math.min);
		};
		$._filters[Q5.BLUR] = (d, r) => {
			r = r || 1;
			r = Math.floor(r * $._pixelDensity);
			ensureBuf();
			u.set(d);

			let ksize = r * 2 + 1;

			function gauss(ksize) {
				let im = new Float32Array(ksize);
				let sigma = 0.3 * r + 0.8;
				let ss2 = sigma * sigma * 2;
				for (let i = 0; i < ksize; i++) {
					let x = i - ksize / 2;
					let z = Math.exp(-(x * x) / ss2) / (2.5066282746 * sigma);
					im[i] = z;
				}
				return im;
			}

			let kern = gauss(ksize);
			let [w, h] = [$.canvas.width, $.canvas.height];
			for (let i = 0; i < h; i++) {
				for (let j = 0; j < w; j++) {
					let s0 = 0,
						s1 = 0,
						s2 = 0,
						s3 = 0;
					for (let k = 0; k < ksize; k++) {
						let jk = Math.min(Math.max(j - r + k, 0), w - 1);
						let idx = 4 * (i * w + jk);
						s0 += u[idx] * kern[k];
						s1 += u[idx + 1] * kern[k];
						s2 += u[idx + 2] * kern[k];
						s3 += u[idx + 3] * kern[k];
					}
					let idx = 4 * (i * w + j);
					d[idx] = s0;
					d[idx + 1] = s1;
					d[idx + 2] = s2;
					d[idx + 3] = s3;
				}
			}
			u.set(d);
			for (let i = 0; i < h; i++) {
				for (let j = 0; j < w; j++) {
					let s0 = 0,
						s1 = 0,
						s2 = 0,
						s3 = 0;
					for (let k = 0; k < ksize; k++) {
						let ik = Math.min(Math.max(i - r + k, 0), h - 1);
						let idx = 4 * (ik * w + j);
						s0 += u[idx] * kern[k];
						s1 += u[idx + 1] * kern[k];
						s2 += u[idx + 2] * kern[k];
						s3 += u[idx + 3] * kern[k];
					}
					let idx = 4 * (i * w + j);
					d[idx] = s0;
					d[idx + 1] = s1;
					d[idx + 2] = s2;
					d[idx + 3] = s3;
				}
			}
		};
	}

	$._softFilter = (typ, x) => {
		if (!$._filters) initSoftFilters();
		let imgData = $._getImageData(0, 0, $.canvas.width, $.canvas.height);
		$._filters[typ](imgData.data, x);
		$.ctx.putImageData(imgData, 0, 0);
	};
};
Q5.renderers.c2d.text = ($, q) => {
	$._textAlign = 'left';
	$._textBaseline = 'alphabetic';
	$._textSize = 12;

	let font = 'sans-serif',
		leadingSet = false,
		leading = 15,
		leadDiff = 3,
		emphasis = 'normal',
		weight = 'normal',
		fontMod = false,
		styleHash = 0,
		styleHashes = [],
		genTextImage = false,
		cacheSize = 0;

	let cache = ($._textCache = {});
	$._textCacheMaxSize = 12000;

	$.loadFont = (url, cb) => {
		let name = url.split('/').pop().split('.')[0].replace(' ', '');

		let f = new FontFace(name, `url(${url})`);
		document.fonts.add(f);
		f.promise = (async () => {
			let err;
			try {
				await f.load();
			} catch (e) {
				err = e;
			}
			delete f.promise;
			if (err) throw err;
			if (cb) cb(f);
			return f;
		})();
		$._preloadPromises.push(f.promise);
		$.textFont(name);
		if (!$._usePreload) return f.promise;
		return f;
	};

	$.textFont = (x) => {
		if (x && typeof x != 'string') x = x.family;
		if (!x || x == font) return font;
		font = x;
		fontMod = true;
		styleHash = -1;
	};

	$.textSize = (x) => {
		if (x == undefined) return $._textSize;
		if ($._da) x *= $._da;
		$._textSize = x;
		fontMod = true;
		styleHash = -1;
		if (!leadingSet) {
			leading = x * 1.25;
			leadDiff = leading - x;
		}
	};

	$.textStyle = (x) => {
		if (!x) return emphasis;
		emphasis = x;
		fontMod = true;
		styleHash = -1;
	};

	$.textWeight = (x) => {
		if (!x) return weight;
		weight = x;
		fontMod = true;
		styleHash = -1;
	};

	$.textLeading = (x) => {
		if (x == undefined) return leading || $._textSize * 1.25;
		leadingSet = true;
		if (x == leading) return leading;
		if ($._da) x *= $._da;
		leading = x;
		leadDiff = x - $._textSize;
		styleHash = -1;
	};

	$.textAlign = (horiz, vert) => {
		$.ctx.textAlign = $._textAlign = horiz;
		if (vert) {
			$.ctx.textBaseline = $._textBaseline = vert == $.CENTER ? 'middle' : vert;
		}
	};

	const updateFont = () => {
		$.ctx.font = `${emphasis} ${weight} ${$._textSize}px ${font}`;
		fontMod = false;
	};

	$.textWidth = (str) => {
		if (fontMod) updateFont();
		return $.ctx.measureText(str).width;
	};
	$.textAscent = (str) => {
		if (fontMod) updateFont();
		return $.ctx.measureText(str).actualBoundingBoxAscent;
	};
	$.textDescent = (str) => {
		if (fontMod) updateFont();
		return $.ctx.measureText(str).actualBoundingBoxDescent;
	};

	$.textFill = $.fill;
	$.textStroke = $.stroke;

	let updateStyleHash = () => {
		let styleString = font + $._textSize + emphasis + leading;

		let hash = 5381;
		for (let i = 0; i < styleString.length; i++) {
			hash = (hash * 33) ^ styleString.charCodeAt(i);
		}
		styleHash = hash >>> 0;
	};

	$.createTextImage = (str, w, h) => {
		genTextImage = true;
		let img = $.text(str, 0, 0, w, h);
		genTextImage = false;
		return img;
	};

	let lines = [];

	$.text = (str, x, y, w, h) => {
		if (str === undefined || (!$._doFill && !$._doStroke)) return;
		str = str.toString();
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		let ctx = $.ctx;
		let img, tX, tY;

		if (fontMod) updateFont();

		if (genTextImage) {
			if (styleHash == -1) updateStyleHash();

			img = cache[str];
			if (img) img = img[styleHash];

			if (img) {
				if (img._fill == $._fill && img._stroke == $._stroke && img._strokeWeight == $._strokeWeight) {
					return img;
				} else img.clear();
			}
		}

		if (str.indexOf('\n') == -1) lines[0] = str;
		else lines = str.split('\n');

		if (str.length > w) {
			let wrapped = [];
			for (let line of lines) {
				let i = 0;

				while (i < line.length) {
					let max = i + w;
					if (max >= line.length) {
						wrapped.push(line.slice(i));
						break;
					}
					let end = line.lastIndexOf(' ', max);
					if (end === -1 || end < i) end = max;
					wrapped.push(line.slice(i, end));
					i = end + 1;
				}
			}
			lines = wrapped;
		}

		if (!genTextImage) {
			tX = x;
			tY = y;
			if ($._textBaseline == 'middle') tY -= leading * (lines.length - 1) * 0.5;
			else if ($._textBaseline == 'bottom') tY -= leading * (lines.length - 1);
		} else {
			tX = 0;
			tY = leading;

			if (!img) {
				let ogBaseline = $.ctx.textBaseline;
				$.ctx.textBaseline = 'alphabetic';

				let measure = ctx.measureText(' ');
				let ascent = measure.fontBoundingBoxAscent;
				let descent = measure.fontBoundingBoxDescent;

				$.ctx.textBaseline = ogBaseline;

				let maxWidth = 0;
				for (let line of lines) {
					let lineWidth = ctx.measureText(line).width;
					if (lineWidth > maxWidth) maxWidth = lineWidth;
				}

				let imgW = Math.ceil(maxWidth),
					imgH = Math.ceil(leading * lines.length + descent);

				img = $.createImage.call($, imgW, imgH, {
					pixelDensity: $._pixelDensity
				});

				img._ascent = ascent;
				img._descent = descent;
				img._top = descent + leadDiff;
				img._middle = img._top + ascent * 0.5 + leading * (lines.length - 1) * 0.5;
				img._bottom = img._top + ascent + leading * (lines.length - 1);
				img._leading = leading;
			} else {
				img.modified = true;
			}

			img._fill = $._fill;
			img._stroke = $._stroke;
			img._strokeWeight = $._strokeWeight;

			ctx = img.ctx;

			ctx.font = $.ctx.font;
			ctx.fillStyle = $._fill;
			ctx.strokeStyle = $._stroke;
			ctx.lineWidth = $.ctx.lineWidth;
		}

		let ogFill;
		if (!$._fillSet) {
			ogFill = ctx.fillStyle;
			ctx.fillStyle = 'black';
		}

		let lineAmount = 0;
		for (let line of lines) {
			if ($._doStroke && $._strokeSet) ctx.strokeText(line, tX, tY);
			if ($._doFill) ctx.fillText(line, tX, tY);
			tY += leading;
			lineAmount++;
			if (lineAmount >= h) break;
		}
		lines = [];

		if (!$._fillSet) ctx.fillStyle = ogFill;

		if (genTextImage) {
			styleHashes.push(styleHash);
			(cache[str] ??= {})[styleHash] = img;

			cacheSize++;
			if (cacheSize > $._textCacheMaxSize) {
				let half = Math.ceil(cacheSize / 2);
				let hashes = styleHashes.splice(0, half);
				for (let s in cache) {
					s = cache[s];
					for (let h of hashes) delete s[h];
				}
				cacheSize -= half;
			}
			return img;
		}
	};

	$.textImage = (img, x, y) => {
		if (typeof img == 'string') img = $.createTextImage(img);

		let og = $._imageMode;
		$._imageMode = 'corner';

		let ta = $._textAlign;
		if (ta == 'center') x -= img.canvas.hw;
		else if (ta == 'right') x -= img.width;

		let bl = $._textBaseline;
		if (bl == 'alphabetic') y -= img._leading;
		else if (bl == 'middle') y -= img._middle;
		else if (bl == 'bottom') y -= img._bottom;
		else if (bl == 'top') y -= img._top;

		$.image(img, x, y);
		$._imageMode = og;
	};
};

Q5.fonts = [];
Q5.modules.color = ($, q) => {
	$.RGB = $.RGBA = $.RGBHDR = $._colorMode = 'rgb';
	$.HSL = 'hsl';
	$.HSB = 'hsb';
	$.OKLCH = 'oklch';

	$.SRGB = 'srgb';
	$.DISPLAY_P3 = 'display-p3';

	$.colorMode = (mode, format, gamut) => {
		$._colorMode = mode;
		let srgb = $.canvas.colorSpace == 'srgb' || gamut == 'srgb';
		format ??= mode == 'rgb' ? ($._c2d || srgb ? 255 : 1) : 1;
		$._colorFormat = format == 'integer' || format == 255 ? 255 : 1;
		if (mode == 'oklch') {
			q.Color = Q5.ColorOKLCH;
		} else if (mode == 'hsl') {
			q.Color = srgb ? Q5.ColorHSL : Q5.ColorHSL_P3;
		} else if (mode == 'hsb') {
			q.Color = srgb ? Q5.ColorHSB : Q5.ColorHSB_P3;
		} else {
			if ($._colorFormat == 255) {
				q.Color = srgb ? Q5.ColorRGB_8 : Q5.ColorRGB_P3_8;
			} else {
				q.Color = srgb ? Q5.ColorRGB : Q5.ColorRGB_P3;
			}
			$._colorMode = 'rgb';
		}
	};

	$._namedColors = {
		aqua: [0, 255, 255],
		black: [0, 0, 0],
		blue: [0, 0, 255],
		brown: [165, 42, 42],
		crimson: [220, 20, 60],
		cyan: [0, 255, 255],
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

	$.color = (c0, c1, c2, c3) => {
		let C = $.Color;
		if (c0._q5Color) return new C(...c0.levels);
		if (c1 == undefined) {
			if (typeof c0 == 'string') {
				if (c0[0] == '#') {
					if (c0.length <= 5) {
						if (c0.length > 4) c3 = parseInt(c0[4] + c0[4], 16);
						c2 = parseInt(c0[3] + c0[3], 16);
						c1 = parseInt(c0[2] + c0[2], 16);
						c0 = parseInt(c0[1] + c0[1], 16);
					} else {
						if (c0.length > 7) c3 = parseInt(c0.slice(7, 9), 16);
						c2 = parseInt(c0.slice(5, 7), 16);
						c1 = parseInt(c0.slice(3, 5), 16);
						c0 = parseInt(c0.slice(1, 3), 16);
					}
				} else if ($._namedColors[c0]) {
					[c0, c1, c2, c3] = $._namedColors[c0];
				} else {
					// css color string not parsed
					let c = new C(0, 0, 0);
					c._css = c0;
					c.toString = function () {
						return this._css;
					};
					return c;
				}

				if ($._colorFormat == 1) {
					c0 /= 255;
					if (c1) c1 /= 255;
					if (c2) c2 /= 255;
					if (c3) c3 /= 255;
				}
			}
			if (Array.isArray(c0) || c0.constructor == Float32Array) {
				[c0, c1, c2, c3] = c0;
			}
		}

		if (c2 == undefined) {
			if ($._colorMode == Q5.OKLCH) return new C(c0, 0, 0, c1);
			return new C(c0, c0, c0, c1);
		}
		return new C(c0, c1, c2, c3);
	};

	// deprecated
	$.red = (c) => c.r;
	$.green = (c) => c.g;
	$.blue = (c) => c.b;
	$.alpha = (c) => c.a;

	$.lightness = (c) => {
		if (c.l) return c.l;
		let l = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) * 100;
		return $._colorFormat == 255 ? l / 255 : l;
	};
	$.hue = (c) => {
		if (c.h) return c.h;
		let r = c.r;
		let g = c.g;
		let b = c.b;
		if ($._colorFormat == 255) {
			r /= 255;
			g /= 255;
			b /= 255;
		}
		let max = Math.max(r, g, b);
		let min = Math.min(r, g, b);
		let h;
		if (max == min) h = 0;
		else if (max == r) h = (60 * (g - b)) / (max - min);
		else if (max == g) h = (60 * (b - r)) / (max - min) + 120;
		else h = (60 * (r - g)) / (max - min) + 240;
		if (h < 0) h += 360;
		return h;
	};

	$.lerpColor = (a, b, t) => {
		t = Math.max(0, Math.min(1, t));
		if ($._colorMode == 'rgb') {
			return new $.Color($.lerp(a.r, b.r, t), $.lerp(a.g, b.g, t), $.lerp(a.b, b.b, t), $.lerp(a.a, b.a, t));
		} else {
			let deltaH = b.h - a.h;
			if (deltaH > 180) deltaH -= 360;
			if (deltaH < -180) deltaH += 360;
			let h = a.h + t * deltaH;
			if (h < 0) h += 360;
			if (h > 360) h -= 360;
			return new $.Color($.lerp(a.l, b.l, t), $.lerp(a.c, b.c, t), h, $.lerp(a.a, b.a, t));
		}
	};
};

// COLOR CLASSES

Q5.Color = class {
	constructor() {
		this._q5Color = true;
	}
	get alpha() {
		return this.a;
	}
	set alpha(v) {
		this.a = v;
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
	get levels() {
		return [this.l, this.c, this.h, this.a];
	}
	equals(c) {
		return c && this.l == c.l && this.c == c.c && this.h == c.h && this.a == c.a;
	}
	isSameColor(c) {
		return c && this.l == c.l && this.c == c.c && this.h == c.h;
	}
	toString() {
		return `oklch(${this.l} ${this.c} ${this.h} / ${this.a})`;
	}

	get lightness() {
		return this.l;
	}
	set lightness(v) {
		this.l = v;
	}
	get chroma() {
		return this.c;
	}
	set chroma(v) {
		this.c = v;
	}
	get hue() {
		return this.h;
	}
	set hue(v) {
		this.h = v;
	}
};

Q5.ColorRGB = class extends Q5.Color {
	constructor(r, g, b, a) {
		super();
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a ?? 1;
	}
	get levels() {
		return [this.r, this.g, this.b, this.a];
	}
	equals(c) {
		return c && this.r == c.r && this.g == c.g && this.b == c.b && this.a == c.a;
	}
	isSameColor(c) {
		return c && this.r == c.r && this.g == c.g && this.b == c.b;
	}
	toString() {
		return `color(srgb ${this.r} ${this.g} ${this.b} / ${this.a})`;
	}

	get red() {
		return this.r;
	}
	set red(v) {
		this.r = v;
	}
	get green() {
		return this.g;
	}
	set green(v) {
		this.g = v;
	}
	get blue() {
		return this.b;
	}
	set blue(v) {
		this.b = v;
	}
};

Q5.ColorRGB_P3 = class extends Q5.ColorRGB {
	toString() {
		return `color(display-p3 ${this.r} ${this.g} ${this.b} / ${this.a})`;
	}
};

// legacy 8-bit (0-255) integer color format, srgb color space
Q5.ColorRGB_8 = class extends Q5.ColorRGB {
	constructor(r, g, b, a) {
		super(r, g, b, a ?? 255);
	}
	// deprecated set functions for backwards compatibility
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
	toString() {
		return `rgb(${this.r} ${this.g} ${this.b} / ${this.a / 255})`;
	}
};

// p3 10-bit color in integer color format, for backwards compatibility
Q5.ColorRGB_P3_8 = class extends Q5.ColorRGB_8 {
	constructor(r, g, b, a) {
		super(r, g, b, a ?? 255);
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

Q5.ColorHSL = class extends Q5.Color {
	constructor(h, s, l, a) {
		super();
		this.h = h;
		this.s = s;
		this.l = l;
		this.a = a ?? 1;
	}
	get levels() {
		return [this.h, this.s, this.l, this.a];
	}
	equals(c) {
		return c && this.h == c.h && this.s == c.s && this.l == c.l && this.a == c.a;
	}
	isSameColor(c) {
		return c && this.h == c.h && this.s == c.s && this.l == c.l;
	}
	toString() {
		return `hsl(${this.h} ${this.s} ${this.l} / ${this.a})`;
	}

	get hue() {
		return this.h;
	}
	set hue(v) {
		this.h = v;
	}
	get saturation() {
		return this.s;
	}
	set saturation(v) {
		this.s = v;
	}
	get lightness() {
		return this.l;
	}
	set lightness(v) {
		this.l = v;
	}
};

Q5.ColorHSL_P3 = class extends Q5.ColorHSL {
	toString() {
		let o = Q5.HSLtoRGB(this.h, this.s, this.l);
		return `color(display-p3 ${o.join(' ')} / ${this.a})`;
	}
};

Q5.ColorHSB = class extends Q5.ColorHSL {
	constructor(h, s, b, a) {
		super(h, s, b, a);
		delete this.l;
		this.b = b;
	}
	get levels() {
		return [this.h, this.s, this.b, this.a];
	}
	equals(c) {
		return c && this.h == c.h && this.s == c.s && this.b == c.b && this.a == c.a;
	}
	isSameColor(c) {
		return c && this.h == c.h && this.s == c.s && this.b == c.b;
	}
	toString() {
		let o = Q5.HSBtoHSL(this.h, this.s, this.b);
		return `hsl(${o.join(' ')} / ${this.a})`;
	}

	get v() {
		return this.b;
	}
	set v(v) {
		this.b = v;
	}
	get brightness() {
		return this.b;
	}
	set brightness(v) {
		this.b = v;
	}
	get value() {
		return this.b;
	}
	set value(v) {
		this.b = v;
	}
};

Q5.ColorHSB_P3 = class extends Q5.ColorHSB {
	toString() {
		let o = Q5.HSLtoRGB(...Q5.HSBtoHSL(this.h, this.s, this.b));
		return `color(display-p3 ${o.join(' ')} / ${this.a})`;
	}
};

Q5.HSLtoRGB = (h, s, l) => {
	l /= 100;
	let m = (s / 100) * Math.min(l, 1 - l);
	let f = (n, k = (n + h / 30) % 12) => l - m * Math.max(Math.min(k - 3, 9 - k, 1), -1);
	return [f(0), f(8), f(4)];
};

Q5.HSBtoHSL = (h, s, v, l = v * (1 - s / 200)) => [h, !l || l == 100 ? 0 : ((v - l) / Math.min(l, 100 - l)) * 100, l];

{
	const multiplyMatrices = (A, B) => [
		A[0] * B[0] + A[1] * B[1] + A[2] * B[2],
		A[3] * B[0] + A[4] * B[1] + A[5] * B[2],
		A[6] * B[0] + A[7] * B[1] + A[8] * B[2]
	];

	const oklch2oklab = (l, c, h) => [
		l,
		isNaN(h) ? 0 : c * Math.cos((h * Math.PI) / 180),
		isNaN(h) ? 0 : c * Math.sin((h * Math.PI) / 180)
	];

	const srgbLinear2rgb = (rgb) =>
		rgb.map((c) =>
			Math.max(
				0,
				Math.min(1, Math.abs(c) > 0.0031308 ? (c < 0 ? -1 : 1) * (1.055 * Math.abs(c) ** (1 / 2.4) - 0.055) : 12.92 * c)
			)
		);

	const oklab2xyz = (lab) => {
		const LMSg = multiplyMatrices(
			[
				1, 0.3963377773761749, 0.2158037573099136, 1, -0.1055613458156586, -0.0638541728258133, 1, -0.0894841775298119,
				-1.2914855480194092
			],
			lab
		);
		return multiplyMatrices(
			[
				1.2268798758459243, -0.5578149944602171, 0.2813910456659647, -0.0405757452148008, 1.112286803280317,
				-0.0717110580655164, -0.0763729366746601, -0.4214933324022432, 1.5869240198367816
			],
			LMSg.map((val) => val ** 3)
		);
	};
	const xyz2rgbLinear = (xyz) =>
		multiplyMatrices(
			[
				3.2409699419045226, -1.537383177570094, -0.4986107602930034, -0.9692436362808796, 1.8759675015077202,
				0.04155505740717559, 0.05563007969699366, -0.20397695888897652, 1.0569715142428786
			],
			xyz
		);

	Q5.OKLCHtoRGB = (l, c, h) => srgbLinear2rgb(xyz2rgbLinear(oklab2xyz(oklch2oklab(l, c, h))));
}
Q5.modules.display = ($) => {
	if (!$.canvas || $._scope == 'graphics') return;

	let c = $.canvas;

	$.MAXED = 'maxed';
	$.SMOOTH = 'smooth';
	$.PIXELATED = 'pixelated';

	if (Q5._instanceCount == 0 && !Q5._server) {
		document.head.insertAdjacentHTML(
			'beforeend',
			`<style>
html, body {
	margin: 0;
	padding: 0;
}
.q5Canvas {
	outline: none;
	-webkit-touch-callout: none;
	-webkit-text-size-adjust: none;
	-webkit-user-select: none;
	overscroll-behavior: none;
}
.q5-pixelated {
	image-rendering: pixelated;
	font-smooth: never;
	-webkit-font-smoothing: none;
}
.q5-centered,
.q5-maxed {
  display: flex;
	align-items: center;
	justify-content: center;
}
main.q5-centered,
main.q5-maxed {
	height: 100vh;
}
main {
	overscroll-behavior: none;
}
</style>`
		);
	}

	$._adjustDisplay = () => {
		let s = c.style;
		let p = c.parentElement;
		if (!s || !p || !c.displayMode) return;
		if (c.renderQuality == 'pixelated') {
			c.classList.add('q5-pixelated');
			$.pixelDensity(1);
			$.defaultImageScale(1);
			if ($.noSmooth) $.noSmooth();
			if ($.textFont) $.textFont('monospace');
		}
		if (c.displayMode == 'normal') {
			p.classList.remove('q5-centered', 'q5-maxed');
			s.width = c.w * c.displayScale + 'px';
			s.height = c.h * c.displayScale + 'px';
		} else {
			p.classList.add('q5-' + c.displayMode);
			p = p.getBoundingClientRect();
			if (c.w / c.h > p.width / p.height) {
				if (c.displayMode == 'centered') {
					s.width = c.w * c.displayScale + 'px';
					s.maxWidth = '100%';
				} else s.width = '100%';
				s.height = 'auto';
				s.maxHeight = '';
			} else {
				s.width = 'auto';
				s.maxWidth = '';
				if (c.displayMode == 'centered') {
					s.height = c.h * c.displayScale + 'px';
					s.maxHeight = '100%';
				} else s.height = '100%';
			}
		}
	};

	$.displayMode = (displayMode = 'normal', renderQuality = 'smooth', displayScale = 1) => {
		if (typeof displayScale == 'string') {
			displayScale = parseFloat(displayScale.slice(1));
		}
		if (displayMode == 'fullscreen') displayMode = 'maxed';
		if (displayMode == 'center') displayMode = 'centered';
		Object.assign(c, { displayMode, renderQuality, displayScale });
		if ($.ctx) $.pushStyles();
		$._adjustDisplay();
		if ($.ctx) $.popStyles();
	};

	$.fullscreen = (v) => {
		if (v == undefined) return document.fullscreenElement;
		if (v) document.body.requestFullscreen();
		else document.body.exitFullscreen();
	};
};
Q5.modules.dom = ($, q) => {
	$.elementMode = (mode) => ($._elementMode = mode);

	$.createElement = (tag, content) => {
		let el = document.createElement(tag);

		if ($._elementMode == 'center') {
			el.style.transform = 'translate(-50%, -50%)';
		}

		if (content) el.innerHTML = content;

		Object.defineProperty(el, 'x', {
			get: () => el._x,
			set: (v) => {
				let pos = el.style.position;
				if (!pos || pos == 'relative') {
					el.style.position = 'absolute';
				}
				let x = $.canvas.offsetLeft + v;
				el.style.left = x + 'px';
				el._x = x;
			}
		});

		Object.defineProperty(el, 'y', {
			get: () => el._y,
			set: (v) => {
				let pos = el.style.position;
				if (!pos || pos == 'relative') {
					el.style.position = 'absolute';
				}
				let y = $.canvas.offsetTop + v;
				el.style.top = y + 'px';
				el._y = y;
			}
		});

		Object.defineProperty(el, 'width', {
			get: () => parseFloat(el.style.width || 0),
			set: (v) => (el.style.width = v + 'px')
		});

		Object.defineProperty(el, 'height', {
			get: () => parseFloat(el.style.height || 0),
			set: (v) => (el.style.height = v + 'px')
		});

		el.position = (x, y, scheme) => {
			if (scheme) el.style.position = scheme;
			el.x = x;
			el.y = y;
			return el;
		};

		// the existing size property of input elements must be overwritten
		Object.defineProperty(el, 'size', {
			writable: true
		});

		el.size = (w, h) => {
			el.width = w;
			el.height = h;
			return el;
		};

		el.center = () => {
			el.style.position = 'absolute';
			el.x = $.canvas.hw;
			el.y = $.canvas.hh;
			return el;
		};

		el.show = () => {
			el.style.display = '';
			return el;
		};

		el.hide = () => {
			el.style.display = 'none';
			return el;
		};

		el.parent = (parent) => {
			parent.append(el);
			return el;
		};

		$._addEventMethods(el);

		$._elements.push(el);
		if ($.canvas) $.canvas.parentElement.append(el);
		else document.body.append(el);

		el.elt = el; // p5 compat

		return el;
	};
	$.createEl = $.createElement;

	$._addEventMethods = (el) => {
		let l = el.addEventListener;
		el.mousePressed = (cb) => l('mousedown', cb);
		el.mouseReleased = (cb) => l('mouseup', cb);
		el.mouseClicked = (cb) => l('click', cb);
		el.mouseMoved = (cb) => l('mousemove', cb);
		el.mouseWheel = (cb) => l('wheel', cb);
	};

	$.createA = (href, content, newTab) => {
		let el = $.createEl('a', content);
		el.href = href;
		el.target = newTab ? '_blank' : '_self';
		return el;
	};

	$.createButton = (content) => $.createEl('button', content);

	$.createCheckbox = (label = '', checked = false) => {
		let el = $.createEl('input');
		el.type = 'checkbox';
		el.checked = checked;
		let lbl = $.createEl('label', label);
		lbl.addEventListener('click', () => {
			el.checked = !el.checked;
			el.dispatchEvent(new Event('input', { bubbles: true }));
			el.dispatchEvent(new Event('change', { bubbles: true }));
		});
		el.insertAdjacentElement('afterend', lbl);
		el.label = lbl;
		return el;
	};

	$.createColorPicker = (value = '#ffffff') => {
		let el = $.createEl('input');
		el.type = 'color';
		el.value = value.toString();
		return el;
	};

	$.createDiv = (content) => $.createEl('div', content);

	$.createImg = (src) => {
		let el = $.createEl('img');
		el.crossOrigin = 'anonymous';
		el.src = src;
		return el;
	};

	$.createInput = (value = '', type = 'text') => {
		let el = $.createEl('input');
		el.value = value;
		el.type = type;
		el.style.boxSizing = 'border-box';
		return el;
	};

	$.createP = (content) => $.createEl('p', content);

	let radioCount = 0;
	$.createRadio = (name) => {
		let el = $.createEl('div');
		el.name = name || 'radio' + radioCount++;
		el.buttons = [];
		Object.defineProperty(el, 'value', {
			get: () => el.selected?.value,
			set: (v) => {
				let btn = el.buttons.find((b) => b.value == v);
				if (btn) {
					btn.checked = true;
					el.selected = btn;
				}
			}
		});
		el.option = (label, value) => {
			let btn = $.createEl('input');
			btn.type = 'radio';
			btn.name = el.name;
			btn.value = value || label;
			btn.addEventListener('input', () => (el.selected = btn));

			let lbl = $.createEl('label', label);
			lbl.addEventListener('click', () => {
				btn.checked = true;
				el.selected = btn;
				btn.dispatchEvent(new Event('input', { bubbles: true }));
				btn.dispatchEvent(new Event('change', { bubbles: true }));
			});

			btn.label = lbl;
			el.append(btn);
			el.append(lbl);
			el.buttons.push(btn);
			return el;
		};

		return el;
	};

	$.createSelect = (placeholder) => {
		let el = $.createEl('select');
		if (placeholder) {
			let opt = $.createEl('option', placeholder);
			opt.disabled = true;
			opt.selected = true;
			el.append(opt);
		}
		Object.defineProperty(el, 'selected', {
			get: () => {
				if (el.multiple) {
					return Array.from(el.selectedOptions).map((opt) => opt.textContent);
				}
				return el.selectedOptions[0]?.textContent;
			},
			set: (v) => {
				if (el.multiple) {
					Array.from(el.options).forEach((opt) => {
						opt.selected = v.includes(opt.textContent);
					});
				} else {
					const option = Array.from(el.options).find((opt) => opt.textContent === v);
					if (option) option.selected = true;
				}
			}
		});
		Object.defineProperty(el, 'value', {
			get: () => {
				if (el.multiple) {
					return Array.from(el.selectedOptions).map((o) => o.value);
				}
				return el.selectedOptions[0]?.value;
			},
			set: (v) => {
				if (el.multiple) {
					el.options.forEach((o) => (o.selected = v.includes(o.value)));
				} else {
					let opt;
					for (let i = 0; i < el.options.length; i++) {
						if (el.options[i].value == v) {
							opt = el.options[i];
							break;
						}
					}
					if (opt) opt.selected = true;
				}
			}
		});
		el.option = (label, value) => {
			let opt = $.createEl('option', label);
			opt.value = value || label;
			el.append(opt);
			return el;
		};
		return el;
	};

	$.createSlider = (min, max, value, step) => {
		let el = $.createEl('input');
		el.type = 'range';
		el.min = min;
		el.max = max;
		el.value = value;
		el.step = step;
		el.val = () => parseFloat(el.value);
		return el;
	};

	$.createSpan = (content) => $.createEl('span', content);

	$.createVideo = (src) => {
		let el = $.createEl('video');
		el.crossOrigin = 'anonymous';

		el._load = () => {
			el.width ||= el.videoWidth;
			el.height ||= el.videoHeight;
			el.defaultWidth = el.width * $._defaultImageScale;
			el.defaultHeight = el.height * $._defaultImageScale;
			el.ready = true;
		};

		if (src) {
			el.promise = new Promise((resolve) => {
				el.addEventListener('loadeddata', () => {
					el._load();
					resolve(el);
				});
				el.src = src;
			});
			$._preloadPromises.push(el.promise);

			if (!$._usePreload) return el.promise;
		}
		return el;
	};

	$.createCapture = function (type, flipped = true, cb) {
		let constraints = typeof type == 'string' ? { [type]: true } : type || { video: true, audio: true };

		if (constraints.video === true) {
			// basically request the highest resolution possible
			constraints.video = { width: 3840, height: 2160 };
		}
		constraints.video.facingMode ??= 'user';

		let vid = $.createVideo();
		vid.playsinline = vid.autoplay = true;
		if (flipped) {
			vid.flipped = true;
			vid.style.transform = 'scale(-1, 1)';
		}
		vid.loadPixels = () => {
			let g = $.createGraphics(vid.videoWidth, vid.videoHeight, { renderer: 'c2d' });
			g.image(vid, 0, 0);
			g.loadPixels();
			vid.pixels = g.pixels;
			g.remove();
		};
		vid.promise = (async () => {
			let stream;
			try {
				stream = await navigator.mediaDevices.getUserMedia(constraints);
			} catch (e) {
				throw e;
			}

			vid.srcObject = stream;
			await new Promise((resolve) => vid.addEventListener('loadeddata', resolve));

			vid._load();
			if (cb) cb(vid);
			return vid;
		})();
		$._preloadPromises.push(vid.promise);

		if (!$._usePreload) return vid.promise;
		return vid;
	};

	$.findElement = (selector) => document.querySelector(selector);
	$.findElements = (selector) => document.querySelectorAll(selector);
};
Q5.modules.fes = ($) => {
	$._fes = async (e) => {
		if (Q5.disableFriendlyErrors) return;

		let stackLines = e.stack?.split('\n');
		if (!e.stack || stackLines.length <= 1) return;

		let idx = 1;
		let sep = '(';
		if (navigator.userAgent.indexOf('Chrome') == -1) {
			idx = 0;
			sep = '@';
		}
		while (stackLines[idx].indexOf('q5') >= 0) idx++;

		let errFile = stackLines[idx].split(sep).at(-1);
		if (errFile.startsWith('blob:')) errFile = errFile.slice(5);
		let parts = errFile.split(':');
		let lineNum = parseInt(parts.at(-2));
		parts[parts.length - 1] = parts.at(-1).split(')')[0];
		let fileUrl = parts.slice(0, -2).join(':');
		let fileBase = fileUrl.split('/').at(-1);

		try {
			let res = await (await fetch(fileUrl)).text();
			let lines = res.split('\n');
			let errLine = lines[lineNum - 1].trim();

			let bug = ['🐛', '🐞', '🐜', '🦗', '🦋', '🪲'][Math.floor(Math.random() * 6)];

			console.log(
				'%cq5.js ' + bug + '%c Error in ' + fileBase + ' on line ' + lineNum + ':\n\n' + errLine,
				'background: #b7ebff; color: #000;',
				''
			);
		} catch (err) {}
	};
};
Q5.modules.input = ($, q) => {
	if ($._scope == 'graphics') return;

	$.mouseX = 0;
	$.mouseY = 0;
	$.pmouseX = 0;
	$.pmouseY = 0;
	$.touches = [];
	$.mouseButton = '';
	$.keyIsPressed = false;
	$.mouseIsPressed = false;
	$.key = '';
	$.keyCode = 0;

	$.UP_ARROW = 38;
	$.DOWN_ARROW = 40;
	$.LEFT_ARROW = 37;
	$.RIGHT_ARROW = 39;
	$.SHIFT = 16;
	$.TAB = 9;
	$.BACKSPACE = 8;
	$.ENTER = $.RETURN = 13;
	$.ALT = $.OPTION = 18;
	$.CONTROL = 17;
	$.DELETE = 46;
	$.ESCAPE = 27;

	$.ARROW = 'default';
	$.CROSS = 'crosshair';
	$.HAND = 'pointer';
	$.MOVE = 'move';
	$.TEXT = 'text';

	let keysHeld = {};
	let mouseBtns = [Q5.LEFT, Q5.CENTER, Q5.RIGHT];

	let c = $.canvas;

	$._startAudio = () => {
		if (!Q5.aud || Q5.aud?.state != 'running') $.userStartAudio();
	};

	$._updateMouse = (e) => {
		if (e.changedTouches) return;

		if (document.pointerLockElement) {
			// In pointer lock mode, update position based on movement
			q.mouseX += e.movementX;
			q.mouseY += e.movementY;
		} else if (c) {
			let rect = c.getBoundingClientRect();
			let sx = c.scrollWidth / $.width || 1;
			let sy = c.scrollHeight / $.height || 1;
			q.mouseX = (e.clientX - rect.left) / sx;
			q.mouseY = (e.clientY - rect.top) / sy;
			if ($._webgpu) {
				q.mouseX -= c.hw;
				q.mouseY -= c.hh;
			}
		} else {
			q.mouseX = e.clientX;
			q.mouseY = e.clientY;
		}
		q.moveX = e.movementX;
		q.moveY = e.movementY;
	};

	$._onmousedown = (e) => {
		if (!c?.visible) return;
		$._startAudio();
		$._updateMouse(e);
		q.mouseIsPressed = true;
		q.mouseButton = mouseBtns[e.button];
		$.mousePressed(e);
	};

	$._onmousemove = (e) => {
		$._updateMouse(e);
		if ($.mouseIsPressed) $.mouseDragged(e);
		else $.mouseMoved(e);
	};

	$._onmouseup = (e) => {
		if (!c?.visible) return;
		$._updateMouse(e);
		q.mouseIsPressed = false;
		$.mouseReleased(e);
	};

	$._onclick = (e) => {
		if (!c?.visible) return;
		$._updateMouse(e);
		q.mouseIsPressed = true;
		$.mouseClicked(e);
		q.mouseIsPressed = false;
	};

	$._ondblclick = (e) => {
		if (!c?.visible) return;
		$._updateMouse(e);
		q.mouseIsPressed = true;
		$.doubleClicked(e);
		q.mouseIsPressed = false;
	};

	$._onwheel = (e) => {
		if (!c?.visible) return;
		$._updateMouse(e);
		e.delta = e.deltaY;
		if ($.mouseWheel(e) == false || $._noScroll) e.preventDefault();
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

	$.noCursor = () => ($.canvas.style.cursor = 'none');
	$.noScroll = () => ($._noScroll = true);

	$.requestPointerLock = (unadjustedMovement = false) => {
		return document.body?.requestPointerLock({ unadjustedMovement });
	};
	$.exitPointerLock = () => document.exitPointerLock();

	$._onkeydown = (e) => {
		if (e.repeat) return;
		$._startAudio();
		q.keyIsPressed = true;
		q.key = e.key;
		q.keyCode = e.keyCode;
		keysHeld[$.keyCode] = keysHeld[$.key.toLowerCase()] = true;
		$.keyPressed(e);
		if (e.key.length == 1) $.keyTyped(e);
	};

	$._onkeyup = (e) => {
		q.keyIsPressed = false;
		q.key = e.key;
		q.keyCode = e.keyCode;
		keysHeld[$.keyCode] = keysHeld[$.key.toLowerCase()] = false;
		$.keyReleased(e);
	};

	$.keyIsDown = (v) => !!keysHeld[typeof v == 'string' ? v.toLowerCase() : v];

	function getTouchInfo(touch) {
		const rect = $.canvas.getBoundingClientRect();
		const sx = $.canvas.scrollWidth / $.width || 1;
		const sy = $.canvas.scrollHeight / $.height || 1;
		let modX = 0,
			modY = 0;
		if ($._webgpu) {
			modX = $.halfWidth;
			modY = $.halfHeight;
		}
		return {
			x: (touch.clientX - rect.left) / sx - modX,
			y: (touch.clientY - rect.top) / sy - modY,
			id: touch.identifier
		};
	}

	$._ontouchstart = (e) => {
		if (!c?.visible) return;
		$._startAudio();
		q.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware) {
			q.mouseX = $.touches[0].x;
			q.mouseY = $.touches[0].y;
			q.mouseIsPressed = true;
			q.mouseButton = $.LEFT;
			$.mousePressed(e);
		}
		$.touchStarted(e);
	};

	$._ontouchmove = (e) => {
		if (!c?.visible) return;
		q.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware) {
			q.mouseX = $.touches[0].x;
			q.mouseY = $.touches[0].y;
			if (!$.mouseDragged(e)) e.preventDefault();
		}
		if (!$.touchMoved(e)) e.preventDefault();
	};

	$._ontouchend = (e) => {
		if (!c?.visible) return;
		q.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware && !$.touches.length) {
			q.mouseIsPressed = false;
			if (!$.mouseReleased(e)) e.preventDefault();
		}
		if (!$.touchEnded(e)) e.preventDefault();
	};

	if (window) {
		let l = window.addEventListener;
		l('keydown', (e) => $._onkeydown(e), false);
		l('keyup', (e) => $._onkeyup(e), false);

		l('mousedown', (e) => $._onmousedown(e));
		l('mousemove', (e) => $._onmousemove(e), false);
		l('mouseup', (e) => $._onmouseup(e));
		l('click', (e) => $._onclick(e));
		l('dblclick', (e) => $._ondblclick(e));

		if (!c) l('wheel', (e) => $._onwheel(e));

		l('touchstart', (e) => $._ontouchstart(e));
		l('touchmove', (e) => $._ontouchmove(e));
		l('touchend', (e) => $._ontouchend(e));
		l('touchcancel', (e) => $._ontouchend(e));
	}

	// making the window level event listener for wheel events
	// not passive would be necessary to be able to use `e.preventDefault`
	// but browsers warn that it's bad for performance
	if (c) c.addEventListener('wheel', (e) => $._onwheel(e));
};
Q5.modules.math = ($, q) => {
	$.RADIANS = 0;
	$.DEGREES = 1;

	$.PI = Math.PI;
	$.HALF_PI = Math.PI / 2;
	$.QUARTER_PI = Math.PI / 4;
	$.TWO_PI = $.TAU = Math.PI * 2;

	$.abs = Math.abs;
	$.ceil = Math.ceil;
	$.exp = Math.exp;
	$.floor = $.int = Math.floor;
	$.loge = Math.log;
	$.mag = Math.hypot;
	$.max = Math.max;
	$.min = Math.min;
	$.pow = Math.pow;
	$.sqrt = Math.sqrt;

	$.SHR3 = 1;
	$.LCG = 2;

	$.round = (x, d = 0) => {
		let p = 10 ** d;
		return Math.round(x * p) / p;
	};

	let angleMode = ($._angleMode = 0);

	$.angleMode = (mode) => {
		angleMode = $._angleMode = mode == 0 || mode == 'radians' ? 0 : 1;
		return !angleMode ? 'radians' : 'degrees';
	};
	let DEGTORAD = ($._DEGTORAD = Math.PI / 180);
	let RADTODEG = ($._RADTODEG = 180 / Math.PI);
	$.degrees = (x) => x * $._RADTODEG;
	$.radians = (x) => x * $._DEGTORAD;

	$.map = Q5.prototype.map = (value, istart, istop, ostart, ostop, clamp) => {
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

	$.dist = function () {
		let a = arguments;
		if (a.length == 2) return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
		if (a.length == 4) return Math.hypot(a[0] - a[2], a[1] - a[3]);
		return Math.hypot(a[0] - a[3], a[1] - a[4], a[2] - a[5]);
	};

	$.lerp = (a, b, t) => a * (1 - t) + b * t;
	$.constrain = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
	$.norm = (value, start, stop) => $.map(value, start, stop, 0, 1);
	$.sq = (x) => x * x;
	$.fract = (x) => x - Math.floor(x);

	$.sin = (a) => Math.sin(!angleMode ? a : a * DEGTORAD);
	$.cos = (a) => Math.cos(!angleMode ? a : a * DEGTORAD);
	$.tan = (a) => Math.tan(!angleMode ? a : a * DEGTORAD);

	$.asin = (x) => {
		let a = Math.asin(x);
		return !angleMode ? a : a * RADTODEG;
	};
	$.acos = (x) => {
		let a = Math.acos(x);
		return !angleMode ? a : a * RADTODEG;
	};
	$.atan = (x) => {
		let a = Math.atan(x);
		return !angleMode ? a : a * RADTODEG;
	};
	$.atan2 = (y, x) => {
		let a = Math.atan2(y, x);
		return !angleMode ? a : a * RADTODEG;
	};

	function lcg() {
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
	}

	function shr3() {
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
	}

	let rng1 = shr3();
	rng1.setSeed();

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

	$.jit = (amt = 1) => $.random(-amt, amt);

	$.randomGenerator = (method) => {
		if (method == $.LCG) rng1 = lcg();
		else if (method == $.SHR3) rng1 = shr3();
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

	$.PERLIN = 'perlin';
	$.SIMPLEX = 'simplex';
	$.BLOCKY = 'blocky';

	$.NoiseGenerator = Q5.PerlinNoise;
	let _noise;

	$.noiseMode = (mode) => {
		q.NoiseGenerator = Q5[mode[0].toUpperCase() + mode.slice(1) + 'Noise'];
		_noise = null;
	};

	$.noiseSeed = (seed) => {
		_noise = new $.NoiseGenerator(seed);
	};

	$.noise = (x = 0, y = 0, z = 0) => {
		_noise ??= new $.NoiseGenerator();
		return _noise.noise(x, y, z);
	};

	$.noiseDetail = (lod, falloff) => {
		_noise ??= new $.NoiseGenerator();
		if (lod > 0) _noise.octaves = lod;
		if (falloff > 0) _noise.falloff = falloff;
	};
};

Q5.NoiseGenerator = class {};

Q5.PerlinNoise = class extends Q5.NoiseGenerator {
	constructor(seed) {
		super();
		this.grad3 = [
			[1, 1, 0],
			[-1, 1, 0],
			[1, -1, 0],
			[-1, -1, 0],
			[1, 0, 1],
			[-1, 0, 1],
			[1, 0, -1],
			[-1, 0, -1],
			[0, 1, 1],
			[0, -1, 1],
			[0, 1, -1],
			[0, -1, -1]
		];
		this.octaves = 1;
		this.falloff = 0.5;
		if (seed == undefined) {
			this.p = Array.from({ length: 256 }, () => Math.floor(Math.random() * 256));
		} else {
			this.p = this.seedPermutation(seed);
		}
		this.p = this.p.concat(this.p);
	}

	seedPermutation(seed) {
		let p = [];
		for (let i = 0; i < 256; i++) {
			p[i] = i;
		}

		let n, q;
		for (let i = 255; i > 0; i--) {
			seed = (seed * 16807) % 2147483647;
			n = seed % (i + 1);
			q = p[i];
			p[i] = p[n];
			p[n] = q;
		}

		return p;
	}

	dot(g, x, y, z) {
		return g[0] * x + g[1] * y + g[2] * z;
	}

	mix(a, b, t) {
		return (1 - t) * a + t * b;
	}

	fade(t) {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	noise(x, y, z) {
		let t = this;
		let total = 0;
		let freq = 1;
		let amp = 1;
		let maxAmp = 0;

		for (let i = 0; i < t.octaves; i++) {
			const X = Math.floor(x * freq) & 255;
			const Y = Math.floor(y * freq) & 255;
			const Z = Math.floor(z * freq) & 255;

			const xf = x * freq - Math.floor(x * freq);
			const yf = y * freq - Math.floor(y * freq);
			const zf = z * freq - Math.floor(z * freq);

			const u = t.fade(xf);
			const v = t.fade(yf);
			const w = t.fade(zf);

			const A = t.p[X] + Y;
			const AA = t.p[A] + Z;
			const AB = t.p[A + 1] + Z;
			const B = t.p[X + 1] + Y;
			const BA = t.p[B] + Z;
			const BB = t.p[B + 1] + Z;

			const lerp1 = t.mix(t.dot(t.grad3[t.p[AA] % 12], xf, yf, zf), t.dot(t.grad3[t.p[BA] % 12], xf - 1, yf, zf), u);
			const lerp2 = t.mix(
				t.dot(t.grad3[t.p[AB] % 12], xf, yf - 1, zf),
				t.dot(t.grad3[t.p[BB] % 12], xf - 1, yf - 1, zf),
				u
			);
			const lerp3 = t.mix(
				t.dot(t.grad3[t.p[AA + 1] % 12], xf, yf, zf - 1),
				t.dot(t.grad3[t.p[BA + 1] % 12], xf - 1, yf, zf - 1),
				u
			);
			const lerp4 = t.mix(
				t.dot(t.grad3[t.p[AB + 1] % 12], xf, yf - 1, zf - 1),
				t.dot(t.grad3[t.p[BB + 1] % 12], xf - 1, yf - 1, zf - 1),
				u
			);

			const mix1 = t.mix(lerp1, lerp2, v);
			const mix2 = t.mix(lerp3, lerp4, v);

			total += t.mix(mix1, mix2, w) * amp;

			maxAmp += amp;
			amp *= t.falloff;
			freq *= 2;
		}

		return (total / maxAmp + 1) / 2;
	}
};
Q5.modules.record = ($, q) => {
	let rec, btn0, btn1, timer, formatSelect, bitrateInput, audioToggle;

	$.recording = false;

	function initRecorder(opt = {}) {
		document.head.insertAdjacentHTML(
			'beforeend',
			`<style>
.rec {
	display: flex;
	z-index: 1000;
	gap: 6px;
	background: #1a1b1d;
	padding: 6px 8px;
	border-radius: 21px;
	box-shadow: #0000001a 0px 4px 12px;
	border: 2px solid transparent; 
	opacity: 0.6;
	transition: all 0.3s;
	width: 134px;
	overflow: hidden;
}

.rec:hover {
	width: unset;
	opacity: 0.96;
}

.rec.recording { border-color: #cc3e44; }

.rec button,
.rec select { cursor: pointer; }

.rec button,
.rec select,
.rec input,
.rec span {
	font-family: sans-serif;
	font-size: 14px;
	padding: 2px 10px;
	border-radius: 18px;
	outline: none;
	background: #232529;
	color: #d4dae6;
	box-shadow: #0000001a 0px 4px 12px;
	border: 1px solid #46494e;
	vertical-align: middle;
	line-height: 18px;
	transition: all 0.3s;
}

.rec .audio-toggle {
	font-size: 16px;
	padding: 2px 10px;
}

.rec .bitrate input {
	border-radius: 18px 0 0 18px;
	border-right: 0;
	width: 40px;
	padding: 2px 5px 2px 10px;
	text-align: right;
}

.rec .bitrate span {
	border-radius: 0 18px 18px 0;
	border-left: 0;
	padding: 2px 10px 2px 5px;
	background: #333;
}

.rec .record-button { 
	color: #cc3e44;
	font-size: 18px;
}

.rec select:hover,
.rec button:hover { background: #32343b; }

.rec button:disabled {
	opacity: 0.5;
	color: #969ba5;
	cursor: not-allowed;
}
</style>`
		);

		rec = $.createEl('div');
		rec.className = 'rec';
		rec.innerHTML = `
<button class="record-button"></button>
<span class="record-timer"></span>
<button></button>
`;

		[btn0, timer, btn1] = rec.children;

		rec.x = rec.y = 8;

		rec.resetTimer = () => (rec.time = { hours: 0, minutes: 0, seconds: 0, frames: 0 });
		rec.resetTimer();

		let f = 'video/mp4; codecs=';
		rec.formats = {
			'H.264': f + '"avc1.42E01E"',
			VP9: f + 'vp9'
		};
		let highProfile = f + '"avc1.640034"';

		let pixelCount = $.canvas.width * $.canvas.height;
		if (pixelCount > 3200000 && MediaRecorder.isTypeSupported(highProfile)) {
			rec.formats['H.264'] = highProfile;
		}

		Object.assign(rec.formats, opt.formats);

		formatSelect = $.createSelect('format');
		for (const name in rec.formats) {
			formatSelect.option(name, rec.formats[name]);
		}
		formatSelect.title = 'Video Format';
		rec.append(formatSelect);

		let div = $.createEl('div');
		div.className = 'bitrate';
		div.style.display = 'flex';
		rec.append(div);

		bitrateInput = $.createInput();
		let span = document.createElement('span');
		span.textContent = 'mbps';
		bitrateInput.title = span.title = 'Video Bitrate';
		div.append(bitrateInput);
		div.append(span);

		audioToggle = $.createEl('button');
		audioToggle.className = 'audio-toggle active';
		audioToggle.textContent = '🔊';
		audioToggle.title = 'Toggle Audio Recording';
		rec.append(audioToggle);

		rec.captureAudio = true;

		audioToggle.addEventListener('click', () => {
			rec.captureAudio = !rec.captureAudio;
			audioToggle.textContent = rec.captureAudio ? '🔊' : '🔇';
			audioToggle.classList.toggle('active', rec.captureAudio);
		});

		rec.encoderSettings = {};

		function changeFormat() {
			rec.encoderSettings.mimeType = formatSelect.value;
		}

		function changeBitrate() {
			rec.encoderSettings.videoBitsPerSecond = 1000000 * bitrateInput.value;
		}

		formatSelect.addEventListener('change', changeFormat);
		bitrateInput.addEventListener('change', changeBitrate);

		Object.defineProperty(rec, 'bitrate', {
			get: () => bitrateInput.value,
			set: (v) => {
				bitrateInput.value = v;
				changeBitrate();
			}
		});

		Object.defineProperty(rec, 'format', {
			get: () => formatSelect.selected,
			set: (v) => {
				v = v.toUpperCase();
				if (rec.formats[v]) {
					formatSelect.selected = v;
					changeFormat();
				}
			}
		});

		rec.format = 'H.264';

		let h = $.canvas.height;
		rec.bitrate = h >= 4320 ? 96 : h >= 2160 ? 64 : h >= 1440 ? 48 : h >= 1080 ? 32 : h >= 720 ? 26 : 16;

		btn0.addEventListener('click', () => {
			if (!$.recording) start();
			else if (!rec.paused) $.pauseRecording();
			else resumeRecording();
		});

		btn1.addEventListener('click', () => {
			if (rec.paused) $.saveRecording();
			else $.deleteRecording();
		});

		resetUI();

		$.registerMethod('post', updateTimer);
	}

	function start() {
		if ($.recording) return;

		$.userStartAudio();

		if (!rec.stream) {
			rec.frameRate ??= $.getTargetFrameRate();
			let canvasStream = $.canvas.captureStream(rec.frameRate);

			rec.videoTrack = canvasStream.getVideoTracks()[0];

			if (rec.captureAudio && $.getAudioContext) {
				let aud = $.getAudioContext();
				let dest = aud.createMediaStreamDestination();

				// if using p5.sound
				if (aud.destination.input) aud.destination.input.connect(dest);
				else Q5.soundOut.connect(dest);

				rec.audioTrack = dest.stream.getAudioTracks()[0];

				rec.stream = new MediaStream([rec.videoTrack, rec.audioTrack]);
			} else rec.stream = canvasStream;
		}

		rec.mediaRecorder = new MediaRecorder(rec.stream, rec.encoderSettings);

		rec.chunks = [];
		rec.mediaRecorder.addEventListener('dataavailable', (e) => {
			if (e.data.size > 0) rec.chunks.push(e.data);
		});

		rec.mediaRecorder.start();
		q.recording = true;
		rec.paused = false;
		rec.classList.add('recording');

		rec.resetTimer();
		resetUI(true);
	}

	function resumeRecording() {
		if (!$.recording || !rec.paused) return;

		rec.mediaRecorder.resume();
		rec.paused = false;
		resetUI(true);
	}

	function stop() {
		if (!$.recording) return;

		rec.resetTimer();
		rec.mediaRecorder.stop();
		q.recording = false;
		rec.paused = false;
		rec.classList.remove('recording');
	}

	function resetUI(r) {
		btn0.textContent = r ? '⏸' : '⏺';
		btn0.title = (r ? 'Pause' : 'Start') + ' Recording';
		btn1.textContent = r ? '🗑️' : '💾';
		btn1.title = (r ? 'Delete' : 'Save') + ' Recording';
		btn1.disabled = !r;
	}

	function updateTimer() {
		if ($.recording && !rec.paused) {
			rec.time.frames++;
			let fr = $.getTargetFrameRate();

			if (rec.time.frames >= fr) {
				rec.time.seconds += Math.floor(rec.time.frames / fr);
				rec.time.frames %= fr;

				if (rec.time.seconds >= 60) {
					rec.time.minutes += Math.floor(rec.time.seconds / 60);
					rec.time.seconds %= 60;

					if (rec.time.minutes >= 60) {
						rec.time.hours += Math.floor(rec.time.minutes / 60);
						rec.time.minutes %= 60;
					}
				}
			}
		}
		timer.textContent = formatTime();
	}

	function formatTime() {
		let { hours, minutes, seconds, frames } = rec.time;
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
			2,
			'0'
		)}:${String(frames).padStart(2, '0')}`;
	}

	$.createRecorder = (opt) => {
		if (!rec) initRecorder(opt);
		return rec;
	};

	$.record = (opt) => {
		if (!rec) {
			initRecorder(opt);
			rec.hide();
		}
		if (!$.recording) start();
		else if (rec.paused) resumeRecording();
	};

	$.pauseRecording = () => {
		if (!$.recording || rec.paused) return;

		rec.mediaRecorder.pause();
		rec.paused = true;

		resetUI();
		btn0.title = 'Resume Recording';
		btn1.disabled = false;
	};

	$.deleteRecording = () => {
		stop();
		resetUI();
		q.recording = false;
	};

	$.saveRecording = async (fileName) => {
		if (!$.recording) return;

		await new Promise((resolve) => {
			rec.mediaRecorder.onstop = resolve;
			stop();
		});

		let type = rec.encoderSettings.mimeType,
			extension = type.slice(6, type.indexOf(';')),
			dataUrl = URL.createObjectURL(new Blob(rec.chunks, { type })),
			iframe = document.createElement('iframe'),
			a = document.createElement('a');

		// Create an invisible iframe to detect load completion
		iframe.style.display = 'none';
		iframe.name = 'download_' + Date.now();
		document.body.append(iframe);

		a.target = iframe.name;
		a.href = dataUrl;
		fileName ??=
			document.title +
			' ' +
			new Date()
				.toLocaleString(undefined, { hour12: false })
				.replace(',', ' at')
				.replaceAll('/', '-')
				.replaceAll(':', '_');
		a.download = `${fileName}.${extension}`;

		await new Promise((resolve) => {
			iframe.onload = () => {
				document.body.removeChild(iframe);
				resolve();
			};
			a.click();
		});

		setTimeout(() => URL.revokeObjectURL(dataUrl), 1000);
		resetUI();
		q.recording = false;
	};
};
Q5.modules.sound = ($, q) => {
	$.Sound = Q5.Sound;
	let sounds = [];

	$.loadSound = (url, cb) => {
		let s = new Q5.Sound();
		sounds.push(s);

		s.promise = (async () => {
			let err;
			try {
				await s.load(url);
			} catch (e) {
				err = e;
			}
			delete s.promise;
			if (err) throw err;
			if (cb) cb(s);
			return s;
		})();
		$._preloadPromises.push(s.promise);

		if (!$._usePreload) return s.promise;
		return s;
	};

	$.loadAudio = (url, cb) => {
		let a = new Audio(url);
		a.crossOrigin = 'Anonymous';
		a.promise = new Promise((resolve, reject) => {
			a.addEventListener('canplaythrough', () => {
				if (!a.loaded) {
					a.loaded = true;
					if (cb) cb(a);
					resolve(a);
				}
			});
			a.addEventListener('suspend', resolve);
			a.addEventListener('error', reject);
		});
		$._preloadPromises.push(a.promise);

		if (!$._usePreload) return a.promise;
		return a;
	};

	$.getAudioContext = () => Q5.aud;

	$.userStartAudio = () => {
		if (window.AudioContext) {
			if (Q5._offlineAudio) {
				Q5._offlineAudio = false;
				Q5.aud = new window.AudioContext();
				Q5.soundOut = Q5.aud.createGain();
				Q5.soundOut.connect(Q5.aud.destination);

				for (let s of sounds) s.init();
			}
			return Q5.aud.resume();
		}
	};

	$.outputVolume = (level) => {
		if (Q5.soundOut) Q5.soundOut.gain.value = level;
	};
};

if (window.OfflineAudioContext) {
	Q5.aud = new window.OfflineAudioContext(2, 1, 44100);
	Q5._offlineAudio = true;
	Q5.soundOut = Q5.aud.createGain();
	Q5.soundOut.connect(Q5.aud.destination);
}

Q5.Sound = class {
	constructor() {
		this.sources = new Set();
		this.loaded = this.paused = false;
	}

	async load(url) {
		this.url = url;
		let res = await fetch(url);
		this.buffer = await res.arrayBuffer();
		this.buffer = await Q5.aud.decodeAudioData(this.buffer);
	}

	init() {
		this.gainNode = Q5.aud.createGain();
		this.pannerNode = Q5.aud.createStereoPanner();
		this.gainNode.connect(this.pannerNode);
		this.pannerNode.connect(Q5.soundOut);

		this.loaded = true;
		if (this._volume) this.volume = this._volume;
		if (this._pan) this.pan = this._pan;
	}

	_newSource(offset, duration) {
		let source = Q5.aud.createBufferSource();
		source.buffer = this.buffer;
		source.connect(this.gainNode);
		source.loop = this._loop;

		source._startedAt = Q5.aud.currentTime;
		source._offset = offset;
		source._duration = duration;

		source.start(0, source._offset, source._duration);

		this.sources.add(source);
		source.onended = () => {
			if (!this.paused) {
				this.ended = true;
				if (this._onended) this._onended();
				this.sources.delete(source);
			}
		};
	}

	play(time = 0, duration) {
		if (!this.loaded) return;

		if (!this.paused) {
			this._newSource(time, duration);
		} else {
			let timings = [];
			for (let source of this.sources) {
				timings.push(source._offset, source._duration);
				this.sources.delete(source);
			}
			for (let i = 0; i < timings.length; i += 2) {
				this._newSource(timings[i], timings[i + 1]);
			}
		}

		this.paused = this.ended = false;
	}

	pause() {
		if (!this.isPlaying()) return;

		for (let source of this.sources) {
			source.stop();
			let timePassed = Q5.aud.currentTime - source._startedAt;
			source._offset += timePassed;
			if (source._duration) source._duration -= timePassed;
		}
		this.paused = true;
	}

	stop() {
		for (let source of this.sources) {
			source.stop();
			this.sources.delete(source);
		}
		this.paused = false;
		this.ended = true;
	}

	get volume() {
		return this._volume;
	}
	set volume(level) {
		if (this.loaded) this.gainNode.gain.value = level;
		this._volume = level;
	}

	get pan() {
		return this._pan;
	}
	set pan(value) {
		if (this.loaded) this.pannerNode.pan.value = value;
		this._pan = value;
	}

	get loop() {
		return this._loop;
	}
	set loop(value) {
		this.sources.forEach((source) => (source.loop = value));
		this._loop = value;
	}

	get playing() {
		return !this.paused && this.sources.size > 0;
	}

	// backwards compatibility
	setVolume(level) {
		this.volume = level;
	}
	setPan(value) {
		this.pan = value;
	}
	setLoop(loop) {
		this.loop = loop;
	}
	isLoaded() {
		return this.loaded;
	}
	isPlaying() {
		return this.playing;
	}
	isPaused() {
		return this.paused;
	}
	isLooping() {
		return this._loop;
	}
	onended(cb) {
		this._onended = cb;
	}
};
Q5.modules.util = ($, q) => {
	$._loadFile = (url, cb, type) => {
		let ret = {};
		ret.promise = new Promise((resolve, reject) => {
			fetch(url)
				.then((res) => {
					if (!res.ok) {
						reject('error loading file');
						return null;
					}
					if (type == 'json') return res.json();
					return res.text();
				})
				.then((f) => {
					if (type == 'csv') f = $.CSV.parse(f);
					if (typeof f == 'string') ret.text = f;
					else Object.assign(ret, f);
					delete ret.promise;
					if (cb) cb(f);
					resolve(f);
				});
		});
		return ret;
	};

	$.loadText = (url, cb) => $._loadFile(url, cb, 'text');
	$.loadJSON = (url, cb) => $._loadFile(url, cb, 'json');
	$.loadCSV = (url, cb) => $._loadFile(url, cb, 'csv');

	const imgRegex = /(jpe?g|png|gif|webp|avif|svg)/i,
		fontRegex = /(ttf|otf|woff2?|eot|json)/i,
		fontCategoryRegex = /(serif|sans-serif|monospace|cursive|fantasy)/i,
		audioRegex = /(wav|flac|mp3|ogg|m4a|aac|aiff|weba)/i;

	$.load = function (...urls) {
		if (Array.isArray(urls[0])) urls = urls[0];

		let promises = [];

		for (let url of urls) {
			let ext = url.split('.').pop().toLowerCase();

			let obj;
			if (ext == 'json' && !url.includes('-msdf.')) {
				obj = $.loadJSON(url);
			} else if (ext == 'csv') {
				obj = $.loadCSV(url);
			} else if (imgRegex.test(ext)) {
				obj = $.loadImage(url);
			} else if (fontRegex.test(ext) || fontCategoryRegex.test(url)) {
				obj = $.loadFont(url);
			} else if (audioRegex.test(ext)) {
				obj = $.loadSound(url);
			} else {
				obj = $.loadText(url);
			}
			promises.push(obj.promise);
		}

		if (urls.length == 1) return promises[0];
		return Promise.all(promises);
	};

	async function saveFile(data, name, ext) {
		name = name || 'untitled';
		ext = ext || 'png';
		if (imgRegex.test(ext)) {
			if ($.canvas?.renderer == 'webgpu' && data.canvas?.renderer == 'c2d') {
				data = await $._g._saveCanvas(data, ext);
			} else {
				data = await $._saveCanvas(data, ext);
			}
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
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 1000);
	}

	$.save = (a, b, c) => {
		if (!a || (typeof a == 'string' && (!b || (!c && b.length < 5)))) {
			c = b;
			b = a;
			a = $;
		}
		if (a == $.canvas) a = $;
		if (c) saveFile(a, b, c);
		else if (b) {
			let lastDot = b.lastIndexOf('.');
			saveFile(a, b.slice(0, lastDot), b.slice(lastDot + 1));
		} else saveFile(a);
	};

	$.CSV = {};
	$.CSV.parse = (csv, sep = ',', lineSep = '\n') => {
		if (!csv.length) return [];
		let a = [],
			lns = csv.split(lineSep),
			headers = lns[0].split(sep).map((h) => h.replaceAll('"', ''));
		for (let i = 1; i < lns.length; i++) {
			let o = {},
				ln = lns[i].split(sep);
			headers.forEach((h, i) => (o[h] = JSON.parse(ln[i])));
			a.push(o);
		}
		return a;
	};

	if ($.canvas && !Q5._createServerCanvas) {
		$.canvas.save = $.saveCanvas = $.save;
	}

	if (typeof localStorage == 'object') {
		$.storeItem = (name, val) => localStorage.setItem(name, val);
		$.getItem = (name) => localStorage.getItem(name);
		$.removeItem = (name) => localStorage.removeItem(name);
		$.clearStorage = () => localStorage.clear();
	}

	$.year = () => new Date().getFullYear();
	$.day = () => new Date().getDay();
	$.hour = () => new Date().getHours();
	$.minute = () => new Date().getMinutes();
	$.second = () => new Date().getSeconds();

	$.nf = (n, l, r) => {
		let neg = n < 0;
		n = Math.abs(n);
		let parts = n.toFixed(r).split('.');
		parts[0] = parts[0].padStart(l, '0');
		let s = parts.join('.');
		if (neg) s = '-' + s;
		return s;
	};

	$.shuffle = (a, modify) => {
		if (!modify) a = [...a];
		for (let i = a.length - 1; i > 0; i--) {
			let j = Math.floor($.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	};
};
Q5.modules.vector = ($) => {
	$.Vector = Q5.Vector;
	$.createVector = (x, y, z) => new $.Vector(x, y, z, $);
};

Q5.Vector = class {
	constructor(x, y, z, $) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this._$ = $ || window;
		this._cn = null;
		this._cnsq = null;
	}

	set(x, y, z) {
		this.x = x?.x || x || 0;
		this.y = x?.y || y || 0;
		this.z = x?.z || z || 0;
		return this;
	}

	copy() {
		return new Q5.Vector(this.x, this.y, this.z);
	}

	_arg2v(x, y, z) {
		if (x?.x !== undefined) return x;
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

	setHeading(ang) {
		let mag = this.mag();
		this.x = mag * this._$.cos(ang);
		this.y = mag * this._$.sin(ang);
		return this;
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
		let amt = args.at(-1);
		if (amt == 0) return this;
		let u = this._arg2v(...args.slice(0, -1));
		this.x += (u.x - this.x) * amt;
		this.y += (u.y - this.y) * amt;
		this.z += (u.z - this.z) * amt;
		return this;
	}

	slerp() {
		let args = [...arguments];
		let amt = args.at(-1);
		if (amt == 0) return this;
		let u = this._arg2v(...args.slice(0, -1));
		if (amt == 1) return this.set(u);

		let v0Mag = this.mag();
		let v1Mag = u.mag();

		if (v0Mag == 0 || v1Mag == 0) {
			return this.mult(1 - amt).add(u.mult(amt));
		}

		let axis = Q5.Vector.cross(this, u);
		let axisMag = axis.mag();
		let theta = Math.atan2(axisMag, this.dot(u));

		if (axisMag > 0) {
			axis.div(axisMag);
		} else if (theta < this._$.HALF_PI) {
			return this.mult(1 - amt).add(u.mult(amt));
		} else {
			if (this.z == 0 && u.z == 0) axis.set(0, 0, 1);
			else if (this.x != 0) axis.set(this.y, -this.x, 0).normalize();
			else axis.set(1, 0, 0);
		}

		let ey = axis.cross(this);
		let lerpedMagFactor = 1 - amt + (amt * v1Mag) / v0Mag;
		let cosMultiplier = lerpedMagFactor * Math.cos(amt * theta);
		let sinMultiplier = lerpedMagFactor * Math.sin(amt * theta);

		this.x = this.x * cosMultiplier + ey.x * sinMultiplier;
		this.y = this.y * cosMultiplier + ey.y * sinMultiplier;
		this.z = this.z * cosMultiplier + ey.z * sinMultiplier;
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
Q5.Vector.slerp = (v, u, amt) => v.copy().slerp(u, amt);
Q5.Vector.limit = (v, m) => v.copy().limit(m);
Q5.Vector.heading = (v) => this._$.atan2(v.y, v.x);
Q5.Vector.magSq = (v) => v.x * v.x + v.y * v.y + v.z * v.z;
Q5.Vector.mag = (v) => Math.sqrt(Q5.Vector.magSq(v));
Q5.Vector.mult = (v, u) => v.copy().mult(u);
Q5.Vector.normalize = (v) => v.copy().normalize();
Q5.Vector.rem = (v, u) => v.copy().rem(u);
Q5.Vector.sub = (v, u) => v.copy().sub(u);
Q5.Vector.reflect = (v, n) => v.copy().reflect(n);
Q5.Vector.random2D = () => new Q5.Vector().random2D();
Q5.Vector.random3D = () => new Q5.Vector().random3D();
Q5.Vector.fromAngle = (th, l) => new Q5.Vector().fromAngle(th, l);
Q5.Vector.fromAngles = (th, ph, l) => new Q5.Vector().fromAngles(th, ph, l);
Q5.renderers.webgpu = {};

Q5.renderers.webgpu.canvas = ($, q) => {
	let c = $.canvas;

	if ($.colorMode) $.colorMode('rgb', 1);

	$._baseShaderCode = /* wgsl */ `
struct Q5 {
	width: f32,
	height: f32,
	halfWidth: f32,
	halfHeight: f32,
	pixelDensity: f32,
	frameCount: f32,
	time: f32,
	deltaTime: f32,
	mouseX: f32,
	mouseY: f32,
	mouseIsPressed: f32,
	keyCode: f32,
	keyIsPressed: f32
}`;

	$._g = $.createGraphics(1, 1, 'c2d');
	if ($._g.colorMode) $._g.colorMode($.RGB, 1);

	let encoder,
		pass,
		mainView,
		frameA,
		frameB,
		frameLayout,
		frameSampler,
		frameBindGroup,
		colorIndex = 1,
		colorStackIndex = 8;

	$._pipelineConfigs = [];
	$._pipelines = [];
	$._buffers = [];
	$._prevFramePL = 0;
	$._framePL = 0;

	// local variables used for slightly better performance

	// stores pipeline shifts and vertex counts/image indices
	let drawStack = ($._drawStack = []);

	// colors used for each draw call
	let colorStack = ($._colorStack = new Float32Array(1e6));

	// prettier-ignore
	colorStack.set([
		0, 0, 0, 1, // black
		1, 1, 1, 1 // white
	]);

	let mainLayout = Q5.device.createBindGroupLayout({
		label: 'mainLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: { type: 'uniform' }
			},
			{
				binding: 1,
				visibility: GPUShaderStage.VERTEX,
				buffer: { type: 'read-only-storage' }
			},
			{
				binding: 2,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: { type: 'read-only-storage' }
			}
		]
	});

	$._bindGroupLayouts = [mainLayout];

	let uniformBuffer = Q5.device.createBuffer({
		size: 64,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
	});

	let createMainView = () => {
		let w = $.canvas.width,
			h = $.canvas.height,
			size = [w, h],
			format = 'bgra8unorm';

		mainView = Q5.device
			.createTexture({
				size,
				sampleCount: 4,
				format,
				usage: GPUTextureUsage.RENDER_ATTACHMENT
			})
			.createView();

		let usage =
			GPUTextureUsage.COPY_SRC |
			GPUTextureUsage.COPY_DST |
			GPUTextureUsage.TEXTURE_BINDING |
			GPUTextureUsage.RENDER_ATTACHMENT;

		// start swapped so that beginRender will make frameA the first frame
		$._frameA = frameB = Q5.device.createTexture({ label: 'frameA', size, format, usage });
		$._frameB = frameA = Q5.device.createTexture({ label: 'frameB', size, format, usage });

		$._frameShaderCode =
			$._baseShaderCode +
			/* wgsl */ `
struct VertexParams {
	@builtin(vertex_index) vertexIndex: u32
}
struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) texCoord: vec2f
}

const ndc = array(vec2f(-1,-1), vec2f(1,-1), vec2f(-1,1), vec2f(1,1));
const quad = array(vec2f(0,1), vec2f(1,1), vec2f(0,0), vec2f(1,0));

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var tex: texture_2d<f32>;

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var f: FragParams;
	f.position = vec4f(ndc[v.vertexIndex], 0.0, 1.0);
	f.texCoord = quad[v.vertexIndex];
	return f;
}

@fragment
fn fragMain(f: FragParams ) -> @location(0) vec4f {
	return textureSample(tex, samp, f.texCoord);
}`;

		let frameShader = Q5.device.createShaderModule({
			label: 'frameShader',
			code: $._frameShaderCode
		});

		frameSampler = Q5.device.createSampler({
			magFilter: 'linear',
			minFilter: 'linear'
		});

		frameLayout = Q5.device.createBindGroupLayout({
			label: 'frameLayout',
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: { type: 'uniform' }
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: { type: 'filtering' }
				},
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					texture: { viewDimension: '2d', sampleType: 'float' }
				}
			]
		});

		let framePipelineLayout = Q5.device.createPipelineLayout({
			bindGroupLayouts: [frameLayout]
		});

		$._pipelineConfigs[0] = {
			layout: framePipelineLayout,
			vertex: { module: frameShader, entryPoint: 'vertexMain' },
			fragment: {
				module: frameShader,
				entryPoint: 'fragMain',
				targets: [{ format }]
			},
			primitive: { topology: 'triangle-strip' },
			multisample: { count: 4 }
		};

		// Create a pipeline for rendering frames
		$._pipelines[0] = Q5.device.createRenderPipeline($._pipelineConfigs[0]);
	};

	$._createCanvas = (w, h, opt) => {
		q.ctx = q.drawingContext = c.getContext('webgpu');

		opt.format ??= navigator.gpu.getPreferredCanvasFormat();
		opt.device ??= Q5.device;
		if (opt.alpha) opt.alphaMode = 'premultiplied';

		$.ctx.configure(opt);

		createMainView();
		return c;
	};

	$._resizeCanvas = (w, h) => {
		$._setCanvasSize(w, h);
		createMainView();
	};

	// since these values are checked so often in `addColor`,
	// they're stored in local variables for better performance
	let usingRGB = true,
		colorFormat = 1;

	if ($.colorMode) {
		let cm = $.colorMode;
		$.colorMode = function () {
			cm(...arguments);
			usingRGB = $._colorMode == 'rgb';
			colorFormat = $._colorFormat;
		};
	}

	let addColor = (r, g, b, a) => {
		if (typeof r === 'string' || usingRGB === false) {
			r = $.color(r, g, b, a);
		} else if (b === undefined) {
			// grayscale mode `fill(1, 0.5)`
			a = g ?? colorFormat;
			g = b = r;
		}
		a ??= colorFormat;
		if (r._q5Color) {
			let c = r;
			if (c.r != undefined) ({ r, g, b, a } = c);
			else {
				a = c.a;
				if (c.c != undefined) c = Q5.OKLCHtoRGB(c.l, c.c, c.h);
				else if (c.l != undefined) c = Q5.HSLtoRGB(c.h, c.s, c.l);
				else c = Q5.HSLtoRGB(...Q5.HSBtoHSL(c.h, c.s, c.b));
				[r, g, b] = c;
			}
		}

		if (colorFormat === 255) {
			r /= 255;
			g /= 255;
			b /= 255;
			a /= 255;
		}

		let cs = colorStack,
			i = colorStackIndex;
		cs[i++] = r;
		cs[i++] = g;
		cs[i++] = b;
		cs[i++] = a;
		colorStackIndex = i;

		colorIndex++;
	};

	$._stroke = 0;
	$._fill = $._tint = $._globalAlpha = 1;
	$._doFill = $._doStroke = true;

	$.fill = (r, g, b, a) => {
		addColor(r, g, b, a);
		$._doFill = $._fillSet = true;
		$._fill = colorIndex;
	};
	$.stroke = (r, g, b, a) => {
		addColor(r, g, b, a);
		$._doStroke = $._strokeSet = true;
		$._stroke = colorIndex;
	};
	$.tint = (r, g, b, a) => {
		addColor(r, g, b, a);
		$._tint = colorIndex;
	};
	$.opacity = (a) => ($._globalAlpha = a);
	$.noFill = () => ($._doFill = false);
	$.noStroke = () => ($._doStroke = false);
	$.noTint = () => ($._tint = 1);

	$._strokeWeight = 1;
	$._hsw = 0.5;
	$._scaledSW = 1;

	$.strokeWeight = (v) => {
		v = Math.abs(v);
		$._strokeWeight = v;
		$._scaledSW = v * $._scale;
		$._hsw = v / 2;
	};

	const MAX_TRANSFORMS = $._graphics ? 1000 : 1e7,
		MATRIX_SIZE = 16, // 4x4 matrix
		transforms = new Float32Array(MAX_TRANSFORMS * MATRIX_SIZE);

	let matrix,
		matrices = [],
		matricesIndexStack = [];

	// tracks if the matrix has been modified
	$._matrixDirty = false;

	// initialize with a 4x4 identity matrix
	// prettier-ignore
	matrices.push([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);

	transforms.set(matrices[0]);

	$.resetMatrix = () => {
		matrix = matrices[0].slice();
		$._matrixIndex = 0;
	};
	$.resetMatrix();

	$.translate = (x, y, z = 0) => {
		if (!x && !y && !z) return;
		// update the translation values
		let m = matrix;
		m[12] += x * m[0];
		m[13] -= y * m[5];
		m[14] += z * m[10];
		$._matrixDirty = true;
	};

	$.rotate = $.rotateZ = (a) => {
		if (!a) return;
		if ($._angleMode) a *= $._DEGTORAD;

		let cosR = Math.cos(a),
			sinR = Math.sin(a),
			m = matrix,
			m0 = m[0],
			m1 = m[1],
			m4 = m[4],
			m5 = m[5];

		// if identity matrix, just set the rotation values
		if (m0 == 1 && !m1 && !m4 && m5 == 1) {
			m[0] = cosR;
			m[1] = -sinR;
			m[4] = sinR;
			m[5] = cosR;
		} else {
			// combine the current rotation with the new rotation
			m[0] = m0 * cosR + m1 * sinR;
			m[1] = m1 * cosR - m0 * sinR;
			m[4] = m4 * cosR + m5 * sinR;
			m[5] = m5 * cosR - m4 * sinR;
		}

		$._matrixDirty = true;
	};

	$._scale = 1;

	$.scale = (x = 1, y, z = 1) => {
		y ??= x;

		$._scale = Math.max(Math.abs(x), Math.abs(y));
		$._scaledSW = $._strokeWeight * $._scale;

		let m = matrix;

		m[0] *= x;
		m[1] *= x;
		m[2] *= x;
		m[3] *= x;
		m[4] *= y;
		m[5] *= y;
		m[6] *= y;
		m[7] *= y;
		m[8] *= z;
		m[9] *= z;
		m[10] *= z;
		m[11] *= z;

		$._matrixDirty = true;
	};

	$.shearX = (ang) => {
		if (!ang) return;
		if ($._angleMode) ang *= $._DEGTORAD;

		let tanAng = Math.tan(ang),
			m = matrix,
			m0 = m[0],
			m1 = m[1],
			m4 = m[4],
			m5 = m[5];

		m[0] = m0 + m4 * tanAng;
		m[1] = m1 + m5 * tanAng;

		$._matrixDirty = true;
	};

	$.shearY = (ang) => {
		if (!ang) return;
		if ($._angleMode) ang *= $._DEGTORAD;

		let tanAng = Math.tan(ang),
			m = matrix,
			m0 = m[0],
			m1 = m[1],
			m4 = m[4],
			m5 = m[5];

		m[4] = m4 + m0 * tanAng;
		m[5] = m5 + m1 * tanAng;

		$._matrixDirty = true;
	};

	$.applyMatrix = (...args) => {
		let m;
		if (args.length == 1) m = args[0];
		else m = args;

		if (m.length == 9) {
			// convert 3x3 matrix to 4x4 matrix
			m = [m[0], m[1], 0, m[2], m[3], m[4], 0, m[5], 0, 0, 1, 0, m[6], m[7], 0, m[8]];
		} else if (m.length != 16) {
			throw new Error('Matrix must be a 3x3 or 4x4 array.');
		}

		// overwrite the current transformation matrix
		matrix = m.slice();
		$._matrixDirty = true;
	};

	// saves the current matrix state
	$._saveMatrix = () => {
		transforms.set(matrix, matrices.length * MATRIX_SIZE);
		$._matrixIndex = matrices.length;
		matrices.push(matrix.slice());
		$._matrixDirty = false;
	};

	// push the current matrix index onto the stack
	$.pushMatrix = () => {
		if ($._matrixDirty) $._saveMatrix();
		matricesIndexStack.push($._matrixIndex);
	};

	$.popMatrix = () => {
		if (!matricesIndexStack.length) {
			return console.warn('Matrix index stack is empty!');
		}
		// pop the last matrix index and set it as the current matrix index
		let idx = matricesIndexStack.pop();
		matrix = matrices[idx].slice();
		$._matrixIndex = idx;
		$._matrixDirty = false;
	};

	let _pushStyles = $.pushStyles;
	$.pushStyles = () => {
		_pushStyles();
		$.strokeWeight($._strokeWeight);
	};

	$.push = () => {
		$.pushMatrix();
		$.pushStyles();
	};

	$.pop = () => {
		$.popMatrix();
		$.popStyles();
	};

	$._calcBox = (x, y, w, h, mode) => {
		// left, right, top, bottom
		let l, r, t, b;
		if (!mode || mode == 'corner') {
			l = x;
			r = x + w;
			t = -y;
			b = -(y + h);
		} else if (mode == 'center') {
			let hw = w / 2,
				hh = h / 2;
			l = x - hw;
			r = x + hw;
			t = -(y - hh);
			b = -(y + hh);
		} else {
			// CORNERS
			l = x;
			r = w;
			t = -y;
			b = -h;
		}

		return [l, r, t, b];
	};

	// prettier-ignore
	let blendFactors = [
		'zero',                // 0
		'one',                 // 1
		'src-alpha',           // 2
		'one-minus-src-alpha', // 3
		'dst',                 // 4
		'dst-alpha',           // 5
		'one-minus-dst-alpha', // 6
		'one-minus-src'        // 7
	];
	let blendOps = [
		'add', // 0
		'subtract', // 1
		'reverse-subtract', // 2
		'min', // 3
		'max' // 4
	];

	const blendModes = {
		'source-over': [2, 3, 0, 2, 3, 0],
		'destination-over': [6, 1, 0, 6, 1, 0],
		'source-in': [5, 0, 0, 5, 0, 0],
		'destination-in': [0, 2, 0, 0, 2, 0],
		'source-out': [6, 0, 0, 6, 0, 0],
		'destination-out': [0, 3, 0, 0, 3, 0],
		'source-atop': [5, 3, 0, 5, 3, 0],
		'destination-atop': [6, 2, 0, 6, 2, 0],
		lighter: [1, 1, 0, 1, 1, 0],
		darken: [1, 1, 3, 3, 5, 0],
		lighten: [1, 1, 4, 3, 5, 0],
		replace: [1, 0, 0, 1, 0, 0]
	};

	$._blendModeNames = Object.keys(blendModes);

	$.blendConfigs = {};

	for (const [name, mode] of Object.entries(blendModes)) {
		$.blendConfigs[name] = {
			color: {
				srcFactor: blendFactors[mode[0]],
				dstFactor: blendFactors[mode[1]],
				operation: blendOps[mode[2]]
			},
			alpha: {
				srcFactor: blendFactors[mode[3]],
				dstFactor: blendFactors[mode[4]],
				operation: blendOps[mode[5]]
			}
		};
	}

	$._blendMode = 'source-over';

	$.blendMode = (mode) => {
		if (mode == $._blendMode) return;
		$._blendMode = mode;
		let i = $._blendModeNames.indexOf(mode);
		if (i == -1) {
			console.error(`Blend mode "${mode}" not supported in q5.js WebGPU.`);
			return;
		}
		drawStack.push(0, i);
	};

	let shouldClear;

	$.clear = () => {
		shouldClear = true;
	};

	$.background = (r, g, b, a) => {
		$.push();
		$.resetMatrix();
		if (r.canvas) {
			let img = r;
			$._imageMode = 'corner';
			$.image(img, -c.hw, -c.hh, c.w, c.h);
		} else {
			$._rectMode = 'corner';
			$.fill(r, g, b, a);
			$._doStroke = false;
			$.rect(-c.hw, -c.hh, c.w, c.h);
		}
		$.pop();
	};

	$._beginRender = () => {
		// swap the frame textures
		const temp = frameA;
		frameA = frameB;
		frameB = temp;

		encoder = Q5.device.createCommandEncoder();

		$._pass = pass = encoder.beginRenderPass({
			label: 'q5-webgpu',
			colorAttachments: [
				{
					view: mainView,
					resolveTarget: frameA.createView(),
					loadOp: 'clear',
					storeOp: 'store',
					clearValue: [0, 0, 0, 0]
				}
			]
		});

		frameBindGroup = Q5.device.createBindGroup({
			layout: frameLayout,
			entries: [
				{ binding: 0, resource: { buffer: uniformBuffer } },
				{ binding: 1, resource: frameSampler },
				{ binding: 2, resource: frameB.createView() }
			]
		});

		if (!shouldClear) {
			pass.setPipeline($._pipelines[$._prevFramePL]);
			pass.setBindGroup(0, frameBindGroup);
			pass.draw(4);
		}
		shouldClear = false;
	};

	$._render = () => {
		let transformBuffer = Q5.device.createBuffer({
			size: matrices.length * MATRIX_SIZE * 4, // 4 bytes per float
			usage: GPUBufferUsage.STORAGE,
			mappedAtCreation: true
		});

		new Float32Array(transformBuffer.getMappedRange()).set(transforms.slice(0, matrices.length * MATRIX_SIZE));
		transformBuffer.unmap();

		$._buffers.push(transformBuffer);

		let colorsBuffer = Q5.device.createBuffer({
			size: colorStackIndex * 4,
			usage: GPUBufferUsage.STORAGE,
			mappedAtCreation: true
		});

		new Float32Array(colorsBuffer.getMappedRange()).set(colorStack.slice(0, colorStackIndex));
		colorsBuffer.unmap();

		$._buffers.push(colorsBuffer);

		$._uniforms = [
			$.width,
			$.height,
			$.halfWidth,
			$.halfHeight,
			$._pixelDensity,
			$.frameCount,
			performance.now(),
			$.deltaTime,
			$.mouseX,
			$.mouseY,
			$.mouseIsPressed ? 1 : 0,
			$.keyCode,
			$.keyIsPressed ? 1 : 0
		];

		Q5.device.queue.writeBuffer(uniformBuffer, 0, new Float32Array($._uniforms));

		let mainBindGroup = Q5.device.createBindGroup({
			layout: mainLayout,
			entries: [
				{ binding: 0, resource: { buffer: uniformBuffer } },
				{ binding: 1, resource: { buffer: transformBuffer } },
				{ binding: 2, resource: { buffer: colorsBuffer } }
			]
		});

		pass.setBindGroup(0, mainBindGroup);

		for (let m of $._hooks.preRender) m();

		let drawVertOffset = 0,
			imageVertOffset = 0,
			textCharOffset = 0,
			curPipelineIndex = -1;

		for (let i = 0; i < drawStack.length; i += 2) {
			let v = drawStack[i + 1];

			if (drawStack[i] != curPipelineIndex) {
				if (drawStack[i] == 0) {
					// change blend mode
					let mode = $._blendModeNames[v];
					for (let i = 1; i < $._pipelines.length; i++) {
						$._pipelineConfigs[i].fragment.targets[0].blend = $.blendConfigs[mode];
						$._pipelines[i] = Q5.device.createRenderPipeline($._pipelineConfigs[i]);
					}
					continue;
				}

				curPipelineIndex = drawStack[i];
				pass.setPipeline($._pipelines[curPipelineIndex]);
			}

			if (curPipelineIndex == 4 || curPipelineIndex >= 4000) {
				// draw text
				let o = drawStack[i + 2];
				pass.setBindGroup(1, $._fonts[o].bindGroup);
				pass.setBindGroup(2, $._textBindGroup);

				// v is the number of characters in the text
				pass.draw(4, v, 0, textCharOffset);
				textCharOffset += v;
				i++;
			} else if (curPipelineIndex == 2 || curPipelineIndex == 3 || curPipelineIndex >= 2000) {
				// draw an image or video frame
				// v is the texture index
				pass.setBindGroup(1, $._textureBindGroups[v]);
				pass.draw(4, 1, imageVertOffset);
				imageVertOffset += 4;
			} else {
				// draw a shape
				// v is the number of vertices
				pass.draw(v, 1, drawVertOffset);
				drawVertOffset += v;
			}
		}
	};

	$._finishRender = () => {
		pass.end();

		pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: mainView,
					resolveTarget: $.ctx.getCurrentTexture().createView(),
					loadOp: 'clear',
					storeOp: 'store',
					clearValue: [0, 0, 0, 0]
				}
			]
		});

		frameBindGroup = Q5.device.createBindGroup({
			layout: frameLayout,
			entries: [
				{ binding: 0, resource: { buffer: uniformBuffer } },
				{ binding: 1, resource: frameSampler },
				{ binding: 2, resource: frameA.createView() }
			]
		});

		pass.setPipeline($._pipelines[$._framePL]);
		pass.setBindGroup(0, frameBindGroup);
		pass.draw(4);
		pass.end();

		Q5.device.queue.submit([encoder.finish()]);
		$._pass = pass = encoder = null;

		// clear the stacks for the next frame
		drawStack.splice(0, drawStack.length);
		colorIndex = 1;
		colorStackIndex = 8;
		matrices = [matrices[0]];
		matricesIndexStack = [];

		$._texture = frameA;

		for (let m of $._hooks.postRender) m();

		// destroy buffers
		Q5.device.queue.onSubmittedWorkDone().then(() => {
			for (let b of $._buffers) b.destroy();
			$._buffers = [];
		});
	};
};

Q5.initWebGPU = async () => {
	if (!navigator.gpu) {
		console.warn('q5 WebGPU not supported on this browser! Use Google Chrome or Edge.');
		return false;
	}
	if (!Q5.requestedGPU) {
		let adapter = await navigator.gpu.requestAdapter();
		if (!adapter) {
			console.warn('q5 WebGPU could not start! No appropriate GPUAdapter found, vulkan may need to be enabled.');
			return false;
		}
		Q5.device = await adapter.requestDevice();

		Q5.device.lost.then((e) => {
			console.error('WebGPU crashed!');
			console.error(e);
		});
	}
	return true;
};

Q5.WebGPU = async function (scope, parent) {
	if (!scope || scope == 'global') Q5._hasGlobal = true;
	if (!(await Q5.initWebGPU())) {
		return new Q5(scope, parent, 'webgpu-fallback');
	}
	return new Q5(scope, parent, 'webgpu');
};

Q5.webgpu = Q5.WebGPU;
Q5.renderers.webgpu.shapes = ($) => {
	$._shapesPL = 1;

	$._shapesShaderCode =
		$._baseShaderCode +
		/* wgsl */ `
struct VertexParams {
	@builtin(vertex_index) vertexIndex : u32,
	@location(0) pos: vec2f,
	@location(1) colorIndex: f32,
	@location(2) matrixIndex: f32
}
struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) color: vec4f
}

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
	var vert = vec4f(pos, 0.0, 1.0);
	vert = transforms[i32(matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	return vert;
}

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var vert = transformVertex(v.pos, v.matrixIndex);

	var f: FragParams;
	f.position = vert;
	f.color = colors[i32(v.colorIndex)];
	return f;
}

@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	return f.color;
}
`;

	let shapesShader = Q5.device.createShaderModule({
		label: 'shapesShader',
		code: $._shapesShaderCode
	});

	let c = $.canvas,
		drawStack = $._drawStack,
		vertexStack = new Float32Array($._graphics ? 1000 : 1e7),
		vertIndex = 0;
	const TAU = Math.PI * 2;
	const HALF_PI = Math.PI / 2;

	let vertexBufferLayout = {
		arrayStride: 16, // 4 floats * 4 bytes
		attributes: [
			{ format: 'float32x2', offset: 0, shaderLocation: 0 }, // position
			{ format: 'float32', offset: 8, shaderLocation: 1 }, // colorIndex
			{ format: 'float32', offset: 12, shaderLocation: 2 } // matrixIndex
		]
	};

	let pipelineLayout = Q5.device.createPipelineLayout({
		label: 'shapesPipelineLayout',
		bindGroupLayouts: $._bindGroupLayouts
	});

	$._pipelineConfigs[1] = {
		label: 'shapesPipeline',
		layout: pipelineLayout,
		vertex: {
			module: shapesShader,
			entryPoint: 'vertexMain',
			buffers: [vertexBufferLayout]
		},
		fragment: {
			module: shapesShader,
			entryPoint: 'fragMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs['source-over'] }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[1] = Q5.device.createRenderPipeline($._pipelineConfigs[1]);

	const addVert = (x, y, ci, ti) => {
		let v = vertexStack,
			i = vertIndex;
		v[i++] = x;
		v[i++] = y;
		v[i++] = ci;
		v[i++] = ti;
		vertIndex = i;
	};

	const addRect = (x1, y1, x2, y2, x3, y3, x4, y4, ci, ti) => {
		let v = vertexStack,
			i = vertIndex;

		v[i++] = x1;
		v[i++] = y1;
		v[i++] = ci;
		v[i++] = ti;

		v[i++] = x2;
		v[i++] = y2;
		v[i++] = ci;
		v[i++] = ti;

		v[i++] = x4;
		v[i++] = y4;
		v[i++] = ci;
		v[i++] = ti;

		v[i++] = x3;
		v[i++] = y3;
		v[i++] = ci;
		v[i++] = ti;

		vertIndex = i;
		drawStack.push($._shapesPL, 4);
	};

	const addArc = (x, y, a, b, startAngle, endAngle, n, ci, ti) => {
		let angleRange = endAngle - startAngle;
		let angleIncrement = angleRange / n;
		let t = startAngle;

		let v = vertexStack,
			i = vertIndex;

		for (let j = 0; j <= n; j++) {
			// add center vertex
			v[i++] = x;
			v[i++] = y;
			v[i++] = ci;
			v[i++] = ti;

			// calculate perimeter vertex
			let vx = x + a * Math.cos(t);
			let vy = y - b * Math.sin(t);

			// add perimeter vertex
			v[i++] = vx;
			v[i++] = vy;
			v[i++] = ci;
			v[i++] = ti;

			t += angleIncrement;
		}

		vertIndex = i;
		drawStack.push($._shapesPL, (n + 1) * 2);
	};

	const addArcStroke = (x, y, outerA, outerB, innerA, innerB, startAngle, endAngle, n, ci, ti) => {
		let angleRange = endAngle - startAngle;
		let angleIncrement = angleRange / n;
		let t = startAngle;

		let v = vertexStack,
			i = vertIndex;

		for (let j = 0; j <= n; j++) {
			// Outer vertex
			let vxOuter = x + outerA * Math.cos(t);
			let vyOuter = y - outerB * Math.sin(t);

			// Inner vertex
			let vxInner = x + innerA * Math.cos(t);
			let vyInner = y - innerB * Math.sin(t);

			// Add vertices for triangle strip
			v[i++] = vxOuter;
			v[i++] = vyOuter;
			v[i++] = ci;
			v[i++] = ti;

			v[i++] = vxInner;
			v[i++] = vyInner;
			v[i++] = ci;
			v[i++] = ti;

			t += angleIncrement;
		}

		vertIndex = i;
		drawStack.push($._shapesPL, (n + 1) * 2);
	};

	$.rectMode = (x) => ($._rectMode = x);

	$.rect = (x, y, w, h, rr = 0) => {
		h ??= w;
		let [l, r, t, b] = $._calcBox(x, y, w, h, $._rectMode);
		let ci, ti;
		if ($._matrixDirty) $._saveMatrix();
		ti = $._matrixIndex;

		if (!rr) {
			if ($._doFill) {
				ci = $._fill;
				addRect(l, t, r, t, r, b, l, b, ci, ti);
			}

			if ($._doStroke) {
				ci = $._stroke;
				let sw = $._strokeWeight / 2;

				// Calculate stroke positions
				let lsw = l - sw,
					rsw = r + sw,
					tsw = t + sw,
					bsw = b - sw,
					lpsw = l + sw,
					rpsw = r - sw,
					tpsw = t - sw,
					bpsw = b + sw;

				addRect(lsw, tpsw, rsw, tpsw, rsw, tsw, lsw, tsw, ci, ti); // Top
				addRect(lsw, bsw, rsw, bsw, rsw, bpsw, lsw, bpsw, ci, ti); // Bottom

				// Adjust side strokes to avoid overlapping corners
				tsw = t - sw;
				bsw = b + sw;

				addRect(lsw, tsw, lpsw, tsw, lpsw, bsw, lsw, bsw, ci, ti); // Left
				addRect(rpsw, tsw, rsw, tsw, rsw, bsw, rpsw, bsw, ci, ti); // Right
			}
			return;
		}

		l += rr;
		r -= rr;
		t -= rr;
		b += rr;

		// Clamp radius
		rr = Math.min(rr, Math.min(w, h) / 2);

		let n = getArcSegments(rr * $._scale);

		let trr = t + rr,
			brr = b - rr,
			lrr = l - rr,
			rrr = r + rr;

		if ($._doFill) {
			ci = $._fill;
			// Corner arcs
			addArc(r, b, rr, rr, 0, HALF_PI, n, ci, ti);
			addArc(l, b, rr, rr, Math.PI, HALF_PI, n, ci, ti);
			addArc(l, t, rr, rr, -Math.PI, -HALF_PI, n, ci, ti);
			addArc(r, t, rr, rr, -HALF_PI, 0, n, ci, ti);

			addRect(l, trr, r, trr, r, brr, l, brr, ci, ti); // center
			addRect(l, t, lrr, t, lrr, b, l, b, ci, ti); // Left
			addRect(rrr, t, r, t, r, b, rrr, b, ci, ti); // Right
		}

		if ($._doStroke) {
			ci = $._stroke;
			let hsw = $._hsw;

			let outerA = rr + hsw,
				outerB = rr + hsw,
				innerA = rr - hsw,
				innerB = rr - hsw;
			// Corner arc strokes
			addArcStroke(r, b, outerA, outerB, innerA, innerB, 0, HALF_PI, n, ci, ti);
			addArcStroke(l, b, outerA, outerB, innerA, innerB, Math.PI, HALF_PI, n, ci, ti);
			addArcStroke(l, t, outerA, outerB, innerA, innerB, -Math.PI, -HALF_PI, n, ci, ti);
			addArcStroke(r, t, outerA, outerB, innerA, innerB, -HALF_PI, 0, n, ci, ti);

			let lrrMin = lrr - hsw,
				lrrMax = lrr + hsw,
				rrrMin = rrr - hsw,
				rrrMax = rrr + hsw,
				trrMin = trr - hsw,
				trrMax = trr + hsw,
				brrMin = brr - hsw,
				brrMax = brr + hsw;

			// Side strokes - positioned outside
			addRect(lrrMin, t, lrrMax, t, lrrMax, b, lrrMin, b, ci, ti); // Left
			addRect(rrrMin, t, rrrMax, t, rrrMax, b, rrrMin, b, ci, ti); // Right
			addRect(l, trrMin, r, trrMin, r, trrMax, l, trrMax, ci, ti); // Top
			addRect(l, brrMin, r, brrMin, r, brrMax, l, brrMax, ci, ti); // Bottom
		}
	};

	$.square = (x, y, s) => $.rect(x, y, s, s);

	$.plane = (x, y, w, h) => {
		h ??= w;
		let [l, r, t, b] = $._calcBox(x, y, w, h, 'center');
		if ($._matrixDirty) $._saveMatrix();
		addRect(l, t, r, t, r, b, l, b, $._fill, $._matrixIndex);
	};

	// prettier-ignore
	const getArcSegments = (d) =>
		d < 4 ? 6 :
		d < 6 ? 8 :
		d < 10 ? 10 :
		d < 16 ? 12 :
		d < 20 ? 14 :
		d < 22 ? 16 :
		d < 24 ? 18 :
		d < 28 ? 20 :
		d < 34 ? 22 :
		d < 42 ? 24 :
		d < 48 ? 26 :
		d < 56 ? 28 :
		d < 64 ? 30 :
		d < 72 ? 32 :
		d < 84 ? 34 :
		d < 96 ? 36 :
		d < 98 ? 38 :
		d < 113 ? 40 :
		d < 149 ? 44 :
		d < 199 ? 48 :
		d < 261 ? 52 :
		d < 353 ? 56 :
		d < 461 ? 60 :
		d < 585 ? 64 :
		d < 1200 ? 70 :
		d < 1800 ? 80 :
		d < 2400 ? 90 :
		100;

	$._ellipseMode = Q5.CENTER;
	$.ellipseMode = (x) => ($._ellipseMode = x);

	$.ellipse = (x, y, w, h) => {
		let n = getArcSegments(Math.max(Math.abs(w), Math.abs(h)) * $._scale);
		let a = w / 2;
		let b = w == h ? a : h / 2;

		if ($._matrixDirty) $._saveMatrix();
		let ti = $._matrixIndex;

		if ($._doFill) {
			addArc(x, -y, a, b, 0, TAU, n, $._fill, ti);
		}
		if ($._doStroke) {
			let sw = $._strokeWeight / 2;
			// Draw the stroke as a ring using triangle strips
			addArcStroke(x, -y, a + sw, b + sw, a - sw, b - sw, 0, TAU, n, $._stroke, ti);
		}
	};

	$.circle = (x, y, d) => $.ellipse(x, y, d, d);

	$.arc = (x, y, w, h, start, stop) => {
		if (start === stop) return $.ellipse(x, y, w, h);

		// Convert angles if needed
		if ($._angleMode) {
			start = $.radians(start);
			stop = $.radians(stop);
		}

		// Normalize angles
		start %= TAU;
		stop %= TAU;
		if (start < 0) start += TAU;
		if (stop < 0) stop += TAU;
		if (start > stop) stop += TAU;
		if (start == stop) return $.ellipse(x, y, w, h);

		// Calculate position based on ellipseMode
		let a, b;
		if ($._ellipseMode == $.CENTER) {
			a = w / 2;
			b = h / 2;
		} else if ($._ellipseMode == $.RADIUS) {
			a = w;
			b = h;
		} else if ($._ellipseMode == $.CORNER) {
			x += w / 2;
			y += h / 2;
			a = w / 2;
			b = h / 2;
		} else if ($._ellipseMode == $.CORNERS) {
			x = (x + w) / 2;
			y = (y + h) / 2;
			a = (w - x) / 2;
			b = (h - y) / 2;
		}

		if ($._matrixDirty) $._saveMatrix();
		let ti = $._matrixIndex;
		let n = getArcSegments(Math.max(Math.abs(w), Math.abs(h)) * $._scale);

		// Draw fill
		if ($._doFill) {
			addArc(x, -y, a, b, start, stop, n, $._fill, ti);
		}

		// Draw stroke
		if ($._doStroke) {
			let hsw = $._hsw;
			addArcStroke(x, -y, a + hsw, b + hsw, a - hsw, b - hsw, start, stop, n, $._stroke, ti);
			if ($._strokeCap == 'round') {
				addArc(x + a * Math.cos(start), -y - b * Math.sin(start), hsw, hsw, 0, TAU, n, $._stroke, ti);
				addArc(x + a * Math.cos(stop), -y - b * Math.sin(stop), hsw, hsw, 0, TAU, n, $._stroke, ti);
			}
		}
	};

	$.point = (x, y) => {
		if ($._matrixDirty) $._saveMatrix();
		let ti = $._matrixIndex,
			ci = $._stroke,
			sw = $._strokeWeight;

		if ($._scaledSW < 2) {
			let [l, r, t, b] = $._calcBox(x, y, sw, sw, 'corner');
			addRect(l, t, r, t, r, b, l, b, ci, ti);
		} else {
			let n = getArcSegments($._scaledSW);
			sw /= 2;
			addArc(x, -y, sw, sw, 0, TAU, n, ci, ti);
		}
	};

	$._strokeCap = $._strokeJoin = 'round';
	$.strokeCap = (x) => ($._strokeCap = x);
	$.strokeJoin = (x) => ($._strokeJoin = x);
	$.lineMode = () => {
		$._strokeCap = 'square';
		$._strokeJoin = 'none';
	};

	$.line = (x1, y1, x2, y2) => {
		if ($._matrixDirty) $._saveMatrix();
		let ti = $._matrixIndex,
			ci = $._stroke,
			sw = $._strokeWeight,
			hsw = $._hsw;

		// calculate the direction vector and length
		let dx = x2 - x1,
			dy = y2 - y1,
			length = Math.hypot(dx, dy);

		// calculate the perpendicular vector for line thickness
		let px = -(dy / length) * hsw,
			py = (dx / length) * hsw;

		addRect(x1 + px, -y1 - py, x1 - px, -y1 + py, x2 - px, -y2 + py, x2 + px, -y2 - py, ci, ti);

		if ($._scaledSW > 2 && $._strokeCap != 'square') {
			let n = getArcSegments($._scaledSW);
			addArc(x1, -y1, hsw, hsw, 0, TAU, n, ci, ti);
			addArc(x2, -y2, hsw, hsw, 0, TAU, n, ci, ti);
		}
	};

	let curveSegments = 20;
	$.curveDetail = (v) => (curveSegments = v);

	let bezierSegments = 20;
	$.bezierDetail = (v) => (bezierSegments = v);

	let shapeVertCount;
	let sv = []; // shape vertices
	let curveVertices = []; // curve vertices

	$.beginShape = () => {
		shapeVertCount = 0;
		sv = [];
		curveVertices = [];
	};

	$.vertex = (x, y) => {
		if ($._matrixDirty) $._saveMatrix();
		sv.push(x, -y, $._fill, $._matrixIndex);
		shapeVertCount++;
	};

	$.curveVertex = (x, y) => {
		if ($._matrixDirty) $._saveMatrix();
		curveVertices.push({ x: x, y: -y });
	};

	$.bezierVertex = function (cx1, cy1, cx2, cy2, x, y) {
		if (shapeVertCount === 0) throw new Error('Shape needs a vertex()');
		if ($._matrixDirty) $._saveMatrix();

		// Get the last vertex as the starting point (P₀)
		let prevIndex = (shapeVertCount - 1) * 4;
		let startX = sv[prevIndex];
		let startY = sv[prevIndex + 1];

		let step = 1 / bezierSegments;

		let vx, vy;
		let quadratic = arguments.length == 4;
		if (quadratic) {
			x = cx2;
			y = cy2;
		}

		let end = 1 + step;
		for (let t = step; t <= end; t += step) {
			// Start from 0.1 to avoid duplicating the start point
			let t2 = t * t;

			let mt = 1 - t;
			let mt2 = mt * mt;

			if (quadratic) {
				vx = mt2 * startX + 2 * mt * t * cx1 + t2 * x;
				vy = mt2 * startY + 2 * mt * t * -cy1 + t2 * -y;
			} else {
				let t3 = t2 * t;
				let mt3 = mt2 * mt;

				// Cubic Bezier formula
				vx = mt3 * startX + 3 * mt2 * t * cx1 + 3 * mt * t2 * cx2 + t3 * x;
				vy = mt3 * startY + 3 * mt2 * t * -cy1 + 3 * mt * t2 * -cy2 + t3 * -y;
			}

			sv.push(vx, vy, $._fill, $._matrixIndex);
			shapeVertCount++;
		}
	};

	$.quadraticVertex = (cx, cy, x, y) => $.bezierVertex(cx, cy, x, y);

	$.endShape = (close) => {
		if (curveVertices.length > 0) {
			// duplicate start and end points if necessary
			let points = [...curveVertices];
			if (points.length < 4) {
				// duplicate first and last points
				while (points.length < 4) {
					points.unshift(points[0]);
					points.push(points[points.length - 1]);
				}
			}

			// Use curveSegments to determine step size
			let step = 1 / curveSegments;

			// calculate catmull-rom spline curve points
			for (let i = 0; i < points.length - 3; i++) {
				let p0 = points[i];
				let p1 = points[i + 1];
				let p2 = points[i + 2];
				let p3 = points[i + 3];

				for (let t = 0; t <= 1; t += step) {
					let t2 = t * t;
					let t3 = t2 * t;

					let x =
						0.5 *
						(2 * p1.x +
							(-p0.x + p2.x) * t +
							(2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
							(-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

					let y =
						0.5 *
						(2 * p1.y +
							(-p0.y + p2.y) * t +
							(2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
							(-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

					sv.push(x, y, $._fill, $._matrixIndex);
					shapeVertCount++;
				}
			}
		}

		if (!shapeVertCount) return;
		if (shapeVertCount == 1) return $.point(sv[0], -sv[1]);
		if (shapeVertCount == 2) return $.line(sv[0], -sv[1], sv[4], -sv[5]);

		// close the shape if requested
		if (close) {
			let firstIndex = 0;
			let lastIndex = (shapeVertCount - 1) * 4;

			let firstX = sv[firstIndex];
			let firstY = sv[firstIndex + 1];
			let lastX = sv[lastIndex];
			let lastY = sv[lastIndex + 1];

			if (firstX !== lastX || firstY !== lastY) {
				sv.push(firstX, firstY, sv[firstIndex + 2], sv[firstIndex + 3]);
				shapeVertCount++;
			}
		}

		if ($._doFill) {
			if (shapeVertCount == 5) {
				// for quads, draw two triangles
				addVert(sv[0], sv[1], sv[2], sv[3]); // v0
				addVert(sv[4], sv[5], sv[6], sv[7]); // v1
				addVert(sv[12], sv[13], sv[14], sv[15]); // v3
				addVert(sv[8], sv[9], sv[10], sv[11]); // v2
				drawStack.push($._shapesPL, 4);
			} else {
				// triangulate the shape
				for (let i = 1; i < shapeVertCount - 1; i++) {
					let v0 = 0;
					let v1 = i * 4;
					let v2 = (i + 1) * 4;

					addVert(sv[v0], sv[v0 + 1], sv[v0 + 2], sv[v0 + 3]);
					addVert(sv[v1], sv[v1 + 1], sv[v1 + 2], sv[v1 + 3]);
					addVert(sv[v2], sv[v2 + 1], sv[v2 + 2], sv[v2 + 3]);
				}
				drawStack.push($._shapesPL, (shapeVertCount - 2) * 3);
			}
		}

		if ($._doStroke) {
			let hsw = $._hsw,
				n = getArcSegments($._scaledSW),
				ti = $._matrixIndex,
				ogStrokeCap = $._strokeCap;
			$._strokeCap = 'square';
			// draw lines between vertices
			for (let i = 0; i < shapeVertCount - 1; i++) {
				let v1 = i * 4;
				let v2 = (i + 1) * 4;
				$.line(sv[v1], -sv[v1 + 1], sv[v2], -sv[v2 + 1]);

				addArc(sv[v1], sv[v1 + 1], hsw, hsw, 0, TAU, n, $._stroke, ti);
			}
			let v1 = (shapeVertCount - 1) * 4;
			let v2 = 0;
			if (close) $.line(sv[v1], -sv[v1 + 1], sv[v2], -sv[v2 + 1]);
			addArc(sv[v1], sv[v1 + 1], hsw, hsw, 0, TAU, n, $._stroke, ti);
			$._strokeCap = ogStrokeCap;
		}

		// reset for the next shape
		shapeVertCount = 0;
		sv = [];
		curveVertices = [];
	};

	$.curve = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.curveVertex(x1, y1);
		$.curveVertex(x2, y2);
		$.curveVertex(x3, y3);
		$.curveVertex(x4, y4);
		$.endShape();
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
		$.endShape(true);
	};

	$.quad = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.vertex(x4, y4);
		$.endShape(true);
	};

	$._hooks.preRender.push(() => {
		$._pass.setPipeline($._pipelines[1]);

		let vertexBuffer = Q5.device.createBuffer({
			size: vertIndex * 4,
			usage: GPUBufferUsage.VERTEX,
			mappedAtCreation: true
		});

		new Float32Array(vertexBuffer.getMappedRange()).set(vertexStack.slice(0, vertIndex));
		vertexBuffer.unmap();

		$._pass.setVertexBuffer(0, vertexBuffer);

		$._buffers.push(vertexBuffer);
	});

	$._hooks.postRender.push(() => {
		vertIndex = 0;
	});
};
Q5.renderers.webgpu.image = ($, q) => {
	$._imagePL = 2;
	$._videoPL = 3;

	$._imageShaderCode =
		$._baseShaderCode +
		/* wgsl */ `
struct VertexParams {
	@builtin(vertex_index) vertexIndex : u32,
	@location(0) pos: vec2f,
	@location(1) texCoord: vec2f,
	@location(2) tintIndex: f32,
	@location(3) matrixIndex: f32,
	@location(4) imageAlpha: f32
}
struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) texCoord: vec2f,
	@location(1) tintColor: vec4f,
	@location(2) imageAlpha: f32
}

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

@group(1) @binding(0) var samp: sampler;
@group(1) @binding(1) var tex: texture_2d<f32>;

fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
	var vert = vec4f(pos, 0f, 1f);
	vert = transforms[i32(matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	return vert;
}

fn applyTint(texColor: vec4f, tintColor: vec4f) -> vec4f {
	// apply the tint color to the sampled texture color at full strength
	let tinted = vec4f(texColor.rgb * tintColor.rgb, texColor.a);
	// mix in the tint using the tint alpha as the blend strength
	return mix(texColor, tinted, tintColor.a);
}

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var vert = transformVertex(v.pos, v.matrixIndex);

	var f: FragParams;
	f.position = vert;
	f.texCoord = v.texCoord;
	f.tintColor = colors[i32(v.tintIndex)];
	f.imageAlpha = v.imageAlpha;
	return f;
}

@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	var texColor = textureSample(tex, samp, f.texCoord);
	texColor.a *= f.imageAlpha;
	return applyTint(texColor, f.tintColor);
}
`;

	let imageShader = Q5.device.createShaderModule({
		label: 'imageShader',
		code: $._imageShaderCode
	});

	$._videoShaderCode = $._imageShaderCode
		.replace('texture_2d<f32>', 'texture_external')
		.replace('textureSample', 'textureSampleBaseClampToEdge');

	let videoShader = Q5.device.createShaderModule({
		label: 'videoShader',
		code: $._videoShaderCode
	});

	let vertexStack = new Float32Array($._graphics ? 1000 : 1e7),
		vertIndex = 0;

	let vertexBufferLayout = {
		arrayStride: 28,
		attributes: [
			{ shaderLocation: 0, offset: 0, format: 'float32x2' },
			{ shaderLocation: 1, offset: 8, format: 'float32x2' },
			{ shaderLocation: 2, offset: 16, format: 'float32' }, // tintIndex
			{ shaderLocation: 3, offset: 20, format: 'float32' }, // matrixIndex
			{ shaderLocation: 4, offset: 24, format: 'float32' } // imageAlpha
		]
	};

	let textureLayout = Q5.device.createBindGroupLayout({
		label: 'textureLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: { type: 'filtering' }
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				texture: { viewDimension: '2d', sampleType: 'float' }
			}
		]
	});

	let videoTextureLayout = Q5.device.createBindGroupLayout({
		label: 'videoTextureLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: { type: 'filtering' }
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				externalTexture: {}
			}
		]
	});

	let imagePipelineLayout = Q5.device.createPipelineLayout({
		label: 'imagePipelineLayout',
		bindGroupLayouts: [...$._bindGroupLayouts, textureLayout]
	});

	let videoPipelineLayout = Q5.device.createPipelineLayout({
		label: 'videoPipelineLayout',
		bindGroupLayouts: [...$._bindGroupLayouts, videoTextureLayout]
	});

	$._pipelineConfigs[2] = {
		label: 'imagePipeline',
		layout: imagePipelineLayout,
		vertex: {
			module: imageShader,
			entryPoint: 'vertexMain',
			buffers: [{ arrayStride: 0, attributes: [] }, vertexBufferLayout]
		},
		fragment: {
			module: imageShader,
			entryPoint: 'fragMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs['source-over'] }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[2] = Q5.device.createRenderPipeline($._pipelineConfigs[2]);

	$._pipelineConfigs[3] = {
		label: 'videoPipeline',
		layout: videoPipelineLayout,
		vertex: {
			module: videoShader,
			entryPoint: 'vertexMain',
			buffers: [{ arrayStride: 0, attributes: [] }, vertexBufferLayout]
		},
		fragment: {
			module: videoShader,
			entryPoint: 'fragMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs['source-over'] }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[3] = Q5.device.createRenderPipeline($._pipelineConfigs[3]);

	$._textureBindGroups = [];

	$._saveCanvas = async (g, ext) => {
		let makeFrame = g._drawStack?.length;
		if (makeFrame) {
			g._render();
			g._finishRender();
		}

		let texture = g._texture;

		if (makeFrame) g._beginRender();

		let w = texture.width,
			h = texture.height,
			bytesPerRow = Math.ceil((w * 4) / 256) * 256;

		let buffer = Q5.device.createBuffer({
			size: bytesPerRow * h,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
		});

		let en = Q5.device.createCommandEncoder();

		en.copyTextureToBuffer({ texture }, { buffer, bytesPerRow, rowsPerImage: h }, { width: w, height: h });

		Q5.device.queue.submit([en.finish()]);

		await buffer.mapAsync(GPUMapMode.READ);

		let pad = new Uint8Array(buffer.getMappedRange());
		let data = new Uint8Array(w * h * 4); // unpadded data

		// Remove padding from each row and swap BGR to RGB
		for (let y = 0; y < h; y++) {
			const p = y * bytesPerRow; // padded row offset
			const u = y * w * 4; // unpadded row offset
			for (let x = 0; x < w; x++) {
				const pp = p + x * 4; // padded pixel offset
				const up = u + x * 4; // unpadded pixel offset
				data[up + 0] = pad[pp + 2]; // R <- B
				data[up + 1] = pad[pp + 1]; // G <- G
				data[up + 2] = pad[pp + 0]; // B <- R
				data[up + 3] = pad[pp + 3]; // A <- A
			}
		}

		buffer.unmap();

		let colorSpace = $.canvas.colorSpace;
		data = new Uint8ClampedArray(data.buffer);
		data = new ImageData(data, w, h, { colorSpace });
		let cnv = new $._Canvas(w, h);
		let ctx = cnv.getContext('2d', { colorSpace });
		ctx.putImageData(data, 0, 0);

		$._buffers.push(buffer);

		// Convert to blob then data URL
		let blob = await cnv.convertToBlob({ type: 'image/' + ext });
		return await new Promise((resolve) => {
			let r = new FileReader();
			r.onloadend = () => resolve(r.result);
			r.readAsDataURL(blob);
		});
	};

	let makeSampler = (filter) => {
		$._imageSampler = Q5.device.createSampler({
			magFilter: filter,
			minFilter: filter
		});
	};

	$.smooth = () => makeSampler('linear');
	$.noSmooth = () => makeSampler('nearest');

	$.smooth();

	let tIdx = 0,
		vidFrames = 0;

	$._addTexture = (img, texture) => {
		let cnv = img.canvas || img;

		if (!texture) {
			let textureSize = [cnv.width, cnv.height, 1];

			texture = Q5.device.createTexture({
				size: textureSize,
				format: 'bgra8unorm',
				usage:
					GPUTextureUsage.TEXTURE_BINDING |
					GPUTextureUsage.COPY_SRC |
					GPUTextureUsage.COPY_DST |
					GPUTextureUsage.RENDER_ATTACHMENT
			});

			Q5.device.queue.copyExternalImageToTexture(
				{ source: cnv },
				{
					texture,
					colorSpace: $.canvas.colorSpace
				},
				textureSize
			);
		}

		texture.index = tIdx + vidFrames;
		img._texture = texture;

		$._textureBindGroups[texture.index] = Q5.device.createBindGroup({
			label: img.src || texture.label || 'canvas',
			layout: textureLayout,
			entries: [
				{ binding: 0, resource: $._imageSampler },
				{ binding: 1, resource: texture.createView() }
			]
		});

		tIdx++;
	};

	$.loadImage = (src, cb) => {
		let g = $._g.loadImage(src, () => {
			$._extendImage(g);
			if (cb) cb(g);
		});
		return g;
	};

	$._extendImage = (g) => {
		$._addTexture(g);
		let _copy = g.copy;
		g.copy = function () {
			let copy = _copy();
			$._addTexture(copy);
			return copy;
		};
		g.modified = true;
	};

	$.createImage = (w, h, opt) => {
		let g = $._g.createImage(w, h, opt);
		$._extendImage(g);
		return g;
	};

	let _createGraphics = $.createGraphics;

	$.createGraphics = (w, h, opt = {}) => {
		if (!Q5.experimental) {
			throw new Error(
				'createGraphics is disabled by default in q5 WebGPU. See issue https://github.com/q5js/q5.js/issues/104 for details.'
			);
		}
		if (typeof opt == 'string') opt = { renderer: opt };
		opt.renderer ??= 'c2d';
		let g = _createGraphics(w, h, opt);
		if (g.canvas.webgpu) {
			$._addTexture(g, g._frameA);
			$._addTexture(g, g._frameB);
			g._beginRender();
		} else $._extendImage(g);
		return g;
	};

	$.imageMode = (x) => ($._imageMode = x);

	const addVert = (x, y, u, v, ci, ti, ia) => {
		let s = vertexStack,
			i = vertIndex;
		s[i++] = x;
		s[i++] = y;
		s[i++] = u;
		s[i++] = v;
		s[i++] = ci;
		s[i++] = ti;
		s[i++] = ia;
		vertIndex = i;
	};

	$.image = (img, dx = 0, dy = 0, dw, dh, sx = 0, sy = 0, sw, sh) => {
		let isVideo;
		if (img._texture == undefined) {
			isVideo = img.tagName == 'VIDEO';
			if (!isVideo || !img.width || !img.currentTime) return;
			if (img.flipped) $.scale(-1, 1);
		}

		if ($._matrixDirty) $._saveMatrix();

		let cnv = img.canvas || img,
			w = cnv.width,
			h = cnv.height,
			pd = img._pixelDensity || 1,
			makeFrame = img._graphics && img._drawStack?.length;

		if (makeFrame) {
			img._render();
			img._finishRender();
		}

		if (img.modified) {
			Q5.device.queue.copyExternalImageToTexture(
				{ source: cnv },
				{ texture: img._texture, colorSpace: $.canvas.colorSpace },
				[w, h, 1]
			);
			img.frameCount++;
			img.modified = false;
		}

		dw ??= img.defaultWidth || img.videoWidth;
		dh ??= img.defaultHeight || img.videoHeight;
		sw ??= w;
		sh ??= h;
		sx *= pd;
		sy *= pd;

		let [l, r, t, b] = $._calcBox(dx, dy, dw, dh, $._imageMode);

		let u0 = sx / w,
			v0 = sy / h,
			u1 = (sx + sw) / w,
			v1 = (sy + sh) / h,
			ti = $._matrixIndex,
			ci = $._tint,
			ia = $._globalAlpha;

		addVert(l, t, u0, v0, ci, ti, ia);
		addVert(r, t, u1, v0, ci, ti, ia);
		addVert(l, b, u0, v1, ci, ti, ia);
		addVert(r, b, u1, v1, ci, ti, ia);

		if (!isVideo) {
			$._drawStack.push($._imagePL, img._texture.index);

			if (makeFrame) {
				img.resetMatrix();
				img._beginRender();
				img.frameCount++;
			}
		} else {
			// render video
			let externalTexture = Q5.device.importExternalTexture({ source: img });

			// Create bind group for the external texture that will
			// only exist for this frame
			$._textureBindGroups.push(
				Q5.device.createBindGroup({
					layout: videoTextureLayout,
					entries: [
						{ binding: 0, resource: $._imageSampler },
						{ binding: 1, resource: externalTexture }
					]
				})
			);

			$._drawStack.push($._videoPL, $._textureBindGroups.length - 1);

			if (img.flipped) $.scale(-1, 1);
		}
	};

	$._hooks.preRender.push(() => {
		if (!vertIndex) return;

		// Switch to image pipeline
		$._pass.setPipeline($._pipelines[2]);

		let vertexBuffer = Q5.device.createBuffer({
			size: vertIndex * 5,
			usage: GPUBufferUsage.VERTEX,
			mappedAtCreation: true
		});

		new Float32Array(vertexBuffer.getMappedRange()).set(vertexStack.slice(0, vertIndex));
		vertexBuffer.unmap();

		$._pass.setVertexBuffer(1, vertexBuffer);

		$._buffers.push(vertexBuffer);

		if (vidFrames) {
			// Switch to video pipeline
			$._pass.setPipeline($._pipelines[3]);
			$._pass.setVertexBuffer(1, vertexBuffer);
		}
	});

	$._hooks.postRender.push(() => {
		vertIndex = 0;
		$._textureBindGroups.splice(tIdx, vidFrames);
		vidFrames = 0;
	});
};

Q5.THRESHOLD = 1;
Q5.GRAY = 2;
Q5.OPAQUE = 3;
Q5.INVERT = 4;
Q5.POSTERIZE = 5;
Q5.DILATE = 6;
Q5.ERODE = 7;
Q5.BLUR = 8;
Q5.renderers.webgpu.text = ($, q) => {
	$._textPL = 4;

	$._textShaderCode =
		$._baseShaderCode +
		/* wgsl */ `
struct VertexParams {
	@builtin(vertex_index) vertexIndex : u32,
	@builtin(instance_index) instanceIndex : u32
}
struct FragParams {
	@builtin(position) position : vec4f,
	@location(0) texCoord : vec2f,
	@location(1) fillColor : vec4f,
	@location(2) strokeColor : vec4f,
	@location(3) strokeWeight : f32,
	@location(4) edge : f32
}
struct Char {
	texOffset: vec2f,
	texExtent: vec2f,
	size: vec2f,
	offset: vec2f,
}
struct Text {
	pos: vec2f,
	scale: f32,
	matrixIndex: f32,
	fillIndex: f32,
	strokeIndex: f32,
	strokeWeight: f32,
	edge: f32
}

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

@group(1) @binding(0) var fontTexture: texture_2d<f32>;
@group(1) @binding(1) var fontSampler: sampler;
@group(1) @binding(2) var<storage> fontChars: array<Char>;

@group(2) @binding(0) var<storage> textChars: array<vec4f>;
@group(2) @binding(1) var<storage> textMetadata: array<Text>;

const quad = array(vec2f(0, -1), vec2f(1, -1), vec2f(0, 0), vec2f(1, 0));
const uvs = array(vec2f(0, 1), vec2f(1, 1), vec2f(0, 0), vec2f(1, 0));

fn calcPos(i: u32, char: vec4f, fontChar: Char, text: Text) -> vec2f {
	return ((quad[i] * fontChar.size + char.xy + fontChar.offset) *
		text.scale) + text.pos;
}

fn calcUV(i: u32, fontChar: Char) -> vec2f {
	return uvs[i] * fontChar.texExtent + fontChar.texOffset;
}

fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
	var vert = vec4f(pos, 0.0, 1.0);
	vert = transforms[i32(matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	return vert;
}

fn calcDist(texCoord: vec2f, edgeWidth: f32) -> f32 {
	let c = textureSample(fontTexture, fontSampler, texCoord);
	let sigDist = max(min(c.r, c.g), min(max(c.r, c.g), c.b)) - edgeWidth;

	let pxRange = 4.0;
	let sz = vec2f(textureDimensions(fontTexture, 0));
	let dx = sz.x * length(vec2f(dpdxFine(texCoord.x), dpdyFine(texCoord.x)));
	let dy = sz.y * length(vec2f(dpdxFine(texCoord.y), dpdyFine(texCoord.y)));
	let toPixels = pxRange * inverseSqrt(dx * dx + dy * dy);
	return sigDist * toPixels;
}

@vertex
fn vertexMain(v : VertexParams) -> FragParams {
	let char = textChars[v.instanceIndex];
	let text = textMetadata[i32(char.w)];
	let fontChar = fontChars[i32(char.z)];
	let pos = calcPos(v.vertexIndex, char, fontChar, text);

	var vert = transformVertex(pos, text.matrixIndex);

	var f : FragParams;
	f.position = vert;
	f.texCoord = calcUV(v.vertexIndex, fontChar);
	f.fillColor = colors[i32(text.fillIndex)];
	f.strokeColor = colors[i32(text.strokeIndex)];
	f.strokeWeight = text.strokeWeight;
	f.edge = text.edge;
	return f;
}

@fragment
fn fragMain(f : FragParams) -> @location(0) vec4f {
	let edge = f.edge;
	let dist = calcDist(f.texCoord, edge);

	if (f.strokeWeight == 0.0) {
		let fillAlpha = smoothstep(-edge, edge, dist);
		let color = vec4f(f.fillColor.rgb, f.fillColor.a * fillAlpha);
		if (color.a < 0.01) {
			discard;
		}
		return color;
	}

	let halfStroke = f.strokeWeight / 2.0;
	let fillAlpha = smoothstep(-edge, edge, dist - halfStroke);
	let strokeAlpha = smoothstep(-edge, edge, dist + halfStroke);
	var color = mix(f.strokeColor, f.fillColor, fillAlpha);
	color = vec4f(color.rgb, color.a * strokeAlpha);
	if (color.a < 0.01) {
		discard;
	}
	return color;
}
`;

	let textShader = Q5.device.createShaderModule({
		label: 'textShader',
		code: $._textShaderCode
	});

	let textBindGroupLayout = Q5.device.createBindGroupLayout({
		label: 'textBindGroupLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: { type: 'read-only-storage' }
			},
			{
				binding: 1,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: { type: 'read-only-storage' }
			}
		]
	});

	let fontSampler = Q5.device.createSampler({
		minFilter: 'linear',
		magFilter: 'linear',
		mipmapFilter: 'linear',
		maxAnisotropy: 16
	});

	let fontBindGroupLayout = Q5.device.createBindGroupLayout({
		label: 'fontBindGroupLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				texture: {}
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: {}
			},
			{
				binding: 2,
				visibility: GPUShaderStage.VERTEX,
				buffer: { type: 'read-only-storage' }
			}
		]
	});

	let fontPipelineLayout = Q5.device.createPipelineLayout({
		bindGroupLayouts: [...$._bindGroupLayouts, fontBindGroupLayout, textBindGroupLayout]
	});

	$._pipelineConfigs[4] = {
		label: 'textPipeline',
		layout: fontPipelineLayout,
		vertex: { module: textShader, entryPoint: 'vertexMain' },
		fragment: {
			module: textShader,
			entryPoint: 'fragMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs['source-over'] }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[4] = Q5.device.createRenderPipeline($._pipelineConfigs[4]);

	class MsdfFont {
		constructor(bindGroup, lineHeight, chars, kernings) {
			this.bindGroup = bindGroup;
			this.lineHeight = lineHeight;
			this.chars = chars;
			this.kernings = kernings;
			let charArray = Object.values(chars);
			this.charCount = charArray.length;
			this.defaultChar = charArray[0];
		}
		getChar(charCode) {
			return this.chars[charCode] ?? this.defaultChar;
		}
		// Gets the distance in pixels a line should advance for a given
		// character code. If the upcoming character code is given any
		// kerning between the two characters will be taken into account.
		getXAdvance(charCode, nextCharCode = -1) {
			let char = this.getChar(charCode);
			if (nextCharCode >= 0) {
				let kerning = this.kernings.get(charCode);
				if (kerning) {
					return char.xadvance + (kerning.get(nextCharCode) ?? 0);
				}
			}
			return char.xadvance;
		}
	}

	$._fonts = [];
	let fonts = {};

	async function createFont(fontJsonUrl, fontName, cb) {
		let res = await fetch(fontJsonUrl);
		if (res.status == 404) return '';

		let atlas = await res.json();

		let slashIdx = fontJsonUrl.lastIndexOf('/');
		let baseUrl = slashIdx != -1 ? fontJsonUrl.substring(0, slashIdx + 1) : '';
		// load font image
		res = await fetch(baseUrl + atlas.pages[0]);
		let img = await createImageBitmap(await res.blob());

		// convert image to texture
		let imgSize = [img.width, img.height, 1];
		let texture = Q5.device.createTexture({
			label: `MSDF ${fontName}`,
			size: imgSize,
			format: 'rgba8unorm',
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
		});
		Q5.device.queue.copyExternalImageToTexture({ source: img }, { texture }, imgSize);

		// chars and kernings can be stored as csv strings, making the file
		// size smaller, but they need to be parsed into arrays of objects
		if (typeof atlas.chars == 'string') {
			atlas.chars = $.CSV.parse(atlas.chars, ' ');
			atlas.kernings = $.CSV.parse(atlas.kernings, ' ');
		}

		let charCount = atlas.chars.length;
		let charsBuffer = Q5.device.createBuffer({
			size: charCount * 32,
			usage: GPUBufferUsage.STORAGE,
			mappedAtCreation: true
		});

		let fontChars = new Float32Array(charsBuffer.getMappedRange());
		let u = 1 / atlas.common.scaleW;
		let v = 1 / atlas.common.scaleH;
		let chars = {};
		let o = 0; // offset
		for (let [i, char] of atlas.chars.entries()) {
			chars[char.id] = char;
			chars[char.id].charIndex = i;
			fontChars[o] = char.x * u; // texOffset.x
			fontChars[o + 1] = char.y * v; // texOffset.y
			fontChars[o + 2] = char.width * u; // texExtent.x
			fontChars[o + 3] = char.height * v; // texExtent.y
			fontChars[o + 4] = char.width; // size.x
			fontChars[o + 5] = char.height; // size.y
			fontChars[o + 6] = char.xoffset; // offset.x
			fontChars[o + 7] = -char.yoffset; // offset.y
			o += 8;
		}
		charsBuffer.unmap();

		let fontBindGroup = Q5.device.createBindGroup({
			label: 'fontBindGroup',
			layout: fontBindGroupLayout,
			entries: [
				{ binding: 0, resource: texture.createView() },
				{ binding: 1, resource: fontSampler },
				{ binding: 2, resource: { buffer: charsBuffer } }
			]
		});

		let kernings = new Map();
		if (atlas.kernings) {
			for (let kerning of atlas.kernings) {
				let charKerning = kernings.get(kerning.first);
				if (!charKerning) {
					charKerning = new Map();
					kernings.set(kerning.first, charKerning);
				}
				charKerning.set(kerning.second, kerning.amount);
			}
		}

		$._font = new MsdfFont(fontBindGroup, atlas.common.lineHeight, chars, kernings);

		$._font.index = $._fonts.length;
		$._fonts.push($._font);
		fonts[fontName] = $._font;

		if (cb) cb(fontName);
	}

	$.loadFont = (url, cb) => {
		let ext = url.slice(url.lastIndexOf('.') + 1);
		if (url == ext) return $._loadDefaultFont(url, cb);
		if (ext != 'json') return $._g.loadFont(url, cb);
		let fontName = url.slice(url.lastIndexOf('/') + 1, url.lastIndexOf('-'));
		let f = { family: fontName };
		f.promise = createFont(url, fontName, () => {
			delete f.promise;
			if (cb) cb(f);
		});
		$._preloadPromises.push(f.promise);

		if (!$._usePreload) return f.promise;
		return f;
	};

	$._loadDefaultFont = (fontName, cb) => {
		fonts[fontName] = null;
		let url = `https://q5js.org/fonts/${fontName}-msdf.json`;
		if (!navigator.onLine) {
			url = `/node_modules/q5/builtinFonts/${fontName}-msdf.json`;
		}
		return $.loadFont(url, cb);
	};

	$._textSize = 18;
	$._textAlign = 'left';
	$._textBaseline = 'alphabetic';
	let leadingSet = false,
		leading = 22.5,
		leadDiff = 4.5,
		leadPercent = 1.25;

	$.textFont = (fontName) => {
		if (!fontName) return $._font;
		if (typeof fontName != 'string') fontName = fontName.family;
		let font = fonts[fontName];
		if (font) $._font = font;
		else if (font === undefined) return $._loadDefaultFont(fontName);
	};

	$.textSize = (size) => {
		if (size == undefined) return $._textSize;
		$._textSize = size;
		if (!leadingSet) {
			leading = size * leadPercent;
			leadDiff = leading - size;
		}
	};

	let weights = {
		thin: 100,
		extralight: 200,
		light: 300,
		normal: 400,
		regular: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
		bolder: 800,
		extrabold: 800,
		black: 900,
		heavy: 900
	};

	// ranges from 0.35 (black) to 0.65 (thin)
	$._textEdge = 0.5;

	$.textWeight = (weight) => {
		if (!weight) return $._textWeight;
		if (typeof weight == 'string') {
			weight = weights[weight.toLowerCase().replace(/[ _-]/g, '')];
			if (!weight) throw new Error(`Invalid font weight: ${weight}`);
		}
		$._textEdge = 0.6875 - weight * 0.000375;
	};

	$.textLeading = (lineHeight) => {
		$._font.lineHeight = leading = lineHeight;
		leadDiff = leading - $._textSize;
		leadPercent = leading / $._textSize;
		leadingSet = true;
	};

	$.textAlign = (horiz, vert) => {
		$._textAlign = horiz;
		if (vert) $._textBaseline = vert;
	};

	let charStack = [],
		textStack = [];

	let measureText = (font, text, charCallback) => {
		let maxWidth = 0,
			offsetX = 0,
			offsetY = 0,
			line = 0,
			printedCharCount = 0,
			lineWidths = [],
			nextCharCode = text.charCodeAt(0);

		for (let i = 0; i < text.length; ++i) {
			let charCode = nextCharCode;
			nextCharCode = i < text.length - 1 ? text.charCodeAt(i + 1) : -1;
			switch (charCode) {
				case 10: // newline
					lineWidths.push(offsetX);
					line++;
					maxWidth = Math.max(maxWidth, offsetX);
					offsetX = 0;
					offsetY -= font.lineHeight * leadPercent;
					break;
				case 13: // CR
					break;
				case 32: // space
					// advance the offset without actually adding a character
					offsetX += font.getXAdvance(charCode);
					break;
				case 9: // tab
					offsetX += font.getXAdvance(charCode) * 2;
					break;
				default:
					if (charCallback) {
						charCallback(offsetX, offsetY, line, font.getChar(charCode));
					}
					offsetX += font.getXAdvance(charCode, nextCharCode);
					printedCharCount++;
			}
		}
		lineWidths.push(offsetX);
		maxWidth = Math.max(maxWidth, offsetX);
		return {
			width: maxWidth,
			height: lineWidths.length * font.lineHeight * leadPercent,
			lineWidths,
			printedCharCount
		};
	};

	$.text = (str, x, y, w, h) => {
		if (!$._font) {
			// if the default font hasn't been loaded yet, try to load it
			if ($._font !== null) $.textFont('sans-serif');
			return;
		}

		let type = typeof str;
		if (type != 'string') {
			if (type == 'object') str = str.toString();
			else str = str + '';
		}

		if (str.length > w) {
			let wrapped = [];
			let i = 0;
			while (i < str.length && wrapped.length < h) {
				let max = i + w;
				if (max >= str.length) {
					wrapped.push(str.slice(i));
					break;
				}
				let end = str.lastIndexOf(' ', max);
				if (end == -1 || end < i) end = max;
				wrapped.push(str.slice(i, end));
				i = end + 1;
			}
			str = wrapped.join('\n');
		}

		let spaces = 0, // whitespace char count, not literal spaces
			hasNewline;
		for (let i = 0; i < str.length; i++) {
			let c = str[i];
			switch (c) {
				case '\n':
					hasNewline = true;
				case '\r':
				case '\t':
				case ' ':
					spaces++;
			}
		}

		let charsData = [];

		let ta = $._textAlign,
			tb = $._textBaseline,
			textIndex = textStack.length,
			o = 0, // offset
			measurements;

		if (ta == 'left' && !hasNewline) {
			measurements = measureText($._font, str, (textX, textY, line, char) => {
				charsData[o] = textX;
				charsData[o + 1] = textY;
				charsData[o + 2] = char.charIndex;
				charsData[o + 3] = textIndex;
				o += 4;
			});

			if (tb == 'alphabetic') y -= $._textSize;
			else if (tb == 'center') y -= $._textSize * 0.5;
			else if (tb == 'bottom') y -= leading;
		} else {
			// measure the text to get the line widths before setting
			// the x position to properly align the text
			measurements = measureText($._font, str);

			let offsetY = 0;
			if (tb == 'alphabetic') y -= $._textSize;
			else if (tb == 'center') offsetY = measurements.height * 0.5;
			else if (tb == 'bottom') offsetY = measurements.height;

			measureText($._font, str, (textX, textY, line, char) => {
				let offsetX = 0;
				if (ta == 'center') {
					offsetX = measurements.width * -0.5 - (measurements.width - measurements.lineWidths[line]) * -0.5;
				} else if (ta == 'right') {
					offsetX = -measurements.lineWidths[line];
				}
				charsData[o] = textX + offsetX;
				charsData[o + 1] = textY + offsetY;
				charsData[o + 2] = char.charIndex;
				charsData[o + 3] = textIndex;
				o += 4;
			});
		}
		charStack.push(charsData);

		let txt = [];

		if ($._matrixDirty) $._saveMatrix();

		txt[0] = x;
		txt[1] = -y;
		txt[2] = $._textSize / 42;
		txt[3] = $._matrixIndex;
		txt[4] = $._doFill && $._fillSet ? $._fill : 0;
		txt[5] = $._stroke;
		txt[6] = $._doStroke && $._strokeSet ? $._strokeWeight : 0;
		txt[7] = $._textEdge;

		textStack.push(txt);
		$._drawStack.push($._textPL, measurements.printedCharCount, $._font.index);
	};

	$.textWidth = (str) => {
		if (!$._font) return 0;
		return measureText($._font, str).width;
	};

	$.createTextImage = (str, w, h) => {
		$._g.textSize($._textSize);

		if ($._doFill && $._fillSet) {
			let fi = $._fill * 4;
			$._g.fill($._colorStack.slice(fi, fi + 4));
		}
		if ($._doStroke && $._strokeSet) {
			let si = $._stroke * 4;
			$._g.stroke($._colorStack.slice(si, si + 4));
		}

		let g = $._g.createTextImage(str, w, h);
		$._extendImage(g);
		return g;
	};

	$.textImage = (img, x, y) => {
		if (typeof img == 'string') img = $.createTextImage(img);

		let og = $._imageMode;
		$._imageMode = 'corner';

		let ta = $._textAlign;
		if (ta == 'center') x -= img.canvas.hw;
		else if (ta == 'right') x -= img.width;

		let bl = $._textBaseline;
		if (bl == 'alphabetic') y -= img._leading;
		else if (bl == 'center') y -= img._middle;
		else if (bl == 'bottom') y -= img._bottom;
		else if (bl == 'top') y -= img._top;

		$.image(img, x, y);
		$._imageMode = og;
	};

	$._hooks.preRender.push(() => {
		if (!charStack.length) return;

		// calculate total buffer size for text data
		let totalTextSize = 0;
		for (let charsData of charStack) {
			totalTextSize += charsData.length * 4;
		}

		// create a single buffer for all the char data
		let charBuffer = Q5.device.createBuffer({
			size: totalTextSize,
			usage: GPUBufferUsage.STORAGE,
			mappedAtCreation: true
		});

		// copy all the text data into the buffer
		new Float32Array(charBuffer.getMappedRange()).set(charStack.flat());
		charBuffer.unmap();

		// calculate total buffer size for metadata
		let totalMetadataSize = textStack.length * 8 * 4;

		// create a single buffer for all metadata
		let textBuffer = Q5.device.createBuffer({
			label: 'textBuffer',
			size: totalMetadataSize,
			usage: GPUBufferUsage.STORAGE,
			mappedAtCreation: true
		});

		// copy all metadata into the buffer
		new Float32Array(textBuffer.getMappedRange()).set(textStack.flat());
		textBuffer.unmap();

		$._buffers.push(charBuffer, textBuffer);

		// create a single bind group for the text buffer and metadata buffer
		$._textBindGroup = Q5.device.createBindGroup({
			label: 'textBindGroup',
			layout: textBindGroupLayout,
			entries: [
				{ binding: 0, resource: { buffer: charBuffer } },
				{ binding: 1, resource: { buffer: textBuffer } }
			]
		});
	});

	$._hooks.postRender.push(() => {
		charStack = [];
		textStack = [];
	});
};
Q5.renderers.webgpu.shaders = ($) => {
	let pipelineTypes = ['frame', 'shapes', 'image', 'video', 'text'];

	let plCounters = {
		frame: 10,
		shapes: 1000,
		image: 2000,
		video: 3000,
		text: 4000
	};

	$._createShader = (code, type = 'shapes') => {
		code = code.trim();

		// default shader code
		let def = $['_' + type + 'ShaderCode'];

		let defVertIdx = def.indexOf('@vertex');
		let defFragIdx = def.indexOf('@fragment');

		if (!code.includes('@fragment')) {
			// replace @vertex section
			code = def.slice(0, defVertIdx) + code + '\n\n' + def.slice(defFragIdx);
		} else if (!code.includes('@vertex')) {
			// replace @fragment section
			code = def.slice(0, defFragIdx) + code;
		} else {
			// replace @vertex and @fragment sections
			code = def.slice(0, defVertIdx) + code;
		}

		let shader = Q5.device.createShaderModule({
			label: type + 'Shader',
			code: code
		});
		shader.type = type;

		let pipelineIndex = pipelineTypes.indexOf(type);
		let config = Object.assign({}, $._pipelineConfigs[pipelineIndex]);
		config.vertex.module = config.fragment.module = shader;

		let pl = plCounters[type];
		$._pipelines[pl] = Q5.device.createRenderPipeline(config);
		$._pipelines[pl].shader = shader;
		shader.pipelineIndex = pl;

		plCounters[type]++;

		return shader;
	};

	$.createShader = $.createShapesShader = $._createShader;
	$.createFrameShader = (code) => $._createShader(code, 'frame');
	$.createImageShader = (code) => $._createShader(code, 'image');
	$.createVideoShader = (code) => $._createShader(code, 'video');
	$.createTextShader = (code) => $._createShader(code, 'text');

	$.shader = (shader) => {
		if (shader.applyBeforeDraw) $._prevFramePL = shader.pipelineIndex;
		else $['_' + shader.type + 'PL'] = shader.pipelineIndex;
	};

	$.resetShader = (type = 'shapes') => {
		if (type == 'frame') $._prevFramePL = 0;
		$['_' + type + 'PL'] = pipelineTypes.indexOf(type);
	};

	$.resetShaders = () => {
		$._prevFramePL = $._framePL = 0;
		$._shapesPL = 1;
		$._imagePL = 2;
		$._videoPL = 3;
		$._textPL = 4;
	};
};
