import React from "react";
import {Frame} from "./frame/Frame";
import {Jumbotron} from "react-bootstrap";
import { PersonalFeed } from "./feed/Feed";

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