import React from "react";
import {Nav} from "react-bootstrap";
import {Link} from "react-router-dom";
import {IconType} from "react-icons";

interface TabButtonProperties {
	/** Button Icon */
	icon: IconType,
	/** Button Text */
	text: string,
	/** Button Location */
	location: string,
	/** Is button active boolean */
	active?: boolean
}
/** 
 * Component for tab button used for navigation.
 */
export function TabButton({icon, text, location, active}: TabButtonProperties) {
    return <Nav.Item>
        <Link to={location} className={"text-white nav-link" + (active ? " active" : "")} replace>
            {icon({color: "#FFFFFF", size: 28})}
            <p className="d-none d-md-inline-block align-middle m-0 ml-2">{text}</p>
        </Link>
    </Nav.Item>;
}