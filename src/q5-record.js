Q5.modules.record = ($, q) => {
	class Q5Recorder {
		constructor(canvas, options = {}) {
			this.canvas = canvas || document.querySelector('canvas');
			if (!this.canvas) {
				throw new Error('Canvas not found');
			}

			this.mediaRecorder = null;
			this.chunks = [];
			this.isRecording = false;
			this.isPaused = false;
			this.stream = this.canvas.captureStream($.getTargetFrameRate());
			this.options = {
				x: options.x,
				y: options.y,
				display: options.x !== undefined || options.y !== undefined ? 'flex' : 'none',
				...options
			};
			this.startTime = null;
			this.timerInterval = null;
			this.elapsedTime = 0;
			this.createUI();
		}

		createUI() {
			document.head.insertAdjacentHTML(
				'afterbegin',
				`<style>
.recorder-wrapper {
	position: absolute;
	top: ${this.options.y}px;
	left: ${this.options.x}px;
	z-index: 1000;
	gap: 7px;
	background: rgb(26, 27, 29);
	padding: 7px;
	border-radius: 30px;
	box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
	border: 2px solid transparent; 
	opacity: 0.5;
	transition: all 0.3s;
	display: ${this.options.display};
	overflow: hidden;
}

.recorder-wrapper:hover {
	opacity: 0.95;
}

.recorder-wrapper.recording {
	border-color: #cc3e44;
}

.recorder-wrapper.recording .start-button {
	color: #cc3e44; 
	opacity: 1;
}

.recorder-wrapper.recording .format-selector,
.recorder-wrapper.recording .download-button {
	width: 0px;
	height: 0px;
	opacity: 0;
	min-width: 0px;
}

.recorder-wrapper button,
.recorder-wrapper select,
.recorder-wrapper .recorder-timer {
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

.recorder-wrapper .recorder-timer {
	min-width: 69px;
	max-width:100px;
}

.recorder-wrapper select {
	max-width:100px;
}

.recorder-wrapper .format-selector {
	min-width: 100px;
}

.recorder-wrapper select:hover,
.recorder-wrapper button:hover {
	background-color: rgb(41, 43, 48);
}

.recorder-wrapper button:disabled {
	opacity: 0.5;
	color: rgb(150, 155, 165);
	cursor: not-allowed;
}

.recorder-wrapper .download-button {
	font-size: 18px;
}
</style>`
			);

			let supportedFormats = [
				{ label: 'H.264', mimeType: 'video/mp4; codecs="avc1.42E01E"' },
				{ label: 'VP9', mimeType: 'video/mp4; codecs=vp9' }
			].filter((format) => MediaRecorder.isTypeSupported(format.mimeType));

			let wrapper = document.createElement('div');
			wrapper.className = 'recorder-wrapper';
			wrapper.innerHTML = `
<button></button><button></button><span class="recorder-timer"></span>`;

			let formatSelector = document.createElement('select');
			for (let format of supportedFormats) {
				let option = document.createElement('option');
				option.value = format.mimeType;
				option.textContent = format.label;
				formatSelector.appendChild(option);
			}
			wrapper.appendChild(formatSelector);

			document.body.appendChild(wrapper);

			this.wrapper = wrapper;
			let recordPauseButton = (this.recordPauseButton = wrapper.children[0]);
			let deleteSaveButton = (this.deleteSaveButton = wrapper.children[1]);
			this.timerDisplay = wrapper.children[2];
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
			this.wrapper.classList.add('recording');

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

			this.wrapper.classList.remove('recording');

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
			_rec = new Q5Recorder($.canvas, { x: undefined, y: undefined });
		}
		if (!$.isRecording) {
			_rec.start(videoSettings);
			$.isRecording = true;
		} else if (_rec.isPaused) {
			_rec.resumeRecording();
		}
	};

	$.pauseRecording = () => {
		if (_rec && $.isRecording && !_rec.isPaused) {
			_rec.pauseRecording();
		}
	};

	$.deleteRecording = () => {
		if (_rec) {
			_rec.deleteRecording();
			$.isRecording = false;
		}
	};

	$.saveRecording = (fileName) => {
		if (_rec) {
			_rec.saveRecording(fileName);
			$.isRecording = false;
		}
	};

	$.createRecorder = (x = 10, y = 10) => {
		if (!_rec) {
			_rec = new Q5Recorder($.canvas, { x, y });
		} else {
			_rec.wrapper.style.top = `${y}px`;
			_rec.wrapper.style.left = `${x}px`;
			_rec.wrapper.style.display = 'flex';
		}
	};
};
