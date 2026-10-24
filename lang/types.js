/**
 * q5/lang/types.js
 *
 * AI was used to generate this entire script.
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
 * Converts a JSDoc type string to a Python type annotation
 */
function jsTypeToPython(jsType) {
	if (!jsType) return 'Any';
	const t = jsType.replace(/[{}]/g, '').trim();
	const typeMap = {
		number: 'float | int',
		string: 'str',
		boolean: 'bool',
		bool: 'bool',
		object: 'dict',
		any: 'Any',
		'*': 'Any',
		void: 'None',
		float32array: 'list[float]',
		canvaslinecap: 'str',
		canvaslinejoin: 'str',
		canvasrenderingcontext2d: 'Any',
		audiocontext: 'Any',
		element: 'Any',
		gpushadermodule: 'Any',
		function: 'Callable[..., Any]'
	};
	const lower = t.toLowerCase();
	if (typeMap[lower]) return typeMap[lower];
	if (t.startsWith('typeof ')) return `type[${t.slice(7)}]`;
	if (/^\d+$/.test(t)) return `Literal[${t}]`;
	if (t.includes('|')) {
		return t
			.split('|')
			.map((p) => jsTypeToPython(p.trim()))
			.join(' | ');
	}
	if (/^['"].*['"]$/.test(t)) return `Literal[${t.replace(/"/g, "'")}]`;
	if (t.includes('&')) {
		const parts = t.split('&').map((p) => p.trim());
		const base = parts.find((p) => !p.includes('Promise') && !p.includes('PromiseLike'));
		return base ? jsTypeToPython(base) : 'object';
	}
	if (t.endsWith('[]')) return `list[${jsTypeToPython(t.slice(0, -2))}]`;
	if (t.startsWith('Q5.')) return t.slice(3);
	if (/Promise|PromiseLike|HTMLCanvasElement|FontFace|HTMLVideoElement|HTMLElement|HTMLAudioElement/.test(t))
		return 'object';
	return t;
}

function parseJsDocParam(paramLine) {
	const opt = paramLine.match(/@param\s+\{([^}]+)\}\s+\[([\w\u00A0-\uFFFF]+)\](?:\s+(.*))?/);
	if (opt) {
		const rawType = opt[1];
		const isRest = rawType.startsWith('...');
		return {
			name: opt[2],
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
			name: req[2],
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
	if (m) return { pyType: jsTypeToPython(m[1]), description: m[2] || '' };
	return null;
}

function stripMarkdown(str) {
	if (!str) return '';
	return str
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\\([*|_{}\[\]()+.!#^-])/g, '$1');
}

function tsSigToPython(tsSig) {
	const match = tsSig.match(/^function\s+([\w\u00A0-\uFFFF]+)\s*\(([^)]*)\)\s*:\s*(.+);$/);
	if (!match) return null;
	const name = match[1];
	const paramsStr = match[2].trim();
	const retType = jsTypeToPython(match[3].trim());

	if (!paramsStr) return `def ${name}() -> ${retType}: ...`;

	const paramParts = paramsStr
		.split(',')
		.map((p) => p.trim())
		.filter(Boolean);
	const paramStrs = paramParts.map((part) => {
		const isRest = part.startsWith('...');
		const cleanPart = isRest ? part.slice(3) : part;
		const colonIdx = cleanPart.indexOf(':');
		if (colonIdx === -1) return cleanPart;

		let pName = cleanPart.slice(0, colonIdx).trim();
		let pTypeStr = cleanPart.slice(colonIdx + 1).trim();

		const isOptional = pName.endsWith('?');
		if (isOptional) pName = pName.slice(0, -1);

		const pyType = jsTypeToPython(pTypeStr);
		if (isRest) return `*${pName}: ${pyType}`;
		if (isOptional) return `${pName}: ${pyType} = ...`;
		return `${pName}: ${pyType}`;
	});

	return `def ${name}(${paramStrs.join(', ')}) -> ${retType}: ...`;
}

function generatePyiOverloads(func, sigs, emoji, indent = '') {
	const lines = [];
	const parsedParams = func.params
		.filter((p) => p.startsWith('@param'))
		.map(parseJsDocParam)
		.filter(Boolean);
	const returnParam = func.params.find((p) => p.startsWith('@return'));
	const parsedReturn = returnParam ? parseJsDocReturn(returnParam) : null;

	sigs.forEach((sig, index) => {
		const isFirst = index === 0;
		const pySig = tsSigToPython(sig);
		if (!pySig) return;

		lines.push(`${indent}@overload`);
		if (isFirst) {
			lines.push(`${indent}${pySig.replace(/\.\.\.$/, '')}`);
			const docLines = [`${indent}\t"""${emoji}`];
			if (func.description)
				stripMarkdown(func.description)
					.split('\n')
					.forEach((l) => docLines.push(`${indent}\t${l}`));
			if (parsedParams.length > 0) {
				docLines.push(`${indent}\t`);
				parsedParams.forEach((p) => docLines.push(`${indent}\t:param ${p.name}: ${stripMarkdown(p.description)}`));
			}
			if (parsedReturn?.description) docLines.push(`${indent}\t:returns: ${stripMarkdown(parsedReturn.description)}`);
			if (func.pythonExamples?.[0]) {
				docLines.push(`${indent}\t`, `${indent}\tExample::`, `${indent}\t`);
				func.pythonExamples[0].split('\n').forEach((l) => docLines.push(`${indent}\t\t${l}`));
			}
			docLines.push(`${indent}\t"""`, `${indent}\t...`);
			lines.push(...docLines);
		} else {
			lines.push(`${indent}${pySig}`);
		}
	});
	return lines.join('\n');
}

function generatePyiEntry(func, emoji, indent = '') {
	const parsedParams = func.params
		.filter((p) => p.startsWith('@param'))
		.map(parseJsDocParam)
		.filter(Boolean);
	const returnParam = func.params.find((p) => p.startsWith('@return'));
	const parsedReturn = returnParam ? parseJsDocReturn(returnParam) : null;
	const isAsync =
		/^Promise</.test(returnParam?.match(/@returns?\s+\{([^}]+)\}/)?.[1]?.trim() || '') && func.name !== 'Canvas';

	const paramStrs = parsedParams.map((p) =>
		p.isRest ? `*${p.name}: ${p.pyType}` : p.optional ? `${p.name}: ${p.pyType} = ...` : `${p.name}: ${p.pyType}`
	);
	const retType = parsedReturn ? parsedReturn.pyType : 'None';

	const lines = [`${indent}${isAsync ? 'async ' : ''}def ${func.name}(${paramStrs.join(', ')}) -> ${retType}:`];
	const docLines = [`${indent}\t"""${emoji}`];
	if (func.description)
		stripMarkdown(func.description)
			.split('\n')
			.forEach((l) => docLines.push(`${indent}\t${l}`));
	if (parsedParams.length > 0) {
		docLines.push(`${indent}\t`);
		parsedParams.forEach((p) => docLines.push(`${indent}\t:param ${p.name}: ${stripMarkdown(p.description)}`));
	}
	if (parsedReturn?.description) docLines.push(`${indent}\t:returns: ${stripMarkdown(parsedReturn.description)}`);
	if (func.pythonExamples?.[0]) {
		docLines.push(`${indent}\t`, `${indent}\tExample::`, `${indent}\t`);
		func.pythonExamples[0].split('\n').forEach((l) => docLines.push(`${indent}\t\t${l}`));
	}
	docLines.push(`${indent}\t"""`, `${indent}\t...`);
	lines.push(...docLines);
	return lines.join('\n');
}

function extractClassMemberSignatures(className, baseContent) {
	const lines = baseContent.split('\n');
	const sigs = {};

	let classStart = -1;
	for (let i = 0; i < lines.length; i++) {
		if (new RegExp(`^\\s*class\\s+${className}[\\s{]`).test(lines[i])) {
			classStart = i;
			break;
		}
	}
	if (classStart === -1) return sigs;

	let braceCount = 0;
	for (let i = classStart; i < lines.length; i++) {
		const line = lines[i];
		braceCount += (line.match(/{/g) || []).length;
		braceCount -= (line.match(/}/g) || []).length;
		if (i === classStart) continue;
		if (braceCount <= 0) break;

		const t = line.trim();
		if (!t || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) continue;

		const bare = t.replace(/^static\s+/, '');
		if (bare.startsWith('constructor')) continue;

		const methodMatch = bare.match(/^([\w\u00A0-\uFFFF]+)\s*\([^)]*\)\s*:\s*(.+?)\s*;?\s*$/);
		if (methodMatch) {
			sigs[methodMatch[1]] = { isProperty: false, jsReturnType: methodMatch[2].trim() };
			continue;
		}

		const propMatch = bare.match(/^([\w\u00A0-\uFFFF]+)\s*:\s*(.+?)\s*;?\s*$/);
		if (propMatch) {
			sigs[propMatch[1]] = { isProperty: true, jsType: propMatch[2].trim() };
		}
	}

	return sigs;
}

function generatePyiClass(cls, emoji, classMemberSigs = {}) {
	const lines = [`class ${cls.name}:`];

	if (cls.description) {
		lines.push(`\t"""${emoji}`);
		stripMarkdown(cls.description)
			.split('\n')
			.forEach((l) => lines.push(`\t${l}`));
		lines.push('\t"""');
	} else {
		lines.push(`\t"""${emoji} ${cls.name}"""`);
	}

	if (cls.members && cls.members.length > 0) {
		for (const member of cls.members) {
			lines.push('');
			if (member.name === 'constructor') continue;
			if (cls.name === 'Q5' && ['addLang', 'registerLang'].includes(member.name)) continue;

			const typeParam = member.params.find((p) => p.startsWith('@type'));
			if (typeParam) {
				const tm = typeParam.match(/@type\s+\{([^}]+)\}/);
				const pyType = tm ? jsTypeToPython(tm[1]) : 'Any';
				lines.push(`\t${member.name}: ${pyType}`);
				if (member.description) lines.push(`\t"""${emoji} ${stripMarkdown(member.description)}"""`);
				continue;
			}

			const sig = classMemberSigs[member.name];
			if (sig && sig.isProperty) {
				const pyType = jsTypeToPython(sig.jsType);
				lines.push(`\t${member.name}: ${pyType}`);
				if (member.description) lines.push(`\t"""${emoji} ${stripMarkdown(member.description)}"""`);
				continue;
			}

			const parsedParams = member.params
				.filter((p) => p.startsWith('@param'))
				.map(parseJsDocParam)
				.filter(Boolean);
			const returnParam = member.params.find((p) => p.startsWith('@return'));
			const parsedReturn = returnParam ? parseJsDocReturn(returnParam) : null;
			const paramStrs = parsedParams.map((p) =>
				p.optional ? `${p.name}: ${p.pyType} = ...` : `${p.name}: ${p.pyType}`
			);
			let retType = parsedReturn
				? parsedReturn.pyType
				: sig && sig.jsReturnType
					? jsTypeToPython(sig.jsReturnType)
					: 'None';

			lines.push(`\tdef ${member.name}(self${paramStrs.length ? ', ' + paramStrs.join(', ') : ''}) -> ${retType}:`);
			lines.push(`\t\t"""${emoji} ${stripMarkdown(member.description || member.name)}"""`);
			lines.push('\t\t...');
		}
	}

	return lines.join('\n');
}

function buildPyiFile(sections, baseDtsPath, outputPath, pyiSectionOrder) {
	const emojiMappings = extractEmojiMappings(baseDtsPath);
	const baseSignatures = extractBaseSignatures(baseDtsPath);
	const baseContent = fs.readFileSync(baseDtsPath, 'utf8');
	const baseLines = baseContent.split('\n');

	const output = [
		'from __future__ import annotations',
		'from typing import Any, Callable, Literal, overload',
		'',
		'class Image: ...',
		''
	];

	for (const sectionName of pyiSectionOrder) {
		if (!sections[sectionName]) continue;
		const section = sections[sectionName];
		const emoji = emojiMappings[sectionName] || '';

		output.push(`# ${emoji} ${section.sectionName || sectionName}`);
		output.push('');

		if (section.sectionDescription) {
			output.push(`"""${emoji}`);
			stripMarkdown(section.sectionDescription)
				.split('\n')
				.forEach((l) => output.push(l));
			output.push('"""', '');
		}

		for (const func of section.functions) {
			if (func.isClass) {
				const classMemberSigs = extractClassMemberSignatures(func.name, baseContent);
				output.push(generatePyiClass(func, emoji, classMemberSigs));
			} else {
				const baseLine = baseLines.find((l) => l.includes(`const ${func.name}:`) || l.includes(`let ${func.name}:`));
				if (baseLine) {
					const tsType = (baseLine.match(/\b(?:const|let)\s+[\w\u00A0-\uFFFF]+:\s*(.+?);/) || [])[1]?.trim();
					output.push(`${func.name}: ${jsTypeToPython(tsType)}`);
					if (func.description || func.pythonExamples?.length > 0) {
						output.push(`"""${emoji}`);
						if (func.description)
							stripMarkdown(func.description)
								.split('\n')
								.forEach((l) => output.push(l));
						if (func.pythonExamples?.[0]) {
							output.push('', 'Example::', '');
							func.pythonExamples[0].split('\n').forEach((l) => output.push(`\t${l}`));
						}
						output.push('"""');
					}
				} else {
					const sigs = baseSignatures[func.name];
					if (sigs && sigs.length > 1) {
						output.push(generatePyiOverloads(func, sigs, emoji));
					} else {
						output.push(generatePyiEntry(func, emoji));
					}
				}
			}
			output.push('');
		}
	}

	fs.writeFileSync(outputPath, output.join('\n'));
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
