declare global {

	// ⭐ núcleo

	/**
	 * Bienvenido al contenido de q5! 🤩
	 * 
	 * ¿Primera vez programando? Revisa la [guía para principiantes de q5](https://github.com/q5js/q5.js/wiki/q5-Beginner's-Brief).
	 * 
	 * En estas páginas de "Aprender" puedes experimentar editando los mini ejemplos. ¡Diviértete! 😎
	 */

	/** ⭐
	 * Crea un elemento de lienzo, una sección de la pantalla donde tu programa
	 * puede dibujar.
	 * 
	 * ¡Ejecuta esta función para empezar a usar q5!
	 * 
	 * Ten en cuenta que en este ejemplo, el círculo se encuentra en la posición [0, 0], el origen del lienzo.
	 * @param {number} [ancho] ancho del lienzo en píxeles
	 * @param {number} [alto] alto del lienzo en píxeles
	 * @param {object} [opciones] opciones para el contexto 2d
	 * @return {Promise<HTMLCanvasElement>} una promesa que se resuelve con el elemento canvas creado
	 * @example
	 * // Canvas2D
	 * crearLienzo(200, 100);
	 * fondo('silver');
	 * círculo(0, 0, 80);
	 */
	function crearLienzo(ancho?: number, alto?: number, opciones?: CanvasRenderingContext2DSettings): Promise<HTMLCanvasElement>;

	/** ⭐
	 * Función a declarar. Se ejecutará 60 veces por segundo de forma predeterminada. Tiene comportamiento de bucle, lo que permite hacer animaciones cuadro a cuadro.
	 * @example
	 * function dibujar() {
	 * 	fondo('silver');
	 * 	círculo(ratónX, ratónY, 80);
	 * }
	 */
	function dibujar(): void;

	/** ⭐
	 * Imprime un mensaje en la consola de JavaScript. Atajo para `console.log()`.
	 * 
	 * Para acceder a las herramientas del navegador (DevTools) generalmente es con click derecho + "inspeccionar", o presionando las teclas `ctrl + shift + i` o `command + option + i`. La consola se encuentra en la pestaña "console".
	 * @param {any} mensaje a imprimir
	 * @example
	 * function dibujar() {
	 * 	círculo(ratónX, ratónY, 80);
	 * 	log('El ratón está en:', ratónX, ratónY);
	 * }
	 */
	function log(mensaje: any): void;

	// 🧑‍🎨 formas

	/** 🧑‍🎨
	 * Dibuja un círculo en la posición (x, y) con el diámetro especificado.
	 * @param {number} x posición x del centro del círculo
	 * @param {number} y posición y del centro del círculo
	 * @param {number} diámetro del círculo
	 * @example
	 * crearLienzo(200, 100);
	 * círculo(100, 50, 80);
	 */
	function círculo(x: number, y: number, diámetro: number): void;

	/** 🧑‍🎨
	 * Dibuja una elipse.
	 * @param {number} x posición x
	 * @param {number} y posición y
	 * @param {number} ancho ancho de la elipse
	 * @param {number} [alto] alto de la elipse
	 * @example
	 * crearLienzo(200, 100);
	 * elipse(100, 50, 160, 80);
	 */
	function elipse(x: number, y: number, ancho: number, alto?: number): void;

	/** 🧑‍🎨
	 * Dibuja un rectángulo o un rectángulo redondeado.
	 * @param {number} x posición x
	 * @param {number} y posición y
	 * @param {number} w ancho del rectángulo
	 * @param {number} [h] alto del rectángulo
	 * @param {number} [redondeado] radio para todas las esquinas
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * 
	 * rect(30, 20, 40, 60);
	 * rect(80, 70, 40, 60, 10);
	 * rect(130, 120, 40, 60, 30, 2, 8, 20);
	 */
	function rect(x: number, y: number, ancho: number, alto?: number, redondeado?: number): void;

	/** 🧑‍🎨
	 * Dibuja un cuadrado o un cuadrado redondeado.
	 * @param {number} x posición x
	 * @param {number} y posición y
	 * @param {number} tamaño tamaño de los lados del cuadrado
	 * @param {number} [redondeado] radio para todas las esquinas
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * 
	 * cuadrado(30, 30, 40);
	 * cuadrado(80, 80, 40, 10);
	 * cuadrado(130, 130, 40, 30, 2, 8, 20);
	 */
	function cuadrado(x: number, y: number, tamaño: number, redondeado?: number): void;

	/** 🧑‍🎨
	 * Dibuja un punto en el lienzo.
	 * @param {number} x posición x
	 * @param {number} y posición y
	 * @example
	 * crearLienzo(200, 100);
	 * trazo('white');
	 * punto(75, 50);
	 * 
	 * grosorTrazo(10);
	 * punto(125, 50);
	 */
	function punto(x: number, y: number): void;

	/** 🧑‍🎨
	 * Dibuja una línea en el lienzo.
	 * @param {number} x1 posición x del primer punto
	 * @param {number} y1 posición y del primer punto
	 * @param {number} x2 posición x del segundo punto
	 * @param {number} y2 posición y del segundo punto
	 * @example
	 * crearLienzo(200, 100);
	 * trazo('lime');
	 * línea(20, 20, 180, 80);
	 */
	function línea(x1: number, y1: number, x2: number, y2: number): void;

	/** 🧑‍🎨
	 * Dibuja una cápsula.
	 * @param {number} x1 posición x del primer punto
	 * @param {number} y1 posición y del primer punto
	 * @param {number} x2 posición x del segundo punto
	 * @param {number} y2 posición y del segundo punto
	 * @param {number} r radio de los extremos semicirculares de la cápsula
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * grosorTrazo(5);
	 * cápsula(40, 40, 160, 60, 10);
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	relleno('cyan');
	 * 	grosorTrazo(10);
	 * 	cápsula(100, 100, ratónX, ratónY, 20);
	 * }
	 */
	function cápsula(x1: number, y1: number, x2: number, y2: number, r: number): void;

	/** 🧑‍🎨
	 * Establecer a `ESQUINA` (por defecto), `CENTRO`, `RADIO`, o `ESQUINAS`.
	 * 
	 * Cambia cómo se interpretan las primeras cuatro entradas para
	 * `rect` y `cuadrado`.
	 * @param {string} modo
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * modoRect(ESQUINA);
	 * 
	 * //  ( x,  y,   w,  h)
	 * rect(50, 25, 100, 50);
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * modoRect(CENTRO);
	 * 
	 * //  ( cX, cY,   w,  h)
	 * rect(100, 50, 100, 50);
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * modoRect(RADIO);
	 * 
	 * //  ( cX, cY, rX, rY)
	 * rect(100, 50, 50, 25);
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * modoRect(ESQUINAS);
	 * 
	 * //  ( x1, y1, x2, y2)
	 * rect(50, 25, 150, 75);
	 */
	function modoRect(modo: string): void;

	/** 🧑‍🎨
	 * Establecer a `CENTRO` (por defecto), `RADIO`, `ESQUINA`, o `ESQUINAS`.
	 * 
	 * Cambia cómo se interpretan las primeras cuatro entradas para
	 * `elipse`, `círculo`, y `arco`.
	 * @param {string} modo
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * modoEliptico(CENTRO);
	 * 
	 * //     (  x,  y,   w,  h)
	 * elipse(100, 50, 100, 50);
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * modoEliptico(RADIO);
	 * 
	 * //     (  x,  y, rX, rY)
	 * elipse(100, 50, 50, 25);
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * modoEliptico(ESQUINA);
	 * 
	 * //     (lX, tY,   w,  h)
	 * elipse(50, 25, 100, 50);
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * modoEliptico(ESQUINAS);
	 * 
	 * //     ( x1, y1, x2, y2)
	 * elipse(50, 25, 150, 75);
	 */
	function modoEliptico(modo: string): void;

	/** 🧑‍🎨
	 * Modo de alineación de forma, para usar en `modoRect` y `modoEliptico`.
	 */
	const ESQUINA: 'corner';

	/** 🧑‍🎨
	 * Modo de alineación de forma, para usar en `modoRect` y `modoEliptico`.
	 */
	const RADIO: 'radius';

	/** 🧑‍🎨
	 * Modo de alineación de forma, para usar en `modoRect` y `modoEliptico`.
	 */
	const ESQUINAS: 'corners';

	// 🌆 imagen

	/** 🌆
	 * Carga una imagen desde una URL.
	 * 
	 * Por defecto, los recursos se cargan en paralelo antes de que q5 ejecute `dibujar`. Usa `await` para esperar a que una imagen se cargue.
	 * @param {string} url url de la imagen a cargar
	 * @returns {Q5.Image & PromiseLike<Q5.Image>} imagen
	 * @example
	 * crearLienzo(200);
	 * 
	 * let logo = cargarImagen('/q5js_logo.avif');
	 * 
	 * function dibujar() {
	 * 	fondo(logo);
	 * }
	 */
	function cargarImagen(url: string): Q5.Imagen & PromiseLike<Q5.Imagen>;

	/** 🌆
	 * Dibuja una imagen o fotograma de video en el lienzo.
	 * @param {Q5.Image | HTMLVideoElement} img imagen o video a dibujar
	 * @param {number} dx posición x donde dibujar la imagen
	 * @param {number} dy posición y donde dibujar la imagen
	 * @param {number} [dw] ancho de la imagen de destino
	 * @param {number} [dh] alto de la imagen de destino
	 * @param {number} [sx] posición x en la fuente para empezar a recortar una subsección
	 * @param {number} [sy] posición y en la fuente para empezar a recortar una subsección
	 * @param {number} [sw] ancho de la subsección de la imagen fuente
	 * @param {number} [sh] alto de la subsección de la imagen fuente
	 * @example
	 * crearLienzo(200);
	 * 
	 * let logo = cargarImagen('/q5js_logo.avif');
	 * 
	 * function dibujar() {
	 * 	imagen(logo, 0, 0, 200, 200);
	 * }
	 * @example
	 * crearLienzo(200);
	 * 
	 * let logo = cargarImagen('/q5js_logo.avif');
	 * 
	 * function dibujar() {
	 * 	imagen(logo, 0, 0, 200, 200, 256, 256, 512, 512);
	 * }
	 */
	function imagen(): void;

	/** 🌆
	 * Establecer a `CORNER` (por defecto), `CORNERS`, o `CENTER`.
	 * 
	 * Cambia cómo se interpretan las entradas a `imagen`.
	 * @param {string} modo
	 * @example
	 * crearLienzo(200);
	 * let logo = cargarImagen('/q5js_logo.avif');
	 * 
	 * function dibujar() {
	 * 	modoImagen(CORNER);
	 * 
	 * 	//   ( img,  x,  y,   w,   h)
	 * 	imagen(logo, 50, 50, 100, 100);
	 * }
	 * @example
	 * crearLienzo(200);
	 * let logo = cargarImagen('/q5js_logo.avif');
	 * 
	 * function dibujar() {
	 * 	modoImagen(CENTER);
	 * 
	 * 	//   ( img,  cX,  cY,   w,   h)
	 * 	imagen(logo, 100, 100, 100, 100);
	 * }
	 * @example
	 * crearLienzo(200);
	 * let logo = cargarImagen('/q5js_logo.avif');
	 * 
	 * function dibujar() {
	 * 	modoImagen(CORNERS);
	 * 
	 * 	//   ( img, x1, y1,  x2,  y2)
	 * 	imagen(logo, 50, 50, 100, 100);
	 * }
	 */
	function modoImagen(modo: string): void;

	/** 🌆
	 * Establece la escala de imagen por defecto, que se aplica a las imágenes cuando
	 * se dibujan sin un ancho o alto especificado.
	 * 
	 * Por defecto es 0.5 para que las imágenes aparezcan en su tamaño real
	 * cuando la densidad de píxeles es 2. Las imágenes se dibujarán a un tamaño
	 * por defecto consistente relativo al lienzo independientemente de la densidad de píxeles.
	 * 
	 * Esta función debe llamarse antes de que se carguen las imágenes para
	 * tener efecto.
	 * @param {number} escala
	 * @returns {number} escala de imagen por defecto
	 */
	function escalaImagenPorDefecto(escala: number): number;

	/** 🌆
	 * Redimensiona la imagen.
	 * @param {number} w nuevo ancho
	 * @param {number} h nuevo alto
	 * @example
	 * crearLienzo(200);
	 * 
	 * let logo = cargarImagen('/q5js_logo.avif');
	 * 
	 * function setup() {
	 * 	logo.redimensionar(128, 128);
	 * 	imagen(logo, 0, 0, 200, 200);
	 * }
	 */
	function redimensionar(w: number, h: number): void;

	/** 🌆
	 * Devuelve una imagen recortada, eliminando los píxeles transparentes de los bordes.
	 * @returns {Q5.Image}
	 */
	function recortar(): Q5.Imagen;

	/** 🌆
	 * Habilita el renderizado suave de imágenes mostradas más grandes que
	 * su tamaño real. Esta es la configuración por defecto, así que ejecutar esta
	 * función solo tiene efecto si se ha llamado a `noSuavizar`.
	 * @example
	 * crearLienzo(200);
	 * 
	 * let icono = cargarImagen('/q5js_icon.png');
	 * 
	 * function setup() {
	 * 	imagen(icono, 0, 0, 200, 200);
	 * }
	 */
	function suavizar(): void;

	/** 🌆
	 * Deshabilita el renderizado suave de imágenes para un aspecto pixelado.
	 * @example
	 * crearLienzo(200);
	 * 
	 * let icono = cargarImagen('/q5js_icon.png');
	 * 
	 * function setup() {
	 * 	noSuavizar();
	 * 	imagen(icono, 0, 0, 200, 200);
	 * }
	 */
	function noSuavizar(): void;

	/** 🌆
	 * Aplica un tinte (superposición de color) al dibujo.
	 * 
	 * El valor alfa del color de tinte determina la
	 * fuerza del tinte. Para cambiar la opacidad de una imagen,
	 * usa la función `opacidad`.
	 * 
	 * El teñido afecta a todas las imágenes dibujadas posteriormente. El color de tinte
	 * se aplica a las imágenes usando el modo de mezcla "multiply".
	 * 
	 * Dado que el proceso de teñido es intensivo en rendimiento, cada vez
	 * que se tiñe una imagen, q5 almacena en caché el resultado. `imagen` dibujará la
	 * imagen teñida en caché a menos que el color de tinte haya cambiado o la
	 * imagen que se está tiñendo haya sido editada.
	 * 
	 * Si necesitas dibujar una imagen múltiples veces cada fotograma con
	 * diferentes tintes, considera hacer copias de la imagen y teñir
	 * cada copia por separado.
	 * @param {string | number} color color de tinte
	 * @example
	 * crearLienzo(200);
	 * 
	 * let logo = cargarImagen('/q5js_logo.avif');
	 * 
	 * function setup() {
	 * 	teñir(255, 0, 0, 128);
	 * 	imagen(logo, 0, 0, 200, 200);
	 * }
	 */
	function teñir(color: string | number): void;

	/** 🌆
	 * Las imágenes dibujadas después de ejecutar esta función no serán teñidas.
	 */
	function noTeñir(): void;

	/** 🌆
	 * Enmascara la imagen con otra imagen.
	 * @param {Q5.Image} img imagen a usar como máscara
	 */
	function enmascarar(img: Q5.Imagen): void;

	/** 🌆
	 * Devuelve una copia de la imagen.
	 * @returns {Q5.Image}
	 */
	function copiar(): Q5.Imagen;

	/** 🌆
	 * Muestra una región de la imagen en otra región de la imagen.
	 * Se puede usar para crear un detalle insertado, también conocido como efecto de lupa.
	 * @param {number} sx coordenada x de la región fuente
	 * @param {number} sy coordenada y de la región fuente
	 * @param {number} sw ancho de la región fuente
	 * @param {number} sh alto de la región fuente
	 * @param {number} dx coordenada x de la región destino
	 * @param {number} dy coordenada y de la región destino
	 * @param {number} dw ancho de la región destino
	 * @param {number} dh alto de la región destino
	 * @example
	 * crearLienzo(200);
	 * 
	 * let logo = cargarImagen('/q5js_logo.avif');
	 * 
	 * function setup() {
	 * 	logo.insertado(256, 256, 512, 512, 0, 0, 256, 256);
	 * 	imagen(logo, 0, 0, 200, 200);
	 * }
	 */
	function insertado(sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;

	/** 🌆
	 * Recupera una subsección de una imagen o lienzo como una nueva Imagen Q5
	 * o el color de un píxel en la imagen o lienzo.
	 * 
	 * Si solo se especifican x e y, esta función devuelve el color del píxel
	 * en la coordenada dada en formato de array `[R, G, B, A]`. Si `cargarPíxeles`
	 * nunca se ha ejecutado, es ejecutado por esta función.
	 * 
	 * Si haces cambios en el lienzo o imagen, debes llamar a `cargarPíxeles`
	 * antes de usar esta función para obtener los datos de color actuales.
	 * 
	 * No aplicable a lienzos WebGPU.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} [w] ancho del área, por defecto es 1
	 * @param {number} [h] alto del área, por defecto es 1
	 * @returns {Q5.Image | number[]}
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	sinTrazo();
	 * 	círculo(100, 100, frameCount % 200);
	 * 
	 * 	cargarPíxeles();
	 * 	let col = obtener(ratónX, ratónY);
	 * 	texto(col, ratónX, ratónY);
	 * }
	 * @example
	 * crearLienzo(200);
	 * 
	 * let logo = cargarImagen('/q5js_logo.avif');
	 * 
	 * function setup() {
	 * 	let recortada = logo.obtener(256, 256, 512, 512);
	 * 	imagen(recortada, 0, 0, 200, 200);
	 * }
	 */
	function obtener(x: number, y: number, w?: number, h?: number): Q5.Imagen | number[];

	/** 🌆
	 * Establece el color de un píxel en la imagen o lienzo. El modo de color debe ser RGB.
	 * 
	 * O si se proporciona un lienzo o imagen, se dibuja encima de la
	 * imagen o lienzo de destino, ignorando su configuración de tinte.
	 * 
	 * Ejecuta `actualizarPíxeles` para aplicar los cambios.
	 * 
	 * No aplicable a lienzos WebGPU.
	 * @param {number} x
	 * @param {number} y
	 * @param {any} val color, lienzo, o imagen
	 * @example
	 * crearLienzo(200);
	 * let c = color('lime');
	 * 
	 * function dibujar() {
	 * 	establecer(aleatorio(200), aleatorio(200), c);
	 * 	actualizarPíxeles();
	 * }
	 */
	function establecer(x: number, y: number, val: any): void;

	/** 🌆
	 * Array de datos de color de píxeles de un lienzo o imagen.
	 * 
	 * Vacío por defecto, obtener el dato ejecutando `cargarPíxeles`.
	 * 
	 * Cada píxel está representado por cuatro valores consecutivos en el array,
	 * correspondientes a sus canales rojo, verde, azul y alfa.
	 * 
	 * Los datos del píxel superior izquierdo están al principio del array
	 * y los datos del píxel inferior derecho están al final, yendo de
	 * izquierda a derecha y de arriba a abajo.
	 */
	var píxeles: number[];

	/** 🌆
	 * Carga datos de píxeles en `píxeles` desde el lienzo o imagen.
	 * 
	 * El ejemplo a continuación establece el canal verde de algunos píxeles
	 * a un valor aleatorio.
	 * 
	 * No aplicable a lienzos WebGPU.
	 * @example
	 * frecuenciaRefresco(5);
	 * let icono = cargarImagen('/q5js_icon.png');
	 * 
	 * function dibujar() {
	 * 	icono.cargarPíxeles();
	 * 	for (let i = 0; i < icono.píxeles.length; i += 16) {
	 * 		icono.píxeles[i + 1] = aleatorio(255);
	 * 	}
	 * 	icono.actualizarPíxeles();
	 * 	fondo(icono);
	 * }
	 */
	function cargarPíxeles(): void;

	/** 🌆
	 * Aplica cambios en el array `píxeles` al lienzo o imagen.
	 * 
	 * No aplicable a lienzos WebGPU.
	 * @example
	 * crearLienzo(200);
	 * 
	 * for (let x = 0; x < 200; x += 5) {
	 * 	for (let y = 0; y < 200; y += 5) {
	 * 		establecer(x, y, color('pink'));
	 * 	}
	 * }
	 * actualizarPíxeles();
	 */
	function actualizarPíxeles(): void;

	/** 🌆
	 * Aplica un filtro a la imagen.
	 * 
	 * Mira la documentación de las constantes de filtro de q5 a continuación para más información.
	 * 
	 * También se puede usar una cadena de filtro CSS.
	 * https://developer.mozilla.org/docs/Web/CSS/filter
	 * 
	 * No aplicable a lienzos WebGPU.
	 * @param {string} tipo tipo de filtro o una cadena de filtro CSS
	 * @param {number} [valor] valor opcional, depende del tipo de filtro
	 * @example
	 * crearLienzo(200);
	 * let logo = cargarImagen('/q5js_logo.avif');
	 * 
	 * function setup() {
	 * 	logo.filtro(INVERTIR);
	 * 	imagen(logo, 0, 0, 200, 200);
	 * }
	 */
	function filtro(tipo: string, valor?: number): void;

	/** 🌆
	 * Convierte la imagen a píxeles blancos y negros dependiendo si están por encima o por debajo de cierto umbral.
	 */
	const UMBRAL: 1;

	/** 🌆
	 * Convierte la imagen a escala de grises estableciendo cada píxel a su luminancia.
	 */
	const GRIS: 2;

	/** 🌆
	 * Establece el canal alfa a totalmente opaco.
	 */
	const OPACO: 3;

	/** 🌆
	 * Invierte el color de cada píxel.
	 */
	const INVERTIR: 4;

	/** 🌆
	 * Limita cada canal de la imagen al número de colores especificado como argumento.
	 */
	const POSTERIZAR: 5;

	/** 🌆
	 * Aumenta el tamaño de las áreas brillantes.
	 */
	const DILATAR: 6;

	/** 🌆
	 * Aumenta el tamaño de las áreas oscuras.
	 */
	const EROSIONAR: 7;

	/** 🌆
	 * Aplica un desenfoque gaussiano a la imagen.
	 */
	const DESENFOCAR: 8;

	/** 🌆
	 * Crea una nueva imagen.
	 * @param {number} w ancho
	 * @param {number} h alto
	 * @param {any} [opt] configuraciones opcionales para la imagen
	 * @returns {Q5.Image}
	 */
	function crearImagen(w: number, h: number, opt?: any): Q5.Imagen;

	/** 🌆
	 * Crea un búfer de gráficos.
	 * 
	 * Deshabilitado por defecto en q5 WebGPU.
	 * Mira el issue [#104](https://github.com/q5js/q5.js/issues/104) para detalles.
	 * @param {number} w ancho
	 * @param {number} h alto
	 * @param {object} [opt] opciones
	 * @returns {Q5} un nuevo búfer de gráficos Q5
	 */
	function crearGráficos(w: number, h: number, opt?: any): Q5;

	// 📘 texto

	/** 📘
	 * Renderiza texto en el lienzo.
	 * 
	 * El texto se puede posicionar con los parámetros x e y
	 * y opcionalmente se puede restringir.
	 * @param {string} str cadena de texto a mostrar
	 * @param {number} x coordenada-x de la posición del texto
	 * @param {number} y coordenada-y de la posición del texto
	 * @param {number} [anchoEnvoltura] ancho máximo de línea en caracteres
	 * @param {number} [limiteLineas] número máximo de líneas
	 * @example
	 * crearLienzo(200, 100);
	 * fondo('silver');
	 * 
	 * tamañoTexto(32);
	 * texto('Hello, world!', 12, 60);
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * tamañoTexto(20);
	 * 
	 * let info =
	 * 	'q5.js was designed to make creative coding fun and accessible for a new generation of artists, designers, educators, and beginners.';
	 * 
	 * texto(info, 12, 30, 20, 6);
	 * //
	 * //
	 */
	function texto(str: string, x: number, y: number, anchoEnvoltura?: number, limiteLineas?: number): void;

	/** 📘
	 * Carga una fuente desde una URL.
	 * 
	 * El archivo de fuente puede estar en cualquier formato aceptado en CSS, como
	 * archivos .ttf y .otf. El primer ejemplo a continuación carga
	 * [Robotica](https://www.dafont.com/robotica-courtney.font).
	 * 
	 * También soporta cargar [fuentes de Google](https://fonts.google.com/).
	 * El segundo ejemplo carga
	 * [Pacifico](https://fonts.google.com/specimen/Pacifico).
	 * 
	 * Si no se cargan fuentes, se usa la fuente sans-serif por defecto.
	 * 
	 * Por defecto, los recursos se cargan en paralelo antes de que q5 ejecute `dibujar`. Usa `await` para esperar a que una fuente se cargue.
	 * @param {string} url URL de la fuente a cargar
	 * @returns {FontFace & PromiseLike<FontFace>} fuente
	 * @example
	 * crearLienzo(200, 56);
	 * 
	 * cargarFuente('/assets/Robotica.ttf');
	 * 
	 * function setup() {
	 * 	relleno('skyblue');
	 * 	tamañoTexto(64);
	 * 	texto('Hello!', 2, 54);
	 * }
	 * @example
	 * crearLienzo(200, 74);
	 * 
	 * cargarFuente('fonts.googleapis.com/css2?family=Pacifico');
	 * 
	 * function setup() {
	 * 	relleno('hotpink');
	 * 	tamañoTexto(68);
	 * 	texto('Hello!', 2, 68);
	 * }
	 */
	function cargarFuente(url: string): FontFace & PromiseLike<FontFace>;

	/** 📘
	 * Establece la fuente actual a usar para renderizar texto.
	 * 
	 * Por defecto, la fuente se establece a la [familia de fuentes CSS](https://developer.mozilla.org/docs/Web/CSS/font-family)
	 * "sans-serif" o la última fuente cargada.
	 * @param {string} nombreFuente nombre de la familia de fuentes o un objeto FontFace
	 * @example
	 * crearLienzo(200, 160);
	 * fondo(200);
	 * 
	 * fuenteTexto('serif');
	 * 
	 * tamañoTexto(32);
	 * texto('Hello, world!', 15, 90);
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * 
	 * fuenteTexto('monospace');
	 * 
	 * tamañoTexto(24);
	 * texto('Hello, world!', 15, 90);
	 */
	function fuenteTexto(nombreFuente: string): void;

	/** 📘
	 * Establece u obtiene el tamaño de fuente actual. Si no se proporciona argumento, devuelve el tamaño de fuente actual.
	 * @param {number} [tamaño] tamaño de la fuente en píxeles
	 * @returns {number | void} tamaño de fuente actual cuando no se proporciona argumento
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 
	 * 	tamañoTexto(abs(ratónX));
	 * 	texto('A', 10, 190);
	 * }
	 */
	function tamañoTexto(tamaño?: number): number | void;

	/** 📘
	 * Establece u obtiene la altura de línea actual. Si no se proporciona argumento, devuelve la altura de línea actual.
	 * @param {number} [interlineado] altura de línea en píxeles
	 * @returns {number | void} altura de línea actual cuando no se proporciona argumento
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 
	 * 	tamañoTexto(abs(ratónX));
	 * 	texto('A', 10, 190);
	 * 	rect(10, 190, 5, -interlineado());
	 * }
	 */
	function interlineado(interlineado?: number): number | void;

	/** 📘
	 * Establece el estilo de texto actual.
	 * 
	 * No aplicable a WebGPU cuando se usan fuentes MSDF.
	 * @param {'normal' | 'italic' | 'bold' | 'bolditalic'} estilo estilo de fuente
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * 
	 * estiloTexto(CURSIVA);
	 * 
	 * tamañoTexto(32);
	 * texto('Hello, world!', 12, 106);
	 */
	function estiloTexto(estilo: 'normal' | 'italic' | 'bold' | 'bolditalic'): void;

	/** 📘
	 * Establece la alineación horizontal y vertical del texto.
	 * @param {'left' | 'center' | 'right'} horiz alineación horizontal
	 * @param {'top' | 'middle' | 'bottom' | 'alphabetic'} [vert] alineación vertical
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * tamañoTexto(32);
	 * 
	 * alineaciónTexto(CENTRO, MEDIO);
	 * texto('Hello, world!', 100, 100);
	 */
	function alineaciónTexto(horiz: 'left' | 'center' | 'right', vert?: 'top' | 'middle' | 'bottom' | 'alphabetic'): void;

	/** 📘
	 * Establece el peso del texto.
	 * 
	 * - 100: delgado
	 * - 200: extra-ligero
	 * - 300: ligero
	 * - 400: normal/regular
	 * - 500: medio
	 * - 600: semi-negrita
	 * - 700: negrita
	 * - 800: más negrita/extra-negrita
	 * - 900: negro/pesado
	 * @param {number | string} peso peso de la fuente
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * tamañoTexto(32);
	 * alineaciónTexto(CENTRO, MEDIO);
	 * 
	 * pesoTexto(100);
	 * texto('Hello, world!', 100, 100);
	 */
	function pesoTexto(peso: number | string): void;

	/** 📘
	 * Calcula y devuelve el ancho de una cadena de texto dada.
	 * @param {string} str cadena a medir
	 * @returns {number} ancho del texto en píxeles
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 
	 * 	tamañoTexto(abs(ratónX));
	 * 	rect(10, 190, anchoTexto('A'), -interlineado());
	 * 	texto('A', 10, 190);
	 * }
	 */
	function anchoTexto(str: string): number;

	/** 📘
	 * Calcula y devuelve el ascenso (la distancia desde la línea base hasta la parte superior del carácter más alto) de la fuente actual.
	 * @param {string} str cadena a medir
	 * @returns {number} ascenso del texto en píxeles
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 
	 * 	tamañoTexto(abs(ratónX));
	 * 	rect(10, 190, anchoTexto('A'), -ascensoTexto());
	 * 	texto('A', 10, 190);
	 * }
	 */
	function ascensoTexto(str: string): number;

	/** 📘
	 * Calcula y devuelve el descenso (la distancia desde la línea base hasta la parte inferior del carácter más bajo) de la fuente actual.
	 * @param {string} str cadena a medir
	 * @returns {number} descenso del texto en píxeles
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * tamañoTexto(64);
	 * 
	 * rect(0, 100, 200, descensoTexto('q5'));
	 * texto('q5', 10, 100);
	 */
	function descensoTexto(str: string): number;

	/** 📘
	 * Crea una imagen a partir de una cadena de texto.
	 * @param {string} str cadena de texto
	 * @param {number} [anchoEnvoltura] ancho máximo de línea en caracteres
	 * @param {number} [limiteLineas] número máximo de líneas
	 * @returns {Q5.Image} un objeto de imagen representando el texto renderizado
	 * @example
	 * crearLienzo(200);
	 * tamañoTexto(96);
	 * 
	 * let img = crearImagenTexto('🐶');
	 * img.filtro(INVERTIR);
	 * 
	 * function dibujar() {
	 * 	imagen(img, 55, 10);
	 * }
	 */
	function crearImagenTexto(str: string, anchoEnvoltura: number, limiteLineas: number): Q5.Imagen;

	/** 📘
	 * Renderiza una imagen generada a partir de texto en el lienzo.
	 * 
	 * Si el primer parámetro es una cadena, se creará y almacenará en caché automáticamente
	 * una imagen del texto.
	 * 
	 * El posicionamiento de la imagen se ve afectado por la configuración actual de
	 * alineación de texto y línea base.
	 * 
	 * En q5 WebGPU, esta función es la única forma de dibujar texto multicolor,
	 * como emojis, y de usar fuentes que no están en formato MSDF.
	 * Usar esta función para dibujar texto que cambia cada fotograma tiene
	 * un costo de rendimiento muy alto.
	 * @param {Q5.Image | string} img imagen o texto
	 * @param {number} x coordenada-x donde se debe colocar la imagen
	 * @param {number} y coordenada-y donde se debe colocar la imagen
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * tamañoTexto(96);
	 * alineaciónTexto(CENTRO, CENTRO);
	 * 
	 * imagenTexto('🐶', 100, 100);
	 * @example
	 * crearLienzo(200);
	 * 
	 * cargarFuente('/assets/Robotica.ttf');
	 * 
	 * function setup() {
	 * 	fondo(200);
	 * 	tamañoTexto(66);
	 * 	imagenTexto('Hello!', 0, 0);
	 * }
	 */
	function imagenTexto(img: Q5.Imagen | String, x: number, y: number): void;

	/** 📘
	 * Formateador de números, se puede usar para mostrar un número como una cadena con
	 * un número especificado de dígitos antes y después del punto decimal,
	 * opcionalmente añadiendo relleno con ceros.
	 * @param {number} n número a formatear
	 * @param {number} l número mínimo de dígitos que aparecen antes del punto decimal; el número se rellena con ceros si es necesario
	 * @param {number} r número de dígitos que aparecen después del punto decimal
	 * @returns {string} una representación de cadena del número, formateada en consecuencia
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * 
	 * tamañoTexto(32);
	 * texto(nf(PI, 4, 5), 10, 60);
	 */
	function nf(num: number, digitos: number): string;

	/** 📘
	 * Estilo de fuente normal.
	 */
	const NORMAL: 'normal';

	/** 📘
	 * Estilo de fuente cursiva.
	 */
	const CURSIVA: 'italic';

	/** 📘
	 * Peso de fuente negrita.
	 */
	const NEGRILLA: 'bold';

	/** 📘
	 * Estilo de fuente negrita y cursiva.
	 */
	const NEGRILLA_CURSIVA: 'italic bold';

	/** 📘
	 * Alinear texto a la izquierda.
	 */
	const IZQUIERDA: 'left';

	/** 📘
	 * Alinear texto al centro.
	 */
	const CENTRO: 'center';

	/** 📘
	 * Alinear texto a la derecha.
	 */
	const DERECHA: 'right';

	/** 📘
	 * Alinear texto arriba.
	 */
	const ARRIBA: 'top';

	/** 📘
	 * Alinear texto abajo.
	 */
	const ABAJO: 'bottom';

	/** 📘
	 * Alinear texto a la línea base (alfabética).
	 */
	const LINEA_BASE: 'alphabetic';

	// 🖲 entrada

	/**
	 * El manejo de entrada de q5 es muy básico.
	 * 
	 * Para un mejor manejo de entrada, incluyendo soporte para controladores de juegos, considera usar el addon [p5play](https://p5play.org/) con q5.
	 * 
	 * Ten en cuenta que las respuestas de entrada dentro de `dibujar` pueden retrasarse
	 * hasta un ciclo de fotograma: desde el momento exacto en que ocurre un evento de entrada
	 * hasta la próxima vez que se dibuja un fotograma.
	 * 
	 * Reproduce sonidos o activa otra retroalimentación no visual inmediatamente
	 * respondiendo a eventos de entrada dentro de funciones como
	 * `alPresionarRatón` y `alPresionarTecla`.
	 */

	/** 🖲
	 * Posición X actual del ratón.
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	tamañoTexto(64);
	 * 	texto(redondear(ratónX), 50, 120);
	 * }
	 */
	let ratónX: number;

	/** 🖲
	 * Posición Y actual del ratón.
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	círculo(100, ratónY, 100);
	 * }
	 */
	let ratónY: number;

	/** 🖲
	 * Posición X previa del ratón.
	 */
	let pRatónX: number;

	/** 🖲
	 * Posición Y previa del ratón.
	 */
	let pRatónY: number;

	/** 🖲
	 * El botón actual siendo presionado: 'left', 'right', 'center').
	 * 
	 * El valor por defecto es una cadena vacía.
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	tamañoTexto(64);
	 * 	texto(botónRatón, 20, 120);
	 * }
	 */
	let botónRatón: string;

	/** 🖲
	 * Verdadero si el ratón está actualmente presionado, falso de lo contrario.
	 * @example
	 * function dibujar() {
	 * 	if (ratónPresionado) fondo(100);
	 * 	else fondo(200);
	 * }
	 */
	let ratónPresionado: boolean;

	/** 🖲
	 * Define esta función para responder a eventos de presionar el ratón.
	 * @example
	 * crearLienzo(200);
	 * let gris = 95;
	 * 
	 * function alPresionarRatón() {
	 * 	fondo(gris % 256);
	 * 	gris += 40;
	 * }
	 */
	function alPresionarRatón(): void;

	/** 🖲
	 * Define esta función para responder a eventos de soltar el ratón.
	 * @example
	 * crearLienzo(200);
	 * let gris = 95;
	 * 
	 * function alSoltarRatón() {
	 * 	fondo(gris % 256);
	 * 	gris += 40;
	 * }
	 */
	function alSoltarRatón(): void;

	/** 🖲
	 * Define esta función para responder a eventos de mover el ratón.
	 * 
	 * En dispositivos con pantalla táctil esta función no se llama
	 * cuando el usuario arrastra su dedo en la pantalla.
	 * @example
	 * crearLienzo(200);
	 * let gris = 95;
	 * 
	 * function alMoverRatón() {
	 * 	fondo(gris % 256);
	 * 	gris++;
	 * }
	 */
	function alMoverRatón(): void;

	/** 🖲
	 * Define esta función para responder a eventos de arrastrar el ratón.
	 * 
	 * Arrastrar el ratón se define como mover el ratón
	 * mientras un botón del ratón está presionado.
	 * @example
	 * crearLienzo(200);
	 * let gris = 95;
	 * 
	 * function alArrastrarRatón() {
	 * 	fondo(gris % 256);
	 * 	gris++;
	 * }
	 */
	function alArrastrarRatón(): void;

	/** 🖲
	 * Define esta función para responder a eventos de doble clic del ratón.
	 * @example
	 * crearLienzo(200);
	 * let gris = 95;
	 * 
	 * function dobleClic() {
	 * 	fondo(gris % 256);
	 * 	gris += 40;
	 * }
	 */
	function dobleClic(): void;

	/** 🖲
	 * El nombre de la última tecla presionada.
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	tamañoTexto(64);
	 * 	texto(tecla, 20, 120);
	 * }
	 */
	let tecla: string;

	/** 🖲
	 * Verdadero si una tecla está actualmente presionada, falso de lo contrario.
	 * @example
	 * function dibujar() {
	 * 	if (teclaPresionada) fondo(100);
	 * 	else fondo(200);
	 * }
	 */
	let teclaPresionada: boolean;

	/** 🖲
	 * Devuelve verdadero si el usuario está presionando la tecla especificada, falso
	 * de lo contrario. Acepta nombres de teclas insensibles a mayúsculas.
	 * @param {string} tecla tecla a comprobar
	 * @returns {boolean} verdadero si la tecla está presionada, falso de lo contrario
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 
	 * 	if (teclaEstaPresionada('f') && teclaEstaPresionada('j')) {
	 * 		rect(50, 50, 100, 100);
	 * 	}
	 * }
	 */
	function teclaEstaPresionada(tecla: string): boolean;

	/** 🖲
	 * Define esta función para responder a eventos de presionar tecla.
	 * @example
	 * crearLienzo(200);
	 * 
	 * let gris = 95;
	 * function alPresionarTecla() {
	 * 	fondo(gris % 256);
	 * 	gris += 40;
	 * }
	 */
	function alPresionarTecla(): void;

	/** 🖲
	 * Define esta función para responder a eventos de soltar tecla.
	 * @example
	 * crearLienzo(200);
	 * 
	 * let gris = 95;
	 * function alSoltarTecla() {
	 * 	fondo(gris % 256);
	 * 	gris += 40;
	 * }
	 */
	function alSoltarTecla(): void;

	/** 🖲
	 * Array que contiene todos los puntos de toque actuales dentro de la
	 * ventana del navegador. Cada toque es un objeto con
	 * propiedades `id`, `x`, e `y`.
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	for (let toque of toques) {
	 * 		círculo(toque.x, toque.y, 100);
	 * 	}
	 * }
	 */
	let toques: any[];

	/** 🖲
	 * Define esta función para responder a eventos de inicio de toque
	 * en el lienzo.
	 * 
	 * Devuelve true para habilitar gestos táctiles como pellizcar para hacer zoom
	 * y desplazarse, que q5 deshabilita en el lienzo por defecto.
	 * @example
	 * crearLienzo(200);
	 * 
	 * let gris = 95;
	 * function alEmpezarToque() {
	 * 	fondo(gris % 256);
	 * 	gris += 40;
	 * }
	 */
	function alEmpezarToque(): void;

	/** 🖲
	 * Define esta función para responder a eventos de fin de toque
	 * en el lienzo.
	 * 
	 * Devuelve true para habilitar gestos táctiles como pellizcar para hacer zoom
	 * y desplazarse, que q5 deshabilita en el lienzo por defecto.
	 * @example
	 * crearLienzo(200);
	 * 
	 * let gris = 95;
	 * function alTerminarToque() {
	 * 	fondo(gris % 256);
	 * 	gris += 40;
	 * }
	 */
	function alTerminarToque(): void;

	/** 🖲
	 * Define esta función para responder a eventos de movimiento de toque
	 * en el lienzo.
	 * 
	 * Devuelve true para habilitar gestos táctiles como pellizcar para hacer zoom
	 * y desplazarse, que q5 deshabilita en el lienzo por defecto.
	 * @example
	 * crearLienzo(200);
	 * let gris = 95;
	 * 
	 * function alMoverToque() {
	 * 	fondo(gris % 256);
	 * 	gris++;
	 * }
	 */
	function alMoverToque(): void;

	/** 🖲
	 * Objeto que contiene todos los punteros actuales dentro de la
	 * ventana del navegador.
	 * 
	 * Esto incluye ratón, toque y punteros de lápiz.
	 * 
	 * Cada puntero es un objeto con
	 * propiedades `event`, `x`, e `y`.
	 * La propiedad `event` contiene el
	 * [PointerEvent](https://developer.mozilla.org/docs/Web/API/PointerEvent) original.
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	for (let punteroID in punteros) {
	 * 		let puntero = punteros[punteroID];
	 * 		círculo(puntero.x, puntero.y, 100);
	 * 	}
	 * }
	 */
	let punteros: {};

	/** 🖲
	 * Establece el cursor a un [tipo de cursor CSS](https://developer.mozilla.org/docs/Web/CSS/cursor) o imagen.
	 * Si se proporciona una imagen, las coordenadas x e y opcionales pueden
	 * especificar el punto activo del cursor.
	 * @param {string} nombre nombre del cursor o la url a una imagen
	 * @param {number} [x] coordenada x del punto del cursor
	 * @param {number} [y] coordenada y del punto del cursor
	 * @example
	 * crearLienzo(200, 100);
	 * cursor('pointer');
	 */
	function cursor(nombre: string, x?: number, y?: number): void;

	/** 🖲
	 * Oculta el cursor dentro de los límites del lienzo.
	 * @example
	 * crearLienzo(200, 100);
	 * sinCursor();
	 */
	function sinCursor(): void;

	/** 🖲
	 * Define esta función para responder a eventos de la rueda del ratón.
	 * 
	 * `event.deltaX` y `event.deltaY` son las cantidades de desplazamiento horizontal y vertical,
	 * respectivamente.
	 * 
	 * Devuelve true para permitir el comportamiento por defecto de desplazar la página.
	 * @example
	 * let x = (y = 100);
	 * function dibujar() {
	 * 	círculo(x, y, 10);
	 * }
	 * function ruedaRatón(e) {
	 * 	x += e.deltaX;
	 * 	y += e.deltaY;
	 * 	return false;
	 * }
	 */
	function ruedaRatón(evento: any): void;

	/** 🖲
	 * Solicita que el puntero se bloquee al cuerpo del documento, ocultando
	 * el cursor y permitiendo un movimiento ilimitado.
	 * 
	 * Los sistemas operativos habilitan la aceleración del ratón por defecto, lo cual es útil cuando a veces quieres un movimiento lento y preciso (piensa en cómo usarías un paquete de gráficos), pero también quieres moverte grandes distancias con un movimiento de ratón más rápido (piensa en desplazarte y seleccionar varios archivos). Para algunos juegos, sin embargo, se prefieren los datos de entrada de ratón sin procesar para controlar la rotación de la cámara — donde el mismo movimiento de distancia, rápido o lento, resulta en la misma rotación.
	 * 
	 * Para salir del modo de bloqueo de puntero, llama a `document.exitPointerLock()`.
	 * @param {boolean} movimientoNoAjustado establecer a true para deshabilitar la aceleración del ratón a nivel de SO y acceder a la entrada de ratón sin procesar
	 * @example
	 * function dibujar() {
	 * 	círculo(ratónX / 10 + 100, ratónY / 10 + 100, 10);
	 * }
	 * 
	 * function dobleClic() {
	 * 	if (!document.pointerLockElement) {
	 * 		bloqueoPuntero();
	 * 	} else {
	 * 		document.exitPointerLock();
	 * 	}
	 * }
	 */
	function bloqueoPuntero(movimientoNoAjustado: boolean): void;

	// 🎨 color

	/** 🎨
	 * Crea un nuevo objeto `Color`, el cual es útil principalmente para almacenar
	 * un color que tu sketch reutilizará o modificará más tarde.
	 * 
	 * Con el modo de color por defecto, RGB, los colores tienen componentes `r`/`red` (rojo), `g`/`green` (verde),
	 * `b`/`blue` (azul), y `a`/`alpha` (alfa).
	 * 
	 * Las funciones [`relleno`](https://q5js.org/learn/#fill), [`trazo`](https://q5js.org/learn/#stroke), y [`fondo`](https://q5js.org/learn/#background)
	 * aceptan la misma amplia gama de representaciones de color que esta función.
	 *
	 * El formato de color por defecto es "entero" ("integer"),
	 * así que establece componentes a valores entre 0 y 255.
	 * 
	 * Aquí hay algunos ejemplos de uso válido:
	 * 
	 * - `color(255)` (escala de grises)
	 * - `color(255, 200)` (escala de grises, alfa)
	 * - `color(255, 0, 0)` (r, g, b)
	 * - `color(255, 0, 0, 10)` (r, g, b, a)
	 * - `color('red')` (nombre de color)
	 * - `color('#ff0000')` (color hex)
	 * - `color([255, 0, 0])` (componentes de color)
	 * @param {string | number | Color | number[]} c0 color o primer componente de color
	 * @param {number} [c1] segundo componente de color
	 * @param {number} [c2] tercer componente de color
	 * @param {number} [c3] cuarto componente de color (alfa)
	 * @returns {Color} un nuevo objeto `Color`
	 * @example
	 * crearLienzo(200);
	 * rect(0, 0, 100, 200);
	 * 
	 * //                ( r,   g,   b,   a)
	 * let botella = color(90, 100, 255, 100);
	 * relleno(botella);
	 * trazo(botella);
	 * grosorTrazo(30);
	 * círculo(100, 100, 155);
	 * @example
	 * crearLienzo(200);
	 * //          (gris, alfa)
	 * let c = color(200, 50);
	 * 
	 * function dibujar() {
	 * 	fondo(c);
	 * 	círculo(ratónX, ratónY, 50);
	 * 	c.g = (c.g + 1) % 256;
	 * }
	 * @example
	 * crearLienzo(200);
	 * 
	 * //           (r,   g,   b,  a)
	 * let c = color(0, 255, 255, 50);
	 * 
	 * function dibujar() {
	 * 	relleno(c);
	 * 	círculo(ratónX, ratónY, 50);
	 * }
	 */
	function color(c0: string | number | Color | number[], c1?: number, c2?: number, c3?: number): Color;

	/** 🎨
	 * Establece el modo de color para el sketch, lo cual cambia cómo se
	 * interpretan y muestran los colores.
	 * 
	 * La gama de color es 'display-p3' por defecto, si el dispositivo soporta HDR.
	 *
	 * El modo de color por defecto es RGB en formato entero legado.
	 * @param {'rgb' | 'oklch' | 'hsl' | 'hsb'} modo modo de color
	 * @param {1 | 255} formato formato de color (1 para flotante, 255 para entero)
	 * @param {'srgb' | 'display-p3'} [gama] gama de color
	 * @example
	 * crearLienzo(200);
	 * 
	 * modoColor(RGB, 1);
	 * relleno(1, 0, 0);
	 * rect(0, 0, 66, 200);
	 * relleno(0, 1, 0);
	 * rect(66, 0, 67, 200);
	 * relleno(0, 0, 1);
	 * rect(133, 0, 67, 200);
	 * @example
	 * crearLienzo(200);
	 * 
	 * modoColor(OKLCH);
	 * 
	 * relleno(0.25, 0.15, 0);
	 * rect(0, 0, 100, 200);
	 * 
	 * relleno(0.75, 0.15, 0);
	 * rect(100, 0, 100, 200);
	 */
	function modoColor(modo: 'rgb' | 'oklch', formato: 1 | 255, gama: 'srgb' | 'display-p3'): void;

	/** 🎨
	 * Los colores RGB tienen componentes `r`/`red` (rojo), `g`/`green` (verde), `b`/`blue` (azul),
	 * y `a`/`alpha` (alfa).
	 * 
	 * Por defecto cuando un lienzo está usando el espacio de color HDR "display-p3",
	 * los colores rgb son mapeados a la gama completa P3, incluso cuando usan el
	 * formato entero legado 0-255.
	 * @example
	 * crearLienzo(200, 100);
	 * 
	 * modoColor(RGB);
	 * 
	 * fondo(255, 0, 0);
	 */
	const RGB: 'rgb';

	/** 🎨
	 * Los colores OKLCH tienen componentes `l`/`lightness` (luminosidad), `c`/`chroma` (croma),
	 * `h`/`hue` (tono), y `a`/`alpha` (alfa). Es más intuitivo para los humanos
	 * trabajar con color en estos términos que con RGB.
	 * 
	 * OKLCH es perceptualmente uniforme, lo que significa que los colores con la
	 * misma luminosidad y croma (colorido) parecerán tener
	 * igual luminancia, independientemente del tono.
	 * 
	 * OKLCH puede representar con precisión todos los colores visibles para el
	 * ojo humano, a diferencia de muchos otros espacios de color que están limitados
	 * a una gama. Los valores máximos de luminosidad y croma que
	 * corresponden a los límites de la gama sRGB o P3 varían dependiendo del
	 * tono. Los colores que están fuera de la gama serán recortados al
	 * color dentro de la gama más cercano.
	 * 
	 * Usa el [selector de color OKLCH](https://oklch.com) para encontrar
	 * colores dentro de la gama.
	 * 
	 * - `lightness`: 0 a 1
	 * - `chroma`: 0 a ~0.4
	 * - `hue`: 0 a 360
	 * - `alpha`: 0 a 1
	 * @example
	 * crearLienzo(200, 100);
	 * 
	 * modoColor(OKLCH);
	 * 
	 * fondo(0.64, 0.3, 30);
	 * @example
	 * crearLienzo(200);
	 * modoColor(OKLCH);
	 * 
	 * function dibujar() {
	 * 	fondo(0.7, 0.16, cuadroActual % 360);
	 * }
	 */
	const OKLCH: 'oklch';

	/** 🎨
	 * Los colores HSL tienen componentes `h`/`hue` (tono), `s`/`saturation` (saturación),
	 * `l`/`lightness` (luminosidad), y `a`/`alpha` (alfa).
	 * 
	 * HSL fue creado en la década de 1970 para aproximar la percepción humana
	 * del color, intercambiando precisión por cálculos más simples. No es
	 * perceptualmente uniforme, por lo que colores con la misma luminosidad
	 * pueden parecer más oscuros o más claros, dependiendo de su tono
	 * y saturación. Sin embargo, los valores de luminosidad y saturación que
	 * corresponden a los límites de la gama siempre son 100, independientemente del
	 * tono. Esto puede hacer que HSL sea más fácil de trabajar que OKLCH.
	 * 
	 * Los colores HSL son mapeados a la gama completa P3 cuando
	 * se usa el espacio de color "display-p3".
	 * 
	 * - `hue`: 0 a 360
	 * - `saturation`: 0 a 100
	 * - `lightness`: 0 a 100
	 * - `alpha`: 0 a 1
	 * @example
	 * crearLienzo(200, 100);
	 * 
	 * modoColor(HSL);
	 * 
	 * fondo(0, 100, 50);
	 * @example
	 * crearLienzo(200, 220);
	 * sinTrazo();
	 * 
	 * modoColor(HSL);
	 * for (let h = 0; h < 360; h += 10) {
	 * 	for (let l = 0; l <= 100; l += 10) {
	 * 		relleno(h, 100, l);
	 * 		rect(h * (11 / 20), l * 2, 6, 20);
	 * 	}
	 * }
	 */
	const HSL: 'hsl';

	/** 🎨
	 * Los colores HSB tienen componentes `h`/`hue` (tono), `s`/`saturation` (saturación),
	 * `b`/`brightness` (brillo) (también conocido como `v`/`value` (valor)), y `a`/`alpha` (alfa).
	 * 
	 * HSB es similar a HSL, pero en lugar de luminosidad
	 * (negro a blanco), usa brillo (negro a
	 * color completo). Para producir blanco, establece el brillo
	 * a 100 y la saturación a 0.
	 * 
	 * - `hue`: 0 a 360
	 * - `saturation`: 0 a 100
	 * - `brightness`: 0 a 100
	 * - `alpha`: 0 a 1
	 * @example
	 * crearLienzo(200, 100);
	 * 
	 * modoColor(HSB);
	 * 
	 * fondo(0, 100, 100);
	 * @example
	 * crearLienzo(200, 220);
	 * sinTrazo();
	 * 
	 * modoColor(HSB);
	 * for (let h = 0; h < 360; h += 10) {
	 * 	for (let b = 0; b <= 100; b += 10) {
	 * 		relleno(h, 100, b);
	 * 		rect(h * (11 / 20), b * 2, 6, 20);
	 * 	}
	 * }
	 */
	const HSB: 'hsb';

	/** 🎨
	 * Limita la gama de color al espacio de color sRGB.
	 * 
	 * Si tu pantalla es capaz de HDR, nota que el rojo completo aparece
	 * menos saturado y oscuro en este ejemplo, como lo haría en
	 * una pantalla SDR.
	 * @example
	 * crearLienzo(200, 100);
	 * 
	 * modoColor(RGB, 255, SRGB);
	 * 
	 * fondo(255, 0, 0);
	 */
	const SRGB: 'srgb';

	/** 🎨
	 * Expande la gama de color al espacio de color P3.
	 * 
	 * Esta es la gama de color por defecto en dispositivos que soportan HDR.
	 * 
	 * Si tu pantalla es capaz de HDR, nota que el rojo completo aparece
	 * totalmente saturado y brillante en el siguiente ejemplo.
	 * @example
	 * crearLienzo(200, 100);
	 * 
	 * modoColor(RGB, 255, DISPLAY_P3);
	 * 
	 * fondo(255, 0, 0);
	 */
	const DISPLAY_P3: 'display-p3';

	/** 🎨
	 * Dibuja sobre todo el lienzo con un color o una imagen.
	 * 
	 * Al igual que la función [`color`](https://q5js.org/learn/#color),
	 * esta función puede aceptar colores en una amplia gama de formatos:
	 * cadena de color CSS, valor de escala de grises y valores de componentes de color.
	 * @param {Color | Q5.Image} relleno un color o una imagen para dibujar
	 * @example
	 * crearLienzo(200, 100);
	 * fondo('crimson');
	 * @example
	 * function dibujar() {
	 * 	fondo(128, 32);
	 * 	círculo(ratónX, ratónY, 20);
	 * }
	 */
	function fondo(relleno: Color | Q5.Imagen): void;

	class Color {

		/** 🎨
		 * Este constructor acepta estrictamente 4 números, que son los componentes del color.
		 * 
		 * Usa la función `color` para mayor flexibilidad, ejecuta
		 * este constructor internamente.
		 * 
		 * `Color` no es realmente una clase en si misma, es una referencia a una
		 * clase de color Q5 basada en el modo de color, formato y gama.
		 */
		constructor(c0: number, c1: number, c2: number, c3: number);

		/** 🎨
		 * Comprueba si este color es exactamente igual a otro color.
		 */
		igual(otro: Color): boolean;

		/** 🎨
		 * Comprueba si el color es el mismo que otro color,
		 * ignorando sus valores alfa.
		 */
		esMismoColor(otro: Color): boolean;

		/** 🎨
		 * Produce una representación de cadena de color CSS.
		 */
		toString(): string;

		/** 🎨
		 * Un array de los componentes del color.
		 */
		niveles: number[];
	}

	// 💅 estilos

	/** 💅
	 * Establece el color de relleno. El defecto es blanco.
	 * 
	 * Como la función [`color`](https://q5js.org/learn/#color), esta función
	 * puede aceptar colores en una amplia gama de formatos: como una cadena de color CSS,
	 * un objeto `Color`, valor de escala de grises, o valores de componentes de color.
	 * @param {Color} color color de relleno
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * 
	 * relleno('red');
	 * círculo(80, 80, 80);
	 * 
	 * relleno('lime');
	 * cuadrado(80, 80, 80);
	 */
	function relleno(color: Color): void;

	/** 💅
	 * Establece el color del trazo (contorno). El defecto es negro.
	 * 
	 * Como la función [`color`](https://q5js.org/learn/#color), esta función
	 * puede aceptar colores en una amplia gama de formatos: como una cadena de color CSS,
	 * un objeto `Color`, valor de escala de grises, o valores de componentes de color.
	 * @param {Color} color color de trazo
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * relleno(36);
	 * 
	 * trazo('red');
	 * círculo(80, 80, 80);
	 * 
	 * trazo('lime');
	 * cuadrado(80, 80, 80);
	 */
	function trazo(color: Color): void;

	/** 💅
	 * Después de llamar a esta función, el dibujo no será rellenado.
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * 
	 * sinRelleno();
	 * 
	 * trazo('red');
	 * círculo(80, 80, 80);
	 * trazo('lime');
	 * cuadrado(80, 80, 80);
	 */
	function sinRelleno(): void;

	/** 💅
	 * Después de llamar a esta función, el dibujo no tendrá un trazo (contorno).
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * relleno(36);
	 * trazo('red');
	 * círculo(80, 80, 80);
	 * 
	 * sinTrazo();
	 * cuadrado(80, 80, 80);
	 */
	function sinTrazo(): void;

	/** 💅
	 * Establece el tamaño del trazo usado para líneas y el borde alrededor de dibujos.
	 * @param {number} grosor tamaño del trazo en píxeles
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * trazo('red');
	 * círculo(50, 100, 80);
	 * 
	 * grosorTrazo(12);
	 * círculo(150, 100, 80);
	 */
	function grosorTrazo(grosor: number): void;

	/** 💅
	 * Establece la opacidad global, que afecta a todas las operaciones de dibujo posteriores, excepto `fondo`. El defecto es 1, totalmente opaco.
	 * 
	 * En q5 WebGPU esta función solo afecta a imágenes.
	 * @param {number} alfa nivel de opacidad, variando de 0 a 1
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * 
	 * opacidad(1);
	 * círculo(80, 80, 80);
	 * 
	 * opacidad(0.2);
	 * cuadrado(80, 80, 80);
	 */
	function opacidad(alfa: number): void;

	/** 💅
	 * Establece el color de la sombra. El defecto es transparente (sin sombra).
	 * 
	 * Las sombras se aplican a cualquier cosa dibujada en el lienzo, incluyendo formas rellenas,
	 * trazos, texto, e imágenes.
	 * 
	 * Como la función [`color`](https://q5js.org/learn/#color), esta función
	 * puede aceptar colores en una amplia gama de formatos: como una cadena de color CSS,
	 * un objeto `Color`, valor de escala de grises, o valores de componentes de color.
	 * 
	 * No disponible en q5 WebGPU.
	 * @param {Color} color color de sombra
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * 
	 * sinRelleno();
	 * sombra('black');
	 * rect(64, 60, 80, 80);
	 * @example
	 * crearLienzo(200);
	 * let logo = cargarImagen('/assets/p5play_logo.webp');
	 * 
	 * function setup() {
	 * 	fondo(200);
	 * 	sombra(0);
	 * 	imagen(logo, 36, 36, 128, 128);
	 * }
	 */
	function sombra(color: string | Color): void;

	/** 💅
	 * Deshabilita el efecto de sombra.
	 * 
	 * No disponible en q5 WebGPU.
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * sinTrazo();
	 * sombra('black');
	 * rect(14, 14, 80, 80);
	 * 
	 * sinSombra();
	 * rect(104, 104, 80, 80);
	 */
	function sinSombra(): void;

	/** 💅
	 * Establece el desplazamiento de la sombra y el radio de desenfoque.
	 * 
	 * Cuando q5 comienza, el desplazamiento de la sombra es (10, 10) con un desenfoque de 10.
	 * 
	 * No disponible en q5 WebGPU.
	 * @param {number} offsetX desplazamiento horizontal de la sombra
	 * @param {number} offsetY desplazamiento vertical de la sombra, por defecto es el mismo que offsetX
	 * @param {number} desenfoque radio de desenfoque de la sombra, por defecto es 0
	 * @example
	 * crearLienzo(200);
	 * sinTrazo();
	 * sombra(50);
	 * 
	 * function dibujar() {
	 * 	fondo(200);
	 * 	cajaSombra(-20, ratónY, 10);
	 * 	círculo(100, 100, 80, 80);
	 * }
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * sinTrazo();
	 * 
	 * sombra('aqua');
	 * cajaSombra(20);
	 * rect(50, 50, 100, 100);
	 * tamañoTexto(64);
	 * texto('q5', 60, 115);
	 */
	function cajaSombra(offsetX: number, offsetY: number, desenfoque: number): void;

	/** 💅
	 * Establece la operación de composición global para el contexto del lienzo.
	 * 
	 * No disponible en q5 WebGPU.
	 * @param {string} val operación de composición
	 */
	function modoMezcla(val: string): void;

	/** 💅
	 * Establece el estilo de terminación de línea a `ROUND`, `SQUARE`, o `PROJECT`.
	 * 
	 * No disponible en q5 WebGPU.
	 * @param {CanvasLineCap} val estilo de terminación de línea
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * grosorTrazo(20);
	 * 
	 * terminaciónTrazo(ROUND);
	 * línea(50, 50, 150, 50);
	 * 
	 * terminaciónTrazo(SQUARE);
	 * línea(50, 100, 150, 100);
	 * 
	 * terminaciónTrazo(PROJECT);
	 * línea(50, 150, 150, 150);
	 */
	function terminaciónTrazo(val: CanvasLineCap): void;

	/** 💅
	 * Establece el estilo de unión de línea a `ROUND`, `BEVEL`, o `MITER`.
	 * 
	 * No disponible en q5 WebGPU.
	 * @param {CanvasLineJoin} val estilo de unión de línea
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * grosorTrazo(10);
	 * 
	 * uniónTrazo(ROUND);
	 * triángulo(50, 20, 150, 20, 50, 70);
	 * 
	 * uniónTrazo(BEVEL);
	 * triángulo(150, 50, 50, 100, 150, 150);
	 * 
	 * uniónTrazo(MITER);
	 * triángulo(50, 130, 150, 180, 50, 180);
	 */
	function uniónTrazo(val: CanvasLineJoin): void;

	/** 💅
	 * Establece el lienzo en modo borrar, donde las formas borrarán lo que está
	 * debajo de ellas en lugar de dibujar sobre ello.
	 * 
	 * No disponible en q5 WebGPU.
	 * @param {number} [rellenoAlfa] nivel de opacidad del color de relleno
	 * @param {number} [trazoAlfa] nivel de opacidad del color de trazo
	 */
	function borrar(rellenoAlfa?: number, trazoAlfa?: number): void;

	/** 💅
	 * Reinicia el lienzo del modo borrar al modo de dibujo normal.
	 * 
	 * No disponible en q5 WebGPU.
	 */
	function noBorrar(): void;

	/** 💅
	 * Guarda la configuración de estilo de dibujo actual.
	 * 
	 * Esto incluye el relleno, trazo, grosor de trazo, tinte, modo de imagen,
	 * modo de rectángulo, modo de elipse, tamaño de texto, alineación de texto, línea base de texto, y
	 * configuración de sombra.
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * 
	 * guardarEstilos();
	 * relleno('blue');
	 * círculo(50, 50, 80);
	 * 
	 * recuperarEstilos();
	 * círculo(150, 150, 80);
	 */
	function guardarEstilos(): void;

	/** 💅
	 * Restaura la configuración de estilo de dibujo guardada previamente.
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * 
	 * guardarEstilos();
	 * relleno('blue');
	 * círculo(50, 50, 80);
	 * 
	 * recuperarEstilos();
	 * círculo(150, 150, 80);
	 */
	function recuperarEstilos(): void;

	/** 💅
	 * Limpia el lienzo, haciendo que cada píxel sea completamente transparente.
	 * 
	 * Ten en cuenta que el lienzo solo se puede ver a través si tiene un canal alfa.
	 * 
	 * #### webgpu
	 * @example
	 * crearLienzo(200, 200, { alpha: true });
	 * 
	 * function dibujar() {
	 * 	limpiar();
	 * 	círculo(frameCount % 200, 100, 80);
	 * }
	 */
	function limpiar(): void;

	/** 💅
	 * Comprueba si un punto dado está dentro del área de relleno del camino actual.
	 * 
	 * No disponible en q5 WebGPU.
	 * @param {number} x coordenada-x del punto
	 * @param {number} y coordenada-y del punto
	 * @returns {boolean} verdadero si el punto está dentro del área de relleno, falso de lo contrario
	 */
	function enRelleno(x: number, y: number): boolean;

	/** 💅
	 * Comprueba si un punto dado está dentro del trazo del camino actual.
	 * 
	 * No disponible en q5 WebGPU.
	 * @param {number} x coordenada-x del punto
	 * @param {number} y coordenada-y del punto
	 * @returns {boolean} verdadero si el punto está dentro del trazo, falso de lo contrario
	 */
	function enTrazo(x: number, y: number): boolean;

	// 🦋 transformaciones

	/** 🦋
	 * Traslada el origen del contexto de dibujo.
	 * @param {number} x traslación a lo largo del eje x
	 * @param {number} y traslación a lo largo del eje y
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 
	 * 	trasladar(150, 150);
	 * 	círculo(0, 0, 80);
	 * }
	 */
	function trasladar(x: number, y: number): void;

	/** 🦋
	 * Rota el contexto de dibujo.
	 * @param {number} angulo ángulo de rotación en radianes
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 
	 * 	trasladar(100, 100);
	 * 	rotar(ratónX / 50);
	 * 
	 * 	modoRect(CENTER);
	 * 	cuadrado(0, 0, 50);
	 * }
	 */
	function rotar(angulo: number): void;

	/** 🦋
	 * Escala el contexto de dibujo.
	 * 
	 * Si solo se proporciona un parámetro de entrada,
	 * el contexto de dibujo se escalará uniformemente.
	 * @param {number} x factor de escala a lo largo del eje x
	 * @param {number} [y] factor de escala a lo largo del eje y
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 
	 * 	escalar(ratónX / 10);
	 * 	círculo(0, 0, 20);
	 * }
	 */
	function escalar(x: number, y?: number): void;

	/** 🦋
	 * Cizalla el contexto de dibujo a lo largo del eje x.
	 * @param {number} angulo ángulo de cizallamiento en radianes
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 
	 * 	trasladar(25, 60);
	 * 	cizallarX(ratónX / 100);
	 * 	cuadrado(0, 0, 80);
	 * }
	 */
	function cizallarX(angulo: number): void;

	/** 🦋
	 * Cizalla el contexto de dibujo a lo largo del eje y.
	 * @param {number} angulo ángulo de cizallamiento en radianes
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 
	 * 	trasladar(25, 60);
	 * 	cizallarY(ratónX / 100);
	 * 	cuadrado(0, 0, 80);
	 * }
	 */
	function cizallarY(angulo: number): void;

	/** 🦋
	 * Aplica una matriz de transformación.
	 * 
	 * Acepta una matriz de 3x3 como un array o múltiples argumentos.
	 * @param {number} a
	 * @param {number} b
	 * @param {number} c
	 * @param {number} d
	 * @param {number} e
	 * @param {number} f
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 
	 * 	aplicarMatriz(2, 1, 1, 1, 100, 100);
	 * 	círculo(0, 0, 80);
	 * }
	 */
	function aplicarMatriz(a: number, b: number, c: number, d: number, e: number, f: number): void;

	/** 🦋
	 * Reinicia la matriz de transformación.
	 * 
	 * q5 ejecuta esta función antes de cada vez que se ejecuta la función `dibujar`,
	 * para que las transformaciones no se trasladen al siguiente fotograma.
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * 
	 * trasladar(100, 100);
	 * círculo(0, 0, 80);
	 * 
	 * reiniciarMatriz();
	 * cuadrado(0, 0, 50);
	 */
	function reiniciarMatriz(): void;

	/** 🦋
	 * Guarda la matriz de transformación actual.
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * trasladar(100, 100);
	 * 
	 * guardarMatriz();
	 * rotar(CUARTO_PI);
	 * elipse(0, 0, 120, 40);
	 * recuperarMatriz();
	 * 
	 * elipse(0, 0, 120, 40);
	 */
	function guardarMatriz(): void;

	/** 🦋
	 * Restaura la matriz de transformación guardada previamente.
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * trasladar(100, 100);
	 * 
	 * guardarMatriz();
	 * rotar(CUARTO_PI);
	 * elipse(0, 0, 120, 40);
	 * recuperarMatriz();
	 * 
	 * elipse(0, 0, 120, 40);
	 */
	function recuperarMatriz(): void;

	/** 🦋
	 * Guarda la configuración de estilo de dibujo y transformaciones actuales.
	 * @example
	 * crearLienzo(200);
	 * 
	 * apilar();
	 * relleno('blue');
	 * trasladar(100, 100);
	 * círculo(0, 0, 80);
	 * desapilar();
	 * 
	 * cuadrado(0, 0, 50);
	 */
	function apilar(): void;

	/** 🦋
	 * Restaura la configuración de estilo de dibujo y transformaciones guardadas previamente.
	 * @example
	 * crearLienzo(200);
	 * 
	 * apilar();
	 * relleno('blue');
	 * trasladar(100, 100);
	 * círculo(0, 0, 80);
	 * desapilar();
	 * 
	 * cuadrado(0, 0, 50);
	 */
	function desapilar(): void;

	function recuperar(): void;

	// 💻 visualización

	/** 💻
	 * Personaliza cómo se presenta tu lienzo.
	 * @param {string} modo NORMAL, CENTRO, o MAXIMIZADO
	 * @param {string} calidadRenderizado SUAVE o PIXELADO
	 * @param {number} escala también se puede dar como una cadena (por ejemplo "x2")
	 * @example
	 * crearLienzo(50, 25);
	 * 
	 * modoVisualización(CENTRO, PIXELADO, 4);
	 * 
	 * círculo(25, 12.5, 16);
	 */
	function modoVisualización(modo: string, calidadRender: string, escala: string | number): void;

	/** 💻
	 * Una configuración de `modoVisualización`.
	 * 
	 * El lienzo se escalará para llenar el elemento padre,
	 * con bandas negras si es necesario para preservar su relación de aspecto.
	 */
	const MAXIMIZADO: 'maxed';

	/** 💻
	 * Una calidad de renderizado de `modoVisualización`.
	 * 
	 * Se usa escalado suave si el lienzo se escala.
	 */
	const SUAVE: 'smooth';

	/** 💻
	 * Una calidad de renderizado de `modoVisualización`.
	 * 
	 * Los píxeles se renderizan como cuadrados nítidos si el lienzo se escala.
	 */
	const PIXELADO: 'pixelated';

	/** 💻
	 * Habilita o deshabilita el modo de pantalla completa.
	 * @param {boolean} [v] booleano indicando si habilitar o deshabilitar el modo de pantalla completa
	 */
	function pantallaCompleta(v?: boolean): void;

	/** 💻
	 * El ancho de la ventana.
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	tamañoTexto(64);
	 * 	alineaciónTexto(CENTRO, CENTRO);
	 * 	texto(anchoVentana, 100, 100);
	 * }
	 */
	var anchoVentana: number;

	/** 💻
	 * El alto de la ventana.
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	tamañoTexto(64);
	 * 	alineaciónTexto(CENTRO, CENTRO);
	 * 	texto(altoVentana, 100, 100);
	 * }
	 */
	var altoVentana: number;

	/** 💻
	 * El ancho del lienzo.
	 */
	var ancho: number;

	/** 💻
	 * El alto del lienzo.
	 */
	var alto: number;

	/** 💻
	 * La mitad del ancho del lienzo.
	 */
	var medioAncho: number;

	/** 💻
	 * La mitad del alto del lienzo.
	 */
	var medioAlto: number;

	/** 💻
	 * El elemento lienzo asociado con la instancia Q5.
	 * 
	 * Si no se crea un lienzo explícitamente con `crearLienzo()`, pero se define una función q5 como `dibujar` o `alPresionarRatón`, se creará automáticamente un lienzo por defecto de tamaño 200x200.
	 */
	var lienzo: HTMLCanvasElement;

	/** 💻
	 * Redimensiona el lienzo al ancho y alto especificados.
	 * @param {number} w ancho del lienzo
	 * @param {number} h alto del lienzo
	 * @example
	 * crearLienzo(200, 100);
	 * 
	 * function dibujar() {
	 * 	fondo(200);
	 * }
	 * 
	 * function alPresionarRatón() {
	 * 	redimensionarLienzo(200, 200);
	 * }
	 */
	function redimensionarLienzo(w: number, h: number): void;

	/** 💻
	 * El número de cuadros que se han mostrado desde que comenzó el programa.
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	tamañoTexto(64);
	 * 	texto(cuadroActual, 8, 120);
	 * }
	 */
	var cuadroActual: number;

	/** 💻
	 * Detiene el bucle de dibujo.
	 * @example
	 * function dibujar() {
	 * 	círculo(cuadroActual * 5, 100, 80);
	 * 	pausar();
	 * }
	 */
	function pausar(): void;

	/** 💻
	 * Redibuja el lienzo n veces. Si no se proporciona ningún parámetro de entrada,
	 * llama a la función de dibujo una vez.
	 * 
	 * Esta es una función asíncrona.
	 * @param {number} [n] número de veces para redibujar el lienzo, por defecto es 1
	 * @example
	 * crearLienzo(200);
	 * pausar();
	 * 
	 * function dibujar() {
	 * 	círculo(cuadroActual * 5, 100, 80);
	 * }
	 * function alPresionarRatón() {
	 * 	redibujar(10);
	 * }
	 */
	function redibujar(n?: number): void;

	/** 💻
	 * Inicia el bucle de dibujo de nuevo si estaba detenido.
	 * @example
	 * crearLienzo(200);
	 * pausar();
	 * 
	 * function dibujar() {
	 * 	círculo(cuadroActual * 5, 100, 80);
	 * }
	 * function alPresionarRatón() {
	 * 	reanudar();
	 * }
	 */
	function reanudar(): void;

	/** 💻
	 * Establece la frecuencia de fotogramas objetivo u obtiene una aproximación de la
	 * frecuencia de fotogramas actual del sketch.
	 * 
	 * Incluso cuando el sketch se está ejecutando a una frecuencia de fotogramas consistente,
	 * el valor actual de la frecuencia de fotogramas fluctuará. Usa las herramientas de desarrollador
	 * de tu navegador web para un análisis de rendimiento más preciso.
	 * @param {number} [hertz] frecuencia de fotogramas objetivo, por defecto es 60
	 * @returns {number} frecuencia de fotogramas actual
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 
	 * 	if (ratónPresionado) frecuenciaRefresco(10);
	 * 	else frecuenciaRefresco(60);
	 * 
	 * 	círculo(cuadroActual % 200, 100, 80);
	 * }
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	tamañoTexto(64);
	 * 	texto(redondear(frecuenciaRefresco()), 65, 120);
	 * }
	 */
	function frecuenciaRefresco(hertz?: number): number;

	/** 💻
	 * La frecuencia de fotogramas deseada del sketch.
	 * @returns {number} frecuencia de fotogramas objetivo
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	tamañoTexto(64);
	 * 
	 * 	texto(obtenerTasaFotogramasObjetivo(), 65, 120);
	 * }
	 */
	function obtenerTasaFotogramasObjetivo(): number;

	/** 💻
	 * Obtiene los FPS actuales, en términos de cuántos fotogramas podrían generarse
	 * en un segundo, lo cual puede ser más alto que la frecuencia de fotogramas objetivo.
	 * 
	 * Usa las herramientas de desarrollador de tu navegador web para un análisis
	 * de rendimiento más profundo.
	 * @returns {number} fotogramas por segundo
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	frecuenciaRefresco(1);
	 * 	tamañoTexto(64);
	 * 
	 * 	texto(obtenerFPS(), 8, 120);
	 * }
	 */
	function obtenerFPS(): number;

	/** 💻
	 * Se ejecuta después de cada llamada a la función `dibujar` y procesos de addons de q5 post-dibujo, si los hay.
	 * 
	 * Útil para añadir efectos de post-procesamiento cuando no es posible
	 * hacerlo al final de la función `dibujar`, como cuando se usan
	 * addons como p5play que auto-dibujan al lienzo después de que
	 * la función `dibujar` se ejecuta.
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	círculo(cuadroActual % 200, 100, 80);
	 * }
	 * 
	 * function postProcesar() {
	 * 	filtro(INVERTIR);
	 * }
	 */
	function postProcesar(): void;

	/** 💻
	 * Establece la densidad de píxeles del lienzo.
	 * @param {number} v valor de densidad de píxeles
	 * @returns {number} densidad de píxeles
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * densidadPíxeles(1);
	 * círculo(100, 50, 80);
	 */
	function densidadPíxeles(v: number): number;

	/** 💻
	 * Devuelve la densidad de visualización actual.
	 * 
	 * En la mayoría de pantallas modernas, este valor será 2 o 3.
	 * @returns {number} densidad de visualización
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * tamañoTexto(64);
	 * texto(densidadVisualización(), 10, 20);
	 */
	function densidadVisualización(): number;

	/** 💻
	 * El tiempo pasado desde que se dibujó el último fotograma.
	 * 
	 * Con la frecuencia de fotogramas por defecto de 60, el tiempo delta será
	 * aproximadamente 16.6
	 * 
	 * Se puede usar para mantener movimientos atados al tiempo real si el sketch
	 * a menudo cae por debajo de la frecuencia de fotogramas objetivo. Aunque si las frecuencias
	 * de fotogramas son consistentemente bajas, considera reducir la frecuencia
	 * de fotogramas objetivo.
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	texto(deltaTiempo, 60, 106);
	 * }
	 * @example
	 * let x = 0;
	 * function dibujar() {
	 * 	fondo(200);
	 * 	// simular caídas de frecuencia de fotogramas
	 * 	frecuenciaRefresco(aleatorio(30, 60));
	 * 
	 * 	x += deltaTiempo * 0.2;
	 * 	círculo(x % 200, 100, 20);
	 * }
	 */
	var deltaTiempo: number;

	/** 💻
	 * El contexto de renderizado 2D para el lienzo, si se usa el renderizador
	 * Canvas2D.
	 */
	var contextoDibujo: CanvasRenderingContext2D;

	// 🧮 matemáticas

	/** 🧮
	 * Genera un valor aleatorio.
	 * 
	 * - Si no se proporcionan entradas, devuelve un número entre 0 y 1.
	 * - Si se proporciona una entrada numérica, devuelve un número entre 0 y el valor proporcionado.
	 * - Si se proporcionan dos entradas numéricas, devuelve un número entre los dos valores.
	 * - Si se proporciona un array, devuelve un elemento aleatorio del array.
	 * @param {number | any[]} [bajo] límite inferior (inclusivo) o un array
	 * @param {number} [alto] límite superior (exclusivo)
	 * @returns {number | any} un número o elemento aleatorio
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * frecuenciaRefresco(5);
	 * 
	 * function dibujar() {
	 * 	círculo(100, 100, aleatorio(20, 200));
	 * }
	 * @example
	 * function dibujar() {
	 * 	círculo(aleatorio(200), aleatorio(200), 10);
	 * }
	 */
	function aleatorio(bajo?: number | any[], alto?: number): number | any;

	/** 🧮
	 * Genera un número aleatorio dentro de un rango simétrico alrededor de cero.
	 * 
	 * Se puede usar para crear un efecto de fluctuación (desplazamiento aleatorio).
	 * 
	 * Equivalente a `aleatorio(-cantidad, cantidad)`.
	 * @param {number} cantidad cantidad máxima absoluta de fluctuación, por defecto es 1
	 * @returns {number} número aleatorio entre -val y val
	 * @example
	 * function dibujar() {
	 * 	círculo(ratónX + flu(3), ratónY + flu(3), 5);
	 * }
	 * @example
	 * let q = await Q5.WebGPU();
	 * crearLienzo(200, 100);
	 * 
	 * q.dibujar = () => {
	 * 	círculo(flu(50), 0, aleatorio(50));
	 * };
	 */
	function flu(cantidad: number): number;

	/** 🧮
	 * Genera un valor de ruido basado en las entradas x, y, y z.
	 * 
	 * Usa [Ruido Perlin](https://es.wikipedia.org/wiki/Ruido_Perlin) por defecto.
	 * @param {number} [x] entrada coordenada-x
	 * @param {number} [y] entrada coordenada-y
	 * @param {number} [z] entrada coordenada-z
	 * @returns {number} un valor de ruido
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	let n = ruido(frameCount * 0.01);
	 * 	círculo(100, 100, n * 200);
	 * }
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	let t = (frameCount + ratónX) * 0.02;
	 * 	for (let x = -5; x < 220; x += 10) {
	 * 		let n = ruido(t, x * 0.1);
	 * 		círculo(x, 100, n * 40);
	 * 	}
	 * }
	 */
	function ruido(x?: number, y?: number, z?: number): number;

	/** 🧮
	 * Calcula la distancia entre dos puntos.
	 * 
	 * Esta función también acepta dos objetos con propiedades `x` e `y`.
	 * @param {number} x1 coordenada-x del primer punto
	 * @param {number} y1 coordenada-y del primer punto
	 * @param {number} x2 coordenada-x del segundo punto
	 * @param {number} y2 coordenada-y del segundo punto
	 * @returns {number} distancia entre los puntos
	 * @example
	 * function dibujar() {
	 * 	fondo(200);
	 * 	círculo(100, 100, 20);
	 * 	círculo(ratónX, ratónY, 20);
	 * 
	 * 	let d = dist(100, 100, ratónX, ratónY);
	 * 	texto(redondear(d), 20, 20);
	 * }
	 */
	function dist(x1: number, y1: number, x2: number, y2: number): number;

	/** 🧮
	 * Mapea un número de un rango a otro.
	 * @param {number} val valor entrante a convertir
	 * @param {number} inicio1 límite inferior del rango actual del valor
	 * @param {number} fin1 límite superior del rango actual del valor
	 * @param {number} inicio2 límite inferior del rango objetivo del valor
	 * @param {number} fin2 límite superior del rango objetivo del valor
	 * @returns {number} valor mapeado
	 */
	function mapa(val: number, inicio1: number, fin1: number, inicio2: number, fin2: number): number;

	/** 🧮
	 * Establece el modo para interpretar y dibujar ángulos. Puede ser 'degrees' (grados) o 'radians' (radianes).
	 * @param {'degrees' | 'radians'} modo modo a establecer para la interpretación de ángulos
	 */
	function modoÁngulo(modo: 'degrees' | 'radians'): void;

	/** 🧮
	 * Convierte grados a radianes.
	 * @param {number} grados ángulo en grados
	 * @returns {number} ángulo en radianes
	 */
	function radianes(grados: number): number;

	/** 🧮
	 * Convierte radianes a grados.
	 * @param {number} radianes ángulo en radianes
	 * @returns {number} ángulo en grados
	 */
	function grados(radianes: number): number;

	/** 🧮
	 * Calcula un número entre dos números en un incremento específico.
	 * @param {number} inicio primer número
	 * @param {number} fin segundo número
	 * @param {number} cant cantidad a interpolar entre los dos valores
	 * @returns {number} número interpolado
	 */
	function interpolar(inicio: number, fin: number, cant: number): number;

	/** 🧮
	 * Restringe un valor entre un valor mínimo y máximo.
	 * @param {number} n número a restringir
	 * @param {number} bajo límite inferior
	 * @param {number} alto límite superior
	 * @returns {number} valor restringido
	 */
	function constreñir(n: number, bajo: number, alto: number): number;

	/** 🧮
	 * Normaliza un número de otro rango en un valor entre 0 y 1.
	 * @param {number} n número a normalizar
	 * @param {number} inicio límite inferior del rango
	 * @param {number} fin límite superior del rango
	 * @returns {number} número normalizado
	 */
	function norm(n: number, inicio: number, fin: number): number;

	/** 🧮
	 * Calcula la parte fraccionaria de un número.
	 * @param {number} n un número
	 * @returns {number} parte fraccionaria del número
	 */
	function frac(n: number): number;

	/** 🧮
	 * Calcula el valor absoluto de un número.
	 * @param {number} n un número
	 * @returns {number} valor absoluto del número
	 */
	function abs(n: number): number;

	/** 🧮
	 * Redondea un número.
	 * @param {number} n número a redondear
	 * @param {number} [d] número de lugares decimales a redondear
	 * @returns {number} número redondeado
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * tamañoTexto(32);
	 * texto(redondear(PI, 5), 10, 60);
	 */
	function redondear(n: number, d: number): number;

	/** 🧮
	 * Redondea un número hacia arriba.
	 * @param {number} n un número
	 * @returns {number} número redondeado
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * tamañoTexto(32);
	 * texto(techo(PI), 10, 60);
	 */
	function techo(n: number): number;

	/** 🧮
	 * Redondea un número hacia abajo.
	 * @param {number} n un número
	 * @returns {number} número redondeado
	 * @example
	 * crearLienzo(200, 100);
	 * fondo(200);
	 * tamañoTexto(32);
	 * texto(piso(-PI), 10, 60);
	 */
	function piso(n: number): number;

	/** 🧮
	 * Devuelve el valor más pequeño en una secuencia de números.
	 * @param {...number} args números a comparar
	 * @returns {number} mínimo
	 * @example
	 * function dibujar() {
	 * 	fondo(min(ratónX, 100));
	 * 	círculo(min(ratónX, 100), 0, 80);
	 * }
	 */
	function min(...args: number[]): number;

	/** 🧮
	 * Devuelve el valor más grande en una secuencia de números.
	 * @param {...number} args números a comparar
	 * @returns {number} máximo
	 * @example
	 * function dibujar() {
	 * 	fondo(max(ratónX, 100));
	 * 	círculo(max(ratónX, 100), 0, 80);
	 * }
	 */
	function max(...args: number[]): number;

	/** 🧮
	 * Calcula el valor de una base elevada a una potencia.
	 * 
	 * Por ejemplo, `pot(2, 3)` calcula 2 _ 2 _ 2 que es 8.
	 * @param {number} base base
	 * @param {number} exponente exponente
	 * @returns {number} base elevada a la potencia del exponente
	 */
	function pot(base: number, exponente: number): number;

	/** 🧮
	 * Calcula el cuadrado de un número.
	 * @param {number} n número a elevar al cuadrado
	 * @returns {number} cuadrado del número
	 */
	function cuad(n: number): number;

	/** 🧮
	 * Calcula la raíz cuadrada de un número.
	 * @param {number} n un número
	 * @returns {number} raíz cuadrada del número
	 */
	function raiz(n: number): number;

	/** 🧮
	 * Calcula el logaritmo natural (base e) de un número.
	 * @param {number} n un número
	 * @returns {number} logaritmo natural del número
	 */
	function loge(n: number): number;

	/** 🧮
	 * Calcula e elevado a la potencia de un número.
	 * @param {number} exponente potencia a la que elevar e
	 * @returns {number} e elevado a la potencia del exponente
	 */
	function exp(exponente: number): number;

	/** 🧮
	 * Establece la semilla para el generador de números aleatorios.
	 * @param {number} semilla valor de la semilla
	 */
	function semillaAleatoria(semilla: number): void;

	/** 🧮
	 * Establece el método de generación de números aleatorios.
	 * @param {any} metodo método a usar para la generación de números aleatorios
	 */
	function generadorAleatorio(metodo: any): void;

	/** 🧮
	 * Genera un número aleatorio siguiendo una distribución Gaussiana (normal).
	 * @param {number} media media (centro) de la distribución
	 * @param {number} std desviación estándar (dispersión o "ancho") de la distribución
	 * @returns {number} un número aleatorio siguiendo una distribución Gaussiana
	 */
	function aleatorioGaussiano(media: number, std: number): number;

	/** 🧮
	 * Genera un número aleatorio siguiendo una distribución exponencial.
	 * @returns {number} un número aleatorio siguiendo una distribución exponencial
	 */
	function aleatorioExponencial(): number;

	/** 🧮
	 * Establece el modo de generación de ruido.
	 * 
	 * Solo el modo por defecto, "perlin", está incluido en q5.js. El uso de los
	 * otros modos requiere el módulo q5-noiser.
	 * @param {'perlin' | 'simplex' | 'blocky'} modo modo de generación de ruido
	 */
	function modoRuido(modo: 'perlin' | 'simplex' | 'blocky'): void;

	/** 🧮
	 * Establece el valor de la semilla para la generación de ruido.
	 * @param {number} semilla valor de la semilla
	 */
	function semillaRuido(semilla: number): void;

	/** 🧮
	 * Establece el nivel de detalle para la generación de ruido.
	 * @param {number} lod nivel de detalle (número de octavas)
	 * @param {number} caida tasa de caída para cada octava
	 */
	function detalleRuido(lod: number, caida: number): void;

	/** 🧮
	 * La relación de la circunferencia de un círculo a su diámetro.
	 * Aproximadamente 3.14159.
	 */
	const DOS_PI: number;

	/** 🧮
	 * 2 \* PI.
	 * Aproximadamente 6.28319.
	 */
	const DOS_PI: number;

	/** 🧮
	 * 2 \* PI.
	 * Aproximadamente 6.28319.
	 */
	function TAU(): void;

	/** 🧮
	 * Mitad de PI.
	 * Aproximadamente 1.5708.
	 */
	const MEDIO_PI: number;

	/** 🧮
	 * Un cuarto de PI.
	 * Aproximadamente 0.7854.
	 */
	const CUARTO_PI: number;

	// 🔊 sonido

	/**
	 * q5 incluye reproducción de sonido de baja latencia y capacidades básicas de mezcla
	 * impulsadas por WebAudio.
	 * 
	 * Para filtrado de audio, síntesis y análisis, considera usar el
	 * addon [p5.sound](https://p5js.org/reference/p5.sound/) con q5.
	 */

	/** 🔊
	 * Carga datos de audio desde un archivo y devuelve un objeto `Sonido`.
	 * 
	 * Usa funciones como `reproducir`, `pausar`, y `detener` para
	 * controlar la reproducción. ¡Ten en cuenta que los sonidos solo pueden reproducirse después de la
	 * primera interacción del usuario con la página!
	 * 
	 * Establece `volumen` a un valor entre 0 (silencio) y 1 (volumen completo).
	 * Establece `pan` a un valor entre -1 (izquierda) y 1 (derecha) para ajustar
	 * la posición estéreo del sonido. Establece `bucle` a true para repetir el sonido.
	 * 
	 * Usa `cargado`, `pausado`, y `terminado` para comprobar el estado del sonido.
	 * 
	 * El archivo de sonido completo debe cargarse antes de que la reproducción pueda comenzar, usa `await` para esperar a que un sonido se cargue. Para transmitir archivos de audio más grandes usa la función `cargarAudio` en su lugar.
	 * @param {string} url archivo de sonido
	 * @returns {Sonido & PromiseLike<Sonido>} sonido
	 * @example
	 * crearLienzo(200);
	 * 
	 * let sonido = cargarSonido('/assets/jump.wav');
	 * sonido.volumen = 0.3;
	 * 
	 * function alPresionarRatón() {
	 * 	sonido.reproducir();
	 * }
	 */
	function cargarSonido(url: string): Sonido & PromiseLike<Sonido>;

	/** 🔊
	 * Carga datos de audio desde un archivo y devuelve un [HTMLAudioElement](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement).
	 * 
	 * El audio se considera cargado cuando se dispara el [evento canplaythrough](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event).
	 * 
	 * ¡Ten en cuenta que el audio solo puede reproducirse después de la primera interacción
	 * del usuario con la página!
	 * @param url archivo de audio
	 * @returns {HTMLAudioElement & PromiseLike<HTMLAudioElement>} un HTMLAudioElement
	 * @example
	 * crearLienzo(200);
	 * 
	 * let audio = cargarAudio('/assets/retro.flac');
	 * audio.volume = 0.4;
	 * 
	 * function alPresionarRatón() {
	 * 	audio.play();
	 * }
	 */
	function cargarAudio(url: string): HTMLAudioElement & PromiseLike<HTMLAudioElement>;

	/** 🔊
	 * Devuelve el AudioContext en uso o undefined si no existe.
	 * @returns {AudioContext} instancia de AudioContext
	 */
	function obtenerContextoAudio(): AudioContext | void;

	/** 🔊
	 * Crea un nuevo AudioContext o lo reanuda si estaba suspendido.
	 * @returns {Promise<void>} una promesa que se resuelve cuando el AudioContext se reanuda
	 */
	function iniciarAudioUsuario(): Promise<void>;

	class Sonido {

		/** 🔊
		 * Crea un nuevo objeto `Q5.Sonido`.
		 */
		constructor();

		/** 🔊
		 * Establece el volumen del sonido a un valor entre
		 * 0 (silencio) y 1 (volumen completo).
		 */
		volumen: number;

		/** 🔊
		 * Establece la posición estéreo del sonido entre -1 (izquierda) y 1 (derecha).
		 */
		pan: number;

		/** 🔊
		 * Establece a true para hacer que el sonido se repita continuamente.
		 */
		bucle: boolean;

		/** 🔊
		 * Verdadero si los datos de sonido han terminado de cargarse.
		 */
		cargado: boolean;

		/** 🔊
		 * Verdadero si el sonido está actualmente pausado.
		 */
		pausado: boolean;

		/** 🔊
		 * Verdadero si el sonido ha terminado de reproducirse.
		 */
		terminado: boolean;

		/** 🔊
		 * Reproduce el sonido.
		 * 
		 * Si esta función se ejecuta cuando el sonido ya se está reproduciendo,
		 * comenzará una nueva reproducción, causando un efecto de capas.
		 * 
		 * Si esta función se ejecuta cuando el sonido está pausado,
		 * todas las instancias de reproducción se reanudarán.
		 * 
		 * Usa `await` para esperar a que el sonido termine de reproducirse.
		 * @returns {Promise<void>} una promesa que se resuelve cuando el sonido termina de reproducirse
		 */
		reproducir(): void;

		/** 🔊
		 * Pausa el sonido, permitiendo que sea reanudado.
		 */
		pausar(): void;

		/** 🔊
		 * Detiene el sonido, reiniciando su posición de reproducción
		 * al principio.
		 * 
		 * Elimina todas las instancias de reproducción.
		 */
		detener(): void;
	}

	// 📑 dom

	/**
	 * El Modelo de Objetos del Documento (DOM) es una interfaz para
	 * crear y editar páginas web con JavaScript.
	 */

	/** 📑
	 * Crea un nuevo elemento HTML y lo añade a la página. `createEl` es
	 * un alias.
	 * 
	 * Modifica el [`style`](https://developer.mozilla.org/docs/Web/API/HTMLElement/style) CSS del elemento para cambiar su apariencia.
	 * 
	 * Usa [`addEventListener`](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener) para responder a eventos como:
	 * 
	 * - "click": cuando se hace clic en el elemento
	 * - "mouseover": cuando el ratón pasa sobre el elemento
	 * - "mouseout": cuando el ratón deja de pasar sobre el elemento
	 * - "input": cuando el valor de un elemento de formulario cambia
	 * 
	 * q5 añade alguna funcionalidad extra a los elementos que crea:
	 * 
	 * - la función `position` facilita colocar el elemento
	 *   relativo al lienzo
	 * - la función `size` establece el ancho y alto del elemento
	 * - alternativamente, usa las propiedades `x`, `y`, `width`, y `height` del elemento
	 * @param {string} etiqueta nombre de la etiqueta del elemento
	 * @param {string} [contenido] contenido del elemento
	 * @returns {HTMLElement} elemento
	 * @example
	 * crearLienzo(200);
	 * 
	 * let el = crearElemento('div', '*');
	 * el.position(50, 50);
	 * el.size(100, 100);
	 * el.style.fontSize = '136px';
	 * el.style.textAlign = 'center';
	 * el.style.backgroundColor = 'blue';
	 * el.style.color = 'white';
	 */
	function crearElemento(etiqueta: string, contenido?: string): HTMLElement;

	/** 📑
	 * Crea un elemento de enlace.
	 * @param {string} href url
	 * @param {string} [texto] contenido de texto
	 * @param {boolean} [nuevaPestaña] si abrir el enlace en una nueva pestaña
	 * @example
	 * crearLienzo(200);
	 * 
	 * let enlace = crearA('https://q5js.org', 'q5.js');
	 * enlace.position(16, 42);
	 * enlace.style.fontSize = '80px';
	 * 
	 * enlace.addEventListener('mouseover', () => {
	 * 	fondo('cyan');
	 * });
	 */
	function crearA(href: string, texto?: string): HTMLAnchorElement;

	/** 📑
	 * Crea un elemento de botón.
	 * @param {string} [contenido] contenido de texto
	 * @example
	 * crearLienzo(200, 100);
	 * 
	 * let btn = crearBotón('¡Click aqui!');
	 * 
	 * btn.addEventListener('click', () => {
	 * 	fondo(aleatorio(100, 255));
	 * });
	 */
	function crearBotón(contenido?: string): HTMLButtonElement;

	/** 📑
	 * Crea un elemento de casilla de verificación (checkbox).
	 * 
	 * Usa la propiedad `checked` para obtener o establecer el estado de la casilla.
	 * 
	 * La propiedad `label` es el elemento de etiqueta de texto junto a la casilla.
	 * @param {string} [etiqueta] etiqueta de texto colocada junto a la casilla
	 * @param {boolean} [marcado] estado inicial
	 * @example
	 * crearLienzo(200, 100);
	 * 
	 * let casilla = crearCasilla('¡Marca aquí!');
	 * casilla.label.style.color = 'lime';
	 * 
	 * casilla.addEventListener('input', () => {
	 * 	if (casilla.checked) fondo('lime');
	 * 	else fondo('black');
	 * });
	 */
	function crearCasilla(etiqueta?: string, marcado?: boolean): HTMLInputElement;

	/** 📑
	 * Crea un elemento de entrada de color.
	 * 
	 * Usa la propiedad `value` para obtener o establecer el valor del color.
	 * @param {string} [valor] valor de color inicial
	 * @example
	 * crearLienzo(200, 100);
	 * 
	 * let selección = crearSelectorColor();
	 * selección.value = '#fd7575';
	 * 
	 * function dibujar() {
	 * 	fondo(selección.value);
	 * }
	 */
	function crearSelectorColor(valor?: string): HTMLInputElement;

	/** 📑
	 * Crea un elemento de imagen.
	 * @param {string} src url de la imagen
	 * @example
	 * crearLienzo(200, 100);
	 * 
	 * let img = crearImg('/assets/p5play_logo.webp');
	 * img.position(0, 0).size(100, 100);
	 */
	function crearImg(src: string): HTMLImageElement;

	/** 📑
	 * Crea un elemento de entrada (input).
	 * 
	 * Usa la propiedad `value` para obtener o establecer el valor de la entrada.
	 * 
	 * Usa la propiedad `placeholder` para establecer el texto de etiqueta que aparece
	 * dentro de la entrada cuando está vacía.
	 * 
	 * Mira la [documentación de input](https://developer.mozilla.org/docs/Web/HTML/Element/input#input_types) de MDN para la lista completa de tipos de entrada.
	 * @param {string} [valor] valor inicial
	 * @param {string} [tipo] tipo de entrada de texto, puede ser 'text', 'password', 'email', 'number', 'range', 'search', 'tel', 'url'
	 * @example
	 * crearLienzo(200, 100);
	 * tamañoTexto(64);
	 * 
	 * let entrada = crearEntrada();
	 * entrada.placeholder = '¡Teclea aquí!';
	 * entrada.size(200, 32);
	 * 
	 * entrada.addEventListener('input', () => {
	 * 	fondo('orange');
	 * 	texto(entrada.value, 10, 70);
	 * });
	 */
	function crearEntrada(valor?: string, tipo?: string): HTMLInputElement;

	/** 📑
	 * Crea un elemento de párrafo.
	 * @param {string} [contenido] contenido de texto
	 * @example
	 * crearLienzo(200, 50);
	 * fondo('coral');
	 * 
	 * let p = crearP('¡Hola, mundo!');
	 * p.style.color = 'pink';
	 */
	function crearP(contenido?: string): HTMLParagraphElement;

	/** 📑
	 * Crea un grupo de botones de radio.
	 * 
	 * Usa la función `option(etiqueta, valor)` para añadir nuevos botones de radio
	 * al grupo.
	 * 
	 * Usa la propiedad `value` para obtener o establecer el valor del botón de radio seleccionado.
	 * @param {string} [nombreGrupo]
	 * @example
	 * crearLienzo(200, 160);
	 * 
	 * let radio = crearOpciónes();
	 * radio.option('cuadrado', '1').option('círculo', '2');
	 * 
	 * function dibujar() {
	 * 	fondo(200);
	 * 	if (radio.value == '1') cuadrado(75, 25, 80);
	 * 	if (radio.value == '2') círculo(100, 50, 80);
	 * }
	 */
	function crearOpciónes(nombreGrupo?: string): HTMLDivElement;

	/** 📑
	 * Crea un elemento de selección (select).
	 * 
	 * Usa la función `option(etiqueta, valor)` para añadir nuevas opciones al
	 * elemento de selección.
	 * 
	 * Establece `multiple` a `true` para permitir seleccionar múltiples opciones.
	 * 
	 * Usa la propiedad `value` para obtener o establecer el valor de la opción seleccionada.
	 * 
	 * Usa la propiedad `selected` para obtener las etiquetas de las opciones
	 * seleccionadas o establecer las opciones seleccionadas por etiqueta. Puede ser una sola
	 * cadena o un array de cadenas.
	 * @param {string} [placeholder] texto opcional que aparece antes de que se seleccione una opción
	 * @example
	 * crearLienzo(200, 100);
	 * 
	 * let sel = crearSelección('Seleccionar un opcion');
	 * sel.option('Red', '#f55').option('Green', '#5f5');
	 * 
	 * sel.addEventListener('change', () => {
	 * 	fondo(sel.value);
	 * });
	 */
	function crearSelección(placeholder?: string): HTMLSelectElement;

	/** 📑
	 * Crea un elemento deslizador (slider).
	 * 
	 * Usa la propiedad `value` para obtener o establecer el valor del deslizador.
	 * 
	 * Usa la función `val` para obtener el valor del deslizador como un número.
	 * @param {number} min valor mínimo
	 * @param {number} max valor máximo
	 * @param {number} [valor] valor inicial
	 * @param {number} [paso] tamaño del paso
	 * @example
	 * crearLienzo(200);
	 * 
	 * let deslizador = crearDeslizador(0, 255);
	 * deslizador.position(10, 10).size(180);
	 * 
	 * function dibujar() {
	 * 	fondo(deslizador.val());
	 * }
	 */
	function crearDeslizador(min: number, max: number, valor?: number, paso?: number): HTMLInputElement;

	/** 📑
	 * Crea un elemento de video.
	 * 
	 * Ten en cuenta que los videos deben estar silenciados para reproducirse automáticamente y las funciones `play` y
	 * `pause` solo pueden ejecutarse después de una interacción del usuario.
	 * 
	 * El elemento de video puede ocultarse y su contenido puede
	 * mostrarse en el lienzo usando la función `imagen`.
	 * @param {string} src url del video
	 * @returns {HTMLVideoElement & PromiseLike<HTMLVideoElement>} un nuevo elemento de video
	 * @example
	 * crearLienzo(1);
	 * 
	 * let vid = crearVideo('/assets/apollo4.mp4');
	 * vid.size(200, 150);
	 * vid.autoplay = vid.muted = vid.loop = true;
	 * vid.controls = true;
	 * @example
	 * crearLienzo(200, 150);
	 * let vid = crearVideo('/assets/apollo4.mp4');
	 * vid.hide();
	 * 
	 * function alPresionarRatón() {
	 * 	vid.currentTime = 0;
	 * 	vid.play();
	 * }
	 * function dibujar() {
	 * 	imagen(vid, 0, 0, 200, 150);
	 * 	filtro(HUE_ROTATE, 90);
	 * }
	 */
	function crearVideo(src: string): HTMLVideoElement & PromiseLike<HTMLVideoElement>;

	/** 📑
	 * Crea una captura desde una cámara conectada, como una webcam.
	 * 
	 * El elemento de video de captura puede ocultarse y su contenido puede
	 * mostrarse en el lienzo usando la función `imagen`.
	 * 
	 * Puede precargarse para asegurar que la captura esté lista para usar cuando tu
	 * sketch comience.
	 * 
	 * Solicita la resolución de video más alta de la cámara frontal del usuario
	 * por defecto. El primer parámetro de esta función se puede usar para
	 * especificar las restricciones para la captura. Mira [`getUserMedia`](https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia)
	 * para más información.
	 * @param {string} [tipo] tipo de captura, puede ser solo `VIDEO` o solo `AUDIO`, el defecto es usar ambos video y audio
	 * @param {boolean} [volteado] si reflejar el video verticalmente, true por defecto
	 * @returns {HTMLVideoElement & PromiseLike<HTMLVideoElement>} un nuevo elemento de video
	 * @example
	 * function alPresionarRatón() {
	 * 	let cap = crearCaptura(VIDEO);
	 * 	cap.size(200, 112.5);
	 * 	canvas.remove();
	 * }
	 * @example
	 * let cap;
	 * function alPresionarRatón() {
	 * 	cap = crearCaptura(VIDEO);
	 * 	cap.hide();
	 * }
	 * 
	 * function dibujar() {
	 * 	let y = frameCount % height;
	 * 	imagen(cap, 0, y, 200, 200);
	 * }
	 * @example
	 * function alPresionarRatón() {
	 * 	let cap = crearCaptura({
	 * 		video: { width: 640, height: 480 }
	 * 	});
	 * 	cap.size(200, 150);
	 * 	canvas.remove();
	 * }
	 */
	function crearCaptura(tipo?: string, volteado?: boolean): HTMLVideoElement & PromiseLike<HTMLVideoElement>;

	/** 📑
	 * Encuentra el primer elemento en el DOM que coincide con el [selector CSS](https://developer.mozilla.org/docs/Learn_web_development/Core/Styling_basics/Basic_selectors) dado.
	 * @param {string} selector
	 * @returns {HTMLElement} elemento
	 */
	function encontrarElemento(selector: string): HTMLElement;

	/** 📑
	 * Encuentra todos los elementos en el DOM que coinciden con el [selector CSS](https://developer.mozilla.org/docs/Learn_web_development/Core/Styling_basics/Basic_selectors) dado.
	 * @param {string} selector
	 * @returns {HTMLElement[]} elementos
	 */
	function encontrarElementos(selector: string): HTMLElement[];

	// 🎞 grabación

	/** 🎞
	 * Crea una grabadora. ¡Simplemente presiona grabar para empezar a grabar!
	 * 
	 * Las siguientes propiedades se pueden establecer a través de la UI de la grabadora o
	 * programáticamente.
	 * 
	 * - `format` se establece a "H.264" por defecto.
	 * - `bitrate` es un número en megabits por segundo (mbps). Su valor por defecto
	 *   está determinado por la altura del lienzo. Aumentar la
	 *   tasa de bits aumentará la calidad y el tamaño del archivo de la grabación.
	 * - `captureAudio` se establece a true por defecto. Establecer a false para deshabilitar
	 *   la grabación de audio.
	 * 
	 * Ten en cuenta que las grabaciones se hacen a una tasa de fotogramas variable (VFR), lo que
	 * hace que el video de salida sea incompatible con algún software de edición.
	 * Para más información, mira la página wiki
	 * ["Recording the Canvas"](https://github.com/q5js/q5.js/wiki/Recording-the-Canvas).
	 * @returns {HTMLElement} una grabadora, elemento DOM de q5
	 * @example
	 * crearLienzo(200);
	 * 
	 * let grab = crearGrabadora();
	 * grab.bitrate = 10;
	 * 
	 * function dibujar() {
	 * 	círculo(ratónX, aleatorio(alto), 10);
	 * }
	 */
	function crearGrabadora(): HTMLElement;

	/** 🎞
	 * Comienza a grabar el lienzo o reanuda la grabación si estaba pausada.
	 * 
	 * Si no existe grabadora, se crea una pero no se muestra.
	 */
	function grabar(): void;

	/** 🎞
	 * Pausa la grabación del lienzo, si hay una en progreso.
	 */
	function pausarGrabación(): void;

	/** 🎞
	 * Descarta la grabación actual.
	 */
	function borrarGrabación(): void;

	/** 🎞
	 * Guarda la grabación actual como un archivo de video.
	 * @param {string} nombreArchivo
	 * @example
	 * function dibujar() {
	 * 	cuadrado(ratónX, aleatorio(200), 10);
	 * }
	 * 
	 * function alPresionarRatón() {
	 * 	if (!grabando) grabar();
	 * 	else guardarGrabación('squares');
	 * }
	 */
	function guardarGrabación(nombreArchivo: string): void;

	/** 🎞
	 * Verdadero si el lienzo está siendo grabado actualmente.
	 */
	var grabando: boolean;

	// 🛠 utilidades

	/** 🛠
	 * Carga un archivo o múltiples archivos.
	 * 
	 * El tipo de archivo se determina por la extensión del archivo. q5 soporta cargar
	 * archivos de texto, json, csv, fuente, audio, e imagen.
	 * 
	 * Por defecto, los recursos se cargan en paralelo antes de que q5 ejecute `dibujar`. Usa `await` para esperar a que los recursos se carguen.
	 * @param {...string} urls
	 * @returns {Promise<any[]>} una promesa que se resuelve con objetos
	 * @example
	 * crearLienzo(200);
	 * let logo = cargar('/q5js_logo.avif');
	 * 
	 * function dibujar() {
	 * 	imagen(logo, 0, 0, 200, 200);
	 * }
	 */
	function cargar(...urls: string[]): PromiseLike<any[]>;

	/** 🛠
	 * Guarda datos en un archivo.
	 * 
	 * Si no se especifican datos, se guardará el lienzo.
	 * 
	 * Si no se proporcionan argumentos, el lienzo se guardará como
	 * un archivo de imagen llamado "untitled.png".
	 * @param {object} [datos] lienzo, imagen, u objeto JS
	 * @param {string} [nombreArchivo] nombre de archivo para guardar como
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * círculo(100, 100, 50);
	 * 
	 * function alPresionarRatón() {
	 * 	guardar('circle.png');
	 * }
	 * @example
	 * crearLienzo(200);
	 * 
	 * tamañoTexto(180);
	 * let rayo = crearImagenTexto('⚡️');
	 * imagen(rayo, 16, -56);
	 * 
	 * function alPresionarRatón() {
	 * 	guardar(rayo, 'bolt.png');
	 * }
	 */
	function guardar(datos?: object, nombreArchivo?: string): void;

	/** 🛠
	 * Carga un archivo de texto desde la url especificada.
	 * 
	 * Se recomienda usar `await` para obtener el texto cargado como una cadena.
	 * @param {string} url archivo de texto
	 * @returns {object & PromiseLike<string>} un objeto conteniendo el texto cargado en la propiedad `obj.text` o usa `await` para obtener la cadena de texto directamente
	 */
	function cargarTexto(url: string): object & PromiseLike<string>;

	/** 🛠
	 * Carga un archivo JSON desde la url especificada.
	 * 
	 * Se recomienda usar `await` para obtener el objeto o array JSON cargado.
	 * @param {string} url archivo JSON
	 * @returns {any & PromiseLike<any>} un objeto o array conteniendo el JSON cargado
	 */
	function cargarJSON(url: string): any & PromiseLike<any>;

	/** 🛠
	 * Carga un archivo CSV desde la url especificada.
	 * 
	 * Se recomienda usar `await` para obtener el CSV cargado como un array de objetos.
	 * @param {string} url archivo CSV
	 * @returns {object[] & PromiseLike<object[]>} un array de objetos conteniendo el CSV cargado
	 */
	function cargarCSV(url: string): object[] & PromiseLike<object[]>;

	/** 🛠
	 * Carga un archivo xml desde la url especificada.
	 * 
	 * Se recomienda usar `await` para obtener el Elemento XML cargado.
	 * @param {string} url archivo xml
	 * @returns {Element & PromiseLike<Element>} un objeto conteniendo el Elemento XML cargado en una propiedad llamada `obj.DOM` o usa await para obtener el Elemento XML directamente
	 */
	function cargarXML(url: string): object & PromiseLike<Element>;

	/** 🛠
	 * Espera a que cualquier recurso que comenzó a cargarse termine de cargarse. Por defecto q5 ejecuta esto antes de hacer bucle en dibujar (lo cual se llama precarga), pero se puede usar incluso después de que dibujar comience a hacer bucle.
	 * @returns {PromiseLike<any[]>} una promesa que se resuelve con objetos cargados
	 */
	function cargarTodo(): PromiseLike<any[]>;

	/** 🛠
	 * Deshabilita la precarga automática de recursos antes de que dibujar comience a hacer bucle. Esto permite que dibujar comience inmediatamente, y los recursos se pueden cargar perezosamente o se puede usar `cargarTodo()` para esperar a que los recursos terminen de cargarse más tarde.
	 */
	function deshabilitarPrecarga(): void;

	/** 🛠
	 * nf es la abreviatura de formato de número. Formatea un número
	 * a una cadena con un número especificado de dígitos.
	 * @param {number} num número a formatear
	 * @param {number} digitos número de dígitos a formatear
	 * @returns {string} número formateado
	 */
	function nf(num: number, digitos: number): string;

	/** 🛠
	 * Baraja los elementos de un array.
	 * @param {any[]} arr array a barajar
	 * @param {boolean} [modificar] si modificar el array original, falso por defecto lo cual copia el array antes de barajar
	 * @returns {any[]} array barajado
	 */
	function barajar(arr: any[]): any[];

	/** 🛠
	 * Almacena un ítem en localStorage.
	 * @param {string} clave clave bajo la cual almacenar el ítem
	 * @param {string} val valor a almacenar
	 */
	function guardarItem(clave: string, val: string): void;

	/** 🛠
	 * Recupera un ítem de localStorage.
	 * @param {string} clave clave del ítem a recuperar
	 * @returns {string} valor del ítem recuperado
	 */
	function obtenerItem(clave: string): string;

	/** 🛠
	 * Elimina un ítem de localStorage.
	 * @param {string} clave clave del ítem a eliminar
	 */
	function eliminarItem(clave: string): void;

	/** 🛠
	 * Limpia todos los ítems de localStorage.
	 */
	function limpiarAlmacenamiento(): void;

	/** 🛠
	 * Devuelve el año actual.
	 * @returns {number} año actual
	 */
	function año(): number;

	/** 🛠
	 * Devuelve el día actual del mes.
	 * @returns {number} día actual
	 */
	function día(): number;

	/** 🛠
	 * Devuelve la hora actual.
	 * @returns {number} hora actual
	 */
	function hora(): number;

	/** 🛠
	 * Devuelve el minuto actual.
	 * @returns {number} minuto actual
	 */
	function minuto(): number;

	/** 🛠
	 * Devuelve el segundo actual.
	 * @returns {number} segundo actual
	 */
	function segundo(): number;

	// ↗ vector

	/** ↗
	 * Crea un nuevo objeto Vector.
	 * @param {number} [x] componente x del vector
	 * @param {number} [y] componente y del vector
	 * @param {number} [z] componente z del vector
	 * @param {number} [w] componente w del vector
	 * @returns {Vector} nuevo objeto Vector
	 */
	function crearVector(): void;

	class Vector {

		/** ↗
		 * Una clase para describir un vector bidimensional o tridimensional, específicamente un vector euclidiano (también conocido como geométrico). Un vector es una entidad que tiene tanto magnitud como dirección. El tipo de datos almacena los componentes del vector (x, y para 2D, y z para 3D). La magnitud y dirección se pueden acceder a través de los métodos `mag()` y `heading()`.
		 */
		constructor(x: number, y: number, z?: number);

		/** ↗
		 * El componente x del vector.
		 */
		x: number;

		/** ↗
		 * El componente y del vector.
		 */
		y: number;

		/** ↗
		 * El componente z del vector.
		 */
		z: number;

		/** ↗
		 * El componente w del vector.
		 */
		w(): void;

		/** ↗
		 * Establece los componentes x, y, y z del vector.
		 * @param {number} [x] componente x del vector
		 * @param {number} [y] componente y del vector
		 * @param {number} [z] componente z del vector
		 * @param {number} [w] componente w del vector
		 * @returns {Vector} este vector
		 */
		set(): void;

		/** ↗
		 * Devuelve una copia del vector.
		 * @returns {Vector} copia del vector
		 */
		copy(): void;

		/** ↗
		 * Suma x, y, y z componentes a un vector, suma un vector a otro, o suma dos vectores independientes.
		 * @param {number | Vector} x componente x del vector o Vector a sumar
		 * @param {number} [y] componente y del vector
		 * @param {number} [z] componente z del vector
		 * @returns {Vector} este vector
		 */
		add(): void;

		/** ↗
		 * Resta x, y, y z componentes de un vector, resta un vector de otro, o resta dos vectores independientes.
		 * @param {number | Vector} x componente x del vector o Vector a restar
		 * @param {number} [y] componente y del vector
		 * @param {number} [z] componente z del vector
		 * @returns {Vector} este vector
		 */
		sub(): void;

		/** ↗
		 * Multiplica el vector por un escalar.
		 * @param {number} n escalar por el cual multiplicar
		 * @returns {Vector} este vector
		 */
		mult(n: number | Vector): Vector;

		/** ↗
		 * Divide el vector por un escalar.
		 * @param {number} n escalar por el cual dividir
		 * @returns {Vector} este vector
		 */
		div(n: number | Vector): Vector;

		/** ↗
		 * Calcula la magnitud (longitud) del vector y devuelve el resultado como un flotante (esto es simplemente la ecuación `sqrt(x*x + y*y + z*z)`).
		 * @returns {number} magnitud del vector
		 */
		mag(): number;

		/** ↗
		 * Calcula la magnitud (longitud) del vector al cuadrado y devuelve el resultado como un flotante (esto es simplemente la ecuación `x*x + y*y + z*z`).
		 * @returns {number} magnitud del vector al cuadrado
		 */
		magSq(): void;

		/** ↗
		 * Calcula el producto punto de dos vectores.
		 * @param {Vector} v vector con el cual hacer producto punto
		 * @returns {number} producto punto
		 */
		dot(): void;

		/** ↗
		 * Calcula el producto cruz de dos vectores.
		 * @param {Vector} v vector con el cual hacer producto cruz
		 * @returns {Vector} producto cruz
		 */
		cross(): void;

		/** ↗
		 * Calcula la distancia euclidiana entre dos puntos (considerando un punto como un objeto vector).
		 * @param {Vector} v vector al cual calcular distancia
		 * @returns {number} distancia
		 */
		dist(v: Vector): number;

		/** ↗
		 * Normaliza el vector a longitud 1 (hace que sea un vector unitario).
		 * @returns {Vector} este vector
		 */
		normalize(): void;

		/** ↗
		 * Limita la magnitud de este vector al valor usado para el parámetro `max`.
		 * @param {number} max magnitud máxima
		 * @returns {Vector} este vector
		 */
		limit(): void;

		/** ↗
		 * Establece la magnitud de este vector al valor usado para el parámetro `len`.
		 * @param {number} len nueva longitud para este vector
		 * @returns {Vector} este vector
		 */
		setMag(): void;

		/** ↗
		 * Calcula el ángulo de rotación para este vector (solo vectores 2D).
		 * @returns {number} el ángulo de rotación
		 */
		heading(): void;

		/** ↗
		 * Rota el vector por un ángulo (solo vectores 2D), la magnitud permanece igual.
		 * @param {number} ángulo ángulo de rotación
		 * @returns {Vector} este vector
		 */
		rotate(): void;

		/** ↗
		 * Calcula y devuelve el ángulo entre dos vectores.
		 * @param {Vector} v el vector x, y, z
		 * @returns {number} el ángulo entre
		 */
		angleBetween(): void;

		/** ↗
		 * Interpola linealmente el vector a otro vector.
		 * @param {Vector} v el vector x, y, z
		 * @param {number} amt la cantidad de interpolación; 0.0 es el vector antiguo, 1.0 es el nuevo vector, 0.5 está a mitad de camino
		 * @returns {Vector} este vector
		 */
		lerp(v: Vector, amt: number): Vector;

		/** ↗
		 * Refleja el vector entrante sobre una normal al muro.
		 * @param {Vector} superficieNormal el vector normal a la superficie
		 * @returns {Vector} este vector
		 */
		reflect(): void;

		/** ↗
		 * Devuelve una representación de este vector como un array de flotantes.
		 * @returns {number[]} array de flotantes
		 */
		array(): void;

		/** ↗
		 * Comprueba si los componentes x, y, y z del vector son iguales a los componentes x, y, y z de otro vector.
		 * @param {Vector} v el vector a comparar
		 * @returns {boolean} verdadero si los vectores son iguales
		 */
		equals(): void;

		/** ↗
		 * Hace un nuevo vector 2D desde un ángulo de longitud 1.
		 * @param {number} ángulo el ángulo deseado
		 * @param {number} [longitud] longitud del nuevo vector (por defecto a 1)
		 * @returns {Vector} nuevo objeto Vector
		 */
		fromAngle(): void;

		/** ↗
		 * Hace un nuevo vector 2D aleatorio con una magnitud de 1.
		 * @returns {Vector} nuevo objeto Vector
		 */
		random2D(): void;

		/** ↗
		 * Hace un nuevo vector 3D aleatorio con una magnitud de 1.
		 * @returns {Vector} nuevo objeto Vector
		 */
		random3D(): void;
		sumar(v: Vector): Vector;

		restar(v: Vector): Vector;

		normalizar(): Vector;

		establecerMag(len: number): Vector;

		punto(v: Vector): number;

		cruz(v: Vector): Vector;

		copiar(): Vector;

		establecer(x: number, y: number, z?: number): void;

		limitar(max: number): Vector;

		rumbo(): number;

		establecerRumbo(angulo: number): Vector;

		rotar(angulo: number): Vector;

		slerp(v: Vector, amt: number): Vector;

		static desdeÁngulo(angulo: number, longitud?: number): Vector;

	}

	// 🖌 modelado

	/** 🖌
	 * Dibuja un arco, que es una sección de una elipse.
	 * 
	 * `modoEliptico` afecta cómo se dibuja el arco.
	 * 
	 * q5 WebGPU solo soporta el modo por defecto `PIE_OPEN`.
	 * @param {number} x coordenada-x
	 * @param {number} y coordenada-y
	 * @param {number} w ancho de la elipse
	 * @param {number} h alto de la elipse
	 * @param {number} inicio ángulo para empezar el arco
	 * @param {number} fin ángulo para terminar el arco
	 * @param {number} [modo] configuración de estilo de forma y trazo, por defecto es `PIE_OPEN` para una forma de pastel con un trazo no cerrado, puede ser `PIE`, `CHORD`, o `CHORD_OPEN`
	 * @example
	 * crearLienzo(200);
	 * fondo(200);
	 * 
	 * arco(40, 40, 40, 40, 0.8, -0.8);
	 * arco(80, 80, 40, 40, 0.8, -0.8, PIE);
	 * arco(120, 120, 40, 40, 0.8, -0.8, CHORD_OPEN);
	 * arco(160, 160, 40, 40, 0.8, -0.8, CHORD);
	 */
	function arco(x: number, y: number, w: number, h: number, inicio: number, fin: number, modo?: number): void;

	/** 🖌
	 * Dibuja una curva.
	 */
	function curva(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	/** 🖌
	 * Establece la cantidad de segmentos de línea recta usados para hacer una curva.
	 * 
	 * Solo tiene efecto en q5 WebGPU.
	 * @param {number} val nivel de detalle de la curva, por defecto es 20
	 */
	function detalleCurva(val: number): void;

	/** 🖌
	 * Comienza a almacenar vértices para una forma convexa.
	 */
	function empezarForma(): void;

	/** 🖌
	 * Termina de almacenar vértices para una forma convexa.
	 */
	function terminarForma(): void;

	/** 🖌
	 * Comienza a almacenar vértices para un contorno.
	 * 
	 * No disponible en q5 WebGPU.
	 */
	function empezarContorno(): void;

	/** 🖌
	 * Termina de almacenar vértices para un contorno.
	 * 
	 * No disponible en q5 WebGPU.
	 */
	function terminarContorno(): void;

	/** 🖌
	 * Especifica un vértice en una forma.
	 * @param {number} x coordenada-x
	 * @param {number} y coordenada-y
	 */
	function vértice(x: number, y: number): void;

	/** 🖌
	 * Especifica un vértice Bezier en una forma.
	 * @param {number} cp1x coordenada-x del primer punto de control
	 * @param {number} cp1y coordenada-y del primer punto de control
	 * @param {number} cp2x coordenada-x del segundo punto de control
	 * @param {number} cp2y coordenada-y del segundo punto de control
	 * @param {number} x coordenada-x del punto de anclaje
	 * @param {number} y coordenada-y del punto de anclaje
	 */
	function vérticeBezier(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

	/** 🖌
	 * Especifica un vértice Bezier cuadrático en una forma.
	 * @param {number} cp1x coordenada-x del punto de control
	 * @param {number} cp1y coordenada-y del punto de control
	 * @param {number} x coordenada-x del punto de anclaje
	 * @param {number} y coordenada-y del punto de anclaje
	 */
	function vérticeCuadrático(cp1x: number, cp1y: number, x: number, y: number): void;

	/** 🖌
	 * Dibuja una curva Bezier.
	 * @param {number} x1 coordenada-x del primer punto de anclaje
	 * @param {number} y1 coordenada-y del primer punto de anclaje
	 * @param {number} x2 coordenada-x del primer punto de control
	 * @param {number} y2 coordenada-y del primer punto de control
	 * @param {number} x3 coordenada-x del segundo punto de control
	 * @param {number} y3 coordenada-y del segundo punto de control
	 * @param {number} x4 coordenada-x del segundo punto de anclaje
	 * @param {number} y4 coordenada-y del segundo punto de anclaje
	 */
	function bezier(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	/** 🖌
	 * Dibuja un triángulo.
	 * @param {number} x1 coordenada-x del primer vértice
	 * @param {number} y1 coordenada-y del primer vértice
	 * @param {number} x2 coordenada-x del segundo vértice
	 * @param {number} y2 coordenada-y del segundo vértice
	 * @param {number} x3 coordenada-x del tercer vértice
	 * @param {number} y3 coordenada-y del tercer vértice
	 */
	function triángulo(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

	/** 🖌
	 * Dibuja un cuadrilátero.
	 * @param {number} x1 coordenada-x del primer vértice
	 * @param {number} y1 coordenada-y del primer vértice
	 * @param {number} x2 coordenada-x del segundo vértice
	 * @param {number} y2 coordenada-y del segundo vértice
	 * @param {number} x3 coordenada-x del tercer vértice
	 * @param {number} y3 coordenada-y del tercer vértice
	 * @param {number} x4 coordenada-x del cuarto vértice
	 * @param {number} y4 coordenada-y del cuarto vértice
	 */
	function quad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	// ⚙ avanzado

	/** ⚙
	 * Alias para `Q5`.
	 */
	const q5: typeof Q5;

	class Q5 {

		/** ⚙
		 * Funcion constructora. Crea una instancia de Q5.
		 * @param {string | Function} [ambito]
		 * @param {HTMLElement} [contenedor] elemento HTML dentro del cual se colocará el lienzo
		 * @example
		 * let q = new Q5('namespace');
		 * q.crearLienzo(200, 100);
		 * q.círculo(100, 50, 20);
		 */
		constructor(scope?: string | Function, parent?: HTMLElement);

		/** ⚙
		 * La versión menor actual de q5.
		 * @returns {string} la versión de q5
		 */
		version(): void;

		/** ⚙
		 * Establece un código de idioma distinto de 'en' (inglés) para usar q5 en otro idioma.
		 * 
		 * Idiomas actualmente soportados:
		 * 
		 * - 'es' (Español)
		 */
		static lang: string;

		/** ⚙
		 * Desactiva los mensajes de error amigables de q5.
		 */
		static deshabilitarErroresAmigables: boolean;

		/** ⚙
		 * Establecer en verdadero para mantener el bucle de dibujo después de un error.
		 */
		static toleranteErrores: boolean;

		/** ⚙
		 * Verdadero si el dispositivo soporta HDR (el espacio de color display-p3).
		 */
		static soportaHDR: boolean;

		/** ⚙
		 * Establece los atributos de contexto de lienzo predeterminados utilizados para
		 * lienzos recién creados y gráficos internos. Estas opciones son sobrescritas por
		 * cualquier opción por lienzo que pases a `crearLienzo`.
		 */
		static opcionesLienzo: object;

		/** ⚙
		 * Un límite de asignación de memoria WebGPU.
		 * 
		 * El número máximo de matrices de transformación
		 * que se pueden usar en una sola llamada de dibujo.
		 */
		static MAX_TRANSFORMACIONES: number;

		/** ⚙
		 * Un límite de asignación de memoria WebGPU.
		 * 
		 * El número máximo de rectángulos
		 * (llamadas a `rect`, `cuadrado`, `cápsula`)
		 * que se pueden dibujar en una sola llamada de dibujo.
		 */
		static MAX_RECTS: number;

		/** ⚙
		 * Un límite de asignación de memoria WebGPU.
		 * 
		 * El número máximo de elipses
		 * (llamadas a `elipse`, `círculo`, y `arco`)
		 * que se pueden dibujar en una sola llamada de dibujo.
		 */
		static MAX_ELIPSES: number;

		/** ⚙
		 * Un límite de asignación de memoria WebGPU.
		 * 
		 * El número máximo de caracteres de texto
		 * que se pueden dibujar en una sola llamada de dibujo.
		 */
		static MAX_CARACTERES: number;

		/** ⚙
		 * Un límite de asignación de memoria WebGPU.
		 * 
		 * El número máximo de llamadas separadas a `texto`
		 * que se pueden dibujar en una sola llamada de dibujo.
		 */
		static MAX_TEXTOS: number;

		/** ⚙
		 * Crea una nueva instancia de Q5 que usa el [renderizador WebGPU de q5](https://github.com/q5js/q5.js/wiki/q5-WebGPU-renderer).
		 */
		static WebGPU(): Q5;

		/** ⚙
		 * Los addons pueden aumentar q5 con nueva funcionalidad agregando hooks,
		 * funciones que se ejecutan en fases específicas del ciclo de vida de q5.
		 * 
		 * Dentro de la función, `this` se refiere a la instancia de Q5.
		 * @param {string} lifecycle 'init', 'presetup', 'postsetup', 'predraw', 'postdraw', o 'remove'
		 * @param {Function} fn La función que se ejecutará en la fase del ciclo de vida especificada.
		 */
		addHook(): void;

		/** ⚙
		 * Forma compatible con p5.js v2 de registrar un addon con q5.
		 * @param {Function} addon Una función que recibe `Q5`, `Q5.prototype`, y un objeto `lifecycles`.
		 */
		registerAddon(): void;

		/** ⚙
		 * Un objeto que contiene los módulos de q5, funciones que se ejecutan cuando q5 carga.
		 * 
		 * Cada función recibe dos parámetros de entrada:
		 * 
		 * - la instancia de q5
		 * - un proxy para editar la instancia de q5 y las propiedades correspondientes del ámbito global
		 */
		static modulos: object;

		/** ⚙
		 * La función de dibujo de q5 se ejecuta 60 veces por segundo por defecto.
		 */
		dibujar(): void;

		/** ⚙
		 * Se ejecuta después de cada llamada a la función `dibujar` y procesos de addons de q5 post-dibujo, si los hay.
		 * 
		 * Útil para agregar efectos de post-procesamiento cuando no es posible
		 * hacerlo al final de la función `dibujar`, como cuando se usan
		 * addons como p5play que dibujan automáticamente al lienzo después de que
		 * la función `dibujar` se ejecuta.
		 */
		postProcesar(): void;
		static versión: string;

		static agregarHook(cicloVida: string, fn: Function): void;

		static registrarAddon(addon: Function): void;

		actualizar(): void; //-

		static Imagen: {
			new (w: number, h: number, opt?: any): Q5.Imagen;
			};

	}

	namespace Q5 {
		interface Imagen {
			ancho: number;
			alto: number;
		}
	}

}

export {};
