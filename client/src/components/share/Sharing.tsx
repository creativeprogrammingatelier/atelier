import React from "react";
import {Button, FormControl, InputGroup} from "react-bootstrap";
import {FiClipboard} from "react-icons/all";
import {QRCode} from "./QrCode";

interface SharingProperties {
    url: string
}

export function Sharing({url}: SharingProperties) {
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

    return <div>
        <InputGroup className="mb-3">
            <FormControl plaintext readOnly defaultValue={url} onFocus={selectURL}/>
            <InputGroup.Append>
                <Button onClick={() => copyURL(url)}>Copy <FiClipboard/></Button>
            </InputGroup.Append>
        </InputGroup>
        <QRCode url={url}/>
    </div>
}