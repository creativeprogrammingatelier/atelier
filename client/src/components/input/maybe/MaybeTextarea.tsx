import React, { Fragment } from "react";
import {Form} from "react-bootstrap";
import {ParentalProperties} from "../../../helpers/ParentHelper";

interface MaybeTextareaProperties extends ParentalProperties {
	modify: boolean,
	placeholder: string,
	value: string,
	onChange?: (value: string) => void
}
export function MaybeTextarea({modify, placeholder, value, onChange, children}: MaybeTextareaProperties) {
	return <Fragment>
		{modify ?
			<Form.Control
				as="textarea"
				placeholder={placeholder}
				value={value}
				onChange={event => onChange && onChange((event.target as HTMLInputElement).value)}/>
			:
			children ? children : <Form.Control as="textarea" readOnly value={value}/>
		}
	</Fragment>;
}