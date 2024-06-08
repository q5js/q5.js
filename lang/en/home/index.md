# 1-0

## The sequel to p5.js is here! 🎉

q5.js is a new implementation of the [p5](https://p5js.org) API that's performance optimized and packed with additional features to make creative coding even more fun and accessible.

q5 works out of the box with your existing p5 2D sketches and even supports popular libraries like [p5.sound](https://p5js.org/reference/#/libraries/p5.sound) and [p5play](https://p5play.org).

# 2-0

## More vibrant colors! 🎨

# 2-1

In p5, bright colors can look dull on modern devices 😕

# 2-2

q5 empowers artists with a [wider range of colors](https://github.com/quinton-ashley/q5.js?tab=readme-ov-file#new-features-hdr-color-support) 🤩

# 3-0

## More help for beginners ✨

Why doesn't this code work? `text('Hello!')` 🤔

# 3-1

p5's error messages are often too vague, leaving users searching for help. 🙋

```
🌸 p5.js says: [test.js, line 19] text() was expecting at least 3 arguments, but received only 1.
```

Why not ask ChatGPT 4o? It excels at identifying the most common errors that beginners make: typos, missing syntax, incorrect arguments, and more.

# 3-2

Run q5's `askAI()` function before code that isn't working as expected. 🤖

```
The `text` function requires the x and y coordinates where the text should be drawn to the canvas.

text('Hello!', 50, 50);
```

Spend less time debugging and more time creating! 🐛

# 4-0

## More flexible 🤹

q5's top-level global mode makes the `setup` function optional, letting you use q5 functions anywhere. 👀

```js
new Q5();

createCanvas(400, 400);
```

# 4-1

## Modular design 🧩

q5 is already ~20x smaller than p5, but for extremely lightweight use, load only the features you need from the [`src` folder](https://github.com/quinton-ashley/q5.js/tree/main/src). 📦

```html
<script src="https://q5js.org/src/q5-core.js">
<script src="https://q5js.org/src/q5-2d-canvas.js">
<script src="https://q5js.org/src/q5-2d-drawing.js">
```

# 5-0

## More freedom 🔥

q5 is open source licensed under the [LGPLv3](../LICENSE.md), so you can even use it for free in commercial projects. 🆓

The q5 team is committed to fostering an inclusive community. Join us on the [q5.js Discord](https://discord.gg/QuxQYwGWuB)! 🗺️

# 6-0

## WebGPU support 🚀

We're already working on a next-gen version of q5 that uses [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) for blazing fast rendering. Stay tuned! 🏎️

# 6-1

## Join our community 🤝

The future of creative coding is here! Join us on the [q5 community Discord]().

If you'd like to work on q5.js, check out our [Contributor Code of Conduct](https://github.com/quinton-ashley/q5.js/?tab=readme-ov-file#contributor-code-of-conduct) and [Project Planning Board](https://github.com/orgs/q5js/projects/1/views/1).

# 10-0

## Why make q5? ⚖️

In October 2023, The Processing Foundation's co-founder, Ben Fry, resigned and publicly criticized management for [squandering millions of dollars in donations](https://x.com/ben_fry/status/1709400641456501020).

Despite taking exorbitant salaries, the foundation's executives are too [busy working other full-time jobs](https://www.linkedin.com/in/edsaber/) to focus on p5. They think just because p5 is open source, there's no need to pay developers. Volunteer contributors do all the real work, yet somehow it still takes months for staff to review and publish simple bug fixes. 🕵️

When criticized, TPF staff play the victim, gaslight, silence dissent, and badmouth former contributors, regardless of how much time and effort they've donated to TPF projects. This behavior is inexcusable. Its driving away the very people who made Processing and p5 great. 🚪

The q5 team is not "anti-p5". We aim to carry on Processing's legacy by continuing to make creative coding fun and accessible. 🌸

Creative coders deserve better: let's make it happen together! q5 will be run as a [worker co-op](https://en.wikipedia.org/wiki/Worker_cooperative). All contributors will be fairly compensated for their work. 🤝
