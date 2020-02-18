import React from 'react';
import {Toast, ToastBody, ToastHeader} from 'react-bootstrap';
import {TimeHelper} from '../../../helpers/TimeHelper';

export interface DataTag {
	name: string,
	color: string
}
interface DataTime {
	start: string,
	offset: string
}
interface DataBlockProperties {
	title: string,
	text?: string,
	time: DataTime,
	tags?: DataTag[]
}
export function DataBlock({title, text, time, tags}: DataBlockProperties) {
	return <div className="dataBlock">
		<Toast>
			<ToastHeader closeButton={false}>
				<strong className="mr-auto">{title}</strong>
				<small className="text-muted">{TimeHelper.howLongAgo(time.start, time.offset)}</small>
			</ToastHeader>
			<ToastBody>
				{text}
			</ToastBody>
		</Toast>
	</div>
}