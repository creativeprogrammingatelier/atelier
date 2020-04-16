import React, {useEffect, Fragment} from "react";
import {useObservableState} from "observable-hooks";

import {APICache, Refresh} from "../../../helpers/api/APIHooks";
import {CacheState} from "../../../helpers/api/Cache";

import {LoadingIcon} from "./LoadingIcon";

interface CachedProperties<T> {
	/** Interface to the cached data and optional refresh */
	cache: APICache<T> | Refresh<T>,
	/** The amount of time to wait until the data is expired and should be refreshed */
	timeout?: number,
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
		cache, timeout, wrapper, onError = msg => {},
		updateCount = count => {},
		children
	}: CachedProperties<T>
) {
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