export type Update<T> = (update: (cache: T) => T) => void

export enum CacheState {
    Uninitialized,
    Loading,
    Loaded
}

export interface CacheItem<T> {
    readonly state: CacheState,
    readonly item: T
}

export interface CacheCollection<T> {
    readonly lastRefresh: number,
    readonly lastUpdate: number,
    readonly state: CacheState,
    readonly items: Array<CacheItem<T>>
}

export interface Cache {
    // The cache should be able to store anything
    // tslint:disable-next-line: no-any 
    readonly [key: string]: CacheCollection<any>
}

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
    replaceAll: (items: T[], state: CacheState, date?: number) => void
}

const getCollection = <T>(cache: Cache, key: string): CacheCollection<T> =>
    cache[key] !== undefined
    ? cache[key]
    : { state: CacheState.Uninitialized, items: [], lastRefresh: 0, lastUpdate: 0 };

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
            items: collection.items.filter(({item}) => !selector(item)).concat({ item: newItem, state })
        }));
    }

    const remove = (selector: (item: T) => boolean, date = Date.now()) => {
        updateCollection(collection => ({
            ...collection,
            lastUpdate: date,
            items: collection.items.filter(item => !selector(item.item))
        }));
    }

    const replaceAll = (items: T[], state: CacheState, date = Date.now()) => {
        updateCollection(collection => ({
            ...collection,
            state,
            lastUpdate: date, 
            lastRefresh: date,
            items: items.map(item => ({ item, state }))
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