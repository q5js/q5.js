/* additional noise algorithms */
Q5.SimplexNoise = class extends Q5.NoiseGenerator {
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

		this.octaves = 1;
		this.falloff = 0.5;

		if (seed === undefined) {
			this.p = Array.from({ length: 256 }, () => Math.floor(Math.random() * 256));
		} else {
			this.p = this.seedPermutation(seed);
		}
		this.perm = Array.from({ length: 512 }, (_, i) => this.p[i & 255]);

		this.F3 = 1.0 / 3.0;
		this.G3 = 1.0 / 6.0;
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

	noise(xin, yin, zin) {
		let total = 0;
		let freq = 1;
		let amp = 1;
		let maxAmp = 0;

		for (let i = 0; i < this.octaves; i++) {
			let n0, n1, n2, n3;
			let s = (xin * freq + yin * freq + zin * freq) * this.F3;
			let i = Math.floor(xin * freq + s);
			let j = Math.floor(yin * freq + s);
			let k = Math.floor(zin * freq + s);
			let t = (i + j + k) * this.G3;
			let X0 = i - t;
			let Y0 = j - t;
			let Z0 = k - t;
			let x0 = xin * freq - X0;
			let y0 = yin * freq - Y0;
			let z0 = zin * freq - Z0;

			let i1, j1, k1;
			let i2, j2, k2;

			if (x0 >= y0) {
				if (y0 >= z0) {
					i1 = 1;
					j1 = 0;
					k1 = 0;
					i2 = 1;
					j2 = 1;
					k2 = 0;
				} else if (x0 >= z0) {
					i1 = 1;
					j1 = 0;
					k1 = 0;
					i2 = 1;
					j2 = 0;
					k2 = 1;
				} else {
					i1 = 0;
					j1 = 0;
					k1 = 1;
					i2 = 1;
					j2 = 0;
					k2 = 1;
				}
			} else {
				if (y0 < z0) {
					i1 = 0;
					j1 = 0;
					k1 = 1;
					i2 = 0;
					j2 = 1;
					k2 = 1;
				} else if (x0 < z0) {
					i1 = 0;
					j1 = 1;
					k1 = 0;
					i2 = 0;
					j2 = 1;
					k2 = 1;
				} else {
					i1 = 0;
					j1 = 1;
					k1 = 0;
					i2 = 1;
					j2 = 1;
					k2 = 0;
				}
			}

			let x1 = x0 - i1 + this.G3;
			let y1 = y0 - j1 + this.G3;
			let z1 = z0 - k1 + this.G3;
			let x2 = x0 - i2 + 2.0 * this.G3;
			let y2 = y0 - j2 + 2.0 * this.G3;
			let z2 = z0 - k2 + 2.0 * this.G3;
			let x3 = x0 - 1.0 + 3.0 * this.G3;
			let y3 = y0 - 1.0 + 3.0 * this.G3;
			let z3 = z0 - 1.0 + 3.0 * this.G3;

			let ii = i & 255;
			let jj = j & 255;
			let kk = k & 255;

			let gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
			let gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
			let gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
			let gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;

			let t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
			if (t0 < 0) n0 = 0.0;
			else {
				t0 *= t0;
				n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
			}

			let t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
			if (t1 < 0) n1 = 0.0;
			else {
				t1 *= t1;
				n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
			}

			let t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
			if (t2 < 0) n2 = 0.0;
			else {
				t2 *= t2;
				n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2);
			}

			let t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
			if (t3 < 0) n3 = 0.0;
			else {
				t3 *= t3;
				n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
			}

			total += 32.0 * (n0 + n1 + n2 + n3) * amp;

			maxAmp += amp;
			amp *= this.falloff;
			freq *= 2;
		}

		return (total / maxAmp + 1) / 2;
	}
};

Q5.BlockyNoise = class extends Q5.NoiseGenerator {
	constructor(seed) {
		super();
		this.YWRAPB = 4;
		this.YWRAP = 1 << this.YWRAPB;
		this.ZWRAPB = 8;
		this.ZWRAP = 1 << this.ZWRAPB;
		this.size = 4095;
		this.octaves = 1;
		this.falloff = 0.5;

		seed ??= Math.random() * 4294967295;
		this.p = new Array(this.size + 1);
		for (var i = 0; i < this.size + 1; i++) {
			seed ^= seed << 17;
			seed ^= seed >> 13;
			seed ^= seed << 5;
			this.p[i] = (seed >>> 0) / 4294967295;
		}
	}

	scaled_cosine(i) {
		return 0.5 * (1.0 - Math.cos(i * Math.PI));
	}

	noise(x = 0, y = 0, z = 0) {
		let t = this;
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
		var amp = 0.5;
		var n1, n2, n3;
		for (var o = 0; o < t.octaves; o++) {
			var f = xi + (yi << t.YWRAPB) + (zi << t.ZWRAPB);
			rxf = t.scaled_cosine(xf);
			ryf = t.scaled_cosine(yf);
			n1 = t.p[f & t.size];
			n1 += rxf * (t.p[(f + 1) & t.size] - n1);
			n2 = t.p[(f + t.YWRAP) & t.size];
			n2 += rxf * (t.p[(f + t.YWRAP + 1) & t.size] - n2);
			n1 += ryf * (n2 - n1);
			f += t.ZWRAP;
			n2 = t.p[f & t.size];
			n2 += rxf * (t.p[(f + 1) & t.size] - n2);
			n3 = t.p[(f + t.YWRAP) & t.size];
			n3 += rxf * (t.p[(f + t.YWRAP + 1) & t.size] - n3);
			n2 += ryf * (n3 - n2);
			n1 += t.scaled_cosine(zf) * (n2 - n1);
			r += n1 * amp;
			amp *= t.falloff;
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
