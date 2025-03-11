let images = [];
let brightScale = 4;
const BRIGHTNESS_LEVELS = 32;
let emojiSize = 36;
let gap = 12;
let scalar = 10;
let noiseScale = 0.005; // Controls how smooth the noise pattern is

let w, h, flutter;

let q = await Q5.webgpu();

// createCanvas();
createCanvas(1920, 1080);
pixelDensity(2);
displayMode(MAXED);

w = width / 3;
h = height / 3;
noScroll();
textSize(emojiSize);

let emoji = createTextImage('⚡️');

// create images with different brightness levels
for (let i = 0; i < BRIGHTNESS_LEVELS; i++) {
	let img = emoji.copy();
	img.filter(INVERT);
	img.filter(BRIGHTNESS, (i / BRIGHTNESS_LEVELS) * brightScale);
	images.push(img);
}

textSize(windowWidth / 8);
textAlign(CENTER, CENTER);
noStroke();

q.draw = () => {
	// use noise to create a dynamic, gradient background
	let n = noise(frameCount * 0.01) / 2 + 0.5;
	beginShape();
	fill(0.125 * n, 0.25 * n, 0.4 * n, 0.3);
	vertex(-width, -height);
	fill(0.12 * n, 0.25 * n, 0.6 * n, 0.3);
	vertex(width, -height);
	fill(0.125 * n, 0.25 * n, 0.8 * n, 0.3);
	vertex(width, height);
	fill(0.2 * n, 0.3 * n, 1, 0.3);
	vertex(-width, height);
	endShape(CLOSE);

	scale(scalar);
	rotate(frameCount * 0.001);

	for (let i = -w; i < w; i += gap - 2) {
		for (let j = -h; j < h; j += gap) {
			// Use 3D noise for animation (x, y, time)
			let noiseVal = Math.max(0, Math.min(1, noise(i * noiseScale, j * noiseScale, frameCount * 0.01)));

			// Map noise value (0-1) to brightness levels
			let index = floor(map(noiseVal, 0, 1, 0, BRIGHTNESS_LEVELS));
			image(images[index], i + noiseVal * 200 - 100, j - noiseVal * 200 + 100, 13, 17);
		}
	}

	resetMatrix();
	scale(scalar * scalar);
	fill(0.95, 1, 1);

	text('q5.js WebGPU', 0, 0);

	// animate scalar
	if (scalar > 1) scalar -= 0.098 / (16 - scalar);
};

q.mouseWheel = (e) => {
	scalar += e.deltaY / 1000;
};
