import React from "react";
import {FiActivity, FiHome, FiLogOut, FiSettings, FiUser, FiX} from "react-icons/fi";
import {Header} from './Header';
import {Logo} from './Logo';
import {SidebarEntry} from './SidebarEntry';
import {Loading} from "../general/Loading";
import {User} from "../../../../models/database/User";
import {Fetch} from "../../../helpers/FetchHelper";

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
			<Header transparent leftButton={{icon: FiX, click: close}}/>
			<div className="sidebarContent p-0">
				<Logo/>
				<hr/>
				<SidebarEntry location="/" icon={FiHome}>Home</SidebarEntry>
				<SidebarEntry location="/search" icon={FiActivity}>Activity</SidebarEntry>
				<SidebarEntry location="/settings" icon={FiSettings}>Settings</SidebarEntry>
				<Loading<User>
					loader={() => Fetch.fetchJson('/api/user/')}
					component={user => <SidebarEntry location={"/user/" + user.userID} icon={FiUser}>{user.name!}</SidebarEntry>}
				/>
				<SidebarEntry location="/logout" icon={FiLogOut}>Logout</SidebarEntry>
			</div>
		</div>
	);
}