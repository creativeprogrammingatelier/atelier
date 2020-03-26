import React, { Fragment } from 'react';
import {FileViewer, FileViewerProperties} from "../FileOverview";
import { File } from '../../../../../models/api/File';
import { getFileUrl } from '../../../../helpers/APIHelper';
import {FiCode} from "react-icons/all";
import {JsonFetchError} from "../../../../helpers/FetchHelper";
import {CommentCreator} from "../../comment/CommentCreator";

export function ImageViewer({file, sendComment}: FileViewerProperties) {
    const handleCommentSend = async(comment: string, restricted: boolean) => {
        try {
            await sendComment(comment, restricted);
            return true;
        } catch (error) {
            if (error instanceof JsonFetchError) {
                // TODO: handle error for the user
                console.log(error);
            } else {
                throw error;
            }
        }
        return false;
    };

    return <Fragment>
        <CommentCreator sendHandler={handleCommentSend}/>
        <img src={getFileUrl(file.ID)} alt={file.name} />
    </Fragment>;
}
function acceptsFile(file: File) {
    return file.type.startsWith("image/");
}

const fileViewer: FileViewer = {
    name: "Image",
    icon: FiCode,
    viewer: ImageViewer,
    acceptsFile
};
export {fileViewer as FileViewerImage};