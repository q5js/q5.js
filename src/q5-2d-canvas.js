Q5.modules.q2d_canvas = ($) => {
	let _OffscreenCanvas =
		window.OffscreenCanvas ||
		function () {
			return document.createElement('canvas');
		};

	if (Q5._nodejs) {
		if (Q5._createNodeJSCanvas) {
			$.canvas = Q5._createNodeJSCanvas(100, 100);
		}
	} else if ($._scope == 'image' || $._scope == 'graphics') {
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

	if ($.canvas && $._scope != 'graphics' && $._scope != 'image') {
		$._setupDone = false;
		$._resize = () => {
			if ($.frameCount > 1) $._shouldResize = true;
		};
		let parent = $._parent;
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

	$._defaultStyle = () => {
		$.ctx.fillStyle = 'white';
		$.ctx.strokeStyle = 'black';
		$.ctx.lineCap = 'round';
		$.ctx.lineJoin = 'miter';
		$.ctx.textAlign = 'left';
	};

	$.createCanvas = function (width, height, renderer, options) {
		if (renderer == 'webgl') throw Error(`webgl renderer is not supported in q5, use '2d'`);
		if (typeof renderer == 'object') options = renderer;
		$.width = $.canvas.width = width || window.innerWidth;
		$.height = $.canvas.height = height || window.innerHeight;
		$.da = false;
		$._dimensionUnit = 0;
		$.canvas.renderer = '2d';
		let opt = Object.assign({}, Q5.canvasOptions);
		if (options) Object.assign(opt, options);

		$.ctx = $.drawingContext = $.canvas.getContext('2d', opt);
		Object.assign($.canvas, opt);
		if ($._colorMode == 'rgb') $.colorMode('rgb');
		$._defaultStyle();
		$.ctx.save();
		if ($._scope != 'image') {
			let pd = $.displayDensity();
			if ($._scope == 'graphics') pd = this._pixelDensity;
			$.pixelDensity(Math.ceil(pd));
		} else this._pixelDensity = 1;
		return $.canvas;
	};
	$._createCanvas = $.createCanvas;

	if ($._scope == 'image') return;

	function cloneCtx() {
		let c = {};
		for (let prop in $.ctx) {
			if (typeof $.ctx[prop] != 'function') c[prop] = $.ctx[prop];
		}
		delete c.canvas;
		return c;
	}

	function _resizeCanvas(w, h) {
		w ??= window.innerWidth;
		h ??= window.innerHeight;
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
		$.ctx.scale($._pixelDensity, $._pixelDensity);
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

	$._pixelDensity = 1;
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

	$._sc = (coord) => {
		return ((coord / $._dimensionUnit) * $.canvas.width) / $._pixelDensity;
	};
	$.flexibleCanvas = (unit = 400) => {
		$._da = !!unit;
		if (unit) {
			$._dimensionUnit = unit;
			$._dimensionUnit = unit;
		}
	};
	// DRAWING MATRIX

	$.translate = (x, y) => {
		if ($._da) {
			x = $._sc(x);
			y = $._sc(y);
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
};

Q5.canvasOptions = {
	alpha: false,
	desynchronized: false,
	colorSpace: 'display-p3'
};

if (!window.matchMedia || !matchMedia('(dynamic-range: high) and (color-gamut: p3)').matches) {
	Q5.canvasOptions.colorSpace = 'srgb';
} else Q5.supportsHDR = true;
