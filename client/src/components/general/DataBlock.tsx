import React from 'react';
import {Toast, ToastBody, ToastHeader} from 'react-bootstrap';

interface DataTag {
	name: string,
	color: string
}
export interface DataBlockProperties {
	title: string,
	text?: string,
	time: string,
	tags?: DataTag[]
}
export function DataBlock({title, text, time, tags}: DataBlockProperties) {
	return <div className="dataBlock">
		<div className="toast" role="alert" aria-live="assertive" aria-atomic="true">
			<div className="toast-header">
				<img src="..." className="rounded mr-2" alt="..."/>
					<strong className="mr-auto">Bootstrap</strong>
					<small className="text-muted">just now</small>
			</div>
			<div className="toast-body">
				See? Just like this.
			</div>
		</div>
		<div className="toast" role="alert" aria-live="assertive" aria-atomic="true">
			<div className="toast-header">
				<img src="..." className="rounded mr-2" alt="..."/>
					<strong className="mr-auto">Bootstrap</strong>
					<small className="text-muted">2 seconds ago</small>
			</div>
			<div className="toast-body">
				Heads up, toasts will stack automatically
			</div>
		</div>
		<Toast>
			<ToastHeader closeButton={false}>
				<strong className="mr-auto">God said, come first and receive eternal life</strong>
				<small className="text-muted">Just now</small>
			</ToastHeader>
			<ToastBody>
				But John came fourth and won a toaster
			</ToastBody>
		</Toast>
		<Toast>
			<ToastHeader closeButton={false}>
				<strong className="mr-auto">{title}</strong>
				<small className="text-muted">{time}</small>
			</ToastHeader>
			<ToastBody>
				{text}
			</ToastBody>
		</Toast>
	</div>
}