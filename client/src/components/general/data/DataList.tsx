import React, {useEffect, useState} from 'react';
import {Header} from '../../frame/Header';
import {DataTagProperties} from "./DataTag";
import {DataItem} from "./DataItem";

interface DataItemListProperties {
	header: string,
	children?: JSX.Element | JSX.Element[]
}
export function DataList({header, children}: DataItemListProperties) {
	console.log("Printing a data list");
	console.log(header);
	console.log(children);

	return <div className="list">
		{children && <Header title={header} small/>}
		<div className="m-3">
			{children}
		</div>
	</div>
}