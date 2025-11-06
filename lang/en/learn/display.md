# display

## displayMode

Customize how your canvas is presented.

```
@param {string} mode Display modes:
@param {string} renderQuality Render quality settings:
@param {number} scale can also be given as a string (for example "x2")
```

### webgpu

````js
await createCanvas(50, 25);

displayMode(CENTER, PIXELATED, 4);

circle(0, 0, 16);
````

### c2d

````js
createCanvas(50, 25);

displayMode(CENTER, PIXELATED, 4);

circle(25, 12.5, 16);
````

## fullscreen

Enables or disables fullscreen mode.

```
@param {boolean} [v] boolean indicating whether to enable or disable fullscreen mode
```

## MAXED

A `displayMode` setting.

The canvas will be scaled to fill the parent element,
with letterboxing if necessary to preserve its aspect ratio.

## SMOOTH

A `displayMode` render quality.

Smooth upscaling is used if the canvas is scaled.

## PIXELATED

A `displayMode` render quality.

Pixels are rendered as sharp squares if the canvas is scaled.

