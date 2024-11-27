import { expect } from '@std/expect';
import '../q5-deno-server.js';

let log = console.log;

Deno.test(async function coreTest() {
	expect(Q5).toBeDefined();

	log('q5 v' + Q5.version);

	let q = new Q5('instance');

	return new Promise((resolve) => {
		q.setup = function () {
			q.createCanvas(200, 200);
			expect(q.canvas).toBeTruthy();
			expect(q.canvas.width).toBe(200);
			expect(q.canvas.height).toBe(200);

			q.background('silver');

			q.noLoop();
		};

		q.draw = function () {
			expect(q.frameCount).toBe(1);
			resolve();
		};
	});
});
