Q5.modules.record = ($, q) => {
	class Q5Recorder {
		constructor(opt = {}) {
			this.x ??= 10;
			this.y ??= 10;

			this.mediaRecorder = null;
			this.chunks = [];
			this.isRecording = false;
			this.isPaused = false;
			this.stream = $.canvas.captureStream($.getTargetFrameRate());
			this.elapsedTime = 0;
			this.createUI();
		}

		createUI() {
			document.head.insertAdjacentHTML(
				'afterbegin',
				`<style>
.recorder {
	display: none;
	position: absolute;
	z-index: 1000;
	font-family: sans-serif;
	gap: 6px;
	background: #1a1b1d;
	padding: 6px 8px;
	border-radius: 21px;
	box-shadow: #0000001a 0px 4px 12px;
	border: 2px solid transparent; 
	opacity: 0.5;
	transition: all 0.3s;
	overflow: hidden;
}

.recorder:hover {
	opacity: 0.95;
}

.recorder.recording {
	border-color: #cc3e44;
}

.recorder button,
.recorder select {
	cursor: pointer;
}

.recorder button,
.recorder select,
.recorder .record-timer {
	font-size: 14px;
	padding: 0px 10px;
	border-radius: 18px;
	border: none;
	outline: none;
	background-color: #232529;
	color: #d4dae6;
	box-shadow: #0000001a 0px 4px 12px;
	border: thin solid #46494e;
	line-height: 24px;
	min-width: 36px;
	transition: all 0.3s;
}

.recorder .record-button {
	color: #cc3e44;
	font-size: 18px;
}

.recorder select:hover,
.recorder button:hover {
	background-color: #292b30;
}

.recorder button:disabled {
	opacity: 0.5;
	color: #969ba5;
	cursor: not-allowed;
}
</style>`
			);

			let supportedFormats = [
				{ label: 'H.264', mimeType: 'video/mp4; codecs="avc1.42E01E"' },
				{ label: 'VP9', mimeType: 'video/mp4; codecs=vp9' }
			].filter((format) => MediaRecorder.isTypeSupported(format.mimeType));

			let ui = document.createElement('div');
			ui.className = 'recorder';
			ui.innerHTML = `
<button></button><button></button><span class="record-timer"></span>`;

			let formatSelector = document.createElement('select');
			for (let format of supportedFormats) {
				let option = document.createElement('option');
				option.value = format.mimeType;
				option.textContent = format.label;
				formatSelector.append(option);
			}
			ui.append(formatSelector);

			document.body.append(ui);

			this.ui = ui;
			let recordPauseButton = (this.recordPauseButton = ui.children[0]);
			recordPauseButton.classList.add('record-button');
			let deleteSaveButton = (this.deleteSaveButton = ui.children[1]);
			this.timerDisplay = ui.children[2];
			this.formatSelector = formatSelector;

			this.encoderSettings = {
				mimeType: formatSelector.value,
				videoBitsPerSecond: 10000000
			};

			formatSelector.addEventListener('change', () => {
				this.encoderSettings.mimeType = formatSelector.value;
			});

			recordPauseButton.addEventListener('click', () => {
				if (!this.isRecording) this.start();
				else if (!this.isPaused) this.pauseRecording();
				else this.resumeRecording();
			});

			deleteSaveButton.addEventListener('click', () => {
				if (this.isPaused) this.saveRecording();
				else {
					this.stop();
					this.chunks = [];
					this.resetUI();
				}
			});

			this.resetUI();

			$.registerMethod('post', () => {
				this.updateTimer();
			});
		}

		start(videoSettings = {}) {
			if (this.isRecording) return;

			if (videoSettings.mimeType) this.encoderSettings.mimeType = videoSettings.mimeType;
			if (videoSettings.videoBitsPerSecond) this.encoderSettings.videoBitsPerSecond = videoSettings.videoBitsPerSecond;

			try {
				this.mediaRecorder = new MediaRecorder(this.stream, this.encoderSettings);
			} catch (e) {
				console.error('Failed to initialize MediaRecorder:', e);
				return;
			}

			this.chunks = [];
			this.mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					this.chunks.push(event.data);
				}
			};

			this.mediaRecorder.start();
			this.isRecording = true;
			this.isPaused = false;

			this.recordPauseButton.innerHTML = '⏸';
			this.recordPauseButton.title = 'Pause Recording';
			this.deleteSaveButton.innerHTML = '🗑️';
			this.deleteSaveButton.title = 'Delete Recording';

			this.deleteSaveButton.disabled = false;
			this.ui.classList.add('recording');

			this.startTime = $.frameCount;
		}

		pauseRecording() {
			if (!this.isRecording || this.isPaused) return;

			this.mediaRecorder.pause();
			this.isPaused = true;

			this.recordPauseButton.innerHTML = '⏺';
			this.recordPauseButton.title = 'Resume Recording';
			this.deleteSaveButton.innerHTML = '💾';
			this.deleteSaveButton.title = 'Save Recording';

			this.elapsedTime += $.frameCount - this.startTime;
		}

		resumeRecording() {
			if (!this.isRecording || !this.isPaused) return;

			this.mediaRecorder.resume();
			this.isPaused = false;

			this.recordPauseButton.innerHTML = '⏸';
			this.recordPauseButton.title = 'Pause Recording';
			this.deleteSaveButton.innerHTML = '🗑️';
			this.deleteSaveButton.title = 'Delete Recording';

			this.startTime = $.frameCount;
		}

		stop() {
			if (!this.isRecording) return;

			this.mediaRecorder.stop();
			this.isRecording = false;
			this.isPaused = false;

			this.ui.classList.remove('recording');

			this.elapsedTime += $.frameCount - this.startTime;
		}

		saveRecording(fileName = 'recording') {
			if (this.isRecording) {
				this.stop();
				this.mediaRecorder.onstop = () => {
					this.exportRecording(fileName);
				};
			} else {
				this.exportRecording(fileName);
			}
		}

		exportRecording(fileName) {
			if (this.chunks.length === 0) return;

			let type = this.encoderSettings.mimeType;
			let extension = type.slice(5, type.indexOf(';') - 5);
			let fullFileName = `${fileName}.${extension}`;
			let blob = new Blob(this.chunks, { type });
			let dataUrl = URL.createObjectURL(blob);

			let a = document.createElement('a');
			a.href = dataUrl;
			a.download = fullFileName;
			a.click();

			URL.revokeObjectURL(dataUrl);
			this.chunks = [];
			this.resetUI();
		}

		resetUI() {
			this.recordPauseButton.innerHTML = '⏺';
			this.recordPauseButton.title = 'Start Recording';

			this.deleteSaveButton.innerHTML = '💾';
			this.deleteSaveButton.title = 'Save Recording';

			this.deleteSaveButton.disabled = true;
			this.timerDisplay.textContent = '00:00:00:00';
			this.elapsedTime = 0;
		}

		updateTimer() {
			let totalElapsed = this.elapsedTime;
			if (this.isRecording && !this.isPaused) {
				totalElapsed += $.frameCount - this.startTime;
			}
			let formattedTime = this.formatTime(totalElapsed || 0);
			this.timerDisplay.textContent = formattedTime;
		}

		formatTime(frames) {
			let fr = $.getTargetFrameRate();
			let ms = Math.floor((frames * 1000) / fr);
			let totalSeconds = Math.floor(ms / 1000);
			let hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
			totalSeconds %= 3600;
			let minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
			let seconds = String(totalSeconds % 60).padStart(2, '0');
			frames = String(frames % fr).padStart(2, '0');
			return `${hours}:${minutes}:${seconds}:${frames}`;
		}
	}

	$.isRecording = false;

	let _rec;

	$.record = (videoSettings) => {
		if (!_rec) {
			_rec = new Q5Recorder();
		}
		if (!$.isRecording) {
			_rec.start(videoSettings);
			$.isRecording = true;
		} else if (_rec.isPaused) {
			_rec.resumeRecording();
		}
	};

	$.pauseRecording = () => {
		if ($.isRecording && !_rec.isPaused) {
			_rec.pauseRecording();
		}
	};

	$.deleteRecording = () => {
		_rec.deleteRecording();
		$.isRecording = false;
	};

	$.saveRecording = (fileName) => {
		_rec.saveRecording(fileName);
		$.isRecording = false;
	};

	$.createRecorder = (x = 10, y = 10) => {
		if (!_rec) {
			_rec = new Q5Recorder({ x, y });
		}
		_rec.ui.style.top = `${y}px`;
		_rec.ui.style.left = `${x}px`;
		_rec.ui.style.display = 'flex';
	};
};
