Q5.renderers.q2d.text = ($, q) => {
	$._textFont = 'sans-serif';
	$._textSize = 12;
	$._textLeading = 15;
	$._textLeadDiff = 3;
	$._textStyle = 'normal';

	$.loadFont = (url, cb) => {
		q._preloadCount++;
		let name = url.split('/').pop().split('.')[0].replace(' ', '');
		let f = new FontFace(name, `url(${url})`);
		document.fonts.add(f);
		f.load().then(() => {
			q._preloadCount--;
			if (cb) cb(name);
		});
		return name;
	};
	$.textFont = (x) => ($._textFont = x);
	$.textSize = (x) => {
		if (x === undefined) return $._textSize;
		if ($._da) x *= $._da;
		$._textSize = x;
		if (!$._leadingSet) {
			$._textLeading = x * 1.25;
			$._textLeadDiff = $._textLeading - x;
		}
	};
	$.textLeading = (x) => {
		if (x === undefined) return $._textLeading;
		if ($._da) x *= $._da;
		$._textLeading = x;
		$._textLeadDiff = x - $._textSize;
		$._leadingSet = true;
	};
	$.textStyle = (x) => ($._textStyle = x);
	$.textAlign = (horiz, vert) => {
		$.ctx.textAlign = horiz;
		if (vert) {
			$.ctx.textBaseline = vert == $.CENTER ? 'middle' : vert;
		}
	};
	$.textWidth = (str) => {
		$.ctx.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;
		return $.ctx.measureText(str).width;
	};
	$.textAscent = (str) => {
		$.ctx.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;
		return $.ctx.measureText(str).actualBoundingBoxAscent;
	};
	$.textDescent = (str) => {
		$.ctx.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;
		return $.ctx.measureText(str).actualBoundingBoxDescent;
	};
	$.textFill = $.fill;
	$.textStroke = $.stroke;

	$._textCache = !!Q5.Image;
	$._TimedCache = class extends Map {
		constructor() {
			super();
			this.maxSize = 50000;
		}
		set(k, v) {
			v.lastAccessed = Date.now();
			super.set(k, v);
			if (this.size > this.maxSize) this.gc();
		}
		get(k) {
			const v = super.get(k);
			if (v) v.lastAccessed = Date.now();
			return v;
		}
		gc() {
			let t = Infinity;
			let oldest;
			let i = 0;
			for (const [k, v] of this.entries()) {
				if (v.lastAccessed < t) {
					t = v.lastAccessed;
					oldest = i;
				}
				i++;
			}
			i = oldest;
			for (const k of this.keys()) {
				if (i == 0) {
					oldest = k;
					break;
				}
				i--;
			}
			this.delete(oldest);
		}
	};
	$._tic = new $._TimedCache();
	$.textCache = (b, maxSize) => {
		if (maxSize) $._tic.maxSize = maxSize;
		if (b !== undefined) $._textCache = b;
		return $._textCache;
	};
	$._genTextImageKey = (str, w, h) => {
		return (
			str.slice(0, 200) +
			$._textStyle +
			$._textSize +
			$._textFont +
			($._doFill ? $.ctx.fillStyle : '') +
			'_' +
			($._doStroke && $._strokeSet ? $.ctx.lineWidth + $.ctx.strokeStyle + '_' : '') +
			(w || '') +
			(h ? 'x' + h : '')
		);
	};
	$.createTextImage = (str, w, h) => {
		let k = $._genTextImageKey(str, w, h);
		if ($._tic.get(k)) return $._tic.get(k);

		let og = $._textCache;
		$._textCache = true;
		$._genTextImage = true;
		$.text(str, 0, 0, w, h);
		$._genTextImage = false;
		$._textCache = og;
		return $._tic.get(k);
	};
	$.text = (str, x, y, w, h) => {
		if (str === undefined || (!$._doFill && !$._doStroke)) return;
		str = str.toString();
		let lines = str.split('\n');
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		let ctx = $.ctx;
		ctx.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;

		let useCache, img, cacheKey, tX, tY, ascent, descent;

		if (!(useCache = $._genTextImage) && $._textCache) {
			let transform = $.ctx.getTransform();
			useCache = transform.b != 0 || transform.c != 0;
		}

		if (!useCache) {
			tX = x;
			tY = y;
		} else {
			cacheKey = $._genTextImageKey(str, w, h);
			img = $._tic.get(cacheKey);
			if (img && !$._genTextImage) return $.textImage(img, x, y);

			tX = 0;
			tY = $._textLeading * lines.length;
			let measure = ctx.measureText(' ');
			ascent = measure.fontBoundingBoxAscent;
			descent = measure.fontBoundingBoxDescent;
			h ??= tY + descent;

			img = $.createImage.call($, Math.ceil(ctx.measureText(str).width), Math.ceil(h), {
				pixelDensity: $._pixelDensity
			});

			ctx = img.ctx;

			ctx.font = $.ctx.font;
			ctx.fillStyle = $.ctx.fillStyle;
			ctx.strokeStyle = $.ctx.strokeStyle;
			ctx.lineWidth = $.ctx.lineWidth;
		}

		let ogFill;
		if (!$._fillSet) {
			ogFill = ctx.fillStyle;
			ctx.fillStyle = 'black';
		}

		for (let i = 0; i < lines.length; i++) {
			if ($._doStroke && $._strokeSet) ctx.strokeText(lines[i], tX, tY);
			if ($._doFill) ctx.fillText(lines[i], tX, tY);
			tY += $._textLeading;
			if (tY > h) break;
		}

		if (!$._fillSet) ctx.fillStyle = ogFill;

		if (useCache) {
			img._ascent = ascent;
			img._descent = descent;
			$._tic.set(cacheKey, img);
			if (!$._genTextImage) $.textImage(img, x, y);
		}
	};
	$.textImage = (img, x, y) => {
		let og = $._imageMode;
		$._imageMode = 'corner';
		if ($.ctx.textAlign == 'center') x -= img.width * 0.5;
		else if ($.ctx.textAlign == 'right') x -= img.width;
		if ($.ctx.textBaseline == 'alphabetic') y -= $._textLeading;
		if ($.ctx.textBaseline == 'middle') y -= img._descent + img._ascent * 0.5 + $._textLeadDiff;
		else if ($.ctx.textBaseline == 'bottom') y -= img._ascent + img._descent + $._textLeadDiff;
		else if ($.ctx.textBaseline == 'top') y -= img._descent + $._textLeadDiff;
		$.image(img, x, y);
		$._imageMode = og;
	};

	$.nf = (n, l, r) => {
		let neg = n < 0;
		n = Math.abs(n);
		let parts = n.toFixed(r).split('.');
		parts[0] = parts[0].padStart(l, '0');
		let s = parts.join('.');
		if (neg) s = '-' + s;
		return s;
	};
};
