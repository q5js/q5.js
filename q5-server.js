/**
 * q5-server.js
 * @author quinton-ashley
 * @license LGPL-3.0
 */

try {
	global.CairoCanvas ??= require('canvas');
	global.JSDOM ??= require('jsdom').JSDOM;
} catch (e) {
	require('./q5.js');
	module.exports = Q5;
	return;
}

global.window = new JSDOM('', { url: 'http://localhost' }).window;

{
	let props = Object.getOwnPropertyNames(window).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(window)));
	for (let prop of props) {
		if (!global[prop]) {
			Object.defineProperty(global, prop, Object.getOwnPropertyDescriptor(window, prop));
		}
	}
	global.Event = window.Event;
}

require('./q5.js');

Q5._createNodeJSCanvas = function () {
	let cairoCanvas = CairoCanvas.createCanvas(...arguments);
	let jsdomCanvas = window.document.createElement('canvas');

	return new Proxy(cairoCanvas, {
		get: function (target, prop) {
			let t = prop in target ? target : jsdomCanvas;
			let p = t[prop];
			if (typeof p === 'function') return p.bind(t);
			return p;
		},
		set: function (target, prop, value) {
			if (prop in target) {
				target[prop] = value;
			} else {
				jsdomCanvas[prop] = value;
			}
			return true;
		}
	});
};

module.exports = Q5;
