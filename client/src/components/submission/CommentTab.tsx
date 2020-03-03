import React from "react";

import {CommentThread} from "./comment/CommentThread";
import {File} from "../../../../models/api/File";
import {Loading} from "../general/Loading";
import {CommentThread as ICommentThread} from "../../../../models/api/CommentThread";
import {FileNameHelper} from "../../helpers/FileNameHelper";
import { getFileComments } from "../../../helpers/APIHelper";

interface CommentTabProperties {
    body : string,
    file: File
}

// TODO sort threads once new interface is implemented. Useful for switch between code and comment threads.
export function CommentTab({ file , body}: CommentTabProperties) {
	return <div className="contentTab">
		<h1>{FileNameHelper.fromPath(file.name)}</h1>
        <Loading<ICommentThread[]>
            loader={getFileComments}
            params={[file.ID]}
            component={threads => threads.map(thread => <CommentThread thread={thread} file={file} body={body} />)} />
    </div>
}