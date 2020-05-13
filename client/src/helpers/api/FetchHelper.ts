import {ServerError} from "../../../../models/api/ServerError";

export class Fetch {
	/**
	 * Combine headers in the options with separate headers into a single options object.
	 * In the case of duplicate headers, preference is given to those in the options.
	 */
	private static combineHeaders(options: RequestInit, headers: HeadersInit) {
		options.headers = options.headers ?
			{...headers, ...options.headers}
			:
			headers;
		return options;
	}
	
	/**
	 * Generic fetch, requesting JSON content from the server,
	 * using the authentication token if the user is logged in.
	 * An extra handler function can be given to transform the data before caching
	 * Throws a `FetchError` if the request was not successful.
	 */
	static async fetch(url: RequestInfo, options: RequestInit = {}) {
		const response = await fetch(url, options);
		if (response.ok) {
			return response;
		} else {
			throw new FetchError(response);
		}
	}
	
	/**
	 * Do a fetch and convert the result into a JSON object.
	 * Throws a `JsonFetchError` if the request was not successful.
	 */
	static async fetchJson<T>(url: RequestInfo, options: RequestInit = {}): Promise<T> {
		const headers = {
			"Accept": "application/json"
		};
		
		try {
			const res = await Fetch.fetch(url, Fetch.combineHeaders(options, headers));
			return res.json();
		} catch (err) {
			if (err instanceof FetchError) {
				throw await JsonFetchError.create(err.response);
			} else {
				throw err;
			}
		}
	}
	
	/**
	 * Do a fetch of binary data, returning the blob
	 */
	static async fetchBlob(url: RequestInfo, options: RequestInit = {}) {
		const res = await Fetch.fetch(url, options);
		return res.blob();
	}
	
	/**
	 * Do a fetch for textual data and return the content as a string
	 */
	static async fetchString(url: RequestInfo, options: RequestInit = {}) {
		const headers = {
			"Accept": "text/*"
		};
		
		const res = await Fetch.fetch(url, Fetch.combineHeaders(options, headers));
		return res.text();
	}
}

/**
 * Error thrown on an unsuccessful fetch
 */
export class FetchError extends Error {
	/** The response sent by the server */
	response: Response;
	
	constructor(response: Response, message = `${response.status}: ${response.statusText}`) {
		super(message);
		this.response = response;
	}
}

/**
 * Error thrown on an unsuccessful fetch when requesting json data
 */
export class JsonFetchError extends FetchError {
	error: string;
	
	private constructor(response: Response, err: ServerError) {
		super(response, err.message);
		this.error = err.error;
	}
	
	static async create(response: Response) {
		const err: ServerError = await response.json();
		return new JsonFetchError(response, err);
	}
}