import React, { Fragment } from 'react';
import { CacheItem, CacheState } from '../../../helpers/api/Cache';
import { LoadingIcon } from './LoadingIcon';

interface CachedItemProperties<T> {
    item: CacheItem<T>,
    wrapper?: (children: React.ReactNode) => React.ReactNode,
    children: (item: T) => React.ReactNode
}

export function CachedItem<T>({ item, wrapper, children }: CachedItemProperties<T>) {
    if (item.state !== CacheState.Loaded) {
        if (wrapper) {
            return <Fragment children={wrapper(<LoadingIcon />)} />;
        } else {
            return <LoadingIcon />;
        }
    } else {
        return <Fragment children={children(item.item)} />;
    }
}