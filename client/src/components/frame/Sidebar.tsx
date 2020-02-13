import React from 'react';
import {FiX} from 'react-icons/fi';
import {Header} from './Header';
import {Logo} from './Logo';
import {Link} from './Link';

interface SidebarProperties {
	user: string,
	position: string,
	close: React.MouseEventHandler
}
export function Sidebar({user, position, close}: SidebarProperties) {
	return (
		<div className="sidebar col-8 col-sm-6 col-md-4 col-lg-3 col-xl-2" style={{left: position}}>
			<Header transparent={true} leftButton={{name:'Close', icon:<FiX size={40}/>, click:close}}/>
			<div className="sidebarContent">
				<Logo/>
				<Link location="/">My Courses</Link>
				<Link location="/user">My Submissions</Link>
				<Link location="/search">Search</Link>
				<Link location="/logout">Logout</Link>
			</div>
		</div>
	);
}