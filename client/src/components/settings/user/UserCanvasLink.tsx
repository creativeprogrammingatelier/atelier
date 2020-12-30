import React, {useState, Fragment, useEffect} from "react";
import {Button, Form, FormLabel} from "react-bootstrap";

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
		CanvasHelper.createLink().then(res => this.setState({linked: res.linked	}))
	}

	/**
	 * Remove Link to canvas
	 */
	private unlinkCanvas = () => { 
		CanvasHelper.removeLink().then(res => this.setState({linked: false}))
	}

	/**
	 * Check if account has already been linked
	 */
	private checkLinkedCanvas() { 
		CanvasHelper.getLinked().then(res => this.setState({linked: res.linked	}))
	}
	render(){
		return (
			<Form>
				<FormLabel><p className="label">Canvas Link</p></FormLabel> <br/>
					Linking Allows Atelier to Access your canvas data.<br/>
					<Button onClick={this.linkCanvas} disabled={this.state.linked} >Link</Button>
					<Button onClick={this.unlinkCanvas} disabled={!this.state.linked}>Unlink</Button>
			</Form>
		);
	}
}

