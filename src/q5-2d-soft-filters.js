/* software implementation of image filters */
Q5.renderers.q2d.soft_filters = ($) => {
	let tmpBuf = null;

	function ensureTmpBuf() {
		let l = $.canvas.width * $.canvas.height * 4;
		if (!tmpBuf || tmpBuf.length != l) {
			tmpBuf = new Uint8ClampedArray(l);
		}
	}

	function initSoftFilters() {
		$._filters = [];
		$._filters[Q5.THRESHOLD] = (data, thresh) => {
			if (thresh === undefined) thresh = 127.5;
			else thresh *= 255;
			for (let i = 0; i < data.length; i += 4) {
				const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
				data[i] = data[i + 1] = data[i + 2] = gray >= thresh ? 255 : 0;
			}
		};
		$._filters[Q5.GRAY] = (data) => {
			for (let i = 0; i < data.length; i += 4) {
				const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
				data[i] = data[i + 1] = data[i + 2] = gray;
			}
		};
		$._filters[Q5.OPAQUE] = (data) => {
			for (let i = 0; i < data.length; i += 4) {
				data[i + 3] = 255;
			}
		};
		$._filters[Q5.INVERT] = (data) => {
			for (let i = 0; i < data.length; i += 4) {
				data[i] = 255 - data[i];
				data[i + 1] = 255 - data[i + 1];
				data[i + 2] = 255 - data[i + 2];
			}
		};
		$._filters[Q5.POSTERIZE] = (data, lvl = 4) => {
			let lvl1 = lvl - 1;
			for (let i = 0; i < data.length; i += 4) {
				data[i] = (((data[i] * lvl) >> 8) * 255) / lvl1;
				data[i + 1] = (((data[i + 1] * lvl) >> 8) * 255) / lvl1;
				data[i + 2] = (((data[i + 2] * lvl) >> 8) * 255) / lvl1;
			}
		};
		$._filters[Q5.DILATE] = (data) => {
			ensureTmpBuf();
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
		$._filters[Q5.ERODE] = (data) => {
			ensureTmpBuf();
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
		$._filters[Q5.BLUR] = (data, rad) => {
			rad = rad || 1;
			rad = Math.floor(rad * $._pixelDensity);
			ensureTmpBuf();
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

	$._softFilter = (typ, x) => {
		if (!$._filters) initSoftFilters();
		let imgData = $.ctx._getImageData(0, 0, $.canvas.width, $.canvas.height);
		$._filters[typ](imgData.data, x);
		$.ctx.putImageData(imgData, 0, 0);
	};
};
