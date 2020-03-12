import React from "react";
import {ButtonGroup} from "react-bootstrap";
import {ParentalProperties} from "../../helpers/ParentHelper";

interface ButtonBarProperties extends ParentalProperties {
	align?: string,
	transparent?: boolean,
	round?: boolean
}
export function ButtonBar({children, align, transparent, round}: ButtonBarProperties) {
	const alignments: {[key: string]: {[key: string]: string}} = {
		left: {textAlign: "left"},
		center: {textAlign: "center"},
		right: {textAlign: "right"}
	};

	return <div className={"buttonBar" + (round ? " buttonBarRound" : "") + (transparent ? " bg-transparent" : "")} style={alignments[align ? align : "center"]}>
		<ButtonGroup>
			{children}
		</ButtonGroup>
	</div>;
}