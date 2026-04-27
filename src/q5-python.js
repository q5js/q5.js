const runPython = async function () {
	let scripts = [...document.getElementsByTagName('script')];
	scripts = scripts.filter((s) => s.type == 'q5-python' || s.type == 'text/q5-python');
	if (!scripts.length) return;

	if (!window.brython) {
		const loadScript = (src) =>
			new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = src;
				script.onload = resolve;
				script.onerror = reject;
				document.head.appendChild(script);
			});

		await loadScript('https://cdn.jsdelivr.net/npm/brython@3.14.0/brython.min.js');
		await loadScript('https://cdn.jsdelivr.net/npm/brython@3.14.0/brython_stdlib.min.js');
	}

	let code = '';
	for (const script of scripts) {
		code += script.src ? await (await fetch(script.src)).text() : script.innerText;
	}

	const useWebGPU = !code.slice(0, code.indexOf('\n')).includes('C2D'),
		q = useWebGPU ? await Q5.WebGPU() : new Q5();

	// `window.Canvas` returns a promise that resolves when Q5 is ready
	// but `q5py.Canvas` returns the renderer synchronously
	// so to make Brython happy with `await Canvas()` we need to make it async
	const Canvas = q.Canvas;
	q.Canvas = async (...a) => Canvas(...a);

	// add a tab before each line of code to nest it inside the __run function
	// but not within triple-quoted strings
	code = code
		.split(/(\"\"\"[\s\S]*?\"\"\"|\'\'\'[\s\S]*?\'\'\')/g)
		.map((part, i) => (i % 2 === 0 ? part.replaceAll('\n', '\n\t') : part))
		.join('');

	code = `
async def __run(q):
	${code}

	_state_vars = ["mouseX", "mouseY", "pmouseX", "pmouseY", "width", "height", "frameCount", "deltaTime", "mouseIsPressed", "mouseButton", "keyIsPressed", "key", "keyCode", "touches", "movedX", "movedY"]

	_usr_fns = ["update", "draw", "postProcess", "mousePressed", "mouseReleased", "mouseMoved", "mouseDragged", "mouseClicked", "doubleClicked", "mouseWheel", "keyPressed", "keyReleased", "keyTyped", "touchStarted", "touchMoved", "touchEnded", "windowResized"]

	def _sync_and_call(fn):
		def _wrapper(*args):
			try:
				for var in _state_vars:
					if hasattr(q, var):
						ns[var] = getattr(q, var)
				return fn(*args)
			except Exception as e:
				window._pyErr(_err())
				if not window.Q5.errorTolerant: noLoop()
		return _wrapper

	for fn_name in _usr_fns:
		if fn_name in locals():
			setattr(window, fn_name, _sync_and_call(locals()[fn_name]))
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

def _err():
	f = io.StringIO()
	traceback.print_exc(file=f)
	return f.getvalue()

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

	try:
		exec(code, ns)
	except SyntaxError as e:
		return window._pyErr(_err(), e.lineno)
	except Exception as e:
		return window._pyErr(_err())
	
	try:
		await ns["__run"](q)
	except Exception as e:
		window._pyErr(_err())

window._runPy = _run_py
`);

	console.log = log;

	await window._runPy(q, code);
};

if (typeof document == 'object') {
	if (document.readyState == 'loading') {
		document.addEventListener('DOMContentLoaded', runPython);
	} else runPython();
}
