toggleNavButton.addEventListener('click', () => {
	navbar.classList.toggle('navclose');
	navbar.classList.toggle('navopen');
});

function winResized() {
	if (window.innerWidth < 1000) {
		navbar.classList.replace('navopen', 'navclose');
	} else {
		navbar.classList.replace('navclose', 'navopen');
	}
}
winResized();
window.addEventListener('resize', winResized);

themeToggle.addEventListener('click', () => {
	setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
});

function stripParams(params) {
	return params
		.split(',')
		.map((param) => param.split(':')[0].trim())
		.join(', ');
}

function convertTSDefToMarkdown(data) {
	data = data.replaceAll('https://q5js.org/learn', '.');

	let markdownCode = '';

	let lines = data.split('\n').slice(7, -4),
		insideJSDoc = false,
		insideParams = false,
		insideProps = false,
		insideExample = false,
		hasExample = false,
		jsDocBuffer = '',
		inClassDef = false,
		currentClassName = '',
		curEmoji = '';

	for (let line of lines) {
		if (!insideExample) line = line.trim();

		if (line.startsWith('/**')) {
			insideJSDoc = true;
			jsDocBuffer = '';
		} else if (insideJSDoc) {
			if (line.endsWith('*/')) {
				if (insideExample) {
					line = jsDocBuffer += '```';
					insideExample = false;
				}
				insideJSDoc = insideParams = insideProps = false;
			} else {
				line = line.replace(/^\s*\* {0,1}/, '');
				let isParam = line.startsWith('@param');
				if (isParam) {
					if (!insideParams) jsDocBuffer += '### Params\n\n';
					insideParams = true;
				}
				let isProp = line.startsWith('@prop');
				if (isProp) {
					if (!insideProps) jsDocBuffer += '### Properties\n\n';
					insideProps = true;
				}
				if (isParam || isProp) {
					let pMatch = line.match(/@(param|prop|property) \{([^\}]+)\} (\S+) *-* *(.*)/);
					if (pMatch) {
						let [_0, _1, pType, pName, pDesc] = pMatch;
						let optional = '';
						if (pName[0] === '[') {
							pName = pName.slice(1, -1);
							optional = '(optional)';
						}
						if (pName.includes('.')) line = '  ';
						else line = '';
						line += `- \`${pName}\` \`<${pType}>\` ${optional}`;
						if (pDesc) line += ` - ${pDesc}`;
					}
				} else if (line.startsWith('@returns')) {
					let returnMatch = line.match(/@returns \{([^\}]+)\} *-* *(.*)/);
					if (returnMatch) {
						let [_, returnType, returnDesc] = returnMatch;
						line = `### Returns\n\n- \`<${returnType}>\``;
						if (returnDesc) line += ` - ${returnDesc}`;
					}
				} else if (line.startsWith('@example')) {
					line = '```js';
					if (insideExample) {
						line = '```\n\n' + line;
					}
					insideExample = hasExample = true;
				}
				jsDocBuffer += line + '\n';
			}
		} else if (!line) {
			if (jsDocBuffer.length > 0) markdownCode += jsDocBuffer;
			markdownCode += '\n';
		} else if (line.startsWith('//')) {
			let sectionTitle = line.slice(3);
			curEmoji = sectionTitle.slice(0, sectionTitle.indexOf(' '));
			markdownCode += `# ${sectionTitle}\n\n`;
		} else if (line.startsWith('class ')) {
			let classMatch = line.match(/class\s+(\w+)/);
			currentClassName = classMatch[1];
			inClassDef = true;
		} else if (inClassDef && line.startsWith('constructor')) {
			let params = stripParams(line.slice(12, -2));
			markdownCode += `## ${curEmoji} ${currentClassName}(${params}) &lt;class&gt;\n\n`;
			markdownCode += jsDocBuffer + '\n\n';
			jsDocBuffer = '';
			hasExample = false;
		} else if (line.startsWith('new')) {
			continue;
		} else if (line.endsWith('//-')) {
			jsDocBuffer = '';
			continue;
		} else if (line.includes('(')) {
			let funcMatch = line.match(/(\w+)\s*\((.*)\)\s*:\s*(\w+)/);
			if (funcMatch) {
				let [_, funcName, funcParams, funcType] = funcMatch;
				if (!line.startsWith('function ')) {
					if (!line.startsWith('static')) {
						funcName = currentClassName.toLowerCase() + '.' + funcName;
					} else {
						if (!hasExample) {
							jsDocBuffer = '';
							continue;
						}
						funcName = currentClassName + '.' + funcName;
					}
				}
				funcParams = stripParams(funcParams);
				let funcHeader = `## ${curEmoji} ${funcName}(${funcParams}) &lt;${funcType}&gt;\n\n`;
				markdownCode += funcHeader + jsDocBuffer + '\n\n';
				jsDocBuffer = '';
				hasExample = false;
			}
		} else if (line.includes(':')) {
			let l = line.split(':');
			let varName = l[0].split(' ').at(-1).trim();

			// if var is a class property
			if (!line.match(/^(var|let|const)/)) {
				if (!line.startsWith('static')) {
					varName = currentClassName.toLowerCase() + '.' + varName;
				} else {
					if (!hasExample) {
						jsDocBuffer = '';
						continue;
					}
					varName = currentClassName + '.' + varName;
				}
			}
			let type = l[1].slice(1, -1);
			let varHeader = `## ${curEmoji} ${varName} &lt;${type}&gt;\n\n`;
			markdownCode += varHeader + jsDocBuffer + '\n\n';
			jsDocBuffer = '';
			hasExample = false;
		} else if (line.startsWith('namespace') || line.startsWith('interface')) {
			continue;
		} else if (line !== '}' && !line.includes(':')) {
			markdownCode += line + '\n';
		}
	}
	return markdownCode;
}

let sections = {};

function parseMarkdownIntoSections(markdownText) {
	let codeBlockCount = 0;
	// make script tags
	markdownText = markdownText.replace(/```js([\s\S]*?)```/g, (match) => {
		let js = match.slice(5, -3);
		return `
<script id="ex${codeBlockCount++}" type="mini">
${js}
</script>`;
	});

	let lines = markdownText.split('\n'),
		currentSectionId = '',
		currentSubsectionId = '',
		insideCodeBlock = false;

	for (let line of lines) {
		if (line.startsWith('```')) {
			insideCodeBlock = !insideCodeBlock;
		}

		let isMarkdownH1 = false,
			isMarkdownH2 = false,
			isHTMLH1 = false,
			isHTMLH2 = false,
			title = '',
			id = '',
			attributes = {};

		if (!insideCodeBlock) {
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
			title = title.split(' ')[1].split('(')[0];
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

(async () => {
	let data = await fetch('../q5.d.ts').then((res) => res.text());
	markdownText = convertTSDefToMarkdown(data);
	parseMarkdownIntoSections(markdownText);
	populateNavigation();
	displayContent();
})();

function populateNavigation() {
	let navbar = document.getElementById('navbar');
	navbar.innerHTML = '';

	for (let [sectionId, section] of Object.entries(sections)) {
		let sectionContainer = createSectionContainer(sectionId, section);
		let subsectionsContainer = createSubsectionsContainer(sectionId, section.subsections);
		sectionContainer.append(subsectionsContainer);
		navbar.append(sectionContainer);
	}
}

function createSectionContainer(sectionId, section) {
	let container = document.createElement('div');
	container.classList.add('section-container');

	let link = document.createElement('a');
	link.textContent = section.title;
	link.href = `#${sectionId}`;
	link.classList.add('section-link');

	let toggle = document.createElement('span');
	toggle.classList.add('toggle-button', 'closed');
	toggle.addEventListener('click', (e) => {
		e.preventDefault();
		e.stopPropagation();
		toggle.classList.toggle('open');
		toggle.classList.toggle('closed');
		let subsectionsContainer = container.querySelector('.subsections-container');

		if (toggle.classList.contains('open')) {
			subsectionsContainer.style.display = 'block';
		} else {
			subsectionsContainer.style.display = 'none';
		}
	});
	link.append(toggle);

	link.addEventListener('click', (e) => {
		e.preventDefault();
		navigateTo(sectionId);
	});

	container.append(link);
	return container;
}

function createSubsectionsContainer(sectionId, subsections) {
	let container = document.createElement('div');
	container.classList.add('subsections-container');
	container.style.display = 'none';

	for (let [subId, subsection] of Object.entries(subsections)) {
		let link = document.createElement('a');
		link.textContent = subsection.title;
		link.href = `#${subId}`;
		link.classList.add('subsection-link');
		link.style.marginLeft = '20px';

		link.addEventListener('click', (e) => {
			e.preventDefault();
			navigateTo(sectionId, subId);
		});

		container.append(link);
	}

	return container;
}

function addCopyButtons() {
	document.querySelectorAll('pre code').forEach((block) => {
		let button = document.createElement('button');
		button.className = 'copy-button';
		button.type = 'button';
		button.innerText = '';

		button.addEventListener('click', () => {
			navigator.clipboard.writeText(block.innerText).then(() => {
				button.textContent = 'Copied!';
				setTimeout(() => (button.textContent = ''), 2000);
			});
		});

		let pre = block.parentNode;
		if (pre.parentNode.classList.contains('code-block-wrapper')) {
			return;
		}

		let wrapper = document.createElement('div');
		wrapper.className = 'code-block-wrapper';
		pre.parentNode.replaceChild(wrapper, pre);
		wrapper.append(pre);
		wrapper.append(button);
	});
}

function generateHeadings() {
	document.querySelectorAll('#content > div').forEach((sectionDiv) => {
		let id = sectionDiv.id;

		sectionDiv.querySelectorAll('h1, h2').forEach((header) => {
			let wrapper = document.createElement('div');
			wrapper.className = 'header-wrapper';

			if (header.tagName === 'H1') {
				wrapper.classList.add('h1-wrapper');
			} else if (header.tagName === 'H2') {
				wrapper.classList.add('h2-wrapper');
			}

			let headingContainer = document.createElement('div');
			headingContainer.className = 'heading-container';
			wrapper.append(headingContainer);

			header.parentNode.insertBefore(wrapper, header);

			let title = header.innerHTML;
			let firstSpace = title.indexOf(' ');
			let lt = title.indexOf('&lt;');
			let emoji = title.slice(0, firstSpace);
			let varName, varType;
			if (lt > 0) {
				varName = title.slice(firstSpace + 1, lt - 1);
				varType = title.slice(lt);
			} else {
				varName = title;
			}

			header.remove();
			header = '';

			let parenIndex = varName.indexOf('(');
			if (parenIndex != -1) {
				let funcParams = varName.slice(parenIndex + 1, -1);
				if (funcParams.length > 0) {
					funcParams = funcParams.replaceAll('?', '');
					varName = varName.slice(0, parenIndex + 1);
					header = `<span class="params">${funcParams}</span><span class="var">)</span>`;
				}
			}
			header = `<span class="emoji">${emoji}</span><h2 id="${varName}"><span class="var">${varName}</span>` + header;

			header += `</h2><span class="type">${varType || ''}</span>`;
			headingContainer.innerHTML = header;

			let button = document.createElement('button');
			button.className = 'link-copy-button';
			button.type = 'button';
			button.innerText = '';

			button.addEventListener('click', () => {
				let url = `${location.origin}${location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1)}#${id}`;
				button.classList.add('copied');
				navigator.clipboard.writeText(url).then(() => {
					button.textContent = '';
					setTimeout(function () {
						button.classList.remove('copied');
					}, 2000);
				});
			});
			headingContainer.append(button);
		});
	});
}

async function executeDataScripts() {
	await Q5.initWebGPU();
	let scripts = contentArea.querySelectorAll('script[type="mini"]');
	for (let script of scripts) {
		let mie = new MiniEditor(script);
		await mie.init();
	}
}

let contentArea = document.getElementById('content');

function populateContentArea() {
	contentArea.classList.remove('fade-in');
	contentArea.classList.add('fade-out');
	let sectionIds = Object.keys(sections);
	let currentSectionIndex = sectionIds.indexOf(currentSectionId);
	updateNavigationActiveState();
	let prevSectionId = currentSectionIndex > 0 ? sectionIds[currentSectionIndex - 1] : null;
	let nextSectionId = currentSectionIndex < sectionIds.length - 1 ? sectionIds[currentSectionIndex + 1] : null;

	contentArea.innerHTML = '';

	let section = sections[currentSectionId];
	let htmlContent = `<div id="${currentSectionId}">${marked.marked(section.content)}</div>`;

	for (let subId in section.subsections) {
		let subsection = section.subsections[subId];
		htmlContent += `<div id="${subId}">${marked.marked(subsection.content)}</div>`;
	}
	contentArea.insertAdjacentHTML('beforeend', htmlContent);

	let navButtonsContainer = document.createElement('div');
	navButtonsContainer.className = 'nav-buttons-container';

	const navButtons = [
		{ id: prevSectionId, class: 'prev-section', text: 'Previous Section' },
		{ id: nextSectionId, class: 'next-section', text: 'Next Section' }
	];

	for (const nav of navButtons) {
		if (!nav.id) continue;

		const button = document.createElement('button');
		button.className = `nav-button ${nav.class}`;

		const label = document.createElement('div');
		label.textContent = nav.text;
		button.append(label);

		const title = document.createElement('div');
		title.textContent = sections[nav.id].title;
		button.append(title);

		button.addEventListener('click', () => navigateTo(nav.id));
		navButtonsContainer.append(button);
	}

	contentArea.append(navButtonsContainer);

	let spacer = document.createElement('div');
	spacer.style.height = '100vh';
	contentArea.append(spacer);

	if (currentLoadedSectionId != currentSectionId) {
		history.pushState(null, '', `#${currentSectionId}`);
	}
	currentLoadedSectionId = currentSectionId;
}

function finalizeFormatting() {
	let codeEls = document.querySelectorAll('code');
	for (let code of codeEls) {
		if (code.innerText[0] == '<') code.classList.add('type');
	}

	contentArea.classList.remove('fade-out');
	contentArea.classList.add('fade-in');
}

let currentSectionId = '';
let currentLoadedSectionId = '';

async function updateMainContent(sectionId) {
	scrollBehavior = 'instant';
	currentSectionId = sectionId;

	populateContentArea();
	addCopyButtons();
	generateHeadings();
	await executeDataScripts();
	finalizeFormatting();

	await new Promise((resolve) => requestAnimationFrame(resolve));

	setTheme(localStorage.getItem('theme') || 'light');
}

let prevStickyWrapper = null;

function updateStickyHeader() {
	const h2Wrappers = document.querySelectorAll('.h2-wrapper');
	let closestWrapper = null;
	let minDistance = Infinity;

	for (const wrapper of h2Wrappers) {
		const distance = Math.abs(wrapper.getBoundingClientRect().top - 66);
		if (distance < minDistance) {
			minDistance = distance;
			closestWrapper = wrapper;
		}
	}

	if (closestWrapper === prevStickyWrapper) return;

	prevStickyWrapper?.classList.remove('sticky');
	closestWrapper.classList.add('sticky');
	prevStickyWrapper = closestWrapper;

	const subsectionId = closestWrapper.parentElement.id;
	for (const link of document.querySelectorAll('.subsection-link')) {
		link.classList.toggle('active', link.getAttribute('href').slice(1) === subsectionId);
	}
}

let scrollBehavior = 'smooth';

function scrollToElement(element) {
	window.scrollTo({
		top: element.offsetTop,
		behavior: scrollBehavior
	});
}

function findSectionAndSubsection(targetId) {
	if (sections[targetId]) {
		return { sectionId: targetId, subsectionId: null };
	}

	for (const [sectionId, section] of Object.entries(sections)) {
		if (section.subsections?.[targetId]) {
			return { sectionId, subsectionId: targetId };
		}
	}

	console.error('No matching section or subsection found for ID:', targetId);
	return { sectionId: null, subsectionId: null };
}

async function navigateTo(sectionId, subsectionId) {
	if (currentLoadedSectionId !== sectionId) {
		scrollBehavior = 'instant';
		await updateMainContent(sectionId);
	} else {
		scrollBehavior = 'smooth';
	}

	let targetId = subsectionId || sectionId;
	history.pushState(null, '', `#${targetId}`);
	scrollToElement(document.getElementById(targetId));
}

function updateNavigationActiveState() {
	const links = document.querySelectorAll('.section-link, .subsection-link');

	for (const link of links) {
		const isActive = link.getAttribute('href') === `#${currentSectionId}`;
		link.classList.toggle('active-section', isActive);

		if (isActive) {
			const container = link.closest('.section-container');
			container.querySelector('.subsections-container').style.display = 'block';
			container.querySelector('.toggle-button').classList.replace('closed', 'open');
		}
	}
}

async function displayContent() {
	const hash = location.hash.slice(1);
	if (!hash) {
		document.querySelector('.section-link, .subsection-link')?.click();
		return;
	}
	const { sectionId, subsectionId } = findSectionAndSubsection(hash);
	await navigateTo(sectionId, subsectionId);
}

// Event Listeners
window.addEventListener('scroll', updateStickyHeader, { passive: true });
window.addEventListener('hashchange', displayContent);

let searchInput = document.getElementById('listSearch');
let searchResultsContainer = document.getElementById('searchResultsContainer');

searchInput.addEventListener('input', () => {
	let searchText = searchInput.value.toLowerCase();
	if (searchText.length > 0) performSearch(searchText);
	else displayPromptMessage('Start typing to search the documentation');
});

displayPromptMessage('Start typing to search the documentation');

function performSearch(searchText) {
	let results = [];

	Object.keys(sections).forEach((sectionId, sectionIndex) => {
		let section = sections[sectionId];
		let sectionTitle = stripMarkdown(stripHtmlTags(section.title.toLowerCase()));
		let sectionEmoji = sectionTitle.split(' ')[0] + ' ';
		let sectionContent = stripMarkdown(stripHtmlTags(section.content.toLowerCase()));

		let res = {
			title: highlightSearchText(sectionTitle, searchText),
			id: sectionId,
			type: 'section',
			context: '',
			priority: 1,
			order: sectionIndex
		};

		if (sectionTitle.includes(searchText)) {
			results.push(res);
		} else if (sectionContent.includes(searchText)) {
			res.priority = 3;
			res.context = highlightSearchText(getContextSnippet(section.content, searchText), searchText);
			results.push(res);
		}

		Object.keys(section.subsections).forEach((subId, subIndex) => {
			let subsection = section.subsections[subId];
			let subsectionTitle = stripMarkdown(stripHtmlTags(subsection.title.toLowerCase()));
			let subsectionContent = stripMarkdown(stripHtmlTags(subsection.content.toLowerCase()));

			let res = {
				title: sectionEmoji + highlightSearchText(subId, searchText),
				id: subId,
				type: 'subsection',
				context: '',
				priority: 2,
				order: subIndex
			};

			if (subsectionTitle.includes(searchText)) {
				results.push(res);
			} else if (subsectionContent.includes(searchText)) {
				res.priority = 3;
				res.context = highlightSearchText(getContextSnippet(subsection.content, searchText), searchText);
				results.push(res);
			}
		});
	});

	results.sort((a, b) => a.priority - b.priority || a.order - b.order);

	// display search results
	searchResultsContainer.innerHTML = '';
	if (results.length === 0) {
		let noResultsElement = document.createElement('div');
		noResultsElement.classList.add('search-result', 'no-results');
		noResultsElement.textContent = 'No results found';
		searchResultsContainer.append(noResultsElement);
	} else {
		results.forEach((result) => {
			let resultElement = document.createElement('div');
			resultElement.classList.add('search-result');

			let parts = result.title.split(' > ');
			let titleHTML = '';

			parts.forEach((part, index) => {
				if (index > 0) {
					titleHTML += `<span class="search-result-divider"> - </span>`;
				}
				let partClass = index === 0 ? 'search-result-section' : 'search-result-subsection';
				titleHTML += `<span class="${partClass}">${part}</span>`;
			});

			resultElement.innerHTML = `${titleHTML}${result.context ? ': ' + result.context : ''}`;

			resultElement.addEventListener('click', () => {
				searchResultsContainer.innerHTML = '';
				let { sectionId, subsectionId } = findSectionAndSubsection(result.id);
				navigateTo(sectionId, subsectionId);
				searchInput.value = '';
				searchResultsContainer.innerHTML = '';
				displayPromptMessage('Start typing to search the documentation');
			});

			searchResultsContainer.append(resultElement);
		});
	}
}

function stripHtmlTags(html) {
	let div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent || div.innerText || '';
}

function stripMarkdown(text) {
	return text
		.replace(/!\[.*?\]\(.*?\)/g, '') // Remove image tags ![alt](url)
		.replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links [text](url)
		.replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold **text** or __text__
		.replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic *text* or _text_
		.replace(/~~(.*?)~~/g, '$1') // Remove strikethrough ~~text~~
		.replace(/`{1,2}[^`](.*?)`{1,2}/g, '$1') // Remove inline code `text` or ``text``
		.replace(/^#{1,6}\s*(.*?)\s*$/gm, '$1') // Remove headings # Heading 1 - ###### Heading 6
		.replace(/^\s*\n\|\s*\w+.*\|\s*\n\|\s*[-|]+\s*\|/g, '') // Remove tables
		.replace(/^\s*\n-\s.*/gm, '') // Remove lists with -
		.replace(/^\s*\n\d+\.\s.*/gm, '') // Remove lists with numbers
		.replace(/>\s*/g, '') // Remove blockquotes >
		.replace(/^\s*(\n)?(\*|-|\+)\s+/gm, '') // Remove unordered lists
		.replace(/^\s*(\n)?[0-9]+\.\s+/gm, '') // Remove ordered lists
		.replace(/^\s*(\n)?\[\s\]/gm, '') // Remove checkboxes
		.replace(/^\s*(\n)?\[(x|X)\]/gm, '') // Remove checked checkboxes
		.replace(/[\*\_]+/g, '') // Remove residual asterisks/underscores
		.trim(); // Trim whitespace
}

function highlightSearchText(text, searchText) {
	let startIndex = text.toLowerCase().indexOf(searchText);
	if (startIndex === -1) {
		return text;
	}
	let endIndex = startIndex + searchText.length;
	let highlightedText =
		text.substring(0, startIndex).replace(/ /g, '&nbsp;') +
		"<span class='highlight'>" +
		text.substring(startIndex, endIndex).replace(/ /g, '&nbsp;') +
		'</span>' +
		text.substring(endIndex).replace(/ /g, '&nbsp;');

	return highlightedText;
}

function getContextSnippet(content, searchText, beforeAfterChars = 30) {
	let lowerContent = stripMarkdown(stripHtmlTags(content.toLowerCase()));
	let startIndex = lowerContent.indexOf(searchText.toLowerCase());
	if (startIndex === -1) return '';

	let start = Math.max(startIndex - beforeAfterChars, 0);
	let end = Math.min(startIndex + searchText.length + beforeAfterChars, lowerContent.length);

	let snippet = lowerContent.substring(start, end);
	if (start > 0) snippet = '...' + snippet;
	if (end < lowerContent.length) snippet += '...';
	return snippet;
}

function displayPromptMessage(message) {
	searchResultsContainer.innerHTML = '';
	let messageElement = document.createElement('div');
	messageElement.classList.add('search-result', 'prompt-message');
	messageElement.textContent = message;
	searchResultsContainer.append(messageElement);
}

searchInput.addEventListener('focus', () => {
	searchResultsContainer.style.display = 'block';
});
searchInput.addEventListener('blur', (event) => {
	setTimeout(() => {
		searchResultsContainer.style.display = 'none';
	}, 200);
});
