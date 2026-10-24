/**
 * q5/lang/build.js (Bun optimized)
 */

import { readdir } from 'node:fs/promises';
import path from 'node:path';
import marked from './marked.min.js';
import { JSDOM } from 'jsdom';

const log = console.log;
const pageGroups = ['home'];

async function main() {
	for (let pageGroup of pageGroups) {
		const pages = await getPagesInDirectory(pageGroup);
		for (const page of pages) {
			await buildPage(pageGroup, page);
		}
	}

	log('Done!');
}

async function getPagesInDirectory(dir) {
	let files = await readdir(`./lang/en/${dir}`);
	log(files);
	const fileNames = [];
	for (const file of files) {
		if (file.endsWith('.md')) {
			// removes the '.md' extension
			fileNames.push(file.slice(0, -3));
		}
	}
	return fileNames;
}

async function buildPage(pageGroup, page) {
	let htmlFilePath = `./${pageGroup}/${page}.html`;
	// Using Bun's fast native file reading API
	let html = await Bun.file(htmlFilePath).text();
	let dom = new JSDOM(html);
	let document = dom.window.document;

	let mdFilePath = `./lang/en/${pageGroup}/${page}.md`;
	let mdContent = await Bun.file(mdFilePath).text();
	mdContent = mdContent.split('\n# ');
	mdContent[0] = mdContent[0].slice(2);

	for (let content of mdContent) {
		let splitIdx = content.indexOf('\n');
		let id = content.slice(0, splitIdx);
		if (!isNaN(id[0])) id = 'md' + id;
		let md = document.getElementById(id);
		if (!md) continue;
		let htmlContent = marked.parse(content.slice(splitIdx + 1));
		if (htmlContent.trim().startsWith('<p>') && htmlContent.trim().endsWith('</p>')) {
			let inner = htmlContent.trim().slice(3, -4);

			htmlContent = inner;
		}
		md.innerHTML = '\n' + htmlContent;
		let links = md.getElementsByTagName('a');
		for (let link of links) {
			link.setAttribute('target', '_blank');
		}
	}

	html = dom.serialize();

	// Using Bun's fast native file writing API
	await Bun.write(htmlFilePath, html);
	log(path.resolve(htmlFilePath));
}

main();
