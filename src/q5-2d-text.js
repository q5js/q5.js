Q5.renderers.q2d.text = ($, q) => {
	$._textAlign = 'left';
	$._textBaseline = 'alphabetic';
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

	let _styleHash = 0;

	const updateStyleHash = () => {
		const styleString = $._textFont + $._textSize + $._textStyle + $._textLeading + $._fillStyle + $._strokeStyle;
		let hash = 5381;
		for (let i = 0; i < styleString.length; i++) {
			hash = (hash * 33) ^ styleString.charCodeAt(i);
		}
		_styleHash = hash >>> 0;
	};

	// Update _styleHash in text style setting functions
	$.textFont = (x) => {
		$._textFont = x;
		updateStyleHash();
	};
	$.textSize = (x) => {
		if (x === undefined) return $._textSize;
		if ($._da) x *= $._da;
		$._textSize = x;
		updateStyleHash();
		if (!$._leadingSet) {
			$._textLeading = x * 1.25;
			$._textLeadDiff = $._textLeading - x;
		}
	};
	$.textStyle = (x) => {
		$._textStyle = x;
		updateStyleHash();
	};
	$.textLeading = (x) => {
		if (x === undefined) return $._textLeading;
		if ($._da) x *= $._da;
		$._textLeading = x;
		$._textLeadDiff = x - $._textSize;
		$._leadingSet = true;
		updateStyleHash();
	};
	$.textAlign = (horiz, vert) => {
		$.ctx.textAlign = $._textAlign = horiz;
		if (vert) {
			$.ctx.textBaseline = $._textBaseline = vert == $.CENTER ? 'middle' : vert;
		}
		updateStyleHash();
	};

	$._genTextImageKey = (str, w = '', h = '') => {
		return str.slice(0, 200) + _styleHash + w + h;
	};

	const updateFont = () => {
		$.ctx.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;
	};
	$.textWidth = (str) => {
		updateFont();
		return $.ctx.measureText(str).width;
	};
	$.textAscent = (str) => {
		updateFont();
		return $.ctx.measureText(str).actualBoundingBoxAscent;
	};
	$.textDescent = (str) => {
		updateFont();
		return $.ctx.measureText(str).actualBoundingBoxDescent;
	};
	$.textFill = $.fill;
	$.textStroke = $.stroke;

	$._textCache = !!Q5.Image;
	$._tic = {};
	let textCacheSize = 0;
	let textCacheMaxSize = 12000;
	let genTextImage = false;
	$.textCache = (b, maxSize) => {
		if (maxSize) textCacheMaxSize = maxSize;
		if (b !== undefined) $._textCache = b;
		return $._textCache;
	};
	$.createTextImage = (str, w, h) => {
		let og = $._textCache;
		$._textCache = genTextImage = true;
		img = $.text(str, 0, 0, w, h);
		genTextImage = false;
		$._textCache = og;
		return img;
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

		let useCache, img, cacheKey, tX, tY;

		if (!(useCache = genTextImage) && $._textCache) {
			let transform = $.ctx.getTransform();
			useCache = transform.b != 0 || transform.c != 0;
		}

		if (useCache) {
			cacheKey = $._genTextImageKey(str, w, h);
			img = $._tic[cacheKey];

			if (img) {
				// if (img.ctx.fillStyle == $._fillStyle && img.ctx.strokeStyle == $._strokeStyle) {
				if (genTextImage) return img;
				return $.textImage(img, x, y);
				// } else if (!genTextImage) useCache = false;
				// else img.clear();
			}
		}

		if (!useCache) {
			tX = x;
			tY = y;
		} else {
			tX = 0;
			tY = $._textLeading * lines.length;

			if (!img) {
				let measure = ctx.measureText(' ');
				let ascent = measure.fontBoundingBoxAscent;
				let descent = measure.fontBoundingBoxDescent;
				h ??= tY + descent;

				img = $.createImage.call($, Math.ceil(ctx.measureText(str).width), Math.ceil(h), {
					pixelDensity: $._pixelDensity
				});

				img._ascent = ascent;
				img._descent = descent;
				img._top = descent + $._textLeadDiff;
				img._middle = img._top + ascent * 0.5;
				img._bottom = img._top + ascent;
			}

			img.canvas.textureIndex = undefined;

			ctx = img.ctx;

			ctx.font = $.ctx.font;
			ctx.fillStyle = $._fillStyle;
			ctx.strokeStyle = $._strokeStyle;
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
			textCacheSize++;
			if (textCacheSize > textCacheMaxSize) {
				textCacheSize = 0;
				$._tic = {};
			}
			$._tic[cacheKey] = img;
			if (genTextImage) return img;
			$.textImage(img, x, y);
		}
	};
	$.textImage = (img, x, y) => {
		let og = $._imageMode;
		$._imageMode = 'corner';

		let ta = $._textAlign;
		if (ta == 'center') x -= img.canvas.hw;
		else if (ta == 'right') x -= img.width;

		let bl = $._textBaseline;
		if (bl == 'alphabetic') y -= $._textLeading;
		else if (bl == 'middle') y -= img._middle;
		else if (bl == 'bottom') y -= img._bottom;
		else if (bl == 'top') y -= img._top;

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
