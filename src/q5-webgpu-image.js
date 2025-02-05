Q5.renderers.webgpu.image = ($, q) => {
	let vertexStack = new Float32Array(1e7),
		vertIndex = 0;

	let imageShaderCode = `
struct Uniforms {
	halfWidth: f32,
	halfHeight: f32
}
struct VertexParams {
	@location(0) pos: vec2f,
	@location(1) texCoord: vec2f,
	@location(2) tintIndex: f32,
	@location(3) matrixIndex: f32,
	@location(4) globalAlpha: f32
}
struct FragmentParams {
	@builtin(position) position: vec4f,
	@location(0) texCoord: vec2f,
	@location(1) tintIndex: f32,
	@location(2) globalAlpha: f32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

@group(1) @binding(0) var samp: sampler;
@group(1) @binding(1) var texture: texture_2d<f32>;

@vertex
fn vertexMain(v: VertexParams) -> FragmentParams {
	var vert = vec4f(v.pos, 0.0, 1.0);
	vert = transforms[i32(v.matrixIndex)] * vert;
	vert.x /= uniforms.halfWidth;
	vert.y /= uniforms.halfHeight;

	var f: FragmentParams;
	f.position = vert;
	f.texCoord = v.texCoord;
	f.tintIndex = v.tintIndex;
	f.globalAlpha = v.globalAlpha;
	return f;
}

@fragment
fn fragmentMain(f: FragmentParams) -> @location(0) vec4f {
		let texColor = textureSample(texture, samp, f.texCoord);
		let tintColor = colors[i32(f.tintIndex)];
		
		// Mix original and tinted colors using tint alpha as blend factor
		let tinted = vec4f(texColor.rgb * tintColor.rgb, texColor.a * f.globalAlpha);
		return mix(texColor, tinted, tintColor.a);
}
`;

	let imageShader = Q5.device.createShaderModule({
		label: 'imageShader',
		code: imageShaderCode
	});

	let videoShaderCode = imageShaderCode
		.replace('texture_2d<f32>', 'texture_external')
		.replace('textureSample', 'textureSampleBaseClampToEdge');

	let videoShader = Q5.device.createShaderModule({
		label: 'videoShader',
		code: videoShaderCode
	});

	let vertexBufferLayout = {
		arrayStride: 28,
		attributes: [
			{ shaderLocation: 0, offset: 0, format: 'float32x2' },
			{ shaderLocation: 1, offset: 8, format: 'float32x2' },
			{ shaderLocation: 2, offset: 16, format: 'float32' }, // tintIndex
			{ shaderLocation: 3, offset: 20, format: 'float32' }, // matrixIndex
			{ shaderLocation: 4, offset: 24, format: 'float32' } // globalAlpha
		]
	};

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

	let videoTextureLayout = Q5.device.createBindGroupLayout({
		label: 'videoTextureLayout',
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: { type: 'filtering' }
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				externalTexture: {}
			}
		]
	});

	let imagePipelineLayout = Q5.device.createPipelineLayout({
		label: 'imagePipelineLayout',
		bindGroupLayouts: [...$.bindGroupLayouts, textureLayout]
	});

	let videoPipelineLayout = Q5.device.createPipelineLayout({
		label: 'videoPipelineLayout',
		bindGroupLayouts: [...$.bindGroupLayouts, videoTextureLayout]
	});

	$._pipelineConfigs[1] = {
		label: 'imagePipeline',
		layout: imagePipelineLayout,
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

	$._pipelineConfigs[2] = {
		label: 'videoPipeline',
		layout: videoPipelineLayout,
		vertex: {
			module: videoShader,
			entryPoint: 'vertexMain',
			buffers: [{ arrayStride: 0, attributes: [] }, vertexBufferLayout]
		},
		fragment: {
			module: videoShader,
			entryPoint: 'fragmentMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs.normal }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[2] = Q5.device.createRenderPipeline($._pipelineConfigs[2]);

	$._textureBindGroups = [];

	let makeSampler = (filter) => {
		$._imageSampler = Q5.device.createSampler({
			magFilter: filter,
			minFilter: filter
		});
	};

	$.smooth = () => makeSampler('linear');
	$.noSmooth = () => makeSampler('nearest');

	$.smooth();

	let tIdx = 0,
		vidFrames = 0;

	$._createTexture = (img) => {
		let g = img;
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

		g.texture = texture;
		g.textureIndex = tIdx + vidFrames;

		$._textureBindGroups[tIdx + vidFrames] = Q5.device.createBindGroup({
			layout: textureLayout,
			entries: [
				{ binding: 0, resource: $._imageSampler },
				{ binding: 1, resource: texture.createView() }
			]
		});

		tIdx++;
	};

	$.loadImage = (src, cb) => {
		q._preloadCount++;
		let g = $._g.loadImage(src, (img) => {
			g.defaultWidth = img.width * $._defaultImageScale;
			g.defaultHeight = img.height * $._defaultImageScale;
			$._createTexture(img);
			q._preloadCount--;
			if (cb) cb(g);
		});
		return g;
	};

	$.imageMode = (x) => ($._imageMode = x);

	const addVert = (x, y, u, v, ci, ti, ga) => {
		let s = vertexStack,
			i = vertIndex;
		s[i++] = x;
		s[i++] = y;
		s[i++] = u;
		s[i++] = v;
		s[i++] = ci;
		s[i++] = ti;
		s[i++] = ga;
		vertIndex = i;
	};

	$.image = (img, dx = 0, dy = 0, dw, dh, sx = 0, sy = 0, sw, sh) => {
		let isVideo;
		if (img.textureIndex == undefined) {
			isVideo = img.tagName == 'VIDEO';
			if (!isVideo || !img.width) return;
			if (img.flipped) $.scale(-1, 1);
		}

		let cnv = img.canvas || img;

		if ($._matrixDirty) $._saveMatrix();

		let w = cnv.width,
			h = cnv.height,
			pd = img._pixelDensity || 1;

		if (img.modified) {
			Q5.device.queue.copyExternalImageToTexture(
				{ source: cnv },
				{ texture: img.texture, colorSpace: $.canvas.colorSpace },
				[w, h, 1]
			);
			img.modified = false;
		}

		dw ??= img.defaultWidth || img.videoWidth;
		dh ??= img.defaultHeight || img.videoHeight;
		sw ??= w;
		sh ??= h;
		sx *= pd;
		sy *= pd;

		let [l, r, t, b] = $._calcBox(dx, dy, dw, dh, $._imageMode);

		let u0 = sx / w,
			v0 = sy / h,
			u1 = (sx + sw) / w,
			v1 = (sy + sh) / h,
			ti = $._matrixIndex,
			ci = $._tint,
			ga = $._globalAlpha;

		addVert(l, t, u0, v0, ci, ti, ga);
		addVert(r, t, u1, v0, ci, ti, ga);
		addVert(l, b, u0, v1, ci, ti, ga);
		addVert(r, b, u1, v1, ci, ti, ga);

		if (!isVideo) {
			$.drawStack.push(1, img.textureIndex);
		} else {
			// draw video
			let externalTexture = Q5.device.importExternalTexture({ source: img });

			// Create bind group for video texture that will only exist for this frame
			$._textureBindGroups.push(
				Q5.device.createBindGroup({
					layout: videoTextureLayout,
					entries: [
						{ binding: 0, resource: $._imageSampler },
						{ binding: 1, resource: externalTexture }
					]
				})
			);

			$.drawStack.push(2, $._textureBindGroups.length - 1);

			if (img.flipped) $.scale(-1, 1);
		}
	};

	$._saveCanvas = async (data, ext) => {
		let texture = data.texture,
			w = texture.width,
			h = texture.height,
			bytesPerRow = Math.ceil((w * 4) / 256) * 256;

		let buffer = Q5.device.createBuffer({
			size: bytesPerRow * h,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
		});

		let en = Q5.device.createCommandEncoder();

		en.copyTextureToBuffer({ texture }, { buffer, bytesPerRow, rowsPerImage: h }, { width: w, height: h });

		Q5.device.queue.submit([en.finish()]);

		await buffer.mapAsync(GPUMapMode.READ);

		let pad = new Uint8Array(buffer.getMappedRange());
		data = new Uint8Array(w * h * 4); // unpadded data

		// Remove padding from each row and swap BGR to RGB
		for (let y = 0; y < h; y++) {
			const p = y * bytesPerRow; // padded row offset
			const u = y * w * 4; // unpadded row offset
			for (let x = 0; x < w; x++) {
				const pp = p + x * 4; // padded pixel offset
				const up = u + x * 4; // unpadded pixel offset
				data[up + 0] = pad[pp + 2]; // R <- B
				data[up + 1] = pad[pp + 1]; // G <- G
				data[up + 2] = pad[pp + 0]; // B <- R
				data[up + 3] = pad[pp + 3]; // A <- A
			}
		}

		buffer.unmap();

		let colorSpace = $.canvas.colorSpace;
		data = new Uint8ClampedArray(data.buffer);
		data = new ImageData(data, w, h, { colorSpace });
		let cnv = new OffscreenCanvas(w, h);
		let ctx = cnv.getContext('2d', { colorSpace });
		ctx.putImageData(data, 0, 0);

		// Convert to blob then data URL
		let blob = await cnv.convertToBlob({ type: 'image/' + ext });
		return await new Promise((resolve) => {
			let r = new FileReader();
			r.onloadend = () => resolve(r.result);
			r.readAsDataURL(blob);
		});
	};

	$._hooks.preRender.push(() => {
		if (!vertIndex) return;

		// Switch to image pipeline
		$.pass.setPipeline($._pipelines[1]);

		let vertexBuffer = Q5.device.createBuffer({
			size: vertIndex * 5,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		new Float32Array(vertexBuffer.getMappedRange()).set(vertexStack.slice(0, vertIndex));
		vertexBuffer.unmap();

		$.pass.setVertexBuffer(1, vertexBuffer);

		if (vidFrames) {
			// Switch to video pipeline
			$.pass.setPipeline($._pipelines[3]);
			$.pass.setVertexBuffer(1, vertexBuffer);
		}
	});

	$._hooks.postRender.push(() => {
		vertIndex = 0;
		$._textureBindGroups.splice(tIdx, vidFrames);
		vidFrames = 0;
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
