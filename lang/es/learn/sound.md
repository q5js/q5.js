# sonido

q5 incluye reproducción de sonido de baja latencia y capacidades básicas de mezcla
impulsadas por WebAudio.

Para filtrado de audio, síntesis y análisis, considera usar el
addon [p5.sound](https://p5js.org/reference/p5.sound/) con q5.

## cargarSonido

Carga datos de audio desde un archivo y devuelve un objeto `Sonido`.

Usa funciones como `reproducir`, `pausar`, y `detener` para
controlar la reproducción. ¡Ten en cuenta que los sonidos solo pueden reproducirse después de la
primera interacción del usuario con la página!

Establece `volumen` a un valor entre 0 (silencio) y 1 (volumen completo).
Establece `pan` a un valor entre -1 (izquierda) y 1 (derecha) para ajustar
la posición estéreo del sonido. Establece `bucle` a true para repetir el sonido.

Usa `cargado`, `pausado`, y `terminado` para comprobar el estado del sonido.

El archivo de sonido completo debe cargarse antes de que la reproducción pueda comenzar, usa `await` para esperar a que un sonido se cargue. Para transmitir archivos de audio más grandes usa la función `cargarAudio` en su lugar.

```
@param {string} url archivo de sonido
@returns {Sonido & PromiseLike<Sonido>} sonido
```

### webgpu

```js
await crearLienzo(200);

let sonido = cargarSonido('/assets/jump.wav');
sonido.volumen = 0.3;

q5.alPresionarRatón = function () {
	sonido.reproducir();
};
```

### c2d

```js
crearLienzo(200);

let sonido = cargarSonido('/assets/jump.wav');
sonido.volumen = 0.3;

function alPresionarRatón() {
	sonido.reproducir();
}
```

## cargarAudio

Carga datos de audio desde un archivo y devuelve un [HTMLAudioElement](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement).

El audio se considera cargado cuando se dispara el [evento canplaythrough](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event).

¡Ten en cuenta que el audio solo puede reproducirse después de la primera interacción
del usuario con la página!

```
@param url archivo de audio
@returns {HTMLAudioElement & PromiseLike<HTMLAudioElement>} un HTMLAudioElement
```

### webgpu

```js
await crearLienzo(200);

let audio = cargarAudio('/assets/retro.flac');
audio.volume = 0.4;

q5.alPresionarRatón = function () {
	audio.play();
};
```

### c2d

```js
crearLienzo(200);

let audio = cargarAudio('/assets/retro.flac');
audio.volume = 0.4;

function alPresionarRatón() {
	audio.play();
}
```

## obtenerContextoAudio

Devuelve el AudioContext en uso o undefined si no existe.

```
@returns {AudioContext} instancia de AudioContext
```

## iniciarAudioUsuario

Crea un nuevo AudioContext o lo reanuda si estaba suspendido.

```
@returns {Promise<void>} una promesa que se resuelve cuando el AudioContext se reanuda
```

## Sonido.constructor

Crea un nuevo objeto `Q5.Sonido`.

## Sonido.volumen

Establece el volumen del sonido a un valor entre
0 (silencio) y 1 (volumen completo).

## Sonido.pan

Establece la posición estéreo del sonido entre -1 (izquierda) y 1 (derecha).

## Sonido.bucle

Establece a true para hacer que el sonido se repita continuamente.

## Sonido.cargado

Verdadero si los datos de sonido han terminado de cargarse.

## Sonido.pausado

Verdadero si el sonido está actualmente pausado.

## Sonido.terminado

Verdadero si el sonido ha terminado de reproducirse.

## Sonido.reproducir

Reproduce el sonido.

Si esta función se ejecuta cuando el sonido ya se está reproduciendo,
comenzará una nueva reproducción, causando un efecto de capas.

Si esta función se ejecuta cuando el sonido está pausado,
todas las instancias de reproducción se reanudarán.

Usa `await` para esperar a que el sonido termine de reproducirse.

```
@returns {Promise<void>} una promesa que se resuelve cuando el sonido termina de reproducirse
```

## Sonido.pausar

Pausa el sonido, permitiendo que sea reanudado.

## Sonido.detener

Detiene el sonido, reiniciando su posición de reproducción
al principio.

Elimina todas las instancias de reproducción.
