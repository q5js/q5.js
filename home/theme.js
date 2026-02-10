{
	let systemTheme = window.matchMedia('prefers-color-scheme: dark').matches ? 'dark' : 'light';
	let storedSystemTheme = localStorage.getItem('last-system-theme');
	if (storedSystemTheme !== systemTheme) {
		localStorage.removeItem('theme');
		localStorage.setItem('last-system-theme', systemTheme);
	}

	let theme = localStorage.getItem('theme');
	theme ??= systemTheme;
	document.body.className = theme;
}

let themeCache = {};

async function setMonacoEditorTheme(themeName) {
	if (typeof monaco == 'undefined') return;

	let themeData = themeCache[themeName];

	if (!themeData) {
		themeData = await fetch(`/assets/themes/${themeName}.json`).then((res) => res.json());
		themeCache[themeName] = themeData;
	}

	monaco.editor.defineTheme('custom-theme', themeData);
	monaco.editor.setTheme('custom-theme');
	modifyTokenizer('javascript', jsCustomTokenizer);
}

let jsCustomTokenizer = {
	tokenizer: {
		root: [
			[/[$_A-Za-z\u00C0-\u024F][$_0-9A-Za-z\u00C0-\u024F\u0300-\u036F][\w$]*(?=\()/, 'functionName'],
			[
				/[$_A-Za-z\u00C0-\u024F][$_0-9A-Za-z\u00C0-\u024F\u0300-\u036F]*/,
				{
					cases: {
						'@typeKeywords': 'keyword',
						'@keywords': 'keyword',
						'@default': 'identifier'
					}
				}
			]
		]
	}
};

async function modifyTokenizer(languageId, customRules) {
	let allLangs = monaco.languages.getLanguages();
	let { language } = await allLangs.find(({ id }) => id === languageId).loader();

	for (let key in customRules) {
		let value = customRules[key];
		if (key === 'tokenizer') {
			for (let category in value) {
				let tokenDefs = value[category];
				if (!language.tokenizer.hasOwnProperty(category)) {
					language.tokenizer[category] = [];
				}
				if (Array.isArray(tokenDefs)) {
					language.tokenizer[category].unshift(...tokenDefs);
				}
			}
		}
	}
	monaco.languages.setMonarchTokensProvider(languageId, language);
}

function applyTheme(theme) {
	if (theme == 'dark') {
		document.body.classList.remove('light');
		document.body.classList.add('dark');
		setMonacoEditorTheme('aijs_dark_modern');
		let hl = document.getElementById('highlight-theme');
		if (hl) hl.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css';
	} else {
		document.body.classList.remove('dark');
		document.body.classList.add('light');
		setMonacoEditorTheme('aijs_light');
		let hl = document.getElementById('highlight-theme');
		if (hl) hl.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css';
	}
}

function setTheme(theme) {
	applyTheme(theme);
	localStorage.setItem('theme', theme);
}

window.matchMedia('prefers-color-scheme: dark').addEventListener('change', (e) => {
	let newTheme = e.matches ? 'dark' : 'light';
	localStorage.removeItem('theme');
	localStorage.setItem('last-system-theme', newTheme);
	applyTheme(newTheme);
});

applyTheme(
	localStorage.getItem('theme') || (window.matchMedia('prefers-color-scheme: dark').matches ? 'dark' : 'light')
);
