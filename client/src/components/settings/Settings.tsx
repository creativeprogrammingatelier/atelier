import * as React from 'react';
import {Button, Jumbotron} from "react-bootstrap";
import {Frame} from "../frame/Frame";
import {UserSettings} from "./UserSettings";
import {PermissionSettings} from "./PermissionSettings";
import {DataList} from "../general/data/DataList";

export function Settings() {
    return (
        <Frame title="Settings" sidebar search="/search">
            <Jumbotron>
                <h1>Settings</h1>
                <Button>Have a button!</Button>
            </Jumbotron>

            <DataList header="User Details" children = {<UserSettings />} />
        </Frame>
    )
}
