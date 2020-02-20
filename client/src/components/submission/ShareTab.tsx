import React from 'react';
import {Sharing} from "../general/Sharing";
import {FileProperties} from "./FileOverview";

interface ShareProperties {
	file: FileProperties
}
export function ShareTab({file:{name, url}}: ShareProperties) {
	return <div className='QRCode'>
		<h1>{name}</h1>
		<Sharing url={url}/>
	</div>;
}