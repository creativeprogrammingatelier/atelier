import React, {Fragment, useState} from "react";
import {FiImage} from "react-icons/all";

import {File} from "../../../../../models/api/File";

import {getFileUrl} from "../../../helpers/api/APIHelper";

import {CommentCreator} from "../../comment/CommentCreator";
import {FeedbackError} from "../../feedback/FeedbackError";
import {FeedbackContent} from "../../feedback/Feedback";
import {FeedbackSuccess} from "../../feedback/FeedbackSuccess";
import {FileViewer, FileViewerProperties} from "../FileOverview";

/**
 * Component for viewing images.
 */
export function ImageViewer({file, sendComment}: FileViewerProperties) {
    const [success, setSuccess] = useState(false as FeedbackContent);
    const [error, setError] = useState(false as FeedbackContent);

    /**
     * Function to handle comment creation.
     *
     * @param comment Text of comment to be created.
     * @param restricted Whether comment visibility is restricted, i.e. ony teachers and TAs can see it.
     */
    const handleCommentSend = async(comment: string, restricted: boolean) => {
        return sendComment(comment, restricted).then(feedback => {
            if (feedback.type === "success") {
                setSuccess(feedback.content);
                return true;
            } else if (feedback.type === "error") {
                setError(feedback.content);
                return false;
            }
            return false;
        });
    };

    return <Fragment>
        <CommentCreator sendHandler={handleCommentSend}/>
        <FeedbackSuccess close={setSuccess}>{success}</FeedbackSuccess>
        <FeedbackError close={setError}>{error}</FeedbackError>
        <img src={getFileUrl(file.ID)} alt={file.name} className="w-100 mt-3"/>
    </Fragment>;
}

/**
 * Function to resolve whether viewer accepts given type.
 *
 * @param type File type to be parsed.
 */
function acceptsType(type: string) {
    return type.startsWith("image/");
}

/**
 * Function to resolve whether viewer accepts given file.
 *
 * @param file File to be parsed.
 */
function acceptsFile(file: File) {
    return acceptsType(file.type);
}

const fileViewer: FileViewer = {
    name: "Image",
    icon: FiImage,
    viewer: ImageViewer,
    acceptsType,
    acceptsFile
};
export {fileViewer as FileViewerImage};
