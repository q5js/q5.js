let typeDefs = '';

class MiniEditor {
	constructor(containerId, script) {
		this.containerId = containerId;
		this.initialCode = script;
		this.init();
	}

	async init() {
		const container = document.getElementById(this.containerId);

		const editorEl = document.createElement('div');
		editorEl.id = `${this.containerId}-mini-editor`;
		editorEl.className = 'mini-editor';

		this.editorEl = editorEl;

		const output = document.createElement('div');
		output.id = `${this.containerId}-output`;
		output.className = 'output';

		container.appendChild(output);
		container.appendChild(editorEl);

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

				this.editorReady = true;

				if (!typeDefs) {
					let res = await fetch('/q5.d.ts');
					typeDefs = await res.text();
				}

				monaco.languages.typescript.javascriptDefaults.addExtraLib(typeDefs, '/q5.d.ts');

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

		const outputElement = document.getElementById(`${this.containerId}-output`);
		outputElement.innerHTML = '';

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
			'touchStarted',
			'touchMoved',
			'touchEnded',
			'windowResized'
		];

		try {
			let userCode = this.editor.getValue();

			const q5InstanceRegex = /(?:(?:let|const|var)\s+\w+\s*=\s*)?new\s+Q5\s*\([^)]*\);?/g;
			userCode = userCode.replace(q5InstanceRegex, '');

			let q = new Q5('instance', outputElement);

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
