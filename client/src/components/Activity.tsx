import React from "react";
import {Frame} from "./frame/Frame";
import {Jumbotron} from "react-bootstrap";
import {PersonalFeed} from "./feed/Feed";

/**
 * Activity tab on the sidebar. It retrieves all
 * recent activity pertaining to or executed by the user.
 */
export function Activity() {
    return (
        <Frame title="Activity" sidebar search>
            <Jumbotron>
                <h1>Activity</h1>
            </Jumbotron>
            <PersonalFeed />
        </Frame>
    );
}
