import React, {useEffect, useState} from "react";
import {FiCode, FiMessageSquare, FiShare2} from "react-icons/all";

import {Frame} from "../frame/Frame";
import {TabBar} from "../general/TabBar";
import {CodeTab, codeTabCanHandle} from "./fileviewers/CodeTab";
import {CommentTab} from "./CommentTab";
import {ShareTab} from "./ShareTab";
import {File} from "../../../../models/api/File";
import {Loading} from "../general/loading/Loading";
import {FileNameHelper} from "../../helpers/FileNameHelper";
import {getFile, getSubmission} from "../../../helpers/APIHelper";
import {Button, Jumbotron} from "react-bootstrap";
import {Link} from "react-router-dom";
import {Submission} from "../../../../models/api/Submission";
import {ImageTab, imageTabCanHandle} from "./fileviewers/ImageTab";

export interface FileProperties {
	file: File
}

const fileHandlers = [
    { tab: CodeTab, canHandle: codeTabCanHandle },
    { tab: ImageTab, canHandle: imageTabCanHandle }
];

function getFileTab(file: File) {
    return fileHandlers.reduce((res, { tab, canHandle }) => {
        if (!res) {
            return canHandle(file) ? tab : false;
        } else {
            return res;
        }
    }, false as false | ((props: FileProperties) => JSX.Element));
}

export function canDisplayFile(file: File) {
    return fileHandlers.some(({ canHandle }) => canHandle(file));
}

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
	const [activeTab, setActiveTab] = useState(tab); // Get tab from match object
	useEffect(() => {
		setActiveTab(tab);
	}, [tab]);

	const submissionPath = "/submission/" + submissionId;
	const filePath = submissionPath + "/" + fileId;

	function renderTabContents(file: File) {
		if (activeTab === "code") {
            // This is a React component, which is named with PascalCase
            // tslint:disable-next-line: variable-name
            const FileTab = getFileTab(file);
            if (FileTab) {
                return <FileTab file={file} />;
            } else {
                return (
                    <div className="contentTab">
                        <div className="m-3 mb-6">
                            <p>Displaying files of type <b>{file.type}</b> is not supported.</p>
                        </div>
                    </div>
                );
            }
		} else if (activeTab === "comments") {
			return <CommentTab file={file} submissionID={submissionId}/>;
		} else if (activeTab === "share") {
			return <ShareTab file={file} url={window.location.origin + filePath}/>;
		}
		return <div><h1>Tab not found!</h1></div>;
	}

	return (
		<Loading<File>
			loader={getFile}
			params={[fileId]}
			component={
				file => <Frame title={FileNameHelper.fromPath(file.name)} sidebar search={{course: file.references.courseID}}>
					<Jumbotron>
						<h1>{FileNameHelper.fromPath(file.name)}</h1>
						<Loading<Submission>
							loader={getSubmission}
							params={[submissionId]}
							component={submission => <p>In project <Link to={submissionPath}>{submission.name}</Link> by <Link to={"/user/" + submission.user.ID}>{submission.user.name}</Link></p>}
						/>
						{activeTab === "code" && <Button><a href={`/api/file/${fileId}/download`}>Download</a></Button>}
					</Jumbotron>
					<Loading<File>
						loader={getFile}
						params={[fileId]}
						component={renderTabContents}
					/>
					<TabBar
						tabs={[{
							id: "code",
							icon: <FiCode size={28} color="#FFFFFF"/>,
							text: "Code",
							location: filePath + "/code"
						}, {
							id: "comments",
							icon: <FiMessageSquare size={28} color="#FFFFFF"/>,
							text: "Comments",
							location: filePath + "/comments"
						}, {
							id: "share",
							icon: <FiShare2 size={28} color="#FFFFFF"/>,
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

