Q5.renderers.webgpu.image = ($, q) => {
	$._imagePL = 2;
	$._videoPL = 3;

	$._imageShaderCode =
		$._baseShaderCode +
		/* wgsl */ `
struct VertexParams {
	@builtin(vertex_index) vertexIndex : u32,
	@location(0) pos: vec2f,
	@location(1) texCoord: vec2f,
	@location(2) tintIndex: f32,
	@location(3) matrixIndex: f32,
	@location(4) imageAlpha: f32
}
struct FragParams {
	@builtin(position) position: vec4f,
	@location(0) texCoord: vec2f,
	@location(1) tintColor: vec4f,
	@location(2) imageAlpha: f32
}

@group(0) @binding(0) var<uniform> q: Q5;
@group(0) @binding(1) var<storage> transforms: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage> colors : array<vec4f>;

@group(1) @binding(0) var samp: sampler;
@group(1) @binding(1) var tex: texture_2d<f32>;

fn transformVertex(pos: vec2f, matrixIndex: f32) -> vec4f {
	var vert = vec4f(pos, 0f, 1f);
	vert = transforms[i32(matrixIndex)] * vert;
	vert.x /= q.halfWidth;
	vert.y /= q.halfHeight;
	return vert;
}

fn applyTint(texColor: vec4f, tintColor: vec4f) -> vec4f {
	// apply the tint color to the sampled texture color at full strength
	let tinted = vec4f(texColor.rgb * tintColor.rgb, texColor.a);
	// mix in the tint using the tint alpha as the blend strength
	return mix(texColor, tinted, tintColor.a);
}

@vertex
fn vertexMain(v: VertexParams) -> FragParams {
	var vert = transformVertex(v.pos, v.matrixIndex);

	var f: FragParams;
	f.position = vert;
	f.texCoord = v.texCoord;
	f.tintColor = colors[i32(v.tintIndex)];
	f.imageAlpha = v.imageAlpha;
	return f;
}

@fragment
fn fragMain(f: FragParams) -> @location(0) vec4f {
	var texColor = textureSample(tex, samp, f.texCoord);
	texColor.a *= f.imageAlpha;
	return applyTint(texColor, f.tintColor);
}
`;

	let imageShader = Q5.device.createShaderModule({
		label: 'imageShader',
		code: $._imageShaderCode
	});

	$._videoShaderCode = $._imageShaderCode
		.replace('texture_2d<f32>', 'texture_external')
		.replace('textureSample', 'textureSampleBaseClampToEdge');

	let videoShader = Q5.device.createShaderModule({
		label: 'videoShader',
		code: $._videoShaderCode
	});

	let vertexStack = new Float32Array($._graphics ? 1000 : 1e7),
		vertIndex = 0;

	let vertexBufferLayout = {
		arrayStride: 28,
		attributes: [
			{ shaderLocation: 0, offset: 0, format: 'float32x2' },
			{ shaderLocation: 1, offset: 8, format: 'float32x2' },
			{ shaderLocation: 2, offset: 16, format: 'float32' }, // tintIndex
			{ shaderLocation: 3, offset: 20, format: 'float32' }, // matrixIndex
			{ shaderLocation: 4, offset: 24, format: 'float32' } // imageAlpha
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
		bindGroupLayouts: [...$._bindGroupLayouts, textureLayout]
	});

	let videoPipelineLayout = Q5.device.createPipelineLayout({
		label: 'videoPipelineLayout',
		bindGroupLayouts: [...$._bindGroupLayouts, videoTextureLayout]
	});

	$._pipelineConfigs[2] = {
		label: 'imagePipeline',
		layout: imagePipelineLayout,
		vertex: {
			module: imageShader,
			entryPoint: 'vertexMain',
			buffers: [{ arrayStride: 0, attributes: [] }, vertexBufferLayout]
		},
		fragment: {
			module: imageShader,
			entryPoint: 'fragMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs['source-over'] }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[2] = Q5.device.createRenderPipeline($._pipelineConfigs[2]);

	$._pipelineConfigs[3] = {
		label: 'videoPipeline',
		layout: videoPipelineLayout,
		vertex: {
			module: videoShader,
			entryPoint: 'vertexMain',
			buffers: [{ arrayStride: 0, attributes: [] }, vertexBufferLayout]
		},
		fragment: {
			module: videoShader,
			entryPoint: 'fragMain',
			targets: [{ format: 'bgra8unorm', blend: $.blendConfigs['source-over'] }]
		},
		primitive: { topology: 'triangle-strip', stripIndexFormat: 'uint32' },
		multisample: { count: 4 }
	};

	$._pipelines[3] = Q5.device.createRenderPipeline($._pipelineConfigs[3]);

	$._textureBindGroups = [];

	$._saveCanvas = async (g, ext) => {
		let makeFrame = g._drawStack?.length;
		if (makeFrame) {
			g._render();
			g._finishRender();
		}

		let texture = g._texture;

		if (makeFrame) g._beginRender();

		let w = texture.width,
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
		let data = new Uint8Array(w * h * 4); // unpadded data

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
		let cnv = new $._Canvas(w, h);
		let ctx = cnv.getContext('2d', { colorSpace });
		ctx.putImageData(data, 0, 0);

		$._buffers.push(buffer);

		// Convert to blob then data URL
		let blob = await cnv.convertToBlob({ type: 'image/' + ext });
		return await new Promise((resolve) => {
			let r = new FileReader();
			r.onloadend = () => resolve(r.result);
			r.readAsDataURL(blob);
		});
	};

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

	$._addTexture = (img, texture) => {
		let cnv = img.canvas || img;

		if (!texture) {
			let textureSize = [cnv.width, cnv.height, 1];

			texture = Q5.device.createTexture({
				size: textureSize,
				format: 'bgra8unorm',
				usage:
					GPUTextureUsage.TEXTURE_BINDING |
					GPUTextureUsage.COPY_SRC |
					GPUTextureUsage.COPY_DST |
					GPUTextureUsage.RENDER_ATTACHMENT
			});

			Q5.device.queue.copyExternalImageToTexture(
				{ source: cnv },
				{
					texture,
					colorSpace: $.canvas.colorSpace
				},
				textureSize
			);
		}

		texture.index = tIdx + vidFrames;
		img._texture = texture;

		$._textureBindGroups[texture.index] = Q5.device.createBindGroup({
			label: img.src || texture.label || 'canvas',
			layout: textureLayout,
			entries: [
				{ binding: 0, resource: $._imageSampler },
				{ binding: 1, resource: texture.createView() }
			]
		});

		tIdx++;
	};

	$.loadImage = (src, cb) => {
		let g = $._g.loadImage(src, () => {
			$._extendImage(g);
			if (cb) cb(g);
		});
		return g;
	};

	$._extendImage = (g) => {
		$._addTexture(g);
		let _copy = g.copy;
		g.copy = function () {
			let copy = _copy();
			$._addTexture(copy);
			return copy;
		};
		g.modified = true;
	};

	$.createImage = (w, h, opt) => {
		let g = $._g.createImage(w, h, opt);
		$._extendImage(g);
		return g;
	};

	let _createGraphics = $.createGraphics;

	$.createGraphics = (w, h, opt = {}) => {
		if (!Q5.experimental) {
			throw new Error(
				'createGraphics is disabled by default in q5 WebGPU. See issue https://github.com/q5js/q5.js/issues/104 for details.'
			);
		}
		if (typeof opt == 'string') opt = { renderer: opt };
		opt.renderer ??= 'c2d';
		let g = _createGraphics(w, h, opt);
		if (g.canvas.webgpu) {
			$._addTexture(g, g._frameA);
			$._addTexture(g, g._frameB);
			g._beginRender();
		} else $._extendImage(g);
		return g;
	};

	$.imageMode = (x) => ($._imageMode = x);

	const addVert = (x, y, u, v, ci, ti, ia) => {
		let s = vertexStack,
			i = vertIndex;
		s[i++] = x;
		s[i++] = y;
		s[i++] = u;
		s[i++] = v;
		s[i++] = ci;
		s[i++] = ti;
		s[i++] = ia;
		vertIndex = i;
	};

	$.image = (img, dx = 0, dy = 0, dw, dh, sx = 0, sy = 0, sw, sh) => {
		let isVideo;
		if (img._texture == undefined) {
			isVideo = img.tagName == 'VIDEO';
			if (!isVideo || !img.width || !img.currentTime) return;
			if (img.flipped) $.scale(-1, 1);
		}

		if ($._matrixDirty) $._saveMatrix();

		let cnv = img.canvas || img,
			w = cnv.width,
			h = cnv.height,
			pd = img._pixelDensity || 1,
			makeFrame = img._graphics && img._drawStack?.length;

		if (makeFrame) {
			img._render();
			img._finishRender();
		}

		if (img.modified) {
			Q5.device.queue.copyExternalImageToTexture(
				{ source: cnv },
				{ texture: img._texture, colorSpace: $.canvas.colorSpace },
				[w, h, 1]
			);
			img.frameCount++;
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
			ia = $._globalAlpha;

		addVert(l, t, u0, v0, ci, ti, ia);
		addVert(r, t, u1, v0, ci, ti, ia);
		addVert(l, b, u0, v1, ci, ti, ia);
		addVert(r, b, u1, v1, ci, ti, ia);

		if (!isVideo) {
			$._drawStack.push($._imagePL, img._texture.index);

			if (makeFrame) {
				img.resetMatrix();
				img._beginRender();
				img.frameCount++;
			}
		} else {
			// render video
			let externalTexture = Q5.device.importExternalTexture({ source: img });

			// Create bind group for the external texture that will
			// only exist for this frame
			$._textureBindGroups.push(
				Q5.device.createBindGroup({
					layout: videoTextureLayout,
					entries: [
						{ binding: 0, resource: $._imageSampler },
						{ binding: 1, resource: externalTexture }
					]
				})
			);

			$._drawStack.push($._videoPL, $._textureBindGroups.length - 1);

			if (img.flipped) $.scale(-1, 1);
		}
	};

	$._hooks.preRender.push(() => {
		if (!vertIndex) return;

		// Switch to image pipeline
		$._pass.setPipeline($._pipelines[2]);

		let vertexBuffer = Q5.device.createBuffer({
			size: vertIndex * 5,
			usage: GPUBufferUsage.VERTEX,
			mappedAtCreation: true
		});

		new Float32Array(vertexBuffer.getMappedRange()).set(vertexStack.slice(0, vertIndex));
		vertexBuffer.unmap();

		$._pass.setVertexBuffer(1, vertexBuffer);

		$._buffers.push(vertexBuffer);

		if (vidFrames) {
			// Switch to video pipeline
			$._pass.setPipeline($._pipelines[3]);
			$._pass.setVertexBuffer(1, vertexBuffer);
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
