Q5.renderers.webgpu.text = ($, q) => {
	let t = $.createGraphics(1, 1);
	t.pixelDensity($._pixelDensity);
	t._imageMode = 'corner';

	$.loadFont = (f) => {
		q._preloadCount++;
		return t.loadFont(f, () => {
			q._preloadCount--;
		});
	};

	// directly add these text setting functions to the webgpu renderer
	$.textFont = t.textFont;
	$.textSize = t.textSize;
	$.textLeading = t.textLeading;
	$.textStyle = t.textStyle;
	$.textAlign = t.textAlign;
	$.textWidth = t.textWidth;
	$.textAscent = t.textAscent;
	$.textDescent = t.textDescent;

	$.textFill = (r, g, b, a) => t.fill($.color(r, g, b, a));
	$.textStroke = (r, g, b, a) => t.stroke($.color(r, g, b, a));

	$.text = (str, x, y, w, h) => {
		let img = t.createTextImage(str, w, h);

		if (img.canvas.textureIndex === undefined) {
			$._createTexture(img);
		} else if (img.modified) {
			let cnv = img.canvas;
			let textureSize = [cnv.width, cnv.height, 1];
			let texture = $._textures[cnv.textureIndex];

			Q5.device.queue.copyExternalImageToTexture(
				{ source: cnv },
				{ texture, colorSpace: $.canvas.colorSpace },
				textureSize
			);
			img.modified = false;
		}

		$.textImage(img, x, y);
	};

	$.createTextImage = t.createTextImage;

	$.textImage = (img, x, y) => {
		let og = $._imageMode;
		$._imageMode = 'corner';

		let ta = t._textAlign;
		if (ta == 'center') x -= img.canvas.hw;
		else if (ta == 'right') x -= img.width;

		let bl = t._textBaseline;
		if (bl == 'alphabetic') y -= t._textLeading;
		else if (bl == 'middle') y -= img._middle;
		else if (bl == 'bottom') y -= img._bottom;
		else if (bl == 'top') y -= img._top;

		$.image(img, x, y);
		$._imageMode = og;
	};
};
