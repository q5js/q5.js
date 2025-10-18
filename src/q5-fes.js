Q5.modules.fes = ($) => {
	$._fes = async (e) => {
		if (Q5.disableFriendlyErrors) return;

		e._handledByFES = true;

		let stackLines = e.stack?.split('\n');
		if (!stackLines?.length) return;

		let idx = 1;
		let sep = '(';
		if (navigator.userAgent.indexOf('Chrome') == -1) {
			idx = 0;
			sep = '@';
		}
		while (stackLines[idx].indexOf('q5') >= 0) idx++;

		let errFile = stackLines[idx].split(sep).at(-1);
		if (errFile.startsWith('blob:')) errFile = errFile.slice(5);
		errFile = errFile.split(')')[0];
		let parts = errFile.split(':');
		let lineNum = parseInt(parts.at(-2));
		parts[parts.length - 1] = parts.at(-1).split(')')[0];
		let fileUrl = e.file || parts.slice(0, -2).join(':');
		let fileBase = fileUrl.split('/').at(-1);

		try {
			let res = await (await fetch(fileUrl)).text(),
				lines = res.split('\n'),
				errLine = lines[lineNum - 1]?.trim() ?? '',
				bug = ['🐛', '🐞', '🐜', '🦗', '🦋', '🪲'][Math.floor(Math.random() * 6)],
				inIframe = window.self !== window.top,
				prefix = `q5.js ${bug}`,
				errorMsg = ` Error in ${fileBase} on line ${lineNum}:\n\n${errLine}`;

			if (inIframe) $.log(prefix + errorMsg);
			else {
				$.log(`%c${prefix}%c${errorMsg}`, 'background: #b7ebff; color: #000;', '');
			}
		} catch (err) {}
	};

	if (typeof window !== 'undefined' && window.addEventListener) {
		// get user sketch file path (full path)
		let err = new Error(),
			lines = err.stack?.split('\n') || '';
		for (let line of lines) {
			// This regex captures the full path or URL to the .js file
			let match = line.match(/(https?:\/\/[^\s)]+\.js|\b\/[^\s)]+\.js)/);
			if (match) {
				let file = match[1];
				if (!/q5|p5play/i.test(file)) {
					$._sketchFile = file;
					break;
				}
			}
		}

		if ($._sketchFile) {
			window.addEventListener('error', (evt) => {
				let e = evt.error;
				if (evt.filename === $._sketchFile && !e?._handledByFES) {
					e.file = evt.filename;
					$._fes(e);
				}
			});
			window.addEventListener('unhandledrejection', (evt) => {
				let e = evt.reason;
				if (e?.stack?.includes($._sketchFile) && !e?._handledByFES) $._fes(e);
			});
		}
	}

	if (Q5.online != false && typeof navigator != undefined && navigator.onLine) {
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
};
