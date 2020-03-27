import React from 'react';
import {TabButton} from './TabButton';
import {Nav} from 'react-bootstrap';
import {IconType} from "react-icons";

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
	return <Nav fill justify variant="pills" className="fixed-bottom">
		{tabs.map((tab) => <TabButton icon={tab.icon} text={tab.text} location={tab.location} active={tab.id === active}/>)}
	</Nav>
}