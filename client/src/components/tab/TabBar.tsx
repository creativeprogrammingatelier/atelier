import React from "react";
import {Nav} from "react-bootstrap";
import {IconType} from "react-icons";

import {TabButton} from "./TabButton";

interface TabProperties {
    /** Tab ID */
    id?: string,
    /** Tab Icon */
    icon: IconType,
    /** Tab Text */
    text: string,
    /** Location of tab */
    location: string
}
interface TabBarProperties {
    /** Tab within the bar */
    tabs: TabProperties[],
    /** Current active tab. */
    active: string
}
/**
 * Component for navigating between different tabs.
 */
export function TabBar({active, tabs}: TabBarProperties) {
    return <Nav fill justify variant="pills" className="fixed-bottom position-sticky">
        {tabs.map(tab =>
            <TabButton
                key={tab.id || tab.text}
                icon={tab.icon}
                text={tab.text}
                location={tab.location}
                active={tab.id === active}
            />
        )}
    </Nav>;
}
