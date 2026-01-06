const libLangs = `
# core
createCanvas -> es:crearLienzo ja:キャンバスを作成する
log -> es:log

# color
background -> es:fondo ja:背景
fill -> es:relleno
stroke -> es:trazo
noFill -> es:sinRelleno
noStroke -> es:sinTrazo
color -> es:color
colorMode -> es:modoColor

# display
windowWidth -> es:anchoVentana
windowHeight -> es:altoVentana
width -> es:ancho
height -> es:alto
frameCount ->  es:cuadroActual
noLoop -> es:pausar
redraw -> es:redibujar
loop -> es:reanudar
frameRate -> es:frecuenciaRefresco
getTargetFrameRate -> es:obtenerTasaFotogramasObjetivo
getFPS -> es:obtenerFPS
deltaTime -> es:deltaTiempo
pixelDensity -> es:densidadPíxeles
displayDensity -> es:densidadVisualización
fullscreen -> es:pantallaCompleta
displayMode -> es:modoVisualización
halfWidth -> es:medioAncho
halfHeight -> es:medioAlto
canvas -> es:lienzo
resizeCanvas -> es:redimensionarLienzo
drawingContext -> es:contextoDibujo

# shape
circle -> es:círculo
ellipse -> es:elipse
rect -> es:rect
square -> es:cuadrado
point -> es:punto
line -> es:línea
capsule -> es:cápsula
rectMode -> es:modoRect
ellipseMode -> es:modoEliptico
arc -> es:arco
curve -> es:curva
beginShape -> es:empezarForma
endShape -> es:terminarForma
vertex -> es:vértice
bezier -> es:bezier
triangle -> es:triángulo
quad -> es:quad
curveDetail -> es:detalleCurva
beginContour -> es:empezarContorno
endContour -> es:terminarContorno
bezierVertex -> es:vérticeBezier
quadraticVertex -> es:vérticeCuadrático

# image
loadImage -> es:cargarImagen
image -> es:imagen
imageMode -> es:modoImagen
noTint -> es:noTeñir
tint -> es:teñir
filter -> es:filtro
createImage -> es:crearImagen
createGraphics -> es:crearGráficos
defaultImageScale -> es:escalaImagenPorDefecto
resize -> es:redimensionar
trim -> es:recortar
smooth -> es:suavizar
noSmooth -> es:noSuavizar
mask -> es:enmascarar
copy -> es:copiar
inset -> es:insertado
get -> es:obtener
set -> es:establecer
pixels -> es:píxeles
loadPixels -> es:cargarPíxeles
updatePixels -> es:actualizarPíxeles

# text
text -> es:texto
loadFont -> es:cargarFuente
textFont -> es:fuenteTexto
textSize -> es:tamañoTexto
textLeading -> es:interlineado
textStyle -> es:estiloTexto
textAlign -> es:alineaciónTexto
textWidth -> es:anchoTexto
textWeight -> es:pesoTexto
textAscent -> es:ascensoTexto
textDescent -> es:descensoTexto
createTextImage -> es:crearImagenTexto
textImage -> es:imagenTexto
nf -> es:nf

# input
mouseX -> es:ratónX
mouseY -> es:ratónY
pmouseX -> es:pRatónX
pmouseY -> es:pRatónY
mouseIsPressed -> es:ratónPresionado
mouseButton -> es:botónRatón
key -> es:tecla
keyIsPressed -> es:teclaPresionada
keyIsDown -> es:teclaEstaPresionada
touches -> es:toques
pointers -> es:punteros
cursor -> es:cursor
noCursor -> es:sinCursor
pointerLock -> es:bloqueoPuntero

# style
strokeWeight -> es:grosorTrazo
opacity -> es:opacidad
shadow -> es:sombra
noShadow -> es:sinSombra
shadowBox -> es:cajaSombra
blendMode -> es:modoMezcla
strokeCap -> es:terminaciónTrazo
strokeJoin -> es:uniónTrazo
erase -> es:borrar
noErase -> es:noBorrar
clear -> es:limpiar
pushStyles -> es:guardarEstilos
popStyles -> es:recuperarEstilos
inFill -> es:enRelleno
inStroke -> es:enTrazo

# transform
translate -> es:trasladar
rotate -> es:rotar
scale -> es:escalar
shearX -> es:cizallarX
shearY -> es:cizallarY
applyMatrix -> es:aplicarMatriz
resetMatrix -> es:reiniciarMatriz
push -> es:apilar
pop -> es:desapilar
pushMatrix -> es:guardarMatriz
popMatrix -> es:recuperarMatriz

# math
random -> es:aleatorio
noise -> es:ruido
dist -> es:dist
map -> es:mapa
angleMode -> es:modoÁngulo
radians -> es:radianes
degrees -> es:grados
lerp -> es:interpolar
constrain -> es:constreñir
norm -> es:norm
abs -> es:abs
round -> es:redondear
ceil -> es:techo
floor -> es:piso
min -> es:min
max -> es:max
pow -> es:pot
sq -> es:cuad
sqrt -> es:raiz
exp -> es:exp
randomSeed -> es:semillaAleatoria
randomGaussian -> es:aleatorioGaussiano
noiseMode -> es:modoRuido
noiseSeed -> es:semillaRuido
noiseDetail -> es:detalleRuido
jit -> es:flu
randomGenerator -> es:generadorAleatorio
randomExponential -> es:aleatorioExponencial

# sound
loadSound -> es:cargarSonido
loadAudio -> es:cargarAudio
getAudioContext -> es:obtenerContextoAudio
userStartAudio -> es:iniciarAudioUsuario

# dom
createElement -> es:crearElemento
createA -> es:crearA
createButton -> es:crearBotón
createCheckbox -> es:crearCasilla
createColorPicker -> es:crearSelectorColor
createImg -> es:crearImg
createInput -> es:crearEntrada
createP -> es:crearP
createRadio -> es:crearOpciónes
createSelect -> es:crearSelección
createSlider -> es:crearDeslizador
createVideo -> es:crearVideo
createCapture -> es:crearCaptura
findElement -> es:encontrarElemento
findElements -> es:encontrarElementos

# record
createRecorder -> es:crearGrabadora
record -> es:grabar
pauseRecording -> es:pausarGrabación
deleteRecording -> es:borrarGrabación
saveRecording -> es:guardarGrabación
recording -> es:grabando

# io
load -> es:cargar
save -> es:guardar
loadJSON -> es:cargarJSON
loadStrings -> es:cargarTexto
year -> es:año
day -> es:día
hour -> es:hora
minute -> es:minuto
second -> es:segundo
loadCSV -> es:cargarCSV
loadXML -> es:cargarXML
loadAll -> es:cargarTodo
disablePreload -> es:deshabilitarPrecarga
shuffle -> es:barajar
storeItem -> es:guardarItem
getItem -> es:obtenerItem
removeItem -> es:eliminarItem
clearStorage -> es:limpiarAlmacenamiento

# shaders
createShader -> es:crearShader
plane -> es:plano
shader -> es:shader
resetShader -> es:reiniciarShader
resetFrameShader -> es:reiniciarShaderFotograma
resetImageShader -> es:reiniciarShaderImagen
resetVideoShader -> es:reiniciarShaderVideo
resetTextShader -> es:reiniciarShaderTexto
resetShaders -> es:reiniciarShaders
createFrameShader -> es:crearShaderFotograma
createImageShader -> es:crearShaderImagen
createVideoShader -> es:crearShaderVideo
createTextShader -> es:crearShaderTexto

# constants
CORNER -> es:ESQUINA
RADIUS -> es:RADIO
CORNERS -> es:ESQUINAS
THRESHOLD -> es:UMBRAL
GRAY -> es:GRIS
OPAQUE -> es:OPACO
INVERT -> es:INVERTIR
POSTERIZE -> es:POSTERIZAR
DILATE -> es:DILATAR
ERODE -> es:EROSIONAR
BLUR -> es:DESENFOCAR
NORMAL -> es:NORMAL
ITALIC -> es:CURSIVA
BOLD -> es:NEGRILLA
BOLDITALIC -> es:NEGRILLA_CURSIVA
LEFT -> es:IZQUIERDA
CENTER -> es:CENTRO
RIGHT -> es:DERECHA
TOP -> es:ARRIBA
BOTTOM -> es:ABAJO
BASELINE -> es:LINEA_BASE
MIDDLE -> es:MEDIO
RGB -> es:RGB
OKLCH -> es:OKLCH
HSL -> es:HSL
HSB -> es:HSB
SRGB -> es:SRGB
DISPLAY_P3 -> es:DISPLAY_P3
MAXED -> es:MAXIMIZADO
SMOOTH -> es:SUAVE
PIXELATED -> es:PIXELADO
TWO_PI -> es:DOS_PI
HALF_PI -> es:MEDIO_PI
QUARTER_PI -> es:CUARTO_PI

# vector
createVector -> es:crearVector
`;

const userLangs = `
update -> es:actualizar
draw -> es:dibujar
postProcess -> es:postProcesar
mousePressed -> es:alPresionarRatón
mouseReleased -> es:alSoltarRatón
mouseMoved -> es:alMoverRatón
mouseDragged -> es:alArrastrarRatón
doubleClicked -> es:dobleClic
keyPressed -> es:alPresionarTecla
keyReleased -> es:alSoltarTecla
touchStarted -> es:alEmpezarToque
touchEnded -> es:alTerminarToque
touchMoved -> es:alMoverToque
mouseWheel -> es:ruedaRatón
`;

const classLangs = {
	Vector: `
add -> es:sumar
sub -> es:restar
mult -> es:multiplicar
div -> es:dividir
mag -> es:magnitud
magSq -> es:magnitudCuad
dist -> es:distancia
normalize -> es:normalizar
limit -> es:limitar
setMag -> es:establecerMagnitud
heading -> es:rumbo
rotate -> es:rotar
lerp -> es:interpolar
array -> es:arreglo
copy -> es:copiar
dot -> es:punto
cross -> es:cruz
angleBetween -> es:anguloEntre
reflect -> es:reflejar
`,
	Sound: `
load -> es:cargar
play -> es:reproducir
stop -> es:parar
pause -> es:pausar
loop -> es:bucle
setVolume -> es:establecerVolumen
setPan -> es:establecerPan
setLoop -> es:establecerBucle
isLoaded -> es:estaCargado
isPlaying -> es:estaReproduciendo
isPaused -> es:estaPausado
isLooping -> es:estaEnBucle
onended -> es:alTerminar
`
};

const parseLangs = function (data, lang) {
	let map = {};
	for (let l of data.split('\n')) {
		let i = l.indexOf(' ' + lang + ':');
		if (i > 0 && l[0] != '#') {
			map[l.split(' ')[0]] = l.slice(i + 4).split(' ')[0];
		}
	}
	return map;
};

Object.defineProperty(Q5, 'lang', {
	get: () => Q5._lang,
	set: (val) => {
		if (val == Q5._lang) return;

		Q5._lang = val;

		if (val == 'en') {
			// reset to English only user functions
			Q5._userFns = Q5._userFns.slice(0, 19);
			Q5._libMap = Q5._userFnsMap = {};
			return;
		}

		let m = parseLangs(libLangs, val);

		if (typeof window == 'object') {
			window[m.createCanvas] = createCanvas;
		}

		let userFnsMap = parseLangs(userLangs, val);

		for (let name in userFnsMap) {
			let translatedName = userFnsMap[name];
			if (Q5.hasOwnProperty(translatedName)) continue;
			Object.defineProperty(Q5, translatedName, {
				get: () => Q5[name],
				set: (fn) => (Q5[name] = fn)
			});
		}

		for (let className in classLangs) {
			if (Q5[className]) {
				let map = parseLangs(classLangs[className], val);
				let proto = Q5[className].prototype;
				for (let name in map) {
					let translatedName = map[name];
					if (proto.hasOwnProperty(translatedName)) continue;
					Object.defineProperty(proto, translatedName, {
						get: function () {
							return this[name];
						},
						set: function (v) {
							this[name] = v;
						}
					});
				}
			}
		}

		Q5._libMap = m;
		Q5._userFnsMap = userFnsMap;
		Q5._userFns.push(...Object.values(userFnsMap));
	}
});

Q5.lang = 'en';

Q5.modules.lang = ($) => {
	let userFnsMap = Q5._userFnsMap;

	for (let name in userFnsMap) {
		let translatedName = userFnsMap[name];
		Object.defineProperty($, translatedName, {
			get: () => $[name],
			set: (fn) => ($[name] = fn)
		});
	}

	let m = Q5._libMap;

	if (m.createCanvas) {
		$[m.createCanvas] = $.createCanvas;
	}
};

Q5.addHook('init', (q) => {
	let m = Q5._libMap;

	for (let name in m) {
		let translatedName = m[name];
		q[translatedName] = q[name];
	}
});

Q5.addHook('predraw', (q) => {
	let m = Q5._libMap;

	if (!m.mouseX) return;

	q[m.frameCount] = q.frameCount;

	// update user input
	q[m.mouseX] = q.mouseX;
	q[m.mouseY] = q.mouseY;
	q[m.mouseIsPressed] = q.mouseIsPressed;
	q[m.mouseButton] = q.mouseButton;
	q[m.key] = q.key;
	q[m.keyIsPressed] = q.keyIsPressed;
	q[m.touches] = q.touches;
	q[m.pointers] = q.pointers;
});
