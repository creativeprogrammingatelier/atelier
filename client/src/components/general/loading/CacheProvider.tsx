import React, { createContext, useContext } from 'react';
import { Cache } from '../../../helpers/api/Cache';
import { debounceTime } from 'rxjs/operators';

/** 
 * A React context for the cache. By using a context we can allow any component
 * access to the cache by using a hook, without needing to pass down a Cache
 * object to every component manually.
 */
const cacheContext = createContext<Cache>(new Cache());

/** Detect if the page was reloaded, tested to work with IE5 */
function pageRefreshed() {
    if (typeof(performance.getEntriesByType) === "function") {
        const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        if (entry !== undefined && entry.type !== undefined) {
            return entry.type === "reload"; 
        }
    }
    // type === 1 means the page was refreshed, using TYPE_RELOAD breaks IE7
    // It's deprecated, but we only try it if the newer version is not available
    // tslint:disable-next-line: deprecation
    return performance.navigation.type === 1;
}

/** 
 * The cache provider gives its children access to a common cache.
 * Only one of these should be instantiated per application, preferably
 * at the root, so every component in the app can retrieve data from 
 * the cache.
 */
export function CacheProvider({ children }: { children: React.ReactNode }) {
    let cache: Cache;
    if (pageRefreshed()) {
        cache = new Cache();
    } else {
        cache = Cache.load("cache");
    }

    cache.getExport()
        .pipe(debounceTime(750))
        .subscribe(exported => Cache.save("cache", exported));

    return <cacheContext.Provider value={cache} children={children} />
}

/** Hook to get access to specific CacheCollection */
export function useCacheCollection<T extends { ID: string }>(key: string, filter?: (value: T) => boolean) {
    const cache = useContext(cacheContext);
    return cache.getCollection<T>(key, filter);
}

/** Hook to get access to a specific CacheItem */
export function useCacheItem<T>(key: string, defaultValue?: T) {
    const cache = useContext(cacheContext);
    return cache.getItem<T>(key, defaultValue);
}

/** Hook to get access to the raw cache context */
export function useRawCache() {
    return useContext(cacheContext);
}