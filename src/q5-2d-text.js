Q5.modules.q2d_text = ($) => {
	$.NORMAL = 'normal';
	$.ITALIC = 'italic';
	$.BOLD = 'bold';
	$.BOLDITALIC = 'italic bold';

	$.CENTER = 'center';
	$.LEFT = 'left';
	$.RIGHT = 'right';
	$.TOP = 'top';
	$.BOTTOM = 'bottom';
	$.BASELINE = 'alphabetic';

	$._textFont = 'sans-serif';
	$._textSize = 12;
	$._textLeading = 15;
	$._textLeadDiff = 3;
	$._textStyle = 'normal';

	$.loadFont = (url, cb) => {
		$._preloadCount++;
		let sp = url.split('/');
		let name = sp[sp.length - 1].split('.')[0].replace(' ', '');
		let f = new FontFace(name, 'url(' + url + ')');
		document.fonts.add(f);
		f.load().then(() => {
			$._preloadCount--;
			if (cb) cb(name);
		});
		return name;
	};
	$.textFont = (x) => ($._textFont = x);
	$.textSize = (x) => {
		if (x === undefined) return $._textSize;
		$._textSize = x;
		if (!$._leadingSet) {
			$._textLeading = x * 1.25;
			$._textLeadDiff = $._textLeading - x;
		}
	};
	$.textLeading = (x) => {
		if (x === undefined) return $._textLeading;
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
	$._textCache = true;
	$._TimedCache = class extends Map {
		constructor() {
			super();
			this.maxSize = 500;
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
		let og = $._textCache;
		$._textCache = true;
		$._genTextImage = true;
		$.text(str, 0, 0, w, h);
		$._genTextImage = false;
		let k = $._genTextImageKey(str, w, h);
		$._textCache = og;
		return $._tic.get(k);
	};
	$.text = (str, x, y, w, h) => {
		if (str === undefined) return;
		str = str.toString();
		if (!$._doFill && !$._doStroke) return;
		let c, ti, tg, k, cX, cY, _ascent, _descent;
		let pd = 1;
		let t = $.ctx.getTransform();
		let useCache = $._genTextImage || ($._textCache && (t.b != 0 || t.c != 0));
		if (!useCache) {
			c = $.ctx;
			cX = x;
			cY = y;
		} else {
			k = $._genTextImageKey(str, w, h);
			ti = $._tic.get(k);
			if (ti && !$._genTextImage) {
				$.textImage(ti, x, y);
				return;
			}
			tg = $.createGraphics.call($, 1, 1);
			c = tg.$.ctx;
			pd = $._pixelDensity;
		}
		c.font = `${$._textStyle} ${$._textSize}px ${$._textFont}`;
		let lines = str.split('\n');
		if (useCache) {
			cX = 0;
			cY = $._textLeading * lines.length;
			let m = c.measureText(' ');
			_ascent = m.fontBoundingBoxAscent;
			_descent = m.fontBoundingBoxDescent;
			h ??= cY + _descent;
			tg.resizeCanvas(Math.ceil(c.measureText(str).width), Math.ceil(h));

			c.fillStyle = $.ctx.fillStyle;
			c.strokeStyle = $.ctx.strokeStyle;
			c.lineWidth = $.ctx.lineWidth;
		}
		let f = c.fillStyle;
		if (!$._fillSet) c.fillStyle = 'black';
		for (let i = 0; i < lines.length; i++) {
			if ($._doStroke && $._strokeSet) c.strokeText(lines[i], cX, cY);
			if ($._doFill) c.fillText(lines[i], cX, cY);
			cY += $._textLeading;
			if (cY > h) break;
		}
		if (!$._fillSet) c.fillStyle = f;
		if (useCache) {
			ti = tg.get();
			ti._ascent = _ascent;
			ti._descent = _descent;
			$._tic.set(k, ti);
			if (!$._genTextImage) $.textImage(ti, x, y);
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
