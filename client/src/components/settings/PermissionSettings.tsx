import React, {ChangeEvent} from 'react';
import {getEnum} from "../../../../models/enums/enumHelper";
import {
    containsPermission,
    managePermissions,
    PermissionEnum,
    viewPermissions
} from "../../../../models/enums/permissionEnum";
import {CourseUser} from "../../../../models/database/CourseUser";
import {Loading} from "../general/loading/Loading";
import {getUsersByCourse, setPermission} from "../../../helpers/APIHelper";
import {CourseRegistrationOutput} from "../../../../models/database/CourseRegistration";

interface CourseSettingsProps {
    courseID: string,
    viewPermissions : boolean,
    managePermissions : boolean
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
    updatePermissions(userPermissions: number, permissions: string[][]) {
        permissions.forEach((permission: string[]) => {
            const permissionType: PermissionEnum = getEnum(PermissionEnum, permission[1]);
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
        allPermissions.forEach((permission : string[]) => {
            const name = permission[1];
            permissions = {
                ...permissions,
                [name] : getEnum(this.state, name)
            }
        });

        setPermission(
            courseID,
            user,
            {permissions}
        ).then((permission : CourseRegistrationOutput) => {
            // TODO handle response
            console.log(permission);
        });
    }

    /**
     * Render permissions on screen
     * @param permissions, (display) names of the permissions
     * @param header, header for the set of permissions
     */
    renderPermissions(permissions: string[][], header: string) {
        return (
            <div>
                <h4>{header}</h4>
                {
                    permissions.map((permission) =>
                        <div>
                            <label>
                                {permission[0]}
                                <input
                                    name={permission[1]}
                                    type="checkbox"
                                    checked={getEnum(this.state, permission[1]) as boolean}
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
            <Loading<CourseUser[]>
                loader={() => getUsersByCourse(getEnum(this.state, "courseID"))}
                component={(users: CourseUser[]) => {
                    return (
                        <div>
                            <select onChange={this.handleUserChange}>
                                <option selected={true}>{DEFAULT_USER}</option>
                                {users.map((user: CourseUser) =>
                                    <option
                                        id={user.userID}
                                        value={user.userID + "-" + user.permission}>
                                        {user.userName}
                                    </option>
                                )}
                            </select>

                            { this.props.viewPermissions && this.renderPermissions(viewPermissions, 'View Permissions') }
                            { this.props.managePermissions &&  this.renderPermissions(managePermissions, 'Manage permissions') }

                            <button onClick={() => this.setPermissions()}> Set permissions for user </button>
                        </div>
                    )
                }}
            />
        )
    }
}
