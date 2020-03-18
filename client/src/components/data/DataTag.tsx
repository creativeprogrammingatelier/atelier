import React from "react";
import {Badge} from "react-bootstrap";

export interface DataTagProperties {
	name: string,
	color: string,
	dark?: boolean,
}
export function DataTag({name, color, dark}: DataTagProperties) {
	return <Badge className={dark ? "text-white" : "text-dark"} style={{backgroundColor: color}}>{name}</Badge>
}