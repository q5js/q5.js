Q5.modules.input = ($, p) => {
	if ($._scope == 'graphics') return;

	$.mouseX = 0;
	$.mouseY = 0;
	$.pmouseX = 0;
	$.pmouseY = 0;
	$.touches = [];
	$.mouseButton = null;
	$.keyIsPressed = false;
	$.mouseIsPressed = false;
	$.key = null;
	$.keyCode = null;

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
	let mouseBtns = [$.LEFT, $.CENTER, $.RIGHT];

	let c = $.canvas;

	$._startAudio = () => {
		if ($.getAudioContext && $.getAudioContext()?.state == 'suspended') $.userStartAudio();
	};

	$._updateMouse = (e) => {
		if (e.changedTouches) return;
		let rect = $.canvas.getBoundingClientRect();
		let sx = $.canvas.scrollWidth / $.width || 1;
		let sy = $.canvas.scrollHeight / $.height || 1;
		p.mouseX = (e.clientX - rect.left) / sx;
		p.mouseY = (e.clientY - rect.top) / sy;
	};
	$._onmousedown = (e) => {
		$._startAudio();
		$._updateMouse(e);
		p.mouseIsPressed = true;
		p.mouseButton = mouseBtns[e.button];
		$.mousePressed(e);
	};
	$._onmousemove = (e) => {
		$._updateMouse(e);
		if ($.mouseIsPressed) $.mouseDragged(e);
		else $.mouseMoved(e);
	};
	$._onmouseup = (e) => {
		$._updateMouse(e);
		p.mouseIsPressed = false;
		$.mouseReleased(e);
	};
	$._onclick = (e) => {
		$._updateMouse(e);
		p.mouseIsPressed = true;
		$.mouseClicked(e);
		p.mouseIsPressed = false;
	};
	c.addEventListener('mousedown', (e) => $._onmousedown(e));
	c.addEventListener('mouseup', (e) => $._onmouseup(e));
	c.addEventListener('click', (e) => $._onclick(e));

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
	$.noCursor = () => {
		$.canvas.style.cursor = 'none';
	};
	$.requestPointerLock = document.body?.requestPointerLock;
	$.exitPointerLock = document.exitPointerLock;

	$._onkeydown = (e) => {
		if (e.repeat) return;
		$._startAudio;
		p.keyIsPressed = true;
		p.key = e.key;
		p.keyCode = e.keyCode;
		keysHeld[$.keyCode] = keysHeld[$.key.toLowerCase()] = true;
		$.keyPressed(e);
		if (e.key.length == 1) $.keyTyped(e);
	};
	$._onkeyup = (e) => {
		p.keyIsPressed = false;
		p.key = e.key;
		p.keyCode = e.keyCode;
		keysHeld[$.keyCode] = keysHeld[$.key.toLowerCase()] = false;
		$.keyReleased(e);
	};
	$.keyIsDown = (v) => !!keysHeld[typeof v == 'string' ? v.toLowerCase() : v];

	function getTouchInfo(touch) {
		const rect = $.canvas.getBoundingClientRect();
		const sx = $.canvas.scrollWidth / $.width || 1;
		const sy = $.canvas.scrollHeight / $.height || 1;
		return {
			x: (touch.clientX - rect.left) / sx,
			y: (touch.clientY - rect.top) / sy,
			id: touch.identifier
		};
	}
	$._ontouchstart = (e) => {
		$._startAudio();
		p.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware) {
			p.mouseX = $.touches[0].x;
			p.mouseY = $.touches[0].y;
			p.mouseIsPressed = true;
			p.mouseButton = $.LEFT;
			if (!$.mousePressed(e)) e.preventDefault();
		}
		if (!$.touchStarted(e)) e.preventDefault();
	};
	$._ontouchmove = (e) => {
		p.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware) {
			p.mouseX = $.touches[0].x;
			p.mouseY = $.touches[0].y;
			if (!$.mouseDragged(e)) e.preventDefault();
		}
		if (!$.touchMoved(e)) e.preventDefault();
	};
	$._ontouchend = (e) => {
		p.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware && !$.touches.length) {
			p.mouseIsPressed = false;
			if (!$.mouseReleased(e)) e.preventDefault();
		}
		if (!$.touchEnded(e)) e.preventDefault();
	};
	c.addEventListener('touchstart', (e) => $._ontouchstart(e));
	c.addEventListener('touchmove', (e) => $._ontouchmove(e));
	c.addEventListener('touchcancel', (e) => $._ontouchend(e));
	c.addEventListener('touchend', (e) => $._ontouchend(e));

	if (window) {
		let l = window.addEventListener;
		l('mousemove', (e) => $._onmousemove(e), false);
		l('keydown', (e) => $._onkeydown(e), false);
		l('keyup', (e) => $._onkeyup(e), false);
	}
};
