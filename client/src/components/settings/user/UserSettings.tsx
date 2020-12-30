import React from "react";
import {Jumbotron} from "react-bootstrap";

import {DataList} from "../../data/DataList";
import {Frame} from "../../frame/Frame";
import UserCanvasLink from "./UserCanvasLink";
import {UserSettingsGeneral} from "./UserSettingsGeneral";

export function UserSettings() {
	return <Frame title="Settings" sidebar search>
		<Jumbotron>
			<h1>My Account</h1>
			<p>Personalize your Atelier experience here</p>
		</Jumbotron>
		<DataList header="User Details">
			<UserSettingsGeneral/>
			<br/>
			<UserCanvasLink/>
		</DataList>

	</Frame>;
}
