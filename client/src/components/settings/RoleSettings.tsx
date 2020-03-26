import React, {useState} from 'react';
import {Button, Form, InputGroup} from "react-bootstrap";
import {globalRole} from "../../../../models/enums/globalRoleEnum";
import {courseRole} from "../../../../models/enums/courseRoleEnum";
import {User} from "../../../../models/api/User";
import {UserSearch} from "../general/UserSearch";
import {updateCourseRole, updateGlobalRole} from "../../../helpers/APIHelper";

interface RoleSettingsProps {
    global? : {
        roles : globalRole[]
    },
    course? : {
        roles : courseRole[],
        courseID : string
    }
}

export function RoleSettings({global, course} : RoleSettingsProps) {
    if (global === undefined && course === undefined) return <div />;

    const roles = global !== undefined ? global.roles.map(role => role.toString()) : course!.roles.map(role => role.toString());
    const [user, setUser] = useState(null as unknown as User);
    const [role, setRole] = useState(roles[0]);

    function updateRole() {
        if (user === undefined) return;
        if (global !== undefined) {
            updateGlobalRole(user.ID, role as unknown as globalRole)
                .then(response => console.log(response));
        } else if (course !== undefined) {
            updateCourseRole(user.ID, course.courseID, role as unknown as courseRole)
                .then(response => console.log(response));
        }
    }

    return (
        <div className="updateRole">
            <Form>
                <UserSearch onSelected={(user : User) => setUser(user)} />
                {
                    user !== null &&
                        <div>
                            Name: {user.name}
                            <br />
                            Role : {global === undefined ? user.permission.courseRole : user.permission.globalRole }
                        </div>
                }
                <select onChange={e => setRole(e.target.value)}>
                    {
                        roles.map((role : string) => <option value={role}>{role}</option>)
                    }
                </select>

                <InputGroup.Append>
                    <Button onClick={() => updateRole()}>Update User Role</Button>
                </InputGroup.Append>
            </Form>
        </div>
    )
}