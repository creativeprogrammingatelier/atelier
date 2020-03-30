import React, {Fragment} from "react";
import {FileViewer, FileViewerProperties} from "../FileOverview";
import {File} from "../../../../../models/api/File";
import {getFileUrl} from "../../../../helpers/APIHelper";
import {FiImage} from "react-icons/all";
import {CommentCreator} from "../../comment/CommentCreator";

export function ImageViewer({file, sendComment}: FileViewerProperties) {
	const handleCommentSend = async(comment: string, restricted: boolean) => {
		return sendComment(comment, restricted);
	};

	return <Fragment>
		<CommentCreator sendHandler={handleCommentSend}/>
		<img src={getFileUrl(file.ID)} alt={file.name} className="w-100 my-3"/>
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