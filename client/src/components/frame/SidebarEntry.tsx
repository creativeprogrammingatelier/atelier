import React from 'react';
import {Link} from 'react-router-dom';
import {IconType} from "react-icons";

interface LinkProperties {
	children: string,
	location: string
	icon: IconType,
	close: React.MouseEventHandler
}
export function SidebarEntry({children, location, icon, close}: LinkProperties) {
	const ICON: IconType = icon;
	return (
		<div className="link">
			<Link to={location} onClick={close}><h4><ICON color="#FFFFFF"/>{children}</h4></Link>
		</div>
	)
}