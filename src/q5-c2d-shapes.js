Q5.renderers.c2d.shapes = ($) => {
	$._doStroke = true;
	$._doFill = true;
	$._strokeSet = false;
	$._fillSet = false;
	$._ellipseMode = Q5.CENTER;
	$._rectMode = Q5.CORNER;

	let firstVertex = true;
	let curveBuff = [];

	function ink() {
		if ($._doFill) $.ctx.fill();
		if ($._doStroke) $.ctx.stroke();
	}

	// DRAWING SETTINGS

	$.blendMode = (x) => ($.ctx.globalCompositeOperation = x);
	$.strokeCap = (x) => ($.ctx.lineCap = x);
	$.strokeJoin = (x) => ($.ctx.lineJoin = x);
	$.ellipseMode = (x) => ($._ellipseMode = x);
	$.rectMode = (x) => ($._rectMode = x);
	$.curveDetail = () => {};

	// DRAWING

	$.line = (x0, y0, x1, y1) => {
		if ($._doStroke) {
			$._da && ((x0 *= $._da), (y0 *= $._da), (x1 *= $._da), (y1 *= $._da));
			$.ctx.beginPath();
			$.ctx.moveTo(x0, y0);
			$.ctx.lineTo(x1, y1);
			$.ctx.stroke();
		}
	};

	const TAU = Math.PI * 2;

	function arc(x, y, w, h, lo, hi, mode) {
		if ($._angleMode) {
			lo = $.radians(lo);
			hi = $.radians(hi);
		}
		lo %= TAU;
		hi %= TAU;
		if (lo < 0) lo += TAU;
		if (hi < 0) hi += TAU;
		if (lo > hi) hi += TAU;
		if (lo == hi) return $.ellipse(x, y, w, h);

		w /= 2;
		h /= 2;

		w = Math.abs(w);
		h = Math.abs(h);

		if (!$._doFill && mode == $.PIE_OPEN) mode = $.CHORD_OPEN;

		$.ctx.beginPath();
		$.ctx.ellipse(x, y, w, h, 0, lo, hi);
		if (mode == $.PIE || mode == $.PIE_OPEN) $.ctx.lineTo(x, y);
		if ($._doFill) $.ctx.fill();

		if ($._doStroke) {
			if (mode == $.PIE || mode == $.CHORD) $.ctx.closePath();
			if (mode != $.PIE_OPEN) return $.ctx.stroke();

			$.ctx.beginPath();
			$.ctx.ellipse(x, y, w, h, 0, lo, hi);
			$.ctx.stroke();
		}
	}

	$.arc = (x, y, w, h, start, stop, mode) => {
		if (start == stop) return $.ellipse(x, y, w, h);

		if ($._da) {
			x *= $._da;
			y *= $._da;
			w *= $._da;
			h *= $._da;
		}
		mode ??= $.PIE_OPEN;

		if ($._ellipseMode == $.CENTER) {
			arc(x, y, w, h, start, stop, mode);
		} else if ($._ellipseMode == $.RADIUS) {
			arc(x, y, w * 2, h * 2, start, stop, mode);
		} else if ($._ellipseMode == $.CORNER) {
			arc(x + w / 2, y + h / 2, w, h, start, stop, mode);
		} else if ($._ellipseMode == $.CORNERS) {
			arc((x + w) / 2, (y + h) / 2, w - x, h - y, start, stop, mode);
		}
	};

	function ellipse(x, y, w, h) {
		$.ctx.beginPath();
		$.ctx.ellipse(x, y, Math.abs(w / 2), Math.abs(h / 2), 0, 0, TAU);
		ink();
	}

	$.ellipse = (x, y, w, h) => {
		h ??= w;
		if ($._da) {
			x *= $._da;
			y *= $._da;
			w *= $._da;
			h *= $._da;
		}
		if ($._ellipseMode == $.CENTER) {
			ellipse(x, y, w, h);
		} else if ($._ellipseMode == $.RADIUS) {
			ellipse(x, y, w * 2, h * 2);
		} else if ($._ellipseMode == $.CORNER) {
			ellipse(x + w / 2, y + h / 2, w, h);
		} else if ($._ellipseMode == $.CORNERS) {
			ellipse((x + w) / 2, (y + h) / 2, w - x, h - y);
		}
	};

	$.circle = (x, y, d) => {
		if ($._ellipseMode == $.CENTER) {
			if ($._da) {
				x *= $._da;
				y *= $._da;
				d *= $._da;
			}
			$.ctx.beginPath();
			$.ctx.arc(x, y, Math.abs(d / 2), 0, TAU);
			ink();
		} else $.ellipse(x, y, d, d);
	};

	$.point = (x, y) => {
		if ($._doStroke) {
			if (x.x) {
				y = x.y;
				x = x.x;
			}
			if ($._da) {
				x *= $._da;
				y *= $._da;
			}
			$.ctx.beginPath();
			$.ctx.moveTo(x, y);
			$.ctx.lineTo(x, y);
			$.ctx.stroke();
		}
	};

	function rect(x, y, w, h) {
		if ($._da) {
			x *= $._da;
			y *= $._da;
			w *= $._da;
			h *= $._da;
		}
		$.ctx.beginPath();
		$.ctx.rect(x, y, w, h);
		ink();
	}

	function roundedRect(x, y, w, h, tl, tr, br, bl) {
		if (tl === undefined) {
			return rect(x, y, w, h);
		}
		if (tr === undefined) {
			return roundedRect(x, y, w, h, tl, tl, tl, tl);
		}
		if ($._da) {
			x *= $._da;
			y *= $._da;
			w *= $._da;
			h *= $._da;
			tl *= $._da;
			tr *= $._da;
			bl *= $._da;
			br *= $._da;
		}
		$.ctx.roundRect(x, y, w, h, [tl, tr, br, bl]);
		ink();
	}

	$.rect = (x, y, w, h = w, tl, tr, br, bl) => {
		if ($._rectMode == $.CENTER) {
			roundedRect(x - w / 2, y - h / 2, w, h, tl, tr, br, bl);
		} else if ($._rectMode == $.RADIUS) {
			roundedRect(x - w, y - h, w * 2, h * 2, tl, tr, br, bl);
		} else if ($._rectMode == $.CORNER) {
			roundedRect(x, y, w, h, tl, tr, br, bl);
		} else if ($._rectMode == $.CORNERS) {
			roundedRect(x, y, w - x, h - y, tl, tr, br, bl);
		}
	};

	$.square = (x, y, s, tl, tr, br, bl) => {
		return $.rect(x, y, s, s, tl, tr, br, bl);
	};

	$.beginShape = () => {
		curveBuff = [];
		$.ctx.beginPath();
		firstVertex = true;
	};

	$.beginContour = () => {
		$.ctx.closePath();
		curveBuff = [];
		firstVertex = true;
	};

	$.endContour = () => {
		curveBuff = [];
		firstVertex = true;
	};

	$.vertex = (x, y) => {
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		curveBuff = [];
		if (firstVertex) {
			$.ctx.moveTo(x, y);
		} else {
			$.ctx.lineTo(x, y);
		}
		firstVertex = false;
	};

	$.bezierVertex = (cp1x, cp1y, cp2x, cp2y, x, y) => {
		if ($._da) {
			cp1x *= $._da;
			cp1y *= $._da;
			cp2x *= $._da;
			cp2y *= $._da;
			x *= $._da;
			y *= $._da;
		}
		curveBuff = [];
		$.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	};

	$.quadraticVertex = (cp1x, cp1y, x, y) => {
		if ($._da) {
			cp1x *= $._da;
			cp1y *= $._da;
			x *= $._da;
			y *= $._da;
		}
		curveBuff = [];
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
		curveBuff = [];
		if (close) $.ctx.closePath();
		ink();
	};

	$.curveVertex = (x, y) => {
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		curveBuff.push([x, y]);
		if (curveBuff.length < 4) return;

		let p0 = curveBuff.at(-4),
			p1 = curveBuff.at(-3),
			p2 = curveBuff.at(-2),
			p3 = curveBuff.at(-1);

		let cp1x = p1[0] + (p2[0] - p0[0]) / 6,
			cp1y = p1[1] + (p2[1] - p0[1]) / 6,
			cp2x = p2[0] - (p3[0] - p1[0]) / 6,
			cp2y = p2[1] - (p3[1] - p1[1]) / 6;

		if (firstVertex) {
			$.ctx.moveTo(p1[0], p1[1]);
			firstVertex = false;
		}
		$.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
	};

	$.curve = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.curveVertex(x1, y1);
		$.curveVertex(x2, y2);
		$.curveVertex(x3, y3);
		$.curveVertex(x4, y4);
		$.endShape();
	};

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

	$.erase = function (fillAlpha, strokeAlpha) {
		if ($._colorFormat == 255) {
			if (fillAlpha) fillAlpha /= 255;
			if (strokeAlpha) strokeAlpha /= 255;
		}
		$.ctx.save();
		$.ctx.globalCompositeOperation = 'destination-out';
		$.ctx.fillStyle = `rgb(0 0 0 / ${fillAlpha || 1})`;
		$.ctx.strokeStyle = `rgb(0 0 0 / ${strokeAlpha || 1})`;
	};

	$.noErase = function () {
		$.ctx.globalCompositeOperation = 'source-over';
		$.ctx.restore();
	};

	$.inFill = (x, y) => {
		const pd = $._pixelDensity;
		return $.ctx.isPointInPath(x * pd, y * pd);
	};

	$.inStroke = (x, y) => {
		const pd = $._pixelDensity;
		return $.ctx.isPointInStroke(x * pd, y * pd);
	};
};
