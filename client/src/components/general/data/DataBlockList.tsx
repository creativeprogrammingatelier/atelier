import React, {useEffect, useState} from 'react';
import {DataBlock} from './DataBlock';
import {DataTagProperties} from "./DataTag";
import {Heading} from "../Heading";

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
		<Heading title={header}/>
		<div className="m-3">
			{list.map((block) => <DataBlock transport={block.transport} title={block.title} text={block.text} time={{start:block.time, offset:currentTime}} tags={block.tags}/>)}
		</div>
	</div>
}