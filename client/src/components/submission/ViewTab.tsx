import React from "react";

import {File} from "../../../../models/api/File";
import {ServerError} from "../../../../models/api/ServerError";
import {Selection} from "../../../../models/api/Snippet";
import {ThreadState} from "../../../../models/enums/ThreadStateEnum";

import {useFileComments} from "../../helpers/api/APIHooks";
import {FeedbackMessage} from "../feedback/Feedback";

import {FileCommentHandler, FileViewerProperties} from "./FileOverview";

interface ViewTabProperties {
	/** File to be viewed */
	file: File,
	/** Viewer to be used for file */
	viewer: (properties: FileViewerProperties) => JSX.Element,
}
/**
 * Component for viewing a given file with a given viewer.
 */
export function ViewTab({file, viewer: viewer}: ViewTabProperties) {
    const fileComments = useFileComments(file.references.submissionID, file.ID);
	
    /**
	 * Handles comment creation.
	 * 
	 * @param comment Comment text of new comment.
	 * @param restricted Whether visibility is retroacted, i.e. only teachers and TAs can see it.
	 * @param selection The source selection of the new comment.
	 */
    const sendComment: FileCommentHandler = (comment: string, restricted: boolean, selection?: Selection | undefined) => {
        const commentBody = comment.trim();
        if (commentBody === "") {
            // Should the user get an error message when sending an empty comment? or would they understand?
            return Promise.resolve(new FeedbackMessage("error", false));
        }
        return fileComments.create({
            submissionID: file.references.submissionID,
            comment: commentBody,
            snippet: selection,
            visibility: restricted ? ThreadState.private : ThreadState.public
        })
            .then(() => new FeedbackMessage("success", "Comment created successfully"))
            .catch((error: ServerError) => {
                return new FeedbackMessage("error", error.message);
            });
    };
	
    return <div className="contentTab">
        <div className="m-3">
            {viewer({file, sendComment})}
        </div>
    </div>;
}