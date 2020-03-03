import React from "react";
import {Sharing} from "../general/Sharing";
import {File} from "../../../../models/api/File";
import {FileNameHelper} from "../../helpers/FileNameHelper";

interface ShareProperties {
	file: File,
	url: string
}
export function ShareTab({file, url}: ShareProperties) {
	return <div className="contentTab">
		<h1>{FileNameHelper.fromPath(file.name)}</h1>
		<Sharing url={url}/>
	</div>;
}