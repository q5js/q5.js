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

		if (img.canvas.textureIndex == undefined) $._createTexture(img);

		$.textImage(img, x, y);
	};

	$.createTextImage = t.createTextImage;

	$.textImage = (img, x, y) => {
		if (t.ctx.textAlign == 'center') x -= img.width * 0.5;
		else if (t.ctx.textAlign == 'right') x -= img.width;
		if (t.ctx.textBaseline == 'alphabetic') y -= t._textLeading;
		if (t.ctx.textBaseline == 'middle') y -= img._descent + img._ascent * 0.5 + t._textLeadDiff;
		else if (t.ctx.textBaseline == 'bottom') y -= img._ascent + img._descent + t._textLeadDiff;
		else if (t.ctx.textBaseline == 'top') y -= img._descent + t._textLeadDiff;
		$.image(img, x, y);
	};
};
