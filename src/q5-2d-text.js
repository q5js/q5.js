Q5.renderers.q2d.text = ($, q) => {
	$._textAlign = 'left';
	$._textBaseline = 'alphabetic';
	$._textSize = 12;

	let font = 'sans-serif',
		leadingSet = false,
		leading = 15,
		leadDiff = 3,
		emphasis = 'normal',
		fontMod = false,
		styleHash = 0,
		styleHashes = [],
		useCache = false,
		genTextImage = false,
		cacheSize = 0,
		cacheMax = 12000;

	let cache = ($._textCache = {});

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

	$.textFont = (x) => {
		if (!x || x == font) return font;
		font = x;
		fontMod = true;
		styleHash = -1;
	};
	$.textSize = (x) => {
		if (x == undefined || x == $._textSize) return $._textSize;
		if ($._da) x *= $._da;
		$._textSize = x;
		fontMod = true;
		styleHash = -1;
		if (!leadingSet) {
			leading = x * 1.25;
			leadDiff = leading - x;
		}
	};
	$.textStyle = (x) => {
		if (!x || x == emphasis) return emphasis;
		emphasis = x;
		fontMod = true;
		styleHash = -1;
	};
	$.textLeading = (x) => {
		leadingSet = true;
		if (x == undefined || x == leading) return leading;
		if ($._da) x *= $._da;
		leading = x;
		leadDiff = x - $._textSize;
		styleHash = -1;
	};
	$.textAlign = (horiz, vert) => {
		$.ctx.textAlign = $._textAlign = horiz;
		if (vert) {
			$.ctx.textBaseline = $._textBaseline = vert == $.CENTER ? 'middle' : vert;
		}
	};

	$.textWidth = (str) => $.ctx.measureText(str).width;
	$.textAscent = (str) => $.ctx.measureText(str).actualBoundingBoxAscent;
	$.textDescent = (str) => $.ctx.measureText(str).actualBoundingBoxDescent;

	$.textFill = $.fill;
	$.textStroke = $.stroke;

	let updateStyleHash = () => {
		let styleString = font + $._textSize + emphasis + leading;

		let hash = 5381;
		for (let i = 0; i < styleString.length; i++) {
			hash = (hash * 33) ^ styleString.charCodeAt(i);
		}
		styleHash = hash >>> 0;
	};

	$.textCache = (enable, maxSize) => {
		if (maxSize) cacheMax = maxSize;
		if (enable !== undefined) useCache = enable;
		return useCache;
	};
	$.createTextImage = (str, w, h) => {
		genTextImage = true;
		img = $.text(str, 0, 0, w, h);
		genTextImage = false;
		return img;
	};

	let lines = [];
	$.text = (str, x, y, w, h) => {
		if (str === undefined || (!$._doFill && !$._doStroke)) return;
		str = str.toString();
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		let ctx = $.ctx;
		let img, tX, tY;

		if (fontMod) {
			ctx.font = `${emphasis} ${$._textSize}px ${font}`;
			fontMod = false;
		}

		if (useCache || genTextImage) {
			if (styleHash == -1) updateStyleHash();

			img = cache[str];
			if (img) img = img[styleHash];

			if (img) {
				if (img._fill == $._fill && img._stroke == $._stroke && img._strokeWeight == $._strokeWeight) {
					if (genTextImage) return img;
					return $.textImage(img, x, y);
				} else img.clear();
			}
		}

		if (str.indexOf('\n') == -1) lines[0] = str;
		else lines = str.split('\n');

		if (str.length > w) {
			let wrapped = [];
			for (let line of lines) {
				let i = 0;

				while (i < line.length) {
					let max = i + w;
					if (max >= line.length) {
						wrapped.push(line.slice(i));
						break;
					}
					let end = line.lastIndexOf(' ', max);
					if (end === -1 || end < i) end = max;
					wrapped.push(line.slice(i, end));
					i = end + 1;
				}
			}
			lines = wrapped;
		}

		if (!useCache && !genTextImage) {
			tX = x;
			tY = y;
		} else {
			tX = 0;
			tY = leading * lines.length;

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
				img._top = descent + leadDiff;
				img._middle = img._top + ascent * 0.5;
				img._bottom = img._top + ascent;
				img._leading = leading;
			}

			img._fill = $._fill;
			img._stroke = $._stroke;
			img._strokeWeight = $._strokeWeight;
			img.modified = true;

			ctx = img.ctx;

			ctx.font = $.ctx.font;
			ctx.fillStyle = $._fill;
			ctx.strokeStyle = $._stroke;
			ctx.lineWidth = $.ctx.lineWidth;
		}

		let ogFill;
		if (!$._fillSet) {
			ogFill = ctx.fillStyle;
			ctx.fillStyle = 'black';
		}

		for (let line of lines) {
			if ($._doStroke && $._strokeSet) ctx.strokeText(line, tX, tY);
			if ($._doFill) ctx.fillText(line, tX, tY);
			tY += leading;
			if (tY > h) break;
		}
		lines.length = 0;

		if (!$._fillSet) ctx.fillStyle = ogFill;

		if (useCache || genTextImage) {
			styleHashes.push(styleHash);
			(cache[str] ??= {})[styleHash] = img;

			cacheSize++;
			if (cacheSize > cacheMax) {
				let half = Math.ceil(cacheSize / 2);
				let hashes = styleHashes.splice(0, half);
				for (let s in cache) {
					s = cache[s];
					for (let h of hashes) delete s[h];
				}
				cacheSize -= half;
			}

			if (genTextImage) return img;
			$.textImage(img, x, y);
		}
	};
	$.textImage = (img, x, y) => {
		if (typeof img == 'string') img = $.createTextImage(img);

		let og = $._imageMode;
		$._imageMode = 'corner';

		let ta = $._textAlign;
		if (ta == 'center') x -= img.canvas.hw;
		else if (ta == 'right') x -= img.width;

		let bl = $._textBaseline;
		if (bl == 'alphabetic') y -= img._leading;
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
