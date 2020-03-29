import React, { useState, useEffect } from "react";
import { DataBlock } from "../../data/DataBlock";
import { CacheCollection, CacheItem } from "../../../helpers/api/Cache";
import { DataListEntryProperties } from "../../data/DataBlockList";
import { CachedList } from "./CachedList";

interface CachedDataBlockListProperties<T> {
    collection: CacheCollection<T>,
    header?: string,
    refresh?: () => void,
    timeout?: number,
    bottom?: boolean,
    map: (item: CacheItem<T>) => DataListEntryProperties
}

export function CachedDataBlockList<T>({ collection, header, refresh, timeout, bottom, map }: CachedDataBlockListProperties<T>) {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		setInterval(() => {
			setCurrentTime(new Date())
		}, 1000)
	}, []);

    return <CachedList collection={collection} header={header} refresh={refresh} timeout={timeout} bottom={bottom}>{
        item => {
            const block = map(item);
            return <DataBlock transport={block.transport} title={block.title} text={block.text} time={{start:block.time, offset:currentTime}} tags={block.tags}/>;
        }
	}</CachedList>
}