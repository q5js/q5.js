# vector

## crearVector

Crea un nuevo objeto Vector.

```
@param {number} [x] componente x del vector
@param {number} [y] componente y del vector
@param {number} [z] componente z del vector
@param {number} [w] componente w del vector
@returns {Vector} nuevo objeto Vector
```

### webgpu

```js
await crearLienzo(200);
fondo(0.8);

let v = crearVector(0, 0);
círculo(v.x, v.y, 50);
```

## Vector.constructor

Una clase para describir un vector bidimensional o tridimensional, específicamente un vector euclidiano (también conocido como geométrico). Un vector es una entidad que tiene tanto magnitud como dirección. El tipo de datos almacena los componentes del vector (x, y para 2D, y z para 3D). La magnitud y dirección se pueden acceder a través de los métodos `mag()` y `heading()`.

## Vector.x

El componente x del vector.

## Vector.y

El componente y del vector.

## Vector.z

El componente z del vector.

## Vector.w

El componente w del vector.

## Vector.set

Establece los componentes x, y, y z del vector.

```
@param {number} [x] componente x del vector
@param {number} [y] componente y del vector
@param {number} [z] componente z del vector
@param {number} [w] componente w del vector
@returns {Vector} este vector
```

## Vector.copy

Devuelve una copia del vector.

```
@returns {Vector} copia del vector
```

## Vector.add

Suma x, y, y z componentes a un vector, suma un vector a otro, o suma dos vectores independientes.

```
@param {number | Vector} x componente x del vector o Vector a sumar
@param {number} [y] componente y del vector
@param {number} [z] componente z del vector
@returns {Vector} este vector
```

## Vector.sub

Resta x, y, y z componentes de un vector, resta un vector de otro, o resta dos vectores independientes.

```
@param {number | Vector} x componente x del vector o Vector a restar
@param {number} [y] componente y del vector
@param {number} [z] componente z del vector
@returns {Vector} este vector
```

## Vector.mult

Multiplica el vector por un escalar.

```
@param {number} n escalar por el cual multiplicar
@returns {Vector} este vector
```

## Vector.div

Divide el vector por un escalar.

```
@param {number} n escalar por el cual dividir
@returns {Vector} este vector
```

## Vector.mag

Calcula la magnitud (longitud) del vector y devuelve el resultado como un flotante (esto es simplemente la ecuación `sqrt(x*x + y*y + z*z)`).

```
@returns {number} magnitud del vector
```

## Vector.magSq

Calcula la magnitud (longitud) del vector al cuadrado y devuelve el resultado como un flotante (esto es simplemente la ecuación `x*x + y*y + z*z`).

```
@returns {number} magnitud del vector al cuadrado
```

## Vector.dot

Calcula el producto punto de dos vectores.

```
@param {Vector} v vector con el cual hacer producto punto
@returns {number} producto punto
```

## Vector.cross

Calcula el producto cruz de dos vectores.

```
@param {Vector} v vector con el cual hacer producto cruz
@returns {Vector} producto cruz
```

## Vector.dist

Calcula la distancia euclidiana entre dos puntos (considerando un punto como un objeto vector).

```
@param {Vector} v vector al cual calcular distancia
@returns {number} distancia
```

## Vector.normalize

Normaliza el vector a longitud 1 (hace que sea un vector unitario).

```
@returns {Vector} este vector
```

## Vector.limit

Limita la magnitud de este vector al valor usado para el parámetro `max`.

```
@param {number} max magnitud máxima
@returns {Vector} este vector
```

## Vector.setMag

Establece la magnitud de este vector al valor usado para el parámetro `len`.

```
@param {number} len nueva longitud para este vector
@returns {Vector} este vector
```

## Vector.heading

Calcula el ángulo de rotación para este vector (solo vectores 2D).

```
@returns {number} el ángulo de rotación
```

## Vector.rotate

Rota el vector por un ángulo (solo vectores 2D), la magnitud permanece igual.

```
@param {number} ángulo ángulo de rotación
@returns {Vector} este vector
```

## Vector.angleBetween

Calcula y devuelve el ángulo entre dos vectores.

```
@param {Vector} v el vector x, y, z
@returns {number} el ángulo entre
```

## Vector.lerp

Interpola linealmente el vector a otro vector.

```
@param {Vector} v el vector x, y, z
@param {number} amt la cantidad de interpolación; 0.0 es el vector antiguo, 1.0 es el nuevo vector, 0.5 está a mitad de camino
@returns {Vector} este vector
```

## Vector.reflect

Refleja el vector entrante sobre una normal al muro.

```
@param {Vector} superficieNormal el vector normal a la superficie
@returns {Vector} este vector
```

## Vector.array

Devuelve una representación de este vector como un array de flotantes.

```
@returns {number[]} array de flotantes
```

## Vector.equals

Comprueba si los componentes x, y, y z del vector son iguales a los componentes x, y, y z de otro vector.

```
@param {Vector} v el vector a comparar
@returns {boolean} verdadero si los vectores son iguales
```

## Vector.fromAngle

Hace un nuevo vector 2D desde un ángulo de longitud 1.

```
@param {number} ángulo el ángulo deseado
@param {number} [longitud] longitud del nuevo vector (por defecto a 1)
@returns {Vector} nuevo objeto Vector
```

## Vector.random2D

Hace un nuevo vector 2D aleatorio con una magnitud de 1.

```
@returns {Vector} nuevo objeto Vector
```

## Vector.random3D

Hace un nuevo vector 3D aleatorio con una magnitud de 1.

```
@returns {Vector} nuevo objeto Vector
```
