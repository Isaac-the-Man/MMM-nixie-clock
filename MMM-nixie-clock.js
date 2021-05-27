/*
*	MMM-Nixie-Clock
*	A retro nixie clock with stunning animations
*	By Isaac-the-Man
*	MIT Licensed.
*/
Module.register("MMM-nixie-clock", {
	// default config
	defaults: {
		size: 'large',		// mini, small, medium, large
		reflection: true,	// show clock reflection or not
		timeFormat: 24,		// 12 or 24 hour display
		displaySeconds: true,	// 6 digit (true) or 4 digit clock (false)
	},
	// global state variables (do not change)
	global: {
		mode: 'clock',
		flipIndex: [],
		resetFlag: false,
		prevTime: [0,0,0,0,0,0],
		nextTime: [0,0,0,0,0,0],
	},
	// required scripts
	getScripts: function() {
		return ["moment.js"];
	},
	// required styles
	getStyles: function() {
		return [this.file("./css/default.css")];
	},
	// start
	start: function() {
		Log.info("Starting module: " + this.name);

		// validate config
		// config: size
		if (!['mini', 'small', 'medium', 'large'].includes(this.config.size)) {
			Log.info("Invalide size \"" + size + "\". Using default size \"large\".");
			this.config.size = large;
		}
		// config: reflection
		if (typeof this.config.reflection !== "boolean") {
			Log.info("Invalid option \"reflection\". Using default value \"true\".");
			this.config.reflection = true;
		}
		// config: timeFormat
		if (![12, 24].includes(this.config.timeFormat)) {
			Log.info("Invalid timeFormat \"" + this.config.timeFormat + "\". Using defualt timeFormat \"24\".");
			this.config.timeFormat = 24;
		}
		// config: displaySeconds
		if (typeof this.config.displaySeconds !== "boolean") {
			Log.info("Invalid option \"displaySeconds\". Using defualt value \"true\".");
			this.config.displaySeconds = true;
		}

		// kickstart clock
		let self = this;
		let clockUpdate = function() {
			self.updateDom();

			// check to trigger digit-reset animation
			if (self.global.mode === 'clock') {
				self.global.flipIndex = self.checkFlip(moment());
			}
			if (self.global.mode === 'clock' && self.global.flipIndex.length > 0) {
				self.global.mode = 'reset';
				self.global.resetFlag = true;
				self.global.flipIndex.forEach((i) => {
					self.global.prevTime[i] = 9;	// start digit-reset at 9
				});
				// change non-resetting digits
				setTimeout(() => {
					for (let i = 0; i < 6; i++) {
						if (!self.global.flipIndex.includes(i)) {
							self.global.prevTime[i] = self.global.nextTime[i];
						}
					}
				}, 1000 - moment().milliseconds() + 50);
			}

			setTimeout(clockUpdate, self.getDelay());
		}
		clockUpdate();
	},
	// refresh DOM
	getDom: function() {
		// get time
		let time = this.getTime();
		// check if digit-reset
		if (this.global.mode === 'reset') {
			let flipN;
			this.global.flipIndex.forEach((i) => {
				flipN = --time[i];
			});
			if (flipN === 0) {	// check when to end digit-reset
				this.global.mode = 'clock';
			}
		}
		// create digits
		let h_1, h_2, m_1, m_2, s_1, s_2, dot_1, dot_2;
		h_1 = this.createTube(time[0]);
		h_2 = this.createTube(time[1]);
		m_1 = this.createTube(time[2]);
		m_2 = this.createTube(time[3]);
		if (this.config.displaySeconds) {
			s_1 = this.createTube(time[4]);
			s_2 = this.createTube(time[5]);
			dot_2 = this.createDot();
		}
		dot_1 = this.createDot();
		// append digits
		let display = document.createElement("div");
		display.classList.add("digit_display");
		display.appendChild(h_1);
		display.appendChild(h_2);
		display.appendChild(dot_1);
		display.appendChild(m_1);
		display.appendChild(m_2);
		if (this.config.displaySeconds) {
			display.appendChild(dot_2);
			display.appendChild(s_1);
			display.appendChild(s_2);
		}
		// update prev time
		this.global.prevTime = time;
		// return dom
		return display;
	},
	// helper functions
	createTube: function(n) {
		let digit = document.createElement("img");
		digit.src = `${this.data.path}/nixie-digits/${n}.png`;
		if (this.config.reflection) {
			digit.classList.add("reflect");
		}
		digit.classList.add("tube-" + this.config.size);
		return digit;
	},
	createDot: function() {
		let digit = document.createElement("div");
		digit.classList.add("digit");
		if (this.config.reflection) {
			digit.classList.add("reflect");
		}
		digit.classList.add("dot-" + this.config.size);
		digit.textContent = ".";
		return digit;
	},
	// convert moment to 6-digit array
	timeToArr: function(now) {
		if (this.config.displaySeconds) {
			return [
				this.getFirstDigit(now.hour() > 12 ? now.hour() % this.config.timeFormat : now.hour()),
				this.getSecondDigit(now.hour() > 12 ? now.hour() % this.config.timeFormat : now.hour()),
				this.getFirstDigit(now.minutes()),
				this.getSecondDigit(now.minutes()),
				this.getFirstDigit(now.seconds()),
				this.getSecondDigit(now.seconds()),
			];
		} else {
			return [
				this.getFirstDigit(now.hour() > 12 ? now.hour() % this.config.timeFormat : now.hour()),
				this.getSecondDigit(now.hour() > 12 ? now.hour() % this.config.timeFormat : now.hour()),
				this.getFirstDigit(now.minutes()),
				this.getSecondDigit(now.minutes()),
			];
		}
	},
	// get 6-digit time
	getTime: function() {
		if (this.global.mode === 'clock') {
			let now = moment();
			return this.timeToArr(now);
		} else if (this.global.mode === 'reset') {
			return this.global.prevTime;
		}
	},
	getFirstDigit: function(n) {
		if (n > 9) {
			return Math.floor(n/10);
		}
		return 0;
	},
	getSecondDigit: function(n) {
		return n % 10;
	},
	// check which digit will flip
	checkFlip: function(now) {
		let flipIndex = [];
		let next;
		if (this.config.displaySeconds) {
			next = now.clone().add(1, 'seconds');
		} else {
			next = now.clone().add(1, 'minutes');
		}
		let nowArr = this.timeToArr(now);
		let nextArr = this.timeToArr(next);
		this.global.nextTime = nextArr;
		for (let i = 0; i < (this.config.displaySeconds ? 6 : 4); i++) {
			if (nextArr[i] < nowArr[i]) {
				flipIndex.push(i);
			}
		}
		return flipIndex;
	},
	// update interval
	getDelay: function() {
		if (this.global.mode === 'clock') {
			if (this.config.displaySeconds) {	// update every second
				return 1000 - moment().milliseconds() + 50;		// offset by 50ms
			} else {	// update every minute
				return (60 - moment().seconds())*1000 - moment().milliseconds() + 50;
			}
		} else if (this.global.mode === 'reset') {      // update very 50s (digit-reset animation)
			if (this.global.resetFlag === true) {
				this.global.resetFlag = false;
				if (this.config.displaySeconds) {
					return 800 - moment().milliseconds();
				} else {
					return (59 - moment().seconds())*1000 + 800 - moment().milliseconds();
				}
			}
			return 50;
		}
	},
});
