import React from "react";
import {ParentalProperties} from "../../../helpers/ParentHelper";

interface FakeButtonProperties extends ParentalProperties {

    /** Function for resolving mouse click */
    onClick?: (event: React.MouseEvent) => void
}
/**
 * Component for a fake button, wrapping the children passed into a paragraph
 * that has an onClick hook.
 */
export function FakeButton({children, onClick}: FakeButtonProperties) {
    return <p className="btn btn-primary m-0" onClick={onClick}>{children}</p>;
}
