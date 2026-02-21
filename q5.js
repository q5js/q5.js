/**
 * q5.js
 * @version 4.2
 * @author quinton-ashley
 * @contributors evanalulu, Tezumie, ormaq, Dukemz, LingDong-
 * @license LGPL-3.0
 * @class Q5
 */
function Q5(scope, parent, renderer) {
	let $ = this;
	$._isQ5 = $._q5 = true;
	$._parent = parent;

	let readyResolve;
	$.ready = new Promise((res) => {
		readyResolve = res;
	});

	if (renderer == 'webgpu-fallback') {
		$._renderer = 'c2d';
		$._webgpu = $._webgpuFallback = true;
	} else {
		$._renderer = renderer || 'c2d';
		$['_' + $._renderer] = true;
	}

	let autoLoaded = scope == 'auto';
	scope ??= 'global';
	if (scope == 'auto') {
		if (!(window.setup || window.update || Q5.update || window.draw || Q5.draw)) return;
		scope = 'global';
	}
	let globalScope;
	if (scope == 'global') {
		Q5._hasGlobal = $._isGlobal = true;
		globalScope = Q5._esm ? globalThis : !Q5._server ? window : global;
	}
	if (scope == 'graphics') $._isGraphics = true;
	if (scope == 'image') $._isImage = true;

	let q = new Proxy($, {
		set: (t, p, v) => {
			$[p] = v;
			if ($._isGlobal) globalScope[p] = v;
			return true;
		}
	});

	$.canvas = $.ctx = $.drawingContext = null;
	$._flippedY = true;
	$.pixels = [];
	let looper = null,
		useRAF = true;

	$.frameCount = 0;
	$.deltaTime = 16;
	$._targetFrameRate = 0;
	$._targetFrameDuration = 16.666666666666668;
	$._frameRate = $._fps = 60;
	$._loop = true;

	async function runHooks(name) {
		for (let hook of Q5.hooks[name]) {
			await hook.call($, q);
		}
	}

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

	$._loaders = [];
	$.loadAll = () => {
		let loaders = [...$._loaders];
		$._loaders = [];
		if ($._g) {
			loaders = loaders.concat($._g._loaders);
			$._g._loaders = [];
		}
		return Promise.all(loaders);
	};

	$.isPreloadSupported = () => true;
	$.disablePreload = () => ($._disablePreload = true);

	const resolvers = [];
	$._incrementPreload = () => {
		$._loaders.push(new Promise((resolve) => resolvers.push(resolve)));
	};
	$._decrementPreload = () => {
		if (resolvers.length) resolvers.pop()();
	};

	async function _draw(timestamp) {
		let ts = timestamp || performance.now();

		if ($._didResize) {
			$.windowResized();
			$._didResize = false;
		}

		if ($._loop) {
			if (useRAF) looper = raf(_draw);
			else {
				let nextTS = ts + $._targetFrameDuration;
				let frameDelay = nextTS - performance.now();
				while (frameDelay < 0) frameDelay += $._targetFrameDuration;
				looper = setTimeout(() => _draw(nextTS), frameDelay);
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

		try {
			await runHooks('predraw');
			await $.draw();
		} catch (e) {
			if (!Q5.errorTolerant) $.noLoop();
			if ($._fes) $._fes(e);
			throw e;
		}

		await runHooks('postdraw');
		await $.postProcess();
		if ($._render) $._render();
		if ($._finishRender) $._finishRender();

		q.pmouseX = $.mouseX;
		q.pmouseY = $.mouseY;
		q.movedX = q.movedY = 0;
		if ($.pointers) {
			for (let i = $.pointers.length - 1; i >= 0; i--) {
				if ($.pointers[i]._ended) $.pointers.splice(i, 1);
			}
		}
		$._lastFrameTime = ts;
		let post = performance.now();
		$._fps = Math.round(1000 / (post - pre));
	}
	$.noLoop = () => {
		$._loop = false;
		if (looper != null) {
			if (useRAF && window.cancelAnimationFrame) cancelAnimationFrame(looper);
			else clearTimeout(looper);
		}
		looper = null;
	};
	$.loop = () => {
		$._loop = true;
		if ($._setupDone && looper == null) _draw();
	};
	$.isLooping = () => $._loop;
	$.redraw = async (n = 1) => {
		$._redraw = true;
		for (let i = 0; i < n; i++) {
			await _draw();
		}
		$._redraw = false;
	};
	$.remove = async () => {
		$.noLoop();
		if ($.canvas.remove) $.canvas.remove();
		await runHooks('remove');
	};

	$.frameRate = (hz) => {
		if (hz && hz != $._targetFrameRate) {
			$._targetFrameRate = hz;
			$._targetFrameDuration = 1000 / hz;

			if ($._loop && looper != null) {
				if (useRAF && window.cancelAnimationFrame) cancelAnimationFrame(looper);
				else clearTimeout(looper);
				looper = null;
			}
			useRAF = hz <= 60;
			if ($._setupDone) {
				if (useRAF) looper = raf(_draw);
				else looper = setTimeout(() => _draw(), $._targetFrameDuration);
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

	if ($._isGraphics) return;

	if ($._isGlobal) {
		let tmp = Object.assign({}, $);
		delete tmp.Color;
		Object.assign(Q5, tmp);
		delete Q5.Q5;
	}

	for (let hook of Q5.hooks.init) {
		hook.call($, q);
	}

	for (let [n, fn] of Object.entries(Q5.prototype)) {
		if (n[0] != '_' && typeof $[n] == 'function') $[n] = fn.bind($);
	}

	for (let [n, fn] of Object.entries(Q5.preloadMethods)) {
		$[n] = function () {
			$._incrementPreload();
			return fn.apply($, arguments);
			// the addon function is responsible for calling $._decrementPreload
		};
	}

	if ($._isGlobal) {
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

	let userFns = Q5._userFns.slice(0, 15);
	// shim if undefined
	for (let name of userFns) $[name] ??= () => {};

	if ($._isGlobal) {
		let allUserFns = Q5._userFns.slice(0, 19);

		for (let name of allUserFns) {
			if (Q5[name]) $[name] = Q5[name];
			else {
				Object.defineProperty(Q5, name, {
					get: () => $[name],
					set: (fn) => ($[name] = fn)
				});
			}
		}
	}

	function wrapWithFES(name) {
		const fn = t[name] || $[name];
		$[name] = (event) => {
			try {
				return fn(event);
			} catch (e) {
				if ($._fes) $._fes(e);
				throw e;
			}
		};
	}

	async function start() {
		await runHooks('presetup');

		readyResolve();

		if (t.preload || $.preload) {
			wrapWithFES('preload');
			$.preload();
		}

		await Promise.race([
			new Promise((resolve) => {
				function checkUserFns() {
					if ($._disablePreload || $.setup || $.update || $.draw || t.setup || t.update || t.draw) {
						resolve();
					} else if (!$._setupDone) {
						// render during loading
						if ($.canvas?.ready && $._render) {
							$._beginRender();
							$._render();
							$._finishRender();
						}
						raf(checkUserFns);
					}
				}
				checkUserFns();
			}),
			new Promise((resolve) => {
				setTimeout(() => {
					// if not loading
					if (!$._loaders.length && !$._g?._loaders.length) resolve();
				}, 500);
			})
		]);

		if (!$._disablePreload) {
			await $.loadAll();
		}

		$.setup ??= t.setup || (() => {});
		wrapWithFES('setup');

		for (let name of userFns) wrapWithFES(name);

		$.draw ??= t.draw || (() => {});

		millisStart = performance.now();
		await $.setup();
		$._setupDone = true;
		if ($.ctx === null) $.createCanvas(200, 200);
		await runHooks('postsetup');

		if ($.frameCount) return;

		$._lastFrameTime = performance.now() - 15;
		raf(_draw);
	}

	Q5.instances.push($);

	if (autoLoaded || Q5._esm) start();
	else setTimeout(start, 32);
}

Q5.renderers = {};
Q5.modules = {};

Q5._server = typeof process == 'object';
Q5._esm = this === undefined;

Q5._instanceCount = 0;
Q5.instances = [];
Q5._friendlyError = (msg, func) => {
	if (!Q5.disableFriendlyErrors) console.error(func + ': ' + msg);
};
Q5._validateParameters = () => true;

Q5._userFns = [
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
	'windowResized',
	'preload',
	'setup',
	'update',
	'draw'
];

Q5.hooks = {
	init: [],
	presetup: [],
	postsetup: [],
	predraw: [],
	postdraw: [],
	remove: []
};

Q5.addHook = (lifecycle, fn) => Q5.hooks[lifecycle].push(fn);

// p5 v2 compat
Q5.registerAddon = (addon) => {
	let lifecycles = {};
	addon(Q5, Q5.prototype, lifecycles);
	for (let l in lifecycles) {
		Q5.hooks[l].push(lifecycles[l]);
	}
};

// p5 v1 compat
Q5.prototype.registerMethod = (m, fn) => {
	if (m == 'beforeSetup' || m.includes('Preload')) m = 'presetup';
	if (m == 'afterSetup') m = 'postsetup';
	if (m == 'pre') m = 'predraw';
	if (m == 'post') m = 'postdraw';
	Q5.hooks[m].push(fn);
};

Q5.preloadMethods = {};
Q5.prototype.registerPreloadMethod = (n, fn) => (Q5.preloadMethods[n] = fn[n]);

function Canvas(w, h, opt) {
	if (Q5._hasGlobal) return;

	let useC2D = w == 'c2d' || h == 'c2d' || opt == 'c2d' || opt?.renderer == 'c2d' || !Q5._esm;

	if (useC2D) {
		let q = new Q5();
		let c = q.createCanvas(w, h, opt);
		return q.ready.then(() => c);
	} else {
		return Q5.WebGPU().then((q) => q.createCanvas(w, h, opt));
	}
}

function createCanvas(w, h, opt) {
	return Canvas(w, h, opt);
}

if (Q5._server) {
	global.q5 = global.Q5 = Q5;
	global.p5 ??= Q5;
}

if (typeof window == 'object') {
	window.q5 = window.Q5 = Q5;
	window.p5 ??= Q5;
	window.createCanvas = window.Canvas = Canvas;
	window.C2D = 'c2d';
	window.WEBGPU = 'webgpu';

	const cleanup = () => {
		for (let inst of Q5.instances) {
			try {
				inst.remove();
			} catch (e) {}
		}
	};

	window.addEventListener('beforeunload', cleanup);
	window.addEventListener('pagehide', cleanup);
} else global.window = 0;

Q5.version = Q5.VERSION = '4.2';

if (typeof document == 'object') {
	document.addEventListener('DOMContentLoaded', () => {
		if (!Q5._hasGlobal) {
			if (Q5.update || Q5.draw) {
				Q5.WebGPU();
			} else {
				new Q5('auto');
			}
		}
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
			q.canvas = Q5._createServerCanvas(200, 200);
		}
	} else if ($._isImage || $._isGraphics) {
		q.canvas = new $._Canvas(200, 200);
	}

	if (!$.canvas) {
		if (typeof document == 'object') {
			q.canvas = document.createElement('canvas');
			$.canvas.id = 'q5Canvas' + Q5._instanceCount;
			$.canvas.classList.add('q5Canvas');
		} else $.noCanvas();
	}

	$.displayDensity = () => window.devicePixelRatio || 1;

	$.width = 200;
	$.height = 200;
	$._pixelDensity = 1;

	let c = $.canvas;

	if (c) {
		c.width = 200;
		c.height = 200;
		c.colorSpace = Q5.canvasOptions.colorSpace;
		if (!$._isImage) {
			c.renderer = $._renderer;
			c[$._renderer] = true;

			$._pixelDensity = Math.ceil($.displayDensity());
		}
	}

	$._adjustDisplay = (forced) => {
		let s = c.style;
		if (s && forced) {
			s.width = c.w + 'px';
			s.height = c.h + 'px';
		}
	};

	$.Canvas = function (w, h, options) {
		if (isNaN(w) || (typeof w == 'string' && !w.includes(':'))) {
			options = w;
			w = null;
		}
		if (typeof h != 'number') {
			options = h;
			h = null;
		}
		options ??= arguments[3];
		if (typeof options == 'string') options = { renderer: options };
		let opt = Object.assign({}, Q5.canvasOptions);
		if (typeof options == 'object') Object.assign(opt, options);

		if (!$._isImage) {
			if ($._isGraphics) $._pixelDensity = this._pixelDensity;
			else if (!Q5._server) {
				// the canvas can become detached from the DOM
				// if the innerHTML of one of its parents is edited
				// check if canvas is still attached to the DOM
				let el = c,
					root = document.body || document.documentElement;
				while (el && el.parentElement != root) {
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
			} else c.visible = true;
		}

		$._setCanvasSize(w, h);

		Object.assign(c, opt);
		let rend = $._createCanvas(c.w, c.h, opt);

		if ($._addEventMethods) $._addEventMethods(c);

		if (!$._isImage) $.resetMatrix();
		$.canvas.ready = true;

		return rend;
	};

	$.createCanvas = $.Canvas;

	$.createGraphics = function (w, h, opt = {}) {
		if (typeof opt == 'string') opt = { renderer: opt };
		let g = new Q5('graphics', undefined, opt.renderer || ($._webgpuFallback ? 'webgpu-fallback' : $._renderer));
		opt.alpha ??= true;
		opt.colorSpace ??= $.canvas.colorSpace;
		opt.pixelDensity ??= $._pixelDensity;
		g._defaultImageScale = $._defaultImageScale;
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

		// changes the actual size of the canvas
		c.width = Math.ceil(w * $._pixelDensity);
		c.height = Math.ceil(h * $._pixelDensity);

		q.width = w;
		q.height = h;
		q.halfWidth = c.hw = w / 2;
		q.halfHeight = c.hh = h / 2;

		let m = Q5._libMap;

		if (m?.width) {
			q[m.width] = w;
			q[m.height] = h;
			q[m.halfWidth] = q.halfWidth;
			q[m.halfHeight] = q.halfHeight;
		}

		if ($.displayMode && !c.displayMode) $.displayMode();
		else $._adjustDisplay(true);
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
		if ($._g) $._g._defaultImageScale = scale;
		return ($._defaultImageScale = scale);
	};
	$.defaultImageScale(0.5);

	if ($._isImage) return;

	if (c && !$._isGraphics) {
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
				let root = document.body || document.documentElement;
				root.appendChild(el);
			}
			c.parent(el);

			if (!document.body) {
				document.addEventListener('DOMContentLoaded', () => {
					if (document.body) document.body.appendChild(el);
				});
			}
		}
		addCanvas();
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
		if ($._g) $._g.pixelDensity(v);
		return v;
	};

	if (window && !$._isGraphics) {
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
Q5.GPU = Q5.WEBGPU = 'webgpu';

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

	if ($.colorMode) $.colorMode('rgb', $._webgpu ? 1 : 255);

	$._createCanvas = function (w, h, options) {
		if (!c) {
			console.error('q5 canvas could not be created. skia-canvas and jsdom packages not found.');
			return;
		}
		q.ctx = q.drawingContext = c.getContext('2d', options);

		if (!$._isImage) {
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

	if ($._isImage) return;

	$.background = function (c) {
		$.ctx.save();
		$.ctx.resetTransform();
		$.ctx.globalAlpha = 1;
		if (c.canvas) $.image(c, 0, 0, $.canvas.width, $.canvas.height);
		else {
			if (Q5.Color && !c._isColor) c = $.color(...arguments);
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
			if (!c._isColor && (typeof c != 'string' || $._namedColors[c])) {
				c = $.color(...arguments);
			}
			if (c.a <= 0) return ($._doFill = false);
		}
		$.ctx.fillStyle = $._fill = c.toString();
	};

	$.stroke = function (c) {
		$._doStroke = $._strokeSet = true;
		if (Q5.Color) {
			if (!c._isColor && (typeof c != 'string' || $._namedColors[c])) {
				c = $.color(...arguments);
			}
			if (c.a <= 0) return ($._doStroke = false);
		}
		$.ctx.strokeStyle = $._stroke = c.toString();
	};

	$.strokeWeight = (n) => {
		if (!n) $._doStroke = false;
		else $._doStroke = true;
		$.ctx.lineWidth = $._strokeWeight = n || 0.0001;
	};

	$.noFill = () => ($._doFill = false);
	$.noStroke = () => ($._doStroke = false);
	$.opacity = (a) => ($.ctx.globalAlpha = a);

	// polyfill for q5 WebGPU functions (used by q5play)
	$._getFillIdx = () => $._fill;
	$._setFillIdx = (v) => ($._fill = v);
	$._getStrokeIdx = () => $._stroke;
	$._setStrokeIdx = (v) => ($._stroke = v);

	$._doShadow = false;
	$._shadowOffsetX = $._shadowOffsetY = $._shadowBlur = 10;

	$.shadow = function (c) {
		if (Q5.Color) {
			if (!c._isColor && (typeof c != 'string' || $._namedColors[c])) {
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
		if (x.x) {
			y = x.y;
			x = x.x;
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

	$._styleNames = [
		'_fill',
		'_stroke',
		'_strokeWeight',
		'_doFill',
		'_doStroke',
		'_fillSet',
		'_strokeSet',
		'_shadow',
		'_doShadow',
		'_shadowOffsetX',
		'_shadowOffsetY',
		'_shadowBlur',
		'_tint',
		'_textSize',
		'_textAlign',
		'_textBaseline',
		'_imageMode',
		'_rectMode',
		'_ellipseMode',
		'_colorMode',
		'_colorFormat',
		'Color'
	];
	$._styles = [];

	$.pushStyles = () => {
		let styles = {};
		for (let s of $._styleNames) styles[s] = $[s];
		$._styles.push(styles);
		if ($._fontMod) $._updateFont();
	};

	function popStyles() {
		let styles = $._styles.pop();
		for (let s of $._styleNames) $[s] = styles[s];
	}

	$.popStyles = () => {
		popStyles();

		$.ctx.fillStyle = $._fill;
		$.ctx.strokeStyle = $._stroke;
		$.ctx.lineWidth = $._strokeWeight;
		$.ctx.shadowColor = $._shadow;
		$.ctx.shadowOffsetX = $._doShadow ? $._shadowOffsetX : 0;
		$.ctx.shadowOffsetY = $._doShadow ? $._shadowOffsetY : 0;
		$.ctx.shadowBlur = $._doShadow ? $._shadowBlur : 0;
	};

	$.pushMatrix = () => $.ctx.save();
	$.popMatrix = () => $.ctx.restore();

	$.push = () => {
		$.pushStyles();
		$.ctx.save();
	};
	$.pop = () => {
		$.ctx.restore();
		popStyles();
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
			$.ctx.beginPath();
			$.ctx.moveTo(x, y);
			$.ctx.lineTo(x, y);
			$.ctx.stroke();
		}
	};

	function rect(x, y, w, h) {
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
		$.ctx.beginPath();
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

	$.capsule = (x1, y1, x2, y2, r) => {
		const dx = x2 - x1,
			dy = y2 - y1,
			len = Math.hypot(dx, dy);

		if (len === 0) return $.circle(x1, y1, r * 2);

		const angle = Math.atan2(dy, dx),
			px = (-dy / len) * r,
			py = (dx / len) * r;

		$.ctx.beginPath();
		$.ctx.moveTo(x1 - px, y1 - py);
		$.ctx.arc(x1, y1, r, angle - $.HALF_PI, angle + $.HALF_PI, true);
		$.ctx.lineTo(x2 + px, y2 + py);
		$.ctx.arc(x2, y2, r, angle + $.HALF_PI, angle - $.HALF_PI, true);
		$.ctx.closePath();

		ink();
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
		curveBuff = [];
		if (firstVertex) {
			$.ctx.moveTo(x, y);
		} else {
			$.ctx.lineTo(x, y);
		}
		firstVertex = false;
	};

	$.bezierVertex = (cp1x, cp1y, cp2x, cp2y, x, y) => {
		curveBuff = [];
		$.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	};

	$.quadraticVertex = (cp1x, cp1y, x, y) => {
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
	const c = $.canvas;

	if (c) {
		// polyfill for HTMLCanvasElement
		c.convertToBlob ??= (opt) =>
			new Promise((resolve) => {
				c.toBlob((blob) => resolve(blob), opt.type, opt.quality);
			});
	}

	$._tint = null;
	let imgData = null,
		pixels = null;

	$.createImage = (w, h, opt = {}) => {
		opt.colorSpace ??= $.canvas.colorSpace;
		opt.defaultImageScale ??= $._defaultImageScale;
		return new Q5.Image(w, h, opt);
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
		} else opt = undefined;

		let g = $.createImage(1, 1, opt);
		let pd = g._pixelDensity;

		let img = new window.Image();
		img.crossOrigin = 'Anonymous';

		g.promise = new Promise((resolve, reject) => {
			img.onload = () => {
				delete g.then;
				if (g._usedAwait) g = $.createImage(1, 1, opt);

				img._pixelDensity = pd;
				g.defaultWidth = img.width * $._defaultImageScale;
				g.defaultHeight = img.height * $._defaultImageScale;
				g.naturalWidth = img.naturalWidth || img.width;
				g.naturalHeight = img.naturalHeight || img.height;
				g._setImageSize(Math.ceil(g.naturalWidth / pd), Math.ceil(g.naturalHeight / pd));

				g.ctx.drawImage(img, 0, 0);
				if (cb) cb(g);
				resolve(g);
			};
			img.onerror = reject;
		});
		$._loaders.push(g.promise);

		// then only runs when the user awaits the instance
		g.then = (resolve, reject) => {
			g._usedAwait = true;
			return g.promise.then(resolve, reject);
		};

		g.src = img.src = url;
		return g;
	};

	$._imageMode = Q5.CORNER;

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

				if (img?.canvas?.alpha) {
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
		$.ctx.drawImage(c, 0, 0, c.w, c.h);
		$.ctx.restore();
		$.modified = $._retint = true;
	};

	if ($._isImage) {
		$.resize = (w, h) => {
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

			$._retint = true;

			if ($._owner?._makeDrawable) {
				if ($._owner._texturesToDestroy && $._texture) {
					$._owner._texturesToDestroy.push($._texture);
				} else {
					$._texture.destroy();
				}
				delete $._texture;
				$._owner._makeDrawable($);
			}
		};
	}

	$._getImageData = (x, y, w, h) => {
		return $.ctx.getImageData(x, y, w, h, { colorSpace: c.colorSpace });
	};

	$.trim = () => {
		let pd = $._pixelDensity || 1;
		let w = c.width;
		let h = c.height;
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
		$.ctx.drawImage(c, x * pd, y * pd, w * pd, h * pd, dx, dy, dw, dh);

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
			if (!pixels) $.loadPixels();
			let px = Math.floor(x * pd),
				py = Math.floor(y * pd),
				idx = 4 * (py * c.width + px);
			return [pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]];
		}
		x = Math.floor(x || 0) * pd;
		y = Math.floor(y || 0) * pd;
		w ??= $.width;
		h ??= $.height;
		let img = $.createImage(w, h, { pixelDensity: pd });
		img.ctx.drawImage(c, x, y, w * pd, h * pd, 0, 0, w, h);
		img.width = w;
		img.height = h;
		if ($._owner?._makeDrawable) $._owner._makeDrawable(img);
		return img;
	};

	$.set = (x, y, val) => {
		x = Math.floor(x);
		y = Math.floor(y);
		$.modified = $._retint = true;
		if (val.canvas) {
			let old = $._tint;
			$._tint = null;
			$.image(val, x, y);
			$._tint = old;
			return;
		}

		if (!pixels) $.loadPixels();

		let mod = $._pixelDensity || 1,
			r = val.r,
			g = val.g,
			b = val.b,
			a = val.a;

		if (($._colorFormat || $._owner?._colorFormat) == 1) {
			r *= 255;
			g *= 255;
			b *= 255;
			a *= 255;
		}

		for (let i = 0; i < mod; i++) {
			for (let j = 0; j < mod; j++) {
				let idx = 4 * ((y * mod + i) * c.width + x * mod + j);
				pixels[idx] = r;
				pixels[idx + 1] = g;
				pixels[idx + 2] = b;
				pixels[idx + 3] = a;
			}
		}
	};

	$.loadPixels = () => {
		imgData = $._getImageData(0, 0, c.width, c.height);
		q.pixels = pixels = imgData.data;
	};
	$.updatePixels = () => {
		if (imgData != null) {
			$.ctx.putImageData(imgData, 0, 0);
			$.modified = $._retint = true;
		}
	};

	$.smooth = () => ($.ctx.imageSmoothingEnabled = true);
	$.noSmooth = () => ($.ctx.imageSmoothingEnabled = false);

	if ($._isImage) return;

	$.tint = function (c) {
		$._tint = (c._isColor ? c : $.color(...arguments)).toString();
	};
	$.noTint = () => ($._tint = null);
};

Q5.Image = class {
	constructor(w, h, opt = {}) {
		opt.alpha ??= true;
		opt.colorSpace ??= Q5.canvasOptions.colorSpace;
		let $ = this;
		$._isImage = true;
		$.canvas = $.ctx = $.drawingContext = null;
		$.pixels = [];
		Q5.modules.canvas($, $);
		let r = Q5.renderers.c2d;
		for (let m of ['canvas', 'image', 'softFilters']) {
			if (r[m]) r[m]($, $);
		}
		$._pixelDensity = opt.pixelDensity || 1;
		$._defaultImageScale = opt.defaultImageScale || 2;
		$.createCanvas(w, h, opt);
		let scale = $._pixelDensity * $._defaultImageScale;
		$.defaultWidth = w * scale;
		$.defaultHeight = h * scale;
		delete $.createCanvas;
		$._loop = false;

		let m = Q5._libMap;
		if (m) {
			let imgFns = [
				'copy',
				'filter',
				'get',
				'set',
				'resize',
				'mask',
				'trim',
				'inset',
				'pixels',
				'loadPixels',
				'updatePixels',
				'smooth',
				'noSmooth'
			];
			for (let name of imgFns) {
				if (m[name]) $[m[name]] = $[name];
			}
		}
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
		styleHash = 0,
		genTextImage = false,
		cacheSize = 0;
	$._fontMod = false;

	let cache = ($._textCache = {});

	$.loadFont = (url, cb) => {
		let f;

		if (url.includes('fonts.googleapis.com/css')) {
			f = loadGoogleFont(url, cb);
		} else {
			let name = url.split('/').pop().split('.')[0].replace(' ', '');

			f = { family: name };
			let ff = new FontFace(name, `url(${encodeURI(url)})`);
			document.fonts.add(ff);

			f.promise = new Promise((resolve, reject) => {
				ff.load()
					.then(() => {
						delete f.then;
						if (cb) cb(ff);
						resolve(ff);
					})
					.catch((err) => {
						reject(err);
					});
			});
		}
		$._loaders.push(f.promise);
		$.textFont(f.family);
		f.then = (resolve, reject) => {
			f._usedAwait = true;
			return f.promise.then(resolve, reject);
		};
		return f;
	};

	function loadGoogleFont(url, cb) {
		if (!url.startsWith('http')) url = 'https://' + url;
		const urlParams = new URL(url).searchParams;
		const familyParam = urlParams.get('family');
		if (!familyParam) {
			console.error('Invalid Google Fonts URL: missing family parameter');
			return null;
		}

		const fontFamily = familyParam.split(':')[0];
		let f = { family: fontFamily };

		f.promise = (async () => {
			try {
				const res = await fetch(url);
				if (!res.ok) {
					throw new Error(`Failed to fetch Google Font: ${res.status} ${res.statusText}`);
				}

				let css = await res.text();

				let fontFaceRegex = /@font-face\s*{([^}]*)}/g;
				let srcRegex = /src:\s*url\(([^)]+)\)[^;]*;/;
				let fontFamilyRegex = /font-family:\s*['"]([^'"]+)['"]/;
				let fontWeightRegex = /font-weight:\s*([^;]+);/;
				let fontStyleRegex = /font-style:\s*([^;]+);/;

				let fontFaceMatch;
				let loadedFaces = [];

				while ((fontFaceMatch = fontFaceRegex.exec(css)) !== null) {
					let fontFaceCSS = fontFaceMatch[1];

					let srcMatch = srcRegex.exec(fontFaceCSS);
					if (!srcMatch) continue;
					let fontUrl = srcMatch[1];

					let familyMatch = fontFamilyRegex.exec(fontFaceCSS);
					if (!familyMatch) continue;
					let family = familyMatch[1];

					let weightMatch = fontWeightRegex.exec(fontFaceCSS);
					let weight = weightMatch ? weightMatch[1] : '400';

					let styleMatch = fontStyleRegex.exec(fontFaceCSS);
					let style = styleMatch ? styleMatch[1] : 'normal';

					let faceName = `${family}-${weight}-${style}`.replace(/\s+/g, '-');

					let fontFace = new FontFace(family, `url(${fontUrl})`, {
						weight,
						style
					});

					document.fonts.add(fontFace);

					try {
						await fontFace.load();
						loadedFaces.push(fontFace);
					} catch (e) {
						console.error(`Failed to load font face: ${faceName}`, e);
					}
				}

				if (f._usedAwait) {
					f = { family: fontFamily };
				}

				f.faces = loadedFaces;
				delete f.then;
				if (cb) cb(f);
				return f;
			} catch (e) {
				console.error('Error loading Google Font:', e);
				throw e;
			}
		})();

		return f;
	}

	$.textFont = (x) => {
		if (x && typeof x != 'string') x = x.family;
		if (!x || x == font) return font;
		font = x;
		$._fontMod = true;
		styleHash = -1;
	};

	$.textSize = (x) => {
		if (x == undefined) return $._textSize;
		$._textSize = x;
		$._fontMod = true;
		styleHash = -1;
		if (!leadingSet) {
			leading = x * 1.25;
			leadDiff = leading - x;
		}
	};

	$.textStyle = (x) => {
		if (!x) return emphasis;
		$._textStyle = emphasis = x;
		$._fontMod = true;
		styleHash = -1;
	};

	$.textWeight = (x) => {
		if (!x) return weight;
		weight = x;
		$._fontMod = true;
		styleHash = -1;
	};

	$.textLeading = (x) => {
		if (x == undefined) return leading || $._textSize * 1.25;
		leadingSet = true;
		if (x == leading) return leading;
		leading = x;
		leadDiff = x - $._textSize;
		styleHash = -1;
	};

	$.textAlign = (horiz, vert) => {
		if (!horiz) return { horizontal: $._textAlign, vertical: $._textBaseline };
		$.ctx.textAlign = $._textAlign = horiz;
		if (vert) {
			$.ctx.textBaseline = $._textBaseline = vert == $.CENTER ? 'middle' : vert;
		}
	};

	$._updateFont = () => {
		$.ctx.font = `${emphasis} ${weight} ${$._textSize}px ${font}`;
		$._fontMod = false;
	};

	$.textWidth = (str) => {
		if ($._fontMod) $._updateFont();
		return $.ctx.measureText(str).width;
	};
	$.textAscent = (str) => {
		if ($._fontMod) $._updateFont();
		return $.ctx.measureText(str).actualBoundingBoxAscent;
	};
	$.textDescent = (str) => {
		if ($._fontMod) $._updateFont();
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
		let ctx = $.ctx;
		let img, colorStyle, styleCache, colorCache, recycling;

		if ($._fontMod) $._updateFont();

		if (genTextImage) {
			if (styleHash == -1) updateStyleHash();
			colorStyle = $._fill + $._stroke + $._strokeWeight;

			styleCache = cache[str];
			if (styleCache) colorCache = styleCache[styleHash];
			else styleCache = cache[str] = {};

			if (colorCache) {
				img = colorCache[colorStyle];
				if (img) return img;

				if (colorCache.size >= 4) {
					for (let recycleKey in colorCache) {
						img = colorCache[recycleKey];
						delete colorCache[recycleKey];
						break;
					}
					recycling = true;
				}
			} else colorCache = styleCache[styleHash] = {};
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

		let tX, tY;

		if (!genTextImage) {
			tX = x;
			tY = y;
			if ($._textBaseline == 'middle') tY -= leading * (lines.length - 1) * 0.5;
			else if ($._textBaseline == 'bottom') tY -= leading * (lines.length - 1);
		} else {
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
					pixelDensity: $._pixelDensity,
					defaultImageScale: 1 / $._pixelDensity
				});

				img._ascent = ascent;
				img._descent = descent;
				img._top = descent + leadDiff;
				img._middle = img._top + ascent * 0.5 + leading * (lines.length - 1) * 0.5;
				img._bottom = img._top + ascent + leading * (lines.length - 1);
				img._leading = leading;
			} else {
				let cnv = img.canvas;
				img.ctx.clearRect(0, 0, cnv.width, cnv.height);
				img.modified = true;
			}

			ctx = img.ctx;

			ctx.textAlign = $._textAlign;
			if ($._textAlign == 'center') tX = img.width / 2;
			else if ($._textAlign == 'right') tX = img.width;
			else tX = 0;

			ctx.font = $.ctx.font;
			if ($._doFill && $._fillSet) ctx.fillStyle = $._fill;
			if ($._doStroke && $._strokeSet) ctx.strokeStyle = $._stroke;
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
			colorCache[colorStyle] = img;

			if (!recycling) {
				if (!colorCache.size) {
					Object.defineProperty(colorCache, 'size', {
						writable: true,
						enumerable: false
					});
					colorCache.size = 0;
				}
				colorCache.size++;
				cacheSize++;
			}

			if (cacheSize > Q5.MAX_TEXT_IMAGES) {
				for (const str in cache) {
					styleCache = cache[str];
					for (const hash in styleCache) {
						colorCache = styleCache[hash];
						for (let c in colorCache) {
							let _img = colorCache[c];
							if (_img._texture) {
								let owner = _img._owner || $;
								if (owner._texturesToDestroy) owner._texturesToDestroy.push(_img._texture);
								else _img._texture.destroy();
							}
							delete colorCache[c];
						}
					}
				}
				cacheSize = 0;
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

	$.textToPoints = (str, x = 0, y = 0, sampleRate = 0.1, density = 1) => {
		let pd = $._pixelDensity;
		$._pixelDensity = density;
		let img = $.createTextImage(str);
		$._pixelDensity = pd;

		img.loadPixels();

		let w = img.canvas.width,
			h = img.canvas.height;

		let points = [];

		let ta = $._textAlign,
			bl = $._textBaseline,
			offsetX = 0,
			offsetY = 0;

		if (ta == 'center') offsetX = -w / 2;
		else if (ta == 'right') offsetX = -w;

		if (bl == 'alphabetic') offsetY = -img._leading;
		else if (bl == 'middle') offsetY = -img._middle;
		else if (bl == 'bottom') offsetY = -img._bottom;
		else if (bl == 'top') offsetY = -img._top;

		offsetY *= density;

		let allPoints = [];

		// Z-order curve (Morton code)
		const part1by1 = (n) => {
			n &= 0x0000ffff;
			n = (n | (n << 8)) & 0x00ff00ff;
			n = (n | (n << 4)) & 0x0f0f0f0f;
			n = (n | (n << 2)) & 0x33333333;
			n = (n | (n << 1)) & 0x55555555;
			return n;
		};

		let r = Math.max(0.5, sampleRate);

		for (let py = 0; py < h; py++) {
			for (let px = 0; px < w; px++) {
				let index = (py * w + px) * 4;

				if ((r == 1 || $.random() < r) && img.pixels[index + 3] > 128) {
					allPoints.push({
						x: px,
						y: py,
						z: part1by1(px) | (part1by1(py) << 1)
					});
				}
			}
		}

		let total = allPoints.length;
		let numPoints = total * sampleRate * (1 / r);

		if (sampleRate < 1) allPoints.sort((a, b) => a.z - b.z);

		let step = total / numPoints;
		for (let i = 0; i < total; i += step) {
			let p = allPoints[Math.floor(i)];
			points.push({
				x: (p.x + offsetX) / density + x,
				y: (p.y + offsetY) / density + y
			});
		}

		return points;
	};
};

Q5.fonts = [];
Q5.MAX_TEXT_IMAGES = 5000;
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
		$._srgb = srgb;
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
		coral: [255, 127, 80],
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
		silver: [192, 192, 192],
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
		if (c0._isColor) return new C(...c0.levels);
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
					if ($._colorMode != 'rgb') {
						C = $._srgb ? Q5.ColorRGB_8 : Q5.ColorRGB_P3_8;
						return new C(c0, c1, c2, c3);
					}
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
		this._isColor = true;
		this._q5Color = true; // deprecated
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
	if (!$.canvas || $._isGraphics) return;

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

	$._adjustDisplay = (forced) => {
		let s = c.style;
		// if the canvas doesn't have a style,
		// it may be a server side canvas, so return
		if (!s) return;
		if (c.displayMode == 'normal') {
			// unless the canvas needs to be resized, return
			if (!forced) return;
			s.width = c.w * c.displayScale + 'px';
			s.height = c.h * c.displayScale + 'px';
		} else {
			let parent = c.parentElement.getBoundingClientRect();
			if (c.w / c.h > parent.width / parent.height) {
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
		if (Q5._server) return;

		if (typeof displayScale == 'string') {
			displayScale = parseFloat(displayScale.slice(1));
		}
		if (displayMode == 'fullscreen') displayMode = 'maxed';
		if (displayMode == 'center') displayMode = 'centered';

		if (c.displayMode) {
			c.parentElement.classList.remove('q5-' + c.displayMode);
			c.classList.remove('q5-pixelated');
		}

		c.parentElement.classList.add('q5-' + displayMode);

		if (renderQuality == 'pixelated') {
			c.classList.add('q5-pixelated');
			$.pixelDensity(1);
			$.defaultImageScale(1);
			if ($.noSmooth) $.noSmooth();
			if ($.textFont) $.textFont('monospace');
		}

		Object.assign(c, { displayMode, renderQuality, displayScale });

		if ($.ctx) $.pushStyles();
		$._adjustDisplay(true);
		if ($.ctx) $.popStyles();
	};

	$.fullscreen = (v) => {
		if (v == undefined) return document.fullscreenElement;
		if (v) document.body.requestFullscreen();
		else document.exitFullscreen();
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
		el.step = step;
		el.value = value;
		el.val = () => parseFloat(el.value);
		return el;
	};

	$.createSpan = (content) => $.createEl('span', content);

	function initVideo(el) {
		el.width ||= el.videoWidth;
		el.height ||= el.videoHeight;
		el.defaultWidth = el.width * $._defaultImageScale;
		el.defaultHeight = el.height * $._defaultImageScale;
		el.ready = true;
	}

	$.createVideo = (src) => {
		let el = $.createEl('video');
		el.crossOrigin = 'anonymous';

		if (src) {
			el.promise = new Promise((resolve) => {
				el.addEventListener('loadeddata', () => {
					delete el.then;
					if (el._usedAwait) {
						el = $.createEl('video');
						el.crossOrigin = 'anonymous';
						el.src = src;
					}
					initVideo(el);
					resolve(el);
				});
				el.src = src;
			});
			$._loaders.push(el.promise);
			el.then = (resolve, reject) => {
				el._usedAwait = true;
				return el.promise.then(resolve, reject);
			};
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

		function extendVideo(vid) {
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
		}

		vid.promise = (async () => {
			let stream;
			try {
				stream = await navigator.mediaDevices.getUserMedia(constraints);
			} catch (e) {
				throw e;
			}

			delete vid.then;
			if (vid._usedAwait) {
				vid = $.createVideo();
			}
			extendVideo(vid);

			vid.srcObject = stream;
			await new Promise((resolve) => vid.addEventListener('loadeddata', resolve));

			initVideo(vid);
			if (cb) cb(vid);
			return vid;
		})();
		$._loaders.push(vid.promise);

		vid.then = (resolve, reject) => {
			vid._usedAwait = true;
			return vid.promise.then(resolve, reject);
		};
		return vid;
	};

	$.findEl = (selector) => document.querySelector(selector);
	$.findEls = (selector) => document.querySelectorAll(selector);
};
Q5.modules.fes = ($) => {
	$._fes = async (e) => {
		if (Q5.disableFriendlyErrors) return;

		e._handledByFES = true;

		let stackLines = e.stack?.split('\n');
		if (!stackLines?.length) return;

		let idx = 1;
		let sep = '(';
		if (navigator.userAgent.indexOf('Chrome') == -1) {
			idx = 0;
			sep = '@';
		}
		while (idx > stackLines.length && stackLines[idx].indexOf('q5') >= 0) idx++;

		let errFile = stackLines[idx].split(sep).at(-1);
		if (errFile.startsWith('blob:')) errFile = errFile.slice(5);
		errFile = errFile.split(')')[0];
		let parts = errFile.split(':');
		let lineNum = parseInt(parts.at(-2));
		parts[parts.length - 1] = parts.at(-1).split(')')[0];
		let fileUrl = e.file || parts.slice(0, -2).join(':');
		let fileBase = fileUrl.split('/').at(-1);

		try {
			let res = await (await fetch(fileUrl)).text(),
				lines = res.split('\n'),
				errLine = lines[lineNum - 1]?.trim() ?? '',
				bug = ['🐛', '🐞', '🐜', '🦗', '🦋', '🪲'][Math.floor(Math.random() * 6)],
				inIframe = window.self !== window.top,
				prefix = `q5.js ${bug}`,
				errorMsg = ` Error in ${fileBase} on line ${lineNum}:\n\n${errLine}`;

			if (inIframe) $.log(prefix + errorMsg);
			else {
				$.log(`%c${prefix}%c${errorMsg}`, 'background: #b7ebff; color: #000;', '');
			}
		} catch (err) {}
	};

	if (typeof window !== 'undefined' && window.addEventListener) {
		// get user sketch file path (full path)
		let err = new Error(),
			lines = err.stack?.split('\n') || '';
		for (let line of lines) {
			// This regex captures the full path or URL to the .js file
			let match = line.match(/(https?:\/\/[^\s)]+\.js|\b\/[^\s)]+\.js)/);
			if (match) {
				let file = match[1];
				if (!/q5|p5play/i.test(file)) {
					$._sketchFile = file;
					break;
				}
			}
		}

		if ($._sketchFile) {
			window.addEventListener('error', (evt) => {
				let e = evt.error;
				if (evt.filename === $._sketchFile && !e?._handledByFES) {
					e.file = evt.filename;
					$._fes(e);
				}
			});
			window.addEventListener('unhandledrejection', (evt) => {
				let e = evt.reason;
				if (e?.stack?.includes($._sketchFile) && !e?._handledByFES) $._fes(e);
			});
		}
	}

	if ($._isGlobal && Q5.online != false && typeof navigator != undefined && navigator.onLine) {
		async function checkLatestVersion() {
			try {
				let res = await fetch('https://data.jsdelivr.com/v1/package/npm/q5');
				if (!res.ok) return;
				let data = await res.json();
				let l = data.tags.latest;
				l = l.slice(0, l.lastIndexOf('.'));
				if (l != Q5.version) {
					console.warn(`q5.js v${l} is now available! Consider updating from v${Q5.version}.`);
				}
			} catch (e) {}
		}

		checkLatestVersion();
	}
};
Q5.modules.input = ($, q) => {
	if ($._isGraphics) return;

	$.mouseX = $.mouseY = $.pmouseX = $.pmouseY = $.movedX = $.movedY = 0;
	$.touches = [];
	$.pointers = [];
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

	$._updatePointer = (e) => {
		let id = e.pointerId || $.pointers[0]?.id;
		if (id == undefined) {
			if (e instanceof MouseEvent) id = 0;
			else return;
		}

		let p = $.pointers.find((p) => p.id === id);
		if (!p) {
			p = { id };
			$.pointers.push(p);
		}
		p.event = e;

		let x, y;
		if (c) {
			let rect = c.getBoundingClientRect();
			let sx = c.scrollWidth / $.width || 1;
			let sy = c.scrollHeight / $.height || 1;

			x = (e.clientX - rect.left) / sx;
			y = (e.clientY - rect.top) / sy;
			if ($._webgpu) {
				x -= c.hw;
				y -= c.hh;
				if (!$._flippedY) y *= -1;
			}
		} else {
			x = e.clientX;
			y = e.clientY;
		}

		p.x = x;
		p.y = y;

		return p;
	};

	$._updateMouse = (e) => {
		let p = $.pointers[0];
		if (e.pointerId != undefined && e.pointerId != p.id) return;

		if (document.pointerLockElement) {
			if (e.movementX != undefined) {
				q.mouseX += e.movementX;
				q.mouseY += e.movementY;
			}
		} else {
			q.mouseX = p.x;
			q.mouseY = p.y;
		}

		if (e.movementX != undefined) {
			q.movedX = e.movementX;
			q.movedY = e.movementY;
		}
	};

	let pressAmt = 0;

	$._onpointerdown = (e) => {
		pressAmt++;
		$._startAudio();
		$._updatePointer(e);
		$._updateMouse(e);
		q.mouseIsPressed = true;
		q.mouseButton = mouseBtns[e.button];
		$.mousePressed(e);
	};

	$._onpointermove = (e) => {
		if (c && !c.visible) return;
		$._updatePointer(e);
		$._updateMouse(e);
		if ($.mouseIsPressed) $.mouseDragged(e);
		else $.mouseMoved(e);
	};

	$._onpointerup = (e) => {
		q.mouseIsPressed = false;
		if (pressAmt > 0) pressAmt--;
		else return;
		$._updatePointer(e);
		$._updateMouse(e);
		if (e.pointerType === 'touch' || e.pointerType === 'pen') {
			let p = $.pointers.find((p) => p.id === e.pointerId);
			if (p) p._ended = true;
		}
		$.mouseReleased(e);
	};

	$._onclick = (e) => {
		q.mouseIsPressed = true;
		$.mouseClicked(e);
		q.mouseIsPressed = false;
	};

	$._ondblclick = (e) => {
		q.mouseIsPressed = true;
		$.doubleClicked(e);
		q.mouseIsPressed = false;
	};

	$._onwheel = (e) => {
		$._updatePointer(e);
		$._updateMouse(e);
		e.delta = e.deltaY;
		let ret = $.mouseWheel(e);
		if (($._isGlobal && !ret) || ret == false) {
			e.preventDefault();
		}
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

	$.pointerLock = (unadjustedMovement = false) => {
		document.body?.requestPointerLock({ unadjustedMovement });
	};

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
		const rect = $.canvas.getBoundingClientRect(),
			sx = $.canvas.scrollWidth / $.width || 1,
			sy = $.canvas.scrollHeight / $.height || 1;
		let modX = 0,
			modY = 0;
		if ($._webgpu) {
			modX = $.halfWidth;
			modY = $.halfHeight;
		}

		let x = (touch.clientX - rect.left) / sx - modX,
			y = (touch.clientY - rect.top) / sy - modY;

		if (!$._flippedY) y *= -1;

		return {
			x,
			y,
			id: touch.identifier
		};
	}

	$._updateTouches = (e) => {
		if (c && !c.visible) return;

		let touches = [...e.changedTouches].map(getTouchInfo);

		for (let touch of touches) {
			let existingTouch = $.touches.find((t) => t.id == touch.id);
			if (existingTouch) {
				existingTouch.x = touch.x;
				existingTouch.y = touch.y;
			} else {
				$.touches.push(touch);
			}
		}

		for (let i = $.touches.length - 1; i >= 0; i--) {
			let touch = $.touches[i];
			let found = false;
			for (let j = 0; j < e.touches.length; j++) {
				if (e.touches[j].identifier === touch.id) {
					found = true;
					break;
				}
			}
			if (!found) {
				$.touches.splice(i, 1);
			}
		}
	};

	$._ontouchstart = (e) => {
		$._startAudio();
		if (!$.touchStarted(e)) e.preventDefault();
	};

	$._ontouchmove = (e) => {
		if (!$.touchMoved(e)) e.preventDefault();
	};

	$._ontouchend = (e) => {
		if (!$.touchEnded(e)) e.preventDefault();
	};

	if (window) {
		let l = window.addEventListener;
		l('keydown', (e) => $._onkeydown(e), false);
		l('keyup', (e) => $._onkeyup(e), false);

		let pointer = window.PointerEvent ? 'pointer' : 'mouse';
		l(pointer + 'move', (e) => $._onpointermove(e), false);
		l(pointer + 'up', (e) => $._onpointerup(e));
		l(pointer + 'cancel', (e) => $._onpointerup(e));
		l('touchstart', (e) => $._updateTouches(e));
		l('touchmove', (e) => $._updateTouches(e));
		l('touchend', (e) => $._updateTouches(e));
		l('touchcancel', (e) => $._updateTouches(e));

		if (c) c.addEventListener('wheel', (e) => $._onwheel(e));

		if (!$._isGlobal && c) {
			// If not global, only trigger pointer events when pointer is locked or over canvas
			l(pointer + 'down', (e) => !document.pointerLockElement || $._onpointerdown(e));
			l('click', (e) => !document.pointerLockElement || $._onclick(e));
			l('dblclick', (e) => !document.pointerLockElement || $._ondblclick(e));

			l = c.addEventListener.bind(c);
		}

		l(pointer + 'down', (e) => $._onpointerdown(e));
		l('click', (e) => $._onclick(e));
		l('dblclick', (e) => $._ondblclick(e));

		if (c) l = c.addEventListener.bind(c);

		l('touchstart', (e) => $._ontouchstart(e));
		l('touchmove', (e) => $._ontouchmove(e));
		l('touchend', (e) => $._ontouchend(e));
		l('touchcancel', (e) => $._ontouchend(e));
	}
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
				if (jsr === 0) jsr = 1;
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
			if (s._usedAwait) {
				sounds.splice(sounds.indexOf(s), 1);
				s = new Q5.Sound();
				sounds.push(s);
			}
			let err;
			try {
				await s.load(url);
			} catch (e) {
				err = e;
			}
			delete s.then;
			if (err) throw err;
			if (cb) cb(s);
			return s;
		})();
		$._loaders.push(s.promise);

		s.then = (resolve, reject) => {
			s._usedAwait = true;
			return s.promise.then(resolve, reject);
		};
		return s;
	};

	$.loadAudio = (url, cb) => {
		let a = new Audio(url);
		a._isAudio = true;
		a.crossOrigin = 'Anonymous';
		a.promise = new Promise((resolve, reject) => {
			function loaded() {
				if (!a.loaded) {
					delete a.then;
					if (a._usedAwait) {
						a = new Audio(url);
						a._isAudio = true;
						a.crossOrigin = 'Anonymous';
					}
					a.loaded = true;
					if (cb) cb(a);
					resolve(a);
				}
			}
			a.addEventListener('canplay', loaded);
			a.addEventListener('suspend', loaded);
			a.addEventListener('error', reject);
		});
		$._loaders.push(a.promise);

		a.then = (resolve, reject) => {
			a._usedAwait = true;
			return a.promise.then(resolve, reject);
		};
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

				for (let inst of Q5.instances) {
					inst._userAudioStarted();
				}
			}
			return Q5.aud.resume();
		}
	};

	$._userAudioStarted = () => {
		for (let s of sounds) s.init();
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
		this._isSound = true;
		this.sources = new Set();
		this.loaded = this.paused = false;
	}

	async load(url) {
		this.url = url;
		let res = await fetch(url);
		this.buffer = await res.arrayBuffer();
		this.buffer = await Q5.aud.decodeAudioData(this.buffer);
		if (Q5.aud) this.init();
	}

	init() {
		if (!this.buffer.length) return;

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

		source.promise = new Promise((resolve) => {
			source.onended = () => {
				if (!this.paused) {
					this.ended = true;
					if (this._onended) this._onended();
					this.sources.delete(source);
					resolve();
				}
			};
		});

		return source;
	}

	play(time = 0, duration) {
		if (!this.loaded) return;

		let source;

		if (!this.paused) {
			source = this._newSource(time, duration);
		} else {
			let timings = [];
			for (let source of this.sources) {
				timings.push({ offset: source._offset, duration: source._duration });
				this.sources.delete(source);
			}
			timings.sort((a, b) => {
				let durA = a.duration ?? this.buffer.duration - a.offset;
				let durB = b.duration ?? this.buffer.duration - b.offset;
				return durA - durB;
			});
			for (let t of timings) {
				source = this._newSource(t.offset, t.duration);
			}
		}

		this.paused = this.ended = false;

		return source.promise;
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
		ret.promise = fetch(url)
			.then((res) => {
				if (!res.ok) {
					reject('error loading file');
					return null;
				}
				return type == 'json' ? res.json() : res.text();
			})
			.then((f) => {
				if (type == 'csv') f = Q5.CSV.parse(f);

				if (typeof f == 'string') ret.text = f;
				else Object.assign(ret, f);

				delete ret.then;
				if (cb) cb(f);
				return f;
			});
		$._loaders.push(ret.promise);

		ret.then = (resolve, reject) => {
			return ret.promise.then(resolve, reject);
		};
		return ret;
	};

	$.loadText = (url, cb) => $._loadFile(url, cb, 'text');
	$.loadJSON = (url, cb) => $._loadFile(url, cb, 'json');
	$.loadCSV = (url, cb) => $._loadFile(url, cb, 'csv');

	$.loadXML = (url, cb) => {
		let ret = {};
		ret.promise = fetch(url)
			.then((res) => res.text())
			.then((text) => {
				let xml = new DOMParser().parseFromString(text, 'application/xml');
				ret.DOM = xml;
				delete ret.then;
				if (cb) cb(xml);
				return xml;
			});
		$._loaders.push(ret.promise);

		ret.then = (resolve, reject) => {
			return ret.promise.then(resolve, reject);
		};
		return ret;
	};

	const imgRegex = /(jpe?g|png|gif|webp|avif|svg)/i,
		fontRegex = /(ttf|otf|woff2?|eot|json)/i,
		fontCategoryRegex = /(serif|sans-serif|monospace|cursive|fantasy)/i,
		audioRegex = /(wav|flac|mp3|ogg|m4a|aac|aiff|weba)/i;

	$.load = function (...urls) {
		if (Array.isArray(urls[0])) urls = urls[0];

		let thenables = [];

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
			} else if (ext == 'xml') {
				obj = $.loadXML(url);
			} else {
				obj = $.loadText(url);
			}
			thenables.push(obj);
		}

		if (urls.length == 1) return thenables[0];
		return Promise.all(thenables);
	};

	async function saveFile(data, name, ext) {
		name = name || 'untitled';
		ext = ext || 'png';

		let blob;
		if (imgRegex.test(ext)) {
			let cnv = data.canvas || data;
			blob = await cnv.convertToBlob({ type: 'image/' + ext });
		} else {
			let type = 'text/plain';
			if (ext == 'json') {
				if (typeof data != 'string') data = JSON.stringify(data);
				type = 'text/json';
			}
			blob = new Blob([data], { type });
		}

		let a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
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
		if (c) saveFile(a, b, c);
		else if (b) {
			let lastDot = b.lastIndexOf('.');
			saveFile(a, b.slice(0, lastDot), b.slice(lastDot + 1));
		} else saveFile(a);
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

Q5.CSV = {};
Q5.CSV.parse = (csv, sep = ',', lineSep = '\n') => {
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
Q5.modules.vector = ($) => {
	$.Vector = Q5.Vector;
	$.createVector = (x, y, z) => new $.Vector(x, y, z, $);
};

Q5.Vector = class {
	constructor(x, y, z, $) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this._isVector = true;
		this._$ = $ || window;

		// managed by the user to avoid redundant calculations
		this._useCache = false;
		this._mag = 0;
		this._magCached = false;
		this._direction = 0;
		this._directionCached = false;
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

	_calcMag() {
		const x = this.x,
			y = this.y,
			z = this.z;
		this._mag = Math.sqrt(x * x + y * y + z * z);
		this._magCached = this._useCache;
	}

	mag() {
		if (!this._magCached) this._calcMag();
		return this._mag;
	}

	magSq() {
		if (this._magCached) return this._mag * this._mag;
		const x = this.x,
			y = this.y,
			z = this.z;
		return x * x + y * y + z * z;
	}
	setMag(m) {
		if (!this._magCached) this._calcMag();
		let n = this._mag;
		if (n == 0) {
			const dir = this.direction();
			this.x = m * this._$.cos(dir);
			this.y = m * this._$.sin(dir);
		} else {
			let t = m / n;
			this.x *= t;
			this.y *= t;
			this.z *= t;
		}
		this._mag = m;
		this._magCached = this._useCache;
		return this;
	}

	direction() {
		if (!this._directionCached) {
			const x = this.x,
				y = this.y;
			if (x || y) this._direction = this._$.atan2(this.y, this.x);
			this._directionCached = this._useCache;
		}
		return this._direction;
	}

	setDirection(ang) {
		let mag = this.mag();
		if (mag) {
			this.x = mag * this._$.cos(ang);
			this.y = mag * this._$.sin(ang);
		}
		this._direction = ang;
		this._directionCached = this._useCache;
		return this;
	}

	heading() {
		return this.direction();
	}

	setHeading(ang) {
		return this.setDirection(ang);
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
		if (!this._magCached) this._calcMag();
		let n = this._mag;
		if (n != 0) {
			this.x /= n;
			this.y /= n;
			this.z /= n;
		}
		this._mag = 1;
		this._magCached = this._useCache;
		return this;
	}

	limit(m) {
		if (!this._magCached) this._calcMag();
		let n = this._mag;
		if (n > m) {
			let t = m / n;
			this.x *= t;
			this.y *= t;
			this.z *= t;
			this._mag = m;
			this._magCached = this._useCache;
		}
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
		this._mag = l;
		this._magCached = this._useCache;
		this.x = l * this._$.cos(th);
		this.y = l * this._$.sin(th);
		this.z = 0;
		return this;
	}

	fromAngles(th, ph, l) {
		if (l === undefined) l = 1;
		this._mag = l;
		this._magCached = this._useCache;
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
		this._mag = 1;
		this._magCached = this._useCache;
		return this.fromAngle(Math.random() * Math.PI * 2);
	}

	random3D() {
		this._mag = 1;
		this._magCached = this._useCache;
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
Q5.Vector.direction = (v) => this._$.atan2(v.y, v.x);
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
	const c = $.canvas;

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
	keyIsPressed: f32,
	yUp: f32
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
		frameBindGroupA,
		frameBindGroupB,
		colorIndex = 2,
		colorStackIndex = 12,
		prevFramePL = 0,
		framePL = 0;

	$._pipelineConfigs = [];
	$._pipelines = [];
	$._buffers = [];
	$._texturesToDestroy = [];

	// local variables used for better performance

	// stores pipeline shifts and vertex counts/image indices
	let drawStack = ($._drawStack = []);
	$._customDrawHandlers = {};
	$._customBindHandlers = {};

	// colors used for each draw call
	let colorStack = new Float32Array(1e6);

	// prettier-ignore
	colorStack.set([
		0, 0, 0, 0, // transparent
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

	$._mainLayout = mainLayout;

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
}
`;

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

		// Create persistent bind groups for both frame buffers
		frameBindGroupA = Q5.device.createBindGroup({
			layout: frameLayout,
			entries: [
				{ binding: 0, resource: { buffer: uniformBuffer } },
				{ binding: 1, resource: frameSampler },
				{ binding: 2, resource: frameA.createView() }
			]
		});

		frameBindGroupB = Q5.device.createBindGroup({
			layout: frameLayout,
			entries: [
				{ binding: 0, resource: { buffer: uniformBuffer } },
				{ binding: 1, resource: frameSampler },
				{ binding: 2, resource: frameB.createView() }
			]
		});
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
		_colorMode = 'rgb',
		_colorFormat = 1;

	if ($.colorMode) {
		let colorMode = $.colorMode;
		$.colorMode = function () {
			colorMode(...arguments);
			_colorMode = $._colorMode;
			usingRGB = _colorMode == 'rgb';
			_colorFormat = $._colorFormat;
		};
	}

	const addColor = (r, g, b, a) => {
		if (usingRGB === false || (g === undefined && !r._isColor && typeof r !== 'number')) {
			if (usingRGB === false || typeof r == 'string' || !Array.isArray(r)) {
				r = $.color(r, g, b, a);
			} else {
				[r, g, b, a] = r;
			}
		} else if (b === undefined) {
			// grayscale mode `fill(1, 0.5)`
			a = g ?? _colorFormat;
			g = b = r;
		}
		a ??= _colorFormat;

		if (r._isColor) {
			let c = r;
			if (usingRGB) ({ r, g, b, a } = c);
			else {
				a = c.a;
				if (c.c != undefined) c = Q5.OKLCHtoRGB(c.l, c.c, c.h);
				else if (c.l != undefined) c = Q5.HSLtoRGB(c.h, c.s, c.l);
				else c = Q5.HSLtoRGB(...Q5.HSBtoHSL(c.h, c.s, c.b));
				[r, g, b] = c;
			}
		}

		if (_colorFormat === 255) {
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

	let doFill = true,
		doStroke = true,
		fillSet = false,
		strokeSet = false,
		strokeIdx = 1,
		fillIdx = 2,
		tintIdx = 2,
		globalAlpha = 1,
		sw = 1, // stroke weight
		hsw = 0.5, // half of the stroke weight
		qsw = 0.25, // quarter of the stroke weight
		hswScaled = 0.5;

	$.fill = (r, g, b, a) => {
		addColor(r, g, b, a);
		doFill = fillSet = true;
		fillIdx = colorIndex;
	};
	$.stroke = (r, g, b, a) => {
		addColor(r, g, b, a);
		doStroke = strokeSet = true;
		strokeIdx = colorIndex;
	};
	$.tint = (r, g, b, a) => {
		addColor(r, g, b, a);
		tintIdx = colorIndex;
	};
	$.opacity = (a) => (globalAlpha = a);
	$.noFill = () => (doFill = false);
	$.noStroke = () => (doStroke = false);
	$.noTint = () => (tintIdx = 2);

	$.strokeWeight = (v) => {
		if (v === undefined) return sw;

		if (!v) return (doStroke = false);
		else doStroke = true;

		v = Math.abs(v);
		sw = v;
		hsw = v / 2;
		qsw = v / 4;
		hswScaled = hsw * _scale;
	};

	// Advanced methods for high performance
	// fill and stroke changes. Used by q5play!
	$._getStrokeWeight = () => {
		return [sw, hsw, qsw, hswScaled];
	};
	$._setStrokeWeight = (strokeData) => {
		[sw, hsw, qsw, hswScaled] = strokeData;
	};
	$._getFillIdx = () => fillIdx;
	$._setFillIdx = (v) => (fillIdx = v);
	$._doFill = () => (doFill = true);
	$._getStrokeIdx = () => strokeIdx;
	$._setStrokeIdx = (v) => (strokeIdx = v);
	$._doStroke = () => (doStroke = true);

	const MAX_TRANSFORMS = $._isGraphics ? 1000 : Q5.MAX_TRANSFORMS,
		MATRIX_SIZE = 16, // 4x4 matrix
		MAX_TRANSFORM_BUFFER_SIZE = MAX_TRANSFORMS * MATRIX_SIZE * 4,
		transforms = new Float32Array(MAX_TRANSFORMS * MATRIX_SIZE);

	let matrix,
		matrices = [],
		matricesIdxStack = [],
		matrixIdx = 0,
		matrixDirty = false; // tracks if the matrix has been modified

	$._getMatrixIdx = () => matrixIdx;

	// 4x4 identity matrix
	// prettier-ignore
	matrices.push([
		1, 0, 0, 0,
		0, -1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);

	transforms.set(matrices[0]);

	// default is y-down for q5 WebGPU
	let flippedY = true,
		yDir = -1;

	$.flipY = () => {
		$._flippedY = flippedY = !flippedY;
		yDir *= -1;

		// edit the identity matrix to flip Y axis
		matrices[0][5] *= -1;
		transforms.set(matrices[0], 0);
	};

	$.translate = (x, y) => {
		if (!x && !y) return;
		let m = matrix;

		// Apply translation in sheared/skewed space (2D only)
		m[12] += x * m[0] + y * m[4];
		m[13] += x * m[1] + y * m[5];

		matrixDirty = true;
	};

	$.rotate = $.rotateZ = (a, a1) => {
		if (!a) return;

		let cosR, sinR;
		if (a1 === undefined) {
			if ($._angleMode) a *= $._DEGTORAD;
			cosR = Math.cos(a);
			sinR = Math.sin(a);
		} else {
			cosR = a;
			sinR = a1;
		}

		let m = matrix,
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

		matrixDirty = true;
	};

	let _scale = 1;

	$.scale = (x = 1, y, z = 1) => {
		y ??= x;

		_scale = Math.max(Math.abs(x), Math.abs(y));
		hswScaled = hsw * _scale;

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

		matrixDirty = true;
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

		m[4] = m4 + m0 * tanAng;
		m[5] = m5 + m1 * tanAng;

		matrixDirty = true;
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

		m[0] = m0 + m4 * tanAng;
		m[1] = m1 + m5 * tanAng;

		matrixDirty = true;
	};

	$.applyMatrix = (...args) => {
		let m;
		if (args.length == 1) m = args[0];
		else m = args;

		if (m.length <= 6) {
			const a = m[0],
				b = m[1],
				c = m[2],
				d = m[3],
				e = m[4] || 0,
				f = m[5] || 0;
			// Convert Canvas2D [a,b,c,d,e,f] (column-major 3x3: [a,b,0, c,d,0, e,f,1])
			m = [a, b, 0, c, d, 0, e, f, 1];
		}
		if (m.length <= 9) {
			// convert 3x3 matrix to 4x4 layout used internally
			m = [m[0], m[1], 0, m[2], m[3], m[4], 0, m[5], 0, 0, 1, 0, m[6], m[7], 0, m[8]];
		} else if (m.length != 16) {
			throw new Error('Matrix must be a 3x3 or 4x4 array.');
		}

		// overwrite the current transformation matrix
		matrix = m.slice();
		matrixDirty = true;
	};

	// saves the current matrix state
	const saveMatrix = () => {
		transforms.set(matrix, matrices.length * MATRIX_SIZE);
		matrixIdx = matrices.length;
		matrices.push(matrix.slice());
		matrixDirty = false;
	};

	let scaleStack = [];

	// push the current matrix index onto the stack
	$.pushMatrix = () => {
		if (matrixDirty) saveMatrix();
		matricesIdxStack.push(matrixIdx);
		scaleStack.push(_scale);
	};

	$.popMatrix = () => {
		if (!matricesIdxStack.length) {
			return console.warn('Matrix index stack is empty!');
		}
		// pop the last matrix index and set it as the current matrix index
		let idx = matricesIdxStack.pop();
		matrix = matrices[idx].slice();
		matrixIdx = idx;
		matrixDirty = false;
		_scale = scaleStack.pop();
		hswScaled = hsw * _scale;
	};

	$.resetMatrix = () => {
		matrix = matrices[0].slice();
		matrixIdx = 0;
		_scale = 1;
		hswScaled = hsw;
	};
	$.resetMatrix();

	let styles = [];

	$.pushStyles = () => {
		styles.push([
			fillIdx,
			strokeIdx,
			sw,
			hsw,
			_scale,
			hswScaled,
			doFill,
			doStroke,
			fillSet,
			strokeSet,
			globalAlpha,
			tintIdx,
			_textSize,
			_textAlign,
			_textBaseline,
			_imageMode,
			_rectMode,
			_ellipseMode,
			usingRGB,
			_colorMode,
			_colorFormat,
			$.Color
		]);
	};

	$.popStyles = () => {
		let s = styles.pop();

		// array destructuring to local variables is way better
		// for performance than copying from one object to another
		[
			fillIdx,
			strokeIdx,
			sw,
			hsw,
			_scale,
			hswScaled,
			doFill,
			doStroke,
			fillSet,
			strokeSet,
			globalAlpha,
			tintIdx,
			_textSize,
			_textAlign,
			_textBaseline,
			_imageMode,
			_rectMode,
			_ellipseMode,
			usingRGB,
			_colorMode,
			_colorFormat
		] = s;

		// since these values are used outside of q5-webgpu
		// they need to be stored on the instance
		$._colorFormat = _colorFormat;
		$._colorMode = _colorMode;
		$.Color = s.at(-1);
	};

	$.push = () => {
		$.pushMatrix();
		$.pushStyles();
	};

	$.pop = () => {
		$.popMatrix();
		$.popStyles();
	};

	// Reusable array for calcBox to avoid GC
	let boxCache = [0, 0, 0, 0];

	const calcBox = (x, y, w, h, mode) => {
		// left, right, top, bottom
		let l, r, t, b;
		if (!mode || mode == 'corner') {
			l = x;
			r = x + w;
			t = y;
			b = y - h * yDir;
		} else if (mode == 'center') {
			let hw = w / 2,
				hh = h / 2;
			l = x - hw;
			r = x + hw;
			t = y + hh * yDir;
			b = y - hh * yDir;
		} else {
			// CORNERS
			l = x;
			r = w;
			t = y;
			b = -h * yDir;
		}

		boxCache[0] = l;
		boxCache[1] = r;
		boxCache[2] = t;
		boxCache[3] = b;
		return boxCache;
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
		'source-over': [2, 3, 0, 1, 3, 0],
		'destination-over': [6, 1, 0, 6, 1, 0],
		'source-in': [5, 0, 0, 5, 0, 0],
		'destination-in': [0, 2, 0, 0, 2, 0],
		'source-out': [6, 0, 0, 6, 0, 0],
		'destination-out': [0, 3, 0, 0, 3, 0],
		'source-atop': [5, 3, 0, 5, 3, 0],
		'destination-atop': [6, 2, 0, 6, 2, 0],
		lighter: [1, 1, 0, 1, 1, 0],
		darken: [1, 1, 3, 1, 3, 0],
		lighten: [1, 1, 4, 1, 3, 0],
		replace: [1, 0, 0, 1, 0, 0]
	};

	let blendModeNames = Object.keys(blendModes);

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

	let _blendMode = 'source-over';

	$.blendMode = (mode) => {
		if (mode == _blendMode) return;
		_blendMode = mode;
		let i = blendModeNames.indexOf(mode);
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
		if (r.canvas) {
			$.push();
			$.resetMatrix();
			let img = r;
			_imageMode = 'corner';
			$.image(img, -c.hw, -c.hh, c.w, c.h);
			$.pop();
		} else {
			addColor(r, g, b, a);
			let lx = -c.hw,
				rx = c.hw,
				ty = -c.hh,
				by = c.hh;
			addQuad(lx, ty, rx, ty, rx, by, lx, by, colorIndex, 0);
		}
	};

	$._beginRender = () => {
		// swap the frame textures and bind groups
		const temp = frameA;
		frameA = frameB;
		frameB = temp;

		const tempBindGroup = frameBindGroupA;
		frameBindGroupA = frameBindGroupB;
		frameBindGroupB = tempBindGroup;

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

		// Use pre-created bind group instead of creating new one
		frameBindGroup = frameBindGroupB;

		if (!shouldClear) {
			pass.setPipeline($._pipelines[prevFramePL]);
			pass.setBindGroup(0, frameBindGroup);
			pass.draw(4);
		}
		shouldClear = false;
	};

	let transformsBuffer, colorsBuffer, shapesVertBuff, imgVertBuff, charBuffer, textBuffer;
	let mainBindGroup, lastTransformsBuffer, lastColorsBuffer;

	$._render = () => {
		let transformsSize = matrices.length * MATRIX_SIZE * 4; // 4 bytes per float
		if (!transformsBuffer || transformsBuffer.size < transformsSize) {
			if (transformsBuffer) transformsBuffer.destroy();
			transformsBuffer = Q5.device.createBuffer({
				size: Math.min(transformsSize * 2, MAX_TRANSFORM_BUFFER_SIZE),
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
			});
		}

		Q5.device.queue.writeBuffer(transformsBuffer, 0, transforms.subarray(0, matrices.length * MATRIX_SIZE));

		let colorsSize = colorStackIndex * 4;
		if (!colorsBuffer || colorsBuffer.size < colorsSize) {
			if (colorsBuffer) colorsBuffer.destroy();
			colorsBuffer = Q5.device.createBuffer({
				size: colorsSize * 2,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
			});
		}

		Q5.device.queue.writeBuffer(colorsBuffer, 0, colorStack.subarray(0, colorStackIndex));

		// Reuse uniform array instead of creating new one each frame
		$._uniforms[0] = $.width;
		$._uniforms[1] = $.height;
		$._uniforms[2] = $.halfWidth;
		$._uniforms[3] = $.halfHeight;
		$._uniforms[4] = $._pixelDensity;
		$._uniforms[5] = $.frameCount;
		$._uniforms[6] = performance.now();
		$._uniforms[7] = $.deltaTime;
		$._uniforms[8] = $.mouseX;
		$._uniforms[9] = $.mouseY;
		$._uniforms[10] = $.mouseIsPressed ? 1 : 0;
		$._uniforms[11] = $.keyCode;
		$._uniforms[12] = $.keyIsPressed ? 1 : 0;
		$._uniforms[13] = yDir;

		Q5.device.queue.writeBuffer(uniformBuffer, 0, $._uniforms);

		// Only recreate bind group if buffers changed
		if (!mainBindGroup || lastTransformsBuffer !== transformsBuffer || lastColorsBuffer !== colorsBuffer) {
			mainBindGroup = Q5.device.createBindGroup({
				layout: mainLayout,
				entries: [
					{ binding: 0, resource: { buffer: uniformBuffer } },
					{ binding: 1, resource: { buffer: transformsBuffer } },
					{ binding: 2, resource: { buffer: colorsBuffer } }
				]
			});
			lastTransformsBuffer = transformsBuffer;
			lastColorsBuffer = colorsBuffer;
		}

		pass.setBindGroup(0, mainBindGroup);

		// prepare to render shapes

		$._pass.setPipeline($._pipelines[1]); // shapes pipeline

		let shapesVertSize = shapesVertIdx * 4; // 4 bytes per float
		if (!shapesVertBuff || shapesVertBuff.size < shapesVertSize) {
			if (shapesVertBuff) shapesVertBuff.destroy();
			shapesVertBuff = Q5.device.createBuffer({
				size: shapesVertSize * 2,
				usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
			});
		}

		Q5.device.queue.writeBuffer(shapesVertBuff, 0, shapesVertStack.subarray(0, shapesVertIdx));

		$._pass.setVertexBuffer(0, shapesVertBuff);

		// prepare to render images and videos

		if (imgVertIdx) {
			$._pass.setPipeline($._pipelines[2]); // images pipeline

			let imgVertSize = imgVertIdx * 4; // 4 bytes per float
			if (!imgVertBuff || imgVertBuff.size < imgVertSize) {
				if (imgVertBuff) imgVertBuff.destroy();
				imgVertBuff = Q5.device.createBuffer({
					size: imgVertSize * 2,
					usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
				});
			}

			Q5.device.queue.writeBuffer(imgVertBuff, 0, imgVertStack.subarray(0, imgVertIdx));

			$._pass.setVertexBuffer(1, imgVertBuff);

			if (vidFrames) {
				$._pass.setPipeline($._pipelines[3]); // video pipeline
				$._pass.setVertexBuffer(1, imgVertBuff);
			}
		}

		// prepare to render text

		if (charStack.length) {
			// Flatten char data into reusable buffer instead of creating new array
			let charOffset = 0;
			for (let charsData of charStack) {
				charDataBuffer.set(charsData, charOffset);
				charOffset += charsData.length;
			}
			let totalTextSize = charOffset * 4;

			if (!charBuffer || charBuffer.size < totalTextSize) {
				if (charBuffer) charBuffer.destroy();
				charBuffer = Q5.device.createBuffer({
					size: totalTextSize * 2,
					usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
				});
			}

			Q5.device.queue.writeBuffer(charBuffer, 0, charDataBuffer.buffer, 0, totalTextSize);

			// Flatten text metadata into reusable buffer
			let textOffset = 0;
			for (let textData of textStack) {
				textDataBuffer.set(textData, textOffset);
				textOffset += textData.length;
			}
			let totalMetadataSize = textOffset * 4;

			if (!textBuffer || textBuffer.size < totalMetadataSize) {
				if (textBuffer) textBuffer.destroy();
				textBuffer = Q5.device.createBuffer({
					label: 'textBuffer',
					size: totalMetadataSize * 2,
					usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
				});
			}

			Q5.device.queue.writeBuffer(textBuffer, 0, textDataBuffer.buffer, 0, totalMetadataSize);

			// create a single bind group for the text buffer and metadata buffer
			$._textBindGroup = Q5.device.createBindGroup({
				label: 'textBindGroup',
				layout: textBindGroupLayout,
				entries: [
					{ binding: 0, resource: { buffer: charBuffer } },
					{ binding: 1, resource: { buffer: textBuffer } }
				]
			});
		}

		// prepare to render rectangles

		// prettier-ignore
		Q5.device.queue.writeBuffer(
			rectBuffer,
			0,
			rectStack.buffer,
			rectStack.byteOffset,
			rectStackIdx * 4
		);

		// prepare to render ellipses

		// prettier-ignore
		Q5.device.queue.writeBuffer(
			ellipseBuffer,
			0,
			ellipseStack.buffer,
			ellipseStack.byteOffset,
			ellipseStackIdx * 4
		);

		let drawVertOffset = 0,
			imageVertOffset = 0,
			textCharOffset = 0,
			rectIdx = 0,
			ellipseIdx = 0,
			curPipelineIndex = -1;

		for (let i = 0; i < drawStack.length; i += 2) {
			let v = drawStack[i + 1];

			if (drawStack[i] != curPipelineIndex) {
				if (drawStack[i] == 0) {
					// change blend mode
					let mode = blendModeNames[v];
					for (let i = 1; i < $._pipelines.length; i++) {
						$._pipelineConfigs[i].fragment.targets[0].blend = $.blendConfigs[mode];
						$._pipelines[i] = Q5.device.createRenderPipeline($._pipelineConfigs[i]);
					}
					continue;
				}

				curPipelineIndex = drawStack[i];
				pass.setPipeline($._pipelines[curPipelineIndex]);

				if (curPipelineIndex == 5) {
					pass.setIndexBuffer(rectIndexBuffer, 'uint16');
					pass.setBindGroup(1, rectBindGroup);
				} else if (curPipelineIndex == 6) {
					pass.setIndexBuffer(ellipseIndexBuffer, 'uint16');
					pass.setBindGroup(1, ellipseBindGroup);
				} else if ($._customBindHandlers[curPipelineIndex]) {
					$._customBindHandlers[curPipelineIndex](pass);
				}
			}

			if (curPipelineIndex == 6) {
				// draw an ellipse
				pass.drawIndexed(18, v, 0, 0, ellipseIdx);
				ellipseIdx += v;
			} else if (curPipelineIndex == 5) {
				// draw a rectangle
				pass.drawIndexed(6, v, 0, 0, rectIdx);
				rectIdx += v;
			} else if (curPipelineIndex == 4 || curPipelineIndex >= 4000) {
				// draw text
				let o = drawStack[i + 2];
				pass.setBindGroup(1, fontsArr[o].bindGroup);
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
			} else if (curPipelineIndex == 1 || curPipelineIndex >= 1000) {
				// draw a shape
				// v is the number of vertices
				pass.draw(v, 1, drawVertOffset);
				drawVertOffset += v;
			} else {
				let used = $._customDrawHandlers[curPipelineIndex](pass, v, drawStack, i);
				if (used) i += used;
			}
		}
	};

	$._finishRender = () => {
		// finish rendering frameA
		pass.end();

		// create a new render pass to render frameA to the canvas
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

		// Use pre-created bind group instead of creating new one
		frameBindGroup = frameBindGroupA;

		pass.setPipeline($._pipelines[framePL]);
		pass.setBindGroup(0, frameBindGroup);
		pass.draw(4);
		pass.end();

		// submit the commands to the GPU
		Q5.device.queue.submit([encoder.finish()]);
		$._pass = pass = encoder = null;

		// clear the stacks for the next frame
		drawStack.length = 0; // faster than splice for clearing
		colorIndex = 2;
		colorStackIndex = 12;
		matrices.length = 1; // keep first matrix, clear rest
		matricesIdxStack.length = 0;

		// frameA can now be saved when saveCanvas is run
		$._texture = frameA;

		// reset
		shapesVertIdx = 0;
		imgVertIdx = 0;
		// Remove video frames without creating new array
		if (vidFrames > 0) {
			$._textureBindGroups.length = tIdx;
		}
		vidFrames = 0;
		charStack.length = 0;
		textStack.length = 0;
		// Don't create new typed arrays - just reset index
		rectStackIdx = 0;
		ellipseStackIdx = 0;

		// destroy buffers
		let bufs = $._buffers;
		let texs = $._texturesToDestroy;
		$._buffers = [];
		$._texturesToDestroy = [];

		Q5.device.queue.onSubmittedWorkDone().then(() => {
			for (let b of bufs) b.destroy();
			for (let t of texs) t.destroy();
		});
	};

	/* SHAPES */

	let shapesPL = 1;

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

	let shapesVertStack = new Float32Array($._isGraphics ? 1000 : 1e7),
		shapesVertIdx = 0;
	const TAU = Math.PI * 2,
		HALF_PI = Math.PI / 2;

	let shapesVertBuffLayout = {
		arrayStride: 16, // 4 floats * 4 bytes
		attributes: [
			{ format: 'float32x2', offset: 0, shaderLocation: 0 }, // position
			{ format: 'float32', offset: 8, shaderLocation: 1 }, // colorIndex
			{ format: 'float32', offset: 12, shaderLocation: 2 } // matrixIndex
		]
	};

	let shapesPipelineLayout = Q5.device.createPipelineLayout({
		label: 'shapesPipelineLayout',
		bindGroupLayouts: [mainLayout]
	});

	$._pipelineConfigs[1] = {
		label: 'shapesPipeline',
		layout: shapesPipelineLayout,
		vertex: {
			module: shapesShader,
			entryPoint: 'vertexMain',
			buffers: [shapesVertBuffLayout]
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
		let v = shapesVertStack,
			i = shapesVertIdx;
		v[i++] = x;
		v[i++] = y;
		v[i++] = ci;
		v[i++] = ti;
		shapesVertIdx = i;
	};

	let _strokeCap = 'round',
		_strokeJoin = 'round';

	$.strokeCap = (x) => (_strokeCap = x);
	$.strokeJoin = (x) => (_strokeJoin = x);
	$.lineMode = () => {
		_strokeCap = 'square';
		_strokeJoin = 'none';
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
		if (matrixDirty) saveMatrix();
		sv.push(x, y, fillIdx, matrixIdx);
		shapeVertCount++;
	};

	$.curveVertex = (x, y) => {
		if (matrixDirty) saveMatrix();
		curveVertices.push({ x, y });
	};

	$.bezierVertex = function (cx1, cy1, cx2, cy2, x, y) {
		if (shapeVertCount === 0) throw new Error('Shape needs a vertex()');
		if (matrixDirty) saveMatrix();

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
				vy = mt2 * startY + 2 * mt * t * cy1 + t2 * y;
			} else {
				let t3 = t2 * t;
				let mt3 = mt2 * mt;

				// Cubic Bezier formula
				vx = mt3 * startX + 3 * mt2 * t * cx1 + 3 * mt * t2 * cx2 + t3 * x;
				vy = mt3 * startY + 3 * mt2 * t * cy1 + 3 * mt * t2 * cy2 + t3 * y;
			}

			sv.push(vx, vy, fillIdx, matrixIdx);
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

					sv.push(x, y, fillIdx, matrixIdx);
					shapeVertCount++;
				}
			}
		}

		if (!shapeVertCount) return;
		if (shapeVertCount == 1) return $.point(sv[0], sv[1]);
		if (shapeVertCount == 2) return $.line(sv[0], sv[1], sv[4], sv[5]);

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

		if (doFill) {
			if (shapeVertCount == 5) {
				// for quads, draw two triangles
				addVert(sv[0], sv[1], sv[2], sv[3]); // v0
				addVert(sv[4], sv[5], sv[6], sv[7]); // v1
				addVert(sv[12], sv[13], sv[14], sv[15]); // v3
				addVert(sv[8], sv[9], sv[10], sv[11]); // v2
				drawStack.push(shapesPL, 4);
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
				drawStack.push(shapesPL, (shapeVertCount - 2) * 3);
			}
		}

		if (doStroke) {
			// draw lines between vertices
			for (let i = 0; i < shapeVertCount - 1; i++) {
				let v1 = i * 4;
				let v2 = (i + 1) * 4;
				$.line(sv[v1], sv[v1 + 1], sv[v2], sv[v2 + 1]);
			}
			let v1 = (shapeVertCount - 1) * 4;
			let v2 = 0;
			if (close) $.line(sv[v1], sv[v1 + 1], sv[v2], sv[v2 + 1]);
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

	function addQuad(x1, y1, x2, y2, x3, y3, x4, y4, ci, ti) {
		addVert(x1, y1, ci, ti); // v0
		addVert(x2, y2, ci, ti); // v1
		addVert(x4, y4, ci, ti); // v3
		addVert(x3, y3, ci, ti); // v2
		drawStack.push(shapesPL, 4);
	}

	$.plane = (x, y, w, h) => {
		h ??= w;
		let [l, r, t, b] = calcBox(x, y, w, h, 'center');
		if (matrixDirty) saveMatrix();
		addQuad(l, t, r, t, r, b, l, b, fillIdx, matrixIdx);
	};

	/* RECT */

	let rectPL = 5;

	$._rectShaderCode =
		$._baseShaderCode +
		/* wgsl */ `
struct Rect {
	center: vec2f,
	extents: vec2f,
	roundedRadius: f32,
	strokeWeight: f32,
	fillIndex: f32,
	strokeIndex: f32,
	matrixIndex: f32,
	padding0: f32, // can't use vec3f for alignment
	padding1: vec2f,
	padding2: vec4f
};

struct VertexParams {
	@builtin(vertex_index) vertIndex: u32,
	@builtin(instance_index) instIndex: u32
};

struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) local: vec2f,
	@location(1) extents: vec2f,
	@location(2) roundedRadius: f32,
	@location(3) strokeWeight: f32,
	@location(4) fill: vec4f,
	@location(5) stroke: vec4f,
	@location(6) blend: vec4f
};

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

@group(1) @binding(0) var<storage, read> rects: array<Rect>;

const quad = array(
	vec2f(-1.0, -1.0),
	vec2f( 1.0, -1.0),
	vec2f(-1.0,  1.0),
	vec2f( 1.0,  1.0)
);
const transparent = vec4f(0.0);

fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
	var vert = vec4f(pos, 0.0, 1.0);
	vert = transforms[i32(matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	return vert;
}

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	let rect = rects[v.instIndex];

	let halfStrokeSize = vec2f(rect.strokeWeight * 0.5);
	let quadSize = rect.extents + halfStrokeSize;
	let pos = (quad[v.vertIndex] * quadSize) + rect.center;

	let local = pos - rect.center;

	var f: FragParams;
	f.position = transformVertex(pos, rect.matrixIndex);

	f.local = local;
	f.extents = rect.extents;
	f.roundedRadius = rect.roundedRadius;
	f.strokeWeight = rect.strokeWeight;

	let fill = colors[i32(rect.fillIndex)];
	let stroke = colors[i32(rect.strokeIndex)];
	f.fill = fill;
	f.stroke = stroke;

	// Source-over blend: stroke over fill (pre-multiplied alpha)
	if (fill.a != 0.0 && stroke.a != 1.0) {
		let outAlpha = stroke.a + fill.a * (1.0 - stroke.a);
		let outColor = stroke.rgb * stroke.a + fill.rgb * fill.a * (1.0 - stroke.a);
		f.blend = vec4f(outColor / max(outAlpha, 1e-5), outAlpha);
	}
	return f;
}

fn sdRoundRect(p: vec2f, extents: vec2f, radius: f32) -> f32 {
	let q = abs(p) - extents + vec2f(radius);
	return length(max(q, vec2f(0.0))) - radius + min(max(q.x, q.y), 0.0);
}

@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let dist = select(
		max(abs(f.local.x) - f.extents.x, abs(f.local.y) - f.extents.y), // sharp
		sdRoundRect(f.local, f.extents, f.roundedRadius),                  // rounded
		f.roundedRadius > 0.0
	);

	// fill only
	if (f.fill.a != 0.0 && f.strokeWeight == 0.0) {
		if (dist <= 0.0) {
			return f.fill;
		}
		return transparent;
	}

	let halfStroke = f.strokeWeight * 0.5;
	let inner = dist + halfStroke;

	if (f.fill.a != 0.0) {
		if (inner <= 0.0) {
			return f.fill;
		}
		if (dist <= 0.0 && f.stroke.a != 1.0) {
			return f.blend;
		}
	}

	let outer = dist - halfStroke;

	if (outer <= 0.0 && inner >= 0.0) {
		return f.stroke;
	}

	return transparent;
}
	`;

	let rectShader = Q5.device.createShaderModule({
		label: 'rectShader',
		code: $._rectShaderCode
	});

	let rectIndices = new Uint16Array([0, 1, 2, 2, 1, 3]);

	let rectIndexBuffer = Q5.device.createBuffer({
		size: rectIndices.byteLength,
		usage: GPUBufferUsage.INDEX,
		mappedAtCreation: true
	});
	new Uint16Array(rectIndexBuffer.getMappedRange()).set(rectIndices);
	rectIndexBuffer.unmap();

	let rectBindGroupLayout = Q5.device.createBindGroupLayout({
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX,
				buffer: { type: 'read-only-storage' }
			}
		]
	});

	let rectPipelineLayout = Q5.device.createPipelineLayout({
		label: 'rectPipelineLayout',
		bindGroupLayouts: [mainLayout, rectBindGroupLayout]
	});

	$._pipelineConfigs[5] = {
		label: 'rectPipeline',
		layout: rectPipelineLayout,
		vertex: {
			module: rectShader,
			entryPoint: 'vertexMain',
			buffers: []
		},
		fragment: {
			module: rectShader,
			entryPoint: 'fragMain',
			targets: [
				{
					format: 'bgra8unorm',
					blend: $.blendConfigs['source-over']
				}
			]
		},
		primitive: { topology: 'triangle-list' },
		multisample: { count: 4 }
	};

	$._pipelines[5] = Q5.device.createRenderPipeline($._pipelineConfigs[5]);

	let rectStack = new Float32Array(Q5.MAX_RECTS * 16);
	let rectStackIdx = 0;

	let rectBuffer = Q5.device.createBuffer({
		size: rectStack.byteLength,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
	});

	let rectBindGroup = Q5.device.createBindGroup({
		layout: rectBindGroupLayout,
		entries: [{ binding: 0, resource: { buffer: rectBuffer } }]
	});

	function addRect(x, y, hw, hh, roundedRadius, strokeW, fillRect) {
		let s = rectStack,
			i = rectStackIdx;

		s[i] = x;
		s[i + 1] = y;
		s[i + 2] = hw;
		s[i + 3] = hh;
		s[i + 4] = roundedRadius;
		s[i + 5] = strokeW;
		s[i + 6] = fillRect;
		s[i + 7] = strokeIdx;
		s[i + 8] = matrixIdx;

		rectStackIdx += 16;
		drawStack.push(rectPL, 1);
	}

	let _rectMode = 'corner';

	$.rectMode = (x) => (_rectMode = x);
	$._getRectMode = () => _rectMode;

	// Reusable array for rect mode calculations
	let rectModeCache = [0, 0, 0, 0];

	function applyRectMode(x, y, w, h) {
		let hw = w / 2,
			hh = h / 2;
		if (_rectMode != 'center') {
			if (_rectMode == 'corner') {
				x += hw;
				y += hh * -yDir;
				hw = Math.abs(hw);
				hh = Math.abs(hh);
			} else if (_rectMode == 'radius') {
				hw = w;
				hh = h;
			} else if (_rectMode == 'corners') {
				hw = Math.abs((w - x) / 2);
				hh = Math.abs((h - y) / 2);
				x = (x + w) / 2;
				y = (y + h) / 2;
			}
		}
		rectModeCache[0] = x;
		rectModeCache[1] = y;
		rectModeCache[2] = hw;
		rectModeCache[3] = hh;
		return rectModeCache;
	}

	$.rect = (x, y, w, h, rr = 0) => {
		if (matrixDirty) saveMatrix();

		let hw, hh;
		[x, y, hw, hh] = applyRectMode(x, y, w, h);

		addRect(x, y, hw, hh, rr, doStroke ? sw : 0, doFill ? fillIdx : 0);
	};

	$.square = (x, y, s, rr) => $.rect(x, y, s, s, rr);

	function addCapsule(x1, y1, x2, y2, r, strokeW, fillCapsule) {
		let dx = x2 - x1,
			dy = flippedY ? y2 - y1 : y1 - y2,
			len = Math.hypot(dx, dy);

		if (len === 0) return;

		let angle = Math.atan2(dy, dx),
			cx = (x1 + x2) / 2,
			cy = (y1 + y2) / 2;

		if ($._angleMode) angle *= $._RADTODEG;

		$.pushMatrix();
		$.translate(cx, cy);
		$.rotate(angle);

		if (matrixDirty) saveMatrix();

		addRect(0, 0, len / 2 + r, r, r, strokeW, fillCapsule);

		$.popMatrix();
	}

	$.capsule = (x1, y1, x2, y2, r) => {
		addCapsule(x1, y1, x2, y2, r, doStroke ? sw : 0, doFill ? fillIdx : 0);
	};

	$.line = (x1, y1, x2, y2) => {
		if (doStroke) addCapsule(x1, y1, x2, y2, qsw, hsw, 0);
	};

	/* ELLIPSE */

	let ellipsePL = 6;

	$._ellipseShaderCode =
		$._baseShaderCode +
		/* wgsl */ `
struct Ellipse {
	center: vec2f,
	size: vec2f,
	startAngle: f32,
	endAngle: f32,
	strokeWeight: f32,
	fillIndex: f32,
	strokeIndex: f32,
	matrixIndex: f32,
	padding0: vec2f,
	padding1: vec4f
};

struct VertexParams {
	@builtin(vertex_index) vertIndex: u32,
	@builtin(instance_index) instIndex: u32
};

struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) outerEdge: vec2f,
	@location(1) fillEdge: vec2f,
	@location(2) innerEdge: vec2f,
	@location(3) strokeWeight: f32,
	@location(4) fill: vec4f,
	@location(5) stroke: vec4f,
	@location(6) blend: vec4f
};

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

@group(1) @binding(0) var<storage, read> ellipses: array<Ellipse>;

const PI = 3.141592653589793;
const segments = 6.0;
const expansion = 1.0 / cos(PI / segments);
const antiAlias = 0.015625; // 1/64
const transparent = vec4f(0.0);

fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
	var vert = vec4f(pos, 0.0, 1.0);
	vert = transforms[i32(matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	return vert;
}

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	let ellipse = ellipses[v.instIndex];
	var pos = ellipse.center;
	var local = vec2f(0.0);
	let start = ellipse.startAngle;
	let end = ellipse.endAngle;
	let arc = end - start;
	let halfStrokeSize = vec2f(ellipse.strokeWeight * 0.5);

	let fanSize = (ellipse.size + halfStrokeSize) * expansion;

	if (v.vertIndex != 0) {
		let theta = start + (f32(v.vertIndex - 1) / segments) * arc;
		local = vec2f(cos(theta), sin(theta));
		pos = ellipse.center + local * fanSize;
	}

	let dist = pos - ellipse.center;

	var f: FragParams;
	f.position = transformVertex(pos, ellipse.matrixIndex);
	f.outerEdge = dist / (ellipse.size + halfStrokeSize);
	f.fillEdge = dist / ellipse.size;
	let innerSize = ellipse.size - halfStrokeSize;
	if (innerSize.x <= 0.0 || innerSize.y <= 0.0) {
		f.innerEdge = vec2f(2.0, 0.0);
	} else {
		f.innerEdge = dist / innerSize;
	}
	f.strokeWeight = ellipse.strokeWeight;

	let fill = colors[i32(ellipse.fillIndex)];
	let stroke = colors[i32(ellipse.strokeIndex)];
	f.fill = fill;
	f.stroke = stroke;

	// Source-over blend: stroke over fill (pre-multiplied alpha)
	if (fill.a != 0.0 && stroke.a != 1.0) {
		let outAlpha = stroke.a + fill.a * (1.0 - stroke.a);
		let outColor = stroke.rgb * stroke.a + fill.rgb * fill.a * (1.0 - stroke.a);
		f.blend = vec4f(outColor / max(outAlpha, 1e-5), outAlpha);
	}
	return f;
}

@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	let fillEdge = length(f.fillEdge);

	// disable AA for very thin strokes
	let aa = select(antiAlias, 0.0, f.strokeWeight <= 1.0);

	if (f.fill.a != 0.0 && f.strokeWeight == 0.0) {
		if (fillEdge > 1.0) {
			return transparent;
		}
		let fillAlpha = 1.0 - smoothstep(1.0 - aa, 1.0, fillEdge);
		return vec4f(f.fill.rgb, f.fill.a * fillAlpha);
	}

	let innerEdge = length(f.innerEdge);
	
	if (f.fill.a != 0.0 && fillEdge < 1.0) {
		if (innerEdge < 1.0) {
			return f.fill;
		}
		let tInner = smoothstep(1.0, 1.0 + aa, innerEdge);
		let tOuter = smoothstep(1.0 - aa, 1.0, fillEdge);
		if (f.stroke.a != 1.0) {
			let fillBlend = mix(f.fill, f.blend, tInner);
			return mix(fillBlend, f.stroke, tOuter);
		} else {
			let fillBlend = mix(f.fill, f.stroke, tInner);
			return mix(fillBlend, f.stroke, tOuter);
		}
	}
	
	if (innerEdge < 1.0) {
		return transparent;
	}

	let outerEdge = length(f.outerEdge);
	let outerAlpha = 1.0 - smoothstep(1.0 - aa, 1.0, outerEdge);
	let innerAlpha = smoothstep(1.0, 1.0 + aa, innerEdge);
	let strokeAlpha = innerAlpha * outerAlpha;
	return vec4f(f.stroke.rgb, f.stroke.a * strokeAlpha);
}
`;

	let ellipseShader = Q5.device.createShaderModule({
		label: 'ellipseShader',
		code: $._ellipseShaderCode
	});

	let fanIndices = new Uint16Array([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 7]);

	let ellipseIndexBuffer = Q5.device.createBuffer({
		size: fanIndices.byteLength,
		usage: GPUBufferUsage.INDEX,
		mappedAtCreation: true
	});
	new Uint16Array(ellipseIndexBuffer.getMappedRange()).set(fanIndices);
	ellipseIndexBuffer.unmap();

	let ellipseBindGroupLayout = Q5.device.createBindGroupLayout({
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX,
				buffer: { type: 'read-only-storage' }
			}
		]
	});

	let ellipsePipelineLayout = Q5.device.createPipelineLayout({
		label: 'ellipsePipelineLayout',
		bindGroupLayouts: [mainLayout, ellipseBindGroupLayout]
	});

	$._pipelineConfigs[6] = {
		label: 'ellipsePipeline',
		layout: ellipsePipelineLayout,
		vertex: {
			module: ellipseShader,
			entryPoint: 'vertexMain',
			buffers: []
		},
		fragment: {
			module: ellipseShader,
			entryPoint: 'fragMain',
			targets: [
				{
					format: 'bgra8unorm',
					blend: $.blendConfigs['source-over']
				}
			]
		},
		primitive: { topology: 'triangle-list' },
		multisample: { count: 4 }
	};

	$._pipelines[6] = Q5.device.createRenderPipeline($._pipelineConfigs[6]);

	let ellipseStack = new Float32Array(Q5.MAX_ELLIPSES * 16);
	let ellipseStackIdx = 0;

	let ellipseBuffer = Q5.device.createBuffer({
		size: ellipseStack.byteLength,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
	});

	let ellipseBindGroup = Q5.device.createBindGroup({
		layout: ellipseBindGroupLayout,
		entries: [{ binding: 0, resource: { buffer: ellipseBuffer } }]
	});

	function addEllipse(x, y, a, b, start, stop, strokeW, fillEllipse) {
		let s = ellipseStack,
			i = ellipseStackIdx;

		s[i] = x;
		s[i + 1] = y;
		s[i + 2] = a;
		s[i + 3] = b;
		s[i + 4] = start;
		s[i + 5] = stop;
		s[i + 6] = strokeW;
		s[i + 7] = fillEllipse ? fillIdx : 0;
		s[i + 8] = strokeIdx;
		s[i + 9] = matrixIdx;

		ellipseStackIdx += 16;
		drawStack.push(ellipsePL, 1);
	}

	let _ellipseMode = 'center';

	$.ellipseMode = (x) => (_ellipseMode = x);
	$._getEllipseMode = () => _ellipseMode;

	// Reusable array for ellipse mode calculations
	let ellipseModeCache = [0, 0, 0, 0];

	function applyEllipseMode(x, y, w, h) {
		h ??= w;
		let a, b;
		if (_ellipseMode == 'center') {
			a = w / 2;
			b = h / 2;
		} else if (_ellipseMode == 'radius') {
			a = w;
			b = h;
		} else if (_ellipseMode == 'corner') {
			x += w / 2;
			y += h / 2;
			a = w / 2;
			b = h / 2;
		} else if (_ellipseMode == 'corners') {
			x = (x + w) / 2;
			y = (y + h) / 2;
			a = w - x;
			b = h - y;
		}
		ellipseModeCache[0] = x;
		ellipseModeCache[1] = y;
		ellipseModeCache[2] = a;
		ellipseModeCache[3] = b;
		return ellipseModeCache;
	}

	$.ellipse = (x, y, w, h) => {
		let a, b;
		[x, y, a, b] = applyEllipseMode(x, y, w, h);

		if (matrixDirty) saveMatrix();

		addEllipse(x, y, a, b, 0, TAU, doStroke ? sw : 0, doFill);
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
		[x, y, a, b] = applyEllipseMode(x, y, w, h);

		if (matrixDirty) saveMatrix();

		addEllipse(x, y, a, b, start, stop, doStroke ? sw : 0, doFill);
	};

	$.point = (x, y) => {
		if (matrixDirty) saveMatrix();

		// if the point stroke size is a single pixel (or smaller), use a rectangle
		if (hswScaled <= 0.5) {
			addRect(x, y, hsw, hsw, 0, sw, 0);
		} else {
			// dimensions of the point needs to be set to half the stroke weight
			addEllipse(x, y, hsw, hsw, 0, TAU, sw, 0);
		}
	};

	/* IMAGE */

	let imagePL = 2,
		videoPL = 3;

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

	let imgVertStack = new Float32Array($._isGraphics ? 1000 : 1e7),
		imgVertIdx = 0;

	let imgVertBuffLayout = {
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
		bindGroupLayouts: [mainLayout, textureLayout]
	});

	let videoPipelineLayout = Q5.device.createPipelineLayout({
		label: 'videoPipelineLayout',
		bindGroupLayouts: [mainLayout, videoTextureLayout]
	});

	$._pipelineConfigs[2] = {
		label: 'imagePipeline',
		layout: imagePipelineLayout,
		vertex: {
			module: imageShader,
			entryPoint: 'vertexMain',
			buffers: [{ arrayStride: 0, attributes: [] }, imgVertBuffLayout]
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
			buffers: [{ arrayStride: 0, attributes: [] }, imgVertBuffLayout]
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

	if (c) {
		// polyfill for canvas.convertToBlob
		c.convertToBlob = async (opt) => {
			let makeFrame = $._drawStack?.length;
			if (makeFrame) {
				$._render();
				$._finishRender();
			}

			let texture = $._texture;

			// this changes the value of $._texture
			if (makeFrame) $._beginRender();

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

			let cnv = new OffscreenCanvas(w, h);
			let ctx = cnv.getContext('2d', { colorSpace });
			ctx.putImageData(data, 0, 0);

			$._buffers.push(buffer);

			return await cnv.convertToBlob(opt);
		};
	}

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
			if (img._texture) return;
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

			let src = { source: cnv };
			if (cnv.tagName == 'IMG') src.colorSpace = $.canvas.colorSpace;

			Q5.device.queue.copyExternalImageToTexture(
				src,
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
		let g = $._g.loadImage(src, (img) => {
			$._makeDrawable(img);
			if (cb) cb(img);
		});
		return g;
	};

	$._makeDrawable = (g) => {
		$._addTexture(g);
		g._owner = $;
	};

	$.createImage = (w, h, opt) => {
		let g = $._g.createImage(w, h, opt);
		$._makeDrawable(g);
		// assume the user will draw to the image canvas
		g.modified = true;
		return g;
	};

	let _createGraphics = $.createGraphics;

	$.createGraphics = (w, h, opt = {}) => {
		if (typeof opt == 'string') opt = { renderer: opt };
		opt.renderer ??= 'c2d';
		let g = _createGraphics(w, h, opt);

		g.noLoop();

		let _loop = g.loop;
		g.loop = () => {
			if (Q5.experimental) return _loop();
			console.error('Looping graphics in q5 WebGPU is disabled. See issue https://github.com/q5js/q5.js/issues/104');
		};

		if (g.canvas.webgpu) {
			$._addTexture(g, g._frameA);
			$._addTexture(g, g._frameB);
			g._beginRender();
		} else {
			$._makeDrawable(g);
			// assume the user will draw to the graphics canvas
			g.modified = true;
		}
		return g;
	};

	let _imageMode = 'corner';

	$.imageMode = (x) => (_imageMode = x);
	$._getImageMode = () => _imageMode;

	// Reusable uniform buffer array to avoid GC
	$._uniforms = new Float32Array(14);

	const addImgVert = (x, y, u, v, ci, ti, ia) => {
		let s = imgVertStack,
			i = imgVertIdx;
		s[i++] = x;
		s[i++] = y;
		s[i++] = u;
		s[i++] = v;
		s[i++] = ci;
		s[i++] = ti;
		s[i++] = ia;
		imgVertIdx = i;
	};

	$.image = (img, dx = 0, dy = 0, dw, dh, sx = 0, sy = 0, sw, sh) => {
		if (!img) return;
		let isVideo;
		if (img._texture == undefined) {
			isVideo = img.tagName == 'VIDEO';
			if (!isVideo || !img.currentTime) return;
			if (img.flipped) $.scale(-1, 1);
		}

		if (matrixDirty) saveMatrix();

		let cnv = img.canvas || img,
			w = cnv.width,
			h = cnv.height,
			pd = img._pixelDensity || 1,
			makeFrame = img._isGraphics && img._drawStack?.length;

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

		let [l, r, t, b] = calcBox(dx, dy, dw, dh, _imageMode);

		let u0 = sx / w,
			v0 = sy / h,
			u1 = (sx + sw) / w,
			v1 = (sy + sh) / h;

		let ti = matrixIdx,
			ci = tintIdx,
			ia = globalAlpha;

		addImgVert(l, t, u0, v0, ci, ti, ia);
		addImgVert(r, t, u1, v0, ci, ti, ia);
		addImgVert(l, b, u0, v1, ci, ti, ia);
		addImgVert(r, b, u1, v1, ci, ti, ia);

		if (!isVideo) {
			drawStack.push(imagePL, img._texture.index);

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

			drawStack.push(videoPL, $._textureBindGroups.length - 1);

			if (img.flipped) $.scale(-1, 1);
		}
	};

	/* TEXT */

	let textPL = 4;

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
	return ((vec2f(quad[i].x, quad[i].y * q.yUp) * fontChar.size + char.xy + fontChar.offset) * text.scale) + text.pos;
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
		bindGroupLayouts: [mainLayout, fontBindGroupLayout, textBindGroupLayout]
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

	let fontsArr = [];
	let fonts = {};
	let fontSet;

	async function createFont(url, fontName, cb) {
		let baseUrl = url.substring(0, url.lastIndexOf('-'));

		// load atlas and image in parallel
		let atlas, img;
		try {
			[atlas, img] = await Promise.all([
				fetch(url).then((res) => {
					if (res.status == 404) throw new Error('404');
					return res.json();
				}),
				fetch(baseUrl + '.png')
					.then((res) => res.blob())
					.then((blob) => createImageBitmap(blob))
			]);
		} catch (error) {
			console.error('Error loading font:', error);
			return '';
		}

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
			atlas.chars = Q5.CSV.parse(atlas.chars, ' ');
			atlas.kernings = Q5.CSV.parse(atlas.kernings, ' ');
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
			fontChars[o + 7] = -char.yoffset * yDir; // offset.y
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

		let _font = new MsdfFont(fontBindGroup, atlas.common.lineHeight, chars, kernings);
		_font.index = fontsArr.length;
		fontsArr.push(_font);
		fonts[fontName] = _font;
		$._font = _font;

		if (cb) cb(fontName);
		return { family: fontName };
	}

	$.loadFont = (url = 'sans-serif', cb) => {
		fontSet = true;
		if (url.startsWith('https://fonts.googleapis.com/css')) {
			return $._g.loadFont(url, cb);
		}

		let ext = url.slice(url.lastIndexOf('.') + 1);

		// if not a url, assume it's one of q5's MSDF fonts
		if (url == ext) {
			let fontName = url;
			fonts[fontName] = null;
			url = `https://q5js.org/fonts/${fontName}-msdf.json`;
			if (Q5.online == false || !navigator.onLine) {
				url = `/node_modules/q5/builtinFonts/${fontName}-msdf.json`;
			}
			ext = 'json';
		}

		if (ext != 'json') return $._g.loadFont(url, cb);

		let fontName = url.slice(url.lastIndexOf('/') + 1, url.lastIndexOf('-'));
		let f = { family: fontName };
		f.promise = createFont(url, fontName, () => {
			delete f.then;
			if (f._usedAwait) f = { family: fontName };
			if (cb) cb(f);
		});
		$._loaders.push(f.promise);

		f.then = (resolve, reject) => {
			f._usedAwait = true;
			return f.promise.then(resolve, reject);
		};
		return f;
	};

	let _textSize = 18,
		_textAlign = 'left',
		_textStyle = 'normal',
		_textBaseline = 'alphabetic',
		leadingSet = false,
		_textLeading = 22.5,
		leadDiff = 4.5,
		leadPercent = 1.25;

	let categories = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];

	$.textFont = (fontName) => {
		if (!fontName) return $._font;
		fontSet = true;
		if (typeof fontName != 'string') fontName = fontName.family;
		let font = fonts[fontName];
		if (font) $._font = font;
		// if it's a font category or not a WebGPU font, set the Canvas2D font
		else if (categories[fontName] || font === undefined) $._g.textFont(fontName);
	};

	$.textSize = (size) => {
		if (!$._font) $._g.textSize(size);
		if (size == undefined) return _textSize;
		_textSize = size;
		if (!leadingSet) {
			_textLeading = size * leadPercent;
			leadDiff = _textLeading - size;
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
	let textEdge = 0.5;

	$.textWeight = (weight) => {
		if (!weight) return $._textWeight;
		if (typeof weight == 'string') {
			weight = weights[weight.toLowerCase().replace(/[ _-]/g, '')];
			if (!weight) throw new Error(`Invalid font weight: ${weight}`);
		}
		textEdge = 0.6875 - weight * 0.000375;
	};

	$.textLeading = (lineHeight) => {
		if (!$._font) return $._g.textLeading(lineHeight);
		if (!lineHeight) return _textLeading;
		$._font.lineHeight = _textLeading = lineHeight;
		leadDiff = _textLeading - _textSize;
		leadPercent = _textLeading / _textSize;
		leadingSet = true;
	};

	$.textAlign = (horiz, vert) => {
		if (!horiz) return { horizontal: _textAlign, vertical: _textBaseline };
		_textAlign = horiz;
		if (vert) _textBaseline = vert[0] == 'c' ? 'middle' : vert;
	};

	$.textStyle = (style) => {
		_textStyle = style;
	};

	let charStack = [],
		textStack = [];

	// Reusable array for line widths to avoid GC
	let lineWidths = new Array(100);

	// Reusable buffers for text data to avoid GC
	let charDataBuffer = new Float32Array(Q5.MAX_CHARS * 4); // reusable buffer for char data
	let textDataBuffer = new Float32Array(Q5.MAX_TEXTS * 8); // reusable buffer for text metadata

	let measureText = (font, text, charCallback) => {
		let maxWidth = 0,
			offsetX = 0,
			offsetY = 0,
			line = 0,
			printedCharCount = 0,
			nextCharCode = text.charCodeAt(0);

		for (let i = 0; i < text.length; ++i) {
			let charCode = nextCharCode;
			nextCharCode = i < text.length - 1 ? text.charCodeAt(i + 1) : -1;
			switch (charCode) {
				case 10: // newline
					lineWidths[line] = offsetX;
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
		lineWidths[line] = offsetX;
		maxWidth = Math.max(maxWidth, offsetX);
		let lineCount = line + 1;
		return {
			width: maxWidth,
			height: lineCount * font.lineHeight * leadPercent,
			lineWidths,
			lineCount,
			printedCharCount
		};
	};

	$.text = (str, x, y, w, h) => {
		if (_textSize * _scale < 1) return;

		let type = typeof str;
		if (type != 'string') {
			if (type == 'object') str = str.toString();
			else str = str + '';
		} else if (!str.length) return;

		// if not using an MSDF font
		if (!$._font) {
			// if no font is set, lazy load the default MSDF font
			if (!fontSet) $.loadFont();
			// use Canvas2D text rendering
			let img = $.createTextImage(str, w, h);
			return $.textImage(img, x, y);
		}

		let hasNewline;

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
			hasNewline = true;
		}

		hasNewline ??= str.includes('\n');

		let charsData = [];

		let ta = _textAlign,
			tb = _textBaseline,
			textIndex = textStack.length,
			o = 0, // offset
			measurements;

		if (ta == 'left' && !hasNewline) {
			measurements = measureText($._font, str, (textX, textY, line, char) => {
				charsData[o] = textX;
				charsData[o + 1] = -textY;
				charsData[o + 2] = char.charIndex;
				charsData[o + 3] = textIndex;
				o += 4;
			});

			if (tb == 'alphabetic') y += _textSize * yDir;
			else if (tb == 'middle') y += _textSize * 0.5 * yDir;
			else if (tb == 'bottom') y += _textLeading * yDir;
		} else {
			// measure the text to get the line height before setting
			// the x position to properly align the text
			measurements = measureText($._font, str);

			let offsetY = 0;
			if (tb == 'alphabetic') y += _textSize * yDir;
			else if (tb == 'middle') offsetY = measurements.height * 0.5;
			else if (tb == 'bottom') offsetY = measurements.height;

			measureText($._font, str, (textX, textY, line, char) => {
				let offsetX = 0;
				if (ta == 'center') {
					offsetX = measurements.width * -0.5 - (measurements.width - measurements.lineWidths[line]) * -0.5;
				} else if (ta == 'right') {
					offsetX = -measurements.lineWidths[line];
				}
				charsData[o] = textX + offsetX;
				charsData[o + 1] = (textY + offsetY) * yDir;
				charsData[o + 2] = char.charIndex;
				charsData[o + 3] = textIndex;
				o += 4;
			});
		}
		charStack.push(charsData);

		let txt = [];

		if (matrixDirty) saveMatrix();

		txt[0] = x;
		txt[1] = y;
		txt[2] = _textSize / 42;
		txt[3] = matrixIdx;
		txt[4] = doFill && fillSet ? fillIdx : 1;
		txt[5] = strokeIdx;
		txt[6] = doStroke && strokeSet ? sw : 0;
		txt[7] = textEdge;

		textStack.push(txt);
		drawStack.push(textPL, measurements.printedCharCount, $._font.index);
	};

	$.textWidth = (str) => {
		if (!$._font) {
			$._g.textSize(_textSize);
			return $._g.textWidth(str);
		}
		return (measureText($._font, str).width * _textSize) / 42;
	};

	$.textAscent = (str) => {
		if (!$._font) {
			$._g.textSize(_textSize);
			return $._g.textAscent(str);
		}
		return _textLeading - leadDiff;
	};

	$.textDescent = (str) => {
		if (!$._font) {
			$._g.textSize(_textSize);
			return $._g.textDescent(str);
		}
		return leadDiff;
	};

	$._applyTextStylesToC2D = () => {
		if (!doFill) $._g.noFill();
		else if (fillSet) {
			let fi = fillIdx * 4;
			$._g.fill(colorStack.slice(fi, fi + 4));
		}

		if (!doStroke) $._g.noStroke();
		else if (strokeSet) {
			let si = strokeIdx * 4;
			$._g.stroke(colorStack.slice(si, si + 4));
		}

		if (sw != $._g._strokeWeight) $._g.strokeWeight(sw);
		if (_textSize != $._g._textSize) $._g.textSize(_textSize);
		if (_textStyle != $._g._textStyle) $._g.textStyle(_textStyle);
		if (_textLeading != $._g.textLeading()) $._g.textLeading(_textLeading);
		$._g.textAlign(_textAlign, _textBaseline);
	};

	$.createTextImage = (str, w, h) => {
		$._applyTextStylesToC2D();

		let g = $._g.createTextImage(str, w, h);
		$._makeDrawable(g);
		return g;
	};

	$.textImage = (img, x, y) => {
		if (typeof img == 'string') img = $.createTextImage(img);

		let og = _imageMode;
		_imageMode = 'corner';

		let ta = _textAlign;
		if (ta == 'center') x -= img.canvas.hw;
		else if (ta == 'right') x -= img.width;

		let bl = _textBaseline;
		if (bl == 'alphabetic') y += img._leading * yDir;
		else if (bl == 'middle') y += img._middle * yDir;
		else if (bl == 'bottom') y += img._bottom * yDir;
		else if (bl == 'top') y += img._top * yDir;

		$.image(img, x, y);
		_imageMode = og;
	};

	$.textToPoints = (str, x, y, sampleRate, density) => {
		$._applyTextStylesToC2D();
		return $._g.textToPoints(str, x, y, sampleRate, density);
	};

	/* SHADERS */

	let pipelineTypes = ['frame', 'shapes', 'image', 'video', 'text'];

	let plCounters = {
		frame: 10,
		shapes: 1000,
		image: 2000,
		video: 3000,
		text: 4000
	};

	$._createPipeline = (opt) => {
		if (typeof opt == 'string') opt = { shader: opt };

		let { label, shader = '', topology = 'triangle-list', cullMode = 'none', blend = 'source-over' } = opt;

		let module;
		if (opt.module) module = opt.module;
		else {
			module = Q5.device.createShaderModule({
				label: label + 'Shader',
				code: $._baseShaderCode + shader
			});
		}

		// Handle optional custom data buffer and its bind group layout
		let layout = opt.layout;
		let _dataBuffer = null;
		let _dataBindLayout = null;
		let _dataBindGroup = null;
		if (opt.data) {
			_dataBuffer = Q5.device.createBuffer({
				size: opt.data.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
			});
			_dataBindLayout = Q5.device.createBindGroupLayout({
				entries: [
					{
						binding: 0,
						visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
						buffer: { type: 'read-only-storage' }
					}
				]
			});
			_dataBindGroup = Q5.device.createBindGroup({
				layout: _dataBindLayout,
				entries: [{ binding: 0, resource: { buffer: _dataBuffer } }]
			});
			$._buffers.push(_dataBuffer);
		}

		if (!layout) {
			if (_dataBindLayout) {
				layout = Q5.device.createPipelineLayout({
					bindGroupLayouts: [mainLayout, _dataBindLayout]
				});
			} else {
				layout = Q5.device.createPipelineLayout({
					bindGroupLayouts: [mainLayout]
				});
			}
		}

		let pipelineConfig = {
			label: label + 'Pipeline',
			layout,
			vertex: {
				module,
				entryPoint: 'vertexMain'
			},
			fragment: {
				module,
				entryPoint: 'fragMain',
				targets: [
					{
						format: 'bgra8unorm',
						blend: $.blendConfigs[blend]
					}
				]
			},
			primitive: {
				topology,
				cullMode
			},
			multisample: { count: 4 }
		};

		let id = $._pipelines.length;
		$._pipelineConfigs[id] = pipelineConfig;
		$._pipelines[id] = Q5.device.createRenderPipeline(pipelineConfig);

		// If we created a data buffer/bind group, register a bind handler
		if (_dataBindGroup) {
			$._customBindHandlers[id] = (pass) => {
				Q5.device.queue.writeBuffer(_dataBuffer, 0, opt.data);
				pass.setBindGroup(1, _dataBindGroup);
			};
		}

		return id;
	};

	$.createShader = (code, type = 'shapes', options = {}) => {
		code = code.trim();

		// create custom shader
		if (!pipelineTypes.includes(type)) {
			if (options instanceof Float32Array) options = { data: options };
			options.shader = code;
			options.label = type;

			let id = $._createPipeline(options);

			let shader = $._pipelineConfigs[id].vertex.module;
			shader.type = type;
			shader.pipelineIndex = id;
			$._customDrawHandlers[id] ??= (pass, count) => {
				pass.draw(count, 1, 0, 0);
			};
			return shader;
		}

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

	$.createShapesShader = $.createShader;
	$.createFrameShader = (code) => $.createShader(code, 'frame');
	$.createImageShader = (code) => $.createShader(code, 'image');
	$.createVideoShader = (code) => $.createShader(code, 'video');
	$.createTextShader = (code) => $.createShader(code, 'text');

	$.shader = (shader) => {
		let type = shader.type;
		let idx = shader.pipelineIndex;

		if (type == 'frame') {
			if (shader.applyBeforeDraw) prevFramePL = idx;
			else framePL = idx;
		} else if (type == 'shapes') shapesPL = idx;
		else if (type == 'image') imagePL = idx;
		else if (type == 'video') videoPL = idx;
		else if (type == 'text') textPL = idx;
	};

	$.resetShader = $.resetShapesShader = () => (shapesPL = 1);
	$.resetFrameShader = () => (prevFramePL = framePL = 0);
	$.resetImageShader = () => (imagePL = 2);
	$.resetVideoShader = () => (videoPL = 3);
	$.resetTextShader = () => (textPL = 4);

	$.resetShaders = () => {
		prevFramePL = framePL = 0;
		shapesPL = 1;
		imagePL = 2;
		videoPL = 3;
		textPL = 4;
	};

	const _remove = $.remove;
	$.remove = () => {
		$._frameA?.destroy();
		$._frameB?.destroy();
		uniformBuffer?.destroy();
		transformsBuffer?.destroy();
		colorsBuffer?.destroy();
		shapesVertBuff?.destroy();
		imgVertBuff?.destroy();
		charBuffer?.destroy();
		textBuffer?.destroy();
		rectBuffer?.destroy();
		rectIndexBuffer?.destroy();
		ellipseBuffer?.destroy();
		ellipseIndexBuffer?.destroy();

		for (let b of $._buffers) b.destroy();
		$._buffers = [];

		_remove();
	};
};

Q5.THRESHOLD = 1;
Q5.GRAY = 2;
Q5.OPAQUE = 3;
Q5.INVERT = 4;
Q5.POSTERIZE = 5;
Q5.DILATE = 6;
Q5.ERODE = 7;
Q5.BLUR = 8;

Q5.MAX_TRANSFORMS = 2097152;
Q5.MAX_RECTS = 200200;
Q5.MAX_ELLIPSES = 200200;
Q5.MAX_CHARS = 100000;
Q5.MAX_TEXTS = 10000;

Q5.initWebGPU = async () => {
	if (!navigator.gpu) {
		console.warn('q5 WebGPU not supported on this browser! Use Google Chrome or Edge.');
		return;
	}

	// fn can only be called once
	if (Q5.requestedGPU) return;
	Q5.requestedGPU = true;

	let adapter = await navigator.gpu.requestAdapter();

	adapter ??= await navigator.gpu.requestAdapter({
		featureLevel: 'compatibility'
	});

	if (!adapter) {
		console.warn('q5 WebGPU could not start! No appropriate GPUAdapter found, Vulkan may need to be enabled.');
		return;
	}

	let device = await adapter.requestDevice();

	const vertexStorageLimit =
		device.limits.maxStorageBuffersInVertexStage ?? device.limits.maxStorageBuffersPerShaderStage;
	if (vertexStorageLimit < 3) {
		console.warn('q5 WebGPU requires vertex storage buffers, which are not supported by this device.');
		return;
	}

	// Update to fit device limits
	const maxStorage = device.limits.maxStorageBufferBindingSize;

	let min = Math.min,
		floor = Math.floor;

	Q5.MAX_TRANSFORMS = min(Q5.MAX_TRANSFORMS, floor(maxStorage / 64));
	Q5.MAX_RECTS = min(Q5.MAX_RECTS, floor(maxStorage / 64));
	Q5.MAX_ELLIPSES = min(Q5.MAX_ELLIPSES, floor(maxStorage / 64));
	Q5.MAX_CHARS = min(Q5.MAX_CHARS, floor(maxStorage / 16));
	Q5.MAX_TEXTS = min(Q5.MAX_TEXTS, floor(maxStorage / 32));

	device.lost.then((e) => {
		console.error('WebGPU crashed!');
		console.error(e);
	});

	Q5.device = device;

	return true;
};

Q5.WebGPU = async function (scope, parent) {
	if (!scope || scope == 'global') Q5._hasGlobal = true;
	let q;
	if (!(await Q5.initWebGPU())) {
		q = new Q5(scope, parent, 'webgpu-fallback');
	}
	q = new Q5(scope, parent, 'webgpu');
	await q.ready;
	return q;
};
const supportedLangs = ['es'];

const libLangs = `
# core
Canvas -> es:Lienzo
createCanvas -> es:crearLienzo
log -> es:log

# color
background -> es:fondo ja:背景
fill -> es:relleno
stroke -> es:trazo
noFill -> es:sinRelleno
noStroke -> es:sinTrazo
color -> es:color
colorMode -> es:modoColor

# display
windowWidth -> es:anchoVentana
windowHeight -> es:altoVentana
width -> es:ancho
height -> es:alto
frameCount ->  es:cuadroActual
noLoop -> es:pausar
redraw -> es:redibujar
loop -> es:reanudar
frameRate -> es:frecuenciaRefresco
getTargetFrameRate -> es:obtenerTasaFotogramasObjetivo
getFPS -> es:obtenerFPS
deltaTime -> es:deltaTiempo
pixelDensity -> es:densidadPíxeles
displayDensity -> es:densidadVisualización
fullscreen -> es:pantallaCompleta
displayMode -> es:modoVisualización
halfWidth -> es:medioAncho
halfHeight -> es:medioAlto
canvas -> es:lienzo
resizeCanvas -> es:redimensionarLienzo
drawingContext -> es:contextoDibujo

# shape
circle -> es:círculo
ellipse -> es:elipse
rect -> es:rect
square -> es:cuadrado
point -> es:punto
line -> es:línea
capsule -> es:cápsula
rectMode -> es:modoRect
ellipseMode -> es:modoEliptico
arc -> es:arco
curve -> es:curva
beginShape -> es:empezarForma
endShape -> es:terminarForma
vertex -> es:vértice
bezier -> es:bezier
triangle -> es:triángulo
quad -> es:quad
curveDetail -> es:detalleCurva
beginContour -> es:empezarContorno
endContour -> es:terminarContorno
bezierVertex -> es:vérticeBezier
quadraticVertex -> es:vérticeCuadrático

# image
loadImage -> es:cargarImagen
image -> es:imagen
imageMode -> es:modoImagen
noTint -> es:noTeñir
tint -> es:teñir
filter -> es:filtro
createImage -> es:crearImagen
createGraphics -> es:crearGráficos
defaultImageScale -> es:escalaImagenPorDefecto
resize -> es:redimensionar
trim -> es:recortar
smooth -> es:suavizar
noSmooth -> es:noSuavizar
mask -> es:enmascarar
copy -> es:copiar
inset -> es:insertado
get -> es:obtener
set -> es:establecer
pixels -> es:píxeles
loadPixels -> es:cargarPíxeles
updatePixels -> es:actualizarPíxeles

# text
text -> es:texto
loadFont -> es:cargarFuente
textFont -> es:fuenteTexto
textSize -> es:tamañoTexto
textLeading -> es:interlineado
textStyle -> es:estiloTexto
textAlign -> es:alineaciónTexto
textWidth -> es:anchoTexto
textWeight -> es:pesoTexto
textAscent -> es:ascensoTexto
textDescent -> es:descensoTexto
createTextImage -> es:crearImagenTexto
textImage -> es:imagenTexto
nf -> es:nf

# input
mouseX -> es:ratónX
mouseY -> es:ratónY
pmouseX -> es:pRatónX
pmouseY -> es:pRatónY
mouseIsPressed -> es:ratónPresionado
mouseButton -> es:botónRatón
key -> es:tecla
keyIsPressed -> es:teclaPresionada
keyIsDown -> es:teclaEstaPresionada
touches -> es:toques
pointers -> es:punteros
cursor -> es:cursor
noCursor -> es:sinCursor
movedX -> es:movidoX
movedY -> es:movidoY
pointerLock -> es:bloqueoPuntero

# style
strokeWeight -> es:grosorTrazo
opacity -> es:opacidad
shadow -> es:sombra
noShadow -> es:sinSombra
shadowBox -> es:cajaSombra
blendMode -> es:modoMezcla
strokeCap -> es:terminaciónTrazo
strokeJoin -> es:uniónTrazo
erase -> es:borrar
noErase -> es:noBorrar
clear -> es:limpiar
pushStyles -> es:guardarEstilos
popStyles -> es:recuperarEstilos
inFill -> es:enRelleno
inStroke -> es:enTrazo

# transform
translate -> es:trasladar
rotate -> es:rotar
scale -> es:escalar
shearX -> es:cizallarX
shearY -> es:cizallarY
applyMatrix -> es:aplicarMatriz
resetMatrix -> es:reiniciarMatriz
push -> es:apilar
pop -> es:desapilar
pushMatrix -> es:guardarMatriz
popMatrix -> es:recuperarMatriz

# math
random -> es:aleatorio
noise -> es:ruido
dist -> es:dist
map -> es:mapa
angleMode -> es:modoÁngulo
radians -> es:radianes
degrees -> es:grados
lerp -> es:interpolar
constrain -> es:constreñir
norm -> es:norm
abs -> es:abs
round -> es:redondear
ceil -> es:techo
floor -> es:piso
min -> es:min
max -> es:max
pow -> es:pot
sq -> es:cuad
sqrt -> es:raiz
exp -> es:exp
randomSeed -> es:semillaAleatoria
randomGaussian -> es:aleatorioGaussiano
noiseMode -> es:modoRuido
noiseSeed -> es:semillaRuido
noiseDetail -> es:detalleRuido
jit -> es:flu
randomGenerator -> es:generadorAleatorio
randomExponential -> es:aleatorioExponencial

# sound
loadSound -> es:cargarSonido
loadAudio -> es:cargarAudio
getAudioContext -> es:obtenerContextoAudio
userStartAudio -> es:iniciarAudioUsuario

# dom
createElement -> es:crearElemento
createA -> es:crearA
createButton -> es:crearBotón
createCheckbox -> es:crearCasilla
createColorPicker -> es:crearSelectorColor
createImg -> es:crearImg
createInput -> es:crearEntrada
createP -> es:crearP
createRadio -> es:crearOpciónes
createSelect -> es:crearSelección
createSlider -> es:crearDeslizador
createVideo -> es:crearVideo
createCapture -> es:crearCaptura
findElement -> es:encontrarElemento
findElements -> es:encontrarElementos

# record
createRecorder -> es:crearGrabadora
record -> es:grabar
pauseRecording -> es:pausarGrabación
deleteRecording -> es:borrarGrabación
saveRecording -> es:guardarGrabación
recording -> es:grabando

# io
load -> es:cargar
save -> es:guardar
loadJSON -> es:cargarJSON
loadStrings -> es:cargarTexto
year -> es:año
day -> es:día
hour -> es:hora
minute -> es:minuto
second -> es:segundo
loadCSV -> es:cargarCSV
loadXML -> es:cargarXML
loadAll -> es:cargarTodo
disablePreload -> es:deshabilitarPrecarga
shuffle -> es:barajar
storeItem -> es:guardarItem
getItem -> es:obtenerItem
removeItem -> es:eliminarItem
clearStorage -> es:limpiarAlmacenamiento

# shaders
createShader -> es:crearShader
plane -> es:plano
shader -> es:shader
resetShader -> es:reiniciarShader
resetFrameShader -> es:reiniciarShaderFotograma
resetImageShader -> es:reiniciarShaderImagen
resetVideoShader -> es:reiniciarShaderVideo
resetTextShader -> es:reiniciarShaderTexto
resetShaders -> es:reiniciarShaders
createFrameShader -> es:crearShaderFotograma
createImageShader -> es:crearShaderImagen
createVideoShader -> es:crearShaderVideo
createTextShader -> es:crearShaderTexto

# constants
CORNER -> es:ESQUINA
RADIUS -> es:RADIO
CORNERS -> es:ESQUINAS
THRESHOLD -> es:UMBRAL
GRAY -> es:GRIS
OPAQUE -> es:OPACO
INVERT -> es:INVERTIR
POSTERIZE -> es:POSTERIZAR
DILATE -> es:DILATAR
ERODE -> es:EROSIONAR
BLUR -> es:DESENFOCAR
NORMAL -> es:NORMAL
ITALIC -> es:CURSIVA
BOLD -> es:NEGRILLA
BOLDITALIC -> es:NEGRILLA_CURSIVA
LEFT -> es:IZQUIERDA
CENTER -> es:CENTRO
RIGHT -> es:DERECHA
TOP -> es:ARRIBA
BOTTOM -> es:ABAJO
BASELINE -> es:LINEA_BASE
MIDDLE -> es:MEDIO
RGB -> es:RGB
OKLCH -> es:OKLCH
HSL -> es:HSL
HSB -> es:HSB
SRGB -> es:SRGB
DISPLAY_P3 -> es:DISPLAY_P3
MAXED -> es:MAXIMIZADO
SMOOTH -> es:SUAVE
PIXELATED -> es:PIXELADO
TWO_PI -> es:DOS_PI
HALF_PI -> es:MEDIO_PI
QUARTER_PI -> es:CUARTO_PI

# vector
createVector -> es:crearVector
`;

const userLangs = `
update -> es:actualizar
draw -> es:dibujar
postProcess -> es:postProcesar
mousePressed -> es:alPresionarRatón
mouseReleased -> es:alSoltarRatón
mouseMoved -> es:alMoverRatón
mouseDragged -> es:alArrastrarRatón
doubleClicked -> es:dobleClic
keyPressed -> es:alPresionarTecla
keyReleased -> es:alSoltarTecla
touchStarted -> es:alEmpezarToque
touchEnded -> es:alTerminarToque
touchMoved -> es:alMoverToque
mouseWheel -> es:ruedaRatón
`;

const classLangs = {
	Q5: `
Image -> es:Imagen
version -> es:versión
disableFriendlyErrors -> es:deshabilitarErroresAmigables
errorTolerant -> es:toleranteErrores
supportsHDR -> es:soportaHDR
canvasOptions -> es:opcionesLienzo
MAX_ELLIPSES -> es:MAX_ELIPSES
MAX_TRANSFORMS -> es:MAX_TRANSFORMACIONES
MAX_CHARS -> es:MAX_CARACTERES
MAX_TEXTS -> es:MAX_TEXTOS
`,
	Vector: `
add -> es:sumar
sub -> es:restar
mult -> es:multiplicar
div -> es:dividir
mag -> es:magnitud
magSq -> es:magnitudCuad
dist -> es:distancia
normalize -> es:normalizar
limit -> es:limitar
setMag -> es:establecerMagnitud
heading -> es:rumbo
rotate -> es:rotar
lerp -> es:interpolar
array -> es:arreglo
copy -> es:copiar
dot -> es:punto
cross -> es:cruz
angleBetween -> es:anguloEntre
reflect -> es:reflejar
`,
	Sound: `
load -> es:cargar
play -> es:reproducir
stop -> es:parar
pause -> es:pausar
loop -> es:bucle
setVolume -> es:establecerVolumen
setPan -> es:establecerPan
setLoop -> es:establecerBucle
isLoaded -> es:estaCargado
isPlaying -> es:estaReproduciendo
isPaused -> es:estaPausado
isLooping -> es:estaEnBucle
onended -> es:alTerminar
`
};

const parseLangs = function (data, lang) {
	let map = {};
	for (let l of data.split('\n')) {
		let i = l.indexOf(' ' + lang + ':');
		if (i > 0 && l[0] != '#') {
			map[l.split(' ')[0]] = l.slice(i + 4).split(' ')[0];
		}
	}
	return map;
};

Object.defineProperty(Q5, 'lang', {
	get: () => Q5._lang,
	set: (val) => {
		if (val == Q5._lang) return;

		Q5._lang = val;

		if (val == 'en') {
			// reset to English only user functions
			Q5._userFns = Q5._userFns.slice(0, 19);
			Q5._libMap = Q5._userFnsMap = {};
			return;
		}

		for (let className in classLangs) {
			let target = className == 'Q5' ? Q5 : Q5[className] ? Q5[className].prototype : null;
			if (target) {
				let map = parseLangs(classLangs[className], val);
				for (let name in map) {
					let translatedName = map[name];
					if (target.hasOwnProperty(translatedName)) continue;
					Object.defineProperty(target, translatedName, {
						get: function () {
							return this[name];
						},
						set: function (v) {
							this[name] = v;
						}
					});
				}
			}
		}

		Q5._libMap = parseLangs(libLangs, val);
		Q5._userFnsMap = parseLangs(userLangs, val);
		Q5._userFns.push(...Object.values(Q5._userFnsMap));
	}
});

Q5.lang = 'en';

for (let l of supportedLangs) {
	if (typeof window == 'object') {
		let secondNL = libLangs.indexOf('\n', libLangs.indexOf('\n', 8) + 1);
		let m = parseLangs(libLangs.slice(0, secondNL), l);
		window[m.createCanvas] = window[m.Canvas] = function () {
			Q5.lang = l;
			return window.Canvas(...arguments);
		};
	}

	let userFnsMap = parseLangs(userLangs, l);

	for (let name in userFnsMap) {
		let translatedName = userFnsMap[name];
		if (Q5.hasOwnProperty(translatedName)) continue;
		Object.defineProperty(Q5, translatedName, {
			get: () => Q5[name],
			set: (fn) => {
				Q5.lang = l;
				Q5[name] = fn;
			}
		});
	}
}

Q5.modules.lang = ($) => {
	let userFnsMap = Q5._userFnsMap;

	for (let name in userFnsMap) {
		let translatedName = userFnsMap[name];
		Object.defineProperty($, translatedName, {
			get: () => $[name],
			set: (fn) => ($[name] = fn)
		});
	}

	let m = Q5._libMap;

	if (m.Canvas) $[m.createCanvas] = $[m.Canvas] = $.Canvas;
};

Q5.addHook('init', (q) => {
	let m = Q5._libMap;

	for (let name in m) {
		let translatedName = m[name];
		q[translatedName] = q[name];
	}
});

Q5.addHook('predraw', (q) => {
	let m = Q5._libMap;

	if (!m.mouseX) return;

	let props = [
		'frameCount',
		'mouseX',
		'mouseY',
		'movedX',
		'movedY',
		'mouseIsPressed',
		'mouseButton',
		'key',
		'keyIsPressed',
		'touches',
		'pointers'
	];

	// sync properties
	for (let p of props) {
		if (m[p]) q[m[p]] = q[p];
	}
});
