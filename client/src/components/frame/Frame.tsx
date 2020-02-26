import React, {useState} from 'react';
import {FiMenu, FiSearch} from 'react-icons/fi';
import {Header} from './Header';
import {Sidebar} from './Sidebar';
import {Content} from './Content';

interface FrameProperties {
	children?: JSX.Element | JSX.Element[],
	title: string,
	user: {
		id: string,
		name: string
	}
	sidebar: boolean,
	search?: string,
}
export function Frame({children, title, user, sidebar, search}: FrameProperties) {
	const [sidebarPosition, setSidebarPosition] = useState('-150vw');

	function sidebarOpen() {
		console.log("Opening sidebar");
		setSidebarPosition(() => '0vw');
	}
	function sidebarClose() {
		console.log("Closing sidebar");
		setSidebarPosition(() => '-150vw');
	}
	function searchClick() {
		window.location.href = search ? search : "#";
	}

	return (
		<div>
			<Header fixed title={title} leftButton={sidebar ? {icon:<FiMenu size={40} color="#FFFFFF"/>, click:sidebarOpen} : undefined} rightButton={search ? {icon:<FiSearch size={40} color="#FFFFFF"/>, click:searchClick} : undefined}/>
			<Sidebar user={user} position={sidebarPosition} close={sidebarClose}/>
			<Content>{children}</Content>
		</div>
	);
}