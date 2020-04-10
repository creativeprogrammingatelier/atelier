import {User} from "../../../../../models/api/User";
import {Form} from "react-bootstrap";
import React, {Fragment} from "react";
import {LabeledInput} from "../../input/LabeledInput";

interface UserInfoProperties {
    user: User
}

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