Q5.renderers.c2d = {};

Q5.renderers.c2d.canvas = ($, q) => {
	let c = $.canvas;

	if ($.colorMode) $.colorMode('rgb', 255);

	$._createCanvas = function (w, h, options) {
		if (!c) {
			console.error('q5 canvas could not be created. skia-canvas and jsdom packages not found.');
			return;
		}
		q.ctx = q.drawingContext = c.getContext('2d', options);

		if ($._scope != 'image') {
			// default styles
			$.ctx.fillStyle = $._fill = 'white';
			$.ctx.strokeStyle = $._stroke = 'black';
			$.ctx.lineCap = 'round';
			$.ctx.lineJoin = 'miter';
			$.ctx.textAlign = 'left';
			$._strokeWeight = 1;
		}
		$.ctx.scale($._pixelDensity, $._pixelDensity);
		$.ctx.save();
		return c;
	};

	$.clear = () => {
		$.ctx.save();
		$.ctx.resetTransform();
		$.ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
		$.ctx.restore();
	};

	if ($._scope == 'image') return;

	$.background = function (c) {
		$.ctx.save();
		$.ctx.resetTransform();
		$.ctx.globalAlpha = 1;
		if (c.canvas) $.image(c, 0, 0, $.canvas.width, $.canvas.height);
		else {
			if (Q5.Color && !c._q5Color) c = $.color(...arguments);
			$.ctx.fillStyle = c.toString();
			$.ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
		}
		$.ctx.restore();
	};

	$._resizeCanvas = (w, h) => {
		let t = {};
		for (let prop in $.ctx) {
			if (typeof $.ctx[prop] != 'function') t[prop] = $.ctx[prop];
		}
		delete t.canvas;

		let o;
		if ($.frameCount > 1) {
			o = new $._Canvas(c.width, c.height);
			o.w = c.w;
			o.h = c.h;
			let oCtx = o.getContext('2d');
			oCtx.drawImage(c, 0, 0);
		}

		$._setCanvasSize(w, h);

		for (let prop in t) $.ctx[prop] = t[prop];
		$.scale($._pixelDensity);

		if (o) $.ctx.drawImage(o, 0, 0, o.w, o.h);
	};

	$.fill = function (c) {
		$._doFill = $._fillSet = true;
		if (Q5.Color) {
			if (!c._q5Color && (typeof c != 'string' || $._namedColors[c])) {
				c = $.color(...arguments);
			}
			if (c.a <= 0) return ($._doFill = false);
		}
		$.ctx.fillStyle = $._fill = c.toString();
	};

	$.stroke = function (c) {
		$._doStroke = $._strokeSet = true;
		if (Q5.Color) {
			if (!c._q5Color && (typeof c != 'string' || $._namedColors[c])) {
				c = $.color(...arguments);
			}
			if (c.a <= 0) return ($._doStroke = false);
		}
		$.ctx.strokeStyle = $._stroke = c.toString();
	};

	$.strokeWeight = (n) => {
		if (!n) $._doStroke = false;
		if ($._da) n *= $._da;
		$.ctx.lineWidth = $._strokeWeight = n || 0.0001;
	};

	$.noFill = () => ($._doFill = false);
	$.noStroke = () => ($._doStroke = false);
	$.opacity = (a) => ($.ctx.globalAlpha = a);

	$._doShadow = false;
	$._shadowOffsetX = $._shadowOffsetY = $._shadowBlur = 10;

	$.shadow = function (c) {
		if (Q5.Color) {
			if (!c._q5Color && (typeof c != 'string' || $._namedColors[c])) {
				c = $.color(...arguments);
			}
			if (c.a <= 0) return ($._doShadow = false);
		}
		$.ctx.shadowColor = $._shadow = c.toString();
		$._doShadow = true;

		$.ctx.shadowOffsetX ||= $._shadowOffsetX;
		$.ctx.shadowOffsetY ||= $._shadowOffsetY;
		$.ctx.shadowBlur ||= $._shadowBlur;
	};

	$.shadowBox = (offsetX, offsetY, blur) => {
		$.ctx.shadowOffsetX = $._shadowOffsetX = offsetX;
		$.ctx.shadowOffsetY = $._shadowOffsetY = offsetY || offsetX;
		$.ctx.shadowBlur = $._shadowBlur = blur || 0;
	};

	$.noShadow = () => {
		$._doShadow = false;
		$.ctx.shadowOffsetX = $.ctx.shadowOffsetY = $.ctx.shadowBlur = 0;
	};

	// DRAWING MATRIX

	$.translate = (x, y) => {
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		$.ctx.translate(x, y);
	};

	$.rotate = (r) => {
		if ($._angleMode) r = $.radians(r);
		$.ctx.rotate(r);
	};

	$.scale = (x, y) => {
		if (x.x) {
			y = x.y;
			x = x.x;
		}
		y ??= x;
		$.ctx.scale(x, y);
	};

	$.applyMatrix = (a, b, c, d, e, f) => $.ctx.transform(a, b, c, d, e, f);
	$.shearX = (ang) => $.ctx.transform(1, 0, $.tan(ang), 1, 0, 0);
	$.shearY = (ang) => $.ctx.transform(1, $.tan(ang), 0, 1, 0, 0);

	$.resetMatrix = () => {
		if ($.ctx) {
			$.ctx.resetTransform();
			$.scale($._pixelDensity);
			if ($._webgpu) $.translate($.halfWidth, $.halfHeight);
		}
	};

	$.pushMatrix = () => $.ctx.save();
	$.popMatrix = () => $.ctx.restore();

	let _popStyles = $.popStyles;

	$.popStyles = () => {
		_popStyles();

		$.ctx.fillStyle = $._fill;
		$.ctx.strokeStyle = $._stroke;
		$.ctx.lineWidth = $._strokeWeight;
		$.ctx.shadowColor = $._shadow;
		$.ctx.shadowOffsetX = $._doShadow ? $._shadowOffsetX : 0;
		$.ctx.shadowOffsetY = $._doShadow ? $._shadowOffsetY : 0;
		$.ctx.shadowBlur = $._doShadow ? $._shadowBlur : 0;
	};

	$.push = () => {
		$.ctx.save();
		$.pushStyles();
	};
	$.pop = () => {
		$.ctx.restore();
		_popStyles();
	};
};
