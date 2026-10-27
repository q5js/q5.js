/**
 * q5/lang/types.js
 *
 * AI was used to generate this script.
 */

const fs = require('fs');
const path = require('path');

/**
 * Parses a markdown file and extracts documentation structure
 */
function parseMarkdownFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	const lines = content.split('\n');

	const result = {
		sectionName: '',
		sectionDescription: '',
		functions: []
	};

	let i = 0;

	// Find the first top-level section header (# ...) anywhere near the top
	const headerIndex = lines.findIndex((l) => l.trim().startsWith('# '));
	if (headerIndex !== -1) {
		result.sectionName = lines[headerIndex].trim().substring(2).trim();
		i = headerIndex + 1;

		// Skip empty lines
		while (i < lines.length && lines[i].trim() === '') i++;

		// Collect section description until we hit the first ## header
		const descLines = [];
		while (i < lines.length && !lines[i].trim().startsWith('## ')) {
			descLines.push(lines[i]);
			i++;
		}
		result.sectionDescription = descLines.join('\n').trim();
	}

	// First pass: identify all class names
	const classNames = new Set();
	for (let j = i; j < lines.length; j++) {
		const line = lines[j];
		if (line.trim().startsWith('## ') && line.includes('.')) {
			const className = line.trim().substring(3).split('.')[0].trim();
			classNames.add(className);
		}
	}

	// Second pass: parse entries
	const entries = [];
	let currentEntry = null;
	let inCodeBlock = false;
	let currentExampleType = null;
	let codeBlockContent = [];

	while (i < lines.length) {
		const line = lines[i];

		// Check for function/class/member header
		if (line.trim().startsWith('## ')) {
			// Save previous entry if exists
			if (currentEntry) {
				entries.push(currentEntry);
			}

			const fullName = line.substring(3).trim();
			const isClassMember = fullName.includes('.');

			if (isClassMember) {
				const [className, memberName] = fullName.split('.');
				currentEntry = {
					name: memberName,
					fullName: fullName,
					description: '',
					webgpuDescription: '',
					c2dDescription: '',
					pythonDescription: '',
					params: [],
					webgpuExamples: [],
					c2dExamples: [],
					pythonExamples: [],
					isClassMember: true,
					parentClass: className
				};
			} else {
				const isClass = classNames.has(fullName);
				currentEntry = {
					name: fullName,
					fullName: fullName,
					description: '',
					webgpuDescription: '',
					c2dDescription: '',
					pythonDescription: '',
					params: [],
					webgpuExamples: [],
					c2dExamples: [],
					pythonExamples: [],
					isClass: isClass,
					members: []
				};
			}

			currentExampleType = null;
			i++;

			// Collect description
			const descLines = [];
			while (
				i < lines.length &&
				!lines[i].trim().startsWith('## ') &&
				!lines[i].trim().startsWith('### ') &&
				!lines[i].trim().startsWith('```')
			) {
				descLines.push(lines[i]);
				i++;
			}
			currentEntry.description = descLines.join('\n').trim();
			continue;
		}

		// Check for params code block
		if (line.trim() === '```' && !inCodeBlock) {
			inCodeBlock = true;
			codeBlockContent = [];
			i++;

			// Collect params
			while (i < lines.length && lines[i].trim() !== '```') {
				const paramLine = lines[i].trim();
				if (paramLine.startsWith('@param') || paramLine.startsWith('@return') || paramLine.startsWith('@type')) {
					if (currentEntry) {
						currentEntry.params.push(paramLine);
					}
				}
				i++;
			}
			inCodeBlock = false;
			i++;
			continue;
		}

		// Check for example type headers
		if (line.trim().startsWith('### webgpu')) {
			currentExampleType = 'webgpu';
			i++;
			continue;
		}

		if (line.trim().startsWith('### c2d')) {
			currentExampleType = 'c2d';
			i++;
			continue;
		}

		if (line.trim().startsWith('### python')) {
			currentExampleType = 'python';
			i++;
			continue;
		}

		// Check for code blocks with language (examples)
		if (line.trim().startsWith('```js') || line.trim().startsWith('```javascript')) {
			i++;
			codeBlockContent = [];

			// Collect code until closing ```
			while (i < lines.length && !lines[i].startsWith('```')) {
				codeBlockContent.push(lines[i]);
				i++;
			}

			const exampleCode = codeBlockContent.join('\n');
			if (currentEntry && currentExampleType) {
				if (currentExampleType === 'webgpu') {
					currentEntry.webgpuExamples.push(exampleCode);
				} else if (currentExampleType === 'c2d') {
					currentEntry.c2dExamples.push(exampleCode);
				}
			}

			i++;
			continue;
		}

		if (line.trim().startsWith('```py') || line.trim().startsWith('```python')) {
			i++;
			codeBlockContent = [];

			// Collect code until closing ```
			while (i < lines.length && !lines[i].startsWith('```')) {
				codeBlockContent.push(lines[i]);
				i++;
			}

			const pyCode = codeBlockContent.join('\n');
			if (currentEntry && currentExampleType === 'python') {
				currentEntry.pythonExamples.push(pyCode);
			}

			i++;
			continue;
		}

		if (currentEntry && currentExampleType) {
			if (currentExampleType === 'webgpu') {
				currentEntry.webgpuDescription += line + '\n';
			} else if (currentExampleType === 'c2d') {
				currentEntry.c2dDescription += line + '\n';
			} else if (currentExampleType === 'python') {
				currentEntry.pythonDescription += line + '\n';
			}
		}

		i++;
	}

	// Add last entry
	if (currentEntry) {
		entries.push(currentEntry);
	}

	// Organize entries into functions with class members
	const processedFunctions = [];
	const classMemberMap = new Map();

	// Group class members
	for (const entry of entries) {
		if (entry.isClassMember) {
			if (!classMemberMap.has(entry.parentClass)) {
				classMemberMap.set(entry.parentClass, []);
			}
			classMemberMap.get(entry.parentClass).push(entry);
		}
	}

	// Create class entries for classes that only have members (no class header in markdown)
	for (const className of classMemberMap.keys()) {
		const hasClassEntry = entries.some((e) => e.name === className && !e.isClassMember);
		if (!hasClassEntry) {
			// Create a class entry using the constructor's description if available
			const constructor = classMemberMap.get(className).find((m) => m.name === 'constructor');
			entries.push({
				name: className,
				fullName: className,
				description: constructor ? constructor.description : '',
				webgpuDescription: constructor ? constructor.webgpuDescription : '',
				c2dDescription: constructor ? constructor.c2dDescription : '',
				params: constructor ? constructor.params : [],
				webgpuExamples: [],
				c2dExamples: [],
				isClass: true,
				members: []
			});
		}
	}

	// Process all entries
	for (const entry of entries) {
		if (entry.isClassMember) {
			continue; // Skip, will be added as members
		}

		if (entry.isClass) {
			// Add members to this class
			entry.members = classMemberMap.get(entry.name) || [];
		}

		processedFunctions.push(entry);
	}

	result.functions = processedFunctions;

	return result;
}

/**
 * Reads the base en.d.ts file and extracts emoji to section mappings
 */
function extractEmojiMappings(baseDtsPath) {
	const content = fs.readFileSync(baseDtsPath, 'utf8');
	const lines = content.split('\n');
	const mappings = {};

	for (const line of lines) {
		const match = line.match(/^\s*\/\/\s+([^\w\s]+)\s+([\w\u00A0-\uFFFF]+)\s*$/);
		if (match) {
			const emoji = match[1].replace(/\uFE0F/g, '');
			const section = match[2];
			mappings[section] = emoji;
		}
	}

	return mappings;
}

/**
 * Reads the base en.d.ts to extract function signatures (including overloads) and type information
 */
function extractBaseSignatures(baseDtsPath) {
	const content = fs.readFileSync(baseDtsPath, 'utf8');
	const lines = content.split('\n');
	const signatures = {};

	let i = 0;
	while (i < lines.length) {
		const line = lines[i];

		const funcMatch = line.match(/^\s*function\s+([\w\u00A0-\uFFFF]+)\s*\(/);
		const varMatch = line.match(/^\s*(?:var|let|const)\s+([\w\u00A0-\uFFFF]+)\s*:/);
		const classMatch = line.match(/^\s*class\s+([\w\u00A0-\uFFFF]+)/);

		if (funcMatch) {
			const name = funcMatch[1];
			if (!signatures[name]) signatures[name] = [];
			signatures[name].push(line.trim());
		} else if (varMatch || classMatch) {
			const name = (varMatch || classMatch)[1];
			if (!signatures[name]) signatures[name] = [];
			signatures[name].push(line.trim());
		}

		i++;
	}

	return signatures;
}

/**
 * Generates JSDoc comment from function data supporting overload states
 */
function generateJSDoc(func, emoji, includeExamples = true, exampleType = 'c2d', indent = '\t', isFirst = true) {
	const lines = [];

	lines.push(`${indent}/** ${emoji}`);

	if (func.description) {
		const descLines = func.description.split('\n');
		descLines.forEach((line) => {
			lines.push(`${indent} * ${line}`);
		});
	}

	let specificDesc = '';
	if (exampleType === 'webgpu' && func.webgpuDescription) {
		specificDesc = func.webgpuDescription.trim();
	} else if (exampleType === 'c2d' && func.c2dDescription) {
		specificDesc = func.c2dDescription.trim();
	}

	if (specificDesc) {
		if (func.description) {
			lines.push(`${indent} *`);
		}
		const descLines = specificDesc.split('\n');
		descLines.forEach((line) => {
			lines.push(`${indent} * ${line}`);
		});
	}

	if (func.params && func.params.length > 0) {
		func.params.forEach((param) => {
			if (isFirst || !param.startsWith('@param')) {
				lines.push(`${indent} * ${param}`);
			}
		});
	}

	if (includeExamples && isFirst) {
		const examples = exampleType === 'webgpu' ? func.webgpuExamples : func.c2dExamples;
		if (examples && examples.length > 0) {
			examples.forEach((example) => {
				lines.push(`${indent} * @example`);
				example.split('\n').forEach((line) => {
					lines.push(`${indent} * ${line}`);
				});
			});
		}
	}

	lines.push(`${indent} */`);

	return lines.join('\n');
}

/**
 * Builds a complete .d.ts file
 */
function buildDtsFile(sections, baseDtsPath, outputPath, includeExamples = true, exampleType = 'c2d') {
	const emojiMappings = extractEmojiMappings(baseDtsPath);
	const baseSignatures = extractBaseSignatures(baseDtsPath);

	const baseContent = fs.readFileSync(baseDtsPath, 'utf8');
	const globalMatch = baseContent.match(/declare global\s*{([\s\S]*?)}\s*export\s*{\s*}/m);
	let baseGlobalBlock = '';
	if (globalMatch) baseGlobalBlock = globalMatch[1];

	const baseDecls = [];
	if (baseGlobalBlock) {
		const blines = baseGlobalBlock.split('\n');
		for (let i = 0; i < blines.length; i++) {
			let line = blines[i];
			if (!line || !line.trim()) continue;
			const t = line.trim();

			if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) continue;

			let classMatch = t.match(/^class\s+(\w+)\s*\{/);
			let nsMatch = t.match(/^namespace\s+(\w+)\s*\{/);
			if (classMatch || nsMatch) {
				const name = (classMatch || nsMatch)[1];
				let block = [t];
				let braceCount = (t.match(/{/g) || []).length - (t.match(/}/g) || []).length;
				while (braceCount > 0 && ++i < blines.length) {
					const ln = blines[i];
					block.push(ln);
					braceCount += (ln.match(/{/g) || []).length - (ln.match(/}/g) || []).length;
				}
				baseDecls.push({ name, text: block.join('\n') });
				continue;
			}

			let funcMatch = t.match(/^function\s+(\w+)\s*\(/);
			let varMatch = t.match(/^(?:var|let|const)\s+(\w+)\s*[:=]/);
			if (funcMatch) {
				baseDecls.push({ name: funcMatch[1], text: t });
				continue;
			}
			if (varMatch) {
				baseDecls.push({ name: varMatch[1], text: t });
				continue;
			}
		}
	}

	if (exampleType === 'c2d') {
		if (sections['shaders']) delete sections['shaders'];
	}

	const output = [];
	const push = (ln) => {
		if (ln === '') {
			if (output.length === 0 || output[output.length - 1] !== '') output.push('');
		} else {
			output.push(ln);
		}
	};
	let moduleName = outputPath.slice(outputPath.lastIndexOf('/') + 1, -5).replaceAll('-', '/');
	push(`/**\n * @module ${moduleName}\n */\n\ndeclare global {`);

	const existingNames = new Set();
	for (const s of Object.values(sections)) {
		for (const f of s.functions) {
			existingNames.add(f.name);
			if (f.isClass && f.members) {
				for (const m of f.members) existingNames.add(`${f.name}.${m.name}`);
			}
		}
	}

	const baseSectionBlocks = {};
	if (baseGlobalBlock) {
		let currentSec = null;
		const blines = baseGlobalBlock.split('\n');
		for (let i = 0; i < blines.length; i++) {
			const line = blines[i];
			const m = line.match(/^\s*\/\/\s*([^\w\s]+)\s+([a-z]+)\s*$/);
			if (m) {
				currentSec = m[2];
				baseSectionBlocks[currentSec] = baseSectionBlocks[currentSec] || [];
				continue;
			}
			if (currentSec) baseSectionBlocks[currentSec].push(line);
		}

		for (const d of baseDecls) {
			d._section = null;
			for (const [sec, lines] of Object.entries(baseSectionBlocks)) {
				const txt = lines.join('\n');
				if (txt.indexOf(d.text) !== -1) {
					d._section = sec;
					break;
				}
			}
		}
	}

	const sectionOrder = Object.keys(emojiMappings).map((section) => section);

	for (const sectionName of sectionOrder) {
		if (!sections[sectionName]) continue;

		const section = sections[sectionName];
		const emoji = emojiMappings[sectionName];
		const displaySectionName = section.sectionName || sectionName;

		push('');
		output.push(`\t// ${emoji} ${displaySectionName}`);

		if (section.sectionDescription) {
			const descLines = section.sectionDescription.split('\n');
			if (descLines.length > 0) {
				push('');
				output.push('\t/**');
				descLines.forEach((line) => {
					output.push(`\t * ${line}`);
				});
				output.push('\t */');
			}
		}

		push('');

		for (const func of section.functions) {
			if (func.isClass) {
				output.push(`\tclass ${func.name} {`);

				if (func.members && func.members.length > 0) {
					for (const member of func.members) {
						output.push('');
						output.push(generateJSDoc(member, emoji, includeExamples, exampleType, '\t\t'));

						const memberKey = `${func.name}.${member.name}`;
						let memberSig = baseSignatures[memberKey]?.[0];

						if (!memberSig) {
							const baseClassDecl = baseDecls.find((d) => d.name === func.name && d.text.trim().startsWith('class'));
							if (baseClassDecl) {
								const re = new RegExp(`(^|\\n)\\s*(?:static\\s+)?(?:${member.name})\\b[^\\n]*`, 'i');
								const m = baseClassDecl.text.match(re);
								if (m) memberSig = m[0].trim();
							}
						}

						if (memberSig) {
							const sigLine = memberSig.trim().replace(/;?\s*$/, ';');
							output.push(`\t\t${sigLine}`);
						} else {
							if (member.name === 'constructor') {
								output.push(`\t\tconstructor();`);
							} else {
								output.push(`\t\t${member.name}(): void;`);
							}
						}
					}
				}

				const baseClassDecl = baseDecls.find((d) => d.name === func.name && d.text.startsWith('class'));
				if (baseClassDecl) {
					const existingMemberNames = new Set((func.members || []).map((m) => m.name));
					const inner = baseClassDecl.text.split('\n').slice(1, -1);
					let chunk = [];
					const commitChunk = () => {
						if (chunk.length === 0) return;
						const sigLine = chunk.find((l) => l.trim() && !l.trim().startsWith('*') && !l.trim().startsWith('/'));
						if (!sigLine) {
							chunk = [];
							return;
						}
						let m = sigLine.trim().match(/^(?:static\s+)?([\w\u00A0-\uFFFF]+)\b/);
						if (!m) {
							chunk = [];
							return;
						}
						const mname = m[1];
						if (!existingMemberNames.has(mname)) {
							chunk.forEach((ln, idx) => {
								if (!ln || !ln.trim()) {
									push('');
									return;
								}
								const content = ln.trimStart();
								if (idx === 0) output.push('\t\t' + content);
								else output.push('\t\t\t' + content);
							});
							push('');
						}
						chunk = [];
					};
					for (let li = 0; li < inner.length; li++) {
						const ln = inner[li];
						if (!ln.trim()) commitChunk();
						else chunk.push(ln);
					}
					commitChunk();
				}

				output.push('\t}');
			} else {
				const sigs = baseSignatures[func.name];
				if (sigs && sigs.length > 0) {
					sigs.forEach((sig, index) => {
						output.push(generateJSDoc(func, emoji, includeExamples, exampleType, '\t', index === 0));
						output.push(`\t${sig}`);
						push('');
					});
				} else {
					output.push(generateJSDoc(func, emoji, includeExamples, exampleType, '\t', true));
					output.push(`\tfunction ${func.name}(): void;`);
					push('');
				}
			}

			push('');
		}

		const missingInSection = baseDecls.filter((d) => {
			if (d._section !== sectionName) return false;
			const isNamespace = d.text.trim().startsWith('namespace');
			if (isNamespace) {
				const namespaceHeader = `namespace ${d.name}`;
				const alreadyHasNamespace = output.some((ln) => typeof ln === 'string' && ln.indexOf(namespaceHeader) !== -1);
				return !alreadyHasNamespace;
			}
			return !existingNames.has(d.name);
		});

		if (missingInSection.length > 0) {
			push('');
			for (const d of missingInSection) {
				const lines = d.text.split('\n');
				if (d.text.trim().startsWith('class') || d.text.trim().startsWith('namespace')) {
					const header = lines[0].trim();
					push('\t' + header);
					const inner = lines.slice(1, -1);
					for (const ln of inner) {
						if (!ln || !ln.trim()) push('');
						else {
							const t = ln.trim();
							if (t.startsWith('*')) push('\t\t ' + t);
							else push('\t\t' + t);
						}
					}
					push('\t}');
					push('');
					continue;
				}

				const nonEmpty = lines.filter((l) => l.trim());
				let minIndent = null;
				nonEmpty.forEach((l) => {
					const m = l.match(/^\s*/);
					if (m) {
						const len = m[0].length;
						if (minIndent === null || len < minIndent) minIndent = len;
					}
				});
				if (minIndent === null) minIndent = 0;

				for (const ln of lines) {
					if (!ln || !ln.trim()) {
						push('');
						continue;
					}
					push('\t' + ln.slice(minIndent));
				}
				push('');
			}
		}
	}

	output.push('}', '', 'export {};', '');

	for (let i = 0; i < output.length; i++) {
		const cur = output[i];
		if (!cur || !cur.trim().endsWith('{')) continue;

		let closeIndex = -1;
		for (let k = i + 1; k < output.length; k++) {
			if (output[k]) {
				const t = output[k].trim();
				if (/^}\s*[;,]?$/.test(t)) {
					closeIndex = k;
					break;
				}
			}
		}
		if (closeIndex === -1) continue;

		const openerIndent = cur.match(/^\s*/)[0];
		const targetIndent = openerIndent + '\t';

		for (let j = i + 1; j < closeIndex; j++) {
			if (!output[j]) continue;
			const lineIndent = output[j].match(/^\s*/)[0];
			if (lineIndent.length <= openerIndent.length) {
				output[j] = targetIndent + output[j].trimStart();
			}
		}
	}

	fs.writeFileSync(outputPath, output.join('\n'));
	console.log(`✅ Generated ${path.basename(outputPath)}`);
}

/**
 * Python keywords can't be used as parameter names in a stub file
 */
const PY_KEYWORDS = new Set([
	'False',
	'None',
	'True',
	'and',
	'as',
	'assert',
	'async',
	'await',
	'break',
	'class',
	'continue',
	'def',
	'del',
	'elif',
	'else',
	'except',
	'finally',
	'for',
	'from',
	'global',
	'if',
	'import',
	'in',
	'is',
	'lambda',
	'nonlocal',
	'not',
	'or',
	'pass',
	'raise',
	'return',
	'try',
	'while',
	'with',
	'yield'
]);
const pyName = (n) => (PY_KEYWORDS.has(n) ? n + '_' : n);

/**
 * Members that are intentionally left out of the Python stubs
 */
const PYI_SKIPPED_MEMBERS = { Q5: ['registerLang'] };

/**
 * Splits a string on a separator, ignoring separators nested inside
 * <>, (), [], {} or quotes. Used for unions, intersections and param lists.
 */
function splitTopLevel(str, sep) {
	const parts = [];
	let depth = 0;
	let quote = null;
	let cur = '';
	for (let i = 0; i < str.length; i++) {
		const ch = str[i];
		if (quote) {
			cur += ch;
			if (ch === quote) quote = null;
			continue;
		}
		if (ch === "'" || ch === '"') {
			quote = ch;
			cur += ch;
			continue;
		}
		if ('<([{'.includes(ch)) depth++;
		else if ('>)]}'.includes(ch) && !(ch === '>' && str[i - 1] === '=')) depth--;
		if (ch === sep && depth === 0) {
			parts.push(cur);
			cur = '';
		} else cur += ch;
	}
	parts.push(cur);
	return parts;
}

/**
 * Merges Literal['a'] | Literal['b'] into Literal['a', 'b']
 */
function mergeLiterals(parts) {
	const literals = [];
	const rest = [];
	for (const p of parts) {
		const m = p.match(/^Literal\[(.+)\]$/);
		if (m) literals.push(m[1]);
		else rest.push(p);
	}
	return literals.length ? [`Literal[${literals.join(', ')}]`, ...rest] : rest;
}

/**
 * Converts a JSDoc/TypeScript type string to a Python type annotation
 */
function jsTypeToPython(jsType) {
	if (!jsType) return 'Any';
	const t = jsType.replace(/[{}]/g, '').trim();
	const typeMap = {
		number: 'float',
		string: 'str',
		boolean: 'bool',
		bool: 'bool',
		object: 'dict',
		any: 'Any',
		'*': 'Any',
		void: 'None',
		undefined: 'None',
		null: 'None',
		float32array: 'list[float]',
		canvaslinecap: 'str',
		canvaslinejoin: 'str',
		function: 'Callable[..., Any]'
	};
	const lower = t.toLowerCase();
	if (Object.prototype.hasOwnProperty.call(typeMap, lower)) return typeMap[lower];

	if (/^(?:HTML\w*Element|Element|FontFace|AudioContext|CanvasRenderingContext2D|GPU\w+)$/.test(t)) return 'Any';

	if (t === '[]') return 'list[Any]';
	if (t.startsWith('typeof ')) return `type[${t.slice(7)}]`;
	if (/^-?\d+$/.test(t)) return `Literal[${t}]`;

	const union = splitTopLevel(t, '|')
		.map((p) => p.trim())
		.filter(Boolean);
	if (union.length > 1) return mergeLiterals([...new Set(union.map((p) => jsTypeToPython(p)))]).join(' | ');

	if (/^['"].*['"]$/.test(t)) return `Literal[${t.replace(/"/g, "'")}]`;

	const inter = splitTopLevel(t, '&').map((p) => p.trim());
	if (inter.length > 1) {
		const base = inter.find((p) => !/^Promise(?:Like)?</.test(p));
		return jsTypeToPython(base || inter[0]);
	}

	if (t.endsWith('[]')) return `list[${jsTypeToPython(t.slice(0, -2))}]`;

	const promise = t.match(/^(?:Promise|PromiseLike)<(.+)>$/);
	if (promise) return `Awaitable[${jsTypeToPython(promise[1])}]`;

	return t;
}

/**
 * Works out the Python return type of a function, and whether it should be `async`.
 */
function resolveReturnType(jsRet, funcName) {
	if (!jsRet) return { pyType: 'None', isAsync: false };
	const t = jsRet.replace(/[{}]/g, '').trim();

	const inter = splitTopLevel(t, '&').map((p) => p.trim());
	if (inter.length > 1) {
		const prom = inter.find((p) => /^PromiseLike<.+>$/.test(p));
		if (prom) return { pyType: jsTypeToPython(prom.match(/^PromiseLike<(.+)>$/)[1]), isAsync: false };
	}

	const promise = t.match(/^(?:Promise|PromiseLike)<(.+)>$/);
	if (promise) return { pyType: jsTypeToPython(promise[1]), isAsync: funcName !== 'Canvas' };

	return { pyType: jsTypeToPython(t), isAsync: false };
}

function parseJsDocParam(paramLine) {
	const opt = paramLine.match(/@param\s+\{([^}]+)\}\s+\[([\w\u00A0-\uFFFF]+)(?:=[^\]]*)?\](?:\s+(.*))?/);
	if (opt) {
		const rawType = opt[1];
		const isRest = rawType.startsWith('...');
		return {
			name: pyName(opt[2]),
			pyType: jsTypeToPython(isRest ? rawType.slice(3) : rawType),
			optional: true,
			isRest,
			description: opt[3] || ''
		};
	}
	const req = paramLine.match(/@param\s+\{([^}]+)\}\s+([\w\u00A0-\uFFFF]+)(?:\s+(.*))?/);
	if (req) {
		const rawType = req[1];
		const isRest = rawType.startsWith('...');
		return {
			name: pyName(req[2]),
			pyType: jsTypeToPython(isRest ? rawType.slice(3) : rawType),
			optional: false,
			isRest,
			description: req[3] || ''
		};
	}
	return null;
}

function parseJsDocReturn(returnLine) {
	const m = returnLine.match(/@returns?\s+\{([^}]+)\}(?:\s+(.*))?/);
	if (m) return { jsType: m[1], pyType: jsTypeToPython(m[1]), description: m[2] || '' };
	return null;
}

function stripMarkdown(str) {
	if (!str) return '';
	return str
		.replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\\([*|_{}\[\]()+.!#^-])/g, '$1')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function escapeDoc(s) {
	return s.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"');
}

function buildDocLines({ emoji, description, params = [], returns = '', example = '' }, indent) {
	const body = [];
	const desc = escapeDoc(stripMarkdown(description));
	if (desc) body.push(...desc.split('\n'));

	const fields = [];
	params
		.filter((p) => p.description)
		.forEach((p) => fields.push(`:param ${p.name}: ${escapeDoc(stripMarkdown(p.description))}`));
	if (returns) fields.push(`:returns: ${escapeDoc(stripMarkdown(returns))}`);
	if (fields.length) {
		if (body.length) body.push('');
		body.push(...fields);
	}

	if (example) {
		if (body.length) body.push('');
		body.push('Example::', '');
		example.split('\n').forEach((l) => body.push('\t' + escapeDoc(l)));
	}

	return [`${indent}"""${emoji}`, ...body.map((l) => (l ? indent + l : '')), `${indent}"""`];
}

function buildInlineDoc(emoji, text, indent) {
	const t = escapeDoc(stripMarkdown(text));
	if (!t) return [];
	if (!t.includes('\n')) return [`${indent}"""${emoji} ${t.endsWith('"') ? t.slice(0, -1) + '\\"' : t}"""`];
	return [`${indent}"""${emoji}`, ...t.split('\n').map((l) => (l ? indent + l : '')), `${indent}"""`];
}

function parseTsParamList(str) {
	return splitTopLevel(str, ',')
		.map((s) => s.trim())
		.filter(Boolean)
		.map((p) => {
			const isRest = p.startsWith('...');
			const body = isRest ? p.slice(3) : p;
			const ci = body.indexOf(':');
			let name = (ci === -1 ? body : body.slice(0, ci)).trim();
			let jsType = ci === -1 ? 'any' : body.slice(ci + 1).trim();
			const optional = name.endsWith('?');
			if (optional) name = name.slice(0, -1);
			if (isRest && jsType.endsWith('[]')) jsType = jsType.slice(0, -2);
			return { name: pyName(name), pyType: jsTypeToPython(jsType), optional, isRest, description: '' };
		});
}

function parseTsCallable(str) {
	let depth = 0;
	let end = -1;
	for (let i = 0; i < str.length; i++) {
		if (str[i] === '(') depth++;
		else if (str[i] === ')') {
			depth--;
			if (depth === 0) {
				end = i;
				break;
			}
		}
	}
	if (end === -1) return null;
	const params = parseTsParamList(str.slice(1, end));
	const rm = str
		.slice(end + 1)
		.trim()
		.match(/^:\s*(.+?)\s*;?\s*$/);
	return { params, ret: rm ? rm[1] : 'void' };
}

function parseTsFunction(line) {
	const m = line.match(/^function\s+([\w\u00A0-\uFFFF]+)\s*\(/);
	if (!m) return null;
	const callable = parseTsCallable(line.slice(m[0].length - 1));
	return callable ? { name: m[1], ...callable } : null;
}

function mergeParams(mdParams, tsParams) {
	if (!tsParams) return mdParams;
	if (mdParams.length === 0) return tsParams;

	// Merge JSDoc markdown info with TypeScript parameter types
	const merged = [];
	const len = Math.max(mdParams.length, tsParams.length);
	for (let i = 0; i < len; i++) {
		const md = mdParams[i];
		const ts = tsParams[i];
		if (md && ts) {
			// If TS signature defines a union (e.g. scale: string | number), prefer TS type
			const pyType = ts.pyType.includes('|') ? ts.pyType : md.pyType;
			merged.push({
				...md,
				pyType,
				optional: md.optional || ts.optional
			});
		} else if (md) {
			merged.push(md);
		} else if (ts) {
			merged.push(ts);
		}
	}
	return merged;
}

function normalizeParams(params) {
	let seenOptional = false;
	return params.map((p) => {
		if (p.isRest) return p;
		if (p.optional) seenOptional = true;
		else if (seenOptional) return { ...p, optional: true };
		return p;
	});
}

const pyParamStr = (p) =>
	p.isRest ? `*${p.name}: ${p.pyType}` : p.optional ? `${p.name}: ${p.pyType} = ...` : `${p.name}: ${p.pyType}`;

function mdParamsOf(entry) {
	return (entry.params || [])
		.filter((p) => p.startsWith('@param'))
		.map(parseJsDocParam)
		.filter(Boolean);
}

function resolveFunction(entry, tsSig) {
	const mdParams = mdParamsOf(entry);
	const returnLine = (entry.params || []).find((p) => p.startsWith('@return'));
	const mdReturn = returnLine ? parseJsDocReturn(returnLine) : null;
	const params = normalizeParams(mergeParams(mdParams, tsSig ? tsSig.params : []));
	const rawRet = mdReturn ? mdReturn.jsType : tsSig ? tsSig.ret : null;
	const { pyType, isAsync } = resolveReturnType(rawRet, entry.name);
	return { params, ret: pyType, isAsync, mdReturn };
}

function buildFunctionModels(func, tsSigs) {
	if (tsSigs.length > 1) {
		return tsSigs.map((sig) => {
			const { pyType, isAsync } = resolveReturnType(sig.ret, func.name);
			return { params: normalizeParams(sig.params), ret: pyType, isAsync };
		});
	}
	const { params, ret, isAsync, mdReturn } = resolveFunction(func, tsSigs[0]);
	return [{ params, ret, isAsync, mdReturn }];
}

function generatePyiFunction(func, models, emoji, { documented = true, indent = '', self = false } = {}) {
	const lines = [];
	const isOverloaded = models.length > 1;
	models.forEach((model, index) => {
		const paramStrs = [...(self ? ['self'] : []), ...model.params.map(pyParamStr)];
		const head = `${indent}${model.isAsync ? 'async ' : ''}def ${func.name}(${paramStrs.join(', ')}) -> ${model.ret}:`;
		if (isOverloaded) lines.push(`${indent}@overload`);

		if (!documented || index > 0) {
			lines.push(`${head} ...`);
			return;
		}

		lines.push(head);
		const mdParams = mdParamsOf(func);
		lines.push(
			...buildDocLines(
				{
					emoji,
					description: func.description,
					params: mdParams,
					returns: (model.mdReturn || parseJsDocReturnFrom(func))?.description,
					example: func.pythonExamples?.[0]
				},
				indent + '\t'
			)
		);
		lines.push(`${indent}\t...`);
	});
	return lines.join('\n');
}

function parseJsDocReturnFrom(entry) {
	const line = (entry.params || []).find((p) => p.startsWith('@return'));
	return line ? parseJsDocReturn(line) : null;
}

function extractTypeMembers(kind, name, content) {
	const lines = content.split('\n');
	const start = lines.findIndex((l) => new RegExp(`^\\s*(?:declare\\s+)?${kind}\\s+${name}[\\s{]`).test(l));
	if (start === -1) return [];

	const members = [];
	let depth = 0;
	let nested = null;

	for (let i = start; i < lines.length; i++) {
		const line = lines[i];
		const before = depth;
		depth += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
		if (i === start) {
			if (depth <= 0) break;
			continue;
		}
		if (depth <= 0) break;

		const t = line.trim();
		if (!t || /^(\/\/|\/\*|\*)/.test(t)) continue;

		if (before >= 2) {
			if (nested && /^new\s*\(/.test(t)) nested.ctor = parseTsCallable(t.slice(t.indexOf('(')));
			continue;
		}

		const m = t.match(/^(static\s+)?([\w\u00A0-\uFFFF]+)(\?)?\s*(\(|:)/);
		if (!m) continue;
		const isStatic = Boolean(m[1]);
		const mname = m[2];

		if (m[4] === '(') {
			const callable = parseTsCallable(t.slice(m[0].length - 1));
			if (!callable) continue;
			members.push({
				name: mname,
				kind: mname === 'constructor' ? 'constructor' : 'method',
				isStatic,
				params: callable.params,
				ret: callable.ret
			});
			continue;
		}

		const type = t.slice(m[0].length).replace(/;\s*$/, '').trim();
		const mirror = type.match(/^typeof\s+([\w\u00A0-\uFFFF]+)$/);
		if (type === '{') {
			nested = { name: mname, kind: 'nested', isStatic };
			members.push(nested);
		} else if (mirror) {
			members.push({ name: mname, kind: 'mirror', isStatic, target: mirror[1] });
		} else {
			members.push({ name: mname, kind: 'property', isStatic, jsType: type });
		}
	}

	return members;
}

function extractMembersOf(name, content) {
	const members = extractTypeMembers('class', name, content);
	return members.length ? members : extractTypeMembers('interface', name, content);
}

function extractBaseVariables(baseContent) {
	const vars = {};
	for (const line of baseContent.split('\n')) {
		const m = line.match(/^\s*(?:var|let|const)\s+([\w\u00A0-\uFFFF]+)\s*:\s*(.+?);\s*$/);
		if (m) vars[m[1]] = m[2].trim();
	}
	return vars;
}

function extractBaseGlobals(baseContent) {
	const globals = [];
	let section = null;
	for (const line of baseContent.split('\n')) {
		const sec = line.match(/^\t\/\/\s*[^\w\s]+\s+([a-z]+)\s*$/);
		if (sec) {
			section = sec[1];
			continue;
		}
		const m = line.match(/^\t(function|const|let|var|class)\s+([\w\u00A0-\uFFFF]+)/);
		if (m && section) {
			globals.push({
				section,
				name: m[2],
				kind: m[1] === 'function' ? 'function' : m[1] === 'class' ? 'class' : 'variable'
			});
		}
	}
	return globals;
}

function generatePyiClass(cls, emoji, baseMembers = [], registry = {}, nestedClasses = []) {
	const lines = [`class ${cls.name}:`];

	if (cls.description) {
		lines.push(...buildDocLines({ emoji, description: cls.description }, '\t'));
	} else {
		lines.push(`\t"""${emoji} ${cls.name}"""`);
	}

	const skipped = PYI_SKIPPED_MEMBERS[cls.name] || [];
	const emitted = new Set();
	const mdMembers = cls.members || [];

	const ctorBase = baseMembers.find((b) => b.kind === 'constructor');
	const ctorMd = mdMembers.find((m) => m.name === 'constructor');
	if (ctorBase || ctorMd) {
		const params = normalizeParams(mergeParams(ctorMd ? mdParamsOf(ctorMd) : [], ctorBase ? ctorBase.params : []));
		lines.push('', `\tdef __init__(${['self', ...params.map(pyParamStr)].join(', ')}) -> None: ...`);
	}

	const findBase = (name) =>
		baseMembers.find((b) => b.name === name && !b.isStatic && b.kind !== 'constructor') ||
		baseMembers.find((b) => b.name === name && b.kind !== 'constructor');

	const signatureOf = (base) => {
		if (!base) return null;
		if (base.kind === 'method') return base;
		if (base.kind === 'mirror' && registry[base.target]) return registry[base.target][0];
		return null;
	};

	for (const member of mdMembers) {
		if (member.name === 'constructor' || skipped.includes(member.name) || emitted.has(member.name)) continue;
		emitted.add(member.name);
		lines.push('');

		const base = findBase(member.name);
		const isStatic = Boolean(base && base.isStatic);
		const typeParam = member.params.find((p) => p.startsWith('@type'));

		if (typeParam || (base && base.kind === 'property')) {
			const jsType = typeParam ? (typeParam.match(/@type\s+\{([^}]+)\}/) || [])[1] : base.jsType;
			const pyType = jsType ? jsTypeToPython(jsType) : 'Any';
			lines.push(`\t${member.name}: ${isStatic ? `ClassVar[${pyType}]` : pyType}`);
			lines.push(...buildInlineDoc(emoji, member.description, '\t'));
			continue;
		}

		const sig = signatureOf(base);
		const { params, ret, isAsync, mdReturn } = resolveFunction(member, sig);
		if (isStatic) lines.push('\t@staticmethod');
		const paramStrs = [...(isStatic ? [] : ['self']), ...params.map(pyParamStr)];
		lines.push(`\t${isAsync ? 'async ' : ''}def ${member.name}(${paramStrs.join(', ')}) -> ${ret}:`);
		const hasFields = mdParamsOf(member).some((p) => p.description) || mdReturn?.description;
		lines.push(
			...(hasFields
				? buildDocLines(
						{
							emoji,
							description: member.description || member.name,
							params: mdParamsOf(member),
							returns: mdReturn?.description
						},
						'\t\t'
					)
				: buildInlineDoc(emoji, member.description || member.name, '\t\t'))
		);
		lines.push('\t\t...');
	}

	const undocumented = [];
	for (const b of baseMembers) {
		if (b.kind === 'constructor' || b.kind === 'nested') continue;
		if (b !== findBase(b.name)) continue;
		if (skipped.includes(b.name) || emitted.has(b.name)) continue;
		emitted.add(b.name);

		if (b.kind === 'property') {
			const pyType = jsTypeToPython(b.jsType);
			undocumented.push(`\t${b.name}: ${b.isStatic ? `ClassVar[${pyType}]` : pyType}`);
			continue;
		}

		const models =
			b.kind === 'mirror'
				? registry[b.target]
				: [
						(() => {
							const { pyType, isAsync } = resolveReturnType(b.ret, b.name);
							return { params: normalizeParams(b.params), ret: pyType, isAsync };
						})()
					];

		if (!models) {
			undocumented.push(`\tdef ${b.name}(self, *args: Any, **kwargs: Any) -> Any: ...`);
			continue;
		}
		if (b.isStatic) undocumented.push('\t@staticmethod');
		undocumented.push(
			generatePyiFunction({ name: b.name }, models, emoji, { documented: false, indent: '\t', self: !b.isStatic })
		);
	}
	if (undocumented.length) lines.push('', ...undocumented);

	if (nestedClasses.length) {
		lines.push('');
		lines.push(...nestedClasses);
	}

	return lines.join('\n');
}

function buildPyiFile(sections, baseDtsPath, outputPath, pyiSectionOrder) {
	const emojiMappings = extractEmojiMappings(baseDtsPath);
	const baseSignatures = extractBaseSignatures(baseDtsPath);
	const baseContent = fs.readFileSync(baseDtsPath, 'utf8');
	const baseVars = extractBaseVariables(baseContent);
	const baseGlobals = extractBaseGlobals(baseContent);

	const output = [
		'from __future__ import annotations',
		'from typing import Any, Awaitable, Callable, ClassVar, Literal, overload',
		''
	];

	const emitted = new Set();
	const registry = {};

	const tsSigsOf = (name) =>
		(baseSignatures[name] || [])
			.filter((l) => l.startsWith('function'))
			.map(parseTsFunction)
			.filter(Boolean);

	// Extract Image members from the Q5 nested definition in base .d.ts or interface
	const imageMembers = extractTypeMembers('interface', 'Image', baseContent);
	const nestedCtor = extractTypeMembers('class', 'Q5', baseContent).find(
		(m) => m.name === 'Image' && m.kind === 'nested'
	)?.ctor;
	if (nestedCtor) imageMembers.unshift({ name: 'constructor', kind: 'constructor', params: nestedCtor.params });

	for (const sectionName of pyiSectionOrder) {
		if (!sections[sectionName]) continue;
		const section = sections[sectionName];
		const emoji = emojiMappings[sectionName] || '';

		output.push(`# ${emoji} ${section.sectionName || sectionName}`);
		output.push('');

		if (section.sectionDescription) {
			const desc = stripMarkdown(section.sectionDescription);
			if (desc) output.push(...buildDocLines({ emoji, description: desc }, ''), '');
		}

		for (const func of section.functions) {
			if (emitted.has(func.name)) continue;
			emitted.add(func.name);

			if (func.isClass) {
				const baseMembers = extractMembersOf(func.name, baseContent);
				let nestedImageLines = [];

				if (func.name === 'Q5') {
					const imageMembers = extractTypeMembers('interface', 'Image', baseContent);
					const nestedCtor = extractTypeMembers('class', 'Q5', baseContent).find(
						(m) => m.name === 'Image' && m.kind === 'nested'
					)?.ctor;
					if (nestedCtor) imageMembers.unshift({ name: 'constructor', kind: 'constructor', params: nestedCtor.params });

					nestedImageLines = generatePyiClass(
						{ name: 'Image', description: '🌆 Image', members: [] },
						emoji,
						imageMembers,
						registry
					)
						.split('\n')
						.map((l) => '\t' + l);
				}

				output.push(generatePyiClass(func, emoji, baseMembers, registry, nestedImageLines));
			} else if (baseVars[func.name] !== undefined) {
				output.push(`${func.name}: ${jsTypeToPython(baseVars[func.name])}`);
				if (func.description || func.pythonExamples?.length > 0) {
					output.push(
						buildDocLines({ emoji, description: func.description, example: func.pythonExamples?.[0] }, '').join('\n')
					);
				}
			} else {
				const tsSigs = tsSigsOf(func.name);
				const models = buildFunctionModels(func, tsSigs);
				registry[func.name] = models;
				output.push(generatePyiFunction(func, models, emoji));
			}
			output.push('');
		}

		for (const g of baseGlobals.filter((g) => g.section === sectionName)) {
			if (emitted.has(g.name)) continue;
			emitted.add(g.name);

			if (g.kind === 'function') {
				const models = buildFunctionModels({ name: g.name, params: [] }, tsSigsOf(g.name));
				registry[g.name] = models;
				output.push(generatePyiFunction({ name: g.name }, models, emoji, { documented: false }));
			} else if (g.kind === 'class') {
				output.push(
					generatePyiClass(
						{ name: g.name, description: '', members: [] },
						emoji,
						extractMembersOf(g.name, baseContent),
						registry
					)
				);
			} else {
				output.push(`${g.name}: ${jsTypeToPython(baseVars[g.name])}`);
			}
			output.push('');
		}
	}

	const text =
		output
			.join('\n')
			.replace(/[ \t]+$/gm, '')
			.replace(/\n{3,}/g, '\n\n')
			.trimEnd() + '\n';

	fs.writeFileSync(outputPath, text);
	console.log(`✅ Generated ${path.basename(outputPath)}`);
}

function buildLang(lang) {
	lang = (lang || 'en').toLowerCase().slice(0, 2);
	const rootDir = path.join(__dirname, '..');
	const defsDir = path.join(__dirname, '..', 'defs');
	const learnDir = path.join(__dirname, '..', 'lang', lang, 'learn');
	const baseDtsPath = path.join(learnDir, `${lang}.d.ts`);

	if (!fs.existsSync(learnDir)) {
		console.error(`❌ Language directory not found: ${learnDir}`);
		return;
	}

	const sections = {};
	for (const mdFile of fs.readdirSync(learnDir).filter((f) => f.endsWith('.md'))) {
		sections[path.basename(mdFile, '.md')] = parseMarkdownFile(path.join(learnDir, mdFile));
	}

	if (!fs.existsSync(baseDtsPath)) {
		console.error(`❌ Base file ${lang}.d.ts not found!`);
		return;
	}

	console.log(`📘 Building type definitions for language: ${lang}`);
	const langSuffix = lang === 'en' ? '' : `-${lang}`;

	buildDtsFile({ ...sections }, baseDtsPath, path.join(defsDir, `q5${langSuffix}.d.ts`), true, 'webgpu');
	if (lang === 'en') fs.renameSync(path.join(defsDir, `q5.d.ts`), path.join(rootDir, `q5.d.ts`));

	buildDtsFile({ ...sections }, baseDtsPath, path.join(defsDir, `q5-c2d${langSuffix}.d.ts`), true, 'c2d');

	const pyiSectionOrder = [
		'core',
		'shapes',
		'image',
		'text',
		'input',
		'color',
		'styles',
		'transforms',
		'display',
		'math',
		'sound',
		'dom',
		'record',
		'utilities',
		'vector',
		'shaping',
		'shaders',
		'advanced'
	];
	buildPyiFile(
		sections,
		baseDtsPath,
		path.join(lang === 'en' ? rootDir : defsDir, `q5${langSuffix}.pyi`),
		pyiSectionOrder
	);
}

function main() {
	let langs = ['en', 'es'];
	const argv = process.argv.slice(2);
	for (const a of argv) {
		if (a.startsWith('--lang=')) langs = [a.split('=')[1]];
		else if (!a.startsWith('-')) langs = [a];
	}
	langs.forEach(buildLang);
}

main();
