Q5.renderers.webgpu.text = ($, q) => {
	let textShader = Q5.device.createShaderModule({
		label: 'MSDF text shader',
		code: `
// Positions for simple quad geometry
const pos = array(vec2f(0, -1), vec2f(1, -1), vec2f(0, 0), vec2f(1, 0));

struct VertexInput {
	@builtin(vertex_index) vertex : u32,
	@builtin(instance_index) instance : u32
}
struct VertexOutput {
	@builtin(position) position : vec4f,
	@location(0) texCoord : vec2f,
	@location(1) fillColor : vec4f
}
struct Char {
	texOffset: vec2f,
	texExtent: vec2f,
	size: vec2f,
	offset: vec2f,
}
struct Text {
	pos: vec2f,
	scale: f32,
	transformIndex: f32,
	fillIndex: f32,
	strokeIndex: f32
}
struct Uniforms {
	halfWidth: f32,
	halfHeight: f32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;

@group(1) @binding(0) var<storage> colors : array<vec4f>;

@group(2) @binding(0) var fontTexture: texture_2d<f32>;
@group(2) @binding(1) var fontSampler: sampler;
@group(2) @binding(2) var<storage> fontChars: array<Char>;

@group(3) @binding(0) var<storage> textChars: array<vec4f>;
@group(3) @binding(1) var<storage> textMetadata: array<Text>;

@vertex
fn vertexMain(input : VertexInput) -> VertexOutput {
	let char = textChars[input.instance];

	let text = textMetadata[i32(char.w)];

	let fontChar = fontChars[i32(char.z)];

	let charPos = ((pos[input.vertex] * fontChar.size + char.xy + fontChar.offset) * text.scale) + text.pos;

	var vert = vec4f(charPos, 0.0, 1.0);
	vert = transforms[i32(text.transformIndex)] * vert;
	vert.x /= uniforms.halfWidth;
	vert.y /= uniforms.halfHeight;

	var output : VertexOutput;
	output.position = vert;
	output.texCoord = (pos[input.vertex] * vec2f(1, -1)) * fontChar.texExtent + fontChar.texOffset;
	output.fillColor = colors[i32(text.fillIndex)];
	return output;
}

fn sampleMsdf(texCoord: vec2f) -> f32 {
	let c = textureSample(fontTexture, fontSampler, texCoord);
	return max(min(c.r, c.g), min(max(c.r, c.g), c.b));
}

@fragment
fn fragmentMain(input : VertexOutput) -> @location(0) vec4f {
	// pxRange (AKA distanceRange) comes from the msdfgen tool,
	// uses the default which is 4.
	let pxRange = 4.0;
	let sz = vec2f(textureDimensions(fontTexture, 0));
	let dx = sz.x*length(vec2f(dpdxFine(input.texCoord.x), dpdyFine(input.texCoord.x)));
	let dy = sz.y*length(vec2f(dpdxFine(input.texCoord.y), dpdyFine(input.texCoord.y)));
	let toPixels = pxRange * inverseSqrt(dx * dx + dy * dy);
	let sigDist = sampleMsdf(input.texCoord) - 0.5;
	let pxDist = sigDist * toPixels;
	let edgeWidth = 0.5;
	let alpha = smoothstep(-edgeWidth, edgeWidth, pxDist);
	if (alpha < 0.001) {
		discard;
	}
	return vec4f(input.fillColor.rgb, input.fillColor.a * alpha);
}
`
	});

	let textBindGroupLayout = Q5.device.createBindGroupLayout({
		label: 'MSDF text group layout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: { type: 'read-only-storage' }
			},
			{
				binding: 1,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: { type: 'read-only-storage' }
			}
		]
	});

	let fontSampler = Q5.device.createSampler({
		minFilter: 'linear',
		magFilter: 'linear',
		mipmapFilter: 'linear',
		maxAnisotropy: 16
	});
	let fontBindGroupLayout = Q5.device.createBindGroupLayout({
		label: 'MSDF font group layout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				texture: {}
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: {}
			},
			{
				binding: 2,
				visibility: GPUShaderStage.VERTEX,
				buffer: { type: 'read-only-storage' }
			}
		]
	});

	let fontPipelineLayout = Q5.device.createPipelineLayout({
		bindGroupLayouts: [...$.bindGroupLayouts, fontBindGroupLayout, textBindGroupLayout]
	});

	$._pipelineConfigs[2] = {
		label: 'msdf font pipeline',
		layout: fontPipelineLayout,
		vertex: { module: textShader, entryPoint: 'vertexMain' },
		fragment: {
			module: textShader,
			entryPoint: 'fragmentMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs.normal }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};
	$._pipelines[2] = Q5.device.createRenderPipeline($._pipelineConfigs[2]);

	class MsdfFont {
		constructor(bindGroup, lineHeight, chars, kernings) {
			this.bindGroup = bindGroup;
			this.lineHeight = lineHeight;
			this.chars = chars;
			this.kernings = kernings;
			let charArray = Object.values(chars);
			this.charCount = charArray.length;
			this.defaultChar = charArray[0];
		}
		getChar(charCode) {
			return this.chars[charCode] ?? this.defaultChar;
		}
		// Gets the distance in pixels a line should advance for a given character code. If the upcoming
		// character code is given any kerning between the two characters will be taken into account.
		getXAdvance(charCode, nextCharCode = -1) {
			let char = this.getChar(charCode);
			if (nextCharCode >= 0) {
				let kerning = this.kernings.get(charCode);
				if (kerning) {
					return char.xadvance + (kerning.get(nextCharCode) ?? 0);
				}
			}
			return char.xadvance;
		}
	}

	$._fonts = [];
	let fonts = {};

	let createFont = async (fontJsonUrl, fontName, cb) => {
		q._preloadCount++;

		let res = await fetch(fontJsonUrl);
		if (res.status == 404) {
			q._preloadCount--;
			return '';
		}
		let atlas = await res.json();

		let slashIdx = fontJsonUrl.lastIndexOf('/');
		let baseUrl = slashIdx != -1 ? fontJsonUrl.substring(0, slashIdx + 1) : '';
		// load font image
		res = await fetch(baseUrl + atlas.pages[0]);
		let img = await createImageBitmap(await res.blob());

		// convert image to texture
		let imgSize = [img.width, img.height, 1];
		let texture = Q5.device.createTexture({
			label: `MSDF ${fontName}`,
			size: imgSize,
			format: 'rgba8unorm',
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
		});
		Q5.device.queue.copyExternalImageToTexture({ source: img }, { texture }, imgSize);

		// to make q5's default font file smaller,
		// the chars and kernings are stored as csv strings
		if (typeof atlas.chars == 'string') {
			atlas.chars = $.CSV.parse(atlas.chars, ' ');
			atlas.kernings = $.CSV.parse(atlas.kernings, ' ');
		}

		let charCount = atlas.chars.length;
		let charsBuffer = Q5.device.createBuffer({
			size: charCount * 32,
			usage: GPUBufferUsage.STORAGE,
			mappedAtCreation: true
		});

		let fontChars = new Float32Array(charsBuffer.getMappedRange());
		let u = 1 / atlas.common.scaleW;
		let v = 1 / atlas.common.scaleH;
		let chars = {};
		let o = 0; // offset
		for (let [i, char] of atlas.chars.entries()) {
			chars[char.id] = char;
			chars[char.id].charIndex = i;
			fontChars[o] = char.x * u; // texOffset.x
			fontChars[o + 1] = char.y * v; // texOffset.y
			fontChars[o + 2] = char.width * u; // texExtent.x
			fontChars[o + 3] = char.height * v; // texExtent.y
			fontChars[o + 4] = char.width; // size.x
			fontChars[o + 5] = char.height; // size.y
			fontChars[o + 6] = char.xoffset; // offset.x
			fontChars[o + 7] = -char.yoffset; // offset.y
			o += 8;
		}
		charsBuffer.unmap();

		let fontBindGroup = Q5.device.createBindGroup({
			label: 'msdf font bind group',
			layout: fontBindGroupLayout,
			entries: [
				{ binding: 0, resource: texture.createView() },
				{ binding: 1, resource: fontSampler },
				{ binding: 2, resource: { buffer: charsBuffer } }
			]
		});

		let kernings = new Map();
		if (atlas.kernings) {
			for (let kerning of atlas.kernings) {
				let charKerning = kernings.get(kerning.first);
				if (!charKerning) {
					charKerning = new Map();
					kernings.set(kerning.first, charKerning);
				}
				charKerning.set(kerning.second, kerning.amount);
			}
		}

		$._font = new MsdfFont(fontBindGroup, atlas.common.lineHeight, chars, kernings);

		$._font.index = $._fonts.length;
		$._fonts.push($._font);
		fonts[fontName] = $._font;

		q._preloadCount--;

		if (cb) cb(fontName);
	};

	// q2d graphics context to use for text image creation
	let g = $.createGraphics(1, 1);
	g.colorMode($.RGB, 1);

	$.loadFont = (url, cb) => {
		let ext = url.slice(url.lastIndexOf('.') + 1);
		if (ext != 'json') return g.loadFont(url, cb);
		let fontName = url.slice(url.lastIndexOf('/') + 1, url.lastIndexOf('-'));
		createFont(url, fontName, cb);
		return fontName;
	};

	$._textSize = 18;
	$._textAlign = 'left';
	$._textBaseline = 'alphabetic';
	let leadingSet = false,
		leading = 22.5,
		leadDiff = 4.5,
		leadPercent = 1.25;

	$.textFont = (fontName) => {
		$._font = fonts[fontName];
	};
	$.textSize = (size) => {
		$._textSize = size;
		if (!leadingSet) {
			leading = size * leadPercent;
			leadDiff = leading - size;
		}
	};
	$.textLeading = (lineHeight) => {
		$._font.lineHeight = leading = lineHeight;
		leadDiff = leading - $._textSize;
		leadPercent = leading / $._textSize;
		leadingSet = true;
	};
	$.textAlign = (horiz, vert) => {
		$._textAlign = horiz;
		if (vert) $._textBaseline = vert;
	};

	$._charStack = [];
	$._textStack = [];

	let measureText = (font, text, charCallback) => {
		let maxWidth = 0,
			offsetX = 0,
			offsetY = 0,
			line = 0,
			printedCharCount = 0,
			lineWidths = [],
			nextCharCode = text.charCodeAt(0);

		for (let i = 0; i < text.length; ++i) {
			let charCode = nextCharCode;
			nextCharCode = i < text.length - 1 ? text.charCodeAt(i + 1) : -1;
			switch (charCode) {
				case 10: // Newline
					lineWidths.push(offsetX);
					line++;
					maxWidth = Math.max(maxWidth, offsetX);
					offsetX = 0;
					offsetY -= font.lineHeight * leadPercent;
					break;
				case 13: // CR
					break;
				case 32: // Space
					// advance the offset without actually adding a character
					offsetX += font.getXAdvance(charCode);
					break;
				case 9: // Tab
					offsetX += font.getXAdvance(charCode) * 2;
					break;
				default:
					if (charCallback) {
						charCallback(offsetX, offsetY, line, font.getChar(charCode));
					}
					offsetX += font.getXAdvance(charCode, nextCharCode);
					printedCharCount++;
			}
		}
		lineWidths.push(offsetX);
		maxWidth = Math.max(maxWidth, offsetX);
		return {
			width: maxWidth,
			height: lineWidths.length * font.lineHeight * leadPercent,
			lineWidths,
			printedCharCount
		};
	};

	let initLoadDefaultFont;

	$.text = (str, x, y, w, h) => {
		if (!$._font) {
			// check if online and loading the default font hasn't been attempted yet
			if (navigator.onLine && !initLoadDefaultFont) {
				initLoadDefaultFont = true;
				$.loadFont('https://q5js.org/fonts/YaHei-msdf.json');
			}
			return;
		}

		if (str.length > w) {
			let wrapped = [];
			let i = 0;
			while (i < str.length) {
				let max = i + w;
				if (max >= str.length) {
					wrapped.push(str.slice(i));
					break;
				}
				let end = str.lastIndexOf(' ', max);
				if (end == -1 || end < i) end = max;
				wrapped.push(str.slice(i, end));
				i = end + 1;
			}
			str = wrapped.join('\n');
		}

		let spaces = 0, // whitespace char count, not literal spaces
			hasNewline;
		for (let i = 0; i < str.length; i++) {
			let c = str[i];
			switch (c) {
				case '\n':
					hasNewline = true;
				case '\r':
				case '\t':
				case ' ':
					spaces++;
			}
		}

		let charsData = [];

		let ta = $._textAlign,
			tb = $._textBaseline,
			textIndex = $._textStack.length,
			o = 0, // offset
			measurements;

		if (ta == 'left' && !hasNewline) {
			measurements = measureText($._font, str, (textX, textY, line, char) => {
				charsData[o] = textX;
				charsData[o + 1] = textY;
				charsData[o + 2] = char.charIndex;
				charsData[o + 3] = textIndex;
				o += 4;
			});

			if (tb == 'alphabetic') y -= $._textSize;
			else if (tb == 'center') y -= $._textSize * 0.5;
			else if (tb == 'bottom') y -= leading;
		} else {
			// measure the text to get the line widths before setting
			// the x position to properly align the text
			measurements = measureText($._font, str);

			let offsetY = 0;
			if (tb == 'alphabetic') y -= $._textSize;
			else if (tb == 'center') offsetY = measurements.height * 0.5;
			else if (tb == 'bottom') offsetY = measurements.height;

			measureText($._font, str, (textX, textY, line, char) => {
				let offsetX = 0;
				if (ta == 'center') {
					offsetX = measurements.width * -0.5 - (measurements.width - measurements.lineWidths[line]) * -0.5;
				} else if (ta == 'right') {
					offsetX = measurements.width - measurements.lineWidths[line];
				}
				charsData[o] = textX + offsetX;
				charsData[o + 1] = textY + offsetY;
				charsData[o + 2] = char.charIndex;
				charsData[o + 3] = textIndex;
				o += 4;
			});
		}
		$._charStack.push(charsData);

		let text = [];

		if ($._matrixDirty) $._saveMatrix();

		text[0] = x;
		text[1] = -y;
		text[2] = $._textSize / 44;
		text[3] = $._transformIndex;
		text[4] = $._fillSet ? $._fillIndex : 0;
		text[5] = $._strokeIndex;

		$._textStack.push(text);
		$.drawStack.push(2, measurements.printedCharCount, $._font.index);
	};

	$.textWidth = (str) => {
		if (!$._font) return 0;
		return measureText($._font, str).width;
	};

	$.createTextImage = (str, w, h) => {
		g.textSize($._textSize);

		if ($._doFill) {
			let fi = $._fillIndex * 4;
			g.fill(colorStack.slice(fi, fi + 4));
		}
		if ($._doStroke) {
			let si = $._strokeIndex * 4;
			g.stroke(colorStack.slice(si, si + 4));
		}

		let img = g.createTextImage(str, w, h);

		if (img.canvas.textureIndex == undefined) {
			$._createTexture(img);
		} else if (img.modified) {
			let cnv = img.canvas;
			let textureSize = [cnv.width, cnv.height, 1];
			let texture = $._textures[cnv.textureIndex];

			Q5.device.queue.copyExternalImageToTexture(
				{ source: cnv },
				{ texture, colorSpace: $.canvas.colorSpace },
				textureSize
			);
			img.modified = false;
		}
		return img;
	};

	$.textImage = (img, x, y) => {
		if (typeof img == 'string') img = $.createTextImage(img);

		let og = $._imageMode;
		$._imageMode = 'corner';

		let ta = $._textAlign;
		if (ta == 'center') x -= img.canvas.hw;
		else if (ta == 'right') x -= img.width;

		let bl = $._textBaseline;
		if (bl == 'alphabetic') y -= img._leading;
		else if (bl == 'center') y -= img._middle;
		else if (bl == 'bottom') y -= img._bottom;
		else if (bl == 'top') y -= img._top;

		$.image(img, x, y);
		$._imageMode = og;
	};

	$._hooks.preRender.push(() => {
		if (!$._charStack.length) return;

		// Calculate total buffer size for text data
		let totalTextSize = 0;
		for (let charsData of $._charStack) {
			totalTextSize += charsData.length * 4;
		}

		// Create a single buffer for all char data
		let charBuffer = Q5.device.createBuffer({
			size: totalTextSize,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		// Copy all text data into the buffer
		new Float32Array(charBuffer.getMappedRange()).set($._charStack.flat());
		charBuffer.unmap();

		// Calculate total buffer size for metadata
		let totalMetadataSize = $._textStack.length * 6 * 4;

		// Create a single buffer for all metadata
		let textBuffer = Q5.device.createBuffer({
			label: 'textBuffer',
			size: totalMetadataSize,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		// Copy all metadata into the buffer
		new Float32Array(textBuffer.getMappedRange()).set($._textStack.flat());
		textBuffer.unmap();

		// Create a single bind group for the text buffer and metadata buffer
		$._textBindGroup = Q5.device.createBindGroup({
			label: 'msdf text bind group',
			layout: textBindGroupLayout,
			entries: [
				{ binding: 0, resource: { buffer: charBuffer } },
				{ binding: 1, resource: { buffer: textBuffer } }
			]
		});
	});

	$._hooks.postRender.push(() => {
		$._charStack.length = 0;
		$._textStack.length = 0;
	});
};
