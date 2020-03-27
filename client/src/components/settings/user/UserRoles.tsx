import React from "react";
import {Form} from "react-bootstrap";
import {Label} from "../../general/Label";

interface UserRolesProperties<T> {
	roles: T,
	onSelected: (role: T | undefined) => void
}

export function UserRoles<T>({roles, onSelected}: UserRolesProperties<T>) {
	const handleSelected = (role: T) => {
		onSelected(role);
	};

	return <Form.Label className="w-100">
		<Label>Select a role</Label>
		<Form.Control as="select" onChange={event => handleSelected((event.target as HTMLInputElement).value as unknown as T)}>
			<option disabled selected>Role within the course</option>
			{Object.keys(roles).map((role: string) => <option value={role}>{role}</option>)}
		</Form.Control>
	</Form.Label>;
}