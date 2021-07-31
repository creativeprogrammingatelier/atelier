import React, {Fragment} from "react";
import {Form} from "react-bootstrap";
import {ParentalProperties} from "../../../helpers/ParentHelper";

interface MaybeTextareaProperties extends ParentalProperties {
	/** Boolean for storing if the input is to be modified */
	modify: boolean,
	/** Placeholder text for text area */
	placeholder: string,
	/** Value of text area */
	value: string,
	/** Function for resolving a user changing selected option */
	onChange?: (value: string) => void
}
/**
 * Text are that is allowed to modified only if the modify flag is true.
 */
export function MaybeTextarea({modify, placeholder, value, onChange, children}: MaybeTextareaProperties) {
	return <Fragment>
		{
			modify ?
				<Form.Control
					as="textarea"
					placeholder={placeholder}
					value={value}
					onChange={event => onChange && onChange((event.target as HTMLInputElement).value)}
				/>
				:
				children ? children : <Form.Control as="textarea" readOnly value={value}/>
		}
	</Fragment>;
}