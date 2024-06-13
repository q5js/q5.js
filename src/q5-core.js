/**
 * q5.js
 * @version 2.0-beta20
 * @author quinton-ashley, Tezumie, and LingDong-
 * @license LGPL-3.0
 */

/**
 * @class Q5
 */
function Q5(scope, parent) {
	let $ = this;
	$._q5 = true;
	$._scope = scope;
	$._parent = parent;
	$._preloadCount = 0;
	if (!scope) scope = 'global';
	if (scope == 'auto') {
		if (!(window.setup || window.draw)) return;
		else scope = 'global';
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

	$.ctx = $.drawingContext = null;
	$.canvas = null;
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
		firstVertex = true;
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
		if (scope != 'image' || Q5.imageModules.includes(m)) {
			Q5.modules[m]($, p);
		}
	}

	if (scope == 'image') return;

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

	for (let m of Q5.prototype._methods.init) m.call($);

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
					t[k]();
				} catch (e) {
					if ($._aiErrorAssistance) $._aiErrorAssistance(e);
					else console.error(e);
				}
			};
		}
	}

	$._isTouchAware = $.touchStarted || $.touchMoved || $.mouseReleased;

	if (!($.setup || $.draw)) return;

	$._startDone = false;

	function _start() {
		$._startDone = true;
		if ($._preloadCount > 0) return raf(_start);
		millisStart = performance.now();
		$.setup();
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
Q5.imageModules = ['q2d_canvas', 'q2d_image'];

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
else window = 0;

if (typeof document == 'object') {
	document.addEventListener('DOMContentLoaded', () => {
		if (!Q5._hasGlobal) new Q5('auto');
	});
}
