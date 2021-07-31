import React, {useEffect, useState, Fragment} from "react";
import {IconType} from "react-icons";

import {columnValues} from "../../helpers/BootstrapHelper";

import {Heading} from "../general/Heading";
import {Responsive} from "../general/Responsive";

interface HeaderProperties {
	/** Header title */
	title?: string,
	transparent?: boolean,
	fixed?: boolean,
	/** Prop for defining the left button on the header */
	leftButton?: {
		/** Icon of button */
		icon: IconType,
		/** Function for resolving click on the button */
		click: React.MouseEventHandler
	},
	/** Same as the left button, but for the right */
	rightButton?: {
		icon: IconType,
		click: React.MouseEventHandler
	}
}

/**
 * Component used as the header of a page on the website.
 */
export function Header({title, leftButton, rightButton}: HeaderProperties) {
    const [position, setPosition] = useState(0);
	
    const scrollListener = () => setPosition(window.pageYOffset);
	
    useEffect(() => {
        window.addEventListener("scroll", scrollListener);
        return () => {
            window.removeEventListener("scroll", scrollListener);
        };
    });
	
    return position < 100 ?
        <Heading
            large
            transparent
            position="absolute"
            offset={{left: 0, right: 0}}
            leftButton={leftButton}
            rightButton={rightButton}
        />
        :
        <Fragment>
            <Responsive breakpoints={["extraSmall", "small", "medium"]}>
                <Heading large position="fixed" offset={{left: 0, right: 0}} title={title} leftButton={leftButton}
                    rightButton={rightButton}/>
            </Responsive>
            <Responsive breakpoints={["large"]}>
                <Heading large position="fixed" offset={{left: columnValues[3], right: 0}} title={title}
                    leftButton={leftButton} rightButton={rightButton}/>
            </Responsive>
            <Responsive breakpoints={["extraLarge"]}>
                <Heading large position="fixed" offset={{left: columnValues[2], right: 0}} title={title}
                    leftButton={leftButton} rightButton={rightButton}/>
            </Responsive>
        </Fragment>;
}