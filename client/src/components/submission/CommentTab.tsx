import React from "react";

import {CommentThread} from "../comment/CommentThread";
import {File} from "../../../../models/api/File";
import { useFileComments } from "../../helpers/api/APIHooks";
import { CachedList } from "../general/loading/CachedList";

interface CommentTabProperties {
    file: File,
	submissionID: string
}

// TODO sort threads once new interface is implemented. Useful for switch between code and comment threads.
export function CommentTab({file}: CommentTabProperties) {
    const {fileComments, refreshFileComments} = useFileComments(file.references.submissionID, file.ID);

	return <div className="contentTab">
        <CachedList collection={fileComments} refresh={refreshFileComments}>{
            thread => <CommentThread thread={thread.item}/>
        }</CachedList>
    </div>
}