import React  from 'react';
import {FileViewer, FileViewerProperties} from "../FileOverview";
import { File } from '../../../../../models/api/File';
import {FiCode} from "react-icons/all";

export function UnsupportedViewer({file, sendComment}: FileViewerProperties) {
    return <p>Displaying files of type <b>{file.type}</b> is not supported.</p>;
}
function acceptsFile(file: File) {
    return false;
}

const fileViewer: FileViewer = {
    name: "File",
    icon: FiCode,
    viewer: UnsupportedViewer,
    acceptsFile
};
export {fileViewer as FileViewerUnsupported};