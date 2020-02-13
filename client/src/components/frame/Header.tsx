import React from 'react';
import {Navbar} from 'react-bootstrap';
import {HeaderButton} from './HeaderButton';

interface HeaderProperties {
	title?: string,
	transparent?: boolean,
	leftButton?: {
		name: string,
		icon: JSX.Element,
		click: React.MouseEventHandler
	},
	rightButton?: {
		name: string,
		icon: JSX.Element,
		click: React.MouseEventHandler
	}
}
export function Header({ title, transparent, leftButton, rightButton}: HeaderProperties) {
	return (
		<div className="fluid-container">
			<Navbar className={"row no-gutters" + (transparent ? " bg-transparent" : "")}>
				<div className="col-2 text-left">{leftButton && <HeaderButton name={leftButton.name} icon={leftButton.icon} onClick={leftButton.click}/>}</div>
				<div className="col-8 text-center">{title && <h1 className="h3">{title}</h1>}</div>
				<div className="col-2 text-right">{rightButton && <HeaderButton  name={rightButton.name} icon={rightButton.icon} onClick={rightButton.click}/>}</div>
			</Navbar>
		</div>
	);
}