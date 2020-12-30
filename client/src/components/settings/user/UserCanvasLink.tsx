import React, {useState, Fragment, useEffect} from "react";
import {Button, Form} from "react-bootstrap";

import {CourseUser} from "../../../../../models/api/CourseUser";
import {User} from "../../../../../models/api/User";
import {PermissionEnum, containsPermission, permissionsSectionView, permissionsSectionManage} from "../../../../../models/enums/PermissionEnum";

import {setPermissionCourse, setPermissionGlobal} from "../../../helpers/api/APIHelper";
import {getEnum} from "../../../../../helpers/EnumHelper";

import {Area} from "../../general/Area";
import {Permissions} from "../../general/Permissions";
import {CheckboxInput} from "../../input/CheckboxInput";
import {LabeledInput} from "../../input/LabeledInput";
import {UserInfo} from "./UserInfo";
import {UserSearch} from "./UserSearch";
import { CanvasHelper } from "../../../helpers/CanvasHelper";

interface PermissionDisplay {
	[key: string]: string
}
interface PermissionState {
	[key: string]: boolean
}
interface UserSettingsPermissionsProperties {
	courseID?: string
}
interface UserSettingsPermissionsSectionProperties {
	header: string,
	display: PermissionDisplay,
	state: PermissionState,
	setState: (permission: string, state: boolean) => void
}
/**
 * Component to link and unlink atelier to user's canvas account.
 */
export default class UserCanvasLink extends React.Component<any, any> {
	
	constructor(props: any){
		super(props);
		this.state = { 
			linked: false
		}
		this.checkLinkedCanvas();
	}

	private linkCanvas = () => { 
		//Check has Refresh token
	}

	private unlinkCanvas = () => { 
		//Check has Refresh token
	}

	/**
	 * Check if account has already been linked
	 */
	private checkLinkedCanvas() { 
		
		CanvasHelper.getLinked().then(res => {console.log(res);this.setState({linked: res.body})})
	}
	render(){
		return (
			<Form>
				<LabeledInput label="Canvas Link">
					<Button onClick={this.linkCanvas} disabled={this.state.linked} >Link</Button>
					<Button onClick={this.unlinkCanvas} disabled={this.state.linked}>Unlink</Button>
				</LabeledInput>
			</Form>
		);
	}
}

