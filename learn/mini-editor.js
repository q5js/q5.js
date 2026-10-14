let monacoPromise,
	q5TypeDefs = '',
	q5LangTypeDefs = '',
	q5playTypeDefs = '',
	areTypeDefsLoaded = false;

class MiniEditor {
	constructor(scriptEl) {
		let scriptContent = scriptEl.innerHTML.slice(0, -1).replaceAll('\t', '  ').trim();
		let container = document.createElement('div');
		container.id = 'mie-' + scriptEl.id;
		container.className = 'mie';
		scriptEl.insertAdjacentElement('beforebegin', container);
		this.container = container;
		this.initialCode = scriptContent.replaceAll('// prettier-ignore', '');
		this.lines = scriptEl.lines || 1;

		let attrs = scriptEl.getAttributeNames();

		let baseIdx = attrs.findIndex((v) => v.startsWith('base-'));
		if (baseIdx != -1) {
			let baseKey = attrs[baseIdx].split('-')[1];
			MiniEditor.bases[baseKey] = scriptContent;
		}

		for (let attr of attrs) {
			this[attr] = scriptEl.getAttribute(attr) || true;
		}

		if (this.horiz) container.classList.add('horiz');
		else container.classList.add('vert');
	}

	async init() {
		if (this.useHeader) {
			let headerEl = document.createElement('div');
			headerEl.className = 'mie-header';

			let titleEl = document.createElement('div');
			titleEl.className = 'mie-title';

			let iconEl = document.createElement('img');
			iconEl.src = this.icon || '/assets/q5js_icon-light.png';
			iconEl.className = 'mie-icon';

			let textEl = document.createElement('span');
			textEl.innerText = this.container.id.replace('mie-', '').replaceAll('_', ' ');

			titleEl.append(iconEl, textEl);

			let reloadBtn = document.createElement('button');
			reloadBtn.className = 'mie-reload';
			reloadBtn.title = 'Run Code';
			reloadBtn.onclick = () => this.runCode();

			headerEl.append(titleEl, reloadBtn);
			this.container.append(headerEl);
		}

		let contentEl = document.createElement('div');
		contentEl.className = 'mie-content';
		if (this.horiz || this.container.classList.contains('horiz')) {
			contentEl.classList.add('horiz');
		} else {
			contentEl.classList.add('vert');
		}
		this.container.classList.remove('horiz', 'vert');
		this.container.append(contentEl);

		let editorEl = document.createElement('div');
		editorEl.id = `${this.container.id}-code`;
		editorEl.className = 'mie-code';
		if (this['hide-editor']) {
			editorEl.style.display = 'none';
		}

		if (!Q5.device) {
			let banner = document.querySelector('#webgpu-warning');
			if (!banner) {
				banner = document.createElement('div');
				banner.id = 'webgpu-warning';
				banner.className = 'webgpu-warning';
				banner.setAttribute('role', 'status');
				banner.setAttribute('aria-live', 'polite');
				banner.innerHTML = `
			<div>⚠️ WebGPU is not supported by your web browser or computer. Try
				using Google Chrome.
			</div>`;
				document.body.appendChild(banner);
			}
		}

		let outputEl = document.createElement('div');
		outputEl.id = `${this.container.id}-output`;
		outputEl.className = 'mie-output';
		if (this['hide-output']) {
			outputEl.style.display = 'none';
		}

		if (this.hide) {
			this.container.style.display = 'none';
		}

		contentEl.append(outputEl);
		contentEl.append(editorEl);

		this.outputEl = outputEl;
		this.editorEl = editorEl;

		if (MiniEditor.lang != 'en') {
			await import(`/locales/q5-${MiniEditor.lang}.js`);
		}

		await this.runCode();

		if (!window.require) return;

		await this.initializeEditor();

		this.calcLines();

		this.editor.onDidChangeModelContent(() => {
			clearTimeout(this.debounceTimeout);

			this.calcLines();
			this.editor.layout();

			this.debounceTimeout = setTimeout(() => this.runCode(), 500);
		});

		window.addEventListener('resize', () => this.editor.layout());

		this.loadTypeDefs();
	}

	async initializeEditor() {
		if (!window.require) return;

		// Configure and load Monaco only once across all MiniEditor instances
		if (!monacoPromise) {
			require.config({
				paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' }
			});

			monacoPromise = new Promise((resolve, reject) => {
				try {
					require(['vs/editor/editor.main'], () => resolve(), (err) => reject(err));
				} catch (e) {
					reject(e);
				}
			});
		}

		await monacoPromise;

		this.editor = monaco.editor.create(this.editorEl, {
			value: this.initialCode,
			language: 'javascript',
			folding: false,
			renderLineHighlight: 'none',
			theme: document.body.classList.contains('dark') ? 'vs-dark' : 'vs',
			fontSize: this.fontSize || 14,
			lineNumbers: this.showLineNumbers ? 'on' : 'off',
			lineNumbersMinChars: 2,
			glyphMargin: false,
			minimap: { enabled: false },
			scrollbar: {
				verticalScrollbarSize: 0,
				horizontalScrollbarSize: 0,
				alwaysConsumeMouseWheel: false
			},
			scrollBeyondLastLine: false,
			tabSize: 2
		});

		this._lineHeight = this.editor.getOption(monaco.editor.EditorOption.lineHeight);

		this.editor.addCommand(monaco.KeyCode.Escape, () => {
			this.moveFocus(1);
		});

		this.editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Tab, () => {
			this.moveFocus(-1);
		});

		this.editorReady = true;
	}

	async loadTypeDefs() {
		if (areTypeDefsLoaded) return;
		areTypeDefsLoaded = true;

		let baseURL = '';
		if (MiniEditor.host != 'q5') {
			baseURL = 'https://q5js.org';
		}

		if (!q5TypeDefs) {
			let res = await fetch(baseURL + '/defs/q5.d.ts');
			q5TypeDefs = await res.text();
			monaco.languages.typescript.javascriptDefaults.addExtraLib(q5TypeDefs, baseURL + '/defs/q5.d.ts');
		}

		if (!q5playTypeDefs && MiniEditor.host == 'q5play') {
			try {
				let resLocal = await fetch('/q5play.d.ts');
				if (resLocal.ok) {
					q5playTypeDefs = await resLocal.text();
					monaco.languages.typescript.javascriptDefaults.addExtraLib(q5playTypeDefs, '/q5play.d.ts');
				}
			} catch (e) {
				// ignore fetch errors for local typedefs
			}
		}

		let lang = MiniEditor.lang;
		if (lang != 'en' && !q5LangTypeDefs) {
			let res = await fetch(`${baseURL}/defs/q5-${lang}.d.ts`);
			q5LangTypeDefs = await res.text();
			monaco.languages.typescript.javascriptDefaults.addExtraLib(q5LangTypeDefs, `${baseURL}/defs/q5-${lang}.d.ts`);
		}
	}

	async runCode() {
		this.isRunning = true;

		if (this.errorDecorations && this.editor) {
			this.errorDecorations = this.editor.deltaDecorations(this.errorDecorations, []);
		}

		if (this.outputEl.offsetHeight) {
			this.outputEl.style.minWidth = this.outputEl.style.maxWidth = this.outputEl.offsetWidth + 'px';
			this.outputEl.style.minHeight = this.outputEl.style.maxHeight = this.outputEl.offsetHeight + 'px';
		}

		if (this.q5Instance) {
			this.q5Instance.remove();
			this.q5Instance = null;
		}

		this.outputEl.innerHTML = '';

		let userCode = this.editor?.getValue() || this.initialCode;

		if (this.editor) this.calcLines(userCode);

		if (MiniEditor.host == 'q5play') {
			if (this.base && MiniEditor.bases[this.base]) {
				userCode =
					MiniEditor.bases[this.base] +
					`

let __up = q.update || clear;
q.update = () => {
	__up();

	${userCode}
};`;
			} else {
				userCode += '\nq.update ??= clear;';
			}
		}

		let useWebGPU =
			userCode.includes('= function') ||
			userCode.startsWith('await') ||
			userCode.includes('\nawait') ||
			userCode.includes('await Canvas') || // safeguard
			userCode.includes('await Lienzo') ||
			/webgpu/i.test(userCode);

		// if the examples uses the WebGPU renderer
		if (useWebGPU) {
			// if WebGPU is not supported
			if (!Q5.device) {
				// check if the example needs WebGPU
				if (userCode.includes('Shader')) {
					this.outputEl.innerHTML = '<p>WebGPU is not supported in this browser.</p>';
					return;
				}
			}
			Q5._esm = true;
		}

		const q5InstanceRegex = /(?:(?:let|const|var)\s+\w+\s*=\s*)?(?:new\s+Q5|(await\s+)*Q5\.WebGPU)\s*\([^)]*\);?/g;
		userCode = userCode.replace(q5InstanceRegex, '');

		let q = new Q5('instance', this.outputEl, useWebGPU ? (Q5.device ? 'webgpu' : 'webgpu-fallback') : 'c2d');
		this.q5Instance = q;

		await q.ready;

		const resize = () => {
			this.outputEl.style.minWidth = this.outputEl.style.maxWidth = '';
			this.outputEl.style.minHeight = this.outputEl.style.maxHeight = '';
			if (this.editor) this.resizeEditor();
		};

		const proxy = q._q;
		const _Canvas = q.Canvas;
		proxy.Canvas = proxy.createCanvas = async (...args) => {
			const res = await _Canvas.apply(q, args);
			resize();
			return res;
		};

		let hooks = Q5._hooks || Q5._userFns;
		for (let f of hooks) {
			const regex = new RegExp(`(async\\s+)?function\\s+${f}\\s*\\(`, 'g');
			userCode = userCode.replace(`q5.${f}`, `q.${f}`);
			userCode = userCode.replace(regex, (match) => {
				const isAsync = match.includes('async');
				return `q.${f} = ${isAsync ? 'async ' : ''}function(`;
			});
		}

		try {
			const func = new Function(
				'q',
				`
//# sourceURL=${this.container.id}.js
return (async () => {
	with (q) {
	
${userCode}

	}
})();
`
			);

			await func(q);
		} catch (e) {
			console.error('Error executing user code:', e);
			this.handleError(e);
		}
	}

	calcLines(code) {
		code ??= this.editor.getValue();

		let lineCount = code.split('\n').length;

		if (this.lines > lineCount) {
			this.editor.setValue(code + '\n'.repeat(this.lines - lineCount));
		}

		lineCount = Math.max(this.lines, lineCount);

		if (lineCount != this.lineCount) {
			this.lineCount = lineCount;
			const px = this.lineCount * this._lineHeight + 'px';
			this.resizeEditor();
			// set both height and minHeight and make sure flex won't collapse
			this.editorEl.style.height = px;
			this.editorEl.style.minHeight = px;
		}
	}

	resizeEditor() {
		this.editorEl.style.height = this.lineCount * this._lineHeight + 'px';
		this.editor.layout();
	}

	handleError(e) {
		if (this.q5Instance) {
			this.q5Instance.remove();
			this.q5Instance = null;
		}

		let lineNum = null;
		if (e.stack) {
			const match = e.stack.match(new RegExp(`\${this.container.id}\\\\.js:(\\\\d+)`));
			if (match) {
				lineNum = parseInt(match[1]) - 3;
			}
		}

		if (lineNum) {
			this.errorDecorations = this.editor.deltaDecorations(this.errorDecorations || [], [
				{
					range: new monaco.Range(lineNum, 1, lineNum, 1),
					options: {
						isWholeLine: true,
						className: 'mie-error-line',
						hoverMessage: { value: 'Error: ' + e.message }
					}
				}
			]);
		}

		this.outputEl.innerHTML += `<div style="color: #ff6b6b; font-family: monospace; padding: 0 8px;">${
			e.message
		}${lineNum ? ' (Line ' + lineNum + ')' : ''}</div>`;
	}

	moveFocus(step) {
		const focusableElements = Array.from(
			document.querySelectorAll('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])')
		).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
		const index = focusableElements.indexOf(document.activeElement);
		if (index > -1) {
			const nextElement = focusableElements[index + step];
			if (nextElement) {
				nextElement.focus();
			}
		}
	}

	remove() {
		if (this.q5Instance) {
			this.q5Instance.remove();
			this.q5Instance = null;
		}
		if (this.editor) {
			this.editor.dispose();
			this.editor = null;
		}
		// remove container from DOM
		if (this.container) {
			this.container.remove();
			this.container = null;
		}
	}
}

MiniEditor.bases = {};
MiniEditor.lang = 'en';

window.MiniEditor = MiniEditor;
