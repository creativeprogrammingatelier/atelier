import React, {useState} from "react";
import {FiMenu, FiSearch} from "react-icons/fi";
import {Header} from "./Header";
import {Sidebar} from "./Sidebar";
import {Content} from "./Content";

interface FrameProperties {
	children?: JSX.Element | JSX.Element[],
	title: string,
	sidebar: boolean,
	search?: string,
}
export function Frame({children, title, sidebar, search}: FrameProperties) {
	const sidebarPositionOpened = "0vw";
	const sidebarPositionClosed = "-150vw";
	const [sidebarPosition, setSidebarPosition] = useState(sidebarPositionClosed);

	function sidebarOpen() {
		setSidebarPosition(() => sidebarPositionOpened);
	}
	function sidebarClose() {
		setSidebarPosition(() => sidebarPositionClosed);
	}
	function searchClick() {
		window.location.href = search ? search : "#";
	}

	return (
		<div>
			<Header fixed title={title} leftButton={sidebar ? {icon: FiMenu, click: sidebarOpen} : undefined} rightButton={search ? {icon: FiSearch, click: searchClick} : undefined}/>
			<Sidebar position={sidebarPosition} close={sidebarClose}/>
			<Content>{children}</Content>
		</div>
	);
}