import React from 'react';
const QrCode = require('qrcode.react');

interface QRCodeProps {
    url : string
}

export function QRCode({url} : QRCodeProps) {
    return (
        <QrCode
            value={url}
        />
    )
}