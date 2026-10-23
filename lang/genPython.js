/**
 * q5/lang/genPython.js
 *
 * AI was used to generate parts of this script.
 */

import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

function buildPythonExamples(markdownText) {
	const getFenceMarker = (line) => line.match(/^\s*(`{3,}|~{3,})/)?.[1];
	const advanceFence = (line, fence) => {
		const marker = getFenceMarker(line);
		if (!fence) return marker ? { character: marker[0], length: marker.length } : null;
		if (marker?.[0] === fence.character && marker.length >= fence.length) return null;
		return fence;
	};

	const getSections = (text) => {
		const lines = text.split('\n');
		const starts = [];
		let fence = null;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!fence && /^##\s/.test(line)) starts.push(i);
			fence = advanceFence(line, fence);
		}

		return starts.map((start, index) => ({
			start,
			lines: lines.slice(start, starts[index + 1] ?? lines.length)
		}));
	};

	const getModeBlock = (lines, mode) => {
		let fence = null;
		let start = -1;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!fence) {
				if (start < 0 && new RegExp(`^###\\s+${mode}\\s*$`, 'i').test(line)) start = i;
				else if (start >= 0 && /^###\s/.test(line)) return lines.slice(start, i);
			}
			fence = advanceFence(line, fence);
		}

		return start < 0 ? [] : lines.slice(start);
	};

	const convertWebgpuBlock = (webgpuBlock) => {
		const output = ['### python', ''];
		let fence = null;
		let translatingFence = false;
		let code = [];

		for (const line of webgpuBlock.slice(1)) {
			const marker = getFenceMarker(line);
			if (!fence) {
				if (!marker) continue;
				fence = { character: marker[0], length: marker.length };
				translatingFence = /^```js\s*$/.test(line);
				code = [];
				if (!translatingFence) output.push(line);
				continue;
			}
			if (marker?.[0] === fence.character && marker.length >= fence.length) {
				if (translatingFence) {
					const pythonCode = translateJsMiniExample(code.join('\n')).replace(/[ \t]+$/gm, '');
					output.push('```py', pythonCode, '```');
				} else output.push(line);
				fence = null;
				translatingFence = false;
				continue;
			}
			if (translatingFence) code.push(line);
			else output.push(line);
		}

		output.push('');
		return output;
	};

	const sections = getSections(markdownText);
	const originalLines = markdownText.split('\n');
	const output = originalLines.slice(0, sections[0]?.start ?? originalLines.length);
	for (const section of sections) {
		const local = section.lines;
		const webgpuBlock = getModeBlock(local, 'webgpu');
		if (!webgpuBlock.length) {
			output.push(...local);
			continue;
		}

		const pythonBlock = convertWebgpuBlock(webgpuBlock);
		const existingPython = getModeBlock(local, 'python');
		const removeStart = existingPython.length ? local.indexOf(existingPython[0]) : -1;
		const removeEnd = removeStart < 0 ? -1 : removeStart + existingPython.length;
		const withoutPython = removeStart < 0 ? local : [...local.slice(0, removeStart), ...local.slice(removeEnd)];
		const insertAt = withoutPython.findIndex((line) => /^###\s+c2d\s*$/i.test(line));
		if (insertAt < 0) output.push(...withoutPython, ...pythonBlock);
		else output.push(...withoutPython.slice(0, insertAt), ...pythonBlock, ...withoutPython.slice(insertAt));
	}

	return output.join('\n');
}

async function getMarkdownFiles(directory) {
	const files = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const entryPath = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await getMarkdownFiles(entryPath)));
		else if (entry.isFile() && entry.name.endsWith('.md')) files.push(entryPath);
	}
	return files;
}

async function main() {
	const langDirectory = fileURLToPath(new URL('.', import.meta.url));
	const locales = await readdir(langDirectory, { withFileTypes: true });
	let updatedFiles = 0;

	for (const locale of locales) {
		if (!locale.isDirectory() || locale.name === 'en') continue;
		const localeDirectory = join(langDirectory, locale.name);
		for (const localPath of await getMarkdownFiles(localeDirectory)) {
			const relativePath = relative(localeDirectory, localPath);
			const markdownText = await Bun.file(localPath).text();
			const updatedMarkdown = buildPythonExamples(markdownText);
			if (updatedMarkdown === markdownText) continue;

			await Bun.write(localPath, updatedMarkdown);
			console.log(`Built Python examples: ${relative(localeDirectory, localPath)}`);
			updatedFiles++;
		}
	}

	console.log(`Done. Updated ${updatedFiles} Markdown file(s).`);
}

if (import.meta.main) await main();

function translateJsExpression(expression) {
	const strings = [];
	expression = expression.replace(/(['"])(?:\\.|(?!\1)[\s\S])*?\1/g, (value) => {
		const index = strings.push(value) - 1;
		return `\u0000${index}\u0000`;
	});

	expression = expression
		.replace(/!==/g, '!=')
		.replace(/===/g, '==')
		.replace(/&&/g, ' and ')
		.replace(/\|\|/g, ' or ')
		.replace(/!(?!=)/g, 'not ')
		.replace(/(^|[,{]\s*)(?!(?:else|if|elif|for|while|def|class|try|except|finally|with)\b)([\w$]+)\s*:/g, '$1"$2":')
		.replace(/\btrue\b/g, 'True')
		.replace(/\bfalse\b/g, 'False')
		.replace(/\bnull\b/g, 'None')
		.replace(/\bundefined\b/g, 'None');

	return expression.replace(/\u0000(\d+)\u0000/g, (_, index) => strings[Number(index)]);
}

function translateJsTernary(expression) {
	const strings = [];
	expression = expression.replace(/(['"])(?:\\.|(?!\1)[\s\S])*?\1/g, (value) => {
		const index = strings.push(value) - 1;
		return `\u0000${index}\u0000`;
	});

	expression = expression.replace(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/, '$2 if $1 else $3');
	return expression.replace(/\u0000(\d+)\u0000/g, (_, index) => strings[Number(index)]);
}

function translateJsMiniExample(code) {
	const callbacks = [];
	const functionAssignments = [];
	let callbackIndex = 0;
	const literals = [];
	const topLevelVariables = new Set();
	const functionLocalVariables = new Set();

	const hideTripleQuotedLiterals = (source) =>
		source.replace(/f?"""[\s\S]*?"""/g, (literal) => {
			const index = literals.push(literal) - 1;
			return `__Q5_STRING_LITERAL_${index}__`;
		});

	const translateTemplateLiterals = (source) =>
		source.replace(/`([\s\S]*?)`/g, (_, template) => {
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

	const stripComment = (line) => {
		let quote = '';
		let escaped = false;
		for (let i = 0; i < line.length - 1; i++) {
			const char = line[i];
			if (escaped) escaped = false;
			else if (char === '\\' && quote) escaped = true;
			else if (quote && char === quote) quote = '';
			else if (!quote && (char === "'" || char === '"')) quote = char;
			else if (!quote && char === '/' && line[i + 1] === '/') return line.slice(0, i).trimEnd();
		}
		return line;
	};

	code = hideTripleQuotedLiterals(translateTemplateLiterals(code));
	for (const line of code.split('\n')) {
		const indent = line.match(/^\s*/)[0].length;
		const declarations = line.matchAll(/\b(?:let|const|var)\s+([\p{L}_$][\p{L}\p{N}_$]*)/gu);
		for (const [, name] of declarations) {
			if (indent === 0) topLevelVariables.add(name);
			else functionLocalVariables.add(name);
		}
		if (indent === 0) {
			for (const [, name] of line.matchAll(/\(\s*([\p{L}_$][\p{L}\p{N}_$]*)\s*=(?!=)/gu)) {
				topLevelVariables.add(name);
			}
		}
	}
	const sourceLines = code.split('\n');
	for (let i = 0; i < sourceLines.length - 1; i++) {
		if (/=\s*$/.test(sourceLines[i]) && sourceLines[i + 1].trim()) {
			sourceLines[i] += ` ${sourceLines.splice(i + 1, 1)[0].trim()}`;
		}
	}

	const translatedLines = sourceLines
		.map((sourceLine) => {
			let line = stripComment(sourceLine);
			const indent = line.match(/^\s*/)[0];
			line = line.slice(indent.length);
			if (!line.trim()) return '';
			if (line.startsWith('//')) return `${indent}#${line.slice(2)}`;

			if (/^}\s*else\s+if\s*\(/.test(line)) {
				line = line.replace(/^}\s*else\s+if\s*\((.*?)\)\s*\{\s*$/, 'elif $1:');
				return `${indent}${translateJsExpression(line)}`;
			}
			if (/^}\s*else\s*\{\s*$/.test(line)) return `${indent}else:`;
			if (/^}\s*else\s+(.+);?\s*$/.test(line)) {
				return `${indent}else: ${translateJsExpression(line.replace(/^}\s*else\s+/, '').replace(/;\s*$/, ''))}`;
			}

			if (/^}\s*\)\s*;?\s*$/.test(line) && callbacks.length) {
				const callback = callbacks.pop();
				return `${indent}${callback.call}`;
			}
			if (/^}\s*;\s*$/.test(line) && functionAssignments.length) {
				const assignment = functionAssignments.pop();
				return `${indent}${assignment.receiver}.${assignment.name} = ${assignment.name}`;
			}
			if (/^}\s*;?\s*$/.test(line)) return null;

			const callbackMatch = line.match(/^(.*?,\s*)\(([^()]*)\)\s*=>\s*\{\s*;?$/);
			if (callbackMatch) {
				const name = `__q5_callback_${callbackIndex++}`;
				callbacks.push({ call: `${callbackMatch[1]}${name})` });
				return `${indent}def ${name}(${callbackMatch[2]}):`;
			}

			const assignedFunction = line.match(
				/^(?:([$\p{L}_][\p{L}\p{N}_$]*)\.)?([$\p{L}_][\p{L}\p{N}_$]*)\s*=\s*function\s*\((.*?)\)\s*\{\s*;?$/u
			);
			if (assignedFunction) {
				const [, receiver, name, params] = assignedFunction;
				if (receiver && receiver !== 'q5') functionAssignments.push({ receiver, name });
				return `${indent}def ${name}(${params}):`;
			}

			const assignedArrow = line.match(/^(?:(\w+)\.)?([\w$]+)\s*=\s*\((.*?)\)\s*=>\s*\{\s*;?$/);
			if (assignedArrow) {
				const [, receiver, name, params] = assignedArrow;
				if (receiver && receiver !== 'q5') functionAssignments.push({ receiver, name });
				return `${indent}def ${name}(${params}):`;
			}

			const functionDeclaration = line.match(/^(async\s+)?function\s+([\w$]+)\s*\((.*?)\)\s*\{\s*;?$/);
			if (functionDeclaration) {
				return `${indent}${functionDeclaration[1] ? 'async ' : ''}def ${functionDeclaration[2]}(${functionDeclaration[3]}):`;
			}

			let loop = line.match(/^for\s*\(\s*(?:let|const|var)\s+([\w$]+)\s+of\s+(.+?)\s*\)\s*\{?\s*;?$/);
			if (loop) return `${indent}for ${loop[1]} in ${translateJsExpression(loop[2])}:`;

			loop = line.match(
				/^for\s*\(\s*(?:let|const|var)\s+([\w$]+)\s*=\s*(-?\d+)\s*;\s*\1\s*(<=|>=|<|>)\s*(.+?)\s*;\s*\1\s*(\+\+|--|\+= *\d+|-= *\d+)\s*\)\s*\{\s*;?$/
			);
			if (loop) {
				let [, variable, start, comparison, end, increment] = loop;
				let step = 1;
				if (increment === '--' || increment.startsWith('-='))
					step = increment === '--' ? -1 : -Number(increment.slice(2));
				else if (increment.startsWith('+=')) step = Number(increment.slice(2));
				if (comparison === '<=') end = `(${end}) + 1`;
				if (comparison === '>=') end = `(${end}) - 1`;
				if (comparison === '>' || comparison === '>=') step = -Math.abs(step);
				return `${indent}for ${variable} in range(${start}, ${translateJsExpression(end)}, ${step}):`;
			}

			let block = line.match(/^(if|while)\s*\((.*)\)\s*\{\s*;?$/);
			if (block) return `${indent}${block[1]} ${translateJsExpression(block[2])}:`;

			line = line.replace(/^(?:let|const|var)\s+/, '');
			line = line.replace(/^([\w$]+)\s*;?$/, '$1 = None');
			line = line.replace(/^\(([^()]*)\)\s*=>\s*/, 'lambda $1: ');
			line = line.replace(/^([\w$]+)\s*=>\s*/, 'lambda $1: ');
			line = line.replace(/\(\s*\)\s*=>\s*/g, 'lambda: ');
			line = line.replace(/^if\s*\((.*?)\)\s*(.+);?$/, (_, condition, statement) => {
				return `if ${translateJsExpression(condition)}: ${statement.replace(/;\s*$/, '')}`;
			});
			line = line.replace(/^else\s+(.+);?$/, (_, statement) => `else: ${statement.replace(/;\s*$/, '')}`);
			line = line.replace(/\(([$\p{L}_][\p{L}\p{N}_$]*)\s*=(?!=)\s*([^()]*)\)/gu, '($1 := $2)');
			line = line.replace(/\(([\w$]+)\s*\+=\s*(\d+)\)/g, '($1 := $1 + $2)');
			line = line.replace(/^([\w$]+)\+\+;?$/, '$1 += 1').replace(/^([\w$]+)--;?$/, '$1 -= 1');
			line = translateJsTernary(line);
			line = line.replace(/\bawait\s+(?=(?:Canvas|Lienzo)\s*\()/g, '');
			line = line.replace(/;+\s*$/, '');
			return `${indent}${translateJsExpression(line)}`;
		})
		.filter((line) => line !== null);

	for (let i = 0; i < translatedLines.length; i++) {
		const definition = translatedLines[i].match(/^(\s*)def\s+[\p{L}_$][\p{L}\p{N}_$]*\s*\((.*?)\)\s*:/u);
		if (!definition) continue;

		const indent = definition[1].length;
		const params = new Set(
			definition[2]
				.split(',')
				.map((param) => param.trim())
				.filter(Boolean)
		);
		const assignedVariables = new Set();
		for (let j = i + 1; j < translatedLines.length; j++) {
			const lineIndent = translatedLines[j].match(/^\s*/)[0].length;
			if (translatedLines[j].trim() && lineIndent <= indent) break;
			for (const name of topLevelVariables) {
				if (params.has(name) || functionLocalVariables.has(name)) continue;
				const pattern = new RegExp(
					`(?:^|[^\\p{L}\\p{N}_$.])${name.replace(/\$/g, '\\$')}\\s*(?:=(?!=)|\\+=|-=|\\*=|/=|:=)`,
					'u'
				);
				const codeLine = translatedLines[j].replace(/(['"])(?:\\.|(?!\1)[\s\S])*?\1/g, '');
				if (pattern.test(codeLine)) assignedVariables.add(name);
			}
		}

		if (assignedVariables.size) {
			const bodyIndent = translatedLines[i + 1]?.match(/^\s*/)[0];
			translatedLines.splice(
				i + 1,
				0,
				`${bodyIndent?.length > indent ? bodyIndent : `${definition[1]}\t`}global ${[...assignedVariables].join(', ')}`
			);
			i++;
		}
	}

	return translatedLines.join('\n').replace(/__Q5_STRING_LITERAL_(\d+)__/g, (_, index) => literals[Number(index)]);
}

function translateMarkdownExamplesToPython(markdownText) {
	const output = [];
	let mode = '';
	let inFence = false;
	let translatingFence = false;
	let code = [];
	markdownText = markdownText.replace(/^###\s+python\s*\r?\n(?:(?!^#{2,3}\s)[\s\S])*/gm, '');

	for (const line of markdownText.split('\n')) {
		if (!inFence) {
			const heading = line.match(/^###\s+(\S+)/);
			if (heading) {
				mode = heading[1].toLowerCase();
				if (mode === 'webgpu') {
					output.push('### python');
					continue;
				}
				if (mode === 'python') continue;
			} else if (/^#{1,2}\s/.test(line)) {
				mode = '';
			}

			if (mode === 'python') continue;

			const fence = line.match(/^```([\w-]*)/);
			if (fence && mode === 'webgpu' && fence[1] === 'js') {
				inFence = true;
				translatingFence = true;
				code = [];
				continue;
			}
			if (fence) inFence = true;
			output.push(line);
			continue;
		}

		if (line.startsWith('```')) {
			if (translatingFence) output.push('```py', translateJsMiniExample(code.join('\n')), '```');
			else output.push(line);
			inFence = false;
			translatingFence = false;
			continue;
		}
		if (translatingFence) code.push(line);
		else output.push(line);
	}

	return output.join('\n');
}

function filterMarkdownExamples(markdownText, exampleMode) {
	let activeMode = null;
	let insideCodeFence = false;
	const filteredLines = [];

	for (const line of markdownText.split('\n')) {
		if (line.startsWith('````')) continue;
		if (!insideCodeFence) {
			const headingMatch = line.match(/^###\s+(\S+)/);
			if (headingMatch) {
				const heading = headingMatch[1].toLowerCase();
				if (['webgpu', 'python', 'c2d'].includes(heading)) {
					activeMode = heading;
					continue;
				}
				activeMode = null;
			} else if (/^#{1,2}\s/.test(line)) {
				activeMode = null;
			}
		}

		if (!activeMode || activeMode === exampleMode) filteredLines.push(line);
		if (line.startsWith('```') && !line.startsWith('````')) insideCodeFence = !insideCodeFence;
	}

	return filteredLines.join('\n');
}

// Current section state (must be declared before loader functions)
// (declared earlier)

function parseMarkdownIntoSections(markdownText) {
	// Clear existing sections before parsing new content
	sections = {};

	let codeBlockCount = 0;
	// make script tags (use captured group to extract the example content)
	markdownText = markdownText.replace(/```(js|py|python)([\s\S]*?)```/g, (match, language, code) => {
		code = code.replace(/^\n+|\n+$/g, '');
		const type = language === 'python' || language === 'py' ? 'mini/python' : 'mini';
		return `\n<script id="ex${codeBlockCount++}" type="${type}">\n${code}\n</script>`;
	});

	let lines = markdownText.split('\n'),
		currentSectionId = '',
		currentSubsectionId = '',
		insideCodeBlock = false,
		insideMiniScript = false;

	for (let line of lines) {
		if (line.startsWith('<script id="ex')) insideMiniScript = true;
		else if (line === '</script>') insideMiniScript = false;

		if (line.startsWith('```') && !line.startsWith('````')) {
			insideCodeBlock = !insideCodeBlock;
		}

		let isMarkdownH1 = false,
			isMarkdownH2 = false,
			isHTMLH1 = false,
			isHTMLH2 = false,
			title = '',
			id = '',
			attributes = {};

		if (!insideCodeBlock && !insideMiniScript) {
			if (line.startsWith('# ')) {
				title = line.substring(2);
				isMarkdownH1 = true;
			} else if (line.startsWith('## ')) {
				title = line.substring(3);
				isMarkdownH2 = true;
			}

			let htmlH1Match = line.match(/<h1.*?id="(.*?)".*?>(.*?)<\/h1>/i);
			let htmlH2Match = line.match(/<h2.*?id="(.*?)".*?>(.*?)<\/h2>/i);
			if (htmlH1Match) {
				id = htmlH1Match[1];
				title = htmlH1Match[2];
				isHTMLH1 = true;
			} else if (htmlH2Match) {
				id = htmlH2Match[1];
				title = htmlH2Match[2];
				isHTMLH2 = true;
			}
		}

		if (isMarkdownH1 || isHTMLH1) {
			if (!isHTMLH1) {
				id = title.slice(title.indexOf(' ') + 1).replace(/\s+/g, '-');
			}
			id += 'Section';
			currentSectionId = id;
			currentSubsectionId = '';
			sections[id] = { title: title, content: line, subsections: {} };
		} else if ((isMarkdownH2 || isHTMLH2) && currentSectionId) {
			const titleParts = title.trim().split(/\s+/);
			title = (titleParts.length > 1 ? titleParts[1] : titleParts[0]).split('(')[0];
			id = title.replace(/\s+/g, '-');
			currentSubsectionId = id;
			sections[currentSectionId].subsections[id] = { title: title, content: line, ...attributes };
		} else if (currentSectionId) {
			if (currentSubsectionId) {
				sections[currentSectionId].subsections[currentSubsectionId].content += `\n${line}`;
			} else {
				sections[currentSectionId].content += `\n${line}`;
			}
		}
	}

	return sections;
}
