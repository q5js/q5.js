Q5.renderers.webgpu.image = ($, q) => {
	$._textureBindGroups = [];
	let vertexStack = new Float32Array(1e7),
		vertIndex = 0;

	let imageShader = Q5.device.createShaderModule({
		label: 'imageShader',
		code: `
struct VertexInput {
	@location(0) pos: vec2f,
	@location(1) texCoord: vec2f,
	@location(2) tintIndex: f32,
	@location(3) matrixIndex: f32
}
struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) texCoord: vec2f,
	@location(1) tintIndex: f32
}
struct Uniforms {
	halfWidth: f32,
	halfHeight: f32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;

@group(1) @binding(0) var<storage> colors : array<vec4f>;

@group(2) @binding(0) var samp: sampler;
@group(2) @binding(1) var texture: texture_2d<f32>;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
	var vert = vec4f(input.pos, 0.0, 1.0);
	vert = transforms[i32(input.matrixIndex)] * vert;
	vert.x /= uniforms.halfWidth;
	vert.y /= uniforms.halfHeight;

	var output: VertexOutput;
	output.position = vert;
	output.texCoord = input.texCoord;
	output.tintIndex = input.tintIndex;
	return output;
}

@fragment
fn fragmentMain(@location(0) texCoord: vec2f, @location(1) tintIndex: f32) -> @location(0) vec4f {
		let texColor = textureSample(texture, samp, texCoord);
		let tintColor = colors[i32(tintIndex)];
		
		// Mix original and tinted colors using tint alpha as blend factor
		let tinted = vec4f(texColor.rgb * tintColor.rgb, texColor.a);
		return mix(texColor, tinted, tintColor.a);
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
		arrayStride: 24,
		attributes: [
			{ shaderLocation: 0, offset: 0, format: 'float32x2' },
			{ shaderLocation: 1, offset: 8, format: 'float32x2' },
			{ shaderLocation: 2, offset: 16, format: 'float32' }, // tintIndex
			{ shaderLocation: 3, offset: 20, format: 'float32' } // matrixIndex
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
			module: imageShader,
			entryPoint: 'vertexMain',
			buffers: [{ arrayStride: 0, attributes: [] }, vertexBufferLayout]
		},
		fragment: {
			module: imageShader,
			entryPoint: 'fragmentMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs.normal }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[1] = Q5.device.createRenderPipeline($._pipelineConfigs[1]);

	let sampler;

	let makeSampler = (filter) => {
		sampler = Q5.device.createSampler({
			magFilter: filter,
			minFilter: filter
		});
	};
	makeSampler('linear');

	$.smooth = () => {
		makeSampler('linear');
	};
	$.noSmooth = () => {
		makeSampler('nearest');
	};

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

		// if the texture array is full, destroy the oldest texture
		if ($._textures[tIdx]) {
			$._textures[tIdx].destroy();
			delete $._textures[tIdx];
			delete $._textureBindGroups[tIdx];
		}
	};

	$.loadImage = (src, cb) => {
		q._preloadCount++;
		let g = $._g.loadImage(src, (img) => {
			g.defaultWidth = img.width * $._defaultImageScale;
			g.defaultHeight = img.height * $._defaultImageScale;
			$._createTexture(img);
			q._preloadCount--;
			if (cb) cb(img);
		});
		return g;
	};

	$.imageMode = (x) => ($._imageMode = x);

	const addVert = (x, y, u, v, ci, ti) => {
		let s = vertexStack,
			i = vertIndex;
		s[i++] = x;
		s[i++] = y;
		s[i++] = u;
		s[i++] = v;
		s[i++] = ci;
		s[i++] = ti;
		vertIndex = i;
	};

	$.image = (img, dx = 0, dy = 0, dw, dh, sx = 0, sy = 0, sw, sh) => {
		let g = img;
		if (img.canvas) img = img.canvas;
		if (img.textureIndex == undefined) return;

		if ($._matrixDirty) $._saveMatrix();

		let ti = $._matrixIndex,
			w = img.width,
			h = img.height;

		dw ??= g.defaultWidth;
		dh ??= g.defaultHeight;
		sw ??= w;
		sh ??= h;

		let pd = g._pixelDensity || 1;
		dw *= pd;
		dh *= pd;

		let [l, r, t, b] = $._calcBox(dx, dy, dw, dh, $._imageMode);

		let u0 = sx / w,
			v0 = sy / h,
			u1 = (sx + sw) / w,
			v1 = (sy + sh) / h;

		let ci = $._tint;

		addVert(l, t, u0, v0, ci, ti);
		addVert(r, t, u1, v0, ci, ti);
		addVert(l, b, u0, v1, ci, ti);
		addVert(r, b, u1, v1, ci, ti);

		$.drawStack.push(1, img.textureIndex);
	};

	$._hooks.preRender.push(() => {
		if (!$._textureBindGroups.length) return;

		// Switch to image pipeline
		$.pass.setPipeline($._pipelines[1]);

		let vertexBuffer = Q5.device.createBuffer({
			size: vertIndex * 4,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		new Float32Array(vertexBuffer.getMappedRange()).set(vertexStack.slice(0, vertIndex));
		vertexBuffer.unmap();

		$.pass.setVertexBuffer(1, vertexBuffer);
	});

	$._hooks.postRender.push(() => {
		vertIndex = 0;
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
