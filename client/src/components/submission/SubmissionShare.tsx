import React from 'react';
import {Link} from "react-router-dom";
import {Jumbotron} from "react-bootstrap";

import {useSubmission} from "../../helpers/api/APIHooks";

import {Frame} from '../frame/Frame';
import {Cached} from "../general/loading/Cached";
import {Sharing} from "../share/Sharing";

interface SubmissionShareProperties {
	match: {
		params: {
			submissionId: string
		}
	}
}
export function SubmissionShare({match: {params: {submissionId}}}: SubmissionShareProperties) {
	const submission = useSubmission(submissionId);
	const submissionPath = "/submission/"+submissionId;
	const submissionURL = window.location.origin + submissionPath;

	return <Cached cache={submission} wrapper={children => <Frame title="Submission" sidebar search={{submission: submissionId}}>{children}</Frame>}>
		{submission =>
			<Frame title={submission.name} sidebar search={{course: submission.references.courseID, submission: submissionId}}>
				<Jumbotron>
					<h1>Share Me!</h1>
					<p>Back to <Link to={submissionPath}>{submission.name}</Link></p>
				</Jumbotron>
				<div className="m-3">
					<Sharing url={submissionURL}/>
				</div>
			</Frame>
		}
	</Cached>;
}