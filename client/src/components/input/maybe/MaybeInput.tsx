import React, {Fragment} from "react";
import {Form} from "react-bootstrap";
import {ParentalProperties} from "../../../helpers/ParentHelper";

interface MaybeInputProperties extends ParentalProperties {
	modify: boolean,
	placeholder: string,
	value: string,
	onChange?: (value: string) => void
}
export function MaybeInput({modify, placeholder, value, onChange, children}: MaybeInputProperties) {
	return <Fragment>
		{
			modify ?
				<Form.Control
					type="text"
					placeholder={placeholder}
					value={value}
					onChange={(event: React.FormEvent<HTMLInputElement>) => onChange && onChange((event.target as HTMLInputElement).value)}
				/>
				:
				children ? children : <Form.Control plaintext readOnly value={value}/>
		}
	</Fragment>;
}