try {
	global.CairoCanvas ??= require('canvas');
} catch (e) {
	module.exports = require('./q5.js');
	return;
}

let { loadImage, registerFont } = CairoCanvas;
global.loadImage = loadImage;
global.registerFont = registerFont;

global.JSDOM ??= require('jsdom').JSDOM;
global.window = new JSDOM('', { url: 'http://localhost', pretendToBeVisual: true }).window;

{
	let props = Object.getOwnPropertyNames(window).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(window)));
	for (let prop of props) {
		if (!global[prop]) {
			Object.defineProperty(global, prop, Object.getOwnPropertyDescriptor(window, prop));
		}
	}
	global.Event = window.Event;
}

global.createNodeJSCanvas = function () {
	let cairoCanvas = CairoCanvas.createCanvas(...arguments);
	let jsdomCanvas = window.document.createElement('canvas');

	return new Proxy(jsdomCanvas, {
		get: function (target, prop) {
			return prop in target ? target[prop] : cairoCanvas[prop];
		},
		set: function (target, prop, value) {
			if (prop in target) {
				target[prop] = value;
			} else {
				cairoCanvas[prop] = value;
			}
			return true;
		}
	});
};

module.exports = require('./q5.js');
