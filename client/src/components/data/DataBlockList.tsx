import React, { Key } from "react";

import {TagProperties} from "../general/Tag";

import {DataBlock} from "./DataBlock";
import {DataList, DataListProperties} from "./DataList";

export interface DataListEntryProperties {
    key: string,
    /** All properties are the same as the DataBlockProperties */
    transport?: string,
    title: string,
    text: string,
    time: Date,
    tags?: (TagProperties & { key: Key })[]
}
interface DataBlockListProperties extends DataListProperties {
    /** List of DataBlockProperties for all DataBlocks within the list. */
    list: DataListEntryProperties[]
}
/**
 * Returns the DataBlockList from the DataBlockListProperties passed in.
 */
export function DataBlockList({list, ...properties}: DataBlockListProperties) {
    return <DataList {...properties}>
        {list.map(block =>
            <DataBlock
                key={block.key}
                transport={block.transport}
                title={block.title}
                text={block.text}
                time={block.time}
                tags={block.tags}
            />
        )}
    </DataList>;
}
