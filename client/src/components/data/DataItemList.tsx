import React from 'react';
import {DataItem} from "./DataItem";
import {Heading} from "../general/Heading";
import {TagProperties} from "../general/Tag";

interface DataListEntryProperties {
	transport?: string,
	text: string,
	tags?: TagProperties[]
}
interface DataItemListProperties {
	header: string,
	list: DataListEntryProperties[]
}
export function DataItemList({header, list}: DataItemListProperties) {
	return <div>
		<Heading title={header}/>
		<div className="m-3">
			{list.map((block) => <DataItem transport={block.transport} text={block.text} tags={block.tags}/>)}
		</div>
	</div>
}