Q5.modules.input = ($, q) => {
	if ($._isGraphics) return;

	$.mouseX = 0;
	$.mouseY = 0;
	$.pmouseX = 0;
	$.pmouseY = 0;
	$.touches = [];
	$.pointers = {};
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
		let pid = e.pointerId;
		$.pointers[pid] ??= { event: e };
		let pointer = $.pointers[pid];
		pointer.event = e;

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
			}
		} else {
			x = e.clientX;
			y = e.clientY;
		}

		pointer.x = x;
		pointer.y = y;

		if (e.isPrimary || !e.pointerId) {
			if (document.pointerLockElement) {
				q.mouseX += e.movementX;
				q.mouseY += e.movementY;
			} else {
				q.mouseX = x;
				q.mouseY = y;
			}

			q.moveX = e.movementX;
			q.moveY = e.movementY;
		}
	};

	let pressAmt = 0;

	$._onpointerdown = (e) => {
		pressAmt++;
		$._startAudio();
		$._updatePointer(e);
		q.mouseIsPressed = true;
		q.mouseButton = mouseBtns[e.button];
		$.mousePressed(e);
	};

	$._onpointermove = (e) => {
		if (c && !c.visible) return;
		$._updatePointer(e);
		if ($.mouseIsPressed) $.mouseDragged(e);
		else $.mouseMoved(e);
	};

	$._onpointerup = (e) => {
		q.mouseIsPressed = false;
		if (pressAmt > 0) pressAmt--;
		else return;
		$._updatePointer(e);
		delete $.pointers[e.pointerId];
		$.mouseReleased(e);
	};

	$._onclick = (e) => {
		$._updatePointer(e);
		q.mouseIsPressed = true;
		$.mouseClicked(e);
		q.mouseIsPressed = false;
	};

	$._ondblclick = (e) => {
		$._updatePointer(e);
		q.mouseIsPressed = true;
		$.doubleClicked(e);
		q.mouseIsPressed = false;
	};

	$._onwheel = (e) => {
		$._updatePointer(e);
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
		const rect = $.canvas.getBoundingClientRect();
		const sx = $.canvas.scrollWidth / $.width || 1;
		const sy = $.canvas.scrollHeight / $.height || 1;
		let modX = 0,
			modY = 0;
		if ($._webgpu) {
			modX = $.halfWidth;
			modY = $.halfHeight;
		}
		return {
			x: (touch.clientX - rect.left) / sx - modX,
			y: (touch.clientY - rect.top) / sy - modY,
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

		if (!$._isGlobal && c) l = c.addEventListener.bind(c);

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
