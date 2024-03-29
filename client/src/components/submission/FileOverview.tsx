import React from "react";
import {Button, Jumbotron} from "react-bootstrap";
import {IconType} from "react-icons";
import {FiMessageSquare, FiShare2} from "react-icons/all";
import {map} from "rxjs/operators";
import {useObservableState, useObservable} from "observable-hooks";

import {File} from "../../../../models/api/File";
import {Selection} from "../../../../models/api/Snippet";

import {useSubmission, useFile} from "../../helpers/api/APIHooks";
import {CacheItem} from "../../helpers/api/Cache";

import {FileNameHelper} from "../../helpers/FileNameHelper";
import {FeedbackMessage} from "../feedback/Feedback";
import {ErrorBoundary} from "../general/ErrorBoundary";
import {Cached} from "../general/loading/Cached";
import {Frame} from "../frame/Frame";
import {TabBar} from "../tab/TabBar";
import {FileViewerCode} from "./fileviewers/CodeViewer";
import {FileViewerImage} from "./fileviewers/ImageViewer";
import {FileViewerUnsupported} from "./fileviewers/UnsupportedViewer";
import {CommentTab} from "./CommentTab";
import {ShareTab} from "./ShareTab";
import {ViewTab} from "./ViewTab";
import {Breadcrumbs, Crumb, PermissionsCrumb} from "../general/Breadcrumbs";
import {PermissionEnum} from "../../../../models/enums/PermissionEnum";

interface FileOverviewProperties {
    match: {
        params: {
            /** Submission ID within database */
            submissionId: string,
            /** Filed ID within file */
            fileId: string,
            /** Current tav opened. */
            tab: string
        }
    }
}
/**
 * Component that, given a file and opened tab, renders the appropriate information from the
 * database.
 */
export function FileOverview({match: {params: {submissionId, fileId, tab}}}: FileOverviewProperties) {
    const submission = useSubmission(submissionId);
    const file = useFile(submissionId, fileId);
    const fileViewerObservable = useObservable(() =>
        file.observable.pipe(
            map(item => {
                const file = (item as CacheItem<File>)?.value;
                return (file !== undefined && getFileViewer(file)) || FileViewerUnsupported;
            })
        )
    );
    const fileViewer = useObservableState(fileViewerObservable, FileViewerUnsupported);

    const submissionPath = "/submission/" + submissionId;
    const filePath = submissionPath + "/" + fileId;

    const renderTabContents = (file: File) => {
        if (tab === "view") {
            return <ViewTab file={file} viewer={fileViewer.viewer}/>;
        } else if (tab === "comments") {
            return <CommentTab file={file} submissionID={submissionId}/>;
        } else if (tab === "share") {
            return <ShareTab file={file} url={window.location.origin + filePath}/>;
        }
        return <div><h1>Tab not found!</h1></div>; // TODO: Better error
    };

    return <Cached
        cache={file}
        wrapper={children => <Frame title="File" sidebar search={{submission: submissionId}}>{children}</Frame>}
    >
        {file =>
            <Frame title={FileNameHelper.fromPath(file.name)} sidebar
                search={{course: file.references.courseID, submission: submissionId}}>
                <Jumbotron>
                    <Cached cache={submission}>
                        {submission =>
                            <Breadcrumbs>
                                <Crumb text={submission.references.courseName} link={`/course/${submission.references.courseID}`} />
                                <PermissionsCrumb text={submission.user.name} link={`/course/${submission.references.courseID}/user/${submission.user.ID}`}
                                    course={submission.references.courseID} single={PermissionEnum.viewAllUserProfiles} />
                                <Crumb text={submission.name} link={submissionPath} />
                            </Breadcrumbs>
                        }
                    </Cached>
                    <h1>{FileNameHelper.fromPath(file.name)}</h1>
                    {tab === "view" && <Button><a href={`/api/file/${fileId}/download`}>Download</a></Button>}
                </Jumbotron>
                <ErrorBoundary>
                    {renderTabContents(file)}
                </ErrorBoundary>
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
        }
    </Cached>;
}

export type FileCommentHandler = (comment: string, restricted: boolean, selection?: Selection | undefined) => Promise<FeedbackMessage>;

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
