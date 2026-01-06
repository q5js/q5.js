# color

## color

Crea un nuevo objeto `Color`, el cual es útil principalmente para almacenar
un color que tu sketch reutilizará o modificará más tarde.

Con el modo de color por defecto, RGB, los colores tienen componentes `r`/`red` (rojo), `g`/`green` (verde),
`b`/`blue` (azul), y `a`/`alpha` (alfa).

Las funciones [`relleno`](https://q5js.org/learn/#fill), [`trazo`](https://q5js.org/learn/#stroke), y [`fondo`](https://q5js.org/learn/#background)
aceptan la misma amplia gama de representaciones de color que esta función.

```
@param {string | number | Color | number[]} c0 color o primer componente de color
@param {number} [c1] segundo componente de color
@param {number} [c2] tercer componente de color
@param {number} [c3] cuarto componente de color (alfa)
@returns {Color} un nuevo objeto `Color`
```

### webgpu

El formato de color por defecto es "flotante" ("float"), así que
establece los componentes de color a valores entre 0 y 1.

Aquí hay algunos ejemplos de uso válido:

- `color(1)` (escala de grises)
- `color(1, 0.8)` (escala de grises, alfa)
- `color(1, 0, 0)` (r, g, b)
- `color(1, 0, 0, 0.1)` (r, g, b, a)
- `color('red')` (nombre de color)
- `color('#ff0000')` (color hex)
- `color([1, 0, 0])` (componentes de color)

```js
await crearLienzo(200);
rect(-100, -100, 100, 200);

//                ( r,   g,   b,   a)
let botella = color(0.35, 0.39, 1, 0.4);
relleno(botella);
trazo(botella);
grosorTrazo(30);
círculo(0, 0, 155);
```

```js
await crearLienzo(200);
//          (gris, alfa)
let c = color(0.8, 0.2);

q5.dibujar = function () {
	fondo(c);
	círculo(ratónX, ratónY, 50);
	c.g = (c.g + 0.005) % 1;
};
```

```js
await crearLienzo(200);

//           (r, g, b,   a)
let c = color(0, 1, 1, 0.2);

q5.dibujar = function () {
	relleno(c);
	círculo(ratónX, ratónY, 50);
};
```

### c2d

El formato de color por defecto es "entero" ("integer"),
así que establece componentes a valores entre 0 y 255.

Aquí hay algunos ejemplos de uso válido:

- `color(255)` (escala de grises)
- `color(255, 200)` (escala de grises, alfa)
- `color(255, 0, 0)` (r, g, b)
- `color(255, 0, 0, 10)` (r, g, b, a)
- `color('red')` (nombre de color)
- `color('#ff0000')` (color hex)
- `color([255, 0, 0])` (componentes de color)

```js
crearLienzo(200);
rect(0, 0, 100, 200);

//                ( r,   g,   b,   a)
let botella = color(90, 100, 255, 100);
relleno(botella);
trazo(botella);
grosorTrazo(30);
círculo(100, 100, 155);
```

```js
crearLienzo(200);
//          (gris, alfa)
let c = color(200, 50);

function dibujar() {
	fondo(c);
	círculo(ratónX, ratónY, 50);
	c.g = (c.g + 1) % 256;
}
```

```js
crearLienzo(200);

//           (r,   g,   b,  a)
let c = color(0, 255, 255, 50);

function dibujar() {
	relleno(c);
	círculo(ratónX, ratónY, 50);
}
```

## modoColor

Establece el modo de color para el sketch, lo cual cambia cómo se
interpretan y muestran los colores.

La gama de color es 'display-p3' por defecto, si el dispositivo soporta HDR.

```
@param {'rgb' | 'oklch' | 'hsl' | 'hsb'} modo modo de color
@param {1 | 255} formato formato de color (1 para flotante, 255 para entero)
@param {'srgb' | 'display-p3'} [gama] gama de color
```

### webgpu

El modo de color por defecto es RGB en formato flotante.

```js
await crearLienzo(200);

modoColor(RGB, 1);
relleno(1, 0, 0);
rect(-100, -100, 66, 200);
relleno(0, 1, 0);
rect(-34, -100, 67, 200);
relleno(0, 0, 1);
rect(33, -100, 67, 200);
```

```js
await crearLienzo(200);

modoColor(OKLCH);

relleno(0.25, 0.15, 0);
rect(-100, -100, 100, 200);

relleno(0.75, 0.15, 0);
rect(0, -100, 100, 200);
```

### c2d

El modo de color por defecto es RGB en formato entero legado.

```js
crearLienzo(200);

modoColor(RGB, 1);
relleno(1, 0, 0);
rect(0, 0, 66, 200);
relleno(0, 1, 0);
rect(66, 0, 67, 200);
relleno(0, 0, 1);
rect(133, 0, 67, 200);
```

```js
crearLienzo(200);

modoColor(OKLCH);

relleno(0.25, 0.15, 0);
rect(0, 0, 100, 200);

relleno(0.75, 0.15, 0);
rect(100, 0, 100, 200);
```

## RGB

Los colores RGB tienen componentes `r`/`red` (rojo), `g`/`green` (verde), `b`/`blue` (azul),
y `a`/`alpha` (alfa).

Por defecto cuando un lienzo está usando el espacio de color HDR "display-p3",
los colores rgb son mapeados a la gama completa P3, incluso cuando usan el
formato entero legado 0-255.

### webgpu

```js
await crearLienzo(200, 100);

modoColor(RGB);

fondo(1, 0, 0);
```

### c2d

```js
crearLienzo(200, 100);

modoColor(RGB);

fondo(255, 0, 0);
```

## OKLCH

Los colores OKLCH tienen componentes `l`/`lightness` (luminosidad), `c`/`chroma` (croma),
`h`/`hue` (tono), y `a`/`alpha` (alfa). Es más intuitivo para los humanos
trabajar con color en estos términos que con RGB.

OKLCH es perceptualmente uniforme, lo que significa que los colores con la
misma luminosidad y croma (colorido) parecerán tener
igual luminancia, independientemente del tono.

OKLCH puede representar con precisión todos los colores visibles para el
ojo humano, a diferencia de muchos otros espacios de color que están limitados
a una gama. Los valores máximos de luminosidad y croma que
corresponden a los límites de la gama sRGB o P3 varían dependiendo del
tono. Los colores que están fuera de la gama serán recortados al
color dentro de la gama más cercano.

Usa el [selector de color OKLCH](https://oklch.com) para encontrar
colores dentro de la gama.

- `lightness`: 0 a 1
- `chroma`: 0 a ~0.4
- `hue`: 0 a 360
- `alpha`: 0 a 1

### webgpu

```js
await crearLienzo(200, 100);

modoColor(OKLCH);

fondo(0.64, 0.3, 30);
```

```js
await crearLienzo(200);
modoColor(OKLCH);

q5.dibujar = function () {
	fondo(0.7, 0.16, cuadroActual % 360);
};
```

### c2d

```js
crearLienzo(200, 100);

modoColor(OKLCH);

fondo(0.64, 0.3, 30);
```

```js
crearLienzo(200);
modoColor(OKLCH);

function dibujar() {
	fondo(0.7, 0.16, cuadroActual % 360);
}
```

## HSL

Los colores HSL tienen componentes `h`/`hue` (tono), `s`/`saturation` (saturación),
`l`/`lightness` (luminosidad), y `a`/`alpha` (alfa).

HSL fue creado en la década de 1970 para aproximar la percepción humana
del color, intercambiando precisión por cálculos más simples. No es
perceptualmente uniforme, por lo que colores con la misma luminosidad
pueden parecer más oscuros o más claros, dependiendo de su tono
y saturación. Sin embargo, los valores de luminosidad y saturación que
corresponden a los límites de la gama siempre son 100, independientemente del
tono. Esto puede hacer que HSL sea más fácil de trabajar que OKLCH.

Los colores HSL son mapeados a la gama completa P3 cuando
se usa el espacio de color "display-p3".

- `hue`: 0 a 360
- `saturation`: 0 a 100
- `lightness`: 0 a 100
- `alpha`: 0 a 1

### webgpu

```js
await crearLienzo(200, 100);

modoColor(HSL);

fondo(0, 100, 50);
```

```js
await crearLienzo(200, 220);
sinTrazo();

modoColor(HSL);
for (let h = 0; h < 360; h += 10) {
	for (let l = 0; l <= 100; l += 10) {
		relleno(h, 100, l);
		rect(h * (11 / 20) - 100, l * 2 - 110, 6, 20);
	}
}
```

### c2d

```js
crearLienzo(200, 100);

modoColor(HSL);

fondo(0, 100, 50);
```

```js
crearLienzo(200, 220);
sinTrazo();

modoColor(HSL);
for (let h = 0; h < 360; h += 10) {
	for (let l = 0; l <= 100; l += 10) {
		relleno(h, 100, l);
		rect(h * (11 / 20), l * 2, 6, 20);
	}
}
```

## HSB

Los colores HSB tienen componentes `h`/`hue` (tono), `s`/`saturation` (saturación),
`b`/`brightness` (brillo) (también conocido como `v`/`value` (valor)), y `a`/`alpha` (alfa).

HSB es similar a HSL, pero en lugar de luminosidad
(negro a blanco), usa brillo (negro a
color completo). Para producir blanco, establece el brillo
a 100 y la saturación a 0.

- `hue`: 0 a 360
- `saturation`: 0 a 100
- `brightness`: 0 a 100
- `alpha`: 0 a 1

### webgpu

```js
await crearLienzo(200, 100);

modoColor(HSB);

fondo(0, 100, 100);
```

```js
await crearLienzo(200, 220);
sinTrazo();

modoColor(HSB);
for (let h = 0; h < 360; h += 10) {
	for (let b = 0; b <= 100; b += 10) {
		relleno(h, 100, b);
		rect(h * (11 / 20) - 100, b * 2 - 110, 6, 20);
	}
}
```

### c2d

```js
crearLienzo(200, 100);

modoColor(HSB);

fondo(0, 100, 100);
```

```js
crearLienzo(200, 220);
sinTrazo();

modoColor(HSB);
for (let h = 0; h < 360; h += 10) {
	for (let b = 0; b <= 100; b += 10) {
		relleno(h, 100, b);
		rect(h * (11 / 20), b * 2, 6, 20);
	}
}
```

## SRGB

Limita la gama de color al espacio de color sRGB.

Si tu pantalla es capaz de HDR, nota que el rojo completo aparece
menos saturado y oscuro en este ejemplo, como lo haría en
una pantalla SDR.

### webgpu

```js
await crearLienzo(200, 100);

modoColor(RGB, 1, SRGB);

fondo(1, 0, 0);
```

### c2d

```js
crearLienzo(200, 100);

modoColor(RGB, 255, SRGB);

fondo(255, 0, 0);
```

## DISPLAY_P3

Expande la gama de color al espacio de color P3.

Esta es la gama de color por defecto en dispositivos que soportan HDR.

Si tu pantalla es capaz de HDR, nota que el rojo completo aparece
totalmente saturado y brillante en el siguiente ejemplo.

### webgpu

```js
await crearLienzo(200, 100);

modoColor(RGB, 1, DISPLAY_P3);

fondo(1, 0, 0);
```

### c2d

```js
crearLienzo(200, 100);

modoColor(RGB, 255, DISPLAY_P3);

fondo(255, 0, 0);
```

## fondo

Dibuja sobre todo el lienzo con un color o una imagen.

Al igual que la función [`color`](https://q5js.org/learn/#color),
esta función puede aceptar colores en una amplia gama de formatos:
cadena de color CSS, valor de escala de grises y valores de componentes de color.

```
@param {Color | Q5.Image} relleno un color o una imagen para dibujar
```

### webgpu

```js
await crearLienzo(200, 100);
fondo('crimson');
```

```js
q5.dibujar = function () {
	fondo(0.5, 0.2);
	círculo(ratónX, ratónY, 20);
};
```

### c2d

```js
crearLienzo(200, 100);
fondo('crimson');
```

```js
function dibujar() {
	fondo(128, 32);
	círculo(ratónX, ratónY, 20);
}
```

## Color.constructor

Este constructor acepta estrictamente 4 números, que son los componentes del color.

Usa la función `color` para mayor flexibilidad, ejecuta
este constructor internamente.

`Color` no es realmente una clase en si misma, es una referencia a una
clase de color Q5 basada en el modo de color, formato y gama.

## Color.igual

Comprueba si este color es exactamente igual a otro color.

## Color.esMismoColor

Comprueba si el color es el mismo que otro color,
ignorando sus valores alfa.

## Color.toString

Produce una representación de cadena de color CSS.

## Color.niveles

Un array de los componentes del color.
