/**
 * Converts q5 JavaScript examples into their Python equivalents.
 */

function convertObjectLiterals(py) {
	const lines = py.split('\n');
	const result = [];
	// Stack entries: 'obj' | 'block' | {kind: 'method', propName, funcName}
	const stack = [];
	const getKind = (e) => (typeof e === 'string' ? e : (e?.kind ?? 'block'));

	for (let line of lines) {
		if (!line.trim()) {
			result.push(line);
			continue;
		}

		// Detach a trailing comment so it can't hide a line-ending { or }, and re-attach it on output
		const indent = line.match(/^\s*/)[0];
		let trailing = '';
		const trailingMatch = line.match(/^(.*\S)(\s*__COMMENT_\d+__)\s*$/);
		if (trailingMatch) {
			line = trailingMatch[1];
			trailing = trailingMatch[2];
		}
		const emit = (text) => {
			if (!trailing) result.push(text);
			// a line that was only a closing brace becomes a standalone comment at the same indentation
			else if (!text.trim()) result.push(indent + trailing.trimStart());
			else result.push(text + trailing);
		};

		const opens = (line.match(/\{/g) || []).length;
		const closes = (line.match(/\}/g) || []).length;

		const inObj = stack.length > 0 && getKind(stack[stack.length - 1]) === 'obj';

		// Inline object on one line: { key: val, ... }
		if (opens === closes && opens > 0) {
			line = line.replace(/\{([^{}]*)\}/g, (_, content) => {
				const inner = content.replace(/((?:^|,)\s*)([\p{L}\p{N}_$]*)(\s*:)/gu, "$1'$2'$3");
				return '{' + inner + '}';
			});
			// If we're inside an outer object, quote the key on this line too
			if (inObj) {
				line = line.replace(/^(\s*)([\p{L}\p{N}_$]*)(\s*:)/mu, "$1'$2'$3");
			}
			emit(line);
			continue;
		}

		if (closes > opens) {
			const ctx = stack.pop() ?? 'block';
			const kind = getKind(ctx);
			if (kind === 'method') {
				// Replace the closing } with a blank line, then emit the re-assignment
				emit(line.replace(/^\s*\}\s*$/, ''));
				result.push(`${ctx.propName} = ${ctx.funcName}`);
				continue;
			} else if (kind !== 'obj') {
				line = line.replace(/^\s*\}\s*$/, '');
			}
		} else if (opens > closes) {
			// Check for dotted method assignment: obj.prop = function(...) { or obj.prop = (...) => {
			const methodMatch = line.match(
				/^(\s*)([\p{L}\p{N}_$]+(?:\.[\p{L}\p{N}_$]+)+)\s*=\s*(?:function\s*\((.*?)\)|\((.*?)\)\s*=>)\s*\{?\s*$/u
			);
			if (methodMatch) {
				const [, indent, propName, funcArgs1, funcArgs2] = methodMatch;
				const args = (funcArgs1 ?? funcArgs2 ?? '').trim();
				if (propName.startsWith('q5.')) {
					const hookName = propName.replace(/^q5\./, '');
					emit(`${indent}def ${hookName}(${args}):`);
					stack.push('block');
					continue;
				}
				const funcName = propName.replace(/\./g, '_');
				emit(`${indent}def ${funcName}(${args}):`);
				stack.push({ kind: 'method', propName, funcName });
				continue;
			}
			const isObjLiteral = /[=(\[,]\s*\{/.test(line) || (inObj && /:\s*\{/.test(line));
			stack.push(isObjLiteral ? 'obj' : 'block');
			if (!isObjLiteral) {
				line = line.replace(/\s*\{\s*$/, '');
			}
		}

		const nowInObj = stack.length > 0 && getKind(stack[stack.length - 1]) === 'obj';
		if (nowInObj && !/[=(\[,]\s*\{/.test(line)) {
			// Quote bare identifier keys inside the object body
			line = line.replace(/^(\s*)([\p{L}\p{N}_$]*)(\s*:)/mu, "$1'$2'$3");
		}

		emit(line);
	}

	return result.join('\n');
}

function extractInlineCallbacks(js) {
	const lines = js.split('\n');
	const output = [];
	let cbCount = 0;
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		// Detect a line ending with a multi-line arrow function as the last argument:
		// e.g. "foo.bar(x, (a, b) => {"  or  "foo.bar(x, (a, b) =>"
		const m = line.match(/^(\s*)(.*\S),\s*\(([\p{L}\p{N}_$,\s*]*)\)\s*=>\s*(\{?)(\s*__COMMENT_\d+__)?\s*$/u);
		if (m && m[2].trim()) {
			const [, indent, callPart, params, brace, comment = ''] = m;
			const cbName = `cb${cbCount++}`;
			const bodyLines = [];
			i++;

			if (brace === '{') {
				let depth = 1;
				while (i < lines.length && depth > 0) {
					const bl = lines[i];
					const opens = (bl.match(/\{/g) || []).length;
					const closes = (bl.match(/\}/g) || []).length;
					depth += opens - closes;
					if (depth > 0) bodyLines.push(bl);
					i++;
				}
			} else {
				// No brace: consume lines more indented than the call line
				const baseIndent = (indent.match(/^(\s*)/)?.[1] ?? '').length;
				while (i < lines.length) {
					const bl = lines[i];
					if (!bl.trim()) {
						i++;
						continue;
					}
					const blIndent = (bl.match(/^(\s*)/)?.[1] ?? '').length;
					if (blIndent <= baseIndent) break;
					bodyLines.push(bl);
					i++;
				}
			}

			output.push(`${indent}function ${cbName}(${params}) {${comment}`);
			for (const bl of bodyLines) output.push(bl);
			output.push(`${indent}}`);
			output.push(`${indent}${callPart}, ${cbName})`);
			continue;
		}

		output.push(line);
		i++;
	}
	return output.join('\n');
}

// Adds `global varName` inside def blocks that assign to module-level variables.
function addGlobalDeclarations(py) {
	const lines = py.split('\n');

	// Find top-level variables initialized at indentation 0
	const topLevelVariables = new Set();
	const functionLocalVariables = new Set();

	for (const line of lines) {
		const indent = line.match(/^\s*/)[0].length;
		if (indent === 0) {
			const m = line.match(/^([\p{L}\p{N}_$]+)\s*=\s*[^=]/u);
			if (m) topLevelVariables.add(m[1]);
		}
	}

	if (topLevelVariables.size === 0) return py;

	for (let i = 0; i < lines.length; i++) {
		const definition = lines[i].match(/^(\s*)def\s+[\p{L}_$][\p{L}\p{N}_$]*\s*\((.*?)\)\s*:/u);
		if (!definition) continue;

		const indent = definition[1].length;
		const params = new Set(
			definition[2]
				.split(',')
				.map((param) => param.trim())
				.filter(Boolean)
		);
		const assignedVariables = new Set();

		for (let j = i + 1; j < lines.length; j++) {
			const lineIndent = lines[j].match(/^\s*/)[0].length;
			if (lines[j].trim() && lineIndent <= indent) break;

			for (const name of topLevelVariables) {
				if (params.has(name) || functionLocalVariables.has(name)) continue;
				// Matches re-assignments (=, +=, -=, *=, /=, :=) while ignoring member access (.name)
				const pattern = new RegExp(
					`(?:^|[^\\p{L}\\p{N}_$.])${name.replace(/\$/g, '\\$')}\\s*(?:=(?!=)|\\+=|-=|\\*=|/=|:=)`,
					'u'
				);
				const codeLine = lines[j].replace(/(['"])(?:\\.|(?!\1)[\s\S])*?\1/g, '');
				if (pattern.test(codeLine)) assignedVariables.add(name);
			}
		}

		if (assignedVariables.size > 0) {
			const bodyIndent = lines[i + 1]?.match(/^\s*/)[0];
			const insertIndent = bodyIndent && bodyIndent.length > indent ? bodyIndent : `${definition[1]}\t`;
			lines.splice(i + 1, 0, `${insertIndent}global ${[...assignedVariables].join(', ')}`);
			i++;
		}
	}

	return lines.join('\n');
}

function addAioRunForAsyncCalls(py) {
	// Find all async function names defined with `async def name(`
	const asyncFuncNames = [];
	const defRe = /^\s*async\s+def\s+([\p{L}\p{N}_$]+)\s*\(/gmu;
	let m;
	while ((m = defRe.exec(py)) !== null) {
		asyncFuncNames.push(m[1]);
	}
	if (asyncFuncNames.length === 0) return py;

	for (const fname of asyncFuncNames) {
		// Match any occurrence of `fname(` not preceded by a word char or dot
		const callRe = new RegExp(`(?<![\\w.])${fname}\\s*\\(`, 'g');
		let result = '';
		let lastIndex = 0;

		while ((m = callRe.exec(py)) !== null) {
			const matchStart = m.index;
			const lineStart = py.lastIndexOf('\n', matchStart - 1) + 1;
			const linePrefix = py.slice(lineStart, matchStart);

			// Skip the function definition line itself
			if (/^\s*(async\s+)?def\s+/.test(linePrefix)) {
				result += py.slice(lastIndex, callRe.lastIndex);
				lastIndex = callRe.lastIndex;
				continue;
			}
			// Skip if already awaited or already wrapped
			if (/await\s+$/.test(linePrefix) || /aio\.run\($/.test(linePrefix)) {
				result += py.slice(lastIndex, callRe.lastIndex);
				lastIndex = callRe.lastIndex;
				continue;
			}

			// Find the matching closing paren
			let depth = 1;
			let j = callRe.lastIndex;
			while (j < py.length && depth > 0) {
				if (py[j] === '(') depth++;
				else if (py[j] === ')') depth--;
				j++;
			}

			result += py.slice(lastIndex, matchStart);
			result += `aio.run(${py.slice(matchStart, j)})`;
			lastIndex = j;
			callRe.lastIndex = j;
		}

		py = result + py.slice(lastIndex);
	}

	return py;
}

// Swaps every // comment for a __COMMENT_n__ placeholder so the other transforms can't touch it.
// Handles comments on their own line and ones trailing code. Skips over string literals
// so that things like 'http://example.com' are left alone.
function hideComments(source, comments) {
	let out = '';
	let quote = null;
	for (let i = 0; i < source.length; i++) {
		const ch = source[i];
		if (quote) {
			out += ch;
			if (ch === '\\') out += source[++i] ?? '';
			else if (ch === quote || (ch === '\n' && quote !== '`')) quote = null;
			continue;
		}
		if (ch === '"' || ch === "'" || ch === '`') {
			quote = ch;
			out += ch;
		} else if (ch === '/' && source[i + 1] === '*') {
			// leave block comments as they are, but don't let quotes inside them confuse the scan
			const close = source.indexOf('*/', i + 2);
			const stop = close === -1 ? source.length : close + 2;
			out += source.slice(i, stop);
			i = stop - 1;
		} else if (ch === '/' && source[i + 1] === '/') {
			let end = source.indexOf('\n', i);
			if (end === -1) end = source.length;
			if (source[end - 1] === '\r') end--;
			const text = source.slice(i, end);
			const lineStart = out.lastIndexOf('\n') + 1;
			const ownLine = out.slice(lineStart).trim() === '';
			// The indentation stays in the source either way, so later passes that
			// look at indentation (e.g. global declarations) still see the real structure
			comments.push({ text, trailing: !ownLine });
			out += `__COMMENT_${comments.length - 1}__`;
			i = end - 1;
		} else {
			out += ch;
		}
	}
	return out;
}

function convertJSToPython(js) {
	let py = js;

	py = py.replaceAll('// prettier-ignore', '');

	// Hide comments first so apostrophes, "!" etc. inside them can't affect anything else
	const comments = [];
	py = hideComments(py, comments);

	const literals = [];

	const translateTemplateLiterals = (source) =>
		source.replace(/`([\s\S]*?\n[\s\S]*?)`/g, (_, template) => {
			const interpolations = [];
			let content = template.replace(/\$\{([^{}]+)\}/g, (_match, expression) => {
				const index = interpolations.push(expression) - 1;
				return `\u0000${index}\u0000`;
			});
			const isFormatted = interpolations.length > 0;
			if (isFormatted) {
				content = content.replace(/{/g, '{{').replace(/}/g, '}}');
				content = content.replace(/\u0000(\d+)\u0000/g, (_, index) => `{${interpolations[Number(index)]}}`);
			}
			return `${isFormatted ? 'f' : ''}"""${content}"""`;
		});

	const hideLiterals = (source) =>
		source
			.replace(/f?"""[\s\S]*?"""/g, (literal) => {
				const index = literals.push(literal) - 1;
				return `__Q5_STRING_LITERAL_${index}__`;
			})
			.replace(/(['"])(?:\\.|(?!\1)[\s\S])*?\1/g, (literal) => {
				const index = literals.push(literal) - 1;
				return `__Q5_STRING_LITERAL_${index}__`;
			});

	py = hideLiterals(translateTemplateLiterals(py));

	// special
	py = py.replace(/q5\.update\s*=\s*clear/g, 'def update(): clear()');
	py = py.replace(/await\s+(Canvas|Lienzo)\b/g, '$1');

	// Extract multi-line arrow function callbacks into named functions before other transforms
	py = extractInlineCallbacks(py);

	// Comprehensive numeric for loops: supports comparisons (<, <=, >, >=), custom steps/increments (++, --, += N, -= N)
	py = py.replace(
		/for\s*\(\s*(?:let|var|const)?\s*([\p{L}\p{N}_$]+)\s*=\s*(-?\d+)\s*;\s*\1\s*(<=|>=|<|>)\s*([^;]+)\s*;\s*\1\s*(\+\+|--|\+= *\d+|-= *\d+)\s*\)/gu,
		(match, variable, start, comparison, end, increment) => {
			end = end.trim();
			let step = 1;
			if (increment === '--' || increment.startsWith('-=')) {
				step = increment === '--' ? -1 : -Number(increment.slice(2).trim());
			} else if (increment.startsWith('+=')) {
				step = Number(increment.slice(2).trim());
			}

			// <= and >= are inclusive in JS but range() is exclusive, so shift the bound by one
			const shiftEnd = (delta) => {
				if (/^-?\d+$/.test(end)) return String(Number(end) + delta);
				// only parenthesize if the bound is something more than plain arithmetic
				if (/[?&|<>=!]/.test(end)) return delta > 0 ? `(${end}) + 1` : `(${end}) - 1`;
				// n - 1 + 1 -> n, n + 1 - 1 -> n
				const m = end.match(/^(.*\S)\s*([-+])\s*1$/);
				if (m && m[2] === (delta > 0 ? '-' : '+')) return m[1];
				return delta > 0 ? `${end} + 1` : `${end} - 1`;
			};
			if (comparison === '<=') {
				end = shiftEnd(1);
			} else if (comparison === '>=') {
				end = shiftEnd(-1);
			}

			if (comparison === '>' || comparison === '>=') {
				step = -Math.abs(step);
			}

			if (step === 1) {
				if (start === '0') {
					return `for ${variable} in range(${end}):`;
				}
				return `for ${variable} in range(${start}, ${end}):`;
			}
			return `for ${variable} in range(${start}, ${end}, ${step}):`;
		}
	);

	// For...of loops: for (let x of array) -> for x in array:
	py = py.replace(/for\s*\(\s*(?:let|var|const)?\s*([\p{L}\p{N}_$]+)\s+of\s+([^)]+)\)/gu, 'for $1 in $2:');

	// Convert ++ and -- to Python equivalents
	py = py.replace(/\b([\p{L}\p{N}_$]+)\+\+/gu, '$1 += 1');
	py = py.replace(/\+\+([\p{L}\p{N}_$]+)\b/gu, '$1 += 1');
	py = py.replace(/\b([\p{L}\p{N}_$]+)--/gu, '$1 -= 1');
	py = py.replace(/--([\p{L}\p{N}_$]+)\b/gu, '$1 -= 1');

	// Convert uninitialized variable declarations: let j; -> j = None
	py = py.replace(/\b(?:let|const|var)\s+([\p{L}\p{N}_$]+)\s*;/gu, '$1 = None');
	// Remove JS semicolons
	py = py.replace(/;/g, '');
	// Strip let/const/var keywords
	py = py.replace(/\b(let|const|var)\s+/gu, '');
	// Convert instance instantiation (e.g. new Sprite() -> Sprite.new())
	{
		let result = '';
		let i = 0;
		const re = /new\s+((?:[\p{L}\p{N}_$]+\.)*[A-Z][\p{L}\p{N}_$]*)\s*\(/gu;
		let m;
		while ((m = re.exec(py)) !== null) {
			result += py.slice(i, m.index);
			let depth = 1,
				j = m.index + m[0].length;
			while (j < py.length && depth > 0) {
				if (py[j] === '(') depth++;
				else if (py[j] === ')') depth--;
				j++;
			}
			result += `${m[1]}.new(${py.slice(m.index + m[0].length, j - 1)})`;
			i = j;
			re.lastIndex = j;
		}
		py = result + py.slice(i);
	}
	// Convert named function declarations: function name(args) { -> def name(args):
	py = py.replace(/function\s+([\p{L}\p{N}_$]+)\s*\((.*?)\)\s*\{?/gu, 'def $1($2):');
	// Convert q5 lifecycle blocks: q5.update = function() { -> def update():
	py = py.replace(/q5\.([\p{L}\p{N}_$]+)\s*=\s*function\s*\((.*?)\)\s*\{?/gu, 'def $1($2):');
	// Convert q5 property assignments to bare assignments: q5.update = clear -> update = clear
	py = py.replace(/^(\s*)q5\.([\p{L}\p{N}_$]+)\s*=/gmu, '$1$2 =');
	// Convert anonymous function expressions assigned to a variable: name = function(args) { -> def name(args):
	py = py.replace(/^(\s*)([\p{L}\p{N}_$]+)\s*=\s*function\s*\((.*?)\)\s*\{?/gmu, '$1def $2($3):');

	// Handle elifs first
	py = py.replace(/\belse\s+if\s*\((.*?)\)(?=\s*\{|(?:\s*\n)|\s+[a-zA-Z_$])/gu, 'elif $1:');

	// Handle normal ifs
	py = py.replace(/\bif\s*\((.*?)\)(?=\s*\{|(?:\s*\n)|\s+[a-zA-Z_$])/gu, 'if $1:');

	// Handle elses
	py = py.replace(/\belse\s+if\b/gu, 'elif');
	py = py.replace(/\belse([ \t]*)(?=\{|\n|\s+[a-zA-Z_$])/gu, 'else:$1');
	py = py.replace(/\}\s*else\s*:\s*/gu, 'else: ');
	py = py.replace(/\}\s*elif\b/gu, 'elif');

	// While loops
	py = py.replace(/\bwhile\s*\((.*?)\)/gu, 'while $1:');

	// Convert .length to len()
	py = py.replace(/((?:[\p{L}\p{N}_$]+\.)*[\p{L}\p{N}_$]+)\.length\b/gu, 'len($1)');

	py = py.replaceAll('.push(', '.append(');

	// Convert assigned block arrow functions (not lambdas): name = (args) => { -> def name(args):
	py = py.replace(/^(\s*)([\p{L}\p{N}_$]+)\s*=\s*\((([\p{L}\p{N}_$,\s*]*)?)\)\s*=>\s*\{?/gmu, '$1def $2($3):');
	// Convert single-line arrow function lambdas with parens
	py = py.replace(/\(([\p{L}\p{N}_$,\s*]*)\)\s*=>(?!\s*\{)\s*(.+)/gu, (match, args, body) => {
		body = body.replace(/return\s+/, '').trim();
		return `lambda ${args || 'i'}: ${body}`;
	});
	// Convert single-arg arrow function lambdas without parens
	py = py.replace(/\b([\p{L}\p{N}_$]+)\s*=>(?!\s*\{)\s*(.+)/gu, (match, arg, body) => {
		body = body.replace(/return\s+/, '').trim();
		return `lambda ${arg}: ${body}`;
	});

	// Convert logical operators
	py = py.replace(/&&/g, 'and');
	py = py.replace(/\|\|/g, 'or');
	py = py.replace(/!(?!=)/g, 'not ');

	py = py.replaceAll('`', '"""');

	// Convert boolean literals and null
	py = py.replace(/\btrue\b/g, 'True');
	py = py.replace(/\bfalse\b/g, 'False');
	py = py.replace(/\bnull\b/g, 'None');

	// Ternary: cond ? a : b -> a if cond else b (preserves line indentation and supports standalone statements, assignments, returns, etc.)
	py = py.replace(
		/^([ \t]*)(?:([\p{L}\p{N}_$]+(?:\.[\p{L}\p{N}_$]+|\[[^\]\n]*\])*\s*(?:[-+*/%])?=\s*(?!=)|[=(,\[:]\s*|\breturn\s+))?([^?:\n]+?)\s*\?\s*([^:?\n]+?)\s*:\s*([^,;\n)}`]+)/gmu,
		(match, indent, prefix, cond, truePart, falsePart) =>
			`${indent}${prefix || ''}${truePart.trim()} if ${cond.trim()} else ${falsePart.trim()}`
	);

	py = convertObjectLiterals(py);

	py = addAioRunForAsyncCalls(py);

	py = addGlobalDeclarations(py);

	// Collapse multiple consecutive blank lines into one
	py = py.replace(/\n{3,}/g, '\n\n');

	// Restore comments, convert // to #, keeping original indentation and aligning parameter comments
	py = py.replace(/__COMMENT_(\d+)__/g, (match, index, offset, fullString) => {
		const { text, trailing } = comments[index];
		let newComment = '#' + text.slice(2);
		// comments after code keep their original spacing and just swap // for #
		if (trailing) return newComment;

		// comment on its own line: its indentation is already in front of the placeholder
		const lineStart = fullString.lastIndexOf('\n', offset - 1) + 1;
		const indent = fullString.slice(lineStart, offset);

		if (newComment.includes('(')) {
			const remaining = fullString.slice(offset + match.length);
			const nextLineMatch = remaining.match(/^[^\n]*\n?([^\n]*)/);
			const nextLine = nextLineMatch ? nextLineMatch[1] : '';
			const codeParenIdx = nextLine.indexOf('(');

			if (codeParenIdx !== -1) {
				// align the comment's ( with the ( of the code on the next line
				const parenParts = newComment.split('(');
				const commentAfterParen = '(' + parenParts.slice(1).join('(');
				const spacesCount = codeParenIdx - indent.length - 1;

				if (spacesCount >= 0) {
					newComment = '#' + ' '.repeat(spacesCount) + commentAfterParen;
				}
			}
		}

		return newComment;
	});

	py = py.replace(/__Q5_STRING_LITERAL_(\d+)__/g, (_, index) => literals[Number(index)]);

	return py;
}

module.exports = { convertJSToPython };
