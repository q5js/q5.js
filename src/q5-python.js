const runPython = async function () {
	let scripts = [...document.getElementsByTagName('script')].filter(
		(s) => s.type == 'q5-python' || s.type == 'text/q5-python'
	);
	if (!scripts.length) return;

	if (!window.brython) {
		const load = (src) =>
			new Promise((res, rej) => {
				const s = document.createElement('script');
				s.src = src;
				s.onload = res;
				s.onerror = rej;
				document.head.appendChild(s);
			});

		await load('https://cdn.jsdelivr.net/npm/brython@3.14.0/brython.min.js');
		await load('https://cdn.jsdelivr.net/npm/brython@3.14.0/brython_stdlib.min.js');
	}

	let code = '';
	for (const script of scripts) {
		if (script.src?.endsWith?.('.ipynb')) {
			const nb = await (await fetch(script.src)).json();
			for (const cell of nb.cells) {
				if (cell.cell_type !== 'code') continue;
				const m = cell.metadata,
					cellLang = m?.language_info?.name ?? m?.kernelspec?.language ?? m?.kernelspec?.name ?? m?.language;
				if (cellLang && !String(cellLang).toLowerCase().includes('python')) continue;
				const src = Array.isArray(cell.source)
					? cell.source.join('')
					: typeof cell.source === 'string'
						? cell.source
						: '';
				code += src + '\n';
			}
		} else {
			code += script.src ? await (await fetch(script.src)).text() : script.innerText;
		}
	}

	// strip `from q5 import *` — it's only used for type hints (q5.pyi)
	code = code.startsWith('from q5') ? code.slice(code.indexOf('\n') + 1) : code;

	const useWebGPU = !code.slice(0, code.indexOf('\n')).includes('C2D'),
		q = useWebGPU ? await Q5.WebGPU() : new Q5();
	await q.ready;

	let pyReady;
	q._loaders.push(new Promise((res) => (pyReady = res)));

	// add a tab before each line of code to nest it inside the __run function
	// but not within triple-quoted strings
	code = code
		.split(/("""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\')/g)
		.map((part, i) => (i % 2 === 0 ? part.replaceAll('\n', '\n\t') : part))
		.join('');

	code = `
async def __run(q):
	${code}

	_wrap_fns(q, locals(), ns)
`;

	window._pyErr = (err, lineNum) => {
		if (typeof err === 'string' && err.includes('Traceback')) {
			let lines = err.split('\n');
			for (let i = lines.length - 1; i > 0; i--) {
				const match = lines[i].match(/File "<string>", line (\d+)/);
				if (match) {
					lineNum = parseInt(match[1]);
					lines = lines.slice(i + 1);
					// de-indent the first two lines based on the first line's indentation
					const indentMatch = lines[0].match(/^\s+/);
					if (indentMatch) {
						const indent = indentMatch[0];
						for (let j = 0; j < Math.min(2, lines.length); j++) {
							lines[j] = lines[j].slice(indent.length);
						}
					} else {
						let line = code.split('\n')[lineNum - 1].trim();
						lines.unshift(line, '');
					}
					err = lines.join('\n');
					break;
				}
			}
		}

		let file = scripts[0].src || scripts[0]['data-filename'] || 'sketch.py';
		file = file.split('/').at(-1);

		lineNum -= 2; // adjust for the wrapper code lines
		if (Q5.friendlyError) Q5.friendlyError(file, lineNum, err);
		else console.error(`Error in ${file} on line ${lineNum}:\n\n${err}`);
	};

	brython();

	// hide brython's internal logs by temporarily overriding console.log
	let log = console.log;
	console.log = function () {};

	__BRYTHON__.runPythonSource(`
from browser import window, aio
import traceback
import io

_state_vars = ["frameCount", "deltaTime", "width", "height", "halfWidth", "halfHeight", "windowWidth", "windowHeight", "mouseX", "mouseY", "pmouseX", "pmouseY", "movedX", "movedY", "mouseIsPressed", "mouseButton", "keyIsPressed", "key", "keyCode", "touches", "recording"]

_usr_fns = ["update", "draw", "postProcess", "mousePressed", "mouseReleased", "mouseMoved", "mouseDragged", "mouseClicked", "doubleClicked", "mouseWheel", "keyPressed", "keyReleased", "keyTyped", "touchStarted", "touchMoved", "touchEnded", "windowResized"]

def _err():
	f = io.StringIO()
	traceback.print_exc(file=f)
	return f.getvalue()

def _sync_state(q, ns):
	for var in _state_vars:
		if hasattr(q, var):
			ns[var] = getattr(q, var)

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

async def _run_py(q, code):
	ns = globals().copy()
	ns['ns'] = ns
	ns['Q5'] = window.Q5

	for attr in dir(q):
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

	console.log = log;

	pyReady();

	await window._runPy(q, code);
};

if (typeof document == 'object') {
	if (document.readyState == 'loading') {
		document.addEventListener('DOMContentLoaded', runPython);
	} else runPython();
}
