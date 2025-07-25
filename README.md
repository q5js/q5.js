# <img src="https://q5js.org/q5js_logo.webp" height="64"> <img src="https://q5js.org/q5js_brand.webp" height="64">

## Visit [q5js.org](https://q5js.org)! 💫

- inspired by [p5.js][] and [Processing Java][] ⭐️
- performance optimized for interactive art 🚀
- lightning fast [WebGPU renderer](https://github.com/q5js/q5.js/wiki/q5-WebGPU-renderer) ⚡️
- beginner friendly [documentation](https://q5js.org/learn) 📚
- compatible with popular addons, including [p5.sound][], [ml5.js][], and [p5play][] 🎮
- no dependencies, ~100kb minified 📦
- free to use under the LGPL (just like p5.js) 🆓

q5.js was designed to make creative coding fun and accessible for a new generation of artists, designers, educators, and beginners. 🤝

Familiar with p5? You'll be right at home with q5. It's like getting a free computer upgrade! 🖥️

```js
createCanvas(100, 100);
circle(50, 50, 50);
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
	"typeAcquisition": {
		"include": ["node_modules/q5"]
	}
}
```

## Support q5 💙

q5 is open source and anyone can use it for free under the terms of the LGPL (just like p5.js). 🎉

We need your support though! If you enjoy using q5.js, please donate via [GitHub Sponsors](https://github.com/sponsors/quinton-ashley), [ko-fi](https://ko-fi.com/q5play), or [Patreon](https://www.patreon.com/p5play).

## Contributing

Are you interested in volunteering to write code for q5.js or improve the q5 ecosystem? Contributions are welcome!

Please report issues or comment on existing issues before working on a pull request. Check out the [q5 project planning board](https://github.com/orgs/q5js/projects/1/views/1).

All contributors must agree to the [code of conduct](CODE_OF_CONDUCT.md).

## Licensing

q5.js was created by the q5 team and is licensed under the LGPLv3. q5 is not affiliated with The Processing Foundation.

@LingDong- created the original q5xjs library which is Unlicense licensed.

p5.js is licensed under the LGPLv2, small sections of p5' code directly copied into q5 are credited below. The rest of q5 is a new implementation of part of the p5 API. APIs are not copyrightable in the United States, as decided by the Supreme Court in the Google v Oracle case.

## Credits

WebGPU MSDF text rendering:
https://webgpu.github.io/webgpu-samples/?sample=textRenderingMsdf

WebGPU blendMode:
https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html

HSLtoRGB:
https://stackoverflow.com/a/64090995/3792062

HSBtoHSL:
https://stackoverflow.com/a/66469632/3792062

OKLCHtoRGB:
https://gist.github.com/dkaraush/65d19d61396f5f3cd8ba7d1b4b3c9432
https://github.com/color-js/color.js/blob/main/src/spaces/oklch.js

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
[ml5.js]: https://ml5js.org
[p5play]: https://p5play.org
