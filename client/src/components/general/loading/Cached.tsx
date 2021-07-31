import React, {useEffect, Fragment, useState} from "react";
import {useObservableState} from "observable-hooks";

import {APICache, Refresh, LoadMore} from "../../../helpers/api/APIHooks";
import {CacheState} from "../../../helpers/api/Cache";

import {LoadingIcon} from "./LoadingIcon";
import {Button} from "react-bootstrap";
import {FeedbackContent} from "../../feedback/Feedback";
import {FeedbackError} from "../../feedback/FeedbackError";

interface CachedProperties<T> {
    /** Interface to the cached data and optional refresh */
    cache: APICache<T> | Refresh<T> | LoadMore<T>,
    /** The amount of time to wait until the data is expired and should be refreshed */
    timeout?: number,
    /** Helper to get dates out of items, required for load more */
    extractDate?: (item: T) => Date,
    /** Wrapper to display around the loading indicator */
    wrapper?: (children: React.ReactNode) => React.ReactNode,
    /** Callback to call when an error occurs while refreshing data */
    onError?: (error: string) => void,
    /**
     * Callback to call when the amount of items in the result changes.
     * This was created to work around DataList not knowing the amount of children,
     * but that should be done in a better way. This is kinda hacky and requires
     * upper level state management.
     */
    updateCount?: (count: number) => void,
    /**
     * Function that takes an item in the cache and renders it.
     * If the cache is an item, this function is called once. If
     * the cache is a collection, this function is called for every
     * item in the collection.
     */
    children: (item: T, state: CacheState) => React.ReactNode
}

/** Helper function to spread request delays proportional to the timeout time */
function jitter(time: number) {
    return time + (Math.random() * time * 0.2) - (time * 0.1);
}

export function Cached<T>(
    {
        cache, timeout, extractDate, wrapper, onError,
        updateCount = count => {},
        children,
    }: CachedProperties<T>,
) {
    const cached = useObservableState(cache.observable);
    const [loadMoreEnabled, setLoadMoreEnabled] = useState(true);
    const [error, setError] = useState(false as FeedbackContent);

    useEffect(() => {
        if (cached !== undefined && "refresh" in cache && cache.refresh) {
            const actualTimeout = timeout !== undefined ? timeout : cache.defaultTimeout;
            if (cached.state === CacheState.Uninitialized) {
                cache.refresh().catch((err: Error) => {
                    if (onError !== undefined) onError(err.message);
                    setError(err.message);
                });
            } else if (actualTimeout !== 0) {
                const expiration = Math.max(0, cached.updatedAt + actualTimeout * 1000 - Date.now());
                const handle = setTimeout(async () => cache.refresh(), jitter(expiration));
                return () => clearTimeout(handle);
            }
        }
    }, [timeout, cached?.updatedAt]);
    useEffect(() => {
        if (cached !== undefined && cached.state === CacheState.Loaded) {
            if ("value" in cached) {
                updateCount(1);
            } else {
                updateCount(cached.items.length);
            }
        } else {
            updateCount(1);
        }
    }, [cached]);

    if (cached === undefined || cached.state !== CacheState.Loaded) {
        const content = (
            <Fragment>
                { onError === undefined && <FeedbackError children={error} close={setError} /> }
                <LoadingIcon />
            </Fragment>
        );
        if (wrapper) {
            return <Fragment children={wrapper(content)}/>;
        } else {
            return content;
        }
    } else if ("value" in cached) {
        return (
            <Fragment>
                { onError === undefined && <FeedbackError children={error} timeout={3000} close={setError} /> }
                {children(cached.value, cached.state)}
            </Fragment>
        );
    } else {
        return (
            <Fragment>
                { onError === undefined && <FeedbackError children={error} timeout={3000} close={setError} /> }
                {cached.items.map(item => children(item.value, item.state))}
                {
                    "loadMore" in cache && cache.loadMore && extractDate && (
                        loadMoreEnabled ?
                            (
                                <Button onClick={() => {
                                    cache.loadMore(
                                        Math.max(...cached.items.map(item => extractDate(item.value).getTime())) +
                                            3 * 24 * 60 * 60 * 1000,
                                    ).then(res => {
                                        if (res === 0) setLoadMoreEnabled(false);
                                    });
                                }}>
                                    Load More
                                </Button>
                            ) : <Button> Nothing More to Load</Button>
                    )
                }
            </Fragment>
        );
    }
}
