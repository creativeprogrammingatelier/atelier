import React, {useState} from "react";
import {Link} from "react-router-dom";
import {Button, Jumbotron} from "react-bootstrap";
import {FiPlus, FiX} from "react-icons/all";

import {Course} from "../../../../models/api/Course";
import {CommentThread} from "../../../../models/api/CommentThread";
import {File} from "../../../../models/api/File";
import {Submission} from "../../../../models/api/Submission";
import {ThreadState} from "../../../../models/enums/threadStateEnum";

import {getSubmission, getCourse, getFiles, getProjectComments, getRecentComments, createSubmissionCommentThread} from "../../../helpers/APIHelper";
import {JsonFetchError} from "../../../helpers/FetchHelper";
import {TimeHelper} from "../../../helpers/TimeHelper";

import {Frame} from "../frame/Frame";
import {Loading} from "../general/loading/Loading";
import {DirectoryViewer} from "../directory/DirectoryViewer";
import {CommentThread as CommentThreadComponent} from "../comment/CommentThread";
import {CommentCreator} from "../comment/CommentCreator";
import {DataList} from "../data/DataList";
import {FeedbackContent} from "../feedback/Feedback";
import {FeedbackError} from "../feedback/FeedbackError";

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

	const handleCommentSend = async(comment: string, restricted: boolean) => {
		try {
			await createSubmissionCommentThread(submissionId, {
				submissionID: submissionId,
				comment,
				visibility: restricted ? ThreadState.private : ThreadState.public
			});
			setCreatingComment(false);
			return true;
		} catch (error) {
			if (error instanceof JsonFetchError) {
				setError(`Could not create comment: ${error}`);
			} else {
				throw error;
			}
		}
		return false;
	};

	return <Loading<Submission>
		loader={getSubmission}
		params={[submissionId]}
		component={
			submission => <Frame title={submission.name!} sidebar search={{course: submission.references.courseID, submission: submissionId}}>
				<Jumbotron>
					<h1>{submission.name}</h1>
					<Loading<Course>
						loader={getCourse}
						params={[submission.references.courseID]}
						component={course =>
							<p>
								Uploaded by <Link to={"/user/" + submission.user.ID}>{submission.user.name}</Link>, for <Link to={"/course/" + course.ID}>{course.name}</Link>
								<br/>
								<small className="text-light">{TimeHelper.toDateTimeString(TimeHelper.fromString(submission.date))}</small>
							</p>
						}
					/>
					<Button className="mb-2 mr-2"><Link to={submissionPath + "/share"}>Share</Link></Button>
                    <Button className="mb-2"><a href={`/api/submission/${submissionId}/archive`}>Download</a></Button>
				</Jumbotron>
				<DataList header="Files">
					<Loading<File[]>
						loader={getFiles}
						params={[submissionId]}
						component={files => <DirectoryViewer filePaths={files.map(file => ({name: file.name, type: file.type, transport: submissionPath + "/" + file.ID + "/view"}))}/>}
					/>
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
					<Loading<CommentThread[]>
						loader={getProjectComments}
						params={[submissionId]}
						component={threads => threads.map(thread => <CommentThreadComponent thread={thread}/>)}
					/>
				</DataList>
				<DataList header="Recent">
					<Loading<CommentThread[]>
						loader={getRecentComments}
						params={[submissionId]}
						component={(threads : CommentThread[]) => threads.map(thread => <CommentThreadComponent thread={thread}/>)}
					/>
				</DataList>
			</Frame>
		}
		wrapper={children => <Frame title="Submission" sidebar search>{children}</Frame>}
	/>;
}