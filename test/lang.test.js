require('../q5-server.js');
require('../locales/q5-es.js');

test('q5-lang', () => {
	expect(Q5.lang.active).toBe(true);

	const q = new Q5('namespace');

	expect(q.fondo).toBe(q.background);
	expect(q.tamañoTexto).toBe(q.textSize);
	expect(q.tamanoTexto).toBe(q.textSize);

	q._q.width = 120;
	expect(q.ancho).toBe(120);

	const draw = () => {};
	q.dibujar = draw;
	expect(q.draw).toBe(draw);

	expect(Q5.Imagen).toBe(Q5.Image);
});
