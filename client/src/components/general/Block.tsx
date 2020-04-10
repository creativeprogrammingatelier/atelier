import React from "react";
import {Area} from "./Area";
import {HTMLProperties} from "../../helpers/HTMLHelper";

interface BlockProperties extends HTMLProperties {
    transparent?: boolean
}

export function Block({transparent, className, id, children}: BlockProperties) {
    return <Area transparent={transparent} className={className + " block"} id={id}>{children}</Area>
}