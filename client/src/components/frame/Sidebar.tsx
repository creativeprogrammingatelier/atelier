import React, {useEffect, useState} from "react";
import {FiX} from 'react-icons/fi';
import {Header} from './Header';
import {Logo} from './Logo';
import {SidebarEntry} from './SidebarEntry';
import {Course} from "../../../../models/database/Course";
import {PanelButton} from "../general/PanelButton";
import {Loading} from "../general/Loading";
import AuthHelper from "../../../helpers/AuthHelper";
import {User} from "../../../../models/api/User";
import {Fetch} from "../../../helpers/FetchHelper";

interface SidebarProperties {
	user: {
		id: string,
		name: string
	},
	position: string,
	close: React.MouseEventHandler
}
export function Sidebar({position, close}: SidebarProperties) {
	return (
		<div className="sidebar col-10 col-sm-8 col-md-5 col-lg-3 col-xl-2 p-0" style={{left: position}}>
			<Header transparent leftButton={{icon:<FiX size={40} color="#FFFFFF"/>, click:close}}/>
			<div className="sidebarContent p-0">
				<Logo/>
				<SidebarEntry location="/">My Courses</SidebarEntry>
				<SidebarEntry location="/search">Search</SidebarEntry>
				<SidebarEntry location="/logout">Logout</SidebarEntry>
				<Loading<User>
					loader={() => Fetch.fetchJson('/api/user/')}
					component={user => <SidebarEntry location={"/user/"+user.id}>{user.name}</SidebarEntry>
					}
				/>
			</div>
		</div>
	);
}