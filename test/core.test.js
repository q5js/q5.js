/* node testing */
// import '../q5-server.js';

/* bun testing */
// import { expect, test } from 'bun:test';
// import '../q5-server.js';

/* deno testing */
import { expect } from '@std/expect';
import '../q5-deno-server.js';
let test = Deno.test;

let log = console.log;

test(async function coreTest() {
	return new Promise((resolve) => {
		expect(Q5).toBeDefined();

		log('q5 v' + Q5.version);

		let q = new Q5('instance');

		q.createCanvas(200, 200);
		expect(q.canvas).toBeTruthy();
		expect(q.canvas.width).toBe(200);
		expect(q.canvas.height).toBe(200);

		q.background('silver');

		q.draw = function () {
			expect(q.frameCount).toBe(1);

			q.canvas.save('test/test.png');

			q.noLoop();
			resolve();
		};
	});
});
