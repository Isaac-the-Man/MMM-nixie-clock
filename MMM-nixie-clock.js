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
		displayDateInterval: 2,	// When to display date, every 2 minutes, 0 = don't display date
		displayDateTime: 3,	// Display date for 3 seconds
		tz: 'default',		// Timezone (e.g. "America/New_York"), set to "default" for local time
		tz_title: 'default'	// Timezone title, can be set to arbitrary string, set to empty string to disable, set to "default" to display the default timezone string, only works if timezone is set to non-default.
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
		return ["moment.js", "moment-timezone-with-data.js"];
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
			this.config.size = this.defaults.size;
		}
		// config: reflection
		if (typeof this.config.reflection !== "boolean") {
			Log.info("Invalid option \"reflection\". Using default value \"true\".");
			this.config.reflection = this.defaults.size;
		}
		// config: timeFormat
		if (![12, 24].includes(this.config.timeFormat)) {
			Log.info("Invalid timeFormat \"" + this.config.timeFormat + "\". Using defualt timeFormat \"24\".");
			this.config.timeFormat = this.defaults.timeFormat;
		}
		// config: displaySeconds
		if (typeof this.config.displaySeconds !== "boolean") {
			Log.info("Invalid option \"displaySeconds\". Using defualt value \"true\".");
			this.config.displaySeconds = this.defaults.displaySeconds;
		}
		// config: displayDateInterval
		if (typeof this.config.displayDateInterval !== "number" || this.config.displayDateInterval % 1 !== 0 || this.config.displayDateInterval < 0 || this.config.displayDateInterval > 5) {
			Log.info("Invalid displayDateInterval \"" + this.config.displayDateInterval + "\". Using default  \"2\".");
			this.config.displayDateInterval = this.defaults.displayDateInterval;
		}
		// config: displayDateTime
		if (this.config.displayDateInterval === 0) {
			this.config.displayDateTime = 0;
		} else if (typeof this.config.displayDateTime !== "number" || this.config.displayDateTime % 1 !== 0 || this.config.displayTime <= 0 || this.config.displayDateTime > 3) {
			Log.info("Invalid displayDateTime \"" + this.config.displayDateTime + "\". Using default  \"3\".");
			this.config.displayDateTime = this.config.displayDateTime;
		}
		// config: tz (timezone)
		if (typeof this.config.tz !== "string") {
			Log.info("Invalid timezone + \"" + this.config.tz + "\". Using default timezone.");
			this.config.tz = this.defaults.tz;
		}
		// config: tz_title (timezone title)
		if (typeof this.config.tz_title !== "string") {
			Log.info("Invalid timezone title \"" + this.config.tz_title + "\". Using default value.")
			this.config.tz_title = this.defaults.tz_title;
		}
		
		// kickstart clock
		let self = this;
		function clockUpdate() {
			self.updateDom();

			// check to trigger digit-reset animation
			if ((self.global.mode === 'clock') || (self.global.mode === 'date')) {
				self.global.flipIndex = self.checkFlip(self.getMoment());
			}
			if (((self.global.mode === 'clock') || (self.global.mode === 'date')) && self.global.flipIndex.length > 0) {
				let prevMode = self.global.mode;
				self.global.mode = 'reset';
				self.global.resetFlag = true;
				self.global.flipIndex.forEach((i) => {
					self.global.prevTime[i] = 9;	// start digit-reset at 9
				});
				// change non-resetting digits
				if ((self.config.displaySeconds) || (prevMode === 'date')) {
					setTimeout(() => {
						for (let i = 0; i < 6; i++) {
							if (!self.global.flipIndex.includes(i)) {
								self.global.prevTime[i] = self.global.nextTime[i];
							}
						}
					}, 1000 - self.getMoment().milliseconds() + 50);
				} else {
					setTimeout(() => {
						for (let i = 0; i < 4; i++) {
							if (!self.global.flipIndex.includes(i)) {
								self.global.prevTime[i] = self.global.nextTime[i];
							}
						}
					}, (60 - self.getMoment().seconds())*1000 - self.getMoment().milliseconds() + 50);
				}
			}

			setTimeout(clockUpdate, self.getDelay());
		}
		clockUpdate();
	},
	// refresh DOM
	getDom: function() {
		// get time
		let now = this.getMoment();
		let time = this.getTime(now);
		// check if digit-reset
		if (this.global.mode === 'reset') {
			let flipN;
			this.global.flipIndex.forEach((i) => {
				flipN = --time[i];
			});
			if (flipN === 0) {	// check when to end digit-reset
				if ((this.config.displayDateInterval !== 0) && (now.seconds() >= 0) && (now.seconds() <= this.config.displayDateTime) && (now.minutes() % this.config.displayDateInterval === 0)) {
					this.global.mode = 'date';
					time = this.getTime(now);
				} else {
					this.global.mode = 'clock';
					time = this.getTime(now);
					// calibrate 12:00 PM to 01:00 PM in 12hr mode
					if (this.config.timeFormat === 12 && this.getMoment().hour() === 13) {
						time[1] = 1;	// was 0 originally
					}
				}
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
		let container = document.createElement("div");	// parent container
		if (this.config.tz !== "default" && this.config.tz_title !== "") {
			// only show timezone title if tz is specified
			let tz_title = document.createElement("div");	// timezone title
			if (this.config.tz_title === "default") {
				tz_title.innerHTML = this.config.tz;
			} else {
				tz_title.innerHTML = this.config.tz_title;
			}
			tz_title.classList.add("timezone-title");
			container.appendChild(tz_title)
		}
		let display = document.createElement("div");	// nixie tube wrapper
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
		container.appendChild(display);
		// update prev time
		this.global.prevTime = time;
		// return dom
		return container;
	},
	// helper functions
	getMoment: function() {
		if (this.config.tz !== "default") {
			return moment().tz(this.config.tz)
		}
		return moment()
	},
	createTube: function(n) {
		let digit = document.createElement("img");
		digit.src = `${this.data.path}/nixie-digits/${this.config.size}/${n}.png`;
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
	// convert moment to 6-digit array
	dateToArr: function(now) {
		if (this.config.displaySeconds) {
			return [
				this.getFirstDigit(now.date()),
				this.getSecondDigit(now.date()),
				this.getFirstDigit(now.month()+1),
				this.getSecondDigit(now.month()+1),
				this.getFirstDigit(now.year() % 100),
				this.getSecondDigit(now.year() % 100),
			];
		} else {
			return [
				this.getFirstDigit(now.date()),
				this.getSecondDigit(now.date()),
				this.getFirstDigit(now.month()+1),
				this.getSecondDigit(now.month()+1),
			];
		}
	},
	// get 6-digit time
	getTime: function(now) {
		if ((this.global.mode === 'clock') || ((this.global.mode === 'date') && (now.seconds() > this.config.displayDateTime))) {
			return this.timeToArr(now);
		} else if ((this.global.mode === 'date') || ((this.global.mode === 'clock') && (this.config.displayDateInterval !== 0) && (now.minutes() % this.global.displayDateInterval === 0) && (now.seconds() >= 0) && (now.seconds() <= this.config.displayDateTime))) {
			return this.dateToArr(now);
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
		let seconds = (now.seconds() + 1) % 60;
		let minutes = now.minutes() + ((seconds === 0) ? 1 : 0);
		let next;
		if (this.config.displaySeconds) {
			next = now.clone().add(1, 'seconds');
		} else {
			next = now.clone().add(1, 'minutes');
		}
		if ((this.global.mode === 'date') && (seconds > this.config.displayDateTime)) {
			this.global.mode = 'clock';
			let nextArr = this.timeToArr(next);
			this.global.nextTime = nextArr;
			for (let i = 0; i < (this.config.displaySeconds ? 6 : 4); i++) {
				flipIndex.push(i);
			}
		} else if (this.global.mode === 'clock') {
			if ((this.config.displayDateInterval !== 0) && (seconds >= 0) && (seconds <= this.config.displayDateTime) && (minutes % this.config.displayDateInterval === 0)) {
				this.global.mode = 'date';
				let nextArr = this.dateToArr(next);
				this.global.nextTime = nextArr;
				for (let i = 0; i < (this.config.displaySeconds ? 6 : 4); i++) {
					flipIndex.push(i);
				}
			} else {
				let nextArr = this.timeToArr(next);
				this.global.nextTime = nextArr;
				let nowArr = this.timeToArr(now);
				for (let i = 0; i < (this.config.displaySeconds ? 6 : 4); i++) {
					if (nextArr[i] < nowArr[i]) {
						flipIndex.push(i);
					}
				}
			}
		}
		return flipIndex;
	},
	// update interval
	getDelay: function() {
		if (this.global.mode === 'clock') {
			if (this.config.displaySeconds) {	// update every second
				return 1000 - this.getMoment().milliseconds() + 50;		// offset by 50ms
			} else {	// update every minute
				return (60 - this.getMoment().seconds())*1000 - this.getMoment().milliseconds() + 50;
			}
		} else if (this.global.mode === 'date') {
			return 1000 - this.getMoment().milliseconds() + 50;		// offset by 50ms
		} else if (this.global.mode === 'reset') {      // update very 50s (digit-reset animation)
			if (this.global.resetFlag === true) {
				this.global.resetFlag = false;
				if (this.config.displaySeconds) {
					return 800 - this.getMoment().milliseconds();
				} else {
					return (59 - this.getMoment().seconds())*1000 + 800 - this.getMoment().milliseconds();
				}
			}
			return 50;
		}
	}
});
