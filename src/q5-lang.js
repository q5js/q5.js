Q5.addHook('presetup', ($) => {
	let libMap;

	if (Q5.lang == 'es') {
		libMap = {
			// core
			createCanvas: 'crearLienzo',
			// color
			background: 'fondo',
			// display
			windowWidth: 'anchoVentana',
			windowHeight: 'altoVentana',
			frameCount: 'cuadroActual',
			noLoop: 'pausar',
			redraw: 'redibujar',
			loop: 'reanudar',
			frameRate: 'frecuenciaRefresco',
			getTargetFrameRate: 'frecuenciaIdeal',
			getFPS: 'frecuenciaMaxima',
			deltaTime: 'ultimoTiempo',
			// shape
			circle: 'círculo'
		};
	} else return;

	for (let name in libMap) {
		const translatedName = libMap[name];
		$[translatedName] = $[name];
	}
});

Object.defineProperty(Q5, 'lang', {
	get: () => Q5._lang || 'en',
	set: (val) => {
		Q5._lang = val;

		let userFnsMap;

		if (val == 'es') {
			if (typeof window == 'object') {
				window.crearLienzo = createCanvas;
			}

			userFnsMap = {
				update: 'actualizar',
				draw: 'dibujar',
				postProcess: 'retocarDibujo'
			};
		} else return;

		for (let name in userFnsMap) {
			const translatedName = userFnsMap[name];
			Object.defineProperty(Q5, translatedName, {
				get: () => Q5[name],
				set: (fn) => (Q5[name] = fn)
			});
		}

		Q5._userFnsMap = userFnsMap;
		Q5._userFns.push(...Object.values(userFnsMap));
	}
});

Q5.modules.lang = ($) => {
	let userFnsMap = Q5._userFnsMap;

	for (let name in userFnsMap) {
		const translatedName = userFnsMap[name];
		Object.defineProperty($, translatedName, {
			get: () => $[name],
			set: (fn) => ($[name] = fn)
		});
	}
};
