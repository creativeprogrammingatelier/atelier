import React, {useState} from 'react';
import {FiMenu, FiSearch} from 'react-icons/fi';
import {Header} from './Header';
import {Sidebar} from './Sidebar';

interface FrameProperties {
	children?: JSX.Element | JSX.Element[],
	title: string,
	user: string,
	sidebar: boolean,
	search: boolean,
}
export function Frame({children, title, user, sidebar, search}: FrameProperties) {
	const [sidebarPosition, setSidebarPosition] = useState('-100vw');

	function sidebarOpen() {
		console.log("Opening sidebar");
		setSidebarPosition(() => '0vw')
	}
	function sidebarClose() {
		setSidebarPosition(() => '-100vw')
	}

	return (
		<div>
			<Header title={title} leftButton={sidebar ? {name:'Sidebar', icon:<FiMenu size={40}/>, click:sidebarOpen} : undefined} rightButton={search ? {name:'Search', icon:<FiSearch size={40}/>, click:sidebarClose} : undefined}/>
			<Sidebar user={user} position={sidebarPosition} close={sidebarClose}/>
			{children}
		</div>
	);
}