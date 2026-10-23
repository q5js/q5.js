/**
 * q5/learn/build.js
 *
 * AI was used to generate parts of this script.
 */

// Q5.online = false;

toggleNavButton.addEventListener('pointerup', () => {
	navbar.classList.toggle('navclose');
	navbar.classList.toggle('navopen');
});

function winResized() {
	if (window.matchMedia('(max-width: 999px)').matches) {
		navbar.classList.replace('navopen', 'navclose');
	} else {
		navbar.classList.replace('navclose', 'navopen');
	}
}
winResized();
window.addEventListener('resize', winResized);

function stripParams(params) {
	return splitTypeScriptParams(params)
		.map((param) => param.split(':')[0].trim())
		.join(', ');
}

let sections = {};
// Current section state (must be declared before loader functions)
let currentSectionId = '';
let currentLoadedSectionId = '';
let currentSubsectionId = '';

const learnPages = [
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

function splitTypeScriptParams(params) {
	const result = [];
	let start = 0;
	let depth = 0;

	for (let i = 0; i < params.length; i++) {
		const char = params[i];
		if (char === '(' || char === '[' || char === '{' || char === '<') depth++;
		else if (char === ')' || char === ']' || char === '}' || char === '>') depth--;
		else if (char === ',' && depth === 0) {
			result.push(params.slice(start, i).trim());
			start = i + 1;
		}
	}

	if (params.slice(start).trim()) result.push(params.slice(start).trim());
	return result;
}

function parseBaseDtsMetadata(data) {
	const bySection = {};
	const byName = {};
	const classStack = [];
	let section = '';
	let braceDepth = 0;

	function addRecord(record) {
		if (!section || !record.fullName) return;
		if (!bySection[section]) bySection[section] = [];
		if (bySection[section].some((existing) => existing.fullName === record.fullName)) return;
		record.emoji = bySection[section][0]?.emoji || currentEmoji;
		bySection[section].push(record);
		byName[record.fullName.toLowerCase()] ||= record;
		byName[record.name.toLowerCase()] ||= record;
	}

	let currentEmoji = '';
	const lines = data.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();
		const sectionMatch = trimmed.match(/^\/\/\s+([^\w\s]+)\s+([\w-]+)\s*$/);
		if (sectionMatch) {
			currentEmoji = sectionMatch[1].replace(/\uFE0F/g, '');
			section = sectionMatch[2];
		}

		const classMatch = trimmed.match(/^(?:declare\s+)?(?:class|interface)\s+([\w$]+)\b.*\{/);
		if (classMatch) {
			const name = classMatch[1];
			addRecord({ name, fullName: name, kind: 'class', type: 'class' });
		}

		const functionMatch = trimmed.match(/^(?:static\s+)?(?:function\s+)?([\w$]+)\s*\(/);
		const isFunctionDeclaration = trimmed.startsWith('function ') || classStack.length > 0;
		if (functionMatch && isFunctionDeclaration) {
			const name = functionMatch[1];
			let end = i;
			while (end < lines.length - 1 && !/;\s*$/.test(lines[end].trim())) end++;
			const signature = lines
				.slice(i, end + 1)
				.join(' ')
				.replace(/\s+/g, ' ')
				.trim()
				.replace(/;\s*$/, '');
			const openIndex = signature.indexOf('(', functionMatch.index || 0);
			let depth = 0;
			let closeIndex = -1;
			for (let j = openIndex; j < signature.length; j++) {
				if (signature[j] === '(') depth++;
				else if (signature[j] === ')' && --depth === 0) {
					closeIndex = j;
					break;
				}
			}

			if (closeIndex !== -1) {
				const params = signature.slice(openIndex + 1, closeIndex);
				const returnType = signature
					.slice(closeIndex + 1)
					.replace(/^\s*:\s*/, '')
					.trim();
				const className = classStack.at(-1)?.name || '';
				const fullName = className ? `${className}.${name}` : name;
				addRecord({
					name,
					fullName,
					kind: name === 'constructor' ? 'constructor' : 'function',
					params,
					returnType: name === 'constructor' ? 'class' : returnType || 'void',
					parsedParams: splitTypeScriptParams(params).map((param) => {
						const match = param.match(/^(\.\.\.)?([\w$]+)(\?)?\s*:\s*(.+)$/);
						return match
							? { name: match[2], optional: Boolean(match[3]), type: match[4] }
							: { name: param, optional: false, type: '' };
					})
				});
			}

			while (i < end) {
				braceDepth += (lines[i].match(/{/g) || []).length - (lines[i].match(/}/g) || []).length;
				while (classStack.length && braceDepth < classStack.at(-1).depth) classStack.pop();
				i++;
			}
		} else {
			const variableMatch = trimmed.match(
				/^(?:(?:static\s+)?(?:let|const|var)\s+|(?:static\s+)?)([\w$]+)\??\s*:\s*(.+);$/
			);
			if (variableMatch && !trimmed.startsWith('function ')) {
				const className = classStack.at(-1)?.name || '';
				const name = variableMatch[1];
				addRecord({
					name,
					fullName: className ? `${className}.${name}` : name,
					kind: 'property',
					type: variableMatch[2].trim()
				});
			}
		}

		braceDepth += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
		if (classMatch) {
			const depth = braceDepth;
			if (depth > 0) classStack.push({ name: classMatch[1], depth });
		}
		while (classStack.length && braceDepth < classStack.at(-1).depth) classStack.pop();
	}

	return { bySection, byName };
}

function parseLocaleAliases(data) {
	const membersMatch = data.match(/members:\s*\{([\s\S]*?)^\s*\},/m);
	if (!membersMatch) throw new Error('Could not parse Spanish API translations');

	const aliases = {};
	for (const match of membersMatch[1].matchAll(/^\s*([\w$]+):\s*'([^']+)'/gm)) {
		aliases[match[2].toLowerCase()] = match[1];
	}
	return aliases;
}

function formatTypeMetadataBlock(lines, record) {
	const meaningfulLines = lines.filter((line) => line.trim());
	if (
		!meaningfulLines.some((line) => /^@\w+/.test(line)) ||
		meaningfulLines.some((line) => !/^(?:@\w+|\s)/.test(line))
	) {
		return null;
	}

	const output = [];
	const paramCount = lines.filter((line) => line.startsWith('@param ')).length;
	let paramIndex = 0;
	let hasParamsHeading = false;

	for (const line of lines) {
		const paramMatch = line.match(/^@param\s+\{([^}]+)\}\s+(\[[^\]]+\]|\S+)\s*-?\s*(.*)$/);
		if (paramMatch) {
			if (!hasParamsHeading) {
				output.push('### Params', '');
				hasParamsHeading = true;
			}
			const [, markdownType, rawName, description] = paramMatch;
			const optionalName = rawName.startsWith('[');
			const name = optionalName ? rawName.slice(1, -1) : rawName;
			const declared =
				record?.parsedParams?.find((param) => param.name === name) ||
				(record?.parsedParams?.length === paramCount ? record.parsedParams[paramIndex] : null);
			const type = declared?.type || markdownType;
			const optional = declared ? declared.optional : optionalName;
			output.push(
				`- \`${name}\` \`<${type}>\`${optional ? ' (optional)' : ''}${description ? ` - ${description}` : ''}`
			);
			paramIndex++;
			continue;
		}

		const returnMatch = line.match(/^@returns?\s+\{([^}]+)\}\s*-?\s*(.*)$/);
		if (returnMatch) {
			const type = record?.returnType || returnMatch[1];
			output.push('### Returns', '', `- \`<${type}>\`${returnMatch[2] ? ` - ${returnMatch[2]}` : ''}`);
			continue;
		}

		const typeMatch = line.match(/^@type\s+\{([^}]+)\}\s*-?\s*(.*)$/);
		if (typeMatch) {
			const type = record?.type || typeMatch[1];
			output.push(`- \`<${type}>\`${typeMatch[2] ? ` - ${typeMatch[2]}` : ''}`);
			continue;
		}

		const defaultMatch = line.match(/^@default\s*(.*)$/);
		if (defaultMatch) {
			output.push(`- Default: \`${defaultMatch[1]}\``);
			continue;
		}

		if (/^\s+/.test(line) && output.length) output.push(`  ${line.trim()}`);
		else if (line.trim()) output.push(line);
	}

	return output.join('\n');
}

function enrichMarkdownPage(markdownText, metadata, locale, englishMarkdownText = markdownText, aliases = {}) {
	const lines = markdownText.split('\n');
	const sectionHeading = lines.find((line) => line.startsWith('# '));
	const englishSectionHeading = englishMarkdownText.split('\n').find((line) => line.startsWith('# '));
	const sectionName = (englishSectionHeading || sectionHeading)?.slice(2).trim().toLowerCase();
	const sectionEmoji = metadata.bySection[sectionName]?.[0]?.emoji;
	const getHeadings = (text) => {
		const headings = [];
		let inFence = false;
		for (const line of text.split('\n')) {
			if (line.startsWith('````')) {
				if (inFence) inFence = false;
				continue;
			}
			if (!inFence && line.startsWith('## ')) headings.push(line);
			if (line.startsWith('```')) inFence = !inFence;
		}
		return headings;
	};
	const headings = getHeadings(markdownText);
	const englishHeadings = getHeadings(englishMarkdownText);
	const englishRecords = englishHeadings.map((heading) => {
		const name = heading.slice(3).trim().split(/\s+/)[0].split('(')[0];
		return metadata.byName[name.toLowerCase()] || metadata.byName[aliases[name.toLowerCase()]?.toLowerCase()] || null;
	});
	const canMatchByOrder = locale !== 'en' && headings.length === englishRecords.length;

	const enriched = [];
	let currentRecord = null;
	let inFence = false;
	let headingIndex = 0;
	let inOuterFence = false;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (i === 0 && line.startsWith('# ') && sectionEmoji) {
			enriched.push(`# ${sectionEmoji} ${line.slice(2)}`);
			continue;
		}
		if (line.startsWith('````')) {
			inOuterFence = !inOuterFence;
			if (!inOuterFence && inFence) {
				enriched.push('```');
				inFence = false;
			}
			continue;
		}
		if (!inFence && line.startsWith('## ')) {
			const title = line.slice(3).trim();
			const name = title.split(/\s+/)[0].split('(')[0];
			const record =
				metadata.byName[name.toLowerCase()] ||
				metadata.byName[aliases[name.toLowerCase()]?.toLowerCase()] ||
				(canMatchByOrder ? englishRecords[headingIndex] : null);
			headingIndex++;
			currentRecord = record || null;

			if (record) {
				const emoji = record.emoji ? `${record.emoji} ` : '';
				if (record.kind === 'function' || record.kind === 'constructor') {
					const params = stripParams(record.params);
					const type = record.returnType || 'void';
					enriched.push(`## ${emoji}${title.split(/\s+/)[0]}(${params}) &lt;${type}&gt;`);
				} else {
					enriched.push(`## ${emoji}${title} &lt;${record.type || 'class'}&gt;`);
				}
			} else {
				enriched.push(line);
			}
			continue;
		}

		if (!inFence && line.trim() === '```') {
			let end = i + 1;
			while (end < lines.length && lines[end].trim() !== '```') end++;
			if (end < lines.length) {
				const formatted = formatTypeMetadataBlock(lines.slice(i + 1, end), currentRecord);
				if (formatted !== null) {
					enriched.push(formatted);
					i = end;
					continue;
				}
			}
		}

		if (!inFence && /^@(?:param|returns?|type)\b/.test(line)) {
			let end = i + 1;
			while (end < lines.length && (/^@(?:param|returns?|type)\b/.test(lines[end]) || /^\s+-/.test(lines[end]))) end++;
			const formatted = formatTypeMetadataBlock(lines.slice(i, end), currentRecord);
			if (formatted !== null) {
				enriched.push(formatted);
				i = end - 1;
				continue;
			}
		}

		enriched.push(line);
		if (line.startsWith('```') && !line.startsWith('````')) inFence = !inFence;
	}

	return enriched.join('\n');
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

// Renderer selection remains controlled by the legacy URL flags.
const urlParams = new URLSearchParams(window.location.search);
let queryString = window.location.search;

// `?c2d` continues to select the legacy Canvas2D documentation.
const isWebGPU = !urlParams.has('c2d');
// Language selection is saved in localStorage. Fallback to any URL param
// for backward compatibility, then default to English `en`.
let locale = localStorage.getItem('locale') || urlParams.get('locale') || 'en';
let codeLang = urlParams.has('python') ? 'py' : 'js';

function updateCodeLangUrl() {
	if (codeLang === 'py') urlParams.set('python', '');
	else urlParams.delete('python');

	queryString = urlParams.toString().replace(/(^|&)(webgpu|c2d|python)=(?=&|$)/g, '$1$2');
	queryString = queryString ? `?${queryString}` : '';
	history.replaceState(null, '', `${location.pathname}${queryString}${location.hash}`);
}

async function loadDocsAndRender() {
	MiniEditor.locale = locale;

	// Snapshot everything needed BEFORE data or language changes.
	const sectionKeys = Object.keys(sections);
	const prevSectionIndex = sectionKeys.indexOf(currentSectionId);
	const prevSubId = currentSubsectionId; // e.g. "canvas", "q5.canvas", "Vector.add"

	// Positional fallback in case translation lookup fails.
	let prevSubsectionIndex = -1;
	if (prevSubId && currentSectionId && sections[currentSectionId]) {
		const subKeys = Object.keys(sections[currentSectionId].subsections || {});
		prevSubsectionIndex = subKeys.indexOf(prevSubId);
	}

	const exampleMode = codeLang === 'py' ? 'python' : isWebGPU ? 'webgpu' : 'c2d';
	const [baseDtsResponse, pageResponses, englishPageResponses, localeAliasesResponse] = await Promise.all([
		fetch('/lang/en/learn/en.d.ts'),
		Promise.all(learnPages.map((page) => fetch(`/lang/${locale}/learn/${page}.md`))),
		locale === 'en' ? Promise.resolve(null) : Promise.all(learnPages.map((page) => fetch(`/lang/en/learn/${page}.md`))),
		locale === 'es' ? fetch('/locales/q5-es.js') : Promise.resolve(null)
	]);
	if (!baseDtsResponse.ok) throw new Error(`Failed to load base declarations: ${baseDtsResponse.url}`);
	if (localeAliasesResponse && !localeAliasesResponse.ok) {
		throw new Error(`Failed to load Spanish API translations: ${localeAliasesResponse.url}`);
	}
	for (const response of pageResponses) {
		if (!response.ok) throw new Error(`Failed to load learn documentation: ${response.url}`);
	}
	for (const response of englishPageResponses || []) {
		if (!response.ok) throw new Error(`Failed to load English learn documentation: ${response.url}`);
	}

	const [baseDts, pageContents, englishPageContents, localeAliasesText] = await Promise.all([
		baseDtsResponse.text(),
		Promise.all(pageResponses.map((response) => response.text())),
		englishPageResponses ? Promise.all(englishPageResponses.map((response) => response.text())) : null,
		localeAliasesResponse ? localeAliasesResponse.text() : null
	]);
	const metadata = parseBaseDtsMetadata(baseDts);
	const localeAliases = localeAliasesText ? parseLocaleAliases(localeAliasesText) : {};
	const markdownText = filterMarkdownExamples(
		pageContents
			.map((content, index) => {
				const englishContent = englishPageContents?.[index] || content;
				return enrichMarkdownPage(content, metadata, locale, englishContent, localeAliases);
			})
			.join('\n\n'),
		exampleMode
	);
	sections = parseMarkdownIntoSections(markdownText);
	populateNavigation();

	// Keep the selected documentation edition across visits without changing renderer URL flags.
	localStorage.setItem('locale', locale);

	// Force content reload by resetting currentLoadedSectionId
	currentLoadedSectionId = '';

	// Restore the same section/subsection using the translation map.
	if (prevSectionIndex >= 0) {
		const newSectionKeys = Object.keys(sections);
		const targetSectionId = newSectionKeys[Math.min(prevSectionIndex, newSectionKeys.length - 1)];

		let targetSubId = null;
		if (prevSubId && targetSectionId && prevSubsectionIndex >= 0) {
			const newSubKeys = Object.keys(sections[targetSectionId]?.subsections || {});
			if (prevSubsectionIndex < newSubKeys.length) {
				targetSubId = newSubKeys[prevSubsectionIndex];
			}
		}

		await navigateTo(targetSectionId, targetSubId);
	} else {
		// Initial load or no prior section — use hash or default first section.
		await displayContent();
	}
}

// Wire up the documentation programming-language selector.
const codeModeSelect = document.getElementById('codeModeSelect');
if (codeModeSelect) {
	codeModeSelect.value = codeLang;
	codeModeSelect.addEventListener('change', async (e) => {
		codeLang = e.target.value;
		updateCodeLangUrl();
		await loadDocsAndRender();
	});
}

const langSelect = document.getElementById('langSelect');
if (langSelect) {
	langSelect.value = locale;
	langSelect.addEventListener('change', async (e) => {
		locale = e.target.value;
		// Persist language choice to localStorage and reload docs
		localStorage.setItem('locale', locale);
		await loadDocsAndRender();
	});
}

const themeSelect = document.getElementById('themeSelect');
if (themeSelect) {
	// keep in sync with existing theme state
	const themeVal = localStorage.getItem('theme') || (document.body.classList.contains('dark') ? 'dark' : 'light');
	themeSelect.value = themeVal;
	themeSelect.addEventListener('change', (e) => setTheme(e.target.value));
}

// Settings toggle for mobile: show/hide selectors container
const settingsToggle = document.getElementById('settingsToggle');
const selectorsContainer = document.querySelector('.selectors-container');
if (settingsToggle && selectorsContainer) {
	settingsToggle.addEventListener('pointerup', (e) => {
		selectorsContainer.classList.toggle('open');
		const open = selectorsContainer.classList.contains('open');
		settingsToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
	});

	// close selectors if window is resized to desktop
	window.addEventListener('resize', () => {
		if (window.innerWidth > 999) selectorsContainer.classList.remove('open');
	});
}

// initial load
loadDocsAndRender();

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

		if (window.innerWidth < 1000) {
			navbar.classList.replace('navopen', 'navclose');
		}
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
		});

		link.addEventListener('pointerup', (e) => {
			if (window.innerWidth < 1000) {
				navbar.classList.replace('navopen', 'navclose');
			}
			navigateTo(sectionId, subId);
		});

		container.append(link);
	}

	return container;
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
					if (codeLang == 'py') {
						funcParams = funcParams
							.split(',')
							.map((param) => {
								// Isolate the parameter name by splitting at ':' and '='
								return param.split(':')[0].split('=')[0].trim();
							})
							.filter(Boolean) // Remove any empty results
							.join(', ');
					}
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

			button.addEventListener('focus', () => {
				button.style.opacity = 1;
			});
			button.addEventListener('blur', () => {
				button.style.opacity = '';
			});

			button.addEventListener('pointerup', () => {
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

async function createMiniEditors() {
	MiniEditor.host = 'q5';
	await Q5.initWebGPU();

	let scripts = contentArea.querySelectorAll('script[type^="mini"]');
	for (let script of scripts) {
		script.setAttribute('horiz', true);
		let mie = new MiniEditor(script);
		window.miniEditors.push(mie);
		mie.showLineNumbers = true;
		mie.fontSize = 16;

		// reduce WebGPU memory usage per Q5 instance
		// since these pages use a lot of them
		Q5.MAX_TRANSFORMS = Q5.MAX_RECTS = Q5.MAX_ELLIPSES = 1000;
		Q5.MAX_IMAGES = Q5.MAX_COLORS = Q5.MAX_SHAPE_VERTS = 100;

		if (script.innerHTML.includes('for ')) {
			Q5.MAX_RECTS = Q5.MAX_COLORS = 100000;
		}

		await mie.init();
	}
}

let contentArea = document.getElementById('content');
window.miniEditors = [];

async function populateContentArea() {
	contentArea.classList.remove('fade-in');
	contentArea.classList.add('fade-out');
	let sectionIds = Object.keys(sections);
	let currentSectionIndex = sectionIds.indexOf(currentSectionId);
	updateNavigationActiveState();
	let prevSectionId = currentSectionIndex > 0 ? sectionIds[currentSectionIndex - 1] : null;
	let nextSectionId = currentSectionIndex < sectionIds.length - 1 ? sectionIds[currentSectionIndex + 1] : null;

	contentArea.innerHTML = '';

	const section = sections[currentSectionId];

	// Render main section immediately
	const mainDiv = document.createElement('div');
	mainDiv.id = currentSectionId;
	mainDiv.innerHTML = marked.marked(section.content);
	contentArea.append(mainDiv);

	// Render each documented item (subsection) one at a time to avoid blocking
	const subsectionEntries = Object.entries(section.subsections || {});
	for (const [subId, subsection] of subsectionEntries) {
		// yield to the browser so UI can update
		await new Promise((resolve) => requestAnimationFrame(resolve));

		const subDiv = document.createElement('div');
		subDiv.id = subId;
		subDiv.innerHTML = marked.marked(subsection.content);
		contentArea.append(subDiv);

		// Mini editors will be initialized later by `createMiniEditors`
		// to avoid initializing the same scripts multiple times.
	}

	// Nav buttons and spacer
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

		button.addEventListener('pointerup', () => navigateTo(nav.id));
		button.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') navigateTo(nav.id);
		});
		navButtonsContainer.append(button);
	}

	contentArea.append(navButtonsContainer);

	let spacer = document.createElement('div');
	spacer.style.height = '100vh';
	contentArea.append(spacer);

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

// `currentSectionId` and `currentLoadedSectionId` are declared earlier

async function updateMainContent(sectionId) {
	await Promise.all(window.miniEditors.map((editor) => editor.remove()));
	window.miniEditors = [];
	scrollBehavior = 'instant';
	currentSectionId = sectionId;

	await populateContentArea();
	generateHeadings();
	await createMiniEditors();
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

	// Remove sticky from previous wrapper (if any). If no closest wrapper
	// was found, ensure previous sticky is cleared and bail out safely.
	prevStickyWrapper?.classList.remove('sticky');
	if (!closestWrapper) {
		prevStickyWrapper = null;
		return;
	}

	closestWrapper.classList.add('sticky');
	prevStickyWrapper = closestWrapper;

	currentSubsectionId = closestWrapper.parentElement?.id || '';
	for (const link of document.querySelectorAll('.subsection-link')) {
		link.classList.toggle('active', link.getAttribute('href').slice(1) === currentSubsectionId);
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
	history.pushState(null, '', `${queryString}#${targetId}`);
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
	const hash = decodeURIComponent(location.hash.slice(1).split('?')[0]); // Remove query params from hash
	let sectionId, subsectionId;
	if (hash) {
		({ sectionId, subsectionId } = findSectionAndSubsection(hash));
	}
	if (!sectionId) {
		// Find the first section ID (e.g., "coreSection")
		sectionId = Object.keys(sections)[0];
		subsectionId = null;
	}
	if (sectionId) await navigateTo(sectionId, subsectionId);
}

// Event Listeners
window.addEventListener('scroll', updateStickyHeader, { passive: true });
window.addEventListener('hashchange', displayContent);

searchInput.addEventListener('input', () => {
	let searchText = searchInput.value.toLowerCase();
	if (searchText.length > 0) performSearch(searchText);
	else displayPromptMessage('Start typing to search the documentation');
});

searchInput.addEventListener('focus', () => {
	searchResultsContainer.style.display = 'flex';
});

searchInput.addEventListener('blur', () => {
	setTimeout(() => {
		searchResultsContainer.style.display = 'none';
	}, 200);
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

			resultElement.addEventListener('pointerup', () => {
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
