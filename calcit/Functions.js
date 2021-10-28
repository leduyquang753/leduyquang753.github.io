import { ExpressionInvalidException } from "./ExpressionInvalidException.js";
import * as Utils from "./Utils.js";

class Function {
	constructor(names) {
		this.names = names;
	}

	total(args) {
		let total = 0;
		for (let d of args) total += d;
		return total;
	}
}

export class Sum extends Function {
	constructor() {
		super([ "", "sum", "total" ]);
	}
	calculate(args, engine) {
		return this.total(args);
	}
}

export class Sin extends Function {
	constructor() {
		super([ "sin", "sine" ]);
	}
	calculate(args, engine) {
		return Math.sin(engine.angleUnit.convertToRadians(this.total(args)));
	}
}

export class Cos extends Function {
	constructor() {
		super([ "cos", "cosine" ]);
	}
	calculate(args, engine) {
		return Math.cos(engine.angleUnit.convertToRadians(this.total(args)));
	}
}

export class Tan extends Function {
	constructor() {
		super([ "tan", "tangent", "tang", "tg" ]);
	}
	calculate(args, engine) {
		let tot = this.total(args);
		if (Math.cos(tot) == 0) throw new ExpressionInvalidException("divisionByZero");
		return Math.tan(engine.angleUnit.convertToRadians(tot));
	}
}

export class Cot extends Function {
	constructor() {
		super([ "cot", "cotangent", "cotang", "cotg" ]);
	}
	calculate(args, engine) {
		let tot = this.total(args);
		if (Math.sin(tot) == 0) throw new ExpressionInvalidException("divisionByZero");
		return 1 / Math.tan(engine.angleUnit.convertToRadians(tot));
	}
}

export class ArcSin extends Function {
	constructor() {
		super([ "arcsin", "arcsine", "sin_1", "sine_1", "asin" ]);
	}
	calculate(args, engine) {
		let tot = this.total(args);
		if (tot < -1 || tot > 1) throw new ExpressionInvalidException("invalidArcsinArg"); // TODO extends Add the number.
		return engine.angleUnit.convertFromRadians(Math.asin(tot));
	}
}

export class ArcCos extends Function {
	constructor() {
		super([ "arccos", "arccosine", "cos_1", "cosine_1", "acos" ]);
	}
	calculate(args, engine) {
		let tot = this.total(args);
		if (tot < -1 || tot > 1) throw new ExpressionInvalidException("invalidArccosArg"); // TODO extends Add the number.
		return engine.angleUnit.convertFromRadians(Math.acos(tot));
	}
}

export class ArcTan extends Function {
	constructor() {
		super([ "arctan", "arctangent", "arctang", "arctg", "tan_1", "tangent_1", "tang_1", "tg_1", "atan", "atg" ]);
	}
	calculate(args, engine) {
		return engine.angleUnit.convertFromRadians(Math.atan(this.total(args)));
	}
}

export class ArcCot extends Function {
	constructor() {
		super([ "arccot", "arccotangent", "arccotang", "arccotg", "cot_1", "cotangent_1", "cotang_1", "cotg_1", "acot", "acotg" ]);
	}
	calculate(args, engine) {
		let tot = this.total(args);
		if (tot == 0) return engine.angleUnit.convertFromDegrees(90);
		return engine.angleUnit.convertFromRadians(Math.atan(1 / tot));
	}
}

export class Floor extends Function {
	constructor() {
		super([ "floor", "flr" ]);
	}
	calculate(args, engine) {
		return Math.floor(this.total(args));
	}
}

export class Abs extends Function {
	constructor() {
		super([ "abs", "absolute" ]);
	}
	calculate(args, engine) {
		return Math.abs(this.total(args));
	}
}

export class GCD extends Function {
	constructor() {
		super([ "gcd", "greatestCommonDivisor", "greatest_common_divisor" ]);
	}
	calculate(args, engine) {
		if (args.length == 1) {
			let r = Math.floor(Math.abs(args[0]));
			return r == 0 ? 1 : r;
		}
		let res = Math.floor(Math.abs(args[0]));
		for (let i = 1; i < args.length; i++) {
			let n = Math.floor(Math.abs(args[i]));
			while (n != 0) {
				let temp = n;
				n = Utils.mod(res, n);
				res = temp;
			}
		}
		return res;
	}
}

export class LCM extends Function {
	constructor() {
		super([ "lcm", "lowestCommonMultiplier", "lowest_common_multiplier" ]);
	}
	calculate(args, engine) {
		if (args.length == 1) return Math.floor(Math.abs(args[0]));
		let res = Math.floor(Math.abs(args[0]));
		for (let i = 1; i < args.length; i++) {
			let n = Math.floor(Math.abs(args[i]));
			let t = n;
			let t2 = res;
			while (t2 != 0) {
				let temp = t2;
				t2 = Utils.mod(n, t2);
				n = temp;
			}
			res = Utils.div(res * t, n);
		}
		return res;
	}
}

export class Fact extends Function {
	constructor() {
		super([ "fact", "factorial" ]);
	}
	calculate(args, engine) {
		let total = 0;
		for (let argument of args) total += argument;
		let n = Math.floor(total);
		if (n < 0) throw new ExpressionInvalidException("invalidFactorialArg");
		total = 1;
		for (let i = 1; i <= n; i += 1) total *= i;
		return total;
	}
}

export class Log extends Function {
	constructor() {
		super([ "log", "logarithm", "logarid" ]);
	}
	calculate(args, engine) {
		if (args.length == 1) {
			if (args[0] <= 0) throw new ExpressionInvalidException("invalidLogInput");
			return Math.log10(args[0]);
		} else {
			if (args[0] <= 0 || args[0] == 1) throw new ExpressionInvalidException("invalidLogBase");
			let total = 0;
			for (let i = 1; i < args.length; i++) total += args[i];
			if (total <= 0) throw new ExpressionInvalidException("invalidLogInput");
			return Math.log(total)/Math.log(args[0]);
		}
	}
}

export class Ln extends Function {
	constructor() {
		super([ "ln", "logn", "loge", "natural_algorithm", "natural_logarid" ]);
	}
	calculate(args, engine) {
		let tot = this.total(args);
		if (tot <= 0) throw new ExpressionInvalidException("invalidLogInput");
		return Math.log(tot);
	}
}

export class Permutation extends Function {
	constructor() {
		super([ "p", "permutation", "permut" ]);
	}
	calculate(args, engine) {
		if (args.length != 2) throw new ExpressionInvalidException("invalidPermutationNumArgs");
		let n = Math.floor(args[0]);
		let k = Math.floor(args[1]);
		if (n < 0 || k < 0) throw new ExpressionInvalidException("invalidPermutationNegativeArgs");
		if (k > n) return 0;
		k = n - k;
		let res = 1;
		while (k < n) res *= k++;
		return res;
	}
}

export class Combination extends Function {
	constructor() {
		super([ "c", "combination", "combin" ]);
	}
	calculate(args, engine) {
		if (args.length != 2) throw new ExpressionInvalidException("invalidCombinationNumArgs");
		let n = Math.floor(args[0]);
		let k = Math.floor(args[1]);
		if (n < 0 || k < 0) throw new ExpressionInvalidException("invalidCombinationNegativeArgs");
		if (k > n) return 0;
		let i = n - k;
		let res = 1;
		while (i < n) res *= ++i;
		i = 0;
		while (i < k) res /= ++i;
		return res;
	}
}

export class Round extends Function {
	constructor() {
		super([ "round", "rnd" ]);
	}
	calculate(args, engine) {
		let total = 0;
		for (let argument of args) total += argument;
		return Math.round(total);
	}
}

export class DegToRad extends Function {
	constructor() {
		super([ "dtr", "degToRad", "deg_to_rad", "degreesToRadians", "degrees_to_radians" ]);
	}
	calculate(args, engine) {
		return Utils.degToRad(this.total(args));
	}
}

export class RadToDeg extends Function {
	constructor() {
		super([ "rtd", "radToDeg", "rad_to_deg", "radiansToDegrees", "radians_to_degrees" ]);
	}
	calculate(args, engine) {
		return Utils.radToDeg(this.total(args));
	}
}

export class DegToGrad extends Function {
	constructor() {
		super([ "dtg", "degToGrad", "deg_to_grad", "degreesToGradians", "degrees_to_gradians" ]);
	}
	calculate(args, engine) {
		return Utils.degToGrad(this.total(args));
	}
}

export class GradToDeg extends Function {
	constructor() {
		super([ "gtd", "gradToDeg", "grad_to_deg", "gradiansToDegrees", "gradians_to_degrees" ]);
	}
	calculate(args, engine) {
		return Utils.gradToDeg(this.total(args));
	}
}

export class GradToRad extends Function {
	constructor() {
		super([ "gtr", "gradToRad", "grad_to_rad", "gradiansToRadians", "gradians_to_radians" ]);
	}
	calculate(args, engine) {
		return Utils.gradToRad(this.total(args));
	}
}

export class RadToGrad extends Function {
	constructor() {
		super([ "rtg", "radToGrad", "rad_to_grad", "radiansToGradians", "radians_to_gradians" ]);
	}
	calculate(args, engine) {
		return Utils.radToGrad(this.total(args));
	}
}

export class Max extends Function {
	constructor() {
		super([ "max", "maximum" ]);
	}
	calculate(args, engine) {
		let max = 0;
		let isFirst = true;
		for (let num of args)
			if (isFirst) {
				isFirst = false;
				max = num;
			} else if (num > max) max = num;
		return max;
	}
}

export class Min extends Function {
	constructor() {
		super([ "min", "minimum" ]);
	}
	calculate(args, engine) {
		let min = 0;
		let isFirst = true;
		for (let num of args)
			if (isFirst) {
				isFirst = false;
				min = num;
			} else if (num < min) min = num;
		return min;
	}
}

export class Average extends Function {
	constructor() {
		super([ "avg", "average" ]);
	}
	calculate(args, engine) {
		return this.total(args) / args.length;
	} // No need to worry about division by zero, there can never be zero args.
}

export class RandomFunc extends Function {
	constructor() {
		super([ "random", "rand" ]);
	}
	calculate(args, engine) {
		switch (args.length) {
			case 1: return Math.random() * args[0];
			case 2: return args[0] + (args[1] - args[0]) * Math.random();
			default: throw new ExpressionInvalidException("invalidRandomNumArgs");
		}
	}
}

export class RandomInt extends Function {
	constructor() {
		super([ "randomInt", "randInt", "randomInteger", "random_integer" ]);
	}
	calculate(args, engine) {
		let lower, higher;
		switch (args.length) {
			case 1: lower = 0; higher = args[0]; break;
			case 2: lower = args[0]; higher = args[1]; break;
			default: throw new ExpressionInvalidException("invalidRandomNumArgs");
		}
		if (lower > higher) {
			let temp = lower;
			lower = higher;
			higher = temp;
		}
		lower = Utils.roundUp(lower);
		higher = Utils.roundDown(higher);
		if (lower > higher) throw new ExpressionInvalidException("invalidRandomNoIntegerBetween");
		return Utils.roundDown(lower + Math.random() * (higher - lower + 1));
	}
}

export class RandomInList extends Function {
	constructor() {
		super([ "randomInList", "random_in_list", "randInList" ]);
	}
	calculate(args, engine) {
		return args[Math.floor(Math.random() * args.length)];
	}
}

export class IsGreater extends Function {
	constructor() {
		super([ "isGreater" ]);
	}
	calculate(args, engine) {
		if (args.length < 2) throw new ExpressionInvalidException("invalidComparisonNumArgs");
		for (let i = 1; i < args.length; i++)
			if (args[i] >= args[i - 1]) return 0;
		return 1;
	}
}

export class IsSmaller extends Function {
	constructor() {
		super([ "isSmaller" ]);
	}
	calculate(args, engine) {
		if (args.length < 2) throw new ExpressionInvalidException("invalidComparisonNumArgs");
		for (let i = 1; i < args.length; i++)
			if (args[i] <= args[i - 1]) return 0;
		return 1;
	}
}

export class IsEqual extends Function {
	constructor() {
		super([ "isEqual" ]);
	}
	calculate(args, engine) {
		if (args.length < 2) throw new ExpressionInvalidException("invalidComparisonNumArgs");
		for (let i = 1; i < args.length; i++)
			if (args[i] != args[0]) return 0;
		return 1;
	}
}

export class If extends Function {
	constructor() {
		super([ "if" ]);
	}
	calculate(args, engine) {
		if (args.length > 3) throw new ExpressionInvalidException("invalidIfNumArgs");
		while (args.length < 3) args.push(0);
		return args[0] > 0 ? args[1]: args[2];
	}
}

export class And extends Function {
	constructor() {
		super([ "and" ]);
	}
	calculate(args, engine) {
		for (let num of args)
			if (num <= 0) return 0;
		return 1;
	}
}

export class Or extends Function {
	constructor() {
		super([ "or" ]);
	}
	calculate(args, engine) {
		for (let num of args)
			if (num > 0) return 1;
		return 0;
	}
}

export class Not extends Function {
	constructor() {
		super([ "not" ]);
	}
	calculate(args, engine) {
		if (args.length != 1) throw new ExpressionInvalidException("invalidNotNumArgs");
		return args[0] > 0 ? 0 : 1;
	}
}

export class AngleToDegrees extends Function {
	constructor() {
		super([ "angle to degrees", "angle_to_degrees", "to degrees", "to_degrees", "to deg" ]);
	}
	calculate(args, engine) {
		return engine.angleUnit.convertToDegrees(this.total(args));
	}
}

export class AngleToRadians extends Function {
	constructor() {
		super([ "angle to radians", "angle_to_radians", "to radians", "to_radians", "to rad" ]);
	}
	calculate(args, engine) {
		return engine.angleUnit.convertToRadians(this.total(args));
	}
}

export class AngleToGradians extends Function {
	constructor() {
		super([ "angle to gradians", "angle_to_gradians", "to gradians", "to_gradians", "to grad" ]);
	}
	calculate(args, engine) {
		return engine.angleUnit.convertToGradians(this.total(args));
	}
}

export class AngleFromDegrees extends Function {
	constructor() {
		super([ "angle from degrees", "angle_from_degrees", "from degrees", "from_degrees", "from deg" ]);
	}
	calculate(args, engine) {
		return engine.angleUnit.convertFromDegrees(this.total(args));
	}
}

export class AngleFromRadians extends Function {
	constructor() {
		super([ "angle from radians", "angle_from_radians", "from radians", "from_radians", "from rad" ]);
	}
	calculate(args, engine) {
		return engine.angleUnit.convertFromRadians(this.total(args));
	}
}

export class AngleFromGradians extends Function {
	constructor() {
		super([ "angle from gradians", "angle_from_gradians", "from gradians", "from_gradians", "from grad" ]);
	}
	calculate(args, engine) {
		return engine.angleUnit.convertFromGradians(this.total(args));
	}
}

export class Date extends Function {
	constructor() {
		super([ "date" ]);
	}
	calculate(args, engine) {
		if (args.length > 6) throw new ExpressionInvalidException("invalidDateNumOfArgs");
		while (args.length < 3) args.push(1);
		while (args.length < 6) args.push(0);
		for (let i = 0; i < 2; i++) args[i] = Math.round(args[i]);
		args[0] -= 2000; // Offset to increase accuracy for near present time.
		if ((args[1] = Math.floor(args[1])) < 1 || args[1] > 12) throw new ExpressionInvalidException("invalidDateMonthOutOfRange");
		args[2] = args[2] - 1 + args[3] / 24 + args[4] / 1440 + args[5] / 86400;
		if (args[2] < 0 || args[2] >= Utils.getMonthDays(args[0], args[1])) throw new ExpressionInvalidException("invalidDateDayOutOfRange");
		return (args[0] - 1) * 365 + Utils.div(args[0], 4) - Utils.div(args[0], 100) + Utils.div(args[0], 400) - (Utils.isLeapYear(args[0]) && args[1] < 2.5 ? 1 : 0) + Utils.monthPos[args[1]] + args[2];
	}
}

export class Year extends Function {
	constructor() {
		super([ "year", "yr" ]);
	}
	calculate(args, engine) {
		return Utils.getYearAndDayOfYearFromIndex(this.total(args))[0];
	}
}

export class DayOfYear extends Function {
	constructor() {
		super([ "day of year", "day_of_year" ]);
	}
	calculate(args, engine) {
		return Utils.getYearAndDayOfYearFromIndex(this.total(args))[1]+1;
	}
}

export class Month extends Function {
	constructor() {
		super([ "month", "mth" ]);
	}
	calculate(args, engine) {
		return Utils.getMonthAndDayOfMonthFromIndex(this.total(args))[0];
	}
}

export class Day extends Function {
	constructor() {
		super([ "day" ]);
	}
	calculate(args, engine) {
		return Math.floor(Utils.getMonthAndDayOfMonthFromIndex(this.total(args))[1]);
	}
}

export class DecimalDay extends Function {
	constructor() {
		super([ "decimal day", "decimal_day" ]);
	}
	calculate(args, engine) {
		return Utils.getMonthAndDayOfMonthFromIndex(this.total(args))[1];
	}
}

export class Hour extends Function {
	constructor() {
		super([ "hour", "hr" ]);
	}
	calculate(args, engine) {
		return Utils.getHourFromIndex(this.total(args));
	}
}

export class Minute extends Function {
	constructor() {
		super([ "minute", "min" ]);
	}
	calculate(args, engine) {
		let index = this.total(args);
		return Math.floor(1440 * (Utils.mod(index, 1) - Utils.getHourFromIndex(index) / 24));
	}
}

export class Second extends Function {
	constructor() {
		super([ "second", "sec" ]);
	}
	calculate(args, engine) {
		let dec = Utils.mod(this.total(args), 1);
		return 86400 * (dec - Math.floor(1440 * dec) / 1440);
	}
}

export class DayOfWeekMondayFirst extends Function {
	constructor() {
		super([ "day of week Monday first", "day_of_week_Monday_first" ]);
	}
	calculate(args, engine) {
		let date = Math.floor(this.total(args));
		return date - Math.floor(date / 7) * 7 + 1;
	}
}

export class DayOfWeekSundayFirst extends Function {
	constructor() {
		super([ "day of week Sunday first", "day_of_week_Sunday_first" ]);
	}
	calculate(args, engine) {
		let date = Math.floor(this.total(args)) + 1;
		return date - Math.floor(date / 7) * 7 + 1;
	}
}

export class Time extends Function {
	constructor() {
		super([ "time" ]);
	}
	calculate(args, engine) {
		if (args.length > 4) throw new ExpressionInvalidException("invalidTimeNumArgs");
		while (args.length < 4) args.push(0);
		return args[0] + args[1] / 24 + args[2] / 1440 + args[3] / 86400;
	}
}