import React, { Fragment, useEffect } from 'react';
import { CacheCollection, CacheItem, CacheState } from '../../../helpers/api/Cache';
import { LoadingIcon } from './LoadingIcon';

interface CachedListProperties<T> {
    collection: CacheCollection<T>, 
    refresh?: () => void,
    children: (item: CacheItem<T>) => React.ReactNode
}

export function CachedList<T>({ collection, children, refresh }: CachedListProperties<T>) {
    useEffect(() => {
        if (refresh) {
            const handle = setInterval(() => refresh(), 10 * 1000);
            return () => clearInterval(handle);
        }
    }, []);

    return (
        <Fragment>
            {collection.state !== CacheState.Loaded && <LoadingIcon />}
            {collection.items.map(item => children(item))}
        </Fragment>
    );
}