import React from "react";
import {Jumbotron} from "react-bootstrap";

import {useSubmission} from "../../helpers/api/APIHooks";

import {Frame} from "../frame/Frame";
import {Cached} from "../general/loading/Cached";
import {Sharing} from "../share/Sharing";
import { Breadcrumbs, Crumb, PermissionsCrumb } from "../general/Breadcrumbs";
import { PermissionEnum } from "../../../../models/enums/PermissionEnum";

interface SubmissionShareProperties {
	match: {
		/** Params of submission share */
		params: {
			/** Submission ID within database */
			submissionId: string
		}
	}
}
/**
 * Component for sharing submissions. Submissions are retrieved from the cache and 
 * BreadCrumbs are created of the given permission. The submission URL is then extracted and 
 * added to a sharing component.  
 */
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
                        <PermissionsCrumb text={submission.user.name} link={`/course/${submission.references.courseID}/user/${submission.user.ID}`} 
                            course={submission.references.courseID} single={PermissionEnum.viewAllUserProfiles} />
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