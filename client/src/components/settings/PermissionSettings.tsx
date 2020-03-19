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
import {CourseRegistrationOutput} from "../../../../models/database/CourseRegistration";
import {User} from "../../../../models/api/User";
import {CourseUser} from "../../../../models/database/CourseUser";

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
     * Keep track of current user.
     * @param event, select event
     */
    handleUserChange(event: ChangeEvent<HTMLSelectElement>) {
        const value = event.target.value;

        let permissions = 0;
        let userID = "";

        if (value !== DEFAULT_USER) {
            const values = value.split("-");
            userID = values[0];
            permissions = values[1] as unknown as number;
        }

        this.setState({
            settingsUser: userID,
            settingsPermission: permissions
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

        // Send local / global permission request
        if (courseID === undefined) {
            console.log("Global permissions");
            setPermissionGlobal(user, {permissions})
                .then((permission: CourseRegistrationOutput) => {
                    console.log(permission);
                    // TODO handle response
                });
        } else {
            console.log("Local permissions");
            setPermissionCourse(courseID, user, {permissions}).then((permission: CourseRegistrationOutput) => {
                // TODO handle response
                console.log(permission);
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
            <Loading<Array<CourseUser | User>>
                loader={() => getEnum(this.state, "courseID") === undefined ?
                    getAllUsers()
                    : getUsersByCourse(getEnum(this.state, "courseID"))}
                component={(users: Array<User | CourseUser>) => {
                    return (
                        <div>
                            <h4>User</h4>
                            <select onChange={this.handleUserChange}>
                                <option selected={true}>{DEFAULT_USER}</option>
                                {
                                    users.map((user: User | CourseUser) => {
                                        let userID = "";
                                        let permission = 0;
                                        let userName = "";

                                        if ("userID" in user) {
                                            const user2 : CourseUser = user as CourseUser;
                                            userID = user2.userID!;
                                            permission = user2.permission!;
                                            userName = user2.userName!;
                                        } else {
                                            const user2 : User = user as User;
                                            userID = user2.ID;
                                            permission = user2.permission.permissions;
                                            userName = user2.name;
                                        }

                                        return (
                                            <option id={userID} value={userID + "-" + permission}>
                                                {userName} - {user.email}
                                            </option>
                                        )
                                    })
                                }
                            </select>

                            {this.props.viewPermissions && this.renderPermissions(viewPermissions, 'View Permissions')}
                            {this.props.managePermissions && this.renderPermissions(managePermissions, 'Manage permissions')}

                            <button onClick={() => this.setPermissions()}> Set permissions for user</button>
                        </div>
                    )
                }}
            />
        )
    }
}
