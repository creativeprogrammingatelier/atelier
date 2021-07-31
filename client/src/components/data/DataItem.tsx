import React from "react";
import {Toast, ToastBody} from "react-bootstrap";

import {HTMLProperties} from "../../helpers/HTMLHelper";
import {OptionalLink} from "../general/OptionalLink";

import {Tag, TagProperties} from "../general/Tag";

interface DataItemProperties extends HTMLProperties {
    /** The destination for the OptionalLink component */
    transport?: string,
    /** Data of DataItem */
    text: string,
    /** Tags associated with DataItem */
    tags?: TagProperties[]
}
/**
 * Returns the DataItem component from the parameters passed.
 */
export function DataItem({transport, text, tags, className, id, key, children}: DataItemProperties) {
    return <div className={"dataItem " + className} id={id} key={key}>
        <OptionalLink to={transport ? transport : ""}>
            <Toast>
                <ToastBody style={{display: "flex"}}>
                    <span className="mr-auto">
                        <p className="m-0 mr-1 d-inline">{text}</p>
                        {tags !== undefined && tags.map((tag) => <Tag {...tag}/>)}
                    </span>
                    {children}
                </ToastBody>
            </Toast>
        </OptionalLink>
    </div>;
}
