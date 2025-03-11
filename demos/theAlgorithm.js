const NUM_PARTICLES = 1000;

let CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
CHARS += CHARS.toLowerCase() + '0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

let texts = [];

let q = await Q5.webgpu();

textFont('monospace');

q.setup = () => {
	// createCanvas();
	createCanvas(1920, 1080);
	pixelDensity(2);
	displayMode(MAXED);

	textAlign(CENTER, CENTER);

	for (let i = 0; i < NUM_PARTICLES; i++) {
		createParticle();
	}
};

function createParticle() {
	const angle = random(TWO_PI);
	const radius = random(2000);

	const particle = {
		x: cos(angle) * radius,
		y: sin(angle) * radius,
		char: random(CHARS),
		size: 2,
		rotation: random(TWO_PI)
	};

	texts.push(particle);
	return particle;
}

q.draw = () => {
	background(0.1, 0.1);

	fill(0.9, 1, 1);
	stroke(0.8, 0.9, 0.9);
	strokeWeight(0.5);

	// sort by distance from center, so that the
	// closest particles to center are drawn last
	texts.sort((a, b) => a.dist - b.dist);

	for (let t of texts) {
		translate(t.x, t.y);
		rotate(t.rotation);
		textSize(t.size);
		text(t.char, 0, 0);
		resetMatrix();

		// reset if too close to center
		if (abs(t.x) < 10 && abs(t.y) < 10) {
			const angle = random(TWO_PI);
			t.x = cos(angle) * 2000;
			t.y = sin(angle) * 2000;
			t.size = (frameCount % 3000) / 10;
			t.rotation = random(TWO_PI);
		} else {
			// update
			t.x *= 0.98;
			t.y *= 0.98;
			t.size -= 0.5;
			t.dist = dist(t.x, t.y, 0, 0);
			t.rotation += 0.02;
		}
	}

	fill(0.1, 0);
	stroke(0.1, 0.1);
	strokeWeight(width / 100);
	textSize(width / 3);
	text('q5 js', 0, 0);
};
