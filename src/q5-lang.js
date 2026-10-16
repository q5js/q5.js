{
	const accentRegex = /[\u0300-\u036f]/g;
	const unaccent = (s) => s.normalize('NFD').replace(accentRegex, '');

	const forEachMap = (maps, fn) => {
		for (let map of maps) {
			for (let name in map) {
				let translatedName = map[name];
				fn(name, translatedName);
			}
		}
	};

	const lang = (Q5.lang = {
		active: false,
		members: [],
		hooks: [],
		classes: {},
		makeAliases: (target, maps) => {
			forEachMap(maps, (name, translatedName) => {
				if (translatedName in target) return;
				Object.defineProperty(target, translatedName, {
					configurable: true,
					get() {
						return this[name];
					},
					set(v) {
						this[name] = v;
					}
				});
			});
		},
		makeCopies: (target, maps) => {
			forEachMap(maps, (name, translatedName) => {
				target[translatedName] = target[name];
			});
		}
	});

	const globalScope = Q5._esm ? globalThis : !Q5._server ? window : global;

	const canvasMap = {
		es: 'Lienzo'
	};

	for (let code in canvasMap) {
		let t = canvasMap[code];
		globalScope[t] = async (...args) => {
			await import(`https://q5js.org/locales/q5-${code}.js`);
			return globalScope.Canvas(...args);
		};
	}

	Q5.addLang = (locale) => {
		lang.active = true;

		function add(maps, trans = {}) {
			if (!maps.length) {
				maps.push(Object.create(null));
				if (locale.hasAccents) maps.push(Object.create(null));
			}
			for (let name in trans) {
				let translatedName = trans[name];
				if (!translatedName || translatedName == name) continue;
				maps[0][name] = translatedName;
				if (locale.hasAccents) {
					let unaccentedName = unaccent(trans[name]);
					if (unaccentedName != translatedName) maps[1][name] = unaccentedName;
				}
			}
		}

		add(lang.members, locale.members);

		if (locale.module == 'q5') {
			const imgProps =
				'canvas drawingContext mirrorX mirrorY width height defaultWidth defaultHeight copy filter get set resize mask trim inset pixels loadPixels updatePixels smooth noSmooth'
					.split(' ')
					.filter((n) => n in locale.members);
			locale.classes.Image = Object.fromEntries(imgProps.map((n) => [n, locale.members[n]]));
		}

		for (let className in locale.classes) {
			add((lang.classes[className] ??= []), locale.classes[className]);
		}

		if (locale.hooks) {
			add(lang.hooks, locale.hooks);
			Q5._hooks.push(...Object.values(lang.hooks[0]));
			if (locale.hasAccents) Q5._hooks.push(...Object.values(lang.hooks[1]));

			lang.makeAliases(Q5, lang.hooks);

			for (let t of Object.values(canvasMap)) {
				globalScope[t] = globalScope.Canvas;
			}
		}
	};

	// if q5 was loaded as a module and an API translation file was added
	// this runs after presetup addon hooks
	Q5.localize = ($, q) => {
		const g = $._isGlobal ? globalScope : null;
		$._proxyHandler.set = (t, p, v) => {
			$[p] = v;
			if (g) g[p] = v;

			for (let map of lang.members) {
				let translatedName = map[p];
				if (translatedName) {
					$[translatedName] = v;
					if (g) g[translatedName] = v;
				}
			}
			return true;
		};

		lang.makeCopies(q, lang.members);
		lang.makeAliases($, lang.hooks);

		for (let className in lang.classes) {
			let target =
				className == 'Q5'
					? Q5
					: Q5[className]?.prototype || $[className]?.prototype || $._privateClasses[className]?.prototype;
			if (target) lang.makeAliases(target, lang.classes[className]);
		}
	};

	Q5.addHook('init', function (q) {
		this._privateClasses = [];
		// legacy support for classic (non-module) scripting
		if (lang.active && !Q5._esm) Q5.localize(this, q);
	});
}
