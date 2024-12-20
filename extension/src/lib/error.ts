export type ErrorName =
	| 'INVALID_KEY_ERROR'
	| '404_DNS_QUERY_ERROR'
	| 'ATPROTO_GET_ERROR';

export class ButterflySignalError extends Error {
	name: ErrorName;
	message: string;
	cause: unknown;

	constructor({
		name,
		message,
		cause,
	}: {
		name: ErrorName;
		message: string;
		cause?: unknown;
	}) {
		super();
		this.name = name;
		this.message = message;
		this.cause = cause;
	}

	public messageGen(): string {
		const message = `[${this.name}]: ${this.message}. ${
			this.cause ? `${this.cause}.` : ''
		}`;
		return message;
	}
}
