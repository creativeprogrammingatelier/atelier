import React from "react";
import {FiMessageSquare, FiShare2} from "react-icons/all";

import {Frame} from "../frame/Frame";
import {TabBar} from "../tab/TabBar";
import {CommentTab} from "./CommentTab";
import {ShareTab} from "./ShareTab";
import {File} from "../../../../models/api/File";
import {FileNameHelper} from "../../helpers/FileNameHelper";
import {Button, Jumbotron} from "react-bootstrap";
import {Link} from "react-router-dom";
import {IconType} from "react-icons";
import {Selection} from "../../../../models/api/Snippet";
import {FileViewerCode} from "./fileviewers/CodeViewer";
import {FileViewerImage} from "./fileviewers/ImageViewer";
import {ViewTab} from "./ViewTab";
import {FileViewerUnsupported} from "./fileviewers/UnsupportedViewer";
import { useSubmission, useFile } from "../../helpers/api/APIHooks";
import { Cached } from "../general/loading/Cached";
import { useObservableState } from "observable-hooks";
import { map } from "rxjs/operators";
import { CacheItem } from "../../helpers/api/Cache";

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
    const submission = useSubmission(submissionId);
    const file = useFile(submissionId, fileId);

    const fileViewer = useObservableState(
        file.observable.pipe(
            map(item => {
                const file = (item as CacheItem<File>)?.value;
                return (file !== undefined && getFileViewer(file)) || FileViewerUnsupported;
            })
        ), FileViewerUnsupported
    );

	const submissionPath = "/submission/" + submissionId;
	const filePath = submissionPath + "/" + fileId;

	function renderTabContents(file: File) {
		if (tab === "view") {
			return <ViewTab file={file} viewer={fileViewer.viewer}/>;
		} else if (tab === "comments") {
			return <CommentTab file={file} submissionID={submissionId}/>;
		} else if (tab === "share") {
			return <ShareTab file={file} url={window.location.origin + filePath}/>;
		}
		return <div><h1>Tab not found!</h1></div>; // TODO: Better error
	}

	return (
        <Cached cache={file} wrapper={children => <Frame title="File" sidebar search={{submission: submissionId}}>{children}</Frame>}>{
            file =>
                <Frame title={FileNameHelper.fromPath(file.name)} sidebar search={{course: file.references.courseID, submission: submissionId}}>
                    <Jumbotron>
                        <h1>{FileNameHelper.fromPath(file.name)}</h1>
                        <Cached cache={submission}>{
                            submission => <p>In project <Link to={submissionPath}>{submission.name}</Link> by <Link to={"/user/" + submission.user.ID}>{submission.user.name}</Link></p>
                        }</Cached>
                        {tab === "view" && <Button><a href={`/api/file/${fileId}/download`}>Download</a></Button>}
                    </Jumbotron>
                    {renderTabContents(file)}
                    <TabBar
                        tabs={[{
                            id: "view",
                            icon: fileViewer.icon,
                            text: fileViewer.name,
                            location: filePath + "/view"
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
                        active={tab}
                    />
                </Frame>
        }</Cached>
	);
}

export type FileCommentHandler = (comment: string, restricted: boolean, selection?: Selection | undefined) => Promise<boolean>;
export interface FileViewerProperties {
	file: File,
	sendComment: FileCommentHandler
}
export interface FileViewer {
	name: string,
	icon: IconType,
	viewer: (properties: FileViewerProperties) => JSX.Element,
	acceptsType: (type: string) => boolean,
	acceptsFile: (file: File) => boolean
}
const fileViewers = [FileViewerCode, FileViewerImage];

function getFileViewer(file: File) {
	return fileViewers.reduce((res, fileViewer) => {
		if (!res) {
			return fileViewer.acceptsFile(file) ? fileViewer : false;
		} else {
			return res;
		}
	}, false as false | (FileViewer));
}
export function canDisplayType(type: string) {
	return fileViewers.some(({acceptsType}) => acceptsType(type));
}
export function canDisplayFile(file: File) {
	return fileViewers.some(({acceptsFile}) => acceptsFile(file));
}