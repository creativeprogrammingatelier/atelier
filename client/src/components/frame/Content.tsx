import React, {MouseEventHandler} from "react";

interface ContentProperties {
	children?: JSX.Element | JSX.Element[],
	onClick?: MouseEventHandler
}
export function Content({children, onClick}: ContentProperties) {
	return <div className="content row no-gutters">
		<div className="contentMargin col-0 col-lg-3 col-xl-2"/>
		<div className="contentPage col-12 col-sm-12 col-md-12 col-lg-9 col-xl-10" onClick={onClick}>
			{children}
		</div>
	</div>
}