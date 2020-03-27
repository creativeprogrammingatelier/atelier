import React, { Fragment, useEffect } from 'react';
import { CacheCollection, CacheItem, CacheState } from '../../../helpers/api/Cache';
import { LoadingIcon } from './LoadingIcon';

interface CachedListProperties<T> {
    collection: CacheCollection<T>, 
    refresh?: () => void,
    timeout?: number,
    children: (item: CacheItem<T>) => React.ReactNode
}

function jitter(time: number, factor: number) {
    return time + (Math.random() * factor * 150) - (factor * 50);
}

export function CachedList<T>({ collection, children, refresh, timeout = 120 }: CachedListProperties<T>) {
    useEffect(() => {
        if (refresh) {
            const expiration = Math.max(0, collection.lastRefresh + timeout * 1000 - Date.now());
            const handle = setTimeout(() => refresh(), jitter(expiration, timeout));
            return () => clearTimeout(handle);
        }
    }, [collection.lastRefresh]);

    return (
        <Fragment>
            {collection.state !== CacheState.Loaded && <LoadingIcon />}
            {collection.items.map(item => children(item))}
        </Fragment>
    );
}