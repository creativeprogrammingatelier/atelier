import React, {useEffect, useState} from "react";
import {FiActivity, FiHome, FiLogOut, FiSearch, FiSettings, FiUser, FiX} from "react-icons/fi";
import {Header} from './Header';
import {Logo} from './Logo';
import {SidebarEntry} from './SidebarEntry';
import {Course} from "../../../../models/database/Course";
import {PanelButton} from "../general/PanelButton";
import {Loading} from "../general/Loading";
import {User} from "../../../../models/api/User";
import { getCurrentUser } from './../../../helpers/APIHelper';

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
			<Header transparent leftButton={{icon: <FiX size={40} color="#FFFFFF"/>, click: close}}/>
			<div className="sidebarContent p-0">
				<Logo/>
				<hr/>
				<SidebarEntry location="/" icon={FiHome}>Home</SidebarEntry>
				<SidebarEntry location="/search" icon={FiActivity}>Activity</SidebarEntry>
				<SidebarEntry location="/settings" icon={FiSettings}>Settings</SidebarEntry>
				<Loading<User>
					loader={getCurrentUser}
					component={user => <SidebarEntry location={"/user/" + user.id} icon={FiUser}>{user.name}</SidebarEntry>
					}
				/>
				<SidebarEntry location="/logout" icon={FiLogOut}>Logout</SidebarEntry>
			</div>
		</div>
	);
}