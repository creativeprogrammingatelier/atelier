import React from 'react';
import {IconType} from "react-icons";

interface HeaderButtonProperties {
	icon?: IconType,
	onClick?: React.MouseEventHandler,
	right?: boolean
}
export function HeaderButton({icon, onClick, right}: HeaderButtonProperties) {
	if (icon) {
		const ICON: IconType = icon;
		return <div className={right ? "float-right" : ""} onClick={onClick}>{icon && <ICON size={40} color="#FFFFFF"/>}</div>
	}
	return <div/>
}