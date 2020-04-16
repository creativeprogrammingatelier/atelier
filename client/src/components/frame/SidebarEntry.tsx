import React from "react";
import {Link} from "react-router-dom";
import {IconType} from "react-icons";

interface SidebarEntryProperties {
	children: string,
	location: string
	icon: IconType,
	close: React.MouseEventHandler
}
export function SidebarEntry({children, location, icon, close}: SidebarEntryProperties) {
	return <div className="link">
		<Link to={location} onClick={close}><h4>{icon({color: "#FFFFFF"})}{children}</h4></Link>
	</div>;
}