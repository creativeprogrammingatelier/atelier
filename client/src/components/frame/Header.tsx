import React from 'react';
import {Navbar} from 'react-bootstrap';
import {HeaderButton} from './HeaderButton';

interface HeaderProperties {
	title?: string,
	transparent?: boolean,
	fixed?: boolean,
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
export function Header({ title, transparent, fixed, leftButton, rightButton}: HeaderProperties) {
	return (
		<div className="fluid-container">
			<Navbar className={"row no-gutters" + (transparent && " bg-transparent") + (fixed && " position-fixed")}>
				{(leftButton || rightButton) && <div className="col-2 text-left">{leftButton && <HeaderButton name={leftButton.name} icon={leftButton.icon} onClick={leftButton.click}/>}</div>}
				{(leftButton || rightButton) && <div className="col-8 text-center">{title && <h3>{title}</h3>}</div>}
				{(leftButton || rightButton) && <div className="col-2 text-right">{rightButton && <HeaderButton name={rightButton.name} icon={rightButton.icon} onClick={rightButton.click} right/>}</div>}
				{!(leftButton || rightButton) && <div className="col-12 text-center"><h3>{title}</h3></div>}
			</Navbar>
		</div>
	);
}