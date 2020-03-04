import AuthHelper from "./AuthHelper";
import {ServerError} from "../../models/api/ServerError";
import {cache} from "./FetchCache";

export class Fetch {
	/**
	 * Combine headers in the options with separate headers into a single options object.
	 * In the case of duplicate headers, preference is given to those in the options.
	 */
	private static combineHeaders(options: RequestInit, headers: HeadersInit) {
		options.headers =
			options.headers
				? {...headers, ...options.headers}
				: headers;
		return options;
	}

	/**
	 * Generic fetch, requesting JSON content from the server,
	 * using the authentication token if the user is logged in.
	 * Throws a `FetchError` if the request was not succesful.
	 */
	static async fetch<T>(url: RequestInfo, options: RequestInit = {}, handler?: (response: Response) => T) {
		const headers: HeadersInit = {};
		if (AuthHelper.loggedIn()) {
			const token = AuthHelper.getToken();
			if (token) headers["Authorization"] = token;
		}

		const doCache: boolean = options.method === undefined || options.method === "GET";

		if (doCache && cache.has(url)) {
			return cache.get(url);
		}

		const response = await fetch(url, Fetch.combineHeaders(options, headers));

		if (response.ok) {
			if (handler) {
				const data = handler(response);
				if (doCache) {
					cache.register(url, data);
				}
				return data;
			}
			if (doCache) {
				cache.register(url, response);
			}
			return response;
		} else {
			throw new FetchError(response);
		}
	}

	/**
	 * Do a fetch and convert the result into a JSON object.
	 * Throws a `JsonFetchError` if the request was not succesful.
	 */
	static async fetchJson<T>(url: RequestInfo, options: RequestInit = {}): Promise<T> {
		const headers = {
			"Accept": "application/json",
			"Content-Type": "application/json"
		};

		try {
			return await Fetch.fetch(url, Fetch.combineHeaders(options, headers), (data) => data.json());
		} catch (error) {
			if (error instanceof FetchError) {
				throw await JsonFetchError.create(error.response);
			} else {
				throw error;
			}
		}
	}

	/** Do a fetch of binary data, returning the blob */
	static async fetchBlob(url: RequestInfo, options: RequestInit = {}) {
		return Fetch.fetch(url, options, (data) => data.blob());
	}

	/** Do a fetch for textual data and return the content as a string */
	static async fetchString(url: RequestInfo, options: RequestInit = {}) {
		const headers = {
			// TODO: find out what is send to the server as the type of .pde files
			"Accept": "text/*"
		};

		return Fetch.fetch(url, Fetch.combineHeaders(options, headers), (data) => data.text());
	}
}

/** Error thrown on an unsuccesful fetch */
export class FetchError extends Error {
	/** The response sent by the server */
	response: Response;

	constructor(response: Response, message = `${response.status}: ${response.statusText}`) {
		super(message);
		this.response = response;
	}
}

/** Error thrown on an unsuccesful fetch when requesting json data */
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