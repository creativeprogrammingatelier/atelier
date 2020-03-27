import React, { createContext, useState, useContext, useEffect } from 'react';
import { Cache, Update, getCacheInterface } from '../../../helpers/api/Cache';

interface CacheContext {
    cache: Cache
    updateCache: Update<Cache>
}

const cacheContext = createContext<CacheContext>({ cache: {}, updateCache: f => {} });

export function CacheProvider({ children }: { children: React.ReactNode }) {
    const storedCache: Cache = JSON.parse(localStorage.getItem("cache") || "{}");
    const [cache, updateCache] = useState(storedCache);

    useEffect(() => {
        localStorage.setItem("cache", JSON.stringify(cache));
    }, [cache]);

    return <cacheContext.Provider value={{cache, updateCache}} children={children} />
}

export function useCache<T>(key: string) {
    const { cache, updateCache } = useContext(cacheContext);
    return getCacheInterface<T>(key, cache, updateCache);
}