import React from "react";
import {Badge} from "react-bootstrap";

import {BootstrapVariant} from "../../helpers/BootstrapHelper";
import {ParentalProperties} from "../../helpers/ParentHelper";

export interface TagProperties extends ParentalProperties {
    /** Variables for setting properties of Tag */
    large?: boolean,
    round?: boolean,
    light?: boolean,
    color?: string,
    /** Function called for parsing click */
    click?: () => void,
    /** BootStrap variant to set the theme of the tag. */
    theme?: BootstrapVariant
}

/**
 * Component for the representing the defined dag. Tag properties are passed into
 * a react Badge and the children are wrapper by it.
 */
export function Tag({children, large, round, light, color, click, theme}: TagProperties) {
    return <Badge
        pill={round}
        variant={theme}
        className={"buttonWrapper " + (light ? "text-dark" : "text-white") + (large ? " tagLarge" : "") + (click ? " tagClick" : "")}
        style={{backgroundColor: color}}
        onClick={click}
    >
        {children}
    </Badge>;
}
