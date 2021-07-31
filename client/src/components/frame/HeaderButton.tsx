import React from "react";
import {IconType} from "react-icons";

interface HeaderButtonProperties {
    /** Icon of header button */
    icon?: IconType,
    /** Function for resolving a click on the button */
    onClick?: React.MouseEventHandler,
    /** Boolean for whether it is right aligned */
    right?: boolean
}
/**
 * Component used for defining buttons that go on the header, eg. the Search button.
 */
export function HeaderButton({icon, onClick, right}: HeaderButtonProperties) {
    return icon ?
        <div className={right ? "float-right" : ""} onClick={onClick}>
            {icon({
                size: 38,
                strokeWidth: 1.5,
                color: "#FFFFFF"
            })}
        </div>
        :
        <div/>;
}
