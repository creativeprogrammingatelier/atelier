import React, {useEffect, useState} from 'react';
import {Header} from '../../frame/Header';
import {DataTagProperties} from "./DataTag";
import {DataItem} from "./DataItem";

interface DataListEntryProperties {
	transport?: string,
	text: string,
	tags?: DataTagProperties[]
}
interface DataItemListProperties {
	header: string,
	list: DataListEntryProperties[]
}
export function DataItemList({header, list}: DataItemListProperties) {
	return <div>
		<Header title={header} small/>
		<div className="m-3">
			{list.map((block) => <DataItem transport={block.transport} text={block.text} tags={block.tags}/>)}
		</div>
	</div>
}