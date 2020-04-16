import React from "react";
import {File} from "../../../../models/api/File";
import {Sharing} from "../share/Sharing";

interface ShareTabProperties {
	file: File,
	url: string
}
export function ShareTab({url}: ShareTabProperties) {
	return <div className="contentTab">
		<div className="m-3">
			<Sharing url={url}/>
		</div>
	</div>;
}