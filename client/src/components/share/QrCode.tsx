import React from "react";
import QRLibrary from "qrcode.react";

interface QRCodeProperties {
	/** Url to be made into a QR Code */
	url: string
}
/**
 * Component for generating a QR code based url and returning it.
 */
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