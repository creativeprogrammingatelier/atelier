import React from 'react';
import {Nav} from 'react-bootstrap';
import {IconType} from "react-icons";

import {TabButton} from './TabButton';

interface TabProperties {
	id?: string,
	icon: IconType,
	text: string,
	location: string
}
interface TabBarProperties {
	tabs: TabProperties[],
	active: string
}
export function TabBar({active, tabs}: TabBarProperties) {
	return <Nav fill justify variant="pills" className="fixed-bottom position-sticky">
		{tabs.map((tab) => <TabButton key={tab.id || tab.text} icon={tab.icon} text={tab.text} location={tab.location} active={tab.id === active}/>)}
	</Nav>
}