import React, {useEffect, useState} from 'react';
import {DataBlock, DataTag} from './DataBlock';
import {Header} from '../frame/Header';

interface DataListEntryProperties {
	title: string,
	text?: string,
	time: Date,
	tags?: DataTag[]
}
interface DataListProperties {
	header: string,
	list: DataListEntryProperties[]
}
export function DataList({header, list}: DataListProperties) {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		setInterval(() => {
			setCurrentTime(new Date())
		}, 1000)
	}, []);

	return <div>
		<Header title={header}/>
		<div className="pt-2">
			{list.map((block) => <DataBlock title={block.title} text={block.text} time={{start:block.time, offset:currentTime}} tags={block.tags}/>)}
		</div>
	</div>
}