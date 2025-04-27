Q5.modules.fes = ($) => {
	$._fes = async (e) => {
		if (Q5.disableFriendlyErrors) return;

		let stackLines = e.stack?.split('\n');
		if (!e.stack || stackLines.length <= 1) return;

		let idx = 1;
		let sep = '(';
		if (navigator.userAgent.indexOf('Chrome') == -1) {
			idx = 0;
			sep = '@';
		}
		while (stackLines[idx].indexOf('q5') >= 0) idx++;

		let errFile = stackLines[idx].split(sep).at(-1);
		if (errFile.startsWith('blob:')) errFile = errFile.slice(5);
		let parts = errFile.split(':');
		let lineNum = parseInt(parts.at(-2));
		parts[parts.length - 1] = parts.at(-1).split(')')[0];
		let fileUrl = parts.slice(0, -2).join(':');
		let fileBase = fileUrl.split('/').at(-1);

		try {
			let res = await (await fetch(fileUrl)).text();
			let lines = res.split('\n');
			let errLine = lines[lineNum - 1].trim();

			let bug = ['🐛', '🐞', '🐜', '🦗', '🦋', '🪲'][Math.floor(Math.random() * 6)];

			$.log(
				'%cq5.js ' + bug + '%c Error in ' + fileBase + ' on line ' + lineNum + ':\n\n' + errLine,
				'background: #b7ebff; color: #000;',
				''
			);
		} catch (err) {}
	};
};

if (typeof navigator != undefined && navigator.onLine) {
	async function checkLatestVersion() {
		try {
			let response = await fetch('https://data.jsdelivr.com/v1/package/npm/q5');
			if (!response.ok) return;
			let data = await response.json();
			let l = data.tags.latest;
			l = l.slice(0, l.lastIndexOf('.'));
			if (l != Q5.version) {
				console.warn(`q5.js v${l} is now available! Consider updating from v${Q5.version}.`);
			}
		} catch (e) {}
	}

	checkLatestVersion();
}
