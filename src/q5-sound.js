Q5.modules.sound = ($, p) => {
	$.Sound = Q5.Sound;
	$.loadSound = (path, cb) => {
		p._preloadCount++;
		Q5.aud ??= new window.AudioContext();
		let a = new Q5.Sound(path, cb);
		a.addEventListener('canplaythrough', () => {
			p._preloadCount--;
			if (cb) cb(a);
		});
		return a;
	};
	$.getAudioContext = () => Q5.aud;
	$.userStartAudio = () => Q5.aud.resume();
};

Q5.Sound = class extends Audio {
	constructor(path) {
		super(path);
		let a = this;
		a.load();
		a.panner = Q5.aud.createStereoPanner();
		a.source = Q5.aud.createMediaElementSource(a);
		a.source.connect(a.panner);
		a.panner.connect(Q5.aud.destination);
		Object.defineProperty(a, 'pan', {
			get: () => a.panner.pan.value,
			set: (v) => (a.panner.pan.value = v)
		});
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
};
