# input

q5's input handling is very basic.

For better input handling, including game controller support, consider using the [p5play](https://p5play.org/) addon with q5.

Note that input responses inside `draw` can be delayed by
up to one frame cycle: from the exact moment an input event occurs
to the next time a frame is drawn.

Play sounds or trigger other non-visual feedback immediately
by responding to input events inside functions like
`mousePressed` and `keyPressed`.

## mouseX

Current X position of the mouse.

### webgpu

```js
q5.draw = function () {
	background(0.8);
	textSize(64);
	text(round(mouseX), -50, 20);
};
```

### c2d

```js
function draw() {
	background(200);
	textSize(64);
	text(round(mouseX), 50, 120);
}
```

## mouseY

Current Y position of the mouse.

### webgpu

```js
q5.draw = function () {
	background(0.8);
	circle(0, mouseY, 100);
};
```

### c2d

```js
function draw() {
	background(200);
	circle(100, mouseY, 100);
}
```

## pmouseX

Previous X position of the mouse.

## pmouseY

Previous Y position of the mouse.

## mouseButton

The current button being pressed: 'left', 'right', 'center').

The default value is an empty string.

### webgpu

```js
q5.draw = function () {
	background(0.8);
	textSize(64);
	text(mouseButton, -80, 20);
};
```

### c2d

```js
function draw() {
	background(200);
	textSize(64);
	text(mouseButton, 20, 120);
}
```

## mouseIsPressed

True if the mouse is currently pressed, false otherwise.

### webgpu

```js
q5.draw = function () {
	if (mouseIsPressed) background(0.4);
	else background(0.8);
};
```

### c2d

```js
function draw() {
	if (mouseIsPressed) background(100);
	else background(200);
}
```

## mousePressed

Define this function to respond to mouse down events.

### webgpu

```js
await Canvas(200);
let gray = 0.4;

q5.mousePressed = function () {
	background(gray % 1);
	gray += 0.1;
};
```

### c2d

```js
createCanvas(200);
let gray = 95;

function mousePressed() {
	background(gray % 256);
	gray += 40;
}
```

## mouseReleased

Define this function to respond to mouse up events.

### webgpu

```js
await Canvas(200);
let gray = 0.4;

q5.mouseReleased = function () {
	background(gray % 1);
	gray += 0.1;
};
```

### c2d

```js
createCanvas(200);
let gray = 95;

function mouseReleased() {
	background(gray % 256);
	gray += 40;
}
```

## mouseMoved

Define this function to respond to mouse move events.

On touchscreen devices this function is not called
when the user drags their finger on the screen.

### webgpu

```js
await Canvas(200);
let gray = 0.4;

q5.mouseMoved = function () {
	background(gray % 1);
	gray += 0.005;
};
```

### c2d

```js
createCanvas(200);
let gray = 95;

function mouseMoved() {
	background(gray % 256);
	gray++;
}
```

## mouseDragged

Define this function to respond to mouse drag events.

Dragging the mouse is defined as moving the mouse
while a mouse button is pressed.

### webgpu

```js
await Canvas(200);
let gray = 0.4;

q5.mouseDragged = function () {
	background(gray % 1);
	gray += 0.005;
};
```

### c2d

```js
createCanvas(200);
let gray = 95;

function mouseDragged() {
	background(gray % 256);
	gray++;
}
```

## doubleClicked

Define this function to respond to mouse double click events.

### webgpu

```js
await Canvas(200);
let gray = 0.4;

q5.doubleClicked = function () {
	background(gray % 1);
	gray += 0.1;
};
```

### c2d

```js
createCanvas(200);
let gray = 95;

function doubleClicked() {
	background(gray % 256);
	gray += 40;
}
```

## key

The name of the last key pressed.

### webgpu

```js
q5.draw = function () {
	background(0.8);
	textSize(64);
	text(key, -80, 20);
};
```

### c2d

```js
function draw() {
	background(200);
	textSize(64);
	text(key, 20, 120);
}
```

## keyIsPressed

True if a key is currently pressed, false otherwise.

### webgpu

```js
q5.draw = function () {
	if (keyIsPressed) background(0.4);
	else background(0.8);
};
```

### c2d

```js
function draw() {
	if (keyIsPressed) background(100);
	else background(200);
}
```

## keyIsDown

Returns true if the user is pressing the specified key, false
otherwise. Accepts case-insensitive key names.

```
@param {string} key key to check
@returns {boolean} true if the key is pressed, false otherwise
```

### webgpu

```js
q5.draw = function () {
	background(0.8);

	if (keyIsDown('f') && keyIsDown('j')) {
		rect(-50, -50, 100, 100);
	}
};
```

### c2d

```js
function draw() {
	background(200);

	if (keyIsDown('f') && keyIsDown('j')) {
		rect(50, 50, 100, 100);
	}
}
```

## keyPressed

Define this function to respond to key down events.

### webgpu

```js
await Canvas(200);
let gray = 0.4;

q5.keyPressed = function () {
	background(gray % 1);
	gray += 0.1;
};
```

### c2d

```js
createCanvas(200);

let gray = 95;
function keyPressed() {
	background(gray % 256);
	gray += 40;
}
```

## keyReleased

Define this function to respond to key up events.

### webgpu

```js
await Canvas(200);
let gray = 0.4;

q5.keyReleased = function () {
	background(gray % 1);
	gray += 0.1;
};
```

### c2d

```js
createCanvas(200);

let gray = 95;
function keyReleased() {
	background(gray % 256);
	gray += 40;
}
```

## touches

Array containing all current touch points within the
browser window. Each touch being an object with
`id`, `x`, and `y` properties.

### webgpu

```js
q5.draw = function () {
	background(0.8);
	for (let touch of touches) {
		circle(touch.x, touch.y, 100);
	}
};
```

### c2d

```js
function draw() {
	background(200);
	for (let touch of touches) {
		circle(touch.x, touch.y, 100);
	}
}
```

## touchStarted

Define this function to respond to touch down events
on the canvas.

Return true to enable touch gestures like pinch-to-zoom
and scroll, which q5 disables on the canvas by default.

### webgpu

```js
await Canvas(200);
let gray = 0.4;

q5.touchStarted = function () {
	background(gray % 1);
	gray += 0.1;
};
```

### c2d

```js
createCanvas(200);

let gray = 95;
function touchStarted() {
	background(gray % 256);
	gray += 40;
}
```

## touchEnded

Define this function to respond to touch down events
on the canvas.

Return true to enable touch gestures like pinch-to-zoom
and scroll, which q5 disables on the canvas by default.

### webgpu

```js
await Canvas(200);
let gray = 0.4;

q5.touchEnded = function () {
	background(gray % 1);
	gray += 0.1;
};
```

### c2d

```js
createCanvas(200);

let gray = 95;
function touchEnded() {
	background(gray % 256);
	gray += 40;
}
```

## touchMoved

Define this function to respond to touch move events
on the canvas.

Return true to enable touch gestures like pinch-to-zoom
and scroll, which q5 disables on the canvas by default.

### webgpu

```js
await Canvas(200);
let gray = 0.4;

q5.touchMoved = function () {
	background(gray % 1);
	gray += 0.005;
};
```

### c2d

```js
createCanvas(200);
let gray = 95;

function touchMoved() {
	background(gray % 256);
	gray++;
}
```

## pointers

Object containing all current pointers within the
browser window.

This includes mouse, touch, and pen pointers.

Each pointer is an object with
`event`, `x`, and `y` properties.
The `event` property contains the original
[PointerEvent](https://developer.mozilla.org/docs/Web/API/PointerEvent).

### webgpu

```js
q5.draw = function () {
	background(0.8);
	for (let pointerID in pointers) {
		let pointer = pointers[pointerID];
		circle(pointer.x, pointer.y, 100);
	}
};
```

### c2d

```js
function draw() {
	background(200);
	for (let pointerID in pointers) {
		let pointer = pointers[pointerID];
		circle(pointer.x, pointer.y, 100);
	}
}
```

## cursor

Sets the cursor to a [CSS cursor type](https://developer.mozilla.org/docs/Web/CSS/cursor) or image.
If an image is provided, optional x and y coordinates can
specify the active point of the cursor.

```
@param {string} name name of the cursor or the url to an image
@param {number} [x] x-coordinate of the cursor's point
@param {number} [y] y-coordinate of the cursor's point
```

### webgpu

```js
await Canvas(200, 100);
cursor('pointer');
```

### c2d

```js
createCanvas(200, 100);
cursor('pointer');
```

## noCursor

Hides the cursor within the bounds of the canvas.

### webgpu

```js
await Canvas(200, 100);
noCursor();
```

### c2d

```js
createCanvas(200, 100);
noCursor();
```

## mouseWheel

Define this function to respond to mouse wheel events.

`event.deltaX` and `event.deltaY` are the horizontal and vertical
scroll amounts, respectively.

Return true to allow the default behavior of scrolling the page.

### webgpu

```js
let x = (y = 0);
q5.draw = function () {
	circle(x, y, 10);
};
q5.mouseWheel = function (e) {
	x += e.deltaX;
	y += e.deltaY;
	return false;
};
```

### c2d

```js
let x = (y = 100);
function draw() {
	circle(x, y, 10);
}
function mouseWheel(e) {
	x += e.deltaX;
	y += e.deltaY;
	return false;
}
```

## pointerLock

Requests that the pointer be locked to the document body, hiding
the cursor and allowing for unlimited movement.

Operating systems enable mouse acceleration by default, which is useful when you sometimes want slow precise movement (think about you might use a graphics package), but also want to move great distances with a faster mouse movement (think about scrolling, and selecting several files). For some games however, raw mouse input data is preferred for controlling camera rotation — where the same distance movement, fast or slow, results in the same rotation.

To exit pointer lock mode, call `document.exitPointerLock()`.

```
@param {boolean} unadjustedMovement set to true to disable OS-level mouse acceleration and access raw mouse input
```

### webgpu

```js
q5.draw = function () {
	circle(mouseX / 10, mouseY / 10, 10);
};

q5.doubleClicked = function () {
	if (!document.pointerLockElement) {
		pointerLock();
	} else {
		document.exitPointerLock();
	}
};
```

### c2d

```js
function draw() {
	circle(mouseX / 10 + 100, mouseY / 10 + 100, 10);
}

function doubleClicked() {
	if (!document.pointerLockElement) {
		pointerLock();
	} else {
		document.exitPointerLock();
	}
}
```
