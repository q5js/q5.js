# 1-0

## The sequel to p5.js is here! 🎉

q5.js implements all of [p5](https://p5js.org)'s 2D drawing, math, and user input functionality.

It's a drop-in replacement that's performance optimized and ~20x smaller than p5.

# 2-0

## More vibrant colors! 🎨

# 2-1

In p5, bright colors look dull on modern devices 😕

# 2-2

q5 empowers artists with a [wider range of colors](https://github.com/quinton-ashley/q5.js?tab=readme-ov-file#new-features-hdr-color-support) 🤩

# 3-0

## More help for beginners ✨

Why doesn't this code work? `text('Hello!');`

p5's error messages are often too vague and leave beginners searching for help. 🙋

```
🌸 p5.js says: [test.js, line 19] text() was expecting at least 3 arguments, but received only 1.
```

q5 creates error reports that can be sent to an AI just by clicking a link! Users can also run the `askAI()` function before code that isn't working as expected. 🤖

```js
function draw() {
	askAI();
	text('Hello!');
}
```

ChatGPT 4o excels at identifying the most common errors that beginners make: typos, missing syntax, incorrect arguments, and more.

# 4-0

## More freedom 🔥

q5 is open source licensed under the [LGPLv3](../LICENSE.md), so you can even use it for free in commercial projects. 🆓

The q5 team is committed to fostering an inclusive community. Join us on the [q5.js Discord](https://discord.gg/QuxQYwGWuB)! 🗺️

# 5-0

## More flexible 🤹

q5.js works right out of the box with your existing p5.js sketches! 📦

But with q5's top-level global mode, the `setup` and `draw` functions are optional. 👀

# 6-0

## WebGPU support 🚀

We're already working on a next-gen version of q5 that uses [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) for blazing fast rendering. Stay tuned! 🏎️

# 10-0

## Why switch from p5? ⚖️

In October 2023, Processing's co-founder, Ben Fry, [publicly criticized](https://x.com/ben_fry/status/1709400641456501020) The Processing Foundation for squandering [millions of dollars](https://medium.com/processing-foundation/processing-foundation-funding-update-94cddb25a3d9) and resigned. 🚪

So where is all that donor money going? 💸

Many of the proposed ["2.0" updates](https://github.com/processing/p5.js/issues/6678) to p5.js are years overdue. The p5 web editor has [hardly changed since it released in 2018](https://medium.com/processing-foundation/hello-p5-js-web-editor-b90b902b74cf). Even the legendary Dan Shiffman has been waiting on a [feature request for 7 years and counting](https://github.com/processing/p5.js-web-editor/issues/208#issuecomment-263898359). So what hope does anyone else have at getting their suggestions implemented? 📅

Volunteers are doing most of the real work on p5 and the p5 ecosystem, yet it still takes months for paid staff to simply approve and publish crucial updates. Even the most popular third party p5 library, [p5play](https://p5play.org), hasn't been offered a cent from the foundation. 😔

Why can't staff focus on p5? Perhaps because even the foundation's executives are too busy [taking paychecks from other full-time jobs](https://www.linkedin.com/in/edsaber/). 🕵️

When confronted about any of this on Discord or GitHub, the p5 team ignores or bans posts by upset users, citing "verbal violence" and playing the victim. It seems they'd prefer to take their $80k-$160k salaries in peace. 🎂

[The Processing Foundation website](https://processingfoundation.org/) is filled with aspirational platitudes but their actions speak louder than words. Many people in the community feel like their trust in the foundation has been betrayed. 🤥

# 10-1

## q5 is the future ⌚️

The q5 team aims to right these wrongs by being financially transparent, quick with useful updates, and receptive to all feedback (especially criticism). 📝

We're inspired to carry on the legacy of Processing and truly champion the original creators' goals. Creative coders deserve better, let's make it happen together! 🤝
