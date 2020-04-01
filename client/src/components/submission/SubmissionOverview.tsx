import React, {useState} from "react";
import {Link} from "react-router-dom";
import {Button, Jumbotron} from "react-bootstrap";
import {FiPlus, FiX} from "react-icons/all";

import {ThreadState} from "../../../../models/enums/threadStateEnum";

import {useSubmission, useFiles, useProjectComments, useRecentComments, useCourse} from "../../helpers/api/APIHooks";
import {TimeHelper} from "../../../helpers/TimeHelper";

import {Frame} from "../frame/Frame";
import {DirectoryViewer} from "../directory/DirectoryViewer";
import {CommentThread as CommentThreadComponent} from "../comment/CommentThread";
import {CommentCreator} from "../comment/CommentCreator";
import {DataList} from "../data/DataList";
import {FeedbackContent} from "../feedback/Feedback";
import {FeedbackError} from "../feedback/FeedbackError";
import {Cached} from "../general/loading/Cached";

interface SubmissionOverviewProps {
	match: {
		params: {
			submissionId: string
		}
	}
}

export function SubmissionOverview({match: {params: {submissionId}}}: SubmissionOverviewProps) {
	const [creatingComment, setCreatingComment] = useState(false);
	const [error, setError] = useState(false as FeedbackContent);

	const submissionPath = "/submission/" + submissionId;

	const submission = useSubmission(submissionId);
	const files = useFiles(submissionId);
	const projectComments = useProjectComments(submissionId);
	const recentComments = useRecentComments(submissionId);

	const handleCommentSend = async(comment: string, restricted: boolean) => {
		const createdComment = await projectComments.create({
			submissionID: submissionId,
			comment,
			visibility: restricted ? ThreadState.private : ThreadState.public
		}).catch(status => {
			setError(`Failed to create comment`);
			return status;
		});
		setCreatingComment(false);
		return createdComment;
	};

	return (
		<Cached cache={submission} wrapper={children => <Frame title="Submission" sidebar search>{children}</Frame>}>
			{submission =>
				<Frame title={submission.name} sidebar search={{course: submission.references.courseID, submission: submissionId}}>
					<Jumbotron>
						<h1>{submission.name}</h1>
						<Cached cache={useCourse(submission.references.courseID)}>
							{course =>
								<p>
									Uploaded by <Link to={"/user/" + submission.user.ID}>{submission.user.name}</Link>, for <Link to={"/course/" + course.ID}>{course.name}</Link>
									<br/>
									<small className="text-light">{TimeHelper.toDateTimeString(TimeHelper.fromString(submission.date))}</small>
								</p>
							}
						</Cached>
						<Button className="mb-2 mr-2"><Link to={submissionPath + "/share"}>Share</Link></Button>
						<Button className="mb-2"><a href={`/api/submission/${submissionId}/archive`}>Download</a></Button>
					</Jumbotron>
					<DataList header="Files">
						<Cached cache={files} wrapper={children => <DataList header="Files" children={children}/>}>
							{files => <DirectoryViewer filePaths={files.map(file => ({name: file.name, type: file.type, transport: submissionPath + "/" + file.ID + "/view"}))}/>}
						</Cached>
					</DataList>
					<DataList
						header="Comments"
						optional={{
							icon: creatingComment ? FiX : FiPlus,
							click: () => setCreatingComment(!creatingComment),
							component: (
								creatingComment &&
								<CommentCreator placeholder="Write a comment" allowRestricted mentions={{courseID: submission.references.courseID}} sendHandler={handleCommentSend}/>
							) || <FeedbackError close={setError}>{error}</FeedbackError>
						}}
					>
						<Cached cache={projectComments}>
							{thread => <CommentThreadComponent thread={thread}/>}
						</Cached>
					</DataList>
					<DataList header="Recent">
						<Cached cache={recentComments}>
							{thread => <CommentThreadComponent thread={thread}/>}
						</Cached>
					</DataList>
				</Frame>
			}
		</Cached>
	);
}