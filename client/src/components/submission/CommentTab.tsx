import React, {Fragment} from "react";

import {CommentThread} from "./comment/CommentThread";
import {File} from "../../../../models/database/File";
import {Loading} from "../general/Loading";
import {ExtendedThread} from "../../../../models/database/Thread";
import {FileNameHelper} from "../../helpers/FileNameHelper";
import { getFileComments } from "../../../helpers/APIHelper";

interface CommentTabProperties {
    body : string,
    file: File
}

// TODO sort threads once new interface is implemented. Useful for switch between code and comment threads.
export function CommentTab({ file , body}: CommentTabProperties) {
	return <div className="contentTab">
		<h1>{FileNameHelper.fromPath(file.pathname!)}</h1>
        <Loading<ExtendedThread[]>
            loader={getFileComments}
            params={[file.fileID]}
            component={threads => threads.map(thread => <CommentThread thread={thread} file={file} body={body} />)} />
    </div>
}