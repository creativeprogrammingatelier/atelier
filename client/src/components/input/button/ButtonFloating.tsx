import React from "react";
import {ParentalProperties} from "../../../helpers/ParentHelper";
import {Button} from "react-bootstrap";

interface ButtonFloatingProperties extends ParentalProperties {

}
export function ButtonFloating({children}: ButtonFloatingProperties) {
	return <Button className="buttonFloating">
		{children}
	</Button>
}