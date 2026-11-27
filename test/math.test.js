require('../q5-server.js');

function mathTest() {
	let q = new Q5('namespace');

	// Constants
	expect(q.PI).toBe(Math.PI);
	expect(q.HALF_PI).toBe(Math.PI / 2);
	expect(q.QUARTER_PI).toBe(Math.PI / 4);
	expect(q.TWO_PI).toBe(Math.PI * 2);
	expect(q.TAU).toBe(q.TWO_PI);
	expect(q.RADIANS).toBe(0);
	expect(q.DEGREES).toBe(1);

	// Math passthroughs
	expect(q.abs(-5)).toBe(5);
	expect(q.ceil(1.1)).toBe(2);
	expect(q.floor(1.9)).toBe(1);
	expect(q.exp(0)).toBe(1);
	expect(q.loge(Math.E)).toBeCloseTo(1);
	expect(q.max(1, 2, 3)).toBe(3);
	expect(q.min(1, 2, 3)).toBe(1);
	expect(q.pow(2, 10)).toBe(1024);
	expect(q.sqrt(16)).toBe(4);
	expect(q.mag(3, 4)).toBe(5);
	expect(q.mag(1, 2, 2)).toBe(3);

	// map, with and without clamping
	expect(q.map(5, 0, 10, 0, 100)).toBe(50);
	expect(q.map(5, 0, 10, 100, 0)).toBe(50);
	expect(q.map(15, 0, 10, 0, 100)).toBe(150);
	expect(q.map(15, 0, 10, 0, 100, true)).toBe(100);
	expect(q.map(-5, 0, 10, 0, 100, true)).toBe(0);
	expect(q.map(15, 0, 10, 100, 0, true)).toBe(0);
	expect(q.map(-5, 0, 10, 100, 0, true)).toBe(100);

	// dist: 2 points, 4 coords, 6 coords
	expect(q.dist(0, 0, 3, 4)).toBe(5);
	expect(q.dist(0, 0, 0, 3, 4, 0)).toBe(5);
	expect(q.dist(q.createVector(0, 0), q.createVector(3, 4))).toBe(5);

	// lerp, constrain, norm, sq, fract
	expect(q.lerp(0, 10, 0.5)).toBe(5);
	expect(q.lerp(10, 20, 0)).toBe(10);
	expect(q.lerp(10, 20, 1)).toBe(20);
	expect(q.constrain(5, 0, 10)).toBe(5);
	expect(q.constrain(-1, 0, 10)).toBe(0);
	expect(q.constrain(11, 0, 10)).toBe(10);
	expect(q.norm(5, 0, 10)).toBe(0.5);
	expect(q.norm(25, 0, 100)).toBe(0.25);
	expect(q.sq(4)).toBe(16);
	expect(q.sq(-3)).toBe(9);
	expect(q.fract(1.5)).toBe(0.5);
	expect(q.fract(-1.5)).toBe(0.5);

	// round, with and without decimal places
	expect(q.round(1.5)).toBe(2);
	expect(q.round(1.4)).toBe(1);
	expect(q.round(1.234, 2)).toBe(1.23);
	expect(q.round(3.14159, 2)).toBe(3.14);
	expect(q.round(3.14159)).toBe(3);

	// degrees / radians conversion
	expect(q.degrees(q.PI)).toBeCloseTo(180);
	expect(q.radians(180)).toBeCloseTo(q.PI);
	expect(q.degrees(q.HALF_PI)).toBeCloseTo(90);
	expect(q.radians(90)).toBeCloseTo(q.HALF_PI);

	// Trig in radians (the default angle mode)
	expect(q.angleMode('radians')).toBe('radians');
	expect(q.sin(q.HALF_PI)).toBeCloseTo(1);
	expect(q.cos(0)).toBe(1);
	expect(q.tan(0)).toBe(0);
	expect(q.asin(1)).toBeCloseTo(q.HALF_PI);
	expect(q.acos(1)).toBeCloseTo(0);
	expect(q.atan(1)).toBeCloseTo(q.QUARTER_PI);
	expect(q.atan2(1, 1)).toBeCloseTo(q.QUARTER_PI);

	// Trig in degrees
	expect(q.angleMode('degrees')).toBe('degrees');
	expect(q.sin(90)).toBeCloseTo(1);
	expect(q.cos(180)).toBeCloseTo(-1);
	expect(q.tan(45)).toBeCloseTo(1);
	expect(q.asin(1)).toBeCloseTo(90);
	expect(q.acos(1)).toBeCloseTo(0);
	expect(q.atan(1)).toBeCloseTo(45);
	expect(q.atan2(1, 1)).toBeCloseTo(45);
	// Restore the default mode so other tests are unaffected
	expect(q.angleMode('radians')).toBe('radians');
	expect(q.sin(q.HALF_PI)).toBeCloseTo(1);

	// Seeded random: same seed gives the same sequence
	q.randomSeed(42);
	let a = [q.random(), q.random(), q.random()];
	q.randomSeed(42);
	let b = [q.random(), q.random(), q.random()];
	expect(a).toEqual(b);
	// A different seed gives a different sequence
	q.randomSeed(7);
	let c = q.random();
	expect(c).not.toBe(a[0]);
	// Ranges
	let r = q.random();
	expect(r).toBeGreaterThanOrEqual(0);
	expect(r).toBeLessThan(1);
	r = q.random(10);
	expect(r).toBeGreaterThanOrEqual(0);
	expect(r).toBeLessThan(10);
	r = q.random(5, 10);
	expect(r).toBeGreaterThanOrEqual(5);
	expect(r).toBeLessThan(10);
	expect(['a', 'b', 'c']).toContain(q.random(['a', 'b', 'c']));

	// Seeded noise: same seed gives the same value, output stays in [0, 1]
	q.noiseSeed(42);
	let n1 = q.noise(0.5);
	q.noiseSeed(42);
	let n2 = q.noise(0.5);
	expect(n1).toBe(n2);
	expect(q.noise(0, 0, 0)).toBeCloseTo(0.5);
	for (let x of [0.1, 1.7, 3.3, 10]) {
		let n = q.noise(x);
		expect(n).toBeGreaterThanOrEqual(0);
		expect(n).toBeLessThanOrEqual(1);
	}
}

test('q5-math', mathTest);
