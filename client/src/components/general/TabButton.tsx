import React from 'react';
import {Nav} from 'react-bootstrap';
import {Link} from 'react-router-dom';

interface TabButtonProperties {
    icon: JSX.Element,
    text: string,
    location: string,
    active?: boolean
}
export function TabButton({icon, text, location, active}: TabButtonProperties) {
    return (
        <Nav.Item>
            <Link to={location} className={"nav-link" + (active ? " active" : "")} replace>
                {icon}
                <p className="d-none d-md-inline-block">{text}</p>
            </Link>
        </Nav.Item>
    )
}