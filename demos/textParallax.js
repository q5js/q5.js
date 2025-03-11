const PARALLAX = 0.3;
const SPACING_FACTOR = 1.1;
const MAX_LAYERS = 50;

let activeLayers = MAX_LAYERS;

// Create exponential spacing arrays
let layers = Array(activeLayers)
	.fill()
	.map((_, i) => ({
		time: 1,
		xSpacing: 40 * SPACING_FACTOR ** i,
		ySpacing: 8 * SPACING_FACTOR ** i
	}));

let q = await Q5.webgpu();

// createCanvas();
createCanvas(1920, 1080);
pixelDensity(2);
displayMode(MAXED);

textSize(20);
textAlign(CENTER, CENTER);

q.draw = () => {
	activeLayers = floor(map(mouseX, -halfWidth, halfWidth, 1, MAX_LAYERS));

	for (let l = 0; l < activeLayers; l++) {
		let layer = layers[l];
		layer.time += (l + 1) * 0.1;
		if (layer.time > 300) layer.time = 1;

		let layerZoom = exp(layer.time * 0.01);
		let depth = (l + layerZoom) / activeLayers;
		let offsetX = mouseX * PARALLAX * depth;
		let offsetY = mouseY * PARALLAX * depth;

		let xAmt = 2;
		let yAmt = l;
		for (let i = -yAmt; i <= yAmt; i++) {
			for (let j = -xAmt; j <= xAmt; j++) {
				let f = frameCount * 0.001 * (i + j) * depth;
				let r = 0.5 + 0.4 * sin(f + depth * PI);
				let g = 0.5 + 0.4 * sin(f + depth * PI * 1.5);
				let b = 0.5 + 0.4 * sin(f + depth * PI * 2);
				fill(r, g, b, (300 - layer.time) / 300);

				let xSpacing = layer.xSpacing * (1 + layerZoom);
				let ySpacing = layer.ySpacing * (1 + layerZoom);
				let x = j * xSpacing + offsetX;
				let y = i * ySpacing + offsetY;

				translate(x, y);
				scale(map(depth, 0, 1, 0.5, 2) * (1 + layerZoom));
				text('q5.js', 0, 0);
				resetMatrix();
			}
		}
	}
};
