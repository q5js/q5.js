# estilos

## relleno

Establece el color de relleno. El defecto es blanco.

Como la función [`color`](https://q5js.org/learn/#color), esta función
puede aceptar colores en una amplia gama de formatos: como una cadena de color CSS,
un objeto `Color`, valor de escala de grises, o valores de componentes de color.

```
@param {Color} color color de relleno
```

### webgpu

```js
await crearLienzo(200);
fondo(0.8);

relleno('red');
círculo(-20, -20, 80);

relleno('lime');
cuadrado(-20, -20, 80);
```

### c2d

```js
crearLienzo(200);
fondo(200);

relleno('red');
círculo(80, 80, 80);

relleno('lime');
cuadrado(80, 80, 80);
```

## trazo

Establece el color del trazo (contorno). El defecto es negro.

Como la función [`color`](https://q5js.org/learn/#color), esta función
puede aceptar colores en una amplia gama de formatos: como una cadena de color CSS,
un objeto `Color`, valor de escala de grises, o valores de componentes de color.

```
@param {Color} color color de trazo
```

### webgpu

```js
await crearLienzo(200);
fondo(0.8);
relleno(0.14);

trazo('red');
círculo(-20, -20, 80);

trazo('lime');
cuadrado(-20, -20, 80);
```

### c2d

```js
crearLienzo(200);
fondo(200);
relleno(36);

trazo('red');
círculo(80, 80, 80);

trazo('lime');
cuadrado(80, 80, 80);
```

## sinRelleno

Después de llamar a esta función, el dibujo no será rellenado.

### webgpu

```js
await crearLienzo(200);
fondo(0.8);

sinRelleno();

trazo('red');
círculo(-20, -20, 80);
trazo('lime');
cuadrado(-20, -20, 80);
```

### c2d

```js
crearLienzo(200);
fondo(200);

sinRelleno();

trazo('red');
círculo(80, 80, 80);
trazo('lime');
cuadrado(80, 80, 80);
```

## sinTrazo

Después de llamar a esta función, el dibujo no tendrá un trazo (contorno).

### webgpu

```js
await crearLienzo(200);
fondo(0.8);
relleno(0.14);
trazo('red');
círculo(-20, -20, 80);

sinTrazo();
cuadrado(-20, -20, 80);
```

### c2d

```js
crearLienzo(200);
fondo(200);
relleno(36);
trazo('red');
círculo(80, 80, 80);

sinTrazo();
cuadrado(80, 80, 80);
```

## grosorTrazo

Establece el tamaño del trazo usado para líneas y el borde alrededor de dibujos.

```
@param {number} grosor tamaño del trazo en píxeles
```

### webgpu

```js
await crearLienzo(200);
fondo(0.8);
trazo('red');
círculo(-50, 0, 80);

grosorTrazo(12);
círculo(50, 0, 80);
```

### c2d

```js
crearLienzo(200);
fondo(200);
trazo('red');
círculo(50, 100, 80);

grosorTrazo(12);
círculo(150, 100, 80);
```

## opacidad

Establece la opacidad global, que afecta a todas las operaciones de dibujo posteriores, excepto `fondo`. El defecto es 1, totalmente opaco.

En q5 WebGPU esta función solo afecta a imágenes.

```
@param {number} alfa nivel de opacidad, variando de 0 a 1
```

### webgpu

```js
await crearLienzo(200);
fondo(0.8);

opacidad(1);
círculo(-20, -20, 80);

opacidad(0.2);
cuadrado(-20, -20, 80);
```

### c2d

```js
crearLienzo(200);
fondo(200);

opacidad(1);
círculo(80, 80, 80);

opacidad(0.2);
cuadrado(80, 80, 80);
```

## sombra

Establece el color de la sombra. El defecto es transparente (sin sombra).

Las sombras se aplican a cualquier cosa dibujada en el lienzo, incluyendo formas rellenas,
trazos, texto, e imágenes.

Como la función [`color`](https://q5js.org/learn/#color), esta función
puede aceptar colores en una amplia gama de formatos: como una cadena de color CSS,
un objeto `Color`, valor de escala de grises, o valores de componentes de color.

No disponible en q5 WebGPU.

```
@param {Color} color color de sombra
```

### c2d

```js
crearLienzo(200);
fondo(200);

sinRelleno();
sombra('black');
rect(64, 60, 80, 80);
```

```js
crearLienzo(200);
let logo = cargarImagen('/assets/p5play_logo.webp');

function setup() {
	fondo(200);
	sombra(0);
	imagen(logo, 36, 36, 128, 128);
}
```

## sinSombra

Deshabilita el efecto de sombra.

No disponible en q5 WebGPU.

### c2d

```js
crearLienzo(200);
fondo(200);
sinTrazo();
sombra('black');
rect(14, 14, 80, 80);

sinSombra();
rect(104, 104, 80, 80);
```

## cajaSombra

Establece el desplazamiento de la sombra y el radio de desenfoque.

Cuando q5 comienza, el desplazamiento de la sombra es (10, 10) con un desenfoque de 10.

No disponible en q5 WebGPU.

```
@param {number} offsetX desplazamiento horizontal de la sombra
@param {number} offsetY desplazamiento vertical de la sombra, por defecto es el mismo que offsetX
@param {number} desenfoque radio de desenfoque de la sombra, por defecto es 0
```

### c2d

```js
crearLienzo(200);
sinTrazo();
sombra(50);

function dibujar() {
	fondo(200);
	cajaSombra(-20, ratónY, 10);
	círculo(100, 100, 80, 80);
}
```

```js
crearLienzo(200);
fondo(200);
sinTrazo();

sombra('aqua');
cajaSombra(20);
rect(50, 50, 100, 100);
tamañoTexto(64);
texto('q5', 60, 115);
```

## modoMezcla

Establece la operación de composición global para el contexto del lienzo.

No disponible en q5 WebGPU.

```
@param {string} val operación de composición
```

## terminaciónTrazo

Establece el estilo de terminación de línea a `ROUND`, `SQUARE`, o `PROJECT`.

No disponible en q5 WebGPU.

```
@param {CanvasLineCap} val estilo de terminación de línea
```

### c2d

```js
crearLienzo(200);
fondo(200);
grosorTrazo(20);

terminaciónTrazo(ROUND);
línea(50, 50, 150, 50);

terminaciónTrazo(SQUARE);
línea(50, 100, 150, 100);

terminaciónTrazo(PROJECT);
línea(50, 150, 150, 150);
```

## uniónTrazo

Establece el estilo de unión de línea a `ROUND`, `BEVEL`, o `MITER`.

No disponible en q5 WebGPU.

```
@param {CanvasLineJoin} val estilo de unión de línea
```

### c2d

```js
crearLienzo(200);
fondo(200);
grosorTrazo(10);

uniónTrazo(ROUND);
triángulo(50, 20, 150, 20, 50, 70);

uniónTrazo(BEVEL);
triángulo(150, 50, 50, 100, 150, 150);

uniónTrazo(MITER);
triángulo(50, 130, 150, 180, 50, 180);
```

## borrar

Establece el lienzo en modo borrar, donde las formas borrarán lo que está
debajo de ellas en lugar de dibujar sobre ello.

No disponible en q5 WebGPU.

```
@param {number} [rellenoAlfa] nivel de opacidad del color de relleno
@param {number} [trazoAlfa] nivel de opacidad del color de trazo
```

## noBorrar

Reinicia el lienzo del modo borrar al modo de dibujo normal.

No disponible en q5 WebGPU.

## guardarEstilos

Guarda la configuración de estilo de dibujo actual.

Esto incluye el relleno, trazo, grosor de trazo, tinte, modo de imagen,
modo de rectángulo, modo de elipse, tamaño de texto, alineación de texto, línea base de texto, y
configuración de sombra.

### webgpu

```js
await crearLienzo(200);
fondo(0.8);

guardarEstilos();
relleno('blue');
círculo(-50, -50, 80);

recuperarEstilos();
círculo(50, 50, 80);
```

### c2d

```js
crearLienzo(200);
fondo(200);

guardarEstilos();
relleno('blue');
círculo(50, 50, 80);

recuperarEstilos();
círculo(150, 150, 80);
```

## recuperarEstilos

Restaura la configuración de estilo de dibujo guardada previamente.

### webgpu

```js
await crearLienzo(200);
fondo(0.8);

guardarEstilos();
relleno('blue');
círculo(-50, -50, 80);

recuperarEstilos();
círculo(50, 50, 80);
```

### c2d

```js
crearLienzo(200);
fondo(200);

guardarEstilos();
relleno('blue');
círculo(50, 50, 80);

recuperarEstilos();
círculo(150, 150, 80);
```

## limpiar

Limpia el lienzo, haciendo que cada píxel sea completamente transparente.

Ten en cuenta que el lienzo solo se puede ver a través si tiene un canal alfa.

#### webgpu

```js
await crearLienzo(200, { alpha: true });

q5.dibujar = function () {
	limpiar();
	círculo((frameCount % 200) - 100, 0, 80);
};
```

### c2d

```js
crearLienzo(200, 200, { alpha: true });

function dibujar() {
	limpiar();
	círculo(frameCount % 200, 100, 80);
}
```

## enRelleno

Comprueba si un punto dado está dentro del área de relleno del camino actual.

No disponible en q5 WebGPU.

```
@param {number} x coordenada-x del punto
@param {number} y coordenada-y del punto
@returns {boolean} verdadero si el punto está dentro del área de relleno, falso de lo contrario
```

## enTrazo

Comprueba si un punto dado está dentro del trazo del camino actual.

No disponible en q5 WebGPU.

```
@param {number} x coordenada-x del punto
@param {number} y coordenada-y del punto
@returns {boolean} verdadero si el punto está dentro del trazo, falso de lo contrario
```
