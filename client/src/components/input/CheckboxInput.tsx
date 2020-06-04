import {Form} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";

interface CheckboxInputProperties extends ParentalProperties {
	value: string,
	selected?: boolean,
	disabled?: boolean,
	onChange: (state: boolean) => void
}
export function CheckboxInput({children, value, selected, disabled, onChange}: CheckboxInputProperties) {
	const [active, setActive] = useState(selected);
	
	const handleChange = () => {
		onChange(!active);
		setActive(!active);
	};
	
	useEffect(() => setActive(selected), [selected]);
	
	return <Form.Check custom id={value}>
		<Form.Check.Input
			value={value}
			checked={active}
			disabled={disabled}
			onChange={handleChange}
		/>
		<Form.Check.Label htmlFor={value}>{children}</Form.Check.Label>
	</Form.Check>;
}