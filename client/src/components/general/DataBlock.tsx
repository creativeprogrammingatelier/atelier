import React from 'react';
import {Badge, Toast, ToastBody, ToastHeader} from 'react-bootstrap';
import {TimeHelper} from '../../../helpers/TimeHelper';
import {Link} from 'react-router-dom';

export interface DataTag {
	name: string,
	color: string,
	dark?: boolean,
}
interface DataTime {
	start: string,
	offset: string
}
interface DataBlockProperties {
	transport?: string,
	title: string,
	text?: string,
	time: DataTime,
	tags?: DataTag[]
}
export function DataBlock({transport, title, text, time, tags}: DataBlockProperties) {
	return <div className="dataBlock">
		<Link to={transport ? transport : ""}>
			<Toast>
				<ToastHeader closeButton={false}>
					<strong className="mr-auto">
						<p className="m-0 mr-1 d-inline">{title}</p>
						{tags !== undefined && tags.map((tag) => <Badge className={tag.dark ? "text-white" : "text-dark"} style={{backgroundColor: tag.color}}>{tag.name}</Badge>)}
					</strong>
					<small className="text-muted text-right">{TimeHelper.howLongAgo(time.start, time.offset)}</small>
				</ToastHeader>
				<ToastBody>
					{text}
				</ToastBody>
			</Toast>
		</Link>
	</div>
}