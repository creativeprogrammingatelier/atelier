import React, {useEffect, useState} from "react";
import {FiCode, FiFolder, FiMessageSquare, FiShare2} from "react-icons/all";

import {Frame} from "../frame/Frame";
import {TabBar} from "../general/TabBar";
import {CodeTab} from "./CodeTab";
import {CommentTab} from "./CommentTab";
import {ShareTab} from "./ShareTab";
import {File} from "../../../../models/database/File";
import {Loading} from "../general/loading/Loading";
import {FileNameHelper} from "../../helpers/FileNameHelper";
import { getFile, getFileContents } from "../../../helpers/APIHelper";

export interface FileProperties {
	id: string,
	name: string,
	body: string,
	path: string,
	url: string
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

	const filePath = "/submission/" + submissionId + "/" + fileId;
    
    function renderTabContents([file, body] : [File, string]) {
        if (activeTab === "code") {
            return <CodeTab body={body} file={file} submissionID={submissionId} />;
        } else if (activeTab === "comments") {
            return <CommentTab body={body} file={file} />;
        } else if (activeTab === "share") {
            return <ShareTab file={file} url={window.location.origin + filePath} />;
        }
        return <div><h1>Tab not found!</h1></div>;
    }

	return (
		<Loading<File>
			loader={getFile}
			params={[fileId]}
			component={
				file => <Frame title={FileNameHelper.fromPath(file.pathname!)} sidebar search={filePath + "/search"}>
					<Loading<[File, string]>
						loader={(fileId : string) => Promise.all([getFile(fileId), getFileContents(fileId)])}
						params={[fileId]}
						component={renderTabContents} />
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
			wrapper={children => <Frame title="File" sidebar search={filePath + "/search"}>{children}</Frame>}
		/>
	);
}

