Q5.modules.canvas = ($, q) => {
	$._OffscreenCanvas =
		window.OffscreenCanvas ||
		function () {
			return document.createElement('canvas');
		};

	if (Q5._nodejs) {
		if (Q5._createNodeJSCanvas) {
			q.canvas = Q5._createNodeJSCanvas(100, 100);
		}
	} else if ($._scope == 'image' || $._scope == 'graphics') {
		q.canvas = new $._OffscreenCanvas(100, 100);
	}

	if (!$.canvas) {
		if (typeof document == 'object') {
			q.canvas = document.createElement('canvas');
			$.canvas.id = 'q5Canvas' + Q5._instanceCount;
			$.canvas.classList.add('q5Canvas');
		} else $.noCanvas();
	}

	let c = $.canvas;
	c.width = $.width = 100;
	c.height = $.height = 100;
	if ($._scope != 'image') {
		c.renderer = $._renderer;
		c[$._renderer] = true;
	}
	$._pixelDensity = 1;

	$._adjustDisplay = () => {
		if (c.style) {
			c.style.width = c.w + 'px';
			c.style.height = c.h + 'px';
		}
	};

	$.createCanvas = function (w, h, options) {
		options ??= arguments[3];

		let opt = Object.assign({}, Q5.canvasOptions);
		if (typeof options == 'object') Object.assign(opt, options);

		if ($._scope != 'image') {
			let pd = $.displayDensity();
			if ($._scope == 'graphics') pd = this._pixelDensity;
			else if (window.IntersectionObserver) {
				new IntersectionObserver((e) => {
					c.visible = e[0].isIntersecting;
				}).observe(c);
			}
			$._pixelDensity = Math.ceil(pd);
		}

		$._setCanvasSize(w, h);

		Object.assign(c, opt);
		let rend = $._createCanvas(c.w, c.h, opt);

		if ($._hooks) {
			for (let m of $._hooks.postCanvas) m();
		}
		return rend;
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

	$._setCanvasSize = (w, h) => {
		w ??= window.innerWidth;
		h ??= window.innerHeight;
		c.w = w = Math.ceil(w);
		c.h = h = Math.ceil(h);
		c.hw = w / 2;
		c.hh = h / 2;
		c.width = Math.ceil(w * $._pixelDensity);
		c.height = Math.ceil(h * $._pixelDensity);

		if (!$._da) {
			q.width = w;
			q.height = h;
		} else $.flexibleCanvas($._dau);

		if ($.displayMode && !c.displayMode) $.displayMode();
		else $._adjustDisplay();
	};

	if ($._scope == 'image') return;

	if (c && $._scope != 'graphics') {
		c.parent = (el) => {
			if (c.parentElement) c.parentElement.removeChild(c);

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

	$.canvas.resize = $.resizeCanvas;
	$.canvas.save = $.saveCanvas = $.save;

	$.displayDensity = () => window.devicePixelRatio;
	$.pixelDensity = (v) => {
		if (!v || v == $._pixelDensity) return $._pixelDensity;
		$._pixelDensity = v;
		$._setCanvasSize(c.w, c.h);
		return v;
	};

	$.flexibleCanvas = (unit = 400) => {
		if (unit) {
			$._da = c.width / (unit * $._pixelDensity);
			q.width = $._dau = unit;
			q.height = (c.h / c.w) * unit;
		} else $._da = 0;
	};
};

Q5.canvasOptions = {
	alpha: false,
	colorSpace: 'display-p3'
};

if (!window.matchMedia || !matchMedia('(dynamic-range: high) and (color-gamut: p3)').matches) {
	Q5.canvasOptions.colorSpace = 'srgb';
} else Q5.supportsHDR = true;
