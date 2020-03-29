export type Update<T> = (update: (cache: T) => T) => void

/** State of an item or collection in the cache */
export enum CacheState {
    Uninitialized,
    Loading,
    Loaded
}

/** An item in the cache, stored in a collection */
export interface CacheItem<T> {
    readonly state: CacheState,
    readonly item: T
}

/** A collection of items of a single type in the cache */
export interface CacheCollection<T> {
    readonly lastRefresh: number,
    readonly lastUpdate: number,
    readonly state: CacheState,
    readonly items: Array<CacheItem<T>>
}

/** The cache is an indexed set of CacheCollections */
export interface Cache {
    // The cache should be able to store anything
    // tslint:disable-next-line: no-any 
    readonly [key: string]: CacheCollection<any>
}

/** An interface for working with a single CacheCollection */
export interface CacheInterface<T> {
    /** Get the raw cache collection */
    collection: CacheCollection<T>,
    /** Set the state of the collection */
    setCollectionState: (state: CacheState) => void,
    /** Add a new item */
    add: (item: T, state: CacheState, date?: number) => void,
    /** Replace all matching items with a single new item */
    replace: (selector: (oldItem: T) => boolean, newItem: T, state: CacheState, date?: number) => void,
    /** Remove all matching items */
    remove: (selector: (item: T) => boolean, date?: number) => void,
    /** Replace all items in the collection with a new array of items */
    replaceAll: (items: T[], state: CacheState, selector?: (item: T) => boolean, date?: number) => void
}

/** Get the collection if it exists, or get a default collection */
const getCollection = <T>(cache: Cache, key: string): CacheCollection<T> =>
    cache[key] !== undefined
    ? cache[key]
    : { state: CacheState.Uninitialized, items: [], lastRefresh: 0, lastUpdate: 0 };

/**
 * Get the cache interface with functions to read and write the cache for a single CacheCollection 
 * @param key The key for the collection you want to work with
 * @param cache The global cache object
 * @param updateCache A function that can be called to update the cache
 */
export function getCacheInterface<T>(key: string, cache: Cache, updateCache: Update<Cache>): CacheInterface<T> {
    const updateCollection: Update<CacheCollection<T>> = (update) => 
        updateCache(cache => ({ 
            ...cache, 
            [key]: update(getCollection(cache, key))
        }));

    const setCollectionState = (state: CacheState) => {
        updateCollection(collection => ({
            ...collection,
            state
        }));
    }

    const add = (item: T, state: CacheState, date = Date.now()) => {
        updateCollection(collection => ({
            ...collection,
            lastUpdate: date,
            items: collection.items.concat({ item, state })
        }));
    }

    const replace = (selector: (oldItem: T) => boolean, newItem: T, state: CacheState, date = Date.now()) => {
        updateCollection(collection => ({ 
            ...collection,
            lastUpdate: date,
            items: [{ item: newItem, state }, ...collection.items.filter(({item}) => !selector(item))]
        }));
    }

    const remove = (selector: (item: T) => boolean, date = Date.now()) => {
        updateCollection(collection => ({
            ...collection,
            lastUpdate: date,
            items: collection.items.filter(item => !selector(item.item))
        }));
    }

    const replaceAll = (items: T[], state: CacheState, selector = (item: T) => true, date = Date.now()) => {
        updateCollection(collection => ({
            ...collection,
            state,
            lastUpdate: date, 
            lastRefresh: date,
            items: items.map(item => ({ item, state })).concat(collection.items.filter(item => !selector(item.item)))
        }));
    }

    return {
        collection: getCollection(cache, key), 
        setCollectionState,
        add, 
        replace, 
        remove, 
        replaceAll 
    };
}