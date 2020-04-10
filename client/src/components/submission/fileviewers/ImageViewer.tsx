import React, {Fragment, useState} from "react";
import {FiImage} from "react-icons/all";

import {File} from "../../../../../models/api/File";

import {getFileUrl} from "../../../../helpers/APIHelper";

import {CommentCreator} from "../../comment/CommentCreator";
import {FeedbackError} from "../../feedback/FeedbackError";
import {FeedbackContent} from "../../feedback/Feedback";
import {FeedbackSuccess} from "../../feedback/FeedbackSuccess";
import {FileViewer, FileViewerProperties} from "../FileOverview";

export function ImageViewer({file, sendComment}: FileViewerProperties) {
    const [success, setSuccess] = useState(false as FeedbackContent);
    const [error, setError] = useState(false as FeedbackContent);

    const handleCommentSend = async (comment: string, restricted: boolean) => {
        return sendComment(comment, restricted).then(state => {
            setSuccess(`Started new comment thread`);
            return state;
        }).catch(state => {
            setError(`Could not create comment`);
            return state;
        });
    };

    return <Fragment>
        <CommentCreator sendHandler={handleCommentSend}/>
        <FeedbackSuccess close={setSuccess}>{success}</FeedbackSuccess>
        <FeedbackError close={setError}>{error}</FeedbackError>
        <img src={getFileUrl(file.ID)} alt={file.name} className="w-100 mt-3"/>
    </Fragment>;
}

function acceptsType(type: string) {
    return type.startsWith("image/");
}

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