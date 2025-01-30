Q5.modules.record = ($) => {
	let rec, btn0, btn1, timer, formatSelect, qualitySelect;

	$.recording = false;

	function initRecorder(opt = {}) {
		document.head.insertAdjacentHTML(
			'beforeend',
			`<style>
.rec {
	display: flex;
	z-index: 1000;
	gap: 6px;
	background: #1a1b1d;
	padding: 6px 8px;
	border-radius: 21px;
	box-shadow: #0000001a 0px 4px 12px;
	border: 2px solid transparent; 
	opacity: 0.6;
	transition: all 0.3s;
	width: 134px;
	overflow: hidden;
}

.rec:hover {
	width: unset;
	opacity: 0.96;
}

.rec.recording { border-color: #cc3e44; }

.rec button,
.rec select { cursor: pointer; }

.rec button,
.rec select,
.rec .record-timer {
	font-family: sans-serif;
	font-size: 14px;
	padding: 2px 10px;
	border-radius: 18px;
	outline: none;
	background-color: #232529;
	color: #d4dae6;
	box-shadow: #0000001a 0px 4px 12px;
	border: 1px solid #46494e;
	vertical-align: middle;
	line-height: 18px;
	transition: all 0.3s;
}

.rec .record-button { 
	color: #cc3e44;
	font-size: 18px;
}

.rec select:hover,
.rec button:hover { background-color: #292b30; }

.rec button:disabled {
	opacity: 0.5;
	color: #969ba5;
	cursor: not-allowed;
}
</style>`
		);

		rec = $.createEl('div');
		rec.className = 'rec';
		rec.innerHTML = `
<button class="record-button"></button>
<span class="record-timer"></span>
<button></button>
`;

		[btn0, timer, btn1] = rec.children;

		rec.x = rec.y = 8;

		rec.resetTimer = () => (rec.time = { hours: 0, minutes: 0, seconds: 0, frames: 0 });
		rec.resetTimer();

		rec.formats = opt.formats || {
			'H.264': 'video/mp4; codecs="avc1.42E01E"',
			VP9: 'video/mp4; codecs=vp9'
		};

		// remove unsupported formats
		for (let format in rec.formats) {
			if (!MediaRecorder.isTypeSupported(rec.formats[format])) {
				delete rec.formats[format];
			}
		}

		formatSelect = $.createSelect('format');
		for (const name in rec.formats) {
			formatSelect.option(name, rec.formats[name]);
		}
		formatSelect.title = 'Video Format';
		rec.append(formatSelect);

		let qMult = {
			min: 0.1,
			low: 0.25,
			mid: 0.5,
			high: 0.75,
			ultra: 0.9,
			max: 1
		};

		qualitySelect = $.createSelect('quality');
		for (let name in qMult) {
			qualitySelect.option(name, qMult[name]);
		}
		qualitySelect.title = 'Video Quality';
		rec.append(qualitySelect);

		rec.encoderSettings = {};

		function changeFormat() {
			rec.encoderSettings.mimeType = formatSelect.value;
		}

		function changeQuality() {
			rec.encoderSettings.videoBitsPerSecond = maxVideoBitRate * qualitySelect.value;
		}

		formatSelect.addEventListener('change', changeFormat);
		qualitySelect.addEventListener('change', changeQuality);

		Object.defineProperty(rec, 'quality', {
			get: () => qualitySelect.selected,
			set: (v) => {
				v = v.toLowerCase();
				if (qMult[v]) {
					qualitySelect.selected = v;
					changeQuality();
				}
			}
		});

		Object.defineProperty(rec, 'format', {
			get: () => formatSelect.selected,
			set: (v) => {
				v = v.toUpperCase();
				if (rec.formats[v]) {
					formatSelect.selected = v;
					changeFormat();
				}
			}
		});

		let h = $.canvas.height;

		if (h >= 1440 && rec.formats.VP9) rec.format = 'VP9';
		else rec.format = 'H.264';

		let maxVideoBitRate =
			(h >= 4320 ? 128 : h >= 2160 ? 75 : h >= 1440 ? 36 : h >= 1080 ? 28 : h >= 720 ? 22 : 16) * 1000000;

		rec.quality = 'high';

		btn0.addEventListener('click', () => {
			if (!$.recording) start();
			else if (!rec.paused) $.pauseRecording();
			else resumeRecording();
		});

		btn1.addEventListener('click', () => {
			if (rec.paused) $.saveRecording();
			else $.deleteRecording();
		});

		resetUI();

		$.registerMethod('post', updateTimer);
	}

	function start() {
		if ($.recording) return;

		if (!rec.stream) {
			rec.frameRate ??= $.getTargetFrameRate();
			let canvasStream = $.canvas.captureStream(rec.frameRate);
			// let audioStream = Q5.aud.createMediaStreamDestination().stream;
			// rec.stream = new MediaStream([canvasStream.getTracks()[0], ...audioStream.getTracks()]);
			rec.stream = canvasStream;
		}

		try {
			rec.mediaRecorder = new MediaRecorder(rec.stream, rec.encoderSettings);
		} catch (e) {
			console.error('Failed to initialize MediaRecorder: ', e);
			return;
		}

		rec.chunks = [];
		rec.mediaRecorder.addEventListener('dataavailable', (e) => {
			if (e.data.size > 0) rec.chunks.push(e.data);
		});

		rec.mediaRecorder.start();
		$.recording = true;
		rec.paused = false;
		rec.classList.add('recording');

		rec.resetTimer();
		resetUI(true);
	}

	function resumeRecording() {
		if (!$.recording || !rec.paused) return;

		rec.mediaRecorder.resume();
		rec.paused = false;
		resetUI(true);
	}

	function stop() {
		if (!$.recording) return;

		rec.resetTimer();
		rec.mediaRecorder.stop();
		$.recording = false;
		rec.paused = false;
		rec.classList.remove('recording');
	}

	function resetUI(r) {
		btn0.textContent = r ? '⏸' : '⏺';
		btn0.title = (r ? 'Pause' : 'Start') + ' Recording';
		btn1.textContent = r ? '🗑️' : '💾';
		btn1.title = (r ? 'Delete' : 'Save') + ' Recording';
		btn1.disabled = !r;
	}

	function updateTimer() {
		if ($.recording && !rec.paused) {
			rec.time.frames++;
			let fr = $.getTargetFrameRate();

			if (rec.time.frames >= fr) {
				rec.time.seconds += Math.floor(rec.time.frames / fr);
				rec.time.frames %= fr;

				if (rec.time.seconds >= 60) {
					rec.time.minutes += Math.floor(rec.time.seconds / 60);
					rec.time.seconds %= 60;

					if (rec.time.minutes >= 60) {
						rec.time.hours += Math.floor(rec.time.minutes / 60);
						rec.time.minutes %= 60;
					}
				}
			}
		}
		timer.textContent = formatTime();
	}

	function formatTime() {
		let { hours, minutes, seconds, frames } = rec.time;
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
			2,
			'0'
		)}:${String(frames).padStart(2, '0')}`;
	}

	$.createRecorder = (opt) => {
		if (!rec) initRecorder(opt);
		return rec;
	};

	$.record = (opt) => {
		if (!rec) {
			initRecorder(opt);
			rec.hide();
		}
		if (!$.recording) start();
		else if (rec.paused) resumeRecording();
	};

	$.pauseRecording = () => {
		if (!$.recording || rec.paused) return;

		rec.mediaRecorder.pause();
		rec.paused = true;

		resetUI();
		btn0.title = 'Resume Recording';
		btn1.disabled = false;
	};

	$.deleteRecording = () => {
		stop();
		resetUI();
		$.recording = false;
	};

	$.saveRecording = async (fileName) => {
		if (!$.recording) return;

		await new Promise((resolve) => {
			rec.mediaRecorder.onstop = resolve;
			stop();
		});

		let type = rec.encoderSettings.mimeType,
			extension = type.slice(6, type.indexOf(';')),
			dataUrl = URL.createObjectURL(new Blob(rec.chunks, { type })),
			iframe = document.createElement('iframe'),
			a = document.createElement('a');

		// Create an invisible iframe to detect load completion
		iframe.style.display = 'none';
		iframe.name = 'download_' + Date.now();
		document.body.append(iframe);

		a.target = iframe.name;
		a.href = dataUrl;
		fileName ??=
			'recording ' +
			new Date()
				.toLocaleString(undefined, { hour12: false })
				.replace(',', ' at')
				.replaceAll('/', '-')
				.replaceAll(':', '_');
		a.download = `${fileName}.${extension}`;

		await new Promise((resolve) => {
			iframe.onload = () => {
				document.body.removeChild(iframe);
				resolve();
			};
			a.click();
		});

		setTimeout(() => URL.revokeObjectURL(dataUrl), 1000);
		resetUI();
		$.recording = false;
	};
};
