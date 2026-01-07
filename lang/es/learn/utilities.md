# utilidades

## cargar

Carga un archivo o múltiples archivos.

El tipo de archivo se determina por la extensión del archivo. q5 soporta cargar
archivos de texto, json, csv, fuente, audio, e imagen.

Por defecto, los recursos se cargan en paralelo antes de que q5 ejecute `dibujar`. Usa `await` para esperar a que los recursos se carguen.

```
@param {...string} urls
@returns {Promise<any[]>} una promesa que se resuelve con objetos
```

### webgpu

```js
await crearLienzo(200);

let logo = cargar('/q5js_logo.avif');

q5.dibujar = function () {
	imagen(logo, -100, -100, 200, 200);
};
```

```js
await crearLienzo(200);
fondo(0.8);

await cargar('/assets/Robotica.ttf');

tamañoTexto(28);
texto('Hello, world!', -97, 100);
```

```js
await crearLienzo(200);

let [salto, retro] = await cargar('/assets/jump.wav', '/assets/retro.flac');

q5.alPresionarRatón = function () {
	botónRatón == 'left' ? salto.reproducir() : retro.reproducir();
};
```

```js
await crearLienzo(200);
fondo(0.8);
tamañoTexto(32);

let miXML = await cargar('/assets/animals.xml');
let mamiferos = miXML.getElementsByTagName('mammal');
let y = -100;
for (let mamifero of mamiferos) {
	texto(mamifero.textContent, -100, (y += 32));
}
```

### c2d

```js
crearLienzo(200);
let logo = cargar('/q5js_logo.avif');

function dibujar() {
	imagen(logo, 0, 0, 200, 200);
}
```

## guardar

Guarda datos en un archivo.

Si no se especifican datos, se guardará el lienzo.

Si no se proporcionan argumentos, el lienzo se guardará como
un archivo de imagen llamado "untitled.png".

```
@param {object} [datos] lienzo, imagen, u objeto JS
@param {string} [nombreArchivo] nombre de archivo para guardar como
```

### webgpu

```js
await crearLienzo(200);
fondo(0.8);
círculo(0, 0, 50);

q5.alPresionarRatón = function () {
	guardar('circle.png');
};
```

```js
await crearLienzo(200);
fondo(0.8);
texto('save me?', -90, 0);
tamañoTexto(180);
let rayo = crearImagenTexto('⚡️');

q5.alPresionarRatón = function () {
	guardar(rayo, 'bolt.png');
};
```

### c2d

```js
crearLienzo(200);
fondo(200);
círculo(100, 100, 50);

function alPresionarRatón() {
	guardar('circle.png');
}
```

```js
crearLienzo(200);

tamañoTexto(180);
let rayo = crearImagenTexto('⚡️');
imagen(rayo, 16, -56);

function alPresionarRatón() {
	guardar(rayo, 'bolt.png');
}
```

## cargarTexto

Carga un archivo de texto desde la url especificada.

Se recomienda usar `await` para obtener el texto cargado como una cadena.

```
@param {string} url archivo de texto
@returns {object & PromiseLike<string>} un objeto conteniendo el texto cargado en la propiedad `obj.text` o usa `await` para obtener la cadena de texto directamente
```

## cargarJSON

Carga un archivo JSON desde la url especificada.

Se recomienda usar `await` para obtener el objeto o array JSON cargado.

```
@param {string} url archivo JSON
@returns {any & PromiseLike<any>} un objeto o array conteniendo el JSON cargado
```

## cargarCSV

Carga un archivo CSV desde la url especificada.

Se recomienda usar `await` para obtener el CSV cargado como un array de objetos.

```
@param {string} url archivo CSV
@returns {object[] & PromiseLike<object[]>} un array de objetos conteniendo el CSV cargado
```

## cargarXML

Carga un archivo xml desde la url especificada.

Se recomienda usar `await` para obtener el Elemento XML cargado.

```
@param {string} url archivo xml
@returns {Element & PromiseLike<Element>} un objeto conteniendo el Elemento XML cargado en una propiedad llamada `obj.DOM` o usa await para obtener el Elemento XML directamente
```

### webgpu

```js
await crearLienzo(200);
fondo(200);
tamañoTexto(32);

let animales = await cargarXML('/assets/animals.xml');

let mamiferos = animales.getElementsByTagName('mammal');
let y = 64;
for (let mamifero of mamiferos) {
	texto(mamifero.textContent, 20, (y += 32));
}
```

## cargarTodo

Espera a que cualquier recurso que comenzó a cargarse termine de cargarse. Por defecto q5 ejecuta esto antes de hacer bucle en dibujar (lo cual se llama precarga), pero se puede usar incluso después de que dibujar comience a hacer bucle.

```
@returns {PromiseLike<any[]>} una promesa que se resuelve con objetos cargados
```

## deshabilitarPrecarga

Deshabilita la precarga automática de recursos antes de que dibujar comience a hacer bucle. Esto permite que dibujar comience inmediatamente, y los recursos se pueden cargar perezosamente o se puede usar `cargarTodo()` para esperar a que los recursos terminen de cargarse más tarde.

## nf

nf es la abreviatura de formato de número. Formatea un número
a una cadena con un número especificado de dígitos.

```
@param {number} num número a formatear
@param {number} digitos número de dígitos a formatear
@returns {string} número formateado
```

### webgpu

```js
await crearLienzo(200, 100);
fondo(0.8);

tamañoTexto(32);
texto(nf(PI, 4, 5), -90, 10);
```

## barajar

Baraja los elementos de un array.

```
@param {any[]} arr array a barajar
@param {boolean} [modificar] si modificar el array original, falso por defecto lo cual copia el array antes de barajar
@returns {any[]} array barajado
```

## guardarItem

Almacena un ítem en localStorage.

```
@param {string} clave clave bajo la cual almacenar el ítem
@param {string} val valor a almacenar
```

## obtenerItem

Recupera un ítem de localStorage.

```
@param {string} clave clave del ítem a recuperar
@returns {string} valor del ítem recuperado
```

## eliminarItem

Elimina un ítem de localStorage.

```
@param {string} clave clave del ítem a eliminar
```

## limpiarAlmacenamiento

Limpia todos los ítems de localStorage.

## año

Devuelve el año actual.

```
@returns {number} año actual
```

## día

Devuelve el día actual del mes.

```
@returns {number} día actual
```

## hora

Devuelve la hora actual.

```
@returns {number} hora actual
```

## minuto

Devuelve el minuto actual.

```
@returns {number} minuto actual
```

## segundo

Devuelve el segundo actual.

```
@returns {number} segundo actual
```
