import * as DateTimeUtil from "./datetime.js";

var countdowns = {};
var nextID = 0;
document.IDsToDelete = [];
document.countdownsToAdd = [];
var dirty = false;

const countdownsElement = document.getElementById("countdowns");

function saveCountdowns() {
	let container = [];
	for (let countdown of Object.values(countdowns))
		container.push({
			name: countdown.name,
			expiry: countdown.expiry,
			formatStart: countdown.formatStart,
			formatOffset: countdown.formatOffset,
			showExpiry: countdown.showExpiry
		});
	localStorage.countdowns = JSON.stringify(container);
	dirty = false;
}

function loadCountdowns() {
	try {
		document.countdownsToAdd = JSON.parse(localStorage.countdowns);
	} catch {
		localStorage.countdowns = "[]";
	}
}

function removeCountdown(event) {
	document.IDsToDelete.push(Number.parseInt(event.target.dataset.id));
	dirty = true;
}

function onDeleteButtonKeyDown(event) {
	if (event.key == "Enter" || event.key == " ") removeCountdown(event);
}

function update() {
	requestAnimationFrame(update);
	for (let ID of document.IDsToDelete) if (ID in countdowns) {
		let countdown = countdowns[ID];
		countdown.element.remove();
		delete countdowns[ID];
	}
	document.IDsToDelete = [];
	for (let countdown of document.countdownsToAdd) {
		let id = nextID++;
		let element = document.createElement("div");
		element.className = "countdownEntry";
		let top = document.createElement("div");
		top.className = "countdownTopLine";
		let topLeft = document.createElement("span");
		topLeft.className = "countdownTopLeft";
		let name = countdown.name;
		topLeft.append(`${name == "" ? "" : name}${countdown.showExpiry ? (name == "" ? "" : " | ") + DateTimeUtil.formatDate(countdown.expiry) : ""}`);
		let topRight = document.createElement("span");
		topRight.className = "icon";
		topRight.append("\uE74D");
		topRight.dataset.id = id;
		topRight.onclick = removeCountdown;
		topRight.onkeydown = onDeleteButtonKeyDown;
		topRight.tabIndex = 0;
		top.append(topLeft, topRight);
		let display = document.createElement("div");
		display.className = "countdownDisplay";
		element.append(top, display);
		countdownsElement.appendChild(element);
		countdown.id = id;
		countdown.element = element;
		countdown.display = display;
		countdown.formatEnd = countdown.formatStart + countdown.formatOffset;
		countdowns[id] = countdown;
	}
	document.countdownsToAdd = [];
	if (dirty) saveCountdowns();
	let timestamp = new Date().getTime();
	for (let countdown of Object.values(countdowns)) {
		let secs = Math.floor((countdown.expiry - timestamp) / 1000);
		let newDisplay = DateTimeUtil.getUnits(countdown.formatEnd, secs);
		if (newDisplay != countdown.oldDisplay) {
			countdown.display.innerHTML = timestamp < countdown.expiry
				? DateTimeUtil.formatDuration(countdown.formatStart, countdown.formatOffset, secs)
				: "Due.";
			countdown.oldDisplay = newDisplay;
		}
	}
}

function getNumberInput(id) {
	return Number.parseFloat(document.getElementById(id).value);
}

function getFormatValue(name) {
	return Number.parseInt(document.querySelector(`input[name="${name}"]:checked`).value);
}

function addCountdown() {
	let currentTime = new Date().getTime();
	let display1 = getFormatValue("addCountdown_display1");
	let display2 = getFormatValue("addCountdown_display2");
	let formatStart = Math.min(display1, display2);
	let formatEnd = Math.max(display1, display2);
	document.countdownsToAdd.push({
		name: document.getElementById("addCountdown_name").value,
		expiry:
			document.getElementById("addCountdown_amountOption").checked
			? currentTime + Math.floor(
				getNumberInput("addCountdown_amountDays") * 86400000
				+ getNumberInput("addCountdown_amountHours") * 3600000
				+ getNumberInput("addCountdown_amountMinutes") * 60000
				+ getNumberInput("addCountdown_amountSeconds") * 1000
			)
			: DateTimeUtil.getEpoch(
				getNumberInput("addCountdown_expiryHour"),
				getNumberInput("addCountdown_expiryMinute"),
				getNumberInput("addCountdown_expirySecond"),
				getNumberInput("addCountdown_expiryDay"),
				getNumberInput("addCountdown_expiryMonth"),
				getNumberInput("addCountdown_expiryYear"),
				getNumberInput("addCountdown_expiryTimezone")
			),
		oldDisplay: null,
		formatStart,
		formatOffset: formatEnd - formatStart,
		showExpiry: document.getElementById("addCountdown_showExpiry").checked
	});
	dirty = true;
}

{
	let date = new Date();
	let pad = (n) => { return (n > 9 ? "" : "0") + n; };
	document.getElementById("addCountdown_expiryHour").value = date.getHours();
	document.getElementById("addCountdown_expiryMinute").value = pad(date.getMinutes());
	document.getElementById("addCountdown_expirySecond").value = pad(date.getSeconds());
	document.getElementById("addCountdown_expiryDay").value = date.getDate();
	document.getElementById("addCountdown_expiryMonth").value = date.getMonth()+1;
	document.getElementById("addCountdown_expiryYear").value = date.getFullYear();
	document.getElementById("addCountdown_expiryTimezone").value = (-date.getTimezoneOffset() / 60).toString().replace('.', ',');
}
document.getElementById("addCountdown_add").onclick = () => { addCountdown(); };
loadCountdowns();
requestAnimationFrame(update);