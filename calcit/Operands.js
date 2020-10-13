import { ExpressionInvalidException } from "./ExpressionInvalidException.js";
import * as Utils from "./Utils.js";

class Operand {
	constructor(characters, priority, reversed = false) {
		this.characters = characters;
		this.reversed = reversed;
		this.priority = priority;
	}

	calculate(val1, val2, engine) {};
}

export class Plus extends Operand {
	constructor() {
		super([ "+" ], 1);
	}
	calculate(val1, val2, engine) {
		return val1 + val2;
	}
}

export class Minus extends Operand {
	constructor() {
		super([ "-", "–" ], 1);
	}
	calculate(val1, val2, engine) {
		return val1 - val2;
	}
}

export class Multiply extends Operand {
	constructor() {
		super([ ".", "*", "·", "×" ], 2);
	}
	calculate(val1, val2, engine) {
		return val1 * val2;
	}
}

export class Divide extends Operand {
	constructor() {
		super([ ":", "/", "÷" ], 2);
	}
	calculate(val1, val2, engine) {
		if (val2 == 0) throw new ExpressionInvalidException("divisionByZero");
		return val1 / val2;
	}
}

export class Exponentiation extends Operand {
	constructor() {
		super([ "^" ], 4, true);
	}
	calculate(val1, val2, engine) {
		return Utils.power(val1, val2, engine);
	}
}

export class Root extends Operand {
	constructor() {
		super([ "#", "√" ], 4);
	}
	calculate(val1, val2, engine) {
		if (val1 == 0) throw new ExpressionInvalidException("level0Root");
		return Utils.power(val2, 1 / val1, engine);
	}
}

export class OpeningBrace extends Operand {
	constructor() {
		super([ "(", "[", "{", "<" ], -2);
	}
	calculate(val1, val2, engine) {
		throw new ExpressionInvalidException("braceInvolved");
	}
}

export class ClosingBrace extends Operand {
	constructor() {
		super([ ")", "]", "}", ">" ], -2);
	}
	calculate(val1, val2, engine) {
		throw new ExpressionInvalidException("braceInvolved");
	}
}

export class DotlessMultiplication extends Operand {
	constructor() {
		super([ "." ], 3);
	}
	calculate(val1, val2, engine) {
		return val1 * val2;
	}
}