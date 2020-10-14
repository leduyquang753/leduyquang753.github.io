import * as Operand from "./Operands.js";
import * as Function from "./Functions.js";
import * as AngleUnit from "./AngleUnits.js";
import * as Utils from "./Utils.js";

import { ExpressionInvalidException } from "./ExpressionInvalidException.js";
import { GetVariableException } from "./GetVariableException.js";

const dotlessMulOp = new Operand.DotlessMultiplication();
const braceMap = {
	"(": ")",
	"{": "}",
	"[": "]",
	"<": ">"
};
const positiveInfinity = 99999;
//const negativeInfinity = -99999;

export class CalculatorEngine {
	constructor() {
		this.operandMap = {};
		this.variableMap = {};
		this.functionMap = {};

		this.decimalDot = false;
		this.enforceDecimalSeparator = false;
		this.thousandDot = false;
		this.mulAsterisk = false;
		this.enforceMulDiv = false;
		this.zeroUndefinedVars = false;

		this.angleUnit = AngleUnit.DEGREE;

		this.ans = this.preAns = 0;

		// Register every operand.
		for (let operand of [
			new Operand.Plus(),
			new Operand.Minus(),
			new Operand.Multiply(),
			new Operand.Divide(),
			new Operand.Exponentiation(),
			new Operand.Root(),
			new Operand.OpeningBrace(),
			new Operand.ClosingBrace()
		]) this.registerOperand(operand);

		// Register every function.
		for (let func of [
			new Function.Sum(),
			new Function.Sin(),
			new Function.Cos(),
			new Function.Tan(),
			new Function.Cot(),
			new Function.ArcSin(),
			new Function.ArcCos(),
			new Function.ArcTan(),
			new Function.ArcCot(),
			new Function.Floor(),
			new Function.Abs(),
			new Function.GCD(),
			new Function.LCM(),
			new Function.Fact(),
			new Function.Log(),
			new Function.Ln(),
			new Function.Permutation(),
			new Function.Combination(),
			new Function.Round(),
			new Function.DegToRad(),
			new Function.RadToDeg(),
			new Function.DegToGrad(),
			new Function.GradToDeg(),
			new Function.GradToRad(),
			new Function.RadToGrad(),
			new Function.Max(),
			new Function.Min(),
			new Function.Average(),
			new Function.RandomFunc(),
			new Function.RandomInt(),
			new Function.RandomInList(),
			new Function.IsGreater(),
			new Function.IsSmaller(),
			new Function.IsEqual(),
			new Function.If(),
			new Function.And(),
			new Function.Or(),
			new Function.Not(),
			new Function.AngleToDegrees(),
			new Function.AngleToRadians(),
			new Function.AngleToGradians(),
			new Function.AngleFromDegrees(),
			new Function.AngleFromRadians(),
			new Function.AngleFromGradians(),
			new Function.Date(),
			new Function.Year(),
			new Function.DayOfYear(),
			new Function.Month(),
			new Function.Day(),
			new Function.DecimalDay(),
			new Function.Hour(),
			new Function.Minute(),
			new Function.Second(),
			new Function.DayOfWeekMondayFirst(),
			new Function.DayOfWeekSundayFirst(),
			new Function.Time()
		]) this.registerFunction(func);
	}

	/**
	 * Registers an operand to the engine. If there is a registered operand with some characters overlapping the operand being added, the one being will override.
	 */
	registerOperand(op) {
		for (let key of op.characters) this.operandMap[key] = op;
	}

	/**
	/* Registers a function to the engine. If there is a registered function with some names overlapping the operand being added, the one being will override.
	*/
	registerFunction(func) {
		for (let key of func.names) this.functionMap[this.lowercaseAndRemoveWhitespace(key)] = func;
	}

	isDigit(c) {
		return c >= '0' && c <= '9';
	}

	isChar(c) {
		return c.toLowerCase() != c.toUpperCase() || c == '_';
	}

	areBracesMatch(opening, closing) {
		return braceMap[opening] == closing;
	}

	performBacktrackCalculation(calculationStatus, shouldCalculateAll) {
		if (calculationStatus.OS.length == 0) return;
		let currentOperand = calculationStatus.OS.pop();
		let currentNumber = calculationStatus.NS.pop();
		let lastPriority = positiveInfinity;
		while (shouldCalculateAll || !(currentOperand instanceof Operand.OpeningBrace)) {
			if (shouldCalculateAll && currentOperand instanceof Operand.OpeningBrace) {
				while (calculationStatus.TOS.length != 0) currentNumber = calculationStatus.TOS.pop().calculate(currentNumber, calculationStatus.TNS.pop(), this);
				lastPriority = positiveInfinity;
				if (calculationStatus.OS.length != 0) currentOperand = calculationStatus.OS.pop(); else {
					while (calculationStatus.TOS.length != 0) currentNumber = calculationStatus.TOS.pop().calculate(currentNumber, calculationStatus.TNS.pop(), this);
					calculationStatus.NS.push(currentNumber);
					return;
				}
			}
			if (currentOperand.priority != lastPriority)
				while (calculationStatus.TOS.length != 0) currentNumber = calculationStatus.TOS.pop().calculate(currentNumber, calculationStatus.TNS.pop(), this);
			if (currentOperand.reversed) currentNumber = currentOperand.calculate(calculationStatus.NS.pop(), currentNumber, this); else {
				calculationStatus.TNS.push(currentNumber);
				calculationStatus.TOS.push(currentOperand);
				currentNumber = calculationStatus.NS.pop();
			}
			lastPriority = currentOperand.priority;
			if (calculationStatus.OS.length != 0) currentOperand = calculationStatus.OS.pop(); else {
				while (calculationStatus.TOS.length != 0) currentNumber = calculationStatus.TOS.pop().calculate(currentNumber, calculationStatus.TNS.pop(), this);
				calculationStatus.NS.push(currentNumber);
				return;
			}
		}
		while (calculationStatus.TOS.length != 0) currentNumber = calculationStatus.TOS.pop().calculate(currentNumber, calculationStatus.TNS.pop(), this);
		calculationStatus.NS.push(currentNumber);
		calculationStatus.OS.push(currentOperand);
	}

	performBacktrackSameLevelCalculation(calculationStatus) {
		if (calculationStatus.OS.length == 0) return;
		let currentOperand = calculationStatus.OS.pop();
		let currentNumber = calculationStatus.NS.pop();
		let lastPriority = currentOperand.priority;
		while (!(currentOperand instanceof Operand.OpeningBrace)) {
			if (currentOperand.priority != lastPriority) {
				while (calculationStatus.TOS.length != 0) currentNumber = calculationStatus.TOS.pop().calculate(currentNumber, calculationStatus.TNS.pop(), this);
				calculationStatus.NS.push(currentNumber);
				calculationStatus.OS.push(currentOperand);
				return;
			}
			if (currentOperand.reversed) currentNumber = currentOperand.calculate(calculationStatus.NS.pop(), currentNumber, this); else {
				calculationStatus.TNS.push(currentNumber);
				calculationStatus.TOS.push(currentOperand);
				currentNumber = calculationStatus.NS.pop();
			}
			lastPriority = currentOperand.priority;
			if (calculationStatus.OS.length != 0) currentOperand = calculationStatus.OS.pop(); else {
				while (calculationStatus.TOS.length != 0) currentNumber = calculationStatus.TOS.pop().calculate(currentNumber, calculationStatus.TNS.pop(), this);
				calculationStatus.NS.push(currentNumber);
				return;
			}
		}
		while (calculationStatus.TOS.length != 0) currentNumber = calculationStatus.TOS.pop().calculate(currentNumber, calculationStatus.TNS.pop(), this);
		calculationStatus.NS.push(currentNumber);
		calculationStatus.OS.push(currentOperand);
	}

	processNumberToken(calculationStatus, position) {
		let percent = false;
		if (calculationStatus.currentToken[calculationStatus.currentToken.length-1] == '%') {
			percent = true;
			calculationStatus.currentToken = calculationStatus.currentToken.substring(0, calculationStatus.currentToken.length-1);
		}
		let result;
		if (calculationStatus.isVariable) result = this.getVariableInternal(calculationStatus.currentToken, position); else {
			calculationStatus.currentToken = calculationStatus.currentToken.replace(",", ".");
			result = Number.parseFloat(calculationStatus.currentToken);
		}
		if (percent) result /= 100;
		if (calculationStatus.negativity) {
			calculationStatus.NS.push(-1);
			calculationStatus.OS.push(dotlessMulOp);
		}
		calculationStatus.negativity = false;
		calculationStatus.hadNegation = false;
		calculationStatus.hadComma = false;
		calculationStatus.currentToken = "";
		return result;
	}

	isDecimalSeparator(c) {
		return this.decimalDot ? this.enforceDecimalSeparator ? c == '.' : c == '.' || c == ',' : c == ',';
	}

	performCalculation(input) {
		let calculationStatus = new CalculationStatus();
		let BS = [];
		let
			status = false, // true: previous was number/closing brace; false: previous was operand/opening brace.
			hadClosingBrace = false,
			hadPercent = false;
		let thousandSeparator = this.decimalDot ? '.' : ',';
		let currentOperand;
		let currentFunction;
		let currentBracelet;
		for (let i = 0; i < input.length; i++) {
			let c = input[i];
			if (this.thousandDot && c == thousandSeparator) {
				if (status && !calculationStatus.isVariable) continue; else throw new ExpressionInvalidException("unexpectedThousandSeparator", i+1);
			} else if ((c == '-' || c == '–') && !status) {
				calculationStatus.negativity = !calculationStatus.negativity;
				calculationStatus.hadNegation = true;
			} else if (c == '%') {
				if (hadPercent) throw new ExpressionInvalidException("unexpectedPercent", i + 1);
				if (hadClosingBrace) {
					calculationStatus.NS.push(calculationStatus.NS.pop() / 100);
					hadPercent = true;
				} else if (!status || calculationStatus.currentToken[calculationStatus.currentToken.length - 1] == '%') throw new ExpressionInvalidException("unexpectedPercent", i+1); else calculationStatus.currentToken += c;
			} else if (c == ';') {
				if (BS.length != 0) {
					if (status) {
						if (calculationStatus.currentToken.length != 0) calculationStatus.NS.push(this.processNumberToken(calculationStatus, i));
						this.performBacktrackCalculation(calculationStatus, false);
						BS.slice(-1)[0].addArgument(calculationStatus.NS.pop());
						status = false;
						hadClosingBrace = false;
						hadPercent = false;
					} else if (calculationStatus.OS.slice(-1)[0] instanceof Operand.OpeningBrace) {
						BS.slice(-1)[0].addArgument(0);
						status = false;
						hadClosingBrace = false;
						hadPercent = false;
					} else throw new ExpressionInvalidException("unexpectedSemicolon", i+1);
				} else throw new ExpressionInvalidException("unexpectedSemicolon", i+1);
			} else if (this.isDecimalSeparator(c)) {
				if (calculationStatus.currentToken.length == 0) {
					if (hadClosingBrace) {
						while (calculationStatus.OS.length != 0 && dotlessMulOp.priority < calculationStatus.OS.slice(-1)[0].priority) this.performBacktrackSameLevelCalculation(calculationStatus);
						calculationStatus.OS.push(dotlessMulOp);
						hadClosingBrace = false;
					}
					calculationStatus.currentToken = "0,";
					status = true;
					calculationStatus.isVariable = false;
					calculationStatus.hadComma = true;
					hadPercent = false;
				} else if (status) {
					if (calculationStatus.isVariable || calculationStatus.hadComma) throw new ExpressionInvalidException("unexpectedDecimalSeparator", i+1);
					calculationStatus.currentToken += c;
					calculationStatus.hadComma = true;
					hadPercent = false;
				} else { };
			} else if (this.isDigit(c)) {
				if (calculationStatus.currentToken.length == 0) {
					if (hadClosingBrace) {
						while (calculationStatus.OS.length != 0 && dotlessMulOp.priority < calculationStatus.OS.slice(-1)[0].priority) this.performBacktrackSameLevelCalculation(calculationStatus);
						calculationStatus.OS.push(dotlessMulOp);
						hadClosingBrace = false;
					}
					calculationStatus.currentToken = c;
					status = true;
					calculationStatus.isVariable = false;
					hadPercent = false;
				} else if (status) {
					if (calculationStatus.isVariable) calculationStatus.currentToken += c;
					else if (calculationStatus.currentToken[calculationStatus.currentToken.length - 1] == '%') throw new ExpressionInvalidException("unexpectedDigit", i+1);
					else calculationStatus.currentToken += c;
				} else {
					calculationStatus.currentToken = c;
					status = true;
					calculationStatus.isVariable = false;
					hadPercent = false;
				}
			} else if (this.isChar(c)) {
				if (hadClosingBrace || calculationStatus.currentToken.length != 0 && !calculationStatus.isVariable) {
					if (calculationStatus.currentToken.length != 0 && !calculationStatus.isVariable) calculationStatus.NS.push(this.processNumberToken(calculationStatus, i));
					while (calculationStatus.OS.length != 0 && dotlessMulOp.priority < calculationStatus.OS.slice(-1)[0].priority) this.performBacktrackSameLevelCalculation(calculationStatus);
					calculationStatus.OS.push(dotlessMulOp);
					hadClosingBrace = false;
				}
				calculationStatus.currentToken += c;
				calculationStatus.isVariable = true;
				status = true;
				hadClosingBrace = false;
				hadPercent = false;
			} else if ((currentOperand = this.operandMap[c]) == undefined) throw new ExpressionInvalidException("unknownSymbol", i+1);
			else {
				if (currentOperand instanceof Operand.OpeningBrace) {
					if (hadClosingBrace || calculationStatus.currentToken.length != 0 && !calculationStatus.isVariable) {
						if (calculationStatus.currentToken.length != 0 && !calculationStatus.isVariable) calculationStatus.NS.push(this.processNumberToken(calculationStatus, i));
						while (calculationStatus.OS.length != 0 && dotlessMulOp.priority < calculationStatus.OS.slice(-1)[0].priority) this.performBacktrackSameLevelCalculation(calculationStatus);
						calculationStatus.OS.push(dotlessMulOp);
						hadClosingBrace = false;
					}
					if ((currentFunction = this.functionMap[calculationStatus.currentToken]) == undefined) throw new ExpressionInvalidException("unknownFunction", i, [ calculationStatus.currentToken ]);
					calculationStatus.OS.push(currentOperand);
					BS.push(new Bracelet(c, currentFunction, this));
					status = false;
					hadPercent = false;
					calculationStatus.currentToken = "";
				} else if (currentOperand instanceof Operand.ClosingBrace) {
					if (status) if (BS.length == 0) throw new ExpressionInvalidException("unexpectedClosingBrace", i + 1);
						else if (this.areBracesMatch(BS.slice(-1)[0].opening, c)) {
							if (calculationStatus.currentToken.length != 0) calculationStatus.NS.push(this.processNumberToken(calculationStatus, i));
							this.performBacktrackCalculation(calculationStatus, false);
							calculationStatus.OS.pop();
							(currentBracelet = BS.pop()).addArgument(calculationStatus.NS.pop());
							calculationStatus.NS.push(currentBracelet.getResult());
							status = true;
							hadClosingBrace = true;
							hadPercent = false;
						} else throw new ExpressionInvalidException("unmatchingBraces", i + 1);
					else if (calculationStatus.OS.length == 0) {
						calculationStatus.NS.push(0);
						status = true;
						hadClosingBrace = true;
						hadPercent = false;
					} else if (calculationStatus.OS.slice(-1)[0] instanceof Operand.OpeningBrace) {
						if (BS.length != 0 && !this.areBracesMatch(BS.slice(-1)[0].opening, c)) throw new ExpressionInvalidException("unmatchingBraces", i + 1);
						calculationStatus.OS.pop();
						(currentBracelet = BS.pop()).addArgument(0);
						calculationStatus.NS.push(currentBracelet.getResult());
						status = true;
						hadClosingBrace = true;
						hadPercent = false;
					} else throw new ExpressionInvalidException("unexpectedClosingBrace", i + 1);
				} else {
					if (status) {
						if (this.enforceMulDiv) switch (c) {
								case '.':
								case ':':
									if (this.mulAsterisk) throw new ExpressionInvalidException("unknownSymbol", i+1);
									break;
								case '*':
								case '/':
									if (!this.mulAsterisk) throw new ExpressionInvalidException("unknownSymbol", i+1);
									break;
							}
						if (calculationStatus.currentToken.length != 0) calculationStatus.NS.push(this.processNumberToken(calculationStatus, i));
						else if (calculationStatus.hadNegation) throw new ExpressionInvalidException("unexpectedOperand", i);
						while (calculationStatus.OS.length != 0 && currentOperand.priority < calculationStatus.OS.slice(-1)[0].priority) this.performBacktrackSameLevelCalculation(calculationStatus);
						calculationStatus.OS.push(currentOperand);
						status = false;
						hadClosingBrace = false;
						hadPercent = false;
					} else if (c == '+') calculationStatus.hadNegation = true; else throw new ExpressionInvalidException("unexpectedOperand", i+1);
				}
			}
		}
		if (status) {
			if (calculationStatus.currentToken.length != 0) calculationStatus.NS.push(this.processNumberToken(calculationStatus, input.length));
			else if (calculationStatus.hadNegation) throw new ExpressionInvalidException("trailingSign");
			else { };
		} else throw new ExpressionInvalidException("unexpectedEnd");
		while (BS.length != 0) {
			this.performBacktrackCalculation(calculationStatus, false);
			currentBracelet = BS.pop();
			currentBracelet.addArgument(calculationStatus.NS.pop());
			calculationStatus.NS.push(currentBracelet.getResult());
		}
		this.performBacktrackCalculation(calculationStatus, true);
		return calculationStatus.NS.pop();
	}

	lowercaseAndRemoveWhitespace(stringIn) {
		return stringIn.replace(/\s/g, "").toLowerCase();
	}

	calculate(expression) {
		let trimmedExpression = this.lowercaseAndRemoveWhitespace(expression);
		let toAssign = [];
		let ps;
		let position = 0;
		mainLoop: while (true) {
			switch (ps = trimmedExpression.indexOf('=')) {
				case -1: break mainLoop;
				case 0: throw new ExpressionInvalidException("unexpectedEqual", Utils.getIndexWithWhitespace(expression, position+1));
				default:
					let s = trimmedExpression.substring(0, ps);
					if (s == "ans" || s == "preAns") throw new ExpressionInvalidException("reservedVariable", Utils.getIndexWithWhitespace(expression, position + ps));
					if (this.isDigit(s[0])) throw new ExpressionInvalidException("invalidVariable", Utils.getIndexWithWhitespace(expression, position + ps), [s]); 
					for (let c of s) if (!this.isChar(c) && !this.isDigit(c)) throw new ExpressionInvalidException("nonAlphanumericVariableName", Utils.getIndexWithWhitespace(expression, position + ps), [s]);
					toAssign.push(s);
					break;
			}
			trimmedExpression = trimmedExpression.substring(ps + 1);
			position += ps + 1;
		}
		if (trimmedExpression.length == 0) throw new ExpressionInvalidException("nothingToCalculate", Utils.getIndexWithWhitespace(expression, position));
		if (trimmedExpression == "!") {
			for (let s of toAssign) delete this.variableMap[s];
			this.preAns = this.ans;
			this.ans = 0;
			return 0;
		}
		let oldAns = this.ans;
		try {
			this.ans = this.performCalculation(trimmedExpression);
		} catch (e) { // Handle and rethrow the exception to properly position the error in the expression with whitespace.
			if (!(e instanceof ExpressionInvalidException)) throw e;
			throw new ExpressionInvalidException(e.message, position + Utils.getIndexWithWhitespace(expression, position + e.position), e.messageArguments);
		}
		for (let s of toAssign) this.variableMap[s] = this.ans;
		this.preAns = oldAns;
		return this.ans;
	}

	getVariable(name) {
		name = this.lowercaseAndRemoveWhitespace(name);
		if (name.length == 0) throw new GetVariableException(GetVariableException.Type.EMPTY_NAME);
		if (this.isDigit(name[0])) throw new GetVariableException(GetVariableException.Type.INVALID_NAME);
		for (let c of name) if (!this.isDigit(c) && !this.isChar(c)) throw new GetVariableException(GetVariableException.Type.INVALID_NAME);
		switch (name) {
			case "ans": return this.ans;
			case "preans": return this.preAns;
		}
		let p = this.variableMap[name];
		if (p == undefined && !this.zeroUndefinedVars) throw new GetVariableException(GetVariableException.Type.NOT_SET);
		return p == undefined ? 0 : p;
	}

	getVariableInternal(name, position) {
		let actualName = this.lowercaseAndRemoveWhitespace(name);
		switch (actualName) {
			case "ans": return this.ans;
			case "preans": return this.preAns;
		}
		let p = this.variableMap[name];
		if (p != undefined) return p;
		else if (this.zeroUndefinedVars) return 0;
		else throw new ExpressionInvalidException("variableNotSet", position, [ name ]);
	}
}

class Bracelet {
	constructor(openingIn, functionIn, engineIn) {
		this.opening = openingIn;
		this.functionAssigned = functionIn;
		this.engine = engineIn;
		this.arguments = [];
	}

	addArgument(argumentIn) {
		this.arguments.push(argumentIn);
	}

	getResult() {
		return this.functionAssigned.calculate(this.arguments, this.engine);
	}
}

class CalculationStatus {
	constructor() {
		this.NS = [];
		this.TNS = [];
		this.OS = [];
		this.TOS = [];
		this.negativity = false;
		this.hadNegation = false;
		this.isVariable = false;
		this.hadComma = false;
		this.currentToken = "";
	}
}