Q5.renderers.q2d.image = ($, q) => {
	class Q5Image {
		constructor(w, h, opt) {
			let $ = this;
			$._scope = 'image';
			$.canvas = $.ctx = $.drawingContext = null;
			$.pixels = [];
			Q5.modules.canvas($, $);
			let r = Q5.renderers.q2d;
			for (let m of ['canvas', 'image', 'soft_filters']) {
				if (r[m]) r[m]($, $);
			}
			$._pixelDensity = opt.pixelDensity || 1;
			$.createCanvas(w, h, opt);
			delete $.createCanvas;
			$._loop = false;
		}
		get w() {
			return this.width;
		}
		get h() {
			return this.height;
		}
	}

	Q5.Image ??= Q5Image;

	$.createImage = (w, h, opt) => {
		opt ??= {};
		opt.alpha ??= true;
		opt.colorSpace ??= $.canvas.colorSpace || Q5.canvasOptions.colorSpace;
		let img = new Q5.Image(w, h, opt);
		img.defaultWidth = w * $._defaultImageScale;
		img.defaultHeight = h * $._defaultImageScale;
		return img;
	};

	$.loadImage = function (url, cb, opt) {
		if (url.canvas) return url;
		if (url.slice(-3).toLowerCase() == 'gif') {
			throw new Error(`q5 doesn't support GIFs due to their impact on performance. Use a video or animation instead.`);
		}
		q._preloadCount++;
		let last = [...arguments].at(-1);
		opt = typeof last == 'object' ? last : null;

		let g = $.createImage(1, 1, opt);
		let pd = (g._pixelDensity = opt?.pixelDensity || 1);

		function loaded(img) {
			g.defaultWidth = img.width * $._defaultImageScale;
			g.defaultHeight = img.height * $._defaultImageScale;
			g.naturalWidth = img.naturalWidth;
			g.naturalHeight = img.naturalHeight;
			g._setImageSize(Math.ceil(g.naturalWidth / pd), Math.ceil(g.naturalHeight / pd));

			g.ctx.drawImage(img, 0, 0);
			q._preloadCount--;
			if (cb) cb(g);
		}

		if (Q5._nodejs && global.CairoCanvas) {
			global.CairoCanvas.loadImage(url)
				.then(loaded)
				.catch((e) => {
					q._preloadCount--;
					throw e;
				});
		} else {
			let img = new window.Image();
			img.src = url;
			img.crossOrigin = 'Anonymous';
			img._pixelDensity = pd;
			img.onload = () => loaded(img);
			img.onerror = (e) => {
				q._preloadCount--;
				throw e;
			};
		}
		return g;
	};

	$.imageMode = (mode) => ($._imageMode = mode);
	$.image = (img, dx, dy, dw, dh, sx = 0, sy = 0, sw, sh) => {
		if (!img) return;
		let drawable = img?.canvas || img;
		if (Q5._createNodeJSCanvas) {
			drawable = drawable.context.canvas;
		}

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
		$.ctx.drawImage(drawable, sx * pd, sy * pd, sw, sh, dx, dy, dw, dh);

		if ($._tint) {
			$.ctx.globalCompositeOperation = 'multiply';
			$.ctx.fillStyle = $._tint.toString();
			$.ctx.fillRect(dx, dy, dw, dh);
			$.ctx.globalCompositeOperation = 'source-over';
		}
	};

	$._tint = null;
	let imgData = null;

	$._softFilter = () => {
		throw new Error('Load q5-2d-soft-filters.js to use software filters.');
	};

	$.filter = (type, x) => {
		if (!$.ctx.filter) return $._softFilter(type, x);

		if (typeof type == 'string') f = type;
		else if (type == Q5.GRAY) f = `saturate(0%)`;
		else if (type == Q5.INVERT) f = `invert(100%)`;
		else if (type == Q5.BLUR) {
			let r = Math.ceil(x * $._pixelDensity) || 1;
			f = `blur(${r}px)`;
		} else if (type == Q5.THRESHOLD) {
			x ??= 0.5;
			let b = Math.floor((0.5 / Math.max(x, 0.00001)) * 100);
			f = `saturate(0%) brightness(${b}%) contrast(1000000%)`;
		} else return $._softFilter(type, x);

		$.ctx.filter = f;
		$.ctx.drawImage($.canvas, 0, 0, $.canvas.w, $.canvas.h);
		$.ctx.filter = 'none';
	};

	if ($._scope == 'image') {
		$.resize = (w, h) => {
			let c = $.canvas;
			let o = new $._OffscreenCanvas(c.width, c.height);
			let tmpCtx = o.getContext('2d', {
				colorSpace: c.colorSpace
			});
			tmpCtx.drawImage(c, 0, 0);
			$._setImageSize(w, h);

			$.ctx.clearRect(0, 0, c.width, c.height);
			$.ctx.drawImage(o, 0, 0, c.width, c.height);
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
	};

	$.inset = (x, y, w, h, dx, dy, dw, dh) => {
		let pd = $._pixelDensity || 1;
		$.ctx.drawImage($.canvas, x * pd, y * pd, w * pd, h * pd, dx, dy, dw, dh);
	};

	$.copy = () => $.get();

	$.get = (x, y, w, h) => {
		let pd = $._pixelDensity || 1;
		if (x !== undefined && w === undefined) {
			let c = $._getImageData(x * pd, y * pd, 1, 1).data;
			return [c[0], c[1], c[2], c[3] / 255];
		}
		x = (x || 0) * pd;
		y = (y || 0) * pd;
		let _w = (w = w || $.width);
		let _h = (h = h || $.height);
		w *= pd;
		h *= pd;
		let img = $.createImage(w, h);
		img.ctx.drawImage($.canvas, x, y, w, h, 0, 0, w, h);
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
		if (imgData != null) $.ctx.putImageData(imgData, 0, 0);
	};

	$.smooth = () => ($.ctx.imageSmoothingEnabled = true);
	$.noSmooth = () => ($.ctx.imageSmoothingEnabled = false);

	if ($._scope == 'image') return;

	$.tint = function (c) {
		$._tint = c._q5Color ? c : $.color(...arguments);
	};
	$.noTint = () => ($._tint = null);
};

Q5.THRESHOLD = 1;
Q5.GRAY = 2;
Q5.OPAQUE = 3;
Q5.INVERT = 4;
Q5.POSTERIZE = 5;
Q5.DILATE = 6;
Q5.ERODE = 7;
Q5.BLUR = 8;
