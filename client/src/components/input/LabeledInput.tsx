import React from "react";
import {HTMLProperties} from "../../helpers/HTMLHelper";
import {Form, InputGroup} from "react-bootstrap";
import {Label} from "../general/Label";

interface LabeledInputProperties extends HTMLProperties {
	label: string
}
export function LabeledInput({label, className, id, key, children}: LabeledInputProperties) {
	return <Form.Label className={className ? className : "w-100"}>
		<Label>{label}</Label>
		<InputGroup>
			{children}
		</InputGroup>
	</Form.Label>;
}