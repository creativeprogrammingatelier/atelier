import React from 'react';
import {QRCode} from "../general/QrCode";

interface ShareTabProps {
    url : string
}

export function ShareTab({url} : ShareTabProps) {
    return (
        <div className='QRCode'>
            <h1>Share Tab</h1>
            <p>Share link: {url}</p>
            <h4>QR CODE</h4>
            <QRCode
                url={url}
            />
        </div>
    )
}