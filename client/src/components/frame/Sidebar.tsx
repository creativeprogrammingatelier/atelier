import React, { Fragment } from "react";
import {Logo} from "./Logo";
import {SidebarEntry} from "./SidebarEntry";
import {Heading} from "../general/Heading";
import {Responsive} from "../general/Responsive";
import { useCurrentUser } from "../../helpers/api/APIHooks";
import {FiActivity, FiHome, FiLogOut, FiSettings, FiSliders, FiUser, FiX} from "react-icons/fi";
import {PermissionEnum} from "../../../../models/enums/PermissionEnum";
import { Cached } from "../general/loading/Cached";
import { Permissions } from "../general/Permissions";

interface SidebarProperties {
	position: string,
	close: React.MouseEventHandler
}
export function Sidebar({position, close}: SidebarProperties) {
    const user = useCurrentUser();

	const content = () =>
		<div className="sidebarContent p-0">
			<Logo/>
			<hr/>
			<SidebarEntry location="/" icon={FiHome} close={close}>Home</SidebarEntry>
			<SidebarEntry location="/activity" icon={FiActivity} close={close}>Activity</SidebarEntry>
			<SidebarEntry location="/account" icon={FiSliders} close={close}>Account</SidebarEntry>
			<Permissions any={[
						PermissionEnum.addCourses,
						PermissionEnum.manageUserPermissionsView,
						PermissionEnum.manageUserPermissionsManager,
						PermissionEnum.manageUserRole,
						PermissionEnum.managePlugins
					]}>
					<SidebarEntry location="/admin/settings" icon={FiSettings} close={close}>System</SidebarEntry>
			</Permissions>
			<Cached cache={user}>{
                user => <SidebarEntry location={"/user/" + user.ID} icon={FiUser} close={close}>{user.name}</SidebarEntry>
            }</Cached>
			<SidebarEntry location="/logout" icon={FiLogOut} close={close}>Logout</SidebarEntry>
		</div>;

	return <Fragment>
		<Responsive breakpoints={["extraSmall", "small", "medium"]}>
			<div className="sidebarContainer row no-gutters" style={{left: position}}>
				<div className="sidebar col-10 col-sm-8 col-md-5 col-lg-3 col-xl-2 p-0">
					<Heading transparent large leftButton={{icon: FiX, click: close}}/>
					{content()}
				</div>
				<div className="sidebarOutside col-2 col-sm-4 col-md-7 col-lg-9 col-xl-10" onClick={close}/>
			</div>
		</Responsive>
		<Responsive breakpoints={["large", "extraLarge"]}>
			<div className="sidebar col-10 col-sm-8 col-md-5 col-lg-3 col-xl-2 p-0 position-fixed shadow-none">
				<Heading transparent large/>
				{content()}
			</div>
		</Responsive>
	</Fragment>;
}