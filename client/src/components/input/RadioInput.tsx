import React, {Fragment} from "react";
import {Form} from "react-bootstrap";

interface RadioInputProperties {
	options: string[],
	selected: string,
	onChange: (name: string) => void
}
export function RadioInput({options, selected, onChange}: RadioInputProperties) {
	return options.length > 0 ?
		<Fragment>
			{options.map(value =>
				<Form.Check
					custom
					type="radio"
					id={value}
				>
					<Form.Check.Input
						type="radio"
						value={value}
						checked={selected === value}
						onChange={() => onChange(value)}
					/>
					<Form.Check.Label htmlFor={value}>{value}</Form.Check.Label>
				</Form.Check>
			)}
		</Fragment>
		:
		null;
}