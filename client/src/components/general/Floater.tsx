import React from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";

interface FloaterProperties extends ParentalProperties {
    top?: number | string,
    right?: number | string,
    bottom?: number | string,
    left?: number | string,
    width?: number | string,
    height?: number | string,
    className?: string
}

export function Floater({top, right, bottom, left, width, height, className, children}: FloaterProperties) {
    return <div className={"floater " + className}
                style={{top, right, bottom, left, minWidth: width, minHeight: height}}>
        {children}
    </div>
}