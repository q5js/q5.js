# transformaciones

## trasladar

Traslada el origen del contexto de dibujo.

```
@param {number} x traslación a lo largo del eje x
@param {number} y traslación a lo largo del eje y
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);

	trasladar(50, 50);
	círculo(0, 0, 80);
};
```

### c2d

```js
function dibujar() {
	fondo(200);

	trasladar(150, 150);
	círculo(0, 0, 80);
}
```

## rotar

Rota el contexto de dibujo.

```
@param {number} angulo ángulo de rotación en radianes
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);

	rotar(ratónX / 50);

	modoRect(CENTER);
	cuadrado(0, 0, 120);
};
```

### c2d

```js
function dibujar() {
	fondo(200);

	trasladar(100, 100);
	rotar(ratónX / 50);

	modoRect(CENTER);
	cuadrado(0, 0, 50);
}
```

## escalar

Escala el contexto de dibujo.

Si solo se proporciona un parámetro de entrada,
el contexto de dibujo se escalará uniformemente.

```
@param {number} x factor de escala a lo largo del eje x
@param {number} [y] factor de escala a lo largo del eje y
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);

	escalar(ratónX / 10);
	círculo(0, 0, 20);
};
```

### c2d

```js
function dibujar() {
	fondo(200);

	escalar(ratónX / 10);
	círculo(0, 0, 20);
}
```

## cizallarX

Cizalla el contexto de dibujo a lo largo del eje x.

```
@param {number} angulo ángulo de cizallamiento en radianes
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);

	trasladar(-75, -40);
	cizallarX(ratónX / 100);
	cuadrado(0, 0, 80);
};
```

### c2d

```js
function dibujar() {
	fondo(200);

	trasladar(25, 60);
	cizallarX(ratónX / 100);
	cuadrado(0, 0, 80);
}
```

## cizallarY

Cizalla el contexto de dibujo a lo largo del eje y.

```
@param {number} angulo ángulo de cizallamiento en radianes
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);

	trasladar(-75, -40);
	cizallarY(ratónX / 100);
	cuadrado(0, 0, 80);
};
```

### c2d

```js
function dibujar() {
	fondo(200);

	trasladar(25, 60);
	cizallarY(ratónX / 100);
	cuadrado(0, 0, 80);
}
```

## aplicarMatriz

Aplica una matriz de transformación.

Acepta una matriz de 3x3 como un array o múltiples argumentos.

```
@param {number} a
@param {number} b
@param {number} c
@param {number} d
@param {number} e
@param {number} f
```

### webgpu

Ten en cuenta que en q5 WebGPU, la matriz de identidad (por defecto)
tiene una escala y negativa para voltear el eje y para coincidir con
el renderizador Canvas2D.

```js
q5.dibujar = function () {
	fondo(0.8);

	aplicarMatriz(2, -1, 1, -1);
	círculo(0, 0, 80);
};
```

### c2d

```js
function dibujar() {
	fondo(200);

	aplicarMatriz(2, 1, 1, 1, 100, 100);
	círculo(0, 0, 80);
}
```

## reiniciarMatriz

Reinicia la matriz de transformación.

q5 ejecuta esta función antes de cada vez que se ejecuta la función `dibujar`,
para que las transformaciones no se trasladen al siguiente fotograma.

### webgpu

```js
await Lienzo(200);
fondo(0.8);

trasladar(50, 50);
círculo(0, 0, 80);

reiniciarMatriz();
cuadrado(0, 0, 50);
```

### c2d

```js
crearLienzo(200);
fondo(200);

trasladar(100, 100);
círculo(0, 0, 80);

reiniciarMatriz();
cuadrado(0, 0, 50);
```

## guardarMatriz

Guarda la matriz de transformación actual.

### webgpu

```js
await Lienzo(200);
fondo(0.8);

guardarMatriz();
rotar(CUARTO_PI);
elipse(0, 0, 120, 40);
recuperarMatriz();

elipse(0, 0, 120, 40);
```

### c2d

```js
crearLienzo(200);
fondo(200);
trasladar(100, 100);

guardarMatriz();
rotar(CUARTO_PI);
elipse(0, 0, 120, 40);
recuperarMatriz();

elipse(0, 0, 120, 40);
```

## recuperarMatriz

Restaura la matriz de transformación guardada previamente.

### webgpu

```js
await Lienzo(200);
fondo(0.8);

guardarMatriz();
rotar(CUARTO_PI);
elipse(0, 0, 120, 40);
recuperarMatriz();

elipse(0, 0, 120, 40);
```

### c2d

```js
crearLienzo(200);
fondo(200);
trasladar(100, 100);

guardarMatriz();
rotar(CUARTO_PI);
elipse(0, 0, 120, 40);
recuperarMatriz();

elipse(0, 0, 120, 40);
```

## apilar

Guarda la configuración de estilo de dibujo y transformaciones actuales.

### webgpu

```js
await Lienzo(200);

apilar();
relleno('blue');
trasladar(50, 50);
círculo(0, 0, 80);
desapilar();

cuadrado(0, 0, 50);
```

### c2d

```js
crearLienzo(200);

apilar();
relleno('blue');
trasladar(100, 100);
círculo(0, 0, 80);
desapilar();

cuadrado(0, 0, 50);
```

## desapilar

Restaura la configuración de estilo de dibujo y transformaciones guardadas previamente.

### webgpu

```js
await Lienzo(200);

apilar();
relleno('blue');
trasladar(50, 50);
círculo(0, 0, 80);
desapilar();

cuadrado(0, 0, 50);
```

### c2d

```js
crearLienzo(200);

apilar();
relleno('blue');
trasladar(100, 100);
círculo(0, 0, 80);
desapilar();

cuadrado(0, 0, 50);
```
