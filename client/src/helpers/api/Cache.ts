import { Observable, Subscriber, BehaviorSubject } from 'rxjs';

export enum CacheState {
    Uninitialized,
    Loading,
    Loaded
}

export interface CacheProperties {
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly state: CacheState
}

const emptyCacheProperties: CacheProperties = {
    createdAt: 0,
    updatedAt: 0,
    state: CacheState.Uninitialized,
}

export interface CacheItem<T> extends CacheProperties {
    readonly value: T
}

export const emptyCacheItem = <T>(defaultValue?: T) => ({
    ...emptyCacheProperties,
    value: defaultValue
});

export interface CacheItemInterface<T> {
    observable: Observable<CacheItem<T>>,
    updateItem: (update: (t: T) => T, state: CacheState, date?: number) => void,
    clear: () => void
}

export interface CacheCollection<T> extends CacheProperties {
    readonly items: Array<CacheItem<T>>
}

export interface CacheCollectionInterface<T> {
    observable: Observable<CacheCollection<T>>,
    transaction: (update: (funcs: {
        addAll: (values: T[], state: CacheState) => void,
        add: (value: T, state: CacheState) => void,
        remove: (selector: (value: T) => boolean) => void,
        removeExpired: (expiration: number) => void,
        clear: () => void
    }) => void, state?: CacheState, date?: number) => void
}

export interface GetCacheCollectionOptions<T> {
    subKey?: string,
    filter?: (value: T) => boolean,
    sort?: (a: T, b: T) => number
}

export interface Store<T> { [key: string]: T }

export interface ExportedCache {
    // tslint:disable-next-line: no-any
    items: Store<CacheItem<any>>,
    // tslint:disable-next-line: no-any
    collections: Store<CacheCollection<any>>,
    subCollections: Store<Store<CacheProperties>>
}

interface SubscribableCollection<T> {
    collection: CacheCollection<T>,
    properties: Store<CacheProperties>,
    subscribers: Array<{
        options: GetCacheCollectionOptions<T>,
        subscriber: Subscriber<CacheCollection<T>>,
    }>
}

function getPropsForSubKey<T>(subCol: SubscribableCollection<T>, subKey?: string) {
    if (subKey) {
        return subCol.properties[subKey] || emptyCacheProperties;
    } else {
        return subCol.collection as CacheProperties;
    }
}

function returnCollection<T>(subCol: SubscribableCollection<T>, options: GetCacheCollectionOptions<T>) {
    let items = subCol.collection.items;
    // filter and sort need to be variables for TypeScript to recognize the null check
    const { filter, sort } = options;
    if (filter) items = items.filter(({value}) => filter(value));
    if (sort) items = items.sort((a, b) => sort(a.value, b.value));
    const props = getPropsForSubKey(subCol, options.subKey);
    return { ...props, items };
}

export class Cache {
    // The cache has to store any type of data
    // tslint:disable-next-line: no-any
    private items: Store<BehaviorSubject<CacheItem<any>>>
    // tslint:disable-next-line: no-any
    private collections: Store<SubscribableCollection<any>>
    private exported: BehaviorSubject<ExportedCache>

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
                    properties: {},
                    subscribers: []
                }
            }
        }

        this.exported = new BehaviorSubject(this.export());
    }

    static load(storageKey: string) {
        const { items, collections } = JSON.parse(localStorage.getItem(storageKey) || `{ "items": [], "collections": [] }`);
        return new Cache(items, collections);
    }

    static save(storageKey: string, exported: ExportedCache) {
        localStorage.setItem(storageKey, JSON.stringify(exported));
    }

    private export(): ExportedCache {
        return {
            items: Object.assign({}, ...Object.keys(this.items).map(key => ({ [key]: this.items[key].value }))),
            collections: Object.assign({}, ...Object.keys(this.collections).map(key => ({ [key]: this.collections[key].collection }))),
            subCollections: Object.assign({}, ...Object.keys(this.collections).map(key => ({ [key]: this.collections[key].properties })))
        }
    }

    getExport(): Observable<ExportedCache> {
        return this.exported.asObservable();
    }

    getItem<T>(key: string, defaultValue?: T): CacheItemInterface<T> {
        if (!this.items[key]) {
            this.items[key] = new BehaviorSubject(emptyCacheItem(defaultValue));
        }
        return {
            observable: this.items[key].asObservable(),
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

    getCollection<T extends { ID: string }>(key: string, options: GetCacheCollectionOptions<T> = {}): CacheCollectionInterface<T> {
        if (!this.collections[key]) {
            this.collections[key] = {
                subscribers: [],
                properties: {},
                collection: {
                    createdAt: 0,
                    updatedAt: 0,
                    state: CacheState.Uninitialized,
                    items: []
                }
            }
        }
        return {
            observable: new Observable(subscriber => {
                const length = this.collections[key].subscribers.push({ options, subscriber });
                subscriber.next(returnCollection(this.collections[key], options));
                return () => {
                    this.collections[key].subscribers.splice(length - 1, 1);
                }
            }),
            transaction: (update, state = CacheState.Loaded, date = Date.now()) => {
                if (!this.collections[key]) throw new CacheError("cleared", key);

                let collection: CacheCollection<T> | undefined = this.collections[key].collection;
                let changed: Array<CacheItem<T>> = [];
                const addAll = (values: T[], state: CacheState) => {
                    if (collection === undefined) throw new CacheError("cleared", key);

                    const items = [...collection.items];
                    for (const value of values) {
                        const index = items.findIndex(item => item.value.ID === value.ID);
                        if (index === -1) {
                            const item = { createdAt: date, updatedAt: date, state, value };
                            items.push(item);
                            changed.push(item);
                        } else {
                            const item = { createdAt: items[index].createdAt, updatedAt: date, state, value }
                            items[index] = item;
                            changed.push(item);
                        }
                    }
                    collection = { ...collection, items };
                }
                update({
                    addAll,
                    add: (value, state) => addAll([value], state),
                    remove: (selector) => {
                        if (collection === undefined) throw new CacheError("cleared", key);

                        const itemSelector = (item: CacheItem<T>) => selector(item.value)
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

                        for (const { subscriber } of this.collections[key].subscribers) {
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

                    for (const { options: subOptions, subscriber } of this.collections[key].subscribers) {
                        const filter = subOptions.filter;
                        if (!filter || subOptions.subKey === options.subKey || changed.some(item => filter(item.value))) {
                            subscriber.next(returnCollection(this.collections[key], subOptions));
                        }
                    }
                }

                this.exported.next(this.export());
            }
        }
    }
}

export class CacheError extends Error {
    constructor(reason: "cleared" | "other", key: string) {
        switch (reason) {
            case "cleared":
                super(`The cache with key ${key} was cleared. You cannot use it from the same interface.`);
                break;
            default:
                super(`Something went wrong while using cache with key ${key}.`);
                break;
        }
    }
}