import React from 'react';
import {TabButton} from './TabButton';
import {Nav} from 'react-bootstrap';

interface TabProperties {
	id: string,
	icon: JSX.Element,
	text: string,
	location: string
}
interface TabBarProperties {
	tabs: TabProperties[],
	active: string
}
export function TabBar({active, tabs}: TabBarProperties) {
	console.log("Rendering some tabs");
	console.log(tabs);
	console.log(active);
	for (const tab of tabs) {
		console.log(tab);
		console.log(tab.id);
		console.log(tab.id === active);
	}
	return <div className="tabBar">
		<Nav fill justify variant="pills">
			{tabs.map((tab) => <TabButton icon={tab.icon} text={tab.text} location={tab.location} active={tab.id === active}/>)}
		</Nav>
	</div>
}