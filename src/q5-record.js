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
			this.startTime = null;
			this.timerInterval = null;
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
	gap: 7px;
	background: rgb(26, 27, 29);
	padding: 7px;
	border-radius: 30px;
	box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
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

.recorder.recording .start-button {
	color: #cc3e44; 
	opacity: 1;
}

.recorder.recording .format-selector,
.recorder.recording .download-button {
	width: 0px;
	height: 0px;
	opacity: 0;
	min-width: 0px;
}

.recorder button,
.recorder select,
.recorder .recorder-timer {
	cursor: pointer;
	font-size: 13px;
	padding: 5px 9px;
	border-radius: 30px;
	border: none;
	outline: none;
	background-color: rgb(35, 37, 41);
	color: rgb(212, 218, 230);
	font-family: 'Arial';
	box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
	border: thin solid rgb(70, 73, 78);
	line-height: 24px;
	min-width: 37px;
	max-width: 37px;
	transition: width 0.3s, height 0.3s, opacity 0.2s;
	overflow: hidden;
}

.recorder .recorder-timer {
	min-width: 69px;
	max-width:100px;
}

.recorder select {
	max-width:100px;
}

.recorder .format-selector {
	min-width: 100px;
}

.recorder select:hover,
.recorder button:hover {
	background-color: rgb(41, 43, 48);
}

.recorder button:disabled {
	opacity: 0.5;
	color: rgb(150, 155, 165);
	cursor: not-allowed;
}

.recorder .download-button {
	font-size: 18px;
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
<button></button><button></button><span class="recorder-timer"></span>`;

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

			this.startTime = Date.now();
			this.timerInterval = setInterval(() => {
				this.updateTimer();
			}, 50);
		}

		pauseRecording() {
			if (!this.isRecording || this.isPaused) return;

			this.mediaRecorder.pause();
			this.isPaused = true;

			this.recordPauseButton.innerHTML = '⏺';
			this.recordPauseButton.title = 'Resume Recording';
			this.deleteSaveButton.innerHTML = '💾';
			this.deleteSaveButton.title = 'Save Recording';

			this.elapsedTime += Date.now() - this.startTime;
			clearInterval(this.timerInterval);
		}

		resumeRecording() {
			if (!this.isRecording || !this.isPaused) return;

			this.mediaRecorder.resume();
			this.isPaused = false;

			this.recordPauseButton.innerHTML = '⏸';
			this.recordPauseButton.title = 'Pause Recording';
			this.deleteSaveButton.innerHTML = '🗑️';
			this.deleteSaveButton.title = 'Delete Recording';

			this.startTime = Date.now();
			this.timerInterval = setInterval(() => {
				this.updateTimer();
			}, 50);
		}

		stop() {
			if (!this.isRecording) return;

			this.mediaRecorder.stop();
			this.isRecording = false;
			this.isPaused = false;

			this.ui.classList.remove('recording');

			this.elapsedTime += Date.now() - this.startTime;
			clearInterval(this.timerInterval);
			this.updateTimer();
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

			let anchor = document.createElement('a');
			anchor.href = dataUrl;
			anchor.download = fullFileName;
			anchor.click();

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
			let totalElapsed;
			if (q.isPaused) {
				totalElapsed = this.elapsedTime;
			} else {
				totalElapsed = this.elapsedTime + (Date.now() - this.startTime);
			}
			let formattedTime = this.formatTime(totalElapsed);
			this.timerDisplay.textContent = formattedTime;
		}

		formatTime(milliseconds) {
			let totalSeconds = Math.floor(milliseconds / 1000);
			let hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
			totalSeconds %= 3600;
			let minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
			let seconds = String(totalSeconds % 60).padStart(2, '0');
			let ms = String(Math.floor((milliseconds % 1000) / 10)).padStart(2, '0');
			return `${hours}:${minutes}:${seconds}:${ms}`;
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
		_rec.wrapper.style.top = `${y}px`;
		_rec.wrapper.style.left = `${x}px`;
		_rec.wrapper.style.display = 'flex';
	};
};
