/*
*	MMM-Nixie-Clock
*	A retro nixie clock with stunning animations
*	By Isaac-the-Man
*	MIT Licensed.
*/
Module.register("MMM-nixie-clock", {
	// default config
	defaults: {

	},
	// global state variables (do not change)
	global: {
		mode: 'clock',
		flipIndex: [],
		resetFlag: false,
		prevTime: [0,0,0,0,0,0],
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
		let h_1, h_2, m_1, m_2, s_1, s_2;
		h_1 = this.createTube(time[0]);
		h_2 = this.createTube(time[1]);
		m_1 = this.createTube(time[2]);
		m_2 = this.createTube(time[3]);
		s_1 = this.createTube(time[4]);
		s_2 = this.createTube(time[5]);
		let dot_1 = this.createDot();
		let dot_2 = this.createDot();
		// append digits
		let display = document.createElement("div");
		display.classList.add("digit_display");
		display.appendChild(h_1);
		display.appendChild(h_2);
		display.appendChild(dot_1);
		display.appendChild(m_1);
		display.appendChild(m_2);
		display.appendChild(dot_2);
		display.appendChild(s_1);
		display.appendChild(s_2);
		// update prev time
		this.global.prevTime = time;
		// return dom
		return display;
	},
	// helper functions
	createTube: function(n) {
		let digit = document.createElement("img");
		digit.src = `${this.data.path}/nixie-digits/${n}.png`;
		digit.classList.add("tube");
		return digit;
	},
	createDot: function() {
		let digit = document.createElement("div");
		digit.classList.add("digit");
		digit.classList.add("dot");
		digit.textContent = ".";
		return digit;
	},
	// convert moment to 6-digit array
	timeToArr: function(now) {
		return [
			this.getFirstDigit(now.hour()),
			this.getSecondDigit(now.hour()),
			this.getFirstDigit(now.minutes()),
			this.getSecondDigit(now.minutes()),
			this.getFirstDigit(now.seconds()),
			this.getSecondDigit(now.seconds()),
		];
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
		let next = now.clone().add(1, 'seconds');
		let nowArr = this.timeToArr(now);
		let nextArr = this.timeToArr(next);
		for (let i = 0; i < 6; i++) {
			if (nextArr[i] < nowArr[i]) {
				flipIndex.push(i);
			}
		}
		return flipIndex;
	},
	// update interval
	getDelay: function() {
		if (this.global.mode === 'clock') {     // normally update very 1s
			return 1000 - moment().milliseconds() + 50;     // offset by 50ms
		} else if (this.global.mode === 'reset') {      // update very 50s (digit-reset animation)
			if (this.global.resetFlag === true) {
				this.global.resetFlag = false;
				return 800 - moment().milliseconds();
			}
			return 50;
		}
	},
});
