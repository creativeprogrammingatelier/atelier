import React, { Fragment } from 'react';
import { CacheItem, CacheState } from '../../../helpers/api/Cache';
import { LoadingIcon } from './LoadingIcon';

interface CachedItemProperties<T> {
    item: CacheItem<T>,
    children: (item: T) => React.ReactNode
}

export function CachedItem<T>({ item, children }: CachedItemProperties<T>) {
    if (item.state !== CacheState.Loaded) {
        return <LoadingIcon />;
    } else {
        return <Fragment children={children(item.item)} />;
    }
}