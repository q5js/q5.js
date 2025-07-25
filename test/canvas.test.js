require('../q5-server.js');

let log = console.log;

test('q5-canvas-behavior', () => {
	const q = new Q5('instance');
	q.noLoop();

	// createCanvas sets up canvas and dimensions
	const canvas = q.createCanvas(32, 24);
	expect(q.canvas).toBe(canvas);
	expect(q.width).toBe(32);
	expect(q.height).toBe(24);
	expect(canvas.width).toBe(32);
	expect(canvas.height).toBe(24);
	expect(canvas.renderer).toBe('c2d');

	// background fills canvas with color
	q.background(0, 100, 0); // green
	expect(q.get(16, 12)).toEqual([0, 100, 0, 255]);

	q.clear();
	q.loadPixels();
	expect(q.get(16, 12)).toEqual([0, 0, 0, 0]);

	// fill and stroke set drawing colors
	q.fill('red');
	q.stroke('blue');
	expect(q.ctx.fillStyle).toBe('#ff0000');
	expect(q.ctx.strokeStyle).toBe('#0000ff');

	// noFill disables fill
	q.noFill();
	expect(q._doFill).toBe(false);

	// noStroke disables stroke
	q.stroke('red');
	q.noStroke();
	expect(q._doStroke).toBe(false);

	// strokeWeight sets line width
	q.strokeWeight(7);
	expect(q.ctx.lineWidth).toBe(7);

	// opacity sets global alpha
	q.opacity(0.3);
	expect(q.ctx.globalAlpha).toBeCloseTo(0.3);

	// resizeCanvas changes canvas size and width/height
	q.resizeCanvas(20, 30);
	expect(q.width).toBe(20);
	expect(q.height).toBe(30);
	expect(q.canvas.width).toBe(20);
	expect(q.canvas.height).toBe(30);

	// translate, rotate, scale affect transform
	const ctx = q.ctx;
	ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
	q.translate(2, 3);
	q.rotate(Math.PI / 2);
	q.scale(2, 2);
	const m = ctx.getTransform();
	expect(m.e).not.toBe(0); // translation
	expect(m.a).not.toBe(1); // scale/rotation

	// push/pop restores transform and style
	q.fill('red');
	q.push();
	q.fill('blue');
	q.translate(5, 5);
	q.pop();
	expect(q.ctx.fillStyle).toBe('#ff0000');
	const m2 = ctx.getTransform();
	expect(m2.e).toBe(2); // translation reset

	// createGraphics creates an offscreen buffer
	const gfx = q.createGraphics(10, 10);
	expect(gfx).toBeInstanceOf(Q5);
	expect(gfx.width).toBe(10);
	expect(gfx.height).toBe(10);
	expect(gfx.canvas).not.toBe(q.canvas);
});
