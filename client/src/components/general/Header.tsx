import React from 'react';
import {Navbar} from 'react-bootstrap';
import {HeaderButton} from './HeaderButton';

interface HeaderProperties {
	title?: string,
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
export function Header({ title, leftButton, rightButton}: HeaderProperties) {
	return (
		<div className="fluid-container">
			<Navbar className="row">
				<div className="col-3 text-left">{leftButton && <HeaderButton name={leftButton.name} icon={leftButton.icon} onClick={leftButton.click}/>}</div>
				<div className="col-6 text-center">{title && <h1>{title}</h1>}</div>
				<div className="col-3 text-right">{rightButton && <HeaderButton  name={rightButton.name} icon={rightButton.icon} onClick={rightButton.click}/>}</div>
			</Navbar>
		</div>
	);
}