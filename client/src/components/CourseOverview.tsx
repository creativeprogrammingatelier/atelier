import React, {useState, Fragment} from "react";
import {Link} from "react-router-dom";
import {Button, Jumbotron} from "react-bootstrap";
import {FiPlus, FiX} from "react-icons/all";

import {Course, CoursePartial} from "../../../models/api/Course";
import {Mention} from "../../../models/api/Mention";
import {Permission} from "../../../models/api/Permission";
import {Submission} from "../../../models/api/Submission";
import {containsPermission, PermissionEnum} from "../../../models/enums/permissionEnum";

import {coursePermission, getCourse, getCourseMentions, getCourseSubmissions} from "../../helpers/APIHelper";

import {DataBlockList} from "./data/DataBlockList";
import {FeedbackSuccess} from "./feedback/FeedbackSuccess";
import {FeedbackContent} from "./feedback/Feedback";
import {Frame} from "./frame/Frame";
import {Loading} from "./general/loading/Loading";
import {Uploader} from "./uploader/Uploader";

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
			<DataList header="Mentions">
				<Cached cache={mentions} timeout={30}>
					{mention =>
						<DataBlock
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
								updateReload(rel => rel + 1)
							}}
						/>
					) || <FeedbackSuccess close={setUploadingSuccess}>{uploadingSuccess}</FeedbackSuccess>
				}}
			>
				<Cached cache={submissions} timeout={30}>
					{
						submission =>
							<DataBlock
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