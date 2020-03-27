import React, { createContext, useState, useContext, useEffect } from 'react';
import { Cache, Update, getCacheInterface } from '../../../helpers/api/Cache';

/** Context used for providing caching */
interface CacheContext {
    cache: Cache
    updateCache: Update<Cache>
}

/** 
 * A React context for the cache. By using a context we can allow any component
 * access to the cache by using a hook, without needing to pass down a Cache
 * object to every component manually.
 */
const cacheContext = createContext<CacheContext>({ cache: {}, updateCache: f => {} });

/** 
 * The cache provider gives its children access to a common cache.
 * Only one of these should be instantiated per application, preferably
 * at the root, so every component in the app can retrieve data from 
 * the cache.
 */
export function CacheProvider({ children }: { children: React.ReactNode }) {
    const storedCache: Cache = JSON.parse(localStorage.getItem("cache") || "{}");
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