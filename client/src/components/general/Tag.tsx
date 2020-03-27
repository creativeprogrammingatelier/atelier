import React from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";
import {Badge} from "react-bootstrap";

export interface TagProperties extends ParentalProperties {
	large?: boolean,
	round?: boolean,
	light?: boolean,
	color?: string,
	theme?:
		| "primary"
		| "secondary"
		| "success"
		| "danger"
		| "warning"
		| "info"
		| "light"
		| "dark";
}
export function Tag({children, large, round, light, color, theme}: TagProperties) {
	return<Badge pill={round} className={(light ? "text-dark" : "text-white") + (large ? " badge-large" : "")} variant={theme} style={{backgroundColor: color}}>{children}</Badge>
}