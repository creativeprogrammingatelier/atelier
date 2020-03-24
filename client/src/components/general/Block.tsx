import React from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";

export function Block({children}: ParentalProperties) {
	return <div className="block">
		{children}
	</div>
}