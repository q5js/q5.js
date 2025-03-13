Q5.modules.record = ($, q) => {
	let rec, btn0, btn1, timer, formatSelect, bitrateInput, audioToggle;

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
.rec input,
.rec span {
	font-family: sans-serif;
	font-size: 14px;
	padding: 2px 10px;
	border-radius: 18px;
	outline: none;
	background: #232529;
	color: #d4dae6;
	box-shadow: #0000001a 0px 4px 12px;
	border: 1px solid #46494e;
	vertical-align: middle;
	line-height: 18px;
	transition: all 0.3s;
}

.rec .audio-toggle {
	font-size: 16px;
	padding: 2px 10px;
}

.rec .bitrate input {
	border-radius: 18px 0 0 18px;
	border-right: 0;
	width: 40px;
	padding: 2px 5px 2px 10px;
	text-align: right;
}

.rec .bitrate span {
	border-radius: 0 18px 18px 0;
	border-left: 0;
	padding: 2px 10px 2px 5px;
	background: #333;
}

.rec .record-button { 
	color: #cc3e44;
	font-size: 18px;
}

.rec select:hover,
.rec button:hover { background: #32343b; }

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

		let f = 'video/mp4; codecs=';
		rec.formats = {
			'H.264': f + '"avc1.42E01E"',
			VP9: f + 'vp9'
		};
		let highProfile = f + '"avc1.640034"';

		let pixelCount = $.canvas.width * $.canvas.height;
		if (pixelCount > 3200000 && MediaRecorder.isTypeSupported(highProfile)) {
			rec.formats['H.264'] = highProfile;
		}

		Object.assign(rec.formats, opt.formats);

		formatSelect = $.createSelect('format');
		for (const name in rec.formats) {
			formatSelect.option(name, rec.formats[name]);
		}
		formatSelect.title = 'Video Format';
		rec.append(formatSelect);

		let div = $.createEl('div');
		div.className = 'bitrate';
		div.style.display = 'flex';
		rec.append(div);

		bitrateInput = $.createInput();
		let span = document.createElement('span');
		span.textContent = 'mbps';
		bitrateInput.title = span.title = 'Video Bitrate';
		div.append(bitrateInput);
		div.append(span);

		audioToggle = $.createEl('button');
		audioToggle.className = 'audio-toggle active';
		audioToggle.textContent = '🔊';
		audioToggle.title = 'Toggle Audio Recording';
		rec.append(audioToggle);

		rec.captureAudio = true;

		audioToggle.addEventListener('click', () => {
			rec.captureAudio = !rec.captureAudio;
			audioToggle.textContent = rec.captureAudio ? '🔊' : '🔇';
			audioToggle.classList.toggle('active', rec.captureAudio);
		});

		rec.encoderSettings = {};

		function changeFormat() {
			rec.encoderSettings.mimeType = formatSelect.value;
		}

		function changeBitrate() {
			rec.encoderSettings.videoBitsPerSecond = 1000000 * bitrateInput.value;
		}

		formatSelect.addEventListener('change', changeFormat);
		bitrateInput.addEventListener('change', changeBitrate);

		Object.defineProperty(rec, 'bitrate', {
			get: () => bitrateInput.value,
			set: (v) => {
				bitrateInput.value = v;
				changeBitrate();
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

		rec.format = 'H.264';

		let h = $.canvas.height;
		rec.bitrate = h >= 4320 ? 96 : h >= 2160 ? 64 : h >= 1440 ? 48 : h >= 1080 ? 32 : h >= 720 ? 26 : 16;

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

		$.userStartAudio();

		if (!rec.stream) {
			rec.frameRate ??= $.getTargetFrameRate();
			let canvasStream = $.canvas.captureStream(rec.frameRate);

			rec.videoTrack = canvasStream.getVideoTracks()[0];

			if (rec.captureAudio && $.getAudioContext) {
				let aud = $.getAudioContext();
				let dest = aud.createMediaStreamDestination();

				// if using p5.sound
				if (aud.destination.input) aud.destination.input.connect(dest);
				else Q5.soundOut.connect(dest);

				rec.audioTrack = dest.stream.getAudioTracks()[0];

				rec.stream = new MediaStream([rec.videoTrack, rec.audioTrack]);
			} else rec.stream = canvasStream;
		}

		rec.mediaRecorder = new MediaRecorder(rec.stream, rec.encoderSettings);

		rec.chunks = [];
		rec.mediaRecorder.addEventListener('dataavailable', (e) => {
			if (e.data.size > 0) rec.chunks.push(e.data);
		});

		rec.mediaRecorder.start();
		q.recording = true;
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
		q.recording = false;
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
		q.recording = false;
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
			document.title +
			' ' +
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
		q.recording = false;
	};
};
