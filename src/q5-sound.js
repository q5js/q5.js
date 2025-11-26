Q5.modules.sound = ($, q) => {
	$.Sound = Q5.Sound;
	let sounds = [];

	$.loadSound = (url, cb) => {
		let s = new Q5.Sound();
		sounds.push(s);

		s.promise = (async () => {
			if (s._usedAwait) {
				sounds.splice(sounds.indexOf(s), 1);
				s = new Q5.Sound();
				sounds.push(s);
			}
			let err;
			try {
				await s.load(url);
			} catch (e) {
				err = e;
			}
			delete s.promise;
			delete s.then;
			if (err) throw err;
			if (cb) cb(s);
			return s;
		})();
		$._loaders.push(s.promise);

		s.then = (resolve, reject) => {
			s._usedAwait = true;
			return s.promise.then(resolve, reject);
		};
		return s;
	};

	$.loadAudio = (url, cb) => {
		let a = new Audio(url);
		a._isAudio = true;
		a.crossOrigin = 'Anonymous';
		a.promise = new Promise((resolve, reject) => {
			function loaded() {
				if (!a.loaded) {
					delete a.promise;
					delete a.then;
					if (a._usedAwait) {
						a = new Audio(url);
						a._isAudio = true;
						a.crossOrigin = 'Anonymous';
					}
					a.loaded = true;
					if (cb) cb(a);
					resolve(a);
				}
			}
			a.addEventListener('canplay', loaded);
			a.addEventListener('suspend', loaded);
			a.addEventListener('error', reject);
		});
		$._loaders.push(a.promise);

		a.then = (resolve, reject) => {
			a._usedAwait = true;
			return a.promise.then(resolve, reject);
		};
		return a;
	};

	$.getAudioContext = () => Q5.aud;

	$.userStartAudio = () => {
		if (window.AudioContext) {
			if (Q5._offlineAudio) {
				Q5._offlineAudio = false;
				Q5.aud = new window.AudioContext();
				Q5.soundOut = Q5.aud.createGain();
				Q5.soundOut.connect(Q5.aud.destination);

				for (let inst of Q5.instances) {
					inst._userAudioStarted();
				}
			}
			return Q5.aud.resume();
		}
	};

	$._userAudioStarted = () => {
		for (let s of sounds) s.init();
	};

	$.outputVolume = (level) => {
		if (Q5.soundOut) Q5.soundOut.gain.value = level;
	};
};

if (window.OfflineAudioContext) {
	Q5.aud = new window.OfflineAudioContext(2, 1, 44100);
	Q5._offlineAudio = true;
	Q5.soundOut = Q5.aud.createGain();
	Q5.soundOut.connect(Q5.aud.destination);
}

Q5.Sound = class {
	constructor() {
		this._isSound = true;
		this.sources = new Set();
		this.loaded = this.paused = false;
	}

	async load(url) {
		this.url = url;
		let res = await fetch(url);
		this.buffer = await res.arrayBuffer();
		this.buffer = await Q5.aud.decodeAudioData(this.buffer);
		if (Q5.aud) this.init();
	}

	init() {
		if (!this.buffer.length) return;

		this.gainNode = Q5.aud.createGain();
		this.pannerNode = Q5.aud.createStereoPanner();
		this.gainNode.connect(this.pannerNode);
		this.pannerNode.connect(Q5.soundOut);

		this.loaded = true;
		if (this._volume) this.volume = this._volume;
		if (this._pan) this.pan = this._pan;
	}

	_newSource(offset, duration) {
		let source = Q5.aud.createBufferSource();
		source.buffer = this.buffer;
		source.connect(this.gainNode);
		source.loop = this._loop;

		source._startedAt = Q5.aud.currentTime;
		source._offset = offset;
		source._duration = duration;

		source.start(0, source._offset, source._duration);

		this.sources.add(source);
		source.onended = () => {
			if (!this.paused) {
				this.ended = true;
				if (this._onended) this._onended();
				this.sources.delete(source);
			}
		};
	}

	play(time = 0, duration) {
		if (!this.loaded) return;

		if (!this.paused) {
			this._newSource(time, duration);
		} else {
			let timings = [];
			for (let source of this.sources) {
				timings.push(source._offset, source._duration);
				this.sources.delete(source);
			}
			for (let i = 0; i < timings.length; i += 2) {
				this._newSource(timings[i], timings[i + 1]);
			}
		}

		this.paused = this.ended = false;
	}

	pause() {
		if (!this.isPlaying()) return;

		for (let source of this.sources) {
			source.stop();
			let timePassed = Q5.aud.currentTime - source._startedAt;
			source._offset += timePassed;
			if (source._duration) source._duration -= timePassed;
		}
		this.paused = true;
	}

	stop() {
		for (let source of this.sources) {
			source.stop();
			this.sources.delete(source);
		}
		this.paused = false;
		this.ended = true;
	}

	get volume() {
		return this._volume;
	}
	set volume(level) {
		if (this.loaded) this.gainNode.gain.value = level;
		this._volume = level;
	}

	get pan() {
		return this._pan;
	}
	set pan(value) {
		if (this.loaded) this.pannerNode.pan.value = value;
		this._pan = value;
	}

	get loop() {
		return this._loop;
	}
	set loop(value) {
		this.sources.forEach((source) => (source.loop = value));
		this._loop = value;
	}

	get playing() {
		return !this.paused && this.sources.size > 0;
	}

	// backwards compatibility
	setVolume(level) {
		this.volume = level;
	}
	setPan(value) {
		this.pan = value;
	}
	setLoop(loop) {
		this.loop = loop;
	}
	isLoaded() {
		return this.loaded;
	}
	isPlaying() {
		return this.playing;
	}
	isPaused() {
		return this.paused;
	}
	isLooping() {
		return this._loop;
	}
	onended(cb) {
		this._onended = cb;
	}
};
