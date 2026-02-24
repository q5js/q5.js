createCanvas();

let speedMod = 1;
let draggedLava = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

class Lava {
	constructor(x, y, r) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.d = r * 2;
		this.maxSize = this.d * 2;
		this.xSpeed = random(-0.5, 0.5);
		this.ySpeed = random(-0.5, -2);
		this.res = r < 25 ? 5 : 8;
		this.resF = this.res + 2;
		this.offsets = Array.from({ length: this.res }, () => random(-5, 5));
		this.noiseOffsets = Array.from({ length: this.res }, () => random(1000));
		this.layer = round(random(1, 4));
	}

	move() {
		if (!this.dragging) {
			this.x += this.xSpeed;
			this.y += this.ySpeed * speedMod;
			if (this.y < -this.maxSize) {
				this.x = random(width);
				this.y = height + this.d;
			}
		}

		for (let i = 0; i < this.offsets.length; i++) {
			this.offsets[i] = map(noise(this.noiseOffsets[i]), 0, 1, 0, this.d);
			this.noiseOffsets[i] += this.hovered ? 0.025 : 0.005;
		}
	}

	show() {
		push();
		if (darkMode) fill(183, 235, 255, 25 * this.layer);
		else fill(0, 25 * this.layer);

		if (this.hovered) strokeWeight(2);
		else strokeWeight(1);

		translate(this.x, this.y);

		beginShape();
		for (let i = 0; i <= this.resF; i++) {
			let rad = (i * TAU) / this.res;
			let r = this.r + this.offsets[i % this.offsets.length];
			curveVertex(r * cos(rad), r * sin(rad));
		}
		endShape();

		if (mouseX || mouseY) {
			this.hovered = inFill(mouseX, mouseY);

			if (this.hovered && mouseIsPressed) {
				if (!draggedLava) {
					this.dragging = true;
					draggedLava = this;
					dragOffsetX = this.x - mouseX;
					dragOffsetY = this.y - mouseY;
					cursor('grabbing');
				}
			} else if (this.hovered) {
				cursor('grab');
			}
		} else this.hovered = false;

		pop();
	}
}

let darkMode = false;
let lavas = [];
let looping = true;
let amount = floor(width / 40);
for (let i = 0; i < amount; i++) {
	let l = new Lava(random(width), random(height), random(10, 100));
	lavas.push(l);
}
let blue = color(183, 235, 255, 64);
let black = color(0, 64);

function draw() {
	darkMode = document.body.classList.contains('dark');
	background(darkMode ? black : blue);

	for (let l of lavas) {
		l.move();
		l.show();
	}
}

function mouseDragged() {
	if (draggedLava) {
		draggedLava.x = mouseX + dragOffsetX;
		draggedLava.y = mouseY + dragOffsetY;
		return false;
	}
}

function mouseReleased() {
	if (draggedLava) {
		draggedLava.dragging = false;
		draggedLava = null;
	}
	mouseX = mouseY = 0;
}

function mouseWheel() {
	return true;
}

function windowResized() {
	resizeCanvas();
}

// Prevent initial transition
document.body.classList.add('no-transition');

document.getElementById('fullscreenIcon').addEventListener('click', () => {
	if (document.fullscreenElement) document.exitFullscreen();
	else document.documentElement.requestFullscreen();
});

document.getElementById('darkModeIcon').addEventListener('click', () => {
	setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
});

function handleScroll() {
	if (window.scrollY > 50) {
		// Adjust the scroll position as needed
		document.body.classList.add('nav-fixed');
	} else {
		document.body.classList.remove('nav-fixed');
	}
}

window.addEventListener('scroll', handleScroll);
handleScroll();

// Enable transitions after a moment
requestAnimationFrame(() => {
	requestAnimationFrame(() => {
		document.body.classList.remove('no-transition');
	});
});

// -------------------------------------------------------------
// ANIMATION ORCHESTRATOR
// -------------------------------------------------------------
const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const id = entry.target.id;
				if (id === 'part1' && !entry.target.dataset.played) {
					initPart1();
					entry.target.dataset.played = 'true';
				}
				if (id === 'part2' && !entry.target.dataset.played) {
					initPart2();
					entry.target.dataset.played = 'true';
				}
				if (id === 'part3' && !entry.target.dataset.played) {
					initPart3();
					entry.target.dataset.played = 'true';
				}
				if (id === 'part4' && !entry.target.dataset.played) {
					initPart4();
					entry.target.dataset.played = 'true';
				}
				if (id === 'part5' && !entry.target.dataset.played) {
					initPart5();
					entry.target.dataset.played = 'true';
				}
				if (id === 'part6' && !entry.target.dataset.played) {
					initPart6();
					entry.target.dataset.played = 'true';
				}
			}
		});
	},
	{ threshold: 0.5 }
);

document.querySelectorAll('section').forEach((section) => observer.observe(section));

// -------------------------------------------------------------
// PART 1
// -------------------------------------------------------------
function initPart1() {
	gsap.globalTimeline.timeScale(1.0); // Sped up a bit for presentation
	const codeEl = document.getElementById('code1');
	const header = document.getElementById('header1');
	const lh = window.innerWidth < 900 ? 26 : 32;

	function highlight(text) {
		return hljs.highlight(text || ' ', { language: 'js' }).value;
	}

	function makeLine(text, index) {
		const el = document.createElement('span');
		el.className = 'line';
		el.style.top = `${index * lh}px`;
		el.innerHTML = highlight(text);
		codeEl.appendChild(el);
		return el;
	}

	function animateHeight(lines, duration = 0.5) {
		gsap.to(codeEl, {
			height: lines * lh,
			duration,
			ease: 'power2.inOut'
		});
	}

	// Initial p5 code
	const lines = [
		makeLine('let icon;', 0),
		makeLine('function preload() {', 1),
		makeLine("  icon = loadImage('icon.png');", 2),
		makeLine('}', 3),
		makeLine('', 4),
		makeLine('function setup() {', 5),
		makeLine('  createCanvas(200, 200, WEBGL);', 6),
		makeLine('}', 7),
		makeLine('', 8),
		makeLine('function draw() {', 9),
		makeLine('  background(icon);', 10),
		makeLine('}', 11)
	];

	// Initial height
	animateHeight(12, 0);

	const iconLoadLine = lines[2];
	const blank2 = lines[8];
	const drawStart = lines[9];
	const drawBody = lines[10];
	const drawEnd = lines[11];

	const toRemove = [
		lines[0],
		lines[1],
		lines[3], // preload block (except content)
		lines[4], // blank
		lines[5],
		lines[6],
		lines[7] // setup block
	];

	// Delay slighty
	const tl = gsap.timeline({ delay: 0.5 });

	// Fade out removing lines
	tl.to(toRemove, {
		opacity: 0,
		y: -8,
		duration: 1.2
	});

	tl.addLabel('morphStart');

	// Height shrinks
	tl.call(() => animateHeight(7), null, 'morphStart');

	// Move surviving code to new positions
	tl.to(
		[iconLoadLine, blank2, drawStart, drawBody, drawEnd],
		{
			top: (i) => (i + 2) * lh,
			duration: 0.6,
			ease: 'power2.inOut'
		},
		'morphStart'
	);

	// Insert "await Canvas(200);" at top
	const canvasLine = makeLine('', 0);

	tl.to(
		{ i: 0 },
		{
			i: 'await Canvas(200);'.length,
			duration: 0.8,
			ease: 'none',
			onUpdate() {
				// Hack to fix 'this' context in GSAP
				canvasLine.innerHTML = highlight('await Canvas(200);'.slice(0, Math.floor(this.targets()[0].i)));
			}
		},
		'morphStart'
	);

	// "  icon = loadImage('icon.png');" -> "let icon = load('icon.png');"
	tl.to(
		{ i: 5 },
		{
			i: 0,
			duration: 0.2,
			ease: 'none',
			onUpdate() {
				iconLoadLine.innerHTML = highlight(
					'  icon = load' + 'Image'.slice(0, Math.floor(this.targets()[0].i)) + "('icon.png');"
				);
			}
		},
		'<0.2'
	);

	tl.to(
		{ i: 2 },
		{
			i: 0,
			duration: 0.1,
			ease: 'none',
			onUpdate() {
				iconLoadLine.innerHTML = highlight('  '.slice(0, Math.floor(this.targets()[0].i)) + "icon = load('icon.png');");
			}
		}
	);

	const iconInsert = 'let ';

	tl.to(
		{ i: 0 },
		{
			i: iconInsert.length,
			duration: iconInsert.length * 0.04,
			ease: 'none',
			onUpdate() {
				iconLoadLine.innerHTML = highlight(
					iconInsert.slice(0, Math.floor(this.targets()[0].i)) + "icon = load('icon.png');"
				);
			}
		}
	);

	// function draw() {} → q5.draw = function() {}
	tl.to(
		{ i: 4 },
		{
			i: 0,
			duration: 0.25,
			ease: 'none',
			onUpdate() {
				drawStart.innerHTML = highlight('function ' + 'draw'.slice(0, Math.floor(this.targets()[0].i)) + '() {');
			}
		},
		'<0.3'
	);

	const insert = 'q5.draw = ';
	tl.to(
		{ i: 0 },
		{
			i: insert.length,
			duration: insert.length * 0.04,
			ease: 'none',
			onUpdate() {
				drawStart.innerHTML = highlight(insert.slice(0, Math.floor(this.targets()[0].i)) + 'function() {');
			}
		}
	);
}

// -------------------------------------------------------------
// PART 2
// -------------------------------------------------------------
function initPart2() {
	const stats = [
		{ label: 'Rects', p5: 11862, p5webgl: 3464, q5: 207428 },
		{ label: 'Rounded_Rects', p5: 9271, p5webgl: 149, q5: 188510 },
		{ label: 'Text', p5: 110, p5webgl: 452, q5: 56183 },
		{ label: 'Ellipses', p5: 11303, p5webgl: 3385, q5: 213096 },
		{ label: 'Lines', p5: 15946, p5webgl: 1275, q5: 83395 },
		{ label: 'Capsules', p5: 6106, p5webgl: 128, q5: 87615 }
	];

	const chart = document.getElementById('chart2');

	// Initial scale
	let currentMax = 20000;
	const finalMax = 220000;

	// Create Grid Lines
	const gridLabels = [];

	for (let i = 0; i <= 5; i++) {
		const y = (i / 5) * 100;
		const line = document.createElement('div');
		line.className = 'grid-line';
		line.style.bottom = `${y}%`;

		const span = document.createElement('span');
		span.className = 'grid-label';
		line.appendChild(span);
		gridLabels.push({ span, fraction: i / 5 });

		chart.appendChild(line);
	}

	function updateGrid(maxVal) {
		gridLabels.forEach((item) => {
			const val = maxVal * item.fraction;
			const text = val >= 1000 ? Math.round(val / 1000) + 'k' : Math.round(val);
			item.span.innerText = text;
		});
	}

	updateGrid(currentMax);

	// Generate DOM for bars
	stats.forEach((cat) => {
		const group = document.createElement('div');
		group.className = 'category-group';

		// Add specific class for selective hiding
		const cleanLabel = cat.label.toLowerCase().replace(/_/g, '-');
		group.classList.add(`group-${cleanLabel}`);

		const createBar = (type, val) => {
			const wrapper = document.createElement('div');
			wrapper.className = 'bar-wrapper';

			const bar = document.createElement('div');
			bar.className = `bar ${type}`;
			bar.dataset.value = val;
			bar.style.height = '0%';

			const label = document.createElement('div');
			label.className = 'value-label';
			label.innerText = val.toLocaleString();

			bar.appendChild(label);
			wrapper.appendChild(bar);
			return wrapper;
		};

		const p5Bar = createBar('p5', cat.p5);
		const webglBar = createBar('webgl', cat.p5webgl);
		const q5Bar = createBar('q5', cat.q5);

		group.appendChild(p5Bar);
		group.appendChild(webglBar);
		group.appendChild(q5Bar);

		const catLabel = document.createElement('div');
		catLabel.className = 'category-label';
		catLabel.innerText = cat.label;
		group.appendChild(catLabel);

		chart.appendChild(group);
	});

	// Function to set bar heights based on currentMax
	function renderBars() {
		chart.querySelectorAll('.bar').forEach((bar) => {
			if (bar.classList.contains('revealed')) {
				const val = parseInt(bar.dataset.value);
				const percentage = Math.max((val / currentMax) * 100, 0.5);
				bar.style.height = `${percentage}%`;
			}
		});
	}

	// Animation Sequence
	const delay = (ms) => new Promise((res) => setTimeout(res, ms));

	async function playSequence() {
		// Show Legend
		document.getElementById('legend2').style.opacity = '1';

		// 1. Reveal p5
		chart.querySelectorAll('.bar.p5').forEach((bar, i) => {
			setTimeout(() => {
				bar.classList.add('revealed');
				const val = parseInt(bar.dataset.value);
				bar.style.height = `${(val / currentMax) * 100}%`;
				bar.querySelector('.value-label').style.opacity = '0.5';
			}, i * 100);
		});

		await delay(1000);

		// 2. Reveal p5 WebGL
		chart.querySelectorAll('.bar.webgl').forEach((bar, i) => {
			setTimeout(() => {
				bar.classList.add('revealed');
				const val = parseInt(bar.dataset.value);
				bar.style.height = `${(val / currentMax) * 100}%`;
				bar.querySelector('.value-label').style.opacity = '0.5';
			}, i * 100);
		});

		await delay(2000);

		// 3. THE BIG REVEAL - q5 WebGPU (Blast phase)
		// Only trigger shake & confetti if graph is mostly on screen
		const chartRect = chart.getBoundingClientRect();
		const isVisible = chartRect.top < window.innerHeight && chartRect.bottom > 0;
		const isMostlyVisible =
			isVisible &&
			(chartRect.top > 0 || chartRect.bottom < window.innerHeight) &&
			Math.min(window.innerHeight, chartRect.bottom) - Math.max(0, chartRect.top) > chartRect.height * 0.4;

		if (isMostlyVisible) {
			chart.classList.add('shake');
			setTimeout(() => chart.classList.remove('shake'), 500);

			const end = Date.now() + 1000;
			const colors = ['#00f260', '#0575E6', '#ffffff'];

			(function frame() {
				confetti({
					particleCount: 5,
					angle: 60,
					spread: 55,
					origin: { x: 0 },
					colors: colors,
					disableForReducedMotion: true
				});
				confetti({
					particleCount: 5,
					angle: 120,
					spread: 55,
					origin: { x: 1 },
					colors: colors,
					disableForReducedMotion: true
				});

				if (Date.now() < end) {
					requestAnimationFrame(frame);
				}
			})();

			confetti({
				particleCount: 200,
				spread: 160,
				origin: { y: 0.6 },
				colors: colors,
				startVelocity: 60,
				scalar: 1.2
			});
		}

		chart.querySelectorAll('.bar.q5').forEach((bar, i) => {
			setTimeout(() => {
				bar.classList.add('revealed');
				bar.classList.add('active'); // Glow

				const val = parseInt(bar.dataset.value);
				bar.style.height = `${(val / currentMax) * 100}%`;
				bar.style.zIndex = '100';
				bar.querySelector('.value-label').style.opacity = '1';

				addSparkles(bar);
			}, i * 100);
		});

		await delay(1500);

		currentMax = finalMax;
		updateGrid(currentMax);

		chart.querySelectorAll('.bar.q5').forEach((bar) => (bar.style.zIndex = ''));
		renderBars();
	}

	function addSparkles(element) {
		const count = 10;
		for (let i = 0; i < count; i++) {
			const sparkle = document.createElement('div');
			sparkle.className = 'sparkle';
			const size = Math.random() * 4 + 2;
			sparkle.style.width = `${size}px`;
			sparkle.style.height = `${size}px`;
			sparkle.style.left = `${Math.random() * 100}%`;
			sparkle.style.top = `0%`; // Relative to bar
			element.appendChild(sparkle);
			sparkle.style.animation = `float-up ${0.5 + Math.random()}s forwards`;
		}
	}

	playSequence();
}

// -------------------------------------------------------------
// PART 3
// -------------------------------------------------------------
function initPart3() {
	// Add 'animated' class to container to trigger CSS animations
	const container = document.getElementById('part3');
	container.classList.add('animated');

	// Trigger bars
	setTimeout(() => {
		const bars = container.querySelectorAll('.bar');
		bars.forEach((bar) => {
			const width = bar.getAttribute('data-width');
			bar.style.width = width;
		});
	}, 300);
}

// -------------------------------------------------------------
// PART 4
// -------------------------------------------------------------
function initPart4() {
	const container = document.getElementById('part4');
	container.classList.add('animated');
}

// -------------------------------------------------------------
// PART 5
// -------------------------------------------------------------
function initPart5() {
	const container = document.getElementById('part5');
	container.classList.add('animated');
}

// -------------------------------------------------------------
// PART 6
// -------------------------------------------------------------
function initPart6() {
	const container = document.getElementById('part6');
	container.classList.add('animated');
}
