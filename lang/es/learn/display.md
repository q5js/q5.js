# visualización

## modoVisualización

Personaliza cómo se presenta tu lienzo.

```
@param {string} modo NORMAL, CENTRO, o MAXIMIZADO
@param {string} calidadRenderizado SUAVE o PIXELADO
@param {number} escala también se puede dar como una cadena (por ejemplo "x2")
```

### webgpu

```js
await Lienzo(50, 25);

modoVisualización(CENTRO, PIXELADO, 4);

círculo(0, 0, 16);
```

### c2d

```js
crearLienzo(50, 25);

modoVisualización(CENTRO, PIXELADO, 4);

círculo(25, 12.5, 16);
```

## MAXIMIZADO

Una configuración de `modoVisualización`.

El lienzo se escalará para llenar el elemento padre,
con bandas negras si es necesario para preservar su relación de aspecto.

## SUAVE

Una calidad de renderizado de `modoVisualización`.

Se usa escalado suave si el lienzo se escala.

## PIXELADO

Una calidad de renderizado de `modoVisualización`.

Los píxeles se renderizan como cuadrados nítidos si el lienzo se escala.

## pantallaCompleta

Habilita o deshabilita el modo de pantalla completa.

```
@param {boolean} [v] booleano indicando si habilitar o deshabilitar el modo de pantalla completa
```

## anchoVentana

El ancho de la ventana.

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	tamañoTexto(64);
	alineaciónTexto(CENTRO, CENTRO);
	texto(anchoVentana, 0, 0);
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	tamañoTexto(64);
	alineaciónTexto(CENTRO, CENTRO);
	texto(anchoVentana, 100, 100);
}
```

## altoVentana

El alto de la ventana.

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	tamañoTexto(64);
	alineaciónTexto(CENTRO, CENTRO);
	texto(altoVentana, 0, 0);
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	tamañoTexto(64);
	alineaciónTexto(CENTRO, CENTRO);
	texto(altoVentana, 100, 100);
}
```

## ancho

El ancho del lienzo.

### webgpu

```js
await Lienzo(200, 120);
círculo(0, 0, ancho);
```

## alto

El alto del lienzo.

### webgpu

```js
await Lienzo(200, 80);
círculo(0, 0, alto);
```

## medioAncho

La mitad del ancho del lienzo.

### webgpu

```js
await Lienzo(200, 80);
círculo(0, 0, medioAncho);
```

## medioAlto

La mitad del alto del lienzo.

### webgpu

```js
await Lienzo(200, 80);
círculo(0, 0, medioAlto);
```

## lienzo

El elemento lienzo asociado con la instancia Q5.

Si no se crea un lienzo explícitamente con `crearLienzo()`, pero se define una función q5 como `dibujar` o `alPresionarRatón`, se creará automáticamente un lienzo por defecto de tamaño 200x200.

## redimensionarLienzo

Redimensiona el lienzo al ancho y alto especificados.

```
@param {number} w ancho del lienzo
@param {number} h alto del lienzo
```

### webgpu

```js
await Lienzo(200, 100);

q5.dibujar = function () {
	fondo(0.8);
};

q5.alPresionarRatón = function () {
	redimensionarLienzo(200, 200);
};
```

### c2d

```js
crearLienzo(200, 100);

function dibujar() {
	fondo(200);
}

function alPresionarRatón() {
	redimensionarLienzo(200, 200);
}
```

## cuadroActual

El número de cuadros que se han mostrado desde que comenzó el programa.

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	tamañoTexto(64);
	texto(cuadroActual, -92, 20);
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	tamañoTexto(64);
	texto(cuadroActual, 8, 120);
}
```

## pausar

Detiene el bucle de dibujo.

### webgpu

```js
q5.dibujar = function () {
	círculo(cuadroActual * 5 - 100, 0, 80);
	pausar();
};
```

### c2d

```js
function dibujar() {
	círculo(cuadroActual * 5, 100, 80);
	pausar();
}
```

## redibujar

Redibuja el lienzo n veces. Si no se proporciona ningún parámetro de entrada,
llama a la función de dibujo una vez.

Esta es una función asíncrona.

```
@param {number} [n] número de veces para redibujar el lienzo, por defecto es 1
```

### webgpu

```js
await Lienzo(200);
pausar();

q5.dibujar = function () {
	círculo(cuadroActual * 5 - 100, 0, 80);
};
q5.alPresionarRatón = function () {
	redibujar(10);
};
```

### c2d

```js
crearLienzo(200);
pausar();

function dibujar() {
	círculo(cuadroActual * 5, 100, 80);
}
function alPresionarRatón() {
	redibujar(10);
}
```

## reanudar

Inicia el bucle de dibujo de nuevo si estaba detenido.

### webgpu

```js
await Lienzo(200);
pausar();

q5.dibujar = function () {
	círculo(cuadroActual * 5 - 100, 0, 80);
};
q5.alPresionarRatón = function () {
	reanudar();
};
```

### c2d

```js
crearLienzo(200);
pausar();

function dibujar() {
	círculo(cuadroActual * 5, 100, 80);
}
function alPresionarRatón() {
	reanudar();
}
```

## frecuenciaRefresco

Establece la frecuencia de fotogramas objetivo u obtiene una aproximación de la
frecuencia de fotogramas actual del sketch.

Incluso cuando el sketch se está ejecutando a una frecuencia de fotogramas consistente,
el valor actual de la frecuencia de fotogramas fluctuará. Usa las herramientas de desarrollador
de tu navegador web para un análisis de rendimiento más preciso.

```
@param {number} [hertz] frecuencia de fotogramas objetivo, por defecto es 60
@returns {number} frecuencia de fotogramas actual
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);

	if (ratónPresionado) frecuenciaRefresco(10);
	else frecuenciaRefresco(60);

	círculo((cuadroActual % 200) - 100, 0, 80);
};
```

```js
q5.dibujar = function () {
	fondo(0.8);
	tamañoTexto(64);
	texto(redondear(frecuenciaRefresco()), -35, 20);
};
```

### c2d

```js
function dibujar() {
	fondo(200);

	if (ratónPresionado) frecuenciaRefresco(10);
	else frecuenciaRefresco(60);

	círculo(cuadroActual % 200, 100, 80);
}
```

```js
function dibujar() {
	fondo(200);
	tamañoTexto(64);
	texto(redondear(frecuenciaRefresco()), 65, 120);
}
```

## obtenerTasaFotogramasObjetivo

La frecuencia de fotogramas deseada del sketch.

```
@returns {number} frecuencia de fotogramas objetivo
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	tamañoTexto(64);

	texto(obtenerTasaFotogramasObjetivo(), -35, 20);
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	tamañoTexto(64);

	texto(obtenerTasaFotogramasObjetivo(), 65, 120);
}
```

## obtenerFPS

Obtiene los FPS actuales, en términos de cuántos fotogramas podrían generarse
en un segundo, lo cual puede ser más alto que la frecuencia de fotogramas objetivo.

Usa las herramientas de desarrollador de tu navegador web para un análisis
de rendimiento más profundo.

```
@returns {number} fotogramas por segundo
```

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	frecuenciaRefresco(1);
	tamañoTexto(64);

	texto(obtenerFPS(), -92, 20);
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	frecuenciaRefresco(1);
	tamañoTexto(64);

	texto(obtenerFPS(), 8, 120);
}
```

## postProcesar

Se ejecuta después de cada llamada a la función `dibujar` y procesos de addons de q5 post-dibujo, si los hay.

Útil para añadir efectos de post-procesamiento cuando no es posible
hacerlo al final de la función `dibujar`, como cuando se usan
addons como p5play que auto-dibujan al lienzo después de que
la función `dibujar` se ejecuta.

### c2d

```js
function dibujar() {
	fondo(200);
	círculo(cuadroActual % 200, 100, 80);
}

function postProcesar() {
	filtro(INVERTIR);
}
```

## densidadPíxeles

Establece la densidad de píxeles del lienzo.

```
@param {number} v valor de densidad de píxeles
@returns {number} densidad de píxeles
```

### webgpu

```js
await Lienzo(200, 100);
fondo(0.8);
densidadPíxeles(1);
círculo(0, 0, 80);
```

### c2d

```js
crearLienzo(200, 100);
fondo(200);
densidadPíxeles(1);
círculo(100, 50, 80);
```

## densidadVisualización

Devuelve la densidad de visualización actual.

En la mayoría de pantallas modernas, este valor será 2 o 3.

```
@returns {number} densidad de visualización
```

### webgpu

```js
await Lienzo(200, 100);
fondo(0.8);
tamañoTexto(64);
texto(densidadVisualización(), -90, 6);
```

### c2d

```js
crearLienzo(200, 100);
fondo(200);
tamañoTexto(64);
texto(densidadVisualización(), 10, 20);
```

## deltaTiempo

El tiempo pasado desde que se dibujó el último fotograma.

Con la frecuencia de fotogramas por defecto de 60, el tiempo delta será
aproximadamente 16.6

Se puede usar para mantener movimientos atados al tiempo real si el sketch
a menudo cae por debajo de la frecuencia de fotogramas objetivo. Aunque si las frecuencias
de fotogramas son consistentemente bajas, considera reducir la frecuencia
de fotogramas objetivo.

### webgpu

```js
q5.dibujar = function () {
	fondo(0.8);
	texto(deltaTiempo, -90, 6);
};
```

```js
let x = -100;
q5.dibujar = function () {
	fondo(0.8);
	// simular caídas de frecuencia de fotogramas
	frecuenciaRefresco(aleatorio(30, 60));

	x += deltaTiempo * 0.2;
	if (x > 100) x = -100;
	círculo(x, 0, 20);
};
```

### c2d

```js
function dibujar() {
	fondo(200);
	texto(deltaTiempo, 60, 106);
}
```

```js
let x = 0;
function dibujar() {
	fondo(200);
	// simular caídas de frecuencia de fotogramas
	frecuenciaRefresco(aleatorio(30, 60));

	x += deltaTiempo * 0.2;
	círculo(x % 200, 100, 20);
}
```

## contextoDibujo

El contexto de renderizado 2D para el lienzo, si se usa el renderizador
Canvas2D.
