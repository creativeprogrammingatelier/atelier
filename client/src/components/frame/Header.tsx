import React, {useEffect, useState} from "react";
import {IconType} from "react-icons";
import {Heading} from "../general/Heading";

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
		<Heading large transparent position="absolute" leftButton={leftButton} rightButton={rightButton}/>
		:
		<Heading large position="fixed" title={title} leftButton={leftButton} rightButton={rightButton}/>
}