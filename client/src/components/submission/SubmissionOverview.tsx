import React, {Fragment, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {Button, Jumbotron} from 'react-bootstrap';
import {FiPlus, FiTrash, FiX} from 'react-icons/all';

import {ThreadState} from '../../../../models/enums/ThreadStateEnum';

import {useSubmission, useFiles, useProjectComments, useRecentComments, useCurrentUser} from '../../helpers/api/APIHooks';
import {TimeHelper} from '../../helpers/TimeHelper';

import {CommentCreator} from '../comment/CommentCreator';
import {CommentThread as CommentThreadComponent} from '../comment/CommentThread';
import {DataList} from '../data/DataList';
import {DirectoryViewer} from '../directory/DirectoryViewer';
import {FeedbackContent} from '../feedback/Feedback';
import {FeedbackError} from '../feedback/FeedbackError';
import {Frame} from '../frame/Frame';
import {Cached} from '../general/loading/Cached';
import {ButtonMultistate} from '../input/button/ButtonMultistate';
import {Breadcrumbs, Crumb, PermissionsCrumb} from '../general/Breadcrumbs';
import {PermissionEnum} from '../../../../models/enums/PermissionEnum';

interface SubmissionOverviewProperties {
	match: {
		params: {
			/** Submission ID within database */
			submissionId: string
		}
	}
}
/**
 * Component for viewing a submission overview, given a submission ID.
 */
export function SubmissionOverview({match: {params: {submissionId}}}: SubmissionOverviewProperties) {
  const [creatingComment, setCreatingComment] = useState(false);
  const [error, setError] = useState(false as FeedbackContent);
  const history = useHistory();
  const submission = useSubmission(submissionId);
  const files = useFiles(submissionId);
  const projectComments = useProjectComments(submissionId);
  const recentComments = useRecentComments(submissionId);
  const user = useCurrentUser();

  const submissionPath = '/submission/' + submissionId;

  /**
	 * Handles addition of a new comment.
	 */
  const handleCommentSend = async (comment: string, restricted: boolean) => {
    const commentBody = comment.trim();
    if (commentBody === '') {
      // Should the user get an error message when sending an empty comment? or would they understand?
      return Promise.resolve(false);
    }
    const createdComment = await projectComments.create({
      submissionID: submissionId,
      comment: commentBody,
      visibility: restricted ? ThreadState.private : ThreadState.public,
    })
        .then(() => true)
        .catch((error: Error) => {
          setError(`Failed to create comment: ${error.message}`);
          return false;
        });
    setCreatingComment(false);
    return createdComment;
  };
  /**
	 * Handles the deletion of the submission for a given courseID
	 *
	 * @param courseID Course ID for which submission will be deleted.
	 */
  const handleDelete = (courseID: string) => {
    submission.delete().then(() => history.push(`/course/${courseID}`));
  };

  return <Cached
    cache={submission}
    wrapper={(children) => <Frame title="Submission" sidebar search={{submission: submissionId}}>{children}</Frame>}
  >
    {(submission) =>
      <Frame title={submission.name} sidebar search={{course: submission.references.courseID, submission: submissionId}}>
        <Jumbotron>
          <Breadcrumbs>
            <Crumb text={submission.references.courseName} link={`/course/${submission.references.courseID}`} />
            <PermissionsCrumb text={submission.user.name} link={`/course/${submission.references.courseID}/user/${submission.user.ID}`}
              course={submission.references.courseID} single={PermissionEnum.viewAllUserProfiles} />
          </Breadcrumbs>
          <h1>{submission.name}</h1>
          <p><small className="text-light">{TimeHelper.toDateTimeString(TimeHelper.fromString(submission.date))}</small></p>
          <Button className="mb-2 mr-2"><Link to={submissionPath + '/share'}>Share</Link></Button>
          <Button className="mb-2"><a href={`/api/submission/${submissionId}/archive`}>Download</a></Button>
        </Jumbotron>
        <DataList header="Files">
          <Cached cache={files}>
            {(files) =>
              <DirectoryViewer filePaths={files.map((file) =>
                ({
                  name: file.name,
                  type: file.type,
                  transport: submissionPath + '/' + file.ID + '/view',
                }))}
              />
            }
          </Cached>
        </DataList>
        <DataList
          header="Comments"
          optional={{
            icon: creatingComment ? FiX : FiPlus,
            click: () => setCreatingComment(!creatingComment),
            component: (
              creatingComment &&
							<CommentCreator
							  placeholder="Write a comment"
							  allowRestricted
							  mentions={{courseID: submission.references.courseID}}
							  sendHandler={handleCommentSend}
							/>
            ) || <FeedbackError close={setError}>{error}</FeedbackError>,
          }}
        >
          <Cached cache={projectComments}>
            {(thread) => <CommentThreadComponent key={thread.ID} thread={thread}/>}
          </Cached>
        </DataList>
        <DataList header="Recent">
          <Cached cache={recentComments}>
            {(thread) => <CommentThreadComponent key={thread.ID} thread={thread}/>}
          </Cached>
        </DataList>
        <Cached cache={user}>
          {(user) => user.ID === submission.user.ID &&
						<DataList header="Delete submission">
						  <FeedbackError>Deleting a submissions is permanent, and can not be undone.</FeedbackError>
						  <ButtonMultistate
						    variant="danger"
						    states={[
						      <Fragment>Delete <FiTrash/></Fragment>,
						      <Fragment>Confirm <FiTrash/></Fragment>,
						    ]}
						    finish={() => handleDelete(submission.references.courseID)}/>
						</DataList>
          }
        </Cached>
      </Frame>
    }
  </Cached>;
}
