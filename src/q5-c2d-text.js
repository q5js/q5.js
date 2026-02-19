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
		styleHash = 0,
		genTextImage = false,
		cacheSize = 0;
	$._fontMod = false;

	let cache = ($._textCache = {});

	$.loadFont = (url, cb) => {
		let f;

		if (url.includes('fonts.googleapis.com/css')) {
			f = loadGoogleFont(url, cb);
		} else {
			let name = url.split('/').pop().split('.')[0].replace(' ', '');

			f = { family: name };
			let ff = new FontFace(name, `url(${encodeURI(url)})`);
			document.fonts.add(ff);

			f.promise = new Promise((resolve, reject) => {
				ff.load()
					.then(() => {
						delete f.then;
						if (cb) cb(ff);
						resolve(ff);
					})
					.catch((err) => {
						reject(err);
					});
			});
		}
		$._loaders.push(f.promise);
		$.textFont(f.family);
		f.then = (resolve, reject) => {
			f._usedAwait = true;
			return f.promise.then(resolve, reject);
		};
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

				if (f._usedAwait) {
					f = { family: fontFamily };
				}

				f.faces = loadedFaces;
				delete f.then;
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
		$._fontMod = true;
		styleHash = -1;
	};

	$.textSize = (x) => {
		if (x == undefined) return $._textSize;
		$._textSize = x;
		$._fontMod = true;
		styleHash = -1;
		if (!leadingSet) {
			leading = x * 1.25;
			leadDiff = leading - x;
		}
	};

	$.textStyle = (x) => {
		if (!x) return emphasis;
		$._textStyle = emphasis = x;
		$._fontMod = true;
		styleHash = -1;
	};

	$.textWeight = (x) => {
		if (!x) return weight;
		weight = x;
		$._fontMod = true;
		styleHash = -1;
	};

	$.textLeading = (x) => {
		if (x == undefined) return leading || $._textSize * 1.25;
		leadingSet = true;
		if (x == leading) return leading;
		leading = x;
		leadDiff = x - $._textSize;
		styleHash = -1;
	};

	$.textAlign = (horiz, vert) => {
		if (!horiz) return { horizontal: $._textAlign, vertical: $._textBaseline };
		$.ctx.textAlign = $._textAlign = horiz;
		if (vert) {
			$.ctx.textBaseline = $._textBaseline = vert == $.CENTER ? 'middle' : vert;
		}
	};

	$._updateFont = () => {
		$.ctx.font = `${emphasis} ${weight} ${$._textSize}px ${font}`;
		$._fontMod = false;
	};

	$.textWidth = (str) => {
		if ($._fontMod) $._updateFont();
		return $.ctx.measureText(str).width;
	};
	$.textAscent = (str) => {
		if ($._fontMod) $._updateFont();
		return $.ctx.measureText(str).actualBoundingBoxAscent;
	};
	$.textDescent = (str) => {
		if ($._fontMod) $._updateFont();
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
		let ctx = $.ctx;
		let img, colorStyle, styleCache, colorCache, recycling;

		if ($._fontMod) $._updateFont();

		if (genTextImage) {
			if (styleHash == -1) updateStyleHash();
			colorStyle = $._fill + $._stroke + $._strokeWeight;

			styleCache = cache[str];
			if (styleCache) colorCache = styleCache[styleHash];
			else styleCache = cache[str] = {};

			if (colorCache) {
				img = colorCache[colorStyle];
				if (img) return img;

				if (colorCache.size >= 4) {
					for (let recycleKey in colorCache) {
						img = colorCache[recycleKey];
						delete colorCache[recycleKey];
						break;
					}
					recycling = true;
				}
			} else colorCache = styleCache[styleHash] = {};
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

		let tX, tY;

		if (!genTextImage) {
			tX = x;
			tY = y;
			if ($._textBaseline == 'middle') tY -= leading * (lines.length - 1) * 0.5;
			else if ($._textBaseline == 'bottom') tY -= leading * (lines.length - 1);
		} else {
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
					pixelDensity: $._pixelDensity,
					defaultImageScale: 1 / $._pixelDensity
				});

				img._ascent = ascent;
				img._descent = descent;
				img._top = descent + leadDiff;
				img._middle = img._top + ascent * 0.5 + leading * (lines.length - 1) * 0.5;
				img._bottom = img._top + ascent + leading * (lines.length - 1);
				img._leading = leading;
			} else {
				let cnv = img.canvas;
				img.ctx.clearRect(0, 0, cnv.width, cnv.height);
				img.modified = true;
			}

			ctx = img.ctx;

			ctx.textAlign = $._textAlign;
			if ($._textAlign == 'center') tX = img.width / 2;
			else if ($._textAlign == 'right') tX = img.width;
			else tX = 0;

			ctx.font = $.ctx.font;
			if ($._doFill && $._fillSet) ctx.fillStyle = $._fill;
			if ($._doStroke && $._strokeSet) ctx.strokeStyle = $._stroke;
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
			colorCache[colorStyle] = img;

			if (!recycling) {
				if (!colorCache.size) {
					Object.defineProperty(colorCache, 'size', {
						writable: true,
						enumerable: false
					});
					colorCache.size = 0;
				}
				colorCache.size++;
				cacheSize++;
			}

			if (cacheSize > Q5.MAX_TEXT_IMAGES) {
				for (const str in cache) {
					styleCache = cache[str];
					for (const hash in styleCache) {
						colorCache = styleCache[hash];
						for (let c in colorCache) {
							let _img = colorCache[c];
							if (_img._texture) {
								let owner = _img._owner || $;
								if (owner._texturesToDestroy) owner._texturesToDestroy.push(_img._texture);
								else _img._texture.destroy();
							}
							delete colorCache[c];
						}
					}
				}
				cacheSize = 0;
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

	$.textToPoints = (str, x = 0, y = 0, sampleRate = 0.1, density = 1) => {
		let pd = $._pixelDensity;
		$._pixelDensity = density;
		let img = $.createTextImage(str);
		$._pixelDensity = pd;

		img.loadPixels();

		let w = img.canvas.width,
			h = img.canvas.height;

		let points = [];

		let ta = $._textAlign,
			bl = $._textBaseline,
			offsetX = 0,
			offsetY = 0;

		if (ta == 'center') offsetX = -w / 2;
		else if (ta == 'right') offsetX = -w;

		if (bl == 'alphabetic') offsetY = -img._leading;
		else if (bl == 'middle') offsetY = -img._middle;
		else if (bl == 'bottom') offsetY = -img._bottom;
		else if (bl == 'top') offsetY = -img._top;

		offsetY *= density;

		let allPoints = [];

		// Z-order curve (Morton code)
		const part1by1 = (n) => {
			n &= 0x0000ffff;
			n = (n | (n << 8)) & 0x00ff00ff;
			n = (n | (n << 4)) & 0x0f0f0f0f;
			n = (n | (n << 2)) & 0x33333333;
			n = (n | (n << 1)) & 0x55555555;
			return n;
		};

		let r = Math.max(0.5, sampleRate);

		for (let py = 0; py < h; py++) {
			for (let px = 0; px < w; px++) {
				let index = (py * w + px) * 4;

				if ((r == 1 || $.random() < r) && img.pixels[index + 3] > 128) {
					allPoints.push({
						x: px,
						y: py,
						z: part1by1(px) | (part1by1(py) << 1)
					});
				}
			}
		}

		let total = allPoints.length;
		let numPoints = total * sampleRate * (1 / r);

		if (sampleRate < 1) allPoints.sort((a, b) => a.z - b.z);

		let step = total / numPoints;
		for (let i = 0; i < total; i += step) {
			let p = allPoints[Math.floor(i)];
			points.push({
				x: (p.x + offsetX) / density + x,
				y: (p.y + offsetY) / density + y
			});
		}

		return points;
	};
};

Q5.fonts = [];
Q5.MAX_TEXT_IMAGES = 5000;
