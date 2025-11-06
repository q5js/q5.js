# record

## createRecorder

Creates a recorder. Simply hit record to start recording!

The following properties can be set via the recorder UI or
programmatically.

- `format` is set to "H.264" by default.
- `bitrate` is a number in megabits per second (mbps). Its default
value is determined by the height of the canvas. Increasing the
bitrate will increase the quality and file size of the recording.
- `captureAudio` is set to true by default. Set to false to disable
audio recording.

Note that recordings are done at a variable frame rate (VFR), which
makes the output video incompatible with some editing software.
For more info, see the
["Recording the Canvas"](https://github.com/q5js/q5.js/wiki/Recording-the-Canvas).
wiki page.

```
@returns {HTMLElement} a recorder, q5 DOM element
```

### webgpu

````js
await createCanvas(200);

let rec = createRecorder();
rec.bitrate = 10;

Q5.draw = function () {
	circle(mouseX, jit(halfHeight), 10);
}
````

### c2d

````js
createCanvas(200);

let rec = createRecorder();
rec.bitrate = 10;

function draw() {
	circle(mouseX, random(height), 10);
}
````

## record

Starts recording the canvas or resumes recording if it was paused.

If no recorder exists, one is created but not displayed.

## pauseRecording

Pauses the canvas recording, if one is in progress.

## deleteRecording

Discards the current recording.

## saveRecording

Saves the current recording as a video file.

```
@param {string} fileName
```

### webgpu

````js
Q5.draw = function () {
	square(mouseX, jit(100), 10);
}

Q5.mousePressed = function () {
	if (!recording) record();
	else saveRecording('squares');
}
````

### c2d

````js
function draw() {
	square(mouseX, random(200), 10);
}

function mousePressed() {
	if (!recording) record();
	else saveRecording('squares');
}
````

## recording

True if the canvas is currently being recorded.

