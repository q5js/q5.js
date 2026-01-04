# dom

El Modelo de Objetos del Documento (DOM) es una interfaz para
crear y editar páginas web con JavaScript.

## crearElemento

Crea un nuevo elemento HTML y lo añade a la página. `createEl` es
un alias.

Modifica el [`style`](https://developer.mozilla.org/docs/Web/API/HTMLElement/style) CSS del elemento para cambiar su apariencia.

Usa [`addEventListener`](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener) para responder a eventos como:

- "click": cuando se hace clic en el elemento
- "mouseover": cuando el ratón pasa sobre el elemento
- "mouseout": cuando el ratón deja de pasar sobre el elemento
- "input": cuando el valor de un elemento de formulario cambia

q5 añade alguna funcionalidad extra a los elementos que crea:

- la función `position` facilita colocar el elemento
  relativo al lienzo
- la función `size` establece el ancho y alto del elemento
- alternativamente, usa las propiedades `x`, `y`, `width`, y `height` del elemento

```
@param {string} etiqueta nombre de la etiqueta del elemento
@param {string} [contenido] contenido del elemento
@returns {HTMLElement} elemento
```

### webgpu

```js
await crearLienzo(200);

let el = crearElemento('div', '*');
el.position(50, 50);
el.size(100, 100);
el.style.fontSize = '136px';
el.style.textAlign = 'center';
el.style.backgroundColor = 'blue';
el.style.color = 'white';
```

### c2d

```js
crearLienzo(200);

let el = crearElemento('div', '*');
el.position(50, 50);
el.size(100, 100);
el.style.fontSize = '136px';
el.style.textAlign = 'center';
el.style.backgroundColor = 'blue';
el.style.color = 'white';
```

## crearA

Crea un elemento de enlace.

```
@param {string} href url
@param {string} [texto] contenido de texto
@param {boolean} [nuevaPestaña] si abrir el enlace en una nueva pestaña
```

### webgpu

```js
await crearLienzo(200);

let enlace = crearA('https://q5js.org', 'q5.js');
enlace.position(16, 42);
enlace.style.fontSize = '80px';

enlace.addEventListener('mouseover', () => {
	fondo('cyan');
});
```

### c2d

```js
crearLienzo(200);

let enlace = crearA('https://q5js.org', 'q5.js');
enlace.position(16, 42);
enlace.style.fontSize = '80px';

enlace.addEventListener('mouseover', () => {
	fondo('cyan');
});
```

## crearBotón

Crea un elemento de botón.

```
@param {string} [contenido] contenido de texto
```

### webgpu

```js
await crearLienzo(200, 100);

let btn = crearBotón('Click me!');

btn.addEventListener('click', () => {
	fondo(aleatorio(0.4, 1));
});
```

### c2d

```js
crearLienzo(200, 100);

let btn = crearBotón('Click me!');

btn.addEventListener('click', () => {
	fondo(aleatorio(100, 255));
});
```

## crearCasilla

Crea un elemento de casilla de verificación (checkbox).

Usa la propiedad `checked` para obtener o establecer el estado de la casilla.

La propiedad `label` es el elemento de etiqueta de texto junto a la casilla.

```
@param {string} [etiqueta] etiqueta de texto colocada junto a la casilla
@param {boolean} [marcado] estado inicial
```

### webgpu

```js
await crearLienzo(200, 100);

let casilla = crearCasilla('Check me!');
casilla.label.style.color = 'lime';

casilla.addEventListener('input', () => {
	if (casilla.checked) fondo('lime');
	else fondo('black');
});
```

### c2d

```js
crearLienzo(200, 100);

let casilla = crearCasilla('Check me!');
casilla.label.style.color = 'lime';

casilla.addEventListener('input', () => {
	if (casilla.checked) fondo('lime');
	else fondo('black');
});
```

## crearSelectorColor

Crea un elemento de entrada de color.

Usa la propiedad `value` para obtener o establecer el valor del color.

```
@param {string} [valor] valor de color inicial
```

### webgpu

```js
await crearLienzo(200, 100);

let selector = crearSelectorColor();
selector.value = '#fd7575';

q5.dibujar = function () {
	fondo(selector.value);
};
```

### c2d

```js
crearLienzo(200, 100);

let selector = crearSelectorColor();
selector.value = '#fd7575';

function dibujar() {
	fondo(selector.value);
}
```

## crearImg

Crea un elemento de imagen.

```
@param {string} src url de la imagen
```

### webgpu

```js
await crearLienzo(200, 100);

let img = crearImg('/assets/p5play_logo.webp');
img.position(0, 0).size(100, 100);
```

### c2d

```js
crearLienzo(200, 100);

let img = crearImg('/assets/p5play_logo.webp');
img.position(0, 0).size(100, 100);
```

## crearEntrada

Crea un elemento de entrada (input).

Usa la propiedad `value` para obtener o establecer el valor de la entrada.

Usa la propiedad `placeholder` para establecer el texto de etiqueta que aparece
dentro de la entrada cuando está vacía.

Mira la [documentación de input](https://developer.mozilla.org/docs/Web/HTML/Element/input#input_types) de MDN para la lista completa de tipos de entrada.

```
@param {string} [valor] valor inicial
@param {string} [tipo] tipo de entrada de texto, puede ser 'text', 'password', 'email', 'number', 'range', 'search', 'tel', 'url'
```

### webgpu

```js
await crearLienzo(200, 100);
tamañoTexto(64);

let entrada = crearEntrada();
entrada.placeholder = 'Type here!';
entrada.size(200, 32);

entrada.addEventListener('input', () => {
	fondo('orange');
	texto(entrada.value, -90, 30);
});
```

### c2d

```js
crearLienzo(200, 100);
tamañoTexto(64);

let entrada = crearEntrada();
entrada.placeholder = 'Type here!';
entrada.size(200, 32);

entrada.addEventListener('input', () => {
	fondo('orange');
	texto(entrada.value, 10, 70);
});
```

## crearP

Crea un elemento de párrafo.

```
@param {string} [contenido] contenido de texto
```

### webgpu

```js
await crearLienzo(200, 50);
fondo('coral');

let p = crearP('Hello, world!');
p.style.color = 'pink';
```

### c2d

```js
crearLienzo(200, 50);
fondo('coral');

let p = crearP('Hello, world!');
p.style.color = 'pink';
```

## crearOpciónes

Crea un grupo de botones de radio.

Usa la función `option(etiqueta, valor)` para añadir nuevos botones de radio
al grupo.

Usa la propiedad `value` para obtener o establecer el valor del botón de radio seleccionado.

```
@param {string} [nombreGrupo]
```

### webgpu

```js
await crearLienzo(200, 160);

let radio = crearOpciónes();
radio.option('square', '1').option('circle', '2');

q5.dibujar = function () {
	fondo(0.8);
	if (radio.value == '1') cuadrado(-40, -40, 80);
	if (radio.value == '2') círculo(0, 0, 80);
};
```

### c2d

```js
crearLienzo(200, 160);

let radio = crearOpciónes();
radio.option('square', '1').option('circle', '2');

function dibujar() {
	fondo(200);
	if (radio.value == '1') cuadrado(75, 25, 80);
	if (radio.value == '2') círculo(100, 50, 80);
}
```

## crearSelección

Crea un elemento de selección (select).

Usa la función `option(etiqueta, valor)` para añadir nuevas opciones al
elemento de selección.

Establece `multiple` a `true` para permitir seleccionar múltiples opciones.

Usa la propiedad `value` para obtener o establecer el valor de la opción seleccionada.

Usa la propiedad `selected` para obtener las etiquetas de las opciones
seleccionadas o establecer las opciones seleccionadas por etiqueta. Puede ser una sola
cadena o un array de cadenas.

```
@param {string} [placeholder] texto opcional que aparece antes de que se seleccione una opción
```

### webgpu

```js
await crearLienzo(200, 100);

let sel = crearSelección('Select a color');
sel.option('Red', '#f55').option('Green', '#5f5');

sel.addEventListener('change', () => {
	fondo(sel.value);
});
```

### c2d

```js
crearLienzo(200, 100);

let sel = crearSelección('Select a color');
sel.option('Red', '#f55').option('Green', '#5f5');

sel.addEventListener('change', () => {
	fondo(sel.value);
});
```

## crearDeslizador

Crea un elemento deslizador (slider).

Usa la propiedad `value` para obtener o establecer el valor del deslizador.

Usa la función `val` para obtener el valor del deslizador como un número.

```
@param {number} min valor mínimo
@param {number} max valor máximo
@param {number} [valor] valor inicial
@param {number} [paso] tamaño del paso
```

### webgpu

```js
await crearLienzo(200);

let deslizador = crearDeslizador(0, 1, 0.5, 0.1);
deslizador.position(10, 10).size(180);

q5.dibujar = function () {
	fondo(deslizador.val());
};
```

### c2d

```js
crearLienzo(200);

let deslizador = crearDeslizador(0, 255);
deslizador.position(10, 10).size(180);

function dibujar() {
	fondo(deslizador.val());
}
```

## crearVideo

Crea un elemento de video.

Ten en cuenta que los videos deben estar silenciados para reproducirse automáticamente y las funciones `play` y
`pause` solo pueden ejecutarse después de una interacción del usuario.

El elemento de video puede ocultarse y su contenido puede
mostrarse en el lienzo usando la función `imagen`.

```
@param {string} src url del video
@returns {HTMLVideoElement & PromiseLike<HTMLVideoElement>} un nuevo elemento de video
```

### webgpu

```js
await crearLienzo(1);

let vid = crearVideo('/assets/apollo4.mp4');
vid.size(200, 150);
vid.autoplay = vid.muted = vid.loop = true;
vid.controls = true;
```

```js
await crearLienzo(200, 150);
let vid = crearVideo('/assets/apollo4.mp4');
vid.hide();

q5.alPresionarRatón = function () {
	vid.currentTime = 0;
	vid.play();
};
q5.dibujar = function () {
	imagen(vid, -100, -75, 200, 150);
	// filtro(HUE_ROTATE, 90);
};
```

### c2d

```js
crearLienzo(1);

let vid = crearVideo('/assets/apollo4.mp4');
vid.size(200, 150);
vid.autoplay = vid.muted = vid.loop = true;
vid.controls = true;
```

```js
crearLienzo(200, 150);
let vid = crearVideo('/assets/apollo4.mp4');
vid.hide();

function alPresionarRatón() {
	vid.currentTime = 0;
	vid.play();
}
function dibujar() {
	imagen(vid, 0, 0, 200, 150);
	filtro(HUE_ROTATE, 90);
}
```

## crearCaptura

Crea una captura desde una cámara conectada, como una webcam.

El elemento de video de captura puede ocultarse y su contenido puede
mostrarse en el lienzo usando la función `imagen`.

Puede precargarse para asegurar que la captura esté lista para usar cuando tu
sketch comience.

Solicita la resolución de video más alta de la cámara frontal del usuario
por defecto. El primer parámetro de esta función se puede usar para
especificar las restricciones para la captura. Mira [`getUserMedia`](https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia)
para más información.

```
@param {string} [tipo] tipo de captura, puede ser solo `VIDEO` o solo `AUDIO`, el defecto es usar ambos video y audio
@param {boolean} [volteado] si reflejar el video verticalmente, true por defecto
@returns {HTMLVideoElement & PromiseLike<HTMLVideoElement>} un nuevo elemento de video
```

### webgpu

```js
q5.alPresionarRatón = function () {
	let cap = crearCaptura(VIDEO);
	cap.size(200, 112.5);
	canvas.remove();
};
```

```js
let cap;
q5.alPresionarRatón = function () {
	cap = crearCaptura(VIDEO);
	cap.hide();
};

q5.dibujar = function () {
	let y = (frameCount % 200) - 100;
	imagen(cap, -100, y, 200, 200);
};
```

```js
q5.alPresionarRatón = function () {
	let cap = crearCaptura({
		video: { width: 640, height: 480 }
	});
	cap.size(200, 150);
	canvas.remove();
};
```

### c2d

```js
function alPresionarRatón() {
	let cap = crearCaptura(VIDEO);
	cap.size(200, 112.5);
	canvas.remove();
}
```

```js
let cap;
function alPresionarRatón() {
	cap = crearCaptura(VIDEO);
	cap.hide();
}

function dibujar() {
	let y = frameCount % height;
	imagen(cap, 0, y, 200, 200);
}
```

```js
function alPresionarRatón() {
	let cap = crearCaptura({
		video: { width: 640, height: 480 }
	});
	cap.size(200, 150);
	canvas.remove();
}
```

## encontrarElemento

Encuentra el primer elemento en el DOM que coincide con el [selector CSS](https://developer.mozilla.org/docs/Learn_web_development/Core/Styling_basics/Basic_selectors) dado.

```
@param {string} selector
@returns {HTMLElement} elemento
```

## encontrarElementos

Encuentra todos los elementos en el DOM que coinciden con el [selector CSS](https://developer.mozilla.org/docs/Learn_web_development/Core/Styling_basics/Basic_selectors) dado.

```
@param {string} selector
@returns {HTMLElement[]} elementos
```
