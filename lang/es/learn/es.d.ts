declare global {
	declare interface GPUShaderModule {}
	// ⭐️ core

	function Lienzo(ancho?: number, alto?: number, opciones?: object): Promise<HTMLCanvasElement>;

	function dibujar(): void;

	function log(mensaje: any): void;

	// 🧑‍🎨 shapes

	function círculo(x: number, y: number, diámetro: number): void;

	function elipse(x: number, y: number, ancho: number, alto?: number): void;

	function rect(x: number, y: number, ancho: number, alto?: number, redondeado?: number): void;

	function cuadrado(x: number, y: number, tamaño: number, redondeado?: number): void;

	function punto(x: number, y: number): void;

	function línea(x1: number, y1: number, x2: number, y2: number): void;

	function cápsula(x1: number, y1: number, x2: number, y2: number, r: number): void;

	function modoRect(modo: string): void;

	function modoEliptico(modo: string): void;

	const ESQUINA: 'corner';

	const RADIO: 'radius';

	const ESQUINAS: 'corners';

	// 🌆 image

	function cargarImagen(url: string): Q5.Imagen & PromiseLike<Q5.Imagen>;

	function imagen(
		img: Q5.Imagen | HTMLVideoElement,
		dx: number,
		dy: number,
		dw?: number,
		dh?: number,
		sx?: number,
		sy?: number,
		sw?: number,
		sh?: number
	): void;

	function modoImagen(modo: string): void;

	function escalaImagenPorDefecto(escala: number): number;

	function redimensionar(w: number, h: number): void;

	function recortar(): Q5.Imagen;

	function suavizar(): void;

	function noSuavizar(): void;

	function teñir(color: string | number): void;

	function noTeñir(): void;

	function enmascarar(img: Q5.Imagen): void;

	function copiar(): Q5.Imagen;

	function insertado(
		sx: number,
		sy: number,
		sw: number,
		sh: number,
		dx: number,
		dy: number,
		dw: number,
		dh: number
	): void;

	function obtener(x: number, y: number, w?: number, h?: number): Q5.Imagen | number[];

	function establecer(x: number, y: number, val: any): void;

	var píxeles: number[];

	function cargarPíxeles(): void;

	function actualizarPíxeles(): void;

	function filtro(tipo: string, valor?: number): void;

	const UMBRAL: 1;

	const GRIS: 2;

	const OPACO: 3;

	const INVERTIR: 4;

	const POSTERIZAR: 5;

	const DILATAR: 6;

	const EROSIONAR: 7;

	const DESENFOCAR: 8;

	function crearImagen(w: number, h: number, opt?: any): Q5.Imagen;

	function crearGráficos(w: number, h: number, opt?: any): Q5;

	// 📘 text

	function texto(str: string, x: number, y: number, anchoEnvoltura?: number, limiteLineas?: number): void;

	function cargarFuente(url: string): FontFace & PromiseLike<FontFace>;

	function fuenteTexto(nombreFuente: string): void;

	function tamañoTexto(tamaño?: number): number | void;

	function interlineado(interlineado?: number): number | void;

	function estiloTexto(estilo: 'normal' | 'italic' | 'bold' | 'bolditalic'): void;

	function alineaciónTexto(horiz: 'left' | 'center' | 'right', vert?: 'top' | 'middle' | 'bottom' | 'alphabetic'): void;

	function pesoTexto(peso: number | string): void;

	function anchoTexto(str: string): number;

	function ascensoTexto(str: string): number;

	function descensoTexto(str: string): number;

	function crearImagenTexto(str: string, anchoEnvoltura: number, limiteLineas: number): Q5.Imagen;

	function imagenTexto(img: Q5.Imagen | String, x: number, y: number): void;

	function nf(n: number, l: number, r: number): string;

	const NORMAL: 'normal';

	const CURSIVA: 'italic';

	const NEGRILLA: 'bold';

	const NEGRILLA_CURSIVA: 'italic bold';

	const IZQUIERDA: 'left';

	const CENTRO: 'center';

	const DERECHA: 'right';

	const ARRIBA: 'top';

	const ABAJO: 'bottom';

	const LINEA_BASE: 'alphabetic';

	// 🖲️ input

	let ratónX: number;

	let ratónY: number;

	let pRatónX: number;

	let pRatónY: number;

	let botónRatón: string;

	let ratónPresionado: boolean;

	function alPresionarRatón(): void;

	function alSoltarRatón(): void;

	function alMoverRatón(): void;

	function alArrastrarRatón(): void;

	function dobleClic(): void;

	let tecla: string;

	let teclaPresionada: boolean;

	function teclaEstaPresionada(tecla: string): boolean;

	function alPresionarTecla(): void;

	function alSoltarTecla(): void;

	let toques: any[];

	function alEmpezarToque(): void;

	function alTerminarToque(): void;

	function alMoverToque(): void;

	function cursor(nombre: string, x?: number, y?: number): void;

	function sinCursor(): void;

	function ruedaRatón(evento: any): void;

	let movidoX: number;

	let movidoY: number;

	function bloqueoPuntero(movimientoNoAjustado: boolean): void;

	// 🎨 color

	function color(c0: string | number | Color | number[], c1?: number, c2?: number, c3?: number): Color;

	function modoColor(modo: 'rgb' | 'oklch', formato: 1 | 255, gama: 'srgb' | 'display-p3'): void;

	const RGB: 'rgb';

	const OKLCH: 'oklch';

	const HSL: 'hsl';

	const HSB: 'hsb';

	const SRGB: 'srgb';

	const DISPLAY_P3: 'display-p3';

	function fondo(relleno: Color | Q5.Imagen): void;

	class Color {
		constructor(c0: number, c1: number, c2: number, c3: number);

		igual(otro: Color): boolean;

		esMismoColor(otro: Color): boolean;

		toString(): string;

		niveles: number[];
	}

	// 💅 styles

	function relleno(color: Color): void;

	function trazo(color: Color): void;

	function sinRelleno(): void;

	function sinTrazo(): void;

	function grosorTrazo(grosor: number): void;

	function opacidad(alfa: number): void;

	function sombra(color: string | Color): void;

	function sinSombra(): void;

	function cajaSombra(offsetX: number, offsetY: number, desenfoque: number): void;

	function modoMezcla(val: string): void;

	function terminaciónTrazo(val: CanvasLineCap): void;

	function uniónTrazo(val: CanvasLineJoin): void;

	function borrar(rellenoAlfa?: number, trazoAlfa?: number): void;

	function noBorrar(): void;

	function guardarEstilos(): void;

	function recuperarEstilos(): void;

	function limpiar(): void;

	let ctx: CanvasRenderingContext2D;

	function enRelleno(x: number, y: number): boolean;

	function enTrazo(x: number, y: number): boolean;

	// 🦋 transforms

	function trasladar(x: number, y: number): void;

	function rotar(angulo: number): void;

	function escalar(x: number, y?: number): void;

	function cizallarX(angulo: number): void;

	function cizallarY(angulo: number): void;

	function aplicarMatriz(a: number, b: number, c: number, d: number, e: number, f: number): void;

	function reiniciarMatriz(): void;

	function guardarMatriz(): void;

	function recuperarMatriz(): void;

	function guardar(): void;

	function recuperar(): void;

	// 💻 display

	function modoVisualización(modo: string, calidadRender: string, escala: string | number): void;

	const MAXIMIZADO: 'maxed';

	const SUAVE: 'smooth';

	const PIXELADO: 'pixelated';

	function pantallaCompleta(v?: boolean): void;

	var anchoVentana: number;

	var altoVentana: number;

	var ancho: number;

	var alto: number;

	var medioAncho: number;

	var medioAlto: number;

	var lienzo: HTMLCanvasElement;

	function redimensionarLienzo(w: number, h: number): void;

	var cuadroActual: number;

	function pausar(): void;

	function redibujar(n?: number): void;

	function reanudar(): void;

	function frecuenciaRefresco(hertz?: number): number;

	function obtenerTasaFotogramasObjetivo(): number;

	function obtenerFPS(): number;

	function postProcesar(): void;

	function densidadPíxeles(v: number): number;

	function densidadVisualización(): number;

	var deltaTiempo: number;

	const C2D: 'c2d';

	const WEBGPU: 'webgpu';

	// 🧮 math

	function aleatorio(bajo?: number | any[], alto?: number): number | any;

	function flu(cantidad: number): number;

	function ruido(x?: number, y?: number, z?: number): number;

	function dist(x1: number, y1: number, x2: number, y2: number): number;

	function mapa(val: number, inicio1: number, fin1: number, inicio2: number, fin2: number): number;

	function modoÁngulo(modo: 'degrees' | 'radians'): void;

	function radianes(grados: number): number;

	function grados(radianes: number): number;

	function interpolar(inicio: number, fin: number, cant: number): number;

	function constreñir(n: number, bajo: number, alto: number): number;

	function norm(n: number, inicio: number, fin: number): number;

	function frac(n: number): number;

	function abs(n: number): number;

	function redondear(n: number, d: number): number;

	function techo(n: number): number;

	function piso(n: number): number;

	function min(...args: number[]): number;

	function max(...args: number[]): number;

	function pot(base: number, exponente: number): number;

	function cuad(n: number): number;

	function raiz(n: number): number;

	function loge(n: number): number;

	function exp(exponente: number): number;

	function semillaAleatoria(semilla: number): void;

	function generadorAleatorio(metodo: any): void;

	function aleatorioGaussiano(media: number, std: number): number;

	function aleatorioExponencial(): number;

	function modoRuido(modo: 'perlin' | 'simplex' | 'blocky'): void;

	function semillaRuido(semilla: number): void;

	function detalleRuido(lod: number, caida: number): void;

	const DOS_PI: number;

	const MEDIO_PI: number;

	const CUARTO_PI: number;

	// 🔊 sound

	function cargarSonido(url: string): Sonido & PromiseLike<Sonido>;

	function cargarAudio(url: string): HTMLAudioElement & PromiseLike<HTMLAudioElement>;

	function obtenerContextoAudio(): AudioContext | void;

	function iniciarAudioUsuario(): Promise<void>;

	class Sonido {
		constructor();

		volumen: number;

		pan: number;

		bucle: boolean;

		cargado: boolean;

		pausado: boolean;

		terminado: boolean;

		reproducir(): void;

		pausar(): void;

		detener(): void;
	}

	// 📑 dom

	function crearElemento(etiqueta: string, contenido?: string): HTMLElement;

	function crearA(href: string, texto?: string): HTMLAnchorElement;

	function crearBotón(contenido?: string): HTMLButtonElement;

	function crearCasilla(etiqueta?: string, marcado?: boolean): HTMLInputElement;

	function crearSelectorColor(valor?: string): HTMLInputElement;

	function crearImg(src: string): HTMLImageElement;

	function crearEntrada(valor?: string, tipo?: string): HTMLInputElement;

	function crearP(contenido?: string): HTMLParagraphElement;

	function crearOpciónes(nombreGrupo?: string): HTMLDivElement;

	function crearSelección(placeholder?: string): HTMLSelectElement;

	function crearDeslizador(min: number, max: number, valor?: number, paso?: number): HTMLInputElement;

	function crearVideo(src: string): HTMLVideoElement & PromiseLike<HTMLVideoElement>;

	function crearCaptura(tipo?: string, volteado?: boolean): HTMLVideoElement & PromiseLike<HTMLVideoElement>;

	function encontrarElemento(selector: string): HTMLElement;

	function encontrarElementos(selector: string): HTMLElement[];

	// 🎞️ record

	function crearGrabadora(): HTMLElement;

	function grabar(): void;

	function pausarGrabación(): void;

	function borrarGrabación(): void;

	function guardarGrabación(nombreArchivo: string): void;

	var grabando: boolean;

	// 🛠️ utilities

	function cargar(...urls: string[]): PromiseLike<any[]>;

	function guardar(datos?: object, nombreArchivo?: string): void;

	function cargarTexto(url: string): object & PromiseLike<string>;

	function cargarJSON(url: string): any & PromiseLike<any>;

	function cargarCSV(url: string): object[] & PromiseLike<object[]>;

	function cargarXML(url: string): object & PromiseLike<Element>;

	function cargarTodo(): PromiseLike<any[]>;

	function deshabilitarPrecarga(): void;

	function nf(num: number, digitos: number): string;

	function barajar(arr: any[]): any[];

	function guardarItem(clave: string, val: string): void;

	function obtenerItem(clave: string): string;

	function eliminarItem(clave: string): void;

	function limpiarAlmacenamiento(): void;

	function año(): number;

	function día(): number;

	function hora(): number;

	function minuto(): number;

	function segundo(): number;

	// ↗️ vector

	class Vector {
		constructor(x: number, y: number, z?: number);

		x: number;

		y: number;

		z: number;

		sumar(v: Vector): Vector;

		restar(v: Vector): Vector;

		mult(n: number | Vector): Vector;

		div(n: number | Vector): Vector;

		mag(): number;

		normalizar(): Vector;

		establecerMag(len: number): Vector;

		punto(v: Vector): number;

		cruz(v: Vector): Vector;

		dist(v: Vector): number;

		copiar(): Vector;

		establecer(x: number, y: number, z?: number): void;

		limitar(max: number): Vector;

		rumbo(): number;

		establecerRumbo(angulo: number): Vector;

		rotar(angulo: number): Vector;

		lerp(v: Vector, amt: number): Vector;

		slerp(v: Vector, amt: number): Vector;

		static desdeÁngulo(angulo: number, longitud?: number): Vector;
	}

	// 🖌️ shaping

	function arco(x: number, y: number, w: number, h: number, inicio: number, fin: number, modo?: number): void;

	function curva(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	function detalleCurva(val: number): void;

	function empezarForma(): void;

	function terminarForma(): void;

	function empezarContorno(): void;

	function terminarContorno(): void;

	function vértice(x: number, y: number): void;

	function vérticeBezier(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

	function vérticeCuadrático(cp1x: number, cp1y: number, x: number, y: number): void;

	function bezier(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	function triángulo(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

	function quad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

	// ⚡️ shaders

	function crearShader(codigo: string, tipo?: string, datos?: Float32Array | {}): GPUShaderModule;

	function plano(x: number, y: number, w: number, h?: number): void;

	function shader(moduloShader: GPUShaderModule): void;

	function reiniciarShader(): void;

	function reiniciarShaderFotograma(): void;

	function reiniciarShaderImagen(): void;

	function reiniciarShaderVideo(): void;

	function reiniciarShaderTexto(): void;

	function reiniciarShaders(): void;

	function crearShaderFotograma(codigo: string): GPUShaderModule;

	function crearShaderImagen(codigo: string): GPUShaderModule;

	function crearShaderVideo(codigo: string): GPUShaderModule;

	function crearShaderTexto(codigo: string): GPUShaderModule;

	// ⚙️ advanced

	class Q5 {
		constructor(scope?: string | Function, parent?: HTMLElement);

		static versión: string;

		static lang: string;

		static deshabilitarErroresAmigables: boolean;

		static toleranteErrores: boolean;

		static soportaHDR: boolean;

		static opcionesLienzo: object;

		static MAX_RECTS: number;

		static MAX_ELIPSES: number;

		static MAX_TRANSFORMACIONES: number;

		static MAX_CARACTERES: number;

		static MAX_TEXTOS: number;

		static WebGPU(): Q5;

		static agregarHook(cicloVida: string, fn: Function): void;

		static registrarAddon(addon: Function): void;

		static modulos: object;

		static dibujar(): void;

		static postProcesar(): void;

		//-
		static actualizar(): void;
		actualizar(): void;
		dibujar(): void;
		postProcesar(): void;
		Lienzo: typeof Lienzo;
		log: typeof log;
		círculo: typeof círculo;
		elipse: typeof elipse;
		rect: typeof rect;
		cuadrado: typeof cuadrado;
		punto: typeof punto;
		línea: typeof línea;
		cápsula: typeof cápsula;
		modoRect: typeof modoRect;
		modoEliptico: typeof modoEliptico;
		cargarImagen: typeof cargarImagen;
		imagen: typeof imagen;
		modoImagen: typeof modoImagen;
		escalaImagenPorDefecto: typeof escalaImagenPorDefecto;
		redimensionar: typeof redimensionar;
		recortar: typeof recortar;
		suavizar: typeof suavizar;
		noSuavizar: typeof noSuavizar;
		teñir: typeof teñir;
		noTeñir: typeof noTeñir;
		enmascarar: typeof enmascarar;
		copiar: typeof copiar;
		insertado: typeof insertado;
		obtener: typeof obtener;
		establecer: typeof establecer;
		cargarPíxeles: typeof cargarPíxeles;
		actualizarPíxeles: typeof actualizarPíxeles;
		filtro: typeof filtro;
		crearImagen: typeof crearImagen;
		crearGráficos: typeof crearGráficos;
		texto: typeof texto;
		cargarFuente: typeof cargarFuente;
		fuenteTexto: typeof fuenteTexto;
		tamañoTexto: typeof tamañoTexto;
		interlineado: typeof interlineado;
		estiloTexto: typeof estiloTexto;
		alineaciónTexto: typeof alineaciónTexto;
		pesoTexto: typeof pesoTexto;
		anchoTexto: typeof anchoTexto;
		ascensoTexto: typeof ascensoTexto;
		descensoTexto: typeof descensoTexto;
		crearImagenTexto: typeof crearImagenTexto;
		imagenTexto: typeof imagenTexto;
		nf: typeof nf;
		alPresionarRatón: typeof alPresionarRatón;
		alSoltarRatón: typeof alSoltarRatón;
		alMoverRatón: typeof alMoverRatón;
		alArrastrarRatón: typeof alArrastrarRatón;
		dobleClic: typeof dobleClic;
		teclaEstaPresionada: typeof teclaEstaPresionada;
		alPresionarTecla: typeof alPresionarTecla;
		alSoltarTecla: typeof alSoltarTecla;
		alEmpezarToque: typeof alEmpezarToque;
		alTerminarToque: typeof alTerminarToque;
		alMoverToque: typeof alMoverToque;
		cursor: typeof cursor;
		sinCursor: typeof sinCursor;
		ruedaRatón: typeof ruedaRatón;
		bloqueoPuntero: typeof bloqueoPuntero;
		color: typeof color;
		modoColor: typeof modoColor;
		fondo: typeof fondo;
		relleno: typeof relleno;
		trazo: typeof trazo;
		sinRelleno: typeof sinRelleno;
		sinTrazo: typeof sinTrazo;
		grosorTrazo: typeof grosorTrazo;
		opacidad: typeof opacidad;
		sombra: typeof sombra;
		sinSombra: typeof sinSombra;
		cajaSombra: typeof cajaSombra;
		modoMezcla: typeof modoMezcla;
		terminaciónTrazo: typeof terminaciónTrazo;
		uniónTrazo: typeof uniónTrazo;
		borrar: typeof borrar;
		noBorrar: typeof noBorrar;
		guardarEstilos: typeof guardarEstilos;
		recuperarEstilos: typeof recuperarEstilos;
		limpiar: typeof limpiar;
		enRelleno: typeof enRelleno;
		enTrazo: typeof enTrazo;
		trasladar: typeof trasladar;
		rotar: typeof rotar;
		escalar: typeof escalar;
		cizallarX: typeof cizallarX;
		cizallarY: typeof cizallarY;
		aplicarMatriz: typeof aplicarMatriz;
		reiniciarMatriz: typeof reiniciarMatriz;
		guardarMatriz: typeof guardarMatriz;
		recuperarMatriz: typeof recuperarMatriz;
		guardar: typeof guardar;
		recuperar: typeof recuperar;
		modoVisualización: typeof modoVisualización;
		pantallaCompleta: typeof pantallaCompleta;
		redimensionarLienzo: typeof redimensionarLienzo;
		pausar: typeof pausar;
		redibujar: typeof redibujar;
		reanudar: typeof reanudar;
		frecuenciaRefresco: typeof frecuenciaRefresco;
		obtenerTasaFotogramasObjetivo: typeof obtenerTasaFotogramasObjetivo;
		obtenerFPS: typeof obtenerFPS;
		densidadPíxeles: typeof densidadPíxeles;
		densidadVisualización: typeof densidadVisualización;
		aleatorio: typeof aleatorio;
		flu: typeof flu;
		ruido: typeof ruido;
		dist: typeof dist;
		mapa: typeof mapa;
		modoÁngulo: typeof modoÁngulo;
		radianes: typeof radianes;
		grados: typeof grados;
		interpolar: typeof interpolar;
		constreñir: typeof constreñir;
		norm: typeof norm;
		frac: typeof frac;
		abs: typeof abs;
		redondear: typeof redondear;
		techo: typeof techo;
		piso: typeof piso;
		min: typeof min;
		max: typeof max;
		pot: typeof pot;
		cuad: typeof cuad;
		raiz: typeof raiz;
		loge: typeof loge;
		exp: typeof exp;
		semillaAleatoria: typeof semillaAleatoria;
		generadorAleatorio: typeof generadorAleatorio;
		aleatorioGaussiano: typeof aleatorioGaussiano;
		aleatorioExponencial: typeof aleatorioExponencial;
		modoRuido: typeof modoRuido;
		semillaRuido: typeof semillaRuido;
		detalleRuido: typeof detalleRuido;
		cargarSonido: typeof cargarSonido;
		cargarAudio: typeof cargarAudio;
		obtenerContextoAudio: typeof obtenerContextoAudio;
		iniciarAudioUsuario: typeof iniciarAudioUsuario;
		crearElemento: typeof crearElemento;
		crearA: typeof crearA;
		crearBotón: typeof crearBotón;
		crearCasilla: typeof crearCasilla;
		crearSelectorColor: typeof crearSelectorColor;
		crearImg: typeof crearImg;
		crearEntrada: typeof crearEntrada;
		crearP: typeof crearP;
		crearOpciónes: typeof crearOpciónes;
		crearSelección: typeof crearSelección;
		crearDeslizador: typeof crearDeslizador;
		crearVideo: typeof crearVideo;
		crearCaptura: typeof crearCaptura;
		encontrarElemento: typeof encontrarElemento;
		encontrarElementos: typeof encontrarElementos;
		crearGrabadora: typeof crearGrabadora;
		recordar: typeof grabar;
		pausarGrabación: typeof pausarGrabación;
		borrarGrabación: typeof borrarGrabación;
		guardarGrabación: typeof guardarGrabación;
		cargar: typeof cargar;
		cargarTexto: typeof cargarTexto;
		cargarJSON: typeof cargarJSON;
		cargarCSV: typeof cargarCSV;
		cargarXML: typeof cargarXML;
		cargarTodo: typeof cargarTodo;
		deshabilitarPrecarga: typeof deshabilitarPrecarga;
		barajar: typeof barajar;
		guardarItem: typeof guardarItem;
		obtenerItem: typeof obtenerItem;
		eliminarItem: typeof eliminarItem;
		limpiarAlmacenamiento: typeof limpiarAlmacenamiento;
		año: typeof año;
		día: typeof día;
		hora: typeof hora;
		minuto: typeof minuto;
		segundo: typeof segundo;
		static Imagen: {
			new (w: number, h: number, opt?: any): Q5.Imagen;
		};
	}

	namespace Q5 {
		interface Imagen {
			ancho: number;
			alto: number;
			copiar(): Q5.Imagen;
			obtener(x: number, y: number, w?: number, h?: number): Q5.Imagen | number[];
			establecer(x: number, y: number, val: any): void;
			redimensionar(w: number, h: number): void;
			enmascarar(img: Q5.Imagen): void;
			recortar(): Q5.Imagen;
			filtro(tipo: string, valor?: number): void;
			cargarPíxeles(): void;
			actualizarPíxeles(): void;
			guardar(nombreArchivo?: string): void;
		}

		export import Color = globalThis.Color;
		export import Vector = globalThis.Vector;
	}

	const q5: typeof Q5;
}

export {};
