import React, {useEffect, useState} from "react";
import {FiCode, FiFolder, FiMessageSquare, FiShare2} from "react-icons/all";

import {Frame} from "../frame/Frame";
import {TabBar} from "../general/TabBar";
import {CodeTab} from "./CodeTab";
import {CommentTab} from "./CommentTab";
import {ShareTab} from "./ShareTab";

import {File} from "../../../../models/File";
import {ProjectTab} from "./ProjectTab";
import {CommentThread} from "../../placeholdermodels";
import {FileResponse, OpenFileResponse} from "../../helpers/DatabaseResponseInterface";
import {Loading} from "../general/Loading";

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

	const [loading, setLoading] = useState(true);
	const [file, setFile] = useState({} as OpenFileResponse);
	const [commentThreads, setCommentThreads] = useState([] as CommentThread[]);
	const [title, setTitle] = useState("");

	const getFile = fetch(`/api/file/${fileId}`);
	const getCommentThreads = fetch(`/api/commentThreads/file/${fileId}`);
	Promise.all([getFile, getCommentThreads]).then(responses =>
		Promise.all(responses.map(response => response.json()))
	).then(data => {

		console.log(data);
		setLoading(false);
	}).catch((error : any) => console.log(error));

	/*useEffect(() => {
		fetch(`/api/file/${fileId}`)
			.then(response => response.json())
			.then(data => {
				setFile({
					fileID : data.fileID,
					submissionID : data.submissionID,
					pathname : data.pathname,
					type : data.type,
					body : data.body
				});
				setTitle(data.pathname);
				// TODO comment threads
				setLoading(false);
			});
	}, []);*/


	const filePath = "/submission/" + submissionId + "/" + fileId;

	/*const file = {
		id: fileId,
		name: "FileName1",
		body: "textasdfadsfasdf\nmadsfasdfasdfore text\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd",
		path: filePath,
		url: window.location.origin + filePath
	};*/

	// Display certain tab
	let activeTabElement = <div><h1>Tab not found!</h1></div>;
	if (activeTab === "code") {
		activeTabElement = <CodeTab file={file}/>;
	} else if (activeTab === "comments") {
		activeTabElement = <CommentTab file={file} threads={["1", "2"]}/>;
	} else if (activeTab === "share") {
		activeTabElement = <ShareTab file={file} url={window.location.origin + filePath}/>;
	}

	return (
		<Frame title={title} user={{id: "1", name: "John Doe"}} sidebar search={filePath + "/search"}>
			<div className="contentTab">
				{
					loading ?
						<Loading />
						:
						<div>
							{activeTabElement}
						</div>
				}
			</div>
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

