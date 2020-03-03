import React from 'react';

interface HeaderButtonProperties {
	icon?: JSX.Element,
	onClick?: React.MouseEventHandler,
	right?: boolean
}
export function HeaderButton({icon, onClick, right}: HeaderButtonProperties) {
	return <div className={right ? "float-right" : ""} onClick={onClick}>{icon}</div>
}