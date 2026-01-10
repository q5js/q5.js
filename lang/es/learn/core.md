# núcleo

Bienvenido al contenido de q5! 🤩

¿Primera vez programando? Revisa la [guía para principiantes de q5](https://github.com/q5js/q5.js/wiki/q5-Beginner's-Brief).

En estas páginas de "Aprender" puedes experimentar editando los mini ejemplos. ¡Diviértete! 😎

## Lienzo

Crea un elemento de lienzo, una sección de la pantalla donde tu programa
puede dibujar.

¡Ejecuta esta función para empezar a usar q5!

Ten en cuenta que en este ejemplo, el círculo se encuentra en la posición [0, 0], el origen del lienzo.

```
@param {number} [ancho] ancho del lienzo en píxeles
@param {number} [alto] alto del lienzo en píxeles
@param {object} [opciones] opciones para el contexto 2d
@return {Promise<HTMLCanvasElement>} una promesa que se resuelve con el elemento canvas creado
```

### webgpu

```js
// WebGPU
await Lienzo(200, 100);
fondo('silver');
círculo(0, 0, 80);
```

### c2d

```js
// Canvas2D
crearLienzo(200, 100);
fondo('silver');
círculo(0, 0, 80);
```

## dibujar

Función a declarar. Se ejecutará 60 veces por segundo de forma predeterminada. Tiene comportamiento de bucle, lo que permite hacer animaciones cuadro a cuadro.

### webgpu

```js
q5.dibujar = function () {
	fondo('silver');
	círculo(ratónX, ratónY, 80);
};
```

### c2d

```js
function dibujar() {
	fondo('silver');
	círculo(ratónX, ratónY, 80);
}
```

## log

Imprime un mensaje en la consola de JavaScript. Atajo para `console.log()`.

Para acceder a las herramientas del navegador (DevTools) generalmente es con click derecho + "inspeccionar", o presionando las teclas `ctrl + shift + i` o `command + option + i`. La consola se encuentra en la pestaña "console".

```
@param {any} mensaje a imprimir
```

### webgpu

```js
q5.dibujar = function () {
	círculo(ratónX, ratónY, 80);
	log('El ratón está en:', ratónX, ratónY);
};
```

### c2d

```js
function dibujar() {
	círculo(ratónX, ratónY, 80);
	log('El ratón está en:', ratónX, ratónY);
}
```
