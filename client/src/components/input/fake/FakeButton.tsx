import React from "react";
import {ParentalProperties} from "../../../helpers/ParentHelper";

interface ButtonProperties extends ParentalProperties {
	onClick?: (event: React.MouseEvent) => void
}
export function FakeButton({children, onClick}: ButtonProperties) {
	return <p className="btn btn-primary m-0" onClick={onClick}>{children}</p>
}