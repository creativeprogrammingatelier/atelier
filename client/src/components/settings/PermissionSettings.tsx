import React, {ChangeEvent} from 'react';
import {getEnum} from "../../../../models/enums/enumHelper";
import {
    containsPermission,
    managePermissions,
    PermissionEnum,
    viewPermissions
} from "../../../../models/enums/permissionEnum";
import {Loading} from "../general/loading/Loading";
import {getAllUsers, getUsersByCourse, setPermissionCourse, setPermissionGlobal} from "../../../helpers/APIHelper";
import {User} from "../../../../models/api/User";
import {CourseUser} from "../../../../models/api/CourseUser";
import {UserSearch} from "./user/UserSearch";

interface CourseSettingsProps {
    courseID?: string,
    viewPermissions: boolean,
    managePermissions: boolean
}

const DEFAULT_USER = "-USER-";

/**
 * Set permissions for a user in a course or globally.
 */
export class PermissionSettings extends React.Component<CourseSettingsProps> {
    constructor(props: CourseSettingsProps) {
        super(props);
        this.state = {
            courseID: props.courseID,
            settingsUserName : "Select a User",
            settingsUser: "",
            settingsPermission: 0,

            manageUserPermissionsView: false,
            manageUserPermissionsManager: false,
            manageUserRole: false,
            viewAllUserProfiles: false,
            manageUserRegistration: false,
            viewAllCourses: false,
            addCourses: false,
            manageCourses: false,
            addAssignments: false,
            manageAssignments: false,
            viewAllSubmissions: false,
            viewRestrictedComments: false,
            addRestrictedComments: false,
            manageRestrictedComments: false,
            mentionAllStudents: false,
            mentionAllAssistants: false,
            mentionAllTeachers: false,
            mentionNoLimit: false
        };

        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
    }

    /**
     * Track checkbox states in state
     * @param event, checkbox event
     */
    handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const value = target.checked;
        const name = target.name;

        this.setState((state) => ({
            ...state,
            [name]: value
        }));
    }

    /**
     * Update permissions for the current user (updates the checkboxes)
     * @param userPermissions, permissions of the current user
     * @param permissions, (display) names of the permissions
     */
    updatePermissions(userPermissions: number, permissions: Array<{display : string, name : string}>) {
        permissions.forEach((permission) => {
            const permissionType: PermissionEnum = getEnum(PermissionEnum, permission.name);
            const permissionName: string = PermissionEnum[permissionType];
            const permissionContained: boolean = containsPermission(permissionType, userPermissions);
            this.setState({[permissionName]: permissionContained});
        });
    }

    /**
     * Keep track of current user
     * @param user
     */
    handleUserChange(user : User) {
        const userID = user.ID;
        const permissions = user.permission.permissions;

        this.setState({
            settingsUserName : user.name,
            settingsUser : userID,
            settingsPermission : permissions
        });

        this.updatePermissions(permissions, viewPermissions);
        this.updatePermissions(permissions, managePermissions);
    }

    /**
     * Set the permissions of a user.
     */
    setPermissions() {
        let permissions = {};
        const courseID = getEnum(this.state, "courseID");
        const user = getEnum(this.state, "settingsUser");
        if (user === "") {
            console.log("Please select a user");
            return;
        }

        const allPermissions = [...viewPermissions, ...managePermissions];
        allPermissions.forEach((permission: {display : string, name : string}) => {
            const name = permission.name;
            permissions = {
                ...permissions,
                [name]: getEnum(this.state, name)
            }
        });
        console.log(permissions);

        // Send local / global permission request
        if (courseID === undefined) {
            console.log("Global permissions");
            setPermissionGlobal(user, {permissions})
                .then((courseUser: CourseUser) => {
                    console.log(courseUser);
                    // TODO handle response
                });
        } else {
            console.log("Local permissions");
            setPermissionCourse(courseID, user, {permissions}).then((courseUser : CourseUser) => {
                // TODO handle response
                console.log(courseUser);
            });
        }
    }

    /**
     * Render permissions on screen
     * @param permissions, (display) names of the permissions
     * @param header, header for the set of permissions
     */
    renderPermissions(permissions: Array<{ display : string, name : string}>, header: string) {
        return (
            <div>
                <h4>{header}</h4>
                {
                    permissions.map((permission) =>
                        <div>
                            <label>
                                {permission.display}
                                <input
                                    name={permission.name}
                                    type="checkbox"
                                    checked={getEnum(this.state, permission.name) as boolean}
                                    onChange={this.handleCheckboxChange}/>
                            </label>
                            <br/>
                        </div>
                    )
                }
            </div>
        )
    }

    render() {
        return (
            <div>
                <h4>User: {getEnum(this.state, "settingsUserName")}</h4>
                {/*<UserSearch*/}
                {/*    courseID={getEnum(this.state, "courseID")}*/}
                {/*    onSelected={this.handleUserChange}*/}
                {/*/>*/}
                {this.props.viewPermissions && this.renderPermissions(viewPermissions, 'View Permissions')}
                {this.props.managePermissions && this.renderPermissions(managePermissions, 'Manage permissions')}

                <button onClick={() => this.setPermissions()}> Set permissions for user</button>
            </div>
            )
    }
}
