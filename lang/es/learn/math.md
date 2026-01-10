# matemáticas

## aleatorio

Genera un valor aleatorio.

- Si no se proporcionan entradas, devuelve un número entre 0 y 1.
- Si se proporciona una entrada numérica, devuelve un número entre 0 y el valor proporcionado.
- Si se proporcionan dos entradas numéricas, devuelve un número entre los dos valores.
- Si se proporciona un array, devuelve un elemento aleatorio del array.

```
@param {number | any[]} [bajo] límite inferior (inclusivo) o un array
@param {number} [alto] límite superior (exclusivo)
@returns {number | any} un número o elemento aleatorio
```

### webgpu

```js
await Lienzo(200);
fondo(0.8);
frecuenciaRefresco(5);

q5.dibujar = function () {
	círculo(0, 0, aleatorio(200));
};
```

```js
q5.dibujar = function () {
	círculo(aleatorio(-100, 100), aleatorio(-100, 100), 10);
};
```

### c2d

```js
crearLienzo(200);
fondo(200);
frecuenciaRefresco(5);

function dibujar() {
	círculo(100, 100, aleatorio(20, 200));
}
```

```js
function dibujar() {
	círculo(aleatorio(200), aleatorio(200), 10);
}
```

## flu

Genera un número aleatorio dentro de un rango simétrico alrededor de cero.

Se puede usar para crear un efecto de fluctuación (desplazamiento aleatorio).

Equivalente a `aleatorio(-cantidad, cantidad)`.

```
@param {number} cantidad cantidad máxima absoluta de fluctuación, por defecto es 1
@returns {number} número aleatorio entre -val y val
```

### webgpu

```js
q5.dibujar = function () {
	círculo(ratónX + flu(3), ratónY + flu(3), 5);
};
```

```js
await Lienzo(200);

q5.dibujar = function () {
	círculo(flu(50), 0, aleatorio(50));
};
```

### c2d

```js
function dibujar() {
	círculo(ratónX + flu(3), ratónY + flu(3), 5);
}
```

```js
let q = await Q5.WebGPU();
crearLienzo(200, 100);

q.dibujar = () => {
	círculo(flu(50), 0, aleatorio(50));
};
```

## ruido

Genera un valor de ruido basado en las entradas x, y, y z.

Usa [Ruido Perlin](https://es.wikipedia.org/wiki/Ruido_Perlin) por defecto.

```
@param {number} [x] entrada coordenada-x
@param {number} [y] entrada coordenada-y
@param {number} [z] entrada coordenada-z
@returns {number} un valor de ruido
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	let n = ruido(frameCount * 0.01);
	círculo(0, 0, n * 200);
};
```

```js
q5.dibujar = function () {
	fondo(0.8);
	let t = (frameCount + ratónX) * 0.02;
	for (let x = -5; x < 220; x += 10) {
		let n = ruido(t, x * 0.1);
		círculo(x - 100, 0, n * 40);
	}
};
```

```js
q5.dibujar = function () {
	sinTrazo();
	let t = millis() * 0.002;
	for (let x = -100; x < 100; x += 5) {
		for (let y = -100; y < 100; y += 5) {
			relleno(ruido(t, (ratónX + x) * 0.05, y * 0.05));
			cuadrado(x, y, 5);
		}
	}
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	let n = ruido(frameCount * 0.01);
	círculo(100, 100, n * 200);
}
```

```js
function dibujar() {
	fondo(200);
	let t = (frameCount + ratónX) * 0.02;
	for (let x = -5; x < 220; x += 10) {
		let n = ruido(t, x * 0.1);
		círculo(x, 100, n * 40);
	}
}
```

## dist

Calcula la distancia entre dos puntos.

Esta función también acepta dos objetos con propiedades `x` e `y`.

```
@param {number} x1 coordenada-x del primer punto
@param {number} y1 coordenada-y del primer punto
@param {number} x2 coordenada-x del segundo punto
@param {number} y2 coordenada-y del segundo punto
@returns {number} distancia entre los puntos
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	línea(0, 0, ratónX, ratónY);

	let d = dist(0, 0, ratónX, ratónY);
	texto(redondear(d), -80, -80);
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	círculo(100, 100, 20);
	círculo(ratónX, ratónY, 20);

	let d = dist(100, 100, ratónX, ratónY);
	texto(redondear(d), 20, 20);
}
```

## mapa

Mapea un número de un rango a otro.

```
@param {number} val valor entrante a convertir
@param {number} inicio1 límite inferior del rango actual del valor
@param {number} fin1 límite superior del rango actual del valor
@param {number} inicio2 límite inferior del rango objetivo del valor
@param {number} fin2 límite superior del rango objetivo del valor
@returns {number} valor mapeado
```

## modoÁngulo

Establece el modo para interpretar y dibujar ángulos. Puede ser 'degrees' (grados) o 'radians' (radianes).

```
@param {'degrees' | 'radians'} modo modo a establecer para la interpretación de ángulos
```

## radianes

Convierte grados a radianes.

```
@param {number} grados ángulo en grados
@returns {number} ángulo en radianes
```

## grados

Convierte radianes a grados.

```
@param {number} radianes ángulo en radianes
@returns {number} ángulo en grados
```

## interpolar

Calcula un número entre dos números en un incremento específico.

```
@param {number} inicio primer número
@param {number} fin segundo número
@param {number} cant cantidad a interpolar entre los dos valores
@returns {number} número interpolado
```

## constreñir

Restringe un valor entre un valor mínimo y máximo.

```
@param {number} n número a restringir
@param {number} bajo límite inferior
@param {number} alto límite superior
@returns {number} valor restringido
```

## norm

Normaliza un número de otro rango en un valor entre 0 y 1.

```
@param {number} n número a normalizar
@param {number} inicio límite inferior del rango
@param {number} fin límite superior del rango
@returns {number} número normalizado
```

## frac

Calcula la parte fraccionaria de un número.

```
@param {number} n un número
@returns {number} parte fraccionaria del número
```

## abs

Calcula el valor absoluto de un número.

```
@param {number} n un número
@returns {number} valor absoluto del número
```

## redondear

Redondea un número.

```
@param {number} n número a redondear
@param {number} [d] número de lugares decimales a redondear
@returns {number} número redondeado
```

### webgpu

```js
await Lienzo(200, 100);
fondo(0.8);
tamañoTexto(32);
texto(redondear(PI, 5), -90, 10);
```

### c2d

```js
crearLienzo(200, 100);
fondo(200);
tamañoTexto(32);
texto(redondear(PI, 5), 10, 60);
```

## techo

Redondea un número hacia arriba.

```
@param {number} n un número
@returns {number} número redondeado
```

### webgpu

```js
await Lienzo(200, 100);
fondo(0.8);
tamañoTexto(32);
texto(techo(PI), -90, 10);
```

### c2d

```js
crearLienzo(200, 100);
fondo(200);
tamañoTexto(32);
texto(techo(PI), 10, 60);
```

## piso

Redondea un número hacia abajo.

```
@param {number} n un número
@returns {number} número redondeado
```

### webgpu

```js
await Lienzo(200, 100);
fondo(0.8);
tamañoTexto(32);
texto(piso(-PI), -90, 10);
```

### c2d

```js
crearLienzo(200, 100);
fondo(200);
tamañoTexto(32);
texto(piso(-PI), 10, 60);
```

## min

Devuelve el valor más pequeño en una secuencia de números.

```
@param {...number} args números a comparar
@returns {number} mínimo
```

### webgpu

```js
q5.dibujar = function () {
	fondo(min(-ratónX / 100, 0.5));
	círculo(min(ratónX, 0), 0, 80);
};
```

### c2d

```js
function dibujar() {
	fondo(min(ratónX, 100));
	círculo(min(ratónX, 100), 0, 80);
}
```

## max

Devuelve el valor más grande en una secuencia de números.

```
@param {...number} args números a comparar
@returns {number} máximo
```

### webgpu

```js
q5.dibujar = function () {
	fondo(max(-ratónX / 100, 0.5));
	círculo(max(ratónX, 0), 0, 80);
};
```

### c2d

```js
function dibujar() {
	fondo(max(ratónX, 100));
	círculo(max(ratónX, 100), 0, 80);
}
```

## pot

Calcula el valor de una base elevada a una potencia.

Por ejemplo, `pot(2, 3)` calcula 2 _ 2 _ 2 que es 8.

```
@param {number} base base
@param {number} exponente exponente
@returns {number} base elevada a la potencia del exponente
```

## cuad

Calcula el cuadrado de un número.

```
@param {number} n número a elevar al cuadrado
@returns {number} cuadrado del número
```

## raiz

Calcula la raíz cuadrada de un número.

```
@param {number} n un número
@returns {number} raíz cuadrada del número
```

## loge

Calcula el logaritmo natural (base e) de un número.

```
@param {number} n un número
@returns {number} logaritmo natural del número
```

## exp

Calcula e elevado a la potencia de un número.

```
@param {number} exponente potencia a la que elevar e
@returns {number} e elevado a la potencia del exponente
```

## semillaAleatoria

Establece la semilla para el generador de números aleatorios.

```
@param {number} semilla valor de la semilla
```

## generadorAleatorio

Establece el método de generación de números aleatorios.

```
@param {any} metodo método a usar para la generación de números aleatorios
```

## aleatorioGaussiano

Genera un número aleatorio siguiendo una distribución Gaussiana (normal).

```
@param {number} media media (centro) de la distribución
@param {number} std desviación estándar (dispersión o "ancho") de la distribución
@returns {number} un número aleatorio siguiendo una distribución Gaussiana
```

## aleatorioExponencial

Genera un número aleatorio siguiendo una distribución exponencial.

```
@returns {number} un número aleatorio siguiendo una distribución exponencial
```

## modoRuido

Establece el modo de generación de ruido.

Solo el modo por defecto, "perlin", está incluido en q5.js. El uso de los
otros modos requiere el módulo q5-noiser.

```
@param {'perlin' | 'simplex' | 'blocky'} modo modo de generación de ruido
```

## semillaRuido

Establece el valor de la semilla para la generación de ruido.

```
@param {number} semilla valor de la semilla
```

## detalleRuido

Establece el nivel de detalle para la generación de ruido.

```
@param {number} lod nivel de detalle (número de octavas)
@param {number} caida tasa de caída para cada octava
```

## DOS_PI

La relación de la circunferencia de un círculo a su diámetro.
Aproximadamente 3.14159.

## DOS_PI

2 \* PI.
Aproximadamente 6.28319.

## TAU

2 \* PI.
Aproximadamente 6.28319.

## MEDIO_PI

Mitad de PI.
Aproximadamente 1.5708.

## CUARTO_PI

Un cuarto de PI.
Aproximadamente 0.7854.
