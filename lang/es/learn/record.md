# record

## crearGrabadora

Crea una grabadora. ¡Simplemente presiona grabar para empezar a grabar!

Las siguientes propiedades se pueden establecer a través de la UI de la grabadora o
programáticamente.

- `format` se establece a "H.264" por defecto.
- `bitrate` es un número en megabits por segundo (mbps). Su valor por defecto
  está determinado por la altura del lienzo. Aumentar la
  tasa de bits aumentará la calidad y el tamaño del archivo de la grabación.
- `captureAudio` se establece a true por defecto. Establecer a false para deshabilitar
  la grabación de audio.

Ten en cuenta que las grabaciones se hacen a una tasa de fotogramas variable (VFR), lo que
hace que el video de salida sea incompatible con algún software de edición.
Para más información, mira la página wiki
["Recording the Canvas"](https://github.com/q5js/q5.js/wiki/Recording-the-Canvas).

```
@returns {HTMLElement} una grabadora, elemento DOM de q5
```

### webgpu

```js
await crearLienzo(200);

let grab = crearGrabadora();
grab.bitrate = 10;

q5.dibujar = function () {
	círculo(ratónX, flu(medioAlto), 10);
};
```

### c2d

```js
crearLienzo(200);

let grab = crearGrabadora();
grab.bitrate = 10;

function dibujar() {
	círculo(ratónX, aleatorio(alto), 10);
}
```

## grabar

Comienza a grabar el lienzo o reanuda la grabación si estaba pausada.

Si no existe grabadora, se crea una pero no se muestra.

## pausarGrabación

Pausa la grabación del lienzo, si hay una en progreso.

## borrarGrabación

Descarta la grabación actual.

## guardarGrabación

Guarda la grabación actual como un archivo de video.

```
@param {string} nombreArchivo
```

### webgpu

```js
q5.dibujar = function () {
	cuadrado(ratónX, flu(100), 10);
};

q5.alPresionarRatón = function () {
	if (!grabando) grabar();
	else guardarGrabación('squares');
};
```

### c2d

```js
function dibujar() {
	cuadrado(ratónX, aleatorio(200), 10);
}

function alPresionarRatón() {
	if (!grabando) grabar();
	else guardarGrabación('squares');
}
```

## grabando

Verdadero si el lienzo está siendo grabado actualmente.
