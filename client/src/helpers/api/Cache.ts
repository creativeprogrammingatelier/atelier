import {Observable, Subscriber, BehaviorSubject} from 'rxjs';

/** The state of any item in the cache */
export enum CacheState {
    Uninitialized,
    Loading,
    Loaded
}

/** Common properties for all items in the cache */
export interface CacheProperties {
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly state: CacheState
}

const emptyCacheProperties: CacheProperties = {
    createdAt: 0,
    updatedAt: 0,
    state: CacheState.Uninitialized,
};

/** A single item in the cache */
export interface CacheItem<T> extends CacheProperties {
    readonly value: T
}

/** Value returned if the requested item is not in the cache */
export const emptyCacheItem = <T>(defaultValue?: T) => ({
    ...emptyCacheProperties,
    value: defaultValue
});

/** Interface for working with a CacheItem */
export interface CacheItemInterface<T> {
    /** Get the observable for this item, subscribe for notifications when the value changes */
    observable: Observable<CacheItem<T>>,
    /** 
     * Get the current item of the value. Warning: this is mainly provided for internal use. 
     * You most likely want to subscribe to the observable and get changes as they are made. 
     * Use with caution, only if you are really sure you are not interested in changes.
     */
    getCurrentValue: () => CacheItem<T>,
    /** Update the item using an updater function, also setting the new state */
    updateItem: (update: (t: T) => T, state: CacheState, date?: number) => void,
    /** Delete the item from the cache */
    clear: () => void
}

/** A collection of items of the same type in the cache */
export interface CacheCollection<T> extends CacheProperties {
    readonly items: Array<CacheItem<T>>
}

/** Interface for working with a CacheCollection */
export interface CacheCollectionInterface<T> {
    /** Get the observable for this collection, subscribe for notifications when the items change */
    observable: Observable<CacheCollection<T>>,
    /** 
     * Get the current stored collection. Warning: this is mainly provided for internal use. 
     * You most likely want to subscribe to the observable and get changes as they are made. 
     * Use with caution, only if you are really sure you are not interested in changes. 
     */
    getCurrentValue: () => CacheCollection<T>,
    /** Start a transaction for changing the items in this collection */
    transaction: (update: (funcs: {
        /** 
         * Add all values to the collection, with the given state. If an item 
         * with the same ID already exists, it is replaced with the new item. 
         */
        addAll: (values: T[], state: CacheState) => void,
        /** 
         * Add a single value to to the cache, or replace it if an item with
         * the same ID already exists.
         */
        add: (value: T, state: CacheState) => void,
        /** Remove all selected items from the cache */
        remove: (selector: (value: T) => boolean) => void,
        /** Remove all items that have not been updated for the expiration time */
        removeExpired: (expiration: number) => void,
        /** Delete the entire collection from the cache */
        clear: () => void
    }) => void, state?: CacheState, date?: number) => void
}

/** Options for requesting a collection from the cache */
export interface GetCacheCollectionOptions<T> {
    /** Provide a unique subKey, if you want to treat the response as a separate collection. Often used in combination with filter. */
    subKey?: string,
    /** Filter the items in the collection to only the ones you're interested in */
    filter?: (value: T) => boolean,
    /** Sort the items in the collection, according to the given sort function */
    sort?: (a: T, b: T) => number
}

/** A generic key-value store */
export interface Store<T> {
    [key: string]: T
}

/** Exported version of the cache for persistent storage */
export interface ExportedCache {
    // tslint:disable-next-line: no-any
    items: Store<CacheItem<any>>,
    // tslint:disable-next-line: no-any
    collections: Store<CacheCollection<any>>,
    subCollections: Store<Store<CacheProperties>>
}

/** Wrapper for storing collections and keeping track of its subscribers */
interface SubscribableCollection<T> {
    collection: CacheCollection<T>,
    properties: Store<CacheProperties>,
    lock: LockQueue,
    subscribers: Array<{
        options: GetCacheCollectionOptions<T>,
        subscriber: Subscriber<CacheCollection<T>>,
    }>
}

/** Get the properties of a collection for a given subKey */
function getPropsForSubKey<T>(subCol: SubscribableCollection<T>, subKey?: string) {
    if (subKey) {
        return subCol.properties[subKey] || emptyCacheProperties;
    } else {
        return subCol.collection as CacheProperties;
    }
}

/** Filter and sort a collection according to the given options */
function returnCollection<T>(subCol: SubscribableCollection<T>, options: GetCacheCollectionOptions<T>) {
    let items = subCol.collection.items;
    // filter and sort need to be variables for TypeScript to recognize the null check
    const {filter, sort} = options;
    if (filter) items = items.filter(({value}) => filter(value));
    if (sort) items = items.sort((a, b) => sort(a.value, b.value));
    const props = getPropsForSubKey(subCol, options.subKey);
    return {...props, items};
}

/** A lock that uses a queue of functions that are waiting for the lock to release */
class LockQueue {
    private locked = false;
    private waitingList = [] as Array<() => void>

    /** Execute the next function in the queue, or unlock the lock */
    private next() {
        if (this.waitingList.length > 0) {
            const f = this.waitingList.shift();
            if (f !== undefined) f();
            this.next();
        } else {
            this.locked = false;
        }
    }

    /** Execute the code in the function with the lock acquired */
    withLock(f: () => void) {
        if (!this.locked) {
            this.locked = true;
            f();
            this.next();
        } else {
            this.waitingList.push(f);
        }
    }
}

/** A generic observable cache of items and collections */
export class Cache {
    // The cache has to store any type of data
    // tslint:disable-next-line: no-any
    private items: Store<BehaviorSubject<CacheItem<any>>>;
    // tslint:disable-next-line: no-any
    private collections: Store<SubscribableCollection<any>>;
    private exported: BehaviorSubject<ExportedCache>;

    /** Create a new cache, optionally poviding existing data */
    // TODO: properly handle collection properties
    // tslint:disable-next-line: no-any
    constructor(items?: Store<CacheItem<any>>, collections?: Store<CacheCollection<any>>) {
        this.items = {};
        this.collections = {};

        if (items) {
            for (const key of Object.keys(items)) {
                this.items[key] = new BehaviorSubject(items[key]);
            }
        }

        if (collections) {
            for (const key of Object.keys(collections)) {
                this.collections[key] = {
                    collection: collections[key],
                    lock: new LockQueue(),
                    properties: {},
                    subscribers: []
                }
            }
        }

        this.exported = new BehaviorSubject(this.export());
    }

    /** Create a new cache with the data from a key in localStorage */
    static load(storageKey: string) {
        const {items, collections} = JSON.parse(localStorage.getItem(storageKey) || `{ "items": [], "collections": [] }`);
        return new Cache(items, collections);
    }

    /** Save an exported cache to a key in localStorage */
    static save(storageKey: string, exported: ExportedCache) {
        localStorage.setItem(storageKey, JSON.stringify(exported));
    }

    /** Export the cache structure into an ExportedCache object */
    private export(): ExportedCache {
        return {
            items: Object.assign({}, ...Object.keys(this.items).map(key => ({[key]: this.items[key].value}))),
            collections: Object.assign({}, ...Object.keys(this.collections).map(key => ({[key]: this.collections[key].collection}))),
            subCollections: Object.assign({}, ...Object.keys(this.collections).map(key => ({[key]: this.collections[key].properties})))
        }
    }

    /** Get an observable for the exported cache, which is updated on any change in the cache */
    getExport(): Observable<ExportedCache> {
        return this.exported.asObservable();
    }

    /** Clear all items and collections in the cache */
    clearAll() {
        for (const itemKey of Object.keys(this.items)) {
            this.getItem(itemKey).clear();
        }
        for (const collectionKey of Object.keys(this.collections)) {
            this.getCollection(collectionKey).transaction(cache => cache.clear());
        }
    }

    /** Get the interface for a single item in the cache */
    getItem<T>(key: string, defaultValue?: T): CacheItemInterface<T> {
        if (!this.items[key]) {
            // Subjects are multicast for Observables, they can manage multiple subscribers
            // A BehaviorSubject remembers the last item we gave it, and returns it immediately
            // when a new subscriber comes along
            this.items[key] = new BehaviorSubject(emptyCacheItem(defaultValue));
        }
        return {
            observable: this.items[key].asObservable(),
            getCurrentValue: () => this.items[key].value as CacheItem<T>,
            updateItem: (update, state, date = Date.now()) => {
                if (!this.items[key]) throw new CacheError("cleared", key);

                const item: CacheItem<T> = this.items[key].value;
                this.items[key].next({
                    createdAt: item.createdAt || date,
                    updatedAt: date,
                    state,
                    value: update(item.value)
                });
                this.exported.next(this.export());
            },
            clear: () => {
                this.items[key].complete();
                this.items[key].unsubscribe();
                delete this.items[key];
            }
        }
    }

    /** Get the interface for a collection of items in the cache */
    getCollection<T extends { ID: string }>(key: string, options: GetCacheCollectionOptions<T> = {}): CacheCollectionInterface<T> {
        if (!this.collections[key]) {
            this.collections[key] = {
                subscribers: [],
                properties: {},
                lock: new LockQueue(),
                collection: {
                    createdAt: 0,
                    updatedAt: 0,
                    state: CacheState.Uninitialized,
                    items: []
                }
            }
        }
        const lock = this.collections[key].lock;
        return {
            observable: new Observable(subscriber => {
                lock.withLock(() => {
                    // Create a new Observable for every call to getCollection, because the options may be different,
                    // so they should receive different values. Keep track of all subscriptions and their options.
                    this.collections[key].subscribers.push({options, subscriber});
                    console.log("Add subscription to", key, "with subKey", options.subKey, "; length:", this.collections[key].subscribers.length);
                    // The subscriber immediately receives the current cached value
                    subscriber.next(returnCollection(this.collections[key], options));
                });
                return () => {
                    // When they unsubscribe, we manually remove the subscriber from our list
                    const i = this.collections[key].subscribers.findIndex(sub => sub.subscriber === subscriber);
                    if (i !== -1) {
                        this.collections[key].subscribers.splice(i, 1);
                        console.log("Remove subscription to", key, "; length:", this.collections[key].subscribers.length);
                    }
                }
            }),
            getCurrentValue: () => returnCollection(this.collections[key], options),
            transaction: (update, state = CacheState.Loaded, date = Date.now()) => {
                if (!this.collections[key]) throw new CacheError("cleared", key);

                lock.withLock(() => {
                    let collection: CacheCollection<T> | undefined = this.collections[key].collection;
                    let changed: Array<CacheItem<T>> = [];
                    const addAll = (values: T[], state: CacheState) => {
                        if (collection === undefined) throw new CacheError("cleared", key);

                        const items = [...collection.items];
                        for (const value of values) {
                            const index = items.findIndex(item => item.value.ID === value.ID);
                            if (index === -1) {
                                const item = {createdAt: date, updatedAt: date, state, value};
                                items.push(item);
                                changed.push(item);
                            } else {
                                const item = {createdAt: items[index].createdAt, updatedAt: date, state, value};
                                items[index] = item;
                                changed.push(item);
                            }
                        }
                        collection = {...collection, items};
                    };

                    update({
                        addAll,
                        add: (value, state) => addAll([value], state),
                        remove: (selector) => {
                            if (collection === undefined) throw new CacheError("cleared", key);

                            const itemSelector = (item: CacheItem<T>) => selector(item.value);
                            changed = changed.filter(item => !itemSelector(item)).concat(collection.items.filter(itemSelector));
                            collection = {
                                ...collection,
                                items: collection.items.filter(item => !itemSelector(item))
                            }
                        },
                        removeExpired: (expiration) => {
                            if (collection === undefined) throw new CacheError("cleared", key);

                            const selector = (item: CacheItem<T>) => item.updatedAt + expiration < date;
                            changed = changed.filter(item => !selector(item)).concat(collection.items.filter(selector));
                            collection = {
                                ...collection,
                                items: collection.items.filter(item => !selector(item))
                            }
                        },
                        clear: () => {
                            if (collection === undefined) throw new CacheError("cleared", key);

                            for (const {subscriber} of this.collections[key].subscribers) {
                                subscriber.complete();
                                subscriber.unsubscribe();
                            }
                            collection = undefined;
                            delete this.collections[key];
                        }
                    });

                    if (collection !== undefined) {
                        if (options.subKey) {
                            this.collections[key].collection = collection;
                            const props = this.collections[key].properties[options.subKey];
                            this.collections[key].properties[options.subKey] = {
                                createdAt: props?.createdAt || date,
                                updatedAt: date,
                                state
                            }
                        } else {
                            this.collections[key].collection = {
                                createdAt: collection.createdAt || date,
                                updatedAt: date,
                                state,
                                items: collection.items
                            };
                        }

                        for (const {options: subOptions, subscriber} of this.collections[key].subscribers) {
                            const filter = subOptions.filter;
                            if (!filter || subOptions.subKey === options.subKey || changed.some(item => filter(item.value))) {
                                subscriber.next(returnCollection(this.collections[key], subOptions));
                            }
                        }
                    }
                });

                this.exported.next(this.export());
            }
        }
    }
}

/** Thrown when something went wrong while using the cache */
export class CacheError extends Error {
    constructor(reason: "cleared" | "other", key: string) {
        switch (reason) {
            case "cleared":
                super(`The cache with key ${key} was cleared. You cannot use it from the same interface.`);
                break;
            default:
                super(`Something went wrong while using cache with key ${key}. Reason: ${reason}.`);
                break;
        }
    }
}