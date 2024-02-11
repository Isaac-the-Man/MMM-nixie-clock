# MMM-nixie-clock
Retro nixie clock display for [MagicMirror²](https://github.com/MichMich/MagicMirror).

![Nixie](https://raw.githubusercontent.com/Isaac-the-Man/MMM-nixie-clock/master/screenshots/nixie.PNG)

There's also a digit reset animation.

![DigitReset](https://github.com/Isaac-the-Man/MMM-nixie-clock/blob/master/screenshots/digit-reset.gif?raw=true)

## Configuration

There are four configurable options:
| option | description | default |
|--------|-------------|---------|
| size | `'mini'`, `'small'`, `'medium'`, or `'large'`. | `'large'` |
| reflection | set `false` to turn off reflection effect. | `true` |
| timeFormat | `12` hour or `24` hour display. | `24` |
| displaySeconds | `true` for a 6-digit clock or `false` for a 4-digit clock. | `true` |
| displayDateInterval | integer value >=0 and <=5 to set how often the date will be displayed in minutes (for example 2 is every other minute), 0 means do not display the date. | `2` |
| displayDateTime | integer value >0 and <=3 to set the time the date will be displayed at the start of the minute. | `3` |
| tz | moment.js timezone string (e.g. `'America/New_York'`). | `'default'` |
| tz_title | timezone title display, default to timezone string, set to empty string to disable. | `'default'` |

Sample config file (default):
```js
var config = {
  modules: [
    {
      module: 'MMM-nixie-clock',
      position: 'middle_center',
      config: {
        size: 'large',
        reflection: true,
        timeFormat: 24,
        displaySeconds: true,
        displayDateInterval: 2,
        displayDateTime: 3,
	tz: 'default',
	tz_title: 'default'
      }
    }
  ]
}
```

All image credit to [Dalibor Farny](https://www.daliborfarny.com/).
