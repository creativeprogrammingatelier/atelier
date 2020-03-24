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
	return (
		<div className="link">
			<Link to={location} onClick={close}><h4>{icon({color:"#FFFFFF"})}{children}</h4></Link>
		</div>
	)
}