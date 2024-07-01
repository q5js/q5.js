/**
 * q5.js
 * @version 2.0
 * @author quinton-ashley, Tezumie, and LingDong-
 * @license LGPL-3.0
 * @class Q5
 */
function Q5(scope, parent) {
	let $ = this;
	$._q5 = true;
	$._scope = scope;
	$._parent = parent;
	$._preloadCount = 0;

	scope ??= 'global';
	if (scope == 'auto') {
		if (!(window.setup || window.draw)) return;
		scope = 'global';
	}
	let globalScope;
	if (scope == 'global') {
		Q5._hasGlobal = $._isGlobal = true;
		globalScope = !Q5._nodejs ? window : global;
	}

	let p = new Proxy($, {
		set: (t, p, v) => {
			$[p] = v;
			if ($._isGlobal) globalScope[p] = v;
			return true;
		}
	});

	$.canvas = $.ctx = $.drawingContext = null;
	$.pixels = [];
	let looper = null;

	$.frameCount = 0;
	$.deltaTime = 16;
	$._targetFrameRate = 0;
	$._targetFrameDuration = 16.666666666666668;
	$._frameRate = $._fps = 60;
	$._loop = true;

	let millisStart = 0;
	$.millis = () => performance.now() - millisStart;

	$.noCanvas = () => {
		if ($.canvas?.remove) $.canvas.remove();
		$.canvas = 0;
		p.ctx = p.drawingContext = 0;
	};

	if (window) {
		$.windowWidth = window.innerWidth;
		$.windowHeight = window.innerHeight;
		$.deviceOrientation = window.screen?.orientation?.type;
	}

	$._incrementPreload = () => p._preloadCount++;
	$._decrementPreload = () => p._preloadCount--;

	function _draw(timestamp) {
		let ts = timestamp || performance.now();
		$._lastFrameTime ??= ts - $._targetFrameDuration;

		if ($._shouldResize) {
			$.windowResized();
			$._shouldResize = false;
		}

		if ($._loop) looper = raf(_draw);
		else if ($.frameCount && !$._redraw) return;

		if (looper && $.frameCount) {
			let time_since_last = ts - $._lastFrameTime;
			if (time_since_last < $._targetFrameDuration - 1) return;
		}
		p.deltaTime = ts - $._lastFrameTime;
		$._frameRate = 1000 / $.deltaTime;
		p.frameCount++;
		let pre = performance.now();
		for (let m of Q5.prototype._methods.pre) m.call($);
		if ($.ctx) $.ctx.save();
		$.draw();
		for (let m of Q5.prototype._methods.post) m.call($);
		if ($.ctx) {
			$.ctx.restore();
			$.resetMatrix();
		}
		p.pmouseX = $.mouseX;
		p.pmouseY = $.mouseY;
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
	$.isLooping = () => $._loop;
	$.redraw = (n = 1) => {
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

	$.Element = function (a) {
		this.elt = a;
	};
	$._elements = [];

	$.TWO_PI = $.TAU = Math.PI * 2;

	$.log = $.print = console.log;
	$.describe = () => {};

	for (let m in Q5.modules) {
		Q5.modules[m]($, p);
	}

	// INIT

	for (let k in Q5) {
		if (k[1] != '_' && k[1] == k[1].toUpperCase()) {
			$[k] = Q5[k];
		}
	}

	if (scope == 'global') {
		Object.assign(Q5, $);
		delete Q5.Q5;
	}

	for (let m of Q5.prototype._methods.init) {
		m.call($);
	}

	for (let [n, fn] of Object.entries(Q5.prototype)) {
		if (n[0] != '_' && typeof $[n] == 'function') $[n] = fn.bind($);
	}

	if (scope == 'global') {
		let props = Object.getOwnPropertyNames($);
		for (let p of props) {
			if (p[0] != '_') globalScope[p] = $[p];
		}
	}

	if (typeof scope == 'function') scope($);

	if (scope == 'graphics') return;

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
	$._isTouchAware = t.touchStarted || t.touchMoved || t.mouseReleased;
	let preloadDefined = t.preload;
	let userFns = [
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
	for (let k of userFns) {
		if (!t[k]) $[k] = () => {};
		else if ($._isGlobal) {
			$[k] = () => {
				try {
					return t[k]();
				} catch (e) {
					if ($._aiErrorAssistance) $._aiErrorAssistance(e);
					else console.error(e);
				}
			};
		}
	}

	if (!($.setup || $.draw)) return;

	$._startDone = false;

	async function _start() {
		$._startDone = true;
		if ($._preloadCount > 0) return raf(_start);
		millisStart = performance.now();
		await $.setup();
		if ($.frameCount) return;
		if ($.ctx === null) $.createCanvas(100, 100);
		$._setupDone = true;
		if ($.ctx) $.resetMatrix();
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

Q5.modules = {};

Q5._nodejs = typeof process == 'object';

Q5._instanceCount = 0;
Q5._friendlyError = (msg, func) => {
	throw Error(func + ': ' + msg);
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

if (Q5._nodejs) global.p5 ??= global.Q5 = Q5;
else if (typeof window == 'object') window.p5 ??= window.Q5 = Q5;
else global.window = 0;

if (typeof document == 'object') {
	document.addEventListener('DOMContentLoaded', () => {
		if (!Q5._hasGlobal) new Q5('auto');
	});
}
Q5.modules.q2d_canvas = ($, p) => {
	$._OffscreenCanvas =
		window.OffscreenCanvas ||
		function () {
			return document.createElement('canvas');
		};

	if (Q5._nodejs) {
		if (Q5._createNodeJSCanvas) {
			p.canvas = Q5._createNodeJSCanvas(100, 100);
		}
	} else if ($._scope == 'image' || $._scope == 'graphics') {
		p.canvas = new $._OffscreenCanvas(100, 100);
	}
	if (!$.canvas) {
		if (typeof document == 'object') {
			p.canvas = document.createElement('canvas');
			$.canvas.id = 'q5Canvas' + Q5._instanceCount;
			$.canvas.classList.add('q5Canvas');
		} else $.noCanvas();
	}

	let c = $.canvas;

	c.width = $.width = 100;
	c.height = $.height = 100;

	if (c && $._scope != 'graphics' && $._scope != 'image') {
		$._setupDone = false;
		let parent = $._parent;
		if (parent && typeof parent == 'string') {
			parent = document.getElementById(parent);
		}
		c.parent = (el) => {
			if (typeof el == 'string') el = document.getElementById(el);
			el.append(c);

			function parentResized() {
				if ($.frameCount > 1) {
					$._shouldResize = true;
					$._adjustDisplay();
				}
			}
			if (typeof ResizeObserver == 'function') {
				if ($._ro) $._ro.disconnect();
				$._ro = new ResizeObserver(parentResized);
				$._ro.observe(parent);
			} else if (!$.frameCount) {
				window.addEventListener('resize', parentResized);
			}
		};
		function appendCanvas() {
			parent ??= document.getElementsByTagName('main')[0];
			if (!parent) {
				parent = document.createElement('main');
				document.body.append(parent);
			}
			c.parent(parent);
		}
		if (document.body) appendCanvas();
		else document.addEventListener('DOMContentLoaded', appendCanvas);
	}

	$._adjustDisplay = () => {
		if (c.style) {
			c.style.width = c.w + 'px';
			c.style.height = c.h + 'px';
		}
	};

	$.createCanvas = function (w, h, renderer, options) {
		if (renderer == 'webgl') throw Error(`webgl renderer is not supported in q5, use '2d'`);
		if (typeof renderer == 'object') options = renderer;
		p.width = c.width = c.w = w || window.innerWidth;
		p.height = c.height = c.h = h || window.innerHeight;
		c.hw = w / 2;
		c.hh = h / 2;
		c.renderer = '2d';
		let opt = Object.assign({}, Q5.canvasOptions);
		if (options) Object.assign(opt, options);

		p.ctx = p.drawingContext = c.getContext('2d', opt);
		Object.assign(c, opt);
		if ($._colorMode == 'rgb') $.colorMode('rgb');
		if ($._scope != 'image') {
			$._defaultStyle();
			$._da = 0;
		}
		$.ctx.save();
		if ($._scope != 'image') {
			let pd = $.displayDensity();
			if ($._scope == 'graphics') pd = this._pixelDensity;
			else if (window.IntersectionObserver) {
				new IntersectionObserver((e) => {
					c.visible = e[0].isIntersecting;
				}).observe(c);
			}
			$.pixelDensity(Math.ceil(pd));
		} else this._pixelDensity = 1;

		if ($.displayMode) $.displayMode();
		else $._adjustDisplay();
		return c;
	};
	$._createCanvas = $.createCanvas;

	if ($._scope == 'image') return;

	$._defaultStyle = () => {
		$.ctx.fillStyle = 'white';
		$.ctx.strokeStyle = 'black';
		$.ctx.lineCap = 'round';
		$.ctx.lineJoin = 'miter';
		$.ctx.textAlign = 'left';
	};

	function cloneCtx() {
		let t = {};
		for (let prop in $.ctx) {
			if (typeof $.ctx[prop] != 'function') t[prop] = $.ctx[prop];
		}
		delete t.canvas;
		return t;
	}

	function _resizeCanvas(w, h) {
		w ??= window.innerWidth;
		h ??= window.innerHeight;

		let t = cloneCtx();
		let o;
		if ($.frameCount) {
			o = new $._OffscreenCanvas(c.width, c.height);
			o.w = c.w;
			o.h = c.h;
			let oCtx = o.getContext('2d');
			oCtx.drawImage(c, 0, 0);
		}

		c.width = Math.ceil(w * $._pixelDensity);
		c.height = Math.ceil(h * $._pixelDensity);
		c.w = w;
		c.h = h;
		c.hw = w / 2;
		c.hh = h / 2;
		for (let prop in t) $.ctx[prop] = t[prop];
		$.ctx.scale($._pixelDensity, $._pixelDensity);

		if ($.frameCount) $.ctx.drawImage(o, 0, 0, o.w, o.h);

		if (!$._da) {
			p.width = w;
			p.height = h;
		} else $.flexibleCanvas($._dau);

		if ($.frameCount != 0) $._adjustDisplay();
	}

	$.resizeCanvas = (w, h) => {
		if (w == c.w && h == c.h) return;
		_resizeCanvas(w, h);
	};

	$._pixelDensity = 1;
	$.displayDensity = () => window.devicePixelRatio;
	$.pixelDensity = (v) => {
		if (!v || v == $._pixelDensity) return $._pixelDensity;
		$._pixelDensity = v;
		_resizeCanvas(c.w, c.h);
		return v;
	};

	if ($._scope == 'image') return;

	$.fullscreen = (v) => {
		if (v === undefined) return document.fullscreenElement;
		if (v) document.body.requestFullscreen();
		else document.body.exitFullscreen();
	};

	$.flexibleCanvas = (unit = 400) => {
		if (unit) {
			$._da = c.width / (unit * $._pixelDensity);
			p.width = $._dau = unit;
			p.height = (c.h / c.w) * unit;
		} else $._da = 0;
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
		if ($._angleMode == 'degrees') r = $.radians(r);
		$.ctx.rotate(r);
	};
	$.scale = (x, y) => {
		y ??= x;
		$.ctx.scale(x, y);
	};
	$.opacity = (a) => ($.ctx.globalAlpha = a);
	$.applyMatrix = (a, b, c, d, e, f) => $.ctx.transform(a, b, c, d, e, f);
	$.shearX = (ang) => $.ctx.transform(1, 0, $.tan(ang), 1, 0, 0);
	$.shearY = (ang) => $.ctx.transform(1, $.tan(ang), 0, 1, 0, 0);
	$.resetMatrix = () => {
		$.ctx.resetTransform();
		$.ctx.scale($._pixelDensity, $._pixelDensity);
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
		$.ctx.save();
		let styles = {};
		for (let s of $._styleNames) styles[s] = $[s];
		$._styles.push(styles);
	};
	$.pop = $.popMatrix = () => {
		$.ctx.restore();
		let styles = $._styles.pop();
		for (let s of $._styleNames) $[s] = styles[s];
	};

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

	$.createGraphics = function (w, h, opt) {
		let g = new Q5('graphics');
		opt ??= {};
		opt.alpha ??= true;
		opt.colorSpace ??= $.canvas.colorSpace;
		g._createCanvas.call($, w, h, opt);
		return g;
	};

	if (window && $._scope != 'graphics') {
		window.addEventListener('resize', () => {
			$._shouldResize = true;
			p.windowWidth = window.innerWidth;
			p.windowHeight = window.innerHeight;
			p.deviceOrientation = window.screen?.orientation?.type;
		});
	}
};

Q5.canvasOptions = {
	alpha: false,
	colorSpace: 'display-p3'
};

if (!window.matchMedia || !matchMedia('(dynamic-range: high) and (color-gamut: p3)').matches) {
	Q5.canvasOptions.colorSpace = 'srgb';
} else Q5.supportsHDR = true;
Q5.modules.q2d_drawing = ($) => {
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

	$.CENTER = 'center';
	$.LEFT = 'left';
	$.RIGHT = 'right';
	$.TOP = 'top';
	$.BOTTOM = 'bottom';

	$.LANDSCAPE = 'landscape';
	$.PORTRAIT = 'portrait';

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

	$._doStroke = true;
	$._doFill = true;
	$._strokeSet = false;
	$._fillSet = false;
	$._ellipseMode = $.CENTER;
	$._rectMode = $.CORNER;
	$._curveDetail = 20;
	$._curveAlpha = 0.0;

	let firstVertex = true;
	let curveBuff = [];

	function ink() {
		if ($._doFill) $.ctx.fill();
		if ($._doStroke) $.ctx.stroke();
	}

	// DRAWING SETTINGS

	$.strokeWeight = (n) => {
		if (!n) $._doStroke = false;
		if ($._da) n *= $._da;
		$.ctx.lineWidth = n || 0.0001;
	};
	$.stroke = function (c) {
		$._doStroke = true;
		$._strokeSet = true;
		if (Q5.Color) {
			if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
			else if ($._namedColors[c]) c = $.color(...$._namedColors[c]);
			if (c.a <= 0) return ($._doStroke = false);
		}
		$.ctx.strokeStyle = c.toString();
	};
	$.noStroke = () => ($._doStroke = false);
	$.fill = function (c) {
		$._doFill = true;
		$._fillSet = true;
		if (Q5.Color) {
			if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
			else if ($._namedColors[c]) c = $.color(...$._namedColors[c]);
			if (c.a <= 0) return ($._doFill = false);
		}
		$.ctx.fillStyle = c.toString();
	};
	$.noFill = () => ($._doFill = false);
	$.blendMode = (x) => ($.ctx.globalCompositeOperation = x);
	$.strokeCap = (x) => ($.ctx.lineCap = x);
	$.strokeJoin = (x) => ($.ctx.lineJoin = x);
	$.ellipseMode = (x) => ($._ellipseMode = x);
	$.rectMode = (x) => ($._rectMode = x);
	$.curveDetail = (x) => ($._curveDetail = x);
	$.curveAlpha = (x) => ($._curveAlpha = x);
	$.curveTightness = (x) => ($._curveAlpha = x);

	// DRAWING

	$.clear = () => {
		$.ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
	};

	$.background = function (c) {
		if (c.canvas) return $.image(c, 0, 0, $.width, $.height);
		$.ctx.save();
		$.ctx.resetTransform();
		if (Q5.Color) {
			if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
			else if ($._namedColors[c]) c = $.color(...$._namedColors[c]);
		}
		$.ctx.fillStyle = c.toString();
		$.ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
		$.ctx.restore();
	};

	$.line = (x0, y0, x1, y1) => {
		if ($._doStroke) {
			if ($._da) {
				x0 *= $._da;
				y0 *= $._da;
				x1 *= $._da;
				y1 *= $._da;
			}
			$.ctx.beginPath();
			$.ctx.moveTo(x0, y0);
			$.ctx.lineTo(x1, y1);
			$.ctx.stroke();
		}
	};

	function arc(x, y, w, h, lo, hi, mode, detail) {
		if (!$._doFill && !$._doStroke) return;
		let d = $._angleMode == 'degrees';
		let full = d ? 360 : $.TAU;
		lo %= full;
		hi %= full;
		if (lo < 0) lo += full;
		if (hi < 0) hi += full;
		if (lo == 0 && hi == 0) return;
		if (lo > hi) [lo, hi] = [hi, lo];
		$.ctx.beginPath();
		if (w == h) {
			if (d) {
				lo = $.radians(lo);
				hi = $.radians(hi);
			}
			$.ctx.arc(x, y, w / 2, lo, hi);
		} else {
			for (let i = 0; i < detail + 1; i++) {
				let t = i / detail;
				let a = $.lerp(lo, hi, t);
				let dx = ($.cos(a) * w) / 2;
				let dy = ($.sin(a) * h) / 2;
				$.ctx[i ? 'lineTo' : 'moveTo'](x + dx, y + dy);
			}
			if (mode == $.CHORD) {
				$.ctx.closePath();
			} else if (mode == $.PIE) {
				$.ctx.lineTo(x, y);
				$.ctx.closePath();
			}
		}
		ink();
	}
	$.arc = (x, y, w, h, start, stop, mode, detail = 25) => {
		if (start == stop) return $.ellipse(x, y, w, h);
		mode ??= $.PIE;
		if ($._ellipseMode == $.CENTER) {
			arc(x, y, w, h, start, stop, mode, detail);
		} else if ($._ellipseMode == $.RADIUS) {
			arc(x, y, w * 2, h * 2, start, stop, mode, detail);
		} else if ($._ellipseMode == $.CORNER) {
			arc(x + w / 2, y + h / 2, w, h, start, stop, mode, detail);
		} else if ($._ellipseMode == $.CORNERS) {
			arc((x + w) / 2, (y + h) / 2, w - x, h - y, start, stop, mode, detail);
		}
	};

	function ellipse(x, y, w, h) {
		if (!$._doFill && !$._doStroke) return;
		if ($._da) {
			x *= $._da;
			y *= $._da;
			w *= $._da;
			h *= $._da;
		}
		$.ctx.beginPath();
		$.ctx.ellipse(x, y, w / 2, h / 2, 0, 0, $.TAU);
		ink();
	}
	$.ellipse = (x, y, w, h) => {
		h ??= w;
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
			$.ctx.arc(x, y, d / 2, 0, $.TAU);
			ink();
		} else $.ellipse(x, y, d, d);
	};
	$.point = (x, y) => {
		if (x.x) {
			y = x.y;
			x = x.x;
		}
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		$.ctx.save();
		$.ctx.beginPath();
		$.ctx.arc(x, y, $.ctx.lineWidth / 2, 0, $.TAU);
		$.ctx.fillStyle = $.ctx.strokeStyle;
		$.ctx.fill();
		$.ctx.restore();
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
		if (!$._doFill && !$._doStroke) return;
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
		const hh = Math.min(Math.abs(h), Math.abs(w)) / 2;
		tl = Math.min(hh, tl);
		tr = Math.min(hh, tr);
		bl = Math.min(hh, bl);
		br = Math.min(hh, br);
		$.ctx.beginPath();
		$.ctx.moveTo(x + tl, y);
		$.ctx.arcTo(x + w, y, x + w, y + h, tr);
		$.ctx.arcTo(x + w, y + h, x, y + h, br);
		$.ctx.arcTo(x, y + h, x, y, bl);
		$.ctx.arcTo(x, y, x + w, y, tl);
		$.ctx.closePath();
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

	function clearBuff() {
		curveBuff = [];
	}

	$.beginShape = () => {
		clearBuff();
		$.ctx.beginPath();
		firstVertex = true;
	};
	$.beginContour = () => {
		$.ctx.closePath();
		clearBuff();
		firstVertex = true;
	};
	$.endContour = () => {
		clearBuff();
		firstVertex = true;
	};
	$.vertex = (x, y) => {
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		clearBuff();
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
		clearBuff();
		$.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	};
	$.quadraticVertex = (cp1x, cp1y, x, y) => {
		if ($._da) {
			cp1x *= $._da;
			cp1y *= $._da;
			x *= $._da;
			y *= $._da;
		}
		clearBuff();
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
		clearBuff();
		if (close) $.ctx.closePath();
		ink();
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
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		curveBuff.push([x, y]);
		if (curveBuff.length < 4) return;
		let p0 = curveBuff.at(-4);
		let p1 = curveBuff.at(-3);
		let p2 = curveBuff.at(-2);
		let p3 = curveBuff.at(-1);
		let pts = catmullRomSpline(...p0, ...p1, ...p2, ...p3, $._curveDetail, $._curveAlpha);
		for (let i = 0; i < pts.length; i++) {
			if (firstVertex) {
				$.ctx.moveTo(...pts[i]);
			} else {
				$.ctx.lineTo(...pts[i]);
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

	$.erase = function (fillAlpha = 255, strokeAlpha = 255) {
		$.ctx.save();
		$.ctx.globalCompositeOperation = 'destination-out';
		$.ctx.fillStyle = `rgba(0, 0, 0, ${fillAlpha / 255})`;
		$.ctx.strokeStyle = `rgba(0, 0, 0, ${strokeAlpha / 255})`;
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
Q5.modules.q2d_image = ($, p) => {
	$.createImage = (w, h, opt) => {
		opt ??= {};
		opt.alpha ??= true;
		opt.colorSpace ??= $.canvas.colorSpace || Q5.canvasOptions.colorSpace;
		return new Q5.Image(w, h, opt);
	};

	$._tint = null;
	let imgData = null;
	let tmpCtx = null;
	let tmpCt2 = null;

	function makeTmpCtx(w, h) {
		h ??= w || $.canvas.height;
		w ??= $.canvas.width;
		if (tmpCtx == null) {
			tmpCtx = new $._OffscreenCanvas(w, h).getContext('2d', {
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
			tmpCt2 = new $._OffscreenCanvas(w, h).getContext('2d', {
				colorSpace: $.canvas.colorSpace
			});
		}
		if (tmpCt2.canvas.width != w || tmpCt2.canvas.height != h) {
			tmpCt2.canvas.width = w;
			tmpCt2.canvas.height = h;
		}
	}

	$._softFilter = () => {
		throw 'Load q5-2d-soft-filters.js to use software filters.';
	};

	function nativeFilter(filt) {
		tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
		tmpCtx.filter = filt;
		tmpCtx.drawImage($.canvas, 0, 0);
		$.ctx.save();
		$.ctx.resetTransform();
		$.ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
		$.ctx.drawImage(tmpCtx.canvas, 0, 0);
		$.ctx.restore();
	}

	$.filter = (typ, x) => {
		if (!$.ctx.filter) return $._softFilter(typ, x);
		makeTmpCtx();
		if (typeof typ == 'string') {
			nativeFilter(typ);
		} else if (typ == Q5.THRESHOLD) {
			x ??= 0.5;
			x = Math.max(x, 0.00001);
			let b = Math.floor((0.5 / x) * 100);
			nativeFilter(`saturate(0%) brightness(${b}%) contrast(1000000%)`);
		} else if (typ == Q5.GRAY) {
			nativeFilter(`saturate(0%)`);
		} else if (typ == Q5.OPAQUE) {
			tmpCtx.fillStyle = 'black';
			tmpCtx.fillRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
			tmpCtx.drawImage($.canvas, 0, 0);
			$.ctx.save();
			$.ctx.resetTransform();
			$.ctx.drawImage(tmpCtx.canvas, 0, 0);
			$.ctx.restore();
		} else if (typ == Q5.INVERT) {
			nativeFilter(`invert(100%)`);
		} else if (typ == Q5.BLUR) {
			nativeFilter(`blur(${Math.ceil((x * $._pixelDensity) / 1) || 1}px)`);
		} else {
			$._softFilter(typ, x);
		}
	};

	$.resize = (w, h) => {
		makeTmpCtx();
		tmpCtx.drawImage($.canvas, 0, 0);
		p.width = w;
		p.height = h;
		$.canvas.width = w * $._pixelDensity;
		$.canvas.height = h * $._pixelDensity;
		$.ctx.save();
		$.ctx.resetTransform();
		$.ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
		$.ctx.drawImage(tmpCtx.canvas, 0, 0, $.canvas.width, $.canvas.height);
		$.ctx.restore();
	};

	$.trim = () => {
		let pd = $._pixelDensity || 1;
		let imgData = $.ctx.getImageData(0, 0, $.width * pd, $.height * pd);
		let data = imgData.data;
		let left = $.width,
			right = 0,
			top = $.height,
			bottom = 0;

		for (let y = 0; y < $.height * pd; y++) {
			for (let x = 0; x < $.width * pd; x++) {
				let index = (y * $.width * pd + x) * 4;
				if (data[index + 3] !== 0) {
					if (x < left) left = x;
					if (x > right) right = x;
					if (y < top) top = y;
					if (y > bottom) bottom = y;
				}
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
	};

	$._save = async (data, name, ext) => {
		name = name || 'untitled';
		ext = ext || 'png';
		if (ext == 'jpg' || ext == 'png' || ext == 'webp') {
			if (data instanceof OffscreenCanvas) {
				const blob = await data.convertToBlob({ type: 'image/' + ext });
				data = await new Promise((resolve) => {
					const reader = new FileReader();
					reader.onloadend = () => resolve(reader.result);
					reader.readAsDataURL(blob);
				});
			} else {
				data = data.toDataURL('image/' + ext);
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

	$.get = (x, y, w, h) => {
		let pd = $._pixelDensity || 1;
		if (x !== undefined && w === undefined) {
			let c = $.ctx.getImageData(x * pd, y * pd, 1, 1).data;
			return new $.Color(c[0], c[1], c[2], c[3] / 255);
		}
		x = (x || 0) * pd;
		y = (y || 0) * pd;
		let _w = (w = w || $.width);
		let _h = (h = h || $.height);
		w *= pd;
		h *= pd;
		let img = $.createImage(w, h);
		let imgData = $.ctx.getImageData(x, y, w, h);
		img.ctx.putImageData(imgData, 0, 0);
		img._pixelDensity = pd;
		img.width = _w;
		img.height = _h;
		return img;
	};

	$.set = (x, y, c) => {
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
				$.pixels[idx] = c.r ?? c.l;
				$.pixels[idx + 1] = c.g ?? c.c;
				$.pixels[idx + 2] = c.b ?? c.h;
				$.pixels[idx + 3] = c.a;
			}
		}
	};

	$.loadPixels = () => {
		imgData = $.ctx.getImageData(0, 0, $.canvas.width, $.canvas.height);
		p.pixels = imgData.data;
	};
	$.updatePixels = () => {
		if (imgData != null) $.ctx.putImageData(imgData, 0, 0);
	};

	$._tinted = function (col) {
		let alpha = col.a;
		col.a = 255;
		makeTmpCtx();
		tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
		tmpCtx.fillStyle = col.toString();
		tmpCtx.fillRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
		tmpCtx.globalCompositeOperation = 'multiply';
		tmpCtx.drawImage($.ctx.canvas, 0, 0);
		tmpCtx.globalCompositeOperation = 'source-over';

		$.ctx.save();
		$.ctx.resetTransform();
		let old = $.ctx.globalCompositeOperation;
		$.ctx.globalCompositeOperation = 'source-in';
		$.ctx.drawImage(tmpCtx.canvas, 0, 0);
		$.ctx.globalCompositeOperation = old;
		$.ctx.restore();

		tmpCtx.globalAlpha = alpha / 255;
		tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
		tmpCtx.drawImage($.ctx.canvas, 0, 0);
		tmpCtx.globalAlpha = 1;

		$.ctx.save();
		$.ctx.resetTransform();
		$.ctx.clearRect(0, 0, $.ctx.canvas.width, $.ctx.canvas.height);
		$.ctx.drawImage(tmpCtx.canvas, 0, 0);
		$.ctx.restore();
	};

	$.smooth = () => ($.ctx.imageSmoothingEnabled = true);
	$.noSmooth = () => ($.ctx.imageSmoothingEnabled = false);

	if ($._scope == 'image') return;

	$.saveCanvas = $.canvas.save = $.save;

	$.tint = function (c) {
		$._tint = c._q5Color ? c : $.color(...arguments);
	};
	$.noTint = () => ($._tint = null);

	// IMAGING

	$.imageMode = (mode) => ($._imageMode = mode);
	$.image = (img, dx, dy, dWidth, dHeight, sx = 0, sy = 0, sWidth, sHeight) => {
		if ($._da) {
			dx *= $._da;
			dy *= $._da;
			dWidth *= $._da;
			dHeight *= $._da;
			sx *= $._da;
			sy *= $._da;
			sWidth *= $._da;
			sHeight *= $._da;
		}
		let drawable = img.canvas || img;
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
		if (img.canvas && $._tint != null) {
			makeTmpCt2(img.canvas.width, img.canvas.height);
			tmpCt2.drawImage(img.canvas, 0, 0);
			img._tinted($._tint);
		}
		dWidth ??= img.width || img.videoWidth;
		dHeight ??= img.height || img.videoHeight;
		if ($._imageMode == 'center') {
			dx -= dWidth * 0.5;
			dy -= dHeight * 0.5;
		}
		let pd = img._pixelDensity || 1;
		if (!sWidth) {
			sWidth = drawable.width || drawable.videoWidth;
		} else sWidth *= pd;
		if (!sHeight) {
			sHeight = drawable.height || drawable.videoHeight;
		} else sHeight *= pd;
		$.ctx.drawImage(drawable, sx * pd, sy * pd, sWidth, sHeight, dx, dy, dWidth, dHeight);
		reset();
	};

	$.loadImage = function (url, cb, opt) {
		if (url.canvas) return url;
		if (url.slice(-3).toLowerCase() == 'gif') {
			throw new Error(`q5 doesn't support GIFs due to their impact on performance. Use a video or animation instead.`);
		}
		p._preloadCount++;
		let last = [...arguments].at(-1);
		opt = typeof last == 'object' ? last : null;

		let g = $.createImage(1, 1, opt);

		function loaded(img) {
			let c = g.ctx;
			g.width = c.canvas.width = img.naturalWidth || img.width;
			g.height = c.canvas.height = img.naturalHeight || img.height;
			c.drawImage(img, 0, 0);
			p._preloadCount--;
			if (cb) cb(g);
		}

		if (Q5._nodejs && global.CairoCanvas) {
			global.CairoCanvas.loadImage(url)
				.then(loaded)
				.catch((e) => {
					p._preloadCount--;
					throw e;
				});
		} else {
			let img = new window.Image();
			img.src = url;
			img.crossOrigin = 'Anonymous';
			img._pixelDensity = 1;
			img.onload = () => loaded(img);
			img.onerror = (e) => {
				p._preloadCount--;
				throw e;
			};
		}
		return g;
	};
};

// IMAGE CLASS

Q5.imageModules = ['q2d_canvas', 'q2d_image'];

class _Q5Image {
	constructor(w, h, opt) {
		let $ = this;
		$._scope = 'image';
		$.canvas = $.ctx = $.drawingContext = null;
		$.pixels = [];
		for (let m of Q5.imageModules) {
			Q5.modules[m]($, $);
		}
		delete this.createCanvas;

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

Q5.Image ??= _Q5Image;

Q5.THRESHOLD = 1;
Q5.GRAY = 2;
Q5.OPAQUE = 3;
Q5.INVERT = 4;
Q5.POSTERIZE = 5;
Q5.DILATE = 6;
Q5.ERODE = 7;
Q5.BLUR = 8;
/* software implementation of image filters */
Q5.modules.q2d_soft_filters = ($) => {
	let tmpBuf = null;

	function makeTmpBuf() {
		let l = $.canvas.width * $.canvas.height * 4;
		if (!tmpBuf || l != tmpBuf.length) {
			tmpBuf = new Uint8ClampedArray(l);
		}
	}

	function initSoftFilters() {
		$._filters = [];
		$._filters[Q5.THRESHOLD] = (data, thresh) => {
			if (thresh === undefined) thresh = 127.5;
			else thresh *= 255;
			for (let i = 0; i < data.length; i += 4) {
				const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
				data[i] = data[i + 1] = data[i + 2] = gray >= thresh ? 255 : 0;
			}
		};
		$._filters[Q5.GRAY] = (data) => {
			for (let i = 0; i < data.length; i += 4) {
				const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
				data[i] = data[i + 1] = data[i + 2] = gray;
			}
		};
		$._filters[Q5.OPAQUE] = (data) => {
			for (let i = 0; i < data.length; i += 4) {
				data[i + 3] = 255;
			}
		};
		$._filters[Q5.INVERT] = (data) => {
			for (let i = 0; i < data.length; i += 4) {
				data[i] = 255 - data[i];
				data[i + 1] = 255 - data[i + 1];
				data[i + 2] = 255 - data[i + 2];
			}
		};
		$._filters[Q5.POSTERIZE] = (data, lvl = 4) => {
			let lvl1 = lvl - 1;
			for (let i = 0; i < data.length; i += 4) {
				data[i] = (((data[i] * lvl) >> 8) * 255) / lvl1;
				data[i + 1] = (((data[i + 1] * lvl) >> 8) * 255) / lvl1;
				data[i + 2] = (((data[i + 2] * lvl) >> 8) * 255) / lvl1;
			}
		};
		$._filters[Q5.DILATE] = (data) => {
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
		$._filters[Q5.ERODE] = (data) => {
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
		$._filters[Q5.BLUR] = (data, rad) => {
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

	$._softFilter = (typ, x) => {
		if (!$._filters) initSoftFilters();
		let imgData = $.ctx.getImageData(0, 0, $.canvas.width, $.canvas.height);
		$._filters[typ](imgData.data, x);
		$.ctx.putImageData(imgData, 0, 0);
	};
};
Q5.modules.q2d_text = ($, p) => {
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

	$._textFont = 'sans-serif';
	$._textSize = 12;
	$._textLeading = 15;
	$._textLeadDiff = 3;
	$._textStyle = 'normal';

	$.loadFont = (url, cb) => {
		p._preloadCount++;
		let name = url.split('/').pop().split('.')[0].replace(' ', '');
		let f = new FontFace(name, `url(${url})`);
		document.fonts.add(f);
		f.load().then(() => {
			p._preloadCount--;
			if (cb) cb(name);
		});
		return name;
	};
	$.textFont = (x) => ($._textFont = x);
	$.textSize = (x) => {
		if (x === undefined) return $._textSize;
		if ($._da) x *= $._da;
		$._textSize = x;
		if (!$._leadingSet) {
			$._textLeading = x * 1.25;
			$._textLeadDiff = $._textLeading - x;
		}
	};
	$.textLeading = (x) => {
		if (x === undefined) return $._textLeading;
		if ($._da) x *= $._da;
		$._textLeading = x;
		$._textLeadDiff = x - $._textSize;
		$._leadingSet = true;
	};
	$.textStyle = (x) => ($._textStyle = x);
	$.textAlign = (horiz, vert) => {
		$.ctx.textAlign = horiz;
		if (vert) {
			$.ctx.textBaseline = vert == $.CENTER ? 'middle' : vert;
		}
	};
	$.textWidth = (str) => {
		$.ctx.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;
		return $.ctx.measureText(str).width;
	};
	$.textAscent = (str) => {
		$.ctx.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;
		return $.ctx.measureText(str).actualBoundingBoxAscent;
	};
	$.textDescent = (str) => {
		$.ctx.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;
		return $.ctx.measureText(str).actualBoundingBoxDescent;
	};
	$._textCache = !!Q5.Image;
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
	$._genTextImageKey = (str, w, h) => {
		return (
			str.slice(0, 200) +
			$._textStyle +
			$._textSize +
			$._textFont +
			($._doFill ? $.ctx.fillStyle : '') +
			'_' +
			($._doStroke && $._strokeSet ? $.ctx.lineWidth + $.ctx.strokeStyle + '_' : '') +
			(w || '') +
			(h ? 'x' + h : '')
		);
	};
	$.createTextImage = (str, w, h) => {
		let og = $._textCache;
		$._textCache = true;
		$._genTextImage = true;
		$.text(str, 0, 0, w, h);
		$._genTextImage = false;
		let k = $._genTextImageKey(str, w, h);
		$._textCache = og;
		return $._tic.get(k);
	};
	$.text = (str, x, y, w, h) => {
		if (str === undefined) return;
		str = str.toString();
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		if (!$._doFill && !$._doStroke) return;
		let c, ti, tg, k, cX, cY, _ascent, _descent;
		let t = $.ctx.getTransform();
		let useCache = $._genTextImage || ($._textCache && (t.b != 0 || t.c != 0));
		if (!useCache) {
			c = $.ctx;
			cX = x;
			cY = y;
		} else {
			k = $._genTextImageKey(str, w, h);
			ti = $._tic.get(k);
			if (ti && !$._genTextImage) {
				$.textImage(ti, x, y);
				return;
			}
			tg = $.createGraphics.call($, 1, 1);
			c = tg.ctx;
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

			c.fillStyle = $.ctx.fillStyle;
			c.strokeStyle = $.ctx.strokeStyle;
			c.lineWidth = $.ctx.lineWidth;
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
			if (!$._genTextImage) $.textImage(ti, x, y);
		}
	};
	$.textImage = (img, x, y) => {
		let og = $._imageMode;
		$._imageMode = 'corner';
		if ($.ctx.textAlign == 'center') x -= img.width * 0.5;
		else if ($.ctx.textAlign == 'right') x -= img.width;
		if ($.ctx.textBaseline == 'alphabetic') y -= $._textLeading;
		if ($.ctx.textBaseline == 'middle') y -= img._descent + img._ascent * 0.5 + $._textLeadDiff;
		else if ($.ctx.textBaseline == 'bottom') y -= img._ascent + img._descent + $._textLeadDiff;
		else if ($.ctx.textBaseline == 'top') y -= img._descent + $._textLeadDiff;
		$.image(img, x, y);
		$._imageMode = og;
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
};
Q5.modules.ai = ($) => {
	$.askAI = (q = '') => {
		throw Error('Ask AI ✨ ' + q);
	};

	$._aiErrorAssistance = async (e) => {
		let askAI = e.message?.includes('Ask AI ✨');
		if (!askAI) console.error(e);
		if (Q5.disableFriendlyErrors) return;
		if (askAI || !Q5.errorTolerant) $.noLoop();
		let stackLines = e.stack?.split('\n');
		if (!e.stack || stackLines.length <= 1) return;

		let idx = 1;
		let sep = '(';
		if (navigator.userAgent.indexOf('Chrome') == -1) {
			idx = 0;
			sep = '@';
		}
		while (stackLines[idx].indexOf('q5.js:') >= 0) idx++;

		let parts = stackLines[idx].split(sep).at(-1);
		parts = parts.split(':');
		let lineNum = parseInt(parts.at(-2));
		if (askAI) lineNum++;
		let fileUrl = parts.slice(0, -2).join(':');
		let fileBase = fileUrl.split('/').at(-1);

		try {
			let res = await (await fetch(fileUrl)).text();
			let lines = res.split('\n');
			let errLine = lines[lineNum - 1].trim();

			let context = '';
			let i = 1;
			while (context.length < 1600) {
				if (lineNum - i >= 0) {
					context = lines[lineNum - i].trim() + '\n' + context;
				}
				if (lineNum + i < lines.length) {
					context += lines[lineNum + i].trim() + '\n';
				} else break;
				i++;
			}

			let question =
				askAI && e.message.length > 10 ? e.message.slice(10) : 'Whats+wrong+with+this+line%3F+short+answer';

			let url =
				'https://chatgpt.com/?q=q5.js+' +
				question +
				(askAI ? '' : '%0A%0A' + encodeURIComponent(e.name + ': ' + e.message)) +
				'%0A%0ALine%3A+' +
				encodeURIComponent(errLine) +
				'%0A%0AExcerpt+for+context%3A%0A%0A' +
				encodeURIComponent(context);

			if (!askAI) console.log('Error in ' + fileBase + ' on line ' + lineNum + ':\n\n' + errLine);

			console.warn('Ask AI ✨ ' + url);

			if (askAI) window.open(url, '_blank');
		} catch (err) {}
	};
};
Q5.modules.color = ($, p) => {
	$.RGB = $.RGBA = $._colorMode = 'rgb';
	$.OKLCH = 'oklch';

	if (Q5.supportsHDR) $.Color = Q5.ColorRGBA_P3;
	else $.Color = Q5.ColorRGBA;

	$.colorMode = (mode) => {
		$._colorMode = mode;
		if (mode == 'oklch') {
			p.Color = Q5.ColorOKLCH;
		} else if (mode == 'rgb') {
			if ($.canvas.colorSpace == 'srgb') p.Color = Q5.ColorRGBA;
			else p.Color = Q5.ColorRGBA_P3;
		} else if (mode == 'srgb') {
			p.Color = Q5.ColorRGBA;
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

	$.color = function (c0, c1, c2, c3) {
		let C = $.Color;
		if (c0._q5Color) return new C(...c0.levels);
		let args = arguments;
		if (args.length == 1) {
			if (typeof c0 == 'string') {
				if (c0[0] == '#') {
					if (c0.length <= 5) {
						return new C(
							parseInt(c0[1] + c0[1], 16),
							parseInt(c0[2] + c0[2], 16),
							parseInt(c0[3] + c0[3], 16),
							c0.length == 4 ? null : parseInt(c0[4] + c0[4], 16)
						);
					}
					return new C(
						parseInt(c0.slice(1, 3), 16),
						parseInt(c0.slice(3, 5), 16),
						parseInt(c0.slice(5, 7), 16),
						c0.length == 7 ? null : parseInt(c0.slice(7, 9), 16)
					);
				}
				if ($._namedColors[c0]) return new C(...$._namedColors[c0]);
				console.error(
					"q5 can't parse color: " + c0 + '\nOnly numeric input, hex, and common named colors are supported.'
				);
				return new C(0, 0, 0);
			}
			if (Array.isArray(c0)) return new C(...c0);
		}
		if ($._colorMode == 'rgb') {
			if (args.length == 1) return new C(c0, c0, c0);
			if (args.length == 2) return new C(c0, c0, c0, c1);
		}
		if (args.length == 3) return new C(c0, c1, c2);
		if (args.length == 4) return new C(c0, c1, c2, c3);
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
};

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
		return `oklch(${this.l} ${this.c} ${this.h} / ${this.a})`;
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
Q5.modules.display = ($) => {
	if (!$.canvas || $._scope == 'graphics') return;

	let c = $.canvas;

	if (Q5._instanceCount == 0 && !Q5._nodejs) {
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
.q5-maxed,
.q5-fullscreen {
  display: flex;
	align-items: center;
	justify-content: center;
}
main.q5-centered,
main.q5-maxed,
.q5-fullscreen {
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
			if ($.noSmooth) $.noSmooth();
			if ($.textFont) $.textFont('monospace');
		}
		if (c.displayMode == 'normal') {
			p.classList.remove('q5-centered', 'q5-maxed', 'q5-fullscreen');
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

	$.displayMode = (displayMode = 'normal', renderQuality = 'default', displayScale = 1) => {
		if (typeof displayScale == 'string') {
			displayScale = parseFloat(displayScale.slice(1));
		}
		Object.assign(c, { displayMode, renderQuality, displayScale });
		$._adjustDisplay();
	};
};
Q5.modules.input = ($, p) => {
	if ($._scope == 'graphics') return;

	$.mouseX = 0;
	$.mouseY = 0;
	$.pmouseX = 0;
	$.pmouseY = 0;
	$.touches = [];
	$.mouseButton = null;
	$.keyIsPressed = false;
	$.mouseIsPressed = false;
	$.key = null;
	$.keyCode = null;

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
	let mouseBtns = [$.LEFT, $.CENTER, $.RIGHT];

	let c = $.canvas;

	$._startAudio = () => {
		if ($.getAudioContext && $.getAudioContext()?.state == 'suspended') $.userStartAudio();
	};

	$._updateMouse = (e) => {
		if (e.changedTouches) return;
		let rect = $.canvas.getBoundingClientRect();
		let sx = $.canvas.scrollWidth / $.width || 1;
		let sy = $.canvas.scrollHeight / $.height || 1;
		p.mouseX = (e.clientX - rect.left) / sx;
		p.mouseY = (e.clientY - rect.top) / sy;
	};
	$._onmousedown = (e) => {
		$._startAudio();
		$._updateMouse(e);
		p.mouseIsPressed = true;
		p.mouseButton = mouseBtns[e.button];
		$.mousePressed(e);
	};
	$._onmousemove = (e) => {
		$._updateMouse(e);
		if ($.mouseIsPressed) $.mouseDragged(e);
		else $.mouseMoved(e);
	};
	$._onmouseup = (e) => {
		$._updateMouse(e);
		p.mouseIsPressed = false;
		$.mouseReleased(e);
	};
	$._onclick = (e) => {
		$._updateMouse(e);
		p.mouseIsPressed = true;
		$.mouseClicked(e);
		p.mouseIsPressed = false;
	};
	c.addEventListener('mousedown', (e) => $._onmousedown(e));
	c.addEventListener('mouseup', (e) => $._onmouseup(e));
	c.addEventListener('click', (e) => $._onclick(e));

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
	$.requestPointerLock = document.body?.requestPointerLock;
	$.exitPointerLock = document.exitPointerLock;

	$._onkeydown = (e) => {
		if (e.repeat) return;
		$._startAudio();
		p.keyIsPressed = true;
		p.key = e.key;
		p.keyCode = e.keyCode;
		keysHeld[$.keyCode] = keysHeld[$.key.toLowerCase()] = true;
		$.keyPressed(e);
		if (e.key.length == 1) $.keyTyped(e);
	};
	$._onkeyup = (e) => {
		p.keyIsPressed = false;
		p.key = e.key;
		p.keyCode = e.keyCode;
		keysHeld[$.keyCode] = keysHeld[$.key.toLowerCase()] = false;
		$.keyReleased(e);
	};
	$.keyIsDown = (v) => !!keysHeld[typeof v == 'string' ? v.toLowerCase() : v];

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
		$._startAudio();
		p.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware) {
			p.mouseX = $.touches[0].x;
			p.mouseY = $.touches[0].y;
			p.mouseIsPressed = true;
			p.mouseButton = $.LEFT;
			if (!$.mousePressed(e)) e.preventDefault();
		}
		if (!$.touchStarted(e)) e.preventDefault();
	};
	$._ontouchmove = (e) => {
		p.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware) {
			p.mouseX = $.touches[0].x;
			p.mouseY = $.touches[0].y;
			if (!$.mouseDragged(e)) e.preventDefault();
		}
		if (!$.touchMoved(e)) e.preventDefault();
	};
	$._ontouchend = (e) => {
		p.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware && !$.touches.length) {
			p.mouseIsPressed = false;
			if (!$.mouseReleased(e)) e.preventDefault();
		}
		if (!$.touchEnded(e)) e.preventDefault();
	};
	c.addEventListener('touchstart', (e) => $._ontouchstart(e));
	c.addEventListener('touchmove', (e) => $._ontouchmove(e));
	c.addEventListener('touchcancel', (e) => $._ontouchend(e));
	c.addEventListener('touchend', (e) => $._ontouchend(e));

	if (window) {
		let l = window.addEventListener;
		l('mousemove', (e) => $._onmousemove(e), false);
		l('keydown', (e) => $._onkeydown(e), false);
		l('keyup', (e) => $._onkeyup(e), false);
	}
};
Q5.modules.math = ($, p) => {
	$.DEGREES = 'degrees';
	$.RADIANS = 'radians';

	$.PI = Math.PI;
	$.HALF_PI = Math.PI / 2;
	$.QUARTER_PI = Math.PI / 4;

	$.abs = Math.abs;
	$.ceil = Math.ceil;
	$.exp = Math.exp;
	$.floor = Math.floor;
	$.loge = Math.log;
	$.mag = Math.hypot;
	$.max = Math.max;
	$.min = Math.min;
	$.round = Math.round;
	$.pow = Math.pow;
	$.sqrt = Math.sqrt;

	$.SHR3 = 1;
	$.LCG = 2;

	$.angleMode = (mode) => ($._angleMode = mode);
	$._DEGTORAD = Math.PI / 180;
	$._RADTODEG = 180 / Math.PI;
	$.degrees = (x) => x * $._RADTODEG;
	$.radians = (x) => x * $._DEGTORAD;

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

	$.Noise = Q5.PerlinNoise;
	let _noise;

	$.noiseMode = (mode) => {
		p.Noise = Q5[mode[0].toUpperCase() + mode.slice(1) + 'Noise'];
		_noise = null;
	};
	$.noiseSeed = (seed) => {
		_noise = new $.Noise(seed);
	};
	$.noise = (x = 0, y = 0, z = 0) => {
		_noise ??= new $.Noise();
		return _noise.noise(x, y, z);
	};
	$.noiseDetail = (lod, falloff) => {
		_noise ??= new $.Noise();
		if (lod > 0) _noise.octaves = lod;
		if (falloff > 0) _noise.falloff = falloff;
	};
};

Q5.Noise = class {};

Q5.PerlinNoise = class extends Q5.Noise {
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
Q5.modules.sound = ($, p) => {
	$.Sound = Q5.Sound;
	$.loadSound = (path, cb) => {
		p._preloadCount++;
		Q5.aud ??= new window.AudioContext();
		let a = new Q5.Sound(path, cb);
		a.addEventListener('canplaythrough', () => {
			p._preloadCount--;
			if (cb) cb(a);
		});
		return a;
	};
	$.getAudioContext = () => Q5.aud;
	$.userStartAudio = () => Q5.aud.resume();
};

Q5.Sound = class extends Audio {
	constructor(path) {
		super(path);
		let a = this;
		a.load();
		a.panner = Q5.aud.createStereoPanner();
		a.source = Q5.aud.createMediaElementSource(a);
		a.source.connect(a.panner);
		a.panner.connect(Q5.aud.destination);
		Object.defineProperty(a, 'pan', {
			get: () => a.panner.pan.value,
			set: (v) => (a.panner.pan.value = v)
		});
	}
	setVolume(level) {
		this.volume = level;
	}
	setLoop(loop) {
		this.loop = loop;
	}
	setPan(value) {
		this.pan = value;
	}
};
Q5.modules.util = ($, p) => {
	$._loadFile = (path, cb, type) => {
		p._preloadCount++;
		let ret = {};
		fetch(path)
			.then((r) => {
				if (type == 'json') return r.json();
				if (type == 'text') return r.text();
			})
			.then((r) => {
				p._preloadCount--;
				Object.assign(ret, r);
				if (cb) cb(r);
			});
		return ret;
	};

	$.loadStrings = (path, cb) => $._loadFile(path, cb, 'text');
	$.loadJSON = (path, cb) => $._loadFile(path, cb, 'json');

	if (typeof localStorage == 'object') {
		$.storeItem = localStorage.setItem;
		$.getItem = localStorage.getItem;
		$.removeItem = localStorage.removeItem;
		$.clearStorage = localStorage.clear;
	}

	$.year = () => new Date().getFullYear();
	$.day = () => new Date().getDay();
	$.hour = () => new Date().getHours();
	$.minute = () => new Date().getMinutes();
	$.second = () => new Date().getSeconds();
};
Q5.modules.vector = ($) => {
	$.createVector = (x, y, z) => new Q5.Vector(x, y, z, $);
};

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
		let amt = args.at(-1);
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
