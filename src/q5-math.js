Q5.modules.math = ($) => {
	$.DEGREES = 'degrees';
	$.RADIANS = 'radians';

	$.PI = Math.PI;
	$.HALF_PI = Math.PI / 2;
	$.QUARTER_PI = Math.PI / 4;

	$.abs = Math.abs;
	$.ceil = Math.ceil;
	$.exp = Math.exp;
	$.floor = Math.floor;
	$.log = Math.log;
	$.mag = Math.hypot;
	$.max = Math.max;
	$.min = Math.min;
	$.round = Math.round;
	$.pow = Math.pow;
	$.sqrt = Math.sqrt;

	$.SHR3 = 1;
	$.LCG = 2;

	$.angleMode = (mode) => ($._angleMode = mode);
	$._DEGTORAD = Math.PI / 180;
	$._RADTODEG = 180 / Math.PI;
	$.degrees = (x) => x * $._RADTODEG;
	$.radians = (x) => x * $._DEGTORAD;

	$.map = (value, istart, istop, ostart, ostop, clamp) => {
		let val = ostart + (ostop - ostart) * (((value - istart) * 1.0) / (istop - istart));
		if (!clamp) {
			return val;
		}
		if (ostart < ostop) {
			return Math.min(Math.max(val, ostart), ostop);
		} else {
			return Math.min(Math.max(val, ostop), ostart);
		}
	};
	$.lerp = (a, b, t) => a * (1 - t) + b * t;
	$.constrain = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
	$.dist = function () {
		let a = arguments;
		if (a.length == 4) return Math.hypot(a[0] - a[2], a[1] - a[3]);
		else return Math.hypot(a[0] - a[3], a[1] - a[4], a[2] - a[5]);
	};
	$.norm = (value, start, stop) => $.map(value, start, stop, 0, 1);
	$.sq = (x) => x * x;
	$.fract = (x) => x - Math.floor(x);
	$.sin = (a) => {
		if ($._angleMode == 'degrees') a = $.radians(a);
		return Math.sin(a);
	};
	$.cos = (a) => {
		if ($._angleMode == 'degrees') a = $.radians(a);
		return Math.cos(a);
	};
	$.tan = (a) => {
		if ($._angleMode == 'degrees') a = $.radians(a);
		return Math.tan(a);
	};
	$.asin = (x) => {
		let a = Math.asin(x);
		if ($._angleMode == 'degrees') a = $.degrees(a);
		return a;
	};
	$.acos = (x) => {
		let a = Math.acos(x);
		if ($._angleMode == 'degrees') a = $.degrees(a);
		return a;
	};
	$.atan = (x) => {
		let a = Math.atan(x);
		if ($._angleMode == 'degrees') a = $.degrees(a);
		return a;
	};
	$.atan2 = (y, x) => {
		let a = Math.atan2(y, x);
		if ($._angleMode == 'degrees') a = $.degrees(a);
		return a;
	};

	function lcg() {
		const m = 4294967296;
		const a = 1664525;
		const c = 1013904223;
		let seed, z;
		return {
			setSeed(val) {
				z = seed = (val == null ? Math.random() * m : val) >>> 0;
			},
			getSeed() {
				return seed;
			},
			rand() {
				z = (a * z + c) % m;
				return z / m;
			}
		};
	}
	function shr3() {
		let jsr, seed;
		let m = 4294967295;
		return {
			setSeed(val) {
				jsr = seed = (val == null ? Math.random() * m : val) >>> 0;
			},
			getSeed() {
				return seed;
			},
			rand() {
				jsr ^= jsr << 17;
				jsr ^= jsr >> 13;
				jsr ^= jsr << 5;
				return (jsr >>> 0) / m;
			}
		};
	}
	let rng1 = shr3();
	rng1.setSeed();

	$.randomSeed = (seed) => rng1.setSeed(seed);
	$.random = (a, b) => {
		if (a === undefined) return rng1.rand();
		if (typeof a == 'number') {
			if (b !== undefined) {
				return rng1.rand() * (b - a) + a;
			} else {
				return rng1.rand() * a;
			}
		} else {
			return a[Math.trunc(a.length * rng1.rand())];
		}
	};
	$.randomGenerator = (method) => {
		if (method == $.LCG) rng1 = lcg();
		else if (method == $.SHR3) rng1 = shr3();
		rng1.setSeed();
	};

	var ziggurat = new (function () {
		var iz;
		var jz;
		var kn = new Array(128);
		var ke = new Array(256);
		var hz;
		var wn = new Array(128);
		var fn = new Array(128);
		var we = new Array(256);
		var fe = new Array(256);
		var SHR3 = () => {
			return rng1.rand() * 4294967296 - 2147483648;
		};
		var UNI = () => {
			return 0.5 + (SHR3() << 0) * 0.2328306e-9;
		};

		var RNOR = () => {
			hz = SHR3();
			iz = hz & 127;
			return Math.abs(hz) < kn[iz] ? hz * wn[iz] : nfix();
		};
		var REXP = () => {
			jz = SHR3() >>> 0;
			iz = jz & 255;
			return jz < kn[iz] ? jz * we[iz] : efix();
		};
		var nfix = () => {
			var r = 3.44262;
			var x, y;
			var u1, u2;
			for (;;) {
				x = hz * wn[iz];
				if (iz == 0) {
					do {
						u1 = UNI();
						u2 = UNI();
						x = -Math.log(u1) * 0.2904764;
						y = -Math.log(u2);
					} while (y + y < x * x);
					return hz > 0 ? r + x : -r - x;
				}

				if (fn[iz] + UNI() * (fn[iz - 1] - fn[iz]) < Math.exp(-0.5 * x * x)) {
					return x;
				}
				hz = SHR3();
				iz = hz & 127;
				if (Math.abs(hz) < kn[iz]) {
					return hz * wn[iz];
				}
			}
		};
		var efix = () => {
			var x;
			for (;;) {
				if (iz == 0) {
					return 7.69711 - Math.log(UNI());
				}
				x = jz * we[iz];
				if (fe[iz] + UNI() * (fe[iz - 1] - fe[iz]) < Math.exp(-x)) {
					return x;
				}
				jz = SHR3();
				iz = jz & 255;
				if (jz < ke[iz]) {
					return jz * we[iz];
				}
			}
		};

		var zigset = () => {
			var m1 = 2147483648;
			var m2 = 4294967296;
			var dn = 3.442619855899;
			var tn = dn;
			var vn = 9.91256303526217e-3;
			var q;
			var de = 7.697117470131487;
			var te = de;
			var ve = 3.949659822581572e-3;
			var i;

			/* Tables for RNOR */
			q = vn / Math.exp(-0.5 * dn * dn);
			kn[0] = Math.floor((dn / q) * m1);
			kn[1] = 0;
			wn[0] = q / m1;
			wn[127] = dn / m1;
			fn[0] = 1;
			fn[127] = Math.exp(-0.5 * dn * dn);
			for (i = 126; i >= 1; i--) {
				dn = Math.sqrt(-2 * Math.log(vn / dn + Math.exp(-0.5 * dn * dn)));
				kn[i + 1] = Math.floor((dn / tn) * m1);
				tn = dn;
				fn[i] = Math.exp(-0.5 * dn * dn);
				wn[i] = dn / m1;
			}
			/*Tables for REXP */
			q = ve / Math.exp(-de);
			ke[0] = Math.floor((de / q) * m2);
			ke[1] = 0;
			we[0] = q / m2;
			we[255] = de / m2;
			fe[0] = 1;
			fe[255] = Math.exp(-de);
			for (i = 254; i >= 1; i--) {
				de = -Math.log(ve / de + Math.exp(-de));
				ke[i + 1] = Math.floor((de / te) * m2);
				te = de;
				fe[i] = Math.exp(-de);
				we[i] = de / m2;
			}
		};
		this.SHR3 = SHR3;
		this.UNI = UNI;
		this.RNOR = RNOR;
		this.REXP = REXP;
		this.zigset = zigset;
	})();
	ziggurat.hasInit = false;

	$.randomGaussian = (mean, std) => {
		if (!ziggurat.hasInit) {
			ziggurat.zigset();
			ziggurat.hasInit = true;
		}
		return ziggurat.RNOR() * std + mean;
	};

	$.randomExponential = () => {
		if (!ziggurat.hasInit) {
			ziggurat.zigset();
			ziggurat.hasInit = true;
		}
		return ziggurat.REXP();
	};

	$.PERLIN = 'perlin';
	$.P5_PERLIN = 'p5-perlin';
	$.SIMPLEX = 'simplex';

	$.Noise = Q5.PerlinNoise;
	let _noise;

	$.noiseMode = (mode) => {
		if (mode == $.PERLIN) $.Noise = Q5.PerlinNoise;
		else if (mode == $.P5_PERLIN) $.Noise = Q5.P5PerlinNoise;
		// else if (mode == $.SIMPLEX) $.Noise = Q5.SimplexNoise;
	};
	$.noiseSeed = (seed) => {
		_noise = new $.Noise(seed);
	};
	$.noise = (x = 0, y = 0, z = 0) => {
		_noise ??= new $.Noise();
		return _noise.noise(x, y, z);
	};
	$.noiseDetail = (lod, falloff) => {
		_noise ??= new $.Noise();
		if (lod > 0) _noise.octaves = lod;
		if (falloff > 0) _noise.falloff = falloff;
	};
};

Q5.Noise = class {
	constructor() {}
};

Q5.PerlinNoise = class extends Q5.Noise {
	constructor(seed) {
		super();
		this.grad3 = [
			[1, 1, 0],
			[-1, 1, 0],
			[1, -1, 0],
			[-1, -1, 0],
			[1, 0, 1],
			[-1, 0, 1],
			[1, 0, -1],
			[-1, 0, -1],
			[0, 1, 1],
			[0, -1, 1],
			[0, 1, -1],
			[0, -1, -1]
		];
		this.octaves = 4;
		this.falloff = 0.25;
		this.p = Array.from({ length: 256 }, () => Math.floor(Math.random() * 256));
		if (seed !== undefined) {
			this.p = this.seedPermutation(seed);
		}
		this.perm = Array.from({ length: 512 }, (_, i) => this.p[i & 255]);
	}

	seedPermutation(seed) {
		let p = [];
		for (let i = 0; i < 256; i++) {
			p[i] = i;
		}

		let n, q;
		for (let i = 255; i > 0; i--) {
			seed = (seed * 16807) % 2147483647;
			n = seed % (i + 1);
			q = p[i];
			p[i] = p[n];
			p[n] = q;
		}

		return p;
	}

	dot(g, x, y, z) {
		return g[0] * x + g[1] * y + g[2] * z;
	}

	mix(a, b, t) {
		return (1 - t) * a + t * b;
	}

	fade(t) {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	noise(x, y, z) {
		let total = 0;
		let frequency = 1;
		let amplitude = 1;
		let maxAmplitude = 0;

		for (let i = 0; i < this.octaves; i++) {
			const X = Math.floor(x * frequency) & 255;
			const Y = Math.floor(y * frequency) & 255;
			const Z = Math.floor(z * frequency) & 255;

			const xf = x * frequency - Math.floor(x * frequency);
			const yf = y * frequency - Math.floor(y * frequency);
			const zf = z * frequency - Math.floor(z * frequency);

			const u = this.fade(xf);
			const v = this.fade(yf);
			const w = this.fade(zf);

			const A = this.perm[X] + Y;
			const AA = this.perm[A] + Z;
			const AB = this.perm[A + 1] + Z;
			const B = this.perm[X + 1] + Y;
			const BA = this.perm[B] + Z;
			const BB = this.perm[B + 1] + Z;

			const lerp1 = this.mix(
				this.dot(this.grad3[this.perm[AA] % 12], xf, yf, zf),
				this.dot(this.grad3[this.perm[BA] % 12], xf - 1, yf, zf),
				u
			);
			const lerp2 = this.mix(
				this.dot(this.grad3[this.perm[AB] % 12], xf, yf - 1, zf),
				this.dot(this.grad3[this.perm[BB] % 12], xf - 1, yf - 1, zf),
				u
			);
			const lerp3 = this.mix(
				this.dot(this.grad3[this.perm[AA + 1] % 12], xf, yf, zf - 1),
				this.dot(this.grad3[this.perm[BA + 1] % 12], xf - 1, yf, zf - 1),
				u
			);
			const lerp4 = this.mix(
				this.dot(this.grad3[this.perm[AB + 1] % 12], xf, yf - 1, zf - 1),
				this.dot(this.grad3[this.perm[BB + 1] % 12], xf - 1, yf - 1, zf - 1),
				u
			);

			const mix1 = this.mix(lerp1, lerp2, v);
			const mix2 = this.mix(lerp3, lerp4, v);

			total += this.mix(mix1, mix2, w) * amplitude;

			maxAmplitude += amplitude;
			amplitude *= this.falloff;
			frequency *= 2;
		}

		return total / maxAmplitude + 0.5;
	}
};

Q5.P5PerlinNoise = class extends Q5.Noise {
	constructor(seed) {
		super();
		this.YWRAPB = 4;
		this.YWRAP = 1 << this.YWRAPB;
		this.ZWRAPB = 8;
		this.ZWRAP = 1 << this.ZWRAPB;
		this.size = 4095;
		this.octaves = 4;
		this.falloff = 0.5;

		seed ??= Math.random() * 4294967295;
		this.perlin = new Array(this.size + 1);
		for (var i = 0; i < this.size + 1; i++) {
			seed ^= seed << 17;
			seed ^= seed >> 13;
			seed ^= seed << 5;
			this.perlin[i] = (seed >>> 0) / 4294967295;
		}
	}

	scaled_cosine(i) {
		return 0.5 * (1.0 - Math.cos(i * Math.PI));
	}

	noise(x = 0, y = 0, z = 0) {
		if (x < 0) x = -x;
		if (y < 0) y = -y;
		if (z < 0) z = -z;
		var xi = Math.floor(x),
			yi = Math.floor(y),
			zi = Math.floor(z);
		var xf = x - xi;
		var yf = y - yi;
		var zf = z - zi;
		var rxf, ryf;
		var r = 0;
		var ampl = 0.5;
		var n1, n2, n3;
		for (var o = 0; o < this.octaves; o++) {
			var f = xi + (yi << this.YWRAPB) + (zi << this.ZWRAPB);
			rxf = this.scaled_cosine(xf);
			ryf = this.scaled_cosine(yf);
			n1 = this.perlin[f & this.size];
			n1 += rxf * (this.perlin[(f + 1) & this.size] - n1);
			n2 = this.perlin[(f + this.YWRAP) & this.size];
			n2 += rxf * (this.perlin[(f + this.YWRAP + 1) & this.size] - n2);
			n1 += ryf * (n2 - n1);
			f += this.ZWRAP;
			n2 = this.perlin[f & this.size];
			n2 += rxf * (this.perlin[(f + 1) & this.size] - n2);
			n3 = this.perlin[(f + this.YWRAP) & this.size];
			n3 += rxf * (this.perlin[(f + this.YWRAP + 1) & this.size] - n3);
			n2 += ryf * (n3 - n2);
			n1 += this.scaled_cosine(zf) * (n2 - n1);
			r += n1 * ampl;
			ampl *= this.falloff;
			xi <<= 1;
			xf *= 2;
			yi <<= 1;
			yf *= 2;
			zi <<= 1;
			zf *= 2;
			if (xf >= 1.0) {
				xi++;
				xf--;
			}
			if (yf >= 1.0) {
				yi++;
				yf--;
			}
			if (zf >= 1.0) {
				zi++;
				zf--;
			}
		}
		return r;
	}
};
