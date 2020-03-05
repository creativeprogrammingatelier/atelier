import React from "react";

interface ButtonProperties {
	children?: string | JSX.Element | JSX.Element[],
	onClick?: (event: React.MouseEvent) => void
}
export function FakeButton({children, onClick}: ButtonProperties) {
	return <p className="btn btn-primary m-0" onClick={onClick}>{children}</p>
}