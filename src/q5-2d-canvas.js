Q5.modules.q2d_canvas = ($, p) => {
	let _OffscreenCanvas =
		window.OffscreenCanvas ||
		function () {
			return document.createElement('canvas');
		};

	if (Q5._nodejs) {
		if (Q5._createNodeJSCanvas) {
			p.canvas = Q5._createNodeJSCanvas(100, 100);
		}
	} else if ($._scope == 'image' || $._scope == 'graphics') {
		p.canvas = new _OffscreenCanvas(100, 100);
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
					if ($._adjustDisplay) $._adjustDisplay();
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

	$._defaultStyle = () => {
		$.ctx.fillStyle = 'white';
		$.ctx.strokeStyle = 'black';
		$.ctx.lineCap = 'round';
		$.ctx.lineJoin = 'miter';
		$.ctx.textAlign = 'left';
	};

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
		$._da = 0;
		c.renderer = '2d';
		let opt = Object.assign({}, Q5.canvasOptions);
		if (options) Object.assign(opt, options);

		p.ctx = p.drawingContext = c.getContext('2d', opt);
		Object.assign(c, opt);
		if ($._colorMode == 'rgb') $.colorMode('rgb');
		$._defaultStyle();
		$.ctx.save();
		if ($._scope != 'image') {
			let pd = $.displayDensity();
			if ($._scope == 'graphics') pd = this._pixelDensity;
			$.pixelDensity(Math.ceil(pd));
		} else this._pixelDensity = 1;

		if ($.displayMode) $.displayMode();
		else $._adjustDisplay();
		return c;
	};
	$._createCanvas = $.createCanvas;

	if ($._scope == 'image') return;

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
		c.width = Math.ceil(w * $._pixelDensity);
		c.height = Math.ceil(h * $._pixelDensity);
		c.w = w;
		c.h = h;
		c.hw = w / 2;
		c.hh = h / 2;
		for (let prop in t) $.ctx[prop] = t[prop];
		$.ctx.scale($._pixelDensity, $._pixelDensity);

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
		_resizeCanvas(c.w, c.h);
		return v;
	};

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

	if (window && $._scope != 'graphics') {
		window.addEventListener('resize', () => {
			$._shouldResize = true;
			p.windowWidth = window.innerWidth;
			p.windowHeight = window.innerHeight;
			p.deviceOrientation = window.screen?.orientation?.type;
			if (!$._loop) $.redraw();
		});
	}
};

Q5.canvasOptions = {
	alpha: false,
	desynchronized: false,
	colorSpace: 'display-p3',
	willReadFrequently: true
};

if (!window.matchMedia || !matchMedia('(dynamic-range: high) and (color-gamut: p3)').matches) {
	Q5.canvasOptions.colorSpace = 'srgb';
} else Q5.supportsHDR = true;
