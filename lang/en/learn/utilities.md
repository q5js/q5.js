# utilities

## load

Loads a file or multiple files.

File type is determined by file extension. q5 supports loading
text, json, csv, font, audio, and image files.

By default, assets are loaded in parallel before q5 runs `draw`. Use `await` to wait for assets to load.

```
@param {...string} urls
@returns {Promise<any[]>} a promise that resolves with objects
```

### webgpu

```js
await Canvas(200);

let logo = load('/q5js_logo.avif');

q5.draw = function () {
	image(logo, -100, -100, 200, 200);
};
```

```js
await Canvas(200);
background(0.8);

await load('/assets/Robotica.ttf');

textSize(28);
text('Hello, world!', -97, 100);
```

```js
await Canvas(200);

let [jump, retro] = await load('/assets/jump.wav', '/assets/retro.flac');

q5.mousePressed = function () {
	if (mouseButton == 'left') jump.play();
	if (mouseButton == 'right') retro.play();
};
//
```

```js
await Canvas(200);
background(0.8);
textSize(32);

let xml = await load('/assets/animals.xml');
let mammals = xml.querySelectorAll('mammal');
let y = -90;
for (let mammal of mammals) {
	text(mammal.textContent, -90, (y += 32));
}
```

### c2d

```js
createCanvas(200);
let logo = load('/q5js_logo.avif');

function draw() {
	image(logo, 0, 0, 200, 200);
}
```

## save

Saves data to a file.

If data is not specified, the canvas will be saved.

If no arguments are provided, the canvas will be saved as
an image file named "untitled.png".

```
@param {object} [data] canvas, image, or JS object
@param {string} [fileName] filename to save as
```

### webgpu

```js
await Canvas(200);
background(0.8);
circle(0, 0, 50);

q5.mousePressed = function () {
	save('circle.png');
};
```

```js
await Canvas(200);
background(0.8);
text('save me?', -90, 0);
textSize(180);
let bolt = createTextImage('⚡️');

q5.mousePressed = function () {
	save(bolt, 'bolt.png');
};
```

### c2d

```js
createCanvas(200);
background(200);
circle(100, 100, 50);

function mousePressed() {
	save('circle.png');
}
```

```js
createCanvas(200);

textSize(180);
let bolt = createTextImage('⚡️');
image(bolt, 16, -56);

function mousePressed() {
	save(bolt, 'bolt.png');
}
```

## loadText

Loads a text file from the specified url.

Using `await` to get the loaded text as a string is recommended.

```
@param {string} url text file
@returns {object & PromiseLike<string>} an object containing the loaded text in the property `obj.text` or use `await` to get the text string directly
```

## loadJSON

Loads a JSON file from the specified url.

Using `await` to get the loaded JSON object or array is recommended.

```
@param {string} url JSON file
@returns {any & PromiseLike<any>} an object or array containing the loaded JSON
```

## loadCSV

Loads a CSV file from the specified url.

Using `await` to get the loaded CSV as an array of objects is recommended.

```
@param {string} url CSV file
@returns {object[] & PromiseLike<object[]>} an array of objects containing the loaded CSV
```

## loadXML

Loads an xml file from the specified url.

Using `await` to get the loaded XML Element is recommended.

```
@param {string} url xml file
@returns {Element & PromiseLike<Element>} an object containing the loaded XML Element in a property called `obj.DOM` or use await to get the XML Element directly
```

### webgpu

```js
await Canvas(200);
background(0.8);
textSize(32);

let xml = await load('/assets/animals.xml');
let mammals = xml.querySelectorAll('mammal');
let y = -90;
for (let mammal of mammals) {
	text(mammal.textContent, -90, (y += 32));
}
```

## loadAll

Wait for any assets that started loading to finish loading. By default q5 runs this before looping draw (which is called preloading), but it can be used even after draw starts looping.

```
@returns {PromiseLike<any[]>} a promise that resolves with loaded objects
```

## disablePreload

Disables the automatic preloading of assets before draw starts looping. This allows draw to start immediately, and assets can be lazy loaded or `loadAll()` can be used to wait for assets to finish loading later.

## nf

nf is short for number format. It formats a number
to a string with a specified number of digits.

```
@param {number} num number to format
@param {number} digits number of digits to format to
@returns {string} formatted number
```

### webgpu

```js
await Canvas(200, 100);
background(0.8);

textSize(32);
text(nf(PI, 4, 5), -90, 10);
```

## shuffle

Shuffles the elements of an array.

```
@param {any[]} arr array to shuffle
@param {boolean} [modify] whether to modify the original array, false by default which copies the array before shuffling
@returns {any[]} shuffled array
```

## storeItem

Stores an item in localStorage.

```
@param {string} key key under which to store the item
@param {string} val value to store
```

## getItem

Retrieves an item from localStorage.

```
@param {string} key key of the item to retrieve
@returns {string} value of the retrieved item
```

## removeItem

Removes an item from localStorage.

```
@param {string} key key of the item to remove
```

## clearStorage

Clears all items from localStorage.

## year

Returns the current year.

```
@returns {number} current year
```

## day

Returns the current day of the month.

```
@returns {number} current day
```

## hour

Returns the current hour.

```
@returns {number} current hour
```

## minute

Returns the current minute.

```
@returns {number} current minute
```

## second

Returns the current second.

```
@returns {number} current second
```
