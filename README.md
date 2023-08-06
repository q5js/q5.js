# <img src="q5js_logo.png" height="64"> <img src="q5js_brand.png" height="64">

q5.js is a drop-in replacement for [p5.js][]. It supports all of p5's 2D drawing APIs, math functionality, and some other utilities.

q5.min.js (39kb) is 24x smaller than p5.min.js (914kb)! It also has better performance, which is especially important on mobile devices.

q5 doesn't include any friendly error messages to help you code though. Its mainly for people who are already familiar with p5.js or JS programming in general. If you're a beginner, stick with p5 while developing a sketch, then use q5 to share your work.

## Usage

q5 should work with your existing p5.js sketches, no modifications required! If you have any problems though, please [make an issue report.][]

Try out the [q5.js template sketch](https://editor.p5js.org/quinton-ashley/sketches/8SEtLEDl9) for the online p5.js Web Editor.

Or you can use q5.js in your own project by adding this line to your HTML file:

```html
<script src="https://quinton-ashley.github.io/q5.js/q5.js"></script>
```

q5 is also available on [npm](https://www.npmjs.com/package/q5)!

```bash
npm install q5
```

## Using p5 Addon Libraries

q5.js is compatible with popular p5 addons and projects that use p5, such as p5play, because it aliases `Q5` to `p5`.

To use addons, simply load them after q5.js:

```html
<script src="q5.js"></script>
<!-- load p5 addons after q5 -->
<script src="https://p5play.org/v3/planck.min.js"></script>
<script src="https://p5play.org/v3/p5play.js"></script>
```

## What's new in Version 1.1?

Co-creator of q5, @quinton-ashley, added a ton of features:

- `registerMethod` functionality for supporting p5.js addons such as [p5play](https://p5play.org)!
- automatic global instance creation, can also be user instantiated as well with `new Q5('global')` like with the previous version of q5xjs
- p5 instance mode support
- add q5 canvas to a container element with `new Q5('global', parentElem)` or `new Q5(parentElem)`
- `angleMode` functionality
- `loadSound` function that returns a barebones sound object with `play`, `pause`, and `setVolume` methods
- fixed `pixelDensity` bugs
- fixed `text` function bug not displaying "0" (falsey value in JS)
- fixed `keyPressed` repeating key presses
- made `instanceof` checks work for q5.js objects of the `Color`, `Vector`, and `Image` classes
- the `push` and `pop` functions now save and restore style properties like `rectMode` and `strokeWeight`
- `nf` (number format) function, which is used in p5play
- `pow` function alias to `Math.pow`
- prevented text stroke from being drawn if the user did not specify a stroke (p5.js behavior)
- fixed `Vector.lerp` implementation
- fixed `mouseX` and `mouseY` not updating when the mouse is outside the canvas

## Motivation: Part 1

_This section was written by @LingDong-, co-creator of q5_

After having used many graphics libraries across many different languages, I have found that the Processing/p5.js/Openframeworks system has one huge advantage over others:

It gets stuff drawn onto the screen quick and easy!

This might sound silly, but it actually means a lot for people concerned with creative expression. The easier it is to try things out, before one's time and patience is up, the greater chance that you'll get something nice in the end. Therefore, although you can theoretically achieve the exact same result in any decent graphics system, the tool does matter in practice. Artists want more time to spend actually working on how their piece looks, instead of wondering why the computer doesn't work as intended.

At [Carnegie Mellon University](https://www.cmu.edu/cfa/studio/index.html), where I studied computational art, p5.js is taught as _the_ framework for the web, and its been a great introduction. However, due to some of the ways in which p5.js is implemented, I found myself using it less and less as I made more and more projects. Lately, I've found that I'll reach directly for the standard JavaScript/Web APIs instead of p5.js. I sometimes think of this as shedding the training wheels on one's bicycle. But I missed the artist-centered logic of the p5 interface! I started thinking, "Is there a better way?"

Just to clarify, I think the official p5.js implementation is perfectly justified for its philosophy and suitability for its intended purpose, but my own needs are different enough that I think they justify another implementation instead of pull requests to the official one.

In fact, its not uncommon for successful software systems to have multiple implementations of the same spec (think: compilers of C, implementations of SQL, and engines of JavaScript). This allows the user to choose a backend that best suits their goals or needs. When one is using p5.js (or Processing or OpenFrameworks), what one is really using is the same set of commands, the intuitive way of describing drawings, that empowers creative expression. The actual way these commands are implemented internally is incidental; it should be possible to swap internal implementations as necessary.

## Motivation: Part 2

_This section was written by @quinton-ashley, co-creator of q5_

I thought @LingDong-'s work on q5 and the idea itself had great potential. So I decided to upgrade its compatibility with p5.js. My main goal was to make it work with [p5play](https://p5play.org)!

An increase in performance of even a few frames per second can make a significant difference in the user experience of a work of interactive art or a game, especially on mobile devices.

I was also interested in working on q5 because for a lot of p5.js users, the library itself is a black box. Even as an expert JS programmer and someone who teaches CS for a living, I still find myself scratching my head when I look at the p5.js source code. p5 was initially released 10 years ago and I think some bad design choices were made due to JS limitations at the time. It's also become an absolutely massive library, with literally over 100,000 lines of code and documentation! p5.js is 4 MB un-minified, q5.js is just 66kb.

I think it'd be better if the canvas mode, webgl mode, Friendly Error System, and accessibility features of p5 were offered in separate files. Yet, the powers that be at the Processing Foundation have made it clear that they don't want to do that. Instead they insist on adding more accessibility features to the base library, which the majority of people just don't need. So q5 is a good alternative that trims out the fat.

Thanks in large part to @LingDong-'s design, q5 is well organized, concise, and utilizes many modern JS features! I think even without documentation, the source code is easier for experienced JS programmers to comprehend.

## New Features: Top-Level Global Mode

There are some extra features in q5 that aren't in p5, but using them is totally optional.

**q5.js** has an automatic global mode, which is enabled by default. This means existing p5.js sketches can be run without any modification.

But with q5, you could do away with the setup function all together. Just write the initialization routine `new Q5('global')` at the top of your sketch.

For example, you can now directly run examples from [p5js.org/reference](https://p5js.org/reference) without wrapping them in a setup function:

```js
new Q5('global');

noStroke();
let c = color(0, 126, 255, 102);
fill(c);
rect(15, 15, 35, 70);
```

You could even use your own animation loop in place of `draw()`. But this would cause problems with addons that rely on `draw()`, such as p5play.

```js
new Q5('global');

fill(255, 0, 0);

function myLoop() {
	requestAnimationFrame(myLoop);
	rect(15, 15, 35, 70);
}
myLoop();
```

## New Features: Namespace Mode

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

**q5** introduces "namespace" mode, in addition to global/instance modes:

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
	q5.createCanvas(400, 400);
};

q5.draw = function () {
	q5.background(100);
};

q6.setup = function () {
	q6.createCanvas(400, 400);
};

q6.draw = function () {
	q6.background(200);
};
```

## More extra features

q5.js provides some other features that are not in p5.js:

- `randomExponential()` in addition to `randomGaussian()`: a random distribution that resembles exponential decay.
- `curveAlpha()`: manipulate the `α` parameter of Catmull-Rom curves.
- `relRotationX`, `relRotationY` and `relRotationZ`: Similar to `rotationX/Y/Z`, but are relative to the orientation of the mobile device.

## Cutting room floor

**p5.js** has some pretty extensive parsing capabilities. For example, it can parse out a color from strings like `color('hsl(160, 100%, 50%)')` or `color("lightblue")`. Functions behave sightly differently when under different "modes" (e.g. `hue`), and some have secret default settings (e.g. `arc` and `text`).

**q5.js** will only do things when you communicate the command in the simplest way. This means that functions mainly just take numeric inputs. Any behavior needs to be explicitly triggered. q5 has almost no overhead between digesting your parameters and putting them into use.

## Known Issues

- `curveTightness()` sets the 'alpha' parameter of Catmull-Rom curve, and is NOT identical to p5.js counterpart. As this might change in the future, please call `curveAlpha()` directly.

## Size Comparison

- p5.min.js 898kb
- p5.sound.min.js 200kb

- q5.min.js 39kb

- planck.min.js 193kb
- p5play.min.js 90kb

## Benchmarks

q5.js has significant speed advantage in imaging operations because it uses hardware accelerated Canvas APIs directly whenever possible, instead of going over pixel by pixel. Most other functionalities have very marginal speed improvements (or none at all when parameter validation overhead is negligible). The operations with important performance differences are listed below.

The following benchmarks are generated with Google Chrome 84, on an old-ish MacBook Pro 2015 (with lots of apps and tabs running); Performance varies depending on software and hardware.

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

Speed is a goal for q5.js, and we would very much like to see the above list grow. If you know how to make something faster, advice/pull requests are very welcome!

[p5.js]: https://p5js.org
[make an issue report.]: https://github.com/quinton-ashley/q5.js/issues
