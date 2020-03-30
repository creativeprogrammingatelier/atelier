import React, {useEffect, useState} from 'react';
import {DataBlock} from './DataBlock';
import {DataList, DataListProperties} from "./DataList";
import {TagProperties} from "../general/Tag";

export interface DataListEntryProperties {
	transport?: string,
	title: string,
	text: string,
	time: Date,
	tags?: TagProperties[]
}
interface DataBlockListProperties extends DataListProperties {
	list: DataListEntryProperties[]
}
export function DataBlockList({list, ...properties}: DataBlockListProperties) {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const handle = setInterval(() => {
			setCurrentTime(new Date())
        }, 1000);
        return () => clearInterval(handle);
	}, []);

	return <DataList {...properties}>
		{list.map((block) => <DataBlock transport={block.transport} title={block.title} text={block.text} time={{start:block.time, offset:currentTime}} tags={block.tags}/>)}
	</DataList>
}