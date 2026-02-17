/* node testing */
require('../q5-server.js');

let log = console.log;

test('q5-input', () => {
	expect(Q5).toBeDefined();

	let q = new Q5('namespace');

	q.Canvas(200, 200);

	// Test event hooks
	let mousePressedCalled = false;
	let mouseMovedCalled = false;
	let mouseDraggedCalled = false;
	let mouseReleasedCalled = false;
	let mouseClickedCalled = false;
	let doubleClickedCalled = false;
	let wheelCalled = false;

	q.mousePressed = function () {
		mousePressedCalled = true;
	};
	q.mouseMoved = function () {
		mouseMovedCalled = true;
	};
	q.mouseDragged = function () {
		mouseDraggedCalled = true;
	};
	q.mouseReleased = function () {
		mouseReleasedCalled = true;
	};
	q.mouseClicked = function () {
		mouseClickedCalled = true;
	};
	q.doubleClicked = function () {
		doubleClickedCalled = true;
	};
	q.mouseWheel = function (e) {
		wheelCalled = true;
		return true;
	};

	let keyPressedCalled = false;
	let keyTypedCalled = false;
	let keyReleasedCalled = false;

	q.keyPressed = function () {
		keyPressedCalled = true;
	};
	q.keyTyped = function () {
		keyTypedCalled = true;
	};
	q.keyReleased = function () {
		keyReleasedCalled = true;
	};

	expect(q.mouseX).toBeDefined();
	expect(q.mouseY).toBeDefined();
	expect(q.movedX).toBeDefined();
	expect(q.movedY).toBeDefined();
	expect(q.pointers).toBeDefined();

	expect(q.mouseIsPressed).toBe(false);

	// helper to dispatch pointer or mouse events depending on environment
	function dispatchCanvasPointer(name, opts) {
		opts = opts || {};
		let target = q.canvas;
		if (name === 'move' || name === 'up') target = window;
		if (window.PointerEvent) {
			let pName = name === 'down' ? 'pointerdown' : name === 'move' ? 'pointermove' : 'pointerup';
			let pe = new window.PointerEvent(
				pName,
				Object.assign({ pointerId: 1, pointerType: 'mouse', bubbles: true }, opts)
			);
			target.dispatchEvent(pe);
		} else {
			let mName = name === 'down' ? 'mousedown' : name === 'move' ? 'mousemove' : 'mouseup';
			let me = new window.MouseEvent(mName, Object.assign({ bubbles: true }, opts));
			target.dispatchEvent(me);
		}
	}

	// 1) Simulate mousedown -> should call mousePressed and set mouseIsPressed
	dispatchCanvasPointer('down', { clientX: 10, clientY: 10, button: 0 });
	expect(mousePressedCalled).toBe(true);
	expect(q.mouseIsPressed).toBe(true);

	// 2) Simulate mousemove while pressed -> mouseDragged
	dispatchCanvasPointer('move', { clientX: 20, clientY: 20 });
	expect(mouseDraggedCalled).toBe(true);

	// 3) Simulate mouseup -> mouseReleased and mouseIsPressed false
	dispatchCanvasPointer('up', { clientX: 20, clientY: 20, button: 0 });
	expect(mouseReleasedCalled).toBe(true);
	expect(q.mouseIsPressed).toBe(false);

	// 4) Simulate click -> mouseClicked
	let clickEvt = new window.MouseEvent('click', { clientX: 15, clientY: 15, bubbles: true });
	q.canvas.dispatchEvent(clickEvt);
	expect(mouseClickedCalled).toBe(true);

	// 5) Simulate dblclick -> doubleClicked
	let dblEvt = new window.MouseEvent('dblclick', { clientX: 15, clientY: 15, bubbles: true });
	q.canvas.dispatchEvent(dblEvt);
	expect(doubleClickedCalled).toBe(true);

	// 6) Simulate wheel -> mouseWheel
	let wheelEvt = new window.WheelEvent('wheel', { deltaY: 100, clientX: 10, clientY: 10, bubbles: true });
	q.canvas.dispatchEvent(wheelEvt);
	expect(wheelCalled).toBe(true);

	// 7) Keyboard: keydown (should call keyPressed and keyTyped for single-char keys)
	let keyDownEvt = new window.KeyboardEvent('keydown', { key: 'a', keyCode: 65, bubbles: true });
	window.dispatchEvent(keyDownEvt);
	expect(keyPressedCalled).toBe(true);
	expect(keyTypedCalled).toBe(true);

	// keyIsDown check (string)
	expect(q.keyIsDown('a')).toBe(true);

	// 8) Keyboard: keyup -> keyReleased and keyIsDown false
	let keyUpEvt = new window.KeyboardEvent('keyup', { key: 'a', keyCode: 65, bubbles: true });
	window.dispatchEvent(keyUpEvt);
	expect(keyReleasedCalled).toBe(true);
	expect(q.keyIsDown('a')).toBe(false);

	q.noLoop();
});
