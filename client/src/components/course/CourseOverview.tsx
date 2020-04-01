import React, { Fragment, useState } from "react";
import {Frame} from "../frame/Frame";
import { useCourseSubmissions, useCourse, useCourseMentions } from "../../helpers/api/APIHooks";
import {Uploader} from "../uploader/Uploader";
import {Button, Jumbotron} from "react-bootstrap";
import {FiPlus, FiX} from "react-icons/all";
import {PermissionEnum} from "../../../../models/enums/permissionEnum";
import {DataList} from "../data/DataList";
import {Link} from "react-router-dom";
import { Permissions } from "../general/Permissions";
import { Cached } from "../general/loading/Cached";
import { DataBlock } from "../data/DataBlock";

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
                <Cached cache={mentions} timeout={30}>{
                    mention =>
                        <DataBlock
                            title={`Mentioned by ${mention.comment.user.name} on ${mention.submissionTitle}`}
                            text={mention.comment.text}
                            time={new Date(mention.comment.created)}
                            transport={
                                mention.comment.references.fileID !== undefined
                                ? `/submission/${mention.references.submissionID}/${mention.comment.references.fileID}/comments#${mention.comment.references.commentThreadID}`
                                : `/submission/${mention.references.submissionID}#${mention.comment.references.commentThreadID}`
                            } />
                }</Cached>
            </DataList>
            <DataList header="Submissions"
                optional={{
                    icon: uploading ? FiX : FiPlus,
                    click: () => setUploading(!uploading),
                    component: uploading && <Uploader courseId={courseId} />
                }}>
                <Cached cache={submissions}
                    timeout={30}>{
                    submission => 
                        <DataBlock
                            transport={`/submission/${submission.ID}`}
                            title={submission.name}
                            text={"Submitted by " + submission.user.name}
                            time={new Date(submission.date)}
                        />
                }</Cached>
            </DataList>
		</Frame>
	);
}