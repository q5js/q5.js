Q5.modules.dom = ($, q) => {
	$.elementMode = (mode) => ($._elementMode = mode);

	$.createElement = (tag, content) => {
		let el = document.createElement(tag);

		if ($._elementMode == 'center') {
			el.style.transform = 'translate(-50%, -50%)';
		}

		if (content) el.innerHTML = content;

		Object.defineProperty(el, 'x', {
			get: () => el._x,
			set: (v) => {
				let pos = el.style.position;
				if (!pos || pos == 'relative') {
					el.style.position = 'absolute';
				}
				let x = $.canvas.offsetLeft + v;
				el.style.left = x + 'px';
				el._x = x;
			}
		});

		Object.defineProperty(el, 'y', {
			get: () => el._y,
			set: (v) => {
				let pos = el.style.position;
				if (!pos || pos == 'relative') {
					el.style.position = 'absolute';
				}
				let y = $.canvas.offsetTop + v;
				el.style.top = y + 'px';
				el._y = y;
			}
		});

		Object.defineProperty(el, 'width', {
			get: () => parseFloat(el.style.width || 0),
			set: (v) => (el.style.width = v + 'px')
		});

		Object.defineProperty(el, 'height', {
			get: () => parseFloat(el.style.height || 0),
			set: (v) => (el.style.height = v + 'px')
		});

		el.position = (x, y, scheme) => {
			if (scheme) el.style.position = scheme;
			el.x = x;
			el.y = y;
			return el;
		};

		// the existing size property of input elements must be overwritten
		Object.defineProperty(el, 'size', {
			writable: true
		});

		el.size = (w, h) => {
			el.width = w;
			el.height = h;
			return el;
		};

		el.center = () => {
			el.style.position = 'absolute';
			el.x = $.canvas.hw;
			el.y = $.canvas.hh;
			return el;
		};

		el.show = () => {
			el.style.display = '';
			return el;
		};

		el.hide = () => {
			el.style.display = 'none';
			return el;
		};

		el.parent = (parent) => {
			parent.append(el);
			return el;
		};

		$._addEventMethods(el);

		$._elements.push(el);
		if ($.canvas) $.canvas.parentElement.append(el);
		else document.body.append(el);

		el.elt = el; // p5 compat

		return el;
	};
	$.createEl = $.createElement;

	$._addEventMethods = (el) => {
		let l = el.addEventListener;
		el.mousePressed = (cb) => l('mousedown', cb);
		el.mouseReleased = (cb) => l('mouseup', cb);
		el.mouseClicked = (cb) => l('click', cb);
		el.mouseMoved = (cb) => l('mousemove', cb);
		el.mouseWheel = (cb) => l('wheel', cb);
	};

	$.createA = (href, content, newTab) => {
		let el = $.createEl('a', content);
		el.href = href;
		el.target = newTab ? '_blank' : '_self';
		return el;
	};

	$.createButton = (content) => $.createEl('button', content);

	$.createCheckbox = (label = '', checked = false) => {
		let el = $.createEl('input');
		el.type = 'checkbox';
		el.checked = checked;
		let lbl = $.createEl('label', label);
		lbl.addEventListener('click', () => {
			el.checked = !el.checked;
			el.dispatchEvent(new Event('input', { bubbles: true }));
			el.dispatchEvent(new Event('change', { bubbles: true }));
		});
		el.insertAdjacentElement('afterend', lbl);
		el.label = lbl;
		return el;
	};

	$.createColorPicker = (value = '#ffffff') => {
		let el = $.createEl('input');
		el.type = 'color';
		el.value = value.toString();
		return el;
	};

	$.createDiv = (content) => $.createEl('div', content);

	$.createImg = (src) => {
		let el = $.createEl('img');
		el.crossOrigin = 'anonymous';
		el.src = src;
		return el;
	};

	$.createInput = (value = '', type = 'text') => {
		let el = $.createEl('input');
		el.value = value;
		el.type = type;
		el.style.boxSizing = 'border-box';
		return el;
	};

	$.createP = (content) => $.createEl('p', content);

	let radioCount = 0;
	$.createRadio = (name) => {
		let el = $.createEl('div');
		el.name = name || 'radio' + radioCount++;
		el.buttons = [];
		Object.defineProperty(el, 'value', {
			get: () => el.selected?.value,
			set: (v) => {
				let btn = el.buttons.find((b) => b.value == v);
				if (btn) {
					btn.checked = true;
					el.selected = btn;
				}
			}
		});
		el.option = (label, value) => {
			let btn = $.createEl('input');
			btn.type = 'radio';
			btn.name = el.name;
			btn.value = value || label;
			btn.addEventListener('input', () => (el.selected = btn));

			let lbl = $.createEl('label', label);
			lbl.addEventListener('click', () => {
				btn.checked = true;
				el.selected = btn;
				btn.dispatchEvent(new Event('input', { bubbles: true }));
				btn.dispatchEvent(new Event('change', { bubbles: true }));
			});

			btn.label = lbl;
			el.append(btn);
			el.append(lbl);
			el.buttons.push(btn);
			return el;
		};

		return el;
	};

	$.createSelect = (placeholder) => {
		let el = $.createEl('select');
		if (placeholder) {
			let opt = $.createEl('option', placeholder);
			opt.disabled = true;
			opt.selected = true;
			el.append(opt);
		}
		Object.defineProperty(el, 'selected', {
			get: () => {
				if (el.multiple) {
					return Array.from(el.selectedOptions).map((opt) => opt.textContent);
				}
				return el.selectedOptions[0]?.textContent;
			},
			set: (v) => {
				if (el.multiple) {
					Array.from(el.options).forEach((opt) => {
						opt.selected = v.includes(opt.textContent);
					});
				} else {
					const option = Array.from(el.options).find((opt) => opt.textContent === v);
					if (option) option.selected = true;
				}
			}
		});
		Object.defineProperty(el, 'value', {
			get: () => {
				if (el.multiple) {
					return Array.from(el.selectedOptions).map((o) => o.value);
				}
				return el.selectedOptions[0]?.value;
			},
			set: (v) => {
				if (el.multiple) {
					el.options.forEach((o) => (o.selected = v.includes(o.value)));
				} else {
					let opt;
					for (let i = 0; i < el.options.length; i++) {
						if (el.options[i].value == v) {
							opt = el.options[i];
							break;
						}
					}
					if (opt) opt.selected = true;
				}
			}
		});
		el.option = (label, value) => {
			let opt = $.createEl('option', label);
			opt.value = value || label;
			el.append(opt);
			return el;
		};
		return el;
	};

	$.createSlider = (min, max, value, step) => {
		let el = $.createEl('input');
		el.type = 'range';
		el.min = min;
		el.max = max;
		el.value = value;
		el.step = step;
		el.val = () => parseFloat(el.value);
		return el;
	};

	$.createSpan = (content) => $.createEl('span', content);

	$.createVideo = (src) => {
		let el = $.createEl('video');
		el.crossOrigin = 'anonymous';

		el._load = () => {
			el.width ||= el.videoWidth;
			el.height ||= el.videoHeight;
			el.defaultWidth = el.width * $._defaultImageScale;
			el.defaultHeight = el.height * $._defaultImageScale;
			el.ready = true;
		};

		if (src) {
			el.promise = new Promise((resolve) => {
				el.addEventListener('loadeddata', () => {
					el._load();
					resolve(el);
				});
				el.src = src;
			});
			$._preloadPromises.push(el.promise);

			if (!$._usePreload) return el.promise;
		}
		return el;
	};

	$.createCapture = function (type, flipped = true, cb) {
		let constraints = typeof type == 'string' ? { [type]: true } : type || { video: true, audio: true };

		if (constraints.video === true) {
			// basically request the highest resolution possible
			constraints.video = { width: 3840, height: 2160 };
		}
		constraints.video.facingMode ??= 'user';

		let vid = $.createVideo();
		vid.playsinline = vid.autoplay = true;
		if (flipped) {
			vid.flipped = true;
			vid.style.transform = 'scale(-1, 1)';
		}
		vid.loadPixels = () => {
			let g = $.createGraphics(vid.videoWidth, vid.videoHeight, { renderer: 'c2d' });
			g.image(vid, 0, 0);
			g.loadPixels();
			vid.pixels = g.pixels;
			g.remove();
		};
		vid.promise = (async () => {
			let stream;
			try {
				stream = await navigator.mediaDevices.getUserMedia(constraints);
			} catch (e) {
				throw e;
			}

			vid.srcObject = stream;
			await new Promise((resolve) => vid.addEventListener('loadeddata', resolve));

			vid._load();
			if (cb) cb(vid);
			return vid;
		})();
		$._preloadPromises.push(vid.promise);

		if (!$._usePreload) return vid.promise;
		return vid;
	};

	$.findElement = (selector) => document.querySelector(selector);
	$.findElements = (selector) => document.querySelectorAll(selector);
};
