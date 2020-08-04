/* Kick data for tetriminoes J; S; L; T; Z.
– First level: originsal state.
– Second level: destination state.
*/
const kickJSLTZ = {
	0: {
		1: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
		3: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]]
	},
	1: {
		2: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
		0: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
	},
	2: {
		3: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
		1: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]
	},
	3: {
		0: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
		2: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]]
	}
};

class Tetrimino {
	constructor() {
		this.state = 0; // 0 → 1 → 2 → 3 → 0: clockwise.
		// Starting position.
		this.x = 4;
		this.y = 19;
		// For converting to Fumen which uses a bit different position scheme.
		this.fumenOffsetX = this.fumenOffsetY = [0, 0, 0, 0];
	}

	checkCollision(board, x = null, y = null, state = null) {
		x = x == null ? this.x : x;
		y = y == null ? this.y : y;
		state = state == null ? this.state : state;
		for (let mino of this.states[state]) {
			let minoX = x + mino[0];
			let minoY = y + mino[1];
			if (
				minoX < 0 || minoX > 9 ||
				minoY < 0 || minoY > 39 ||
				board[minoX][minoY] != undefined
			) return true;
		}
		return false;
	}

	render(screen) {
		for (let mino of this.states[this.state]) {
			screen.renderMino(this.x + mino[0], this.y + mino[1], mino[2], this.textureY);
		}
	}

	tryChangeState(board, newState) {
		for (let kickPos of this.kickData[this.state][newState]) {
			let newX = this.x + kickPos[0];
			let newY = this.y + kickPos[1];
			if (!this.checkCollision(board, newX, newY, newState)) {
				this.state = newState;
				this.x = newX;
				this.y = newY;
				return true;
			}
		}
		return false;
	}

	rotateClockwise(board) {
		return this.tryChangeState(board, (this.state + 1) % 4);
	}

	rotateCounterClockwise(board) {
		return this.tryChangeState(board, (this.state + 3) % 4);
	}

	// Retrieves mino locations and data when the tetrimino is locked.
	getLockPositions() {
		let res = [];
		for (let mino of this.states[this.state]) {
			res.push([this.x + mino[0], this.y + mino[1], mino[2]]);
		}
		return res;
	}

	canFall(board) {
		return !this.checkCollision(board, this.x, this.y + 1);
	}
}

class TetriminoI extends Tetrimino {
	constructor() {
		super();
		/* Tetrimino states.
		Each state consists of 4 minos containing:
		– X and Y positions relative to the center of the tetrimino.
		– Connected directions:
			+ 1: down
			+ 2: left
			+ 3: top
			+ 4: right
		*/
		this.states = [
			[[-1, 0, 8], [0, 0, 10], [1, 0, 10], [2, 0, 2]],
			[[1, -1, 1], [1, 0, 5], [1, 1, 5], [1, 2, 4]],
			[[-1, 1, 8], [0, 1, 10], [1, 1, 10], [2, 1, 2]],
			[[0, -1, 1], [0, 0, 5], [0, 1, 5], [0, 2, 4]]
		];
		// The lowest Y of each state relative to the tetrimino center. Used to calculate points when locking.
		this.baseY = [0, 2, 1, 2];
		// The highest Y of each state. Used to check whether warning whould be given.
		this.topY = [0, -1, 1, -1];
		// The lowest X of each state. Used for positioning hard drop particles.
		this.leftX = [-1, 1, -1, 0];
		// The width of each state. Used for positioning hard drop particles.
		this.width = [4, 1, 4, 1];
		this.kickData = {
			0: {
				1: [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
				3: [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]]
			},
			1: {
				2: [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
				0: [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]]
			},
			2: {
				3: [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
				1: [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]]
			},
			3: {
				0: [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
				2: [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]]
			}
		}
		this.textureY = 8;
		this.outlineColor = "#009898"; // Used for drawing ghost pieces.
		this.code = "I"; // Used for saving replays.
		this.fumenOffsetX = [0, 1, 1, 0];
		this.fumenOffsetY = [0, 0, -1, -1];
	}
}

class TetriminoJ extends Tetrimino {
	constructor() {
		super();
		this.states = [
			[[-1, -1, 1], [-1, 0, 12], [0, 0, 10], [1, 0, 2]],
			[[1, -1, 2], [0, -1, 9], [0, 0, 5], [0, 1, 4]],
			[[-1, 0, 8], [0, 0, 10], [1, 0, 3], [1, 1, 4]],
			[[0, -1, 1], [0, 0, 5], [0, 1, 6], [-1, 1, 8]]
		];
		this.baseY = [0, 1, 1, 1];
		this.topY = [-1, -1, 0, -1];
		this.leftX = [-1, 0, -1, -1];
		this.width = [3, 2, 3, 2];
		this.kickData = kickJSLTZ;
		this.textureY = 16;
		this.outlineColor = "#333398";
		this.code = "J";
	}
}

class TetriminoL extends Tetrimino {
	constructor() {
		super();
		this.states = [
			[[-1, 0, 8], [0, 0, 10], [1, 0, 6], [1, -1, 1]],
			[[0, -1, 1], [0, 0, 5], [0, 1, 12], [1, 1, 2]],
			[[-1, 1, 4], [-1, 0, 9], [0, 0, 10], [1, 0, 2]],
			[[-1, -1, 8], [0, -1, 3], [0, 0, 5], [0, 1, 4]]
		];
		this.baseY = [0, 1, 1, 1];
		this.topY = [-1, -1, 0, -1];
		this.leftX = [-1, 0, -1, -1];
		this.width = [3, 2, 3, 2];
		this.kickData = kickJSLTZ;
		this.textureY = 24;
		this.outlineColor = "#986500";
		this.code = "L";
	}
}

class TetriminoO extends Tetrimino {
	constructor() {
		super();
		this.states = [
			[[0, -1, 9], [1, -1, 3], [1, 0, 6], [0, 0, 12]]
		];
		this.baseY = [0];
		this.topY = [-1];
		this.leftX = [0];
		this.width = [2];
		this.textureY = 32;
		this.outlineColor = "#989800";
		this.code = "O";
	}

	tryChangeState(board, newState) {}
}

class TetriminoS extends Tetrimino {
	constructor() {
		super();
		this.states = [
			[[-1, 0, 8], [0, 0, 6], [0, -1, 9], [1, -1, 2]],
			[[0, -1, 1], [0, 0, 12], [1, 0, 3], [1, 1, 4]],
			[[-1, 1, 8], [0, 1, 6], [0, 0, 9], [1, 0, 2]],
			[[-1, -1, 1], [-1, 0, 12], [0, 0, 3], [0, 1, 4]]
		];
		this.baseY = [0, 1, 1, 1];
		this.topY = [-1, -1, 0, -1];
		this.leftX = [-1, 0, -1, -1];
		this.width = [3, 2, 3, 2];
		this.kickData = kickJSLTZ;
		this.textureY = 40;
		this.outlineColor = "#009800";
		this.code = "S";
	}
}

class TetriminoT extends Tetrimino {
	constructor() {
		super();
		this.states = [
			[[-1, 0, 8], [0, 0, 14], [1, 0, 2], [0, -1, 1]],
			[[0, -1, 1], [0, 0, 13], [0, 1, 4], [1, 0, 2]],
			[[-1, 0, 8], [0, 0, 11], [1, 0, 2], [0, 1, 4]],
			[[0, -1, 1], [0, 0, 7], [0, 1, 4], [-1, 0, 8]]
		];
		this.baseY = [0, 1, 1, 1];
		this.topY = [-1, -1, 0, -1];
		this.leftX = [-1, 0, -1, -1];
		this.width = [3, 2, 3, 2];
		this.kickData = kickJSLTZ;
		this.textureY = 48;
		this.outlineColor = "#692398";
		this.code = "T";
	}

	// For detecting T-spins.
	isImmobile(board) {
		return this.checkCollision(board, this.x - 1, this.y) &&
			this.checkCollision(board, this.x + 1, this.y) &&
			this.checkCollision(board, this.x, this.y - 1) &&
			this.checkCollision(board, this.x, this.y + 1);
	}
}

class TetriminoZ extends Tetrimino {
	constructor() {
		super();
		this.states = [
			[[-1, -1, 8], [0, -1, 3], [0, 0, 12], [1, 0, 2]],
			[[1, -1, 1], [1, 0, 6], [0, 0, 9], [0, 1, 4]],
			[[-1, 0, 8], [0, 0, 3], [0, 1, 12], [1, 1, 2]],
			[[0, -1, 1], [0, 0, 6], [-1, 0, 9], [-1, 1, 4]]
		];
		this.baseY = [0, 1, 1, 1];
		this.topY = [-1, -1, 0, -1];
		this.leftX = [-1, 0, -1, -1];
		this.width = [3, 2, 3, 2];
		this.kickData = kickJSLTZ;
		this.textureY = 56;
		this.outlineColor = "#983030";
		this.code = "Z";
	}
}

const tetriminoTypeMapping = {
	O: TetriminoO,
	I: TetriminoI,
	T: TetriminoT,
	J: TetriminoJ,
	L: TetriminoL,
	S: TetriminoS,
	Z: TetriminoZ,
};

class Mino {
	constructor(directions, textureY) {
		this.directions = directions;
		this.textureY = textureY;
	}
}