import React from "react";
import {Sharing} from "../general/Sharing";
import {File} from "../../../../models/database/File";

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