import React from 'react';
import {Heading} from "../Heading";

interface DataItemListProperties {
	header: string,
	children?: JSX.Element | JSX.Element[]
}
export function DataList({header, children}: DataItemListProperties) {
	return <div className="list">
		{children && <Heading title={header}/>}
		<div className="m-3">
			{children}
		</div>
	</div>
}