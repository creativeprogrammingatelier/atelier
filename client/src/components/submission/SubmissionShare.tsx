import React from 'react';
import {Frame} from '../frame/Frame';
import {Sharing} from "../general/Sharing";
import {Jumbotron} from "react-bootstrap";
import {Link} from "react-router-dom";

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

	return <Frame title={projectName} sidebar>
		<Jumbotron>
			<h1>Share me!</h1>
			<p>Back to submission <Link to={submissionPath}>MyFirstSubmission</Link></p>
		</Jumbotron>
		<div className="m-3">
			<Sharing url={submissionURL}/>
		</div>
	</Frame>
}