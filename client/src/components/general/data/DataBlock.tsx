import React from "react";
import {Toast, ToastBody, ToastHeader} from "react-bootstrap";
import {TimeHelper} from "../../../../helpers/TimeHelper";
import {Link} from "react-router-dom";
import {DataTag, DataTagProperties} from "./DataTag";

interface DataTime {
	start: Date,
	offset: Date
}
interface DataBlockProperties {
	transport?: string,
	title: string,
	text: string,
	time: DataTime,
	tags?: DataTagProperties[]
}
export function DataBlock({transport, title, text, time, tags}: DataBlockProperties) {
	return <div className="dataBlock">
		{
			transport ?
			<Link to={transport ? transport : ""}>
				{toast(title, text, time, tags)}
			</Link>
			:
			toast(title, text, time, tags)
		}
	</div>;
}

function toast(title: string, text: string, time: DataTime, tags?: DataTagProperties[]) {
	return <Toast>
		<ToastHeader closeButton={false}>
			<strong className="mr-auto">
				<p className="m-0 mr-1 d-inline">{title}</p>
				{tags !== undefined && tags.map((tag) => <DataTag {...tag}/>)}
			</strong>
			<small className="text-muted text-right">{TimeHelper.howLongAgo(time.start, time.offset)}</small>
		</ToastHeader>
		<ToastBody>
			{text}
		</ToastBody>
	</Toast>;
}