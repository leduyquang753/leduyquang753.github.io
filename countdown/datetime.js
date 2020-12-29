export function formatDate(dateTimeIn) {
	let parsed = new Date(dateTimeIn);
	let min = parsed.getMinutes();
	let sec = parsed.getSeconds();
	return parsed.getHours() + (min < 10 ? 'h0' : 'h') + min + (sec < 10 ? ':0' : ':') + sec + "; " + parsed.getDate() + '/' + (parsed.getMonth()+1) + '/' + parsed.getFullYear();
}

export function getEpoch(hour, minute, second, day, month, year, timezone) {
	hour = Math.max(0, hour);
	minute = Math.max(0, minute);
	second = Math.max(0, second);
	year = Math.max(0, Math.floor(year));
	month = Math.max(1, Math.min(12, Math.floor(month)));
	day = Math.max(1, Math.min(getMonthDays(month, year), day));
	timezone = Math.max(-12, Math.min(12, timezone));
	return ((year - 1) * 365 + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) - (isLeapYear(year) && month < 3 ? 2 : 1) + monthPos[month] + day) * 86400000
		+ (hour-timezone) * 3600000 + minute * 60000 + second * 1000 - 62135596800000
}

const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
	monthPos = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

function isLeapYear(year) {
	return year % 4 == 0 && year % 100 != 0 || year % 400 == 0;
}

function getMonthDays(month, year) {
	return month == 2 ? isLeapYear(year) ? 29 : 28 : days[month];
}

// ---------------

const durationFormattingFunctions = [
	[
		(secs) => {
			return Math.floor(secs / 86400) + "d";
		},
		(secs) => {
			return (secs > 86399 ? Math.floor(secs / 86400) + "d" : "") + Math.floor(secs % 86400 / 3600) + "h";
		},
		(secs) => {
			let min = Math.floor(secs % 3600 / 60);
			let hour = Math.floor(secs % 86400 / 3600);
			let day = Math.floor(secs / 86400);
			return (day > 0 ? day + "d" : "") + (secs > 3599 ? hour + "h" : "") + (secs > 3599 && min < 10 ? "0" : "") + min + (secs < 3600 ? "'" : "");
		},
		(secs) => {
			let sec = secs%60;
			let min = Math.floor(secs%3600/60);
			let hour = Math.floor(secs%86400/3600);
			let day = Math.floor(secs/86400);
			
			return (day > 0 ? day + "d" : "") + (secs > 3599 ? hour + "h" : "") + (secs > 59 ? (secs > 3599 && min < 10 ? "0" : "") + min + (sec < 10 ? ":0" : ":") + sec : secs < 60 ? sec + "\"" : "");
		}
	],
	[
		(secs) => {
			return Math.floor(secs / 3600) + "h";
		},
		(secs) => {
			let min = Math.floor(secs % 3600 / 60);
			return (secs > 3599 ? Math.floor(secs / 3599) + "h" : "") + (secs > 3599 && min < 10 ? "0" : "") + min + (secs < 3600 ? "'" : "");
		},
		(secs) => {
			let sec = secs%60;
			let min = Math.floor(secs%3600/60);
			let hour = Math.floor(secs/3600);
			
			return (secs > 3599 ? hour + "h" : "") + (secs > 59 ? (secs > 3599 && min < 10 ? "0" : "") + min + (sec < 10 ? ":0" : ":") + sec : secs < 60 ? sec + "\"" : "");
		}
	],
	[
		(secs) => {
			return Math.floor(secs / 60) + "'";
		},
		(secs) => {
			let sec = secs % 60;
			let min = Math.floor(secs / 60);
			return secs > 59 ? min + (sec < 10 ? ":0" : ":") + sec : secs < 60 ? sec + "\"" : "";
		}
	],
	[
		(secs) => {
			return secs + "\"";
		}
	]
];

export function formatDuration(start = 0, offset = 3, secs) {
	return durationFormattingFunctions[start][offset](secs);
}