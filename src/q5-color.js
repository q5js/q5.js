Q5.modules.color = ($) => {
	$.RGB = $.RGBA = $._colorMode = 'rgb';

	if (Q5.supportsHDR) $.Color = Q5.ColorRGBA_P3;
	else $.Color = Q5.ColorRGBA;

	$.colorMode = (mode) => {
		$._colorMode = mode;
		if (mode == 'oklch') {
			$.Color = Q5.ColorOKLCH;
		} else if (mode == 'rgb') {
			if ($.canvas.colorSpace == 'srgb') $.Color = Q5.ColorRGBA;
			else $.Color = Q5.ColorRGBA_P3;
		} else if (mode == 'srgb') {
			$.Color = Q5.ColorRGBA;
			$._colorMode = 'rgb';
		}
	};

	$._basicColors = {
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

	$.color = function (c0, c1, c2, c3) {
		let C = $.Color;
		if (c0._q5Color) return new C(...c0.levels);
		let args = arguments;
		if (args.length == 1) {
			if (typeof c0 == 'string') {
				if (c0[0] == '#') {
					return new C(
						parseInt(c0.slice(1, 3), 16),
						parseInt(c0.slice(3, 5), 16),
						parseInt(c0.slice(5, 7), 16),
						c0.length != 9 ? null : parseInt(c0.slice(7, 9), 16)
					);
				} else if ($._basicColors[c0]) return new C(...$._basicColors[c0]);
				else return new C(0, 0, 0);
			} else if (Array.isArray(c0)) return new C(...c0);
		}
		if ($._colorMode == 'rgb') {
			if (args.length == 1) return new C(c0, c0, c0);
			else if (args.length == 2) return new C(c0, c0, c0, c1);
			else if (args.length == 3) return new C(c0, c1, c2);
			else if (args.length == 4) return new C(c0, c1, c2, c3);
		}
	};

	$.red = (c) => c.r;
	$.green = (c) => c.g;
	$.blue = (c) => c.b;
	$.alpha = (c) => c.a;
	$.lightness = (c) => {
		return ((0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) * 100) / 255;
	};

	$.lerpColor = (a, b, t) => {
		if ($._colorMode == 'rgb') {
			return new $.Color(
				$.constrain($.lerp(a.r, b.r, t), 0, 255),
				$.constrain($.lerp(a.g, b.g, t), 0, 255),
				$.constrain($.lerp(a.b, b.b, t), 0, 255),
				$.constrain($.lerp(a.a, b.a, t), 0, 255)
			);
		} else {
			let deltaH = b.h - a.h;
			if (deltaH > 180) deltaH -= 360;
			if (deltaH < -180) deltaH += 360;
			let h = a.h + t * deltaH;
			if (h < 0) h += 360;
			if (h > 360) h -= 360;
			return new $.Color(
				$.constrain($.lerp(a.l, b.l, t), 0, 100),
				$.constrain($.lerp(a.c, b.c, t), 0, 100),
				h,
				$.constrain($.lerp(a.a, b.a, t), 0, 255)
			);
		}
	};
};

// COLOR CLASSES

Q5.Color = class {
	constructor() {
		this._q5Color = true;
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
	toString() {
		return `color(oklch ${this.l} ${this.c} ${this.h} / ${this.a})`;
	}
};
Q5.ColorRGBA = class extends Q5.Color {
	constructor(r, g, b, a) {
		super();
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a ?? 255;
	}
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
	get levels() {
		return [this.r, this.g, this.b, this.a];
	}
	toString() {
		return `rgb(${this.r} ${this.g} ${this.b} / ${this.a / 255})`;
	}
};
Q5.ColorRGBA_P3 = class extends Q5.ColorRGBA {
	constructor(r, g, b, a) {
		super(r, g, b, a);
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
