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
				if (paramLine.startsWith('@param') || paramLine.startsWith('@return')) {
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
		const match = line.match(/^\s*\/\/\s+([^\w\s]+)\s+([\w\u00A0-\uFFFFu00A0-\uFFFF]+)\s*$/);
		if (match) {
			const emoji = match[1].replace(/\uFE0F/g, '');
			const section = match[2];
			mappings[section] = emoji;
		}
	}

	return mappings;
}

/**
 * Reads the base en.d.ts to extract function signatures and type information
 */
function extractBaseSignatures(baseDtsPath) {
	const content = fs.readFileSync(baseDtsPath, 'utf8');
	const lines = content.split('\n');
	const signatures = {};

	let i = 0;
	while (i < lines.length) {
		const line = lines[i];

		// Look for function declarations
		const funcMatch = line.match(/^\s*function\s+([\w\u00A0-\uFFFF]+)\s*\([^)]*\)/);
		const varMatch = line.match(/^\s*(?:var|let|const)\s+([\w\u00A0-\uFFFF]+)\s*:/);
		const classMatch = line.match(/^\s*class\s+([\w\u00A0-\uFFFF]+)/);

		if (funcMatch || varMatch || classMatch) {
			const name = (funcMatch || varMatch || classMatch)[1];
			signatures[name] = line.trim();
		}

		i++;
	}

	return signatures;
}

/**
 * Generates JSDoc comment from function data
 */
function generateJSDoc(func, emoji, includeExamples = true, exampleType = 'c2d', indent = '\t') {
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
			lines.push(`${indent} * ${param}`);
		});
	}

	if (includeExamples) {
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
 * Generates TypeScript declaration from base signature
 */
function generateDeclaration(funcName, baseSignatures) {
	if (baseSignatures[funcName]) {
		return `\t${baseSignatures[funcName]}`;
	}

	// Fallback if signature not found
	return `\tfunction ${funcName}(): void;`;
}

/**
 * Builds a complete .d.ts file
 */
function buildDtsFile(sections, baseDtsPath, outputPath, includeExamples = true, exampleType = 'c2d') {
	const emojiMappings = extractEmojiMappings(baseDtsPath);
	const baseSignatures = extractBaseSignatures(baseDtsPath);

	// Read the entire base file and extract top-level declarations (inside `declare global { ... }`).
	const baseContent = fs.readFileSync(baseDtsPath, 'utf8');
	const globalMatch = baseContent.match(/declare global\s*{([\s\S]*?)}\s*export\s*{\s*}/m);
	let baseGlobalBlock = '';
	if (globalMatch) baseGlobalBlock = globalMatch[1];

	// Parse top-level declarations from the base global block. We keep class/namespace blocks and single-line
	// declarations for functions/vars/constants. This ensures we copy any signatures that don't exist in
	// the parsed markdown-derived sections.
	const baseDecls = [];
	if (baseGlobalBlock) {
		const blines = baseGlobalBlock.split('\n');
		for (let i = 0; i < blines.length; i++) {
			let line = blines[i];
			if (!line || !line.trim()) continue;
			const t = line.trim();

			// skip top-level comments
			if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) continue;

			// class or namespace blocks (multi-line)
			let classMatch = t.match(/^class\s+(\w+)\s*\{/);
			let nsMatch = t.match(/^namespace\s+(\w+)\s*\{/);
			if (classMatch || nsMatch) {
				const name = (classMatch || nsMatch)[1];
				let block = [t];
				// count braces to find end of block
				let braceCount = (t.match(/{/g) || []).length - (t.match(/}/g) || []).length;
				while (braceCount > 0 && ++i < blines.length) {
					const ln = blines[i];
					block.push(ln);
					braceCount += (ln.match(/{/g) || []).length - (ln.match(/}/g) || []).length;
				}
				baseDecls.push({ name, text: block.join('\n') });
				continue;
			}

			// single-line declarations: function / var/let/const
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

	// Exclude certain sections for specific output types
	if (exampleType === 'c2d') {
		// Shaders are WebGPU-only; exclude from Canvas2D type definitions
		if (sections['shaders']) delete sections['shaders'];
	}

	// Build the output content
	const output = [];
	// helper to append a line while avoiding duplicate blank lines
	const push = (ln) => {
		if (ln === '') {
			if (output.length === 0 || output[output.length - 1] !== '') output.push('');
		} else {
			output.push(ln);
		}
	};
	push('declare global {');

	// Determine which names are already included via markdown-derived sections
	const existingNames = new Set();
	for (const s of Object.values(sections)) {
		for (const f of s.functions) {
			existingNames.add(f.name);
			if (f.isClass && f.members) {
				for (const m of f.members) existingNames.add(`${f.name}.${m.name}`);
			}
		}
	}

	// Partition the baseGlobalBlock into blocks by section comment so we can
	// place missing declarations into their correct section instead of dumping
	// them at the top of the file.
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

		// annotate each baseDecl with which section it belongs to (best-effort)
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

	// Sort sections to match the order in base file
	const sectionOrder = Object.keys(emojiMappings).map((section) => section);

	for (const sectionName of sectionOrder) {
		if (!sections[sectionName]) continue;

		const section = sections[sectionName];
		const emoji = emojiMappings[sectionName];

		const displaySectionName = section.sectionName || sectionName;

		push('');
		output.push(`\t// ${emoji} ${displaySectionName}`);

		// Add section description if available (as block comment)
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

		// Add functions and classes
		for (const func of section.functions) {
			if (func.isClass) {
				// Class declaration has no JSDoc - only members have comments
				output.push(`\tclass ${func.name} {`);

				// Add class members
				if (func.members && func.members.length > 0) {
					for (const member of func.members) {
						output.push('');
						output.push(generateJSDoc(member, emoji, includeExamples, exampleType, '\t\t'));

						// Try to find signature in base file
						const memberKey = `${func.name}.${member.name}`;
						let memberSig = baseSignatures[memberKey];

						// If we don't have an exact member signature in baseSignatures,
						// look inside any class declaration block we parsed from the base .d.ts
						// (this can contain static property declarations like "static MAX_TRANSFORMS: number;")
						if (!memberSig) {
							const baseClassDecl = baseDecls.find((d) => d.name === func.name && d.text.trim().startsWith('class'));
							if (baseClassDecl) {
								const re = new RegExp(`(^|\\n)\\s*(?:static\\s+)?(?:${member.name})\\b[^\\n]*`, 'i');
								const m = baseClassDecl.text.match(re);
								if (m) memberSig = m[0].trim();
							}
						}

						if (memberSig) {
							// Ensure the signature line ends with a semicolon
							const sigLine = memberSig.trim().replace(/;?\s*$/, ';');
							output.push(`\t\t${sigLine}`);
						} else {
							// Generate based on member type
							if (member.name === 'constructor') {
								output.push(`\t\tconstructor();`);
							} else {
								output.push(`\t\t${member.name}(): void;`);
							}
						}
					}
				}

				// Merge in any class members found only in the base .d.ts (preserve their JSDoc)
				const baseClassDecl = baseDecls.find((d) => d.name === func.name && d.text.startsWith('class'));
				if (baseClassDecl) {
					const existingMemberNames = new Set((func.members || []).map((m) => m.name));
					const inner = baseClassDecl.text.split('\n').slice(1, -1); // inside class
					let chunk = [];
					const commitChunk = () => {
						if (chunk.length === 0) return;
						// find signature line (first non-comment line)
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
							// compute minimal indent for chunk lines to preserve relative formatting
							const nonEmpty = chunk.filter((l) => l.trim());
							let minIndent = null;
							nonEmpty.forEach((l) => {
								const mm = l.match(/^\s*/);
								if (mm) {
									const len = mm[0].length;
									if (minIndent === null || len < minIndent) minIndent = len;
								}
							});
							if (minIndent === null) minIndent = 0;

							chunk.forEach((ln, idx) => {
								if (!ln || !ln.trim()) {
									push('');
									return;
								}
								const content = ln.trimStart();
								if (idx === 0) {
									output.push('\t\t' + content);
								} else {
									// inner lines should be indented one level deeper than the header
									output.push('\t\t\t' + content);
								}
							});
							push('');
						}
						chunk = [];
					};
					for (let li = 0; li < inner.length; li++) {
						const ln = inner[li];
						if (!ln.trim()) {
							commitChunk();
						} else {
							chunk.push(ln);
						}
					}
					commitChunk();
				}

				output.push('\t}');
			} else {
				// Regular function or variable
				output.push(generateJSDoc(func, emoji, includeExamples, exampleType));
				output.push(generateDeclaration(func.name, baseSignatures));
			}

			push('');
		}

		// append any missing declarations from the base .d.ts that belong to this section
		// Note: baseDecls may include `namespace Foo` blocks even when a `class Foo` exists
		// in the markdown-derived sections. We should include namespace blocks if they are
		// not already present in the output. existingNames only tracks names, so a class
		// with the same name would previously prevent adding the namespace. Fix that by
		// allowing namespace blocks through when the actual `namespace <name>` text is
		// still missing from the generated output.
		const missingInSection = baseDecls.filter((d) => {
			if (d._section !== sectionName) return false;

			// If this base declaration is a namespace, include it if the output does
			// not already contain the namespace declaration for this name.
			const isNamespace = d.text.trim().startsWith('namespace');
			if (isNamespace) {
				const namespaceHeader = `namespace ${d.name}`;
				const alreadyHasNamespace = output.some((ln) => typeof ln === 'string' && ln.indexOf(namespaceHeader) !== -1);
				return !alreadyHasNamespace;
			}

			// otherwise, include only when it is actually missing by name
			return !existingNames.has(d.name);
		});
		if (missingInSection.length > 0) {
			// ensure single blank line before additions
			push('');

			for (const d of missingInSection) {
				const lines = d.text.split('\n');

				// If this is a class/namespace, render with our consistent formatting
				if (d.text.trim().startsWith('class') || d.text.trim().startsWith('namespace')) {
					const header = lines[0].trim();
					// write header with one tab
					push('\t' + header);
					// inner lines
					const inner = lines.slice(1, -1);
					for (const ln of inner) {
						if (!ln || !ln.trim()) {
							push('');
						} else {
							const t = ln.trim();
							if (t.startsWith('*')) push('\t\t ' + t);
							else push('\t\t' + t);
						}
					}
					// closing brace
					push('\t}');
					push('');
					continue;
				}

				// Normal non-class block: normalize indentation
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
					const normalized = ln.slice(minIndent);
					push('\t' + normalized);
				}
				push('');
			}
		}
	}

	output.push('}');
	output.push('');
	output.push('export {};');
	output.push('');

	// Normalize indentation for blocks: for every opening-brace line, ensure
	// all lines up to the corresponding immediate closing brace are indented
	// at least one level deeper than the opener.
	for (let i = 0; i < output.length; i++) {
		const cur = output[i];
		if (!cur) continue;
		if (!cur.trim().endsWith('{')) continue;

		// find matching immediate closing brace (first '}' after this opener)
		let closeIndex = -1;
		for (let k = i + 1; k < output.length; k++) {
			if (output[k]) {
				const t = output[k].trim();
				// match a closing brace line: '}' or '};' or '},' etc.
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
		number: 'float',
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
	// typeof X -> type[X]
	if (t.startsWith('typeof ')) return `type[${t.slice(7)}]`;
	// Numeric literal types like 1, 2, 3
	if (/^\d+$/.test(t)) return `Literal[${t}]`;
	// Union types T | U — must check before string literal to avoid greedily matching 'a' | 'b'
	if (t.includes('|')) {
		return t
			.split('|')
			.map((p) => jsTypeToPython(p.trim()))
			.join(' | ');
	}
	// String literal types like 'corner', 'center'
	if (/^['"].*['"]$/.test(t)) return `Literal[${t.replace(/"/g, "'")}]`;
	// Intersection types T & U — take first non-Promise part
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

/**
 * Parses a JSDoc @param line into { name, pyType, optional, description }
 */
function parseJsDocParam(paramLine) {
	const opt = paramLine.match(/@param\s+\{([^}]+)\}\s+\[(\w+)\](?:\s+(.*))?/);
	if (opt) {
		const rawType = opt[1];
		const isRest = rawType.startsWith('...');
		const jsType = isRest ? rawType.slice(3) : rawType;
		return { name: opt[2], pyType: jsTypeToPython(jsType), optional: true, isRest, description: opt[3] || '' };
	}
	const req = paramLine.match(/@param\s+\{([^}]+)\}\s+(\w+)(?:\s+(.*))?/);
	if (req) {
		const rawType = req[1];
		const isRest = rawType.startsWith('...');
		const jsType = isRest ? rawType.slice(3) : rawType;
		return { name: req[2], pyType: jsTypeToPython(jsType), optional: false, isRest, description: req[3] || '' };
	}
	return null;
}

/**
 * Parses a JSDoc @returns line into { pyType, description }
 */
function parseJsDocReturn(returnLine) {
	const m = returnLine.match(/@returns?\s+\{([^}]+)\}(?:\s+(.*))?/);
	if (m) return { pyType: jsTypeToPython(m[1]), description: m[2] || '' };
	return null;
}

/**
 * Strips markdown links [text](url) -> text and inline code `x` -> x from a string
 */
function stripMarkdown(str) {
	return str
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\\([*|_{}\[\]()+.!#^-])/g, '$1'); // un-escape markdown escape sequences
}

/**
 * Generates a Python .pyi stub entry for a function or variable
 */
function generatePyiEntry(func, emoji, indent = '') {
	const lines = [];

	// Parse params and return
	const parsedParams = func.params
		.filter((p) => p.startsWith('@param'))
		.map(parseJsDocParam)
		.filter(Boolean);
	const returnParam = func.params.find((p) => p.startsWith('@return'));
	const parsedReturn = returnParam ? parseJsDocReturn(returnParam) : null;

	// Determine if async (returns a true Promise, not just PromiseLike)
	// Canvas/createCanvas are treated as sync in Python because q5-python.js handles async loading.
	const rawReturn = returnParam ? (returnParam.match(/@returns?\s+\{([^}]+)\}/) || [])[1] || '' : '';
	const isAsync = /^Promise</.test(rawReturn.trim()) && func.name !== 'Canvas' && func.name !== 'createCanvas';

	// Build Python signature
	const paramStrs = parsedParams.map((p) => {
		if (p.isRest) return `*${p.name}: ${p.pyType}`;
		return p.optional ? `${p.name}: ${p.pyType} = ...` : `${p.name}: ${p.pyType}`;
	});

	let retType = 'None';
	if (parsedReturn) {
		retType = parsedReturn.pyType;
	}

	const asyncPrefix = isAsync ? 'async ' : '';
	const sigLine = `${indent}${asyncPrefix}def ${func.name}(${paramStrs.join(', ')}) -> ${retType}:`;
	lines.push(sigLine);

	// Build docstring
	const docLines = [];
	docLines.push(`${indent}\t"""${emoji}`);

	if (func.description) {
		const cleaned = stripMarkdown(func.description);
		cleaned.split('\n').forEach((l) => docLines.push(`${indent}\t${l}`));
	}

	if (parsedParams.length > 0) {
		docLines.push(`${indent}\t`);
		parsedParams.forEach((p) => {
			const desc = stripMarkdown(p.description);
			docLines.push(`${indent}\t:param ${p.name}: ${desc}`);
		});
	}

	if (parsedReturn && parsedReturn.description) {
		docLines.push(`${indent}\t:returns: ${stripMarkdown(parsedReturn.description)}`);
	}

	if (func.pythonExamples && func.pythonExamples.length > 0) {
		docLines.push(`${indent}\t`);
		docLines.push(`${indent}\tExample::`);
		docLines.push(`${indent}\t`);
		func.pythonExamples[0].split('\n').forEach((l) => docLines.push(`${indent}\t\t${l}`));
	}

	docLines.push(`${indent}\t"""`);
	docLines.push(`${indent}\t...`);
	lines.push(...docLines);

	return lines.join('\n');
}

/**
 * Generates a Python .pyi stub entry for a class
 */
function generatePyiClass(cls, emoji) {
	const lines = [];
	lines.push(`class ${cls.name}:`);

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
			if (member.name === 'constructor') continue; // skip JS constructors
			const parsedParams = member.params
				.filter((p) => p.startsWith('@param'))
				.map(parseJsDocParam)
				.filter(Boolean);
			const returnParam = member.params.find((p) => p.startsWith('@return'));
			const parsedReturn = returnParam ? parseJsDocReturn(returnParam) : null;
			const paramStrs = parsedParams.map((p) =>
				p.optional ? `${p.name}: ${p.pyType} = ...` : `${p.name}: ${p.pyType}`
			);
			const retType = parsedReturn ? parsedReturn.pyType : 'None';
			lines.push(`\tdef ${member.name}(self${paramStrs.length ? ', ' + paramStrs.join(', ') : ''}) -> ${retType}:`);
			lines.push(`\t\t"""${emoji} ${stripMarkdown(member.description || member.name)}"""`);
			lines.push('\t\t...');
		}
	}

	return lines.join('\n');
}

/**
 * Builds a Python .pyi stub file from parsed markdown sections
 */
function buildPyiFile(sections, baseDtsPath, outputPath, pyiSectionOrder) {
	const emojiMappings = extractEmojiMappings(baseDtsPath);
	const baseContent = fs.readFileSync(baseDtsPath, 'utf8');

	const output = [];

	output.push('from typing import Any, Callable, Literal');
	output.push('');
	output.push('class Image: ...');
	output.push('');

	const baseLines = baseContent.split('\n');

	for (const sectionName of pyiSectionOrder) {
		if (!sections[sectionName]) continue;
		const section = sections[sectionName];
		const emoji = emojiMappings[sectionName] || '';

		output.push(`# ${emoji} ${section.sectionName || sectionName}`);
		output.push('');

		// Section description as a module-level docstring block
		if (section.sectionDescription) {
			const cleaned = stripMarkdown(section.sectionDescription);
			const descLines = cleaned.split('\n');
			output.push(`"""${emoji}`);
			descLines.forEach((l) => output.push(l));
			output.push('"""');
			output.push('');
		}

		for (const func of section.functions) {
			if (func.isClass) {
				output.push(generatePyiClass(func, emoji));
			} else {
				// Look up the base TypeScript declaration for type hints on constants/vars
				const baseLine = baseLines.find((l) => l.includes(`const ${func.name}:`) || l.includes(`let ${func.name}:`));

				if (baseLine) {
					// It's a typed variable or constant — generate annotation + docstring
					const constMatch = baseLine.match(/\bconst\s+\w+:\s*(.+?);/);
					const letMatch = baseLine.match(/\blet\s+\w+:\s*(.+?);/);
					const tsType = (constMatch || letMatch)?.[1]?.trim();
					const pyType = tsType ? jsTypeToPython(tsType) : 'Any';
					output.push(`${func.name}: ${pyType}`);
					if (func.description || (func.pythonExamples && func.pythonExamples.length > 0)) {
						output.push(`"""${emoji}`);
						if (func.description) {
							const cleaned = stripMarkdown(func.description);
							cleaned.split('\n').forEach((l) => output.push(l));
						}
						if (func.pythonExamples && func.pythonExamples.length > 0) {
							output.push('');
							output.push('Example::');
							output.push('');
							func.pythonExamples[0].split('\n').forEach((l) => output.push(`\t${l}`));
						}
						output.push('"""');
					}
				} else {
					// It's a function
					output.push(generatePyiEntry(func, emoji));
				}
			}
			output.push('');
		}
	}

	fs.writeFileSync(outputPath, output.join('\n'));
	console.log(`✅ Generated ${path.basename(outputPath)}`);
}

function buildLang(lang) {
	// sanitize to two-letter lowercase code
	lang = (lang || 'en').toLowerCase().slice(0, 2);

	const rootDir = path.join(__dirname, '..');
	const defsDir = path.join(__dirname, '..', 'defs');
	const learnDir = path.join(__dirname, '..', 'lang', lang, 'learn');
	const baseDtsPath = path.join(learnDir, `${lang}.d.ts`);

	if (!fs.existsSync(learnDir)) {
		console.error(`❌ Language directory not found: ${learnDir}`);
		return;
	}

	// Find all markdown files and parse them once
	const files = fs.readdirSync(learnDir);
	let markdownFiles = files.filter((f) => f.endsWith('.md')).map((f) => path.join(learnDir, f));

	// Parse each markdown file once and build a sections map
	const sections = {};
	for (const mdFile of markdownFiles) {
		const parsed = parseMarkdownFile(mdFile);
		const key = path.basename(mdFile, '.md');
		sections[key] = parsed;
	}

	if (!fs.existsSync(baseDtsPath)) {
		console.error(`❌ Base file ${lang}.d.ts not found!`);
		return;
	}

	console.log(`📘 Building type definitions for language: ${lang}`);

	let langSuffix = lang == 'en' ? '' : `-${lang}`;

	// Build q5.d.ts with WebGPU examples
	// let dir = lang == 'en' ? rootDir : defsDir;
	let dir = defsDir;
	let file = path.join(dir, `q5${langSuffix}.d.ts`);
	buildDtsFile({ ...sections }, baseDtsPath, file, true, 'webgpu');

	// copy webgpu d.ts to root
	if (lang === 'en') {
		const destFile = path.join(rootDir, `q5.d.ts`);
		fs.copyFileSync(file, destFile);
	}

	// Build q5-c2d.d.ts with C2D examples
	file = path.join(defsDir, `q5-c2d${langSuffix}.d.ts`);
	buildDtsFile({ ...sections }, baseDtsPath, file, true, 'c2d');

	// Build q5.pyi Python stub (all sections)
	if (lang === 'en') {
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
		const pyiPath = path.join(rootDir, 'q5.pyi');
		buildPyiFile(sections, baseDtsPath, pyiPath, pyiSectionOrder);
	}
}

/**
 * Main function
 */
function main() {
	// support a language code argument (two-letter), default to 'en' & 'es'
	// usage: node types.js [lang] or node types.js --lang=fr
	const argv = process.argv.slice(2);
	let langs = ['en', 'es'];

	for (const a of argv) {
		if (a === '-h' || a === '--help') {
			console.log('Usage: types.js [lang]  OR  types.js --lang=<two-letter-code>\nDefault: en, es');
			process.exit(0);
		}
		if (a.startsWith('--lang=')) {
			langs = [a.split('=')[1]];
		} else if (!a.startsWith('-')) {
			// positional arg: language code
			langs = [a];
		}
	}

	for (const lang of langs) {
		buildLang(lang);
	}
}

if (require.main === module) {
	main();
}

module.exports = { parseMarkdownFile, buildDtsFile };
