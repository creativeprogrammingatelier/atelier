import React from 'react';
import {Heading} from "../Heading";
import {ParentalProperties} from "../../../helpers/ParentHelper";

interface DataItemListProperties extends ParentalProperties {
	header: string
}
export function DataList({header, children}: DataItemListProperties) {
	return <div className="list">
		{children && <Heading title={header}/>}
		<div className="m-3">
			{children}
		</div>
	</div>
}