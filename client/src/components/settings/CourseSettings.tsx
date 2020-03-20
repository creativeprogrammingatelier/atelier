import React, {ChangeEvent} from 'react';
import {Loading} from "../general/loading/Loading";
import {CourseUser} from '../../../../models/api/CourseUser'
import {getUsersByCourse, setPermission} from "../../../helpers/APIHelper";
import {containsPermission, PermissionEnum} from "../../../../models/enums/permissionEnum";

interface CourseSettingsProps {
    courseID : string
}

interface CourseSettingsState {
    courseID : string,
    settingsUser : string,
    settingsPermission : number,
    viewRestrictedComments : boolean,
    manageUserRegistration : boolean,
    manageUserPermissionsManager : boolean
}

export class CourseSettings extends React.Component<CourseSettingsProps, CourseSettingsState> {
    constructor(props : CourseSettingsProps) {
        super(props);
        this.state = {
            courseID : props.courseID,
            settingsUser : "",
            settingsPermission : 0,
            viewRestrictedComments : false,
            manageUserRegistration : false,
            manageUserPermissionsManager : false
        };
        this.handleUserChange = this.handleUserChange.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    }

    handleUserChange(event : ChangeEvent<HTMLSelectElement>) {
        const values = event.target.value.split("-");
        const userID : string = values[0];
        const permissions : number = values[1] as unknown as number;

        console.log(userID);
        this.setState({
            settingsUser : userID,
            settingsPermission : permissions,
            viewRestrictedComments : containsPermission(PermissionEnum.viewRestrictedComments, permissions),
            manageUserRegistration : containsPermission(PermissionEnum.manageUserRegistration, permissions),
            manageUserPermissionsManager : containsPermission(PermissionEnum.manageUserPermissionsManager, permissions)
        } as unknown as CourseSettingsState);
    }

    handleCheckboxChange(event : ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const value = target.checked;
        const name = target.name;

        this.setState({
            [name] : value
        } as unknown as CourseSettingsState);
    }

    setPermissions() {
        const userID : string = this.state.settingsUser;
        const viewRestrictedComments : boolean = this.state.viewRestrictedComments;
        const manageUserRegistration : boolean = this.state.manageUserRegistration;
        const manageUserPermissionsManager : boolean = this.state.manageUserPermissionsManager;

        const permissions = {
            permissions : {
                viewRestrictedComments,
                manageUserRegistration,
                manageUserPermissionsManager
            }
        };

        console.log("setting permissions");
        setPermission(this.state.courseID, userID, permissions, false)
            .then((courseUser : CourseUser) => {
                // TODO feedback?
                console.log(courseUser);
            });
    }

    render() {
        return (
            <Loading<CourseUser[]>
                loader={() => getUsersByCourse(this.state.courseID)}
                params={[this.state.courseID]}
                component={(users : CourseUser[]) => {
                    return (
                        <div>
                            <select
                                onChange={this.handleUserChange}
                            >
                                {users.map((user : CourseUser) => <option id={user.userID} value={user.userID + "-" + user.permission}>{user.userID}</option>)}
                            </select>


                            <br />
                            <label>
                                View Restricted Comments:
                                <input
                                    name="viewRestrictedComments"
                                    type="checkbox"
                                    checked={this.state.viewRestrictedComments}
                                    onChange={this.handleCheckboxChange} />
                            </label>

                            <br />
                            <label>
                                Manage user registration:
                                <input
                                    name="manageUserRegistration"
                                    type="checkbox"
                                    checked={this.state.manageUserRegistration}
                                    onChange={this.handleCheckboxChange} />
                            </label>

                            <br />
                            <label>
                                Manage user permissions:
                                <input
                                    name="manageUserPermissionsManager"
                                    type="checkbox"
                                    checked={this.state.manageUserPermissionsManager}
                                    onChange={this.handleCheckboxChange} />
                            </label>

                            <br />
                            <button onClick={() => this.setPermissions()}> Set permissions for user </button>

                        </div>
                    )
                }}
            />
        )
    }
}