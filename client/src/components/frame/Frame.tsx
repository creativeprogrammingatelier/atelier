import React, {useState} from "react";
import {FiMenu, FiSearch} from "react-icons/fi";
import {Header} from "./Header";
import {Sidebar} from "./Sidebar";
import {Content} from "./Content";

interface FrameProperties {
	children?: JSX.Element | JSX.Element[],
	title: string,
	user?: {
		id: string,
		name: string
	}
	sidebar: boolean,
	search?: string,
}
export function Frame({children, title, user, sidebar, search}: FrameProperties) {
	const [sidebarPosition, setSidebarPosition] = useState("-150vw");

	function sidebarOpen() {
		setSidebarPosition(() => "0vw");
	}
	function sidebarClose() {
		setSidebarPosition(() => "-150vw");
	}
	function searchClick() {
		window.location.href = search ? search : "#";
	}

	return (
		<div>
			<Header fixed title={title} leftButton={sidebar ? {icon: FiMenu, click: sidebarOpen} : undefined} rightButton={search ? {icon: FiSearch, click: searchClick} : undefined}/>
			<Sidebar user={user} position={sidebarPosition} close={sidebarClose}/>
			<Content>{children}</Content>
		</div>
	);
}