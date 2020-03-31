import React from "react";
import {Badge} from "react-bootstrap";
import {BootstrapVariant} from "../../helpers/BootstrapHelper";
import {ParentalProperties} from "../../helpers/ParentHelper";

export interface TagProperties extends ParentalProperties {
	large?: boolean,
	round?: boolean,
	light?: boolean,
	color?: string,
	click?: () => void,
	theme?: BootstrapVariant
}
export function Tag({children, large, round, light, color, click, theme}: TagProperties) {
	return<Badge pill={round} className={(light ? "text-dark" : "text-white") + (large ? " badge-large" : "")} variant={theme} style={{backgroundColor: color}} onClick={click}>{children}</Badge>
}