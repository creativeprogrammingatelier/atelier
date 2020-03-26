import React, { useContext, createContext, useState, useEffect } from 'react';

export enum CacheState {
    Uninitialized,
    Loading,
    Loaded,
    Uploading
}

interface CacheProps {
    state: CacheState,
    date: number
}

interface CacheItem<T> extends CacheProps {
    item: T
}

interface CacheCollection<T> extends CacheProps {
    items: Array<CacheItem<T>>
}

interface Cache {
    // The cache should be able to store anything
    // tslint:disable-next-line: no-any 
    [key: string]: CacheCollection<any>
}

interface Context {
    cache: Cache,
    updateCache(update: (cache: Cache) => Cache): void
}

const cacheContext = createContext<Context>({ cache: {}, updateCache: f => { f({}) }});

export function CacheProvider({children}: {children: React.ReactNode}) {
    const storedCache = JSON.parse(localStorage.getItem("cache") || "{}");
    const [cache, updateCache] = useState(storedCache);

    useEffect(() => {
        localStorage.setItem("cache", JSON.stringify(cache));
    }, [cache]);

    return <cacheContext.Provider value={{ cache, updateCache }} children={children} />;
}

export function useCache<T>(key: string, date = Date.now()) {
    const { cache, updateCache } = useContext(cacheContext);
    if (!cache[key]) {
        cache[key] = { state: CacheState.Uninitialized, items: [], date }
    }
    const collection: CacheCollection<T> = cache[key];
    const collectionItems = collection.items.map(({item}) => item);
    const updateCollection = (f: (c: Array<CacheItem<T>>) => Array<CacheItem<T>>, state?: CacheState, date?: number) => 
        updateCache(cache => ({ 
            ...cache, 
            [key]: { 
                ...cache[key], 
                items: f(cache[key].items), 
                state: state || cache[key].state, 
                date: date || cache[key].date 
            } 
        }));

    const add = (item: T, state = CacheState.Loaded, date = Date.now()) => {
        updateCollection(items => items.concat({ item, state, date }));
    }

    const replace = (selector: (oldItem: T) => boolean, newItem: T, state = CacheState.Loaded, date = Date.now()) => {
        updateCollection(items => items.filter(({item}) => !selector(item)).concat({ item: newItem, state, date }));
    }

    const remove = (selector: (item: T) => boolean, date = Date.now()) => {
        updateCollection(items => items.filter(({item}) => !selector(item)));
    }

    const replaceAll = (items: T[], state = CacheState.Loaded, date = Date.now()) => {
        updateCollection(_ => items.map(t => ({ item: t, state, date })), state, date);
    }

    return {
        /** Get the raw cache collection */
        collection, 
        /** Get all items in the collection */
        collectionItems, 
        /** Add a new item */
        add, 
        /** Replace all matching items with a single new item */
        replace, 
        /** Remove all matching items */
        remove, 
        /** Replace all items in the collection with a new array of items */
        replaceAll 
    };
}