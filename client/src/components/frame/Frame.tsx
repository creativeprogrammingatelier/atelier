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
	/** Title of Frame */
	title: string,
	/** Variable for tracking whether the frame has a sidebar */
	sidebar: boolean,
	/** Variable for tracking whether the frame has a search */
	search?: boolean | SearchProperties,
}
/**
 * Component that defines a Frame with content. Frame is constructed differently based on the screen size and is used 
 * to define the main wrapper page, with sidebar or search, depending on breakpoints, and any content to the page is added via 
 * the children. 
 */
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