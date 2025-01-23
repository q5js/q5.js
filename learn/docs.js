const config = window.docsConfig || {};

toggleNavButton.addEventListener('click', () => {
	navbar.classList.toggle('navopen');
	navbar.classList.toggle('navclose');
});

function winResized() {
	if (window.innerWidth < 1000) {
		navbar.classList.remove('navopen');
		navbar.classList.add('navclose');
	} else {
		navbar.classList.remove('navclose');
		navbar.classList.add('navopen');
	}
}

winResized();
window.addEventListener('resize', winResized);

themeToggle.addEventListener('click', () => {
	if (document.body.classList.contains('dark')) setTheme('light');
	else setTheme('dark');
});

let darkThemeName = 'aijs_dark_modern';
let lightThemeName = 'aijs_light';

function setTheme(theme) {
	if (theme === 'dark') {
		document.body.classList.remove('light');
		document.body.classList.add('dark');
		setMonacoEditorTheme(darkThemeName);
	} else {
		document.body.classList.remove('dark');
		document.body.classList.add('light');
		setMonacoEditorTheme(lightThemeName);
	}
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);
}

const themeCache = {};

function setMonacoEditorTheme(themeName) {
	let attempts = 0;
	const maxAttempts = 10;
	const interval = 100;

	const checkEditorAvailability = () => {
		attempts++;
		if (typeof monaco !== 'undefined' && monaco.editor) {
			if (themeCache[themeName]) {
				monaco.editor.defineTheme('custom-theme', themeCache[themeName]);
				monaco.editor.setTheme('custom-theme');
				modifyTokenizer('javascript', jsCustomTokenizer);
			} else {
				fetch(`./themes/${themeName}.json`)
					.then((response) => response.json())
					.then((themeData) => {
						themeCache[themeName] = themeData;
						monaco.editor.defineTheme('custom-theme', themeData);
						monaco.editor.setTheme('custom-theme');
						modifyTokenizer('javascript', jsCustomTokenizer);
					})
					.catch((error) => {
						console.error('Error loading custom theme:', error);
					});
			}
		} else if (attempts < maxAttempts) {
			setTimeout(checkEditorAvailability, interval);
		}
	};

	checkEditorAvailability();
}

const savedTheme = localStorage.getItem('theme') || config.theme || 'light';
setTheme(savedTheme);

async function modifyTokenizer(languageId, customRules) {
	const allLangs = monaco.languages.getLanguages();
	const { conf, language } = await allLangs.find(({ id }) => id === languageId).loader();

	for (let key in customRules) {
		const value = customRules[key];
		if (key === 'tokenizer') {
			for (let category in value) {
				const tokenDefs = value[category];
				if (!language.tokenizer.hasOwnProperty(category)) {
					language.tokenizer[category] = [];
				}
				if (Array.isArray(tokenDefs)) {
					language.tokenizer[category].unshift(...tokenDefs);
				}
			}
		}
	}
	monaco.languages.setMonarchTokensProvider(languageId, language);
}

const jsCustomTokenizer = {
	tokenizer: { root: [[/[a-zA-Z_$][\w$]*(?=\()/, 'functionName']] }
};

function stripParams(params) {
	return params
		.split(',')
		.map((param) => param.split(':')[0].trim())
		.join(', ');
}

function convertToMarkdown(data) {
	data = data.replaceAll('https://q5js.org/learn', '.');
	let lines = data.split('\n').slice(7, -4),
		markdownCode = '',
		insideJSDoc = false,
		insideParams = false,
		insideProps = false,
		insideExample = false,
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
					const pMatch = line.match(/@(param|prop|property) \{([^\}]+)\} (\S+) *-* *(.*)/);
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
					const returnMatch = line.match(/@returns \{([^\}]+)\} *-* *(.*)/);
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
					insideExample = true;
				}
				jsDocBuffer += line + '\n';
			}
		} else if (line.startsWith('//')) {
			const sectionTitle = line.slice(3);
			curEmoji = sectionTitle.slice(0, sectionTitle.indexOf(' '));
			markdownCode += `# ${sectionTitle}\n\n`;
		} else if (line.startsWith('class ')) {
			const classMatch = line.match(/class\s+(\w+)/);
			currentClassName = classMatch[1];
			inClassDef = true;
		} else if (inClassDef && line.startsWith('constructor')) {
			let params = stripParams(line.slice(11));
			markdownCode += `## ${curEmoji} ${currentClassName}${params} &lt;class&gt;\n\n`;
			markdownCode += jsDocBuffer + '\n\n';
			jsDocBuffer = '';
		} else if (inClassDef && line.startsWith('static')) {
			continue;
		} else if (line.startsWith('function')) {
			const funcMatch = line.match(/(\w+)\s*\((.*)\)\s*:\s*(\w+)/);
			if (funcMatch) {
				let [_, funcName, funcParams, funcType] = funcMatch;
				funcParams = stripParams(funcParams);
				const funcHeader = `## ${curEmoji} ${funcName}(${funcParams}) &lt;${funcType}&gt;\n\n`;
				markdownCode += funcHeader + jsDocBuffer + '\n\n';
				jsDocBuffer = '';
			}
		} else if (line.startsWith('var ') || line.startsWith('let ') || line.startsWith('const ')) {
			const varMatch = line.match(/(var|let|const)\s+(\w+)/);
			if (varMatch) {
				const varName = varMatch[2].trim();
				let type = line.split(':')[1].slice(1, -1);
				const varHeader = `## ${curEmoji} ${varName} &lt;${type}&gt;\n\n`;
				markdownCode += varHeader + jsDocBuffer + '\n\n';
				jsDocBuffer = '';
			}
		} else if (line !== '}') {
			markdownCode += line + '\n';
		}
	}
	return markdownCode;
}

function makeScripts(markdown) {
	let codeBlockCount = 0;

	return markdown.replace(/```js([\s\S]*?)```/g, (match) => {
		let js = match.slice(5, -3);
		return `
<script id="script-${codeBlockCount++}" type="mini">
${js}
</script>`;
	});
}

let markdownSections = {};

let ignoreHashChange = true;

fetch('../q5.d.ts')
	.then((res) => res.text())
	.then((data) => {
		markdownText = convertToMarkdown(data);
		markdownText = makeScripts(markdownText);
		markdownSections = parseMarkdownIntoSections(markdownText);
		populateNavigation(markdownSections);
		loadInitialContent(markdownSections);
	})
	.catch((error) => console.error('Error loading the Markdown file:', error));

window.addEventListener('hashchange', () => {
	if (ignoreHashChange) return;
	loadInitialContent(markdownSections);
});

function parseMarkdownIntoSections(markdownText) {
	let sections = {},
		lines = markdownText.split('\n'),
		currentSectionId = '',
		currentSubsectionId = '',
		insideCodeBlock = false;

	function extractAttributes(line) {
		const attributes = {};
		const dataUrlMatch = line.match(/data-url="(.*?)"/);
		const dataIconMatch = line.match(/data-icon="(.*?)"/);
		const dataColorMatch = line.match(/data-color="(.*?)"/);
		if (dataUrlMatch) attributes.url = dataUrlMatch[1];
		if (dataIconMatch) attributes.icon = dataIconMatch[1];
		if (dataColorMatch) attributes.color = dataColorMatch[1];
		return attributes;
	}

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

			const htmlH1Match = line.match(/<h1.*?id="(.*?)".*?>(.*?)<\/h1>/i);
			const htmlH2Match = line.match(/<h2.*?id="(.*?)".*?>(.*?)<\/h2>/i);
			if (htmlH1Match) {
				id = htmlH1Match[1];
				title = htmlH1Match[2];
				attributes = extractAttributes(line);
				isHTMLH1 = true;
			} else if (htmlH2Match) {
				id = htmlH2Match[1];
				title = htmlH2Match[2];
				attributes = extractAttributes(line);
				isHTMLH2 = true;
			}
		}

		if (isMarkdownH1 || isHTMLH1) {
			if (!isHTMLH1) {
				id = title.slice(title.indexOf(' ') + 1).replace(/\s+/g, '-');
			}
			id += '-section';
			currentSectionId = id;
			currentSubsectionId = '';
			sections[id] = { title: title, content: line, subsections: {}, ...attributes };
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

function populateNavigation(sections) {
	const navbar = document.getElementById('navbar');
	navbar.innerHTML = '';

	Object.keys(sections).forEach((sectionId) => {
		const section = sections[sectionId];
		const sectionContainer = document.createElement('div');
		sectionContainer.classList.add('section-container');
		const sectionLink = document.createElement('a');
		sectionLink.textContent = section.title;
		sectionLink.href = `#${sectionId}`;
		sectionLink.classList.add('section-link');

		// Add data-url and data-icon attributes if they exist
		if (section.url) {
			sectionLink.setAttribute('data-url', section.url);
			sectionLink.style.setProperty('--header-url', section.url);
		}
		if (section.color) {
			sectionLink.setAttribute('data-color', section.color);
			sectionLink.style.setProperty('--header-color', section.color);
		}
		if (section.icon) {
			sectionLink.setAttribute('data-icon', section.icon);
			sectionLink.style.setProperty('--header-icon', `"${section.icon}"`);
			sectionLink.style.setProperty('--header-icon-space', `"\\00A0\\00A0\\00A0"`);
		} else {
			sectionLink.style.setProperty('--header-icon-space', `""`);
		}

		const toggleButton = document.createElement('span');
		toggleButton.classList.add('toggle-button', 'closed');
		toggleButton.onclick = function (e) {
			e.stopPropagation();
			const subsectionsContainer = this.parentNode.nextElementSibling;
			if (subsectionsContainer.style.display === 'none' || !subsectionsContainer.style.display) {
				subsectionsContainer.style.display = 'block';
				this.classList.remove('closed');
				this.classList.add('open');
			} else {
				subsectionsContainer.style.display = 'none';
				this.classList.remove('open');
				this.classList.add('closed');
			}
		};
		sectionLink.appendChild(toggleButton);
		sectionLink.addEventListener('click', (e) => {
			e.preventDefault();
			if (currentLoadedSectionId === sectionId) {
				const isVisible = subsectionsContainer.style.display !== 'none';
				subsectionsContainer.style.display = isVisible ? 'none' : 'block';
				const toggleButton = e.target.querySelector('.toggle-button');
				if (toggleButton) {
					if (isVisible) {
						toggleButton.classList.remove('open');
						toggleButton.classList.add('closed');
					} else {
						toggleButton.classList.remove('closed');
						toggleButton.classList.add('open');
					}
				}
			} else {
				updateMainContent(sectionId, sections);
			}
		});

		sectionContainer.appendChild(sectionLink);
		const subsectionsContainer = document.createElement('div');
		subsectionsContainer.style.display = 'none';

		Object.keys(section.subsections).forEach((subId) => {
			const subsection = section.subsections[subId];
			const subLink = document.createElement('a');
			subLink.textContent = `${subsection.title}`;
			subLink.href = `#${subId}`;
			subLink.classList.add('subsection-link');
			subLink.style.marginLeft = '20px';

			// Add data-url and data-icon attributes if they exist
			if (subsection.url) {
				subLink.setAttribute('data-url', subsection.url);
				subLink.style.setProperty('--header-url', subsection.url);
			}
			if (subsection.color) {
				subLink.setAttribute('data-color', subsection.color);
				subLink.style.setProperty('--header-color', subsection.color);
			}
			if (subsection.icon) {
				subLink.setAttribute('data-icon', subsection.icon);
				subLink.style.setProperty('--header-icon', `"${subsection.icon}"`);
				subLink.style.setProperty('--header-icon-space', `"\\00A0\\00A0\\00A0"`);
			} else {
				subLink.style.setProperty('--header-icon-space', `""`);
			}

			subLink.addEventListener('click', (e) => {
				e.preventDefault();
				if (currentLoadedSectionId === sectionId) {
					const subsectionElement = document.getElementById(subId);
					if (subsectionElement) {
						history.pushState(null, '', `#${subId}`);
						const contentContainer = document.getElementById('content');
						scrollBehavior = 'smooth';
						scrollToElementWithinContainer(contentContainer, subsectionElement);
					}
				} else {
					updateMainContent(sectionId, sections, () => {
						setTimeout(() => {
							const subsectionElement = document.getElementById(subId);
							if (subsectionElement) {
								history.pushState(null, '', `#${subId}`);
								const contentContainer = document.getElementById('content');
								scrollToElementWithinContainer(contentContainer, subsectionElement);
							}
						}, 0);
					});
				}
			});
			subsectionsContainer.appendChild(subLink);
		});

		sectionContainer.appendChild(subsectionsContainer);
		navbar.appendChild(sectionContainer);
	});
}

let scrollBehavior = 'smooth';
function scrollToElementWithinContainer(container, element) {
	const offsetTop = element.offsetTop;
	window.scrollTo({
		top: offsetTop,
		behavior: scrollBehavior
	});
}

let currentSectionId = '';
let currentLoadedSectionId = '';
async function executeDataScripts(content) {
	const scripts = content.querySelectorAll('script[type="mini"]');
	for (let script of scripts) {
		let scriptContent = script.innerHTML.slice(0, -1).replaceAll('\t', '  ').trim();
		let id = 'editor-' + script.id.slice(7);
		let container = document.createElement('div');
		container.id = id;
		container.className = 'editor-container';
		script.insertAdjacentElement('beforebegin', container);
		let mini = new MiniEditor(container, scriptContent);
		await mini.init();
	}
}

async function updateMainContent(sectionId, sections, callback) {
	scrollBehavior = 'instant';
	const contentArea = document.getElementById('content');

	contentArea.classList.remove('fade-in');
	contentArea.classList.add('fade-out');
	const sectionIds = Object.keys(sections);
	const currentSectionIndex = sectionIds.indexOf(sectionId);
	currentSectionId = sectionId;
	updateNavigationActiveState();
	const prevSectionId = currentSectionIndex > 0 ? sectionIds[currentSectionIndex - 1] : null;
	const nextSectionId = currentSectionIndex < sectionIds.length - 1 ? sectionIds[currentSectionIndex + 1] : null;

	contentArea.innerHTML = '';

	const section = sections[sectionId];
	let htmlContent = `<div id="${sectionId}">${marked.marked(section.content)}</div>`;

	for (let subId in section.subsections) {
		const subsection = section.subsections[subId];
		htmlContent += `<div id="${subId}">${marked.marked(subsection.content)}</div>`;
	}
	contentArea.insertAdjacentHTML('beforeend', htmlContent);

	const navButtonsContainer = document.createElement('div');
	navButtonsContainer.className = 'nav-buttons-container';

	if (prevSectionId) {
		const prevButton = document.createElement('button');
		prevButton.className = 'nav-button prev-section';
		const prevLabel = document.createElement('div');
		prevLabel.textContent = 'Previous Section';
		prevButton.appendChild(prevLabel);
		const prevTitle = document.createElement('div');
		prevTitle.textContent = sections[prevSectionId].title;
		prevButton.appendChild(prevTitle);

		prevButton.addEventListener('click', () => updateMainContent(prevSectionId, sections));
		navButtonsContainer.appendChild(prevButton);
	}

	if (nextSectionId) {
		const nextButton = document.createElement('button');
		nextButton.className = 'nav-button next-section';
		const nextLabel = document.createElement('div');
		nextLabel.textContent = 'Next Section';
		nextButton.appendChild(nextLabel);
		const nextTitle = document.createElement('div');
		nextTitle.textContent = sections[nextSectionId].title;
		nextButton.appendChild(nextTitle);

		nextButton.addEventListener('click', () => updateMainContent(nextSectionId, sections));
		navButtonsContainer.appendChild(nextButton);
	}
	contentArea.appendChild(navButtonsContainer);
	const spacer = document.createElement('div');
	spacer.style.height = '100vh';
	contentArea.appendChild(spacer);

	// ignoreHashChange = true;
	// if (currentLoadedSectionId && currentLoadedSectionId !== sectionId) {
	// 	window.location.hash = sectionId;
	// 	currentLoadedSectionId = sectionId;
	// }
	// ignoreHashChange = false;

	currentLoadedSectionId = sectionId;

	addCopyButtons();
	generateHeadings();
	convertMarkdownLinksToNavigationButtons(sections);
	await executeDataScripts(contentArea);
	updateStickyHeader();
	contentArea.classList.remove('fade-out');
	contentArea.classList.add('fade-in');

	if (typeof callback === 'function') {
		requestAnimationFrame(callback);
	}
	const savedTheme = localStorage.getItem('theme') || 'light';

	setTimeout(() => {
		setTheme(savedTheme);
	}, 0);

	document.querySelectorAll('.grid-button').forEach((button) => {
		const icon = button.getAttribute('data-icon');
		const color = button.getAttribute('data-color');
		if (icon) {
			button.style.setProperty('--button-icon', `"${icon}"`);
		}
		if (color) {
			button.style.setProperty('--icon-color', color);
		}
		button.addEventListener('click', () => {
			const dataUrl = button.getAttribute('data-url');
			navigateToSection(dataUrl, markdownSections);
		});
	});
	document.querySelectorAll('h1[data-icon], h2[data-icon]').forEach((header) => {
		const icon = header.getAttribute('data-icon');
		const color = header.getAttribute('data-color');
		if (icon) {
			header.style.setProperty('--header-icon', `"${icon}"`);
		}
		if (color) {
			header.style.setProperty('--header-color', color);
		}
	});
	document.querySelectorAll('code').forEach((code) => {
		if (code.innerText[0] == '<') {
			code.classList.add('type');
		}
	});
}
function updateStickyHeader() {
	const h2Wrappers = document.querySelectorAll('.h2-wrapper');
	let closestWrapper = null;
	let closestDistance = Infinity;

	h2Wrappers.forEach((wrapper) => {
		const rect = wrapper.getBoundingClientRect();
		const distance = Math.abs(rect.top); // Use absolute value to get closest to top

		if (distance < closestDistance) {
			closestDistance = distance;
			closestWrapper = wrapper;
		}
	});

	h2Wrappers.forEach((wrapper) => {
		wrapper.classList.remove('sticky');
	});

	if (closestWrapper) {
		closestWrapper.classList.add('sticky');

		const h2Element = closestWrapper.querySelector('h2');
		const subsectionId = h2Element ? h2Element.getAttribute('id') : null;

		if (subsectionId) {
			const navLinks = document.querySelectorAll('.subsection-link');
			let isActiveSet = false;

			navLinks.forEach((link) => {
				const href = link.getAttribute('href');

				if (href.includes(subsectionId) && !isActiveSet) {
					link.classList.add('active');
					isActiveSet = true; // Ensure only one link is active
				} else {
					link.classList.remove('active');
				}
			});
		}
	}
}

const contentDiv = document.getElementById('content');
contentDiv.addEventListener('scroll', updateStickyHeader);

function updateNavigationActiveState() {
	const links = document.querySelectorAll('.section-link, .subsection-link');
	links.forEach((link) => {
		if (link.getAttribute('href') === `#${currentSectionId}`) {
			link.classList.add('active-section');
			const parentSectionContainer = link.closest('.section-container');
			if (parentSectionContainer) {
				const subsectionsContainer = parentSectionContainer.querySelector('div');
				const toggleButton = parentSectionContainer.querySelector('.toggle-button');
				if (subsectionsContainer && toggleButton) {
					subsectionsContainer.style.display = 'block';
					toggleButton.classList.add('open');
					toggleButton.classList.remove('closed');
				}
			}
		} else {
			link.classList.remove('active-section');
		}
	});
}

function loadInitialContent(sections) {
	ignoreHashChange = true;
	const hash = location.hash.replace('#', '');
	let sectionId = null;
	let subsectionId = null;

	if (sections[hash]) {
		sectionId = hash;
	} else {
		for (const [secId, secData] of Object.entries(sections)) {
			if (secData.subsections && secData.subsections[hash]) {
				sectionId = secId;
				subsectionId = hash;
				break;
			}
		}
	}

	if (sectionId) {
		updateMainContent(sectionId, sections, () => {
			if (subsectionId) {
				simulateSubsectionClick(subsectionId);
			}
			ignoreHashChange = false;
		});
	} else {
		const firstLink = document.querySelector('.section-link, .subsection-link');
		if (firstLink) {
			firstLink.click();
		}
		ignoreHashChange = false;
	}
}

function simulateSubsectionClick(subsectionId) {
	const subLink = document.querySelector(`a[href="#${subsectionId}"]`);
	if (subLink) {
		subLink.click();
	} else {
		console.error('Subsection link not found for:', subsectionId);
	}
}

function convertMarkdownLinksToNavigationButtons(sections) {
	document.querySelectorAll('#content a[href^="#"]').forEach((link) => {
		const sectionId = link.getAttribute('href').substring(1);
		let isSubsectionLink = false;
		for (const [secId, secData] of Object.entries(sections)) {
			if (secId === sectionId) {
				isSubsectionLink = false;
				break;
			} else if (secData.subsections && Object.keys(secData.subsections).includes(sectionId)) {
				isSubsectionLink = true;
				break;
			}
		}
		const button = document.createElement('button');
		button.textContent = link.textContent;
		button.className = `custom-nav-button ${isSubsectionLink ? 'subsection-nav' : 'section-nav'}`;
		button.type = 'button';
		button.addEventListener('click', (e) => {
			e.preventDefault();
			navigateToSection(sectionId, sections);
		});
		link.parentNode.replaceChild(button, link);
	});
}

function navigateToSection(targetId, sections) {
	let found = false;
	for (const [sectionId, section] of Object.entries(sections)) {
		if (sectionId === targetId) {
			loadContentForSection(targetId, sections);
			found = true;
			break;
		} else if (section.subsections && section.subsections[targetId]) {
			loadContentForSection(sectionId, sections, () => {
				simulateSubsectionClick(targetId);
			});
			found = true;
			break;
		}
	}
	if (!found) {
		console.error('No matching section or subsection found for ID:', targetId);
	}
}

function loadContentForSection(sectionId, sections, callback) {
	if (currentLoadedSectionId === sectionId) {
		const subsectionElement = document.getElementById(sectionId);
		if (subsectionElement) {
			history.pushState(null, '', `#${sectionId}`);
			const contentContainer = document.getElementById('content');
			scrollBehavior = 'smooth';
			scrollToElementWithinContainer(contentContainer, subsectionElement);
		}
	} else {
		updateMainContent(sectionId, sections, () => {
			setTimeout(() => {
				const subsectionElement = document.getElementById(sectionId);
				if (subsectionElement) {
					history.pushState(null, '', `#${sectionId}`);
					const contentContainer = document.getElementById('content');
					scrollToElementWithinContainer(contentContainer, subsectionElement);
				}
				if (typeof callback === 'function') {
					callback();
				}
			}, 0);
		});
	}
}

function addCopyButtons() {
	document.querySelectorAll('pre code').forEach((block) => {
		const button = document.createElement('button');
		button.className = 'copy-button';
		button.type = 'button';
		button.innerText = '';

		button.addEventListener('click', () => {
			navigator.clipboard.writeText(block.innerText).then(() => {
				button.textContent = 'Copied!';
				setTimeout(() => (button.textContent = ''), 2000);
			});
		});

		const pre = block.parentNode;
		if (pre.parentNode.classList.contains('code-block-wrapper')) {
			return;
		}

		const wrapper = document.createElement('div');
		wrapper.className = 'code-block-wrapper';
		pre.parentNode.replaceChild(wrapper, pre);
		wrapper.appendChild(pre);
		wrapper.appendChild(button);
	});
}
function generateHeadings() {
	document.querySelectorAll('#content > div').forEach((sectionDiv) => {
		const id = sectionDiv.id;

		sectionDiv.querySelectorAll('h1, h2').forEach((header) => {
			const wrapper = document.createElement('div');
			wrapper.className = 'header-wrapper';

			if (header.tagName === 'H1') {
				wrapper.classList.add('h1-wrapper');
			} else if (header.tagName === 'H2') {
				wrapper.classList.add('h2-wrapper');
			}

			let headingContainer = document.createElement('div');
			headingContainer.className = 'heading-container';
			wrapper.appendChild(headingContainer);

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

			const button = document.createElement('button');
			button.className = 'link-copy-button';
			button.type = 'button';
			button.innerText = '';

			button.addEventListener('click', () => {
				const url = `${location.origin}${location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1)}#${id}`;
				button.classList.add('copied');
				navigator.clipboard.writeText(url).then(() => {
					button.textContent = '';
					setTimeout(function () {
						button.classList.remove('copied');
					}, 2000);
				});
			});
			headingContainer.appendChild(button);
		});
	});
}

const searchInput = document.getElementById('listSearch');
const searchResultsContainer = document.getElementById('searchResultsContainer');

searchInput.addEventListener('input', () => {
	const searchText = searchInput.value.toLowerCase();
	if (searchText.length > 0) {
		performSearch(searchText);
	} else {
		displayPromptMessage('Start typing to search the documentation');
	}
});

displayPromptMessage('Start typing to search the documentation');

function performSearch(searchText) {
	const results = [];
	const sections = markdownSections;

	Object.keys(sections).forEach((sectionId, sectionIndex) => {
		const section = sections[sectionId];
		const sectionTitle = stripMarkdown(stripHtmlTags(section.title.toLowerCase()));
		const sectionEmoji = sectionTitle.split(' ')[0] + ' ';
		const sectionContent = stripMarkdown(stripHtmlTags(section.content.toLowerCase()));

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
			const subsection = section.subsections[subId];
			const subsectionTitle = stripMarkdown(stripHtmlTags(subsection.title.toLowerCase()));
			const subsectionContent = stripMarkdown(stripHtmlTags(subsection.content.toLowerCase()));

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
	displaySearchResults(results, searchText);
}

function stripHtmlTags(html) {
	const div = document.createElement('div');
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
	const startIndex = text.toLowerCase().indexOf(searchText);
	if (startIndex === -1) {
		return text;
	}
	const endIndex = startIndex + searchText.length;
	const highlightedText =
		text.substring(0, startIndex).replace(/ /g, '&nbsp;') +
		"<span class='highlight'>" +
		text.substring(startIndex, endIndex).replace(/ /g, '&nbsp;') +
		'</span>' +
		text.substring(endIndex).replace(/ /g, '&nbsp;');

	return highlightedText;
}

function getContextSnippet(content, searchText, beforeAfterChars = 30) {
	const lowerContent = stripMarkdown(stripHtmlTags(content.toLowerCase()));
	const startIndex = lowerContent.indexOf(searchText.toLowerCase());
	if (startIndex === -1) return '';

	const start = Math.max(startIndex - beforeAfterChars, 0);
	const end = Math.min(startIndex + searchText.length + beforeAfterChars, lowerContent.length);

	let snippet = lowerContent.substring(start, end);
	if (start > 0) snippet = '...' + snippet;
	if (end < lowerContent.length) snippet += '...';
	return snippet;
}

function displaySearchResults(results, searchText) {
	searchResultsContainer.innerHTML = '';
	if (results.length === 0) {
		const noResultsElement = document.createElement('div');
		noResultsElement.classList.add('search-result', 'no-results');
		noResultsElement.textContent = 'No results found';
		searchResultsContainer.appendChild(noResultsElement);
	} else {
		results.forEach((result) => {
			const resultElement = document.createElement('div');
			resultElement.classList.add('search-result');

			const parts = result.title.split(' > ');
			let titleHTML = '';

			parts.forEach((part, index) => {
				if (index > 0) {
					titleHTML += `<span class="search-result-divider"> - </span>`;
				}
				const partClass = index === 0 ? 'search-result-section' : 'search-result-subsection';
				titleHTML += `<span class="${partClass}">${part}</span>`;
			});

			resultElement.innerHTML = `${titleHTML}${result.context ? ': ' + result.context : ''}`;

			resultElement.addEventListener('click', () => {
				searchResultsContainer.innerHTML = '';
				scrollToSectionOrSubsection(result.id);
				displayPromptMessage('Start typing to search the documentation');
			});

			searchResultsContainer.appendChild(resultElement);
		});
	}
}

function displayPromptMessage(message) {
	searchResultsContainer.innerHTML = '';
	const messageElement = document.createElement('div');
	messageElement.classList.add('search-result', 'prompt-message');
	messageElement.textContent = message;
	searchResultsContainer.appendChild(messageElement);
}

searchInput.addEventListener('focus', () => {
	searchResultsContainer.style.display = 'block';
});
searchInput.addEventListener('blur', (event) => {
	setTimeout(() => {
		searchResultsContainer.style.display = 'none';
	}, 200);
});

function scrollToSectionOrSubsection(id) {
	let sectionId = null;
	let isSubsection = false;
	Object.keys(markdownSections).forEach((secId) => {
		if (markdownSections[secId].subsections && markdownSections[secId].subsections[id]) {
			sectionId = secId;
			isSubsection = true;
		} else if (markdownSections[id]) {
			sectionId = id;
		}
	});

	if (sectionId) {
		if (isSubsection) {
			updateMainContent(sectionId, markdownSections, () => {
				simulateSubsectionClick(id);
			});
		} else {
			updateMainContent(sectionId, markdownSections);
		}
	} else {
		console.error('No matching section or subsection found for ID:', id);
	}
	searchInput.value = '';
	searchResultsContainer.innerHTML = '';
}
