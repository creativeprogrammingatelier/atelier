import React from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";
import {Area} from "./Area";

export function Block({children}: ParentalProperties) {
	return <Area className="block">{children}</Area>
}