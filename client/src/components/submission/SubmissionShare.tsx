import React from 'react';
import {Frame} from '../frame/Frame';
import {ShareTab} from './ShareTab';

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

	return <Frame title={submissionId} user={{id:"1", name:"John Doe"}} sidebar={true}>
		<ShareTab fileName="Share me" url={submissionURL}/>
	</Frame>
}