Q5.modules.ai = ($) => {
	$.askAI = (q = '') => {
		throw Error('Ask AI ✨ ' + q);
	};

	$._aiErrorAssistance = async (e) => {
		let askAI = e.message.includes('Ask AI ✨');
		if (!askAI) console.error(e);
		if (Q5.disableFriendlyErrors) return;
		if (askAI || !Q5.errorTolerant) noLoop();
		let stackLines = e.stack.split('\n');
		if (stackLines.length <= 1) return;

		let idx = 1;
		let sep = '(';
		if (navigator.userAgent.indexOf('Chrome') == -1) {
			idx = 0;
			sep = '@';
		}
		while (stackLines[idx].indexOf('q5.js:') >= 0) idx++;

		let parts = stackLines[idx].split(sep).at(-1);
		parts = parts.split(':');
		let lineNum = parseInt(parts.at(-2));
		if (askAI) lineNum++;
		let fileUrl = parts.slice(0, -2).join(':');
		let fileBase = fileUrl.split('/').at(-1);

		try {
			let res = await (await fetch(fileUrl)).text();
			let lines = res.split('\n');
			let errLine = lines[lineNum - 1].trim();

			let context = '';
			let i = 1;
			while (context.length < 1600) {
				if (lineNum - i >= 0) {
					context = lines[lineNum - i].trim() + '\n' + context;
				}
				if (lineNum + i < lines.length) {
					context += lines[lineNum + i].trim() + '\n';
				}
				i++;
			}

			let question =
				askAI && e.message.length > 10 ? e.message.slice(10) : 'Whats+wrong+with+this+line%3F+short+answer';

			let url =
				'https://chatgpt.com/?q=q5.js+' +
				question +
				(askAI ? '' : '%0A%0A' + encodeURIComponent(e.name + ': ' + e.message)) +
				'%0A%0ALine%3A+' +
				encodeURIComponent(errLine) +
				'%0A%0AExcerpt+for+context%3A%0A%0A' +
				encodeURIComponent(context);

			if (!askAI) console.log('Error in ' + fileBase + ' on line ' + lineNum + ':\n\n' + errLine);

			console.warn('Ask AI ✨ ' + url);

			if (askAI) window.open(url, '_blank');
		} catch (err) {}
	};
};
