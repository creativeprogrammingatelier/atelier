import React from 'react';

interface ContentProperties {
	children?: JSX.Element | JSX.Element[]
}
export function Content({children}: ContentProperties) {
	return <div className="content row no-gutters">
		<div className="contentMargin col-0 col-lg-3 col-xl-2"/>
		<div className="contentPage col-12 col-sm-12 col-md-12 col-lg-9 col-xl-10">
			{children}
		</div>
	</div>
}