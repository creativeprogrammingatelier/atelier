import React from "react";
import {Toast, ToastBody, ToastHeader} from "react-bootstrap";
import {TimeHelper} from "../../helpers/TimeHelper";

import {OptionalLink} from "../general/OptionalLink";
import {Tag, TagProperties} from "../general/Tag";
import {useTime} from "./TimeProvider";

interface DataBlockProperties {
	transport?: string,
	title: string,
	text: string,
	time: Date | string,
	tags?: TagProperties[]
}
export function DataBlock({transport, title, text, time, tags}: DataBlockProperties) {
	const currentTime = useTime();
	return <div className="dataBlock">
		<OptionalLink to={transport ? transport : ""}>
			<Toast>
				<ToastHeader closeButton={false}>
					<strong className="mr-auto">
						<p className="m-0 mr-1 d-inline">{title}</p>
						{tags !== undefined && tags.map((tag) => <Tag {...tag}/>)}
					</strong>
					<small className="text-muted text-right">{typeof time === "string" ? time : TimeHelper.howLongAgo(time, currentTime)}</small>
				</ToastHeader>
				<ToastBody>
					{text}
				</ToastBody>
			</Toast>
		</OptionalLink>
	</div>;
}