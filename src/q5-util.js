Q5.modules.util = ($) => {
	$._loadFile = (path, cb, type) => {
		p._preloadCount++;
		let ret = {};
		fetch(path)
			.then((r) => {
				if (type == 'json') return r.json();
				if (type == 'text') return r.text();
			})
			.then((r) => {
				p._preloadCount--;
				Object.assign(ret, r);
				if (cb) cb(r);
			});
		return ret;
	};

	$.loadStrings = (path, cb) => $._loadFile(path, cb, 'text');
	$.loadJSON = (path, cb) => $._loadFile(path, cb, 'json');

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
