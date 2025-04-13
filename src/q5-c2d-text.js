Q5.renderers.c2d.text = ($, q) => {
	$._textAlign = 'left';
	$._textBaseline = 'alphabetic';
	$._textSize = 12;

	let font = 'sans-serif',
		leadingSet = false,
		leading = 15,
		leadDiff = 3,
		emphasis = 'normal',
		weight = 'normal',
		fontMod = false,
		styleHash = 0,
		styleHashes = [],
		genTextImage = false,
		cacheSize = 0;

	let cache = ($._textCache = {});
	$._textCacheMaxSize = 12000;

	$.loadFont = (url, cb) => {
		let f;

		if (url.includes('fonts.googleapis.com/css')) {
			f = loadGoogleFont(url, cb);
		} else {
			let name = url.split('/').pop().split('.')[0].replace(' ', '');

			f = new FontFace(name, `url(${url})`);
			document.fonts.add(f);
			f.promise = (async () => {
				let err;
				try {
					await f.load();
				} catch (e) {
					err = e;
				}
				delete f.promise;
				if (err) throw err;
				if (cb) cb(f);
				return f;
			})();
		}

		$._preloadPromises.push(f.promise);
		$.textFont(f.family);
		if (!$._usePreload) return f.promise;
		return f;
	};

	function loadGoogleFont(url, cb) {
		if (!url.startsWith('http')) url = 'https://' + url;
		const urlParams = new URL(url).searchParams;
		const familyParam = urlParams.get('family');
		if (!familyParam) {
			console.error('Invalid Google Fonts URL: missing family parameter');
			return null;
		}

		const fontFamily = familyParam.split(':')[0];
		let f = { family: fontFamily };

		f.promise = (async () => {
			try {
				const res = await fetch(url);
				if (!res.ok) {
					throw new Error(`Failed to fetch Google Font: ${res.status} ${res.statusText}`);
				}

				let css = await res.text();

				let fontFaceRegex = /@font-face\s*{([^}]*)}/g;
				let srcRegex = /src:\s*url\(([^)]+)\)[^;]*;/;
				let fontFamilyRegex = /font-family:\s*['"]([^'"]+)['"]/;
				let fontWeightRegex = /font-weight:\s*([^;]+);/;
				let fontStyleRegex = /font-style:\s*([^;]+);/;

				let fontFaceMatch;
				let loadedFaces = [];

				while ((fontFaceMatch = fontFaceRegex.exec(css)) !== null) {
					let fontFaceCSS = fontFaceMatch[1];

					let srcMatch = srcRegex.exec(fontFaceCSS);
					if (!srcMatch) continue;
					let fontUrl = srcMatch[1];

					let familyMatch = fontFamilyRegex.exec(fontFaceCSS);
					if (!familyMatch) continue;
					let family = familyMatch[1];

					let weightMatch = fontWeightRegex.exec(fontFaceCSS);
					let weight = weightMatch ? weightMatch[1] : '400';

					let styleMatch = fontStyleRegex.exec(fontFaceCSS);
					let style = styleMatch ? styleMatch[1] : 'normal';

					let faceName = `${family}-${weight}-${style}`.replace(/\s+/g, '-');

					let fontFace = new FontFace(family, `url(${fontUrl})`, {
						weight,
						style
					});

					document.fonts.add(fontFace);

					try {
						await fontFace.load();
						loadedFaces.push(fontFace);
					} catch (e) {
						console.error(`Failed to load font face: ${faceName}`, e);
					}
				}

				f.faces = loadedFaces;
				delete f.promise;
				if (cb) cb(f);
				return f;
			} catch (e) {
				console.error('Error loading Google Font:', e);
				throw e;
			}
		})();

		return f;
	}

	$.textFont = (x) => {
		if (x && typeof x != 'string') x = x.family;
		if (!x || x == font) return font;
		font = x;
		fontMod = true;
		styleHash = -1;
	};

	$.textSize = (x) => {
		if (x == undefined) return $._textSize;
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
		if (!x) return emphasis;
		emphasis = x;
		fontMod = true;
		styleHash = -1;
	};

	$.textWeight = (x) => {
		if (!x) return weight;
		weight = x;
		fontMod = true;
		styleHash = -1;
	};

	$.textLeading = (x) => {
		if (x == undefined) return leading || $._textSize * 1.25;
		leadingSet = true;
		if (x == leading) return leading;
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

	const updateFont = () => {
		$.ctx.font = `${emphasis} ${weight} ${$._textSize}px ${font}`;
		fontMod = false;
	};

	$.textWidth = (str) => {
		if (fontMod) updateFont();
		return $.ctx.measureText(str).width;
	};
	$.textAscent = (str) => {
		if (fontMod) updateFont();
		return $.ctx.measureText(str).actualBoundingBoxAscent;
	};
	$.textDescent = (str) => {
		if (fontMod) updateFont();
		return $.ctx.measureText(str).actualBoundingBoxDescent;
	};

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

	$.createTextImage = (str, w, h) => {
		genTextImage = true;
		let img = $.text(str, 0, 0, w, h);
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

		if (fontMod) updateFont();

		if (genTextImage) {
			if (styleHash == -1) updateStyleHash();

			img = cache[str];
			if (img) img = img[styleHash];

			if (img) {
				if (img._fill == $._fill && img._stroke == $._stroke && img._strokeWeight == $._strokeWeight) {
					return img;
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

		if (!genTextImage) {
			tX = x;
			tY = y;
			if ($._textBaseline == 'middle') tY -= leading * (lines.length - 1) * 0.5;
			else if ($._textBaseline == 'bottom') tY -= leading * (lines.length - 1);
		} else {
			tX = 0;
			tY = leading;

			if (!img) {
				let ogBaseline = $.ctx.textBaseline;
				$.ctx.textBaseline = 'alphabetic';

				let measure = ctx.measureText(' ');
				let ascent = measure.fontBoundingBoxAscent;
				let descent = measure.fontBoundingBoxDescent;

				$.ctx.textBaseline = ogBaseline;

				let maxWidth = 0;
				for (let line of lines) {
					let lineWidth = ctx.measureText(line).width;
					if (lineWidth > maxWidth) maxWidth = lineWidth;
				}

				let imgW = Math.ceil(maxWidth),
					imgH = Math.ceil(leading * lines.length + descent);

				img = $.createImage.call($, imgW, imgH, {
					pixelDensity: $._pixelDensity
				});

				img._ascent = ascent;
				img._descent = descent;
				img._top = descent + leadDiff;
				img._middle = img._top + ascent * 0.5 + leading * (lines.length - 1) * 0.5;
				img._bottom = img._top + ascent + leading * (lines.length - 1);
				img._leading = leading;
			} else {
				img.modified = true;
			}

			img._fill = $._fill;
			img._stroke = $._stroke;
			img._strokeWeight = $._strokeWeight;

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

		let lineAmount = 0;
		for (let line of lines) {
			if ($._doStroke && $._strokeSet) ctx.strokeText(line, tX, tY);
			if ($._doFill) ctx.fillText(line, tX, tY);
			tY += leading;
			lineAmount++;
			if (lineAmount >= h) break;
		}
		lines = [];

		if (!$._fillSet) ctx.fillStyle = ogFill;

		if (genTextImage) {
			styleHashes.push(styleHash);
			(cache[str] ??= {})[styleHash] = img;

			cacheSize++;
			if (cacheSize > $._textCacheMaxSize) {
				let half = Math.ceil(cacheSize / 2);
				let hashes = styleHashes.splice(0, half);
				for (let s in cache) {
					s = cache[s];
					for (let h of hashes) delete s[h];
				}
				cacheSize -= half;
			}
			return img;
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
};

Q5.fonts = [];
