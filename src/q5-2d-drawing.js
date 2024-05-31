Q5.modules.q2d_drawing = ($) => {
	$.THRESHOLD = 1;
	$.GRAY = 2;
	$.OPAQUE = 3;
	$.INVERT = 4;
	$.POSTERIZE = 5;
	$.DILATE = 6;
	$.ERODE = 7;
	$.BLUR = 8;

	if ($._scope == 'image') return;

	$.CHORD = 0;
	$.PIE = 1;
	$.OPEN = 2;

	$.RADIUS = 'radius';
	$.CORNER = 'corner';
	$.CORNERS = 'corners';

	$.ROUND = 'round';
	$.SQUARE = 'butt';
	$.PROJECT = 'square';
	$.MITER = 'miter';
	$.BEVEL = 'bevel';

	$.CLOSE = 1;

	$.CENTER = 'center';
	$.LEFT = 'left';
	$.RIGHT = 'right';
	$.TOP = 'top';
	$.BOTTOM = 'bottom';

	$.LANDSCAPE = 'landscape';
	$.PORTRAIT = 'portrait';

	$._doStroke = true;
	$._doFill = true;
	$._strokeSet = false;
	$._fillSet = false;
	$._ellipseMode = $.CENTER;
	$._rectMode = $.CORNER;
	$._curveDetail = 20;
	$._curveAlpha = 0.0;

	let firstVertex = true;
	let curveBuff = [];

	// CURVES

	$.curvePoint = (a, b, c, d, t) => {
		const t3 = t * t * t,
			t2 = t * t,
			f1 = -0.5 * t3 + t2 - 0.5 * t,
			f2 = 1.5 * t3 - 2.5 * t2 + 1.0,
			f3 = -1.5 * t3 + 2.0 * t2 + 0.5 * t,
			f4 = 0.5 * t3 - 0.5 * t2;
		return a * f1 + b * f2 + c * f3 + d * f4;
	};
	$.bezierPoint = (a, b, c, d, t) => {
		const adjustedT = 1 - t;
		return (
			Math.pow(adjustedT, 3) * a +
			3 * Math.pow(adjustedT, 2) * t * b +
			3 * adjustedT * Math.pow(t, 2) * c +
			Math.pow(t, 3) * d
		);
	};
	$.curveTangent = (a, b, c, d, t) => {
		const t2 = t * t,
			f1 = (-3 * t2) / 2 + 2 * t - 0.5,
			f2 = (9 * t2) / 2 - 5 * t,
			f3 = (-9 * t2) / 2 + 4 * t + 0.5,
			f4 = (3 * t2) / 2 - t;
		return a * f1 + b * f2 + c * f3 + d * f4;
	};
	$.bezierTangent = (a, b, c, d, t) => {
		const adjustedT = 1 - t;
		return (
			3 * d * Math.pow(t, 2) -
			3 * c * Math.pow(t, 2) +
			6 * c * adjustedT * t -
			6 * b * adjustedT * t +
			3 * b * Math.pow(adjustedT, 2) -
			3 * a * Math.pow(adjustedT, 2)
		);
	};

	// ERASE

	$.erase = function (fillAlpha = 255, strokeAlpha = 255) {
		$.ctx.globalCompositeOperation = 'destination-out';
		$.ctx.fillStyle = `rgba(0, 0, 0, ${fillAlpha / 255})`;
		$.ctx.strokeStyle = `rgba(0, 0, 0, ${strokeAlpha / 255})`;
	};

	$.noErase = function () {
		$.ctx.globalCompositeOperation = 'source-over';
		if ($._fillSet) {
			$.ctx.fillStyle = $.color($.ctx.fillStyle).toString();
		}
		if ($._strokeSet) {
			$.ctx.strokeStyle = $.color($.ctx.strokeStyle).toString();
		}
	};

	// DRAWING SETTINGS

	$.strokeWeight = (n) => {
		if (!n) $._doStroke = false;
		if ($._da) n = $._sc(n);
		$.ctx.lineWidth = n || 0.0001;
	};
	$.stroke = function (c) {
		$._doStroke = true;
		$._strokeSet = true;
		if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
		else if ($._basicColors[c]) c = $.color(...$._basicColors[c]);
		if (c.a <= 0) return ($._doStroke = false);
		$.ctx.strokeStyle = c.toString();
	};
	$.noStroke = () => ($._doStroke = false);
	$.fill = function (c) {
		$._doFill = true;
		$._fillSet = true;
		if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
		else if ($._basicColors[c]) c = $.color(...$._basicColors[c]);
		if (c.a <= 0) return ($._doFill = false);
		$.ctx.fillStyle = c.toString();
	};
	$.noFill = () => ($._doFill = false);
	$.smooth = () => ($._smooth = true);
	$.noSmooth = () => ($._smooth = false);
	$.strokeCap = (x) => ($.ctx.lineCap = x);
	$.strokeJoin = (x) => ($.ctx.lineJoin = x);
	$.ellipseMode = (x) => ($._ellipseMode = x);
	$.rectMode = (x) => ($._rectMode = x);
	$.curveDetail = (x) => ($._curveDetail = x);
	$.curveAlpha = (x) => ($._curveAlpha = x);
	$.curveTightness = (x) => ($._curveAlpha = x);

	$.blendMode = (x) => ($.ctx.globalCompositeOperation = x);

	// DRAWING

	$.clear = () => {
		$.ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
	};

	$.background = function (c) {
		if (c._q5) return $.image(c, 0, 0, $.width, $.height);
		$.ctx.save();
		$.ctx.resetTransform();
		if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
		else if ($._basicColors[c]) c = $.color(...$._basicColors[c]);
		$.ctx.fillStyle = c.toString();
		$.ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
		$.ctx.restore();
	};

	$.line = (x0, y0, x1, y1) => {
		if ($._doStroke) {
			if ($._da) {
				x0 = $._sc(x0);
				y0 = $._sc(y0);
				x1 = $._sc(x1);
				y1 = $._sc(y1);
			}
			$.ctx.beginPath();
			$.ctx.moveTo(x0, y0);
			$.ctx.lineTo(x1, y1);
			$.ctx.stroke();
		}
	};

	function normAng(x) {
		let mid = $._angleMode == $.DEGREES ? 180 : Math.PI;
		let full = mid * 2;
		if (0 <= x && x <= full) return x;
		while (x < 0) {
			x += full;
		}
		while (x >= mid) {
			x -= full;
		}
		return x;
	}

	function arcImpl(x, y, w, h, start, stop, mode, detail) {
		if (!$._doFill && !$._doStroke) return;
		let lo = normAng(start);
		let hi = normAng(stop);
		if (lo > hi) [lo, hi] = [hi, lo];
		if (lo == 0) {
			if (hi == 0) return;
			if (($._angleMode == $.DEGREES && hi == 360) || hi == $.TAU) {
				return $.ellipse(x, y, w, h);
			}
		}
		$.ctx.beginPath();
		for (let i = 0; i < detail + 1; i++) {
			let t = i / detail;
			let a = $.lerp(lo, hi, t);
			let dx = ($.cos(a) * w) / 2;
			let dy = ($.sin(a) * h) / 2;
			$.ctx[i ? 'lineTo' : 'moveTo'](x + dx, y + dy);
		}
		if (mode == $.CHORD) {
			$.ctx.closePath();
		} else if (mode == $.PIE) {
			$.ctx.lineTo(x, y);
			$.ctx.closePath();
		}
		if ($._doFill) $.ctx.fill();
		if ($._doStroke) $.ctx.stroke();
	}
	$.arc = (x, y, w, h, start, stop, mode, detail = 25) => {
		if (start == stop) return $.ellipse(x, y, w, h);
		mode ??= $.PIE;
		if ($._ellipseMode == $.CENTER) {
			arcImpl(x, y, w, h, start, stop, mode, detail);
		} else if ($._ellipseMode == $.RADIUS) {
			arcImpl(x, y, w * 2, h * 2, start, stop, mode, detail);
		} else if ($._ellipseMode == $.CORNER) {
			arcImpl(x + w / 2, y + h / 2, w, h, start, stop, mode, detail);
		} else if ($._ellipseMode == $.CORNERS) {
			arcImpl((x + w) / 2, (y + h) / 2, w - x, h - y, start, stop, mode, detail);
		}
	};

	function ellipseImpl(x, y, w, h) {
		if (!$._doFill && !$._doStroke) return;
		if ($._da) {
			x = $._sc(x);
			y = $._sc(y);
			w = $._sc(w);
			h = $._sc(h);
		}
		$.ctx.beginPath();
		$.ctx.ellipse(x, y, w / 2, h / 2, 0, 0, $.TAU);
		if ($._doFill) $.ctx.fill();
		if ($._doStroke) $.ctx.stroke();
	}
	$.ellipse = (x, y, w, h) => {
		h ??= w;
		if ($._ellipseMode == $.CENTER) {
			ellipseImpl(x, y, w, h);
		} else if ($._ellipseMode == $.RADIUS) {
			ellipseImpl(x, y, w * 2, h * 2);
		} else if ($._ellipseMode == $.CORNER) {
			ellipseImpl(x + w / 2, y + h / 2, w, h);
		} else if ($._ellipseMode == $.CORNERS) {
			ellipseImpl((x + w) / 2, (y + h) / 2, w - x, h - y);
		}
	};
	$.circle = (x, y, r) => {
		return $.ellipse(x, y, r, r);
	};
	$.point = (x, y) => {
		if (x.x) {
			y = x.y;
			x = x.x;
		}
		if ($._da) {
			x = $._sc(x);
			y = $._sc(y);
		}
		$.ctx.save();
		$.ctx.beginPath();
		$.ctx.arc(x, y, $.ctx.lineWidth / 2, 0, Math.PI * 2);
		$.ctx.fillStyle = $.ctx.strokeStyle;
		$.ctx.fill();
		$.ctx.restore();
	};
	function rectImpl(x, y, w, h) {
		if ($._da) {
			x = $._sc(x);
			y = $._sc(y);
			w = $._sc(w);
			h = $._sc(h);
		}
		if ($._doFill) $.ctx.fillRect(x, y, w, h);
		if ($._doStroke) $.ctx.strokeRect(x, y, w, h);
	}
	function roundedRectImpl(x, y, w, h, tl, tr, br, bl) {
		if (!$._doFill && !$._doStroke) return;
		if (tl === undefined) {
			return rectImpl(x, y, w, h);
		}
		if (tr === undefined) {
			return roundedRectImpl(x, y, w, h, tl, tl, tl, tl);
		}
		if ($._da) {
			x = $._sc(x);
			y = $._sc(y);
			w = $._sc(w);
			h = $._sc(h);
			tl = $._sc(tl);
			tr = $._sc(tr);
			bl = $._sc(bl);
			br = $._sc(br);
		}
		const hh = Math.min(Math.abs(h), Math.abs(w)) / 2;
		tl = Math.min(hh, tl);
		tr = Math.min(hh, tr);
		bl = Math.min(hh, bl);
		br = Math.min(hh, br);
		$.ctx.beginPath();
		$.ctx.moveTo(x + tl, y);
		$.ctx.arcTo(x + w, y, x + w, y + h, tr);
		$.ctx.arcTo(x + w, y + h, x, y + h, br);
		$.ctx.arcTo(x, y + h, x, y, bl);
		$.ctx.arcTo(x, y, x + w, y, tl);
		$.ctx.closePath();
		if ($._doFill) $.ctx.fill();
		if ($._doStroke) $.ctx.stroke();
	}

	$.rect = (x, y, w, h, tl, tr, br, bl) => {
		if ($._rectMode == $.CENTER) {
			roundedRectImpl(x - w / 2, y - h / 2, w, h, tl, tr, br, bl);
		} else if ($._rectMode == $.RADIUS) {
			roundedRectImpl(x - w, y - h, w * 2, h * 2, tl, tr, br, bl);
		} else if ($._rectMode == $.CORNER) {
			roundedRectImpl(x, y, w, h, tl, tr, br, bl);
		} else if ($._rectMode == $.CORNERS) {
			roundedRectImpl(x, y, w - x, h - y, tl, tr, br, bl);
		}
	};
	$.square = (x, y, s, tl, tr, br, bl) => {
		return $.rect(x, y, s, s, tl, tr, br, bl);
	};

	function clearBuff() {
		curveBuff = [];
	}

	$.beginShape = () => {
		clearBuff();
		$.ctx.beginPath();
		firstVertex = true;
	};
	$.beginContour = () => {
		$.ctx.closePath();
		clearBuff();
		firstVertex = true;
	};
	$.endContour = () => {
		clearBuff();
		firstVertex = true;
	};
	$.vertex = (x, y) => {
		if ($._da) {
			x = $._sc(x);
			y = $._sc(y);
		}
		clearBuff();
		if (firstVertex) {
			$.ctx.moveTo(x, y);
		} else {
			$.ctx.lineTo(x, y);
		}
		firstVertex = false;
	};
	$.bezierVertex = (cp1x, cp1y, cp2x, cp2y, x, y) => {
		if ($._da) {
			cp1x = $._sc(cp1x);
			cp1y = $._sc(cp1y);
			cp2x = $._sc(cp2x);
			cp2y = $._sc(cp2y);
			x = $._sc(x);
			y = $._sc(y);
		}
		clearBuff();
		$.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	};
	$.quadraticVertex = (cp1x, cp1y, x, y) => {
		if ($._da) {
			cp1x = $._sc(cp1x);
			cp1y = $._sc(cp1y);
			x = $._sc(x);
			y = $._sc(y);
		}
		clearBuff();
		$.ctx.quadraticCurveTo(cp1x, cp1y, x, y);
	};
	$.bezier = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.bezierVertex(x2, y2, x3, y3, x4, y4);
		$.endShape();
	};
	$.triangle = (x1, y1, x2, y2, x3, y3) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.endShape($.CLOSE);
	};
	$.quad = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.vertex(x4, y4);
		$.endShape($.CLOSE);
	};
	$.endShape = (close) => {
		clearBuff();
		if (close) {
			$.ctx.closePath();
		}
		if ($._doFill) $.ctx.fill();
		if ($._doStroke) $.ctx.stroke();
	};
	function catmullRomSpline(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, numPts, alpha) {
		function catmullromSplineGetT(t, p0x, p0y, p1x, p1y, alpha) {
			let a = Math.pow(p1x - p0x, 2.0) + Math.pow(p1y - p0y, 2.0);
			let b = Math.pow(a, alpha * 0.5);
			return b + t;
		}
		let pts = [];

		let t0 = 0.0;
		let t1 = catmullromSplineGetT(t0, p0x, p0y, p1x, p1y, alpha);
		let t2 = catmullromSplineGetT(t1, p1x, p1y, p2x, p2y, alpha);
		let t3 = catmullromSplineGetT(t2, p2x, p2y, p3x, p3y, alpha);

		for (let i = 0; i < numPts; i++) {
			let t = t1 + (i / (numPts - 1)) * (t2 - t1);
			let s = [
				(t1 - t) / (t1 - t0),
				(t - t0) / (t1 - t0),
				(t2 - t) / (t2 - t1),
				(t - t1) / (t2 - t1),
				(t3 - t) / (t3 - t2),
				(t - t2) / (t3 - t2),
				(t2 - t) / (t2 - t0),
				(t - t0) / (t2 - t0),
				(t3 - t) / (t3 - t1),
				(t - t1) / (t3 - t1)
			];
			for (let j = 0; j < s.length; j += 2) {
				if (isNaN(s[j])) {
					s[j] = 1;
					s[j + 1] = 0;
				}
				if (!isFinite(s[j])) {
					if (s[j] > 0) {
						s[j] = 1;
						s[j + 1] = 0;
					} else {
						s[j] = 0;
						s[j + 1] = 1;
					}
				}
			}
			let a1x = p0x * s[0] + p1x * s[1];
			let a1y = p0y * s[0] + p1y * s[1];
			let a2x = p1x * s[2] + p2x * s[3];
			let a2y = p1y * s[2] + p2y * s[3];
			let a3x = p2x * s[4] + p3x * s[5];
			let a3y = p2y * s[4] + p3y * s[5];
			let b1x = a1x * s[6] + a2x * s[7];
			let b1y = a1y * s[6] + a2y * s[7];
			let b2x = a2x * s[8] + a3x * s[9];
			let b2y = a2y * s[8] + a3y * s[9];
			let cx = b1x * s[2] + b2x * s[3];
			let cy = b1y * s[2] + b2y * s[3];
			pts.push([cx, cy]);
		}
		return pts;
	}

	$.curveVertex = (x, y) => {
		if ($._da) {
			x = $._sc(x);
			y = $._sc(y);
		}
		curveBuff.push([x, y]);
		if (curveBuff.length < 4) return;
		let p0 = curveBuff.at(-4);
		let p1 = curveBuff.at(-3);
		let p2 = curveBuff.at(-2);
		let p3 = curveBuff.at(-1);
		let pts = catmullRomSpline(...p0, ...p1, ...p2, ...p3, $._curveDetail, $._curveAlpha);
		for (let i = 0; i < pts.length; i++) {
			if (firstVertex) {
				$.ctx.moveTo(...pts[i]);
			} else {
				$.ctx.lineTo(...pts[i]);
			}
			firstVertex = false;
		}
	};
	$.curve = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.curveVertex(x1, y1);
		$.curveVertex(x2, y2);
		$.curveVertex(x3, y3);
		$.curveVertex(x4, y4);
		$.endShape();
	};
};
