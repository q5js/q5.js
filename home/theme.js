function applyTheme(theme) {
	let prev = theme == 'dark' ? 'light' : 'dark';
	document.body.classList.remove(prev);
	document.body.classList.add(theme);
	if (typeof monaco != 'undefined') MiniEditor.setTheme(theme);
}

function setTheme(theme) {
	applyTheme(theme);
	localStorage.setItem('theme', theme);
	localStorage.setItem('lastUsed', Date.now());
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
	setTheme(e.matches ? 'dark' : 'light');
});

{
	let pref,
		theme = localStorage.getItem('theme'),
		time = localStorage.getItem('lastUsed');
	// preference expires after 1 hour
	if (theme && time && Date.now() - parseInt(time) < 3600000) {
		pref = theme;
	} else {
		pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	setTheme(pref);
}
