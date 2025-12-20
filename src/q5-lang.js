const libLangs = `
# core
createCanvas -> es:crearLienzo ja:キャンバスを作成する

# color
background -> es:fondo ja:背景

# display
windowWidth -> es:anchoVentana
windowHeight -> es:altoVentana
frameCount ->  es:cuadroActual
noLoop -> es:pausar
redraw -> es:redibujar
loop -> es:reanudar
frameRate -> es:frecuenciaRefresco
getTargetFrameRate -> es:frecuenciaIdeal
getFPS -> es:frecuenciaMaxima
deltaTime -> es:ultimoTiempo

# shape
circle -> es:círculo
`;

const userLangs = `
update -> es:actualizar
draw -> es:dibujar
postProcess -> es:retocarDibujo
`;

const parseLangs = function (data, lang) {
	let map = {};
	for (let l of data.split('\n')) {
		let i = l.indexOf(' ' + lang + ':');
		if (i > 0 && l[0] != '#') {
			map[l.split(' ')[0]] = l.slice(i + 4).split(' ')[0];
		}
	}
	return map;
};

Object.defineProperty(Q5, 'lang', {
	get: () => Q5._lang || 'en',
	set: (val) => {
		if (val == Q5._lang) return;

		Q5._lang = val;

		if (val == 'en') {
			// reset to English only user functions
			Q5._userFns = Q5._userFns.slice(0, 17);
			Q5._libMap = Q5._userFnsMap = {};
			return;
		}

		let libMap = parseLangs(libLangs, val);

		if (typeof window == 'object') {
			window[libMap.createCanvas] = createCanvas;
		}

		let userFnsMap = parseLangs(userLangs, val);

		for (let name in userFnsMap) {
			let translatedName = userFnsMap[name];
			if (Q5.hasOwnProperty(translatedName)) continue;
			Object.defineProperty(Q5, translatedName, {
				get: () => Q5[name],
				set: (fn) => (Q5[name] = fn)
			});
		}

		Q5._libMap = libMap;
		Q5._userFnsMap = userFnsMap;
		Q5._userFns.push(...Object.values(userFnsMap));
	}
});

Q5.modules.lang = ($) => {
	let userFnsMap = Q5._userFnsMap;

	for (let name in userFnsMap) {
		let translatedName = userFnsMap[name];
		Object.defineProperty($, translatedName, {
			get: () => $[name],
			set: (fn) => ($[name] = fn)
		});
	}

	let libMap = Q5._libMap;

	if (libMap?.createCanvas) {
		$[libMap.createCanvas] = $.createCanvas;
	}
};

Q5.addHook('presetup', ($) => {
	let libMap = Q5._libMap;

	for (let name in libMap) {
		let translatedName = libMap[name];
		$[translatedName] = $[name];
	}
});
