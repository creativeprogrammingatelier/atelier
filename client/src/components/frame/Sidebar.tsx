import React from "react";
import {FiActivity, FiHome, FiLogOut, FiSettings, FiUser, FiX} from "react-icons/fi";
import {Logo} from "./Logo";
import {SidebarEntry} from "./SidebarEntry";
import {Loading} from "../general/loading/Loading";
import {User} from "../../../../models/api/User";
import {getCurrentUser} from "../../../helpers/APIHelper";
import {Heading} from "../general/Heading";

interface SidebarProperties {
	user?: { // TODO: Remove this and make sure nothing breaks
		id: string,
		name: string
	},
	position: string,
	close: React.MouseEventHandler
}
export function Sidebar({position, close}: SidebarProperties) {
	return (
		<div className="sidebarContainer row no-gutters" style={{left: position}}>
			<div className="sidebar col-10 col-sm-8 col-md-5 col-lg-3 col-xl-2 p-0">
				<Heading transparent large leftButton={{icon: FiX, click: close}}/>
				<div className="sidebarContent p-0">
					<Logo/>
					<hr/>
					<SidebarEntry location="/" icon={FiHome} close={close}>Home</SidebarEntry>
					<SidebarEntry location="/activity" icon={FiActivity} close={close}>Activity</SidebarEntry>
					<SidebarEntry location="/settings" icon={FiSettings} close={close}>Settings</SidebarEntry>
					<Loading<User>
						loader={getCurrentUser}
						component={user => <SidebarEntry location={"/user/" + user.ID} icon={FiUser} close={close}>{user.name}</SidebarEntry>}
					/>
					<SidebarEntry location="/logout" icon={FiLogOut} close={close}>Logout</SidebarEntry>
				</div>
			</div>
			<div className="sidebarOutside col-2 col-sm-4 col-md-7 col-lg-9 col-xl-10" onClick={close}/>
		</div>
	)
}