import React, {useEffect, useState} from "react";
import {FiCode, FiMessageSquare, FiShare2} from "react-icons/all";

import {Frame} from "../frame/Frame";
import {TabBar} from "../general/TabBar";
import {CommentTab} from "./CommentTab";
import {ShareTab} from "./ShareTab";
import {File} from "../../../../models/api/File";
import {Loading} from "../general/loading/Loading";
import {FileNameHelper} from "../../helpers/FileNameHelper";
import {getFile, getSubmission} from "../../../helpers/APIHelper";
import {Button, Jumbotron} from "react-bootstrap";
import {Link} from "react-router-dom";
import {Submission} from "../../../../models/api/Submission";
import {Children} from "../../helpers/ParentHelper";
import {IconType} from "react-icons";
import {Selection} from "../../../../models/api/Snippet";
import {CommentThread} from "../../../../models/api/CommentThread";
import {FileViewerCode} from "./fileviewers/CodeViewer";
import {FileViewerImage} from "./fileviewers/ImageViewer";
import {ViewTab} from "./ViewTab";
import {FileViewerUnsupported} from "./fileviewers/UnsupportedViewer";

interface FileOverviewProperties {
	match: {
		params: {
			submissionId: string,
			fileId: string,
			tab: string
		}
	}
}
export function FileOverview({match: {params: {submissionId, fileId, tab}}}: FileOverviewProperties) {
	const [activeTab, setActiveTab] = useState(tab);
	const [activeFileViewer, setActiveFileViewer] = useState(FileViewerUnsupported);
	const [activatedFileViewer, setActivatedFileViewer] = useState(false);
	const submissionPath = "/submission/" + submissionId;
	const filePath = submissionPath + "/" + fileId;

	useEffect(() => {
		setActiveTab(tab);
	}, [tab]);

	function renderTabContents(file: File) {
		if (activeTab === "code") {
			if (!activatedFileViewer) {
				const fileViewer = getFileViewer(file);
				if (fileViewer) {
					setActiveFileViewer(fileViewer);
				}
				setActivatedFileViewer(true);
			}
			return <ViewTab file={file} viewer={activeFileViewer.viewer}/>
		} else if (activeTab === "comments") {
			return <CommentTab file={file} submissionID={submissionId}/>;
		} else if (activeTab === "share") {
			return <ShareTab file={file} url={window.location.origin + filePath}/>;
		}
		return <div><h1>Tab not found!</h1></div>; // TODO: Better error
	}

	return (
		<Loading<File>
			loader={getFile}
			params={[fileId]}
			component={file =>
				<Frame title={FileNameHelper.fromPath(file.name)} sidebar search={{course: file.references.courseID}}>
					<Jumbotron>
						<h1>{FileNameHelper.fromPath(file.name)}</h1>
						<Loading<Submission>
							loader={getSubmission}
							params={[submissionId]}
							component={submission => <p>In project <Link to={submissionPath}>{submission.name}</Link> by <Link to={"/user/" + submission.user.ID}>{submission.user.name}</Link></p>}
						/>
						{activeTab === "code" && <Button><a href={`/api/file/${fileId}/download`}>Download</a></Button>}
					</Jumbotron>
					{renderTabContents(file)}
					<TabBar
						tabs={[{
							id: "code",
							icon: activeFileViewer.icon,
							text: activeFileViewer.name,
							location: filePath + "/code"
						}, {
							id: "comments",
							icon: FiMessageSquare,
							text: "Comments",
							location: filePath + "/comments"
						}, {
							id: "share",
							icon: FiShare2,
							text: "Share",
							location: filePath + "/share"
						}]}
						active={activeTab}
					/>
				</Frame>
			}
			wrapper={children => <Frame title="File" sidebar search>{children}</Frame>}
		/>
	);
}

export type FileCommentHandler = (comment: string, restricted: boolean, selection?: Selection | undefined) => Promise<CommentThread>;
export interface FileViewerProperties {
	file: File,
	sendComment: FileCommentHandler
}
export interface FileViewer {
	name: string,
	icon: IconType,
	viewer: (properties: FileViewerProperties) => Children,
	acceptsFile: (file: File) => boolean
}
const fileViewers = [FileViewerCode, FileViewerImage];

function getFileViewer(file: File) {
	return fileViewers.reduce((res, fileViewer) => {
		if (!res) {
			return fileViewer.acceptsFile(file) ? fileViewer  : false;
		} else {
			return res;
		}
	}, false as false | (FileViewer));
}
export function canDisplayFile(file: File) {
	return fileViewers.some(({acceptsFile}) => acceptsFile(file));
}