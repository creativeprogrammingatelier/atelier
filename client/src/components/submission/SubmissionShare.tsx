import React from 'react';
import {Frame} from '../frame/Frame';
import {Sharing} from "../general/Sharing";

interface SubmissionShareProperties {
	match: {
		params: {
			submissionId: string
		}
	}
}
export function SubmissionShare({match: {params: {submissionId}}}: SubmissionShareProperties) {
	const submissionPath = "/submission/"+submissionId;
	const submissionURL = window.location.origin + submissionPath;
	const projectName = "MyFirstProject";

	return <Frame title={projectName} user={{id:"1", name:"John Doe"}} sidebar>
		<h1>Share me!</h1>
		<Sharing url={submissionURL}/>
	</Frame>
}