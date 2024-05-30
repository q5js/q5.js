Q5.modules.sound = ($) => {
	$.loadSound = (path, cb) => {
		$._preloadCount++;
		let a = new Audio(path);
		a.addEventListener('canplaythrough', () => {
			$._preloadCount--;
			if (cb) cb(a);
		});
		a.load();
		a.setVolume = (l) => (a.volume = l);
		a.setLoop = (l) => (a.loop = l);
		return a;
	};
	$.getAudioContext = () => $.audioContext;
	$.userStartAudio = () => {
		$.audioContext ??= new window.AudioContext();
		return $.audioContext.resume();
	};
};
