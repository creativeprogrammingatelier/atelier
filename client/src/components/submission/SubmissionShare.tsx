import React from "react";
import {Jumbotron} from "react-bootstrap";

import {useSubmission} from "../../helpers/api/APIHooks";

import {Frame} from "../frame/Frame";
import {Cached} from "../general/loading/Cached";
import {Sharing} from "../share/Sharing";
import { Breadcrumbs, Crumb } from "../general/Breadcrumbs";

interface SubmissionShareProperties {
	match: {
		params: {
			submissionId: string
		}
	}
}
export function SubmissionShare({match: {params: {submissionId}}}: SubmissionShareProperties) {
	const submission = useSubmission(submissionId);
	const submissionPath = "/submission/" + submissionId;
	const submissionURL = window.location.origin + submissionPath;
	
	return <Cached
		cache={submission}
		wrapper={children => <Frame title="Submission" sidebar search={{submission: submissionId}}>{children}</Frame>}
	>
		{submission =>
			<Frame title={submission.name} sidebar
				search={{course: submission.references.courseID, submission: submissionId}}>
				<Jumbotron>
                    <Breadcrumbs>
                        <Crumb text={submission.references.courseName} link={`/course/${submission.references.courseID}`} />
                        <Crumb text={submission.user.name} link={`/course/${submission.references.courseID}/user/${submission.user.ID}`} />
                        <Crumb text={submission.name} link={submissionPath} />
                    </Breadcrumbs>
					<h1>Share</h1>
				</Jumbotron>
				<div className="m-3">
					<Sharing url={submissionURL}/>
				</div>
			</Frame>
		}
	</Cached>;
}