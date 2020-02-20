import React from "react";
import {Link} from "react-router-dom";
import {Toast, ToastBody} from "react-bootstrap";
import {DataTag, DataTagProperties} from "./DataTag";

interface DataItemProperties {
	transport?: string,
	text: string,
	tags?: DataTagProperties[]
}
export function DataItem({transport, text, tags}: DataItemProperties) {
	return <div className="dataItem">
		{
			transport ?
			<Link to={transport ? transport : ""}>
				{toast(text, tags)}
			</Link>
			:
			toast(text, tags)
		}
	</div>
}

function toast(text: string, tags?: DataTagProperties[]) {
	return <Toast>
		<ToastBody>
			<p className="m-0 mr-1 d-inline">{text}</p>
			{tags !== undefined && tags.map((tag) => <DataTag {...tag}/>)}
		</ToastBody>
	</Toast>
}