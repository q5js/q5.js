# sound

q5.js includes low latency sound playback and basic mixing powered
by WebAudio.

For audio filtering, synthesis, and analysis, consider using
[p5.sound](https://p5js.org/reference/p5.sound/).

## loadSound

Loads audio data from a file and returns a `Q5.Sound` object.

Use functions like `play`, `pause`, and `stop` to 
control playback. Note that sounds can only be played after the 
first user interaction with the page!

Set `volume` to a value between 0 (silent) and 1 (full volume).
Set `pan` to a value between -1 (left) and 1 (right) to adjust
the sound's stereo position. Set `loop` to true to loop the sound.

Use `loaded`, `paused`, and `ended` to check the sound's status.

The entire sound file must be loaded before playback can start,
to stream larger audio files use the `loadAudio` function instead.

For backwards compatibility with the p5.sound API, the functions 
`setVolume`, `setLoop`, `setPan`, `isLoaded`, and `isPlaying`
are also implemented, but their use is deprecated.

Returns a promise if used in async `setup`.

```
@param {string} url sound file
@returns {Sound | Promise<Sound>} a new `Sound` object or promise
```

### webgpu

````js
await createCanvas(200);

let sound = loadSound('/assets/jump.wav');
sound.volume = 0.3;

Q5.mousePressed = function () {
	sound.play();
}
````

### c2d

````js
createCanvas(200);

let sound = loadSound('/assets/jump.wav');
sound.volume = 0.3;

function mousePressed() {
	sound.play();
}
````

## loadAudio

Loads audio data from a file and returns an [HTMLAudioElement](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement).

Audio is considered loaded when the [canplaythrough event](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event) is fired.

Note that audio can only be played after the first user 
interaction with the page!

Returns a promise if used in async `setup`.

```
@param url audio file
@returns {HTMLAudioElement | Promise<HTMLAudioElement>} an HTMLAudioElement or promise
```

### webgpu

````js
await createCanvas(200);

let audio = loadAudio('/assets/retro.flac');
audio.volume = 0.4;

Q5.mousePressed = function () {
	audio.play();
}
````

### c2d

````js
createCanvas(200);

let audio = loadAudio('/assets/retro.flac');
audio.volume = 0.4;

function mousePressed() {
	audio.play();
}
````

## getAudioContext

Returns the AudioContext in use or undefined if it doesn't exist.

```
@returns {AudioContext} AudioContext instance
```

## userStartAudio

Creates a new AudioContext or resumes it if it was suspended.

```
@returns {Promise<void>} a promise that resolves when the AudioContext is resumed
```

## Sound.constructor

Creates a new `Q5.Sound` object.

## Sound.volume

Set the sound's volume to a value between
0 (silent) and 1 (full volume).

## Sound.pan

Set the sound's stereo position between -1 (left) and 1 (right).

## Sound.loop

Set to true to make the sound loop continuously.

## Sound.loaded

True if the sound data has finished loading.

## Sound.paused

True if the sound is currently paused.

## Sound.ended

True if the sound has finished playing.

## Sound.play

Plays the sound.

If this function is run when the sound is already playing,
a new playback will start, causing a layering effect.

If this function is run when the sound is paused,
all playback instances will be resumed.

## Sound.pause

Pauses the sound, allowing it to be resumed.

## Sound.stop

Stops the sound, resetting its playback position
to the beginning.

Removes all playback instances.

