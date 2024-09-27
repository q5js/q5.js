# <img src="q5js_logo.webp" height="64"> <img src="q5js_brand.webp" height="64">

A sequel to p5.js that's smaller, faster, and optimized for interactive art!

**q5.js** implements all of [p5][]'s 2D drawing, math, and user input functionality.

It's a drop-in replacement that's 98% smaller than p5, while packing exclusive new features: HDR color support, modular use, top-level global mode, namespace mode, text image caching, dimension agnostic mode, and more.

## Typical Use

q5 should work with your existing p5.js sketches, no modifications required! If you have any problems though, please [make an issue report][].

Use q5.js in your own project by adding this line to your HTML file:

```html
<script src="https://q5js.org/q5.js"></script>
```

q5 is also available on [npm](https://www.npmjs.com/package/q5)!

```bash
npm install q5
```

Or try out the [q5.js template sketch](https://editor.p5js.org/quinton-ashley/sketches/8SEtLEDl9) for the online p5.js Web Editor.

## Support this project 🤝

q5 is open source. Anyone can use q5 for free under the terms of the LGPL, just like p5.js. 🎉

If you'd like to support this project, please donate via [GitHub Sponsors](https://github.com/sponsors/quinton-ashley) or [Patreon](https://www.patreon.com/p5play).

## Using p5 Addon Libraries

q5.js is compatible with popular p5 addons and projects that use p5, such as [p5play][], because it aliases `Q5` to `p5`.

To use addons, simply load them after q5.js:

```html
<script src="https://q5js.org/q5.js"></script>
<!-- load p5 addons after q5 -->
<script src="https://p5play.org/v3/planck.min.js"></script>
<script src="https://p5play.org/v3/p5play.js"></script>
```

## Exclusive Features

q5 includes some exclusive features that aren't available in p5.

## Ask AI ✨

Why doesn't this code work? `text('Hello!');`

JavaScript quietly avoids errors if possible (for example by giving undefined variables default values) and its error messages can be confusing for beginners.

p5's error messages are friendlier but often too vague, leaving beginners searching for help. 🙋

```
🌸 p5.js says: [test.js, line 19] text() was expecting at least 3 arguments, but received only 1.
```

Why not ask ChatGPT 4o? It excels at identifying the most common errors that beginners make: typos, missing syntax, incorrect arguments, and more.

q5 creates error reports that can be sent to an AI just by clicking a link! Users can also run the `askAI()` function before a line of code that isn't working as expected. 🤖

```js
function draw() {
	askAI();
	text('Hello!');
}
```

Optionally `askAI` can take a question as input, the default question is "What's wrong with this line? short answer".

ChatGPT 4o excels at identifying the most common errors that beginners make: typos, missing syntax, incorrect arguments, and more.

This feature can be disabled by setting `Q5.disableFriendlyErrors = true;`, though unlike in p5 this doesn't provide a performance boost from disabling argument validation because q5 mostly doesn't have any already.

q5 can catch errors in q5 function like `draw` and continue looping if you set `Q5.errorTolerant = true;`.

## Top-Level Global Mode

In **p5**, functions like `rect` can't be used on the file level. They must be called from within p5 functions like `setup` and `draw`.

In **q5**, existing p5 2D sketches don't require any modification. But if you initialize Q5 at the top of your sketch, the `preload` and `setup` functions become optional.

```js
new Q5();

noStroke();
let c = color(0, 126, 255, 102);
fill(c);
rect(15, 15, 35, 70);
```

This is great because you don't have to declare variables on the file level and then define them in `preload` or `setup`. You can declare and define them at the same time!

```js
new Q5();

let cow = loadImage('cow.png');

preload();

function setup() {
	image(cow, 0, 0);
}
```

Note that if you use `loadImage` on the file level, q5 will wait to run `setup` and `draw` until the image loads. Optionally if you forgo defining `preload`, you can run it to signify that the sketch can start once loading is complete. Otherwise q5 will auto-start the sketch after 32ms of delay, this ensures code after `new Q5()` is run before the sketch starts.

## HDR Color Support

Most modern devices support the "display-p3" HDR color space. If a device doesn't support it, q5 will fall back to "srgb".

In **q5**, `colorMode` accepts 'rgb', 'srgb', and 'oklch'. The default mode is 'rgb', which upgrades rgb colors to HDR on supported displays. Specifying 'srgb' on an HDR capable device enables sRGB gamut correction for rgb colors.

The [oklch](https://oklch.com/#63.65,0.2872,16.57,100) color format is the best way to work with HDR colors!

https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl

```js
colorMode('oklch');

//       (lightness, chroma, hue, alpha)
let c = color(0.637, 0.287, 16.57, 1);
```

The `color` function doesn't accept percentages so you'll have to convert those to decimal values. Also its string parsing capability is limited to simple named colors and the hex "#RRGGBB" or "#RRGGBBAA" formats.

Use `new Color()` to create color objects without any parsing overhead.

q5 also exposes color components as single letter properties of `Color` objects. For example, you can easily change the red of rgb colors like this `c.r = 128` or the hue of oklch colors like this `c.h = 180`.

Support for the HSV color format was removed in q5 v1.9.3 because color experts thought HSV was flawed, outdated, and ought to be abandoned way back in 1997! oklch is superior in every way.

https://en.wikipedia.org/wiki/HSL_and_HSV#Disadvantages

## Customize Canvas Context Attributes

In **p5**, you're stuck with the default [canvas context attributes][], which can't be changed. So the canvas must have an alpha layer, even if you don't need one. HDR color space and [desynchronized rendering][] are not supported.

But **q5** has its own defaults:

```js
Q5.canvasOptions = {
	alpha: false,
	desynchronized: false,
	colorSpace: 'display-p3'
};
```

The "display-p3" color space will be used by default on supported devices, falling back to "srgb".

The `Q5.canvasOptions` object can be overridden, which will effect all q5 instances. You can also override any of these defaults by passing an options object as the fourth parameter to the `createCanvas()` function:

```js
createCanvas(400, 400, '2d', {
	alpha: true
});
```

## Namespace Mode

**p5**'s [instance mode][] enables multiple sketches to run on one page. To avoid needing to preface every p5 function with `p.` you can use a JS [with statement][].

```js
let sketch = (p) => {
	with (p) {
		p.setup = () => {
			createCanvas(400, 400);
		};
		p.draw = () => {
			background(100);
		};
	}
};

let myp5 = new p5(sketch);
```

**q5** introduces "namespace" mode, in addition to the global and instance modes. You can call the namespace variable whatever you like.

```js
let q = new Q5('namespace');

with (q) {
	q.setup = () => {
		createCanvas(400, 400);
	};
	q.draw = () => {
		background(100);
	};
}
```

## Dimension Agnostic

In **p5** the only way to do dimension agnostic sketches is to set variables to percentages of the canvas' width and height but this is cumbersome and makes code look messy.

In **q5**, @Tezumie added a new feature called `flexibleCanvas`. It takes a unit as input, then any position coordinates or dimensions you use will be scaled based on that unit.

In this example, the rect will appear in the middle of the canvas.

```js
new Q5();
createCanvas(1000, 1000);

flexibleCanvas(400);
rect(100, 100, 200, 200);
```

## Frame your Art

The `displayMode` function lets you customize how your canvas is presented.

```js
displayMode(mode, renderQuality, displayScale);
```

Display modes:

"normal": no styling to canvas or its parent element
"centered": canvas will be centered horizontally and vertically within its parent and if it's display size is bigger than its parent it will not clip
"maxed": canvas will fill the parent element, same as fullscreen for a global mode canvas inside a `main` element
"fullscreen": canvas will fill the screen with letterboxing to persevere its aspect ratio, like css object-fit contain

Render qualities:

"default": pixelDensity set to displayDensity
"pixelated": pixelDensity set to 1 and various css styles are applied to the canvas to make it render without image smoothing

displayScale:

Can be given as a string "x2" or a number. This can be used to make small canvases appear larger.

## Node.js Usage

> Node.js support was recently added, please [make an issue report][] if you encounter any problems.

If you're not interested in rendering to a canvas, q5.js can be used in node.js without any additional dependencies. Just use `noCanvas()` in your sketch and don't call any drawing functions that require a canvas.

If you want to render to a canvas, you'll need to install the `canvas` and `jsdom` packages.

```bash
npm install canvas jsdom
```

q5 will automatically load and configure `canvas` and `jsdom` if they are installed. `Q5`, `cairoCanvas`, and `JSDOM` will be added to the global scope by `require('q5')`.

In node.js, q5's automatic global mode is disabled. To use global mode you need to assign q5 user defined functions like `draw` and `setup` to the `global` object then call `new Q5()`. q5 will add q5 variables and functions to the `global` object, just like it adds them to the `window` object in the browser.

## Modular Use

**p5.js** is nearly 5MB in size. This is mainly [due to the inclusion of the webgl render and the dependencies corejs and opentype](https://github.com/processing/p5.js/issues/6776#issuecomment-1918238317). If 2d rendering is all a sketch needs, p5 wastes user bandwidth and is slower to load, parse, and run.

**q5.js** (the default bundle) is 70x smaller than p5, which is already great for typical use. For extremely lightweight use you can load a subset of scripts from the `src` folder, just be sure to load `src/q5-core.js` first.

## Motivation: Part 1

> This section was written by @LingDong-

After having used many graphics libraries across many different languages, I have found that the Processing system has one huge advantage over others:

It gets stuff drawn onto the screen quick and easy!

This might sound silly, but it actually means a lot for people concerned with creative expression. The easier it is to try things out, before one's time and patience is up, the greater chance that you'll get something nice in the end. Therefore, although you can theoretically achieve the exact same result in any decent graphics system, the tool does matter in practice. Artists want more time to spend actually working on how their piece looks, instead of wondering why the computer doesn't work as intended.

At [Carnegie Mellon University](https://www.cmu.edu/cfa/studio/index.html), where I studied computational art, p5.js is taught as _the_ framework for the web, and its been a great introduction. However, due to some of the ways in which p5.js is implemented, I found myself using it less and less as I made more and more projects. Lately, I've found that I'll reach directly for the standard JavaScript/Web APIs instead of p5.js. I sometimes think of this as shedding the training wheels on one's bicycle. But I missed the artist-centered logic of the p5 interface! I started thinking, "Is there a better way?"

Just to clarify, I think the official p5.js implementation is perfectly justified for its philosophy and suitability for its intended purpose, but my own needs are different enough that I think they justify another implementation instead of pull requests to the official one.

In fact, its not uncommon for successful software systems to have multiple implementations of the same spec (think: compilers of C, implementations of SQL, and engines of JavaScript). This allows the user to choose a backend that best suits their goals or needs. When one is using p5.js (or Processing or OpenFrameworks), what one is really using is the same set of commands, the intuitive way of describing drawings, that empowers creative expression. The actual way these commands are implemented internally is incidental; it should be possible to swap internal implementations as necessary.

## Motivation: Part 2

> This section was written by @quinton-ashley

I thought @LingDong-'s work on q5 and the idea itself had great potential, so I decided to implement more of the p5.js API. My main goal was to make it work with [p5play](https://p5play.org)!

An increase in performance of even a few frames per second can make a significant difference in the user experience of a work of interactive art or a game, especially on mobile devices.

I was also interested in working on q5 because for a lot of p5.js users, the library itself is a black box. Even as an expert JS programmer and someone who teaches CS for a living, I still find myself scratching my head when I look at the p5.js source code. p5 was initially released 10 years ago and bad design choices were made due to JS limitations at the time. It's also become an absolutely massive library, with literally over 100,000 lines of code and documentation!

Thanks in large part to @LingDong-'s design, q5 is well organized, concise, and utilizes many modern JS features! I think even without inline documentation, the source code is easier for experienced JS programmers to comprehend.

I also started working on q5 because unfortunately I had a bad experience with The Processing Foundation. Simple bug fixes I contributed to p5.js all took over 5 months to be released. That's unacceptable given how well funded TPF is. I began to see p5play solely relying on p5.js as a liability. So being able to provide q5 as an alternative became a priority for me.

I think the problem is that management takes exorbitant salaries, 76% of the [annual budget](https://processingfoundation.report/), yet many of them still work [other full time jobs](https://www.linkedin.com/in/edsaber/). They seem to expect that just because p5.js is open source that volunteers will do most of the dev work. 🕵️

When criticized, TPF staff play the victim, silence dissent, and badmouth former contributors, regardless of how much time and effort they've donated to TPF projects. This behavior is inexcusable. Its driving away the people who made Processing and p5 great. 🚪

In October 2023, The Processing Foundation's co-founder, Ben Fry, resigned and publicly criticized management for [squandering millions of dollars in donations](https://x.com/ben_fry/status/1709400641456501020). I agree with Ben and I hope that TPF will hire full time developers to work on p5.js in the future. The summer 2024 pro5 grants are a great step in the right direction.

## Motivation: Part 3

> This section was written by @Tezumie

My journey into contributing to q5.js began with a deep passion for creative coding. I initially built my own library, T5.js, from scratch to learn more about the inner workings of a creative coding library. This project was driven by my desire to understand and enhance the process of creating visual art through code.

The q5.js team took notice of my work on T5.js and reached out to suggest we combine our efforts to further develop q5. We shared similar goals: minimizing the size of the library, optimizing performance, and adding much-needed functionalities that p5.js had yet to implement.

One of the aspects I love most about q5.js is its compatibility with p5.js add-ons, something my custom T5.js project lacked. Working with Quinton and the team has allowed me to get creative with new functionalities in q5 as well. We've collaborated on several features, such as FlexibleCanvas, which enables projects to be dimension-agnostic.

I genuinely love creative coding and engage with it every day, giving me a deep insight into the needs and potential improvements for a library like q5. My hope is to bring this knowledge and enthusiasm to our work on q5, continually advancing the library to better serve the creative coding community.

## More exclusive features

Features added by @quinton-ashley:

- `inFill`: Check if a point is inside the fill of a previously drawn shape.
- `async setup()`: enables users to await loading images and sounds before `draw` is called, though loading in parallel with `preload` is still more efficient.
- `image.trim()`: removes transparent pixels from the edges of an image.
- `opacity(globalAlpha)`: set the opacity multiplier for anything subsequently drawn to the canvas in a range between 0 (transparent) and 1 (opaque).
- `textCache(enabled)`: Text image caching is enabled by default. Rotated text is only rendered once, and then cached as an image. This can result in ridiculously high 90x performance boosts for text-heavy sketches. Users don't need to change their code, the `text` function can be used as normal, q5 takes care of everything behind the scenes.
- `createImage`, `loadImage`, and `createGraphics`: as a last parameter to these functions, `opt` (options) object, users can specify canvas context attributes for an image or graphic. `opt.alpha` is set to true by default.
- `loadSound(file)`: Returns a Web Audio object with some basic functions added for changing the volume, setting the panning, and checking if the sound is loaded. Good enough in most cases.
- `ctx`: an instance level alias for `drawingContext`

Features added by @LingDong-:

- `randomExponential()` in addition to `randomGaussian()`: a random distribution that resembles exponential decay.
- `curveAlpha()`: manipulate the `α` parameter of Catmull-Rom curves.
- `relRotationX`, `relRotationY` and `relRotationZ`: Similar to `rotationX/Y/Z`, but are relative to the orientation of the mobile device.

## Porting from p5.js

- `createCanvas` must be run before any rendering functions are called. Unlike in p5, it can be run anytime after a `Q5` instance is created, even in `preload`. If `noCanvas` isn't run before the draw loop starts, then q5 will run `createCanvas(100, 100)` automatically.
- `loadImage` and other loading functions don't support a failure callback. If the image fails to load, q5 will throw an error.
- `colorMode` supports 'rgb', 'srgb', and 'oklch'. Other color modes, like hsv, are so outdated they're obsolete.
- `color` function only accepts numeric input, hex, and common named colors. It doesn't parse strings like `color('hsl(160, 100%, 50%)')`.
- `fill`, `stroke`, and `background` can accept any CSS color string.
- `noise` function's default noise algorithm is perlin noise. p5's default noise is called "blocky" noise in q5 and using it requires loading the src/q5-noisier.js module.
- `tint` doesn't change the opacity of an image, instead the tint's alpha value specifies how strong the tint should be. To dynamically change the opacity of anything drawn to the canvas, use `opacity(globalAlpha)`.

## Size Comparison

Unminified:

- p5.js **5112kb** ⚠️
- p5.sound.js 488kb
- q5.js 110kb

Minified:

- p5.min.js 1034kb ⚠️
- p5.sound.min.js 200kb
- q5.min.js **70kb** 🎉

## Benchmarks

q5.js has a significant speed advantage in imaging operations because it uses hardware accelerated Canvas APIs whenever possible, instead of going pixel by pixel. Most other functionalities have very marginal speed improvements (or none at all when parameter validation overhead is negligible). The operations with important performance differences are listed below.

The following benchmarks are generated with Google Chrome 120, on a MacBook Air M1 2020. q5.js v1.9.3 vs p5.js v1.9.0.

Less time (milliseconds) is better.

| Task                                              | p5.js | q5.js |
| ------------------------------------------------- | ----- | ----- |
| Generate 10,000 random colors with `color(r,g,b)` | 33ms  | 3ms   |

## Older Benchmarks

The following benchmarks are generated with Google Chrome 84, on an old-ish MacBook Pro 2015 (with lots of apps and tabs running); Performance varies depending on software and hardware. p5.js version used is v1.1.9.

Higher FPS (frames per second) is better.

| Operation on 1024x1024 image | p5.js | q5.js    |
| ---------------------------- | ----- | -------- |
| tinting                      | 20FPS | 35FPS    |
| blurring(11px)               | 0FPS  | 40FPS \* |
| thresholding                 | 10FPS | 40FPS \* |
| grayscaling                  | 10FPS | 50FPS \* |
| inverting                    | 10FPS | 50FPS \* |
| opaque                       | 20FPS | 60FPS    |
| erode/dilate                 | 5FPS  | 9FPS     |

| Task                                                | p5.js | q5.js |
| --------------------------------------------------- | ----- | ----- |
| Generating 10,000 `randomGaussian()` sample         | 10FPS | 20FPS |
| Calling `noiseSeed()` 1,000 times                   | 10FPS | 60FPS |
| Generate 10,000 (random) colors with `color(r,g,b)` | 5FPS  | 60FPS |
| Rotate a `Vector` 1,000,000 times                   | 13FPS | 60FPS |

<sub>\* Only for browsers that support CanvasRenderingContext2D.filter ([75% of all](https://caniuse.com/#feat=mdn-api_canvasrenderingcontext2d_filter) as of Aug 2020, including Chrome, Firefox and Edge). For those that don't, performance is similar to p5.js, as identical implementations are usually used as fallbacks.</sub>

## Contributing

Please comment on issues before attempting to implement them!

Check out the [q5 planning board](https://github.com/orgs/q5js/projects/1/views/1).

If the q5 project is successful, all contributing developers will be paid for their work. The project will be run as a [worker co-op](https://en.wikipedia.org/wiki/Worker_cooperative).

Contributors must agree to the [code of conduct](CODE_OF_CONDUCT.md) and follow the [q5 code style guide](https://github.com/q5js/q5.js/wiki/q5-Code-Style-Guide).

## Licensing

q5.js was created by the q5 team and is licensed under the LGPLv3. q5 is not affiliated with The Processing Foundation.

@LingDong- created the original q5xjs library which is Unlicense licensed.

p5.js is licensed under the LGPLv2, the two small sections of p5' code directly copied into q5 are credited below. The rest of q5 is a new implementation of part of the p5 API. APIs are not copyrightable in the United States, as decided by the Supreme Court in the Google v Oracle case.

## Credits

q5-webgpu msdf text rendering:
https://webgpu.github.io/webgpu-samples/?sample=textRenderingMsdf

q5-webgpu blendMode:
https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html

catmullRomSpline:
https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline

ziggurat:
http://ziggurat.glitch.me/

Vector.slerp:
https://github.com/processing/p5.js/blob/v1.10.0/src/math/p5.Vector.js#L2803

random:
https://github.com/processing/p5.js/blob/1.1.9/src/math/noise.js

Curve query:
https://github.com/processing/p5.js/blob/1.1.9/src/core/shape/curves.js

[p5]: https://p5js.org
[p5play]: https://p5play.org
[instance mode]: https://p5js.org/examples/instance-mode-instantiation.html
[with statement]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with
[make an issue report]: https://github.com/quinton-ashley/q5.js/issues
[canvas context attributes]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#contextattributes
[desynchronized rendering]: https://github.com/whatwg/html/issues/5466
