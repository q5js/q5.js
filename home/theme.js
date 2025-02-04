{
	let theme = localStorage.getItem('theme');
	theme ??= window.matchMedia('prefers-color-scheme: dark').matches ? 'dark' : 'light';
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
	tokenizer: { root: [[/[a-zA-Z_$][\w$]*(?=\()/, 'functionName']] }
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

function setTheme(theme) {
	if (theme == 'dark') {
		document.body.classList.remove('light');
		document.body.classList.add('dark');
		setMonacoEditorTheme('aijs_dark_modern');
	} else {
		document.body.classList.remove('dark');
		document.body.classList.add('light');
		setMonacoEditorTheme('aijs_light');
	}
	localStorage.setItem('theme', theme);
}

setTheme(localStorage.getItem('theme') || 'light');
