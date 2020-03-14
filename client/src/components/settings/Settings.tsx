import * as React from 'react';
import {Button, Jumbotron} from "react-bootstrap";
import {Frame} from "../frame/Frame";
import {UserSettings} from "./UserSettings";

export function Settings() {
    return (
        <Frame title="Settings" sidebar search="/search">
            <Jumbotron>
                <h1>Settings</h1>
                <Button>Have a button!</Button>
            </Jumbotron>

            <UserSettings />

            <h1>Course settings</h1>
            <p>List of courses</p>
            <p>Change course name</p>
            <p>Change user role / permissions in course</p>
        </Frame>
    )
}
