# avanzado

## Q5.constructor

Funcion constructora. Crea una instancia de Q5.

```
@param {string | Function} [ambito]
	- "global": (por defecto) agrega las funciones y variables de q5 al ambito global
	- "namespace": no agrega las funciones ni variables de q5 al ambito global
@param {HTMLElement} [contenedor] elemento HTML dentro del cual se colocará el lienzo
```

### c2d

```js
let q = new Q5('namespace');
q.crearLienzo(200, 100);
q.circulo(100, 50, 20);
```

## Q5.version

La versión menor actual de q5.

```
@returns {string} la versión de q5
```

### webgpu

```js
await Lienzo(200);
fondo(0.8);
tamañoTexto(64);
alineaciónTexto(CENTRO, CENTRO);
texto('v' + Q5.version, 0, 0);
```

### python

```py
Lienzo(200)
fondo(0.8)
tamañoTexto(64)
alineaciónTexto(CENTRO, CENTRO)
texto('v' + Q5.version, 0, 0)
```

## Q5.addLang

Añadir traducciones de la API. Más información:
https://github.com/q5js/q5.js/wiki/Translations

## Q5.deshabilitarErroresAmigables

Desactiva los mensajes de error amigables de q5.

```
@default false
```

## Q5.toleranteErrores

Establecer en verdadero para mantener el bucle de dibujo después de un error.

```
@default false
```

## Q5.soportaHDR

Verdadero si el dispositivo soporta HDR (el espacio de color display-p3).

## Q5.opcionesLienzo

Establece los atributos de contexto de lienzo predeterminados utilizados para
lienzos recién creados y gráficos internos. Estas opciones son sobrescritas por
cualquier opción por lienzo que pases a `crearLienzo`.

```
@default { alpha: false, colorSpace: 'display-p3' }
```

## Q5.MAX_COLORES

El número máximo de colores de q5
(creados mediante llamadas a `color`, `fondo`, `relleno`, `trazo` y `teñir`)
que se pueden almacenar por fotograma con el renderizador WebGPU.

```
@default 250000
```

## Q5.MAX_RECTANGULOS

El número máximo de rectángulos
(llamadas a `rect`, `cuadrado` y `cápsula`)
que se pueden dibujar por fotograma con el renderizador WebGPU.

```
@default 200200
```

## Q5.MAX_ELIPSES

El número máximo de elipses
(llamadas a `elipse`, `círculo` y `arco`)
que se pueden dibujar por fotograma con el renderizador WebGPU.

```
@default 200200
```

## Q5.MAX_CARACTERES

El número máximo de caracteres de texto
que se pueden dibujar por fotograma con el renderizador WebGPU.

```
@default 100000
```

## Q5.MAX_TEXTOS

El número máximo de llamadas independientes a `texto`
que se pueden dibujar por fotograma con el renderizador WebGPU.

```
@default 10000
```

## Q5.MAX_TRANSFORMACIONES

El número máximo de matrices de transformación
que se pueden usar por fotograma con el renderizador WebGPU. De forma predeterminada, se establece para usar todo el límite de 128 MB de `maxStorageBufferBindingSize`.
https://developer.mozilla.org/docs/Web/API/GPUSupportedLimits

```
@default 2097152
```

## Q5.MAX_IMAGENES

El número máximo de imágenes (llamadas a `imagen` e `imagenTexto`)
que se pueden dibujar por fotograma con el renderizador WebGPU.

```
@default 350000
```

## Q5.MAX_VERTICES_FORMAS

El número máximo de vértices en las formas
(creados mediante llamadas a `terminarForma`,
`triángulo`, `quad`, `curva` y `bezier`)
que se pueden usar por fotograma con el renderizador WebGPU.

```
@default 350000
```

## Q5.WebGPU

Crea una nueva instancia de Q5 que usa el [renderizador WebGPU de q5](https://github.com/q5js/q5.js/wiki/q5-WebGPU-renderer).

### webgpu

```js
let q = await Q5.WebGPU('namespace');
q.crearLienzo(200, 100);

q.dibujar = () => {
	q.fondo(0.8);
	q.circulo(q.ratonX, 0, 80);
};
```

### python

```py
q = await Q5.WebGPU('namespace')
q.crearLienzo(200, 100)

def q_dibujar():
	q.fondo(0.8)
	q.circulo(q.ratonX, 0, 80)

q.dibujar = q_dibujar
```

## Q5.addHook

Los addons pueden aumentar q5 con nueva funcionalidad agregando hooks,
funciones que se ejecutan en fases específicas del ciclo de vida de q5.

Dentro de la función, `this` se refiere a la instancia de Q5.

```
@param {string} lifecycle 'init', 'presetup', 'postsetup', 'predraw', 'postdraw', o 'remove'
@param {Function} fn La función que se ejecutará en la fase del ciclo de vida especificada.
```

## Q5.registerAddon

Forma compatible con p5.js v2 de registrar un addon con q5.

```
@param {Function} addon Una función que recibe `Q5`, `Q5.prototype`, y un objeto `lifecycles`.
```

## Q5.modulos

Un objeto que contiene los módulos de q5, funciones que se ejecutan cuando q5 carga.

Cada función recibe dos parámetros de entrada:

- la instancia de q5
- un proxy para editar la instancia de q5 y las propiedades correspondientes del ámbito global

## Q5.dibujar

La función de dibujo de q5 se ejecuta 60 veces por segundo por defecto.

## Q5.postProcesar

Se ejecuta después de cada llamada a la función `dibujar` y procesos de addons de q5 post-dibujo, si los hay.

Útil para agregar efectos de post-procesamiento cuando no es posible
hacerlo al final de la función `dibujar`, como cuando se usan
addons como q5play que dibujan automáticamente al lienzo después de que
la función `dibujar` se ejecuta.

## q5

Alias para `Q5`.
