import React from "react";
import {Toast, ToastBody, ToastHeader} from "react-bootstrap";
import {Link} from "react-router-dom";
import {TimeHelper} from "../../../helpers/TimeHelper";
import {Tag, TagProperties} from "../general/Tag";

interface DataTime {
	start: Date,
	offset: Date
}
interface DataBlockProperties {
	transport?: string,
	title: string,
	text: string,
	time: string | DataTime,
	tags?: TagProperties[]
}
export function DataBlock(block: DataBlockProperties) {
	return <div className="dataBlock">
		{
			block.transport ?
			<Link to={block.transport ? block.transport : ""}>
				{toast(block)}
			</Link>
			:
			toast(block)
		}
	</div>;
}

function toast({title, text, time, tags}: DataBlockProperties) {
	return <Toast>
		<ToastHeader closeButton={false}>
			<strong className="mr-auto">
				<p className="m-0 mr-1 d-inline">{title}</p>
				{tags !== undefined && tags.map((tag) => <Tag {...tag}/>)}
			</strong>
			<small className="text-muted text-right">{typeof time === "string" ? time : TimeHelper.howLongAgo(time.start, time.offset)}</small>
		</ToastHeader>
		<ToastBody>
			{text}
		</ToastBody>
	</Toast>;
}