import React, { Fragment } from "react";
import {Frame} from "../frame/Frame";
import {Uploader} from "../uploader/Uploader";
import {Jumbotron} from "react-bootstrap";
import { useCourseSubmissions, useCourse, useCourseMentions } from "../../helpers/api/APIHooks";
import { CachedItem } from "../general/loading/CachedItem";
import { CachedDataBlockList } from "../general/loading/CachedDataBlockList";

interface CourseOverviewProps {
	match: {
		params: {
			courseId: string
		}
	}
}

export function CourseOverview({match: {params: {courseId}}}: CourseOverviewProps) {
    const {course} = useCourse(courseId);
    const {submissions, refreshSubmissions} = useCourseSubmissions(courseId);
    const {mentions, refreshMentions} = useCourseMentions(courseId);

	return (
		<Frame title="Course" sidebar search={{course: courseId}}>
			<Jumbotron>
                <CachedItem item={course}>{
                    course =>
                        <Fragment>
                            <h1>{course.name}</h1>
                            <p>Created by {course.creator.name}</p>
                        </Fragment>
                }</CachedItem>
			</Jumbotron>
            <CachedDataBlockList
                header="Submissions"
                collection={submissions}
                refresh={refreshSubmissions}
                map={
                    submission => ({
                        transport: `/submission/${submission.item.ID}`,
                        title: submission.item.name,
                        text: "Submitted by " + submission.item.user.name,
                        time: new Date(submission.item.date)
                    })
                }
            />
			<div className="m-3">
				<Uploader courseId={courseId} />
			</div>
			<CachedDataBlockList
                header="Mentions"
                collection={mentions}
                refresh={refreshMentions}
                map={({item: mention}) => ({
                    transport: 
                        mention.comment.references.fileID !== undefined
                        ? `/submission/${mention.references.submissionID}/${mention.comment.references.fileID}/comments#${mention.comment.references.commentThreadID}`
                        : `/submission/${mention.references.submissionID}#${mention.comment.references.commentThreadID}`, 
                    title: `Mentioned by ${mention.comment.user.name} on ${mention.submissionTitle}`,
                    text: mention.comment.text,
                    time: new Date(mention.comment.created),
                    tags: []
                })}
            />
		</Frame>
	);
}