import React, {useEffect, useState} from 'react';
import {Header} from '../frame/Header';
import {DataTagProperties} from "./DataTag";
import {DataItem} from "./DataItem";

interface DataItemListProperties {
	header: string,
	children?: JSX.Element | JSX.Element[]
}
export function DataList({header, children}: DataItemListProperties) {
	return <div>
		<Header title={header}/>
		<div className="py-2">
			{children}
		</div>
	</div>
}