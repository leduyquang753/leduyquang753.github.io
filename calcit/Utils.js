import { ExpressionInvalidException } from "./ExpressionInvalidException.js";

const
	degInRad = Math.PI / 180,
	radInDeg = 180 / Math.PI,
	degInGrad = 10 / 9,
	gradInDeg = 0.9,
	gradInRad = Math.PI / 200,
	radInGrad = 200 / Math.PI;

export function power(baseNum, exponent, engine) {
	if (baseNum == 0) if (exponent > 0) return 0; else throw new ExpressionInvalidException("divisionByZero");
	if (exponent < 0) return 1 / Math.pow(baseNum, -exponent);
	let roundedExponent = Math.round(exponent);
	if (Math.abs(roundedExponent - exponent) < 1E-11)
		return baseNum > 0 || mod(roundedExponent, 2) == 0 ? Math.pow(baseNum, roundedExponent) : -Math.pow(-baseNum, roundedExponent);
	else if (baseNum > 0) return Math.pow(baseNum, exponent); else throw new ExpressionInvalidException("unsupportedExponentiation", [formatNumber(baseNum, engine), formatNumber(exponent, engine)]);
}

export function degToRad(degs) {
	return degInRad * degs;
}

export function radToDeg(rads) {
	return radInDeg * rads;
}

export function degToGrad(degs) {
	return degInGrad * degs;
}

export function gradToDeg(grads) {
	return gradInDeg * grads;
}

export function radToGrad(rads) {
	return radInGrad * rads;
}

export function gradToRad(grads) {
	return gradInRad * grads;
}

export function div(dividend, divisor) {
	return Math.floor(dividend / divisor);
}

export function mod(dividend, divisor) {
	return dividend % divisor;
}

export function roundUp(num) {
	return num >= 0 ? Math.ceil(num) : Math.floor(num);
}

export function roundDown(num) {
	return num >= 0 ? Math.floor(num) : Math.ceil(num);
}

const internalNumberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 10 });

export function getFormattedNumberInternal(number, engine, mulSign) {
	let toReturn = internalNumberFormat.format(number).replace(/,/g, " ").replace(/E/g, mulSign + "10^");
	if (!engine.decimalDot) toReturn = toReturn.replace(/\./g, ",");
	if (engine.thousandDot) toReturn = toReturn.replace(/ /g, engine.decimalDot ? "," : ".");
	return toReturn;
}

export function formatNumber(number, engine) {
	try {
		let mulSign = engine.mulAsterisk || engine.decimalDot || (!engine.decimalDot && engine.thousandDot) ? '*' : '.';
		let toReturn;
		let log = Math.log10(Math.abs(number));
		if (number != 0 && (log <= -7 || log >= 18))
		{
			let exponent = Math.floor(Math.log10(Math.abs(number)) / 3) * 3;
			let displayedNumber = number * Math.pow(10, -exponent);
			if (isNaN(displayedNumber)) return null;
			toReturn = getFormattedNumberInternal(displayedNumber, engine, mulSign);
			return exponent == 0 ? toReturn : toReturn + mulSign + "10^" + exponent;
		}
		let formatted = getFormattedNumberInternal(number, engine, mulSign);
		toReturn = "";
		let digitCount = -1;
		let decimalSeparator = engine.decimalDot ? '.' : ',';
		for (let c of formatted) {
			if (c == decimalSeparator) {
				toReturn += c;
				digitCount = 0;
			}
			else if (c == mulSign) {
				toReturn += c;
				digitCount = -1;
			} else {
				if (digitCount == -1) {
					toReturn += c;
					continue;
				}
				else if (digitCount == 10) continue;
				else {
					toReturn += c;
					digitCount++;
				}
			}
		}
		return toReturn;
	} catch (e) {
		console.error(e);
		return "[Error occured.]";
	}
}

export function getIndexWithWhitespace(text, indexWithoutWhitespace) {
	let position = -1, oldPosition = -1;
	for (let c of text) {
		position++;
		if (c != ' ' && ++oldPosition == indexWithoutWhitespace-1) return position+1;
	}
	return text.length;
}

export const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function getMonthDays(year, month) {
	return month == 2 ? isLeapYear(year) ? 29 : 28 : days[month];
}

export function divisible(dividend, divisor) {
	return mod(dividend, divisor) < 0.5;
}

export function isLeapYear(year) {
	return divisible(year, 4) && (!divisible(year, 100) || divisible(year, 400));
}

export const monthPos = [ 0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365 ],
             monthPosLeap = [ 0, 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366 ];

export function getYearAndDayOfYearFromIndex(index) {
	let cycles;
	let temp;
	let year = (temp = Math.floor(index / 146097)) * 400; // Gregorian calendar repeats every 146 097 days, or 400 years.
	if ((index -= temp * 146097) == 146096) return [ year + 400, 365 ]; // Handle the last day of the cycle, which is the 366th day of the 400th year.
	return [year + (cycles = Math.floor(index / 36524)) * 100 // In each repeat cycle, it repeats every 100 years, or 36 524 days; the only irregular year is the 400th year which is a leap year.
		+ (cycles = Math.floor((index -= cycles * 36524) / 1461)) * 4 // In that sub-cycle, it also repeats every 4 years or 1461 days, except the 100th which is not a leap year.
		+ (cycles = Math.floor((index -= cycles * 1461) / 365)) // In that sub-sub-cycle, it also repeats every year, or 365 days, except the 4th which is a leap year.
		+ (cycles == 4 ? 0 : 1) // Handle the last day of the 4-year cycle.
		+ 2000, // Offset to increase accuracy for near present time.
		cycles == 4 ? 365 : index - cycles * 365
	];
}

export function getMonthAndDayOfMonthFromIndex(index) {
	let res = getYearAndDayOfYearFromIndex(index);
	let table = isLeapYear(res[0]) ? monthPosLeap : monthPos;
	let i;
	for (i = 0; i < 12; i++) if (Math.floor(res[1]) < table[i+1]) break;
	return [ i, res[1] - table[i] + 1 ];
}

export function getHourFromIndex(index) {
	return Math.floor(24 * mod(index, 1));
}