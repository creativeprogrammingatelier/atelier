import React from 'react';
import {QRCode} from '../general/QrCode';
import {Button, FormControl, InputGroup} from 'react-bootstrap';
import {FiClipboard} from 'react-icons/all';

declare global {
	interface Navigator {
		share: (options: {
			url: string,
			text: string,
			title: string
		}) => Promise<{}>
	}
}

export function ShareTab() {
	const url = 'localhost:5000/submission=?';
	return (
		<div className='QRCode'>
			<h1>Share me</h1>
			<InputGroup className="mb-3">
				<FormControl plaintext readOnly defaultValue={url}/>
				<InputGroup.Append>
					<Button>Copy <FiClipboard/></Button>
				</InputGroup.Append>
			</InputGroup>
			<QRCode
				url={url}
			/>
		</div>
	);
}