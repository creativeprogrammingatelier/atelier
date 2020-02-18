import React from 'react';
import {Nav} from 'react-bootstrap';

interface TabButtonProperties {
    icon: JSX.Element,
    text: string,
    location: string,
    active?: boolean
}
export function TabButton({icon, text, location, active}: TabButtonProperties) {
    return (
        <Nav.Item>
            <Nav.Link href={location} active={active}>
                {icon}
                <p className="d-none d-md-inline-block">{text}</p>
            </Nav.Link>
        </Nav.Item>
    )
}