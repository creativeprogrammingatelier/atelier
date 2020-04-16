/** The structure that's sent to the client on an error */
export interface ServerError {
	/**
	 * A machine readable type for the error, e.g. notfound,
	 * token.expired, token.invalid, db.unique
	 */
	error: string,
	/** A human readable message that can be shown to the user */
	message: string
}