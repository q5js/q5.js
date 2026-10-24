from typing import Any, Callable, Literal

class Image: ...

# ⭐ núcleo

"""⭐
Bienvenido al contenido de q5! 🤩

¿Primera vez programando? Revisa la guía para principiantes de q5.

En estas páginas de "Aprender" puedes experimentar editando los mini ejemplos. ¡Diviértete! 😎

![](https://notbyai.fyi/)
"""

async def Lienzo(ancho: float = ..., alto: float = ..., opciones: dict = ...) -> object:
	"""⭐
	Crea un elemento de lienzo, una sección de la pantalla donde tu programa
	puede dibujar.
	
	¡Ejecuta esta función para empezar a usar q5!
	
	Ten en cuenta que en este ejemplo, el círculo se encuentra en la posición [0, 0], el origen del lienzo.
	
	:param ancho: ancho del lienzo en píxeles
	:param alto: alto del lienzo en píxeles
	:param opciones: opciones para el contexto 2d
	:returns: una promesa que se resuelve con el elemento canvas creado
	
	Example::
	
		Lienzo(200, 100)
		fondo('silver')
		circulo(0, 0, 80)
	"""
	...

def dibujar() -> None:
	"""⭐
	Función a declarar. Se ejecutará 60 veces por segundo de forma predeterminada. Tiene comportamiento de bucle, lo que permite hacer animaciones cuadro a cuadro.
	
	Example::
	
		def dibujar():
			fondo('silver')
			circulo(ratonX, ratonY, 80)
	"""
	...

def log(mensaje: Any) -> None:
	"""⭐
	Imprime un mensaje en la consola de JavaScript. Atajo para console.log().
	
	Para acceder a las herramientas del navegador (DevTools) generalmente es con click derecho + "inspeccionar", o presionando las teclas ctrl + shift + i o command + option + i. La consola se encuentra en la pestaña "console".
	
	:param mensaje: a imprimir
	
	Example::
	
		def dibujar():
			circulo(ratonX, ratonY, 80)
			log('El ratón está en:', ratonX, ratonY)
	"""
	...

# 🧑‍🎨 formas

def circulo(x: float, y: float, diámetro: float) -> None:
	"""🧑‍🎨
	Dibuja un círculo en la posición (x, y) con el diámetro especificado.
	
	:param x: posición x del centro del círculo
	:param y: posición y del centro del círculo
	:param diámetro: del círculo
	
	Example::
	
		Lienzo(200, 100)
		circulo(0, 0, 80)
	"""
	...

def elipse(x: float, y: float, ancho: float, alto: float = ...) -> None:
	"""🧑‍🎨
	Dibuja una elipse.
	
	:param x: posición x
	:param y: posición y
	:param ancho: ancho de la elipse
	:param alto: alto de la elipse
	
	Example::
	
		Lienzo(200, 100)
		elipse(0, 0, 160, 80)
	"""
	...

def rect(x: float, y: float, w: float, h: float = ..., redondeado: float = ...) -> None:
	"""🧑‍🎨
	Dibuja un rectángulo o un rectángulo redondeado.
	
	:param x: posición x
	:param y: posición y
	:param w: ancho del rectángulo
	:param h: alto del rectángulo
	:param redondeado: radio para todas las esquinas
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		rect(-70, -80, 40, 60)
		rect(-20, -30, 40, 60, 10)
		rect(30, 20, 40, 60, 30)
	"""
	...

def cuadrado(x: float, y: float, tamaño: float, redondeado: float = ...) -> None:
	"""🧑‍🎨
	Dibuja un cuadrado o un cuadrado redondeado.
	
	:param x: posición x
	:param y: posición y
	:param tamaño: tamaño de los lados del cuadrado
	:param redondeado: radio para todas las esquinas
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		cuadrado(-70, -70, 40)
		cuadrado(-20, -20, 40, 10)
		cuadrado(30, 30, 40, 30)
	"""
	...

def punto(x: float, y: float) -> None:
	"""🧑‍🎨
	Dibuja un punto en el lienzo.
	
	:param x: posición x
	:param y: posición y
	
	Example::
	
		Lienzo(200, 100)
		trazo('white')
		punto(-25, 0)
		
		grosorTrazo(10)
		punto(25, 0)
	"""
	...

def linea(x1: float, y1: float, x2: float, y2: float) -> None:
	"""🧑‍🎨
	Dibuja una línea en el lienzo.
	
	:param x1: posición x del primer punto
	:param y1: posición y del primer punto
	:param x2: posición x del segundo punto
	:param y2: posición y del segundo punto
	
	Example::
	
		Lienzo(200, 100)
		trazo('lime')
		linea(-80, -30, 80, 30)
	"""
	...

def capsula(x1: float, y1: float, x2: float, y2: float, r: float) -> None:
	"""🧑‍🎨
	Dibuja una cápsula.
	
	:param x1: posición x del primer punto
	:param y1: posición y del primer punto
	:param x2: posición x del segundo punto
	:param y2: posición y del segundo punto
	:param r: radio de los extremos semicirculares de la cápsula
	
	Example::
	
		Lienzo(200, 100)
		fondo(0.8)
		grosorTrazo(5)
		capsula(-60, -10, 60, 10, 10)
	"""
	...

def modoRect(modo: str) -> None:
	"""🧑‍🎨
	Establecer a ESQUINA (por defecto), CENTRO, RADIO, o ESQUINAS.
	
	Cambia cómo se interpretan las primeras cuatro entradas para
	rect y cuadrado.
	
	:param modo: 
	
	Example::
	
		Lienzo(200, 100)
		fondo(0.8)
		modoRect(ESQUINA)
		
		#   ( x,  y,   w,  h)
		rect(-50, -25, 100, 50)
	"""
	...

def modoEliptico(modo: str) -> None:
	"""🧑‍🎨
	Establecer a CENTRO (por defecto), RADIO, ESQUINA, o ESQUINAS.
	
	Cambia cómo se interpretan las primeras cuatro entradas para
	elipse, circulo, y arco.
	
	:param modo: 
	
	Example::
	
		Lienzo(200, 100)
		fondo(0.8)
		modoEliptico(CENTRO)
		
		#     (  x,  y,   w,  h)
		elipse(0, 0, 100, 50)
	"""
	...

ESQUINA: Literal['corner']
"""🧑‍🎨
Modo de alineación de forma, para usar en modoRect y modoEliptico.
"""

RADIO: Literal['radius']
"""🧑‍🎨
Modo de alineación de forma, para usar en modoRect y modoEliptico.
"""

ESQUINAS: Literal['corners']
"""🧑‍🎨
Modo de alineación de forma, para usar en modoRect y modoEliptico.
"""

# 🌆 imagen

def cargarImagen(url: str) -> Image:
	"""🌆
	Carga una imagen desde una URL.
	
	Por defecto, los recursos se cargan en paralelo antes de que q5 ejecute dibujar. Usa await para esperar a que una imagen se cargue.
	
	:param url: url de la imagen a cargar
	:returns: imagen
	
	Example::
	
		Lienzo(200)
		
		logo = cargarImagen('/q5js_logo.avif')
		
		def dibujar():
			fondo(logo)
	"""
	...

def imagen(img: Image | object, dx: float, dy: float, dw: float = ..., dh: float = ..., sx: float = ..., sy: float = ..., sw: float = ..., sh: float = ...) -> None:
	"""🌆
	Dibuja una imagen o fotograma de video en el lienzo.
	
	:param img: imagen o video a dibujar
	:param dx: posición x donde dibujar la imagen
	:param dy: posición y donde dibujar la imagen
	:param dw: ancho de la imagen de destino
	:param dh: alto de la imagen de destino
	:param sx: posición x en la fuente para empezar a recortar una subsección
	:param sy: posición y en la fuente para empezar a recortar una subsección
	:param sw: ancho de la subsección de la imagen fuente
	:param sh: alto de la subsección de la imagen fuente
	
	Example::
	
		Lienzo(200)
		
		logo = cargarImagen('/q5js_logo.avif')
		
		def dibujar():
			imagen(logo, -100, -100, 200, 200)
	"""
	...

def modoImagen(modo: str) -> None:
	"""🌆
	Establecer a CORNER (por defecto), CORNERS, o CENTER.
	
	Cambia cómo se interpretan las entradas a imagen.
	
	:param modo: 
	
	Example::
	
		Lienzo(200)
		logo = cargarImagen('/q5js_logo.avif')
		
		def dibujar():
			modoImagen(CORNER)
		
			#     ( img,  x,  y,   w,   h)
			imagen(logo, -50, -50, 100, 100)
	"""
	...

def escalaImagenPorDefecto(escala: float) -> float:
	"""🌆
	Establece la escala de imagen por defecto, que se aplica a las imágenes cuando
	se dibujan sin un ancho o alto especificado.
	
	Por defecto es 0.5 para que las imágenes aparezcan en su tamaño real
	cuando la densidad de píxeles es 2. Las imágenes se dibujarán a un tamaño
	por defecto consistente relativo al lienzo independientemente de la densidad de píxeles.
	
	Esta función debe llamarse antes de que se carguen las imágenes para
	tener efecto.
	
	:param escala: 
	:returns: escala de imagen por defecto
	"""
	...

def redimensionar(w: float, h: float) -> None:
	"""🌆
	Redimensiona la imagen.
	
	:param w: nuevo ancho
	:param h: nuevo alto
	
	Example::
	
		Lienzo(200)
		
		logo = await cargar('/q5js_logo.avif')
		
		logo.redimensionar(64, 64)
		imagen(logo, -100, -100, 200, 200)
	"""
	...

def recortar() -> Image:
	"""🌆
	Devuelve una imagen recortada, eliminando los píxeles transparentes de los bordes.
	"""
	...

def suavizar() -> None:
	"""🌆
	Habilita el renderizado suave de imágenes mostradas más grandes que
	su tamaño real. Esta es la configuración por defecto, así que ejecutar esta
	función solo tiene efecto si se ha llamado a noSuavizar.
	
	Example::
	
		Lienzo(200)
		icono = await cargar('/q5js_icon.png')
		imagen(icono, -100, -100, 200, 200)
	"""
	...

def noSuavizar() -> None:
	"""🌆
	Deshabilita el renderizado suave de imágenes para un aspecto pixelado.
	
	Example::
	
		Lienzo(200)
		
		icono = await cargar('/q5js_icon.png')
		
		noSuavizar()
		imagen(icono, -100, -100, 200, 200)
	"""
	...

def teñir(color: str | float) -> None:
	"""🌆
	Aplica un tinte (superposición de color) al dibujo.
	
	El valor alfa del color de tinte determina la
	fuerza del tinte. Para cambiar la opacidad de una imagen,
	usa la función opacidad.
	
	El teñido afecta a todas las imágenes dibujadas posteriormente. El color de tinte
	se aplica a las imágenes usando el modo de mezcla "multiply".
	
	Dado que el proceso de teñido es intensivo en rendimiento, cada vez
	que se tiñe una imagen, q5 almacena en caché el resultado. imagen dibujará la
	imagen teñida en caché a menos que el color de tinte haya cambiado o la
	imagen que se está tiñendo haya sido editada.
	
	Si necesitas dibujar una imagen múltiples veces cada fotograma con
	diferentes tintes, considera hacer copias de la imagen y teñir
	cada copia por separado.
	
	:param color: color de tinte
	
	Example::
	
		Lienzo(200)
		
		logo = await cargar('/q5js_logo.avif')
		
		teñir(1, 0, 0, 0.5)
		imagen(logo, -100, -100, 200, 200)
	"""
	...

def noTeñir() -> None:
	"""🌆
	Las imágenes dibujadas después de ejecutar esta función no serán teñidas.
	"""
	...

def enmascarar(img: Image) -> None:
	"""🌆
	Enmascara la imagen con otra imagen.
	
	:param img: imagen a usar como máscara
	"""
	...

def copiar() -> Image:
	"""🌆
	Devuelve una copia de la imagen.
	"""
	...

def insertado(sx: float, sy: float, sw: float, sh: float, dx: float, dy: float, dw: float, dh: float) -> None:
	"""🌆
	Muestra una región de la imagen en otra región de la imagen.
	Se puede usar para crear un detalle insertado, también conocido como efecto de lupa.
	
	:param sx: coordenada x de la región fuente
	:param sy: coordenada y de la región fuente
	:param sw: ancho de la región fuente
	:param sh: alto de la región fuente
	:param dx: coordenada x de la región destino
	:param dy: coordenada y de la región destino
	:param dw: ancho de la región destino
	:param dh: alto de la región destino
	
	Example::
	
		Lienzo(200)
		
		logo = await cargar('/q5js_logo.avif')
		
		logo.insertado(256, 256, 512, 512, 0, 0, 256, 256)
		imagen(logo, -100, -100, 200, 200)
	"""
	...

def obtener(x: float, y: float, w: float = ..., h: float = ...) -> Image | list[float]:
	"""🌆
	Recupera una subsección de una imagen o lienzo como una nueva Imagen Q5
	o el color de un píxel en la imagen o lienzo.
	
	Si solo se especifican x e y, esta función devuelve el color del píxel
	en la coordenada dada en formato de array [R, G, B, A]. Si cargarPixeles
	nunca se ha ejecutado, es ejecutado por esta función.
	
	Si haces cambios en el lienzo o imagen, debes llamar a cargarPixeles
	antes de usar esta función para obtener los datos de color actuales.
	
	No aplicable a lienzos WebGPU.
	
	:param x: 
	:param y: 
	:param w: ancho del área, por defecto es 1
	:param h: alto del área, por defecto es 1
	
	Example::
	
		Lienzo(200)
		
		logo = await cargar('/q5js_logo.avif')
		
		recortada = logo.obtener(256, 256, 512, 512)
		imagen(recortada, -100, -100, 200, 200)
	"""
	...

def establecer(x: float, y: float, val: Any) -> None:
	"""🌆
	Establece el color de un píxel en la imagen o lienzo. El modo de color debe ser RGB.
	
	O si se proporciona un lienzo o imagen, se dibuja encima de la
	imagen o lienzo de destino, ignorando su configuración de tinte.
	
	Ejecuta actualizarPixeles para aplicar los cambios.
	
	No aplicable a lienzos WebGPU.
	
	:param x: 
	:param y: 
	:param val: color, lienzo, o imagen
	
	Example::
	
		Lienzo(200)
		
		c = color('lime')
		img = crearImagen(50, 50)
		
		def dibujar():
			img.establecer(aleatorio(50), aleatorio(50), c)
			img.actualizarPixeles()
		
			fondo(img)
	"""
	...

def pixeles() -> None:
	"""🌆
	Array de datos de color de píxeles de un lienzo o imagen.
	
	Vacío por defecto, obtener el dato ejecutando cargarPixeles.
	
	Cada píxel está representado por cuatro valores consecutivos en el array,
	correspondientes a sus canales rojo, verde, azul y alfa.
	
	Los datos del píxel superior izquierdo están al principio del array
	y los datos del píxel inferior derecho están al final, yendo de
	izquierda a derecha y de arriba a abajo.
	"""
	...

def cargarPixeles() -> None:
	"""🌆
	Carga datos de píxeles en pixeles desde el lienzo o imagen.
	
	El ejemplo a continuación establece el canal verde de algunos píxeles
	a un valor aleatorio.
	
	No aplicable a lienzos WebGPU.
	
	Example::
	
		Lienzo(200)
		frecuenciaRefresco(5)
		icono = cargarImagen('/q5js_icon.png')
		
		def dibujar():
			icono.cargarPixeles()
			for i in range(0, len(icono.pixeles), 16):
				icono.pixeles[i + 1] = aleatorio(255)
		
			icono.actualizarPixeles()
			fondo(icono)
	"""
	...

def actualizarPixeles() -> None:
	"""🌆
	Aplica cambios en el array pixeles al lienzo o imagen.
	
	No aplicable a lienzos WebGPU.
	
	Example::
	
		Lienzo(200)
		c = color('pink')
		
		img = crearImagen(50, 50)
		for x in range(0, 50, 3):
			for y in range(0, 50, 3):
				img.establecer(x, y, c)
		
		img.actualizarPixeles()
		
		fondo(img)
	"""
	...

def filtro(tipo: str, valor: float = ...) -> None:
	"""🌆
	Aplica un filtro a la imagen.
	
	Mira la documentación de las constantes de filtro de q5 a continuación para más información.
	
	También se puede usar una cadena de filtro CSS.
	https://developer.mozilla.org/docs/Web/CSS/filter
	
	No aplicable a lienzos WebGPU.
	
	:param tipo: tipo de filtro o una cadena de filtro CSS
	:param valor: valor opcional, depende del tipo de filtro
	
	Example::
	
		Lienzo(200)
		logo = await cargar('/q5js_logo.avif')
		logo.filtro(INVERTIR)
		imagen(logo, -100, -100, 200, 200)
	"""
	...

UMBRAL: Literal[1]
"""🌆
Convierte la imagen a píxeles blancos y negros dependiendo si están por encima o por debajo de cierto umbral.
"""

GRIS: Literal[2]
"""🌆
Convierte la imagen a escala de grises estableciendo cada píxel a su luminancia.
"""

OPACO: Literal[3]
"""🌆
Establece el canal alfa a totalmente opaco.
"""

INVERTIR: Literal[4]
"""🌆
Invierte el color de cada píxel.
"""

POSTERIZAR: Literal[5]
"""🌆
Limita cada canal de la imagen al número de colores especificado como argumento.
"""

DILATAR: Literal[6]
"""🌆
Aumenta el tamaño de las áreas brillantes.
"""

EROSIONAR: Literal[7]
"""🌆
Aumenta el tamaño de las áreas oscuras.
"""

DESENFOCAR: Literal[8]
"""🌆
Aplica un desenfoque gaussiano a la imagen.
"""

def crearImagen(w: float, h: float, opt: Any = ...) -> Image:
	"""🌆
	Crea una nueva imagen.
	
	:param w: ancho
	:param h: alto
	:param opt: configuraciones opcionales para la imagen
	"""
	...

def crearGraficos(w: float, h: float, opt: dict = ...) -> Q5:
	"""🌆
	Crea un búfer de gráficos.
	
	Deshabilitado por defecto en q5 WebGPU.
	Mira el issue #104 para detalles.
	
	:param w: ancho
	:param h: alto
	:param opt: opciones
	:returns: un nuevo búfer de gráficos Q5
	"""
	...

# 📘 texto

def texto(str: str, x: float, y: float, anchoEnvoltura: float = ..., limiteLineas: float = ...) -> None:
	"""📘
	Renderiza texto en el lienzo.
	
	El texto se puede posicionar con los parámetros x e y
	y opcionalmente se puede restringir.
	
	:param str: cadena de texto a mostrar
	:param x: coordenada-x de la posición del texto
	:param y: coordenada-y de la posición del texto
	:param anchoEnvoltura: ancho máximo de línea en caracteres
	:param limiteLineas: número máximo de líneas
	
	Example::
	
		Lienzo(200, 100)
		fondo('silver')
		
		tamañoTexto(32)
		texto('Hello, world!', -88, 10)
	"""
	...

def cargarFuente(url: str) -> object:
	"""📘
	Carga una fuente desde una URL.
	
	El archivo de fuente puede estar en cualquier formato aceptado en CSS, como
	archivos .ttf y .otf. El primer ejemplo a continuación carga
	Robotica.
	
	También soporta cargar fuentes de Google.
	El segundo ejemplo carga
	Pacifico.
	
	Si no se cargan fuentes, se usa la fuente sans-serif por defecto.
	
	Por defecto, los recursos se cargan en paralelo antes de que q5 ejecute dibujar. Usa await para esperar a que una fuente se cargue.
	
	:param url: URL de la fuente a cargar
	:returns: fuente
	
	Example::
	
		Lienzo(200, 56)
		
		await cargarFuente('/assets/Robotica.ttf')
		
		relleno('skyblue')
		tamañoTexto(64)
		imagenTexto('Hello!', -98, 24)
	"""
	...

def fuenteTexto(nombreFuente: str) -> None:
	"""📘
	Establece la fuente actual a usar para renderizar texto.
	
	Por defecto, la fuente se establece a la familia de fuentes CSS
	"sans-serif" o la última fuente cargada.
	
	:param nombreFuente: nombre de la familia de fuentes o un objeto FontFace
	
	Example::
	
		Lienzo(200, 160)
		fondo(0.8)
		
		fuenteTexto('serif')
		
		def dibujar():
			tamañoTexto(32)
			texto('Hello, world!', -96, 10)
	"""
	...

def tamañoTexto(tamaño: float = ...) -> float | None:
	"""📘
	Establece u obtiene el tamaño de fuente actual. Si no se proporciona argumento, devuelve el tamaño de fuente actual.
	
	:param tamaño: tamaño de la fuente en píxeles
	:returns: tamaño de fuente actual cuando no se proporciona argumento
	
	Example::
	
		def dibujar():
			fondo(0.8)
		
			tamañoTexto(abs(ratonX))
			texto('A', -90, 90)
	"""
	...

def interlineado(interlineado: float = ...) -> float | None:
	"""📘
	Establece u obtiene la altura de línea actual. Si no se proporciona argumento, devuelve la altura de línea actual.
	
	:param interlineado: altura de línea en píxeles
	:returns: altura de línea actual cuando no se proporciona argumento
	
	Example::
	
		def dibujar():
			fondo(0.8)
		
			tamañoTexto(abs(ratonX))
			texto('A', -90, 90)
			rect(-90, 90, 5, -interlineado())
	"""
	...

def estiloTexto(estilo: Literal['normal'] | Literal['italic'] | Literal['bold'] | Literal['bolditalic']) -> None:
	"""📘
	Establece el estilo de texto actual.
	
	No aplicable a WebGPU cuando se usan fuentes MSDF.
	
	:param estilo: estilo de fuente
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		estiloTexto(CURSIVA)
		
		tamañoTexto(32)
		texto('Hello, world!', -88, 6)
	"""
	...

def alineacionTexto(horiz: Literal['left'] | Literal['center'] | Literal['right'], vert: Literal['top'] | Literal['middle'] | Literal['bottom'] | Literal['alphabetic'] = ...) -> None:
	"""📘
	Establece la alineación horizontal y vertical del texto.
	
	:param horiz: alineación horizontal
	:param vert: alineación vertical
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		tamañoTexto(32)
		
		alineacionTexto(CENTRO, MEDIO)
		texto('Hello, world!', 0, 0)
	"""
	...

def pesoTexto(peso: float | str) -> None:
	"""📘
	Establece el peso del texto.
	
	- 100: delgado
	- 200: extra-ligero
	- 300: ligero
	- 400: normal/regular
	- 500: medio
	- 600: semi-negrita
	- 700: negrita
	- 800: más negrita/extra-negrita
	- 900: negro/pesado
	
	:param peso: peso de la fuente
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		tamañoTexto(32)
		alineacionTexto(CENTRO, MEDIO)
		
		pesoTexto(100)
		texto('Hello, world!', 0, 0)
	"""
	...

def anchoTexto(str: str) -> float:
	"""📘
	Calcula y devuelve el ancho de una cadena de texto dada.
	
	:param str: cadena a medir
	:returns: ancho del texto en píxeles
	
	Example::
	
		def dibujar():
			fondo(0.8)
		
			tamañoTexto(abs(ratonX))
			rect(-90, 90, anchoTexto('A'), -interlineado())
			texto('A', -90, 90)
	"""
	...

def ascensoTexto(str: str) -> float:
	"""📘
	Calcula y devuelve el ascenso (la distancia desde la línea base hasta la parte superior del carácter más alto) de la fuente actual.
	
	:param str: cadena a medir
	:returns: ascenso del texto en píxeles
	
	Example::
	
		def dibujar():
			fondo(0.8)
		
			tamañoTexto(abs(ratonX))
			rect(-90, 90, anchoTexto('A'), -ascensoTexto())
			texto('A', -90, 90)
	"""
	...

def descensoTexto(str: str) -> float:
	"""📘
	Calcula y devuelve el descenso (la distancia desde la línea base hasta la parte inferior del carácter más bajo) de la fuente actual.
	
	:param str: cadena a medir
	:returns: descenso del texto en píxeles
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		tamañoTexto(64)
		
		rect(-100, 0, 200, descensoTexto('q5'))
		texto('q5', -90, 0)
	"""
	...

def crearImagenTexto(str: str, anchoEnvoltura: float = ..., limiteLineas: float = ...) -> Image:
	"""📘
	Crea una imagen a partir de una cadena de texto.
	
	:param str: cadena de texto
	:param anchoEnvoltura: ancho máximo de línea en caracteres
	:param limiteLineas: número máximo de líneas
	:returns: un objeto de imagen representando el texto renderizado
	
	Example::
	
		Lienzo(200)
		tamañoTexto(96)
		
		img = crearImagenTexto('🐶')
		img.filtro(INVERTIR)
		
		def dibujar():
			imagen(img, -45, -90)
	"""
	...

def imagenTexto(img: Image | str, x: float, y: float) -> None:
	"""📘
	Renderiza una imagen generada a partir de texto en el lienzo.
	
	Si el primer parámetro es una cadena, se creará y almacenará en caché automáticamente
	una imagen del texto.
	
	El posicionamiento de la imagen se ve afectado por la configuración actual de
	alineación de texto y línea base.
	
	En q5 WebGPU, esta función es la única forma de dibujar texto multicolor,
	como emojis, y de usar fuentes que no están en formato MSDF.
	Usar esta función para dibujar texto que cambia cada fotograma tiene
	un costo de rendimiento muy alto.
	
	:param img: imagen o texto
	:param x: coordenada-x donde se debe colocar la imagen
	:param y: coordenada-y donde se debe colocar la imagen
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		tamañoTexto(96)
		alineacionTexto(CENTRO, CENTRO)
		
		imagenTexto('🐶', 0, 0)
	"""
	...

def nf(n: float, l: float, r: float) -> str:
	"""📘
	Formateador de números, se puede usar para mostrar un número como una cadena con
	un número especificado de dígitos antes y después del punto decimal,
	opcionalmente añadiendo relleno con ceros.
	
	:param n: número a formatear
	:param l: número mínimo de dígitos que aparecen antes del punto decimal; el número se rellena con ceros si es necesario
	:param r: número de dígitos que aparecen después del punto decimal
	:returns: una representación de cadena del número, formateada en consecuencia
	
	Example::
	
		Lienzo(200, 100)
		fondo(0.8)
		
		tamañoTexto(32)
		texto(nf(PI, 4, 5), -90, 10)
	"""
	...

NORMAL: Literal['normal']
"""📘
Estilo de fuente normal.
"""

CURSIVA: Literal['italic']
"""📘
Estilo de fuente cursiva.
"""

NEGRILLA: Literal['bold']
"""📘
Peso de fuente negrita.
"""

NEGRILLA_CURSIVA: Literal['italic bold']
"""📘
Estilo de fuente negrita y cursiva.
"""

IZQUIERDA: Literal['left']
"""📘
Alinear texto a la izquierda.
"""

CENTRO: Literal['center']
"""📘
Alinear texto al centro.
"""

DERECHA: Literal['right']
"""📘
Alinear texto a la derecha.
"""

ARRIBA: Literal['top']
"""📘
Alinear texto arriba.
"""

ABAJO: Literal['bottom']
"""📘
Alinear texto abajo.
"""

LINEA_BASE: Literal['alphabetic']
"""📘
Alinear texto a la línea base (alfabética).
"""

# 🖲 entrada

"""🖲
El manejo de entrada de q5 es muy básico.

Para un mejor manejo de entrada, incluyendo soporte para controladores de juegos, considera usar el addon q5play con q5.

Ten en cuenta que las respuestas de entrada dentro de dibujar pueden retrasarse
hasta un ciclo de fotograma: desde el momento exacto en que ocurre un evento de entrada
hasta la próxima vez que se dibuja un fotograma.

Reproduce sonidos o activa otra retroalimentación no visual inmediatamente
respondiendo a eventos de entrada dentro de funciones como
alPresionarRaton y alPresionarTecla.
"""

ratonX: float
"""🖲
Posición X actual del ratón.

Example::

	def dibujar():
		fondo(0.8)
		tamañoTexto(64)
		texto(redondear(ratonX), -50, 20)
"""

ratonY: float
"""🖲
Posición Y actual del ratón.

Example::

	def dibujar():
		fondo(0.8)
		circulo(0, ratonY, 100)
"""

pRatonX: float
"""🖲
Posición X previa del ratón.
"""

pRatonY: float
"""🖲
Posición Y previa del ratón.
"""

botonRaton: str
"""🖲
El botón actual siendo presionado: 'left', 'right', 'center').

El valor por defecto es una cadena vacía.

Example::

	def dibujar():
		fondo(0.8)
		tamañoTexto(64)
		texto(botonRaton, -80, 20)
"""

ratonPresionado: bool
"""🖲
Verdadero si el raton está actualmente presionado, falso de lo contrario.

Example::

	def dibujar():
		if ratonPresionado: fondo(0.4)
		else: fondo(0.8)
"""

def alPresionarRaton() -> None:
	"""🖲
	Define esta función para responder a eventos de presionar el ratón.
	
	Example::
	
		Lienzo(200)
		gris = 0.4
		
		def alPresionarRaton():
			global gris
			fondo(gris)
			gris = (gris + 0.1) % 1
	"""
	...

def alSoltarRaton() -> None:
	"""🖲
	Define esta función para responder a eventos de soltar el ratón.
	
	Example::
	
		Lienzo(200)
		gris = 0.4
		
		def alSoltarRaton():
			global gris
			fondo(gris)
			gris = (gris + 0.1) % 1
	"""
	...

def alMoverRaton() -> None:
	"""🖲
	Define esta función para responder a eventos de mover el ratón.
	
	En dispositivos con pantalla táctil esta función no se llama
	cuando el usuario arrastra su dedo en la pantalla.
	
	Example::
	
		Lienzo(200)
		gris = 0.4
		
		def alMoverRaton():
			global gris
			fondo(gris)
			gris = (gris + 0.005) % 1
	"""
	...

def alArrastrarRaton() -> None:
	"""🖲
	Define esta función para responder a eventos de arrastrar el ratón.
	
	Arrastrar el ratón se define como mover el ratón
	mientras un botón del ratón está presionado.
	
	Example::
	
		Lienzo(200)
		gris = 0.4
		
		def alArrastrarRaton():
			global gris
			fondo(gris)
			gris = (gris + 0.005) % 1
	"""
	...

def dobleClic() -> None:
	"""🖲
	Define esta función para responder a eventos de doble clic del ratón.
	
	Example::
	
		Lienzo(200)
		gris = 0.4
		
		def dobleClic():
			global gris
			fondo(gris)
			gris = (gris + 0.1) % 1
	"""
	...

tecla: str
"""🖲
El nombre de la última tecla presionada.

Example::

	def dibujar():
		fondo(0.8)
		tamañoTexto(64)
		texto(tecla, -80, 20)
"""

teclaPresionada: bool
"""🖲
Verdadero si una tecla está actualmente presionada, falso de lo contrario.

Example::

	def dibujar():
		if teclaPresionada: fondo(0.4)
		else: fondo(0.8)
"""

def teclaEstaPresionada(tecla: str) -> bool:
	"""🖲
	Devuelve verdadero si el usuario está presionando la tecla especificada, falso
	de lo contrario. Acepta nombres de teclas insensibles a mayúsculas.
	
	:param tecla: tecla a comprobar
	:returns: verdadero si la tecla está presionada, falso de lo contrario
	
	Example::
	
		def dibujar():
			fondo(0.8)
		
			if teclaEstaPresionada('f') and teclaEstaPresionada('j'):
				rect(-50, -50, 100, 100)
	"""
	...

def alPresionarTecla() -> None:
	"""🖲
	Define esta función para responder a eventos de presionar tecla.
	
	Example::
	
		Lienzo(200)
		gris = 0.4
		
		def alPresionarTecla():
			global gris
			fondo(gris)
			gris = (gris + 0.1) % 1
	"""
	...

def alSoltarTecla() -> None:
	"""🖲
	Define esta función para responder a eventos de soltar tecla.
	
	Example::
	
		Lienzo(200)
		gris = 0.4
		
		def alSoltarTecla():
			global gris
			fondo(gris)
			gris = (gris + 0.1) % 1
	"""
	...

toques: list[Any]
"""🖲
Array que contiene todos los puntos de toque actuales dentro de la
ventana del navegador. Cada toque es un objeto con
propiedades id, x, e y.

Considera usar el array punteros en su lugar, el cual incluye entrada de ratón, táctil y de lápiz óptico.

Example::

	def dibujar():
		fondo(0.8)
		for pt in punteros:
			circulo(pt.x, pt.y, 100)
"""

def alEmpezarToque() -> None:
	"""🖲
	Define esta función para responder a eventos de inicio de toque
	en el lienzo.
	
	Devuelve true para habilitar gestos táctiles como pellizcar para hacer zoom
	y desplazarse, que q5 deshabilita en el lienzo por defecto.
	
	Example::
	
		Lienzo(200)
		gris = 0.4
		
		def alEmpezarToque():
			global gris
			fondo(gris)
			gris = (gris + 0.1) % 1
	"""
	...

def alTerminarToque() -> None:
	"""🖲
	Define esta función para responder a eventos de fin de toque
	en el lienzo.
	
	Devuelve true para habilitar gestos táctiles como pellizcar para hacer zoom
	y desplazarse, que q5 deshabilita en el lienzo por defecto.
	
	Example::
	
		Lienzo(200)
		gris = 0.4
		
		def alTerminarToque():
			global gris
			fondo(gris)
			gris = (gris + 0.1) % 1
	"""
	...

def alMoverToque() -> None:
	"""🖲
	Define esta función para responder a eventos de movimiento de toque
	en el lienzo.
	
	Devuelve true para habilitar gestos táctiles como pellizcar para hacer zoom
	y desplazarse, que q5 deshabilita en el lienzo por defecto.
	
	Example::
	
		Lienzo(200)
		gris = 0.4
		
		def alMoverToque():
			global gris
			fondo(gris)
			gris = (gris + 0.005) % 1
	"""
	...

def cursor(nombre: str, x: float = ..., y: float = ...) -> None:
	"""🖲
	Establece el cursor a un tipo de cursor CSS o imagen.
	Si se proporciona una imagen, las coordenadas x e y opcionales pueden
	especificar el punto activo del cursor.
	
	:param nombre: nombre del cursor o la url a una imagen
	:param x: coordenada x del punto del cursor
	:param y: coordenada y del punto del cursor
	
	Example::
	
		Lienzo(200, 100)
		cursor('pointer')
	"""
	...

def sinCursor() -> None:
	"""🖲
	Oculta el cursor dentro de los límites del lienzo.
	
	Example::
	
		Lienzo(200, 100)
		sinCursor()
	"""
	...

def ruedaRaton() -> None:
	"""🖲
	Define esta función para responder a eventos de la rueda del ratón.
	
	event.deltaX y event.deltaY son las cantidades de desplazamiento horizontal y vertical,
	respectivamente.
	
	Devuelve true para permitir el comportamiento por defecto de desplazar la página.
	
	Example::
	
		x = (y = 0)
		def dibujar():
			circulo(x, y, 10)
		
		def ruedaRaton(e):
			global x
			x += e.deltaX
			y += e.deltaY
			return False
	"""
	...

movidoX: float
"""🖲
Distancia que el ratón ha recorrido desde el último fotograma en la dirección horizontal.

Example::

	def dibujar():
		fondo(0.8)
		if movidoX > 0: texto('>>', 0, 0)
		if movidoX < 0: texto('<<', 0, 0)
"""

movidoY: float
"""🖲
Distancia que el ratón ha recorrido desde el último fotograma en la dirección vertical.

Example::

	def dibujar():
		fondo(0.8)
		if movidoY > 0: texto('vv', 0, 0)
		if movidoY < 0: texto('^^', 0, 0)
"""

def bloqueoPuntero(movimientoNoAjustado: bool) -> None:
	"""🖲
	Solicita que el puntero se bloquee al cuerpo del documento, ocultando
	el cursor y permitiendo un movimiento ilimitado.
	
	Los sistemas operativos habilitan la aceleración del ratón por defecto, lo cual es útil cuando a veces quieres un movimiento lento y preciso (piensa en cómo usarías un paquete de gráficos), pero también quieres moverte grandes distancias con un movimiento de ratón más rápido (piensa en desplazarte y seleccionar varios archivos). Para algunos juegos, sin embargo, se prefieren los datos de entrada de ratón sin procesar para controlar la rotación de la cámara — donde el mismo movimiento de distancia, rápido o lento, resulta en la misma rotación.
	
	Para salir del modo de bloqueo de puntero, llama a document.exitPointerLock().
	
	:param movimientoNoAjustado: establecer a true para deshabilitar la aceleración del ratón a nivel de SO y acceder a la entrada de ratón sin procesar
	
	Example::
	
		def dibujar():
			circulo(ratonX / 10, ratonY / 10, 10)
		
		def dobleClic():
			if not document.pointerLockElement:
				bloqueoPuntero()
			else:
				document.exitPointerLock()
	"""
	...

# 🎨 color

def color(c0: str | float | Color | list[float], c1: float = ..., c2: float = ..., c3: float = ...) -> Color:
	"""🎨
	Crea un nuevo objeto Color, el cual es útil principalmente para almacenar
	un color que tu sketch reutilizará o modificará más tarde.
	
	Con el modo de color por defecto, RGB, los colores tienen componentes r/red (rojo), g/green (verde),
	b/blue (azul), y a/alpha (alfa).
	
	Las funciones relleno, trazo, y fondo
	aceptan la misma amplia gama de representaciones de color que esta función.
	
	:param c0: color o primer componente de color
	:param c1: segundo componente de color
	:param c2: tercer componente de color
	:param c3: cuarto componente de color (alfa)
	:returns: un nuevo objeto Color
	
	Example::
	
		Lienzo(200)
		rect(-100, -100, 100, 200)
		
		#              (   r,    g, b,   a)
		botella = color(0.35, 0.39, 1, 0.4)
		relleno(botella)
		trazo(botella)
		grosorTrazo(30)
		circulo(0, 0, 155)
	"""
	...

def modoColor(modo: Literal['rgb'] | Literal['oklch'] | Literal['hsl'] | Literal['hsb'], formato: Literal[1] | Literal[255], gama: Literal['srgb'] | Literal['display-p3'] = ...) -> None:
	"""🎨
	Establece el modo de color para el sketch, lo cual cambia cómo se
	interpretan y muestran los colores.
	
	La gama de color es 'display-p3' por defecto, si el dispositivo soporta HDR.
	
	:param modo: modo de color
	:param formato: formato de color (1 para flotante, 255 para entero)
	:param gama: gama de color
	
	Example::
	
		Lienzo(200)
		
		modoColor(RGB, 1)
		relleno(1, 0, 0)
		rect(-100, -100, 66, 200)
		relleno(0, 1, 0)
		rect(-34, -100, 67, 200)
		relleno(0, 0, 1)
		rect(33, -100, 67, 200)
	"""
	...

RGB: Literal['rgb']
"""🎨
Los colores RGB tienen componentes r/red (rojo), g/green (verde), b/blue (azul),
y a/alpha (alfa).

Por defecto cuando un lienzo está usando el espacio de color HDR "display-p3",
los colores rgb son mapeados a la gama completa P3, incluso cuando usan el
formato entero legado 0-255.

Example::

	Lienzo(200, 100)
	
	modoColor(RGB)
	
	fondo(1, 0, 0)
"""

OKLCH: Literal['oklch']
"""🎨
Los colores OKLCH tienen componentes l/lightness (luminosidad), c/chroma (croma),
h/hue (tono), y a/alpha (alfa). Es más intuitivo para los humanos
trabajar con color en estos términos que con RGB.

OKLCH es perceptualmente uniforme, lo que significa que los colores con la
misma luminosidad y croma (colorido) parecerán tener
igual luminancia, independientemente del tono.

OKLCH puede representar con precisión todos los colores visibles para el
ojo humano, a diferencia de muchos otros espacios de color que están limitados
a una gama. Los valores máximos de luminosidad y croma que
corresponden a los límites de la gama sRGB o P3 varían dependiendo del
tono. Los colores que están fuera de la gama serán recortados al
color dentro de la gama más cercano.

Usa el selector de color OKLCH para encontrar
colores dentro de la gama.

- lightness: 0 a 1
- chroma: 0 a ~0.4
- hue: 0 a 360
- alpha: 0 a 1

Example::

	Lienzo(200, 100)
	
	modoColor(OKLCH)
	
	fondo(0.64, 0.3, 30)
"""

HSL: Literal['hsl']
"""🎨
Los colores HSL tienen componentes h/hue (tono), s/saturation (saturación),
l/lightness (luminosidad), y a/alpha (alfa).

HSL fue creado en la década de 1970 para aproximar la percepción humana
del color, intercambiando precisión por cálculos más simples. No es
perceptualmente uniforme, por lo que colores con la misma luminosidad
pueden parecer más oscuros o más claros, dependiendo de su tono
y saturación. Sin embargo, los valores de luminosidad y saturación que
corresponden a los límites de la gama siempre son 100, independientemente del
tono. Esto puede hacer que HSL sea más fácil de trabajar que OKLCH.

Los colores HSL son mapeados a la gama completa P3 cuando
se usa el espacio de color "display-p3".

- hue: 0 a 360
- saturation: 0 a 100
- lightness: 0 a 100
- alpha: 0 a 1

Example::

	Lienzo(200, 100)
	
	modoColor(HSL)
	
	fondo(0, 100, 50)
"""

HSB: Literal['hsb']
"""🎨
Los colores HSB tienen componentes h/hue (tono), s/saturation (saturación),
b/brightness (brillo) (también conocido como v/value (valor)), y a/alpha (alfa).

HSB es similar a HSL, pero en lugar de luminosidad
(negro a blanco), usa brillo (negro a
color completo). Para producir blanco, establece el brillo
a 100 y la saturación a 0.

- hue: 0 a 360
- saturation: 0 a 100
- brightness: 0 a 100
- alpha: 0 a 1

Example::

	Lienzo(200, 100)
	
	modoColor(HSB)
	
	fondo(0, 100, 100)
"""

SRGB: Literal['srgb']
"""🎨
Limita la gama de color al espacio de color sRGB.

Si tu pantalla es capaz de HDR, nota que el rojo completo aparece
menos saturado y oscuro en este ejemplo, como lo haría en
una pantalla SDR.

Example::

	Lienzo(200, 100)
	
	modoColor(RGB, 1, SRGB)
	
	fondo(1, 0, 0)
"""

DISPLAY_P3: Literal['display-p3']
"""🎨
Expande la gama de color al espacio de color P3.

Esta es la gama de color por defecto en dispositivos que soportan HDR.

Si tu pantalla es capaz de HDR, nota que el rojo completo aparece
totalmente saturado y brillante en el siguiente ejemplo.

Example::

	Lienzo(200, 100)
	
	modoColor(RGB, 1, DISPLAY_P3)
	
	fondo(1, 0, 0)
"""

def fondo(relleno: Color | Image) -> None:
	"""🎨
	Dibuja sobre todo el lienzo con un color o una imagen.
	
	Al igual que la función color,
	esta función puede aceptar colores en una amplia gama de formatos:
	cadena de color CSS, valor de escala de grises y valores de componentes de color.
	
	:param relleno: un color o una imagen para dibujar
	
	Example::
	
		Lienzo(200, 100)
		fondo('crimson')
	"""
	...

class Color:
	"""🎨
	Este constructor acepta estrictamente 4 números, que son los componentes del color.
	
	Usa la función color para mayor flexibilidad, ejecuta
	este constructor internamente.
	
	Color no es realmente una clase en si misma, es una referencia a una
	clase de color Q5 basada en el modo de color, formato y gama.
	"""


	def igual(self) -> bool:
		"""🎨 Comprueba si este color es exactamente igual a otro color."""
		...

	def esMismoColor(self) -> bool:
		"""🎨 Comprueba si el color es el mismo que otro color,
ignorando sus valores alfa."""
		...

	def toString(self) -> str:
		"""🎨 Produce una representación de cadena de color CSS."""
		...

	niveles: list[float]
	"""🎨 Un array de los componentes del color."""

# 💅 estilos

def relleno(color: Color) -> None:
	"""💅
	Establece el color de relleno. El defecto es blanco.
	
	Como la función color, esta función
	puede aceptar colores en una amplia gama de formatos: como una cadena de color CSS,
	un objeto Color, valor de escala de grises, o valores de componentes de color.
	
	:param color: color de relleno
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		relleno('red')
		circulo(-20, -20, 80)
		
		relleno('lime')
		cuadrado(-20, -20, 80)
	"""
	...

def trazo(color: Color) -> None:
	"""💅
	Establece el color del trazo (contorno). El defecto es negro.
	
	Como la función color, esta función
	puede aceptar colores en una amplia gama de formatos: como una cadena de color CSS,
	un objeto Color, valor de escala de grises, o valores de componentes de color.
	
	:param color: color de trazo
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		relleno(0.14)
		
		trazo('red')
		circulo(-20, -20, 80)
		
		trazo('lime')
		cuadrado(-20, -20, 80)
	"""
	...

def sinRelleno() -> None:
	"""💅
	Después de llamar a esta función, el dibujo no será rellenado.
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		sinRelleno()
		
		trazo('red')
		circulo(-20, -20, 80)
		trazo('lime')
		cuadrado(-20, -20, 80)
	"""
	...

def sinTrazo() -> None:
	"""💅
	Después de llamar a esta función, el dibujo no tendrá un trazo (contorno).
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		relleno(0.14)
		trazo('red')
		circulo(-20, -20, 80)
		
		sinTrazo()
		cuadrado(-20, -20, 80)
	"""
	...

def grosorTrazo(grosor: float) -> None:
	"""💅
	Establece el tamaño del trazo usado para líneas y el borde alrededor de dibujos.
	
	:param grosor: tamaño del trazo en píxeles
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		trazo('red')
		circulo(-50, 0, 80)
		
		grosorTrazo(12)
		circulo(50, 0, 80)
	"""
	...

def opacidad(alfa: float) -> None:
	"""💅
	Establece la opacidad global, que afecta a todas las operaciones de dibujo posteriores, excepto fondo. El defecto es 1, totalmente opaco.
	
	En q5 WebGPU esta función solo afecta a imágenes.
	
	:param alfa: nivel de opacidad, variando de 0 a 1
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		opacidad(1)
		circulo(-20, -20, 80)
		
		opacidad(0.2)
		cuadrado(-20, -20, 80)
	"""
	...

def sombra(color: Color) -> None:
	"""💅
	Establece el color de la sombra. El defecto es transparente (sin sombra).
	
	Las sombras se aplican a cualquier cosa dibujada en el lienzo, incluyendo formas rellenas,
	trazos, texto, e imágenes.
	
	Como la función color, esta función
	puede aceptar colores en una amplia gama de formatos: como una cadena de color CSS,
	un objeto Color, valor de escala de grises, o valores de componentes de color.
	
	No disponible en q5 WebGPU.
	
	:param color: color de sombra
	"""
	...

def sinSombra() -> None:
	"""💅
	Deshabilita el efecto de sombra.
	
	No disponible en q5 WebGPU.
	"""
	...

def cajaSombra(offsetX: float, offsetY: float, desenfoque: float) -> None:
	"""💅
	Establece el desplazamiento de la sombra y el radio de desenfoque.
	
	Cuando q5 comienza, el desplazamiento de la sombra es (10, 10) con un desenfoque de 10.
	
	No disponible en q5 WebGPU.
	
	:param offsetX: desplazamiento horizontal de la sombra
	:param offsetY: desplazamiento vertical de la sombra, por defecto es el mismo que offsetX
	:param desenfoque: radio de desenfoque de la sombra, por defecto es 0
	"""
	...

def modoMezcla(val: str) -> None:
	"""💅
	Establece la operación de composición global para el contexto del lienzo.
	
	No disponible en q5 WebGPU.
	
	:param val: operación de composición
	"""
	...

def terminacionTrazo(val: str) -> None:
	"""💅
	
	:param val: estilo de terminación de línea
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		grosorTrazo(20)
		
		terminacionTrazo(SQUARE)
		linea(-50, -25, 50, -25)
		
		terminacionTrazo(PROJECT)
		linea(-50, 25, 50, 25)
	"""
	...

def unionTrazo(val: str) -> None:
	"""💅
	Establece el estilo de unión de línea a ROUND, BEVEL, o MITER.
	
	No disponible en q5 WebGPU.
	
	:param val: estilo de unión de línea
	"""
	...

def borrar(rellenoAlfa: float = ..., trazoAlfa: float = ...) -> None:
	"""💅
	Establece el lienzo en modo borrar, donde las formas borrarán lo que está
	debajo de ellas en lugar de dibujar sobre ello.
	
	No disponible en q5 WebGPU.
	
	:param rellenoAlfa: nivel de opacidad del color de relleno
	:param trazoAlfa: nivel de opacidad del color de trazo
	"""
	...

def noBorrar() -> None:
	"""💅
	Reinicia el lienzo del modo borrar al modo de dibujo normal.
	
	No disponible en q5 WebGPU.
	"""
	...

def guardarEstilos() -> None:
	"""💅
	Guarda la configuración de estilo de dibujo actual.
	
	Esto incluye el relleno, trazo, grosor de trazo, tinte, modo de imagen,
	modo de rectángulo, modo de elipse, tamaño de texto, alineación de texto, línea base de texto, y
	configuración de sombra.
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		guardarEstilos()
		relleno('blue')
		circulo(-50, -50, 80)
		
		recuperarEstilos()
		circulo(50, 50, 80)
	"""
	...

def recuperarEstilos() -> None:
	"""💅
	Restaura la configuración de estilo de dibujo guardada previamente.
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		guardarEstilos()
		relleno('blue')
		circulo(-50, -50, 80)
		
		recuperarEstilos()
		circulo(50, 50, 80)
	"""
	...

def limpiar() -> None:
	"""💅
	Limpia el lienzo, haciendo que cada píxel sea completamente transparente.
	
	Ten en cuenta que el lienzo solo se puede ver a través si tiene un canal alfa.
	
	Example::
	
		Lienzo(200, { 'alpha': True })
		
		def dibujar():
			limpiar()
			circulo((frameCount % 200) - 100, 0, 80)
	"""
	...

def enRelleno(x: float, y: float) -> bool:
	"""💅
	Comprueba si un punto dado está dentro del área de relleno del camino actual.
	
	No disponible en q5 WebGPU.
	
	:param x: coordenada-x del punto
	:param y: coordenada-y del punto
	:returns: verdadero si el punto está dentro del área de relleno, falso de lo contrario
	"""
	...

def enTrazo(x: float, y: float) -> bool:
	"""💅
	Comprueba si un punto dado está dentro del trazo del camino actual.
	
	No disponible en q5 WebGPU.
	
	:param x: coordenada-x del punto
	:param y: coordenada-y del punto
	:returns: verdadero si el punto está dentro del trazo, falso de lo contrario
	"""
	...

# 🦋 transformaciones

def trasladar(x: float, y: float) -> None:
	"""🦋
	Traslada el origen del contexto de dibujo.
	
	:param x: traslación a lo largo del eje x
	:param y: traslación a lo largo del eje y
	
	Example::
	
		def dibujar():
			fondo(0.8)
		
			trasladar(50, 50)
			circulo(0, 0, 80)
	"""
	...

def rotar(angulo: float) -> None:
	"""🦋
	Rota el contexto de dibujo.
	
	:param angulo: ángulo de rotación en radianes
	
	Example::
	
		def dibujar():
			fondo(0.8)
		
			rotar(ratonX / 50)
		
			modoRect(CENTER)
			cuadrado(0, 0, 120)
	"""
	...

def escalar(x: float, y: float = ...) -> None:
	"""🦋
	Escala el contexto de dibujo.
	
	Si solo se proporciona un parámetro de entrada,
	el contexto de dibujo se escalará uniformemente.
	
	:param x: factor de escala a lo largo del eje x
	:param y: factor de escala a lo largo del eje y
	
	Example::
	
		def dibujar():
			fondo(0.8)
		
			escalar(ratonX / 10)
			circulo(0, 0, 20)
	"""
	...

def cizallarX(angulo: float) -> None:
	"""🦋
	Cizalla el contexto de dibujo a lo largo del eje x.
	
	:param angulo: ángulo de cizallamiento en radianes
	
	Example::
	
		def dibujar():
			fondo(0.8)
		
			trasladar(-75, -40)
			cizallarX(ratonX / 100)
			cuadrado(0, 0, 80)
	"""
	...

def cizallarY(angulo: float) -> None:
	"""🦋
	Cizalla el contexto de dibujo a lo largo del eje y.
	
	:param angulo: ángulo de cizallamiento en radianes
	
	Example::
	
		def dibujar():
			fondo(0.8)
		
			trasladar(-75, -40)
			cizallarY(ratonX / 100)
			cuadrado(0, 0, 80)
	"""
	...

def aplicarMatriz(a: float, b: float, c: float, d: float, e: float, f: float) -> None:
	"""🦋
	Aplica una matriz de transformación.
	
	Acepta una matriz de 3x3 como un array o múltiples argumentos.
	
	:param a: 
	:param b: 
	:param c: 
	:param d: 
	:param e: 
	:param f: 
	
	Example::
	
		def dibujar():
			fondo(0.8)
		
			aplicarMatriz(2, -1, 1, -1)
			circulo(0, 0, 80)
	"""
	...

def reiniciarMatriz() -> None:
	"""🦋
	Reinicia la matriz de transformación.
	
	q5 ejecuta esta función antes de cada vez que se ejecuta la función dibujar,
	para que las transformaciones no se trasladen al siguiente fotograma.
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		trasladar(50, 50)
		circulo(0, 0, 80)
		
		reiniciarMatriz()
		cuadrado(0, 0, 50)
	"""
	...

def guardarMatriz() -> None:
	"""🦋
	Guarda la matriz de transformación actual.
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		guardarMatriz()
		rotar(CUARTO_PI)
		elipse(0, 0, 120, 40)
		recuperarMatriz()
		
		elipse(0, 0, 120, 40)
	"""
	...

def recuperarMatriz() -> None:
	"""🦋
	Restaura la matriz de transformación guardada previamente.
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		guardarMatriz()
		rotar(CUARTO_PI)
		elipse(0, 0, 120, 40)
		recuperarMatriz()
		
		elipse(0, 0, 120, 40)
	"""
	...

def apilar() -> None:
	"""🦋
	Guarda la configuración de estilo de dibujo y transformaciones actuales.
	
	Example::
	
		Lienzo(200)
		
		apilar()
		relleno('blue')
		trasladar(50, 50)
		circulo(0, 0, 80)
		desapilar()
		
		cuadrado(0, 0, 50)
	"""
	...

def desapilar() -> None:
	"""🦋
	Restaura la configuración de estilo de dibujo y transformaciones guardadas previamente.
	
	Example::
	
		Lienzo(200)
		
		apilar()
		relleno('blue')
		trasladar(50, 50)
		circulo(0, 0, 80)
		desapilar()
		
		cuadrado(0, 0, 50)
	"""
	...

# 💻 visualización

def modoVisualizacion(modo: str, calidadRenderizado: str, escala: float) -> None:
	"""💻
	Personaliza cómo se presenta tu lienzo.
	
	:param modo: NORMAL, CENTRO, o MAXIMIZADO
	:param calidadRenderizado: SUAVE o PIXELADO
	:param escala: también se puede dar como una cadena (por ejemplo "x2")
	
	Example::
	
		Lienzo(50, 25)
		
		modoVisualizacion(CENTRO, PIXELADO, 4)
		
		circulo(0, 0, 16)
	"""
	...

MAXIMIZADO: Literal['maxed']
"""💻
Una configuración de modoVisualizacion.

El lienzo se escalará para llenar el elemento padre,
con bandas negras si es necesario para preservar su relación de aspecto.
"""

SUAVE: Literal['smooth']
"""💻
Una calidad de renderizado de modoVisualizacion.

Se usa escalado suave si el lienzo se escala.
"""

PIXELADO: Literal['pixelated']
"""💻
Una calidad de renderizado de modoVisualizacion.

Los píxeles se renderizan como cuadrados nítidos si el lienzo se escala.
"""

def pantallaCompleta(v: bool = ...) -> None:
	"""💻
	Habilita o deshabilita el modo de pantalla completa.
	
	:param v: booleano indicando si habilitar o deshabilitar el modo de pantalla completa
	"""
	...

def anchoVentana() -> None:
	"""💻
	El ancho de la ventana.
	
	Example::
	
		def dibujar():
			fondo(0.8)
			tamañoTexto(64)
			alineaciónTexto(CENTRO, CENTRO)
			texto(anchoVentana, 0, 0)
	"""
	...

def altoVentana() -> None:
	"""💻
	El alto de la ventana.
	
	Example::
	
		def dibujar():
			fondo(0.8)
			tamañoTexto(64)
			alineaciónTexto(CENTRO, CENTRO)
			texto(altoVentana, 0, 0)
	"""
	...

def ancho() -> None:
	"""💻
	El ancho del lienzo.
	
	Example::
	
		Lienzo(200, 120)
		circulo(0, 0, ancho)
	"""
	...

def alto() -> None:
	"""💻
	El alto del lienzo.
	
	Example::
	
		Lienzo(200, 80)
		circulo(0, 0, alto)
	"""
	...

def medioAncho() -> None:
	"""💻
	La mitad del ancho del lienzo.
	
	Example::
	
		Lienzo(200, 80)
		circulo(0, 0, medioAncho)
	"""
	...

def medioAlto() -> None:
	"""💻
	La mitad del alto del lienzo.
	
	Example::
	
		Lienzo(200, 80)
		circulo(0, 0, medioAlto)
	"""
	...

def lienzo() -> None:
	"""💻
	El elemento lienzo asociado con la instancia Q5.
	
	Si no se crea un lienzo explícitamente con crearLienzo(), pero se define una función q5 como dibujar o alPresionarRatón, se creará automáticamente un lienzo por defecto de tamaño 200x200.
	"""
	...

def redimensionarLienzo(w: float, h: float) -> None:
	"""💻
	Redimensiona el lienzo al ancho y alto especificados.
	
	:param w: ancho del lienzo
	:param h: alto del lienzo
	
	Example::
	
		Lienzo(200, 100)
		
		def dibujar():
			fondo(0.8)
		
		def alPresionarRatón():
			redimensionarLienzo(200, 200)
	"""
	...

def cuadroActual() -> None:
	"""💻
	El número de cuadros que se han mostrado desde que comenzó el programa.
	
	Example::
	
		def dibujar():
			fondo(0.8)
			tamañoTexto(64)
			texto(cuadroActual, -92, 20)
	"""
	...

def pausar() -> None:
	"""💻
	Detiene el bucle de dibujo.
	
	Example::
	
		def dibujar():
			circulo(cuadroActual * 5 - 100, 0, 80)
			pausar()
	"""
	...

def redibujar(n: float = ...) -> None:
	"""💻
	Redibuja el lienzo n veces. Si no se proporciona ningún parámetro de entrada,
	llama a la función de dibujo una vez.
	
	Esta es una función asíncrona.
	
	:param n: número de veces para redibujar el lienzo, por defecto es 1
	
	Example::
	
		Lienzo(200)
		pausar()
		
		def dibujar():
			circulo(cuadroActual * 5 - 100, 0, 80)
		
		def alPresionarRatón():
			redibujar(10)
	"""
	...

def reanudar() -> None:
	"""💻
	Inicia el bucle de dibujo de nuevo si estaba detenido.
	
	Example::
	
		Lienzo(200)
		pausar()
		
		def dibujar():
			circulo(cuadroActual * 5 - 100, 0, 80)
		
		def alPresionarRatón():
			reanudar()
	"""
	...

def frecuenciaRefresco(hertz: float = ...) -> float:
	"""💻
	Establece la frecuencia de fotogramas objetivo u obtiene una aproximación de la
	frecuencia de fotogramas actual del sketch.
	
	Incluso cuando el sketch se está ejecutando a una frecuencia de fotogramas consistente,
	el valor actual de la frecuencia de fotogramas fluctuará. Usa las herramientas de desarrollador
	de tu navegador web para un análisis de rendimiento más preciso.
	
	:param hertz: frecuencia de fotogramas objetivo, por defecto es 60
	:returns: frecuencia de fotogramas actual
	
	Example::
	
		def dibujar():
			fondo(0.8)
		
			if ratonPresionado: frecuenciaRefresco(10)
			else: frecuenciaRefresco(60)
		
			circulo((cuadroActual % 200) - 100, 0, 80)
	"""
	...

def obtenerTasaFotogramasObjetivo() -> float:
	"""💻
	La frecuencia de fotogramas deseada del sketch.
	:returns: frecuencia de fotogramas objetivo
	
	Example::
	
		def dibujar():
			fondo(0.8)
			tamañoTexto(64)
		
			texto(obtenerTasaFotogramasObjetivo(), -35, 20)
	"""
	...

def obtenerFPS() -> float:
	"""💻
	Obtiene los FPS actuales, en términos de cuántos fotogramas podrían generarse
	en un segundo, lo cual puede ser más alto que la frecuencia de fotogramas objetivo.
	
	Usa las herramientas de desarrollador de tu navegador web para un análisis
	de rendimiento más profundo.
	:returns: fotogramas por segundo
	
	Example::
	
		def dibujar():
			fondo(0.8)
			frecuenciaRefresco(1)
			tamañoTexto(64)
		
			texto(obtenerFPS(), -92, 20)
	"""
	...

def postProcesar() -> None:
	"""💻
	Se ejecuta después de cada llamada a la función dibujar y procesos de addons de q5 post-dibujo, si los hay.
	
	Útil para añadir efectos de post-procesamiento cuando no es posible
	hacerlo al final de la función dibujar, como cuando se usan
	addons como q5play que auto-dibujan al lienzo después de que
	la función dibujar se ejecuta.
	"""
	...

def densidadPixeles(v: float) -> float:
	"""💻
	Establece la densidad de píxeles del lienzo.
	
	:param v: valor de densidad de píxeles
	:returns: densidad de píxeles
	
	Example::
	
		Lienzo(200, 100)
		fondo(0.8)
		densidadPixeles(1)
		circulo(0, 0, 80)
	"""
	...

def densidadVisualizacion() -> float:
	"""💻
	Devuelve la densidad de visualización actual.
	
	En la mayoría de pantallas modernas, este valor será 2 o 3.
	:returns: densidad de visualización
	
	Example::
	
		Lienzo(200, 100)
		fondo(0.8)
		tamañoTexto(64)
		texto(densidadVisualizacion(), -90, 6)
	"""
	...

def deltaTiempo() -> None:
	"""💻
	El tiempo pasado desde que se dibujó el último fotograma.
	
	Con la frecuencia de fotogramas por defecto de 60, el tiempo delta será
	aproximadamente 16.6
	
	Se puede usar para mantener movimientos atados al tiempo real si el sketch
	a menudo cae por debajo de la frecuencia de fotogramas objetivo. Aunque si las frecuencias
	de fotogramas son consistentemente bajas, considera reducir la frecuencia
	de fotogramas objetivo.
	
	Example::
	
		def dibujar():
			fondo(0.8)
			texto(deltaTiempo, -90, 6)
	"""
	...

def contextoDibujo() -> None:
	"""💻
	El contexto de renderizado 2D para el lienzo, si se usa el renderizador
	Canvas2D.
	"""
	...

# 🧮 matemáticas

def aleatorio(bajo: float | list[Any] = ..., alto: float = ...) -> float | Any:
	"""🧮
	Genera un valor aleatorio.
	
	- Si no se proporcionan entradas, devuelve un número entre 0 y 1.
	- Si se proporciona una entrada numérica, devuelve un número entre 0 y el valor proporcionado.
	- Si se proporcionan dos entradas numéricas, devuelve un número entre los dos valores.
	- Si se proporciona un array, devuelve un elemento aleatorio del array.
	
	:param bajo: límite inferior (inclusivo) o un array
	:param alto: límite superior (exclusivo)
	:returns: un número o elemento aleatorio
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		frecuenciaRefresco(5)
		
		def dibujar():
			circulo(0, 0, aleatorio(200))
	"""
	...

def flu(cantidad: float) -> float:
	"""🧮
	Genera un número aleatorio dentro de un rango simétrico alrededor de cero.
	
	Se puede usar para crear un efecto de fluctuación (desplazamiento aleatorio).
	
	Equivalente a aleatorio(-cantidad, cantidad).
	
	:param cantidad: cantidad máxima absoluta de fluctuación, por defecto es 1
	:returns: número aleatorio entre -val y val
	
	Example::
	
		def dibujar():
			circulo(ratonX + flu(3), ratonY + flu(3), 5)
	"""
	...

def ruido(x: float = ..., y: float = ..., z: float = ...) -> float:
	"""🧮
	Genera un valor de ruido basado en las entradas x, y, y z.
	
	Usa Ruido Perlin por defecto.
	
	:param x: entrada coordenada-x
	:param y: entrada coordenada-y
	:param z: entrada coordenada-z
	:returns: un valor de ruido
	
	Example::
	
		def dibujar():
			fondo(0.8)
			n = ruido(frameCount * 0.01)
			circulo(0, 0, n * 200)
	"""
	...

def dist(x1: float, y1: float, x2: float, y2: float) -> float:
	"""🧮
	Calcula la distancia entre dos puntos.
	
	Esta función también acepta dos objetos con propiedades x e y.
	
	:param x1: coordenada-x del primer punto
	:param y1: coordenada-y del primer punto
	:param x2: coordenada-x del segundo punto
	:param y2: coordenada-y del segundo punto
	:returns: distancia entre los puntos
	
	Example::
	
		def dibujar():
			fondo(0.8)
			linea(0, 0, ratonX, ratonY)
		
			d = dist(0, 0, ratonX, ratonY)
			texto(redondear(d), -80, -80)
	"""
	...

def mapa(val: float, inicio1: float, fin1: float, inicio2: float, fin2: float) -> float:
	"""🧮
	Mapea un número de un rango a otro.
	
	:param val: valor entrante a convertir
	:param inicio1: límite inferior del rango actual del valor
	:param fin1: límite superior del rango actual del valor
	:param inicio2: límite inferior del rango objetivo del valor
	:param fin2: límite superior del rango objetivo del valor
	:returns: valor mapeado
	"""
	...

def modoAngulo(modo: Literal['degrees'] | Literal['radians']) -> None:
	"""🧮
	Establece el modo para interpretar y dibujar ángulos. Puede ser 'degrees' (grados) o 'radians' (radianes).
	
	:param modo: modo a establecer para la interpretación de ángulos
	"""
	...

def radianes(grados: float) -> float:
	"""🧮
	Convierte grados a radianes.
	
	:param grados: ángulo en grados
	:returns: ángulo en radianes
	"""
	...

def grados(radianes: float) -> float:
	"""🧮
	Convierte radianes a grados.
	
	:param radianes: ángulo en radianes
	:returns: ángulo en grados
	"""
	...

def interpolar(inicio: float, fin: float, cant: float) -> float:
	"""🧮
	Calcula un número entre dos números en un incremento específico.
	
	:param inicio: primer número
	:param fin: segundo número
	:param cant: cantidad a interpolar entre los dos valores
	:returns: número interpolado
	"""
	...

def constreñir(n: float, bajo: float, alto: float) -> float:
	"""🧮
	Restringe un valor entre un valor mínimo y máximo.
	
	:param n: número a restringir
	:param bajo: límite inferior
	:param alto: límite superior
	:returns: valor restringido
	"""
	...

def norm(n: float, inicio: float, fin: float) -> float:
	"""🧮
	Normaliza un número de otro rango en un valor entre 0 y 1.
	
	:param n: número a normalizar
	:param inicio: límite inferior del rango
	:param fin: límite superior del rango
	:returns: número normalizado
	"""
	...

def frac(n: float) -> float:
	"""🧮
	Calcula la parte fraccionaria de un número.
	
	:param n: un número
	:returns: parte fraccionaria del número
	"""
	...

def abs(n: float) -> float:
	"""🧮
	Calcula el valor absoluto de un número.
	
	:param n: un número
	:returns: valor absoluto del número
	"""
	...

def redondear(n: float, d: float = ...) -> float:
	"""🧮
	Redondea un número.
	
	:param n: número a redondear
	:param d: número de lugares decimales a redondear
	:returns: número redondeado
	
	Example::
	
		Lienzo(200, 100)
		fondo(0.8)
		tamañoTexto(32)
		texto(redondear(PI, 5), -90, 10)
	"""
	...

def techo(n: float) -> float:
	"""🧮
	Redondea un número hacia arriba.
	
	:param n: un número
	:returns: número redondeado
	
	Example::
	
		Lienzo(200, 100)
		fondo(0.8)
		tamañoTexto(32)
		texto(techo(PI), -90, 10)
	"""
	...

def piso(n: float) -> float:
	"""🧮
	Redondea un número hacia abajo.
	
	:param n: un número
	:returns: número redondeado
	
	Example::
	
		Lienzo(200, 100)
		fondo(0.8)
		tamañoTexto(32)
		texto(piso(-PI), -90, 10)
	"""
	...

def min(*args: float) -> float:
	"""🧮
	Devuelve el valor más pequeño en una secuencia de números.
	
	:param args: números a comparar
	:returns: mínimo
	
	Example::
	
		def dibujar():
			fondo(min(-ratonX / 100, 0.5))
			circulo(min(ratonX, 0), 0, 80)
	"""
	...

def max(*args: float) -> float:
	"""🧮
	Devuelve el valor más grande en una secuencia de números.
	
	:param args: números a comparar
	:returns: máximo
	
	Example::
	
		def dibujar():
			fondo(max(-ratonX / 100, 0.5))
			circulo(max(ratonX, 0), 0, 80)
	"""
	...

def pot(base: float, exponente: float) -> float:
	"""🧮
	Calcula el valor de una base elevada a una potencia.
	
	Por ejemplo, pot(2, 3) calcula 2 _ 2 _ 2 que es 8.
	
	:param base: base
	:param exponente: exponente
	:returns: base elevada a la potencia del exponente
	"""
	...

def cuad(n: float) -> float:
	"""🧮
	Calcula el cuadrado de un número.
	
	:param n: número a elevar al cuadrado
	:returns: cuadrado del número
	"""
	...

def raiz(n: float) -> float:
	"""🧮
	Calcula la raíz cuadrada de un número.
	
	:param n: un número
	:returns: raíz cuadrada del número
	"""
	...

def loge(n: float) -> float:
	"""🧮
	Calcula el logaritmo natural (base e) de un número.
	
	:param n: un número
	:returns: logaritmo natural del número
	"""
	...

def exp(exponente: float) -> float:
	"""🧮
	Calcula e elevado a la potencia de un número.
	
	:param exponente: potencia a la que elevar e
	:returns: e elevado a la potencia del exponente
	"""
	...

def semillaAleatoria(semilla: float) -> None:
	"""🧮
	Establece la semilla para el generador de números aleatorios.
	
	:param semilla: valor de la semilla
	"""
	...

def generadorAleatorio(metodo: Any) -> None:
	"""🧮
	Establece el método de generación de números aleatorios.
	
	:param metodo: método a usar para la generación de números aleatorios
	"""
	...

def aleatorioGaussiano(media: float, std: float) -> float:
	"""🧮
	Genera un número aleatorio siguiendo una distribución Gaussiana (normal).
	
	:param media: media (centro) de la distribución
	:param std: desviación estándar (dispersión o "ancho") de la distribución
	:returns: un número aleatorio siguiendo una distribución Gaussiana
	"""
	...

def aleatorioExponencial() -> float:
	"""🧮
	Genera un número aleatorio siguiendo una distribución exponencial.
	:returns: un número aleatorio siguiendo una distribución exponencial
	"""
	...

def modoRuido(modo: Literal['perlin'] | Literal['simplex'] | Literal['blocky']) -> None:
	"""🧮
	Establece el modo de generación de ruido.
	
	Solo el modo por defecto, "perlin", está incluido en q5.js. El uso de los
	otros modos requiere el módulo q5-noiser.
	
	:param modo: modo de generación de ruido
	"""
	...

def semillaRuido(semilla: float) -> None:
	"""🧮
	Establece el valor de la semilla para la generación de ruido.
	
	:param semilla: valor de la semilla
	"""
	...

def detalleRuido(lod: float, caida: float) -> None:
	"""🧮
	Establece el nivel de detalle para la generación de ruido.
	
	:param lod: nivel de detalle (número de octavas)
	:param caida: tasa de caída para cada octava
	"""
	...

DOS_PI: float
"""🧮
La relación de la circunferencia de un círculo a su diámetro.
Aproximadamente 3.14159.
"""

DOS_PI: float
"""🧮
2 * PI.
Aproximadamente 6.28319.
"""

def TAU() -> None:
	"""🧮
	2 * PI.
	Aproximadamente 6.28319.
	"""
	...

MEDIO_PI: float
"""🧮
Mitad de PI.
Aproximadamente 1.5708.
"""

CUARTO_PI: float
"""🧮
Un cuarto de PI.
Aproximadamente 0.7854.
"""

# 🔊 sonido

"""🔊
q5 incluye reproducción de sonido de baja latencia y capacidades básicas de mezcla
impulsadas por WebAudio.

Para filtrado de audio, síntesis y análisis, considera usar el
addon p5.sound con q5.
"""

def cargarSonido(url: str) -> Sonido:
	"""🔊
	Carga datos de audio desde un archivo y devuelve un objeto Sonido.
	
	Usa funciones como reproducir, pausar, y detener para
	controlar la reproducción. ¡Ten en cuenta que los sonidos solo pueden reproducirse después de la
	primera interacción del usuario con la página!
	
	Establece volumen a un valor entre 0 (silencio) y 1 (volumen completo).
	Establece pan a un valor entre -1 (izquierda) y 1 (derecha) para ajustar
	la posición estéreo del sonido. Establece bucle a true para repetir el sonido.
	
	Usa cargado, pausado, y terminado para comprobar el estado del sonido.
	
	El archivo de sonido completo debe cargarse antes de que la reproducción pueda comenzar, usa await para esperar a que un sonido se cargue. Para transmitir archivos de audio más grandes usa la función cargarAudio en su lugar.
	
	:param url: archivo de sonido
	:returns: sonido
	
	Example::
	
		Lienzo(200)
		
		sonido = cargarSonido('/assets/jump.wav')
		sonido.volumen = 0.3
		
		def alPresionarRatón():
			sonido.reproducir()
	"""
	...

def cargarAudio() -> object:
	"""🔊
	Carga datos de audio desde un archivo y devuelve un HTMLAudioElement.
	
	El audio se considera cargado cuando se dispara el evento canplaythrough.
	
	¡Ten en cuenta que el audio solo puede reproducirse después de la primera interacción
	del usuario con la página!
	:returns: un HTMLAudioElement
	
	Example::
	
		Lienzo(200)
		
		audio = cargarAudio('/assets/retro.flac')
		audio.volume = 0.4
		
		def alPresionarRatón():
			audio.play()
	"""
	...

def obtenerContextoAudio() -> Any:
	"""🔊
	Devuelve el AudioContext en uso o undefined si no existe.
	:returns: instancia de AudioContext
	"""
	...

async def iniciarAudioUsuario() -> object:
	"""🔊
	Crea un nuevo AudioContext o lo reanuda si estaba suspendido.
	:returns: una promesa que se resuelve cuando el AudioContext se reanuda
	"""
	...

class Sonido:
	"""🔊
	Crea un nuevo objeto Q5.Sonido.
	"""


	volumen: float
	"""🔊 Establece el volumen del sonido a un valor entre
0 (silencio) y 1 (volumen completo)."""

	pan: float
	"""🔊 Establece la posición estéreo del sonido entre -1 (izquierda) y 1 (derecha)."""

	bucle: bool
	"""🔊 Establece a true para hacer que el sonido se repita continuamente."""

	cargado: bool
	"""🔊 Verdadero si los datos de sonido han terminado de cargarse."""

	pausado: bool
	"""🔊 Verdadero si el sonido está actualmente pausado."""

	terminado: bool
	"""🔊 Verdadero si el sonido ha terminado de reproducirse."""

	def reproducir(self) -> object:
		"""🔊 Reproduce el sonido.

Si esta función se ejecuta cuando el sonido ya se está reproduciendo,
comenzará una nueva reproducción, causando un efecto de capas.

Si esta función se ejecuta cuando el sonido está pausado,
todas las instancias de reproducción se reanudarán.

Usa await para esperar a que el sonido termine de reproducirse."""
		...

	def pausar(self) -> None:
		"""🔊 Pausa el sonido, permitiendo que sea reanudado."""
		...

	def detener(self) -> None:
		"""🔊 Detiene el sonido, reiniciando su posición de reproducción
al principio.

Elimina todas las instancias de reproducción."""
		...

# 📑 dom

"""📑
El Modelo de Objetos del Documento (DOM) es una interfaz para
crear y editar páginas web con JavaScript.
"""

def crearElemento(etiqueta: str, contenido: str = ...) -> object:
	"""📑
	Crea un nuevo elemento HTML y lo añade a la página. createEl es
	un alias.
	
	Modifica el style CSS del elemento para cambiar su apariencia.
	
	Usa addEventListener para responder a eventos como:
	
	- "click": cuando se hace clic en el elemento
	- "mouseover": cuando el ratón pasa sobre el elemento
	- "mouseout": cuando el ratón deja de pasar sobre el elemento
	- "input": cuando el valor de un elemento de formulario cambia
	
	q5 añade alguna funcionalidad extra a los elementos que crea:
	
	- la función position facilita colocar el elemento
	  relativo al lienzo
	- la función size establece el ancho y alto del elemento
	- alternativamente, usa las propiedades x, y, width, y height del elemento
	
	:param etiqueta: nombre de la etiqueta del elemento
	:param contenido: contenido del elemento
	:returns: elemento
	
	Example::
	
		Lienzo(200)
		
		el = crearElemento('div', '*')
		el.position(50, 50)
		el.size(100, 100)
		el.style.fontSize = '136px'
		el.style.textAlign = 'center'
		el.style.backgroundColor = 'blue'
		el.style.color = 'white'
	"""
	...

def crearA(href: str, texto: str = ..., nuevaPestaña: bool = ...) -> None:
	"""📑
	Crea un elemento de enlace.
	
	:param href: url
	:param texto: contenido de texto
	:param nuevaPestaña: si abrir el enlace en una nueva pestaña
	
	Example::
	
		Lienzo(200)
		
		enlace = crearA('https://q5js.org', 'q5.js')
		enlace.position(16, 42)
		enlace.style.fontSize = '80px'
		
		def cb0():
			fondo('cyan')
		
		enlace.addEventListener('mouseover', cb0)
	"""
	...

def crearBoton(contenido: str = ...) -> None:
	"""📑
	Crea un elemento de botón.
	
	:param contenido: contenido de texto
	
	Example::
	
		Lienzo(200, 100)
		
		btn = crearBoton('¡Clic aqui!')
		
		def cb0():
			fondo(aleatorio(0.4, 1))
		
		btn.addEventListener('click', cb0)
	"""
	...

def crearCasilla(etiqueta: str = ..., marcado: bool = ...) -> None:
	"""📑
	Crea un elemento de casilla de verificación (checkbox).
	
	Usa la propiedad checked para obtener o establecer el estado de la casilla.
	
	La propiedad label es el elemento de etiqueta de texto junto a la casilla.
	
	:param etiqueta: etiqueta de texto colocada junto a la casilla
	:param marcado: estado inicial
	
	Example::
	
		Lienzo(200, 100)
		
		casilla = crearCasilla('¡Marca aquí!')
		casilla.label.style.color = 'lime'
		
		def cb0():
			if casilla.checked: fondo('lime')
			else: fondo('black')
		
		casilla.addEventListener('input', cb0)
	"""
	...

def crearSelectorColor(valor: str = ...) -> None:
	"""📑
	Crea un elemento de entrada de color.
	
	Usa la propiedad value para obtener o establecer el valor del color.
	
	:param valor: valor de color inicial
	
	Example::
	
		Lienzo(200, 100)
		
		selección = crearSelectorColor()
		selección.value = '#fd7575'
		
		def dibujar():
			fondo(selección.value)
	"""
	...

def crearImg(src: str) -> None:
	"""📑
	Crea un elemento de imagen.
	
	:param src: url de la imagen
	
	Example::
	
		Lienzo(200, 100)
		
		img = crearImg('/assets/q5play_logo.avif')
		img.position(0, 0).size(100, 100)
	"""
	...

def crearEntrada(valor: str = ..., tipo: str = ...) -> None:
	"""📑
	Crea un elemento de entrada (input).
	
	Usa la propiedad value para obtener o establecer el valor de la entrada.
	
	Usa la propiedad placeholder para establecer el texto de etiqueta que aparece
	dentro de la entrada cuando está vacía.
	
	Mira la documentación de input de MDN para la lista completa de tipos de entrada.
	
	:param valor: valor inicial
	:param tipo: tipo de entrada de texto, puede ser 'text', 'password', 'email', 'number', 'range', 'search', 'tel', 'url'
	
	Example::
	
		Lienzo(200, 100)
		tamañoTexto(64)
		
		entrada = crearEntrada()
		entrada.placeholder = '¡Teclea aquí!'
		entrada.size(200, 32)
		
		def cb0():
			fondo('orange')
			texto(entrada.value, -90, 30)
		
		entrada.addEventListener('input', cb0)
	"""
	...

def crearP(contenido: str = ...) -> None:
	"""📑
	Crea un elemento de párrafo.
	
	:param contenido: contenido de texto
	
	Example::
	
		Lienzo(200, 50)
		fondo('coral')
		
		p = crearP('¡Hola, mundo!')
		p.style.color = 'pink'
	"""
	...

def crearOpciones(nombreGrupo: str = ...) -> None:
	"""📑
	Crea un grupo de botones de radio.
	
	Usa la función option(etiqueta, valor) para añadir nuevos botones de radio
	al grupo.
	
	Usa la propiedad value para obtener o establecer el valor del botón de radio seleccionado.
	
	:param nombreGrupo: 
	
	Example::
	
		Lienzo(200, 160)
		
		radio = crearOpciones()
		radio.option('cuadrado', '1').option('círculo', '2')
		
		def dibujar():
			fondo(0.8)
			if radio.value == '1': cuadrado(-40, -40, 80)
			if radio.value == '2': circulo(0, 0, 80)
	"""
	...

def crearSeleccion(placeholder: str = ...) -> None:
	"""📑
	Crea un elemento de selección (select).
	
	Usa la función option(etiqueta, valor) para añadir nuevas opciones al
	elemento de selección.
	
	Establece multiple a true para permitir seleccionar múltiples opciones.
	
	Usa la propiedad value para obtener o establecer el valor de la opción seleccionada.
	
	Usa la propiedad selected para obtener las etiquetas de las opciones
	seleccionadas o establecer las opciones seleccionadas por etiqueta. Puede ser una sola
	cadena o un array de cadenas.
	
	:param placeholder: texto opcional que aparece antes de que se seleccione una opción
	
	Example::
	
		Lienzo(200, 100)
		
		sel = crearSeleccion('Seleccionar un opcion')
		sel.option('Red', '#f55').option('Green', '#5f5')
		
		def cb0():
			fondo(sel.value)
		
		sel.addEventListener('change', cb0)
	"""
	...

def crearDeslizador(min: float, max: float, valor: float = ..., paso: float = ...) -> None:
	"""📑
	Crea un elemento deslizador (slider).
	
	Usa la propiedad value para obtener o establecer el valor del deslizador.
	
	Usa la función val para obtener el valor del deslizador como un número.
	
	:param min: valor mínimo
	:param max: valor máximo
	:param valor: valor inicial
	:param paso: tamaño del paso
	
	Example::
	
		Lienzo(200)
		
		deslizador = crearDeslizador(0, 1, 0.5, 0.1)
		deslizador.position(10, 10).size(180)
		
		def dibujar():
			fondo(deslizador.val())
	"""
	...

def crearVideo(src: str) -> object:
	"""📑
	Crea un elemento de video.
	
	Ten en cuenta que los videos deben estar silenciados para reproducirse automáticamente y las funciones play y
	pause solo pueden ejecutarse después de una interacción del usuario.
	
	El elemento de video puede ocultarse y su contenido puede
	mostrarse en el lienzo usando la función imagen.
	
	:param src: url del video
	:returns: un nuevo elemento de video
	
	Example::
	
		Lienzo(1)
		
		vid = crearVideo('/assets/apollo4.mp4')
		vid.size(200, 150)
		vid.autoplay = vid.muted = vid.loop = True
		vid.controls = True
	"""
	...

def crearCaptura(tipo: str = ..., volteado: bool = ...) -> object:
	"""📑
	Crea una captura desde una cámara conectada, como una webcam.
	
	El elemento de video de captura puede ocultarse y su contenido puede
	mostrarse en el lienzo usando la función imagen.
	
	Puede precargarse para asegurar que la captura esté lista para usar cuando tu
	sketch comience.
	
	Solicita la resolución de video más alta de la cámara frontal del usuario
	por defecto. El primer parámetro de esta función se puede usar para
	especificar las restricciones para la captura. Mira getUserMedia
	para más información.
	
	:param tipo: tipo de captura, puede ser solo VIDEO o solo AUDIO, el defecto es usar ambos video y audio
	:param volteado: si reflejar el video verticalmente, true por defecto
	:returns: un nuevo elemento de video
	
	Example::
	
		def alPresionarRatón():
			cap = crearCaptura(VIDEO)
			cap.size(200, 112.5)
			canvas.remove()
	"""
	...

def encontrarElemento(selector: str) -> object:
	"""📑
	Encuentra el primer elemento en el DOM que coincide con el selector CSS dado.
	
	:param selector: 
	:returns: elemento
	"""
	...

def encontrarElementos(selector: str) -> list[object]:
	"""📑
	Encuentra todos los elementos en el DOM que coinciden con el selector CSS dado.
	
	:param selector: 
	:returns: elementos
	"""
	...

# 🎞 grabación

def crearGrabadora() -> object:
	"""🎞
	Crea una grabadora. ¡Simplemente presiona grabar para empezar a grabar!
	
	Las siguientes propiedades se pueden establecer a través de la UI de la grabadora o
	programáticamente.
	
	- format se establece a "H.264" por defecto.
	- bitrate es un número en megabits por segundo (mbps). Su valor por defecto
	  está determinado por la altura del lienzo. Aumentar la
	  tasa de bits aumentará la calidad y el tamaño del archivo de la grabación.
	- captureAudio se establece a true por defecto. Establecer a false para deshabilitar
	  la grabación de audio.
	
	Ten en cuenta que las grabaciones se hacen a una tasa de fotogramas variable (VFR), lo que
	hace que el video de salida sea incompatible con algún software de edición.
	Para más información, mira la página wiki
	"Recording the Canvas".
	:returns: una grabadora, elemento DOM de q5
	
	Example::
	
		Lienzo(200)
		
		grab = crearGrabadora()
		grab.bitrate = 10
		
		def dibujar():
			circulo(ratonX, flu(medioAlto), 10)
	"""
	...

def grabar() -> None:
	"""🎞
	Comienza a grabar el lienzo o reanuda la grabación si estaba pausada.
	
	Si no existe grabadora, se crea una pero no se muestra.
	"""
	...

def pausarGrabacion() -> None:
	"""🎞
	Pausa la grabación del lienzo, si hay una en progreso.
	"""
	...

def borrarGrabacion() -> None:
	"""🎞
	Descarta la grabación actual.
	"""
	...

def guardarGrabacion(nombreArchivo: str) -> None:
	"""🎞
	Guarda la grabación actual como un archivo de video.
	
	:param nombreArchivo: 
	
	Example::
	
		def dibujar():
			cuadrado(ratonX, flu(100), 10)
		
		def alPresionarRatón():
			if not grabando: grabar()
			else: guardarGrabacion('squares')
	"""
	...

def grabando() -> None:
	"""🎞
	Verdadero si el lienzo está siendo grabado actualmente.
	"""
	...

# 🛠 utilidades

async def cargar(*urls: str) -> object:
	"""🛠
	Carga un archivo o múltiples archivos.
	
	El tipo de archivo se determina por la extensión del archivo. q5 soporta cargar
	archivos de texto, json, csv, fuente, audio, e imagen.
	
	Por defecto, los recursos se cargan en paralelo antes de que q5 ejecute dibujar. Usa await para esperar a que los recursos se carguen.
	
	:param urls: 
	:returns: una promesa que se resuelve con objetos
	
	Example::
	
		Lienzo(200)
		
		logo = cargar('/q5js_logo.avif')
		
		def dibujar():
			imagen(logo, -100, -100, 200, 200)
	"""
	...

def guardar(datos: dict = ..., nombreArchivo: str = ...) -> None:
	"""🛠
	Guarda datos en un archivo.
	
	Si no se especifican datos, se guardará el lienzo.
	
	Si no se proporcionan argumentos, el lienzo se guardará como
	un archivo de imagen llamado "untitled.png".
	
	:param datos: lienzo, imagen, u objeto JS
	:param nombreArchivo: nombre de archivo para guardar como
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		circulo(0, 0, 50)
		
		def alPresionarRatón():
			guardar('circle.png')
	"""
	...

def cargarTexto(url: str) -> dict:
	"""🛠
	Carga un archivo de texto desde la url especificada.
	
	Se recomienda usar await para obtener el texto cargado como una cadena.
	
	:param url: archivo de texto
	:returns: un objeto conteniendo el texto cargado en la propiedad obj.text o usa await para obtener la cadena de texto directamente
	"""
	...

def cargarJSON(url: str) -> Any:
	"""🛠
	Carga un archivo JSON desde la url especificada.
	
	Se recomienda usar await para obtener el objeto o array JSON cargado.
	
	:param url: archivo JSON
	:returns: un objeto o array conteniendo el JSON cargado
	"""
	...

def cargarCSV(url: str) -> list[dict]:
	"""🛠
	Carga un archivo CSV desde la url especificada.
	
	Se recomienda usar await para obtener el CSV cargado como un array de objetos.
	
	:param url: archivo CSV
	:returns: un array de objetos conteniendo el CSV cargado
	"""
	...

def cargarXML(url: str) -> Any:
	"""🛠
	Carga un archivo xml desde la url especificada.
	
	Se recomienda usar await para obtener el Elemento XML cargado.
	
	:param url: archivo xml
	:returns: un objeto conteniendo el Elemento XML cargado en una propiedad llamada obj.DOM o usa await para obtener el Elemento XML directamente
	
	Example::
	
		Lienzo(200)
		fondo(200)
		tamañoTexto(32)
		
		animales = await cargarXML('/assets/animals.xml')
		
		mamiferos = animales.getElementsByTagName('mammal')
		y = 64
		for mamifero in mamiferos:
			texto(mamifero.textContent, 20, (y += 32))
	"""
	...

def cargarTodo() -> object:
	"""🛠
	Espera a que cualquier recurso que comenzó a cargarse termine de cargarse. Por defecto q5 ejecuta esto antes de hacer bucle en dibujar (lo cual se llama precarga), pero se puede usar incluso después de que dibujar comience a hacer bucle.
	:returns: una promesa que se resuelve con objetos cargados
	"""
	...

def deshabilitarPrecarga() -> None:
	"""🛠
	Deshabilita la precarga automática de recursos antes de que dibujar comience a hacer bucle. Esto permite que dibujar comience inmediatamente, y los recursos se pueden cargar perezosamente o se puede usar cargarTodo() para esperar a que los recursos terminen de cargarse más tarde.
	"""
	...

def nf(num: float, digitos: float) -> str:
	"""🛠
	nf es la abreviatura de formato de número. Formatea un número
	a una cadena con un número especificado de dígitos.
	
	:param num: número a formatear
	:param digitos: número de dígitos a formatear
	:returns: número formateado
	
	Example::
	
		Lienzo(200, 100)
		fondo(0.8)
		
		tamañoTexto(32)
		texto(nf(PI, 4, 5), -90, 10)
	"""
	...

def barajar(arr: list[Any], modificar: bool = ...) -> list[Any]:
	"""🛠
	Baraja los elementos de un array.
	
	:param arr: array a barajar
	:param modificar: si modificar el array original, falso por defecto lo cual copia el array antes de barajar
	:returns: array barajado
	"""
	...

def guardarItem(clave: str, val: str) -> None:
	"""🛠
	Almacena un ítem en localStorage.
	
	:param clave: clave bajo la cual almacenar el ítem
	:param val: valor a almacenar
	"""
	...

def obtenerItem(clave: str) -> str:
	"""🛠
	Recupera un ítem de localStorage.
	
	:param clave: clave del ítem a recuperar
	:returns: valor del ítem recuperado
	"""
	...

def eliminarItem(clave: str) -> None:
	"""🛠
	Elimina un ítem de localStorage.
	
	:param clave: clave del ítem a eliminar
	"""
	...

def limpiarAlmacenamiento() -> None:
	"""🛠
	Limpia todos los ítems de localStorage.
	"""
	...

def año() -> float:
	"""🛠
	Devuelve el año actual.
	:returns: año actual
	"""
	...

def dia() -> float:
	"""🛠
	Devuelve el día actual del mes.
	:returns: día actual
	"""
	...

def hora() -> float:
	"""🛠
	Devuelve la hora actual.
	:returns: hora actual
	"""
	...

def minuto() -> float:
	"""🛠
	Devuelve el minuto actual.
	:returns: minuto actual
	"""
	...

def segundo() -> float:
	"""🛠
	Devuelve el segundo actual.
	:returns: segundo actual
	"""
	...

# ↗ vector

def crearVector(x: float = ..., y: float = ..., z: float = ..., w: float = ...) -> Vector:
	"""↗
	Crea un nuevo objeto Vector.
	
	:param x: componente x del vector
	:param y: componente y del vector
	:param z: componente z del vector
	:param w: componente w del vector
	:returns: nuevo objeto Vector
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		v = crearVector(0, 0)
		circulo(v.x, v.y, 50)
	"""
	...

class Vector:
	"""↗
	Una clase para describir un vector bidimensional o tridimensional, específicamente un vector euclidiano (también conocido como geométrico). Un vector es una entidad que tiene tanto magnitud como dirección. El tipo de datos almacena los componentes del vector (x, y para 2D, y z para 3D). La magnitud y dirección se pueden acceder a través de los métodos mag() y heading().
	"""


	x: float
	"""↗ El componente x del vector."""

	y: float
	"""↗ El componente y del vector."""

	z: float
	"""↗ El componente z del vector."""

	def w(self) -> None:
		"""↗ El componente w del vector."""
		...

	def set(self, x: float = ..., y: float = ..., z: float = ..., w: float = ...) -> Vector:
		"""↗ Establece los componentes x, y, y z del vector."""
		...

	def copy(self) -> Vector:
		"""↗ Devuelve una copia del vector."""
		...

	def add(self, x: float | Vector, y: float = ..., z: float = ...) -> Vector:
		"""↗ Suma x, y, y z componentes a un vector, suma un vector a otro, o suma dos vectores independientes."""
		...

	def sub(self, x: float | Vector, y: float = ..., z: float = ...) -> Vector:
		"""↗ Resta x, y, y z componentes de un vector, resta un vector de otro, o resta dos vectores independientes."""
		...

	def mult(self, n: float) -> Vector:
		"""↗ Multiplica el vector por un escalar."""
		...

	def div(self, n: float) -> Vector:
		"""↗ Divide el vector por un escalar."""
		...

	def mag(self) -> float:
		"""↗ Calcula la magnitud (longitud) del vector y devuelve el resultado como un flotante (esto es simplemente la ecuación sqrt(x*x + y*y + z*z))."""
		...

	def magSq(self) -> float:
		"""↗ Calcula la magnitud (longitud) del vector al cuadrado y devuelve el resultado como un flotante (esto es simplemente la ecuación x*x + y*y + z*z)."""
		...

	def dot(self, v: Vector) -> float:
		"""↗ Calcula el producto punto de dos vectores."""
		...

	def cross(self, v: Vector) -> Vector:
		"""↗ Calcula el producto cruz de dos vectores."""
		...

	def dist(self, v: Vector) -> float:
		"""↗ Calcula la distancia euclidiana entre dos puntos (considerando un punto como un objeto vector)."""
		...

	def normalize(self) -> Vector:
		"""↗ Normaliza el vector a longitud 1 (hace que sea un vector unitario)."""
		...

	def limit(self, max: float) -> Vector:
		"""↗ Limita la magnitud de este vector al valor usado para el parámetro max."""
		...

	def setMag(self, len: float) -> Vector:
		"""↗ Establece la magnitud de este vector al valor usado para el parámetro len."""
		...

	def heading(self) -> float:
		"""↗ Calcula el ángulo de rotación para este vector (solo vectores 2D)."""
		...

	def rotate(self, ángulo: float) -> Vector:
		"""↗ Rota el vector por un ángulo (solo vectores 2D), la magnitud permanece igual."""
		...

	def angleBetween(self, v: Vector) -> float:
		"""↗ Calcula y devuelve el ángulo entre dos vectores."""
		...

	def lerp(self, v: Vector, amt: float) -> Vector:
		"""↗ Interpola linealmente el vector a otro vector."""
		...

	def reflect(self, superficieNormal: Vector) -> Vector:
		"""↗ Refleja el vector entrante sobre una normal al muro."""
		...

	def array(self) -> list[float]:
		"""↗ Devuelve una representación de este vector como un array de flotantes."""
		...

	def equals(self, v: Vector) -> bool:
		"""↗ Comprueba si los componentes x, y, y z del vector son iguales a los componentes x, y, y z de otro vector."""
		...

	def fromAngle(self, ángulo: float, longitud: float = ...) -> Vector:
		"""↗ Hace un nuevo vector 2D desde un ángulo de longitud 1."""
		...

	def random2D(self) -> Vector:
		"""↗ Hace un nuevo vector 2D aleatorio con una magnitud de 1."""
		...

	def random3D(self) -> Vector:
		"""↗ Hace un nuevo vector 3D aleatorio con una magnitud de 1."""
		...

# 🖌 modelado

def arco(x: float, y: float, w: float, h: float, inicio: float, fin: float, modo: float = ...) -> None:
	"""🖌
	Dibuja un arco, que es una sección de una elipse.
	
	modoEliptico afecta cómo se dibuja el arco.
	
	q5 WebGPU solo soporta el modo por defecto PIE_OPEN.
	
	:param x: coordenada-x
	:param y: coordenada-y
	:param w: ancho de la elipse
	:param h: alto de la elipse
	:param inicio: ángulo para empezar el arco
	:param fin: ángulo para terminar el arco
	:param modo: configuración de estilo de forma y trazo, por defecto es PIE_OPEN para una forma de pastel con un trazo no cerrado, puede ser PIE, CHORD, o CHORD_OPEN
	
	Example::
	
		Lienzo(200)
		fondo(0.8)
		
		arco(0, 0, 160, 160, 0.8, -0.8)
	"""
	...

def curva() -> None:
	"""🖌
	Dibuja una curva.
	
	Example::
	
		Lienzo(200, 100)
		fondo(0.8)
		
		curva(-100, -200, -50, 0, 50, 0, 100, -200)
	"""
	...

def detalleCurva(val: float) -> None:
	"""🖌
	Establece la cantidad de segmentos de línea recta usados para hacer una curva.
	
	Solo tiene efecto en q5 WebGPU.
	
	:param val: nivel de detalle de la curva, por defecto es 20
	
	Example::
	
		Lienzo(200)
		
		detalleCurva(4)
		
		grosorTrazo(10)
		trazo(0, 1, 1)
		curva(-100, -200, -50, 0, 50, 0, 100, -200)
	"""
	...

def empezarForma() -> None:
	"""🖌
	Comienza a almacenar vértices para una forma convexa.
	"""
	...

def terminarForma() -> None:
	"""🖌
	Termina de almacenar vértices para una forma convexa.
	"""
	...

def vertice(x: float, y: float) -> None:
	"""🖌
	Especifica un vértice en una forma.
	
	:param x: coordenada-x
	:param y: coordenada-y
	
	Example::
	
		Lienzo(200)
		
		trazo(1, 0.5)
		grosorTrazo(20)
		
		empezarForma()
		relleno(1, 0, 0)
		vertice(-80, -80)
		vertice(40, -60)
		relleno(0, 0, 1)
		vertice(80, 60)
		vertice(-60, 80)
		terminarForma(True)
	"""
	...

def verticeBezier(cp1x: float, cp1y: float, cp2x: float, cp2y: float, x: float, y: float) -> None:
	"""🖌
	Especifica un vértice Bezier en una forma.
	
	:param cp1x: coordenada-x del primer punto de control
	:param cp1y: coordenada-y del primer punto de control
	:param cp2x: coordenada-x del segundo punto de control
	:param cp2y: coordenada-y del segundo punto de control
	:param x: coordenada-x del punto de anclaje
	:param y: coordenada-y del punto de anclaje
	"""
	...

def verticeCuadratico(cp1x: float, cp1y: float, x: float, y: float) -> None:
	"""🖌
	Especifica un vértice Bezier cuadrático en una forma.
	
	:param cp1x: coordenada-x del punto de control
	:param cp1y: coordenada-y del punto de control
	:param x: coordenada-x del punto de anclaje
	:param y: coordenada-y del punto de anclaje
	"""
	...

def bezier(x1: float, y1: float, x2: float, y2: float, x3: float, y3: float, x4: float, y4: float) -> None:
	"""🖌
	Dibuja una curva Bezier.
	
	:param x1: coordenada-x del primer punto de anclaje
	:param y1: coordenada-y del primer punto de anclaje
	:param x2: coordenada-x del primer punto de control
	:param y2: coordenada-y del primer punto de control
	:param x3: coordenada-x del segundo punto de control
	:param y3: coordenada-y del segundo punto de control
	:param x4: coordenada-x del segundo punto de anclaje
	:param y4: coordenada-y del segundo punto de anclaje
	"""
	...

def triangulo(x1: float, y1: float, x2: float, y2: float, x3: float, y3: float) -> None:
	"""🖌
	Dibuja un triángulo.
	
	:param x1: coordenada-x del primer vértice
	:param y1: coordenada-y del primer vértice
	:param x2: coordenada-x del segundo vértice
	:param y2: coordenada-y del segundo vértice
	:param x3: coordenada-x del tercer vértice
	:param y3: coordenada-y del tercer vértice
	"""
	...

def quad(x1: float, y1: float, x2: float, y2: float, x3: float, y3: float, x4: float, y4: float) -> None:
	"""🖌
	Dibuja un cuadrilátero.
	
	:param x1: coordenada-x del primer vértice
	:param y1: coordenada-y del primer vértice
	:param x2: coordenada-x del segundo vértice
	:param y2: coordenada-y del segundo vértice
	:param x3: coordenada-x del tercer vértice
	:param y3: coordenada-y del tercer vértice
	:param x4: coordenada-x del cuarto vértice
	:param y4: coordenada-y del cuarto vértice
	"""
	...

def empezarContorno() -> None:
	"""🖌
	Comienza a almacenar vértices para un contorno.
	
	No disponible en q5 WebGPU.
	"""
	...

def terminarContorno() -> None:
	"""🖌
	Termina de almacenar vértices para un contorno.
	
	No disponible en q5 WebGPU.
	"""
	...

# ⚡ sombreadores

"""⚡
¡Shaders personalizados escritos en WGSL (WebGPU Shading Language) pueden ser
usados para crear efectos visuales avanzados en q5!
"""

def crearShader(codigo: str, tipo: str = ..., datos: list[float] = ...) -> Any:
	"""⚡
	Crea un shader que el renderizador WebGPU de q5 puede usar.
	
	Si tipo no se especifica, esta función personaliza una copia del shader de formas por defecto, lo que afecta a las siguientes funciones: plano, linea, y terminarForma.
	
	Para más información sobre los parámetros de entrada de las funciones de vértice y fragmento,
	los datos y las funciones auxiliares disponibles para usar
	en tu código de shader personalizado, lee la página wiki
	"Custom Shaders in q5 WebGPU".
	
	:param codigo: Extracto de código WGSL para el shader
	:param tipo: por defecto "shapes"
	:param datos: solo para usar con shaders totalmente personalizados
	:returns: un programa shader
	
	Example::
	
		Lienzo(200)
		
		wobble = crearShader("""
		@vertex
		fn vertexMain(v: VertexParams) -> FragParams {
			var vert = transformVertex(v.pos, v.matrixIndex);
		
		  let i = f32(v.vertexIndex) % 4 * 100;
		  vert.x += cos((q.time + i) * 0.01) * 0.1;
		
			var f: FragParams;
			f.position = vert;
			f.color = vec4f(1, 0, 0, 1);
			return f;
		}""")
		
		def dibujar():
			limpiar()
			shader(wobble)
			plano(0, 0, 100)
	"""
	...

def plano(x: float, y: float, w: float, h: float = ...) -> None:
	"""⚡
	Un plano es un rectángulo centrado sin trazo.
	
	:param x: centro x
	:param y: centro y
	:param w: ancho o longitud del lado
	:param h: alto
	
	Example::
	
		Lienzo(200)
		plano(0, 0, 100)
	"""
	...

def shader(moduloShader: Any) -> None:
	"""⚡
	Aplica un shader.
	
	:param moduloShader: un programa shader
	"""
	...

def reiniciarShader() -> None:
	"""⚡
	Hace que q5 use el shader de formas por defecto.
	
	Example::
	
		Lienzo(200)
		
		stripes = crearShader("""
		@fragment
		fn fragMain(f: FragParams) -> @location(0) vec4f {
			let g = cos((q.mouseY + f.position.y) * 0.05);
			return vec4(1, g, 0, 1);
		}""")
		
		def dibujar():
			shader(stripes)
			plano(0, 0, ancho, alto)
		
			reiniciarShader()
			triángulo(-50, -50, 0, 50, 50, -50)
	"""
	...

def reiniciarShaderFotograma() -> None:
	"""⚡
	Hace que q5 use el shader de fotograma por defecto.
	"""
	...

def reiniciarShaderImagen() -> None:
	"""⚡
	Hace que q5 use el shader de imagen por defecto.
	"""
	...

def reiniciarShaderVideo() -> None:
	"""⚡
	Hace que q5 use el shader de video por defecto.
	"""
	...

def reiniciarShaderTexto() -> None:
	"""⚡
	Hace que q5 use el shader de texto por defecto.
	"""
	...

def reiniciarShaders() -> None:
	"""⚡
	Hace que q5 use todos los shaders por defecto.
	"""
	...

def crearShaderFotograma() -> None:
	"""⚡
	Crea un shader que q5 puede usar para dibujar fotogramas.
	
	crearLienzo debe ejecutarse antes de usar esta función.
	
	Usa esta función para personalizar una copia del
	shader de fotograma por defecto.
	
	Example::
	
		Lienzo(200, 400)
		trazo(1)
		grosorTrazo(8)
		terminacionTrazo(PROJECT)
		
		boxy = crearShaderFotograma("""
		@fragment
		fn fragMain(f: FragParams) -> @location(0) vec4f {
			let x = sin(f.texCoord.y * 4 + q.time * 0.002);
			let y = cos(f.texCoord.x * 4 + q.time * 0.002);
			let uv = f.texCoord + vec2f(x, y);
			return textureSample(tex, samp, uv);
		}""")
		
		def dibujar():
			linea(ratonX, ratonY, pRatonX, pRatonY)
			reiniciarShaders() if ratonPresionado else shader(boxy)
	"""
	...

def crearShaderImagen(codigo: str) -> Any:
	"""⚡
	Crea un shader que q5 puede usar para dibujar imágenes.
	
	Usa esta función para personalizar una copia del
	shader de imagen por defecto.
	
	:param codigo: extracto de código shader WGSL
	:returns: un programa shader
	
	Example::
	
		Lienzo(200, 400)
		modoImagen(CENTER)
		
		logo = cargarImagen('/q5js_logo.avif')
		
		grate = crearShaderImagen("""
		@fragment
		fn fragMain(f: FragParams) -> @location(0) vec4f {
			var texColor = textureSample(tex, samp, f.texCoord);
			texColor.b += (q.mouseX + f.position.x) % 20 / 10;
			return texColor;
		}""")
		
		def dibujar():
			fondo(0.7)
			shader(grate)
			imagen(logo, 0, 0, 180, 180)
		
		#
	"""
	...

def crearShaderVideo(codigo: str) -> Any:
	"""⚡
	Crea un shader que q5 puede usar para dibujar fotogramas de video.
	
	Usa esta función para personalizar una copia del
	shader de video por defecto.
	
	:param codigo: extracto de código shader WGSL
	:returns: un programa shader
	
	Example::
	
		Lienzo(200, 600)
		
		vid = crearVideo('/assets/apollo4.mp4')
		vid.hide()
		
		flipper = crearShaderVideo("""
		@vertex
		fn vertexMain(v: VertexParams) -> FragParams {
			var vert = transformVertex(v.pos, v.matrixIndex);
		
			var vi = f32(v.vertexIndex);
			vert.y *= cos((q.frameCount + vi * 10) * 0.03);
		
			var f: FragParams;
			f.position = vert;
			f.texCoord = v.texCoord;
			return f;
		}
		
		@fragment
		fn fragMain(f: FragParams) -> @location(0) vec4f {
			var texColor =
				textureSampleBaseClampToEdge(tex, samp, f.texCoord);
			texColor.r = 0;
			texColor.b *= 2;
			return texColor;
		}""")
		
		def dibujar():
			limpiar()
			if ratonPresionado: vid.play()
			shader(flipper)
			imagen(vid, -100, 150, 200, 150)
	"""
	...

def crearShaderTexto(codigo: str) -> Any:
	"""⚡
	Crea un shader que q5 puede usar para dibujar texto.
	
	Usa esta función para personalizar una copia del
	shader de texto por defecto.
	
	:param codigo: extracto de código shader WGSL
	:returns: un programa shader
	
	Example::
	
		Lienzo(200)
		alineaciónTexto(CENTER, CENTER)
		
		spin = crearShaderTexto("""
		@vertex
		fn vertexMain(v : VertexParams) -> FragParams {
			let char = textChars[v.instanceIndex];
			let text = textMetadata[i32(char.w)];
			let fontChar = fontChars[i32(char.z)];
			let pos = calcPos(v.vertexIndex, char, fontChar, text);
		
			var vert = transformVertex(pos, text.matrixIndex);
		
			let i = f32(v.instanceIndex + 1);
			vert.y *= cos((q.frameCount - 5 * i) * 0.05);
		
			var f : FragParams;
			f.position = vert;
			f.texCoord = calcUV(v.vertexIndex, fontChar);
			f.fillColor = colors[i32(text.fillIndex)];
			f.strokeColor = colors[i32(text.strokeIndex)];
			f.strokeWeight = text.strokeWeight;
			f.edge = text.edge;
			return f;
		}""")
		
		def dibujar():
			limpiar()
			shader(spin)
			relleno(1, 0, 1)
			tamañoTexto(32)
			texto('Hello, World!', 0, 0)
	"""
	...

# ⚙ avanzado

q5: type[Q5]
"""⚙
Alias para Q5.
"""

class Q5:
	"""⚙
	Funcion constructora. Crea una instancia de Q5.
	"""


	version: str
	"""⚙ La versión menor actual de q5."""


	deshabilitarErroresAmigables: bool
	"""⚙ Desactiva los mensajes de error amigables de q5."""

	toleranteErrores: bool
	"""⚙ Establecer en verdadero para mantener el bucle de dibujo después de un error."""

	soportaHDR: bool
	"""⚙ Verdadero si el dispositivo soporta HDR (el espacio de color display-p3)."""

	opcionesLienzo: dict
	"""⚙ Establece los atributos de contexto de lienzo predeterminados utilizados para
lienzos recién creados y gráficos internos. Estas opciones son sobrescritas por
cualquier opción por lienzo que pases a crearLienzo."""

	MAX_COLORES: float
	"""⚙ El número máximo de colores de q5
(creados mediante llamadas a color, fondo, relleno, trazo y teñir)
que se pueden almacenar por fotograma con el renderizador WebGPU."""

	MAX_RECTANGULOS: float
	"""⚙ El número máximo de rectángulos
(llamadas a rect, cuadrado y cápsula)
que se pueden dibujar por fotograma con el renderizador WebGPU."""

	MAX_ELIPSES: float
	"""⚙ El número máximo de elipses
(llamadas a elipse, círculo y arco)
que se pueden dibujar por fotograma con el renderizador WebGPU."""

	MAX_CARACTERES: float
	"""⚙ El número máximo de caracteres de texto
que se pueden dibujar por fotograma con el renderizador WebGPU."""

	MAX_TEXTOS: float
	"""⚙ El número máximo de llamadas independientes a texto
que se pueden dibujar por fotograma con el renderizador WebGPU."""

	MAX_TRANSFORMACIONES: float
	"""⚙ El número máximo de matrices de transformación
que se pueden usar por fotograma con el renderizador WebGPU. De forma predeterminada, se establece para usar todo el límite de 128 MB de maxStorageBufferBindingSize.
https://developer.mozilla.org/docs/Web/API/GPUSupportedLimits"""

	MAX_IMAGENES: float
	"""⚙ El número máximo de imágenes (llamadas a imagen e imagenTexto)
que se pueden dibujar por fotograma con el renderizador WebGPU."""

	MAX_VERTICES_FORMAS: float
	"""⚙ El número máximo de vértices en las formas
(creados mediante llamadas a terminarForma,
triángulo, quad, curva y bezier)
que se pueden usar por fotograma con el renderizador WebGPU."""

	def WebGPU(self) -> Q5:
		"""⚙ Crea una nueva instancia de Q5 que usa el renderizador WebGPU de q5."""
		...

	def addHook(self, lifecycle: str, fn: Callable[..., Any]) -> None:
		"""⚙ Los addons pueden aumentar q5 con nueva funcionalidad agregando hooks,
funciones que se ejecutan en fases específicas del ciclo de vida de q5.

Dentro de la función, this se refiere a la instancia de Q5."""
		...

	def registerAddon(self, addon: Callable[..., Any]) -> None:
		"""⚙ Forma compatible con p5.js v2 de registrar un addon con q5."""
		...

	modulos: dict
	"""⚙ Un objeto que contiene los módulos de q5, funciones que se ejecutan cuando q5 carga.

Cada función recibe dos parámetros de entrada:

- la instancia de q5
- un proxy para editar la instancia de q5 y las propiedades correspondientes del ámbito global"""

	def dibujar(self) -> None:
		"""⚙ La función de dibujo de q5 se ejecuta 60 veces por segundo por defecto."""
		...

	def postProcesar(self) -> None:
		"""⚙ Se ejecuta después de cada llamada a la función dibujar y procesos de addons de q5 post-dibujo, si los hay.

Útil para agregar efectos de post-procesamiento cuando no es posible
hacerlo al final de la función dibujar, como cuando se usan
addons como q5play que dibujan automáticamente al lienzo después de que
la función dibujar se ejecuta."""
		...
