import React from "react";
import {Toast, ToastBody} from "react-bootstrap";
import {DataTag, DataTagProperties} from "./DataTag";
import {IconType} from "react-icons";

interface DataTriggerProperties {
	text: string,
	tags?: DataTagProperties[],
	trigger: {
		icon: IconType,
		click: () => void
	}
}
export function DataTrigger({text, tags, trigger}: DataTriggerProperties) {
	return <div className="dataToggle">
		<Toast onClick={trigger.click}>
			<ToastBody>
				<p className="m-0 mr-1 d-inline">{text}</p>
				{tags !== undefined && tags.map((tag) => <DataTag {...tag}/>)}
				<div className="d-inline-block float-right">
					{trigger.icon({color: "#000000"})}
				</div>
			</ToastBody>
		</Toast>
	</div>
}