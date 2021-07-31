import React from "react";
import {FiFile} from "react-icons/all";
import {File} from "../../../../../models/api/File";
import {FileViewer, FileViewerProperties} from "../FileOverview";

/**
 * Component for UnsupportedViewer message.
 */
export function UnsupportedViewer({file, sendComment}: FileViewerProperties) {
    return <p>Displaying files of type <b>{file.type}</b> is not supported.</p>;
}

/**
 * AcceptType returns false since type is not supported.
 */
function acceptsType(type: string) {
    return false;
}

/**
 * AcceptsFile returns false since file is not supported.
 */
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