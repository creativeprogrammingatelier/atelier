import React, {useEffect, useState} from "react";
import {FiCode, FiFolder, FiMessageSquare, FiShare2} from "react-icons/all";

import {Frame} from "../frame/Frame";
import {TabBar} from "../general/TabBar";
import {CodeTab} from "./CodeTab";
import {CommentTab} from "./CommentTab";
import {ShareTab} from "./ShareTab";

import {File} from "../../../../models/database/File";
import {ProjectTab} from "./ProjectTab";
import {CommentThread} from "../../placeholdermodels";
import {FileResponse, OpenFileResponse} from "../../helpers/DatabaseResponseInterface";
import {Loading} from "../general/Loading";
import {ExtendedThread} from "../../../../models/database/Thread";
import AuthHelper from "../../../helpers/AuthHelper";
import { Fetch } from "../../../helpers/FetchHelper";

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

	const [title, setTitle] = useState("");

	const getFile = (fileId: string) => Fetch.fetchJson<File>(`/api/file/${fileId}`);

	const filePath = "/submission/" + submissionId + "/" + fileId;
    
    function renderTabContents(file: File) {
        // TODO: Take out the h1 from all these since it's always the same
        // then they don't need a reference to file anymore, so they don't
        // need to wait for it to be loaded
        if (activeTab === "code") {
            return <CodeTab file={file} submissionID={submissionId} />;
        } else if (activeTab === "comments") {
            return <CommentTab file={file} />;
        } else if (activeTab === "share") {
            return <ShareTab file={file} url={window.location.origin + filePath} />;
        }
        return <div><h1>Tab not found!</h1></div>;
    }

	return (
		<Frame title={title} user={{id: "1", name: "John Doe"}} sidebar search={filePath + "/search"}>
            <Loading<File> 
                loader={getFile}
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
	);
}

