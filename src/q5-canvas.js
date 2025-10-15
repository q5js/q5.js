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

	$.createCanvas = function (w, h, options) {
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

		$.canvas.ready = true;

		return rend;
	};

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
		q.halfWidth = c.hw = w / 2;
		q.halfHeight = c.hh = h / 2;

		// changes the actual size of the canvas
		c.width = Math.ceil(w * $._pixelDensity);
		c.height = Math.ceil(h * $._pixelDensity);

		q.width = w;
		q.height = h;

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
