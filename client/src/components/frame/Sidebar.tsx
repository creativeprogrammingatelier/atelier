import React from 'react';
import {FiX} from 'react-icons/fi';
import {Header} from './Header';
import {Logo} from './Logo';
import {SidebarEntry} from './SidebarEntry';

interface SidebarProperties {
	user: {
		id: string,
		name: string
	},
	position: string,
	close: React.MouseEventHandler
}
export function Sidebar({user, position, close}: SidebarProperties) {
	return (
		<div className="sidebar col-10 col-sm-8 col-md-5 col-lg-3 col-xl-2" style={{left: position}}>
			<Header transparent fixed leftButton={{icon:<FiX size={40} color="#FFFFFF"/>, click:close}}/>
			<div className="sidebarContent">
				<Logo/>
				<SidebarEntry location={"/user/"+user.id}>{user.name}</SidebarEntry>
				<SidebarEntry location="/">My Courses</SidebarEntry>
				<SidebarEntry location="/search">Search</SidebarEntry>
				<SidebarEntry location="/logout">Logout</SidebarEntry>
			</div>
		</div>
	);
}