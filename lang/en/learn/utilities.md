# utilities

## load

Loads a file or multiple files.

File type is determined by file extension. q5 supports loading
text, json, csv, font, audio, and image files.

To load many files, it may be easier to use load* functions,
like `loadImage`, with q5's preload system.

```
@param {...string} urls
@returns {Promise<any[]>} a promise that resolves with objects
```

### webgpu

````js
await createCanvas(200);

let logo = await load('/q5js_logo.avif');

Q5.draw = function () {
	image(logo, -100, -100, 200, 200);
}
````

````js
await createCanvas(200);

// use with top level await in a module
await load('/assets/Robotica.ttf');

background(1);
textSize(24);
text('Hello, world!', 16, 100);
````

````js
await createCanvas(200);

let [jump, retro] = await load(
		'/assets/jump.wav', '/assets/retro.flac'
	);

Q5.mousePressed = function () {
	mouseButton == 'left' ? jump.play() : retro.play();
};
````

````js
await createCanvas(200);
background(200);
textSize(32);

let myXML = await load('/assets/animals.xml');
let mammals = myXML.getElementsByTagName('mammal');
let y = 64;
for (let mammal of mammals) {
	text(mammal.textContent, 20, (y += 32));
}
````

### c2d

````js
let logo;

async function setup() {
	logo = await load('/q5js_logo.avif');
}

function draw() {
	image(logo, 0, 0, 200, 200);
}
````

````js
createCanvas(200);

// use with top level await in a module
await load('/assets/Robotica.ttf');

background(255);
textSize(24);
text('Hello, world!', 16, 100);
````

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

````js
await createCanvas(200);
background(0.8);
circle(0, 0, 50);

Q5.mousePressed = function () {
	save('circle.png');
}
````

````js
await createCanvas(200);

textSize(180);
let bolt = createTextImage('⚡️');
image(bolt, -84, -156);

Q5.mousePressed = function () {
	save(bolt, 'bolt.png');
}
````

### c2d

````js
createCanvas(200);
background(200);
circle(100, 100, 50);

function mousePressed() {
	save('circle.png');
}
````

````js
createCanvas(200);

textSize(180);
let bolt = createTextImage('⚡️');
image(bolt, 16, -56);

function mousePressed() {
	save(bolt, 'bolt.png');
}
````

## loadText

Loads a text file from the specified url.

Returns a promise if used in async `setup`.

```
@param {string} url text file
@returns {object | Promise} an object containing the loaded text in the property `obj.text` or a promise
```

## loadJSON

Loads a JSON file from the specified url.

Returns a promise if used in async `setup`.

```
@param {string} url JSON file
@returns {any | Promise} an object or array containing the loaded JSON or a promise
```

## loadCSV

Loads a CSV file from the specified url.

Returns a promise if used in async `setup`.

```
@param {string} url CSV file
@returns {object[] | Promise<object[]>} an array of objects containing the loaded CSV or a promise
```

## loadXML

Loads an xml file from the specified url.

Returns a promise if used in async `setup`.

```
@param {string} url xml file
@returns {Element | Promise<Element>} an object containing the loaded XML in a property called `obj.DOM` or a promise
```

### c2d

````js
async function setup() {
	createCanvas(200);
	background(200);
	textSize(32);

	let myXML = await loadXML('/assets/animals.xml');

	let mammals = myXML.getElementsByTagName('mammal');
	let y = 64;
	for (let mammal of mammals) {
		text(mammal.textContent, 20, (y += 32));
	}
}
````

## nf

nf is short for number format. It formats a number
to a string with a specified number of digits.

```
@param {number} num number to format
@param {number} digits number of digits to format to
@returns {string} formatted number
```

### webgpu

````js
await createCanvas(200, 100);
background(0.8);

textSize(32);
text(nf(PI, 4, 5), -90, 10);
````

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

