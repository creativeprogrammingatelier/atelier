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
		<div className="sidebar col-4" style={{left: position}}>
			<Header leftButton={{name:'Close', icon:<FiX size={40}/>, click:close}}/>
			<Logo/>
			<Link location="/">My Courses</Link>
			<Link location="/user">My Submissions</Link>
			<Link location="/search">Search</Link>
			<Link location="/logout">Logout</Link>
		</div>
	);
}