# texto

## texto

Renderiza texto en el lienzo.

El texto se puede posicionar con los parámetros x e y
y opcionalmente se puede restringir.

```
@param {string} str cadena de texto a mostrar
@param {number} x coordenada-x de la posición del texto
@param {number} y coordenada-y de la posición del texto
@param {number} [anchoEnvoltura] ancho máximo de línea en caracteres
@param {number} [limiteLineas] número máximo de líneas
```

### webgpu

```js
await crearLienzo(200, 100);
fondo('silver');

tamañoTexto(32);
texto('Hello, world!', -88, 10);
```

```js
await crearLienzo(200);
fondo(0.8);
tamañoTexto(20);

let info =
	'q5.js was designed to make creative coding fun and accessible for a new generation of artists, designers, educators, and beginners.';

texto(info, -88, -70, 20, 6);
//
//
```

### c2d

```js
crearLienzo(200, 100);
fondo('silver');

tamañoTexto(32);
texto('Hello, world!', 12, 60);
```

```js
crearLienzo(200);
fondo(200);
tamañoTexto(20);

let info =
	'q5.js was designed to make creative coding fun and accessible for a new generation of artists, designers, educators, and beginners.';

texto(info, 12, 30, 20, 6);
//
//
```

## cargarFuente

Carga una fuente desde una URL.

El archivo de fuente puede estar en cualquier formato aceptado en CSS, como
archivos .ttf y .otf. El primer ejemplo a continuación carga
[Robotica](https://www.dafont.com/robotica-courtney.font).

También soporta cargar [fuentes de Google](https://fonts.google.com/).
El segundo ejemplo carga
[Pacifico](https://fonts.google.com/specimen/Pacifico).

Si no se cargan fuentes, se usa la fuente sans-serif por defecto.

Por defecto, los recursos se cargan en paralelo antes de que q5 ejecute `dibujar`. Usa `await` para esperar a que una fuente se cargue.

```
@param {string} url URL de la fuente a cargar
@returns {FontFace & PromiseLike<FontFace>} fuente
```

### webgpu

En q5 WebGPU, las fuentes en [formato MSDF](https://github.com/q5js/q5.js/wiki/q5-WebGPU-renderer#text-rendering)
con el archivo terminando en "-msdf.json" se pueden usar para renderizado de texto de alto rendimiento. Haz la tuya usando el [convertidor de fuentes MSDF](https://msdf-bmfont.donmccurdy.com/).

```js
await crearLienzo(200, 56);

await cargarFuente('/assets/Robotica.ttf');

relleno('skyblue');
tamañoTexto(64);
imagenTexto('Hello!', -98, 24);
```

```js
await crearLienzo(200, 74);

cargarFuente('fonts.googleapis.com/css2?family=Pacifico');

q5.dibujar = function () {
	relleno('hotpink');
	tamañoTexto(68);
	imagenTexto('Hello!', -98, 31);
};
```

```js
await crearLienzo(200, 74);

await cargarFuente('sans-serif'); // msdf

relleno('white');
tamañoTexto(68);
imagenTexto('Hello!', -98, 31);
```

### c2d

```js
crearLienzo(200, 56);

cargarFuente('/assets/Robotica.ttf');

function setup() {
	relleno('skyblue');
	tamañoTexto(64);
	texto('Hello!', 2, 54);
}
```

```js
crearLienzo(200, 74);

cargarFuente('fonts.googleapis.com/css2?family=Pacifico');

function setup() {
	relleno('hotpink');
	tamañoTexto(68);
	texto('Hello!', 2, 68);
}
```

## fuenteTexto

Establece la fuente actual a usar para renderizar texto.

Por defecto, la fuente se establece a la [familia de fuentes CSS](https://developer.mozilla.org/docs/Web/CSS/font-family)
"sans-serif" o la última fuente cargada.

```
@param {string} nombreFuente nombre de la familia de fuentes o un objeto FontFace
```

### webgpu

```js
await crearLienzo(200, 160);
fondo(0.8);

fuenteTexto('serif');

q5.dibujar = function () {
	tamañoTexto(32);
	texto('Hello, world!', -96, 10);
};
```

```js
await crearLienzo(200);
fondo(0.8);

fuenteTexto('monospace');

q5.dibujar = function () {
	texto('Hello, world!', -68, 10);
};
```

### c2d

```js
crearLienzo(200, 160);
fondo(200);

fuenteTexto('serif');

tamañoTexto(32);
texto('Hello, world!', 15, 90);
```

```js
crearLienzo(200);
fondo(200);

fuenteTexto('monospace');

tamañoTexto(24);
texto('Hello, world!', 15, 90);
```

## tamañoTexto

Establece u obtiene el tamaño de fuente actual. Si no se proporciona argumento, devuelve el tamaño de fuente actual.

```
@param {number} [tamaño] tamaño de la fuente en píxeles
@returns {number | void} tamaño de fuente actual cuando no se proporciona argumento
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);

	tamañoTexto(abs(ratónX));
	texto('A', -90, 90);
};
```

### c2d

```js
function dibujar() {
	fondo(200);

	tamañoTexto(abs(ratónX));
	texto('A', 10, 190);
}
```

## interlineado

Establece u obtiene la altura de línea actual. Si no se proporciona argumento, devuelve la altura de línea actual.

```
@param {number} [interlineado] altura de línea en píxeles
@returns {number | void} altura de línea actual cuando no se proporciona argumento
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);

	tamañoTexto(abs(ratónX));
	texto('A', -90, 90);
	rect(-90, 90, 5, -interlineado());
};
```

### c2d

```js
function dibujar() {
	fondo(200);

	tamañoTexto(abs(ratónX));
	texto('A', 10, 190);
	rect(10, 190, 5, -interlineado());
}
```

## estiloTexto

Establece el estilo de texto actual.

No aplicable a WebGPU cuando se usan fuentes MSDF.

```
@param {'normal' | 'italic' | 'bold' | 'bolditalic'} estilo estilo de fuente
```

### webgpu

```js
await crearLienzo(200);
fondo(0.8);

estiloTexto(CURSIVA);

tamañoTexto(32);
texto('Hello, world!', -88, 6);
```

### c2d

```js
crearLienzo(200);
fondo(200);

estiloTexto(CURSIVA);

tamañoTexto(32);
texto('Hello, world!', 12, 106);
```

## alineaciónTexto

Establece la alineación horizontal y vertical del texto.

```
@param {'left' | 'center' | 'right'} horiz alineación horizontal
@param {'top' | 'middle' | 'bottom' | 'alphabetic'} [vert] alineación vertical
```

### webgpu

```js
await crearLienzo(200);
fondo(0.8);
tamañoTexto(32);

alineaciónTexto(CENTRO, MEDIO);
texto('Hello, world!', 0, 0);
```

### c2d

```js
crearLienzo(200);
fondo(200);
tamañoTexto(32);

alineaciónTexto(CENTRO, MEDIO);
texto('Hello, world!', 100, 100);
```

## pesoTexto

Establece el peso del texto.

- 100: delgado
- 200: extra-ligero
- 300: ligero
- 400: normal/regular
- 500: medio
- 600: semi-negrita
- 700: negrita
- 800: más negrita/extra-negrita
- 900: negro/pesado

```
@param {number | string} peso peso de la fuente
```

### webgpu

```js
await crearLienzo(200);
fondo(0.8);
tamañoTexto(32);
alineaciónTexto(CENTRO, MEDIO);

pesoTexto(100);
texto('Hello, world!', 0, 0);
```

### c2d

```js
crearLienzo(200);
fondo(200);
tamañoTexto(32);
alineaciónTexto(CENTRO, MEDIO);

pesoTexto(100);
texto('Hello, world!', 100, 100);
```

## anchoTexto

Calcula y devuelve el ancho de una cadena de texto dada.

```
@param {string} str cadena a medir
@returns {number} ancho del texto en píxeles
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);

	tamañoTexto(abs(ratónX));
	rect(-90, 90, anchoTexto('A'), -interlineado());
	texto('A', -90, 90);
};
```

### c2d

```js
function dibujar() {
	fondo(200);

	tamañoTexto(abs(ratónX));
	rect(10, 190, anchoTexto('A'), -interlineado());
	texto('A', 10, 190);
}
```

## ascensoTexto

Calcula y devuelve el ascenso (la distancia desde la línea base hasta la parte superior del carácter más alto) de la fuente actual.

```
@param {string} str cadena a medir
@returns {number} ascenso del texto en píxeles
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);

	tamañoTexto(abs(ratónX));
	rect(-90, 90, anchoTexto('A'), -ascensoTexto());
	texto('A', -90, 90);
};
```

### c2d

```js
function dibujar() {
	fondo(200);

	tamañoTexto(abs(ratónX));
	rect(10, 190, anchoTexto('A'), -ascensoTexto());
	texto('A', 10, 190);
}
```

## descensoTexto

Calcula y devuelve el descenso (la distancia desde la línea base hasta la parte inferior del carácter más bajo) de la fuente actual.

```
@param {string} str cadena a medir
@returns {number} descenso del texto en píxeles
```

### webgpu

```js
await crearLienzo(200);
fondo(0.8);
tamañoTexto(64);

rect(-100, 0, 200, descensoTexto('q5'));
texto('q5', -90, 0);
```

### c2d

```js
crearLienzo(200);
fondo(200);
tamañoTexto(64);

rect(0, 100, 200, descensoTexto('q5'));
texto('q5', 10, 100);
```

## crearImagenTexto

Crea una imagen a partir de una cadena de texto.

```
@param {string} str cadena de texto
@param {number} [anchoEnvoltura] ancho máximo de línea en caracteres
@param {number} [limiteLineas] número máximo de líneas
@returns {Q5.Image} un objeto de imagen representando el texto renderizado
```

### webgpu

```js
await crearLienzo(200);
tamañoTexto(96);

let img = crearImagenTexto('🐶');
img.filtro(INVERTIR);

q5.dibujar = function () {
	imagen(img, -45, -90);
};
```

### c2d

```js
crearLienzo(200);
tamañoTexto(96);

let img = crearImagenTexto('🐶');
img.filtro(INVERTIR);

function dibujar() {
	imagen(img, 55, 10);
}
```

## imagenTexto

Renderiza una imagen generada a partir de texto en el lienzo.

Si el primer parámetro es una cadena, se creará y almacenará en caché automáticamente
una imagen del texto.

El posicionamiento de la imagen se ve afectado por la configuración actual de
alineación de texto y línea base.

En q5 WebGPU, esta función es la única forma de dibujar texto multicolor,
como emojis, y de usar fuentes que no están en formato MSDF.
Usar esta función para dibujar texto que cambia cada fotograma tiene
un costo de rendimiento muy alto.

```
@param {Q5.Image | string} img imagen o texto
@param {number} x coordenada-x donde se debe colocar la imagen
@param {number} y coordenada-y donde se debe colocar la imagen
```

### webgpu

```js
await crearLienzo(200);
fondo(0.8);
tamañoTexto(96);
alineaciónTexto(CENTRO, CENTRO);

imagenTexto('🐶', 0, 0);
```

```js
await crearLienzo(200);

await cargar('/assets/Robotica.ttf');

fondo(0.8);
tamañoTexto(66);
imagenTexto('Hello!', -100, 100);
```

### c2d

```js
crearLienzo(200);
fondo(200);
tamañoTexto(96);
alineaciónTexto(CENTRO, CENTRO);

imagenTexto('🐶', 100, 100);
```

```js
crearLienzo(200);

cargarFuente('/assets/Robotica.ttf');

function setup() {
	fondo(200);
	tamañoTexto(66);
	imagenTexto('Hello!', 0, 0);
}
```

## nf

Formateador de números, se puede usar para mostrar un número como una cadena con
un número especificado de dígitos antes y después del punto decimal,
opcionalmente añadiendo relleno con ceros.

```
@param {number} n número a formatear
@param {number} l número mínimo de dígitos que aparecen antes del punto decimal; el número se rellena con ceros si es necesario
@param {number} r número de dígitos que aparecen después del punto decimal
@returns {string} una representación de cadena del número, formateada en consecuencia
```

### webgpu

```js
await crearLienzo(200, 100);
fondo(0.8);

tamañoTexto(32);
texto(nf(PI, 4, 5), -90, 10);
```

### c2d

```js
crearLienzo(200, 100);
fondo(200);

tamañoTexto(32);
texto(nf(PI, 4, 5), 10, 60);
```

## NORMAL

Estilo de fuente normal.

## CURSIVA

Estilo de fuente cursiva.

## NEGRILLA

Peso de fuente negrita.

## NEGRILLA_CURSIVA

Estilo de fuente negrita y cursiva.

## IZQUIERDA

Alinear texto a la izquierda.

## CENTRO

Alinear texto al centro.

## DERECHA

Alinear texto a la derecha.

## ARRIBA

Alinear texto arriba.

## ABAJO

Alinear texto abajo.

## LINEA_BASE

Alinear texto a la línea base (alfabética).
