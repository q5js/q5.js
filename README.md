# <img src="q5js_logo.webp" height="64"> <img src="q5js_brand.webp" height="64">

[**q5.js**](https://q5js.org) is a spiritual successor to the [p5.js][] and [Processing Java][] graphics libraries.

The q5 team aims to make creative coding even more fun and accessible for a new generation of artists, designers, educators, and beginners!

If you're already familiar with p5, you'll find yourself right at home with q5. It's also compatible with popular addons, including [p5.sound][] and [p5play][].

## No Installation Required

Try out the [q5.js template sketch](https://aijs.io/editor?user=quinton-ashley&project=logoSpin) for the Aijs online code editor.

Use q5.js in your own project by adding this line to your HTML file:

```html
<script src="https://q5js.org/q5.js"></script>
```

q5 is also available on [npm](https://www.npmjs.com/package/q5)!

```bash
npm install q5
```

## Using p5 Addon Libraries

q5 is compatible with popular p5 addons and projects that use p5, such as [p5play][], because it aliases `Q5` to `p5`.

To use addons, simply load them after q5.js:

```html
<script src="https://q5js.org/q5.js"></script>
<!-- load p5 addons after q5 -->
<script src="https://p5play.org/v3/planck.min.js"></script>
<script src="https://p5play.org/v3/p5play.js"></script>
```

## Documentation

Browse the [q5 reference pages](https://q5js.org/learn) to learn how to use q5.js.

See the [wiki](https://github.com/q5js/q5.js/wiki) for extended documentation of q5's exclusive features.

Use the [q5.d.ts](q5.d.ts) file in Visual Studio Code to get autocompletion and inline hover-over documentation. Simply add this `jsconfig.json` file to your project folder:

```json
{
	"compilerOptions": {
		"target": "ESNext"
	},
	"include": ["*.js", "**/*.js", "node_modules/q5/q5.d.ts"]
}
```

## Support this project 🤝

q5 is open source and anyone can use it for free under the terms of the LGPL (just like p5.js). 🎉

We need your support though! If you enjoy using q5.js, please donate via [GitHub Sponsors](https://github.com/sponsors/quinton-ashley) or [Patreon](https://www.patreon.com/p5play).

## Size Comparison

Unminified:

- p5.js **5112kb** ⚠️
- p5.sound.js 488kb
- q5.js 110kb

Minified:

- p5.min.js 1034kb ⚠️
- p5.sound.min.js 200kb
- q5.min.js **70kb** 🎉

## Modular Use

**p5.js** is nearly 5MB in size. This is mainly due to lengthy JSDoc comments, [the WebGL render, and the dependencies corejs and opentype](https://github.com/processing/p5.js/issues/6776#issuecomment-1918238317). If 2d rendering is all a sketch needs, p5 wastes user bandwidth and is slower to load, parse, and run.

**q5.js** (the default bundle) is 98% smaller than p5, which is already great for typical use. For extremely lightweight use you can load a subset of scripts from the `src` folder.

See the [src/readme.md](src/readme.md) for more info on modular use.

## Contributing

Please report issues or comment on existing issues before working on a pull request.

Check out the [q5 planning board](https://github.com/orgs/q5js/projects/1/views/1).

If the q5 project is successful, all contributing developers will be paid for their work. The project will be run as a [worker co-op](https://en.wikipedia.org/wiki/Worker_cooperative).

Contributors must agree to the [code of conduct](CODE_OF_CONDUCT.md).

## Licensing

q5.js was created by the q5 team and is licensed under the LGPLv3. q5 is not affiliated with The Processing Foundation.

@LingDong- created the original q5xjs library which is Unlicense licensed.

p5.js is licensed under the LGPLv2, small sections of p5' code directly copied into q5 are credited below. The rest of q5 is a new implementation of part of the p5 API. APIs are not copyrightable in the United States, as decided by the Supreme Court in the Google v Oracle case.

## Credits

webgpu msdf text rendering:
https://webgpu.github.io/webgpu-samples/?sample=textRenderingMsdf

webgpu blendMode:
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
[p5.js]: https://p5js.org
[Processing Java]: https://processing.org
[p5.sound]: https://archive.p5js.org/reference/#/libraries/p5.sound
[p5play]: https://p5play.org
