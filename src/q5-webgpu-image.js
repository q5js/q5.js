Q5.renderers.webgpu.image = ($, q) => {
	$.imageStack = [];
	$.textures = [];

	$._hooks.postCanvas.push(() => {
		let imageVertexShader = Q5.device.createShaderModule({
			code: `
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) texCoord: vec2<f32>,
    @location(1) textureIndex: f32
};

struct Uniforms {
    halfWidth: f32,
    halfHeight: f32
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(1) @binding(0) var<storage, read> transforms: array<mat4x4<f32>>;

@vertex
fn vertexMain(@location(0) pos: vec2<f32>, @location(1) texCoord: vec2<f32>, @location(2) transformIndex: f32, @location(3) textureIndex: f32) -> VertexOutput {
    var vert = vec4<f32>(pos, 0.0, 1.0);
    vert *= transforms[i32(transformIndex)];
    vert.x /= uniforms.halfWidth;
    vert.y /= uniforms.halfHeight;

    var output: VertexOutput;
    output.position = vert;
    output.texCoord = texCoord;
    output.textureIndex = textureIndex;
    return output;
}
`
		});

		let imageFragmentShader = Q5.device.createShaderModule({
			code: `
@group(0) @binding(0) var samp: sampler;
@group(0) @binding(1) var textures: array<texture_2d<f32>>;

@fragment
fn fragmentMain(@location(0) texCoord: vec2<f32>, @location(1) textureIndex: f32) -> @location(0) vec4<f32> {
    return textureSample(textures[i32(textureIndex)], samp, texCoord);
}
`
		});

		const bindGroupLayouts = [
			Q5.device.createBindGroupLayout({
				entries: [
					{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
					{ binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
					{ binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: { viewDimension: '2d', sampleType: 'float' } }
				]
			}),
			Q5.device.createBindGroupLayout({
				entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } }]
			})
		];

		const pipelineLayout = Q5.device.createPipelineLayout({
			bindGroupLayouts: bindGroupLayouts
		});

		$.pipelines[1] = Q5.device.createRenderPipeline({
			layout: pipelineLayout,
			vertex: {
				module: imageVertexShader,
				entryPoint: 'vertexMain',
				buffers: [
					{
						arrayStride: 5 * 4, // 4 floats for position and texCoord, 1 float for textureIndex
						attributes: [
							{ shaderLocation: 0, offset: 0, format: 'float32x2' },
							{ shaderLocation: 1, offset: 2 * 4, format: 'float32x2' },
							{ shaderLocation: 2, offset: 4 * 4, format: 'float32' } // textureIndex
						]
					}
				]
			},
			fragment: {
				module: imageFragmentShader,
				entryPoint: 'fragmentMain',
				targets: [{ format: 'bgra8unorm' }]
			},
			primitive: {
				topology: 'triangle-list'
			}
		});

		$.sampler = Q5.device.createSampler({
			magFilter: 'linear',
			minFilter: 'linear'
		});
	});

	$.loadImage = async (src) => {
		const img = new Image();
		img.onload = async () => {
			const imageBitmap = await createImageBitmap(img);
			const texture = Q5.device.createTexture({
				size: [img.width, img.height, 1],
				format: 'bgra8unorm',
				usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
			});

			Q5.device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture }, [img.width, img.height, 1]);

			img.texture = texture;
			img.index = $.textures.length;
			$.textures.push(texture);
		};
		img.onerror = reject;
		img.src = src;
		return img;
	};

	$._hooks.preRender.push(() => {
		if (!$.imageStack.length) return;

		// Switch to image pipeline
		$.pass.setPipeline($.pipelines[1]);

		// Create a vertex buffer for the image quads
		const vertices = new Float32Array($.vertexStack);

		const vertexBuffer = Q5.device.createBuffer({
			size: vertices.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});

		Q5.device.queue.writeBuffer(vertexBuffer, 0, vertices);
		$.pass.setVertexBuffer(0, vertexBuffer);

		// Set the bind group for the sampler and textures
		if ($.textures.length !== previousTextureCount) {
			previousTextureCount = $.textures.length;

			// Create the bind group for all textures
			const textureViews = $.textures.map((tex) => tex.createView());

			$.textureBindGroup = Q5.device.createBindGroup({
				layout: $.pipelines[1].getBindGroupLayout(0),
				entries: [
					{ binding: 0, resource: $.sampler },
					...textureViews.map((view, i) => ({ binding: i + 1, resource: view }))
				]
			});
		}

		// Set the bind group for the sampler and textures
		$.pass.setBindGroup(0, $.textureBindGroup);
	});

	$.image = (img, x, y, w, h) => {
		if ($._matrixDirty) $._saveMatrix();
		let ti = $._transformIndex;

		$.imageStack.push(img.index);

		// Calculate half-width and half-height
		let hw = w / 2;
		let hh = h / 2;

		// Calculate vertices positions
		let left = x - hw;
		let right = x + hw;
		let top = -(y - hh); // y is inverted in WebGPU
		let bottom = -(y + hh);

		let ii = img.index;

		// prettier-ignore
		$.vertexStack.push(
			left, top, 0, 0, ti, ii,
			right, top, 1, 0, ti, ii,
			left, bottom, 0, 1, ti, ii,
			right, top, 1, 0, ti, ii,
			left, bottom, 0, 1, ti, ii,
			right, bottom, 1, 1, ti, ii
		);

		$.drawStack.push(6);
	};
};
