import React from "react";

import {CommentThread} from "../comment/CommentThread";
import {File} from "../../../../models/api/File";
import {useFileComments} from "../../helpers/api/APIHooks";
import {Cached} from "../general/loading/Cached";

interface CommentTabProperties {
    file: File,
    submissionID: string
}

// TODO sort threads once new interface is implemented. Useful for switch between code and comment threads.
export function CommentTab({file}: CommentTabProperties) {
    const fileComments = useFileComments(file.references.submissionID, file.ID);

    return <div className="contentTab">
        <div className="m-3">
            <Cached cache={fileComments}>{thread => <CommentThread key={thread.ID} thread={thread}/>}</Cached>
        </div>
    </div>
}