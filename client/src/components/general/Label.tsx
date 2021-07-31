import React from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";

/** Label component for wrapping children under a label. */
export function Label({children}: ParentalProperties) {
	return <p className="label">{children}</p>;
}