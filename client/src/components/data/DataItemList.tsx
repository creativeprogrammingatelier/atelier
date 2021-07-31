import React from "react";

import {Heading} from "../general/Heading";
import {TagProperties} from "../general/Tag";

import {DataItem} from "./DataItem";
/**
 * Same properties as the DataItemProperties
 */
interface DataListEntryProperties {
    transport?: string,
    text: string,
    tags?: TagProperties[]
}
interface DataItemListProperties {
    /** Header for the DataItemList */
    header: string,
    /** List of properties representing the data entries inside the list. */
    list: DataListEntryProperties[]
}
/**
 * Returns the DataItemList populated with the DataItems derived from the parameters passed.
 */
export function DataItemList({header, list}: DataItemListProperties) {
    return <div>
        <Heading title={header}/>
        <div className="m-3">
            {list.map(block => <DataItem transport={block.transport} text={block.text} tags={block.tags}/>)}
        </div>
    </div>;
}
