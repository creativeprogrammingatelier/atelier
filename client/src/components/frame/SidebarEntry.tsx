import React from 'react';
import {Link} from 'react-router-dom';

interface LinkProperties {
	children: string,
	location: string
}
export function SidebarEntry({children, location}: LinkProperties) {
	return (
		<div className="link">
		<Link to={location}><h4>{children}</h4></Link>
		</div>
	)
}