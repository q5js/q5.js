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

	// First line should be the section header
	if (lines[0].startsWith('# ')) {
		result.sectionName = lines[0].substring(2).trim();
		i = 1;

		// Skip empty lines
		while (i < lines.length && lines[i].trim() === '') i++;

		// Collect section description until we hit the first ## header
		const descLines = [];
		while (i < lines.length && !lines[i].startsWith('## ')) {
			descLines.push(lines[i]);
			i++;
		}
		result.sectionDescription = descLines.join('\n').trim();
	}

	// First pass: identify all class names
	const classNames = new Set();
	for (let j = i; j < lines.length; j++) {
		const line = lines[j];
		if (line.startsWith('## ') && line.includes('.')) {
			const className = line.substring(3).split('.')[0].trim();
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
		if (line.startsWith('## ')) {
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
				!lines[i].startsWith('## ') &&
				!lines[i].startsWith('### ') &&
				!lines[i].startsWith('```')
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
		if (line.startsWith('### webgpu')) {
			currentExampleType = 'webgpu';
			i++;
			continue;
		}

		if (line.startsWith('### c2d')) {
			currentExampleType = 'c2d';
			i++;
			continue;
		}

		// Check for code blocks with language (examples)
		if (line.startsWith('````js') || line.startsWith('````javascript')) {
			i++;
			codeBlockContent = [];

			// Collect code until closing ````
			while (i < lines.length && !lines[i].startsWith('````')) {
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
					lines.push(`${indent}${line}`);
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
function buildDtsFile(markdownFiles, baseDtsPath, outputPath, includeExamples = true, exampleType = 'c2d') {
	console.log(`\n📝 Building ${path.basename(outputPath)}...`);

	const emojiMappings = extractEmojiMappings(baseDtsPath);
	const baseSignatures = extractBaseSignatures(baseDtsPath);

	const sections = {};

	// Parse all markdown files
	for (const mdFile of markdownFiles) {
		const parsed = parseMarkdownFile(mdFile);
		if (parsed.sectionName) {
			sections[parsed.sectionName] = parsed;
		}
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

		// Add section description if available (as comment)
		if (section.sectionDescription && !includeExamples) {
			const descLines = section.sectionDescription.split('\n').filter((l) => l.trim());
			if (descLines.length > 0) {
				output.push('');
				descLines.forEach((line) => {
					output.push(`\t// ${line}`);
				});
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
	const learnDir = __dirname;
	const langDir = path.join(__dirname, '..', 'lang', 'en', 'learn');
	const baseDtsPath = path.join(langDir, 'en.d.ts');

	console.log('🏗️  q5.js Documentation Builder\n');
	console.log('Source:', langDir);
	console.log('Base file:', baseDtsPath);
	console.log('Output:', learnDir);

	// Find all markdown files
	const files = fs.readdirSync(langDir);
	const markdownFiles = files.filter((f) => f.endsWith('.md')).map((f) => path.join(langDir, f));

	console.log(`\nFound ${markdownFiles.length} markdown files`);

	if (!fs.existsSync(baseDtsPath)) {
		console.error('❌ Base file en.d.ts not found!');
		process.exit(1);
	}

	// Build q5.d.ts with WebGPU examples
	buildDtsFile(markdownFiles, baseDtsPath, path.join(langDir, 'q5.d.ts'), true, 'webgpu');

	// Build q5_c2d.d.ts with C2D examples
	buildDtsFile(markdownFiles, baseDtsPath, path.join(langDir, 'q5_c2d.d.ts'), true, 'c2d');

	console.log('\n✨ Build complete!');
}

if (require.main === module) {
	main();
}

module.exports = { parseMarkdownFile, buildDtsFile };
