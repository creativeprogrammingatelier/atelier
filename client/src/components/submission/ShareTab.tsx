import React from 'react';
import {Sharing} from "../general/Sharing";
import {File} from "../../../../models/database/File";
import {FileProperties} from "./FileOverview";

interface ShareProperties {
	file: File,
	url : string
}
export function ShareTab({file, url}: ShareProperties) {
	return <div className='QRCode'>
		<h1>{file.pathname}</h1>
		<Sharing url={url}/>
	</div>;
}