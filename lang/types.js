#!/usr/bin/env node

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
					params: [],
					webgpuExamples: [],
					c2dExamples: [],
					isClassMember: true,
					parentClass: className
				};
			} else {
				const isClass = classNames.has(fullName);
				currentEntry = {
					name: fullName,
					fullName: fullName,
					description: '',
					params: [],
					webgpuExamples: [],
					c2dExamples: [],
					isClass: isClass,
					members: []
				};
			}

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
		const match = line.match(/^\s*\/\/\s+([^\w\s]+)\s+([a-z]+)\s*$/);
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
		const funcMatch = line.match(/^\s*function\s+(\w+)\s*\([^)]*\)/);
		const varMatch = line.match(/^\s*(?:var|let|const)\s+(\w+)\s*:/);
		const classMatch = line.match(/^\s*class\s+(\w+)/);

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

	// Exclude certain sections for specific output types
	if (exampleType === 'c2d') {
		// Shaders are WebGPU-only; exclude from Canvas2D type definitions
		if (sections['shaders']) delete sections['shaders'];
	}

	// Build the output content
	const output = [];
	output.push('declare global {');

	// Sort sections to match the order in base file
	const sectionOrder = Object.keys(emojiMappings).map((section) => section);

	for (const sectionName of sectionOrder) {
		if (!sections[sectionName]) continue;

		const section = sections[sectionName];
		const emoji = emojiMappings[sectionName];

		output.push('');
		output.push(`\t// ${emoji} ${sectionName}`);

		// Add section description if available (as block comment)
		if (section.sectionDescription) {
			const descLines = section.sectionDescription.split('\n');
			if (descLines.length > 0) {
				output.push('');
				output.push('\t/**');
				descLines.forEach((line) => {
					output.push(`\t * ${line}`);
				});
				output.push('\t */');
			}
		}

		output.push('');

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
						const memberSig = baseSignatures[`${func.name}.${member.name}`];
						if (memberSig) {
							output.push(`\t\t${memberSig}`);
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

				output.push('\t}');
			} else {
				// Regular function or variable
				output.push(generateJSDoc(func, emoji, includeExamples, exampleType));
				output.push(generateDeclaration(func.name, baseSignatures));
			}

			output.push('');
		}
	}

	output.push('}');
	output.push('');
	output.push('export {};');
	output.push('');

	fs.writeFileSync(outputPath, output.join('\n'));
	console.log(`✅ Generated ${path.basename(outputPath)}`);
}

/**
 * Main function
 */
function main() {
	// support a language code argument (two-letter), default to 'en'
	// usage: node types.js [lang] or node types.js --lang=fr
	const argv = process.argv.slice(2);
	let lang = 'en';
	for (const a of argv) {
		if (a === '-h' || a === '--help') {
			console.log('Usage: types.js [lang]  OR  types.js --lang=<two-letter-code>\nDefault: en');
			process.exit(0);
		}
		if (a.startsWith('--lang=')) {
			lang = a.split('=')[1] || lang;
		} else if (!a.startsWith('-')) {
			// positional arg: language code
			lang = a;
		}
	}

	// sanitize to two-letter lowercase code
	lang = (lang || 'en').toLowerCase().slice(0, 2);

	const rootDir = path.join(__dirname, '..');
	const defsDir = path.join(__dirname, '..', 'defs');
	const learnDir = path.join(__dirname, '..', 'lang', lang, 'learn');
	const baseDtsPath = path.join(learnDir, `${lang}.d.ts`);

	// Find all markdown files and parse them once
	const files = fs.readdirSync(learnDir);
	let markdownFiles = files.filter((f) => f.endsWith('.md')).map((f) => path.join(learnDir, f));

	// Parse each markdown file once and build a sections map
	const sections = {};
	for (const mdFile of markdownFiles) {
		const parsed = parseMarkdownFile(mdFile);
		if (parsed.sectionName) sections[parsed.sectionName] = parsed;
	}

	if (!fs.existsSync(baseDtsPath)) {
		console.error('❌ Base file en.d.ts not found!');
		process.exit(1);
	}

	console.log(`📘 Building type definitions for language: ${lang}`);

	let langSuffix = lang == 'en' ? '' : `_${lang}`;

	// Build q5.d.ts with WebGPU examples
	// let dir = lang == 'en' ? rootDir : defsDir;
	let dir = defsDir;
	let file = path.join(dir, `q5${langSuffix}.d.ts`);
	buildDtsFile(sections, baseDtsPath, file, true, 'webgpu');

	// Build q5_c2d.d.ts with C2D examples
	file = path.join(defsDir, `q5-c2d${langSuffix}.d.ts`);
	buildDtsFile(sections, baseDtsPath, file, true, 'c2d');

	// copy c2d d.ts to root
	// if (lang === 'en') {
	// 	const destFile = path.join(rootDir, `q5.d.ts`);
	// 	fs.copyFileSync(file, destFile);
	// }
}

if (require.main === module) {
	main();
}

module.exports = { parseMarkdownFile, buildDtsFile };
