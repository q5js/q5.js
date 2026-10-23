// Naming used throughout this file:
//   locale   = HUMAN language of the q5 API and docs ('en', 'es', ...)  -> MiniEditor.locale
//   codeLang = PROGRAMMING language of an editor ('javascript' | 'python') -> editor.codeLang

const MONACO_VERSION = '0.57.0';
const BRYTHON_VERSION = '3.15.0';

// one indentation level (matches Monaco's tabSize: 2)
const indent = '  ';

// Lines the runtime wrappers add above the user's first line. Used to map
// error line numbers back to what the person sees in the editor.
const JS_WRAPPER_LINES = 7; // `new Function` header + our async/with wrapper, as reported by V8
const PY_WRAPPER_LINES = 2; // blank line + `async def __run(q):`

let monacoPromise,
	brythonPromise,
	q5TypeDefs = '',
	q5LocaleTypeDefs = '',
	q5playTypeDefs = '',
	q5playLocaleTypeDefs = '',
	typeDefsLoaded = {}, // codeLang -> true once its type definitions were requested
	pyGlobals = new Map(), // name -> symbol, parsed from the .pyi stubs
	pyMembers = new Map(), // name -> [symbols of classes], for `obj.name`
	pyProvidersRegistered = false;

class MiniEditor {
	constructor(scriptEl) {
		let scriptContent = MiniEditor.untab(scriptEl.innerHTML.slice(0, -1)).trim();
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

		// Set after the attribute loop so that no attribute on the script
		// element can overwrite them.
		this.codeLang = scriptEl.type?.includes('python') ? 'python' : 'javascript';
		this.srcName = container.id + '.js'; // name that shows up in JS stack traces
		this._lineOffset = 0;

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
			// Python versions of an example use the id suffix "-py"
			textEl.innerText = this.container.id.replace('mie-', '').replaceAll('_', ' ').replace(/-py$/, '');

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

		// the q5 locale must be loaded before any code runs
		if (MiniEditor.locale != 'en') {
			try {
				await import(`/locales/q5-${MiniEditor.locale}.js`);
			} catch (e) {
				console.warn(`Could not load the "${MiniEditor.locale}" q5 locale:`, e);
			}
		}

		// Run the code while Monaco loads in parallel
		const runCodeDone = this.runCode().catch((e) => {
			console.error('Error running code:', e);
			this.handleError(e);
		});

		if (!window.require) {
			await runCodeDone;
			return;
		}

		await this.initializeEditor(runCodeDone);

		if (!this.editor) return;

		this.calcLines();

		this.editor.onDidChangeModelContent(() => {
			clearTimeout(this.debounceTimeout);

			this.calcLines();
			this.editor.layout();

			this.debounceTimeout = setTimeout(() => this.runCode(), 500);
		});

		this._boundResize = () => {
			if (this.editor) this.editor.layout();
		};
		window.addEventListener('resize', this._boundResize);

		this._resizeObserver = new ResizeObserver(this._boundResize);
		this._resizeObserver.observe(this.outputEl);

		this.loadTypeDefs();
	}

	// Leading tabs -> INDENT, so editors, bases, and the generated Python
	// wrappers all indent with the same characters.
	static untab(code) {
		return code.replace(/^[ \t]+/gm, (ws) => ws.replaceAll('\t', indent));
	}

	// Indent every line after the first by `pad`, leaving the inside of
	// triple-quoted Python strings untouched.
	static indentPy(code, pad) {
		return code
			.split(/("""[\s\S]*?"""|'''[\s\S]*?''')/g)
			.map((part, i) => (i % 2 === 0 ? part.replaceAll('\n', '\n' + pad) : part))
			.join('');
	}

	// The names of the q5 API in the active locale (see q5-lang.js), as
	// {translated: english} tables for the Python bridge. Locales with accents
	// have two spellings of each name, like ratónX and ratonX.
	static langTables() {
		const invert = (maps = []) => {
			const table = {};
			for (let map of maps) {
				for (let name in map) table[map[name]] = name;
			}
			return table;
		};
		return JSON.stringify({ members: invert(Q5.lang?.members), hooks: invert(Q5.lang?.hooks) });
	}

	static escapeRegExp(str) {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	static addCustomThemes() {
		monaco.editor.defineTheme('q5-dark', {
			base: 'vs-dark',
			inherit: true,
			colors: {
				'editor.background': MiniEditor.host == 'q5' ? '#131516' : '#202324',
				'editorBracketHighlight.foreground1': '#4eaee9',
				'editorBracketHighlight.foreground2': '#4eaee9',
				'editorBracketHighlight.foreground3': '#b7ebff'
			},
			rules: [
				{ token: 'keyword', foreground: 'edb1e8' },
				{ token: 'type.identifier', foreground: 'b7ebff' },
				{ token: 'number', foreground: 'fff07f' },
				{ token: 'string', foreground: 'ffc766' },
				{ token: 'delimiter', foreground: '4eaee9' },
				{ token: 'delimiter.parenthesis', foreground: '4eaee9' }
			]
		});
	}

	static setTheme(theme) {
		monaco.editor.setTheme(theme == 'dark' ? 'q5-dark' : 'vs');
	}

	static async customizeEditors() {
		const def = monaco.languages.getLanguages().find((l) => l.id === 'javascript' && l.loader);
		if (def) {
			const { language } = await def.loader();
			// À-ÿ plus Latin Extended-A/B, skipping × and ÷
			const L = '\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u024F';

			language.tokenizer.common.unshift(
				// ASCII start, accents allowed afterwards
				[new RegExp(`#?[a-z_$][\\w$${L}]*`), { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
				[new RegExp(`[A-Z][\\w$${L}]*`), 'type.identifier'],
				[new RegExp(`[${L}][\\w$${L}]*`), 'identifier']
			);
			monaco.languages.setMonarchTokensProvider('javascript', language);
		}

		this.addCustomThemes();
	}

	async initializeEditor(runCodeDone) {
		if (!window.require) return;

		// Configure and load Monaco only once across all MiniEditor instances
		if (!monacoPromise) {
			require.config({
				paths: { vs: `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs` }
			});

			monacoPromise = new Promise((resolve, reject) => {
				try {
					require(['vs/editor/editor.main'], async () => {
						// the customizations are cosmetic, so never let them block the editor
						try {
							await MiniEditor.customizeEditors();
						} catch (e) {
							console.warn('Could not customize Monaco:', e);
						}
						resolve();
					}, reject);
				} catch (e) {
					reject(e);
				}
			});
		}

		// Wait for Monaco to load AND runCode to finish.
		// The editor is only created once the canvas is in the DOM so flex
		// layout is settled and Monaco measures the correct width.
		try {
			await Promise.all([monacoPromise, runCodeDone]);
		} catch (e) {
			console.error('Could not load the code editor:', e);
			return;
		}

		// the editor was removed while Monaco was loading
		if (!this.container) return;

		this.editor = monaco.editor.create(this.editorEl, {
			value: this.initialCode,
			language: this.codeLang,
			folding: false,
			renderLineHighlight: 'none',
			theme: document.body.classList.contains('dark') ? 'q5-dark' : 'vs',
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
		// each language's definitions only need to be loaded once
		if (typeDefsLoaded[this.codeLang]) return;
		typeDefsLoaded[this.codeLang] = true;

		let baseURL = '';
		if (MiniEditor.host != 'q5') {
			baseURL = 'https://q5js.org';
		}

		if (this.codeLang == 'python') return MiniEditor.loadPyDefs(baseURL);

		// fetch a .d.ts file and hand it to Monaco; a failure only costs autocomplete
		const addLib = async (url) => {
			try {
				let res = await fetch(url);
				if (!res.ok) return '';
				let text = await res.text();
				monaco.languages.typescript.javascriptDefaults.addExtraLib(text, url);
				return text;
			} catch (e) {
				return '';
			}
		};

		let locale = MiniEditor.locale;

		if (locale == 'en') {
			if (!q5TypeDefs) {
				q5TypeDefs = await addLib(baseURL + '/q5.d.ts');
			}
			if (MiniEditor.host == 'q5play' && !q5playTypeDefs) {
				q5playTypeDefs = await addLib('/q5play.d.ts');
			}
		} else {
			if (!q5LocaleTypeDefs) {
				let path = `${baseURL}/defs/q5-${locale}.d.ts`;
				q5LocaleTypeDefs = await addLib(path, path);
			}
			if (MiniEditor.host == 'q5play' && !q5playLocaleTypeDefs) {
				let path = `${baseURL}/defs/q5play-${locale}.d.ts`;
				q5playLocaleTypeDefs = await addLib(path, path);
			}
		}
	}

	static async loadPyDefs(baseURL) {
		const fetchPyi = async (url) => {
			try {
				let res = await fetch(url);
				if (!res.ok) return '';
				return await res.text();
			} catch (e) {
				return '';
			}
		};

		let locale = MiniEditor.locale;
		let q5Url, q5playUrl;

		if (locale == 'en') {
			q5Url = baseURL + '/q5.pyi';
			q5playUrl = '/q5play.pyi';
		} else {
			q5Url = `${baseURL}/defs/q5-${locale}.pyi`;
			q5playUrl = `/defs/q5play-${locale}.pyi`;
		}

		let q5Text = await fetchPyi(q5Url);
		if (q5Text) {
			if (locale == 'en') {
				q5TypeDefs = q5Text;
			} else {
				q5LocaleTypeDefs = q5Text;
			}
			MiniEditor.parsePyi(q5Text);
		}

		if (MiniEditor.host == 'q5play') {
			let q5playText = await fetchPyi(q5playUrl);
			if (q5playText) {
				if (locale == 'en') {
					q5playTypeDefs = q5playText;
				} else {
					q5playLocaleTypeDefs = q5playText;
				}
				MiniEditor.parsePyi(q5playText);
			}
		}

		MiniEditor.registerPyProviders();
	}

	static parsePyi(text) {
		let lines = text.split('\n');
		let currentClass = null;
		let i = 0;

		while (i < lines.length) {
			let line = lines[i];
			let trimmed = line.trim();

			// Check for class definition
			let classMatch = trimmed.match(/^class\s+(\w+)(?:\(([^)]+)\))?:/);
			if (classMatch) {
				currentClass = classMatch[1];
				pyGlobals.set(currentClass, {
					name: currentClass,
					kind: monaco.languages.CompletionItemKind.Class,
					detail: `class ${currentClass}`,
					documentation: ''
				});
				if (!pyMembers.has(currentClass)) {
					pyMembers.set(currentClass, new Map());
				}
				i++;
				continue;
			}

			// Check for function or method definition
			let defMatch = trimmed.match(/^(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/);
			if (defMatch) {
				let name = defMatch[1];
				let args = defMatch[2];
				let ret = defMatch[3] ? ` -> ${defMatch[3].trim()}` : '';
				let detail = `def ${name}(${args})${ret}`;

				// Look ahead for docstring
				let doc = '';
				if (i + 1 < lines.length) {
					let nextLine = lines[i + 1].trim();
					if (nextLine.startsWith('"""') || nextLine.startsWith("'''")) {
						let quote = nextLine.slice(0, 3);
						let docLines = [nextLine.slice(3)];
						i++;
						while (i + 1 < lines.length) {
							let dLine = lines[i + 1];
							if (dLine.trim().endsWith(quote) || dLine.includes(quote)) {
								docLines.push(dLine.replace(quote, ''));
								i++;
								break;
							}
							docLines.push(dLine);
							i++;
						}
						doc = docLines.join('\n').trim();
					}
				}

				let symbol = {
					name,
					kind: currentClass
						? monaco.languages.CompletionItemKind.Method
						: monaco.languages.CompletionItemKind.Function,
					detail,
					documentation: doc
				};

				if (currentClass) {
					pyMembers.get(currentClass).set(name, symbol);
				} else {
					pyGlobals.set(name, symbol);
				}
				i++;
				continue;
			}

			// Reset currentClass if indentation returns to 0 and line is not empty/comment
			if (trimmed && !line.startsWith(' ') && !line.startsWith('\t')) {
				currentClass = null;
			}

			i++;
		}
	}

	static registerPyProviders() {
		if (pyProvidersRegistered) return;
		pyProvidersRegistered = true;

		monaco.languages.registerCompletionItemProvider('python', {
			provideCompletionItems(model, position) {
				let word = model.getWordUntilPosition(position);
				let range = {
					startLineNumber: position.lineNumber,
					endLineNumber: position.lineNumber,
					startColumn: word.startColumn,
					endColumn: word.endColumn
				};

				let suggestions = [];

				// Check if this is member access (e.g. obj.method)
				let lineContent = model.getLineContent(position.lineNumber);
				let textBefore = lineContent.slice(0, position.column - 1);
				let memberMatch = textBefore.match(/(\w+)\s*\.\s*$/);

				if (memberMatch) {
					let objName = memberMatch[1];
					let members = pyMembers.get(objName);
					if (members) {
						for (let [name, sym] of members) {
							suggestions.push({
								label: name,
								kind: sym.kind,
								detail: sym.detail,
								documentation: { value: sym.documentation },
								insertText: name,
								range
							});
						}
					}
				} else {
					for (let [name, sym] of pyGlobals) {
						suggestions.push({
							label: name,
							kind: sym.kind,
							detail: sym.detail,
							documentation: { value: sym.documentation },
							insertText: name,
							range
						});
					}
				}

				return { suggestions };
			}
		});

		monaco.languages.registerHoverProvider('python', {
			provideHover(model, position) {
				let word = model.getWordAtPosition(position);
				if (!word) return null;

				let name = word.word;
				let sym = pyGlobals.get(name);

				if (!sym) {
					for (let [clsName, members] of pyMembers) {
						if (members.has(name)) {
							sym = members.get(name);
							break;
						}
					}
				}

				if (sym) {
					return {
						range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
						contents: [{ value: `\`\`\`python\n${sym.detail}\n\`\`\`` }, { value: sym.documentation }]
					};
				}

				return null;
			}
		});
	}

	// q5play examples can build on a shared "base" script. Returns the full
	// source to run and `offset`: how many lines come before the user's first
	// line, so error line numbers can be mapped back to the editor.
	composeSource(userCode) {
		if (MiniEditor.host != 'q5play') return { code: userCode, offset: 0 };

		const base = this.base && MiniEditor.bases[this.base];
		const isPy = this.codeLang == 'python';

		if (!base) {
			// JS examples without a base still clear the canvas every frame
			return { code: isPy ? userCode : userCode + '\nq.update ??= clear;', offset: 0 };
		}

		let prefix,
			body = userCode,
			suffix = '';

		if (this.raw) {
			prefix = base + '\n\n';
		} else if (isPy) {
			if (base.includes('def update()')) {
				// continue the base's update(), using the same indentation it does
				const indent = base.match(/def update\(\)[^\n]*\n(?:[ \t]*\n)*([ \t]+)\S/)?.[1] ?? indent;
				prefix = base + '\n\n' + indent;
				body = MiniEditor.indentPy(userCode, indent);
			} else {
				prefix = base + `\n\ndef update():\n${indent}clear()\n${indent}\n${indent}`;
				body = MiniEditor.indentPy(userCode, indent);
				suffix = '\n';
			}
		} else {
			prefix = base + '\n\nlet __up = q.update || clear;\nq.update = () => {\n\t__up();\n\n\t';
			suffix = '\n};';
		}

		return { code: prefix + body + suffix, offset: prefix.split('\n').length - 1 };
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

		// pasted tabs would clash with the spaces the Python wrappers use
		if (this.codeLang == 'python') userCode = MiniEditor.untab(userCode);

		let composed = this.composeSource(userCode);
		userCode = composed.code;
		this._lineOffset = composed.offset;

		let useWebGPU =
			this.codeLang == 'python' ||
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

		// Wrap Canvas so the layout is re-measured once the canvas actually
		// exists (Canvas is async with the WebGPU renderer).
		const proxy = q._q || q;
		const _Canvas = q.Canvas;
		proxy.Canvas = proxy.createCanvas = async (...args) => {
			const res = await _Canvas.apply(q, args);
			resize();
			return res;
		};

		if (this.codeLang == 'python') {
			return await this.runPy(q, userCode);
		}

		let hooks = Q5._hooks || Q5._userFns || [];
		for (let f of hooks) {
			const regex = new RegExp(`(async\\s+)?function\\s+${f}\\s*\\(`, 'g');
			userCode = userCode.replace(`q5.${f}`, `q.${f}`);
			userCode = userCode.replace(regex, (match) => {
				const isAsync = match.includes('async');
				return `q.${f} = ${isAsync ? 'async ' : ''}function(`;
			});
		}

		try {
			// If you change the lines above `${userCode}`, update JS_WRAPPER_LINES
			const func = new Function(
				'q',
				`
//# sourceURL=${this.srcName}
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

	async loadBrython() {
		const loadScript = (src) =>
			new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = src;
				script.onload = resolve;
				script.onerror = () => reject(new Error('Failed to load ' + src));
				document.head.appendChild(script);
			});

		const cdn = `https://cdn.jsdelivr.net/npm/brython@${BRYTHON_VERSION}`;
		await loadScript(cdn + '/brython.min.js');
		await loadScript(cdn + '/brython_stdlib.min.js');

		brython();

		window._pyErr = (err, lineNum, q) => q?._mie?.pyErr(err, lineNum);

		// Localized names of the state variables, canvas functions, and user
		// functions are passed to _run_py on every run (MiniEditor.langTables),
		// because the locale can change after this bridge was created.
		let hooks = Q5._hooks || Q5._userFns || [];

		// Q5 state variables that are copied into the Python namespace before
		// every call of a user-defined function
		// prettier-ignore
		const PY_STATE_VARS = ['frameCount','deltaTime','width','height','halfWidth','halfHeight','windowWidth','windowHeight','mouseX','mouseY','pmouseX','pmouseY','movedX','movedY','mouseIsPressed','mouseButton','keyIsPressed','key','keyCode','touches','recording'];

		// silence Brython's startup logging
		let log = console.log;
		console.log = function () {};

		try {
			__BRYTHON__.runPythonSource(`
from browser import window, aio
import traceback
import io
import json

_state_vars = ${JSON.stringify(PY_STATE_VARS)}

_usr_fns = ${JSON.stringify(hooks)}

def _err():
	f = io.StringIO()
	traceback.print_exc(file=f)
	return f.getvalue()

def _sync_state(q, ns):
	aliases = ns['_state_aliases']
	for var in _state_vars:
		if hasattr(q, var):
			val = getattr(q, var)
			ns[var] = val
			# localized spellings, like ratónX and ratonX for mouseX
			for alias in aliases.get(var, ()):
				ns[alias] = val

def _sync_and_call(q, fn, ns):
	def _wrapper(*args):
		try:
			_sync_state(q, ns)
			return fn(*args)
		except Exception as e:
			window._pyErr(_err(), None, q)
			if not window.Q5.errorTolerant: q.noLoop()
	return _wrapper

def _wrap_fns(q, locs, ns):
	for fn_name in _usr_fns:
		if fn_name in locs:
			setattr(q, fn_name, _sync_and_call(q, locs[fn_name], ns))
	# localized names of the user functions, like dibujar for draw
	for alias, fn_name in ns['_hook_aliases'].items():
		if alias in locs:
			setattr(q, fn_name, _sync_and_call(q, locs[alias], ns))

async def _run_py(q, code, lang_tables='{}'):
	lang = json.loads(lang_tables)
	ns = globals().copy()
	ns['ns'] = ns
	ns['Q5'] = window.Q5

	# localized names (from a locale file like q5-es.js) of the state
	# variables, canvas functions, and user functions
	state_aliases = {}
	for alias, name in lang['members'].items():
		if name in _state_vars:
			state_aliases.setdefault(name, []).append(alias)
	ns['_state_aliases'] = state_aliases
	ns['_canvas_aliases'] = [a for a, n in lang['members'].items() if n in ('Canvas', 'createCanvas')]
	ns['_hook_aliases'] = {a: n for a, n in lang['hooks'].items() if n in _usr_fns}

	for attr in window.Object.getOwnPropertyNames(q):
		if not attr.startswith('_'):
			try:
				ns[attr] = getattr(q, attr)
			except Exception:
				pass

	_orig_Canvas = ns['Canvas']
	def _canvas_wrapper(*args):
		result = _orig_Canvas(*args)
		_sync_state(q, ns)
		return result
	ns['Canvas'] = ns['createCanvas'] = _canvas_wrapper
	for alias in ns['_canvas_aliases']:
		if alias in ns:
			ns[alias] = _canvas_wrapper

	try:
		exec(code, ns)
	except SyntaxError as e:
		return window._pyErr(_err(), e.lineno, q)
	except Exception as e:
		return window._pyErr(_err(), 0, q)

	try:
		await ns["__run"](q)
	except Exception as e:
		window._pyErr(_err(), 0, q)

window._runPy = _run_py
`);
		} finally {
			console.log = log;
		}
	}

	// Called from the Python side with a traceback string
	pyErr(err, lineNum) {
		if (typeof err === 'string' && err.includes('Traceback')) {
			let lines = err.split('\n');
			for (let i = lines.length - 1; i > 0; i--) {
				const match = lines[i].match(/File "<string>", line (\d+)/);
				if (match) {
					lineNum = parseInt(match[1]);
					lines = lines.slice(i + 1);
					const indentMatch = lines[0]?.match(/^\s+/);
					if (indentMatch) {
						const indent = indentMatch[0];
						for (let j = 0; j < Math.min(2, lines.length); j++) {
							lines[j] = lines[j].slice(indent.length);
						}
					} else {
						let line = this._pyCode.split('\n')[lineNum - 1]?.trim();
						if (line) lines.unshift(line, '');
					}
					err = lines.join('\n');
					break;
				}
			}
		}
		// line numbers in the traceback count the wrapper and any base code too
		if (lineNum) lineNum -= PY_WRAPPER_LINES + this._lineOffset;
		this.handleError(err, lineNum);
	}

	// Wrap user code in an async function so it can use `await` at the top level
	wrapPy(code) {
		code = MiniEditor.indentPy(code, indent);

		return `
async def __run(q):
${indent}${code}

${indent}_wrap_fns(q, locals(), ns)
`;
	}

	async runPy(q, code) {
		if (!brythonPromise) {
			brythonPromise = this.loadBrython().catch((e) => {
				brythonPromise = null; // allow a retry on the next run
				throw e;
			});
		}
		await brythonPromise;

		code = this.wrapPy(code);

		this._pyCode = code;
		q._mie = this;
		q._py = true;

		try {
			await window._runPy(q, code, MiniEditor.langTables());
		} catch (e) {
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

	// `lineNum` is a line in the editor, when the caller already knows it
	// (Python errors). For JS errors it is read from the stack trace.
	handleError(err, lineNum) {
		const isPy = this.codeLang == 'python';
		let message = err?.message || String(err);

		if (!lineNum && !isPy && err?.stack) {
			const match = err.stack.match(new RegExp(`${MiniEditor.escapeRegExp(this.srcName)}:(\\d+)`));
			if (match) {
				lineNum = parseInt(match[1]) - JS_WRAPPER_LINES - this._lineOffset;
			}
		}

		if (this.q5Instance) {
			this.q5Instance.remove();
			this.q5Instance = null;
		}

		// lineNum < 1 means the error is in the base code, not in this editor
		if (lineNum > 0 && this.editor) {
			this.errorDecorations = this.editor.deltaDecorations(this.errorDecorations || [], [
				{
					range: new monaco.Range(lineNum, 1, lineNum, 1),
					options: {
						isWholeLine: true,
						className: 'mie-error-line',
						hoverMessage: { value: isPy ? message : 'Error: ' + message }
					}
				}
			]);
		}

		if (isPy) {
			// "NameError: name 'x' is not defined" -> "name 'x' is not defined"
			let lines = String(message).trim().split('\n');
			lines[lines.length - 1] = lines[lines.length - 1].replace(/^[\w.]+:\s*/, '');
			message = lines.join('\n');
		} else if (lineNum > 0) {
			message += ` (Line ${lineNum})`;
		}

		const errEl = document.createElement('pre');
		errEl.className = 'mie-err';
		errEl.textContent = message;
		this.outputEl.append(errEl);
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

	async remove() {
		clearTimeout(this.debounceTimeout);
		if (this._boundResize) {
			window.removeEventListener('resize', this._boundResize);
			this._boundResize = null;
		}
		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
			this._resizeObserver = null;
		}
		if (this.q5Instance) {
			await this.q5Instance.remove();
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
MiniEditor.locale = 'en'; // human language: 'en', 'es', ...

window.MiniEditor = MiniEditor;
