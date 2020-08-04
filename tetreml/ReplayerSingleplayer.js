const keyNames = {};

var playScreenImage = new Image();
playScreenImage.src = "Textures/Play screen singleplayer.png";

const sfx = {
	ready: new SFX("SFX/Ready.wav", 1),
	countdown: new SFX("SFX/Countdown.wav", 1),
	single: new SFX("SFX/Single.wav", 4),
	double: new SFX("SFX/Double.wav", 4),
	triple: new SFX("SFX/Triple.wav", 4),
	tetris: new SFX("SFX/Tetris.wav", 4),
	tSpin: new SFX("SFX/T spin.wav", 2),
	move: new SFX("SFX/Move.wav", 8),
	rotate: new SFX("SFX/Rotate.wav", 4),
	softDrop: new SFX("SFX/Soft drop.wav", 8),
	hardDrop: new SFX("SFX/Hard drop.wav", 8),
	lock: new SFX("SFX/Lock.wav", 4),
	land: new SFX("SFX/Land.wav", 4),
	hold: new SFX("SFX/Hold.wav", 3),
	pause: new SFX("SFX/Pause.wav", 4),
	gameOver: new SFX("SFX/Game over.wav", 1),
	complete: new SFX("SFX/Win.wav", 1),
	allClear: new SFX("SFX/All clear.wav", 1),
	afterClear: new SFX("SFX/After clear.wav", 2),
	softLock: new SFX("SFX/Soft lock.wav", 4)
};

const music = {
	level1Opening: new Audio("Music/Level 1 opening.mp3"),
	level1: new Audio("Music/Level 1 main.mp3"),
	level6Start: new Audio("SFX/Level 6.wav"),
	level6: new Audio("Music/Level 6.mp3"),
	level11Start: new Audio("SFX/Level 11.wav"),
	level11Opening: new Audio("Music/Level 11 opening.mp3"),
	level11: new Audio("Music/Level 11 main.mp3"),
};

for (let m of Object.values(music)) {
	m.preload = "auto";
	m.load();
}

music.level1.loop = music.level6.loop = music.level11.loop = true;

var volume;

function setVolume(newVolume) {
	volume = Math.max(0, Math.min(10, newVolume));
	localStorage.tetrisVolume = volume;
	newVolume = Math.pow(volume / 10, 4);
	for (let track of Object.values(music)) track.volume = newVolume;
	for (let effect of Object.values(sfx)) effect.setVolume(newVolume);
}

setVolume(localStorage.tetrisVolume == undefined ? 10 : Number.parseInt(localStorage.tetrisVolume));

var buttonStatus = {
	left: false,
	right: false,
	softDrop: false,
	hardDrop: false,
	rotateClockwise: false,
	rotateCounterClockwise: false,
	hold: false,
	esc: false,
	quitModifier: false
};

var keyMapping = {
	ArrowDown: "playPause",
	ArrowUp: "beginning",
	ArrowLeft: "minus5s",
	ArrowRight: "plus5s",
	ShiftLeft: "shiftLeft",
	ShiftRight: "shiftRight",
	ControlLeft: "ctrlLeft",
	ControlRight: "ctrlRight",
	Minus: "volumeDown",
	Equal: "volumeUp"
};

var keyStatus = {
	beginning: false,
	plus5s: false,
	minus5s: false,
	playPause: false,
	ctrlLeft: false,
	ctrlRight: false,
	shiftLeft: false,
	shiftRight: false,
	volumeDown: false,
	volumeUp: false
};

document.addEventListener("keydown", (key) => {
	let code = key.code;
	if (!(code in keyMapping)) return;
	keyStatus[keyMapping[code]] = true;
});

document.addEventListener("keyup", (key) => {
	let code = key.code;
	if (!(code in keyMapping)) return;
	keyStatus[keyMapping[code]] = false;
});

class ReplayScreen {
	constructor(replay) {
		this.parent = null;
		this.playScreen = new {
			"Endless Tengen": GameScreenTengen,
			"Endless guideline": GameScreenGuidelineEndless,
			"Marathon": GameScreenGuidelineMarathon,
			"Marathon variable": GameScreenGuidelineMarathonVariable,
			"40-line": GameScreenGuideline40Line,
			"2-minute": GameScreenGuideline2Minute
		}[replay.mode](null, false, false);
		this.actionsMapping = {
			"moveLeft": () => { this.playScreen.move(-1); },
			"moveRight": () => { this.playScreen.move(1); },
			"softDrop": () => { this.playScreen.softDrop(); },
			"hardDrop": () => { this.playScreen.hardDrop(); },
			"rotateClockwise": () => { this.playScreen.rotateClockwise(); },
			"rotateCounterClockwise": () => { this.playScreen.rotateCounterClockwise(); },
			"hold": () => { this.playScreen.doHold(); },
			"afterClear": () => { this.playScreen.afterClear(); },
			"fall": () => { this.playScreen.fall(); },
			"lockDown": () => { this.playScreen.lockDown(); }
		};
		this.length = replay.length;
		this.actions = replay.actions;
		this.actionsPointer = 0;
		this.playScreen.replay = replay;
		this.playScreen.loadModeParameters(replay.modeParameters);
		this.playScreen.handleReplayEpoch = (playTime) => {
			if (this.playScreen.isSeeking) return;
			while (this.actionsPointer < this.actions.length && playTime >= this.actions[this.actionsPointer][0]) {
				this.actionsMapping[this.actions[this.actionsPointer++][1]]();
			}
		}
		this.beginning = false;
		this.playPause = false;
		this.minus5s = false;
		this.plus5s = false;
		this.volumeDown = false;
		this.volumeUp = false;
	}

	init() {
		this.playScreen.init();
		this.playScreen.start();
		this.playScreen.pause();
		this.seek(0);
		mainWindow.addEventListener('click', this.clickHandler = (event) => { this.onClick(event); });
	}

	isShiftDown() {
		return keyStatus.shiftLeft || keyStatus.shiftRight;
	}

	isCtrlDown() {
		return keyStatus.ctrlLeft || keyStatus.ctrlRight;
	}

	changeReplaySpeed(delta) {
		this.playScreen.replaySpeed = Math.min(5, Math.max(0.1, this.playScreen.replaySpeed + delta));
	}

	render() {
		if (keyStatus.beginning) {
			if (!this.beginning) {
				this.seek(0);
				this.beginning = true;
			}
		} else this.beginning = false;
		if (keyStatus.playPause) {
			if (!this.playPause) {
				if (this.isCtrlDown()) this.playScreen.replaySpeed = 1;
				else switch (this.playScreen.state) {
					case GameState.playing:
						this.playScreen.pause();
						break;
					case GameState.paused:
						this.playScreen.resume();
						break;
				}
				this.playPause = true;
			}
		} else this.playPause = false;
		if (keyStatus.plus5s) {
			if (!this.plus5s) {
				if (this.isCtrlDown()) this.changeReplaySpeed(0.1);
				else if (this.isShiftDown()) this.changeReplaySpeed(0.01);
				else this.seek(Math.min(this.length, this.playScreen.playTime + 5000));
				this.plus5s = true;
			}
		} else this.plus5s = false;
		if (keyStatus.minus5s) {
			if (!this.minus5s) {
				if (this.isCtrlDown()) this.changeReplaySpeed(-0.1);
				else if (this.isShiftDown()) this.changeReplaySpeed(-0.01);
				else this.seek(Math.max(0, this.playScreen.playTime - 5000));
				this.minus5s = true;
			}
		} else this.minus5s = false;
		if (keyStatus.volumeDown) {
			if (!this.volumeDown) {
				setVolume(volume - 1);
				this.playScreen.volumeDisplayTime = 1000;
				this.volumeDown = true;
			}
		} else this.volumeDown = false;
		if (keyStatus.volumeUp) {
			if (!this.volumeUp) {
				setVolume(volume + 1);
				this.playScreen.volumeDisplayTime = 1000;
				this.volumeUp = true;
			}
		} else this.volumeUp = false;
		this.playScreen.render();
		ctx.strokeStyle = "#FFF";
		ctx.lineWidth = 1;
		ctx.strokeRect(20.5, 345.5, 187, 9);
		ctx.fillRect(21, 346, 186 * Math.min(1, this.playScreen.playTime / this.length), 8);
		ctx.font = "12px Segoe UI";
		ctx.textAlign = "left";
		switch (this.playScreen.state) {
			case GameState.playing:
				ctx.fillText("\u25B6 " + formatDuration(Math.floor(this.playScreen.playTime / 1000)), 20, 340);
				break;
			case GameState.paused:
				ctx.fillText("\u2016 " + formatDurationWithMilliseconds(this.playScreen.playTime / 1000), 20, 340);
				break;
			case GameState.over:
				ctx.fillText("\u25A0 " + formatDurationWithMilliseconds(this.playScreen.playTime / 1000), 20, 340);
				break;
		}

		ctx.fillText("REPLAY CONTROLS", 468, 202);
		
		if (this.isCtrlDown()) {
			ctx.fillText("Ctrl + \u2190", 468, 222);
			ctx.fillText("Ctrl + \u2192", 468, 237);
			ctx.fillText("Ctrl + \u2193", 468, 252);
			ctx.fillText("Speed +0,1", 520, 222);
			ctx.fillText("Speed –0,1", 520, 237);
			ctx.fillText("Reset speed", 520, 252);
		} else if (this.isShiftDown()) {
			ctx.fillText("Shift + \u2190", 468, 222);
			ctx.fillText("Shift + \u2192", 468, 237);
			ctx.fillText("Speed +0,01", 526, 222);
			ctx.fillText("Speed –0,01", 526, 237);
		} else {
			ctx.fillText("Play/Pause", 488, 222);
			ctx.fillText("Go to beginning", 488, 237);
			ctx.fillText("Go back 5\"", 488, 252);
			ctx.fillText("Advance 5\"", 488, 267);
			ctx.fillText("Shift/Ctrl Change speed", 468, 282);
		}

		ctx.textAlign = "center";
		if (!this.isShiftDown() && !this.isCtrlDown()) {
			ctx.fillText("\u2193", 473, 222);
			ctx.fillText("\u2191", 473, 237);
			ctx.fillText("\u2190", 473, 252);
			ctx.fillText("\u2192", 473, 267);
		}
		ctx.fillText((Math.round((this.playScreen.replaySpeed + Number.EPSILON) * 100) / 100 + "").replace(".", ",") + ".", 114, 340);

		ctx.textAlign = "right";
		ctx.fillText(formatDuration(Math.floor(this.length / 1000)), 208, 340);
	}

	close() {
		mainWindow.removeEventListener('click', this.clickHandler);
	}

	seek(epoch) {
		isBusyRendering = true;
		this.playScreen.isSeeking = true;
		this.actionsPointer = this.playScreen.loadState(epoch);
		let oldState = this.playScreen.state;
		this.playScreen.state = GameState.playing;
		let oldEpoch = this.playScreen.playTime;
		while (this.actionsPointer < this.actions.length && epoch >= this.actions[this.actionsPointer][0]) {
			this.playScreen.processGameLogic(this.actions[this.actionsPointer][0] - oldEpoch);
			oldEpoch = this.actions[this.actionsPointer][0];
			this.actionsMapping[this.actions[this.actionsPointer++][1]]();
		}
		this.playScreen.processGameLogic(epoch - oldEpoch);
		this.playScreen.isSeeking = false;
		this.playScreen.finalizeSeek();
		if (this.playScreen.state != GameState.over) {
			if (this.playScreen.state == GameState.playing) this.playScreen.pause();
			if (oldState == GameState.playing) this.playScreen.resume();
		}
		isBusyRendering = false;
	}

	onClick(event) {
		if (event.offsetX < 21 || event.offsetX > 207 || event.offsetY < 346 || event.offsetY > 353) return;
		this.seek(Math.floor((event.offsetX - 21) / 186 * this.length));
	}
}

class InitialScreen {
	init() { }
	render() {
		ctx.font = "14px Segoe UI";
		ctx.fillStyle = "#FFF";
		ctx.textAlign = "center";
		ctx.fillText("Select a replay file below and", 320, 165);
		ctx.fillText("click \"Load\" to view that replay.", 320, 185);
	}
	close() {}
}

var mainWindow = document.getElementById("mainWindow");

var sprite = new Image();
sprite.src = "Textures/Sprite singleplayer.png";

var ctx = mainWindow.getContext("2d");

var currentGui = null;

function openGui(gui) {
	if (currentGui != null) currentGui.close();
	currentGui = gui;
	if (currentGui != null) currentGui.init();
}

function goBack() {
	if (currentGui == null) return;
	openGui(currentGui.parent == undefined ? null : currentGui.parent);
}

var isBusyRendering = false;

function render() {
	requestAnimationFrame(render);
	if (!isBusyRendering) try {
		isBusyRendering = true;
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, 640, 360);
		if (currentGui == null) return;
		currentGui.render();
	} finally {
		isBusyRendering = false;
	}
}

var fileSelector = document.getElementById("fileSelector");

function loadReplay() {
	let reader = new FileReader();
	reader.addEventListener("load", (event) => {
		openGui(new ReplayScreen(JSON.parse(pako.inflate(event.target.result, {to: "string"}))));
	});
	reader.readAsBinaryString(fileSelector.files[0]);
}

function onReplayFileChange() {
	document.getElementById("buttonLoad").disabled = fileSelector.files.length == 0;
}

openGui(new InitialScreen(null));

requestAnimationFrame(render);

fileSelector.disabled = false;