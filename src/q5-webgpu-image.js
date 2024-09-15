Q5.renderers.webgpu.image = ($, q) => {
	$._textureBindGroups = [];
	let verticesStack = [];

	let vertexShader = Q5.device.createShaderModule({
		label: 'imageVertexShader',
		code: `
struct VertexOutput {
	@builtin(position) position: vec4<f32>,
	@location(0) texCoord: vec2<f32>
};

struct Uniforms {
	halfWidth: f32,
	halfHeight: f32
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(1) @binding(0) var<storage, read> transforms: array<mat4x4<f32>>;

@vertex
fn vertexMain(@location(0) pos: vec2<f32>, @location(1) texCoord: vec2<f32>, @location(2) transformIndex: f32) -> VertexOutput {
	var vert = vec4<f32>(pos, 0.0, 1.0);
	vert *= transforms[i32(transformIndex)];
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
@group(3) @binding(0) var samp: sampler;
@group(3) @binding(1) var texture: texture_2d<f32>;

@fragment
fn fragmentMain(@location(0) texCoord: vec2<f32>) -> @location(0) vec4<f32> {
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

	$.bindGroupLayouts.push(textureLayout);

	const pipelineLayout = Q5.device.createPipelineLayout({
		label: 'imagePipelineLayout',
		bindGroupLayouts: $.bindGroupLayouts
	});

	$.pipelines[1] = Q5.device.createRenderPipeline({
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
			targets: [
				{
					format: 'bgra8unorm',
					blend: $.blendConfigs?.normal || {
						color: {
							srcFactor: 'src-alpha',
							dstFactor: 'one-minus-src-alpha',
							operation: 'add'
						},
						alpha: {
							srcFactor: 'src-alpha',
							dstFactor: 'one-minus-src-alpha',
							operation: 'add'
						}
					}
				}
			]
		},
		primitive: {
			topology: 'triangle-list'
		}
	});

	let sampler = Q5.device.createSampler({
		magFilter: 'linear',
		minFilter: 'linear'
	});

	$._createTexture = (img) => {
		let textureSize = [img.width, img.height, 1];

		const texture = Q5.device.createTexture({
			size: textureSize,
			format: 'bgra8unorm',
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
		});

		Q5.device.queue.copyExternalImageToTexture({ source: img }, { texture }, textureSize);

		img.textureIndex = $._textureBindGroups.length;

		const textureBindGroup = Q5.device.createBindGroup({
			layout: textureLayout,
			entries: [
				{ binding: 0, resource: sampler },
				{ binding: 1, resource: texture.createView() }
			]
		});
		$._textureBindGroups.push(textureBindGroup);
	};

	$.loadImage = $.loadTexture = (src) => {
		q._preloadCount++;
		const img = new Image();
		img.crossOrigin = 'Anonymous';
		img.onload = () => {
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

		w ??= img.width;
		h ??= img.height;

		w /= $._pixelDensity;
		h /= $._pixelDensity;

		let [l, r, t, b] = $._calcBox(x, y, w, h, $._imageMode);

		// prettier-ignore
		verticesStack.push(
			l, t, 0, 0, ti,
			r, t, 1, 0, ti,
			l, b, 0, 1, ti,
			r, t, 1, 0, ti,
			l, b, 0, 1, ti,
			r, b, 1, 1, ti
		);

		$.drawStack.push(1, img.textureIndex);
	};

	$._hooks.preRender.push(() => {
		if (!$._textureBindGroups.length) return;

		// Switch to image pipeline
		$.pass.setPipeline($.pipelines[1]);

		// Create a vertex buffer for the image quads
		const vertices = new Float32Array(verticesStack);

		const vertexBuffer = Q5.device.createBuffer({
			size: vertices.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});

		Q5.device.queue.writeBuffer(vertexBuffer, 0, vertices);
		$.pass.setVertexBuffer(1, vertexBuffer);
	});

	$._hooks.postRender.push(() => {
		verticesStack.length = 0;
	});
};
