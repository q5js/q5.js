declare global {

	// ⭐ core

	/**
	 * Bienvenidx a la documentación de q5! 🤩
	 * 
	 * ¿Primera vez programando? Revisa la [guía para principiantes de q5].
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
	 */
	function crearLienzo(ancho?: number, alto?: number, opciones: object): Promise<HTMLCanvasElement>;

	/** ⭐
	 * Función a declarar. Se ejecutará 60 veces por segundo de forma predeterminada. Tiene comportamiento de bucle, lo que permite hacer animaciones cuadro a cuadro.
	 */
	function dibujar(): void;

	/** ⭐
	 * Imprime un mensaje en la consola de JavaScript. Atajo para `console.log()`.
	 * 
	 * Para acceder a las herramientas del navegador (DevTools) generalmente es con click derecho + "inspeccionar", o presionando las teclas `ctrl + shift + i` o `command + option + i`. La consola se encuentra en la pestaña "console".
	 * @param {any} mensaje a imprimir
	 */
	function log(...mensaje: any[]): void;

	// 🧑‍🎨 shapes

	/** 🧑‍🎨
	 * Dibuja un círculo en la posición (x, y) con el diámetro especificado.
	 * @param {number} x posición x del centro del círculo
	 * @param {number} y posición y del centro del círculo
	 * @param {number} diámetro del círculo
	 */
	function círculo(): void;

	// 🎨 color

	/** 🎨
	 * Dibuja sobre todo el lienzo con un color o una imagen.
	 * 
	 * Al igual que la función [`color`](https://q5js.org/learn/#color),
	 * esta función puede aceptar colores en una amplia gama de formatos:
	 * cadena de color CSS, valor de escala de grises y valores de componentes de color.
	 * @param {Color | Q5.Image} relleno un color o una imagen para dibujar
	 */
	function fondo(relleno: Color | Q5.Image): void;

	// 💻 display

	/** 💻
	 * El ancho de la ventana (cantidad de píxeles). Atajo para `window.innerWidth`.
	 */
	var anchoVentana: number;

	/** 💻
	 * El alto de la ventana (cantidad de píxeles). Atajo para `window.innerHeight`.
	 */
	var altoVentana: number;

	/** 💻
	 * Número del cuadro actual, es decir, la cantidad de cuadros que se han dibujado desde que se inició el sketch.
	 */
	var cuadroActual: number;

	/** 💻
	 * Detiene el bucle de dibujo.
	 */
	function pausar(): void;

	/** 💻
	 * Dibuja el lienzo `n` veces. Si no recibe parametro, se dibuja una sola vez. Útil para controlar animaciones con el bucle pausado.
	 * @param {number} [n] cantidad de veces que se volverá a dibujar el lienzo, por defecto es 1
	 */
	function redibujar(n?: number): void;

	/** 💻
	 * Vuelve a activar el bucle de dibujo en caso de que estuviera pausado.
	 */
	function reanudar(): void;

	/** 💻
	 * Si recibe un parámetro, establece la cantidad ideal de cuadros que se intentarán dibujar por cada segundo (es decir, la tasa de refresco, la frecuencia del bucle).
	 * 
	 * Retorna la frecuencia real alcanzada durante el último segundo de ejecución. Incluso si nunca se modifica explícitamente la frecuencia, el valor real suele fluctuar entre el ideal y 0. Para un mejor análisis del rendimiento usar las herramientas del navegador (DevTools).
	 * @param `hz` {number} [frecuencia] cantidad ideal de cuadros a dibujar en un segundo, por defecto es 60
	 * @returns {number} frecuencia real del bucle en el último segundo
	 */
	function frecuenciaRefresco(hz: number): void | number;

	/** 💻
	 * Retorna la cantidad ideal de cuadros que se intentan dibujar por segundo.
	 */
	function frecuenciaIdeal(): void;

	/** 💻
	 * Retorna la cantidad maxima de cuadros que se podrían estar dibujando en cada segundo.
	 * 
	 * Es un valor teórico que depende del estado del dispositivo. Para un mejor análisis del rendimiento usar las herramientas del navegador (DevTools).
	 * @returns {number} cantidad máxima teorica de cuadros por segundo
	 */
	function frecuenciaMaxima(): void;

	/** 💻
	 * Funcion a declarar. Se ejecuta después de cada llamada a `dibujar` y de los `hooks de dibujo`, pero antes de dibujar realmente el lienzo.
	 * 
	 * Útil para agregar efectos finales cuando es difícil hacerlo en la función de dibujo. Por ejemplo, al usar extensiones como p5play que dibujan capas superpuestas al lienzo.
	 */
	function retocarDibujo(): void;

	/** 💻
	 * Milisegundos que han pasado desde el último cuadro dibujado. Con la frecuencia por defecto a 60 hz, el tiempo aproximado es 16.6 ms o mas.
	 * 
	 * Útil para mantener las animaciones sincronizadas con precisión, sobretodo si existen momentos en que la ejecución se ralentiza por sobrecarga del dispositivo. En casos en que la frecuencia real del bucle sea considerablemente mas baja, es recomendable reducir la frecuencia ideal.
	 */
	function ultimoTiempo(): void;

}

export {};
