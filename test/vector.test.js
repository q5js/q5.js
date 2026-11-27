require('../q5-server.js');

function vectorTest() {
	let q = new Q5('namespace');

	// Construction and defaults
	let v = q.createVector();
	expect([v.x, v.y, v.z]).toEqual([0, 0, 0]);
	v = q.createVector(1, 2);
	expect([v.x, v.y, v.z]).toEqual([1, 2, 0]);
	v = q.createVector(1, 2, 3);
	expect([v.x, v.y, v.z]).toEqual([1, 2, 3]);

	// set, with numbers and with another vector
	v.set(4, 5, 6);
	expect([v.x, v.y, v.z]).toEqual([4, 5, 6]);
	v.set(q.createVector(7, 8, 9));
	expect([v.x, v.y, v.z]).toEqual([7, 8, 9]);

	// copy is independent
	let orig = q.createVector(1, 2, 3);
	let copy = orig.copy();
	expect([copy.x, copy.y, copy.z]).toEqual([1, 2, 3]);
	copy.x = 99;
	expect(orig.x).toBe(1);

	// add, sub, mult, div: vector, component and scalar forms
	v = q.createVector(1, 2, 3);
	v.add(10, 20, 30);
	expect([v.x, v.y, v.z]).toEqual([11, 22, 33]);
	v.add(q.createVector(1, 1, 1));
	expect([v.x, v.y, v.z]).toEqual([12, 23, 34]);
	v.add(1);
	expect([v.x, v.y, v.z]).toEqual([13, 24, 35]);

	v = q.createVector(5, 5, 5);
	v.sub(1, 2, 3);
	expect([v.x, v.y, v.z]).toEqual([4, 3, 2]);
	v.sub(1);
	expect([v.x, v.y, v.z]).toEqual([3, 2, 1]);

	v = q.createVector(1, 2, 3);
	v.mult(2);
	expect([v.x, v.y, v.z]).toEqual([2, 4, 6]);
	v.mult(2, 3, 4);
	expect([v.x, v.y, v.z]).toEqual([4, 12, 24]);

	v = q.createVector(6, 8, 10);
	v.div(2);
	expect([v.x, v.y, v.z]).toEqual([3, 4, 5]);
	v.div(0);
	expect([v.x, v.y, v.z]).toEqual([0, 0, 0]);

	// rem
	v = q.createVector(7, 8, 9);
	v.rem(3);
	expect([v.x, v.y, v.z]).toEqual([1, 2, 0]);

	// mag, magSq, normalize, limit, setMag
	v = q.createVector(3, 4, 0);
	expect(v.mag()).toBe(5);
	expect(v.magSq()).toBe(25);
	v.normalize();
	expect(v.x).toBeCloseTo(0.6);
	expect(v.y).toBeCloseTo(0.8);
	expect(v.z).toBe(0);
	expect(v.mag()).toBeCloseTo(1);

	v = q.createVector(3, 4, 0);
	v.limit(2.5);
	expect(v.mag()).toBeCloseTo(2.5);
	expect(v.x).toBeCloseTo(1.5);
	expect(v.y).toBeCloseTo(2);
	v = q.createVector(1, 1, 0);
	v.limit(10);
	expect([v.x, v.y]).toEqual([1, 1]);

	v = q.createVector(3, 4, 0);
	v.setMag(10);
	expect([v.x, v.y, v.z]).toEqual([6, 8, 0]);

	// dot, cross, dist
	v = q.createVector(1, 2, 3);
	expect(v.dot(4, 5, 6)).toBe(32);
	expect(v.dot(q.createVector(4, 5, 6))).toBe(32);
	v = q.createVector(1, 0, 0);
	v.cross(0, 1, 0);
	expect([v.x, v.y, v.z]).toEqual([0, 0, 1]);
	v = q.createVector(0, 0, 0);
	expect(v.dist(3, 4, 0)).toBe(5);
	expect(v.dist(q.createVector(3, 4, 0))).toBe(5);

	// heading, direction, setDirection, rotate, angleBetween
	v = q.createVector(1, 0);
	expect(v.heading()).toBe(0);
	v = q.createVector(0, 1);
	expect(v.heading()).toBeCloseTo(q.HALF_PI);
	v = q.createVector(-1, 0);
	expect(v.heading()).toBeCloseTo(q.PI);
	v = q.createVector(3, 4);
	v.setDirection(0);
	expect(v.x).toBeCloseTo(5);
	expect(v.y).toBeCloseTo(0);
	v = q.createVector(1, 0);
	v.rotate(q.HALF_PI);
	expect(v.x).toBeCloseTo(0);
	expect(v.y).toBeCloseTo(1);
	v = q.createVector(1, 0);
	expect(v.angleBetween(0, 1)).toBeCloseTo(q.HALF_PI);

	// lerp: halfway, 0 and 1
	v = q.createVector(0, 0, 0);
	v.lerp(10, 10, 10, 0.5);
	expect([v.x, v.y, v.z]).toEqual([5, 5, 5]);
	v = q.createVector(1, 2, 3);
	v.lerp(10, 10, 10, 0);
	expect([v.x, v.y, v.z]).toEqual([1, 2, 3]);
	v.lerp(10, 10, 10, 1);
	expect([v.x, v.y, v.z]).toEqual([10, 10, 10]);

	// slerp: halfway between perpendicular unit vectors is at 45 degrees
	v = q.createVector(1, 0, 0);
	v.slerp(q.createVector(0, 1, 0), 0.5);
	expect(v.x).toBeCloseTo(Math.SQRT1_2);
	expect(v.y).toBeCloseTo(Math.SQRT1_2);
	expect(v.z).toBe(0);

	// equals, array, toString
	v = q.createVector(1, 2, 3);
	expect(v.equals(q.createVector(1, 2, 3))).toBe(true);
	expect(v.equals(q.createVector(1, 2, 4))).toBe(false);
	expect(v.equals(q.createVector(1.0001, 2, 3), 0.001)).toBe(true);
	expect(v.array()).toEqual([1, 2, 3]);
	expect(v.toString()).toBe('[1, 2, 3]');

	// fromAngle / fromAngles
	v = q.createVector().fromAngle(0);
	expect([v.x, v.y, v.z]).toEqual([1, 0, 0]);
	v = q.createVector().fromAngle(q.HALF_PI, 2);
	expect(v.x).toBeCloseTo(0);
	expect(v.y).toBeCloseTo(2);
	v = q.createVector().fromAngles(0, 0, 1);
	expect(v.x).toBeCloseTo(0);
	expect(v.y).toBeCloseTo(-1);
	expect(v.z).toBeCloseTo(0);

	// random2D / random3D are unit vectors
	v = q.createVector().random2D();
	expect(v.mag()).toBeCloseTo(1);
	expect(v.z).toBe(0);
	v = q.createVector().random3D();
	expect(v.mag()).toBeCloseTo(1);

	// reflect across a horizontal normal flips the y component
	v = q.createVector(1, -1, 0);
	v.reflect(q.createVector(0, 1, 0));
	expect([v.x, v.y, v.z]).toEqual([1, 1, 0]);

	// Static methods do not mutate their inputs
	let a = q.createVector(1, 2, 3);
	let b = q.createVector(4, 5, 6);
	let c = Q5.Vector.add(a, b);
	expect([c.x, c.y, c.z]).toEqual([5, 7, 9]);
	expect([a.x, a.y, a.z]).toEqual([1, 2, 3]);
	c = Q5.Vector.sub(b, a);
	expect([c.x, c.y, c.z]).toEqual([3, 3, 3]);
	c = Q5.Vector.mult(a, 2);
	expect([c.x, c.y, c.z]).toEqual([2, 4, 6]);
	c = Q5.Vector.div(b, 2);
	expect([c.x, c.y, c.z]).toEqual([2, 2.5, 3]);
	expect(Q5.Vector.dot(a, b)).toBe(32);
	expect(Q5.Vector.dist(a, b)).toBeCloseTo(Math.sqrt(27));
	expect(Q5.Vector.mag(q.createVector(3, 4, 0))).toBe(5);
	expect(Q5.Vector.magSq(q.createVector(3, 4, 0))).toBe(25);
	expect(Q5.Vector.equals(a, a.copy())).toBe(true);
	c = Q5.Vector.normalize(q.createVector(3, 4, 0));
	expect(c.x).toBeCloseTo(0.6);
	expect(c.y).toBeCloseTo(0.8);
	c = Q5.Vector.limit(q.createVector(3, 4, 0), 2.5);
	expect(c.mag()).toBeCloseTo(2.5);
	c = Q5.Vector.lerp(a, b, 0.5);
	expect([c.x, c.y, c.z]).toEqual([2.5, 3.5, 4.5]);
	c = Q5.Vector.cross(q.createVector(1, 0, 0), q.createVector(0, 1, 0));
	expect([c.x, c.y, c.z]).toEqual([0, 0, 1]);
	c = Q5.Vector.reflect(q.createVector(1, -1, 0), q.createVector(0, 1, 0));
	expect([c.x, c.y, c.z]).toEqual([1, 1, 0]);
}

test('q5-vector', vectorTest);
