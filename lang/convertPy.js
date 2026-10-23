/**
 * q5/lang/genPython.js
 *
 * AI was used to generate parts of this script.
 */

import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertJSToPython } from './jsToPython.js';

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
				// Support js, javascript, or q5 code blocks
				translatingFence = /^```(?:js|javascript|q5)\s*$/.test(line);
				code = [];
				if (!translatingFence) output.push(line);
				continue;
			}
			if (marker?.[0] === fence.character && marker.length >= fence.length) {
				if (translatingFence) {
					const pythonCode = convertJSToPython(code.join('\n'))
						.replace(/[ \t]+$/gm, '')
						.trimEnd();
					if (output.length > 0 && output[output.length - 1] === '```') {
						output.push('');
					}
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
	try {
		for (const entry of await readdir(directory, { withFileTypes: true })) {
			const entryPath = join(directory, entry.name);
			if (entry.isDirectory()) files.push(...(await getMarkdownFiles(entryPath)));
			else if (entry.isFile() && entry.name.endsWith('.md')) files.push(entryPath);
		}
	} catch (err) {
		console.error(`Error reading directory ${directory}:`, err.message);
	}
	return files;
}

const langDirectory = fileURLToPath(new URL('.', import.meta.url));
const targetLocale = Bun.argv.at(-1) || 'en'; // Change this to your desired locale (e.g., 'es', 'fr', 'de')
const localeDirectory = join(langDirectory, targetLocale);
let updatedFiles = 0;

const markdownFiles = await getMarkdownFiles(localeDirectory);
console.log(`Found ${markdownFiles.length} Markdown file(s) in locale '${targetLocale}'.`);

for (const localPath of markdownFiles) {
	const markdownText = await Bun.file(localPath).text();
	const updatedMarkdown = buildPythonExamples(markdownText);

	// Overwrite every time unconditionally
	await Bun.write(localPath, updatedMarkdown);
	console.log(`Wrote Python examples: ${relative(localeDirectory, localPath)}`);
	updatedFiles++;
}

console.log(`Done. Overwrote ${updatedFiles} Markdown file(s) for locale '${targetLocale}'.`);
