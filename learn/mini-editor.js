let typeDefs = '',
	langTypeDefs = '';

class MiniEditor {
	constructor(scriptEl) {
		let scriptContent = scriptEl.innerHTML.slice(0, -1).replaceAll('\t', '  ').trim();
		let container = document.createElement('div');
		container.id = 'mie-' + scriptEl.id;
		container.className = 'mie-container';
		scriptEl.insertAdjacentElement('beforebegin', container);
		this.container = container;
		this.initialCode = scriptContent;

		let attrs = scriptEl.getAttributeNames();
		for (let attr of attrs) {
			this[attr] = scriptEl.getAttribute(attr) || true;
		}
	}

	async init() {
		let editorEl = document.createElement('div');
		editorEl.id = `${this.container.id}-code`;
		editorEl.className = 'mie-code';
		if (this['hide-editor']) {
			editorEl.style.display = 'none';
		}

		let outputEl = document.createElement('div');
		outputEl.id = `${this.container.id}-output`;
		outputEl.className = 'mie-output';
		if (this['hide-output']) {
			outputEl.style.display = 'none';
		}

		this.container.append(outputEl);
		this.container.append(editorEl);

		this.outputEl = outputEl;
		this.editorEl = editorEl;

		await this.initializeEditor();

		this.runCode();

		this.editor.onDidChangeModelContent(() => {
			clearTimeout(this.debounceTimeout);
			this.debounceTimeout = setTimeout(() => this.runCode(), 500);
		});

		this.resizeEditor();
		window.addEventListener('resize', () => this.resizeEditor());
	}

	async initializeEditor() {
		return new Promise((resolve) => {
			require.config({
				paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' }
			});

			require(['vs/editor/editor.main'], async () => {
				this.editor = monaco.editor.create(this.editorEl, {
					value: this.initialCode,
					language: 'javascript',
					folding: false,
					renderLineHighlight: 'none',
					theme: 'vs-dark',
					fontSize: 16,
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

				if (!typeDefs) {
					let res = await fetch('/defs/q5.d.ts');
					typeDefs = await res.text();
				}

				monaco.languages.typescript.javascriptDefaults.addExtraLib(typeDefs, '/defs/q5.d.ts');

				if (Q5._lang != 'en') {
					if (!langTypeDefs) {
						let res = await fetch(`/defs/q5-${Q5._lang}.d.ts`);
						langTypeDefs = await res.text();
					}

					monaco.languages.typescript.javascriptDefaults.addExtraLib(langTypeDefs, `/defs/q5-${Q5._lang}.d.ts`);
				}

				this.editorReady = true;

				resolve();
			});
		});
	}

	runCode() {
		if (!this.editorReady) {
			console.error('Editor is not ready yet');
			return;
		}
		this.isRunning = true;

		if (this.errorDecorations) {
			this.errorDecorations = this.editor.deltaDecorations(this.errorDecorations, []);
		}

		this.outputEl.innerHTML = '';

		try {
			let userCode = this.editor.getValue();

			let useWebGPU =
				userCode.includes('= function') ||
				userCode.includes('\nawait') ||
				userCode.includes('await createCanvas') || // safeguard
				/webgpu/i.test(userCode);

			if (useWebGPU) {
				if (Q5.canUseWebGPU == false) {
					this.outputEl.innerHTML = '<p>WebGPU is not supported in this browser.</p>';
					return;
				}
				Q5._esm = true;
			}

			const q5InstanceRegex = /(?:(?:let|const|var)\s+\w+\s*=\s*)?(?:new\s+Q5|(await\s+)*Q5\.WebGPU)\s*\([^)]*\);?/g;
			userCode = userCode.replace(q5InstanceRegex, '');

			let q = new Q5('instance', this.outputEl, useWebGPU ? 'webgpu' : 'c2d');

			for (let f of Q5._userFns) {
				const regex = new RegExp(`(async\\s+)?function\\s+${f}\\s*\\(`, 'g');
				userCode = userCode.replace(`q5.${f}`, `q.${f}`);
				userCode = userCode.replace(regex, (match) => {
					const isAsync = match.includes('async');
					return `q.${f} = ${isAsync ? 'async ' : ''}function(`;
				});
			}

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

			func(q).catch((e) => {
				console.error('Error executing user code:', e);
				this.handleError(e);
			});

			this.q5Instance = q;
		} catch (e) {
			console.error('Error executing user code:', e);
			this.handleError(e);
		}
	}

	handleError(e) {
		let lineNo = null;
		if (e.stack) {
			const match = e.stack.match(new RegExp(`\${this.container.id}\\\\.js:(\\\\d+)`));
			if (match) {
				lineNo = parseInt(match[1]) - 3;
			}
		}

		if (lineNo) {
			this.errorDecorations = this.editor.deltaDecorations(this.errorDecorations || [], [
				{
					range: new monaco.Range(lineNo, 1, lineNo, 1),
					options: {
						isWholeLine: true,
						className: 'mie-error-line',
						hoverMessage: { value: 'Error: ' + e.message }
					}
				}
			]);
		}

		this.outputEl.innerHTML += `<div style="color: #ff6b6b; font-family: monospace; margin-top: 10px; border-top: 1px solid #444; padding-top: 10px;">${
			e.message
		}${lineNo ? ' (Line ' + lineNo + ')' : ''}</div>`;
	}

	resizeEditor() {
		this.editorEl.style.height = this.initialCode.split('\n').length * 25 + 'px';
		this.editor.layout();
	}
}

window.MiniEditor = MiniEditor;
