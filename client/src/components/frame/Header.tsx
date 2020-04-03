import React, {useEffect, useState, Fragment} from "react";
import {IconType} from "react-icons";

import {columnValues} from "../../helpers/BootstrapHelper";

import {Heading} from "../general/Heading";
import {Responsive} from "../general/Responsive";

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
export function Header({ title, leftButton, rightButton}: HeaderProperties) {
	const [position, setPosition] = useState(0);

	const scrollListener = () => setPosition(window.pageYOffset);

	useEffect(() => {
		window.addEventListener("scroll", scrollListener);
		return () => {
			window.removeEventListener("scroll", scrollListener);
		};
	});

	return position < 100 ?
		<Heading large transparent position="absolute" offset={{left: 0, right: 0}} leftButton={leftButton} rightButton={rightButton}/>
		:
		<Fragment>
			<Responsive breakpoints={["extraSmall", "small", "medium"]}>
				<Heading large position="fixed" offset={{left: 0, right: 0}} title={title} leftButton={leftButton} rightButton={rightButton}/>
			</Responsive>
			<Responsive breakpoints={["large"]}>
				<Heading large position="fixed" offset={{left: columnValues[3], right: 0}} title={title} leftButton={leftButton} rightButton={rightButton}/>
			</Responsive>
			<Responsive breakpoints={["extraLarge"]}>
				<Heading large position="fixed" offset={{left: columnValues[2], right: 0}} title={title} leftButton={leftButton} rightButton={rightButton}/>
			</Responsive>
		</Fragment>
}