# dom

The Document Object Model (DOM) is an interface for
creating and editing web pages with JavaScript.

## createElement

Creates a new HTML element and adds it to the page. `createEl` is
an alias.

Modify the element's CSS [`style`](https://developer.mozilla.org/docs/Web/API/HTMLElement/style) to change its appearance.

Use [`addEventListener`](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener) to respond to events such as:

- "click": when the element is clicked
- "mouseover": when the mouse hovers over the element
- "mouseout": when the mouse stops hovering over the element
- "input": when a form element's value changes

q5 adds some extra functionality to the elements it creates:

- the `position` function makes it easy to place the element
  relative to the canvas
- the `size` function sets the width and height of the element
- alternatively, use the element's `x`, `y`, `width`, and `height` properties

```
@param {string} tag tag name of the element
@param {string} [content] content of the element
@returns {HTMLElement} element
```

### webgpu

```js
await createCanvas(200);

let el = createEl('div', '*');
el.position(50, 50);
el.size(100, 100);
el.style.fontSize = '136px';
el.style.textAlign = 'center';
el.style.backgroundColor = 'blue';
el.style.color = 'white';
```

### c2d

```js
createCanvas(200);

let el = createEl('div', '*');
el.position(50, 50);
el.size(100, 100);
el.style.fontSize = '136px';
el.style.textAlign = 'center';
el.style.backgroundColor = 'blue';
el.style.color = 'white';
```

## createA

Creates a link element.

```
@param {string} href url
@param {string} [text] text content
@param {boolean} [newTab] whether to open the link in a new tab
```

### webgpu

```js
await createCanvas(200);

let link = createA('https://q5js.org', 'q5.js');
link.position(16, 42);
link.style.fontSize = '80px';

link.addEventListener('mouseover', () => {
	background('cyan');
});
```

### c2d

```js
createCanvas(200);

let link = createA('https://q5js.org', 'q5.js');
link.position(16, 42);
link.style.fontSize = '80px';

link.addEventListener('mouseover', () => {
	background('cyan');
});
```

## createButton

Creates a button element.

```
@param {string} [content] text content
```

### webgpu

```js
await createCanvas(200, 100);

let btn = createButton('Click me!');

btn.addEventListener('click', () => {
	background(random(0.4, 1));
});
```

### c2d

```js
createCanvas(200, 100);

let btn = createButton('Click me!');

btn.addEventListener('click', () => {
	background(random(100, 255));
});
```

## createCheckbox

Creates a checkbox element.

Use the `checked` property to get or set the checkbox's state.

The `label` property is the text label element next to the checkbox.

```
@param {string} [label] text label placed next to the checkbox
@param {boolean} [checked] initial state
```

### webgpu

```js
await createCanvas(200, 100);

let box = createCheckbox('Check me!');
box.label.style.color = 'lime';

box.addEventListener('input', () => {
	if (box.checked) background('lime');
	else background('black');
});
```

### c2d

```js
createCanvas(200, 100);

let box = createCheckbox('Check me!');
box.label.style.color = 'lime';

box.addEventListener('input', () => {
	if (box.checked) background('lime');
	else background('black');
});
```

## createColorPicker

Creates a color input element.

Use the `value` property to get or set the color value.

```
@param {string} [value] initial color value
```

### webgpu

```js
await createCanvas(200, 100);

let picker = createColorPicker();
picker.value = '#fd7575';

q5.draw = function () {
	background(picker.value);
};
```

### c2d

```js
createCanvas(200, 100);

let picker = createColorPicker();
picker.value = '#fd7575';

function draw() {
	background(picker.value);
}
```

## createImg

Creates an image element.

```
@param {string} src url of the image
```

### webgpu

```js
await createCanvas(200, 100);

let img = createImg('/assets/p5play_logo.webp');
img.position(0, 0).size(100, 100);
```

### c2d

```js
createCanvas(200, 100);

let img = createImg('/assets/p5play_logo.webp');
img.position(0, 0).size(100, 100);
```

## createInput

Creates an input element.

Use the `value` property to get or set the input's value.

Use the `placeholder` property to set label text that appears
inside the input when it's empty.

See MDN's [input documentation](https://developer.mozilla.org/docs/Web/HTML/Element/input#input_types) for the full list of input types.

```
@param {string} [value] initial value
@param {string} [type] text input type, can be 'text', 'password', 'email', 'number', 'range', 'search', 'tel', 'url'
```

### webgpu

```js
await createCanvas(200, 100);
textSize(64);

let input = createInput();
input.placeholder = 'Type here!';
input.size(200, 32);

input.addEventListener('input', () => {
	background('orange');
	text(input.value, -90, 30);
});
```

### c2d

```js
createCanvas(200, 100);
textSize(64);

let input = createInput();
input.placeholder = 'Type here!';
input.size(200, 32);

input.addEventListener('input', () => {
	background('orange');
	text(input.value, 10, 70);
});
```

## createP

Creates a paragraph element.

```
@param {string} [content] text content
```

### webgpu

```js
await createCanvas(200, 50);
background('coral');

let p = createP('Hello, world!');
p.style.color = 'pink';
```

### c2d

```js
createCanvas(200, 50);
background('coral');

let p = createP('Hello, world!');
p.style.color = 'pink';
```

## createRadio

Creates a radio button group.

Use the `option(label, value)` function to add new radio buttons
to the group.

Use the `value` property to get or set the value of the selected radio button.

```
@param {string} [groupName]
```

### webgpu

```js
await createCanvas(200, 160);

let radio = createRadio();
radio.option('square', '1').option('circle', '2');

q5.draw = function () {
	background(0.8);
	if (radio.value == '1') square(-40, -40, 80);
	if (radio.value == '2') circle(0, 0, 80);
};
```

### c2d

```js
createCanvas(200, 160);

let radio = createRadio();
radio.option('square', '1').option('circle', '2');

function draw() {
	background(200);
	if (radio.value == '1') square(75, 25, 80);
	if (radio.value == '2') circle(100, 50, 80);
}
```

## createSelect

Creates a select element.

Use the `option(label, value)` function to add new options to
the select element.

Set `multiple` to `true` to allow multiple options to be selected.

Use the `value` property to get or set the selected option value.

Use the `selected` property get the labels of the selected
options or set the selected options by label. Can be a single
string or an array of strings.

```
@param {string} [placeholder] optional placeholder text that appears before an option is selected
```

### webgpu

```js
await createCanvas(200, 100);

let sel = createSelect('Select an option');
sel.option('Red', '#f55').option('Green', '#5f5');

sel.addEventListener('change', () => {
	background(sel.value);
});
```

### c2d

```js
createCanvas(200, 100);

let sel = createSelect('Select an option');
sel.option('Red', '#f55').option('Green', '#5f5');

sel.addEventListener('change', () => {
	background(sel.value);
});
```

## createSlider

Creates a slider element.

Use the `value` property to get or set the slider's value.

Use the `val` function to get the slider's value as a number.

```
@param {number} min minimum value
@param {number} max maximum value
@param {number} [value] initial value
@param {number} [step] step size
```

### webgpu

```js
await createCanvas(200);

let slider = createSlider(0, 1, 0.5, 0.1);
slider.position(10, 10).size(180);

q5.draw = function () {
	background(slider.val());
};
```

### c2d

```js
createCanvas(200);

let slider = createSlider(0, 255);
slider.position(10, 10).size(180);

function draw() {
	background(slider.val());
}
```

## createVideo

Creates a video element.

Note that videos must be muted to autoplay and the `play` and
`pause` functions can only be run after a user interaction.

The video element can be hidden and its content can be
displayed on the canvas using the `image` function.

```
@param {string} src url of the video
@returns {HTMLVideoElement & PromiseLike<HTMLVideoElement>} a new video element
```

### webgpu

```js
await createCanvas(1);

let vid = createVideo('/assets/apollo4.mp4');
vid.size(200, 150);
vid.autoplay = vid.muted = vid.loop = true;
vid.controls = true;
```

```js
await createCanvas(200, 150);
let vid = createVideo('/assets/apollo4.mp4');
vid.hide();

q5.mousePressed = function () {
	vid.currentTime = 0;
	vid.play();
};
q5.draw = function () {
	image(vid, -100, -75, 200, 150);
	// filter(HUE_ROTATE, 90);
};
```

### c2d

```js
createCanvas(1);

let vid = createVideo('/assets/apollo4.mp4');
vid.size(200, 150);
vid.autoplay = vid.muted = vid.loop = true;
vid.controls = true;
```

```js
createCanvas(200, 150);
let vid = createVideo('/assets/apollo4.mp4');
vid.hide();

function mousePressed() {
	vid.currentTime = 0;
	vid.play();
}
function draw() {
	image(vid, 0, 0, 200, 150);
	filter(HUE_ROTATE, 90);
}
```

## createCapture

Creates a capture from a connected camera, such as a webcam.

The capture video element can be hidden and its content can be
displayed on the canvas using the `image` function.

Can preload to ensure the capture is ready to use when your
sketch starts.

Requests the highest video resolution from the user facing camera
by default. The first parameter to this function can be used to
specify the constraints for the capture. See [`getUserMedia`](https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia)
for more info.

```
@param {string} [type] type of capture, can be only `VIDEO` or only `AUDIO`, the default is to use both video and audio
@param {boolean} [flipped] whether to mirror the video vertically, true by default
@returns {HTMLVideoElement & PromiseLike<HTMLVideoElement>} a new video element
```

### webgpu

```js
q5.mousePressed = function () {
	let cap = createCapture(VIDEO);
	cap.size(200, 112.5);
	canvas.remove();
};
```

```js
let cap;
q5.mousePressed = function () {
	cap = createCapture(VIDEO);
	cap.hide();
};

q5.draw = function () {
	let y = (frameCount % 200) - 100;
	image(cap, -100, y, 200, 200);
};
```

```js
q5.mousePressed = function () {
	let cap = createCapture({
		video: { width: 640, height: 480 }
	});
	cap.size(200, 150);
	canvas.remove();
};
```

### c2d

```js
function mousePressed() {
	let cap = createCapture(VIDEO);
	cap.size(200, 112.5);
	canvas.remove();
}
```

```js
let cap;
function mousePressed() {
	cap = createCapture(VIDEO);
	cap.hide();
}

function draw() {
	let y = frameCount % height;
	image(cap, 0, y, 200, 200);
}
```

```js
function mousePressed() {
	let cap = createCapture({
		video: { width: 640, height: 480 }
	});
	cap.size(200, 150);
	canvas.remove();
}
```

## findElement

Finds the first element in the DOM that matches the given [CSS selector](https://developer.mozilla.org/docs/Learn_web_development/Core/Styling_basics/Basic_selectors).

```
@param {string} selector
@returns {HTMLElement} element
```

## findElements

Finds all elements in the DOM that match the given [CSS selector](https://developer.mozilla.org/docs/Learn_web_development/Core/Styling_basics/Basic_selectors).

```
@param {string} selector
@returns {HTMLElement[]} elements
```
