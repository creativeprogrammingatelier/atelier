import React from 'react';

interface HeaderButtonProperties {
	name?: string,
	icon?: JSX.Element,
	onClick?: React.MouseEventHandler
}
export function HeaderButton({name, icon, onClick}: HeaderButtonProperties) {
	return <div onClick={onClick}>{icon}</div>
}