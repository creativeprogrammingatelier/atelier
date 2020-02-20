import React, {useEffect, useState} from 'react';
import {FiCode, FiFolder, FiMessageSquare, FiShare2} from 'react-icons/all';

import {Frame} from '../frame/Frame';
import {TabBar} from '../general/TabBar';
import {CodeTab} from './CodeTab';
import {CommentTab} from './CommentTab';
import {ShareTab} from './ShareTab';
import {ProjectTab} from './ProjectTab';

interface FileOverviewProperties {
	match: {
		params: {
			submissionId: string,
			fileId: string,
			tab: string
		}
	}
}

export function FileOverview({match:{params:{submissionId, fileId, tab}}}: FileOverviewProperties) {
	const [activeTab, setActiveTab] = useState(tab); // Get tab from match object

	useEffect(() => {
		setActiveTab(tab);
	}, [tab]);

	const filePath = "/submission/"+submissionId+"/"+fileId;
	const fileURL = window.location.origin + filePath;
	const fileName = "FileName1";
	const projectName = "MyFirstProject";

	// Display certain tab
	let activeTabElement = <div><h1>Tab not found!</h1></div>;
	if (activeTab === "code") {
		activeTabElement = <CodeTab fileName={fileName}/>
	} else if (activeTab === "comments") {
		activeTabElement = <CommentTab fileName={fileName} threads={["1", "2"]}/>
	} else if (activeTab === "share") {
		activeTabElement = <ShareTab fileName={fileName} url={fileURL}/>
	}

	return (
		<Frame title={projectName} user={{id:"1", name:"John Doe"}} sidebar search={filePath+"/search"}>
			<div className="contentTab">
				{activeTabElement}
			</div>
			<TabBar
				tabs={[{
					id: "code",
					icon: <FiCode size={28} color="#FFFFFF"/>,
					text: "Code",
					location: filePath+"/code"
				}, {
					id: "comments",
					icon: <FiMessageSquare size={28} color="#FFFFFF"/>,
					text: "Comments",
					location: filePath+"/comments"
				}, {
					id: "share",
					icon: <FiShare2 size={28} color="#FFFFFF"/>,
					text: "Share",
					location: filePath+"/share"
				}]}
				active={activeTab}
			/>
		</Frame>
	)
}

