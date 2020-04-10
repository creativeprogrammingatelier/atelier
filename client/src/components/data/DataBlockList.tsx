import React from 'react';
import {DataBlock} from './DataBlock';
import {DataList, DataListProperties} from "./DataList";
import {TagProperties} from "../general/Tag";

export interface DataListEntryProperties {
    key: string,
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
    return <DataList {...properties}>
        {list.map((block) => <DataBlock key={block.key} transport={block.transport} title={block.title}
                                        text={block.text} time={block.time} tags={block.tags}/>)}
    </DataList>
}