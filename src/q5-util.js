Q5.modules.util = ($, q) => {
	$._loadFile = (path, cb, type) => {
		q._preloadCount++;
		let ret = {};
		fetch(path)
			.then((r) => {
				if (type == 'json') return r.json();
				return r.text();
			})
			.then((r) => {
				q._preloadCount--;
				if (type == 'csv') r = $.CSV.parse(r);
				Object.assign(ret, r);
				if (cb) cb(r);
			});
		return ret;
	};

	$.loadText = (path, cb) => $._loadFile(path, cb, 'text');
	$.loadJSON = (path, cb) => $._loadFile(path, cb, 'json');
	$.loadCSV = (path, cb) => $._loadFile(path, cb, 'csv');

	$.CSV = {};
	$.CSV.parse = (csv, sep = ',', lineSep = '\n') => {
		let a = [],
			lns = csv.split(lineSep),
			headers = lns[0].split(sep);
		for (let i = 1; i < lns.length; i++) {
			let o = {},
				ln = lns[i].split(sep);
			headers.forEach((h, i) => (o[h] = JSON.parse(ln[i])));
			a.push(o);
		}
		return a;
	};

	if (typeof localStorage == 'object') {
		$.storeItem = localStorage.setItem;
		$.getItem = localStorage.getItem;
		$.removeItem = localStorage.removeItem;
		$.clearStorage = localStorage.clear;
	}

	$.year = () => new Date().getFullYear();
	$.day = () => new Date().getDay();
	$.hour = () => new Date().getHours();
	$.minute = () => new Date().getMinutes();
	$.second = () => new Date().getSeconds();
};
