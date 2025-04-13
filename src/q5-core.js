/**
 * q5.js
 * @version 2.27
 * @author quinton-ashley
 * @contributors evanalulu, Tezumie, ormaq, Dukemz, LingDong-
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
			if (useRAF && window.cancelAnimationFrame) cancelAnimationFrame(looper);
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
				if (useRAF && window.cancelAnimationFrame) cancelAnimationFrame(looper);
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
		$._lastFrameTime = performance.now() - 15;
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
