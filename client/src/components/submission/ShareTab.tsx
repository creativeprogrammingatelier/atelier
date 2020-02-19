import React from 'react';
import {QRCode} from '../general/QrCode';
import {Button, FormControl, InputGroup} from 'react-bootstrap';

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
					<Button variant="outline-secondary">Button</Button>
				</InputGroup.Append>
			</InputGroup>
			{navigator.share ? navigator.share({
				title: 'WebShare API Demo',
				url: 'https://codepen.io/ayoisaiah/pen/YbNazJ',
                text: "Shut up"
			}) : undefined}
			<QRCode
				url={url}
			/>
		</div>
	);
}