import React from "react";
import {Toast, ToastBody} from "react-bootstrap";
import {IconType} from "react-icons";

import {Tag, TagProperties} from "../general/Tag";

interface DataTriggerProperties {
    /** Text of the DataTrigger */
    text: string,
    /** Tags associated with the DataTrigger */
    tags?: TagProperties[],
    /** Trigger consisting of an icon and a function to be called when trigger is clicked. */
    trigger: {
        icon: IconType,
        click: () => void
    }
}
/**
 * Returns a Toast with the DataTrigger integrated within it.
 */
export function DataTrigger({text, tags, trigger}: DataTriggerProperties) {
    return <div className="dataToggle">
        <Toast onClick={trigger.click}>
            <ToastBody>
                <p className="m-0 mr-1 d-inline">{text}</p>
                {tags !== undefined && tags.map((tag) => <Tag {...tag}/>)}
                <div className="d-inline-block float-right">
                    {trigger.icon({color: "#000000"})}
                </div>
            </ToastBody>
        </Toast>
    </div>;
}
