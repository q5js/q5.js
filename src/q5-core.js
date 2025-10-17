/**
 * q5.js
 * @version 3.5
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

	$._preloadPromises = [];
	$._usePreload = true;
	$.usePromiseLoading = (v = true) => ($._usePreload = !v);
	$.usePreloadSystem = (v = true) => ($._usePreload = v);
	$.isPreloadSupported = () => $._usePreload;

	const resolvers = [];
	$._incrementPreload = () => {
		$._preloadPromises.push(new Promise((resolve) => resolvers.push(resolve)));
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
		await runHooks('predraw');
		try {
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
		q.moveX = q.moveY = 0;
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
		$.canvas.remove();
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

	let userFns = [
		'preload',
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

	if ($._isGlobal) {
		for (let name of ['setup', 'update', 'draw', ...userFns]) {
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

		wrapWithFES('preload');
		$.preload();

		// wait for the user to define setup, update, or draw
		await Promise.race([
			new Promise((resolve) => {
				function checkUserFns() {
					if ($.setup || $.update || $.draw || t.setup || t.update || t.draw) {
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
					if (!$._preloadPromises.length) resolve();
				}, 500);
			})
		]);

		await Promise.all($._preloadPromises);
		if ($._g) await Promise.all($._g._preloadPromises);

		if (t.setup?.constructor.name == 'AsyncFunction') {
			$.usePromiseLoading();
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

	if (autoLoaded) start();
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

Q5.hooks = {
	init: [],
	presetup: [],
	postsetup: [],
	predraw: [],
	postdraw: [],
	remove: []
};

Q5.addHook = (name, fn) => Q5.hooks[name].push(fn);

// p5 v2 compat
Q5.registerAddon = (addon) => {
	let lifecycles = {};
	addon(Q5, Q5.prototype, lifecycles);
	for (let name in lifecycles) {
		Q5.hooks[name].push(lifecycles[name]);
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

function createCanvas(w, h, opt) {
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

if (Q5._server) global.p5 ??= global.Q5 = Q5;

if (typeof window == 'object') {
	window.p5 ??= window.Q5 = Q5;
	window.createCanvas = createCanvas;
	window.C2D = 'c2d';
	window.WEBGPU = 'webgpu';
} else global.window = 0;

Q5.version = Q5.VERSION = '3.5';

if (typeof document == 'object') {
	document.addEventListener('DOMContentLoaded', () => {
		if (!Q5._hasGlobal) {
			if (Q5.setup || Q5.update || Q5.draw) {
				Q5.WebGPU();
			} else {
				new Q5('auto');
			}
		}
	});
}
