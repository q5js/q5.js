# imagen

## cargarImagen

Carga una imagen desde una URL.

Por defecto, los recursos se cargan en paralelo antes de que q5 ejecute `dibujar`. Usa `await` para esperar a que una imagen se cargue.

```
@param {string} url url de la imagen a cargar
@returns {Q5.Image & PromiseLike<Q5.Image>} imagen
```

### webgpu

```js
await Lienzo(200);

let logo = cargarImagen('/q5js_logo.avif');

q5.dibujar = function () {
	fondo(logo);
};
```

```js
await Lienzo(200);

let logo = await cargarImagen('/q5js_logo.avif');
fondo(logo);
```

### c2d

```js
crearLienzo(200);

let logo = cargarImagen('/q5js_logo.avif');

function dibujar() {
	fondo(logo);
}
```

## imagen

Dibuja una imagen o fotograma de video en el lienzo.

```
@param {Q5.Image | HTMLVideoElement} img imagen o video a dibujar
@param {number} dx posición x donde dibujar la imagen
@param {number} dy posición y donde dibujar la imagen
@param {number} [dw] ancho de la imagen de destino
@param {number} [dh] alto de la imagen de destino
@param {number} [sx] posición x en la fuente para empezar a recortar una subsección
@param {number} [sy] posición y en la fuente para empezar a recortar una subsección
@param {number} [sw] ancho de la subsección de la imagen fuente
@param {number} [sh] alto de la subsección de la imagen fuente
```

### webgpu

```js
await Lienzo(200);

let logo = cargarImagen('/q5js_logo.avif');

q5.dibujar = function () {
	imagen(logo, -100, -100, 200, 200);
};
```

```js
await Lienzo(200);

let logo = cargarImagen('/q5js_logo.avif');

q5.dibujar = function () {
	imagen(logo, -100, -100, 200, 200, 256, 256, 512, 512);
};
```

### c2d

```js
crearLienzo(200);

let logo = cargarImagen('/q5js_logo.avif');

function dibujar() {
	imagen(logo, 0, 0, 200, 200);
}
```

```js
crearLienzo(200);

let logo = cargarImagen('/q5js_logo.avif');

function dibujar() {
	imagen(logo, 0, 0, 200, 200, 256, 256, 512, 512);
}
```

## modoImagen

Establecer a `CORNER` (por defecto), `CORNERS`, o `CENTER`.

Cambia cómo se interpretan las entradas a `imagen`.

```
@param {string} modo
```

### webgpu

```js
await Lienzo(200);
let logo = cargarImagen('/q5js_logo.avif');

q5.dibujar = function () {
	modoImagen(CORNER);

	//   ( img,  x,  y,   w,   h)
	imagen(logo, -50, -50, 100, 100);
};
```

```js
await Lienzo(200);
let logo = cargarImagen('/q5js_logo.avif');

q5.dibujar = function () {
	modoImagen(CENTER);

	//   ( img,  cX,  cY,   w,   h)
	imagen(logo, 0, 0, 100, 100);
};
```

```js
await Lienzo(200);
let logo = cargarImagen('/q5js_logo.avif');

q5.dibujar = function () {
	modoImagen(CORNERS);

	//   ( img, x1, y1,  x2,  y2)
	imagen(logo, -50, -50, 50, 50);
};
```

### c2d

```js
crearLienzo(200);
let logo = cargarImagen('/q5js_logo.avif');

function dibujar() {
	modoImagen(CORNER);

	//   ( img,  x,  y,   w,   h)
	imagen(logo, 50, 50, 100, 100);
}
```

```js
crearLienzo(200);
let logo = cargarImagen('/q5js_logo.avif');

function dibujar() {
	modoImagen(CENTER);

	//   ( img,  cX,  cY,   w,   h)
	imagen(logo, 100, 100, 100, 100);
}
```

```js
crearLienzo(200);
let logo = cargarImagen('/q5js_logo.avif');

function dibujar() {
	modoImagen(CORNERS);

	//   ( img, x1, y1,  x2,  y2)
	imagen(logo, 50, 50, 100, 100);
}
```

## escalaImagenPorDefecto

Establece la escala de imagen por defecto, que se aplica a las imágenes cuando
se dibujan sin un ancho o alto especificado.

Por defecto es 0.5 para que las imágenes aparezcan en su tamaño real
cuando la densidad de píxeles es 2. Las imágenes se dibujarán a un tamaño
por defecto consistente relativo al lienzo independientemente de la densidad de píxeles.

Esta función debe llamarse antes de que se carguen las imágenes para
tener efecto.

```
@param {number} escala
@returns {number} escala de imagen por defecto
```

## redimensionar

Redimensiona la imagen.

```
@param {number} w nuevo ancho
@param {number} h nuevo alto
```

### webgpu

```js
await Lienzo(200);

let logo = await cargar('/q5js_logo.avif');

logo.redimensionar(128, 128);
imagen(logo, -100, -100, 200, 200);
```

### c2d

```js
crearLienzo(200);

let logo = cargarImagen('/q5js_logo.avif');

function setup() {
	logo.redimensionar(128, 128);
	imagen(logo, 0, 0, 200, 200);
}
```

## recortar

Devuelve una imagen recortada, eliminando los píxeles transparentes de los bordes.

```
@returns {Q5.Image}
```

## suavizar

Habilita el renderizado suave de imágenes mostradas más grandes que
su tamaño real. Esta es la configuración por defecto, así que ejecutar esta
función solo tiene efecto si se ha llamado a `noSuavizar`.

### webgpu

```js
await Lienzo(200);
let icono = await cargar('/q5js_icon.png');
imagen(icono, -100, -100, 200, 200);
```

### c2d

```js
crearLienzo(200);

let icono = cargarImagen('/q5js_icon.png');

function setup() {
	imagen(icono, 0, 0, 200, 200);
}
```

## noSuavizar

Deshabilita el renderizado suave de imágenes para un aspecto pixelado.

### webgpu

```js
await Lienzo(200);

let icono = await cargar('/q5js_icon.png');

noSuavizar();
imagen(icono, -100, -100, 200, 200);
```

### c2d

```js
crearLienzo(200);

let icono = cargarImagen('/q5js_icon.png');

function setup() {
	noSuavizar();
	imagen(icono, 0, 0, 200, 200);
}
```

## teñir

Aplica un tinte (superposición de color) al dibujo.

El valor alfa del color de tinte determina la
fuerza del tinte. Para cambiar la opacidad de una imagen,
usa la función `opacidad`.

El teñido afecta a todas las imágenes dibujadas posteriormente. El color de tinte
se aplica a las imágenes usando el modo de mezcla "multiply".

Dado que el proceso de teñido es intensivo en rendimiento, cada vez
que se tiñe una imagen, q5 almacena en caché el resultado. `imagen` dibujará la
imagen teñida en caché a menos que el color de tinte haya cambiado o la
imagen que se está tiñendo haya sido editada.

Si necesitas dibujar una imagen múltiples veces cada fotograma con
diferentes tintes, considera hacer copias de la imagen y teñir
cada copia por separado.

```
@param {string | number} color color de tinte
```

### webgpu

```js
await Lienzo(200);

let logo = await cargar('/q5js_logo.avif');

teñir(1, 0, 0, 0.5);
imagen(logo, -100, -100, 200, 200);
```

### c2d

```js
crearLienzo(200);

let logo = cargarImagen('/q5js_logo.avif');

function setup() {
	teñir(255, 0, 0, 128);
	imagen(logo, 0, 0, 200, 200);
}
```

## noTeñir

Las imágenes dibujadas después de ejecutar esta función no serán teñidas.

## enmascarar

Enmascara la imagen con otra imagen.

```
@param {Q5.Image} img imagen a usar como máscara
```

## copiar

Devuelve una copia de la imagen.

```
@returns {Q5.Image}
```

## insertado

Muestra una región de la imagen en otra región de la imagen.
Se puede usar para crear un detalle insertado, también conocido como efecto de lupa.

```
@param {number} sx coordenada x de la región fuente
@param {number} sy coordenada y de la región fuente
@param {number} sw ancho de la región fuente
@param {number} sh alto de la región fuente
@param {number} dx coordenada x de la región destino
@param {number} dy coordenada y de la región destino
@param {number} dw ancho de la región destino
@param {number} dh alto de la región destino
```

### webgpu

```js
await Lienzo(200);

let logo = await cargar('/q5js_logo.avif');

logo.insertado(256, 256, 512, 512, 0, 0, 256, 256);
imagen(logo, -100, -100, 200, 200);
```

### c2d

```js
crearLienzo(200);

let logo = cargarImagen('/q5js_logo.avif');

function setup() {
	logo.insertado(256, 256, 512, 512, 0, 0, 256, 256);
	imagen(logo, 0, 0, 200, 200);
}
```

## obtener

Recupera una subsección de una imagen o lienzo como una nueva Imagen Q5
o el color de un píxel en la imagen o lienzo.

Si solo se especifican x e y, esta función devuelve el color del píxel
en la coordenada dada en formato de array `[R, G, B, A]`. Si `cargarPíxeles`
nunca se ha ejecutado, es ejecutado por esta función.

Si haces cambios en el lienzo o imagen, debes llamar a `cargarPíxeles`
antes de usar esta función para obtener los datos de color actuales.

No aplicable a lienzos WebGPU.

```
@param {number} x
@param {number} y
@param {number} [w] ancho del área, por defecto es 1
@param {number} [h] alto del área, por defecto es 1
@returns {Q5.Image | number[]}
```

### webgpu

```js
await Lienzo(200);

let logo = await cargar('/q5js_logo.avif');

let recortada = logo.obtener(256, 256, 512, 512);
imagen(recortada, -100, -100, 200, 200);
```

### c2d

```js
function dibujar() {
	fondo(200);
	sinTrazo();
	círculo(100, 100, frameCount % 200);

	cargarPíxeles();
	let col = obtener(ratónX, ratónY);
	texto(col, ratónX, ratónY);
}
```

```js
crearLienzo(200);

let logo = cargarImagen('/q5js_logo.avif');

function setup() {
	let recortada = logo.obtener(256, 256, 512, 512);
	imagen(recortada, 0, 0, 200, 200);
}
```

## establecer

Establece el color de un píxel en la imagen o lienzo. El modo de color debe ser RGB.

O si se proporciona un lienzo o imagen, se dibuja encima de la
imagen o lienzo de destino, ignorando su configuración de tinte.

Ejecuta `actualizarPíxeles` para aplicar los cambios.

No aplicable a lienzos WebGPU.

```
@param {number} x
@param {number} y
@param {any} val color, lienzo, o imagen
```

### webgpu

```js
await Lienzo(200);

let c = color('lime');
let img = crearImagen(50, 50);

q5.dibujar = function () {
	img.establecer(aleatorio(50), aleatorio(50), c);
	img.actualizarPíxeles();

	fondo(img);
};
```

### c2d

```js
crearLienzo(200);
let c = color('lime');

function dibujar() {
	establecer(aleatorio(200), aleatorio(200), c);
	actualizarPíxeles();
}
```

## píxeles

Array de datos de color de píxeles de un lienzo o imagen.

Vacío por defecto, obtener el dato ejecutando `cargarPíxeles`.

Cada píxel está representado por cuatro valores consecutivos en el array,
correspondientes a sus canales rojo, verde, azul y alfa.

Los datos del píxel superior izquierdo están al principio del array
y los datos del píxel inferior derecho están al final, yendo de
izquierda a derecha y de arriba a abajo.

## cargarPíxeles

Carga datos de píxeles en `píxeles` desde el lienzo o imagen.

El ejemplo a continuación establece el canal verde de algunos píxeles
a un valor aleatorio.

No aplicable a lienzos WebGPU.

### webgpu

```js
frecuenciaRefresco(5);
let icono = cargarImagen('/q5js_icon.png');

q5.dibujar = function () {
	icono.cargarPíxeles();
	for (let i = 0; i < icono.píxeles.length; i += 16) {
		icono.píxeles[i + 1] = aleatorio(1);
	}
	icono.actualizarPíxeles();
	fondo(icono);
};
```

### c2d

```js
frecuenciaRefresco(5);
let icono = cargarImagen('/q5js_icon.png');

function dibujar() {
	icono.cargarPíxeles();
	for (let i = 0; i < icono.píxeles.length; i += 16) {
		icono.píxeles[i + 1] = aleatorio(255);
	}
	icono.actualizarPíxeles();
	fondo(icono);
}
```

## actualizarPíxeles

Aplica cambios en el array `píxeles` al lienzo o imagen.

No aplicable a lienzos WebGPU.

### webgpu

```js
await Lienzo(200);
let c = color('pink');

let img = crearImagen(50, 50);
for (let x = 0; x < 50; x += 3) {
	for (let y = 0; y < 50; y += 3) {
		img.establecer(x, y, c);
	}
}
img.actualizarPíxeles();

fondo(img);
```

### c2d

```js
crearLienzo(200);

for (let x = 0; x < 200; x += 5) {
	for (let y = 0; y < 200; y += 5) {
		establecer(x, y, color('pink'));
	}
}
actualizarPíxeles();
```

## filtro

Aplica un filtro a la imagen.

Mira la documentación de las constantes de filtro de q5 a continuación para más información.

También se puede usar una cadena de filtro CSS.
https://developer.mozilla.org/docs/Web/CSS/filter

No aplicable a lienzos WebGPU.

```
@param {string} tipo tipo de filtro o una cadena de filtro CSS
@param {number} [valor] valor opcional, depende del tipo de filtro
```

### webgpu

```js
await Lienzo(200);
let logo = await cargar('/q5js_logo.avif');
logo.filtro(INVERTIR);
imagen(logo, -100, -100, 200, 200);
```

### c2d

```js
crearLienzo(200);
let logo = cargarImagen('/q5js_logo.avif');

function setup() {
	logo.filtro(INVERTIR);
	imagen(logo, 0, 0, 200, 200);
}
```

## UMBRAL

Convierte la imagen a píxeles blancos y negros dependiendo si están por encima o por debajo de cierto umbral.

## GRIS

Convierte la imagen a escala de grises estableciendo cada píxel a su luminancia.

## OPACO

Establece el canal alfa a totalmente opaco.

## INVERTIR

Invierte el color de cada píxel.

## POSTERIZAR

Limita cada canal de la imagen al número de colores especificado como argumento.

## DILATAR

Aumenta el tamaño de las áreas brillantes.

## EROSIONAR

Aumenta el tamaño de las áreas oscuras.

## DESENFOCAR

Aplica un desenfoque gaussiano a la imagen.

## crearImagen

Crea una nueva imagen.

```
@param {number} w ancho
@param {number} h alto
@param {any} [opt] configuraciones opcionales para la imagen
@returns {Q5.Image}
```

## crearGráficos

Crea un búfer de gráficos.

Deshabilitado por defecto en q5 WebGPU.
Mira el issue [#104](https://github.com/q5js/q5.js/issues/104) para detalles.

```
@param {number} w ancho
@param {number} h alto
@param {object} [opt] opciones
@returns {Q5} un nuevo búfer de gráficos Q5
```
