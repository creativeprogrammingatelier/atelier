import React from "react";
import {ParentalProperties} from "../../../helpers/ParentHelper";

/**
 * Read only input component
 */
export function FakeReadOnlyInput({children}: ParentalProperties) {
    return <p className="form-control-plaintext m-0">{children}</p>;
}