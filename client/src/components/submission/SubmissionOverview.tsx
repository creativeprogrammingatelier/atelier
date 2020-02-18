import React, {useState} from 'react';

import {CodeTab} from './CodeTab';
import {CommentTab} from './CommentTab';
import {ShareTab} from './ShareTab';
import {TabBar} from './TabBar';
import {ProjectTab} from "./ProjectTab";
import {Frame} from '../frame/Frame';
import {FiCode, FiFolder, FiMessageSquare, FiShare2} from 'react-icons/all';

interface SubmissionOverviewProps {
	match: any,
	history: any
}

function getTab(a: string | undefined) {
	console.log("Finding what tab we're rendering");
	console.log(a);
	if (a == undefined || a == "") return 'project';
	return a.toLowerCase();
}

export function SubmissionOverview({match, history} : SubmissionOverviewProps) {
	// Get tab from match object
	const [tab, setTab] = useState(getTab(match.params['tab']));

	// Keep track of code being viewed
	const [file, setFile] = useState(undefined as unknown as string);

	// Handle events to the tab buttons here
	function handleTabChange(event : any) {
		const {value} = event.target;

		const tab = getTab(value);
		setTab(tab);

		history.push(`/submission/1/${value}`);
	}

	function changeFile(file : string) {
		setFile(file);
		setTab('code');
	}

	// Display certain tab
	let currentTab = <div><h1>Tab not found!</h1></div>;
	if (tab == 'code') {
		currentTab =  <CodeTab fileName={file}/>
	} else if (tab == 'comments') {
		currentTab =  <CommentTab />
	} else if (tab == 'share') {
		currentTab = <ShareTab />
	} else if (tab == 'project') {
		currentTab = <ProjectTab setFile = {changeFile}/>
	}

	const submissionId = "1";
	const submissionPath = "/submission/"+submissionId;

	console.log("Rendering a submission, tab: "+tab);

	return (
		<Frame title="Submission" user={{id:"1", name:"John Doe"}} sidebar search={submissionPath+"/search"}>
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
			<hr/>
			{currentTab}
		</Frame>
	)
}

