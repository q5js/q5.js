/* additional noise algorithms */
Q5.BlockyNoise = class extends Q5.Noise {
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
