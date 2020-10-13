import { CalculatorEngine } from "./CalculatorEngine.js";
import { ExpressionInvalidException } from "./ExpressionInvalidException.js";
import * as Utils from "./Utils.js";
import * as AngleUnit from "./AngleUnits.js";

const stringMap = {
	"error.braceInvolved": "Brace is involved as an operator. This is a BUG, report it to the author.",
	"error.divisionByZero": "Division by zero.",
	"error.header": "ERROR: ",
	"error.invalidArccosArg": "Invalid arccosine function argument.",
	"error.invalidArcsinArg": "Invalid arcsine function argument.",
	"error.invalidCombinationNegativeArgs": "Combination function's arguments must not be negative.",
	"error.invalidCombinationNumArgs": "Combination function must receive exactly 2 arguments.",
	"error.invalidComparisonNumArgs": "Comparison function must receive at least 2 arguments.",
	"error.invalidDateDayOutOfRange": "Date function's day is outside of range.",
	"error.invalidDateMonthOutOfRange": "Date function's month when rounded must be from 1 to 12.",
	"error.invalidDateNumOfArgs": "Date function only takes up to 6 arguments.",
	"error.invalidFactorialArg": "Factorial function's argument must not be negative.",
	"error.invalidIfNumArgs": "Conditional function only takes up to 3 arguments.",
	"error.invalidLogBase": "Logarithm function's base must be positive.",
	"error.invalidLogInput": "Logarithm function's input must be positive.",
	"error.invalidNotNumArgs": "Not function only takes 1 argument.",
	"error.invalidPermutationNegativeArgs": "Permutation function's arguments must not be negative.",
	"error.invalidPermutationNumArgs": "Permutation function must receive exactly 2 arguments.",
	"error.invalidRandomNoIntegerBetween": "Random integer function's arguments have no integers in between.",
	"error.invalidRandomNumArgs": "Random function only takes up to 2 arguments.",
	"error.invalidTimeNumArgs": "Time function only takes up to 4 arguments.",
	"error.invalidVariable": "Invalid variable name: \"%s\". It must not start with a digit.",
	"error.level0Root": "Level 0 root occured.",
	"error.nonAlphanumericVariableName": "Invalid variable name: \"%s\". It must only consist of alphanumeric characters and underscores.",
	"error.nothingToCalculate": "There is nothing to calculate.",
	"error.numberOutOfRange": "Numbers involved in the calculation are too large or too small.",
	"error.reservedVariable": "Ans and PreAns are reserved variables and cannot be set.",
	"error.trailingSign": "Trailing positive/negative sign.",
	"error.unexpectedClosingBrace": "Unexpected closing brace.",
	"error.unexpectedDecimalSeparator": "Unexpected decimal separator.",
	"error.unexpectedDigit": "Unexpected digit.",
	"error.unexpectedEnd": "Unexpected end.",
	"error.unexpectedEqual": "Unexpected equal sign.",
	"error.unexpectedOperand": "Unexpected operand.",
	"error.unexpectedPercent": "Unexpected percent sign.",
	"error.unexpectedSemicolon": "Unexpected semicolon.",
	"error.unexpectedThousandSeparator": "Unexpected thousand separator.",
	"error.unknownFunction": "Unknown function: \"%s\".",
	"error.unknownSymbol": "Unknown symbol.",
	"error.unmatchingBraces": "Unmatching braces.",
	"error.unsupportedExponentiation": "Unsupported exponentiation: %s ^ %s.",
	"error.variableNotSet": "Variable \"%s\" is not set."
}

let engine = new CalculatorEngine;

//document.engine = engine;

let screen = document.getElementById("mainScreen");

function addOutput(html) {
	let element = document.createElement("div");
	element.className = "row scale-transition scale-out nomargin";
	element.innerHTML = `<div class="col s12"><div class="card white"><div class="card-content black-text">${html}</div></div></div>`;
	document.getElementById("resultsPanel").appendChild(element);
	setTimeout(() => {
		element.classList.add("scale-in");
	}, 1);
	element.scrollIntoView();
}

let inputBox = document.getElementById("input");

let calculate = () => {
	let expression = inputBox.value.trim();
	if (expression == '')
		if (config.calculateLastIfEmpty && lastExpression != null) expression = lastExpression; else return;
	try {
		addOutput(`${expression}<br><span class=result>= ${Utils.formatNumber(engine.calculate(expression), engine)}</span>`);
		inputBox.value = "";
		lastExpression = expression;
	} catch (e) {
		if (e instanceof ExpressionInvalidException) {
			let errorString = stringMap["error." + e.message];
			if (e.messageArguments != null) for (let arg of e.messageArguments) errorString = errorString.replace("%s", arg);
			addOutput(`${expression}<br><span class="red-text">ERROR at position ${e.position}:<br>${errorString}</span>`);
			inputBox.setSelectionRange(e.position, e.position);
		} else throw e;
	}
	hasOutputSinceLastSettingsChange = true;
}

inputBox.onkeydown = (event) => {
	if (event.key != "Enter") return;
	calculate();
}

let keyInputEvent = (event) => {
	setInput(inputBox.value + event.target.innerHTML);
}

function registerKeys(element) {
	for (let key of element.children)
		if (key.dataset.special !== "") key.onclick = keyInputEvent;
}
let keyboardLeft1 = document.getElementById("keyboardLeft1");
let keyboardLeft2 = document.getElementById("keyboardLeft2");

registerKeys(keyboardLeft1);
registerKeys(keyboardLeft2);
registerKeys(document.getElementById("keyboardRight"));

let keyP1 = document.getElementById("keyP1");
let keyP2 = document.getElementById("keyP2");

keyP1.onclick = () => {
	keyboardLeft1.style.display = "grid";
	keyboardLeft2.style.display = "none";
	keyP1.className = "key purple accent-1";
	keyP2.className = "key grey lighten-1";
}

keyP2.onclick = () => {
	keyboardLeft2.style.display = "grid";
	keyboardLeft1.style.display = "none";
	keyP2.className = "key purple accent-1";
	keyP1.className = "key grey lighten-1";
}

let keyboardVisible = false;
let keyboardButton = document.getElementById("keyboardButton");
let keyboardFiller = document.getElementById("keyboardFiller");
let keyboard = document.getElementById("keyboard");

function scroll() {
	inputBox.scrollIntoView();
}

keyboardButton.onclick = () => {
	keyboardVisible = true;
	keyboardButton.style.display = "none";
	keyboardFiller.className = "keyboardFillerVisible";
	keyboard.className = "keyboardVisible";
	setTimeout(scroll, 150);
}

let hideKeyboard = () => {
	keyboardVisible = false;
	keyboardFiller.className = "keyboardFillerHidden";
	keyboard.className = "keyboardHidden";
	keyboardButton.style.display = "block";
}

inputBox.onfocus = hideKeyboard;
document.getElementById("keyHide").onclick = hideKeyboard;

function setInput(newInput) {
	inputBox.value = newInput;
	scroll();
}

document.getElementById("keyClear").onclick = () => {
	setInput("");
}

document.getElementById("keyBackspace").onclick = () => {
	setInput(inputBox.value.slice(0, -1));
}

document.getElementById("keySpace").onclick = () => {
	setInput(inputBox.value + " ");
}

document.getElementById("keyEnter").onclick = calculate;
document.getElementById("clearButton").onclick = () => {
	document.getElementById("resultsPanel").innerHTML = "";
}

M.Tabs.init(document.getElementById("navigation"), {
	onShow: (page) => {
		if (page.id == "calculateScreen") {
			if (keyboardVisible) {
				keyboardFiller.className = "keyboardFillerVisible";
				keyboard.className = "keyboardVisible";
			} else {
				keyboardButton.style.display = "block";
			}
			clearButton.style.display = "block";
		} else {	
			keyboardButton.style.display = clearButton.style.display = "none";
			if (keyboardVisible) {
				keyboardFiller.className = "keyboardFillerHidden";
				keyboard.className = "keyboardHidden";
			}
		}
	}
});

// Config loading.

let
	lastExpression = null,
	hasOutputSinceLastSettingsChange = false,
	config = {
		angleUnit: "DEGREE",
		decimalDot: false,
		enforceDecimalSeparator: false,
		thousandDot: false,
		mulAsterisk: false,
		zeroUndefinedVars: false,
		calculateLastIfEmpty: true,
	};

function updateKeys() {
	document.getElementById("keyMultiply").innerHTML = config.mulAsterisk ? "×" : ".";
	document.getElementById("keyDivide").innerHTML = config.mulAsterisk ? "÷" : ":";
	document.getElementById("keyDecimalSeparator").innerHTML = config.decimalDot ? "." : ",";
	document.getElementById("keyExp").innerHTML = config.mulAsterisk ? "×10^" : ".10^";
}

function loadConfig() {
	engine.angleUnit = AngleUnit[config.angleUnit];
	engine.decimalDot = config.decimalDot;
	engine.enforceDecimalSeparator = config.enforceDecimalSeparator;
	engine.thousandDot = config.thousandDot;
	engine.mulAsterisk = config.mulAsterisk;
	engine.zeroUndefinedVars = config.zeroUndefinedVars;
	updateKeys();
}

function saveConfig() {
	localStorage.config = JSON.stringify(config);
}

if ("config" in localStorage) config = JSON.parse(localStorage.config); else saveConfig();
loadConfig();
switch (config.angleUnit) {
	case "DEGREE": document.getElementById("angleUnitDegree").checked = true; break;
	case "RADIAN": document.getElementById("angleUnitRadian").checked = true; break;
	case "GRADIAN": document.getElementById("angleUnitGradian").checked = true; break;
}
document.getElementById(config.decimalDot ? "decimalSeparatorDot" : "decimalSeparatorComma").checked = true;
document.getElementById("enforceDecimalSeparator").checked = config.enforceDecimalSeparator;
document.getElementById(config.thousandDot ? "thousandSeparatorDot" : "thousandSeparatorSpace").checked = true;
document.getElementById(config.mulAsterisk ? "multiplicationSignAsterisk" : "multiplicationSignDot").checked = true;
document.getElementById(config.zeroUndefinedVars ? "undefinedDefaultTo0" : "undefinedRaiseError").checked = true;
document.getElementById("calculateLastIfEmpty").checked = config.calculateLastIfEmpty;

function loadStartupExpressions() {
	let lineNumber = 0;
	for (let line of localStorage.startupExpressions.split("\n")) {
		lineNumber++;
		let expression = line;
		let doubleSlashPosition = expression.indexOf("//");
		if (doubleSlashPosition != -1) expression = expression.substring(0, doubleSlashPosition).trim();
		if (expression.trim() != "") {
			try {
				engine.calculate(expression);
			} catch (e) {
				if (!(e instanceof ExpressionInvalidException)) throw e;
				expression = line.trim();
				let errorString = stringMap["error." + e.message];
				if (e.messageArguments != null) for (let arg of e.messageArguments) errorString = errorString.replace("%s", arg);
				addOutput(`<span class=red-text>Error while evaluating startup expressions at line ${lineNumber}${e.position == -1 ? "" : `, column ${e.position+1}`}:</span><br>${expression}<br><span class="red-text">${errorString}</span>`);
				hasOutputSinceLastSettingsChange = true;
			}
		}
	}
}

if (!("startupExpressions" in localStorage)) localStorage.startupExpressions = `// Expressions here will be evaluated silently at startup, unless there are errors.
// Double slash will make the app ignore itself and any text behind it on that line.

// Basic mathematical constants
π = pi = 3,14159265358979323846
φ = phi = goldenRatio = golden_ratio = 0,5 + 0,5·2#5
lne = 2,718281828459045 // Euler's number.

// SI prefixes
yocto = 10^-24
zepto = 10^-21
atto = 10^-18
femto = 10^-15
pico = 10^-12
nano = 10^-9
micro = 10^-6
milli = 0,001
centi = 0,01
deci = 0,1
deca = 10
hecto = 100
kilo = 1000
mega = 10^6
giga = 10^9
tera = 10^12
peta = 10^15
exa = 10^18
zetta = 10^21
yotta = 10^24

// Clean Ans and PreAns.
0
0`;

document.getElementById("startupExpressions").value = localStorage.startupExpressions;
loadStartupExpressions();

// Settings change handlers.

function onFormatsUpdated() {
	if (!hasOutputSinceLastSettingsChange) return;
	addOutput("<span class=purple-text>Settings have changed. The results above may not be in the current formats.</span>");
	hasOutputSinceLastSettingsChange = false;
}

function changeAngleUnit(angleUnit) {
	engine.angleUnit = AngleUnit[angleUnit];
	config.angleUnit = angleUnit;
	saveConfig();
	onFormatsUpdated();
}

document.getElementById("angleUnitDegree").onchange = () => { changeAngleUnit("DEGREE") };
document.getElementById("angleUnitRadian").onchange = () => { changeAngleUnit("RADIAN") };
document.getElementById("angleUnitGradian").onchange = () => { changeAngleUnit("GRADIAN") };

document.getElementById("decimalSeparatorDot").onchange = document.getElementById("decimalSeparatorComma").onchange = () => {
	config.decimalDot = engine.decimalDot = document.getElementById("decimalSeparatorDot").checked;
	if (engine.decimalDot || engine.thousandDot) {
		document.getElementById("multiplicationSignAsterisk").checked = true;
	}
	saveConfig();
	updateKeys();
	onFormatsUpdated();
};

document.getElementById("enforceDecimalSeparator").onchange = () => {
	config.enforceDecimalSeparator = engine.decenforceDecimalSeparatorimalDot = document.getElementById("enforceDecimalSeparator").checked;
	saveConfig();
};

document.getElementById("thousandSeparatorDot").onchange = document.getElementById("thousandSeparatorSpace").onchange = () => {
	config.thousandDot = engine.thousandDot = document.getElementById("thousandSeparatorDot").checked;
	if (engine.decimalDot || engine.thousandDot) {
		document.getElementById("multiplicationSignAsterisk").checked = true;
	}
	saveConfig();
	updateKeys();
	onFormatsUpdated();
};

document.getElementById("multiplicationSignDot").onchange = document.getElementById("multiplicationSignAsterisk").onchange = () => {
	config.mulAsterisk = engine.mulAsterisk = document.getElementById("multiplicationSignAsterisk").checked;
	if (!engine.mulAsterisk) {
		document.getElementById("thousandSeparatorSpace").checked = true;
		document.getElementById("decimalSeparatorComma").checked = true;
	}
	saveConfig();
	updateKeys();
	onFormatsUpdated();
};

document.getElementById("undefinedRaiseError").onchange = document.getElementById("undefinedDefaultTo0").onchange = () => {
	config.zeroUndefinedVars = engine.zeroUndefinedVars = document.getElementById("undefinedDefaultTo0").checked;
	saveConfig();
};

document.getElementById("calculateLastIfEmpty").onchange = () => {
	config.calculateLastIfEmpty = document.getElementById("calculateLastIfEmpty").checked;
	saveConfig();
};

document.getElementById("applyStartupExpressions").onclick = () => {
	localStorage.startupExpressions = document.getElementById("startupExpressions").value;
	addOutput("<span class=purple-text>The calculation engine was restarted to reload startup expressions.</span>");
	engine = new CalculatorEngine();
	loadConfig();
	loadStartupExpressions();
}

// Everything has finished.

document.body.style.visibility = "visible";