Q5.modules.sound = ($, q) => {
	$.Sound = Q5.Sound;
	let sounds = [];

	$.loadSound = (url) => {
		q._preloadCount++;
		let s = new Q5.Sound();
		s.load(url).finally(() => q._preloadCount--);
		sounds.push(s);
		return s;
	};

	$.loadAudio = (url, cb) => {
		q._preloadCount++;
		let a = new Audio(url);
		a.crossOrigin = 'Anonymous';
		a.addEventListener('canplaythrough', () => {
			if (!a.loaded) {
				q._preloadCount--;
				a.loaded = true;
				if (Q5.aud) a.init();
				if (cb) cb(a);
			}
		});
		let preloadSkip = () => {
			a._preloadSkip = true;
			q._preloadCount--;
		};
		a.addEventListener('suspend', preloadSkip);
		a.addEventListener('error', (e) => {
			preloadSkip();
			throw e;
		});
		return a;
	};

	$.getAudioContext = () => Q5.aud;

	$.userStartAudio = () => {
		if (window.AudioContext) {
			if (!Q5.aud) {
				Q5.aud = new window.AudioContext();
				for (let s of sounds) s.init();
			}
			return Q5.aud.resume();
		}
	};
};

Q5.Sound = class {
	constructor() {
		this.loaded = false;
		this.sources = new Set();
	}

	async load(url) {
		this.url = url;
		let res = await fetch(url);
		this.buffer = await res.arrayBuffer();
	}

	async init() {
		this.buffer = await Q5.aud.decodeAudioData(this.buffer);
		this.gainNode = Q5.aud.createGain();
		this.pannerNode = Q5.aud.createStereoPanner();
		this.gainNode.connect(this.pannerNode);
		this.pannerNode.connect(Q5.aud.destination);

		this.loaded = true;
		if (this._volume) this.volume = this._volume;
		if (this._pan) this.pan = this._pan;
	}

	play(time = 0, duration) {
		if (!this.loaded) return;
		const source = Q5.aud.createBufferSource();
		source.buffer = this.buffer;
		source.connect(this.gainNode);
		source.start(0, time, duration);
		this.sources.add(source);
		source.onended = () => this.sources.delete(source);
		return source;
	}

	stop() {
		this.sources.forEach((source) => {
			source.stop();
			this.sources.delete(source);
		});
	}

	set volume(level) {
		if (this.loaded) this.gainNode.gain.value = level;
		else this._volume = level;
	}

	set pan(value) {
		if (this.loaded) this.pannerNode.pan.value = value;
		else this._pan = value;
	}

	set loop(value) {
		this.sources.forEach((source) => (source.loop = loop));
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
		return this.sources.size > 0;
	}
};
