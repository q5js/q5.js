import { expect, test } from "bun:test";

import "../q5-server.js";

let log = console.log;

test("q5 core", () => {
	expect(Q5).toBeDefined();

	log('testing with q5.js ' + Q5.version);

	let q = new Q5('instance');

	expect(q.createCanvas).toBeDefined();
	expect(q.canvas).toBeFalsy();

	q.createCanvas(100, 100);

	expect(q.canvas).toBeTruthy();
	expect(q.canvas.width).toBe(100);
	expect(q.canvas.height).toBe(100);
});
