import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {Button, Jumbotron} from "react-bootstrap";

import {Frame} from "../frame/Frame";
import {CommentThread as CommentThreadComponent} from "../comment/CommentThread";
import {DataList} from "../data/DataList";
import {DirectoryViewer} from "../general/DirectoryViewer";
import {TimeHelper} from "../../../helpers/TimeHelper";
import {CommentCreator} from "../comment/CommentCreator";
import {FiPlus, FiX} from "react-icons/all";
import {threadState} from "../../../../models/enums/threadStateEnum";
import { useSubmission, useCourse, useProjectComments, useRecentComments, useFiles } from "../../helpers/api/APIHooks";
import { CachedItem } from "../general/loading/CachedItem";
import { CachedList } from "../general/loading/CachedList";

interface SubmissionOverviewProps {
	match: {
		params: {
			submissionId: string
		}
	}
}

export function SubmissionOverview({match: {params: {submissionId}}}: SubmissionOverviewProps) {
    const {submission} = useSubmission(submissionId);
    const {course} = useCourse(submission.item.references.courseID);
    const {files, refreshFiles} = useFiles(submissionId);
    const {projectComments, refreshProjectComments, createProjectComment} = useProjectComments(submissionId);
    const {recentComments, refreshRecentComments} = useRecentComments(submissionId);
    
	const [creatingComment, setCreatingComment] = useState(false);
	const submissionPath = "/submission/" + submissionId;

	const handleCommentSend = async(comment: string, restricted: boolean) => {
        const res = await createProjectComment({
            submissionID: submissionId,
            comment,
            visibility: restricted ? threadState.private : threadState.public
        });
        setCreatingComment(false);
        return res;
    };
    
    useEffect(() => {
        if (files.lastRefresh === 0) refreshFiles();
    }, []);

	return <CachedItem item={submission} wrapper={children => <Frame title="Submission" sidebar search children={children} />}>{
			submission => <Frame title={submission.name} sidebar search={{course: submission.references.courseID, submission: submissionId}}>
				<Jumbotron>
					<h1>{submission.name}</h1>
					<CachedItem item={course}>{course =>
                        <p>
                            Uploaded by <Link to={"/user/" + submission.user.ID}>{submission.user.name}</Link>, for <Link to={"/course/" + course.ID}>{course.name}</Link>
                            <br/>
                            <small className="text-light">{TimeHelper.toDateTimeString(TimeHelper.fromString(submission.date))}</small>
                        </p>
                    }</CachedItem>
					<Button className="mb-2 mr-2"><Link to={submissionPath + "/share"}>Share</Link></Button>
                    <Button className="mb-2"><a href={`/api/submission/${submissionId}/archive`}>Download</a></Button>
				</Jumbotron>
                <DataList header="Files">
                    <DirectoryViewer filePaths={files.items.map(file => ({name: file.item.name, type: file.item.type, transport: submissionPath + "/" + file.item.ID + "/view"}))}/>
                </DataList>
				<DataList
					header="Comments"
					optional={{
						icon: creatingComment ? FiX : FiPlus,
						click: () => setCreatingComment(!creatingComment),
						component: creatingComment && <CommentCreator placeholder="Write a comment" allowRestricted mentions={{courseID: submission.references.courseID}} sendHandler={handleCommentSend}/>
					}} >
					<CachedList collection={projectComments} refresh={refreshProjectComments}>{
                        thread => <CommentThreadComponent thread={thread.item} />   
                    }</CachedList>
				</DataList>
				<CachedList header="Recent" collection={recentComments} refresh={refreshRecentComments}>{
                    thread => <CommentThreadComponent thread={thread.item} />   
                }</CachedList>
			</Frame>
		}
    </CachedItem>;
}