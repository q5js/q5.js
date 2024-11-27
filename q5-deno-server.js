/**
 * @module q5-deno-server
 * @description Run q5 with deno using skia canvas and deno-dom
 */

import { createCanvas, Image } from 'jsr:@gfx/canvas@0';
import { DOMParser } from 'jsr:@b-fuze/deno-dom@0';

globalThis.global = globalThis;

global.Image = Image;

global.window = global;
global.document = new DOMParser().parseFromString(
	`
<!DOCTYPE html>
<html>
	<head></head>
	<body></body>
</html>
  `,
	'text/html'
);

import './q5.js';

Q5._createServerCanvas = function () {
	let skiaCanvas = createCanvas(...arguments);
	let domCanvas = document.createElement('canvas');

	return new Proxy(skiaCanvas, {
		get: function (target, prop) {
			let t = prop in target ? target : domCanvas;
			let p = t[prop];
			if (typeof p === 'function') return p.bind(t);
			return p;
		},
		set: function (target, prop, value) {
			if (prop in target) {
				target[prop] = value;
			} else {
				domCanvas[prop] = value;
			}
			return true;
		}
	});
};
