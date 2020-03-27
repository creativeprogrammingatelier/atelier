import React from "react";
import {HTMLProperties} from "../../helpers/HTMLHelper";

export function Area({children, className, id}: HTMLProperties) {
	return <div className={className + " area"} id={id}>{children}</div>
}