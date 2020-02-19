import React, {useEffect, useState} from 'react';
import {FiCode, FiFolder, FiMessageSquare, FiShare2} from 'react-icons/all';

import {Frame} from '../frame/Frame';
import {TabBar} from '../general/TabBar';
import {CodeTab} from './CodeTab';
import {CommentTab} from './CommentTab';
import {ShareTab} from './ShareTab';
import {ProjectTab} from './ProjectTab';

interface SubmissionOverviewProps {
	match: {
		params: {
			submissionId: string,
			tab: string,
			fileId: string
		}
	}
}

export function SubmissionOverview({match:{params:{submissionId, tab, fileId}}} : SubmissionOverviewProps) {
	const [activeTab, setActiveTab] = useState(tab); // Get tab from match object
	const [file, setFile] = useState(fileId); // Keep track of code being viewed

	useEffect(() => {
		setActiveTab(tab);
	}, [tab]);
	function changeFile(file : string) {
		setFile(file);
		setActiveTab("code");
	}

	const submissionPath = "/submission/"+submissionId;
	const submissionURL = window.location.origin + submissionPath;

	// Display certain tab
	let activeTabElement = <div><h1>Tab not found!</h1></div>;
	if (activeTab === "code") {
		activeTabElement =  <CodeTab fileName={file}/>
	} else if (activeTab === "comments") {
		activeTabElement =  <CommentTab />
	} else if (activeTab === "share") {
		activeTabElement = <ShareTab url={submissionURL}/>
	} else if (activeTab === undefined) {
		activeTabElement = <ProjectTab setFile = {changeFile}/>
	}

	return (
		<Frame title="Submission" user={{id:"1", name:"John Doe"}} sidebar search={+submissionPath+"/search"}>
			<TabBar
				tabs={[{
					id: undefined,
					icon: <FiFolder size={28} color="#FFFFFF"/>,
					text: "Files",
					location: submissionPath
				}, {
					id: "code",
					icon: <FiCode size={28} color="#FFFFFF"/>,
					text: "Code",
					location: submissionPath+"/code"
				}, {
					id: "comments",
					icon: <FiMessageSquare size={28} color="#FFFFFF"/>,
					text: "Comments",
					location: submissionPath+"/comments"
				}, {
					id: "share",
					icon: <FiShare2 size={28} color="#FFFFFF"/>,
					text: "Share",
					location: submissionPath+"/share"
				}]}
				active={activeTab}
			/>
			{activeTabElement}
		</Frame>
	)
}

