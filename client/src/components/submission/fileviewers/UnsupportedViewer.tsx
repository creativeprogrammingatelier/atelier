import React from "react";
import {FiFile} from "react-icons/all";
import {File} from "../../../../../models/api/File";
import {FileViewer, FileViewerProperties} from "../FileOverview";

export function UnsupportedViewer({file, sendComment}: FileViewerProperties) {
	return <p>Displaying files of type <b>{file.type}</b> is not supported.</p>;
}

function acceptsType(type: string) {
	return false;
}
function acceptsFile(file: File) {
	return false;
}

const fileViewer: FileViewer = {
	name: "File",
	icon: FiFile,
	viewer: UnsupportedViewer,
	acceptsType,
	acceptsFile
};
export {fileViewer as FileViewerUnsupported};