import React from 'react';
import {Navbar} from 'react-bootstrap';
import {HeaderButton} from './HeaderButton';
import {IconType} from "react-icons";

interface HeaderProperties {
	title?: string,
	transparent?: boolean,
	fixed?: boolean,
	leftButton?: {
		icon: IconType,
		click: React.MouseEventHandler
	},
	rightButton?: {
		icon: IconType,
		click: React.MouseEventHandler
	}
}
export function Header({ title, transparent, fixed, leftButton, rightButton}: HeaderProperties) {
	return (
		<div className="fluid-container">
			<Navbar className={"row no-gutters" + (transparent ? " bg-transparent" : "") + (fixed ? " position-fixed" : "")}>
				{(leftButton || rightButton) && <div className="col-2 text-left">{leftButton && <HeaderButton icon={leftButton.icon} onClick={leftButton.click}/>}</div>}
				{(leftButton || rightButton) && <div className="col-8 text-center">{title && <h3>{title}</h3>}</div>}
				{(leftButton || rightButton) && <div className="col-2 text-right">{rightButton && <HeaderButton icon={rightButton.icon} onClick={rightButton.click} right/>}</div>}
				{!(leftButton || rightButton) && <div className="col-12 text-center"><h3>{title}</h3></div>}
			</Navbar>
		</div>
	);
}