import React, {useEffect} from "react";
import {Jumbotron} from "react-bootstrap";
import {useHistory} from "react-router-dom";

import {Frame} from "../frame/Frame";
import {getInvite} from "../../helpers/api/APIHelper";

import {CourseUser} from "../../../../models/api/CourseUser";

interface InviteProperties {
    match: {
        /** Invite parameters */
        params: {
            /** Invite ID */
            inviteId: string
        }
    }
}

/**
 * Invite component that handles resolving invites and adding users.
 */
export function Invite({match: {params: {inviteId}}}: InviteProperties) {
    const history = useHistory();

    useEffect(() => {
        getInvite(inviteId)
            .then((courseUser : CourseUser) => {
                history.push(`/course/${courseUser.courseID}`);
            });
    }, []);

    return <Frame title="Home" sidebar search>
        <Jumbotron>
            <h1>Invite</h1>
        </Jumbotron>
    </Frame>;
}
