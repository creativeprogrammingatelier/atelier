import React from "react";
import {Sharing} from "../share/Sharing";
import {File} from "../../../../models/api/File";

interface ShareProperties {
	file: File,
	url: string
}
export function ShareTab({file, url}: ShareProperties) {
	return <div className="contentTab">
		<div className="m-3">
			<Sharing url={url}/>
		</div>
	</div>;
}