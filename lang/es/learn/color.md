# color

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
	círculo(mouseX, mouseY, 20);
};
```
