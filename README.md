# q5.js

q5.js is a drop-in replacement for [p5.js][]. It supports almost all of p5.js's 2D drawing API's, math functionality, and other utilities.

q5.min.js is 25x smaller than p5.min.js, which makes using [q5 better for the environment.][] q5 will also load faster on slow connections, which is especially important for mobile users, and it runs faster!

q5.js doesn't include any friendly error messages to help you code though. If you're a beginner, stick with p5.js while developing a sketch and then use q5.js to share your work.

## Usage

```html
<script src="https://quinton-ashley.github.io/q5js/q5.js"></script>
```

q5 works with your existing p5.js sketches, no modifications required! If you have any problems though, please [make an issue report.][]

q5.js can also be used with the p5 online Web Editor (editor.p5js.org). [q5 template example](https://editor.p5js.org/lingdong/sketches/xrT2VF08P)

## Using p5 Addons

q5.js is compatible with popular p5 addons like p5.sound and p5.play because it aliases `Q5` to `p5`.

To use addons, simply load them after q5.js:

```html
<script src="q5.min.js"></script>
<!-- load p5 addons after q5 -->
<script src="p5.sound.js"></script>
```

## What's new in Version 1.0?

- added `registerMethod` functionality for supporting p5.js addons such as p5.play!
- automatic global instance creation, can also be user instantiated as well with `new Q5('global')` like with the previous version of q5xjs
- add q5 canvas to a container element with `new Q5('global', parentElem)` or `new Q5(parentElem)`
- added `angleMode` functionality
- fixed `pixelDensity` bugs
- added a `loadSound` function that returns a barebones sound object with `play`, `pause`, and `setVolume` methods
- made `instanceof` checks work for q5.js objects of the `Color`, `Vector`, and `Image` classes
- the `push` and `pop` functions now save and restore style properties like `rectMode` and `strokeWeight`
- added `nf` (number format) function, which is used in p5.play
- added `pow` function alias to `Math.pow`
- prevented text stroke from being drawn if the user did not specify a stroke (p5.js behavior)
- fixed `mouseX` and `mouseY` not updating when the mouse is outside the canvas

## Motivation

_This section was written by @LingDong-, the creator of q5_

After having used many graphics libraries across many different languages, I have found that the Processing/p5.js/Openframeworks system has one huge advantage over others:

It gets stuff drawn onto the screen quick and easy!

This might sound silly, but it actually means a lot for people concerned with creative expression. The easier it is to try different things, the more possibilities you can try (before time and/or patience run out), and the greater the chance that you'll get something nice in the end. Therefore, although you can theoretically achieve the exact same result in any decent graphics system, the tool does matter in practice: You want more time to spend actually working on how your piece looks, instead of spending it on wondering why the computer doesn't work as you intend.

[Where](https://www.cmu.edu/cfa/studio/index.html) I studied computational art, p5.js is taught as "the" framework for the web, and it's been a great introduction. However, due to some of the ways in which p5.js is implemented, I find myself using it less and less as I make more and more projects. Instead I reach directly for the JavaScript/Web API's (which are also well designed enough). I sometimes think of this as shedding the "baby" wheels on the bicycle. But then I miss the artist-centered logic of the p5 interface! I'm now thinking: is there a better way?

To clarify: I think the official p5.js implementation is perfectly justified for its philosophy and suitability for its intended purpose, but my own needs are different enough that I think they justify another implementation instead of pull requests to the official one.

In fact, it is not uncommon for successful software systems to have multiple implementations under one spec (think: compilers of C, implementations of SQL, and engines of JavaScript): The user can choose a backend that best suits their goals or needs. The distinction between the "spec" and the "implementation" is a good idea: when one is using p5.js (or Processing or OpenFrameworks), what one is really using is the same set of commands, the intuitive way of describing drawings, that empowers creative expression. The actual way these commands are implemented internally is incidental; it should be possible to swap internal implementations as necessary.

Check out these q5 renditions of the standard p5 examples on [the q5xjs website](https://q5xjs.netlify.app).

## New Features

There are some features in q5 that are not in p5, but using them is totally optional.

In **p5.js**, all p5 functions are in the global namespace, unless you use "instance" mode, like this:

```js
let sketch = function (p) {
	p.setup = function () {
		p.createCanvas(100, 100);
	};
	p.draw = function () {
		p.background(0);
	};
};

let myp5 = new p5(sketch);
```

This does solve the problem of global namespace pollution, but there're still some inconveniences:

- The extra wrapping of the `sketch` function makes code look complex. (Flat is better than nested!)
- Variables inside `sketch` can no longer be accessed via browser console, which makes it less convenient for debugging.

**q5** introduces "namespace" mode in place of global/instance mode:

```js
let q5 = new Q5();

q5.setup = function () {
	q5.createCanvas(100, 100);
};

q5.draw = function () {
	q5.background(0);
};
```

You can call the namespace whatever you like. You can even get multiple instances of q5 running on the same page easily.

```js
let q5 = new Q5();
let q6 = new Q5();

q5.setup = function () {
	q5.background(255);
};

q6.setup = function () {
	q6.background(0);
};
```

Of course, you can still have the good old global namespacing via `Q5("global")`, making q5.js mostly code-compatible with existing p5 sketches:

```js
new Q5('global');

function setup() {
	background(0);
}

function draw() {}
```

## Extra Features

**q5.js** has an automatic global mode, which is enabled by default. This means existing p5.js sketches can be run without any modification.

But with q5, you can do away with the setup function all together. Just write your initialization routines at the top level.

For example, you can now directly run examples on [p5js.org/reference](https://p5js.org/reference) without wrapping them in a setup function:

```js
new Q5('global');

noStroke();
let c = color(0, 126, 255, 102);
fill(c);
rect(15, 15, 35, 70);
```

You could even roll out your own animation loop in place of `draw()`. Good for mixing with other libraries too.

```js
new Q5('global');

fill(255, 0, 0);

function myLoop() {
	requestAnimationFrame(myLoop);
	rect(15, 15, 35, 70);
}
myLoop();
```

## More extra features

q5.js provides some other features that are not in p5.js:

- `randomExponential()` in addition to `randomGaussian()`: a random distribution that resembles exponential decay.
- `curveAlpha()`: manipulate the `α` parameter of Catmull-Rom curves.
- `relRotationX`, `relRotationY` and `relRotationZ`: Similar to `rotationX/Y/Z`, but are relative to the orientation of the mobile device.

## Cutting room floor

**p5.js** has some pretty extensive parsing capabilities. For example, it can parse out a color from strings like `color('hsl(160, 100%, 50%)')` or `color("lightblue")`. Functions behave sightly differently when under different "modes" (e.g. `hue`), and some have secret default settings (e.g. `arc` and `text`).

**q5.js** will only do things when you communicate the command in the simplest way. This means that functions mainly just take numeric inputs, and any behavior needs to be explicitly triggered. q5 has almost no overhead between digesting your parameters and putting them into use.

## Size Comparison

- p5.min.js 898kb
- p5.sound.min.js 200kb

- q5.min.js 35kb

- planck.min.js 193kb
- p5play.min.js 66kb

## Benchmarks

q5.js has significant speed advantage in imaging operations because it uses hardware accelerated Canvas API directly whenever possible, instead of going over pixel by pixel. Most other functionalities have very marginal speed improvements (or none at all when parameter validation overhead is negligible). The operations with important performance differences are listed below.

The following benchmarks are generated with Google Chrome 84, on an old-ish Macbook Pro 2015 (with lots of apps and tabs running); Performance varies depending on software and hardware.

p5.js version used is **1.1.9**.

| Operation on 1024x1024 image | p5.js | q5.js    |
| ---------------------------- | ----- | -------- |
| tinting                      | 20FPS | 35FPS    |
| blurring(11px)               | 0FPS  | 40FPS \* |
| thresholding                 | 10FPS | 40FPS \* |
| grayscaling                  | 10FPS | 50FPS \* |
| inverting                    | 10FPS | 50FPS \* |
| opaque                       | 20FPS | 60FPS    |
| erode/dilate                 | 5FPS  | 9FPS     |

| Misc                                                | p5.js | q5.js |
| --------------------------------------------------- | ----- | ----- |
| Generating 10,000 `randomGaussian()` sample         | 10FPS | 20FPS |
| Calling `noiseSeed()` 1,000 times                   | 10FPS | 60FPS |
| Generate 10,000 (random) colors with `color(r,g,b)` | 5FPS  | 60FPS |
| Rotate a `Vector` 1,000,000 times                   | 13FPS | 60FPS |

<sub>\* Only for browsers that support CanvasRenderingContext2D.filter ([75% of all](https://caniuse.com/#feat=mdn-api_canvasrenderingcontext2d_filter) as of Aug 2020, including Chrome, Firefox and Edge). For those that don't, performance is similar to p5.js, as identical implementations are usually used as fallbacks.</sub>

Speed is a goal for q5.js, and we would very much like to see the above list grow. If you know how to make something faster, advice/pull requests are very welcome.

[p5.js]: https://p5js.org
[report the issue.]: https://github.com/quinton-ashley/q5js/issues
[q5 better for the environment.]: https://observablehq.com/@mrchrisadams/carbon-footprint-of-sending-data-around
