import React from "react";
import {FiActivity, FiHome, FiLogOut, FiSettings, FiUser, FiX} from "react-icons/fi";
import {Logo} from "./Logo";
import {SidebarEntry} from "./SidebarEntry";
import {Loading} from "../general/loading/Loading";
import {User} from "../../../../models/database/User";
import {getCurrentUser} from "../../../helpers/APIHelper";
import {Heading} from "../general/Heading";

interface SidebarProperties {
	user?: {
		id: string,
		name: string
	},
	position: string,
	close: React.MouseEventHandler
}
export function Sidebar({position, close}: SidebarProperties) {
	return (
		<div className="sidebar col-10 col-sm-8 col-md-5 col-lg-3 col-xl-2 p-0" style={{left: position}}>
			<Heading transparent large leftButton={{icon: FiX, click: close}}/>
			<div className="sidebarContent p-0">
				<Logo/>
				<hr/>
				<SidebarEntry location="/" icon={FiHome}>Home</SidebarEntry>
				<SidebarEntry location="/activity" icon={FiActivity}>Activity</SidebarEntry>
				<SidebarEntry location="/settings" icon={FiSettings}>Settings</SidebarEntry>
				<Loading<User>
					loader={getCurrentUser}
					component={user => {
						console.log("Loaded user");
						console.log(user);
						return <SidebarEntry location={"/user/" + user.userID} icon={FiUser}>{user.name!}</SidebarEntry>
					}}
				/>
				<SidebarEntry location="/logout" icon={FiLogOut}>Logout</SidebarEntry>
			</div>
		</div>
	)
}