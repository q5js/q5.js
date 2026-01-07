# modelado

## arco

Dibuja un arco, que es una sección de una elipse.

`modoEliptico` afecta cómo se dibuja el arco.

q5 WebGPU solo soporta el modo por defecto `PIE_OPEN`.

```
@param {number} x coordenada-x
@param {number} y coordenada-y
@param {number} w ancho de la elipse
@param {number} h alto de la elipse
@param {number} inicio ángulo para empezar el arco
@param {number} fin ángulo para terminar el arco
@param {number} [modo] configuración de estilo de forma y trazo, por defecto es `PIE_OPEN` para una forma de pastel con un trazo no cerrado, puede ser `PIE`, `CHORD`, o `CHORD_OPEN`
```

### webgpu

```js
await crearLienzo(200);
fondo(0.8);

arco(0, 0, 160, 160, 0.8, -0.8);
```

### c2d

```js
crearLienzo(200);
fondo(200);

arco(40, 40, 40, 40, 0.8, -0.8);
arco(80, 80, 40, 40, 0.8, -0.8, PIE);
arco(120, 120, 40, 40, 0.8, -0.8, CHORD_OPEN);
arco(160, 160, 40, 40, 0.8, -0.8, CHORD);
```

## curva

Dibuja una curva.

### webgpu

```js
await crearLienzo(200, 100);
fondo(0.8);

curva(-100, -200, -50, 0, 50, 0, 100, -200);
```

## detalleCurva

Establece la cantidad de segmentos de línea recta usados para hacer una curva.

Solo tiene efecto en q5 WebGPU.

```
@param {number} val nivel de detalle de la curva, por defecto es 20
```

### webgpu

```js
await crearLienzo(200);

detalleCurva(4);

grosorTrazo(10);
trazo(0, 1, 1);
curva(-100, -200, -50, 0, 50, 0, 100, -200);
```

## empezarForma

Comienza a almacenar vértices para una forma convexa.

## terminarForma

Termina de almacenar vértices para una forma convexa.

## empezarContorno

Comienza a almacenar vértices para un contorno.

No disponible en q5 WebGPU.

## terminarContorno

Termina de almacenar vértices para un contorno.

No disponible en q5 WebGPU.

## vértice

Especifica un vértice en una forma.

```
@param {number} x coordenada-x
@param {number} y coordenada-y
```

## vérticeBezier

Especifica un vértice Bezier en una forma.

```
@param {number} cp1x coordenada-x del primer punto de control
@param {number} cp1y coordenada-y del primer punto de control
@param {number} cp2x coordenada-x del segundo punto de control
@param {number} cp2y coordenada-y del segundo punto de control
@param {number} x coordenada-x del punto de anclaje
@param {number} y coordenada-y del punto de anclaje
```

## vérticeCuadrático

Especifica un vértice Bezier cuadrático en una forma.

```
@param {number} cp1x coordenada-x del punto de control
@param {number} cp1y coordenada-y del punto de control
@param {number} x coordenada-x del punto de anclaje
@param {number} y coordenada-y del punto de anclaje
```

## bezier

Dibuja una curva Bezier.

```
@param {number} x1 coordenada-x del primer punto de anclaje
@param {number} y1 coordenada-y del primer punto de anclaje
@param {number} x2 coordenada-x del primer punto de control
@param {number} y2 coordenada-y del primer punto de control
@param {number} x3 coordenada-x del segundo punto de control
@param {number} y3 coordenada-y del segundo punto de control
@param {number} x4 coordenada-x del segundo punto de anclaje
@param {number} y4 coordenada-y del segundo punto de anclaje
```

## triángulo

Dibuja un triángulo.

```
@param {number} x1 coordenada-x del primer vértice
@param {number} y1 coordenada-y del primer vértice
@param {number} x2 coordenada-x del segundo vértice
@param {number} y2 coordenada-y del segundo vértice
@param {number} x3 coordenada-x del tercer vértice
@param {number} y3 coordenada-y del tercer vértice
```

## quad

Dibuja un cuadrilátero.

```
@param {number} x1 coordenada-x del primer vértice
@param {number} y1 coordenada-y del primer vértice
@param {number} x2 coordenada-x del segundo vértice
@param {number} y2 coordenada-y del segundo vértice
@param {number} x3 coordenada-x del tercer vértice
@param {number} y3 coordenada-y del tercer vértice
@param {number} x4 coordenada-x del cuarto vértice
@param {number} y4 coordenada-y del cuarto vértice
```
