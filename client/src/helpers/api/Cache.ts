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

export interface CacheItem<T> extends CacheProperties {
    readonly value: T
}

export const emptyCacheItem = <T>(defaultValue?: T) => ({
    createdAt: 0,
    updatedAt: 0,
    state: CacheState.Uninitialized,
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

export interface Store<T> { [key: string]: T }

export interface ExportedCache {
    // tslint:disable-next-line: no-any
    items: Store<CacheItem<any>>,
    // tslint:disable-next-line: no-any
    collections: Store<CacheCollection<any>>
}

interface SubscribableCollection<T> {
    collection: CacheCollection<T>,
    subscribers: Array<{
        filter?: (value: T) => boolean,
        subscriber: Subscriber<CacheCollection<T>>,
    }>
}

function filterCollection<T>(collection: CacheCollection<T>, filter?: (value: T) => boolean) {
    return {
        ...collection,
        items: 
            filter !== undefined 
            ? collection.items.filter(({value}) => filter(value)) 
            : collection.items
    }
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
                    subscribers: []
                }
            }
        }

        this.exported = new BehaviorSubject(this.export());
    }

    static load(storageKey: string) {
        const { items, collections } = JSON.parse(localStorage.getItem(storageKey) || "{ items: [], collections: [] }");
        return new Cache(items, collections);
    }

    static save(storageKey: string, exported: ExportedCache) {
        localStorage.setItem(storageKey, JSON.stringify(exported));
    }

    private export(): ExportedCache {
        return {
            items: Object.assign({}, ...Object.keys(this.items).map(key => ({ [key]: this.items[key].value }))),
            collections: Object.assign({}, ...Object.keys(this.collections).map(key => ({ [key]: this.collections[key].collection })))
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

    getCollection<T extends { ID: string }>(key: string, filter?: (value: T) => boolean): CacheCollectionInterface<T> {
        if (!this.collections[key]) {
            this.collections[key] = {
                subscribers: [],
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
                const length = this.collections[key].subscribers.push({ filter, subscriber });
                subscriber.next(filterCollection(this.collections[key].collection, filter));
                return () => {
                    this.collections[key].subscribers.splice(length - 1, 1);
                }
            }),
            transaction: (update, state = CacheState.Loaded, date = Date.now()) => {
                let collection = this.collections[key].collection;
                let changed: Array<CacheItem<T>> = [];
                const addAll = (values: T[], state: CacheState) => {
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
                        const itemSelector = (item: CacheItem<T>) => selector(item.value)
                        changed = changed.filter(item => !itemSelector(item)).concat(collection.items.filter(itemSelector));
                        collection = {
                            ...collection,
                            items: collection.items.filter(item => !itemSelector(item))
                        }
                    },
                    removeExpired: (expiration) => {
                        const selector = (item: CacheItem<T>) => item.updatedAt + expiration < date;
                        changed = changed.filter(item => !selector(item)).concat(collection.items.filter(selector));
                        collection = {
                            ...collection,
                            items: collection.items.filter(item => !selector(item))
                        }
                    },
                    clear: () => {
                        for (const { subscriber } of this.collections[key].subscribers) {
                            subscriber.complete();
                            subscriber.unsubscribe();
                        }
                        delete this.collections[key];
                    }
                });
                this.collections[key].collection = {
                    createdAt: collection.createdAt | date,
                    updatedAt: date,
                    state,
                    items: collection.items
                };
                for (const { filter, subscriber } of this.collections[key].subscribers) {
                    if (!filter || changed.some(item => filter(item.value)) || state !== collection.state) {
                        subscriber.next(filterCollection(this.collections[key].collection, filter));
                    }
                }
                this.exported.next(this.export());
            }
        }
    }
}