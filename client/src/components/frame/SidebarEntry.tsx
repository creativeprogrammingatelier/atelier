import React from 'react';
import {Link} from 'react-router-dom';
import {IconType} from "react-icons";

interface LinkProperties {
	children: string,
	location: string
	icon: IconType,
}
export function SidebarEntry({children, location, icon}: LinkProperties) {
	const ICON: IconType = icon;
	return (
		<div className="link">
			<Link to={location}><h4><ICON color="#FFFFFF"/>{children}</h4></Link>
		</div>
	)
}