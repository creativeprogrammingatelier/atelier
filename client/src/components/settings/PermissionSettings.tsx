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
import {getUsersByCourse} from "../../../helpers/APIHelper";

interface CourseSettingsProps {
    courseID: string
}

const DEFAULT_USER = "-USER-";

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

    handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const value = target.checked;
        const name = target.name;

        this.setState((state) => ({
            ...state,
            [name]: value
        }));
    }

    updatePermissions(userPermissions: number, permissions: string[][]) {
        permissions.forEach((permission: string[]) => {
            const permissionType: PermissionEnum = getEnum(PermissionEnum, permission[1]);
            const permissionName: string = PermissionEnum[permissionType];
            const permissionContained: boolean = containsPermission(permissionType, userPermissions);
            this.setState({[permissionName]: permissionContained});
        });
    }

    handleUserChange(event: ChangeEvent<HTMLSelectElement>) {
        const values = event.target.value.split("-");
        const userID: string = values[0];
        const permissions: number = values[1] as unknown as number;

        this.setState({
            settingsUser: userID,
            settingsPermission: permissions
        });

        this.updatePermissions(permissions, viewPermissions);
        this.updatePermissions(permissions, managePermissions);
    }

    renderPermissions(permissions: string[][]) {
        return (
            <div>
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
                            {this.renderPermissions(viewPermissions)}
                            {this.renderPermissions(managePermissions)}
                        </div>
                    )
                }}
            />
        )
    }

    // render() {
    //     return (
    //         <Loading<CourseUser[]>
    //             loader={(courseID) => getUsersByCourse(this.state.courseID)}
    //             params={[getEnum(this.state, "courseID")]}
    //             component={(users : CourseRegistrationOutput[]) => {
    //                 return (
    //                     <div>
    //                         <select
    //                             onChange={this.handleUserChange}
    //                         >
    //                             {users.map((user : CourseRegistrationOutput) => <option id={user.userID} value={user.userID + "-" + user.permission}>{user.userID}</option>)}
    //                         </select>
    //
    //
    //                         <br />
    //                         <label>
    //                             View Restricted Comments:
    //                             <input
    //                                 name="viewRestrictedComments"
    //                                 type="checkbox"
    //                                 checked={this.state.viewRestrictedComments}
    //                                 onChange={this.handleCheckboxChange} />
    //                         </label>
    //
    //                         <br />
    //                         <label>
    //                             Manage user registration:
    //                             <input
    //                                 name="manageUserRegistration"
    //                                 type="checkbox"
    //                                 checked={this.state.manageUserRegistration}
    //                                 onChange={this.handleCheckboxChange} />
    //                         </label>
    //
    //                         <br />
    //                         <label>
    //                             Manage user permissions:
    //                             <input
    //                                 name="manageUserPermissionsManager"
    //                                 type="checkbox"
    //                                 checked={this.state.manageUserPermissionsManager}
    //                                 onChange={this.handleCheckboxChange} />
    //                         </label>
    //
    //                         <br />
    //                         <button onClick={() => this.setPermissions()}> Set permissions for user </button>
    //
    //                     </div>
    //                 )
    //             }}
    //         />
    //     )
    // }


    // render() {
    //     return this.renderPermissions(viewPermissions);
    //     // console.log(getEnum(PermissionEnum, "viewRestrictedComments"));
    //     // return this.renderPermissions(["manageUserPermissionsView", "manageUserPermissionsManager"])
    // }
}

// export class PermissionSettings extends React.Component<CourseSettingsProps, CourseSettingsState> {
//     constructor(props : CourseSettingsProps) {
//         super(props);
//         this.state = {
//             courseID : props.courseID,
//             settingsUser : "",
//             settingsPermission : 0,
//             viewRestrictedComments : false,
//             manageUserRegistration : false,
//             ["manageUserPermissionsManager"] : true
//         };
//         this.handleUserChange = this.handleUserChange.bind(this);
//         this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
//     }
//
//     handleUserChange(event : ChangeEvent<HTMLSelectElement>) {
//         const values = event.target.value.split("-");
//         const userID : string = values[0];
//         const permissions : number = values[1] as unknown as number;
//
//         console.log(userID);
//         this.setState({
//             settingsUser : userID,
//             settingsPermission : permissions,
//             viewRestrictedComments : containsPermission(PermissionEnum.viewRestrictedComments, permissions),
//             manageUserRegistration : containsPermission(PermissionEnum.manageUserRegistration, permissions),
//             manageUserPermissionsManager : containsPermission(PermissionEnum.manageUserPermissionsManager, permissions)
//         } as unknown as CourseSettingsState);
//     }
//
//     handleCheckboxChange(event : ChangeEvent<HTMLInputElement>) {
//         const target = event.target;
//         const value = target.checked;
//         const name = target.name;
//
//         this.setState({
//             [name] : value
//         } as unknown as CourseSettingsState);
//     }
//
//     setPermissions() {
//         const userID : string = this.state.settingsUser;
//         const viewRestrictedComments : boolean = this.state.viewRestrictedComments;
//         const manageUserRegistration : boolean = this.state.manageUserRegistration;
//         const manageUserPermissionsManager : boolean = this.state.manageUserPermissionsManager;
//
//         const permissions = {
//             permissions : {
//                 viewRestrictedComments,
//                 manageUserRegistration,
//                 manageUserPermissionsManager
//             }
//         };
//
//         console.log("setting permissions");
//         setPermission(this.state.courseID, userID, permissions, false)
//             .then((courseRegistration : CourseRegistrationOutput) => {
//                 // TODO feedback?
//                 console.log(courseRegistration);
//             });
//     }
//
//     render() {
//         return (
//             <Loading<CourseRegistrationOutput[]>
//                 loader={() => getUsersByCourse(this.state.courseID)}
//                 params={[this.state.courseID]}
//                 component={(users : CourseRegistrationOutput[]) => {
//                     return (
//                         <div>
//                             <select
//                                 onChange={this.handleUserChange}
//                             >
//                                 {users.map((user : CourseRegistrationOutput) => <option id={user.userID} value={user.userID + "-" + user.permission}>{user.userID}</option>)}
//                             </select>
//
//
//                             <br />
//                             <label>
//                                 View Restricted Comments:
//                                 <input
//                                     name="viewRestrictedComments"
//                                     type="checkbox"
//                                     checked={this.state.viewRestrictedComments}
//                                     onChange={this.handleCheckboxChange} />
//                             </label>
//
//                             <br />
//                             <label>
//                                 Manage user registration:
//                                 <input
//                                     name="manageUserRegistration"
//                                     type="checkbox"
//                                     checked={this.state.manageUserRegistration}
//                                     onChange={this.handleCheckboxChange} />
//                             </label>
//
//                             <br />
//                             <label>
//                                 Manage user permissions:
//                                 <input
//                                     name="manageUserPermissionsManager"
//                                     type="checkbox"
//                                     checked={this.state.manageUserPermissionsManager}
//                                     onChange={this.handleCheckboxChange} />
//                             </label>
//
//                             <br />
//                             <button onClick={() => this.setPermissions()}> Set permissions for user </button>
//
//                         </div>
//                     )
//                 }}
//             />
//         )
//     }
// }