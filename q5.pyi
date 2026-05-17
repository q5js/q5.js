from typing import Any, Callable, Literal

class Image: ...

# ⭐ core

"""⭐
Welcome to q5's documentation! 🤩

First time coding? Check out the q5 Beginner's Brief.

On these Learn pages, you can experiment with editing the
interactive mini examples. Have fun! 😎

![](https://notbyai.fyi/)
"""

def Canvas(w: float = ..., h: float = ..., opt: dict = ...) -> object:
	"""⭐
	Creates a canvas element, a section of the screen your program
	can draw on.
	
	Run this function to start using q5!
	
	Note that in this example, the circle is located at position [0, 0], the origin of the canvas.
	
	:param w: width or side lengths of the canvas
	:param h: height of the canvas
	:param opt: options
	:returns: canvas element
	
	Example::
	
		Canvas(200, 100)
		background('silver')
		circle(0, 0, 80)
	"""
	...

def draw() -> None:
	"""⭐
	The q5 draw function is run 60 times per second by default.
	
	Example::
	
		def draw():
			background('silver')
			circle(mouseX, mouseY, 80)
	"""
	...

def log(message: Any) -> None:
	"""⭐
	Logs a message to the JavaScript console.
	
	To view the console, open your browser's web developer tools
	via the keyboard shortcut Ctrl + Shift + i or command + option + i,
	then click the "Console" tab.
	
	Use log when you're curious about what your code is doing!
	
	:param message: 
	
	Example::
	
		def draw():
			circle(mouseX, mouseY, 80)
			log('The mouse is at:', mouseX, mouseY)
	"""
	...

# 🧑‍🎨 shapes

def circle(x: float, y: float, diameter: float) -> None:
	"""🧑‍🎨
	Draws a circle.
	
	:param x: x-coordinate
	:param y: y-coordinate
	:param diameter: diameter of the circle
	
	Example::
	
		Canvas(200, 100)
		circle(0, 0, 80)
	"""
	...

def ellipse(x: float, y: float, width: float, height: float) -> None:
	"""🧑‍🎨
	Draws an ellipse.
	
	:param x: x-coordinate
	:param y: y-coordinate
	:param width: width of the ellipse
	:param height: height of the ellipse
	
	Example::
	
		Canvas(200, 100)
		ellipse(0, 0, 160, 80)
	"""
	...

def rect(x: float, y: float, w: float, h: float, rounded: float = ...) -> None:
	"""🧑‍🎨
	Draws a rectangle or a rounded rectangle.
	
	Also accepts 8 parameters to specify a
	corner radius for each corner, in the order:
	top-left, top-right, bottom-right, bottom-left.
	
	:param x: x-coordinate
	:param y: y-coordinate
	:param w: width of the rectangle
	:param h: height of the rectangle
	:param rounded: radius for all corners
	
	Example::
	
		Canvas(200)
		background(0.8)
		
		rect(-70, -80, 40, 60)
		rect(-20, -30, 40, 60, 10)
		rect(30, 20, 40, 60, 20, 4, 0, 8)
	"""
	...

def square(x: float, y: float, size: float, rounded: float = ...) -> None:
	"""🧑‍🎨
	Draws a square or a rounded square.
	
	Also accepts 7 parameters to specify a
	corner radius for each corner, in the order:
	top-left, top-right, bottom-right, bottom-left.
	
	:param x: x-coordinate
	:param y: y-coordinate
	:param size: size of the sides of the square
	:param rounded: radius for all corners
	
	Example::
	
		Canvas(200)
		background(0.8)
		
		square(-70, -70, 40)
		square(-20, -20, 40, 10)
		square(30, 30, 40, 20, 4, 0, 8)
	"""
	...

def point(x: float, y: float) -> None:
	"""🧑‍🎨
	Draws a point on the canvas.
	
	:param x: x-coordinate
	:param y: y-coordinate
	
	Example::
	
		Canvas(200, 100)
		stroke('white')
		point(-25, 0)
		
		strokeWeight(10)
		point(25, 0)
	"""
	...

def line(x1: float, y1: float, x2: float, y2: float) -> None:
	"""🧑‍🎨
	Draws a line on the canvas.
	
	:param x1: x-coordinate of the first point
	:param y1: y-coordinate of the first point
	:param x2: x-coordinate of the second point
	:param y2: y-coordinate of the second point
	
	Example::
	
		Canvas(200, 100)
		stroke('lime')
		line(-80, -30, 80, 30)
	"""
	...

def capsule(x1: float, y1: float, x2: float, y2: float, r: float) -> None:
	"""🧑‍🎨
	Draws a capsule.
	
	:param x1: x-coordinate of the first point
	:param y1: y-coordinate of the first point
	:param x2: x-coordinate of the second point
	:param y2: y-coordinate of the second point
	:param r: radius of the capsule semi-circle ends
	
	Example::
	
		Canvas(200, 100)
		background(0.8)
		strokeWeight(5)
		capsule(-60, -10, 60, 10, 10)
	"""
	...

def rectMode(mode: str) -> None:
	"""🧑‍🎨
	Set to CORNER (default), CENTER, RADIUS, or CORNERS.
	
	Changes how the first four inputs to
	rect and square are interpreted.
	
	:param mode: 
	
	Example::
	
		Canvas(200, 100)
		background(0.8)
		rectMode(CORNER)
		
		# (  x,   y,   w,  h)
		rect(-50, -25, 100, 50)
	"""
	...

def ellipseMode(mode: str) -> None:
	"""🧑‍🎨
	Set to CENTER (default), RADIUS, CORNER, or CORNERS.
	
	Changes how the first four inputs to
	ellipse, circle, and arc are interpreted.
	
	:param mode: 
	
	Example::
	
		Canvas(200, 100)
		background(0.8)
		ellipseMode(CENTER)
		
		# (x, y,   w,  h)
		ellipse(0, 0, 100, 50)
	"""
	...

CORNER: Literal['corner']
"""🧑‍🎨
Shape alignment mode, for use in rectMode and ellipseMode.
"""

RADIUS: Literal['radius']
"""🧑‍🎨
Shape alignment mode, for use in rectMode and ellipseMode.
"""

CORNERS: Literal['corners']
"""🧑‍🎨
Shape alignment mode, for use in rectMode and ellipseMode.
"""

# 🌆 image

def loadImage(url: str) -> Image:
	"""🌆
	Loads an image from a URL.
	
	By default, assets are loaded in parallel before q5 runs draw. Use await to wait for an image to load.
	
	:param url: url of the image to load
	:returns: image
	
	Example::
	
		Canvas(200)
		
		logo = loadImage('/q5js_logo.avif')
		
		def draw():
			background(logo)
	"""
	...

def image(img: Image | object, dx: float, dy: float, dw: float = ..., dh: float = ..., sx: float = ..., sy: float = ..., sw: float = ..., sh: float = ...) -> None:
	"""🌆
	Draws an image or video frame to the canvas.
	
	:param img: image or video to draw
	:param dx: x position to draw the image at
	:param dy: y position to draw the image at
	:param dw: width of the destination image
	:param dh: height of the destination image
	:param sx: x position in the source to start clipping a subsection from
	:param sy: y position in the source to start clipping a subsection from
	:param sw: width of the subsection of the source image
	:param sh: height of the subsection of the source image
	
	Example::
	
		Canvas(200)
		
		logo = load('/q5js_logo.avif')
		
		def draw():
			image(logo, -100, -100, 200, 200)
	"""
	...

def imageMode(mode: str) -> None:
	"""🌆
	Set to CORNER (default), CORNERS, or CENTER.
	
	Changes how inputs to image are interpreted.
	
	:param mode: 
	
	Example::
	
		Canvas(200)
		logo = load('/q5js_logo.avif')
		
		def draw():
			imageMode(CORNER)
		
			# ( img,   x,   y,   w,   h)
			image(logo, -50, -50, 100, 100)
	"""
	...

def defaultImageScale(scale: float) -> float:
	"""🌆
	Sets the default image scale, which is applied to images when
	they are drawn without a specified width or height.
	
	By default it is 0.5 so images appear at their actual size
	when pixel density is 2. Images will be drawn at a consistent
	default size relative to the canvas regardless of pixel density.
	
	This function must be called before images are loaded to
	have an effect.
	
	:param scale: 
	:returns: default image scale
	"""
	...

def resize(w: float, h: float) -> None:
	"""🌆
	Resizes the image.
	
	:param w: new width
	:param h: new height
	
	Example::
	
		Canvas(200)
		
		logo = await load('/q5js_logo.avif')
		
		logo.resize(128, 128)
		image(logo, -100, -100, 200, 200)
	"""
	...

def trim() -> Image:
	"""🌆
	Returns a trimmed image, cropping out transparent pixels from the edges.
	"""
	...

def smooth() -> None:
	"""🌆
	Enables smooth rendering of images displayed larger than
	their actual size. This is the default setting, so running this
	function only has an effect if noSmooth has been called.
	
	Example::
	
		Canvas(200)
		smooth()
		
		icon = await load('/q5js_icon.png')
		image(icon, -100, -100, 200, 200)
	"""
	...

def noSmooth() -> None:
	"""🌆
	Disables smooth image rendering for a pixelated look.
	
	Example::
	
		Canvas(200)
		noSmooth()
		
		icon = await load('/q5js_icon.png')
		image(icon, -100, -100, 200, 200)
	"""
	...

def tint(color: str | float) -> None:
	"""🌆
	Applies a tint (color overlay) to the drawing.
	
	The alpha value of the tint color determines the
	strength of the tint. To change an image's opacity,
	use the opacity function.
	
	Tinting affects all subsequent images drawn. The tint
	color is applied to images using the "multiply" blend mode.
	
	Since the tinting process is performance intensive, each time
	an image is tinted, q5 caches the result. image will draw the
	cached tinted image unless the tint color has changed or the
	image being tinted was edited.
	
	If you need to draw an image multiple times each frame with
	different tints, consider making copies of the image and tinting
	each copy separately.
	
	:param color: tint color
	
	Example::
	
		Canvas(200)
		
		logo = await load('/q5js_logo.avif')
		
		tint(1, 0, 0, 0.5)
		image(logo, -100, -100, 200, 200)
	"""
	...

def noTint() -> None:
	"""🌆
	Images drawn after this function is run will not be tinted.
	"""
	...

def mask(img: Image) -> None:
	"""🌆
	Masks the image with another image.
	
	:param img: image to use as a mask
	"""
	...

def copy() -> Image:
	"""🌆
	Returns a copy of the image.
	"""
	...

def inset(sx: float, sy: float, sw: float, sh: float, dx: float, dy: float, dw: float, dh: float) -> None:
	"""🌆
	Displays a region of the image on another region of the image.
	Can be used to create a detail inset, aka a magnifying glass effect.
	
	:param sx: x-coordinate of the source region
	:param sy: y-coordinate of the source region
	:param sw: width of the source region
	:param sh: height of the source region
	:param dx: x-coordinate of the destination region
	:param dy: y-coordinate of the destination region
	:param dw: width of the destination region
	:param dh: height of the destination region
	
	Example::
	
		Canvas(200)
		
		logo = await load('/q5js_logo.avif')
		
		logo.inset(256, 256, 512, 512, 0, 0, 256, 256)
		image(logo, -100, -100, 200, 200)
	"""
	...

def get(x: float, y: float, w: float = ..., h: float = ...) -> Image | list[float]:
	"""🌆
	Retrieves a subsection of an image or canvas as a new Q5 Image
	or the color of a pixel in the image or canvas.
	
	If only x and y are specified, this function returns the color of the pixel
	at the given coordinate in [R, G, B, A] array format. If loadPixels
	has never been run, it's run by this function.
	
	If you make changes to the canvas or image, you must call loadPixels
	before using this function to get current color data.
	
	Not applicable to WebGPU canvases.
	
	:param x: 
	:param y: 
	:param w: width of the area, default is 1
	:param h: height of the area, default is 1
	
	Example::
	
		Canvas(200)
		
		logo = await load('/q5js_logo.avif')
		
		cropped = logo.get(256, 256, 512, 512)
		image(cropped, -100, -100, 200, 200)
	"""
	...

def set(x: float, y: float, val: Any) -> None:
	"""🌆
	Sets a pixel's color in the image or canvas. Color mode must be RGB.
	
	Or if a canvas or image is provided, it's drawn on top of the
	destination image or canvas, ignoring its tint setting.
	
	Run updatePixels to apply the changes.
	
	Not applicable to WebGPU canvases.
	
	:param x: 
	:param y: 
	:param val: color, canvas, or image
	
	Example::
	
		Canvas(200)
		noSmooth()
		c = color('lime')
		img = createImage(50, 50)
		
		def draw():
			img.set(random(50), random(50), c)
			img.updatePixels()
			background(img)
	"""
	...

pixels: list[float]
"""🌆
Array of pixel color data from a canvas or image.

Empty by default, get the data by running loadPixels.

Each pixel is represented by four consecutive values in the array,
corresponding to its red, green, blue, and alpha channels.

The top left pixel's data is at the beginning of the array
and the bottom right pixel's data is at the end, going from
left to right and top to bottom.
"""

def loadPixels() -> None:
	"""🌆
	Loads pixel data into pixels from the canvas or image.
	
	The example below sets some pixels' green channel
	to a random value.
	
	Not applicable to WebGPU canvases.
	
	Example::
	
		Canvas(200)
		frameRate(5)
		icon = load('/q5js_icon.png')
		
		def draw():
			icon.loadPixels()
			for i in range(0, icon.pixels.length, 16):
				icon.pixels[i + 1] = random(1)
			icon.updatePixels()
			background(icon)
	"""
	...

def updatePixels() -> None:
	"""🌆
	Applies changes in the pixels array to the canvas or image.
	
	Not applicable to WebGPU canvases.
	
	Example::
	
		Canvas(200)
		c = color('pink')
		
		img = createImage(50, 50)
		for x in range(0, 50, 3):
			for y in range(0, 50, 3):
				img.set(x, y, c)
		img.updatePixels()
		
		background(img)
	"""
	...

def filter(type: str, value: float = ...) -> None:
	"""🌆
	Applies a filter to the image.
	
	See the documentation for q5's filter constants below for more info.
	
	A CSS filter string can also be used.
	https://developer.mozilla.org/docs/Web/CSS/filter
	
	Not applicable to WebGPU canvases.
	
	:param type: filter type or a CSS filter string
	:param value: optional value, depends on filter type
	
	Example::
	
		Canvas(200)
		logo = await load('/q5js_logo.avif')
		logo.filter(INVERT)
		image(logo, -100, -100, 200, 200)
	"""
	...

THRESHOLD: Literal[1]
"""🌆
Converts the image to black and white pixels depending if they are above or below a certain threshold.
"""

GRAY: Literal[2]
"""🌆
Converts the image to grayscale by setting each pixel to its luminance.
"""

OPAQUE: Literal[3]
"""🌆
Sets the alpha channel to fully opaque.
"""

INVERT: Literal[4]
"""🌆
Inverts the color of each pixel.
"""

POSTERIZE: Literal[5]
"""🌆
Limits each channel of the image to the number of colors specified as an argument.
"""

DILATE: Literal[6]
"""🌆
Increases the size of bright areas.
"""

ERODE: Literal[7]
"""🌆
Increases the size of dark areas.
"""

BLUR: Literal[8]
"""🌆
Applies a Gaussian blur to the image.
"""

def createImage(w: float, h: float, opt: Any = ...) -> Image:
	"""🌆
	Creates a new image.
	
	:param w: width
	:param h: height
	:param opt: optional settings for the image
	"""
	...

def createGraphics(w: float, h: float, opt: dict = ...) -> Q5:
	"""🌆
	Creates a graphics buffer.
	
	Graphics looping is disabled by default in q5 WebGPU.
	See issue #104 for details.
	
	:param w: width
	:param h: height
	:param opt: options
	:returns: a new Q5 graphics buffer
	
	Example::
	
		Canvas(200)
		
		g = createGraphics(100)
		g.noLoop()
		g.stroke('pink')
		g.fill('red')
		g.circle(50, 50, 120)
		
		image(g, -50, -50, 100, 100)
	"""
	...

# 📘 text

def text(str: str, x: float, y: float, wrapWidth: float = ..., lineLimit: float = ...) -> None:
	"""📘
	Renders text on the canvas.
	
	:param str: string of text to display
	:param x: x-coordinate of the text's position
	:param y: y-coordinate of the text's position
	:param wrapWidth: maximum line width in characters
	:param lineLimit: maximum number of lines
	
	Example::
	
		Canvas(200, 100)
		background('silver')
		
		textSize(32)
		text('Hello, world!', -88, 10)
	"""
	...

def loadFont(url: str) -> object:
	"""📘
	Loads a font from a URL.
	
	The first example below loads Robotica.
	
	The second example loads
	Pacifico from Google fonts.
	
	By default, assets are loaded in parallel before q5 runs draw. Use await to wait for a font to load.
	
	:param url: URL of the font to load
	:returns: font
	
	Example::
	
		Canvas(200, 56)
		
		await loadFont('/assets/Robotica.ttf')
		
		fill('skyblue')
		textSize(64)
		text('Hello!', -98, 24)
	"""
	...

def textFont(fontName: str) -> None:
	"""📘
	Sets the current font to be used for rendering text.
	
	By default, the font is set to the CSS font family
	"sans-serif" or the last font loaded.
	
	:param fontName: name of the font family or a FontFace object
	
	Example::
	
		Canvas(200, 160)
		background(0.8)
		
		textFont('serif')
		
		text('Hello, world!', -96, 10)
	"""
	...

def textSize(size: float = ...) -> float | None:
	"""📘
	Sets or gets the current font size. If no argument is provided, returns the current font size.
	
	:param size: size of the font in pixels
	:returns: current font size when no argument is provided
	
	Example::
	
		def draw():
			background(0.8)
		
			textSize(abs(mouseX))
			text('A', -90, 90)
	"""
	...

def textLeading(leading: float = ...) -> float | None:
	"""📘
	Sets or gets the current line height. If no argument is provided, returns the current line height.
	
	:param leading: line height in pixels
	:returns: current line height when no argument is provided
	
	Example::
	
		def draw():
			background(0.8)
		
			textSize(abs(mouseX))
			text('A', -90, 90)
			rect(-90, 90, 5, -textLeading())
	"""
	...

def textStyle(style: Literal['normal'] | Literal['italic'] | Literal['bold'] | Literal['bolditalic']) -> None:
	"""📘
	Sets the current text style.
	
	:param style: font style
	
	Example::
	
		Canvas(200)
		background(0.8)
		
		textStyle(ITALIC)
		
		textSize(32)
		text('Hello, world!', -88, 6)
	"""
	...

def textAlign(horiz: Literal['left'] | Literal['center'] | Literal['right'], vert: Literal['top'] | Literal['middle'] | Literal['bottom'] | Literal['alphabetic'] = ...) -> None:
	"""📘
	Sets the horizontal and vertical alignment of text.
	
	Alignment constants like CENTER can be used with this function.
	
	:param horiz: horizontal alignment
	:param vert: vertical alignment
	
	Example::
	
		Canvas(200)
		background(0.8)
		textSize(32)
		
		textAlign(CENTER, CENTER)
		text('Hello, world!', 0, 0)
	"""
	...

def textWeight(weight: float | str) -> None:
	"""📘
	Sets the text weight.
	
	- 100: thin
	- 200: extra-light
	- 300: light
	- 400: normal/regular
	- 500: medium
	- 600: semi-bold
	- 700: bold
	- 800: bolder/extra-bold
	- 900: black/heavy
	
	:param weight: font weight
	
	Example::
	
		Canvas(200)
		background(0.8)
		textSize(32)
		textAlign(CENTER, CENTER)
		
		textWeight(100)
		text('Hello, world!', 0, 0)
	"""
	...

def textWidth(str: str) -> float:
	"""📘
	Calculates and returns the width of a given string of text.
	
	:param str: string to measure
	:returns: width of the text in pixels
	
	Example::
	
		def draw():
			background(0.8)
		
			textSize(abs(mouseX))
			rect(-90, 90, textWidth('A'), -textLeading())
			text('A', -90, 90)
	"""
	...

def textAscent(str: str) -> float:
	"""📘
	Calculates and returns the ascent (the distance from the baseline to the top of the highest character) of the current font.
	
	:param str: string to measure
	:returns: ascent of the text in pixels
	
	Example::
	
		def draw():
			background(0.8)
		
			textSize(abs(mouseX))
			rect(-90, 90, textWidth('A'), -textAscent())
			text('A', -90, 90)
	"""
	...

def textDescent(str: str) -> float:
	"""📘
	Calculates and returns the descent (the distance from the baseline to the bottom of the lowest character) of the current font.
	
	:param str: string to measure
	:returns: descent of the text in pixels
	
	Example::
	
		Canvas(200)
		background(0.8)
		textSize(64)
		
		rect(-100, 0, 200, textDescent('q5'))
		text('q5', -90, 0)
	"""
	...

def createTextImage(str: str, wrapWidth: float = ..., lineLimit: float = ...) -> Image:
	"""📘
	Creates an image from a string of text.
	
	:param str: string of text
	:param wrapWidth: maximum line width in characters
	:param lineLimit: maximum number of lines
	:returns: an image object representing the rendered text
	
	Example::
	
		Canvas(200)
		textSize(96)
		
		img = createTextImage('🐶')
		img.filter(INVERT)
		
		def draw():
			image(img, -45, -90)
	"""
	...

def textImage(img: Image | str, x: float, y: float) -> None:
	"""📘
	Renders an image generated from text onto the canvas.
	
	If the first parameter is a string, an image of the text will be
	created and cached automatically.
	
	The positioning of the image is affected by the current text
	alignment and baseline settings.
	
	:param img: image or text
	:param x: x-coordinate where the image should be placed
	:param y: y-coordinate where the image should be placed
	
	Example::
	
		Canvas(200)
		background(0.8)
		textSize(96)
		textAlign(CENTER, CENTER)
		
		textImage('🐶', 0, 0)
	"""
	...

def textToPoints(str: str) -> None:
	"""📘
	Converts a string of text to an array of points.
	
	Samples opaque pixels in a text image made with createTextImage.
	
	It's influenced by text settings, such as font, size, and alignment.
	
	Uses a Z-order curve to improve spatial distribution, which preserves the shape of text better than purely random sampling.
	
	:param str: string of text
	
	Example::
	
		Canvas(200)
		textSize(220)
		textAlign(CENTER, CENTER)
		
		points = textToPoints('5')
		
		for (let pt of points)
			rect(pt.x, pt.y, 5, 20)
	"""
	...

def nf(n: float, l: float, r: float) -> str:
	"""📘
	Number formatter, can be used to display a number as a string with
	a specified number of digits before and after the decimal point,
	optionally adding padding with zeros.
	
	:param n: number to format
	:param l: minimum number of digits to appear before the decimal point; the number is padded with zeros if necessary
	:param r: number of digits to appear after the decimal point
	:returns: a string representation of the number, formatted accordingly
	
	Example::
	
		Canvas(200, 100)
		background(0.8)
		
		textSize(32)
		text(nf(PI, 4, 5), -90, 10)
	"""
	...

NORMAL: Literal['normal']
"""📘
Normal font style.
"""

ITALIC: Literal['italic']
"""📘
Italic font style.
"""

BOLD: Literal['bold']
"""📘
Bold font weight.
"""

BOLDITALIC: Literal['italic bold']
"""📘
Bold and italic font style.
"""

LEFT: Literal['left']
"""📘
Align text to the left.
"""

CENTER: Literal['center']
"""📘
Align text to the center.
"""

RIGHT: Literal['right']
"""📘
Align text to the right.
"""

TOP: Literal['top']
"""📘
Align text to the top.
"""

MIDDLE: Literal['middle']
"""📘
Align text to the middle.
"""

BOTTOM: Literal['bottom']
"""📘
Align text to the bottom.
"""

BASELINE: Literal['alphabetic']
"""📘
Align text to the baseline (alphabetic).
"""

# 🖲 input

"""🖲
q5's input handling is very basic.

For better input handling, including game controller support, consider using the q5play addon with q5.

Note that input responses inside draw can be delayed by
up to one frame cycle: from the exact moment an input event occurs
to the next time a frame is drawn.

Play sounds or trigger other non-visual feedback immediately
by responding to input events inside functions like
mousePressed and keyPressed.
"""

mouseX: float
"""🖲
Current X position of the mouse.

Example::

	def draw():
		background(0.8)
		textSize(64)
		text(round(mouseX), -50, 20)
"""

mouseY: float
"""🖲
Current Y position of the mouse.

Example::

	def draw():
		background(0.8)
		circle(0, mouseY, 100)
"""

pmouseX: float
"""🖲
Previous X position of the mouse.
"""

pmouseY: float
"""🖲
Previous Y position of the mouse.
"""

mouseButton: str
"""🖲
The current button being pressed: 'left', 'right', 'center').

The default value is an empty string.

Example::

	def draw():
		background(0.8)
		textSize(64)
		text(mouseButton, -80, 20)
"""

mouseIsPressed: bool
"""🖲
True if the mouse is currently pressed, false otherwise.

Example::

	def draw():
		if mouseIsPressed: background(0.4)
		else: background(0.8)
"""

def mousePressed() -> None:
	"""🖲
	Define this function to respond to mouse down events.
	
	Example::
	
		Canvas(200)
		gray = 0.4
		
		def mousePressed():
			background(gray % 1)
			gray += 0.1
	"""
	...

def mouseReleased() -> None:
	"""🖲
	Define this function to respond to mouse up events.
	
	Example::
	
		Canvas(200)
		gray = 0.4
		
		def mouseReleased():
			background(gray % 1)
			gray += 0.1
	"""
	...

def mouseMoved() -> None:
	"""🖲
	Define this function to respond to mouse move events.
	
	On touchscreen devices this function is not called
	when the user drags their finger on the screen.
	
	Example::
	
		Canvas(200)
		gray = 0.4
		
		def mouseMoved():
			background(gray % 1)
			gray += 0.005
	"""
	...

def mouseDragged() -> None:
	"""🖲
	Define this function to respond to mouse drag events.
	
	Dragging the mouse is defined as moving the mouse
	while a mouse button is pressed.
	
	Example::
	
		Canvas(200)
		gray = 0.4
		
		def mouseDragged():
			background(gray % 1)
			gray += 0.005
	"""
	...

def doubleClicked() -> None:
	"""🖲
	Define this function to respond to mouse double click events.
	
	Example::
	
		Canvas(200)
		gray = 0.4
		
		def doubleClicked():
			background(gray % 1)
			gray += 0.1
	"""
	...

key: str
"""🖲
The name of the last key pressed.

Example::

	def draw():
		background(0.8)
		textSize(64)
		text(key, -80, 20)
"""

keyIsPressed: bool
"""🖲
True if a key is currently pressed, false otherwise.

Example::

	def draw():
		if keyIsPressed: background(0.4)
		else: background(0.8)
"""

def keyIsDown(key: str) -> bool:
	"""🖲
	Returns true if the user is pressing the specified key, false
	otherwise. Accepts case-insensitive key names.
	
	:param key: key to check
	:returns: true if the key is pressed, false otherwise
	
	Example::
	
		def draw():
			background(0.8)
		
			if keyIsDown('f': && keyIsDown('j'))
				rect(-50, -50, 100, 100)
	"""
	...

def keyPressed() -> None:
	"""🖲
	Define this function to respond to key down events.
	
	Example::
	
		Canvas(200)
		gray = 0.4
		
		def keyPressed():
			background(gray % 1)
			gray += 0.1
	"""
	...

def keyReleased() -> None:
	"""🖲
	Define this function to respond to key up events.
	
	Example::
	
		Canvas(200)
		gray = 0.4
		
		def keyReleased():
			background(gray % 1)
			gray += 0.1
	"""
	...

touches: list[Any]
"""🖲
Array containing all current touch points within the
browser window. Each touch being an object with
id, x, and y properties.

Consider using the pointers array instead,
which includes mouse, touch, and pen input.

Example::

	def draw():
		background(0.8)
		for (let pt of pointers)
			circle(pt.x, pt.y, 100)
"""

def touchStarted() -> None:
	"""🖲
	Define this function to respond to touch down events
	on the canvas.
	
	Return true to enable touch gestures like pinch-to-zoom
	and scroll, which q5 disables on the canvas by default.
	
	Example::
	
		Canvas(200)
		gray = 0.4
		
		def touchStarted():
			background(gray % 1)
			gray += 0.1
	"""
	...

def touchEnded() -> None:
	"""🖲
	Define this function to respond to touch down events
	on the canvas.
	
	Return true to enable touch gestures like pinch-to-zoom
	and scroll, which q5 disables on the canvas by default.
	
	Example::
	
		Canvas(200)
		gray = 0.4
		
		def touchEnded():
			background(gray % 1)
			gray += 0.1
	"""
	...

def touchMoved() -> None:
	"""🖲
	Define this function to respond to touch move events
	on the canvas.
	
	Return true to enable touch gestures like pinch-to-zoom
	and scroll, which q5 disables on the canvas by default.
	
	Example::
	
		Canvas(200)
		gray = 0.4
		
		def touchMoved():
			background(gray % 1)
			gray += 0.005
	"""
	...

def cursor(name: str, x: float = ..., y: float = ...) -> None:
	"""🖲
	Sets the cursor to a CSS cursor type or image.
	If an image is provided, optional x and y coordinates can
	specify the active point of the cursor.
	
	:param name: name of the cursor or the url to an image
	:param x: x-coordinate of the cursor's point
	:param y: y-coordinate of the cursor's point
	
	Example::
	
		Canvas(200, 100)
		cursor('pointer')
	"""
	...

def noCursor() -> None:
	"""🖲
	Hides the cursor within the bounds of the canvas.
	
	Example::
	
		Canvas(200, 100)
		noCursor()
	"""
	...

def mouseWheel() -> None:
	"""🖲
	Define this function to respond to mouse wheel events.
	
	event.deltaX and event.deltaY are the horizontal and vertical
	scroll amounts, respectively.
	
	Return true to allow the default behavior of scrolling the page.
	
	Example::
	
		x = 0
		y = 0
		def draw():
			circle(x, y, 10)
		def mouseWheel(e):
			x += e.deltaX
			y += e.deltaY
			return False
	"""
	...

movedX: float
"""🖲
Distance the mouse has moved since the last frame in the horizontal direction.

Example::

	def draw():
		background(0.8)
		if movedX > 0: text('>>', 0, 0)
		if movedX < 0: text('<<', 0, 0)
"""

movedY: float
"""🖲
Distance the mouse has moved since the last frame in the vertical direction.

Example::

	def draw():
		background(0.8)
		if movedY > 0: text('vv', 0, 0)
		if movedY < 0: text('^^', 0, 0)
"""

def pointerLock(unadjustedMovement: bool) -> None:
	"""🖲
	Requests that the pointer be locked to the document body, hiding
	the cursor and allowing for unlimited movement.
	
	Operating systems enable mouse acceleration by default, which is useful when you sometimes want slow precise movement (think about you might use a graphics package), but also want to move great distances with a faster mouse movement (think about scrolling, and selecting several files). For some games however, raw mouse input data is preferred for controlling camera rotation — where the same distance movement, fast or slow, results in the same rotation.
	
	To exit pointer lock mode, call document.exitPointerLock().
	
	:param unadjustedMovement: set to true to disable OS-level mouse acceleration and access raw mouse input
	
	Example::
	
		def draw():
			circle(mouseX / 10, mouseY / 10, 10)
		
		def doubleClicked():
			if !document.pointerLockElement:
				pointerLock()
				} else
					document.exitPointerLock()
	"""
	...

# 🎨 color

def color(c0: str | float | Color | list[float], c1: float = ..., c2: float = ..., c3: float = ...) -> Color:
	"""🎨
	Creates a new Color object, which is primarily useful for storing
	a color that your sketch will reuse or modify later.
	
	With the default color mode, RGB, colors have r/red, g/green,
	b/blue, and a/alpha components.
	
	The fill, stroke, and background
	functions accept the same wide range of color representations as this function.
	
	:param c0: color or first color component
	:param c1: second color component
	:param c2: third color component
	:param c3: fourth color component (alpha)
	:returns: a new Color object
	
	Example::
	
		Canvas(200)
		rect(-100, -100, 100, 200)
		
		# ( r,   g,   b,   a)
		bottle = color(0.35, 0.39, 1, 0.4)
		fill(bottle)
		stroke(bottle)
		strokeWeight(30)
		circle(0, 0, 155)
	"""
	...

def colorMode(mode: Literal['rgb'] | Literal['oklch'] | Literal['hsl'] | Literal['hsb'], format: Literal[1] | Literal[255], gamut: Literal['srgb'] | Literal['display-p3'] = ...) -> None:
	"""🎨
	Sets the color mode for the sketch, which changes how colors are
	interpreted and displayed.
	
	Color gamut is 'display-p3' by default, if the device supports HDR.
	
	:param mode: color mode
	:param format: color format (1 for float, 255 for integer)
	:param gamut: color gamut
	
	Example::
	
		Canvas(200)
		
		colorMode(RGB, 1)
		fill(1, 0, 0)
		rect(-100, -100, 66, 200)
		fill(0, 1, 0)
		rect(-34, -100, 67, 200)
		fill(0, 0, 1)
		rect(33, -100, 67, 200)
	"""
	...

RGB: Literal['rgb']
"""🎨
RGB colors have components r/red, g/green, b/blue,
and a/alpha.

By default when a canvas is using the HDR "display-p3" color space,
rgb colors are mapped to the full P3 gamut, even when they use the
legacy integer 0-255 format.

Example::

	Canvas(200, 100)
	
	colorMode(RGB)
	
	background(1, 0, 0)
"""

OKLCH: Literal['oklch']
"""🎨
OKLCH colors have components l/lightness, c/chroma,
h/hue, and a/alpha. It's more intuitive for humans
to work with color in these terms than RGB.

OKLCH is perceptually uniform, meaning colors at the
same lightness and chroma (colorfulness) will appear to
have equal luminance, regardless of the hue.

OKLCH can accurately represent all colors visible to the
human eye, unlike many other color spaces that are bounded
to a gamut. The maximum lightness and chroma values that
correspond to sRGB or P3 gamut limits vary depending on
the hue. Colors that are out of gamut will be clipped to
the nearest in-gamut color.

Use the OKLCH color picker to find
in-gamut colors.

- lightness: 0 to 1
- chroma: 0 to ~0.4
- hue: 0 to 360
- alpha: 0 to 1

Example::

	Canvas(200, 100)
	
	colorMode(OKLCH)
	
	background(0.64, 0.3, 30)
"""

HSL: Literal['hsl']
"""🎨
HSL colors have components h/hue, s/saturation,
l/lightness, and a/alpha.

HSL was created in the 1970s to approximate human perception
of color, trading accuracy for simpler computations. It's
not perceptually uniform, so colors with the same lightness
can appear darker or lighter, depending on their hue
and saturation. Yet, the lightness and saturation values that
correspond to gamut limits are always 100, regardless of the
hue. This can make HSL easier to work with than OKLCH.

HSL colors are mapped to the full P3 gamut when
using the "display-p3" color space.

- hue: 0 to 360
- saturation: 0 to 100
- lightness: 0 to 100
- alpha: 0 to 1

Example::

	Canvas(200, 100)
	
	colorMode(HSL)
	
	background(0, 100, 50)
"""

HSB: Literal['hsb']
"""🎨
HSB colors have components h/hue, s/saturation,
b/brightness (aka v/value), and a/alpha.

HSB is similar to HSL, but instead of lightness
(black to white), it uses brightness (black to
full color). To produce white, set brightness
to 100 and saturation to 0.

- hue: 0 to 360
- saturation: 0 to 100
- brightness: 0 to 100
- alpha: 0 to 1

Example::

	Canvas(200, 100)
	
	colorMode(HSB)
	
	background(0, 100, 100)
"""

SRGB: Literal['srgb']
"""🎨
Limits the color gamut to the sRGB color space.

If your display is HDR capable, note that full red appears
less saturated and darker in this example, as it would on
an SDR display.

Example::

	Canvas(200, 100)
	
	colorMode(RGB, 1, SRGB)
	
	background(1, 0, 0)
"""

DISPLAY_P3: Literal['display-p3']
"""🎨
Expands the color gamut to the P3 color space.

This is the default color gamut on devices that support HDR.

If your display is HDR capable, note that full red appears
fully saturated and bright in the following example.

Example::

	Canvas(200, 100)
	
	colorMode(RGB, 1, DISPLAY_P3)
	
	background(1, 0, 0)
"""

def background(filler: Color | Image) -> None:
	"""🎨
	Draws over the entire canvas with a color or image.
	
	Like the color function,
	this function can accept colors in a wide range of formats:
	CSS color string, grayscale value, and color component values.
	
	:param filler: a color or image to draw
	
	Example::
	
		Canvas(200, 100)
		background('crimson')
	"""
	...

class Color:
	"""🎨
	This constructor strictly accepts 4 numbers, which are the color
	components.
	
	Use the color function for greater flexibility, it runs
	this constructor internally.
	"""


	def equals(self) -> None:
		"""🎨 Checks if this color is exactly equal to another color."""
		...

	def isSameColor(self) -> None:
		"""🎨 Checks if the color is the same as another color,
disregarding their alpha values."""
		...

	def toString(self) -> None:
		"""🎨 Produces a CSS color string representation."""
		...

	def levels(self) -> None:
		"""🎨 An array of the color's components."""
		...

# 💅 styles

def fill(color: Color) -> None:
	"""💅
	Sets the fill color. The default is white.
	
	Like the color function, this function
	can accept colors in a wide range of formats: as a CSS color string,
	a Color object, grayscale value, or color component values.
	
	:param color: fill color
	
	Example::
	
		Canvas(200)
		background(0.8)
		
		fill('red')
		circle(-20, -20, 80)
		
		fill('lime')
		square(-20, -20, 80)
	"""
	...

def stroke(color: Color) -> None:
	"""💅
	Sets the stroke (outline) color. The default is black.
	
	Like the color function, this function
	can accept colors in a wide range of formats: as a CSS color string,
	a Color object, grayscale value, or color component values.
	
	:param color: stroke color
	
	Example::
	
		Canvas(200)
		background(0.8)
		fill(0.14)
		
		stroke('red')
		circle(-20, -20, 80)
		
		stroke('lime')
		square(-20, -20, 80)
	"""
	...

def noFill() -> None:
	"""💅
	After calling this function, drawing will not be filled.
	
	Example::
	
		Canvas(200)
		background(0.8)
		
		noFill()
		
		stroke('red')
		circle(-20, -20, 80)
		stroke('lime')
		square(-20, -20, 80)
	"""
	...

def noStroke() -> None:
	"""💅
	After calling this function, drawing will not have a stroke (outline).
	
	Example::
	
		Canvas(200)
		background(0.8)
		fill(0.14)
		stroke('red')
		circle(-20, -20, 80)
		
		noStroke()
		square(-20, -20, 80)
	"""
	...

def strokeWeight(weight: float) -> None:
	"""💅
	Sets the size of the stroke used for lines and the border around drawings.
	
	:param weight: size of the stroke in pixels
	
	Example::
	
		Canvas(200)
		background(0.8)
		stroke('red')
		circle(-50, 0, 80)
		
		strokeWeight(12)
		circle(50, 0, 80)
	"""
	...

def opacity(alpha: float) -> None:
	"""💅
	Sets the global opacity, which affects all subsequent drawing operations, except background. Default is 1, fully opaque.
	
	In q5 WebGPU this function only affects images.
	
	:param alpha: opacity level, ranging from 0 to 1
	
	Example::
	
		Canvas(200)
		background(0.8)
		
		opacity(1)
		circle(-20, -20, 80)
		
		opacity(0.2)
		square(-20, -20, 80)
	"""
	...

def shadow(color: Color) -> None:
	"""💅
	Sets the shadow color. The default is transparent (no shadow).
	
	Shadows apply to anything drawn to the canvas, including filled
	shapes, strokes, text, and images.
	
	Like the color function, this function
	can accept colors in a wide range of formats: as a CSS color string,
	a Color object, grayscale value, or color component values.
	
	Not available in q5 WebGPU.
	
	:param color: shadow color
	"""
	...

def noShadow() -> None:
	"""💅
	Disables the shadow effect.
	
	Not available in q5 WebGPU.
	"""
	...

def shadowBox(offsetX: float, offsetY: float, blur: float) -> None:
	"""💅
	Sets the shadow offset and blur radius.
	
	When q5 starts, shadow offset is (10, 10) with a blur of 10.
	
	Not available in q5 WebGPU.
	
	:param offsetX: horizontal offset of the shadow
	:param offsetY: vertical offset of the shadow, defaults to be the same as offsetX
	:param blur: blur radius of the shadow, defaults to 0
	"""
	...

def blendMode(val: str) -> None:
	"""💅
	Set the global composite operation for the canvas context.
	
	Not available in q5 WebGPU.
	
	:param val: composite operation
	"""
	...

def strokeCap(val: str) -> None:
	"""💅
	
	:param val: line cap style
	
	Example::
	
		Canvas(200)
		background(0.8)
		strokeWeight(20)
		
		strokeCap(SQUARE)
		line(-50, -25, 50, -25)
		
		strokeCap(PROJECT)
		line(-50, 25, 50, 25)
	"""
	...

def strokeJoin(val: str) -> None:
	"""💅
	
	:param val: line join style
	
	Example::
	
		Canvas(200)
		background(0.8)
		strokeWeight(10)
		
		strokeJoin(ROUND)
		triangle(-50, -30, 50, -30, -50, 20)
		
		strokeJoin(MITER)
		triangle(50, 0, -50, 50, 50, 50)
	"""
	...

def erase(fillAlpha: float = ..., strokeAlpha: float = ...) -> None:
	"""💅
	Sets the canvas to erase mode, where shapes will erase what's
	underneath them instead of drawing over it.
	
	Not available in q5 WebGPU.
	
	:param fillAlpha: opacity level of the fill color
	:param strokeAlpha: opacity level of the stroke color
	"""
	...

def noErase() -> None:
	"""💅
	Resets the canvas from erase mode to normal drawing mode.
	
	Not available in q5 WebGPU.
	"""
	...

def pushStyles() -> None:
	"""💅
	Saves the current drawing style settings.
	
	This includes the fill, stroke, stroke weight, tint, image mode,
	rect mode, ellipse mode, text size, text align, text baseline, and
	shadow settings.
	
	Example::
	
		Canvas(200)
		background(0.8)
		
		pushStyles()
		fill('blue')
		circle(-50, -50, 80)
		
		popStyles()
		circle(50, 50, 80)
	"""
	...

def popStyles() -> None:
	"""💅
	Restores the previously saved drawing style settings.
	
	Example::
	
		Canvas(200)
		background(0.8)
		
		pushStyles()
		fill('blue')
		circle(-50, -50, 80)
		
		popStyles()
		circle(50, 50, 80)
	"""
	...

def clear() -> None:
	"""💅
	Clears the canvas, making every pixel completely transparent.
	
	Note that the canvas can only be seen through if it has an alpha channel.
	
	Example::
	
		Canvas(200, { alpha: True })
		
		def draw():
			clear()
			circle((frameCount % 200) - 100, 0, 80)
	"""
	...

ctx: Any
"""💅
The 2D rendering context for the canvas.

You can use it to create linear gradients, radial gradients, font stretching, and
other advanced drawing features.

Not available in q5 WebGPU.
"""

def inFill(x: float, y: float) -> bool:
	"""💅
	Checks if a given point is within the current path's fill area.
	
	Not available in q5 WebGPU.
	
	:param x: x-coordinate of the point
	:param y: y-coordinate of the point
	:returns: true if the point is within the fill area, false otherwise
	"""
	...

def inStroke(x: float, y: float) -> bool:
	"""💅
	Checks if a given point is within the current path's stroke.
	
	Not available in q5 WebGPU.
	
	:param x: x-coordinate of the point
	:param y: y-coordinate of the point
	:returns: true if the point is within the stroke, false otherwise
	"""
	...

# 🦋 transforms

def translate(x: float, y: float) -> None:
	"""🦋
	Translates the origin of the drawing context.
	
	:param x: translation along the x-axis
	:param y: translation along the y-axis
	
	Example::
	
		def draw():
			background(0.8)
		
			translate(50, 50)
			circle(0, 0, 80)
	"""
	...

def rotate(angle: float) -> None:
	"""🦋
	Rotates the drawing context.
	
	:param angle: rotation angle in radians
	
	Example::
	
		def draw():
			background(0.8)
		
			rotate(mouseX / 50)
		
			rectMode(CENTER)
			square(0, 0, 120)
	"""
	...

def scale(x: float, y: float = ...) -> None:
	"""🦋
	Scales the drawing context.
	
	If only one input parameter is provided,
	the drawing context will be scaled uniformly.
	
	:param x: scaling factor along the x-axis
	:param y: scaling factor along the y-axis
	
	Example::
	
		def draw():
			background(0.8)
		
			scale(mouseX / 10)
			circle(0, 0, 20)
	"""
	...

def shearX(angle: float) -> None:
	"""🦋
	Shears the drawing context along the x-axis.
	
	:param angle: shear angle in radians
	
	Example::
	
		def draw():
			background(0.8)
		
			translate(-75, -40)
			shearX(mouseX / 100)
			square(0, 0, 80)
	"""
	...

def shearY(angle: float) -> None:
	"""🦋
	Shears the drawing context along the y-axis.
	
	:param angle: shear angle in radians
	
	Example::
	
		def draw():
			background(0.8)
		
			translate(-75, -40)
			shearY(mouseX / 100)
			square(0, 0, 80)
	"""
	...

def applyMatrix(a: float, b: float, c: float, d: float, e: float, f: float) -> None:
	"""🦋
	Applies a transformation matrix.
	
	Accepts a 3x3 matrix as either an array or multiple arguments.
	
	:param a: 
	:param b: 
	:param c: 
	:param d: 
	:param e: 
	:param f: 
	
	Example::
	
		def draw():
			background(0.8)
		
			applyMatrix(2, -1, 1, -1)
			circle(0, 0, 80)
	"""
	...

def resetMatrix() -> None:
	"""🦋
	Resets the transformation matrix.
	
	q5 runs this function before every time the draw function is run,
	so that transformations don't carry over to the next frame.
	
	Example::
	
		Canvas(200)
		background(0.8)
		
		translate(50, 50)
		circle(0, 0, 80)
		
		resetMatrix()
		square(0, 0, 50)
	"""
	...

def pushMatrix() -> None:
	"""🦋
	Saves the current transformation matrix.
	
	Example::
	
		Canvas(200)
		background(0.8)
		
		pushMatrix()
		rotate(QUARTER_PI)
		ellipse(0, 0, 120, 40)
		popMatrix()
		
		ellipse(0, 0, 120, 40)
	"""
	...

def popMatrix() -> None:
	"""🦋
	Restores the previously saved transformation matrix.
	
	Example::
	
		Canvas(200)
		background(0.8)
		
		pushMatrix()
		rotate(QUARTER_PI)
		ellipse(0, 0, 120, 40)
		popMatrix()
		
		ellipse(0, 0, 120, 40)
	"""
	...

def push() -> None:
	"""🦋
	Saves the current drawing style settings and transformations.
	
	Example::
	
		Canvas(200)
		
		push()
		fill('blue')
		translate(50, 50)
		circle(0, 0, 80)
		pop()
		
		square(0, 0, 50)
	"""
	...

def pop() -> None:
	"""🦋
	Restores the previously saved drawing style settings and transformations.
	
	Example::
	
		Canvas(200)
		
		push()
		fill('blue')
		translate(50, 50)
		circle(0, 0, 80)
		pop()
		
		square(0, 0, 50)
	"""
	...

# 💻 display

def displayMode(mode: str, renderQuality: str, scale: float) -> None:
	"""💻
	Customize how your canvas is presented.
	
	:param mode: NORMAL, CENTER, or MAXED
	:param renderQuality: SMOOTH or PIXELATED
	:param scale: can also be given as a string (for example "x2")
	
	Example::
	
		Canvas(50, 25)
		
		displayMode(CENTER, PIXELATED, 4)
		
		circle(0, 0, 16)
	"""
	...

MAXED: Literal['maxed']
"""💻
A displayMode setting.

The canvas will be scaled to fill the parent element,
with letterboxing if necessary to preserve its aspect ratio.
"""

SMOOTH: Literal['smooth']
"""💻
A displayMode render quality.

Smooth upscaling is used if the canvas is scaled.
"""

PIXELATED: Literal['pixelated']
"""💻
A displayMode render quality.

Pixels are rendered as sharp squares if the canvas is scaled.
"""

def fullscreen(v: bool = ...) -> None:
	"""💻
	Enables or disables fullscreen mode.
	
	:param v: boolean indicating whether to enable or disable fullscreen mode
	"""
	...

windowWidth: float
"""💻
The width of the window.

Example::

	def draw():
		background(0.8)
		textSize(64)
		textAlign(CENTER, CENTER)
		text(windowWidth, 0, 0)
"""

windowHeight: float
"""💻
The height of the window.

Example::

	def draw():
		background(0.8)
		textSize(64)
		textAlign(CENTER, CENTER)
		text(windowHeight, 0, 0)
"""

width: float
"""💻
The width of the canvas.

Example::

	Canvas(200, 120)
	circle(0, 0, width)
"""

height: float
"""💻
The height of the canvas.

Example::

	Canvas(200, 80)
	circle(0, 0, height)
"""

halfWidth: float
"""💻
Half the width of the canvas.

Example::

	Canvas(200, 80)
	circle(0, 0, halfWidth)
"""

halfHeight: float
"""💻
Half the height of the canvas.

Example::

	Canvas(200, 80)
	circle(0, 0, halfHeight)
"""

canvas: object
"""💻
The canvas element associated with the Q5 instance.
"""

def resizeCanvas(w: float, h: float) -> None:
	"""💻
	Resizes the canvas to the specified width and height.
	
	:param w: width of the canvas
	:param h: height of the canvas
	
	Example::
	
		Canvas(200, 100)
		
		def draw():
			background(0.8)
		
		def mousePressed():
			resizeCanvas(200, 200)
	"""
	...

frameCount: float
"""💻
The number of frames that have been displayed since the program started.

Example::

	def draw():
		background(0.8)
		textSize(64)
		text(frameCount, -92, 20)
"""

def noLoop() -> None:
	"""💻
	Stops the draw loop.
	
	Example::
	
		def draw():
			circle(frameCount * 5 - 100, 0, 80)
			noLoop()
	"""
	...

def redraw(n: float = ...) -> None:
	"""💻
	Redraws the canvas n times. If no input parameter is provided,
	it calls the draw function once.
	
	This is an async function.
	
	:param n: number of times to redraw the canvas, default is 1
	
	Example::
	
		Canvas(200)
		noLoop()
		
		def draw():
			circle(frameCount * 5 - 100, 0, 80)
		def mousePressed():
			redraw(10)
	"""
	...

def loop() -> None:
	"""💻
	Starts the draw loop again if it was stopped.
	
	Example::
	
		Canvas(200)
		noLoop()
		
		def draw():
			circle(frameCount * 5 - 100, 0, 80)
		def mousePressed():
			loop()
	"""
	...

def frameRate(hertz: float = ...) -> float:
	"""💻
	Sets the target frame rate or gets an approximation of the
	sketch's current frame rate.
	
	Even when the sketch is running at a consistent frame rate,
	the current frame rate value will fluctuate. Use your web browser's
	developer tools for more accurate performance analysis.
	
	:param hertz: target frame rate, default is 60
	:returns: current frame rate
	
	Example::
	
		def draw():
			background(0.8)
		
			if mouseIsPressed: frameRate(10)
			else: frameRate(60)
		
			circle((frameCount % 200) - 100, 0, 80)
	"""
	...

def getTargetFrameRate() -> float:
	"""💻
	The desired frame rate of the sketch.
	:returns: target frame rate
	
	Example::
	
		def draw():
			background(0.8)
			textSize(64)
		
			text(getTargetFrameRate(), -35, 20)
	"""
	...

def getFPS() -> float:
	"""💻
	Gets the current FPS, in terms of how many frames could be generated
	in one second, which can be higher than the target frame rate.
	
	Use your web browser's developer tools for more in-depth
	performance analysis.
	:returns: frames per second
	
	Example::
	
		def draw():
			background(0.8)
			frameRate(1)
			textSize(64)
		
			text(getFPS(), -92, 20)
	"""
	...

def postProcess() -> None:
	"""💻
	Runs after each draw function call and post-draw q5 addon processes, if any.
	
	Useful for adding post-processing effects when it's not possible
	to do so at the end of the draw function, such as when using
	addons like q5play that auto-draw to the canvas after the draw
	function is run.
	"""
	...

def pixelDensity(v: float) -> float:
	"""💻
	Sets the pixel density of the canvas.
	
	:param v: pixel density value
	:returns: pixel density
	
	Example::
	
		Canvas(200, 100)
		background(0.8)
		pixelDensity(1)
		circle(0, 0, 80)
	"""
	...

def displayDensity() -> float:
	"""💻
	Returns the current display density.
	
	On most modern displays, this value will be 2 or 3.
	:returns: display density
	
	Example::
	
		Canvas(200, 100)
		background(0.8)
		textSize(64)
		text(displayDensity(), -90, 6)
	"""
	...

deltaTime: float
"""💻
The time passed since the last frame was drawn.

With the default frame rate of 60, delta time will be
approximately 16.6

Can be used to keep movements tied to real time if the sketch
is often dropping below the target frame rate. Although if frame
rates are consistently low, consider reducing the target frame
rate instead.

Example::

	def draw():
		background(0.8)
		text(deltaTime, -90, 6)
"""

C2D: Literal['c2d']
"""💻
A constant that can be passed as the third argument to Canvas to specify that the Canvas2D renderer should be used.

Note that in this example, the circle is located at position [0, 0], the origin of the canvas.

Example::

	Canvas(200, 100, C2D)
	background('silver')
	circle(0, 0, 80)
"""

WEBGPU: Literal['webgpu']
"""💻
Since WebGPU is the default renderer in JavaScript modules, it's not necessary to use this constant with Canvas, unless you want to make it explicit.

Example::

	Canvas(200, 100, WEBGPU)
	background('silver')
	circle(0, 0, 80)
"""

# 🧮 math

def random(low: float | list[Any] = ..., high: float = ...) -> float | Any:
	"""🧮
	Generates a random value.
	
	- If no inputs are provided, returns a number between 0 and 1.
	- If one numerical input is provided, returns a number between 0 and the provided value.
	- If two numerical inputs are provided, returns a number between the two values.
	- If an array is provided, returns a random element from the array.
	
	Return value can be the lower bound but can never exactly be the upper bound.
	
	:param low: lower bound (inclusive) or an array
	:param high: upper bound (exclusive)
	:returns: a random number or element
	
	Example::
	
		Canvas(200)
		background(0.8)
		frameRate(5)
		
		def draw():
			circle(0, 0, random(200))
	"""
	...

def jit(amount: float = ...) -> float:
	"""🧮
	Generates a random number within a symmetric range around zero.
	
	Can be used to create a jitter effect (random displacement).
	
	Equivalent to random(-amount, amount).
	
	:param amount: absolute maximum amount of jitter, default is 1
	:returns: random number between -val and val
	
	Example::
	
		def draw():
			circle(mouseX + jit(3), mouseY + jit(3), 5)
	"""
	...

def noise(x: float = ..., y: float = ..., z: float = ...) -> float:
	"""🧮
	Generates a noise value based on the x, y, and z inputs.
	
	Uses Perlin Noise by default.
	
	:param x: x-coordinate input
	:param y: y-coordinate input
	:param z: z-coordinate input
	:returns: a noise value
	
	Example::
	
		def draw():
			background(0.8)
			n = noise(frameCount * 0.01)
			circle(0, 0, n * 200)
	"""
	...

def dist(x1: float, y1: float, x2: float, y2: float) -> float:
	"""🧮
	Calculates the distance between two points.
	
	This function also accepts two objects with x and y properties.
	
	:param x1: x-coordinate of the first point
	:param y1: y-coordinate of the first point
	:param x2: x-coordinate of the second point
	:param y2: y-coordinate of the second point
	:returns: distance between the points
	
	Example::
	
		def draw():
			background(0.8)
			line(0, 0, mouseX, mouseY)
		
			d = dist(0, 0, mouseX, mouseY)
			text(round(d), -80, -80)
	"""
	...

def map(val: float, start1: float, stop1: float, start2: float, stop2: float) -> float:
	"""🧮
	Maps a number from one range to another.
	
	:param val: incoming value to be converted
	:param start1: lower bound of the value's current range
	:param stop1: upper bound of the value's current range
	:param start2: lower bound of the value's target range
	:param stop2: upper bound of the value's target range
	:returns: mapped value
	"""
	...

def angleMode(mode: Literal['degrees'] | Literal['radians']) -> None:
	"""🧮
	Sets the mode for interpreting and drawing angles. Can be either 'degrees' or 'radians'.
	
	:param mode: mode to set for angle interpretation
	"""
	...

def radians(degrees: float) -> float:
	"""🧮
	Converts degrees to radians.
	
	:param degrees: angle in degrees
	:returns: angle in radians
	"""
	...

def degrees(radians: float) -> float:
	"""🧮
	Converts radians to degrees.
	
	:param radians: angle in radians
	:returns: angle in degrees
	"""
	...

def lerp(start: float, stop: float, amt: float) -> float:
	"""🧮
	Calculates a number between two numbers at a specific increment.
	
	:param start: first number
	:param stop: second number
	:param amt: amount to interpolate between the two values
	:returns: interpolated number
	"""
	...

def constrain(n: float, low: float, high: float) -> float:
	"""🧮
	Constrains a value between a minimum and maximum value.
	
	:param n: number to constrain
	:param low: lower bound
	:param high: upper bound
	:returns: constrained value
	"""
	...

def norm(n: float, start: float, stop: float) -> float:
	"""🧮
	Normalizes a number from another range into a value between 0 and 1.
	
	:param n: number to normalize
	:param start: lower bound of the range
	:param stop: upper bound of the range
	:returns: normalized number
	"""
	...

def fract(n: float) -> float:
	"""🧮
	Calculates the fractional part of a number.
	
	:param n: a number
	:returns: fractional part of the number
	"""
	...

def abs(n: float) -> float:
	"""🧮
	Calculates the absolute value of a number.
	
	:param n: a number
	:returns: absolute value of the number
	"""
	...

def round(n: float, d: float = ...) -> float:
	"""🧮
	Rounds a number.
	
	:param n: number to round
	:param d: number of decimal places to round to
	:returns: rounded number
	
	Example::
	
		Canvas(200, 100)
		background(0.8)
		textSize(32)
		text(round(PI, 5), -90, 10)
	"""
	...

def ceil(n: float) -> float:
	"""🧮
	Rounds a number up.
	
	:param n: a number
	:returns: rounded number
	
	Example::
	
		Canvas(200, 100)
		background(0.8)
		textSize(32)
		text(ceil(PI), -90, 10)
	"""
	...

def floor(n: float) -> float:
	"""🧮
	Rounds a number down.
	
	:param n: a number
	:returns: rounded number
	
	Example::
	
		Canvas(200, 100)
		background(0.8)
		textSize(32)
		text(floor(-PI), -90, 10)
	"""
	...

def min(*args: float) -> float:
	"""🧮
	Returns the smallest value in a sequence of numbers.
	
	:param args: numbers to compare
	:returns: minimum
	
	Example::
	
		def draw():
			background(min(-mouseX / 100, 0.5))
			circle(min(mouseX, 0), 0, 80)
	"""
	...

def max(*args: float) -> float:
	"""🧮
	Returns the largest value in a sequence of numbers.
	
	:param args: numbers to compare
	:returns: maximum
	
	Example::
	
		def draw():
			background(max(-mouseX / 100, 0.5))
			circle(max(mouseX, 0), 0, 80)
	"""
	...

def pow(base: float, exponent: float) -> float:
	"""🧮
	Calculates the value of a base raised to a power.
	
	For example, pow(2, 3) calculates 2 _ 2 _ 2 which is 8.
	
	:param base: base
	:param exponent: exponent
	:returns: base raised to the power of exponent
	"""
	...

def sq(n: float) -> float:
	"""🧮
	Calculates the square of a number.
	
	:param n: number to square
	:returns: square of the number
	"""
	...

def sqrt(n: float) -> float:
	"""🧮
	Calculates the square root of a number.
	
	:param n: a number
	:returns: square root of the number
	"""
	...

def loge(n: float) -> float:
	"""🧮
	Calculates the natural logarithm (base e) of a number.
	
	:param n: a number
	:returns: natural logarithm of the number
	"""
	...

def exp(exponent: float) -> float:
	"""🧮
	Calculates e raised to the power of a number.
	
	:param exponent: power to raise e to
	:returns: e raised to the power of exponent
	"""
	...

def randomSeed(seed: float) -> None:
	"""🧮
	Sets the seed for the random number generator.
	
	:param seed: seed value
	"""
	...

def randomGenerator(method: Any) -> None:
	"""🧮
	Sets the random number generation method.
	
	:param method: method to use for random number generation
	"""
	...

def randomGaussian(mean: float, std: float) -> float:
	"""🧮
	Generates a random number following a Gaussian (normal) distribution.
	
	:param mean: mean (center) of the distribution
	:param std: standard deviation (spread or "width") of the distribution
	:returns: a random number following a Gaussian distribution
	"""
	...

def randomExponential() -> float:
	"""🧮
	Generates a random number following an exponential distribution.
	:returns: a random number following an exponential distribution
	"""
	...

def noiseMode(mode: Literal['perlin'] | Literal['simplex'] | Literal['blocky']) -> None:
	"""🧮
	Sets the noise generation mode.
	
	Only the default mode, "perlin", is included in q5.js. Use of the
	other modes requires the q5-noiser module.
	
	:param mode: noise generation mode
	"""
	...

def noiseSeed(seed: float) -> None:
	"""🧮
	Sets the seed value for noise generation.
	
	:param seed: seed value
	"""
	...

def noiseDetail(lod: float, falloff: float) -> None:
	"""🧮
	Sets the level of detail for noise generation.
	
	:param lod: level of detail (number of octaves)
	:param falloff: falloff rate for each octave
	"""
	...

PI: float
"""🧮
The ratio of a circle's circumference to its diameter.
Approximately 3.14159.
"""

TWO_PI: float
"""🧮
2 * PI.
Approximately 6.28319.
"""

TAU: float
"""🧮
2 * PI.
Approximately 6.28319.
"""

HALF_PI: float
"""🧮
Half of PI.
Approximately 1.5708.
"""

QUARTER_PI: float
"""🧮
A quarter of PI.
Approximately 0.7854.
"""

# 🔊 sound

"""🔊
q5 includes low latency sound playback and basic mixing capabilities
powered by WebAudio.

For audio filtering, synthesis, and analysis, consider using the
p5.sound addon with q5.
"""

def loadSound(url: str) -> Sound:
	"""🔊
	Loads audio data from a file and returns a Sound object.
	
	Use functions like play, pause, and stop to
	control playback. Note that sounds can only be played after the
	first user interaction with the page!
	
	Set volume to a value between 0 (silent) and 1 (full volume).
	Set pan to a value between -1 (left) and 1 (right) to adjust
	the sound's stereo position. Set loop to true to loop the sound.
	
	Use loaded, paused, and ended to check the sound's status.
	
	The entire sound file must be loaded before playback can start, use await to wait for a sound to load. To stream larger audio files use the loadAudio function instead.
	
	:param url: sound file
	:returns: sound
	
	Example::
	
		Canvas(200)
		
		sound = loadSound('/assets/jump.wav')
		sound.volume = 0.3
		
		def mousePressed():
			sound.play()
	"""
	...

def loadAudio() -> None:
	"""🔊
	Loads audio data from a file and returns an HTMLAudioElement.
	
	Audio is considered loaded when the canplaythrough event is fired.
	
	Note that audio can only be played after the first user
	interaction with the page!
	
	Example::
	
		Canvas(200)
		
		audio = loadAudio('/assets/retro.flac')
		audio.volume = 0.4
		
		def mousePressed():
			audio.play()
	"""
	...

def getAudioContext() -> Any:
	"""🔊
	Returns the AudioContext in use or undefined if it doesn't exist.
	:returns: AudioContext instance
	"""
	...

async def userStartAudio() -> object:
	"""🔊
	Creates a new AudioContext or resumes it if it was suspended.
	:returns: a promise that resolves when the AudioContext is resumed
	"""
	...

class Sound:
	"""🔊
	Creates a new Q5.Sound object.
	"""


	def volume(self) -> None:
		"""🔊 Set the sound's volume to a value between
0 (silent) and 1 (full volume)."""
		...

	def pan(self) -> None:
		"""🔊 Set the sound's stereo position between -1 (left) and 1 (right)."""
		...

	def loop(self) -> None:
		"""🔊 Set to true to make the sound loop continuously."""
		...

	def loaded(self) -> None:
		"""🔊 True if the sound data has finished loading."""
		...

	def paused(self) -> None:
		"""🔊 True if the sound is currently paused."""
		...

	def ended(self) -> None:
		"""🔊 True if the sound has finished playing."""
		...

	def play(self) -> object:
		"""🔊 Plays the sound.

If this function is run when the sound is already playing,
a new playback will start, causing a layering effect.

If this function is run when the sound is paused,
all playback instances will be resumed.

Use await to wait for the sound to finish playing."""
		...

	def pause(self) -> None:
		"""🔊 Pauses the sound, allowing it to be resumed."""
		...

	def stop(self) -> None:
		"""🔊 Stops the sound, resetting its playback position
to the beginning.

Removes all playback instances."""
		...

# 📑 dom

"""📑
The Document Object Model (DOM) is an interface for
creating and editing web pages with JavaScript.
"""

def createEl(tag: str, content: str = ...) -> object:
	"""📑
	Creates a new HTML element and adds it to the page. createElement is
	an alias.
	
	Modify the element's CSS style to change its appearance.
	
	Use addEventListener to respond to events such as:
	
	- "click": when the element is clicked
	- "mouseover": when the mouse hovers over the element
	- "mouseout": when the mouse stops hovering over the element
	- "input": when a form element's value changes
	
	q5 adds some extra functionality to the elements it creates:
	
	- the position function makes it easy to place the element
	  relative to the canvas
	- the size function sets the width and height of the element
	- alternatively, use the element's x, y, width, and height properties
	
	:param tag: tag name of the element
	:param content: content of the element
	:returns: element
	
	Example::
	
		Canvas(200)
		
		el = createEl('div', '*')
		el.position(50, 50)
		el.size(100, 100)
		el.style.fontSize = '136px'
		el.style.textAlign = 'center'
		el.style.backgroundColor = 'blue'
		el.style.color = 'white'
	"""
	...

def createA(href: str, text: str = ..., newTab: bool = ...) -> None:
	"""📑
	Creates a link element.
	
	:param href: url
	:param text: text content
	:param newTab: whether to open the link in a new tab
	
	Example::
	
		Canvas(200)
		
		link = createA('https://q5js.org', 'q5.js')
		link.position(16, 42)
		link.style.fontSize = '80px'
		
		link.addEventListener('mouseover', () =>
			background('cyan')
			})
	"""
	...

def createButton(content: str = ...) -> None:
	"""📑
	Creates a button element.
	
	:param content: text content
	
	Example::
	
		Canvas(200, 100)
		
		btn = createButton('Click me!')
		
		btn.addEventListener('click', () =>
			background(random(0.4, 1))
			})
	"""
	...

def createCheckbox(label: str = ..., checked: bool = ...) -> None:
	"""📑
	Creates a checkbox element.
	
	Use the checked property to get or set the checkbox's state.
	
	The label property is the text label element next to the checkbox.
	
	:param label: text label placed next to the checkbox
	:param checked: initial state
	
	Example::
	
		Canvas(200, 100)
		
		box = createCheckbox('Check me!')
		box.label.style.color = 'lime'
		
		box.addEventListener('input', () =>
			if box.checked: background('lime')
			else: background('black')
			})
	"""
	...

def createColorPicker(value: str = ...) -> None:
	"""📑
	Creates a color input element.
	
	Use the value property to get or set the color value.
	
	:param value: initial color value
	
	Example::
	
		Canvas(200, 100)
		
		picker = createColorPicker()
		picker.value = '#fd7575'
		
		def draw():
			background(picker.value)
	"""
	...

def createImg(src: str) -> None:
	"""📑
	Creates an image element.
	
	:param src: url of the image
	
	Example::
	
		Canvas(200, 100)
		
		img = createImg('/assets/q5play_logo.avif')
		img.position(0, 0).size(100, 100)
	"""
	...

def createInput(value: str = ..., type: str = ...) -> None:
	"""📑
	Creates an input element.
	
	Use the value property to get or set the input's value.
	
	Use the placeholder property to set label text that appears
	inside the input when it's empty.
	
	See MDN's input documentation for the full list of input types.
	
	:param value: initial value
	:param type: text input type, can be 'text', 'password', 'email', 'number', 'range', 'search', 'tel', 'url'
	
	Example::
	
		Canvas(200, 100)
		textSize(64)
		
		input = createInput()
		input.placeholder = 'Type here!'
		input.size(200, 32)
		
		input.addEventListener('input', () =>
			background('orange')
			text(input.value, -90, 30)
			})
	"""
	...

def createP(content: str = ...) -> None:
	"""📑
	Creates a paragraph element.
	
	:param content: text content
	
	Example::
	
		Canvas(200, 50)
		background('coral')
		
		p = createP('Hello, world!')
		p.style.color = 'pink'
	"""
	...

def createRadio(groupName: str = ...) -> None:
	"""📑
	Creates a radio button group.
	
	Use the option(label, value) function to add new radio buttons
	to the group.
	
	Use the value property to get or set the value of the selected radio button.
	
	:param groupName: 
	
	Example::
	
		Canvas(200, 160)
		
		radio = createRadio()
		radio.option('square', '1')
		radio.option('circle', '2')
		
		def draw():
			background(0.8)
			if radio.value == '1': square(-40, -40, 80)
			if radio.value == '2': circle(0, 0, 80)
	"""
	...

def createSelect(placeholder: str = ...) -> None:
	"""📑
	Creates a select element.
	
	Use the option(label, value) function to add new options to
	the select element.
	
	Set multiple to true to allow multiple options to be selected.
	
	Use the value property to get or set the selected option value.
	
	Use the selected property get the labels of the selected
	options or set the selected options by label. Can be a single
	string or an array of strings.
	
	:param placeholder: optional placeholder text that appears before an option is selected
	
	Example::
	
		Canvas(200, 100)
		
		sel = createSelect('Select an option')
		sel.option('Red', '#f55')
		sel.option('Green', '#5f5')
		
		sel.addEventListener('change', () =>
			background(sel.value)
			})
	"""
	...

def createSlider(min: float, max: float, value: float = ..., step: float = ...) -> None:
	"""📑
	Creates a slider element.
	
	Use the value property to get or set the slider's value.
	
	Use the val function to get the slider's value as a number.
	
	:param min: minimum value
	:param max: maximum value
	:param value: initial value
	:param step: step size
	
	Example::
	
		Canvas(200)
		
		slider = createSlider(0, 1, 0.5, 0.1)
		slider.position(10, 10).size(180)
		
		def draw():
			background(slider.val())
	"""
	...

def createVideo(src: str) -> object:
	"""📑
	Creates a video element.
	
	Note that videos must be muted to autoplay and the play and
	pause functions can only be run after a user interaction.
	
	The video element can be hidden and its content can be
	displayed on the canvas using the image function.
	
	:param src: url of the video
	:returns: a new video element
	
	Example::
	
		Canvas(1)
		
		vid = createVideo('/assets/apollo4.mp4')
		vid.size(200, 150)
		vid.autoplay = vid.muted = vid.loop = True
		vid.controls = True
	"""
	...

def createCapture(type: str = ..., flipped: bool = ...) -> object:
	"""📑
	Creates a capture from a connected camera, such as a webcam.
	
	The capture video element can be hidden and its content can be
	displayed on the canvas using the image function.
	
	Can preload to ensure the capture is ready to use when your
	sketch starts.
	
	Requests the highest video resolution from the user facing camera
	by default. The first parameter to this function can be used to
	specify the constraints for the capture. See getUserMedia
	for more info.
	
	:param type: type of capture, can be only VIDEO or only AUDIO, the default is to use both video and audio
	:param flipped: whether to mirror the video vertically, true by default
	:returns: a new video element
	
	Example::
	
		def mousePressed():
			cap = createCapture(VIDEO)
			cap.size(200, 112.5)
			canvas.remove()
	"""
	...

def findEl(selector: str) -> object:
	"""📑
	Finds the first element in the DOM that matches the given CSS selector.
	
	Alias for document.querySelector.
	
	:param selector: 
	:returns: element
	"""
	...

def findEls(selector: str) -> list[object]:
	"""📑
	Finds all elements in the DOM that match the given CSS selector.
	
	Alias for document.querySelectorAll.
	
	:param selector: 
	:returns: elements
	"""
	...

# 🎞 record

def createRecorder() -> object:
	"""🎞
	Creates a recorder. Simply hit record to start recording!
	
	The following properties can be set via the recorder UI or
	programmatically.
	
	- format is set to "H.264" by default.
	- bitrate is a number in megabits per second (mbps). Its default
	  value is determined by the height of the canvas. Increasing the
	  bitrate will increase the quality and file size of the recording.
	- captureAudio is set to true by default. Set to false to disable
	  audio recording.
	
	Note that recordings are done at a variable frame rate (VFR), which
	makes the output video incompatible with some editing software.
	For more info, see the
	"Recording the Canvas".
	wiki page.
	:returns: a recorder, q5 DOM element
	
	Example::
	
		Canvas(200)
		
		rec = createRecorder()
		rec.bitrate = 10
		
		def draw():
			circle(mouseX, jit(halfHeight), 10)
	"""
	...

def record() -> None:
	"""🎞
	Starts recording the canvas or resumes recording if it was paused.
	
	If no recorder exists, one is created but not displayed.
	"""
	...

def pauseRecording() -> None:
	"""🎞
	Pauses the canvas recording, if one is in progress.
	"""
	...

def deleteRecording() -> None:
	"""🎞
	Discards the current recording.
	"""
	...

def saveRecording(fileName: str) -> None:
	"""🎞
	Saves the current recording as a video file.
	
	:param fileName: 
	
	Example::
	
		def draw():
			square(mouseX, jit(100), 10)
		
		def mousePressed():
			if !recording: record()
			else: saveRecording('squares')
	"""
	...

recording: bool
"""🎞
True if the canvas is currently being recorded.
"""

# 🛠 utilities

async def load(*urls: str) -> object:
	"""🛠
	Loads a file or multiple files.
	
	File type is determined by file extension. q5 supports loading
	text, json, csv, font, audio, and image files.
	
	By default, assets are loaded in parallel before q5 runs draw. Use await to wait for assets to load.
	
	:param urls: 
	:returns: a promise that resolves with objects
	
	Example::
	
		Canvas(200)
		
		logo = load('/q5js_logo.avif')
		
		def draw():
			image(logo, -100, -100, 200, 200)
	"""
	...

def save(data: dict = ..., fileName: str = ...) -> None:
	"""🛠
	Saves data to a file.
	
	If data is not specified, the canvas will be saved.
	
	If no arguments are provided, the canvas will be saved as
	an image file named "untitled.png".
	
	:param data: canvas, image, or JS object
	:param fileName: filename to save as
	
	Example::
	
		Canvas(200)
		background(0.8)
		circle(0, 0, 50)
		
		def mousePressed():
			save('circle.png')
	"""
	...

def millis() -> float:
	"""🛠
	Returns the number of milliseconds since the program started.
	:returns: milliseconds since the program started
	
	Example::
	
		Canvas(200)
		
		def draw():
			background(0.8)
		
			if millis(: > 2000)
				text('Hello, world!', -90, 0)
	"""
	...

def loadText(url: str) -> dict:
	"""🛠
	Loads a text file from the specified url.
	
	Using await to get the loaded text as a string is recommended.
	
	:param url: text file
	:returns: an object containing the loaded text in the property obj.text or use await to get the text string directly
	"""
	...

def loadJSON(url: str) -> Any:
	"""🛠
	Loads a JSON file from the specified url.
	
	Using await to get the loaded JSON object or array is recommended.
	
	:param url: JSON file
	:returns: an object or array containing the loaded JSON
	"""
	...

def loadCSV(url: str) -> list[dict]:
	"""🛠
	Loads a CSV file from the specified url.
	
	Using await to get the loaded CSV as an array of objects is recommended.
	
	:param url: CSV file
	:returns: an array of objects containing the loaded CSV
	"""
	...

def loadXML(url: str) -> Any:
	"""🛠
	Loads an xml file from the specified url.
	
	Using await to get the loaded XML Element is recommended.
	
	:param url: xml file
	:returns: an object containing the loaded XML Element in a property called obj.DOM or use await to get the XML Element directly
	
	Example::
	
		Canvas(200)
		background(0.8)
		textSize(32)
		
		xml = await load('/assets/animals.xml')
		mammals = xml.querySelectorAll('mammal')
		y = -90
		for (let mammal of mammals)
			text(mammal.textContent, -90, (y += 32))
	"""
	...

def loadAll() -> object:
	"""🛠
	Wait for any assets that started loading to finish loading. By default q5 runs this before looping draw (which is called preloading), but it can be used even after draw starts looping.
	:returns: a promise that resolves with loaded objects
	"""
	...

def disablePreload() -> None:
	"""🛠
	Disables the automatic preloading of assets before draw starts looping. This allows draw to start immediately, and assets can be lazy loaded or loadAll() can be used to wait for assets to finish loading later.
	"""
	...

def nf(num: float, digits: float) -> str:
	"""🛠
	nf is short for number format. It formats a number
	to a string with a specified number of digits.
	
	:param num: number to format
	:param digits: number of digits to format to
	:returns: formatted number
	
	Example::
	
		Canvas(200, 100)
		background(0.8)
		
		textSize(32)
		text(nf(PI, 4, 5), -90, 10)
	"""
	...

def shuffle(arr: list[Any], modify: bool = ...) -> list[Any]:
	"""🛠
	Shuffles the elements of an array.
	
	:param arr: array to shuffle
	:param modify: whether to modify the original array, false by default which copies the array before shuffling
	:returns: shuffled array
	"""
	...

def storeItem(key: str, val: str) -> None:
	"""🛠
	Stores an item in localStorage.
	
	:param key: key under which to store the item
	:param val: value to store
	"""
	...

def getItem(key: str) -> str:
	"""🛠
	Retrieves an item from localStorage.
	
	:param key: key of the item to retrieve
	:returns: value of the retrieved item
	"""
	...

def removeItem(key: str) -> None:
	"""🛠
	Removes an item from localStorage.
	
	:param key: key of the item to remove
	"""
	...

def clearStorage() -> None:
	"""🛠
	Clears all items from localStorage.
	"""
	...

def year() -> float:
	"""🛠
	Returns the current year.
	:returns: current year
	"""
	...

def day() -> float:
	"""🛠
	Returns the current day of the month.
	:returns: current day
	"""
	...

def hour() -> float:
	"""🛠
	Returns the current hour.
	:returns: current hour
	"""
	...

def minute() -> float:
	"""🛠
	Returns the current minute.
	:returns: current minute
	"""
	...

def second() -> float:
	"""🛠
	Returns the current second.
	:returns: current second
	"""
	...

# ↗ vector

class Vector:
	"""↗
	Constructs a new Vector object.
	"""


	def x(self) -> None:
		"""↗ The x component of the vector."""
		...

	def y(self) -> None:
		"""↗ The y component of the vector."""
		...

	def z(self) -> None:
		"""↗ The z component of the vector, if applicable."""
		...

	def add(self, v: Vector) -> Vector:
		"""↗ Adds a vector to this vector."""
		...

	def sub(self, v: Vector) -> Vector:
		"""↗ Subtracts a vector from this vector."""
		...

	def mult(self, n: float | Vector) -> Vector:
		"""↗ Multiplies this vector by a scalar or element-wise by another vector."""
		...

	def div(self, n: float | Vector) -> Vector:
		"""↗ Divides this vector by a scalar or element-wise by another vector."""
		...

	def mag(self) -> float:
		"""↗ Calculates the magnitude (length) of the vector."""
		...

	def normalize(self) -> Vector:
		"""↗ Normalizes the vector to a length of 1 (making it a unit vector)."""
		...

	def setMag(self, len: float) -> Vector:
		"""↗ Sets the magnitude of the vector to the specified length."""
		...

	def dot(self, v: Vector) -> float:
		"""↗ Calculates the dot product of this vector and another vector."""
		...

	def cross(self, v: Vector) -> Vector:
		"""↗ Calculates the cross product of this vector and another vector."""
		...

	def dist(self, v: Vector) -> float:
		"""↗ Calculates the distance between this vector and another vector."""
		...

	def copy(self) -> Vector:
		"""↗ Copies this vector."""
		...

	def set(self, x: float, y: float, z: float = ...) -> None:
		"""↗ Sets the components of the vector."""
		...

	def limit(self, max: float) -> Vector:
		"""↗ Limits the magnitude of the vector to the value used for the max parameter."""
		...

	def heading(self) -> float:
		"""↗ Calculates the angle of rotation for this vector (only 2D vectors)."""
		...

	def setHeading(self, angle: float) -> Vector:
		"""↗ Rotates the vector to a specific angle without changing its magnitude."""
		...

	def rotate(self, angle: float) -> Vector:
		"""↗ Rotates the vector by the given angle (only 2D vectors)."""
		...

	def lerp(self, v: Vector, amt: float) -> Vector:
		"""↗ Linearly interpolates between this vector and another vector."""
		...

	def slerp(self, v: Vector, amt: float) -> Vector:
		"""↗ Linearly interpolates between this vector and another vector, including the magnitude."""
		...

# 🖌 shaping

def arc(x: float, y: float, w: float, h: float, start: float, stop: float, mode: float = ...) -> None:
	"""🖌
	Draws an arc, which is a section of an ellipse.
	
	ellipseMode affects how the arc is drawn.
	
	q5 WebGPU only supports the default PIE_OPEN mode.
	
	:param x: x-coordinate
	:param y: y-coordinate
	:param w: width of the ellipse
	:param h: height of the ellipse
	:param start: angle to start the arc
	:param stop: angle to stop the arc
	:param mode: shape and stroke style setting, default is PIE_OPEN for a pie shape with an unclosed stroke, can be PIE, CHORD, or CHORD_OPEN
	
	Example::
	
		Canvas(200)
		background(0.8)
		
		arc(0, 0, 160, 160, 0.8, -0.8)
	"""
	...

def curve() -> None:
	"""🖌
	Draws a curve.
	
	Example::
	
		Canvas(200, 100)
		background(0.8)
		
		curve(-100, -200, -50, 0, 50, 0, 100, -200)
	"""
	...

def curveDetail(val: float) -> None:
	"""🖌
	Sets the amount of straight line segments used to make a curve.
	
	Only takes effect in q5 WebGPU.
	
	:param val: curve detail level, default is 20
	
	Example::
	
		Canvas(200)
		
		curveDetail(4)
		
		strokeWeight(10)
		stroke(0, 1, 1)
		curve(-100, -200, -50, 0, 50, 0, 100, -200)
	"""
	...

def beginShape() -> None:
	"""🖌
	Starts storing vertices for a shape.
	"""
	...

def endShape(close: bool = ...) -> None:
	"""🖌
	Ends storing vertices for a shape.
	
	:param close: whether to close the shape by connecting the last vertex to the first vertex, default is false
	"""
	...

def vertex(x: float, y: float) -> None:
	"""🖌
	Specifies a vertex in a shape.
	
	:param x: x-coordinate
	:param y: y-coordinate
	
	Example::
	
		Canvas(200)
		
		stroke(1, 0.5)
		strokeWeight(20)
		
		beginShape()
		fill(1, 0, 0)
		vertex(-80, -80)
		vertex(40, -60)
		fill(0, 0, 1)
		vertex(80, 60)
		vertex(-60, 80)
		endShape(True)
	"""
	...

def bezierVertex(cp1x: float, cp1y: float, cp2x: float, cp2y: float, x: float, y: float) -> None:
	"""🖌
	Specifies a Bezier vertex in a shape.
	
	:param cp1x: x-coordinate of the first control point
	:param cp1y: y-coordinate of the first control point
	:param cp2x: x-coordinate of the second control point
	:param cp2y: y-coordinate of the second control point
	:param x: x-coordinate of the anchor point
	:param y: y-coordinate of the anchor point
	"""
	...

def quadraticVertex(cp1x: float, cp1y: float, x: float, y: float) -> None:
	"""🖌
	Specifies a quadratic Bezier vertex in a shape.
	
	:param cp1x: x-coordinate of the control point
	:param cp1y: y-coordinate of the control point
	:param x: x-coordinate of the anchor point
	:param y: y-coordinate of the anchor point
	"""
	...

def bezier(x1: float, y1: float, x2: float, y2: float, x3: float, y3: float, x4: float, y4: float) -> None:
	"""🖌
	Draws a Bezier curve.
	
	:param x1: x-coordinate of the first anchor point
	:param y1: y-coordinate of the first anchor point
	:param x2: x-coordinate of the first control point
	:param y2: y-coordinate of the first control point
	:param x3: x-coordinate of the second control point
	:param y3: y-coordinate of the second control point
	:param x4: x-coordinate of the second anchor point
	:param y4: y-coordinate of the second anchor point
	"""
	...

def triangle(x1: float, y1: float, x2: float, y2: float, x3: float, y3: float) -> None:
	"""🖌
	Draws a triangle.
	
	:param x1: x-coordinate of the first vertex
	:param y1: y-coordinate of the first vertex
	:param x2: x-coordinate of the second vertex
	:param y2: y-coordinate of the second vertex
	:param x3: x-coordinate of the third vertex
	:param y3: y-coordinate of the third vertex
	"""
	...

def quad(x1: float, y1: float, x2: float, y2: float, x3: float, y3: float, x4: float, y4: float) -> None:
	"""🖌
	Draws a quadrilateral.
	
	:param x1: x-coordinate of the first vertex
	:param y1: y-coordinate of the first vertex
	:param x2: x-coordinate of the second vertex
	:param y2: y-coordinate of the second vertex
	:param x3: x-coordinate of the third vertex
	:param y3: y-coordinate of the third vertex
	:param x4: x-coordinate of the fourth vertex
	:param y4: y-coordinate of the fourth vertex
	"""
	...

def beginContour() -> None:
	"""🖌
	Starts storing vertices for a contour.
	
	Not available in q5 WebGPU.
	"""
	...

def endContour() -> None:
	"""🖌
	Ends storing vertices for a contour.
	
	Not available in q5 WebGPU.
	"""
	...

# ⚡ shaders

"""⚡
Custom shaders written in WGSL (WebGPU Shading Language) can be
used to create advanced visual effects in q5!
"""

def createShader(code: str, type: str = ..., data: list[float] = ...) -> Any:
	"""⚡
	Creates a shader that q5's WebGPU renderer can use.
	
	If type is not specified, this function customizes a copy of the default shapes shader, which affects these functions: plane, line, and endShape.
	
	For more information on the vertex and fragment function
	input parameters, data, and helper functions made available for use
	in your custom shader code, read the
	"Custom Shaders in q5 WebGPU"
	wiki page.
	
	:param code: WGSL shader code excerpt
	:param type: defaults to "shapes"
	:param data: only for use with fully custom shaders
	:returns: a shader program
	
	Example::
	
		Canvas(200)
		
		wobble = createShader(`
		@vertex
		fn vertexMain(v: VertexParams) -> FragParams
			vert = transformVertex(v.pos, v.matrixIndex)
		
			i = f32(v.vertexIndex) % 4 * 100
			vert.x += cos((q.time + i) * 0.01) * 0.1
		
			f: FragParams
			f.position = vert
			f.color = vec4f(1, 0, 0, 1)
			return f
			}`)
		
			def draw():
				clear()
				shader(wobble)
				plane(0, 0, 100)
	"""
	...

def plane(x: float, y: float, w: float, h: float = ...) -> None:
	"""⚡
	A plane is a centered rectangle with no stroke.
	
	:param x: center x
	:param y: center y
	:param w: width or side length
	:param h: height
	
	Example::
	
		Canvas(200)
		plane(0, 0, 100)
	"""
	...

def shader(shaderModule: Any) -> None:
	"""⚡
	Applies a shader.
	
	:param shaderModule: a shader program
	"""
	...

def resetShader() -> None:
	"""⚡
	Make q5 use the default shapes shader.
	
	Example::
	
		Canvas(200)
		
		stripes = createShader(`
		@fragment
		fn fragMain(f: FragParams) -> @location(0) vec4f
			g = cos((q.mouseY + f.position.y) * 0.05)
			return vec4(1, g, 0, 1)
			}`)
		
			def draw():
				shader(stripes)
				plane(0, 0, width, height)
		
				resetShader()
				triangle(-50, -50, 0, 50, 50, -50)
	"""
	...

def resetFrameShader() -> None:
	"""⚡
	Make q5 use the default frame shader.
	"""
	...

def resetImageShader() -> None:
	"""⚡
	Make q5 use the default image shader.
	"""
	...

def resetVideoShader() -> None:
	"""⚡
	Make q5 use the default video shader.
	"""
	...

def resetTextShader() -> None:
	"""⚡
	Make q5 use the default text shader.
	"""
	...

def resetShaders() -> None:
	"""⚡
	Make q5 use all default shaders.
	"""
	...

def createFrameShader() -> None:
	"""⚡
	Creates a shader that q5 can use to draw frames.
	
	Use this function to customize a copy of the
	default frame shader.
	
	Example::
	
		Canvas(200, 400)
		stroke(1)
		strokeWeight(8)
		strokeCap(PROJECT)
		
		boxy = createFrameShader(`
		@fragment
		fn fragMain(f: FragParams) -> @location(0) vec4f
			x = sin(f.texCoord.y * 4 + q.time * 0.002)
			y = cos(f.texCoord.x * 4 + q.time * 0.002)
			uv = f.texCoord + vec2f(x, y)
			return textureSample(tex, samp, uv)
			}`)
		
			def draw():
				line(mouseX, mouseY, pmouseX, pmouseY)
				mouseIsPressed ? resetShaders() : shader(boxy)
	"""
	...

def createImageShader(code: str) -> Any:
	"""⚡
	Creates a shader that q5 can use to draw images.
	
	Use this function to customize a copy of the
	default image shader.
	
	:param code: WGSL shader code excerpt
	:returns: a shader program
	
	Example::
	
		Canvas(200, 400)
		imageMode(CENTER)
		
		logo = loadImage('/q5js_logo.avif')
		
		grate = createImageShader(`
		@fragment
		fn fragMain(f: FragParams) -> @location(0) vec4f
			texColor = textureSample(tex, samp, f.texCoord)
			texColor.b += (q.mouseX + f.position.x) % 20 / 10
			return texColor
			}`)
		
			def draw():
				background(0.7)
				shader(grate)
				image(logo, 0, 0, 180, 180)
	"""
	...

def createVideoShader(code: str) -> Any:
	"""⚡
	Creates a shader that q5 can use to draw video frames.
	
	Use this function to customize a copy of the
	default video shader.
	
	:param code: WGSL shader code excerpt
	:returns: a shader program
	
	Example::
	
		Canvas(200, 600)
		
		vid = createVideo('/assets/apollo4.mp4')
		vid.hide()
		
		flipper = createVideoShader(`
		@vertex
		fn vertexMain(v: VertexParams) -> FragParams
			vert = transformVertex(v.pos, v.matrixIndex)
		
			vi = f32(v.vertexIndex)
			vert.y *= cos((q.frameCount + vi * 10) * 0.03)
		
			f: FragParams
			f.position = vert
			f.texCoord = v.texCoord
			return f
		
		@fragment
		fn fragMain(f: FragParams) -> @location(0) vec4f
			texColor = textureSampleBaseClampToEdge(tex, samp, f.texCoord)
			texColor.r = 0
			texColor.b *= 2
			return texColor
			}`)
		
			def draw():
				clear()
				if mouseIsPressed: vid.play()
				shader(flipper)
				image(vid, -100, 150, 200, 150)
	"""
	...

def createTextShader(code: str) -> Any:
	"""⚡
	Creates a shader that q5 can use to draw text.
	
	Use this function to customize a copy of the
	default text shader.
	
	:param code: WGSL shader code excerpt
	:returns: a shader program
	
	Example::
	
		Canvas(200)
		textAlign(CENTER, CENTER)
		
		spin = createTextShader(`
		@vertex
		fn vertexMain(v : VertexParams) -> FragParams
			char = textChars[v.instanceIndex]
			text = textMetadata[i32(char.w)]
			fontChar = fontChars[i32(char.z)]
			pos = calcPos(v.vertexIndex, char, fontChar, text)
		
			vert = transformVertex(pos, text.matrixIndex)
		
			i = f32(v.instanceIndex + 1)
			vert.y *= cos((q.frameCount - 5 * i) * 0.05)
		
			f : FragParams
			f.position = vert
			f.texCoord = calcUV(v.vertexIndex, fontChar)
			f.fillColor = colors[i32(text.fillIndex)]
			f.strokeColor = colors[i32(text.strokeIndex)]
			f.strokeWeight = text.strokeWeight
			f.edge = text.edge
			return f
			}`)
		
			def draw():
				clear()
				shader(spin)
				fill(1, 0, 1)
				textSize(32)
				text('Hello, World!', 0, 0)
	"""
	...

# ⚙ advanced

q5: type[Q5]
"""⚙
Alias for Q5.
"""

class Q5:
	"""⚙
	Creates an instance of Q5.
	
	Used by the global Canvas function.
	"""


	def version(self) -> str:
		"""⚙ The current minor version of q5."""
		...

	def lang(self) -> None:
		"""⚙ Set to a language code other than 'en' (English) to use q5 in an additional language.

Currently supported languages:

- 'es' (Spanish)"""
		...

	def disableFriendlyErrors(self) -> None:
		"""⚙ Turn off q5's friendly error messages."""
		...

	def errorTolerant(self) -> None:
		"""⚙ Set to true to keep draw looping after an error."""
		...

	def supportsHDR(self) -> None:
		"""⚙ True if the device supports HDR (the display-p3 colorspace)."""
		...

	def canvasOptions(self) -> None:
		"""⚙ Sets the default canvas context attributes used for newly created
canvases and internal graphics. These options are overwritten by any
per-canvas options you pass to Canvas."""
		...

	def MAX_TRANSFORMS(self) -> None:
		"""⚙ A WebGPU memory allocation limit.

The maximum number of transformation matrixes
that can be used per frame."""
		...

	def MAX_RECTS(self) -> None:
		"""⚙ A WebGPU memory allocation limit.

The maximum number of rectangles
(calls to rect, square, capsule)
that can be drawn per frame."""
		...

	def MAX_ELLIPSES(self) -> None:
		"""⚙ A WebGPU memory allocation limit.

The maximum number of ellipses
(calls to ellipse, circle, and arc)
that can be drawn per frame."""
		...

	def MAX_CHARS(self) -> None:
		"""⚙ A WebGPU memory allocation limit.

The maximum number of text characters
that can be drawn per frame."""
		...

	def MAX_TEXTS(self) -> None:
		"""⚙ A WebGPU memory allocation limit.

The maximum number of separate calls to text
that can be drawn per frame."""
		...

	def WebGPU(self) -> None:
		"""⚙ Creates a new Q5 instance that uses q5's WebGPU renderer."""
		...

	def addHook(self, lifecycle: str, fn: Callable[..., Any]) -> None:
		"""⚙ Addons can augment q5 with new functionality by adding hooks,
functions to be run at specific phases in the q5 lifecycle.

Inside the function, this refers to the Q5 instance."""
		...

	def registerAddon(self, addon: Callable[..., Any]) -> None:
		"""⚙ p5.js v2 compatible way to register an addon with q5."""
		...

	def modules(self) -> None:
		"""⚙ An object containing q5's modules, functions that run when q5 loads.

Each function receives two input parameters:

- the q5 instance
- a proxy for editing the q5 instance and corresponding properties of the global scope"""
		...

	def draw(self) -> None:
		"""⚙ The q5 draw function is run 60 times per second by default."""
		...

	def postProcess(self) -> None:
		"""⚙ Runs after each draw function call and post-draw q5 addon processes, if any.

Useful for adding post-processing effects when it's not possible
to do so at the end of the draw function, such as when using
addons like q5play that auto-draw to the canvas after the draw
function is run."""
		...
