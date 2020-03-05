import React from "react";

interface InputProperties {
	children?: string | JSX.Element | JSX.Element[]
}
export function FakeReadOnlyInput({children}: InputProperties) {
	return <p className="form-control-plaintext m-0">{children}</p>
}