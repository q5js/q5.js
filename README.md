# <img src="https://q5js.org/q5js_logo.webp" height="64"> <img src="https://q5js.org/q5js_brand.webp" height="64">

## Visit [q5js.org](https://q5js.org)! 🌟

[q5.js](https://q5js.org) is a sequel to the [p5.js][] and [Processing Java][] graphics libraries.

- performance optimized for interactive art 🚀
- includes a brand new renderer powered by WebGPU 💪
- up to 32x faster than p5.js 🏎️
- beginner friendly API and documentation 📚
- compatible with popular addons, including [p5.sound][] and [p5play][] 🎮
- no dependencies, ~100kb minified 📦
- LGPL licensed (just like p5.js) 🆓

q5.js was designed to make creative coding fun and accessible for a new generation of artists, designers, educators, and beginners. 🤝

If you're already familiar with p5, you'll find yourself right at home with q5. 🏡

```js
function setup() {
	createCanvas(100, 100);
	circle(50, 50, 50);
}
```

## Documentation

Browse the [q5 reference pages](https://q5js.org/learn) to learn how to use q5.js.

See the [wiki](https://github.com/q5js/q5.js/wiki) for extended documentation.

Use the [q5.d.ts](q5.d.ts) file in Visual Studio Code to get autocompletion and inline hover-over documentation. Simply add this `jsconfig.json` file to your project folder:

```json
{
	"compilerOptions": {
		"target": "ESNext"
	},
	"include": ["*.js", "**/*.js", "node_modules/q5/q5.d.ts"]
}
```

## Support q5 💙

q5 is open source and anyone can use it for free under the terms of the LGPL (just like p5.js). 🎉

We need your support though! If you enjoy using q5.js, please donate via [GitHub Sponsors](https://github.com/sponsors/quinton-ashley) or [Patreon](https://www.patreon.com/p5play).

## Contributing

Are you interested in volunteering to write code for q5.js or improve the q5 ecosystem? Contributions are welcome!

Please report issues or comment on existing issues before working on a pull request. Check out the [q5 project planning board](https://github.com/orgs/q5js/projects/1/views/1).

All contributors must agree to the [code of conduct](CODE_OF_CONDUCT.md).

If the q5 project becomes as successful as The Processing Foundation, all contributing developers will be fairly paid for their work. The project will be run as a [worker co-op](https://en.wikipedia.org/wiki/Worker_cooperative).

## Licensing

q5.js was created by the q5 team and is licensed under the LGPLv3. q5 is not affiliated with The Processing Foundation.

@LingDong- created the original q5xjs library which is Unlicense licensed.

p5.js is licensed under the LGPLv2, small sections of p5' code directly copied into q5 are credited below. The rest of q5 is a new implementation of part of the p5 API. APIs are not copyrightable in the United States, as decided by the Supreme Court in the Google v Oracle case.

## Credits

WebGPU MSDF text rendering:
https://webgpu.github.io/webgpu-samples/?sample=textRenderingMsdf

WebGPU blendMode:
https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html

A JS Implementation of Ziggurat Algorithm:
http://ziggurat.glitch.me/

p5.js Vector.slerp:
https://github.com/processing/p5.js/blob/v1.10.0/src/math/p5.Vector.js#L2803

p5.js random:
https://github.com/processing/p5.js/blob/1.1.9/src/math/noise.js

[p5]: https://p5js.org
[p5.js]: https://p5js.org
[Processing Java]: https://processing.org
[p5.sound]: https://archive.p5js.org/reference/#/libraries/p5.sound
[p5play]: https://p5play.org
