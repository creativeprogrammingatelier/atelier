import React, {useState} from 'react';
import {Loading} from "../general/loading/Loading";
import {coursePermission, deleteInvite, getInvite, getInvites} from "../../../helpers/APIHelper";
import {CourseInvite, Invite} from "../../../../models/api/Invite";
import {Permission} from "../../../../models/api/Permission";
import {DataItem} from "../data/DataItem";
import {containsPermission, PermissionEnum} from "../../../../models/enums/permissionEnum";
import {inviteRole} from "../../../../models/enums/inviteRoleEnum";
import {DataList} from "../data/DataList";

export function CourseInvites({ courseID } : {courseID : string}) {
    return (
        <Loading<[Permission, Invite]>
            loader={(courseID : string) => Promise.all([coursePermission(courseID), getInvites(courseID)])}
            params={[courseID]}
            component={(response : [Permission, Invite]) =>
                <Invites
                    permission = {response[0]}
                    invite = {response[1]}
                    courseID = {courseID}
                 />}
        />
    )
}

export function RoleInvite({courseID, link, role} : {courseID : string, link : string | undefined, role : inviteRole}) {
    const [inviteLink, setInviteLink] = useState(link === undefined ? link : window.location.origin + link);

    const createLink = (role : inviteRole) => {
        getInvite(courseID, role)
            .then((courseInvite : CourseInvite) => {
                setInviteLink(window.location.origin + `/api/invite/${courseInvite.inviteID}`);
            });
    };

    const deleteLink = () => {
        deleteInvite(courseID, role)
            .then(() => {
               setInviteLink(undefined);
            });
    };

    return (
        <div>
            {inviteLink === undefined
                ?   <button onClick={() => createLink(role)}>Create Link </button>
                :   <div>
                        <p>{inviteLink}</p>
                        <button onClick={() => deleteLink()}>Remove link</button>
                    </div>
            }
        </div>
    )
}

export function Invites({permission, invite, courseID} : {permission : Permission, invite : Invite, courseID : string}) {
    if (!containsPermission(PermissionEnum.manageUserRegistration, permission.permissions)) {
        return <div/>
    }

    const studentInvite = <RoleInvite courseID = {courseID} link = {invite.student} role = {inviteRole.student} />;
    const taInvite = <RoleInvite courseID = {courseID} link = {invite.TA} role = {inviteRole.TA} />;
    const teacherInvite = <RoleInvite courseID = {courseID} link = {invite.teacher} role = {inviteRole.teacher} />;

    return (
        <DataList
            header="Invite Links"
            children={[
                <DataItem text='Student Invite' children={studentInvite} />,
                <DataItem text='TA Invite' children={taInvite} />,
                <DataItem text='Teacher Invite' children={teacherInvite} />
            ]}
        />
    );
}