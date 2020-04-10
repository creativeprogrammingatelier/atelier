import React from 'react';
import {IconType} from "react-icons";

interface HeaderButtonProperties {
    icon?: IconType,
    onClick?: React.MouseEventHandler,
    right?: boolean
}

export function HeaderButton({icon, onClick, right}: HeaderButtonProperties) {
    return icon ? <div className={right ? "float-right" : ""} onClick={onClick}>{icon({
        size: 38,
        strokeWidth: 1.5,
        color: "#FFFFFF"
    })}</div> : <div/>;
}