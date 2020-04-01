import React from 'react';
import QRLibrary from 'qrcode.react';

interface QRCodeProperties {
	url: string
}
export function QRCode({url}: QRCodeProperties) {
	return (
		<QRLibrary
			value={url}
			renderAs="svg"
			width="unset"
			height="unset"
			className="qrCode"
			bgColor="#FFFFFF00"
			// Dark theme
			// bgColor="#FFFFFF"
			// fgColor="#00000000"
		/>
	);
}