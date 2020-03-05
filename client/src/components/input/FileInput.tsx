import React from "react";
import "../../../../helpers/Extensions";
import {Form, InputGroup} from "react-bootstrap";

interface FileInputProperties {
	children?: string | JSX.Element | JSX.Element[],
	folders: boolean,
	handleElement: (element: HTMLInputElement) => void,
	handleSelected: (event: React.ChangeEvent<HTMLInputElement>) => void
}
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
	</Form.Label>
}