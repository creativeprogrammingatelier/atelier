import React from 'react';
import {DataBlock, DataBlockProperties} from './DataBlock';
import {Header} from '../frame/Header';

interface DataListProperties {
	header: string,
	list: DataBlockProperties[]
}
export function DataList({header, list}: DataListProperties) {
	return <div>
		<Header title={header}/>
		<div className="pt-2">
			{list.map((block) => <DataBlock title={block.title} text={block.text} time={block.time} tags={block.tags}/>)}
		</div>
	</div>
}