let typeDefs = '';

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
				paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/vs' }
			});

			require(['vs/editor/editor.main'], async () => {
				this.editor = monaco.editor.create(this.editorEl, {
					value: this.initialCode,
					language: 'javascript',
					wordWrap: true,
					folding: false,
					renderLineHighlight: 'none',
					theme: 'vs-dark',
					fontSize: 14,
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
					let res = await fetch('/q5.d.ts');
					typeDefs = await res.text();
				}

				monaco.languages.typescript.javascriptDefaults.addExtraLib(typeDefs, '/q5.d.ts');

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

		this.outputEl.innerHTML = '';

		const q5FunctionNames = [
			'preload',
			'setup',
			'update',
			'draw',
			'drawFrame',
			'postProcess',
			'doubleClicked',
			'keyPressed',
			'keyReleased',
			'keyTyped',
			'mouseMoved',
			'mouseDragged',
			'mousePressed',
			'mouseReleased',
			'mouseClicked',
			'mouseWheel',
			'touchStarted',
			'touchMoved',
			'touchEnded',
			'windowResized'
		];

		try {
			let userCode = this.editor.getValue();

			let useWebGPU = userCode.includes('Q5.WebGPU');

			const q5InstanceRegex = /(?:(?:let|const|var)\s+\w+\s*=\s*)?(?:new\s+Q5|(await\s+)*Q5\.WebGPU)\s*\([^)]*\);?/g;
			userCode = userCode.replace(q5InstanceRegex, '');

			let q = new Q5('instance', this.outputEl, useWebGPU ? 'webgpu' : null);

			for (let f of q5FunctionNames) {
				const regex = new RegExp(`(async\\s+)?function\\s+${f}\\s*\\(`, 'g');
				userCode = userCode.replace(regex, (match) => {
					const isAsync = match.includes('async');
					return `q.${f} = ${isAsync ? 'async ' : ''}function(`;
				});
			}

			const func = new Function(
				'q',
				`
(async () => {
	with (q) {
		${userCode}
	}
})();`
			);

			func(q);

			this.q5Instance = q;
		} catch (e) {
			console.error('Error executing user code:', e);
		}
	}

	resizeEditor() {
		this.editorEl.style.height = this.initialCode.split('\n').length * 22 + 'px';
		this.editor.layout();
	}
}

window.MiniEditor = MiniEditor;
