Q5.modules.input = ($, q) => {
	if ($._isGraphics) return;

	$.mouseX = $.mouseY = $.pmouseX = $.pmouseY = $.movedX = $.movedY = 0;
	$.touches = [];
	$.pointers = [];
	$.mouseButton = '';
	$.keyIsPressed = false;
	$.mouseIsPressed = false;
	$.key = '';
	$.keyCode = 0;

	$.UP_ARROW = 38;
	$.DOWN_ARROW = 40;
	$.LEFT_ARROW = 37;
	$.RIGHT_ARROW = 39;
	$.SHIFT = 16;
	$.TAB = 9;
	$.BACKSPACE = 8;
	$.ENTER = $.RETURN = 13;
	$.ALT = $.OPTION = 18;
	$.CONTROL = 17;
	$.DELETE = 46;
	$.ESCAPE = 27;

	$.ARROW = 'default';
	$.CROSS = 'crosshair';
	$.HAND = 'pointer';
	$.MOVE = 'move';
	$.TEXT = 'text';

	let keysHeld = {};
	let mouseBtns = [Q5.LEFT, Q5.CENTER, Q5.RIGHT];

	let c = $.canvas;

	$._startAudio = () => {
		if (!Q5.aud || Q5.aud?.state != 'running') $.userStartAudio();
	};

	$._updatePointer = (e) => {
		let id = e.pointerId || $.pointers[0]?.id;
		if (id == undefined) {
			if (e instanceof MouseEvent) id = 0;
			else return;
		}

		let p = $.pointers.find((p) => p.id === id);
		if (!p) {
			p = { id };
			$.pointers.push(p);
		}
		p.event = e;

		let x, y;
		if (c) {
			let rect = c.getBoundingClientRect();
			let sx = c.scrollWidth / $.width || 1;
			let sy = c.scrollHeight / $.height || 1;

			x = (e.clientX - rect.left) / sx;
			y = (e.clientY - rect.top) / sy;
			if ($._webgpu) {
				x -= c.hw;
				y -= c.hh;
				if (!$._flippedY) y *= -1;
			}
		} else {
			x = e.clientX;
			y = e.clientY;
		}

		p.x = x;
		p.y = y;

		return p;
	};

	$._updateMouse = (e) => {
		let p = $.pointers[0];
		if (e.pointerId != undefined && e.pointerId != p.id) return;

		if (document.pointerLockElement) {
			if (e.movementX != undefined) {
				q.mouseX += e.movementX;
				q.mouseY += e.movementY;
			}
		} else {
			q.mouseX = p.canvasPos?.x ?? p.x;
			q.mouseY = p.canvasPos?.y ?? p.y;
		}

		if (e.movementX != undefined) {
			q.movedX = e.movementX;
			q.movedY = e.movementY;
		}
	};

	let pressAmt = 0;

	$._onpointerdown = (e) => {
		pressAmt++;
		$._startAudio();
		$._updatePointer(e);
		$._updateMouse(e);
		q.mouseIsPressed = true;
		q.mouseButton = mouseBtns[e.button];
		$.mousePressed(e);
	};

	$._onpointermove = (e) => {
		if (c && !c.visible) return;
		$._updatePointer(e);
		$._updateMouse(e);
		if ($.mouseIsPressed) $.mouseDragged(e);
		else $.mouseMoved(e);
	};

	$._onpointerup = (e) => {
		q.mouseIsPressed = false;
		if (pressAmt > 0) pressAmt--;
		else return;
		$._updatePointer(e);
		$._updateMouse(e);
		if (e.pointerType === 'touch' || e.pointerType === 'pen') {
			let p = $.pointers.find((p) => p.id === e.pointerId);
			if (p) p._ended = true;
		}
		$.mouseReleased(e);
	};

	$._onclick = (e) => {
		q.mouseIsPressed = true;
		$.mouseClicked(e);
		q.mouseIsPressed = false;
	};

	$._ondblclick = (e) => {
		q.mouseIsPressed = true;
		$.doubleClicked(e);
		q.mouseIsPressed = false;
	};

	$._onwheel = (e) => {
		$._updatePointer(e);
		$._updateMouse(e);
		e.delta = e.deltaY;
		let ret = $.mouseWheel(e);
		if (($._isGlobal && !ret) || ret == false) {
			e.preventDefault();
		}
	};

	$.cursor = (name, x, y) => {
		let pfx = '';
		if (name.includes('.')) {
			name = `url("${name}")`;
			pfx = ', auto';
		}
		if (x !== undefined) {
			name += ' ' + x + ' ' + y;
		}
		$.canvas.style.cursor = name + pfx;
	};

	$.noCursor = () => ($.canvas.style.cursor = 'none');

	$.pointerLock = (unadjustedMovement = false) => {
		document.body?.requestPointerLock({ unadjustedMovement });
	};

	$._onkeydown = (e) => {
		if (e.repeat) return;
		$._startAudio();
		q.keyIsPressed = true;
		q.key = e.key;
		q.keyCode = e.keyCode;
		keysHeld[$.keyCode] = keysHeld[$.key.toLowerCase()] = true;
		$.keyPressed(e);
		if (e.key.length == 1) $.keyTyped(e);
	};

	$._onkeyup = (e) => {
		q.keyIsPressed = false;
		q.key = e.key;
		q.keyCode = e.keyCode;
		keysHeld[$.keyCode] = keysHeld[$.key.toLowerCase()] = false;
		$.keyReleased(e);
	};

	$.keyIsDown = (v) => !!keysHeld[typeof v == 'string' ? v.toLowerCase() : v];

	function getTouchInfo(touch) {
		const rect = $.canvas.getBoundingClientRect(),
			sx = $.canvas.scrollWidth / $.width || 1,
			sy = $.canvas.scrollHeight / $.height || 1;
		let modX = 0,
			modY = 0;
		if ($._webgpu) {
			modX = $.halfWidth;
			modY = $.halfHeight;
		}

		let x = (touch.clientX - rect.left) / sx - modX,
			y = (touch.clientY - rect.top) / sy - modY;

		if (!$._flippedY) y *= -1;

		return {
			x,
			y,
			id: touch.identifier
		};
	}

	$._updateTouches = (e) => {
		if (c && !c.visible) return;

		let touches = [...e.changedTouches].map(getTouchInfo);

		for (let touch of touches) {
			let existingTouch = $.touches.find((t) => t.id == touch.id);
			if (existingTouch) {
				existingTouch.x = touch.x;
				existingTouch.y = touch.y;
			} else {
				$.touches.push(touch);
			}
		}

		for (let i = $.touches.length - 1; i >= 0; i--) {
			let touch = $.touches[i];
			let found = false;
			for (let j = 0; j < e.touches.length; j++) {
				if (e.touches[j].identifier === touch.id) {
					found = true;
					break;
				}
			}
			if (!found) {
				$.touches.splice(i, 1);
			}
		}
	};

	$._ontouchstart = (e) => {
		$._startAudio();
		if (!$.touchStarted(e)) e.preventDefault();
	};

	$._ontouchmove = (e) => {
		if (!$.touchMoved(e)) e.preventDefault();
	};

	$._ontouchend = (e) => {
		if (!$.touchEnded(e)) e.preventDefault();
	};

	if (window) {
		let l = window.addEventListener;
		l('keydown', (e) => $._onkeydown(e), false);
		l('keyup', (e) => $._onkeyup(e), false);

		let pointer = window.PointerEvent ? 'pointer' : 'mouse';
		l(pointer + 'move', (e) => $._onpointermove(e), false);
		l(pointer + 'up', (e) => $._onpointerup(e));
		l(pointer + 'cancel', (e) => $._onpointerup(e));
		l('touchstart', (e) => $._updateTouches(e));
		l('touchmove', (e) => $._updateTouches(e));
		l('touchend', (e) => $._updateTouches(e));
		l('touchcancel', (e) => $._updateTouches(e));

		if (c) c.addEventListener('wheel', (e) => $._onwheel(e));

		if (!$._isGlobal && c) {
			// If not global, only trigger pointer events when pointer is locked or over canvas
			l(pointer + 'down', (e) => !document.pointerLockElement || $._onpointerdown(e));
			l('click', (e) => !document.pointerLockElement || $._onclick(e));
			l('dblclick', (e) => !document.pointerLockElement || $._ondblclick(e));

			l = c.addEventListener.bind(c);
		}

		l(pointer + 'down', (e) => $._onpointerdown(e));
		l('click', (e) => $._onclick(e));
		l('dblclick', (e) => $._ondblclick(e));

		if (c) l = c.addEventListener.bind(c);

		l('touchstart', (e) => $._ontouchstart(e));
		l('touchmove', (e) => $._ontouchmove(e));
		l('touchend', (e) => $._ontouchend(e));
		l('touchcancel', (e) => $._ontouchend(e));
	}
};
