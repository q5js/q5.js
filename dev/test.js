let img;

function preload() {
	img = loadImage('/q5js_brand.webp');
}

function setup() {
	canvas = createCanvas(windowWidth, windowWidth * 0.8, { alpha: true });

	flexibleCanvas(500);

	//width and height global vars return pixels not adjusted width and height

	//adjusted width would be 500
	//adjusted height would be 750 (width adjusted for aspect ratio)

	//actual width and height are canvas dimensions in pixels
	console.log(width);
	console.log(height);
	// noLoop();
}

function draw() {
	background(100, 100, 250);

	// Draw a pink square.
	fill(250, 100, 100);
	beginShape();
	vertex(20, 20);
	vertex(80, 20);
	vertex(80, 80);
	vertex(20, 80);
	endShape(CLOSE);

	// Draw a curve using curveVertex.
	beginShape();
	curveVertex(100, 100);
	curveVertex(150, 50);
	curveVertex(200, 200);
	curveVertex(250, 150);
	endShape();

	push();
	translate(100, 300);
	rotate(PI / 6);
	beginShape();
	vertex(0, 0);
	bezierVertex(50, -50, 100, 100, 150, -150);
	endShape();
	pop();

	// Draw a bezier curve using bezierVertex.
	beginShape();
	vertex(300, 300);
	bezierVertex(350, 250, 400, 400, 450, 350);
	endShape();

	// Erase a circular area.
	strokeWeight(5);
	point(50, 50);
	line(60, 60, 90, 90);
	erase(150, 255);
	circle(25, 30, 15);
	noErase();

	image(img, 300, 50, 70, 70);

	// Create a new graphics buffer
	pg = createGraphics(200, 200);
	pg.flexibleCanvas(200);
	pg.background(200, 200, 250);
	pg.fill(255, 0, 0);
	pg.circle(pg.width / 2, pg.height / 2, 100);

	// Display the graphics buffer on the main canvas
	image(pg, 300, 150, 70, 70);

	//   noLoop();
	//   textSize(32);
	//   textAlign(CENTER, CENTER);
	//   textStyle(BOLD);
	//   textLeading(40);

	//   text("Hello", width / 2, height / 2);
	//   text("World", width / 2, height / 2 + 40);
}

function windowResized() {
	resizeCanvas(windowWidth, windowWidth * 0.8);
}
