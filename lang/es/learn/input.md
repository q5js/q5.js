# entrada

El manejo de entrada de q5 es muy básico.

Para un mejor manejo de entrada, incluyendo soporte para controladores de juegos, considera usar el addon [p5play](https://p5play.org/) con q5.

Ten en cuenta que las respuestas de entrada dentro de `dibujar` pueden retrasarse
hasta un ciclo de fotograma: desde el momento exacto en que ocurre un evento de entrada
hasta la próxima vez que se dibuja un fotograma.

Reproduce sonidos o activa otra retroalimentación no visual inmediatamente
respondiendo a eventos de entrada dentro de funciones como
`alPresionarRatón` y `alPresionarTecla`.

## ratónX

Posición X actual del ratón.

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	tamañoTexto(64);
	texto(redondear(ratónX), -50, 20);
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	tamañoTexto(64);
	texto(redondear(ratónX), 50, 120);
}
```

## ratónY

Posición Y actual del ratón.

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	círculo(0, ratónY, 100);
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	círculo(100, ratónY, 100);
}
```

## pRatónX

Posición X previa del ratón.

## pRatónY

Posición Y previa del ratón.

## botónRatón

El botón actual siendo presionado: 'left', 'right', 'center').

El valor por defecto es una cadena vacía.

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	tamañoTexto(64);
	texto(botónRatón, -80, 20);
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	tamañoTexto(64);
	texto(botónRatón, 20, 120);
}
```

## ratónPresionado

Verdadero si el ratón está actualmente presionado, falso de lo contrario.

### webgpu

```js
q5.dibujar = function () {
	if (ratónPresionado) fondo(0.4);
	else fondo(0.8);
};
```

### c2d

```js
function dibujar() {
	if (ratónPresionado) fondo(100);
	else fondo(200);
}
```

## alPresionarRatón

Define esta función para responder a eventos de presionar el ratón.

### webgpu

```js
await crearLienzo(200);
let gris = 0.4;

q5.alPresionarRatón = function () {
	fondo(gris);
	gris = (gris + 0.1) % 1;
};
```

### c2d

```js
crearLienzo(200);
let gris = 95;

function alPresionarRatón() {
	fondo(gris % 256);
	gris += 40;
}
```

## alSoltarRatón

Define esta función para responder a eventos de soltar el ratón.

### webgpu

```js
await crearLienzo(200);
let gris = 0.4;

q5.alSoltarRatón = function () {
	fondo(gris);
	gris = (gris + 0.1) % 1;
};
```

### c2d

```js
crearLienzo(200);
let gris = 95;

function alSoltarRatón() {
	fondo(gris % 256);
	gris += 40;
}
```

## alMoverRatón

Define esta función para responder a eventos de mover el ratón.

En dispositivos con pantalla táctil esta función no se llama
cuando el usuario arrastra su dedo en la pantalla.

### webgpu

```js
await crearLienzo(200);
let gris = 0.4;

q5.alMoverRatón = function () {
	fondo(gris);
	gris = (gris + 0.005) % 1;
};
```

### c2d

```js
crearLienzo(200);
let gris = 95;

function alMoverRatón() {
	fondo(gris % 256);
	gris++;
}
```

## alArrastrarRatón

Define esta función para responder a eventos de arrastrar el ratón.

Arrastrar el ratón se define como mover el ratón
mientras un botón del ratón está presionado.

### webgpu

```js
await crearLienzo(200);
let gris = 0.4;

q5.alArrastrarRatón = function () {
	fondo(gris);
	gris = (gris + 0.005) % 1;
};
```

### c2d

```js
crearLienzo(200);
let gris = 95;

function alArrastrarRatón() {
	fondo(gris % 256);
	gris++;
}
```

## dobleClic

Define esta función para responder a eventos de doble clic del ratón.

### webgpu

```js
await crearLienzo(200);
let gris = 0.4;

q5.dobleClic = function () {
	fondo(gris);
	gris = (gris + 0.1) % 1;
};
```

### c2d

```js
crearLienzo(200);
let gris = 95;

function dobleClic() {
	fondo(gris % 256);
	gris += 40;
}
```

## tecla

El nombre de la última tecla presionada.

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	tamañoTexto(64);
	texto(tecla, -80, 20);
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	tamañoTexto(64);
	texto(tecla, 20, 120);
}
```

## teclaPresionada

Verdadero si una tecla está actualmente presionada, falso de lo contrario.

### webgpu

```js
q5.dibujar = function () {
	if (teclaPresionada) fondo(0.4);
	else fondo(0.8);
};
```

### c2d

```js
function dibujar() {
	if (teclaPresionada) fondo(100);
	else fondo(200);
}
```

## teclaEstaPresionada

Devuelve verdadero si el usuario está presionando la tecla especificada, falso
de lo contrario. Acepta nombres de teclas insensibles a mayúsculas.

```
@param {string} tecla tecla a comprobar
@returns {boolean} verdadero si la tecla está presionada, falso de lo contrario
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);

	if (teclaEstaPresionada('f') && teclaEstaPresionada('j')) {
		rect(-50, -50, 100, 100);
	}
};
```

### c2d

```js
function dibujar() {
	fondo(200);

	if (teclaEstaPresionada('f') && teclaEstaPresionada('j')) {
		rect(50, 50, 100, 100);
	}
}
```

## alPresionarTecla

Define esta función para responder a eventos de presionar tecla.

### webgpu

```js
await crearLienzo(200);
let gris = 0.4;

q5.alPresionarTecla = function () {
	fondo(gris);
	gris = (gris + 0.1) % 1;
};
```

### c2d

```js
crearLienzo(200);

let gris = 95;
function alPresionarTecla() {
	fondo(gris % 256);
	gris += 40;
}
```

## alSoltarTecla

Define esta función para responder a eventos de soltar tecla.

### webgpu

```js
await crearLienzo(200);
let gris = 0.4;

q5.alSoltarTecla = function () {
	fondo(gris);
	gris = (gris + 0.1) % 1;
};
```

### c2d

```js
crearLienzo(200);

let gris = 95;
function alSoltarTecla() {
	fondo(gris % 256);
	gris += 40;
}
```

## toques

Array que contiene todos los puntos de toque actuales dentro de la
ventana del navegador. Cada toque es un objeto con
propiedades `id`, `x`, e `y`.

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	for (let toque of toques) {
		círculo(toque.x, toque.y, 100);
	}
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	for (let toque of toques) {
		círculo(toque.x, toque.y, 100);
	}
}
```

## alEmpezarToque

Define esta función para responder a eventos de inicio de toque
en el lienzo.

Devuelve true para habilitar gestos táctiles como pellizcar para hacer zoom
y desplazarse, que q5 deshabilita en el lienzo por defecto.

### webgpu

```js
await crearLienzo(200);
let gris = 0.4;

q5.alEmpezarToque = function () {
	fondo(gris);
	gris = (gris + 0.1) % 1;
};
```

### c2d

```js
crearLienzo(200);

let gris = 95;
function alEmpezarToque() {
	fondo(gris % 256);
	gris += 40;
}
```

## alTerminarToque

Define esta función para responder a eventos de fin de toque
en el lienzo.

Devuelve true para habilitar gestos táctiles como pellizcar para hacer zoom
y desplazarse, que q5 deshabilita en el lienzo por defecto.

### webgpu

```js
await crearLienzo(200);
let gris = 0.4;

q5.alTerminarToque = function () {
	fondo(gris);
	gris = (gris + 0.1) % 1;
};
```

### c2d

```js
crearLienzo(200);

let gris = 95;
function alTerminarToque() {
	fondo(gris % 256);
	gris += 40;
}
```

## alMoverToque

Define esta función para responder a eventos de movimiento de toque
en el lienzo.

Devuelve true para habilitar gestos táctiles como pellizcar para hacer zoom
y desplazarse, que q5 deshabilita en el lienzo por defecto.

### webgpu

```js
await crearLienzo(200);
let gris = 0.4;

q5.alMoverToque = function () {
	fondo(gris);
	gris = (gris + 0.005) % 1;
};
```

### c2d

```js
crearLienzo(200);
let gris = 95;

function alMoverToque() {
	fondo(gris % 256);
	gris++;
}
```

## punteros

Objeto que contiene todos los punteros actuales dentro de la
ventana del navegador.

Esto incluye ratón, toque y punteros de lápiz.

Cada puntero es un objeto con
propiedades `event`, `x`, e `y`.
La propiedad `event` contiene el
[PointerEvent](https://developer.mozilla.org/docs/Web/API/PointerEvent) original.

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	for (let punteroID in punteros) {
		let puntero = punteros[punteroID];
		círculo(puntero.x, puntero.y, 100);
	}
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	for (let punteroID in punteros) {
		let puntero = punteros[punteroID];
		círculo(puntero.x, puntero.y, 100);
	}
}
```

## cursor

Establece el cursor a un [tipo de cursor CSS](https://developer.mozilla.org/docs/Web/CSS/cursor) o imagen.
Si se proporciona una imagen, las coordenadas x e y opcionales pueden
especificar el punto activo del cursor.

```
@param {string} nombre nombre del cursor o la url a una imagen
@param {number} [x] coordenada x del punto del cursor
@param {number} [y] coordenada y del punto del cursor
```

### webgpu

```js
await crearLienzo(200, 100);
cursor('pointer');
```

### c2d

```js
crearLienzo(200, 100);
cursor('pointer');
```

## sinCursor

Oculta el cursor dentro de los límites del lienzo.

### webgpu

```js
await crearLienzo(200, 100);
sinCursor();
```

### c2d

```js
crearLienzo(200, 100);
sinCursor();
```

## ruedaRatón

Define esta función para responder a eventos de la rueda del ratón.

`event.deltaX` y `event.deltaY` son las cantidades de desplazamiento horizontal y vertical,
respectivamente.

Devuelve true para permitir el comportamiento por defecto de desplazar la página.

### webgpu

```js
let x = (y = 0);
q5.dibujar = function () {
	círculo(x, y, 10);
};
q5.ruedaRatón = function (e) {
	x += e.deltaX;
	y += e.deltaY;
	return false;
};
```

### c2d

```js
let x = (y = 100);
function dibujar() {
	círculo(x, y, 10);
}
function ruedaRatón(e) {
	x += e.deltaX;
	y += e.deltaY;
	return false;
}
```

## bloqueoPuntero

Solicita que el puntero se bloquee al cuerpo del documento, ocultando
el cursor y permitiendo un movimiento ilimitado.

Los sistemas operativos habilitan la aceleración del ratón por defecto, lo cual es útil cuando a veces quieres un movimiento lento y preciso (piensa en cómo usarías un paquete de gráficos), pero también quieres moverte grandes distancias con un movimiento de ratón más rápido (piensa en desplazarte y seleccionar varios archivos). Para algunos juegos, sin embargo, se prefieren los datos de entrada de ratón sin procesar para controlar la rotación de la cámara — donde el mismo movimiento de distancia, rápido o lento, resulta en la misma rotación.

Para salir del modo de bloqueo de puntero, llama a `document.exitPointerLock()`.

```
@param {boolean} movimientoNoAjustado establecer a true para deshabilitar la aceleración del ratón a nivel de SO y acceder a la entrada de ratón sin procesar
```

### webgpu

```js
q5.dibujar = function () {
	círculo(ratónX / 10, ratónY / 10, 10);
};

q5.dobleClic = function () {
	if (!document.pointerLockElement) {
		bloqueoPuntero();
	} else {
		document.exitPointerLock();
	}
};
```

### c2d

```js
function dibujar() {
	círculo(ratónX / 10 + 100, ratónY / 10 + 100, 10);
}

function dobleClic() {
	if (!document.pointerLockElement) {
		bloqueoPuntero();
	} else {
		document.exitPointerLock();
	}
}
```
