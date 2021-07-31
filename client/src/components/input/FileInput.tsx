import React from "react";
import "../../../../helpers/Extensions";
import {Form} from "react-bootstrap";
import {ParentalProperties} from "../../helpers/ParentHelper";

interface FileInputProperties extends ParentalProperties {
	/** Whether there are folders in the input */
	folders: boolean,
	/** Function for handling input elements */
	handleElement: (element: HTMLInputElement) => void,
	/** Function for resolving a change event on an element */
	handleSelected: (event: React.ChangeEvent<HTMLInputElement>) => void
}
/**
 * Component for defining a file input.
 */
export function FileInput({children, folders, handleElement, handleSelected}: FileInputProperties) {
    return <Form.Label className="w-100 m-0">
        {children}
        <input
            multiple
            required
            type="file"
            accept=".pde"
            className="form-control-file d-none"
            ref={(element: HTMLInputElement) => {
                if (element) {
                    handleElement(element);
                }
                if (element && folders) {
                    element.webkitdirectory = true;
                }
            }}
            onChange={handleSelected}
        />
    </Form.Label>;
}