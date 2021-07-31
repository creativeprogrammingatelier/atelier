import React, {Fragment} from "react";
import {Form} from "react-bootstrap";
import {ParentalProperties} from "../../../helpers/ParentHelper";

interface MaybeInputProperties extends ParentalProperties {
    /** Boolean for storing if the input is to be modified */
    modify: boolean,
    /** Placeholder text for input area */
    placeholder: string,
    /** Value of input */
    value: string,
    /** Function for resolving a user changing selected option */
    onChange?: (value: string) => void
}
/**
 * Component that accepts an input only if the modify flag is true.
 */
export function MaybeInput({modify, placeholder, value, onChange, children}: MaybeInputProperties) {
    return <Fragment>
        {
            modify ?
                <Form.Control
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange && onChange((event.target as HTMLInputElement).value)}
                />
                :
                children ? children : <Form.Control plaintext readOnly value={value}/>
        }
    </Fragment>;
}
