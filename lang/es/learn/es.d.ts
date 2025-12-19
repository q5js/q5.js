declare global {
	// ⭐️ core

	function crearLienzo(ancho?: number, alto?: number, opciones: object): Promise<HTMLCanvasElement>;

	function dibujar(): void;

	function log(...mensaje: any[]): void;

	// 🧑‍🎨 shapes

	function círculo(x: number, y: number, diámetro: number): void;

	// 🎨 color

	function fondo(relleno: Color | Q5.Image): void;

	// 💻 display

	var anchoVentana: number;

	var altoVentana: number;

	var cuadroActual: number;

	function pausar(): void;

	function redibujar(n?: number): void;

	function reanudar(): void;

	function frecuenciaRefresco(hz: number): void | number;
}

export {};
