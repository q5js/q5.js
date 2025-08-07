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
	let pressedMouseButtons = new Set();

	let c = $.canvas;

	$._startAudio = () => {
		if (!Q5.aud || Q5.aud?.state != 'running') $.userStartAudio();
	};

	$._updatePointer = (e) => {
		let pid = e.pointerId ?? 0;
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

	$._onpointerdown = (e) => {
		$._startAudio();
		$._updatePointer(e);
		q.mouseIsPressed = true;
		q.mouseButton = mouseBtns[e.button] ?? Q5.LEFT;
		pressedMouseButtons.add(e.button);

		try { c?.setPointerCapture?.(e.pointerId); } catch { }
		$.mousePressed(e);
	};

	$._onpointermove = (e) => {
		if (c && !c.visible) return;
		$._updatePointer(e);
		if ($.mouseIsPressed) $.mouseDragged(e);
		else $.mouseMoved(e);
	};

	$._onpointerup = (e) => {
		pressedMouseButtons.delete(e.button);
		q.mouseIsPressed = false;

		$._updatePointer(e);
		if (pressedMouseButtons.size === 0) {
			try { c?.releasePointerCapture?.(e.pointerId); } catch { }
		}
		delete $.pointers[e.pointerId];
		$.mouseReleased(e);
	};

	$._onclick = (e) => {
		$._updatePointer(e);
		const originalMouseIsPressed = q.mouseIsPressed;
		q.mouseIsPressed = true;
		$.mouseClicked(e);
		q.mouseIsPressed = originalMouseIsPressed;
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
		if (ret === false) {
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
		if (c) c.style.cursor = name + pfx;
	};

	$.noCursor = () => { if (c) c.style.cursor = 'none' };

	$.pointerLock = (unadjustedMovement = false) => {
		c?.requestPointerLock({ unadjustedMovement });
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

		const activeTouchIds = new Set([...e.touches].map(t => t.identifier));
		$.touches = $.touches.filter(t => activeTouchIds.has(t.id));
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

	$._onwindowblur = (e) => {
		if (!$.windowBlurred(e)) e.preventDefault();
	}

	$.resetInput = () => {
		if (c) $._resetDownState();
	}
	$._resetDownState = () => {
		q.keyIsPressed = false;
		q.mouseIsPressed = false;
		q.key = '';
		q.keyCode = 0;
		keysHeld = {};
		pressedMouseButtons.clear();
		$.pointers = {};
		$.touches = [];
		$.mouseButton = '';
	}

	if (typeof window !== 'undefined') {
		window.addEventListener('keydown', (e) => $._onkeydown(e), false);
		window.addEventListener('keyup', (e) => $._onkeyup(e), false);
		window.addEventListener('blur', (e) => $._onwindowblur(e), false);

		const t = (!$._isGlobal && c) ? c : window;

		const pointerMoveEvent = window.PointerEvent ? 'pointermove' : 'mousemove';
		t.addEventListener(pointerMoveEvent, (e) => $._onpointermove(e), false);

		t.addEventListener('mousedown', (e) => $._onpointerdown(e), false);
		t.addEventListener('mouseup', (e) => $._onpointerup(e), false);
		if (window.PointerEvent) {
			t.addEventListener('pointercancel', (e) => $._onpointerup(e));
		}

		t.addEventListener('click', (e) => $._onclick(e));
		t.addEventListener('dblclick', (e) => $._ondblclick(e));
		t.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			q.mouseButton = Q5.RIGHT;
			$._onclick(e);
		});

		const touchStart = (e) => { $._updateTouches(e); $._ontouchstart(e); };
		const touchMove = (e) => { $._updateTouches(e); $._ontouchmove(e); };
		const touchEnd = (e) => { $._updateTouches(e); $._ontouchend(e); };

		t.addEventListener('touchstart', touchStart);
		t.addEventListener('touchmove', touchMove);
		t.addEventListener('touchend', touchEnd);
		t.addEventListener('touchcancel', touchEnd);

		if (c) c.addEventListener('wheel', (e) => $._onwheel(e), { passive: false });
	}
};