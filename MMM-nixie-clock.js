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

		// update interval 1s
		let getDelay = function() {
			return 1000 - moment().milliseconds() + 50;	// offset by 50ms
		}

		// kickstart clock
		let self = this;
		let clockUpdate = function() {
			self.updateDom();
			setTimeout(clockUpdate, getDelay)
		}
		clockUpdate();
	},
	// refresh DOM
	getDom: function() {
		// get time
		let time = this.getTime();
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
	// get 6-digit time
	getTime: function() {
		let now = moment();
		return [
			this.getFirstDigit(now.hour()), 
			this.getSecondDigit(now.hour()),
			this.getFirstDigit(now.minutes()), 
			this.getSecondDigit(now.minutes()),
			this.getFirstDigit(now.seconds()), 
			this.getSecondDigit(now.seconds()),
		];
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
});
