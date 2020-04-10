import React from 'react';
import {Nav} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {IconType} from "react-icons";

interface TabButtonProperties {
    icon: IconType,
    text: string,
    location: string,
    active?: boolean
}

export function TabButton({icon, text, location, active}: TabButtonProperties) {
    return (
        <Nav.Item>
            <Link to={location} className={"text-white nav-link" + (active ? " active" : "")} replace>
                {icon({color: "#FFFFFF", size: 28})}
                <p className="d-none d-md-inline-block align-middle m-0 ml-2">{text}</p>
            </Link>
        </Nav.Item>
    )
}