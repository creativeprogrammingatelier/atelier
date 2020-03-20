import React from "react";
import {Link} from "react-router-dom";
import {Toast, ToastBody} from "react-bootstrap";
import {DataTag, DataTagProperties} from "./DataTag";
import {ParentalProperties} from "../../helpers/ParentHelper";

interface DataItemProperties extends ParentalProperties {
	transport?: string,
	text: string,
	tags?: DataTagProperties[]
}
export function DataItem({transport, text, tags, children}: DataItemProperties) {
	return <div className="dataItem">
		{
			transport ?
			<Link to={transport ? transport : ""}>
				{toast({text, tags, children})}
			</Link>
			:
			toast({text, tags, children})
		}
	</div>
}

function toast({text, tags, children}: DataItemProperties) {
	return <Toast>
		<ToastBody>
			<p className="m-0 mr-1 d-inline">{text}</p>
			{tags !== undefined && tags.map((tag) => <DataTag {...tag}/>)}
		</ToastBody>
		{children}
	</Toast>
}