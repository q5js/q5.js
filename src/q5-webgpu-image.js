Q5.renderers.webgpu.image = ($, q) => {
	$._textureBindGroups = [];
	let vertexStack = [];

	let vertexShader = Q5.device.createShaderModule({
		label: 'imageVertexShader',
		code: `
struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) texCoord: vec2f
}
struct Uniforms {
	halfWidth: f32,
	halfHeight: f32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;

@vertex
fn vertexMain(@location(0) pos: vec2f, @location(1) texCoord: vec2f, @location(2) transformIndex: f32) -> VertexOutput {
	var vert = vec4f(pos, 0.0, 1.0);
	vert = transforms[i32(transformIndex)] * vert;
	vert.x /= uniforms.halfWidth;
	vert.y /= uniforms.halfHeight;

	var output: VertexOutput;
	output.position = vert;
	output.texCoord = texCoord;
	return output;
}
	`
	});

	let fragmentShader = Q5.device.createShaderModule({
		label: 'imageFragmentShader',
		code: `
@group(2) @binding(0) var samp: sampler;
@group(2) @binding(1) var texture: texture_2d<f32>;

@fragment
fn fragmentMain(@location(0) texCoord: vec2f) -> @location(0) vec4f {
	// Sample the texture using the interpolated texture coordinate
	return textureSample(texture, samp, texCoord);
}
	`
	});

	let textureLayout = Q5.device.createBindGroupLayout({
		label: 'textureLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: { type: 'filtering' }
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				texture: { viewDimension: '2d', sampleType: 'float' }
			}
		]
	});

	const vertexBufferLayout = {
		arrayStride: 20,
		attributes: [
			{ shaderLocation: 0, offset: 0, format: 'float32x2' },
			{ shaderLocation: 1, offset: 8, format: 'float32x2' },
			{ shaderLocation: 2, offset: 16, format: 'float32' } // transformIndex
		]
	};

	const pipelineLayout = Q5.device.createPipelineLayout({
		label: 'imagePipelineLayout',
		bindGroupLayouts: [...$.bindGroupLayouts, textureLayout]
	});

	$._pipelineConfigs[1] = {
		label: 'imagePipeline',
		layout: pipelineLayout,
		vertex: {
			module: vertexShader,
			entryPoint: 'vertexMain',
			buffers: [{ arrayStride: 0, attributes: [] }, vertexBufferLayout]
		},
		fragment: {
			module: fragmentShader,
			entryPoint: 'fragmentMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs.normal }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[1] = Q5.device.createRenderPipeline($._pipelineConfigs[1]);

	let sampler = Q5.device.createSampler({
		magFilter: 'linear',
		minFilter: 'linear'
	});

	let MAX_TEXTURES = 12000;

	$._textures = [];
	let tIdx = 0;

	$._createTexture = (img) => {
		if (img.canvas) img = img.canvas;

		let textureSize = [img.width, img.height, 1];

		let texture = Q5.device.createTexture({
			size: textureSize,
			format: 'bgra8unorm',
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
		});

		Q5.device.queue.copyExternalImageToTexture(
			{ source: img },
			{
				texture,
				colorSpace: $.canvas.colorSpace
			},
			textureSize
		);

		$._textures[tIdx] = texture;
		img.textureIndex = tIdx;

		const textureBindGroup = Q5.device.createBindGroup({
			layout: textureLayout,
			entries: [
				{ binding: 0, resource: sampler },
				{ binding: 1, resource: texture.createView() }
			]
		});
		$._textureBindGroups[tIdx] = textureBindGroup;

		tIdx = (tIdx + 1) % MAX_TEXTURES;

		// If the texture array is full, destroy the oldest texture
		if ($._textures[tIdx]) {
			$._textures[tIdx].destroy();
			delete $._textures[tIdx];
			delete $._textureBindGroups[tIdx];
		}
	};

	$.loadImage = $.loadTexture = (src) => {
		q._preloadCount++;
		const img = new Image();
		img.crossOrigin = 'Anonymous';
		img.onload = () => {
			// calculate the default width and height that the image
			// should be drawn at if the user doesn't specify a display size
			img.defaultWidth = img.width * $._defaultImageScale;
			img.defaultHeight = img.height * $._defaultImageScale;

			$._createTexture(img);
			q._preloadCount--;
		};
		img.src = src;
		return img;
	};

	$.imageMode = (x) => ($._imageMode = x);

	$.image = (img, x, y, w, h) => {
		if (img.canvas) img = img.canvas;
		if (img.textureIndex == undefined) return;

		if ($._matrixDirty) $._saveMatrix();
		let ti = $._transformIndex;

		w ??= img.defaultWidth;
		h ??= img.defaultHeight;

		let [l, r, t, b] = $._calcBox(x, y, w, h, $._imageMode);

		// prettier-ignore
		vertexStack.push(
			l, t, 0, 0, ti,
			r, t, 1, 0, ti,
			l, b, 0, 1, ti,
			r, b, 1, 1, ti
		);

		$.drawStack.push(1, img.textureIndex);
	};

	$._hooks.preRender.push(() => {
		if (!$._textureBindGroups.length) return;

		// Switch to image pipeline
		$.pass.setPipeline($._pipelines[1]);

		const vertexBuffer = Q5.device.createBuffer({
			size: vertexStack.length * 4,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		new Float32Array(vertexBuffer.getMappedRange()).set(vertexStack);
		vertexBuffer.unmap();

		$.pass.setVertexBuffer(1, vertexBuffer);
	});

	$._hooks.postRender.push(() => {
		vertexStack.length = 0;
	});
};

Q5.THRESHOLD = 1;
Q5.GRAY = 2;
Q5.OPAQUE = 3;
Q5.INVERT = 4;
Q5.POSTERIZE = 5;
Q5.DILATE = 6;
Q5.ERODE = 7;
Q5.BLUR = 8;
