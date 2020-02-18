import React from 'react';
import {QRCode} from "../general/QrCode";

export function ShareTab() {
    const url = 'localhost:5000/submission=?';
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