# advanced

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
q.círculo(100, 50, 20);
```
