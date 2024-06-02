Q5.modules.q2d_image = ($) => {
	$.BLEND = 'source-over';
	$.REMOVE = 'destination-out';
	$.ADD = 'lighter';
	$.DARKEST = 'darken';
	$.LIGHTEST = 'lighten';
	$.DIFFERENCE = 'difference';
	$.SUBTRACT = 'subtract';
	$.EXCLUSION = 'exclusion';
	$.MULTIPLY = 'multiply';
	$.SCREEN = 'screen';
	$.REPLACE = 'copy';
	$.OVERLAY = 'overlay';
	$.HARD_LIGHT = 'hard-light';
	$.SOFT_LIGHT = 'soft-light';
	$.DODGE = 'color-dodge';
	$.BURN = 'color-burn';

	$._tint = null;

	let imgData = null;
	let tmpCtx = null;
	let tmpCt2 = null;
	let tmpBuf = null;

	$.loadPixels = () => {
		imgData = $.ctx.getImageData(0, 0, $.canvas.width, $.canvas.height);
		$.pixels = imgData.data;
	};
	$.updatePixels = () => {
		if (imgData != null) $.ctx.putImageData(imgData, 0, 0);
	};

	function makeTmpCtx(w, h) {
		h ??= w || $.canvas.height;
		w ??= $.canvas.width;
		if (tmpCtx == null) {
			tmpCtx = new _OffscreenCanvas(w, h).getContext('2d', {
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
			tmpCt2 = new _OffscreenCanvas(w, h).getContext('2d', {
				colorSpace: $.canvas.colorSpace
			});
		}
		if (tmpCt2.canvas.width != w || tmpCt2.canvas.height != h) {
			tmpCt2.canvas.width = w;
			tmpCt2.canvas.height = h;
		}
	}

	function makeTmpBuf() {
		let l = $.canvas.width * $.canvas.height * 4;
		if (!tmpBuf || l != tmpBuf.length) {
			tmpBuf = new Uint8ClampedArray(l);
		}
	}

	function initSoftFilters() {
		$._filters = [];
		$._filters[$.THRESHOLD] = (data, thresh) => {
			if (thresh === undefined) thresh = 127.5;
			else thresh *= 255;
			for (let i = 0; i < data.length; i += 4) {
				const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
				data[i] = data[i + 1] = data[i + 2] = gray >= thresh ? 255 : 0;
			}
		};
		$._filters[$.GRAY] = (data) => {
			for (let i = 0; i < data.length; i += 4) {
				const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
				data[i] = data[i + 1] = data[i + 2] = gray;
			}
		};
		$._filters[$.OPAQUE] = (data) => {
			for (let i = 0; i < data.length; i += 4) {
				data[i + 3] = 255;
			}
		};
		$._filters[$.INVERT] = (data) => {
			for (let i = 0; i < data.length; i += 4) {
				data[i] = 255 - data[i];
				data[i + 1] = 255 - data[i + 1];
				data[i + 2] = 255 - data[i + 2];
			}
		};
		$._filters[$.POSTERIZE] = (data, lvl = 4) => {
			let lvl1 = lvl - 1;
			for (let i = 0; i < data.length; i += 4) {
				data[i] = (((data[i] * lvl) >> 8) * 255) / lvl1;
				data[i + 1] = (((data[i + 1] * lvl) >> 8) * 255) / lvl1;
				data[i + 2] = (((data[i + 2] * lvl) >> 8) * 255) / lvl1;
			}
		};
		$._filters[$.DILATE] = (data) => {
			makeTmpBuf();
			tmpBuf.set(data);
			let [w, h] = [$.canvas.width, $.canvas.height];
			for (let i = 0; i < h; i++) {
				for (let j = 0; j < w; j++) {
					let l = 4 * Math.max(j - 1, 0);
					let r = 4 * Math.min(j + 1, w - 1);
					let t = 4 * Math.max(i - 1, 0) * w;
					let b = 4 * Math.min(i + 1, h - 1) * w;
					let oi = 4 * i * w;
					let oj = 4 * j;
					for (let k = 0; k < 4; k++) {
						let kt = k + t;
						let kb = k + b;
						let ko = k + oi;
						data[oi + oj + k] = Math.max(
							/*tmpBuf[kt+l],*/ tmpBuf[kt + oj] /*tmpBuf[kt+r],*/,
							tmpBuf[ko + l],
							tmpBuf[ko + oj],
							tmpBuf[ko + r],
							/*tmpBuf[kb+l],*/ tmpBuf[kb + oj] /*tmpBuf[kb+r],*/
						);
					}
				}
			}
		};
		$._filters[$.ERODE] = (data) => {
			makeTmpBuf();
			tmpBuf.set(data);
			let [w, h] = [$.canvas.width, $.canvas.height];
			for (let i = 0; i < h; i++) {
				for (let j = 0; j < w; j++) {
					let l = 4 * Math.max(j - 1, 0);
					let r = 4 * Math.min(j + 1, w - 1);
					let t = 4 * Math.max(i - 1, 0) * w;
					let b = 4 * Math.min(i + 1, h - 1) * w;
					let oi = 4 * i * w;
					let oj = 4 * j;
					for (let k = 0; k < 4; k++) {
						let kt = k + t;
						let kb = k + b;
						let ko = k + oi;
						data[oi + oj + k] = Math.min(
							/*tmpBuf[kt+l],*/ tmpBuf[kt + oj] /*tmpBuf[kt+r],*/,
							tmpBuf[ko + l],
							tmpBuf[ko + oj],
							tmpBuf[ko + r],
							/*tmpBuf[kb+l],*/ tmpBuf[kb + oj] /*tmpBuf[kb+r],*/
						);
					}
				}
			}
		};
		$._filters[$.BLUR] = (data, rad) => {
			rad = rad || 1;
			rad = Math.floor(rad * $._pixelDensity);
			makeTmpBuf();
			tmpBuf.set(data);

			let ksize = rad * 2 + 1;

			function gauss1d(ksize) {
				let im = new Float32Array(ksize);
				let sigma = 0.3 * rad + 0.8;
				let ss2 = sigma * sigma * 2;
				for (let i = 0; i < ksize; i++) {
					let x = i - ksize / 2;
					let z = Math.exp(-(x * x) / ss2) / (2.5066282746 * sigma);
					im[i] = z;
				}
				return im;
			}

			let kern = gauss1d(ksize);
			let [w, h] = [$.canvas.width, $.canvas.height];
			for (let i = 0; i < h; i++) {
				for (let j = 0; j < w; j++) {
					let s0 = 0,
						s1 = 0,
						s2 = 0,
						s3 = 0;
					for (let k = 0; k < ksize; k++) {
						let jk = Math.min(Math.max(j - rad + k, 0), w - 1);
						let idx = 4 * (i * w + jk);
						s0 += tmpBuf[idx] * kern[k];
						s1 += tmpBuf[idx + 1] * kern[k];
						s2 += tmpBuf[idx + 2] * kern[k];
						s3 += tmpBuf[idx + 3] * kern[k];
					}
					let idx = 4 * (i * w + j);
					data[idx] = s0;
					data[idx + 1] = s1;
					data[idx + 2] = s2;
					data[idx + 3] = s3;
				}
			}
			tmpBuf.set(data);
			for (let i = 0; i < h; i++) {
				for (let j = 0; j < w; j++) {
					let s0 = 0,
						s1 = 0,
						s2 = 0,
						s3 = 0;
					for (let k = 0; k < ksize; k++) {
						let ik = Math.min(Math.max(i - rad + k, 0), h - 1);
						let idx = 4 * (ik * w + j);
						s0 += tmpBuf[idx] * kern[k];
						s1 += tmpBuf[idx + 1] * kern[k];
						s2 += tmpBuf[idx + 2] * kern[k];
						s3 += tmpBuf[idx + 3] * kern[k];
					}
					let idx = 4 * (i * w + j);
					data[idx] = s0;
					data[idx + 1] = s1;
					data[idx + 2] = s2;
					data[idx + 3] = s3;
				}
			}
		};
	}

	function softFilter(typ, x) {
		if (!$._filters) initSoftFilters();
		let imgData = $.ctx.getImageData(0, 0, $.canvas.width, $.canvas.height);
		$._filters[typ](imgData.data, x);
		$.ctx.putImageData(imgData, 0, 0);
	}

	function nativeFilter(filtstr) {
		tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
		tmpCtx.filter = filtstr;
		tmpCtx.drawImage($.canvas, 0, 0);
		$.ctx.save();
		$.ctx.resetTransform();
		$.ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
		$.ctx.drawImage(tmpCtx.canvas, 0, 0);
		$.ctx.restore();
	}

	$.filter = (typ, x) => {
		if (!$.ctx.filter) return softFilter(typ, x);
		makeTmpCtx();
		if (typeof typ == 'string') {
			nativeFilter(typ);
		} else if (typ == $.THRESHOLD) {
			x ??= 0.5;
			x = Math.max(x, 0.00001);
			let b = Math.floor((0.5 / x) * 100);
			nativeFilter(`saturate(0%) brightness(${b}%) contrast(1000000%)`);
		} else if (typ == $.GRAY) {
			nativeFilter(`saturate(0%)`);
		} else if (typ == $.OPAQUE) {
			tmpCtx.fillStyle = 'black';
			tmpCtx.fillRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
			tmpCtx.drawImage($.canvas, 0, 0);
			$.ctx.save();
			$.ctx.resetTransform();
			$.ctx.drawImage(tmpCtx.canvas, 0, 0);
			$.ctx.restore();
		} else if (typ == $.INVERT) {
			nativeFilter(`invert(100%)`);
		} else if (typ == $.BLUR) {
			nativeFilter(`blur(${Math.ceil((x * $._pixelDensity) / 1) || 1}px)`);
		} else {
			softFilter(typ, x);
		}
	};

	$.resize = (w, h) => {
		makeTmpCtx();
		tmpCtx.drawImage($.canvas, 0, 0);
		$.width = w;
		$.height = h;
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
		if (c._q5) {
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

	$.tinted = function (col) {
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
	$.tint = function (c) {
		$._tint = c._q5Color ? c : $.color(...arguments);
	};
	$.noTint = () => ($._tint = null);

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
		document.body.append(a);
		a.click();
		document.body.removeChild(a);
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
	$.canvas.save = $.save;
	$.saveCanvas = $.save;

	$.createImage = (w, h, opt) => {
		return new Q5.Image(w, h, opt);
	};

	$._clearTemporaryBuffers = () => {
		tmpCtx = null;
		tmpCt2 = null;
		tmpBuf = null;
	};

	if ($._scope == 'image') return;

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
		let drawable = img._q5 ? img.canvas : img;
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
		if (img._q5 && $._tint != null) {
			makeTmpCt2(img.canvas.width, img.canvas.height);
			tmpCt2.drawImage(img.canvas, 0, 0);
			img.tinted($._tint);
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
		$._preloadCount++;
		let last = [...arguments].at(-1);
		opt = typeof last == 'object' ? last : true;
		let g = $.createImage(1, 1, opt.alpha);
		let c = g.ctx;
		if (Q5._nodejs && global.CairoCanvas) {
			CairoCanvas.loadImage(url)
				.then((img) => {
					g.width = c.canvas.width = img.width;
					g.height = c.canvas.height = img.height;
					c.drawImage(img, 0, 0);
					$._preloadCount--;
					if (cb) cb(g);
				})
				.catch((e) => {
					$._preloadCount--;
					throw e;
				});
		} else {
			let img = new window.Image();
			img.src = url;
			img.crossOrigin = 'Anonymous';
			img._pixelDensity = 1;
			img.onload = () => {
				g.width = c.canvas.width = img.naturalWidth;
				g.height = c.canvas.height = img.naturalHeight;
				c.drawImage(img, 0, 0);
				$._preloadCount--;
				if (cb) cb(g);
			};
			img.onerror = (e) => {
				$._preloadCount--;
				throw e;
			};
		}
		return g;
	};
};

// IMAGE CLASS

class _Q5Image extends Q5 {
	constructor(w, h, opt) {
		super('image');
		delete this.createCanvas;
		opt ??= {};
		opt.alpha ??= true;
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
