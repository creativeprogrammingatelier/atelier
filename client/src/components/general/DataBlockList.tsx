import React, {useEffect, useState} from 'react';
import {DataBlock} from './DataBlock';
import {Header} from '../frame/Header';
import {DataTagProperties} from "./DataTag";

interface DataListEntryProperties {
	transport?: string,
	title: string,
	text: string,
	time: Date,
	tags?: DataTagProperties[]
}
interface DataListProperties {
	header: string,
	list: DataListEntryProperties[]
}
export function DataBlockList({header, list}: DataListProperties) {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		setInterval(() => {
			setCurrentTime(new Date())
		}, 1000)
	}, []);

	return <div>
		<Header title={header}/>
		<div className="py-2">
			{list.map((block) => <DataBlock transport={block.transport} title={block.title} text={block.text} time={{start:block.time, offset:currentTime}} tags={block.tags}/>)}
		</div>
	</div>
}