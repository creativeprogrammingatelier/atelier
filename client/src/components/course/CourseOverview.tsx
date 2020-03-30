import React, { Fragment, useState } from "react";
import {Frame} from "../frame/Frame";
import { useCourseSubmissions, useCourse, useCourseMentions } from "../../helpers/api/APIHooks";
import { CachedItem } from "../general/loading/CachedItem";
import { CachedDataBlockList } from "../general/loading/CachedDataBlockList";
import {Uploader} from "../uploader/Uploader";
import {Button, Jumbotron} from "react-bootstrap";
import {FiPlus, FiX} from "react-icons/all";
import {PermissionEnum} from "../../../../models/enums/permissionEnum";
import {DataList} from "../data/DataList";
import {Link} from "react-router-dom";
import { Permissions } from "../general/Permissions";

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

    const [uploading, setUploading] = useState(false);

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
                <Permissions required={PermissionEnum.manageCourses}>
                    <Link to={`/course/${courseId}/settings`}><Button>Settings</Button></Link>
                </Permissions>
			</Jumbotron>
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
            <DataList
                header="Submissions"
                optional={{
                    icon: uploading ? FiX : FiPlus,
                    click: () => setUploading(!uploading),
                    component: uploading && <Uploader courseId={courseId} />
                }}>
                <CachedDataBlockList
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
            </DataList>
		</Frame>
	);
}