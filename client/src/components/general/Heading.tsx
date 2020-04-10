import React from 'react';
import {Navbar} from 'react-bootstrap';
import {IconType} from "react-icons";

import {HeaderButton} from "../frame/HeaderButton";

interface HeadingButtonProperties {
    icon: IconType,
    click: React.MouseEventHandler
}

interface HeadingProperties {
    title?: string,
    large?: boolean,
    transparent?: boolean,
    position?: string,
    offset?: {
        left?: number | string,
        right?: number | string
    },
    leftButton?: HeadingButtonProperties,
    rightButton?: HeadingButtonProperties
}

export function Heading({title, large, transparent, position, offset, leftButton, rightButton}: HeadingProperties) {
    return (
        <div className="fluid-container">
            <Navbar
                className={"row no-gutters" + (large ? "" : " navbar-small") + (transparent ? " bg-transparent" : "") + (position ? " position-" + position : "")}
                style={offset}>
                {(leftButton || rightButton) && <div className="col-2 text-left">{leftButton &&
                <HeaderButton icon={leftButton.icon} onClick={leftButton.click}/>}</div>}
                {(leftButton || rightButton) && <div className="col-8 text-center">{title && <h3>{title}</h3>}</div>}
                {(leftButton || rightButton) && <div className="col-2 text-right">{rightButton &&
                <HeaderButton icon={rightButton.icon} onClick={rightButton.click} right/>}</div>}
                {!(leftButton || rightButton) && <div className="col-12 text-center"><h3>{title}</h3></div>}
            </Navbar>
        </div>
    );
}