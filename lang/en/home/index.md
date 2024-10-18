# 1-0

## A sequel to p5.js! 🎉

**q5.js** is a spiritual successor to the [p5.js](https://p5js.org) and [Processing Java](https://processing.org/) graphics libraries.

The q5 team aims to make creative coding even more fun and accessible for a new generation of artists, designers, educators, and beginners!

If you're already familiar with p5, you'll find yourself right at home with q5. It's also compatible with popular addons, including [p5.sound](https://p5js.org/reference/#/libraries/p5.sound) and [p5play](https://p5play.org).

# 2-0

## Blazing fast! 🚀

q5 is performance optimized for the modern web. Create interactive art that runs in real-time on more devices than ever before. 🏎️

[Draw up to 32x more](https://github.com/q5js/q5.js/wiki/Developer-Log) per frame with [q5 WebGPU](https://developer.mozilla.org/docs/Web/API/WebGPU_API), compared to the limits of p5. Or save battery by getting the same results with less power consumption. 🌱

# 3-0

## More vibrant colors! 🎨

# 3-1

In p5, bright colors can look dull 😕

# 3-2

q5 empowers artists with [HDR color support](https://github.com/quinton-ashley/q5.js?tab=readme-ov-file#hdr-color-support) 🤩

# 4-0

## More help for beginners ✨

Why doesn't this code work? `text('Hello!')` 🤔

# 4-1

p5's error messages are often too vague, leaving users searching for help. 🙋

```
🌸 p5.js says: [test.js, line 19] text() was expecting at least 3 arguments, but received only 1.
```

# 4-2

Run q5's `askAI()` before code that isn't working as expected. 🤖

```
The `text` function requires the x and y coordinates where the text should be drawn to the canvas.

text('Hello!', 50, 50);
```

# 10-0

## Dynamic 🐙

Q5 instances can be created manually, which makes the `setup` function optional. Use q5 functions anywhere with [top-level global mode](https://github.com/q5js/q5.js/wiki/Top%E2%80%90Level-Global-Mode)! 👀

```js
new Q5();

createCanvas(400, 400);
```

# 10-1

## Sound On 🔊

p5.sound is a great library, but typical use doesn't require its extensive sound generation and filtering features. 🎛️

q5.js includes sound loading, playback, and basic mixing by default. 🎚️

# 10-2

## Lightweight 🪶

p5.js and p5.sound.js have a combined size of 5.6MB! ⚠️

q5.js is only 111kb, that's 98% smaller. 🌳

For extremely lightweight use, load only the features you need from the [q5 source folder](https://github.com/q5js/q5.js/tree/main/src). 📦

# 10-3

## Frame your Art 🖼️

The `displayMode` function lets you frame your art within the browser window, no CSS skills required! 📽️

Make it "centered", "maxed", or "fullscreen" without clipping or changing the aspect ratio. Use the "pixelated" rendering preset to make pixel art. 👾

# 11-0

## No Installation Required! 💻

Start coding with the [q5.js template](https://aijs.io/editor?user=quinton-ashley&project=logoSpin) for the [Aijs](https://aijs.io) online code editor. 🖌️

Use q5.js in your own project by adding this line to your HTML file:

```html
<script src="https://q5js.org/q5.js"></script>
```

Full documentation is coming soon, for now see q5's [GitHub README](https://github.com/q5js/q5.js).

# 11-1

## Join our community 🤝

The future of creative coding is here! Join us on the [q5 community Discord](https://discord.gg/QuxQYwGWuB). 🗺️

If you'd like to work on q5.js, check out our [Project Planning Board](https://github.com/orgs/q5js/projects/1/views/1).

# 20-0

## Credits 🌟

This project aims to be the spiritual successor to the invaluable work done by [Ben Fry](https://benfry.com) and [Casey Reas](https://x.com/REAS) on Java [Processing](https://processingfoundation.org/), [Lauren McCarthy](http://lauren-mccarthy.com)'s work on [p5.js](https://p5js.org), and all contributors to these projects.

The original [q5xjs (v0)](https://github.com/LingDong-/q5xjs) was created by [@LingDong~](https://github.com/LingDong-) and released under the public domain Unlicense license. We forked and significantly extended his brilliant codebase!

q5.js v2 is open source under the LGPLv3, created and actively maintained by the q5 team: [@quinton-ashley](https://github.com/quinton-ashley) and [@Tezumie](https://github.com/Tezumie).

# 100

q5js.org was created by the q5 team. Copyright 2024.
