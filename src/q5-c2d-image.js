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

	$.createImage = (w, h, opt) => {
		opt ??= {};
		opt.alpha ??= true;
		opt.colorSpace ??= c.colorSpace || Q5.canvasOptions.colorSpace;
		return new Q5.Image($, w, h, opt);
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
		} else opt = null;

		let g = $.createImage(1, 1, opt);
		let pd = g._pixelDensity;

		let img = new window.Image();
		img.crossOrigin = 'Anonymous';

		g.promise = new Promise((resolve, reject) => {
			img.onload = () => {
				img._pixelDensity = pd;
				g.defaultWidth = img.width * $._defaultImageScale;
				g.defaultHeight = img.height * $._defaultImageScale;
				g.naturalWidth = img.naturalWidth || img.width;
				g.naturalHeight = img.naturalHeight || img.height;
				g._setImageSize(Math.ceil(g.naturalWidth / pd), Math.ceil(g.naturalHeight / pd));

				g.ctx.drawImage(img, 0, 0);
				if (cb) cb(g);
				delete g.promise;
				resolve(g);
			};
			img.onerror = reject;
		});
		$._preloadPromises.push(g.promise);

		g.src = img.src = url;

		if (!$._usePreload) return g.promise;
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

			$.modified = $._retint = true;
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
		if ($._webgpuInst) $._webgpuInst._makeDrawable(img);
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
		let mod = $._pixelDensity || 1;
		for (let i = 0; i < mod; i++) {
			for (let j = 0; j < mod; j++) {
				let idx = 4 * ((y * mod + i) * c.width + x * mod + j);
				pixels[idx] = val.r;
				pixels[idx + 1] = val.g;
				pixels[idx + 2] = val.b;
				pixels[idx + 3] = val.a;
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
	constructor(q, w, h, opt = {}) {
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
		$._defaultImageScale = opt.defaultImageScale || q._defaultImageScale;
		$.createCanvas(w, h, opt);
		let scale = $._pixelDensity * $._defaultImageScale;
		$.defaultWidth = w * scale;
		$.defaultHeight = h * scale;
		delete $.createCanvas;
		$._loop = false;
	}
	get w() {
		return this.width;
	}
	get h() {
		return this.height;
	}
};
