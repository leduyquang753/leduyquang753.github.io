export const Type = {
	EMPTY_NAME: 0,
	INVALID_NAME: 1,
	NOT_SET: 2
}

export class GetVariableException extends Error {
	constructor(type) {
		this.type = type;
	}
}