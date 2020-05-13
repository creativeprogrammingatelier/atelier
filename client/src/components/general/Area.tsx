import React from "react";
import {HTMLProperties} from "../../helpers/HTMLHelper";

interface AreaProperties extends HTMLProperties {
	transparent?: boolean
}
export function Area({transparent, className, id, key, children}: AreaProperties) {
	return <div className={className + " area" + (transparent ? " transparent" : "")} id={id} key={key}>{children}</div>;
}