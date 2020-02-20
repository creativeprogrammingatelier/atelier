import React, {useEffect, useState} from 'react';
import {FiCode, FiFolder, FiMessageSquare, FiShare2} from 'react-icons/all';

import {Frame} from '../frame/Frame';
import {TabBar} from '../general/TabBar';
import {CodeTab} from './CodeTab';
import {CommentTab} from './CommentTab';
import {ShareTab} from './ShareTab';
import {ProjectTab} from './ProjectTab';
import {Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {Header} from '../frame/Header';
import {DataList} from '../general/DataList';

interface SubmissionOverviewProps {
	match: {
		params: {
			submissionId: string
		}
	}
}

export function SubmissionOverview({match:{params:{submissionId}}} : SubmissionOverviewProps) {

	const submissionPath = "/submission/"+submissionId;
	const submissionURL = window.location.origin + submissionPath;

	return (
		<Frame title="Submission" user={{id:"1", name:"John Doe"}} sidebar search={+submissionPath+"/search"}>
			<h1>A Project</h1>
			<p>Submitted by John Doe</p>
			<p>Just now</p>
			<Button><Link to={submissionPath+"/share"}>Share</Link></Button>
			<DataList header="Files" list={[
				{
					title: "FileName1",
					text: "File preview?",
					time: new Date()
				}, {
					title: "FileName2",
					text: "File preview?",
					time: new Date()
				}
			]}/>
			<DataList header="Comments" list={[
				{
					title: "John Doe",
					text: "It broke",
					time: new Date()
				}, {
					title: "Jane Doe",
					text: "Yep, still broke",
					time: new Date()
				}, {
					title: "Mary Doe",
					text: "No? It fixed itself?",
					time: new Date()
				}
			]}/>
			<DataList header="Recent" list={[
				{
					title: "John Doe",
					text: "FileName1: Dont use underscores",
					time: new Date()
				}
			]}/>
		</Frame>
	)
}

