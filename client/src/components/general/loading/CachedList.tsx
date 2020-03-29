import React, { Fragment, useEffect } from 'react';
import { CacheCollection, CacheItem, CacheState } from '../../../helpers/api/Cache';
import { LoadingIcon } from './LoadingIcon';
import { Heading } from '../Heading';

interface CachedListProperties<T> {
    collection: CacheCollection<T>, 
    header?: string,
    refresh?: () => void,
    timeout?: number,
    bottom?: boolean,
    children: (item: CacheItem<T>) => React.ReactNode
}

function jitter(time: number) {
    return time + (Math.random() * time * 0.2) - (time * 0.1);
}

export function CachedList<T>({ collection, children, header, refresh, timeout = 120, bottom = false }: CachedListProperties<T>) {
    useEffect(() => {
        if (refresh) {
            const expiration = Math.max(0, collection.lastRefresh + timeout * 1000 - Date.now());
            const handle = setTimeout(() => refresh(), jitter(expiration));
            return () => clearTimeout(handle);
        }
    }, [collection.lastRefresh]);

    return (
        <Fragment>
            {header && <Heading title={header} />}
            <div className="m-3">
                {collection.state !== CacheState.Loaded && !bottom && <LoadingIcon />}
                {collection.items.map(item => children(item))}
                {collection.state !== CacheState.Loaded && bottom && <LoadingIcon />}
            </div>
        </Fragment>
    );
}