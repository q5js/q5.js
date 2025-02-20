Q5.renderers.webgpu.shaders = ($) => {
	let pipelineTypes = ['shapes', 'image', 'video', 'text'];

	let plCounters = {
		shapes: 100,
		image: 200,
		video: 300,
		text: 400
	};

	$._createShader = (code, type = 'shapes') => {
		code = code.trim();

		// default shader code
		let def = $['_' + type + 'ShaderCode'];

		let defVertIdx = def.indexOf('@vertex');
		let defFragIdx = def.indexOf('@fragment');

		if (!code.includes('@fragment')) {
			// replace @vertex section
			code = def.slice(0, defVertIdx) + code + '\n\n' + def.slice(defFragIdx);
		} else if (!code.includes('@vertex')) {
			// replace @fragment section
			code = def.slice(0, defFragIdx) + code;
		} else {
			// replace @vertex and @fragment sections
			code = def.slice(0, defVertIdx) + code;
		}

		let shader = Q5.device.createShaderModule({
			label: type + 'Shader',
			code: code
		});
		shader.type = type;

		let pipelineIndex = pipelineTypes.indexOf(type);
		let config = Object.assign({}, $._pipelineConfigs[pipelineIndex]);
		config.vertex.module = config.fragment.module = shader;

		let pl = plCounters[type];
		$._pipelines[pl] = Q5.device.createRenderPipeline(config);
		shader.pipelineIndex = pl;
		plCounters[type]++;

		return shader;
	};

	$.createShader = $.createShapesShader = $._createShader;
	$.createImageShader = (code) => $._createShader(code, 'image');
	$.createVideoShader = (code) => $._createShader(code, 'video');
	$.createTextShader = (code) => $._createShader(code, 'text');

	$.shader = (shader) => {
		$['_' + shader.type + 'PL'] = shader.pipelineIndex;
	};

	$.resetShader = (type = 'shapes') => {
		$['_' + type + 'PL'] = pipelineTypes.indexOf(type);
	};

	$.resetShaders = () => {
		$._shapesPL = 0;
		$._imagePL = 1;
		$._videoPL = 2;
		$._textPL = 3;
		$._planePL = 4;
	};
};
