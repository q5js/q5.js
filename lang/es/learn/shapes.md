# formas

## círculo

Dibuja un círculo en la posición (x, y) con el diámetro especificado.

```
@param {number} x posición x del centro del círculo
@param {number} y posición y del centro del círculo
@param {number} diámetro del círculo
```

### webgpu

```js
await Lienzo(200, 100);
círculo(0, 0, 80);
```

### c2d

```js
crearLienzo(200, 100);
círculo(100, 50, 80);
```

## elipse

Dibuja una elipse.

```
@param {number} x posición x
@param {number} y posición y
@param {number} ancho ancho de la elipse
@param {number} [alto] alto de la elipse
```

### webgpu

```js
await Lienzo(200, 100);
elipse(0, 0, 160, 80);
```

### c2d

```js
crearLienzo(200, 100);
elipse(100, 50, 160, 80);
```

## rect

Dibuja un rectángulo o un rectángulo redondeado.

```
@param {number} x posición x
@param {number} y posición y
@param {number} w ancho del rectángulo
@param {number} [h] alto del rectángulo
@param {number} [redondeado] radio para todas las esquinas
```

### webgpu

```js
await Lienzo(200);
fondo(0.8);

rect(-70, -80, 40, 60);
rect(-20, -30, 40, 60, 10);
rect(30, 20, 40, 60, 30);
```

### c2d

```js
crearLienzo(200);
fondo(200);

rect(30, 20, 40, 60);
rect(80, 70, 40, 60, 10);
rect(130, 120, 40, 60, 30, 2, 8, 20);
```

## cuadrado

Dibuja un cuadrado o un cuadrado redondeado.

```
@param {number} x posición x
@param {number} y posición y
@param {number} tamaño tamaño de los lados del cuadrado
@param {number} [redondeado] radio para todas las esquinas
```

### webgpu

```js
await Lienzo(200);
fondo(0.8);

cuadrado(-70, -70, 40);
cuadrado(-20, -20, 40, 10);
cuadrado(30, 30, 40, 30);
```

### c2d

```js
crearLienzo(200);
fondo(200);

cuadrado(30, 30, 40);
cuadrado(80, 80, 40, 10);
cuadrado(130, 130, 40, 30, 2, 8, 20);
```

## punto

Dibuja un punto en el lienzo.

```
@param {number} x posición x
@param {number} y posición y
```

### webgpu

```js
await Lienzo(200, 100);
trazo('white');
punto(-25, 0);

grosorTrazo(10);
punto(25, 0);
```

### c2d

```js
crearLienzo(200, 100);
trazo('white');
punto(75, 50);

grosorTrazo(10);
punto(125, 50);
```

## línea

Dibuja una línea en el lienzo.

```
@param {number} x1 posición x del primer punto
@param {number} y1 posición y del primer punto
@param {number} x2 posición x del segundo punto
@param {number} y2 posición y del segundo punto
```

### webgpu

```js
await Lienzo(200, 100);
trazo('lime');
línea(-80, -30, 80, 30);
```

### c2d

```js
crearLienzo(200, 100);
trazo('lime');
línea(20, 20, 180, 80);
```

## cápsula

Dibuja una cápsula.

```
@param {number} x1 posición x del primer punto
@param {number} y1 posición y del primer punto
@param {number} x2 posición x del segundo punto
@param {number} y2 posición y del segundo punto
@param {number} r radio de los extremos semicirculares de la cápsula
```

### webgpu

```js
await Lienzo(200, 100);
fondo(0.8);
grosorTrazo(5);
cápsula(-60, -10, 60, 10, 10);
```

```js
q5.dibujar = function () {
	fondo(0.8);
	relleno('cyan');
	grosorTrazo(10);
	cápsula(0, 0, ratónX, ratónY, 20);
};
```

### c2d

```js
crearLienzo(200, 100);
fondo(200);
grosorTrazo(5);
cápsula(40, 40, 160, 60, 10);
```

```js
function dibujar() {
	fondo(200);
	relleno('cyan');
	grosorTrazo(10);
	cápsula(100, 100, ratónX, ratónY, 20);
}
```

## modoRect

Establecer a `ESQUINA` (por defecto), `CENTRO`, `RADIO`, o `ESQUINAS`.

Cambia cómo se interpretan las primeras cuatro entradas para
`rect` y `cuadrado`.

```
@param {string} modo
```

### webgpu

```js
await Lienzo(200, 100);
fondo(0.8);
modoRect(ESQUINA);

//  ( x,  y,   w,  h)
rect(-50, -25, 100, 50);
```

```js
await Lienzo(200, 100);
fondo(0.8);
modoRect(CENTRO);

//  ( cX, cY,   w,  h)
rect(0, 0, 100, 50);
```

```js
await Lienzo(200, 100);
fondo(0.8);
modoRect(RADIO);

//  ( cX, cY, rX, rY)
rect(0, 0, 50, 25);
```

```js
await Lienzo(200, 100);
fondo(0.8);
modoRect(ESQUINAS);

//  ( x1, y1, x2, y2)
rect(-50, -25, 50, 25);
```

### c2d

```js
crearLienzo(200, 100);
fondo(200);
modoRect(ESQUINA);

//  ( x,  y,   w,  h)
rect(50, 25, 100, 50);
```

```js
crearLienzo(200, 100);
fondo(200);
modoRect(CENTRO);

//  ( cX, cY,   w,  h)
rect(100, 50, 100, 50);
```

```js
crearLienzo(200, 100);
fondo(200);
modoRect(RADIO);

//  ( cX, cY, rX, rY)
rect(100, 50, 50, 25);
```

```js
crearLienzo(200, 100);
fondo(200);
modoRect(ESQUINAS);

//  ( x1, y1, x2, y2)
rect(50, 25, 150, 75);
```

## modoEliptico

Establecer a `CENTRO` (por defecto), `RADIO`, `ESQUINA`, o `ESQUINAS`.

Cambia cómo se interpretan las primeras cuatro entradas para
`elipse`, `círculo`, y `arco`.

```
@param {string} modo
```

### webgpu

```js
await Lienzo(200, 100);
fondo(0.8);
modoEliptico(CENTRO);

//     (  x,  y,   w,  h)
elipse(0, 0, 100, 50);
```

```js
await Lienzo(200, 100);
fondo(0.8);
modoEliptico(RADIO);

//     (  x,  y, rX, rY)
elipse(0, 0, 50, 25);
```

```js
await Lienzo(200, 100);
fondo(0.8);
modoEliptico(ESQUINA);

//     (lX, tY,   w,  h)
elipse(-50, -25, 100, 50);
```

```js
await Lienzo(200, 100);
fondo(0.8);
modoEliptico(ESQUINAS);

//     ( x1, y1, x2, y2)
elipse(-50, -25, 50, 25);
```

### c2d

```js
crearLienzo(200, 100);
fondo(200);
modoEliptico(CENTRO);

//     (  x,  y,   w,  h)
elipse(100, 50, 100, 50);
```

```js
crearLienzo(200, 100);
fondo(200);
modoEliptico(RADIO);

//     (  x,  y, rX, rY)
elipse(100, 50, 50, 25);
```

```js
crearLienzo(200, 100);
fondo(200);
modoEliptico(ESQUINA);

//     (lX, tY,   w,  h)
elipse(50, 25, 100, 50);
```

```js
crearLienzo(200, 100);
fondo(200);
modoEliptico(ESQUINAS);

//     ( x1, y1, x2, y2)
elipse(50, 25, 150, 75);
```

## ESQUINA

Modo de alineación de forma, para usar en `modoRect` y `modoEliptico`.

## RADIO

Modo de alineación de forma, para usar en `modoRect` y `modoEliptico`.

## ESQUINAS

Modo de alineación de forma, para usar en `modoRect` y `modoEliptico`.
