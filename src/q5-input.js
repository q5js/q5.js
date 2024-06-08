Q5.modules.input = ($) => {
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

	$.ALT = 18;
	$.BACKSPACE = 8;
	$.CONTROL = 17;
	$.DELETE = 46;
	$.DOWN_ARROW = 40;
	$.ENTER = 13;
	$.ESCAPE = 27;
	$.LEFT_ARROW = 37;
	$.OPTION = 18;
	$.RETURN = 13;
	$.RIGHT_ARROW = 39;
	$.SHIFT = 16;
	$.TAB = 9;
	$.UP_ARROW = 38;

	$.ARROW = 'default';
	$.CROSS = 'crosshair';
	$.HAND = 'pointer';
	$.MOVE = 'move';
	$.TEXT = 'text';

	let keysHeld = {};

	$._updateMouse = (e) => {
		if (e.changedTouches) return;
		let rect = $.canvas.getBoundingClientRect();
		let sx = $.canvas.scrollWidth / $.width || 1;
		let sy = $.canvas.scrollHeight / $.height || 1;
		$.mouseX = (e.clientX - rect.left) / sx;
		$.mouseY = (e.clientY - rect.top) / sy;
	};
	$._onmousedown = (e) => {
		if ($.aud && $.aud.state != 'running') $.aud.resume();
		$._updateMouse(e);
		$.mouseIsPressed = true;
		$.mouseButton = [$.LEFT, $.CENTER, $.RIGHT][e.button];
		$.mousePressed(e);
	};
	$._onmousemove = (e) => {
		$._updateMouse(e);
		if ($.mouseIsPressed) $.mouseDragged(e);
		else $.mouseMoved(e);
	};
	$._onmouseup = (e) => {
		$._updateMouse(e);
		$.mouseIsPressed = false;
		$.mouseReleased(e);
	};
	$._onclick = (e) => {
		$._updateMouse(e);
		$.mouseIsPressed = true;
		$.mouseClicked(e);
		$.mouseIsPressed = false;
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
	$.noCursor = () => {
		$.canvas.style.cursor = 'none';
	};

	$._onkeydown = (e) => {
		if (e.repeat) return;
		if ($.aud && $.aud.state != 'running') $.aud.resume();
		$.keyIsPressed = true;
		$.key = e.key;
		$.keyCode = e.keyCode;
		keysHeld[$.keyCode] = true;
		$.keyPressed(e);
		if (e.key.length == 1) {
			$.keyTyped(e);
		}
	};
	$._onkeyup = (e) => {
		$.keyIsPressed = false;
		$.key = e.key;
		$.keyCode = e.keyCode;
		keysHeld[$.keyCode] = false;
		$.keyReleased(e);
	};

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
		if ($.aud && $.aud.state != 'running') $.aud.resume();
		$.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware) {
			$.mouseX = $.touches[0].x;
			$.mouseY = $.touches[0].y;
			$.mouseIsPressed = true;
			$.mouseButton = $.LEFT;
			if (!$.mousePressed(e)) e.preventDefault();
		}
		if (!$.touchStarted(e)) e.preventDefault();
	};
	$._ontouchmove = (e) => {
		$.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware) {
			$.mouseX = $.touches[0].x;
			$.mouseY = $.touches[0].y;
			if (!$.mouseDragged(e)) e.preventDefault();
		}
		if (!$.touchMoved(e)) e.preventDefault();
	};
	$._ontouchend = (e) => {
		$.touches = [...e.touches].map(getTouchInfo);
		if (!$._isTouchAware && !$.touches.length) {
			$.mouseIsPressed = false;
			if (!$.mouseReleased(e)) e.preventDefault();
		}
		if (!$.touchEnded(e)) e.preventDefault();
	};
	$.requestPointerLock = document.body.requestPointerLock;
	$.exitPointerLock = document.exitPointerLock;

	if ($._scope == 'graphics') return;

	$.keyIsDown = (x) => !!keysHeld[x];
	$.canvas.onmousedown = (e) => $._onmousedown(e);
	$.canvas.onmouseup = (e) => $._onmouseup(e);
	$.canvas.onclick = (e) => $._onclick(e);
	$.canvas.ontouchstart = (e) => $._ontouchstart(e);
	$.canvas.ontouchmove = (e) => $._ontouchmove(e);
	$.canvas.ontouchcancel = $.canvas.ontouchend = (e) => $._ontouchend(e);

	if (window) {
		window.addEventListener('mousemove', (e) => $._onmousemove(e), false);
		window.addEventListener('keydown', (e) => $._onkeydown(e), false);
		window.addEventListener('keyup', (e) => $._onkeyup(e), false);
	}
};
