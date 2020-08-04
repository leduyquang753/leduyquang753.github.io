const buttonList = ["left", "right", "softDrop", "hardDrop", "rotateCounterClockwise", "rotateClockwise"];

class PlayScreenBase {
	constructor(parent, gridX, gridY, nextX, nextY, holdX, holdY, minoSize, showKeystrokes, doSaveReplay) {
		this.parent = parent;
		this.gridX = gridX;
		this.gridY = gridY;
		this.nextX = nextX;
		this.nextY = nextY;
		this.holdX = holdX;
		this.holdY = holdY;
		this.minoSize = minoSize;
		this.random = new MersenneTwister();
		this.board = [];
		let col = [];
		this.minos = [];
		this.totalMinos = 0;
		for (let i = 0; i < 40; i++) {
			col.push(undefined);
			this.minos.push(0);
		}
		for (let i = 0; i < 10; i++) this.board.push([...col]);
		this.score = 0;
		this.lines = 0;
		this.current = null;
		this.queue = [];
		this.hold = null;
		this.combo = -1;
		this.backToBack = false;
		this.moveCounter = 0;
		this.softDropCounter = -1;
		this.softDropLock = false;
		this.buttonMoveLeft = false;
		this.moveLeftCounter = -1;
		this.oldMoveLeftCounter = -1;
		this.buttonMoveRight = false;
		this.moveRightCounter = -1;
		this.oldMoveRightCounter = -1;
		this.autoRepeatDelay = 150;
		this.autoRepeatPeriod = 40;
		this.softDropPeriod = 25;
		this.fallTime = 0;
		this.lockTime = 0;
		this.maxY = 0;
		this.clearTime = 0;
		this.oldTime = null;
		this.state = GameState.warmup;
		this.buttonHardDrop = false;
		this.buttonRotateClockwise = false;
		this.buttonRotateCounterClockwise = false;
		this.buttonHold = false;
		this.buttonEsc = false;
		this.buttonVolumeUp = false;
		this.buttonVolumeDown = false;
		this.volumeDisplayTime = 0;
		this.rewardName = "";
		this.rewardAmount = 0;
		this.rewardTime = 0;
		this.holdSwitched = false;
		this.playTime = 0;
		this.stats = [[null, 0, null], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, null, null]]; // First level: number of lines cleared; Second level: normal, by T-spin, total.
		this.clearedLines = [];
		this.clearEffectTime = 1000;
		this.tetriminoes = 0;
		this.rewardNames = [
			"Single",
			"Double",
			"Triple",
			"Tetris",
			"T-spin",
			"T-spin single",
			"T-spin double",
			"T-spin triple"
		];
		this.rewardAmounts = [100, 400, 900, 2500, 50, 150, 600, 1250];
		this.warmupLeft = 5;
		this.warmupSecond = 0;
		this.showKeystrokes = showKeystrokes;
		this.stackMinY = 40;
		this.particles = [];
		this.holds = 0;
		this.keypresses = 0;
		this.wasNull = true;
		this.moveLock = 0; // 0: None; 1: Left 2: Right.
		if (this.doSaveReplay = doSaveReplay) this.replay = {
			states: [],
			actions: [],
			mode: this.getModeName(),
			modeParameters: {}
		};
		this.singleSaveableFields = ["score", "lines", "combo", "backToBack", "rewardName", "rewardAmount", "rewardTime", "lockScore", "holdSwitched", "clearedLines", "clearEffectTime", "tetriminoes", "holds", "keypressed", "wasNull", "moveLock", "isClearing"];
		this.isReplay = false;
		this.isClearing = false;
		this.isSeeking = false;
		this.replaySpeed = 1;
		this.actionQueue = [];
		this.actionMapping = [
			(timestamp) => { this.fall(timestamp) },
			(timestamp) => { this.lockDown(timestamp); },
			(timestamp) => { this.softDrop(timestamp); },
			(timestamp) => { this.hardDrop(timestamp); },
			(timestamp) => { this.rotateClockwise(timestamp); },
			(timestamp) => { this.rotateCounterClockwise(timestamp); },
			(timestamp) => { this.doHold(timestamp); },
			(timestamp) => { this.move(-1, false, timestamp); },
			(timestamp) => { this.move(-1, true, timestamp); },
			(timestamp) => { this.move(1, false, timestamp); },
			(timestamp) => { this.move(1, true, timestamp); }
		];
		this.actionCompareFunc = (a, b) => {
			if (a[2] - b[2]) return a[2] - b[2];
			else return a[0] - b[0];
		};
	}

	init() {
		if (!this.isReplay) {
			this.pushToQueue();
			sfx.ready.play();
		}
	}

	start() {
		this.state = GameState.playing;
		if (!this.isReplay)	this.nextTetrimino();
		if (this.doSaveReplay) this.saveState();
	}

	processGameLogic(timePassed) {
		let latestTime = this.playTime + timePassed;
		if (this.state == GameState.playing) {
			this.clearTime -= timePassed;
			if (!this.isReplay && this.clearTime < 1 && this.current == null) this.afterClear();
			let fallInterval = this.getFallInterval();
			let iStart = fallInterval == 0 ? this.playTime : this.playTime + fallInterval - (this.fallTime %= fallInterval);
			this.fallTime -= Math.min(0, this.clearTime);
			this.clearTime = Math.max(0, this.clearTime);
			if (this.isNewLevel && this.clearTime == 0) this.isNewLevel = false;
			if (!this.isReplay && this.current != null) {
				if (this.current.canFall(this.board)) {
					for (let i = iStart, j = 0; fallInterval <= this.fallTime && j < 22; i += fallInterval, this.fallTime -= fallInterval, j++) {
						this.actionQueue.push([0, "fall", i]);
					}
				} else {
					if ((this.lockTime += timePassed) >= this.getLockDelay()) {
						this.actionQueue.push([1, "lockDown", latestTime]);
					}
				}
				if (buttonStatus.softDrop) {
					if (this.softDropCounter == -1) {
						this.actionQueue.push([2, "softDrop", latestTime]);
						this.softDropCounter = 0;
						this.addKeypress();
					} else {
						this.softDropCounter += timePassed;
						for (let i = this.softDropPeriod, count = 0; this.softDropPeriod < this.softDropCounter && count < 21; i += this.softDropPeriod, this.softDropCounter -= this.softDropPeriod, count++)
							this.actionQueue.push([2, "softDrop", this.playTime + i]);
					}
				} else {
					this.softDropCounter = -1;
				}
				if (buttonStatus.hardDrop) {
					if (!this.buttonHardDrop) {
						this.actionQueue.push([3, "hardDrop", latestTime]);
						this.buttonHardDrop = true;
					}
				} else this.buttonHardDrop = false;
				if (buttonStatus.rotateClockwise) {
					if (!this.buttonRotateClockwise) {
						this.actionQueue.push([4, "rotateClockwise", latestTime]);
						this.buttonRotateClockwise = true;
					}
				} else this.buttonRotateClockwise = false;
				if (buttonStatus.rotateCounterClockwise) {
					if (!this.buttonRotateCounterClockwise) {
						this.actionQueue.push([5, "rotateCounterClockwise", latestTime]);
						this.buttonRotateCounterClockwise = true;
					}
				} else this.buttonRotateCounterClockwise = false;
				if (buttonStatus.hold) {
					if (!this.buttonHold) {
						this.actionQueue.push([6, "doHold", latestTime]);
						this.buttonHold = true;
					}
				} else this.buttonHold = false;
			}
			
			let moveEvents = [];
			if (buttonStatus.left) {
				if (!this.buttonMoveLeft || this.moveLock != 2) {
					if (this.moveLeftCounter == -1) {
						moveEvents.push([8, "moveLeft", latestTime]);
						this.moveLeftCounter = this.oldMoveLeftCounter = 0;
						this.moveLock = 1;
					} else {
						let time = this.autoRepeatPeriod == 0 ? latestTime : this.playTime + this.autoRepeatPeriod - (this.moveLeftCounter - this.autoRepeatDelay) % this.autoRepeatPeriod;
						this.moveLeftCounter += timePassed;
						for (let i = 0; i <= Math.floor((this.moveLeftCounter - this.autoRepeatDelay) / this.autoRepeatPeriod) - this.oldMoveLeftCounter && i < 9; i++) {
							moveEvents.push([7, "moveLeft", time]);
							time += this.autoRepeatPeriod;
						}
						this.oldMoveLeftCounter = this.autoRepeatPeriod == 0 ? 0 : Math.max(0, Math.floor((this.moveLeftCounter - this.autoRepeatDelay) / this.autoRepeatPeriod));
					}
					this.buttonMoveLeft = true;
				} else {
					this.moveLeftCounter = -1;
				}
			} else {
				this.moveLeftCounter = -1;
				this.moveLock = 0;
				this.buttonMoveLeft = false;
			}
			if (buttonStatus.right) {
				if (!this.buttonMoveRight || this.moveLock != 1) {
					moveEvents = [];
					if (this.moveRightCounter == -1) {
						moveEvents.push([10, "moveRight", latestTime]);
						this.moveRightCounter = this.oldMoveRightCounter = 0;
						this.moveLock = 2;
					} else {
						let time = this.autoRepeatPeriod == 0 ? latestTime : this.playTime + this.autoRepeatPeriod - (this.moveRightCounter - this.autoRepeatDelay) % this.autoRepeatPeriod;
						this.moveRightCounter += timePassed;
						for (let i = 0; i <= Math.floor((this.moveRightCounter - this.autoRepeatDelay) / this.autoRepeatPeriod) - this.oldMoveRightCounter && i < 9; i++) {
							moveEvents.push([9, "moveRight", time]);
							time += this.autoRepeatPeriod;
						}
						this.oldMoveRightCounter = this.autoRepeatPeriod == 0 ? 0 : Math.max(0, Math.floor((this.moveRightCounter - this.autoRepeatDelay) / this.autoRepeatPeriod));
					}
					this.buttonMoveRight = true;
				} else {
					this.moveRightCounter = -1;
				}
			} else {
				this.moveRightCounter = -1;
				this.moveLock = 0;
				this.buttonMoveRight = false;
			}
			this.actionQueue.push(...moveEvents);
			
			let old = 0;
			for (let action of this.actionQueue.sort(this.actionCompareFunc)) this.actionMapping[action[0]](action[2]);
			this.actionQueue = [];
			this.fallTime = fallInterval == 0 ? 0 : this.fallTime % fallInterval;

			this.playTime = latestTime;
			if (this.doSaveReplay && Math.floor(this.playTime / 120000) >= this.replay.states.length) this.saveState();
			this.handleReplayEpoch(this.playTime);
		} else if (this.state == GameState.warmup) {
			this.warmupSecond -= timePassed;
			if (this.warmupSecond < 1) {
				this.warmupLeft--;
				if (this.warmupLeft == -1) {
					this.start();
				} else {
					this.warmupSecond += 1000;
					if (this.warmupLeft < 3) sfx.countdown.play();
				}
			}
		}

		if (buttonStatus.esc) {
			if (!this.buttonEsc) {
				switch (this.state) {
					case GameState.playing:
						if (buttonStatus.quitModifier) {
							this.quit();
							break;
						}
						this.pause();
						break;
					case GameState.paused:
						if (buttonStatus.quitModifier) {
							this.quit();
							break;
						}
						this.resume();
						break;
					case GameState.over:
						if (this.doSaveReplay && buttonStatus.quitModifier) {
							let date = new Date();
							createAndDownloadFile(`${this.getModeNameForDisplay()} – ${date.getHours()}h${date.getMinutes()<10?"0":""}${date.getMinutes()}.${date.getSeconds()<10?"0":""}${date.getSeconds()} ${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}.tetreml_replay`, pako.gzip(JSON.stringify(this.replay)));
						}
						else this.quit();
						break;
				}
				this.buttonEsc = true;
			}
		} else this.buttonEsc = false;

		if (buttonStatus.volumeUp) {
			if (!this.buttonVolumeUp) {
				setVolume(volume + 1);
				this.volumeDisplayTime = 1000;
				this.buttonVolumeUp = true;
			}
		} else this.buttonVolumeUp = false;

		if (buttonStatus.volumeDown) {
			if (!this.buttonVolumeDown) {
				setVolume(volume - 1);
				this.volumeDisplayTime = 1000;
				this.buttonVolumeDown = true;
			}
		} else this.buttonVolumeDown = false;
	}

	addKeypress() {
		if (this.current != null) this.keypresses++;
	}

	render() {
		let timePassed = 0;
		if (this.oldTime == null) {
			this.oldTime = new Date().getTime();
			return;
		} else {
			let currentTime = new Date().getTime();
			timePassed = currentTime - this.oldTime;
			this.oldTime = currentTime;
		}
		this.processGameLogic(Math.floor(timePassed * (this.isReplay ? this.replaySpeed : 1)));
		
		// Actually render things on the screen.

		ctx.globalAlpha = 1;
		ctx.imageSmoothingEnabled = true;
		ctx.drawImage(playScreenImage, 0, 0);

		this.renderBehind(timePassed);

		ctx.imageSmoothingEnabled = false;

		if (this.state != GameState.paused && this.stackMinY < 24) {
			ctx.fillStyle = "#F00";
			ctx.globalAlpha = 0.4;
			ctx.fillRect(this.gridX, this.gridY + this.minoSize * 2 - 1, this.minoSize * 10, 2);
			if (this.state != GameState.over) {
				ctx.globalAlpha = 0.6;
				for (let mino of this.queue[0].states[0]) ctx.drawImage(sprite, 192, 0, 16, 16, this.gridX + this.minoSize * (4 + mino[0]), this.gridY + this.minoSize * (1 + mino[1]), this.minoSize, this.minoSize);
			}
		}

		if (this.isReplay || this.state != GameState.paused) {
			ctx.globalAlpha = 0.7;
			for (let x = 0; x < 10; x++) {
				for (let y = 18; y < 40; y++) {
					if (this.board[x][y] != undefined) this.renderMino(x, y, this.board[x][y].directions, this.board[x][y].textureY);
				}
			}
			ctx.globalAlpha = 1;
			if (this.current != null && this.state != GameState.over) for (let ghostY = this.current.y; true; ghostY++) {
				if (this.current.checkCollision(this.board, null, ghostY)) {
					ctx.fillStyle = this.current.outlineColor;
					let tetriminoX = this.gridX + this.current.x * this.minoSize;
					let tetriminoY = this.gridY + this.minoSize * (ghostY - 19);
					for (let mino of this.current.states[this.current.state]) {
						let minoX = tetriminoX + mino[0] * this.minoSize;
						let minoY = tetriminoY + mino[1] * this.minoSize;
						if (minoY < 4) continue;
						if (!(mino[2] & 1)) ctx.fillRect(minoX, minoY + this.minoSize - 2, this.minoSize, 2);
						if (!(mino[2] & 2)) ctx.fillRect(minoX, minoY, 2, this.minoSize);
						if (!(mino[2] & 4)) ctx.fillRect(minoX, minoY, this.minoSize, 2);
						if (!(mino[2] & 8)) ctx.fillRect(minoX + this.minoSize - 2, minoY, 2, 16);
						if ((mino[2] & 1) && (mino[2] & 2)) ctx.fillRect(minoX, minoY + this.minoSize - 2, 2, 2);
						if ((mino[2] & 2) && (mino[2] & 4)) ctx.fillRect(minoX, minoY, 2, 2);
						if ((mino[2] & 4) && (mino[2] & 8)) ctx.fillRect(minoX + this.minoSize - 2, minoY, 2, 2);
						if ((mino[2] & 8) && (mino[2] & 1)) ctx.fillRect(minoX + this.minoSize - 2, minoY + this.minoSize - 2, 2, 2);
					}
					break;
				}
			}
			if (this.current != null && this.state != GameState.over) {
				this.current.render(this);
			}
			if (this.hold != null) this.renderTetrimino(this.hold, this.holdX, this.holdY, this.holdSwitched);
			for (let i = 0; i < 3; i++) this.renderTetrimino(this.queue[i], this.nextX, this.nextY + this.minoSize * 3 * i);
		}

		if (this.showKeystrokes) {
			ctx.drawImage(sprite, buttonStatus.hardDrop ? 160 : 128, 0, 32, 32, this.gridX + 223, this.gridY + 203, 32, 32);
			ctx.drawImage(sprite, buttonStatus.left ? 160 : 128, 0, 32, 32, this.gridX + 189, this.gridY + 237, 32, 32);
			ctx.drawImage(sprite, buttonStatus.softDrop ? 160 : 128, 0, 32, 32, this.gridX + 223, this.gridY + 237, 32, 32);
			ctx.drawImage(sprite, buttonStatus.right ? 160 : 128, 0, 32, 32, this.gridX + 257, this.gridY + 237, 32, 32);
			ctx.drawImage(sprite, buttonStatus.rotateCounterClockwise ? 160 : 128, 0, 32, 32, this.gridX + 307, this.gridY + 203, 32, 32);
			ctx.drawImage(sprite, buttonStatus.rotateClockwise ? 160 : 128, 0, 32, 32, this.gridX + 341, this.gridY + 203, 32, 32);
			ctx.drawImage(sprite, 128, buttonStatus.hold ? 64 : 32, 66, 32, this.gridX + 307, this.gridY + 237, 66, 32);

			ctx.textAlign = "center";
			ctx.fillStyle = "#FFF";
			ctx.font = "12px Segoe UI";
			ctx.fillText(keyNames.hardDrop, this.gridX + 239, this.gridY + 224, 30);
			ctx.fillText(keyNames.left, this.gridX + 205, this.gridY + 258, 30);
			ctx.fillText(keyNames.softDrop, this.gridX + 239, this.gridY + 258, 30);
			ctx.fillText(keyNames.right, this.gridX + 273, this.gridY + 258, 30);
			ctx.fillText(keyNames.rotateCounterClockwise, this.gridX + 323, this.gridY + 224, 30);
			ctx.fillText(keyNames.rotateClockwise, this.gridX + 357, this.gridY + 224, 30);
			ctx.fillText(keyNames.hold, this.gridX + 340, this.gridY + 258, 62);
		}

		ctx.imageSmoothingEnabled = true;

		if (this.isReplay || this.state != GameState.paused) {
			let newParticles = [];
			for (let particle of this.particles) {
				let ratio = particle.time / particle.lifetime;
				ctx.drawImage(sprite, 208, 0, 9, 9, particle.x + 4.5 * ratio, particle.y - particle.distance * (1 - Math.pow((1 - ratio), 4)) - 4.5 * ratio, 9 * (1 - ratio), 9 * (1 - ratio));
				if ((particle.time += timePassed) < particle.lifetime) newParticles.push(particle);
			}
			this.particles = newParticles;
		}

		if (this.clearEffectTime < 151) {
			let ratio = this.clearEffectTime / 150;
			ctx.fillStyle = "rgb(255, 255, " + (255 * (1-ratio)) + ")";
			for (let line of this.clearedLines) ctx.fillRect(this.gridX - 2 * this.minoSize * ratio, this.gridY + this.minoSize * (line - 18) + this.minoSize / 2 * ratio, this.minoSize * (10 + 4 * ratio), this.minoSize * (1 - ratio));
			this.clearEffectTime += timePassed;
		}

		ctx.fillStyle = "#FFF";
		ctx.font = "9px Segoe UI";
		ctx.textAlign = "left";
		if (this.volumeDisplayTime > 0) {
			ctx.fillText(`Volume: ${volume} / 10`, 20, this.isReplay ? 15 : 351);
			this.volumeDisplayTime -= timePassed;
		} else {
			ctx.globalAlpha = 0.5;
			ctx.fillText(this.getModeNameForDisplay(), 20, this.isReplay ? 15 : 351);
		}
		ctx.globalAlpha = 1;

		switch (this.state) {
			case GameState.warmup:
				ctx.textAlign = "center";
				ctx.fillStyle = "#FF0";
				if (this.warmupLeft > 2) {
					if (this.warmupLeft == 3) ctx.globalAlpha = this.warmupSecond / 1000;
					ctx.font = "30px Segoe UI Light";
					ctx.fillText("READY", 320, 195);
				} else {
					ctx.font = "45px Segoe UI Light";
					ctx.fillText("" + this.warmupLeft, 320, 205);
				}
				break;
			case GameState.playing:
				if (this.isReplay) break;
				ctx.textAlign = "left";
				ctx.font = "12px Segoe UI";
				ctx.fillText(buttonStatus.quitModifier ? keyNames.quitModifier + "+" + keyNames.esc + " Quit" : keyNames.esc + " Pause", 10, 17);
				break;
			case GameState.paused:
				if (this.isReplay) break;
				ctx.textAlign = "center";
				ctx.globalAlpha = 1;
				ctx.fillStyle = "#FFF";
				ctx.font = "20px Segoe UI";
				ctx.fillText("PAUSED", 320, 121);
				ctx.font = "12px Segoe UI";
				ctx.fillText(keyNames.esc + " to continue.", 320, 141);
				ctx.textAlign = "left";
				if (buttonStatus.quitModifier) ctx.fillText(keyNames.quitModifier + "+" + keyNames.esc + " Quit", 10, 17);
				break;
			case GameState.over:
				ctx.textAlign = "center";
				ctx.globalAlpha = 0.6;
				ctx.fillStyle = "#000";
				ctx.fillRect(240, 4, 160, 352);
				ctx.globalAlpha = 1;
				ctx.fillStyle = "#FFF";
				ctx.font = "20px Segoe UI";
				ctx.fillText("GAME OVER", 320, 40);
				if (this.isReplay) break;
				ctx.font = "12px Segoe UI";
				ctx.fillText("Press " + keyNames.esc + " to continue.", 320, 333);
				ctx.fillText(keyNames.quitModifier + "+" + keyNames.esc + " to save replay.", 320, 348);
				break;
		}
		ctx.globalAlpha = 1;
		this.renderInFront(timePassed);
	}

	renderBehind(timePassed) { };

	renderInFront(timePassed) { };

	close() {
		
	}

	renderMino(x, y, directions, textureY) {
		if (y < 18 || y > 39) return;
		ctx.drawImage(sprite, 8 * directions, textureY, 8, 8, this.gridX + x * this.minoSize, this.gridY + this.minoSize*(y-18), this.minoSize, this.minoSize);
	}

	renderTetrimino(tetrimino, x, y, gray = false) {
		if (!(tetrimino instanceof TetriminoI) && !(tetrimino instanceof TetriminoO)) x += this.minoSize/2;
		if (tetrimino instanceof TetriminoI) y -= this.minoSize/2;
		for (let mino of tetrimino.states[0]) {
			ctx.drawImage(sprite, 8 * mino[2], gray ? 0 : tetrimino.textureY, 8, 8, x + this.minoSize * mino[0], y + this.minoSize * mino[1], this.minoSize, this.minoSize);
		}
	}

	afterClear() {
		if (!this.isSeeking && this.clearedLines.length != 0) sfx.afterClear.play();
		for (let line of this.clearedLines) {
			for (let i = 0; i < 10; i++) {
				this.board[i].splice(line, 1);
				this.board[i] = [undefined].concat(this.board[i]);
			}
			this.minos.splice(line, 1);
			this.minos = [0].concat(this.minos);
		}
		this.nextTetrimino();
		this.isClearing = false;
		this.recordAction("afterClear");
	}

	fall(timestamp) {
		if (this.current == null || !this.current.canFall(this.board)) return;
		if (++this.current.y > this.maxY) {
			this.lockTime = 0;
			this.moveCounter = 0;
			this.maxY = this.current.y;
		}
		if (!this.current.canFall(this.board)) {
			if (!this.isSeeking) sfx.land.play();
			this.lockTime = this.fallTime;
		}
		this.recordAction("fall", timestamp);
	}

	lockDown(timestamp) {
		this.lock(false);
		if (!this.isSeeking) sfx.lock.play();
		this.recordAction("lockDown", timestamp);
	}

	move(offset, isInitialPress, timestamp) {
		if (this.state == GameState.playing && this.current != null) {
			let newX = this.current.x + offset;
			if (!this.current.checkCollision(this.board, newX, this.current.y)) {
				this.current.x = newX;
				if (this.moveCounter++ < 15) this.lockTime = 0;
				if (!this.isSeeking) {
					sfx.move.play();
					if (this.current.checkCollision(this.board, newX + offset, this.current.y)) sfx.land.play();
				}
				if (isInitialPress || this.wasNull) this.addKeypress();
				this.wasNull = false;
				this.recordAction(offset == 1 ? "moveRight" : "moveLeft", timestamp);
				return true;
			}
		}
		this.wasNull = this.current == null;
		return false;
	}

	rotateClockwise(timestamp) {
		if (this.current != null && this.current.rotateClockwise(this.board)) {
			this.addKeypress();
			if (!this.isSeeking) sfx.rotate.play();
			if (this.moveCounter++ < 15) this.lockTime = 0;
			this.recordAction("rotateClockwise", timestamp);
		}
	}

	rotateCounterClockwise(timestamp) {
		if (this.current != null && this.current.rotateCounterClockwise(this.board)) {
			this.addKeypress();
			if (!this.isSeeking) sfx.rotate.play();
			if (this.moveCounter++ < 15) this.lockTime = 0;
			this.recordAction("rotateCounterClockwise", timestamp);
		}
	}

	softDrop(timestamp) {
		if (this.current != null && this.current.canFall(this.board)) {
			if (++this.current.y > this.maxY) {
				this.lockTime = 0;
				this.moveCounter = 0;
				this.maxY = this.current.y;
			}
			this.fallTime = 0;
			if (!this.isSeeking) {
				sfx.softDrop.play();
				if (!this.current.canFall(this.board)) sfx.land.play();
			}
			this.recordAction("softDrop", timestamp);
			return false;
		}
		return true;
	}

	spawnParticle() {
		let current = this.current;
		this.particles.push({
			x: this.gridX + this.minoSize * (current.x + current.leftX[current.state] - 0.5 + (current.width[current.state] + 1) * Math.random()),
			y: this.gridY + this.minoSize * (current.y + current.topY[current.state] - 19),
			distance: this.minoSize * (0.5 + 1.5 * Math.random()),
			lifetime: 250 + 500 * Math.random(),
			time: 0
		});
	}

	hardDrop(timestamp) {
		if (this.current == null) return;
		let count = 0;
		while (this.current.canFall(this.board)) {
			if (!this.isSeeking && Math.random() < 0.25) this.spawnParticle();
			this.current.y++;
			count++;
		}
		if (!this.isSeeking) {
			for (let i = 0; i < 3; i++) this.spawnParticle();
			(count ? sfx.hardDrop : sfx.softLock).play();
		}
		this.lock(true);
		this.recordAction("hardDrop", timestamp);
		return count;
	}

	doHold(timestamp) {
		if (this.current != null && !this.holdSwitched) {
			this.oldHold = this.hold;
			this.hold = this.current;
			if (this.oldHold == null) this.nextTetrimino(); else {
				this.current = this.oldHold;
				this.current.state = 0;
				this.current.x = 4;
				this.current.y = 19;
				this.fallTime = 0;
				this.lockTime = 0;
				this.moveCounter = 0;
				this.checkGameOver();
			}
			this.holds++;
			if (!this.isSeeking) sfx.hold.play();
			if (this.moveLock) this.wasNull = true;
			this.holdSwitched = true;
			this.recordAction("hold", timestamp);
		}
	}

	getBaseline() {
		return this.current.y + this.current.baseY[this.current.state];
	}

	lock(isDrop) {
		if (this.current == null) return;
		let toClear = [];
		this.tetriminoes++;
		let isTSpin = this.current instanceof TetriminoT && this.current.isImmobile(this.board);
		for (let mino of this.current.getLockPositions()) {
			this.board[mino[0]][mino[1]] = new Mino(mino[2], this.current.textureY);
			if (++this.minos[mino[1]] == 10) toClear.push(mino[1]);
		}
		this.totalMinos += 4;
		let baseline = this.getBaseline();
		if (baseline < 20) {
			this.gameOver();
			return -1;
		}
		this.stackMinY = Math.min(this.current.y + this.current.topY[this.current.state], this.stackMinY);
		if (isTSpin) {
			this.addReward(4 + toClear.length);
			if (!this.isSeeking) sfx.tSpin.play();
			if (toClear.length != 0) {
				this.clearLines(toClear);
			} else {
				this.combo = -1;
				this.nextTetrimino();
			}
			this.stats[toClear.length][1]++;
			if (this.stats[toClear.length][2] != null) this.stats[toClear.length][2]++;
		} else if (toClear.length != 0) {
			this.addReward(toClear.length - 1);
			this.stats[toClear.length][0]++;
			if (this.stats[toClear.length][2] != null) this.stats[toClear.length][2]++;
			this.clearLines(toClear)
		} else {
			this.combo = -1;
			this.nextTetrimino();
		}
		return baseline;
	}

	clearLines(toClear) {
		this.clearedLines = toClear.sort((a, b) => a - b);
		this.stackMinY += this.clearedLines.length;
		this.clearEffectTime = 0;
		for (let line of this.clearedLines) {
			for (let i = 0; i < 10; i++) {
				if (line != 0 && this.board[i][line - 1] != undefined) this.board[i][line - 1].directions &= 0b1110;
				if (line != 39 && this.board[i][line + 1] != undefined) this.board[i][line + 1].directions &= 0b1011;
				this.board[i][line] = undefined;
			}
		}
		this.lines += toClear.length;
		this.clearTime = 500;
		if (!this.isSeeking) switch (toClear.length) {
			case 1: sfx.single.play(); break;
			case 2: sfx.double.play(); break;
			case 3: sfx.triple.play(); break;
			case 4: sfx.tetris.play(); break;
		}
		if ((this.totalMinos -= toClear.length * 10) == 0) {
			this.score += 1000;
			this.clearTime = 1000;
			if (!this.isSeeking) sfx.allClear.play();
		}
		this.current = null;
		this.isClearing = true;
	}

	addReward(reward) {
		if (!this.isSeeking) {
			this.rewardName = this.getRewardName(reward);
			this.rewardTime = 1500;
		}
		this.rewardAmount = this.getRewardAmount(reward);
		if (reward > 2 && reward != 4) {
			if (this.backToBack) {
				this.rewardAmount *= 1.5;
				this.rewardName += " BTB";
			} else this.backToBack = true;
		} else this.backToBack = this.backToBack && this.reward == 4;
		if (reward != 4 && ++this.combo > 0) this.rewardAmount += this.getComboBonus();
		this.score += this.rewardAmount;
	}

	getRewardName(reward) {
		return this.rewardNames[reward];
	}

	getRewardAmount(reward) {
		return this.rewardAmounts[reward];
	}

	getComboBonus() {
		return this.combo * 50;
	}

	getFallInterval() {
		return 500;
	}

	getLockDelay() {
		return 1000;
	}

	pushToQueue() {
		let bag = [new TetriminoI(), new TetriminoJ(), new TetriminoL(), new TetriminoO(), new TetriminoS(), new TetriminoZ(), new TetriminoT()];
		for (let i = 0; i < 7; i++) {
			this.queue.push(bag.splice(Math.floor(this.random.random() * (bag.length - 0.00001)), 1)[0]);
		}
	}

	nextTetrimino() {
		this.current = this.queue.splice(0, 1)[0];
		if (this.queue.length < 6) this.pushToQueue();
		this.fallTime = 0;
		this.lockTime = 0;
		this.moveCounter = 0;
		this.holdSwitched = false;
		this.checkGameOver();
	}

	checkGameOver() {
		if (this.current.checkCollision(this.board)) {
			this.gameOver();
			return;
		}
		if (this.current.canFall(this.board)) this.current.y++;
		this.maxY = this.current.Y;
	}

	gameOver() {
		if (this.doSaveReplay) this.replay.length = this.playTime;
		this.state = GameState.over;
	}

	pause() {
		this.state = GameState.paused;
	}

	resume() {
		this.state = GameState.playing;
	}

	quit() {
		goBack();
	}

	recordAction(action, timestamp = this.playTime) {
		if (this.doSaveReplay) this.replay.actions.push([timestamp, action]);
	}

	saveState() {
		let state = {};
		this.populateStateData(state);
		this.replay.states.push(state);
	}

	populateStateData(state) {
		state.timestamp = this.playTime;
		for (let field of this.singleSaveableFields) state[field] = this[field];
		let board = [];
		for (let x = 0; x < 10; x++) for (let y = 0; y < 40; y++) {
			let mino = this.board[x][y];
			board.push(mino ? mino.textureY << 4 | mino.directions : -1);
		}
		state.board = board;
		if (this.current == null) state.current = null;
		else state.current = {
			type: this.current.code,
			x: this.current.x,
			y: this.current.y,
			state: this.current.state
		};
		state.randommt = [...this.random.mt];
		state.randommti = this.random.mti;
		state.queue = "";
		for (let tetrimino of this.queue) state.queue += tetrimino.code;
		state.hold = this.hold ? this.hold.code : "";
		state.stats = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
		for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) state.stats[i][j] = this.stats[i][j];
		state.actionIndex = this.replay.actions.length;
	}

	loadState(timestamp) {
		let start = 0, end = this.replay.states.length - 1, index = -1, mid = 0;
		while (start <= end) {
			mid = Math.floor((start + end) / 2);
			if (this.replay.states[mid].timestamp > timestamp) end = mid - 1;
			else {
				index = mid;
				start = mid + 1;
			}
		}
		let state = index == -1 ? this.replay.states[this.replay.states.length - 1] : this.replay.states[index];
		this.readStateData(state);
		return state.actionIndex;
	}

	readStateData(state) {
		this.playTime = state.timestamp;
		for (let field of this.singleSaveableFields) this[field] = state[field];
		let minos = 0, x = 0, board = state.board, mino = 0;
		this.totalMinos = 0;
		this.stackMinY = 40;
		for (let y = 0; y < 40; y++) {
			minos = 0;
			for (x = 0; x < 10; x++) {
				mino = board[x * 40 + y];
				if (mino == -1) {
					this.board[x][y] = undefined;
				} else {
					this.board[x][y] = new Mino(mino & 0b1111, mino >> 4);
					this.stackMinY = y;
					minos++;
					this.totalMinos++;
				}
			}
			this.minos[y] = minos;
		}
		if (state.current == null) this.current = null;
		else {
			this.current = new tetriminoTypeMapping[state.current.type]();
			this.current.x = state.current.x;
			this.current.y = state.current.y;
			this.current.state = state.current.state;
		}
		this.random.mt = state.randommt;
		this.random.mti = state.randommti;
		this.queue = [];
		for (let char of state.queue) this.queue.push(new tetriminoTypeMapping[char]());
		this.hold = state.hold == "" ? null : new tetriminoTypeMapping[state.hold]();
		for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) this.stats[i][j] = state.stats[i][j];
	}

	getModeName() {
		return "???";
	}

	getModeNameForDisplay() {
		return "Tetreml";
	}

	loadModeParameters(parameters) {
		this.isReplay = true;
	}
	
	handleReplayEpoch(playTime) { }

	finalizeSeek() {
		this.particles = [];
		this.clearEffectTime = 200;
	}
}

// --------------------------

class GameScreenTengen extends PlayScreenBase {
	constructor(parent, showKeystrokes, doSaveReplay) {
		super(parent, 240, 4, 424, 48, 182, 54, 16, showKeystrokes, doSaveReplay);
		this.levels = [[0, 550, 1000], [30, 467, 1000], [30, 400, 1000], [30, 333, 1000], [30, 283, 1000], [30, 233, 1000], [50, 183, 1000], [50, 150, 1000], [50, 117, 1000], [50, 100, 1000], [50, 92, 1000], [50, 83, 1000], [50, 75, 1000], [50, 67, 1000], [50, 63, 1000], [50, 58, 1000], [50, 54, 1000], [50, 50, 1000], [50, 46, 1000], [50, 42, 1000], [50, 39, 1000], [50, 36, 1000], [50, 33, 1000], [50, 30, 1000], [50, 27, 1000], [50, 24, 1000], [50, 22, 1000], [50, 20, 1000]];
		this.linesOfCurrentLevel = 0;
		this.totalLinesToNextLevel = 0;
		this.isNewLevel = false;
		this.lockScore = 0;
		this.lockScoreLine = 0;
		this.lockScoreTime = 0;
		this.level = 1;
		this.singleSaveableFields.push("linesOfCurrentLevel", "totalLinesToNextLevel", "isNewLevel", "lockScore", "lockScoreTime", "level");
		this.speedCurveNames = ["Normal", "Moderate", "Speedy", "TetrisDotCom"];
	}

	init() {
		super.init();
		if (!this.isReplay) {
			let highScoreName = "tetrisHighScore" + this.speedCurveNames[this.speedCurve];
			let maxLinesName = "tetrisMaxLines" + this.speedCurveNames[this.speedCurve];
			this.highScore = localStorage[highScoreName] == undefined ? 0 : localStorage[highScoreName];
			this.maxLines = localStorage[maxLinesName] == undefined ? 0 : localStorage[maxLinesName];
		}
		if (this.level != this.levels.length) this.totalLinesToNextLevel = this.levels[this.level][0];
	}

	start() {
		super.start();
		music.level1Opening.currentTime = music.level1.currentTime = music.level6.currentTime = music.level11.currentTime = music.level11Opening.currentTime = 0;
		if (this.level > 10) {
			this.currentSong = music.level11Opening;
			this.currentSong.onended = () => {
				this.currentSong = music.level11;
				this.currentSong.play();
			}
		} else if (this.level > 5) {
			this.currentSong = music.level6;
		} else {
			this.currentSong = music.level1Opening;
			this.currentSong.onended = () => {
				this.currentSong = music.level1;
				this.currentSong.play();
			}
		}
		if (!this.isReplay) this.currentSong.play();
	}

	renderBehind(timePassed) {
		super.renderBehind(timePassed);
		ctx.fillStyle = "#FFF";
		ctx.font = "12px Segoe UI";
		ctx.textAlign = "left";
		ctx.fillText("Score", 485, 30);
		ctx.fillText("Level " + this.level, 485, 85);
		ctx.fillText("Lines: " + this.lines, 485, 111);
		ctx.fillText("Time elapsed", 485, 164);
		if (!this.isReplay) {
			ctx.fillText("Max lines", 485, 137);
			ctx.fillText("High score", 485, 57);
		}

		ctx.fillText("Zero-line", 20, 155);
		ctx.fillText("Single", 20, 180);
		ctx.fillText("Double", 20, 205);
		ctx.fillText("Triple", 20, 230);
		ctx.fillText("Tetris", 20, 255);

		ctx.fillText("Tetriminoes placed", 20, 295);
		ctx.fillText("Holds", 20, 315);

		ctx.textAlign = "right";
		ctx.fillText("Normal", 118, 130);
		ctx.fillText("T-spin", 163, 130);
		ctx.fillText("Total", 208, 130);

		ctx.fillText("" + this.tetriminoes, 208, 295);
		ctx.fillText("" + this.holds, 208, 315);

		for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) if (this.stats[i][j] != null) ctx.fillText("" + this.stats[i][j], 118 + 45 * j, 155 + 25 * i);
		let isLastLevel = this.level == this.levels.length;
		ctx.fillText("" + (isLastLevel ? "" : this.level + 1), 632, 85);
		ctx.fillText("" + (isLastLevel ? "" : this.totalLinesToNextLevel), 632, 111);
		if (!isLastLevel)
			ctx.fillRect(485, 89, 147 * (this.linesOfCurrentLevel / this.levels[this.level][0]), 10);
		ctx.fillText(formatDuration(Math.floor(this.playTime / 1000)), 632, 164);

		if (!this.isReplay) {
			ctx.fillText("" + this.highScore, 632, 57);
			ctx.fillText("" + this.maxLines, 632, 137);
			ctx.fillRect(485, 115, this.maxLines == 0 ? 147 : Math.min(147, 147 * this.lines / this.maxLines), 10);
			ctx.fillRect(485, 34, this.highScore == 0 ? 147 : Math.min(147, 147 * this.score / this.highScore), 10);
		}

		ctx.font = "20px Segoe UI";
		ctx.fillText("" + this.score, 632, 30);
		if (this.rewardTime != 0) ctx.fillText("" + this.rewardAmount, 632, 348);
		if (this.combo > 0) ctx.fillText("" + this.combo, 632, 323);
		ctx.textAlign = "left";
		if (this.combo > 0) ctx.fillText("COMBO", 406, 323);
		if (this.rewardTime != 0) {
			this.rewardTime = Math.max(0, this.rewardTime - timePassed);
			ctx.fillText(this.rewardName, 406, 348);
		}

		if (this.state != GameState.paused && this.lockScoreTime != 0 && this.lockScoreLine > 17) {
			ctx.font = "12px Segoe UI";
			ctx.textAlign = "right";
			this.lockScoreTime = Math.max(0, this.lockScoreTime - timePassed);
			ctx.fillText(this.lockScore == 1000 ? "1k" : "" + this.lockScore, 233, 16 + 16 * (this.lockScoreLine - 17));
		}
	}

	renderInFront(timePassed) {
		super.renderInFront(timePassed);
		switch (this.state) {
			case GameState.playing:
				if (this.isNewLevel && this.clearTime > 0) {
					ctx.fillStyle = this.level == 6 || this.level == 11 ? "#FF0" : "#FFF";
					ctx.font = "12px Segoe UI";
					ctx.textAlign = "center";
					ctx.fillText("LEVEL UP", 320, 130);
					ctx.font = "30px Segoe UI Light";
					ctx.fillText("" + this.level, 320, 160);
				}
				if (this.totalMinos == 0 && this.clearTime > 0) {
					ctx.fillStyle = "#FFF";
					ctx.textAlign = "center";
					ctx.font = "20px Segoe UI";
					ctx.fillText("ALL CLEAR", 320, 40);
					ctx.fillText("1000 points", 320, 65);
				}
				break;
			case GameState.paused:
				break;
			case GameState.over:
				break;
		}
	}

	lock(isDrop) {
		let baseline = super.lock(isDrop);
		if (baseline == -1) return;
		this.lockScoreLine = baseline;
		this.lockScore = Math.floor(Math.min(1000, (isDrop ? 2 : 1) * this.level * (this.level + 39 - this.lockScoreLine)));
		this.lockScoreTime = 1000;
	}

	clearLines(toClear) {
		super.clearLines(toClear);
		this.linesOfCurrentLevel += toClear.length;
		if (this.level < this.levels.length && this.linesOfCurrentLevel >= this.levels[this.level][0]) {
			this.linesOfCurrentLevel -= this.levels[this.level][0];
			this.level++;
			if (this.level != this.levels.length) this.totalLinesToNextLevel += this.levels[this.level][0];
			this.isNewLevel = true;
			if (!this.isSeeking) switch (this.level) {
				case 6:
					this.currentSong.pause();
					this.currentSong = music.level6Start;
					this.currentSong.onended = () => {
						this.currentSong = music.level6;
						this.currentSong.play();
					}
					this.currentSong.play();
					break;
				case 11:
					this.currentSong.pause();
					this.currentSong = music.level11Start;
					this.currentSong.onended = () => {
						this.currentSong = music.level11Opening;
						this.currentSong.play();
					}
					music.level11Opening.onended = () => {
						this.currentSong = music.level11;
						this.currentSong.play();
					}
					this.currentSong.play();
					break;
			}
			this.clearTime = 1000;
		}
	}

	gameOver() {
		super.gameOver();
		if (!this.isReplay) {
			if (this.score > this.highScore) localStorage["tetrisHighScore" + this.speedCurveNames[this.speedCurve]] = this.score;
			if (this.lines > this.maxLines) localStorage["tetrisMaxLines" + this.speedCurveNames[this.speedCurve]] = this.lines;
		}
		this.currentSong.pause();
		if (!this.isSeeking) sfx.gameOver.play();
	}

	pause() {
		super.pause();
		this.currentSong.pause();
		if (!this.isReplay) sfx.pause.play();
	}

	resume() {
		super.resume();
		this.currentSong.play();
	}

	getFallInterval() {
		return this.levels[this.level - 1][1];
	}

	getLockDelay() {
		return this.levels[this.level - 1][2];
	}

	quit() {
		this.currentSong.pause();
		super.quit();
	}

	getModeName() {
		return "Endless Tengen";
	}

	getModeNameForDisplay() {
		return "Endless (Tengen-like)";
	}

	loadModeParameters(parameters) {
		super.loadModeParameters(parameters);
		this.levels = parameters.levels;
		this.level = parameters.startingLevel;
	}

	readStateData(state) {
		this.oldLevel = this.level;
		this.currentSong.pause();
		super.readStateData(state);
	}

	finalizeSeek() {
		super.finalizeSeek();
		if (this.state != GameState.over && Math.floor((this.level-1) / 5) != Math.floor((this.oldLevel-1) / 5)) {
			music.level1Opening.currentTime = music.level1.currentTime = music.level6.currentTime = music.level11.currentTime = music.level11Opening.currentTime = 0;
			if (this.level > 10) {
				this.currentSong = music.level11Opening;
				this.currentSong.onended = () => {
					this.currentSong = music.level11;
					this.currentSong.play();
				}
			} else if (this.level > 5) {
				this.currentSong = music.level6;
			} else {
				this.currentSong = music.level1Opening;
				this.currentSong.onended = () => {
					this.currentSong = music.level1;
					this.currentSong.play();
				}
			}
		}
	}
}

class GameScreenGuidelineBase extends PlayScreenBase {
	constructor(parent, showKeystrokes, doSaveReplay) {
		super(parent, 240, 4, 424, 48, 182, 54, 16, showKeystrokes, doSaveReplay);
		this.lockScore = 0;
		this.lockScoreStartLine = 0;
		this.lockScoreEndLine = 0;
		this.lockScoreTime = 0;
		this.rewardAmounts = [100, 300, 500, 800, 400, 800, 1200, 1600];
		this.singleSaveableFields.push("lockScore", "lockScoreStartLine", "lockScoreEndLine", "lockScoreTime");
	}

	renderBehind(timePassed) {
		super.renderBehind(timePassed);
		ctx.fillStyle = "#FFF";
		ctx.font = "12px Segoe UI";
		ctx.textAlign = "left";

		ctx.fillText("Zero-line", 20, 155);
		ctx.fillText("Single", 20, 180);
		ctx.fillText("Double", 20, 205);
		ctx.fillText("Triple", 20, 230);
		ctx.fillText("Tetris", 20, 255);

		ctx.fillText("Tetriminoes placed", 20, 295);
		ctx.fillText("Holds", 20, 315);

		ctx.textAlign = "right";
		ctx.fillText("Normal", 118, 130);
		ctx.fillText("T-spin", 163, 130);
		ctx.fillText("Total", 208, 130);

		ctx.fillText("" + this.tetriminoes, 208, 295);
		ctx.fillText("" + this.holds, 208, 315);
		for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) if (this.stats[i][j] != null) ctx.fillText("" + this.stats[i][j], 118 + 45 * j, 155 + 25 * i);

		ctx.font = "20px Segoe UI";
		if (this.rewardTime != 0) ctx.fillText("" + this.rewardAmount, 632, 348);
		if (this.combo > 0) ctx.fillText("" + this.combo, 632, 323);
		ctx.textAlign = "left";
		if (this.combo > 0) ctx.fillText("COMBO", 406, 323);
		if (this.rewardTime != 0) {
			this.rewardTime = Math.max(0, this.rewardTime - timePassed);
			ctx.fillText(this.rewardName, 406, 348);
		}

		if (this.state != GameState.paused && this.lockScoreTime != 0 && this.lockScoreEndLine > 17) {
			ctx.font = "12px Segoe UI";
			ctx.textAlign = "right";
			this.lockScoreTime = Math.max(0, this.lockScoreTime - timePassed);
			ctx.fillRect(235, 4 + 16 * (this.lockScoreStartLine - 17), 1, (this.lockScoreEndLine - this.lockScoreStartLine + 1) * 16);
			ctx.fillText(this.lockScore + "", 231, 16 + 16 * (this.lockScoreEndLine - 17));
		}
	}

	renderInFront(timePassed) {
		super.renderInFront(timePassed);
		switch (this.state) {
			case GameState.playing:
				if (this.totalMinos == 0 && this.clearTime > 0) {
					ctx.fillStyle = "#FFF";
					ctx.textAlign = "center";
					ctx.font = "20px Segoe UI";
					ctx.fillText("ALL CLEAR", 320, 40);
					ctx.fillText("1000 points", 320, 65);
				}
				break;
			case GameState.paused:
				break;
			case GameState.over:
				break;
		}
	}

	softDrop() {
		let res = super.softDrop();
		if (!res) this.score++;
		return res;
	}

	hardDrop() {
		if (this.current == null) return;
		this.lockScoreStartLine = this.getBaseline();
		let res = super.hardDrop();
		this.lockScoreEndLine = this.lockScoreStartLine + res - 1;
		this.lockScore = 2 * res;
		this.score += this.lockScore;
		this.lockScoreTime = 1000;
		return res;
	}
}

class GameScreenGuidelineMarathon extends GameScreenGuidelineBase {
	constructor(parent, showKeystrokes, doSaveReplay) {
		super(parent, showKeystrokes, doSaveReplay);
		this.level = 1;
		this.fallIntervals = [0, 1000, 793, 618, 473, 355, 262, 190, 135, 94, 64, 43, 28, 18, 11, 7];
		this.linesOfCurrentLevel = 0;
		this.linesToNextLevel = 10;
		this.totalLinesToNextLevel = 10;
		this.singleSaveableFields.push("level", "linesOfCurrentLevel", "totalLinesToNextLevel", "linesToNextLevel");
	}

	init() {
		super.init();
		if (!this.isReplay) this.highScore = localStorage.tetrisMarathonHighScore == undefined ? 0 : localStorage.tetrisMarathonHighScore;
		this.totalLinesToNextLevel = this.linesToNextLevel = this.level * 10;
	}

	start() {
		super.start();
		music.level1Opening.currentTime = music.level1.currentTime = music.level6.currentTime = music.level11.currentTime = music.level11Opening.currentTime = 0;
		if (this.level > 10) {
			this.currentSong = music.level11Opening;
			this.currentSong.onended = () => {
				this.currentSong = music.level11;
				this.currentSong.play();
			}
		} else if (this.level > 5) {
			this.currentSong = music.level6;
		} else {
			this.currentSong = music.level1Opening;
			this.currentSong.onended = () => {
				this.currentSong = music.level1;
				this.currentSong.play();
			}
		}
		if (!this.isReplay) this.currentSong.play();
	}

	renderBehind(timePassed) {
		super.renderBehind(timePassed);
		ctx.fillStyle = "#FFF";
		ctx.font = "12px Segoe UI";
		ctx.textAlign = "left";
		ctx.fillText("Score", 485, 30);
		if (!this.isReplay) ctx.fillText("High score", 485, 57);
		ctx.fillText("Level " + this.level, 485, 85);
		ctx.fillText("Lines: " + this.lines, 485, 111);
		ctx.fillText("Time elapsed", 485, 154);
		
		ctx.textAlign = "right";
		ctx.fillText("" + (this.level == 15 ? "Finish" : this.level + 1), 632, 85);
		ctx.fillText("" + this.totalLinesToNextLevel, 632, 111);
		ctx.fillRect(485, 89, 147 * Math.min(1, this.linesOfCurrentLevel / this.linesToNextLevel), 10);
		ctx.fillText(formatDuration(Math.floor(this.playTime / 1000)), 632, 154);

		if (!this.isReplay) {
			ctx.fillText("" + this.highScore, 632, 57);
			ctx.fillRect(485, 34, this.highScore == 0 ? 147 : Math.min(147, 147 * this.score / this.highScore), 10);
		}

		ctx.font = "20px Segoe UI";
		ctx.fillText("" + this.score, 632, 30);
	}

	renderInFront(timePassed) {
		super.renderInFront(timePassed);
		switch (this.state) {
			case GameState.playing:
				if (this.isNewLevel && this.clearTime > 0) {
					ctx.fillStyle = this.level == 6 || this.level == 11 ? "#FF0" : "#FFF";
					ctx.font = "12px Segoe UI";
					ctx.textAlign = "center";
					ctx.fillText("LEVEL UP", 320, 130);
					ctx.font = "30px Segoe UI Light";
					ctx.fillText("" + this.level, 320, 160);
				}
				if (this.totalMinos == 0 && this.clearTime > 0) {
					ctx.fillStyle = "#FFF";
					ctx.textAlign = "center";
					ctx.font = "20px Segoe UI";
					ctx.fillText("ALL CLEAR", 320, 40);
					ctx.fillText("1000 points", 320, 65);
				}
				break;
			case GameState.paused:
				break;
			case GameState.over:
				ctx.font = "12px Segoe UI";
				ctx.textAlign = "center";
				ctx.fillText(this.gameOverMessage, 320, 60, 150);
				break;
		}
	}

	clearLines(toClear) {
		super.clearLines(toClear);
		this.linesOfCurrentLevel += toClear.length;
		if (this.linesOfCurrentLevel >= this.linesToNextLevel) {
			if (this.level == 15) {
				this.gameOverMessage = "You have completed level 15.";
				super.gameOver();
				if (!this.isReplay && this.score > this.highScore) localStorage.tetrisMarathonHighScore = this.score;
				this.currentSong.pause();
				if (!this.isSeeking) sfx.complete.play();
			} else {
				this.linesOfCurrentLevel -= this.linesToNextLevel;
				this.linesToNextLevel = 10;
				this.level++;
				this.totalLinesToNextLevel += 10;
				this.isNewLevel = true;
				if (!this.isSeeking) switch (this.level) {
					case 6:
						this.currentSong.pause();
						this.currentSong = music.level6Start;
						this.currentSong.onended = () => {
							this.currentSong = music.level6;
							this.currentSong.play();
						}
						this.currentSong.play();
						break;
					case 11:
						this.currentSong.pause();
						this.currentSong = music.level11Start;
						this.currentSong.onended = () => {
							this.currentSong = music.level11Opening;
							this.currentSong.play();
						}
						music.level11Opening.onended = () => {
							this.currentSong = music.level11;
							this.currentSong.play();
						}
						this.currentSong.play();
						break;
				}
				this.clearTime = 1000;
			}
		}
	}

	gameOver() {
		super.gameOver();
		this.gameOverMessage = "You topped out.";
		this.currentSong.pause();
		if (!this.isSeeking) sfx.gameOver.play();
	}

	pause() {
		super.pause();
		this.currentSong.pause();
		if (!this.isReplay) sfx.pause.play();
	}

	resume() {
		super.resume();
		this.currentSong.play();
	}

	getFallInterval() {
		return this.fallIntervals[this.level];
	}

	getLockDelay() {
		return 500;
	}

	getRewardAmount(reward) {
		return this.rewardAmounts[reward] * this.level;
	}

	getComboBonus() {
		return this.combo * 50 * this.level;
	}

	quit() {
		this.currentSong.pause();
		super.quit();
	}

	getModeName() {
		return "Marathon";
	}

	getModeNameForDisplay() {
		return "Marathon – Fixed goal";
	}

	readStateData(state) {
		this.oldLevel = this.level;
		this.currentSong.pause();
		super.readStateData(state);
	}

	finalizeSeek() {
		super.finalizeSeek();
		if (this.state != GameState.over && Math.floor((this.level-1) / 5) != Math.floor((this.oldLevel-1) / 5)) {
			music.level1Opening.currentTime = music.level1.currentTime = music.level6.currentTime = music.level11.currentTime = music.level11Opening.currentTime = 0;
			if (this.level > 10) {
				this.currentSong = music.level11Opening;
				this.currentSong.onended = () => {
					this.currentSong = music.level11;
					this.currentSong.play();
				}
			} else if (this.level > 5) {
				this.currentSong = music.level6;
			} else {
				this.currentSong = music.level1Opening;
				this.currentSong.onended = () => {
					this.currentSong = music.level1;
					this.currentSong.play();
				}
			}
		}
	}

	loadModeParameters(parameters) {
		super.loadModeParameters(parameters);
		this.level = parameters.startingLevel;
	}
}

class GameScreenGuidelineMarathonVariable extends GameScreenGuidelineBase {
	constructor(parent, showKeystrokes, doSaveReplay) {
		super(parent, showKeystrokes, doSaveReplay);
		this.level = 1;
		this.fallIntervals = [0, 1000, 793, 618, 473, 355, 262, 190, 135, 94, 64, 43, 28, 18, 11, 7];
		this.linesOfCurrentLevel = 0;
		this.linesToNextLevel = 5;
		this.totalLinesToNextLevel = 5;
		this.singleSaveableFields.push("level", "linesOfCurrentLevel", "totalLinesToNextLevel", "linesToNextLevel");
	}

	init() {
		super.init();
		if (!this.isReplay) this.highScore = localStorage.tetrisMarathonVariableHighScore == undefined ? 0 : localStorage.tetrisMarathonVariableHighScore;
		this.totalLinesToNextLevel = this.linesToNextLevel = this.level * 5;
	}

	start() {
		super.start();
		music.level1Opening.currentTime = music.level1.currentTime = music.level6.currentTime = music.level11.currentTime = music.level11Opening.currentTime = 0;
		if (this.level > 10) {
			this.currentSong = music.level11Opening;
			this.currentSong.onended = () => {
				this.currentSong = music.level11;
				this.currentSong.play();
			}
		} else if (this.level > 5) {
			this.currentSong = music.level6;
		} else {
			this.currentSong = music.level1Opening;
			this.currentSong.onended = () => {
				this.currentSong = music.level1;
				this.currentSong.play();
			}
		}
		if (!this.isReplay) this.currentSong.play();
	}

	renderBehind(timePassed) {
		super.renderBehind(timePassed);
		ctx.fillStyle = "#FFF";
		ctx.font = "12px Segoe UI";
		ctx.textAlign = "left";
		ctx.fillText("Score", 485, 30);
		if (!this.isReplay) ctx.fillText("High score", 485, 57);
		ctx.fillText("Level " + this.level, 485, 85);
		ctx.fillText("Lines: " + this.lines, 485, 111);
		ctx.fillText("Time elapsed", 485, 154);
		
		ctx.textAlign = "right";
		ctx.fillText("" + (this.level == 15 ? "Finish" : this.level + 1), 632, 85);
		ctx.fillText("" + this.totalLinesToNextLevel, 632, 111);
		ctx.fillRect(485, 89, 147 * Math.min(1, this.linesOfCurrentLevel / this.linesToNextLevel), 10);
		ctx.fillText(formatDuration(Math.floor(this.playTime / 1000)), 632, 154);

		if (!this.isReplay) {
			ctx.fillText("" + this.highScore, 632, 57);
			ctx.fillRect(485, 34, this.highScore == 0 ? 147 : Math.min(147, 147 * this.score / this.highScore), 10);
		}

		ctx.font = "20px Segoe UI";
		ctx.fillText("" + this.score, 632, 30);
	}

	renderInFront(timePassed) {
		super.renderInFront(timePassed);
		switch (this.state) {
			case GameState.playing:
				if (this.isNewLevel && this.clearTime > 0) {
					ctx.fillStyle = this.level == 6 || this.level == 11 ? "#FF0" : "#FFF";
					ctx.font = "12px Segoe UI";
					ctx.textAlign = "center";
					ctx.fillText("LEVEL UP", 320, 130);
					ctx.font = "30px Segoe UI Light";
					ctx.fillText("" + this.level, 320, 160);
				}
				if (this.totalMinos == 0 && this.clearTime > 0) {
					ctx.fillStyle = "#FFF";
					ctx.textAlign = "center";
					ctx.font = "20px Segoe UI";
					ctx.fillText("ALL CLEAR", 320, 40);
					ctx.fillText("1000 points", 320, 65);
				}
				break;
			case GameState.paused:
				break;
			case GameState.over:
				ctx.font = "12px Segoe UI";
				ctx.textAlign = "center";
				ctx.fillText(this.gameOverMessage, 320, 60, 150);
				break;
		}
	}

	clearLines(toClear) {
		super.clearLines(toClear);
		this.lines -= toClear.length; // Awarding line clears here requires custom handling, so we cancel the default behavior.
		// Awarding lines is now handled in addReward.
		if (this.isNewLevel) this.clearTime = 1000;
	}

	addReward(reward) {
		let lines = this.rewardAmounts[reward] / 100 * (reward > 2 && reward != 4 && this.backToBack ? 1.5 : 1);
		super.addReward(reward);
		this.lines += lines;
		this.linesOfCurrentLevel += lines;
		while (this.linesOfCurrentLevel >= this.linesToNextLevel) {
			if (this.level == 15) {
				this.gameOverMessage = "You have completed level 15.";
				super.gameOver();
				if (!this.isReplay && this.score > this.highScore) localStorage.tetrisMarathonVariableHighScore = this.score;
				this.currentSong.pause();
				if (!this.isSeeking) sfx.complete.play();
				break;
			} else {
				this.linesOfCurrentLevel -= this.linesToNextLevel;
				this.linesToNextLevel = ++this.level * 5;
				this.totalLinesToNextLevel += this.linesToNextLevel;
				this.isNewLevel = true;
				this.clearTime = 1000;
				if (!this.isSeeking) switch (this.level) {
					case 6:
						this.currentSong.pause();
						this.currentSong = music.level6Start;
						this.currentSong.onended = () => {
							this.currentSong = music.level6;
							this.currentSong.play();
						}
						this.currentSong.play();
						break;
					case 11:
						this.currentSong.pause();
						this.currentSong = music.level11Start;
						this.currentSong.onended = () => {
							this.currentSong = music.level11Opening;
							this.currentSong.play();
						}
						music.level11Opening.onended = () => {
							this.currentSong = music.level11;
							this.currentSong.play();
						}
						this.currentSong.play();
						break;
				}
			}
		}
	}

	gameOver() {
		super.gameOver();
		this.gameOverMessage = "You topped out.";
		this.currentSong.pause();
		if (!this.isSeeking) sfx.gameOver.play();
	}

	pause() {
		super.pause();
		this.currentSong.pause();
		if (!this.isReplay) sfx.pause.play();
	}

	resume() {
		super.resume();
		this.currentSong.play();
	}

	getFallInterval() {
		return this.fallIntervals[this.level];
	}

	getLockDelay() {
		return 500;
	}

	getRewardAmount(reward) {
		return this.rewardAmounts[reward] * this.level;
	}

	getComboBonus() {
		return this.combo * 50 * this.level;
	}

	quit() {
		this.currentSong.pause();
		super.quit();
	}

	getModeName() {
		return "Marathon variable";
	}

	getModeNameForDisplay() {
		return "Marathon – Variable goal";
	}

	readStateData(state) {
		this.oldLevel = this.level;
		this.currentSong.pause();
		super.readStateData(state);
	}

	finalizeSeek() {
		super.finalizeSeek();
		if (this.state != GameState.over && Math.floor((this.level-1) / 5) != Math.floor((this.oldLevel-1) / 5)) {
			music.level1Opening.currentTime = music.level1.currentTime = music.level6.currentTime = music.level11.currentTime = music.level11Opening.currentTime = 0;
			if (this.level > 10) {
				this.currentSong = music.level11Opening;
				this.currentSong.onended = () => {
					this.currentSong = music.level11;
					this.currentSong.play();
				}
			} else if (this.level > 5) {
				this.currentSong = music.level6;
			} else {
				this.currentSong = music.level1Opening;
				this.currentSong.onended = () => {
					this.currentSong = music.level1;
					this.currentSong.play();
				}
			}
		}
	}

	loadModeParameters(parameters) {
		super.loadModeParameters(parameters);
		this.level = parameters.startingLevel;
	}
}

class GameScreenGuidelineMarathonTetrisDotCom extends GameScreenGuidelineBase {
	constructor(parent, showKeystrokes, doSaveReplay) {
		super(parent, showKeystrokes, doSaveReplay);
		this.level = 1;
		this.fallIntervals = [0, 1000, 793, 618, 473, 355, 262, 190, 135, 94, 64, 43, 28, 18, 11, 7, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.lockDelays = [0, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 450, 400, 350, 300, 250, 200, 190, 180, 170, 160, 150];
		this.linesOfCurrentLevel = 0;
		this.linesToNextLevel = 10;
		this.totalLinesToNextLevel = 10;
		this.singleSaveableFields.push("level", "linesOfCurrentLevel", "totalLinesToNextLevel", "linesToNextLevel");
	}

	init() {
		super.init();
		if (!this.isReplay) this.highScore = localStorage.tetrisMarathonTetrisDotComHighScore == undefined ? 0 : localStorage.tetrisMarathonTetrisDotComHighScore;
		this.totalLinesToNextLevel = this.linesToNextLevel = 10;
	}

	start() {
		super.start();
		music.level1Opening.currentTime = music.level1.currentTime = music.level6.currentTime = music.level11.currentTime = music.level11Opening.currentTime = 0;
		if (this.level > 10) {
			this.currentSong = music.level11Opening;
			this.currentSong.onended = () => {
				this.currentSong = music.level11;
				this.currentSong.play();
			}
		} else if (this.level > 5) {
			this.currentSong = music.level6;
		} else {
			this.currentSong = music.level1Opening;
			this.currentSong.onended = () => {
				this.currentSong = music.level1;
				this.currentSong.play();
			}
		}
		if (!this.isReplay) this.currentSong.play();
	}

	renderBehind(timePassed) {
		super.renderBehind(timePassed);
		ctx.fillStyle = "#FFF";
		ctx.font = "12px Segoe UI";
		ctx.textAlign = "left";
		ctx.fillText("Score", 485, 30);
		if (!this.isReplay) ctx.fillText("High score", 485, 57);
		ctx.fillText("Level " + this.level, 485, 85);
		ctx.fillText("Lines: " + this.lines, 485, 111);
		ctx.fillText("Time elapsed", 485, 154);
		
		ctx.textAlign = "right";
		ctx.fillText("" + (this.level == 15 ? "Finish" : this.level + 1), 632, 85);
		ctx.fillText("" + this.totalLinesToNextLevel, 632, 111);
		ctx.fillRect(485, 89, 147 * Math.min(1, this.linesOfCurrentLevel / this.linesToNextLevel), 10);
		ctx.fillText(formatDuration(Math.floor(this.playTime / 1000)), 632, 154);

		if (!this.isReplay) {
			ctx.fillText("" + this.highScore, 632, 57);
			ctx.fillRect(485, 34, this.highScore == 0 ? 147 : Math.min(147, 147 * this.score / this.highScore), 10);
		}

		ctx.font = "20px Segoe UI";
		ctx.fillText("" + this.score, 632, 30);
	}

	renderInFront(timePassed) {
		super.renderInFront(timePassed);
		switch (this.state) {
			case GameState.playing:
				if (this.isNewLevel && this.clearTime > 0) {
					ctx.fillStyle = this.level == 6 || this.level == 11 ? "#FF0" : "#FFF";
					ctx.font = "12px Segoe UI";
					ctx.textAlign = "center";
					ctx.fillText("LEVEL UP", 320, 130);
					ctx.font = "30px Segoe UI Light";
					ctx.fillText("" + this.level, 320, 160);
				}
				if (this.totalMinos == 0 && this.clearTime > 0) {
					ctx.fillStyle = "#FFF";
					ctx.textAlign = "center";
					ctx.font = "20px Segoe UI";
					ctx.fillText("ALL CLEAR", 320, 40);
					ctx.fillText("1000 points", 320, 65);
				}
				break;
			case GameState.paused:
				break;
			case GameState.over:
				ctx.font = "12px Segoe UI";
				ctx.textAlign = "center";
				ctx.fillText(this.gameOverMessage, 320, 60, 150);
				break;
		}
	}

	clearLines(toClear) {
		super.clearLines(toClear);
		this.linesOfCurrentLevel += toClear.length;
		if (this.linesOfCurrentLevel >= this.linesToNextLevel) {
			if (this.level == 30) {
				this.gameOverMessage = "You have completed level 30.";
				super.gameOver();
				if (!this.isReplay && this.score > this.highScore) localStorage.tetrisMarathonTetrisDotComHighScore = this.score;
				this.currentSong.pause();
				if (!this.isSeeking) sfx.complete.play();
			} else {
				this.linesOfCurrentLevel -= this.linesToNextLevel;
				this.linesToNextLevel = 10;
				this.level++;
				this.totalLinesToNextLevel += 10;
				this.isNewLevel = true;
				if (!this.isSeeking) switch (this.level) {
					case 6:
						this.currentSong.pause();
						this.currentSong = music.level6Start;
						this.currentSong.onended = () => {
							this.currentSong = music.level6;
							this.currentSong.play();
						}
						this.currentSong.play();
						break;
					case 11:
						this.currentSong.pause();
						this.currentSong = music.level11Start;
						this.currentSong.onended = () => {
							this.currentSong = music.level11Opening;
							this.currentSong.play();
						}
						music.level11Opening.onended = () => {
							this.currentSong = music.level11;
							this.currentSong.play();
						}
						this.currentSong.play();
						break;
				}
				this.clearTime = 1000;
			}
		}
	}

	gameOver() {
		super.gameOver();
		this.gameOverMessage = "You topped out.";
		this.currentSong.pause();
		if (!this.isSeeking) sfx.gameOver.play();
		if (!this.isReplay && this.score > this.highScore) localStorage.tetrisMarathonTetrisDotComHighScore = this.score;
	}

	pause() {
		super.pause();
		this.currentSong.pause();
		if (!this.isReplay) sfx.pause.play();
	}

	resume() {
		super.resume();
		this.currentSong.play();
	}

	getFallInterval() {
		return this.fallIntervals[this.level];
	}

	getLockDelay() {
		return this.lockDelays[this.level];
	}

	getRewardAmount(reward) {
		return this.rewardAmounts[reward] * this.level;
	}

	getComboBonus() {
		return this.combo * 50 * this.level;
	}

	quit() {
		this.currentSong.pause();
		super.quit();
	}

	getModeName() {
		return "Marathon tetris.com";
	}

	getModeNameForDisplay() {
		return "Marathon – tetris.com";
	}

	readStateData(state) {
		this.oldLevel = this.level;
		this.currentSong.pause();
		super.readStateData(state);
	}

	finalizeSeek() {
		super.finalizeSeek();
		if (this.state != GameState.over && Math.floor((this.level-1) / 5) != Math.floor((this.oldLevel-1) / 5)) {
			music.level1Opening.currentTime = music.level1.currentTime = music.level6.currentTime = music.level11.currentTime = music.level11Opening.currentTime = 0;
			if (this.level > 10) {
				this.currentSong = music.level11Opening;
				this.currentSong.onended = () => {
					this.currentSong = music.level11;
					this.currentSong.play();
				}
			} else if (this.level > 5) {
				this.currentSong = music.level6;
			} else {
				this.currentSong = music.level1Opening;
				this.currentSong.onended = () => {
					this.currentSong = music.level1;
					this.currentSong.play();
				}
			}
		}
	}

	loadModeParameters(parameters) {
		super.loadModeParameters(parameters);
		this.level = parameters.startingLevel;
	}
}

class GameScreenGuidelineEndless extends GameScreenGuidelineBase {
	constructor(parent, showKeystrokes, doSaveReplay) {
		super(parent, showKeystrokes, doSaveReplay);
		this.level = 1;
		this.linesOfCurrentLevel = 0;
		this.totalLinesToNextLevel = 0;
		this.isNewLevel = false;
		this.singleSaveableFields.push("level", "linesOfCurrentLevel", "isNewLevel");
		this.speedCurveNames = ["Normal", "Moderate", "Speedy", "TetrisDotCom"];
	}

	init() {
		super.init();
		if (!this.isReplay)  {
			let highScoreName = "tetrisGuidelineHighScore" + this.speedCurveNames[this.speedCurve];
			let maxLinesName = "tetrisGuidelineMaxLines" + this.speedCurveNames[this.speedCurve];
			this.highScore = localStorage[highScoreName] == undefined ? 0 : localStorage[highScoreName];
			this.maxLines = localStorage[maxLinesName] == undefined ? 0 : localStorage[maxLinesName];
		}
		if (this.level != this.levels.length) this.totalLinesToNextLevel = this.levels[this.level][0];
	}

	start() {
		super.start();
		music.level1Opening.currentTime = music.level1.currentTime = music.level6.currentTime = music.level11.currentTime = music.level11Opening.currentTime = 0;
		if (this.level > 10) {
			this.currentSong = music.level11Opening;
			this.currentSong.onended = () => {
				this.currentSong = music.level11;
				this.currentSong.play();
			}
		} else if (this.level > 5) {
			this.currentSong = music.level6;
		} else {
			this.currentSong = music.level1Opening;
			this.currentSong.onended = () => {
				this.currentSong = music.level1;
				this.currentSong.play();
			}
		}
		if (!this.isReplay) this.currentSong.play();
	}

	renderBehind(timePassed) {
		super.renderBehind(timePassed);
		ctx.fillStyle = "#FFF";
		ctx.font = "12px Segoe UI";
		ctx.textAlign = "left";
		ctx.fillText("Score", 485, 30);
		ctx.fillText("Level " + this.level, 485, 85);
		ctx.fillText("Lines: " + this.lines, 485, 111);
		ctx.fillText("Time elapsed", 485, 164);
		if (!this.isReplay) {
			ctx.fillText("High score", 485, 57);
			ctx.fillText("Max lines", 485, 137);
		}
		
		ctx.textAlign = "right";
		let isLastLevel = this.level == this.levels.length;
		ctx.fillText("" + (isLastLevel ? "" : this.level + 1), 632, 85);
		ctx.fillText("" + (isLastLevel ? "" : this.totalLinesToNextLevel), 632, 111);
		if (!isLastLevel)
			ctx.fillRect(485, 89, 147 * (this.linesOfCurrentLevel / this.levels[this.level][0]), 10);
		ctx.fillText(formatDuration(Math.floor(this.playTime / 1000)), 632, 164);
		if (!this.isReplay) {
			ctx.fillText("" + this.highScore, 632, 57);
			ctx.fillText("" + this.maxLines, 632, 137);
			ctx.fillRect(485, 34, this.highScore == 0 ? 147 : Math.min(147, 147 * this.score / this.highScore), 10);
			ctx.fillRect(485, 115, this.maxLines == 0 ? 147 : Math.min(147, 147 * this.lines / this.maxLines), 10);
		}

		ctx.font = "20px Segoe UI";
		ctx.fillText("" + this.score, 632, 30);
	}

	renderInFront(timePassed) {
		super.renderInFront(timePassed);
		switch (this.state) {
			case GameState.playing:
				if (this.isNewLevel && this.clearTime > 0) {
					ctx.fillStyle = this.level == 6 || this.level == 11 ? "#FF0" : "#FFF";
					ctx.font = "12px Segoe UI";
					ctx.textAlign = "center";
					ctx.fillText("LEVEL UP", 320, 130);
					ctx.font = "30px Segoe UI Light";
					ctx.fillText("" + this.level, 320, 160);
				}
				if (this.totalMinos == 0 && this.clearTime > 0) {
					ctx.fillStyle = "#FFF";
					ctx.textAlign = "center";
					ctx.font = "20px Segoe UI";
					ctx.fillText("ALL CLEAR", 320, 40);
					ctx.fillText("1000 points", 320, 65);
				}
				break;
			case GameState.paused:
				break;
			case GameState.over:
				break;
		}
	}

	clearLines(toClear) {
		super.clearLines(toClear);
		this.linesOfCurrentLevel += toClear.length;
		if (this.level < this.levels.length && this.linesOfCurrentLevel >= this.levels[this.level][0]) {
			this.linesOfCurrentLevel -= this.levels[this.level][0];
			this.level++;
			if (this.level != this.levels.length) this.totalLinesToNextLevel += this.levels[this.level][0];
			this.isNewLevel = true;
			if (!this.isSeeking) switch (this.level) {
				case 6:
					this.currentSong.pause();
					this.currentSong = music.level6Start;
					this.currentSong.onended = () => {
						this.currentSong = music.level6;
						this.currentSong.play();
					}
					this.currentSong.play();
					break;
				case 11:
					this.currentSong.pause();
					this.currentSong = music.level11Start;
					this.currentSong.onended = () => {
						this.currentSong = music.level11Opening;
						this.currentSong.play();
					}
					music.level11Opening.onended = () => {
						this.currentSong = music.level11;
						this.currentSong.play();
					}
					this.currentSong.play();
					break;
			}
			this.clearTime = 1000;
		}
	}

	gameOver() {
		super.gameOver();
		if (!this.isReplay) {
			if (this.score > this.highScore) localStorage["tetrisGuidelineHighScore" + this.speedCurveNames[this.speedCurve]] = this.score;
			if (this.lines > this.maxLines) localStorage["tetrisGuidelineMaxLines" + this.speedCurveNames[this.speedCurve]] = this.lines;
		}
		this.currentSong.pause();
		if (!this.isSeeking) sfx.gameOver.play();
	}

	pause() {
		super.pause();
		this.currentSong.pause();
		if (!this.isReplay) sfx.pause.play();
	}

	resume() {
		super.resume();
		this.currentSong.play();
	}

	getFallInterval() {
		return this.levels[this.level - 1][1];
	}

	getLockDelay() {
		return this.levels[this.level - 1][2];
	}

	getRewardAmount(reward) {
		return this.rewardAmounts[reward] * this.level;
	}

	getComboBonus() {
		return this.combo * 50 * this.level;
	}

	quit() {
		this.currentSong.pause();
		super.quit();
	}

	getModeName() {
		return "Endless guideline";
	}

	getModeNameForDisplay() {
		return "Endless (guideline)";
	}

	loadModeParameters(parameters) {
		super.loadModeParameters(parameters);
		this.levels = parameters.levels;
		this.level = parameters.startingLevel;
	}

	readStateData(state) {
		this.oldLevel = this.level;
		this.currentSong.pause();
		super.readStateData(state);
	}

	finalizeSeek() {
		super.finalizeSeek();
		if (this.state != GameState.over && Math.floor((this.level-1) / 5) != Math.floor((this.oldLevel-1) / 5)) {
			music.level1Opening.currentTime = music.level1.currentTime = music.level6.currentTime = music.level11.currentTime = music.level11Opening.currentTime = 0;
			if (this.level > 10) {
				this.currentSong = music.level11Opening;
				this.currentSong.onended = () => {
					this.currentSong = music.level11;
					this.currentSong.play();
				}
			} else if (this.level > 5) {
				this.currentSong = music.level6;
			} else {
				this.currentSong = music.level1Opening;
				this.currentSong.onended = () => {
					this.currentSong = music.level1;
					this.currentSong.play();
				}
			}
		}
	}
}

class GameScreenGuideline40Line extends GameScreenGuidelineBase {
	constructor(parent, showKeystrokes, doSaveReplay) {
		super(parent, showKeystrokes, doSaveReplay);
		this.singleSaveableFields.push("actionTime");
	}

	init() {
		super.init();
		if (!this.isReplay) {
			this.highScore = localStorage.tetris40LineHighScore == undefined ? 0 : parseInt(localStorage.tetris40LineHighScore);
			this.shortestTime = localStorage.tetris40LineShortestTime == undefined ? -1 : parseInt(localStorage.tetris40LineShortestTime);
		}
		this.actionTime = 0;
	}

	start() {
		super.start();
		music.level6.currentTime = 0;
		if (!this.isReplay) music.level6.play();
	}

	processGameLogic(timePassed) {
		if (this.state == GameState.playing && !this.isClearing) this.actionTime += timePassed;
		super.processGameLogic(timePassed);
	}

	renderBehind(timePassed) {
		super.renderBehind(timePassed);

		ctx.fillStyle = "#FFF";
		ctx.font = "12px Segoe UI";
		ctx.textAlign = "left";
		ctx.fillText("Time", 485, 30);
		ctx.fillText("Lines: " + this.lines, 485, 85);
		ctx.fillText("Score", 485, 126);
		if (!this.isReplay) {
			if (this.shortestTime != -1) ctx.fillText("Shortest time", 485, 57);
			ctx.fillText("High score", 485, 152);
			ctx.fillText("Tetrimino manipulations", 20, 335);
		}
		
		ctx.textAlign = "right";
		ctx.fillText("40", 632, 85);
		ctx.fillText("" + this.score, 632, 126);
		ctx.fillRect(485, 89, Math.min(147, 3.675 * this.lines), 10);

		if (!this.isReplay) {
			ctx.fillText("" + this.highScore, 632, 152);
			if (this.shortestTime != -1) {
				ctx.fillText(formatDurationWithMilliseconds(this.shortestTime / 1000), 632, 57);
				ctx.fillRect(485, 34, Math.min(147, 147 * this.actionTime / this.shortestTime), 10);
			}
			ctx.fillRect(485, 130, this.highScore == 0 ? 147 : Math.min(147, 147 * this.score / this.highScore), 10);
			ctx.fillText("" + this.keypresses, 208, 335);
		}

		ctx.font = "20px Segoe UI";
		ctx.fillText(this.state == GameState.over ? formatDurationWithMilliseconds(this.actionTime / 1000) : formatDuration(Math.floor(this.actionTime / 1000)), 632, 30);
	}

	renderInFront(timePassed) {
		super.renderInFront(timePassed);
		switch (this.state) {
			case GameState.playing:
				if (this.totalMinos == 0 && this.clearTime > 0) {
					ctx.fillStyle = "#FFF";
					ctx.textAlign = "center";
					ctx.font = "20px Segoe UI";
					ctx.fillText("ALL CLEAR", 320, 40);
					ctx.fillText("1000 points", 320, 65);
				}
				break;
			case GameState.paused:
				break;
			case GameState.over:
				ctx.font = "12px Segoe UI";
				ctx.textAlign = "center";
				ctx.fillText(this.gameOverMessage, 320, 60, 150);
				break;
		}
	}

	clearLines(toClear) {
		super.clearLines(toClear);
		if (this.lines > 39) {
			this.gameOverMessage = "You have cleared 40 lines.";
			super.gameOver();
			if (!this.isReplay) {
				if (this.score > this.highScore) localStorage.tetris40LineHighScore = this.score;
				if (this.actionTime < this.shortestTime || this.shortestTime == -1) localStorage.tetris40LineShortestTime = this.actionTime;
			}
			music.level6.pause();
			if (!this.isSeeking) sfx.complete.play();
		}
	}

	pause() {
		super.pause();
		music.level6.pause();
		if (!this.isReplay) sfx.pause.play();
	}

	resume() {
		super.resume();
		music.level6.play();
	}

	gameOver() {
		super.gameOver();
		if (!this.isReplay && this.score > this.highScore) localStorage.tetris40LineHighScore = this.score;
		this.gameOverMessage = "You topped out.";
		music.level6.pause();
		if (!this.isSeeking) sfx.gameOver.play();
	}

	quit() {
		music.level6.pause();
		super.quit();
	}

	getModeName() {
		return "40-line";
	}

	getModeNameForDisplay() {
		return "40-line (Sprint)";
	}

	readStateData(state) {
		this.oldState = this.state;
		super.readStateData(state);
	}

	finalizeSeek() {
		super.finalizeSeek();
		if (this.oldState == GameState.over && this.state != GameState.over) {
			music.level6.currentTime = 0;
			music.level6.play();
		}
	}
}

class GameScreenGuideline2Minute extends GameScreenGuidelineBase {
	constructor(parent, showKeystrokes, doSaveReplay) {
		super(parent, showKeystrokes, doSaveReplay);
		this.singleSaveableFields.push("timeLeft");
	}

	init() {
		super.init();
		if (!this.isReplay) {
			this.highScore = localStorage.tetris2MinuteHighScore == undefined ? 0 : parseInt(localStorage.tetris2MinuteHighScore);
			this.maxLines = localStorage.tetris2MinuteMaxLines == undefined ? 0 : parseInt(localStorage.tetris2MinuteMaxLines);
		}
		this.timeLeft = 120000;
	}

	start() {
		super.start();
		music.level6.currentTime = 0;
		if (!this.isReplay) music.level6.play();
	}

	processGameLogic(timePassed) {
		super.processGameLogic(timePassed);
		if (this.state == GameState.playing && !this.isClearing) {
			this.timeLeft -= timePassed;
			if (this.timeLeft < 1) {
				this.timeLeft = 0;
				this.gameOverMessage = "2' has passed.";
				super.gameOver();
				if (!this.isReplay) {
					if (this.score > this.highScore) localStorage.tetris2MinuteHighScore = this.score;
					if (this.lines > this.maxLines) localStorage.tetris2MinuteMaxLines = this.lines;
				}
				music.level6.pause();
				if (!this.isSeeking) sfx.complete.play();
			}
		}
	}

	renderBehind(timePassed) {
		super.renderBehind(timePassed);
		ctx.fillStyle = "#FFF";
		ctx.font = "12px Segoe UI";
		ctx.textAlign = "left";
		ctx.fillText("Score", 485, 30);
		ctx.fillText("Lines", 485, 85);
		ctx.fillText("Time left: " + formatDuration(Math.floor(this.timeLeft / 1000)), 485, 139);
		if (!this.isReplay) {
			ctx.fillText("High score", 485, 57);
			ctx.fillText("Max lines", 485, 111);
			ctx.fillText("Tetrimino manipulations", 20, 335);
		}
		
		ctx.textAlign = "right";
		ctx.fillText("" + this.lines, 632, 85);
		ctx.fillText("2'", 632, 139);
		ctx.fillRect(485, 143, 0.001225 * this.timeLeft, 10);
		
		if (!this.isReplay) {
			ctx.fillText("" + this.highScore, 632, 57);
			ctx.fillText("" + this.maxLines, 632, 111);
			ctx.fillRect(485, 34, this.highScore == 0 ? 147 : Math.min(147, 147 * this.score / this.highScore), 10);
			ctx.fillRect(485, 89, this.maxLines == 0 ? 147 : Math.min(147, 147 * this.lines / this.maxLines), 10);
			ctx.fillText("" + this.keypresses, 208, 335);
		}

		ctx.font = "20px Segoe UI";
		ctx.fillText("" + this.score, 632, 30);
	}

	renderInFront(timePassed) {
		super.renderInFront(timePassed);
		switch (this.state) {
			case GameState.playing:
				if (this.totalMinos == 0 && this.clearTime > 0) {
					ctx.fillStyle = "#FFF";
					ctx.textAlign = "center";
					ctx.font = "20px Segoe UI";
					ctx.fillText("ALL CLEAR", 320, 40);
					ctx.fillText("1000 points", 320, 65);
				}
				break;
			case GameState.paused:
				break;
			case GameState.over:
				ctx.font = "12px Segoe UI";
				ctx.textAlign = "center";
				ctx.fillText(this.gameOverMessage, 320, 60, 150);
				break;
		}
	}

	pause() {
		super.pause();
		music.level6.pause();
		if (!this.isReplay) sfx.pause.play();
	}

	resume() {
		super.resume();
		music.level6.play();
	}

	gameOver() {
		super.gameOver();
		this.gameOverMessage = "You topped out.";
		music.level6.pause();
		if (!this.isSeeking) sfx.gameOver.play();
	}

	quit() {
		music.level6.pause();
		super.quit();
	}

	getModeName() {
		return "2-minute";
	}

	getModeNameForDisplay() {
		return "2-minute (Ultra)";
	}
	
	readStateData(state) {
		this.oldState = this.state;
		super.readStateData(state);
	}

	finalizeSeek() {
		super.finalizeSeek();
		if (this.oldState == GameState.over && this.state != GameState.over) {
			music.level6.currentTime = 0;
			music.level6.play();
		}
	}
}