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
