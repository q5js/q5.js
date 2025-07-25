/* node testing */
require('../q5-server.js');

let log = console.log;

function q5ImageTest(resolve) {
	expect(Q5).toBeDefined();

	let q = new Q5('instance');

	q.createCanvas(200, 200);

	let icon = q.loadImage('./q5js_icon.png');

	q.background('silver');

	q.draw = function () {
		q.image(icon, 36, 36, 128, 128);

		q.canvas.save('test/test.png');

		q.noLoop();
		resolve();
	};
}

test('q5-image', () => new Promise(q5ImageTest));
