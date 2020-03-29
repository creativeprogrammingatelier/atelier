import React, { Fragment } from "react";
import {Frame} from "../frame/Frame";
import {DataBlockList} from "../data/DataBlockList";
import {Loading} from "../general/loading/Loading";
import {getCourseMentions} from "../../../helpers/APIHelper";
import {Uploader} from "../uploader/Uploader";
import {Jumbotron} from "react-bootstrap";
import {Mention} from "../../../../models/api/Mention";
import { useSubmissions, useCourse } from "../../helpers/api/APIHooks";
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
    const {submissions, refreshSubmissions} = useSubmissions(courseId);

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
			<Loading<Mention[]>
				loader={courseID => getCourseMentions(courseID)}
				params={[courseId]}
				component={mentions =>
					<DataBlockList
						header="Mentions"
						list={mentions.map(mention => ({
                            transport: 
                                mention.comment.references.fileID !== undefined
                                ? `/submission/${mention.references.submissionID}/${mention.comment.references.fileID}/comments#${mention.comment.references.commentThreadID}`
                                : `/submission/${mention.references.submissionID}#${mention.comment.references.commentThreadID}`, 
							title: `Mentioned by ${mention.comment.user.name} on ${mention.submissionTitle}`,
							text: mention.comment.text,
							time: new Date(mention.comment.created),
							tags: []
						}))}
					/>
				}
			/>
		</Frame>
	);
}