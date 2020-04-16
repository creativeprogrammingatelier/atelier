import React from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";

export function Label({children}: ParentalProperties) {
	return <p className="label">{children}</p>;
}