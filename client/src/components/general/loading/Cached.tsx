import React, {useEffect, Fragment} from 'react';
import {CacheState} from '../../../helpers/api/Cache';
import {LoadingIcon} from './LoadingIcon';
import {APICache, Refresh} from '../../../helpers/api/APIHooks';
import {useObservableState} from 'observable-hooks';

interface CachedProperties<T> {
    cache: APICache<T> | Refresh<T>,
    timeout?: number,
    wrapper?: (children: React.ReactNode) => React.ReactNode,
    onError?: (error: string) => void,
    updateCount?: (count: number) => void,
    children: (item: T, state: CacheState) => React.ReactNode
}

function jitter(time: number) {
    return time + (Math.random() * time * 0.2) - (time * 0.1);
}

export function Cached<T>({
                              cache, timeout, wrapper, onError = msg => {
    }, updateCount = count => {
    }, children
                          }: CachedProperties<T>) {
    const cached = useObservableState(cache.observable)!;

    useEffect(() => {
        if ("refresh" in cache && cache.refresh) {
            const actualTimeout = timeout !== undefined ? timeout : cache.defaultTimeout;
            if (cached.state === CacheState.Uninitialized) {
                cache.refresh().catch((err: Error) => onError(err.message));
            } else if (actualTimeout !== 0) {
                const expiration = Math.max(0, cached.updatedAt + actualTimeout * 1000 - Date.now());
                const handle = setTimeout(() => cache.refresh(), jitter(expiration));
                return () => clearTimeout(handle);
            }
        }
    }, [timeout, cached.updatedAt]);

    useEffect(() => {
        if (cached.state === CacheState.Loaded) {
            if ("value" in cached) {
                updateCount(1);
            } else {
                updateCount(cached.items.length);
            }
        } else {
            updateCount(1);
        }
    }, [cached]);

    if (cached.state !== CacheState.Loaded) {
        if (wrapper) {
            return <Fragment children={wrapper(<LoadingIcon/>)}/>;
        } else {
            return <LoadingIcon/>;
        }
    } else {
        if ("value" in cached) {
            return <Fragment children={children(cached.value, cached.state)}/>;
        } else {
            return <Fragment children={cached.items.map(item => children(item.value, item.state))}/>;
        }
    }
}