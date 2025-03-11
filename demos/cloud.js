const NUM_RECTS = 10000;
let rects = [];

let q = await Q5.webgpu();

// createCanvas();
createCanvas(1920, 1080);
pixelDensity(2);
displayMode(MAXED);

for (let i = 0; i < NUM_RECTS; i++) {
	rects.push({
		x: 0,
		y: 0,
		size: 1,
		speed: random(0.001, 0.02)
	});
}

rectMode(CENTER);

q.draw = () => {
	background(0.1, 0.2);

	fill(0.5, 0.9, 1, 0.1);
	noStroke();

	for (let i = 0; i < rects.length; i++) {
		let s = rects[i];

		if (s.size < 0.05 || random() < 0.005) {
			s.x = cos((frameCount + i) * 0.01) * width;
			s.y = sin((frameCount + i) * 0.01) * height;
			s.size = 50;
		} else {
			s.x = lerp(s.x, 0, s.speed);
			s.y = lerp(s.y, 0, s.speed);
			s.size -= s.speed * s.size;
		}

		square(s.x, s.y, s.size);
	}
};
