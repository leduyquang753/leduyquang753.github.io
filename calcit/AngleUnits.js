import * as Utils from "./Utils.js";

class Degree {
	convertToDegrees(angle) {
		return angle;
	}
	convertFromDegrees(angle) { 
		return angle;
	}
	convertToRadians(angle) {
		return Utils.degToRad(angle);
	}
	convertFromRadians(angle) {
		return Utils.radToDeg(angle);
	}
	convertToGradians(angle) {
		return Utils.degToGrad(angle);
	}
	convertFromGradians(angle) {
		return Utils.gradToDeg(angle);
	}
}

class Radian {
	convertToDegrees(angle) {
		return Utils.radToDeg(angle);
	}
	convertFromDegrees(angle) { 
		return Utils.degToRad(angle);
	}
	convertToRadians(angle) {
		return angle;
	}
	convertFromRadians(angle) {
		return angle;
	}
	convertToGradians(angle) {
		return Utils.radToGrad(angle);
	}
	convertFromGradians(angle) {
		return Utils.gradToRad(angle);
	}
}

class Gradian {
	convertToDegrees(angle) {
		return Utils.gradToDeg(angle);
	}
	convertFromDegrees(angle) { 
		return Utils.degToGrad(angle);
	}
	convertToRadians(angle) {
		return Utils.gradToRad(angle);
	}
	convertFromRadians(angle) {
		return Utils.radToGrad(angle);
	}
	convertToGradians(angle) {
		return angle;
	}
	convertFromGradians(angle) {
		return angle;
	}
}

export const DEGREE = new Degree(), RADIAN = new Radian(), GRADIAN = new Gradian();