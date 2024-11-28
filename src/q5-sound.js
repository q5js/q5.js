Q5.modules.sound = ($, q) => {
	$.Sound = Q5.Sound;

	let sounds = [];

	$.loadSound = (path, cb) => {
		q._preloadCount++;
		let s = new Q5.Sound(path, cb);
		s.crossOrigin = 'Anonymous';
		s.addEventListener('canplaythrough', () => {
			if (!s.loaded) {
				q._preloadCount--;
				s.loaded = true;
				if (Q5.aud) s.init();
				if (cb) cb(s);
			}
		});
		sounds.push(s);
		return s;
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

if (window.Audio) {
	Q5.Sound ??= class extends Audio {
		init() {
			let s = this;
			s.panner = Q5.aud.createStereoPanner();
			s.source = Q5.aud.createMediaElementSource(s);
			s.source.connect(s.panner);
			s.panner.connect(Q5.aud.destination);
			let pan = s.pan;
			Object.defineProperty(s, 'pan', {
				get: () => s.panner.pan.value,
				set: (v) => (s.panner.pan.value = v)
			});
			if (pan) s.pan = pan;
		}
		setVolume(level) {
			this.volume = level;
		}
		setLoop(loop) {
			this.loop = loop;
		}
		setPan(value) {
			this.pan = value;
		}
		isLoaded() {
			return this.loaded;
		}
		isPlaying() {
			return !this.paused;
		}
	};
}
