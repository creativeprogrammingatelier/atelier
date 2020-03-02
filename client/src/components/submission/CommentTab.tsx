import React, {Fragment} from "react";

import {CommentThread} from "./comment/CommentThread";
import {File} from "../../../../models/database/File";
import {Loading} from "../general/loading/Loading";
import {ExtendedThread} from "../../../../models/database/Thread";
import {FileNameHelper} from "../../helpers/FileNameHelper";
import { getFileComments } from "../../../helpers/APIHelper";

interface CommentTabProperties {
    body : string,
    file: File
}

export function CommentTab({ file , body}: CommentTabProperties) {
	return <div className="contentTab">
		<h1>{FileNameHelper.fromPath(file.pathname!)}</h1>
        <Loading<ExtendedThread[]>
            loader={getFileComments}
            params={[file.fileID]}
            component={threads => threads.map(thread => <CommentThread thread={thread} body={body} />)} />
    </div>
}