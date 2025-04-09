/* software implementation of image filters */
Q5.renderers.c2d.softFilters = ($) => {
	let u = null; // uint8 temporary buffer

	function ensureBuf() {
		let l = $.canvas.width * $.canvas.height * 4;
		if (!u || u.length != l) u = new Uint8ClampedArray(l);
	}

	function initSoftFilters() {
		$._filters = [];
		$._filters[Q5.THRESHOLD] = (d, thresh) => {
			if (thresh === undefined) thresh = 127.5;
			else thresh *= 255;
			for (let i = 0; i < d.length; i += 4) {
				const gray = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
				d[i] = d[i + 1] = d[i + 2] = gray >= thresh ? 255 : 0;
			}
		};
		$._filters[Q5.GRAY] = (d) => {
			for (let i = 0; i < d.length; i += 4) {
				const gray = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
				d[i] = d[i + 1] = d[i + 2] = gray;
			}
		};
		$._filters[Q5.OPAQUE] = (d) => {
			for (let i = 0; i < d.length; i += 4) {
				d[i + 3] = 255;
			}
		};
		$._filters[Q5.INVERT] = (d) => {
			for (let i = 0; i < d.length; i += 4) {
				d[i] = 255 - d[i];
				d[i + 1] = 255 - d[i + 1];
				d[i + 2] = 255 - d[i + 2];
			}
		};
		$._filters[Q5.POSTERIZE] = (d, lvl = 4) => {
			let lvl1 = lvl - 1;
			for (let i = 0; i < d.length; i += 4) {
				d[i] = (((d[i] * lvl) >> 8) * 255) / lvl1;
				d[i + 1] = (((d[i + 1] * lvl) >> 8) * 255) / lvl1;
				d[i + 2] = (((d[i + 2] * lvl) >> 8) * 255) / lvl1;
			}
		};
		$._filters[Q5.DILATE] = (d, func) => {
			func ??= Math.max;
			ensureBuf();
			u.set(d);
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
						d[oi + oj + k] = func(u[kt + oj], u[ko + l], u[ko + oj], u[ko + r], u[kb + oj]);
					}
				}
			}
		};
		$._filters[Q5.ERODE] = (d) => {
			$._filters[Q5.DILATE](d, Math.min);
		};
		$._filters[Q5.BLUR] = (d, r) => {
			r = r || 1;
			r = Math.floor(r * $._pixelDensity);
			ensureBuf();
			u.set(d);

			let ksize = r * 2 + 1;

			function gauss(ksize) {
				let im = new Float32Array(ksize);
				let sigma = 0.3 * r + 0.8;
				let ss2 = sigma * sigma * 2;
				for (let i = 0; i < ksize; i++) {
					let x = i - ksize / 2;
					let z = Math.exp(-(x * x) / ss2) / (2.5066282746 * sigma);
					im[i] = z;
				}
				return im;
			}

			let kern = gauss(ksize);
			let [w, h] = [$.canvas.width, $.canvas.height];
			for (let i = 0; i < h; i++) {
				for (let j = 0; j < w; j++) {
					let s0 = 0,
						s1 = 0,
						s2 = 0,
						s3 = 0;
					for (let k = 0; k < ksize; k++) {
						let jk = Math.min(Math.max(j - r + k, 0), w - 1);
						let idx = 4 * (i * w + jk);
						s0 += u[idx] * kern[k];
						s1 += u[idx + 1] * kern[k];
						s2 += u[idx + 2] * kern[k];
						s3 += u[idx + 3] * kern[k];
					}
					let idx = 4 * (i * w + j);
					d[idx] = s0;
					d[idx + 1] = s1;
					d[idx + 2] = s2;
					d[idx + 3] = s3;
				}
			}
			u.set(d);
			for (let i = 0; i < h; i++) {
				for (let j = 0; j < w; j++) {
					let s0 = 0,
						s1 = 0,
						s2 = 0,
						s3 = 0;
					for (let k = 0; k < ksize; k++) {
						let ik = Math.min(Math.max(i - r + k, 0), h - 1);
						let idx = 4 * (ik * w + j);
						s0 += u[idx] * kern[k];
						s1 += u[idx + 1] * kern[k];
						s2 += u[idx + 2] * kern[k];
						s3 += u[idx + 3] * kern[k];
					}
					let idx = 4 * (i * w + j);
					d[idx] = s0;
					d[idx + 1] = s1;
					d[idx + 2] = s2;
					d[idx + 3] = s3;
				}
			}
		};
	}

	$._softFilter = (typ, x) => {
		if (!$._filters) initSoftFilters();
		let imgData = $._getImageData(0, 0, $.canvas.width, $.canvas.height);
		$._filters[typ](imgData.data, x);
		$.ctx.putImageData(imgData, 0, 0);
	};
};
