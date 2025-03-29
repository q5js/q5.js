Q5.modules.color = ($, q) => {
	$.RGB = $.RGBA = $.RGBHDR = $._colorMode = 'rgb';
	$.HSL = 'hsl';
	$.HSB = 'hsb';
	$.OKLCH = 'oklch';

	$.SRGB = 'srgb';
	$.DISPLAY_P3 = 'display-p3';

	$.colorMode = (mode, format, gamut) => {
		$._colorMode = mode;
		let srgb = $.canvas.colorSpace == 'srgb' || gamut == 'srgb';
		format ??= mode == 'rgb' ? ($._c2d || srgb ? 255 : 1) : 1;
		$._colorFormat = format == 'integer' || format == 255 ? 255 : 1;
		if (mode == 'oklch') {
			q.Color = Q5.ColorOKLCH;
		} else if (mode == 'hsl') {
			q.Color = srgb ? Q5.ColorHSL : Q5.ColorHSL_P3;
		} else if (mode == 'hsb') {
			q.Color = srgb ? Q5.ColorHSB : Q5.ColorHSB_P3;
		} else {
			if ($._colorFormat == 255) {
				q.Color = srgb ? Q5.ColorRGB_8 : Q5.ColorRGB_P3_8;
			} else {
				q.Color = srgb ? Q5.ColorRGB : Q5.ColorRGB_P3;
			}
			$._colorMode = 'rgb';
		}
	};

	$._namedColors = {
		aqua: [0, 255, 255],
		black: [0, 0, 0],
		blue: [0, 0, 255],
		brown: [165, 42, 42],
		crimson: [220, 20, 60],
		cyan: [0, 255, 255],
		darkviolet: [148, 0, 211],
		gold: [255, 215, 0],
		green: [0, 128, 0],
		gray: [128, 128, 128],
		grey: [128, 128, 128],
		hotpink: [255, 105, 180],
		indigo: [75, 0, 130],
		khaki: [240, 230, 140],
		lightgreen: [144, 238, 144],
		lime: [0, 255, 0],
		magenta: [255, 0, 255],
		navy: [0, 0, 128],
		orange: [255, 165, 0],
		olive: [128, 128, 0],
		peachpuff: [255, 218, 185],
		pink: [255, 192, 203],
		purple: [128, 0, 128],
		red: [255, 0, 0],
		skyblue: [135, 206, 235],
		tan: [210, 180, 140],
		turquoise: [64, 224, 208],
		transparent: [0, 0, 0, 0],
		white: [255, 255, 255],
		violet: [238, 130, 238],
		yellow: [255, 255, 0]
	};

	$.color = (c0, c1, c2, c3) => {
		let C = $.Color;
		if (c0._q5Color) return new C(...c0.levels);
		if (c1 == undefined) {
			if (typeof c0 == 'string') {
				if (c0[0] == '#') {
					if (c0.length <= 5) {
						if (c0.length > 4) c3 = parseInt(c0[4] + c0[4], 16);
						c2 = parseInt(c0[3] + c0[3], 16);
						c1 = parseInt(c0[2] + c0[2], 16);
						c0 = parseInt(c0[1] + c0[1], 16);
					} else {
						if (c0.length > 7) c3 = parseInt(c0.slice(7, 9), 16);
						c2 = parseInt(c0.slice(5, 7), 16);
						c1 = parseInt(c0.slice(3, 5), 16);
						c0 = parseInt(c0.slice(1, 3), 16);
					}
				} else if ($._namedColors[c0]) {
					[c0, c1, c2, c3] = $._namedColors[c0];
				} else {
					// css color string not parsed
					let c = new C(0, 0, 0);
					c._css = c0;
					c.toString = function () {
						return this._css;
					};
					return c;
				}

				if ($._colorFormat == 1) {
					c0 /= 255;
					if (c1) c1 /= 255;
					if (c2) c2 /= 255;
					if (c3) c3 /= 255;
				}
			}
			if (Array.isArray(c0) || c0.constructor == Float32Array) {
				[c0, c1, c2, c3] = c0;
			}
		}

		if (c2 == undefined) {
			if ($._colorMode == Q5.OKLCH) return new C(c0, 0, 0, c1);
			return new C(c0, c0, c0, c1);
		}
		return new C(c0, c1, c2, c3);
	};

	// deprecated
	$.red = (c) => c.r;
	$.green = (c) => c.g;
	$.blue = (c) => c.b;
	$.alpha = (c) => c.a;

	$.lightness = (c) => {
		if (c.l) return c.l;
		let l = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) * 100;
		return $._colorFormat == 255 ? l / 255 : l;
	};
	$.hue = (c) => {
		if (c.h) return c.h;
		let r = c.r;
		let g = c.g;
		let b = c.b;
		if ($._colorFormat == 255) {
			r /= 255;
			g /= 255;
			b /= 255;
		}
		let max = Math.max(r, g, b);
		let min = Math.min(r, g, b);
		let h;
		if (max == min) h = 0;
		else if (max == r) h = (60 * (g - b)) / (max - min);
		else if (max == g) h = (60 * (b - r)) / (max - min) + 120;
		else h = (60 * (r - g)) / (max - min) + 240;
		if (h < 0) h += 360;
		return h;
	};

	$.lerpColor = (a, b, t) => {
		t = Math.max(0, Math.min(1, t));
		if ($._colorMode == 'rgb') {
			return new $.Color($.lerp(a.r, b.r, t), $.lerp(a.g, b.g, t), $.lerp(a.b, b.b, t), $.lerp(a.a, b.a, t));
		} else {
			let deltaH = b.h - a.h;
			if (deltaH > 180) deltaH -= 360;
			if (deltaH < -180) deltaH += 360;
			let h = a.h + t * deltaH;
			if (h < 0) h += 360;
			if (h > 360) h -= 360;
			return new $.Color($.lerp(a.l, b.l, t), $.lerp(a.c, b.c, t), h, $.lerp(a.a, b.a, t));
		}
	};
};

// COLOR CLASSES

Q5.Color = class {
	constructor() {
		this._q5Color = true;
	}
	get alpha() {
		return this.a;
	}
	set alpha(v) {
		this.a = v;
	}
};

Q5.ColorOKLCH = class extends Q5.Color {
	constructor(l, c, h, a) {
		super();
		this.l = l;
		this.c = c;
		this.h = h;
		this.a = a ?? 1;
	}
	get levels() {
		return [this.l, this.c, this.h, this.a];
	}
	equals(c) {
		return c && this.l == c.l && this.c == c.c && this.h == c.h && this.a == c.a;
	}
	isSameColor(c) {
		return c && this.l == c.l && this.c == c.c && this.h == c.h;
	}
	toString() {
		return `oklch(${this.l} ${this.c} ${this.h} / ${this.a})`;
	}

	get lightness() {
		return this.l;
	}
	set lightness(v) {
		this.l = v;
	}
	get chroma() {
		return this.c;
	}
	set chroma(v) {
		this.c = v;
	}
	get hue() {
		return this.h;
	}
	set hue(v) {
		this.h = v;
	}
};

Q5.ColorRGB = class extends Q5.Color {
	constructor(r, g, b, a) {
		super();
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a ?? 1;
	}
	get levels() {
		return [this.r, this.g, this.b, this.a];
	}
	equals(c) {
		return c && this.r == c.r && this.g == c.g && this.b == c.b && this.a == c.a;
	}
	isSameColor(c) {
		return c && this.r == c.r && this.g == c.g && this.b == c.b;
	}
	toString() {
		return `color(srgb ${this.r} ${this.g} ${this.b} / ${this.a})`;
	}

	get red() {
		return this.r;
	}
	set red(v) {
		this.r = v;
	}
	get green() {
		return this.g;
	}
	set green(v) {
		this.g = v;
	}
	get blue() {
		return this.b;
	}
	set blue(v) {
		this.b = v;
	}
};

Q5.ColorRGB_P3 = class extends Q5.ColorRGB {
	toString() {
		return `color(display-p3 ${this.r} ${this.g} ${this.b} / ${this.a})`;
	}
};

// legacy 8-bit (0-255) integer color format, srgb color space
Q5.ColorRGB_8 = class extends Q5.ColorRGB {
	constructor(r, g, b, a) {
		super(r, g, b, a ?? 255);
	}
	// deprecated set functions for backwards compatibility
	setRed(v) {
		this.r = v;
	}
	setGreen(v) {
		this.g = v;
	}
	setBlue(v) {
		this.b = v;
	}
	setAlpha(v) {
		this.a = v;
	}
	toString() {
		return `rgb(${this.r} ${this.g} ${this.b} / ${this.a / 255})`;
	}
};

// p3 10-bit color in integer color format, for backwards compatibility
Q5.ColorRGB_P3_8 = class extends Q5.ColorRGB_8 {
	constructor(r, g, b, a) {
		super(r, g, b, a ?? 255);
		this._edited = true;
	}
	get r() {
		return this._r;
	}
	set r(v) {
		this._r = v;
		this._edited = true;
	}
	get g() {
		return this._g;
	}
	set g(v) {
		this._g = v;
		this._edited = true;
	}
	get b() {
		return this._b;
	}
	set b(v) {
		this._b = v;
		this._edited = true;
	}
	get a() {
		return this._a;
	}
	set a(v) {
		this._a = v;
		this._edited = true;
	}
	toString() {
		if (this._edited) {
			let r = (this._r / 255).toFixed(3);
			let g = (this._g / 255).toFixed(3);
			let b = (this._b / 255).toFixed(3);
			let a = (this._a / 255).toFixed(3);
			this._css = `color(display-p3 ${r} ${g} ${b} / ${a})`;
			this._edited = false;
		}
		return this._css;
	}
};

Q5.ColorHSL = class extends Q5.Color {
	constructor(h, s, l, a) {
		super();
		this.h = h;
		this.s = s;
		this.l = l;
		this.a = a ?? 1;
	}
	get levels() {
		return [this.h, this.s, this.l, this.a];
	}
	equals(c) {
		return c && this.h == c.h && this.s == c.s && this.l == c.l && this.a == c.a;
	}
	isSameColor(c) {
		return c && this.h == c.h && this.s == c.s && this.l == c.l;
	}
	toString() {
		return `hsl(${this.h} ${this.s} ${this.l} / ${this.a})`;
	}

	get hue() {
		return this.h;
	}
	set hue(v) {
		this.h = v;
	}
	get saturation() {
		return this.s;
	}
	set saturation(v) {
		this.s = v;
	}
	get lightness() {
		return this.l;
	}
	set lightness(v) {
		this.l = v;
	}
};

Q5.ColorHSL_P3 = class extends Q5.ColorHSL {
	toString() {
		let o = Q5.HSLtoRGB(this.h, this.s, this.l);
		return `color(display-p3 ${o.join(' ')} / ${this.a})`;
	}
};

Q5.ColorHSB = class extends Q5.ColorHSL {
	constructor(h, s, b, a) {
		super(h, s, b, a);
		delete this.l;
		this.b = b;
	}
	get levels() {
		return [this.h, this.s, this.b, this.a];
	}
	equals(c) {
		return c && this.h == c.h && this.s == c.s && this.b == c.b && this.a == c.a;
	}
	isSameColor(c) {
		return c && this.h == c.h && this.s == c.s && this.b == c.b;
	}
	toString() {
		let o = Q5.HSBtoHSL(this.h, this.s, this.b);
		return `hsl(${o.join(' ')} / ${this.a})`;
	}

	get v() {
		return this.b;
	}
	set v(v) {
		this.b = v;
	}
	get brightness() {
		return this.b;
	}
	set brightness(v) {
		this.b = v;
	}
	get value() {
		return this.b;
	}
	set value(v) {
		this.b = v;
	}
};

Q5.ColorHSB_P3 = class extends Q5.ColorHSB {
	toString() {
		let o = Q5.HSLtoRGB(...Q5.HSBtoHSL(this.h, this.s, this.b));
		return `color(display-p3 ${o.join(' ')} / ${this.a})`;
	}
};

Q5.HSLtoRGB = (h, s, l) => {
	l /= 100;
	let m = (s / 100) * Math.min(l, 1 - l);
	let f = (n, k = (n + h / 30) % 12) => l - m * Math.max(Math.min(k - 3, 9 - k, 1), -1);
	return [f(0), f(8), f(4)];
};

Q5.HSBtoHSL = (h, s, v, l = v * (1 - s / 200)) => [h, !l || l == 100 ? 0 : ((v - l) / Math.min(l, 100 - l)) * 100, l];

{
	const multiplyMatrices = (A, B) => [
		A[0] * B[0] + A[1] * B[1] + A[2] * B[2],
		A[3] * B[0] + A[4] * B[1] + A[5] * B[2],
		A[6] * B[0] + A[7] * B[1] + A[8] * B[2]
	];

	const oklch2oklab = (l, c, h) => [
		l,
		isNaN(h) ? 0 : c * Math.cos((h * Math.PI) / 180),
		isNaN(h) ? 0 : c * Math.sin((h * Math.PI) / 180)
	];

	const srgbLinear2rgb = (rgb) =>
		rgb.map((c) =>
			Math.max(
				0,
				Math.min(1, Math.abs(c) > 0.0031308 ? (c < 0 ? -1 : 1) * (1.055 * Math.abs(c) ** (1 / 2.4) - 0.055) : 12.92 * c)
			)
		);

	const oklab2xyz = (lab) => {
		const LMSg = multiplyMatrices(
			[
				1, 0.3963377773761749, 0.2158037573099136, 1, -0.1055613458156586, -0.0638541728258133, 1, -0.0894841775298119,
				-1.2914855480194092
			],
			lab
		);
		return multiplyMatrices(
			[
				1.2268798758459243, -0.5578149944602171, 0.2813910456659647, -0.0405757452148008, 1.112286803280317,
				-0.0717110580655164, -0.0763729366746601, -0.4214933324022432, 1.5869240198367816
			],
			LMSg.map((val) => val ** 3)
		);
	};
	const xyz2rgbLinear = (xyz) =>
		multiplyMatrices(
			[
				3.2409699419045226, -1.537383177570094, -0.4986107602930034, -0.9692436362808796, 1.8759675015077202,
				0.04155505740717559, 0.05563007969699366, -0.20397695888897652, 1.0569715142428786
			],
			xyz
		);

	Q5.OKLCHtoRGB = (l, c, h) => srgbLinear2rgb(xyz2rgbLinear(oklab2xyz(oklch2oklab(l, c, h))));
}
