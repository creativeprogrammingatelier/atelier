import React, {Fragment, useState} from "react";
import {Link, useHistory} from "react-router-dom";
import {Button, Jumbotron} from "react-bootstrap";
import {FiPlus, FiTrash, FiX} from "react-icons/all";

import {Submission} from "../../../../models/api/Submission";
import {ThreadState} from "../../../../models/enums/ThreadStateEnum";

import {deleteSubmission} from "../../helpers/api/APIHelper";
import {useSubmission, useFiles, useProjectComments, useRecentComments, useCourse, useCourseSubmissions, useCurrentUser} from "../../helpers/api/APIHooks";
import {TimeHelper} from "../../helpers/TimeHelper";

import {CommentCreator} from "../comment/CommentCreator";
import {CommentThread as CommentThreadComponent} from "../comment/CommentThread";
import {DataList} from "../data/DataList";
import {DirectoryViewer} from "../directory/DirectoryViewer";
import {FeedbackContent} from "../feedback/Feedback";
import {FeedbackError} from "../feedback/FeedbackError";
import {Frame} from "../frame/Frame";
import {Cached} from "../general/loading/Cached";
import {ButtonMultistate} from "../input/button/ButtonMultistate";
import {ButtonBar} from "../input/button/ButtonBar";

interface SubmissionOverviewProps {
    match: {
        params: {
            submissionId: string
        }
    }
}

function SubmissionDetails({submission}: { submission: Submission }) {
    const course = useCourse(submission.references.courseID);
    return (
        <Cached cache={course}>
            {course =>
                <p>
                    Uploaded by <Link to={"/user/" + submission.user.ID}>{submission.user.name}</Link>, for <Link
                    to={"/course/" + course.ID}>{course.name}</Link>
                    <br/>
                    <small
                        className="text-light">{TimeHelper.toDateTimeString(TimeHelper.fromString(submission.date))}</small>
                </p>
            }
        </Cached>
    );
}

export function SubmissionOverview({match: {params: {submissionId}}}: SubmissionOverviewProps) {
    const [creatingComment, setCreatingComment] = useState(false);
    const [error, setError] = useState(false as FeedbackContent);

    const submissionPath = "/submission/" + submissionId;

    const history = useHistory();
    const submission = useSubmission(submissionId);
    const files = useFiles(submissionId);
    const projectComments = useProjectComments(submissionId);
    const recentComments = useRecentComments(submissionId);
    const user = useCurrentUser();

    const handleCommentSend = async (comment: string, restricted: boolean) => {
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
    const handleDelete = (courseID: string, submissionID: string) => {
        deleteSubmission(submissionID).then(() => {
            useCourseSubmissions(courseID).refresh().then(() => {
                history.push(`/course/${courseID}`);
            });
        });
    };

    return (
        <Cached cache={submission} wrapper={children => <Frame title="Submission" sidebar search>{children}</Frame>}>
            {submission =>
                <Frame title={submission.name} sidebar
                       search={{course: submission.references.courseID, submission: submissionId}}>
                    <Jumbotron>
                        <h1>{submission.name}</h1>
                        <SubmissionDetails submission={submission}/>
                        <Button className="mb-2 mr-2"><Link to={submissionPath + "/share"}>Share</Link></Button>
                        <Button className="mb-2"><a
                            href={`/api/submission/${submissionId}/archive`}>Download</a></Button>
                    </Jumbotron>
                    <DataList header="Files">
                        <Cached cache={files}>
                            {files => <DirectoryViewer filePaths={files.map(file => ({
                                name: file.name,
                                type: file.type,
                                transport: submissionPath + "/" + file.ID + "/view"
                            }))}/>}
                        </Cached>
                    </DataList>
                    <DataList
                        header="Comments"
                        optional={{
                            icon: creatingComment ? FiX : FiPlus,
                            click: () => setCreatingComment(!creatingComment),
                            component: (
                                creatingComment &&
                                <CommentCreator placeholder="Write a comment" allowRestricted
                                                mentions={{courseID: submission.references.courseID}}
                                                sendHandler={handleCommentSend}/>
                            ) || <FeedbackError close={setError}>{error}</FeedbackError>
                        }}
                    >
                        <Cached cache={projectComments}>
                            {thread => <CommentThreadComponent key={thread.ID} thread={thread}/>}
                        </Cached>
                    </DataList>
                    <DataList header="Recent">
                        <Cached cache={recentComments}>
                            {thread => <CommentThreadComponent key={thread.ID} thread={thread}/>}
                        </Cached>
                    </DataList>
                    <Cached cache={user}>
                        {user => user.ID === submission.user.ID &&
                            <DataList header="Delete submission">
                                <FeedbackError>Deleting a submissions is permanent, and can not be undone.</FeedbackError>
                                <ButtonMultistate variant="danger" states={[
                                    <Fragment>Delete <FiTrash/></Fragment>,
                                    <Fragment>Confirm <FiTrash/></Fragment>
                                ]} finish={() => handleDelete(submission.references.courseID, submission.ID)}/>
                            </DataList>
                        }
                    </Cached>
                </Frame>
            }
        </Cached>
    );
}