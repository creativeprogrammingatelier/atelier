import React from "react";
import {Form} from "react-bootstrap";
import {RoleHelper} from "../../../helpers/RoleHelper";
import {LabeledInput} from "../../input/LabeledInput";

interface UserRolesProperties<T> {
	roles: T,
	onSelected: (role: T | undefined) => void
}

export function UserRoles<T>({roles, onSelected}: UserRolesProperties<T>) {
	const handleSelected = (role: T) => {
		onSelected(role);
	};

	return <LabeledInput label="Select a role">
		<Form.Control as="select" onChange={event => handleSelected((event.target as HTMLInputElement).value as unknown as T)}>
			<option disabled selected>Role of the user</option>
			{Object.keys(roles).map((role: string) => <option value={role}>{RoleHelper.displayName(role)}</option>)}
		</Form.Control>
	</LabeledInput>;
}