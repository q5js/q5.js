const log = console.log;
const fs = require('fs/promises');
const path = require('path');
const marked = require('./marked.min.js');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

let pageGroups = ['home'];

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
	let files = await fs.readdir(`./lang/en/${dir}`);
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
	let html = await fs.readFile(htmlFilePath, 'utf8');
	let dom = new JSDOM(html);
	let document = dom.window.document;

	let mdFilePath = `./lang/en/${pageGroup}/${page}.md`;
	let mdContent = await fs.readFile(mdFilePath, 'utf8');
	mdContent = mdContent.split('\n# ');
	mdContent[0] = mdContent[0].slice(2);

	for (let content of mdContent) {
		let splitIdx = content.indexOf('\n');
		let id = content.slice(0, splitIdx);
		if (!isNaN(id[0])) id = 'md' + id;
		let md = document.getElementById(id);
		if (!md) continue;
		md.innerHTML = '\n' + marked.parse(content.slice(splitIdx + 1));
		let links = md.getElementsByTagName('a');
		for (let link of links) {
			link.setAttribute('target', '_blank');
		}
	}

	html = dom.serialize();

	await fs.writeFile(htmlFilePath, html);
	log(path.resolve(htmlFilePath));
}

main();
