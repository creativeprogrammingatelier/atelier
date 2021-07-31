import React from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";

interface FloaterProperties extends ParentalProperties {
	/** Float location properties */
	top?: number | string,
	right?: number | string,
	bottom?: number | string,
	left?: number | string,
	/** Size properties */
	width?: number | string,
	height?: number | string,
	/** Class name of the floater */
	className?: string
}
/**
 * A floating component capable of wrapping it's children into a floating div.
 */
export function Floater({top, right, bottom, left, width, height, className, children}: FloaterProperties) {
    return <div className={"floater " + className}
        style={{top, right, bottom, left, minWidth: width, minHeight: height}}>
        {children}
    </div>;
}