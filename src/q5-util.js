Q5.modules.util = ($, q) => {
	$._loadFile = (url, cb, type) => {
		let ret = {};
		ret.promise = new Promise((resolve, reject) => {
			fetch(url)
				.then((res) => {
					if (!res.ok) {
						reject('error loading file');
						return null;
					}
					if (type == 'json') return res.json();
					return res.text();
				})
				.then((f) => {
					if (type == 'csv') f = $.CSV.parse(f);
					if (typeof f == 'string') ret.text = f;
					else Object.assign(ret, f);
					delete ret.promise;
					if (cb) cb(f);
					resolve(f);
				});
		});
		$._preloadPromises.push(ret.promise);
		if (!$._usePreload) return ret.promise;
		return ret;
	};

	$.loadText = (url, cb) => $._loadFile(url, cb, 'text');
	$.loadJSON = (url, cb) => $._loadFile(url, cb, 'json');
	$.loadCSV = (url, cb) => $._loadFile(url, cb, 'csv');

	$.loadXML = (url, cb) => {
		let ret = {};
		ret.promise = fetch(url)
			.then((res) => res.text())
			.then((text) => {
				let xml = new DOMParser().parseFromString(text, 'application/xml');
				ret.DOM = xml;
				delete ret.promise;
				if (cb) cb(xml);
				return xml;
			});
		$._preloadPromises.push(ret.promise);
		if (!$._usePreload) return ret.promise;
		return ret;
	};

	const imgRegex = /(jpe?g|png|gif|webp|avif|svg)/i,
		fontRegex = /(ttf|otf|woff2?|eot|json)/i,
		fontCategoryRegex = /(serif|sans-serif|monospace|cursive|fantasy)/i,
		audioRegex = /(wav|flac|mp3|ogg|m4a|aac|aiff|weba)/i;

	$.load = function (...urls) {
		if (Array.isArray(urls[0])) urls = urls[0];

		let promises = [];

		for (let url of urls) {
			let ext = url.split('.').pop().toLowerCase();

			let obj;
			if (ext == 'json' && !url.includes('-msdf.')) {
				obj = $.loadJSON(url);
			} else if (ext == 'csv') {
				obj = $.loadCSV(url);
			} else if (imgRegex.test(ext)) {
				obj = $.loadImage(url);
			} else if (fontRegex.test(ext) || fontCategoryRegex.test(url)) {
				obj = $.loadFont(url);
			} else if (audioRegex.test(ext)) {
				obj = $.loadSound(url);
			} else if (ext == 'xml') {
				obj = $.loadXML(url);
			} else {
				obj = $.loadText(url);
			}
			promises.push($._usePreload ? obj.promise : obj);
		}

		if (urls.length == 1) return promises[0];
		return Promise.all(promises);
	};

	async function saveFile(data, name, ext) {
		name = name || 'untitled';
		ext = ext || 'png';

		let blob;
		if (imgRegex.test(ext)) {
			let cnv = data.canvas || data;
			blob = await cnv.convertToBlob({ type: 'image/' + ext });
		} else {
			let type = 'text/plain';
			if (ext == 'json') {
				if (typeof data != 'string') data = JSON.stringify(data);
				type = 'text/json';
			}
			blob = new Blob([data], { type });
		}

		let a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = name + '.' + ext;
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 1000);
	}

	$.save = (a, b, c) => {
		if (!a || (typeof a == 'string' && (!b || (!c && b.length < 5)))) {
			c = b;
			b = a;
			a = $;
		}
		if (c) saveFile(a, b, c);
		else if (b) {
			let lastDot = b.lastIndexOf('.');
			saveFile(a, b.slice(0, lastDot), b.slice(lastDot + 1));
		} else saveFile(a);
	};

	$.CSV = {};
	$.CSV.parse = (csv, sep = ',', lineSep = '\n') => {
		if (!csv.length) return [];
		let a = [],
			lns = csv.split(lineSep),
			headers = lns[0].split(sep).map((h) => h.replaceAll('"', ''));
		for (let i = 1; i < lns.length; i++) {
			let o = {},
				ln = lns[i].split(sep);
			headers.forEach((h, i) => (o[h] = JSON.parse(ln[i])));
			a.push(o);
		}
		return a;
	};

	if ($.canvas && !Q5._createServerCanvas) {
		$.canvas.save = $.saveCanvas = $.save;
	}

	if (typeof localStorage == 'object') {
		$.storeItem = (name, val) => localStorage.setItem(name, val);
		$.getItem = (name) => localStorage.getItem(name);
		$.removeItem = (name) => localStorage.removeItem(name);
		$.clearStorage = () => localStorage.clear();
	}

	$.year = () => new Date().getFullYear();
	$.day = () => new Date().getDay();
	$.hour = () => new Date().getHours();
	$.minute = () => new Date().getMinutes();
	$.second = () => new Date().getSeconds();

	$.nf = (n, l, r) => {
		let neg = n < 0;
		n = Math.abs(n);
		let parts = n.toFixed(r).split('.');
		parts[0] = parts[0].padStart(l, '0');
		let s = parts.join('.');
		if (neg) s = '-' + s;
		return s;
	};

	$.shuffle = (a, modify) => {
		if (!modify) a = [...a];
		for (let i = a.length - 1; i > 0; i--) {
			let j = Math.floor($.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	};
};
