import React, {useState} from "react";
import {Link} from "react-router-dom";
import {Button, Jumbotron} from "react-bootstrap";

import {Frame} from "../frame/Frame";
import {File} from "../../../../models/api/File";
import {Loading} from "../general/loading/Loading";
import {CommentThread} from "../../../../models/api/CommentThread";
import {CommentThread as CommentThreadComponent} from "../comment/CommentThread";
import {Submission} from "../../../../models/api/Submission";
import {DataList} from "../data/DataList";
import {Course} from "../../../../models/api/Course";
import {getSubmission, getCourse, getFiles, getProjectComments, getRecentComments, createSubmissionCommentThread} from "../../../helpers/APIHelper";
import {DirectoryViewer} from "../general/DirectoryViewer";
import {TimeHelper} from "../../../helpers/TimeHelper";
import {CommentCreator} from "../comment/CommentCreator";
import {FiPlus, FiX} from "react-icons/all";
import {threadState} from "../../../../models/enums/threadStateEnum";
import {JsonFetchError} from "../../../helpers/FetchHelper";

interface SubmissionOverviewProps {
	match: {
		params: {
			submissionId: string
		}
	}
}

export function SubmissionOverview({match: {params: {submissionId}}}: SubmissionOverviewProps) {
	const [creatingComment, setCreatingComment] = useState(false);
	const [createdComments, setCreatedComments] = useState([] as CommentThread[]);
	const submissionPath = "/submission/" + submissionId;

	const handleCommentSend = async(comment: string, restricted: boolean) => {
		try {
			const commentThread = await createSubmissionCommentThread(submissionId, {
				submissionID: submissionId,
				comment,
				visibility: restricted ? threadState.private : threadState.public
			});
			setCreatingComment(false);
			setCreatedComments(createdComments => [
				...createdComments,
				commentThread
			]);
			return true;
		} catch (error) {
			if (error instanceof JsonFetchError) {
				// TODO: handle error for the user
				console.log(error);
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
			submission => <Frame title={submission.name!} sidebar search={{course: submission.references.courseID}}>
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
						component={files => <DirectoryViewer filePaths={files.map(file => ({name: file.name, type: file.type, transport: submissionPath + "/" + file.ID + "/code"}))}/>}
					/>
				</DataList>
				<DataList
					header="Comments"
					optional={{
						icon: creatingComment ? FiX : FiPlus,
						click: () => setCreatingComment(!creatingComment),
						component: creatingComment && <CommentCreator placeholder="Write a comment" allowRestricted mentions={{courseID: submission.references.courseID}} sendHandler={handleCommentSend}/>
					}}
				>
					{/* This map over new comment threads would not be needed once auto update works */}
					{createdComments.map(thread => <CommentThreadComponent thread={thread}/>)}
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