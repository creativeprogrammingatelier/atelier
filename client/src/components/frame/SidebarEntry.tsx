import React from "react";
import {Link} from "react-router-dom";
import {IconType} from "react-icons";

interface SidebarEntryProperties {
	/** Text of SidebarEntry */
	children: string,
	/** Location of  */
	location: string
	/** Icon of entry*/
	icon: IconType,
	/** Callback function for closing the sidebar */
	close: React.MouseEventHandler
}
/** Component that defines an entry on the sidebar with the name, icon, location 
 * the entry links to and a callback function for closing the sidebar. 
 */
export function SidebarEntry({children, location, icon, close}: SidebarEntryProperties) {
	return <div className="link">
		<Link to={location} onClick={close}><h4>{icon({color: "#FFFFFF"})}{children}</h4></Link>
	</div>;
}