# vector

## Vector.constructor

Constructs a new Vector object.

```
@param {number} x x component of the vector
@param {number} y y component of the vector
@param {number} [z] optional. The z component of the vector
```

## Vector.x

The x component of the vector.

## Vector.y

The y component of the vector.

## Vector.z

The z component of the vector, if applicable.

## Vector.add

Adds a vector to this vector.

```
@param {Vector} v vector to add
@returns {Vector} resulting vector after addition
```

## Vector.sub

Subtracts a vector from this vector.

```
@param {Vector} v vector to subtract
@returns {Vector} resulting vector after subtraction
```

## Vector.mult

Multiplies this vector by a scalar or element-wise by another vector.

```
@param {number | Vector} n scalar to multiply by, or a vector for element-wise multiplication
@returns {Vector} resulting vector after multiplication
```

## Vector.div

Divides this vector by a scalar or element-wise by another vector.

```
@param {number | Vector} n scalar to divide by, or a vector for element-wise division
@returns {Vector} resulting vector after division
```

## Vector.mag

Calculates the magnitude (length) of the vector.

```
@returns {number} magnitude of the vector
```

## Vector.normalize

Normalizes the vector to a length of 1 (making it a unit vector).

```
@returns {Vector} this vector after normalization
```

## Vector.setMag

Sets the magnitude of the vector to the specified length.

```
@param {number} len new length of the vector
@returns {Vector} this vector after setting magnitude
```

## Vector.dot

Calculates the dot product of this vector and another vector.

```
@param {Vector} v other vector
@returns {number} dot product
```

## Vector.cross

Calculates the cross product of this vector and another vector.

```
@param {Vector} v other vector
@returns {Vector} a new vector that is the cross product of this vector and the given vector
```

## Vector.dist

Calculates the distance between this vector and another vector.

```
@param {Vector} v other vector
@returns {number} distance
```

## Vector.copy

Copies this vector.

```
@returns {Vector} a new vector with the same components as this one
```

## Vector.set

Sets the components of the vector.

```
@param {number} x x component
@param {number} y y component
@param {number} [z] optional. The z component
@returns {void}
```

## Vector.limit

Limits the magnitude of the vector to the value used for the max parameter.

```
@param {number} max maximum magnitude for the vector
@returns {Vector} this vector after limiting
```

## Vector.heading

Calculates the angle of rotation for this vector (only 2D vectors).

```
@returns {number} angle of rotation
```

## Vector.setHeading

Rotates the vector to a specific angle without changing its magnitude.

```
@param {number} angle angle in radians
@returns {Vector} this vector after setting the heading
```

## Vector.rotate

Rotates the vector by the given angle (only 2D vectors).

```
@param {number} angle angle of rotation in radians
@returns {Vector} this vector after rotation
```

## Vector.lerp

Linearly interpolates between this vector and another vector.

```
@param {Vector} v vector to interpolate towards
@param {number} amt amount of interpolation; a number between 0.0 (close to the current vector) and 1.0 (close to the target vector)
@returns {Vector} this vector after interpolation
```

## Vector.slerp

Linearly interpolates between this vector and another vector, including the magnitude.

```
@param {Vector} v vector to interpolate towards
@param {number} amt amount of interpolation; a number between 0.0 (close to the current vector) and 1.0 (close to the target vector)
@returns {Vector} this vector after spherical interpolation
```

