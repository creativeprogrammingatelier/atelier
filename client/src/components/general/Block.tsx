import React from "react";
import {HTMLProperties} from "../../helpers/HTMLHelper";
import {Area} from "./Area";

interface BlockProperties extends HTMLProperties {
    /** Boolean for setting component transparency */
    transparent?: boolean
}
/**
 * Defines an Area component as a Block.
 */
export function Block({transparent, className, id, children}: BlockProperties) {
    return <Area transparent={transparent} className={className + " block"} id={id}>{children}</Area>;
}
