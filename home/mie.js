if (typeof window.mie == 'undefined') window.mie = [];
else window.mie = Object.assign([], window.mie);
mie.lang ??= {
	js: {
		play: function (code) {}
	}
};
mie.bases = {};

class MiniEditor {
	constructor(script) {
		this.id = mie.length;
		this.lang = script.type.slice(4) || 'js';

		let code = script.innerHTML.trim();

		let attrs = script.getAttributeNames();
		let baseIdx = attrs.findIndex((v) => v.startsWith('base-'));
		if (baseIdx != -1) {
			let baseKey = attrs[baseIdx].split('-')[1];
			mie.bases[baseKey] = code.slice(0, code.lastIndexOf('}'));
		}
		let props = {};
		for (let prop of attrs) {
			props[prop] = script.getAttribute(prop) || true;
		}

		let lines = props.lines || 0;
		if (!lines) {
			for (let c of code) {
				if (c == '\n') lines++;
			}
			lines++;
		}

		this.base = props.base;

		let mini = document.createElement('div');
		mini.className = 'mie ' + this.lang;
		if (props.horiz) mini.className += ' horiz';
		else mini.className += ' vert';
		mini.id = 'mie-' + this.id;
		mini.style = script.style.cssText;
		if (!script.style.cssText.includes('width') && props.width) {
			mini.style.width = props.width;
		}
		script.after(mini);
		this.elem = mini;

		let title = document.createElement('div');
		title.className = 'mie-title';
		let logo = document.createElement('div');
		logo.className = 'mie-logo';
		title.append(logo);
		let span = document.createElement('span');
		let name;
		if (props.id) name = props.id.replace(/-/g, ' ');
		else name = props.name || props.title || 'sketch';
		span.innerHTML += name;
		title.append(span);
		mini.append(title);

		if (props['editor-btn']) {
			let editBtn = document.createElement('button');
			editBtn.className = 'mie-edit';
			editBtn.innerHTML = '{ }';
			editBtn.onclick = () => {
				this.toggleEditor();
			};
			title.append(editBtn);
		}

		let playBtn = document.createElement('button');
		playBtn.className = 'mie-play';
		playBtn.title = 'replay';
		playBtn.onclick = () => this.play();
		title.append(playBtn);

		let main = document.createElement('div');
		main.className = 'mie-main';
		mini.append(main);

		let preview = document.createElement('div');
		preview.id = 'mie-preview-' + this.id;
		preview.className = 'mie-preview';
		main.append(preview);
		this.previewElem = preview;

		if (!mie.editorDisabled) {
			let ed = document.createElement('div');
			ed.id = 'mie-editor-' + this.id;
			ed.className = 'mie-editor';
			ed.innerHTML = code;
			main.append(ed);
			this.editorElem = ed;

			let editor = ace.edit('mie-editor-' + this.id);
			editor.setOptions({
				mode: 'ace/mode/javascript',
				minLines: 1,
				maxLines: lines,
				fontSize: '14px',
				showFoldWidgets: false,
				showLineNumbers: false,
				tabSize: 2,
				enableBasicAutocompletion: [
					{
						getCompletions: (editor, session, pos, prefix, callback) => {
							callback(null, mie.lang[this.lang].completions || []);
						}
					}
				],
				enableLiveAutocompletion: true
			});
			editor.session.on('changeMode', function (e, session) {
				if ('ace/mode/javascript' === session.getMode().$id) {
					if (!!session.$worker) {
						session.$worker.send('setOptions', [
							{
								esversion: 11,
								esnext: false
							}
						]);
					}
				}
			});
			editor.session.setMode('ace/mode/javascript');

			editor.setTheme('ace/theme/xcode');
			editor.session.setUseWrapMode(true);
			editor.renderer.setShowPrintMargin(false);

			this.editor = editor;
			this.sketch = null;

			if (props['hide-editor']) {
				this.hideEditor();
			}
		} else {
			this.code = code;
		}

		if (props.hide || props.hidden) {
			mini.style.display = 'none';
			return;
		}

		this.play();

		/* auto reload after the specified amount of seconds */
		if (props.reload) {
			(async () => {
				while (props.reload) {
					await new Promise((r) => setTimeout(r, props.reload * 1000));
					this.play();
				}
			})();
		}
	}

	play() {
		mie.lang[this.lang].remove.call(this);
		let code = this.code || this.editor.getValue().trim();
		this.player = mie.lang[this.lang].play.call(this, code);
	}

	toggleEditor() {
		if (this.editorElem.style.display == 'none') {
			this.showEditor();
		} else {
			this.hideEditor();
		}
	}

	showEditor() {
		let ed = this.editorElem;
		let pr = this.previewElem;
		ed.style.display = 'block';
		pr.style.width = 'unset';
		this.editor.focus();
	}

	hideEditor() {
		let ed = this.editorElem;
		let pr = this.previewElem;
		pr.style.width = '100%';
		ed.style.display = 'none';
	}

	remove() {
		mie.lang[this.lang].remove.call(this);
		this.editor.destroy();
		this.editor.container.remove();
		this.elem.remove();
	}
}

Object.defineProperty(mie, 'theme', {
	get: () => mie._theme,
	set: (theme) => {
		mie._theme = theme;
		if (mie.editorDisabled) return;
		if (theme == 'dark') {
			for (let mini of mie) {
				mini.editor.setTheme('ace/theme/dracula');
			}
		} else {
			for (let mini of mie) {
				mini.editor.setTheme('ace/theme/xcode');
			}
		}
	}
});

mie.loadMinis = (elem) => {
	elem = elem || document;
	let scripts = [...elem.getElementsByTagName('script')];
	for (let script of scripts) {
		if (script.type.includes('mie')) {
			mie.push(new MiniEditor(script));
		}
	}
};

mie.load = () => {
	if (typeof window.ace == 'undefined') {
		console.log('mie will run without the ace editor, which was not loaded.');
		mie.editorDisabled = true;
	}
	if (mie.autoLoad !== false) mie.loadMinis();
	if (mie.ready) mie.ready();
};

mie.lang.p5 = {};

mie.lang.p5.functionNames = [
	'preload',
	'setup',
	'draw',
	'keyPressed',
	'keyReleased',
	'keyTyped',
	'mouseMoved',
	'mouseDragged',
	'mousePressed',
	'mouseReleased',
	'mouseClicked',
	'touchStarted',
	'touchMoved',
	'touchEnded',
	'windowResized'
];

mie.lang.p5.play = function (code) {
	if (!code.includes('function setup') && !code.includes('function draw')) {
		code = mie.bases[this.base || 0] + code + '}';
	}
	function s(p) {
		for (let f of mie.lang.p5.functionNames) {
			code = code.replace('function ' + f + '()', 'p.' + f + ' = function()');
		}
		with (p) eval(code);
	}
	this.previewElem.innerHTML = ''; // avoid duplicate canvases
	return new p5(s, this.previewElem);
};

mie.lang.p5.remove = function () {
	if (this.player?.remove) this.player.remove();
};

mie.lang.q5 = mie.lang.p5;

if (mie.autoLoad !== false) mie.load();

{
	let style = document.createElement('style');
	style.innerHTML = `
.mie {
	display: flex;
	flex-direction: column;
	border-radius: 10px;
	font-family: sans-serif;
	box-sizing: border-box;
	background-color: #fff;
	padding: 6px;
}

.mie * {
	outline: none;
}

.mie-main {
	display: flex;
	align-items: center;
	flex-direction: column;
}

.mie.horiz .mie-main {
	flex-direction: row;
}

.mie-title {
	padding: 4px;
	padding-bottom: 6px;
	text-align: left;
	border-bottom: 2px solid #ccc;
}

.mie-title span {
	padding-left: 8px;
	font-weight: bold;
}

.mie.p5 .mie-logo {
	width: 16px;
	background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA6UlEQVRYhe2XQRKDIAxFaac7j9dzejzXdJyOFuH/JAQs7YxvSUx4SFS8xRhjGMjDNfX0LIZ2lrkYkrgLMR+SHKC/QCWXwCVwFKjsYDfJPOV7IJeofK4pZHEfAXLBYbxWhtXcYssM7oCEVNA6ccbwJnx/jL7VfIAfeQx7dboDfB44e0uSBWOBM2TIXbafiDwiZNKUP/kYebfBkKcLtPaAki8LKMk9JGQBC43vEC4gWO9sk1skSD0sQC5uBtTFAhbyVTu3AgtoxVicjQtgAakYG7fEQYwLkAQXax1SS++BNNEqVJEz9vc8hPACpq5Nzed8pCUAAAAASUVORK5CYII=');
}

.mie.q5 .mie-logo {
	width: 16px;
	background-image: url("https://q5js.org/q5js_logo.webp");
}

.mie-preview {
	display: flex;
	justify-content: center;
}

.mie.vert .mie-preview {
	width: 100%;
}

.mie-editor {
	width: 100%;
	font-size: 14px;
}

.mie.vert .mie-editor {
	border-top: 2px solid #ccc;
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
}

.mie.horiz .mie-editor {
	border-left: 2px solid #ccc;
	border-bottom-right-radius: 2px;
}

.mie-edit,
.mie-play {
	float: right;
	border: 0;
	background: transparent;
	cursor: pointer;
}

.dark .mie-play {
	filter: invert(90%);
}

.mie-play:active {
	animation: spin 0.2s linear infinite;
}

@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}

.mie-play:hover {
	border-color: transparent transparent transparent #404040;
}

.mie-edit {
	color: #202020;
}

.mie-edit:hover {
	color: #404040;
}

.ace_gutter,
.ace_gutter-layer,
.ace_gutter-cell {
	width: 4px !important;
}

.ace_gutter-cell.ace_error {
	background-color: #ff0000 !important;
}

.ace_scroller {
	left: 4px !important;
}

.ace_active-line {
	background-color: unset !important;
}

.ace_hidden-cursors {
	opacity: 0;
}

@media screen and (max-width: 600px) {
	.mie.horiz .mie-main {
		flex-direction: column;
	}

	.mie.horiz .mie-editor {
		border-left: 0 solid #ccc;
		border-top: 2px solid #ccc;
	}
}

.mie-logo {
	width: 16px;
	height: 16px;
	margin-top: 1px;
	margin-left: 6px;
	border-radius: 2px;
	float: left;
	background-size: cover;
	background-image: url("data:image/png;base64,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");
}

.mie-play {
	margin-top: 2px;
	margin-right: 2px;
	width: 18px;
	height: 16px;
	background-size: 18px 16px;
	background-repeat: no-repeat;

	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAABACAMAAAB7nkqoAAAAM1BMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbQS4qAAAAEHRSTlMAMGDgQKAQgMDwIFDQcJCwmc09OQAAAAlwSFlzAAABlAAAAZQB3gpsbAAAAilJREFUWIXtmMmWhDAIRTUOSTSW/v/X9mkzQR5E6/S2365UboEhQBx0jcfi/BU1Obuv+KT11zUdcLloXzKgKhwbf2iJtxawvrVZREQ5Qx6b89UZCMOwLmBMNFVOee4DjEH1o/gzpiddudIyxgBWKPtAMdoL4Qpbj9J9I1R+1CmvIdfljUZBSPjYeZ5nY88J7hmZ0kIWlq3b0YKMRLHcY4sJPzuO8UjZuR/IuDkYGKNsdIm9lNJRH0BQCnU2yI4kn4WMyhQajxJN1oiYTCHxnl2GiEkU8zIcBeNaV/wGRvWVnC6qXSnXurKDbRGmNqe45rcoA8bcaqu/O/F0Cs9NKfVTq8O3wFal6DnbpdzJsZauA6ZEJxgXxY6Ut3NngajHraaUYnGPGbBk0mpyyD1hGK1tGx9qPaygh//+178kycnU3Q1xS1hrSnmVWsP1XIDXu7T5lP36JgtgSZXqY6rTDqyLekGVBhZnOrCtsmBbVUq5+wOllupHSmfP165yPlC8vkika+x9ih/BuKguSSrVrXFqou7TKX1k7LIypdeSkkiK5aghkkcMHRnyMgLlCUMhpYEB5GEHsX4ydyjXpHdaNh3WEw0g4n3ZHT6pEp/rNYZ5MTXThKoxfjnBs6wkbwpHLtc9TcgUAaPK8+JDKV+esjSKOl00Cu0m45SvTp865ZuTsEQp916fyony0Ecnw5dfCKhFNGhf+quvFRTz640UK/1yEuQvJ7eGYfgBUN59CttbLNcAAAAASUVORK5CYII=");
}
`;
	document.head.appendChild(style);
}
