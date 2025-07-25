/* node testing */
require('../q5-server.js');

/* bun testing */
// import { expect, test } from 'bun:test';
// import '../q5-server.js';

/* deno testing */
// import { expect } from '@std/expect';
// import '../q5-deno-server.js';
// let test = Deno.test;

let log = console.log;

function q5CoreTest(resolve) {
	expect(Q5).toBeDefined();

	let q = new Q5('instance');

	q.createCanvas(200, 200);
	expect(q.canvas).toBeTruthy();

	// Test frameRate and getTargetFrameRate
	expect(q.getTargetFrameRate()).toBe(60);
	q.frameRate(120);
	expect(q.getTargetFrameRate()).toBe(120);

	// Test background
	q.background(100);

	let c = q.color(255, 0, 0);
	expect(c).toBeDefined();
	expect(c.r).toBe(255);
	expect(c.g).toBe(0);
	expect(c.b).toBe(0);
	expect(c.a).toBe(255);
	expect(c.levels).toEqual([255, 0, 0, 255]);

	// Test drawing shapes
	q.fill('blue');
	q.stroke('red');
	q.strokeWeight(4);
	q.circle(100, 100, 50);
	q.rect(10, 10, 30, 40);

	// Test text
	q.textSize(20);
	q.text('Hello', 50, 50);

	// Test variables
	expect(q.width).toBe(200);
	expect(q.height).toBe(200);
	expect(q.frameCount).toBe(0);

	// Test event hooks
	let mousePressedCalled = false;
	q.mousePressed = function () {
		mousePressedCalled = true;
	};
	// Simulate mousePressed
	if (typeof window !== 'undefined') {
		let evt = new window.MouseEvent('mousedown');
		q.canvas.dispatchEvent(evt);
		expect(mousePressedCalled).toBe(true);
	}

	// Test noLoop and loop
	q.noLoop();
	expect(q._loop).toBeFalsy();
	q.loop();
	expect(q._loop).toBeTruthy();

	// Test draw loop
	q.draw = function () {
		expect(q.frameCount).toBe(1);
		q.noLoop();
		resolve();
	};

	// Test postProcess hook exists
	expect(typeof q.postProcess).toBe('function');

	// Test redraw
	expect(() => q.redraw()).not.toThrow();

	// Test usePromiseLoading
	expect(() => q.usePromiseLoading(true)).not.toThrow();

	// Test Q5 static properties
	expect(Q5.disableFriendlyErrors).toBeFalsy();
	expect(Q5.errorTolerant).toBeFalsy();
	expect(typeof Q5.canvasOptions).toBe('object');
	expect(typeof Q5.modules).toBe('object');

	// Test Q5 static methods
	expect(typeof Q5.addHook).toBe('function');
	expect(typeof Q5.registerAddon).toBe('function');

	// Test Q5.Image constructor
	let img = new Q5.Image(10, 10);
	expect(img.width).toBe(10);
	expect(img.height).toBe(10);

	// Test Q5.WebGPU static method (should be async)
	if (Q5.WebGPU) {
		expect(typeof Q5.WebGPU).toBe('function');
	}
}

test('q5-core', () => new Promise(q5CoreTest));
