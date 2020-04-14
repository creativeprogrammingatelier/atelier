import React from "react";
import {Button, FormControl, InputGroup} from "react-bootstrap";
import {FiClipboard} from "react-icons/all";
import {CopyHelper} from "../../helpers/CopyHelper";
import {QRCode} from "./QrCode";

interface SharingProperties {
    url: string
}

export function Sharing({url}: SharingProperties) {
    function selectURL(event: React.FocusEvent<HTMLInputElement>) {
        event.target.select();
    }

    return <div>
        <InputGroup className="mb-3">
            <FormControl plaintext readOnly defaultValue={url} onFocus={selectURL}/>
            <InputGroup.Append>
                <Button onClick={() => CopyHelper.copy(url)}>Copy <FiClipboard/></Button>
            </InputGroup.Append>
        </InputGroup>
        <QRCode url={url}/>
    </div>
}