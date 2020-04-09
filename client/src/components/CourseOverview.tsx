import React, {useState, Fragment, useEffect} from "react";
import {Link} from "react-router-dom";
import {Button, Jumbotron} from "react-bootstrap";
import {FiPlus, FiX} from "react-icons/all";
import {PermissionEnum} from "../../../models/enums/PermissionEnum";
import {FeedbackSuccess} from "./feedback/FeedbackSuccess";
import {FeedbackContent} from "./feedback/Feedback";
import {Frame} from "./frame/Frame";
import {Permissions} from "./general/Permissions";
import {Uploader} from "./uploader/Uploader";
import { useCourse, useCourseSubmissions, useCourseMentions } from "../helpers/api/APIHooks";
import { Cached } from "./general/loading/Cached";
import { DataList } from "./data/DataList";
import { DataBlock } from "./data/DataBlock";

interface CourseOverviewProps {
	match: {
		params: {
			courseId: string
		}
	}
}

export function CourseOverview({match: {params: {courseId}}}: CourseOverviewProps) {
    const course = useCourse(courseId);
    const submissions = useCourseSubmissions(courseId);
    const mentions = useCourseMentions(courseId);

    // TODO: this is terrible and should not be needed
    const [mentionCount, setMentionCount] = useState(0);

    const [uploading, setUploading] = useState(false);
	const [uploadingSuccess, setUploadingSuccess] = useState(false as FeedbackContent);

	return (
		<Frame title="Course" sidebar search={{course: courseId}}>
			<Jumbotron>
                <Cached cache={course}>{
                    course =>
                        <Fragment>
                            <h1>{course.name}</h1>
                            <p>Created by {course.creator.name}</p>
                        </Fragment>
                }</Cached>
                <Permissions single={PermissionEnum.manageCourses}>
                    <Link to={`/course/${courseId}/settings`}><Button>Settings</Button></Link>
                </Permissions>
			</Jumbotron>
			<DataList header="Mentions" childCount={mentionCount}>
				<Cached cache={mentions} timeout={30} updateCount={setMentionCount}>
					{mention =>
						<DataBlock
                            key={mention.ID}
							title={`Mentioned by ${mention.comment.user.name} on ${mention.submissionTitle}`}
							text={mention.comment.text}
							time={new Date(mention.comment.created)}
							transport={
								mention.comment.references.fileID !== undefined ?
									`/submission/${mention.references.submissionID}/${mention.comment.references.fileID}/comments#${mention.comment.references.commentThreadID}`
									:
									`/submission/${mention.references.submissionID}#${mention.comment.references.commentThreadID}`
							}
						/>
					}
				</Cached>
			</DataList>
			<DataList
				header="Submissions"
				optional={{
					icon: uploading ? FiX : FiPlus,
					click: () => setUploading(!uploading),
					component: (
						uploading &&
						<Uploader
							courseId={courseId}
							onUploadComplete={() => {
								setUploadingSuccess("Upload successful");
								setUploading(false);
							}}
						/>
					) || <FeedbackSuccess close={setUploadingSuccess}>{uploadingSuccess}</FeedbackSuccess>
				}} 
			>
				<Cached cache={submissions} timeout={30}>
					{
						submission =>
							<DataBlock
                                key={submission.ID}
								transport={`/submission/${submission.ID}`}
								title={submission.name}
								text={"Submitted by " + submission.user.name}
								time={new Date(submission.date)}
							/>
					}
				</Cached>
			</DataList>
		</Frame>
	);
}