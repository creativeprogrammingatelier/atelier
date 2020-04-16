import React, {useState} from "react";
import {useHistory} from "react-router-dom";
import {FiMenu, FiSearch} from "react-icons/fi";

import {ParentalProperties} from "../../helpers/ParentHelper";

import {Responsive} from "../general/Responsive";
import {SearchProperties} from "../search/SearchOverview";
import {Header} from "./Header";
import {Sidebar} from "./Sidebar";
import {Content} from "./Content";

interface FrameProperties extends ParentalProperties {
	title: string,
	sidebar: boolean,
	search?: boolean | SearchProperties,
}
export function Frame({children, title, sidebar, search}: FrameProperties) {
	const sidebarPositionOpened = "0vw";
	const sidebarPositionClosed = "-150vw";
	const history = useHistory();
	const [sidebarPosition, setSidebarPosition] = useState(sidebarPositionClosed);
	
	const sidebarOpen = () => {
		setSidebarPosition(() => sidebarPositionOpened);
	};
	const sidebarClose = () => {
		setSidebarPosition(() => sidebarPositionClosed);
	};
	const searchClick = () => {
		history.push({pathname: "/search", state: search === true ? {} : search});
	};
	
	return <div>
		<Responsive breakpoints={["extraSmall", "small", "medium"]}>
			<Header fixed title={title} leftButton={sidebar ? {icon: FiMenu, click: sidebarOpen} : undefined}
				rightButton={search ? {icon: FiSearch, click: searchClick} : undefined}/>
			<Sidebar position={sidebarPosition} close={sidebarClose}/>
		</Responsive>
		<Responsive breakpoints={["large", "extraLarge"]}>
			<Header fixed title={title} rightButton={search ? {icon: FiSearch, click: searchClick} : undefined}/>
			<Sidebar position={sidebarPositionOpened} close={sidebarClose}/>
		</Responsive>
		<Content>{children}</Content>
	</div>;
}