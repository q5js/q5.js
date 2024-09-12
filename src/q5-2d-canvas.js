Q5.renderers.q2d = {};

Q5.renderers.q2d.canvas = ($, q) => {
	let c = $.canvas;

	if ($.colorMode) $.colorMode('rgb', 'integer');

	$._createCanvas = function (w, h, options) {
		q.ctx = q.drawingContext = c.getContext('2d', options);

		if ($._scope != 'image') {
			// default styles
			$.ctx.fillStyle = 'white';
			$.ctx.strokeStyle = 'black';
			$.ctx.lineCap = 'round';
			$.ctx.lineJoin = 'miter';
			$.ctx.textAlign = 'left';
		}
		$.ctx.scale($._pixelDensity, $._pixelDensity);
		$.ctx.save();
		return c;
	};

	if ($._scope == 'image') return;

	$._resizeCanvas = (w, h) => {
		let t = {};
		for (let prop in $.ctx) {
			if (typeof $.ctx[prop] != 'function') t[prop] = $.ctx[prop];
		}
		delete t.canvas;

		let o = new $._OffscreenCanvas(c.width, c.height);
		o.w = c.w;
		o.h = c.h;
		let oCtx = o.getContext('2d');
		oCtx.drawImage(c, 0, 0);

		$._setCanvasSize(w, h);

		for (let prop in t) $.ctx[prop] = t[prop];
		$.scale($._pixelDensity);
		$.ctx.drawImage(o, 0, 0, o.w, o.h);
	};

	$.fill = function (c) {
		$._doFill = true;
		$._fillSet = true;
		if (Q5.Color) {
			if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
			else if ($._namedColors[c]) c = $.color(...$._namedColors[c]);
			if (c.a <= 0) return ($._doFill = false);
		}
		$.ctx.fillStyle = c.toString();
	};
	$.noFill = () => ($._doFill = false);
	$.stroke = function (c) {
		$._doStroke = true;
		$._strokeSet = true;
		if (Q5.Color) {
			if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
			else if ($._namedColors[c]) c = $.color(...$._namedColors[c]);
			if (c.a <= 0) return ($._doStroke = false);
		}
		$.ctx.strokeStyle = c.toString();
	};
	$.strokeWeight = (n) => {
		if (!n) $._doStroke = false;
		if ($._da) n *= $._da;
		$.ctx.lineWidth = n || 0.0001;
	};
	$.noStroke = () => ($._doStroke = false);
	$.clear = () => {
		$.ctx.save();
		$.ctx.resetTransform();
		$.ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
		$.ctx.restore();
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
		y ??= x;
		$.ctx.scale(x, y);
	};
	$.opacity = (a) => ($.ctx.globalAlpha = a);
	$.applyMatrix = (a, b, c, d, e, f) => $.ctx.transform(a, b, c, d, e, f);
	$.shearX = (ang) => $.ctx.transform(1, 0, $.tan(ang), 1, 0, 0);
	$.shearY = (ang) => $.ctx.transform(1, $.tan(ang), 0, 1, 0, 0);
	$.resetMatrix = () => {
		$.ctx.resetTransform();
		$.scale($._pixelDensity);
	};

	$._styleNames = [
		'_doStroke',
		'_doFill',
		'_strokeSet',
		'_fillSet',
		'_tint',
		'_imageMode',
		'_rectMode',
		'_ellipseMode',
		'_textFont',
		'_textLeading',
		'_leadingSet',
		'_textSize',
		'_textAlign',
		'_textBaseline',
		'_textStyle',
		'_textWrap'
	];
	$._styles = [];

	$.push = $.pushMatrix = () => {
		$.ctx.save();
		let styles = {};
		for (let s of $._styleNames) styles[s] = $[s];
		$._styles.push(styles);
	};
	$.pop = $.popMatrix = () => {
		$.ctx.restore();
		let styles = $._styles.pop();
		for (let s of $._styleNames) $[s] = styles[s];
	};

	$.createCapture = (x) => {
		var vid = document.createElement('video');
		vid.playsinline = 'playsinline';
		vid.autoplay = 'autoplay';
		navigator.mediaDevices.getUserMedia(x).then((stream) => {
			vid.srcObject = stream;
		});
		vid.style.position = 'absolute';
		vid.style.opacity = 0.00001;
		vid.style.zIndex = -1000;
		document.body.append(vid);
		return vid;
	};

	$.createGraphics = function (w, h, opt) {
		let g = new Q5('graphics');
		opt ??= {};
		opt.alpha ??= true;
		opt.colorSpace ??= $.canvas.colorSpace;
		g.createCanvas.call($, w, h, opt);
		return g;
	};

	if (window && $._scope != 'graphics') {
		window.addEventListener('resize', () => {
			$._shouldResize = true;
			q.windowWidth = window.innerWidth;
			q.windowHeight = window.innerHeight;
			q.deviceOrientation = window.screen?.orientation?.type;
		});
	}
};
