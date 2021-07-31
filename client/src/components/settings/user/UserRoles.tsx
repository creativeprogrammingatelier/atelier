import React from "react";
import {Form} from "react-bootstrap";

import {RoleHelper} from "../../../helpers/RoleHelper";

import {LabeledInput} from "../../input/LabeledInput";

interface UserRolesProperties<T> {
    /** key-value pair of all roles within Atelier */
    roles: T,
    /** Function to resolve selection event. */
    onSelected: (role: T | undefined) => void
}
/**
 * Component to manage roles of a user.
 */
export function UserRoles<T>({roles, onSelected}: UserRolesProperties<T>) {
    /**
     * Hook for resolving a select event.
     *
     * @param role Role to be parse by resolver.
     */
    const handleSelected = (role: T) => {
        onSelected(role);
    };

    return <LabeledInput label="Select a role">
        <Form.Control as="select"
            onChange={event => handleSelected((event.target as HTMLInputElement).value as unknown as T)}>
            <option disabled selected>Role of the user</option>
            {Object.keys(roles).filter(role => role !== "unregistered").map((role: string) =>
                <option key={role} value={role}>{RoleHelper.displayName(role)}</option>
            )}
        </Form.Control>
    </LabeledInput>;
}
