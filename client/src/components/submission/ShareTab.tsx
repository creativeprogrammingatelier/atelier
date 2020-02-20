import React from 'react';
import {QRCode} from '../general/QrCode';
import {Button, FormControl, InputGroup} from 'react-bootstrap';
import {FiClipboard} from 'react-icons/all';

interface ShareProperties {
	fileName: string,
	url: string
}
export function ShareTab({fileName, url}: ShareProperties) {
	function selectURL(event: React.FocusEvent<HTMLInputElement>) {
		event.target.select();
	}
	function copyURL(url: string) {
		const textField = document.createElement('textarea');
		textField.innerText = url;
		document.body.appendChild(textField);
		textField.select();
		document.execCommand('copy');
		textField.remove();
	}

	return (
		<div className='QRCode'>
			<h1>{fileName}</h1>
			<InputGroup className="mb-3">
				<FormControl plaintext readOnly defaultValue={url} onFocus={selectURL}/>
				<InputGroup.Append>
					<Button onClick={() => copyURL(url)}>Copy <FiClipboard/></Button>
				</InputGroup.Append>
			</InputGroup>
			<QRCode
				url={url}
			/>
		</div>
	);
}