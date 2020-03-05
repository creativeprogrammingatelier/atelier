class FetchCache {
	// tslint:disable-next-line: no-any - We need to store any kind of response
	private cache: {[url: string]: any} = {};

	has(url: RequestInfo) {
		return this.cache.hasOwnProperty(FetchCache.url(url));
	}
	get<T>(url: RequestInfo) {
		if (this.has(url)) {
			return this.cache[FetchCache.url(url)];
		} else {
			return undefined;
		}
	}
	register<T>(url: RequestInfo, data: T) {
		this.cache[FetchCache.url(url)] = data;
	}

	private static url(url: RequestInfo) {
		if (url instanceof Request) {
			return url.url;
		}
		return url;
	}
}

export const cache: FetchCache = new FetchCache();