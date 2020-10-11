export class ExpressionInvalidException extends Error {
	constructor(key, position = -1, messageArguments = null) {
		super(key);
		this.position = position;
		this.messageArguments = messageArguments;
	}
}