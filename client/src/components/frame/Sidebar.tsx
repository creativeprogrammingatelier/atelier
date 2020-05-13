import React, {Fragment} from "react";
import {FiActivity, FiHome, FiLogOut, FiSettings, FiSliders, FiUser, FiX} from "react-icons/fi";

import {User} from "../../../../models/api/User";
import {PermissionEnum} from "../../../../models/enums/PermissionEnum";

import {Refresh, useCurrentUser} from "../../helpers/api/APIHooks";

import {Cached} from "../general/loading/Cached";
import {Heading} from "../general/Heading";
import {Permissions} from "../general/Permissions";
import {Responsive} from "../general/Responsive";
import {Logo} from "./Logo";
import {SidebarEntry} from "./SidebarEntry";

interface SidebarProperties {
	position: string,
	close: React.MouseEventHandler
}
export function Sidebar({position, close}: SidebarProperties) {
	const user = useCurrentUser();
	
	return <Fragment>
		<Responsive breakpoints={["extraSmall", "small", "medium"]}>
			<div className="sidebarContainer row no-gutters" style={{left: position}}>
				<div className="sidebar col-10 col-sm-8 col-md-5 col-lg-3 col-xl-2 p-0">
					<Heading transparent large leftButton={{icon: FiX, click: close}}/>
					<Content user={user}/>
				</div>
				<div className="sidebarOutside col-2 col-sm-4 col-md-7 col-lg-9 col-xl-10" onClick={close}/>
			</div>
		</Responsive>
		<Responsive breakpoints={["large", "extraLarge"]}>
			<div className="sidebar col-10 col-sm-8 col-md-5 col-lg-3 col-xl-2 p-0 position-fixed shadow-none">
				<Heading transparent large/>
				<Content user={user}/>
			</div>
		</Responsive>
	</Fragment>;
}

interface ContentProperties {
	user: Refresh<User>
}
function Content({user}: ContentProperties) {
	return <div className="sidebarContent p-0">
		<Logo/>
		<hr/>
		<SidebarEntry location="/" icon={FiHome} close={close}>Home</SidebarEntry>
		<SidebarEntry location="/activity" icon={FiActivity} close={close}>Mentions</SidebarEntry>
		<SidebarEntry location="/account" icon={FiSliders} close={close}>Account</SidebarEntry>
		<Permissions
			any={[
				PermissionEnum.addCourses,
				PermissionEnum.manageUserPermissionsView,
				PermissionEnum.manageUserPermissionsManager,
				PermissionEnum.manageUserRole,
				PermissionEnum.managePlugins
			]}
		>
			<SidebarEntry location="/admin/settings" icon={FiSettings} close={close}>System</SidebarEntry>
		</Permissions>
		<Cached cache={user}>
			{
				user => <SidebarEntry location={"/user/" + user.ID} icon={FiUser} close={close}>{user.name}</SidebarEntry>
			}
		</Cached>
		<SidebarEntry location="/logout" icon={FiLogOut} close={close}>Logout</SidebarEntry>
	</div>;
}