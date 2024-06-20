# 1-0

## The unsanctioned sequel to p5.js! 🎉

q5.js is a new implementation of the [p5](https://p5js.org) API that's performance optimized and packed with additional features to make creative coding even more fun and accessible.

q5 works out of the box with your existing p5 2D sketches. It even supports popular libraries like [p5.sound](https://p5js.org/reference/#/libraries/p5.sound) and [p5play](https://p5play.org).

# 2-0

## More vibrant colors! 🎨

# 2-1

In p5, bright colors can look dull on modern devices 😕

# 2-2

q5 empowers artists with a [wider range of colors](https://github.com/quinton-ashley/q5.js?tab=readme-ov-file#hdr-color-support) 🤩

# 3-0

## More interactive 🧑‍💻

# 3-1

In p5, making interactive sketches can be tough for beginners. 😩

# 3-2

With q5, use `inFill` to check if the mouse is hovering on the most recently drawn shape. 🎯

# 4-0

## More flexible 💪

With the `flexibleCanvas` function you can scale your art to any canvas size. A game changer for generative artists! 🌱

# 5-0

## More help for beginners ✨

Why doesn't this code work? `text('Hello!')` 🤔

# 5-1

p5's error messages are often too vague, leaving users searching for help. 🙋

```
🌸 p5.js says: [test.js, line 19] text() was expecting at least 3 arguments, but received only 1.
```

# 5-2

Run q5's `askAI()` before code that isn't working as expected. 🤖

```
The `text` function requires the x and y coordinates where the text should be drawn to the canvas.

text('Hello!', 50, 50);
```

# 10-0

## Dynamic 🐙

Q5 instances can be created manually, which makes the `setup` function optional. Use q5 functions anywhere! 👀

```js
new Q5();

createCanvas(400, 400);
```

# 10-1

## Sound On 🔊

[p5.sound](https://p5js.org/reference/#/libraries/p5.sound) is a great library but typical use doesn't require its extensive sound generation and filtering features. 🎛️

That's why q5.js includes sound loading, playback, and basic mixing by default. 🎚️

# 10-2

## Lightweight 🪶

p5.js and p5.sound.js have a combined size of 5.6MB! ⚠️

q5.js is only 74kb, that's 70x smaller. 🌳

# 10-3

## Modular 🧩

For extremely lightweight use, load only the features you need from q5's [source folder](https://github.com/q5js/q5.js/tree/main/src). 📦

```html
<script src="https://q5js.org/src/q5-core.js">
<script src="https://q5js.org/src/q5-2d-canvas.js">
<script src="https://q5js.org/src/q5-2d-drawing.js">
```

# 10-4

## Frame your Art 🖼️

The `displayMode` function lets you customize how your canvas is presented. 📽️

Make it "centered", "maxed", or "fullscreen" without clipping or changing the aspect ratio. Use the "pixelated" rendering preset to make pixel art. 👾

# 10-5

## WebGPU 🚀

We're working on next-gen rendering modules for q5 that use [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) for blazing fast drawing. Stay tuned! 🏎️

# 11-0

## Get started! 💻

Start coding with the [q5.js template](https://aijs.io/editor?user=AIJS&project=q5.js-Template) for the [Aijs](https://aijs.io) online code editor. 🖌️

Full documentation is coming soon, for now see q5's [GitHub README](https://github.com/q5js/q5.js).

```html
<script src="https://q5js.org/q5.js"></script>
```

q5 is also available on [npm](https://www.npmjs.com/package/q5). 📦

# 11-1

## Join our community 🤝

The future of creative coding is here! Join us on the [q5 community Discord](https://discord.gg/QuxQYwGWuB). 🗺️

If you'd like to work on q5.js, check out our [Contributor Code of Conduct](https://github.com/quinton-ashley/q5.js/?tab=readme-ov-file#contributor-code-of-conduct) and [Project Planning Board](https://github.com/orgs/q5js/projects/1/views/1).

# 12-0

## Why make q5? ⚖️

In October 2023, The Processing Foundation's co-founder, Ben Fry, resigned and publicly criticized management for [squandering millions of dollars in donations](https://x.com/ben_fry/status/1709400641456501020).

Despite taking exorbitant salaries, the foundation's executives are too [busy working other full-time jobs](https://www.linkedin.com/in/edsaber/) to focus on p5's development. They think just because p5 is open source, volunteer contributors should do all the real work. Yet it still takes months for management to simply review and publish updates. 🕵️

When criticized, TPF staff play the victim, gaslight, silence dissent, and badmouth former contributors, regardless of how much time and effort they've donated to TPF projects. This behavior is inexcusable. Its driving away the people who made Processing and p5 great. 🚪

The q5 team is not "anti-p5". We aim to carry on Processing's legacy by continuing to make creative coding fun and accessible. 🌸

Creative coders deserve better: let's make it happen together! q5 is open source under the [LGPL](../LICENSE.md) and will be run as a [worker co-op](https://en.wikipedia.org/wiki/Worker_cooperative). All contributors will be fairly compensated for their work. 🤝

# 100

Created by the q5 team: [@quinton-ashley](https://github.com/quinton-ashley) and [@Tezumie](https://github.com/Tezumie). Copyright 2024. 🌟
