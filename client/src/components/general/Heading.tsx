import React from "react";
import {Navbar} from "react-bootstrap";
import {IconType} from "react-icons";

import {HeaderButton} from "../frame/HeaderButton";

interface HeadingButtonProperties {
    /**
     * Icon for the heading button
     */
    icon: IconType,
    /**
     * Function for resolving a button clikc.
     */
    click: React.MouseEventHandler
}
interface HeadingProperties {
    /** Title of heading */
    title?: string,
    /** Cosmetic properties */
    large?: boolean,
    transparent?: boolean,
    /** Position of heading. */
    position?: string,
    /** Offset for left and right positioning */
    offset?: {
        left?: number | string,
        right?: number | string
    },
    /** Heading Buttons for navigation */
    leftButton?: HeadingButtonProperties,
    rightButton?: HeadingButtonProperties
}
export function Heading({title, large, transparent, position, offset, leftButton, rightButton}: HeadingProperties) {
    return (
        <div className="fluid-container">
            <Navbar className={"row no-gutters" + (large ? "" : " navbar-small") + (transparent ? " bg-transparent" : "") + (position ? " position-" + position : "")} style={offset}>
                {(leftButton || rightButton) && <div className="col-2 text-left">{leftButton && <HeaderButton icon={leftButton.icon} onClick={leftButton.click}/>}</div>}
                {(leftButton || rightButton) && <div className="col-8 text-center">{title && <h3>{title}</h3>}</div>}
                {(leftButton || rightButton) && <div className="col-2 text-right">{rightButton && <HeaderButton icon={rightButton.icon} onClick={rightButton.click} right/>}</div>}
                {!(leftButton || rightButton) && <div className="col-12 text-center"><h3>{title}</h3></div>}
            </Navbar>
        </div>
    );
}
