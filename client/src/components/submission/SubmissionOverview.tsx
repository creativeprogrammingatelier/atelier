import React, {useState} from 'react';

import {CodeTab} from './CodeTab';
import {CommentTab} from './CommentTab';
import {ShareTab} from './ShareTab';
import {TabBar} from '../general/TabBar';
import {ProjectTab} from "./ProjectTab";
import {Frame} from '../frame/Frame';
import {FiCode, FiFolder, FiMessageSquare, FiShare2} from 'react-icons/all';

interface SubmissionOverviewProps {
	match: {
		params: {
			submissionId: string,
			tab: string,
			fileId: string
		}
	}
}

function getParameter(token: string | undefined) {
	if (token === undefined || token === "") {
		return "project";
	}
	return token.toLowerCase();
}

export function SubmissionOverview({match} : SubmissionOverviewProps) {
	console.log(match);
	console.log(window.location);
	const [tab, setTab] = useState(getParameter(match.params.tab)); // Get tab from match object
	const [file, setFile] = useState(getParameter(match.params.fileId)); // Keep track of code being viewed

	function changeFile(file : string) {
		setFile(file);
		setTab("code");
	}

	const submissionId = getParameter(match.params.submissionId);
	const submissionPath = "/submission/"+submissionId;
	const submissionURL = window.location.origin + submissionPath;

	// Display certain tab
	let currentTab = <div><h1>Tab not found!</h1></div>;
	if (tab === "code") {
		currentTab =  <CodeTab fileName={file}/>
	} else if (tab === "comments") {
		currentTab =  <CommentTab />
	} else if (tab === "share") {
		currentTab = <ShareTab url={submissionURL}/>
	} else if (tab === "project") {
		currentTab = <ProjectTab setFile = {changeFile}/>
	}

	return (
		<Frame title="Submission" user={{id:"1", name:"John Doe"}} sidebar search={+submissionPath+"/search"}>
			<TabBar
				tabs={[{
					id: "project",
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
				active={tab}
			/>
			{currentTab}
		</Frame>
	)
}

