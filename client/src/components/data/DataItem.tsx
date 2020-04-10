import React from "react";
import {Link} from "react-router-dom";
import {Toast, ToastBody} from "react-bootstrap";
import {Tag, TagProperties} from "../general/Tag";
import {HTMLProperties} from "../../helpers/HTMLHelper";

interface DataItemProperties extends HTMLProperties {
    transport?: string,
    text: string,
    tags?: TagProperties[]
}

export function DataItem(item: DataItemProperties) {
    return <div className={"dataItem " + item.className}>
        {
            item.transport ?
                <Link to={item.transport ? item.transport : ""}>
                    {toast(item)}
                </Link>
                :
                toast(item)
        }
    </div>;
}

function toast({text, tags, children}: DataItemProperties) {
    return <Toast>
        <ToastBody>
            <p className="m-0 mr-1 d-inline">{text}</p>
            {tags !== undefined && tags.map((tag) => <Tag {...tag}/>)}
        </ToastBody>
        {children}
    </Toast>;
}