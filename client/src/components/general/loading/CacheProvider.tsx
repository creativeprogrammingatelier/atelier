import React, { createContext, useState, useContext, useEffect } from 'react';
import { Cache, Update, getCacheInterface } from '../../../helpers/api/Cache';

/** Context used for providing caching */
export interface CacheContext {
    cache: Cache
    updateCache: Update<Cache>
}

/** 
 * A React context for the cache. By using a context we can allow any component
 * access to the cache by using a hook, without needing to pass down a Cache
 * object to every component manually.
 */
const cacheContext = createContext<CacheContext>({ cache: {}, updateCache: f => {} });

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
    let storedCache: Cache;
    if (pageRefreshed()) {
        storedCache = {};
    } else {
        storedCache = JSON.parse(localStorage.getItem("cache") || "{}");
    }

    const [cache, updateCache] = useState(storedCache);

    useEffect(() => {
        localStorage.setItem("cache", JSON.stringify(cache));
    }, [cache]);

    return <cacheContext.Provider value={{cache, updateCache}} children={children} />
}

/** Hook to get access to specific CacheCollection */
export function useCache<T>(key: string) {
    const { cache, updateCache } = useContext(cacheContext);
    return getCacheInterface<T>(key, cache, updateCache);
}

export function useRawCache() {
    return useContext(cacheContext);
}