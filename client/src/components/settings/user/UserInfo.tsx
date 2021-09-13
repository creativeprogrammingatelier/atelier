import React, {Fragment} from "react";
import {Form} from "react-bootstrap";

import {User} from "../../../../../models/api/User";

import {LabeledInput} from "../../input/LabeledInput";

interface UserInfoProperties {
    /** User to be parsed. */
    user: User
}
/**
 * Component that takes in a user and returns the user info of that user from the database.
 */
export function UserInfo({user}: UserInfoProperties) {
    return <Fragment>
        <LabeledInput label="Name" className="w-50 pr-1">
            <Form.Control plaintext readOnly placeholder="Name" value={user.name}/>
        </LabeledInput>
        <LabeledInput label="Email" className="w-50 pl-1">
            <Form.Control plaintext readOnly placeholder="Email" value={user.email}/>
        </LabeledInput>
    </Fragment>;
}
