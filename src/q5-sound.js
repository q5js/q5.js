Q5.modules.sound = ($) => {
	$.loadSound = (path, cb) => {
		$._preloadCount++;
		$.aud ??= new window.AudioContext();
		let a = new Audio(path);
		a.addEventListener('canplaythrough', () => {
			$._preloadCount--;
			if (cb) cb(a);
		});
		a.load();
		a.setVolume = (l) => (a.volume = l);
		a.setLoop = (l) => (a.loop = l);
		a.panner = $.aud.createStereoPanner();
		a.source = $.aud.createMediaElementSource(a);
		a.source.connect(a.panner);
		a.panner.connect($.aud.destination);
		Object.defineProperty(a, 'pan', {
			get: () => a.panner.pan.value,
			set: (v) => (a.panner.pan.value = v)
		});
		a.setPan = (v) => (a.pan = v);
		return a;
	};
	$.getAudioContext = () => $.aud;
	$.userStartAudio = () => $.aud.resume();
};
