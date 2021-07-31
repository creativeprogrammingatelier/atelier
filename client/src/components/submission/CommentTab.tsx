import React from "react";

import {File} from "../../../../models/api/File";

import {useFileComments} from "../../helpers/api/APIHooks";

import {CommentThread} from "../comment/CommentThread";
import {Cached} from "../general/loading/Cached";

interface CommentTabProperties {
    /** Source file, comment is associated with. */
    file: File,
    /** Submission comment was made in.*/
    submissionID: string
}
/**
 * Component that retrieves the comments threads from a file and displays them.
 */
export function CommentTab({file}: CommentTabProperties) {
    const fileComments = useFileComments(file.references.submissionID, file.ID);
    // TODO sort threads once new interface is implemented. Useful for switch between code and comment threads.

    return <div className="contentTab">
        <div className="m-3">
            <Cached cache={fileComments}>{thread => <CommentThread key={thread.ID} thread={thread}/>}</Cached>
        </div>
    </div>;
}
