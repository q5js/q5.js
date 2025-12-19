# display

## anchoVentana

El ancho de la ventana (cantidad de píxeles). Atajo para `window.innerWidth`.

## altoVentana

El alto de la ventana (cantidad de píxeles). Atajo para `window.innerHeight`.

## cuadroActual

Número del cuadro actual, es decir, la cantidad de cuadros que se han dibujado desde que se inició el sketch.

## pausar

Detiene el bucle de dibujo.

## redibujar

Dibuja el lienzo `n` veces. Si no recibe parametro, se dibuja una sola vez. Útil para controlar animaciones con el bucle pausado.

```
@param {number} [n] cantidad de veces que se volverá a dibujar el lienzo, por defecto es 1
```

## reanudar

Vuelve a activar el bucle de dibujo en caso de que estuviera pausado.

## frecuenciaRefresco

Si recibe un parámetro, establece la cantidad ideal de cuadros que se intentarán dibujar por cada segundo (es decir, la tasa de refresco, la frecuencia del bucle).

Retorna la frecuencia real alcanzada durante el último segundo de ejecución. Incluso si nunca se modifica explícitamente la frecuencia, el valor real suele fluctuar entre el ideal y 0. Para un mejor análisis del rendimiento usar las herramientas del navegador (DevTools).

```
@param `hz` {number} [frecuencia] cantidad ideal de cuadros a dibujar en un segundo, por defecto es 60
@returns {number} frecuencia real del bucle en el último segundo
```

## frecuenciaIdeal

Retorna la cantidad ideal de cuadros que se intentan dibujar por segundo.

```
@retunrs {number} cantidad ideal de fotogramas por segundo
```

## frecuenciaMaxima

Retorna la cantidad maxima de cuadros que se podrían estar dibujando en cada segundo.

Es un valor teórico que depende del estado del dispositivo. Para un mejor análisis del rendimiento usar las herramientas del navegador (DevTools).

```
@returns {number} cantidad máxima teorica de cuadros por segundo
```

## retocarDibujo

Funcion a declarar. Se ejecuta después de cada llamada a `dibujar` y de los `hooks de dibujo`, pero antes de dibujar realmente el lienzo.

Útil para agregar efectos finales cuando es difícil hacerlo en la función de dibujo. Por ejemplo, al usar extensiones como p5play que dibujan capas superpuestas al lienzo.

## ultimoTiempo

Milisegundos que han pasado desde el último cuadro dibujado. Con la frecuencia por defecto a 60 hz, el tiempo aproximado es 16.6 ms o mas.

Útil para mantener las animaciones sincronizadas con precisión, sobretodo si existen momentos en que la ejecución se ralentiza por sobrecarga del dispositivo. En casos en que la frecuencia real del bucle sea considerablemente mas baja, es recomendable reducir la frecuencia ideal.
