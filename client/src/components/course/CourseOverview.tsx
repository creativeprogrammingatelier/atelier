import React, {useState, Fragment, useEffect} from "react";
import {Frame} from "../frame/Frame";
import {DataBlockList} from "../data/DataBlockList";
import {Loading} from "../general/loading/Loading";
import {Submission} from "../../../../models/api/Submission";
import {coursePermission, getCourse, getCourseMentions, getCourseSubmissions, permission} from "../../../helpers/APIHelper";
import {Uploader} from "../uploader/Uploader";
import {Button, Jumbotron} from "react-bootstrap";
import {Course, CoursePartial} from "../../../../models/api/Course";
import {Mention} from "../../../../models/api/Mention";
import {CoursePermission, Permission} from "../../../../models/api/Permission";
import {FiPlus, FiX} from "react-icons/all";
import {containsPermission, PermissionEnum} from "../../../../models/enums/permissionEnum";
import {DataList} from "../data/DataList";
import {PluginSettings} from "../settings/system/PluginSettings";
import {Link} from "react-router-dom";
import {FeedbackSuccess} from "../feedback/FeedbackSuccess";
import {FeedbackContent} from "../feedback/Feedback";

interface CourseOverviewProps {
	match: {
		params: {
			courseId: string
		}
	}
}

export function CourseOverview({match: {params: {courseId}}}: CourseOverviewProps) {
	const [uploading, setUploading] = useState(false);
	const [uploadingSuccess, setUploadingSuccess] = useState(false as FeedbackContent);
	const [reload, updateReload] = useState(0);
	const [permissions, setPermissions] = useState(0);

	const [reloadCourse, setReloadCourse] = useState(0);
	const courseUpdate = (course: CoursePartial) => setReloadCourse(x => x + 1);

	useEffect(() => {
		coursePermission(courseId)
			.then((permission: Permission) => {
				setPermissions(permission.permissions);
			});
	}, []);

	return (
		<Frame title="Course" sidebar search={{course: courseId}}>
			<Jumbotron>
				<Loading<Course>
					loader={getCourse}
					params={[courseId]}
					component={course => <Fragment><h1>{course.name}</h1><p>Created by {course.creator.name}</p></Fragment>}
				/>
				<Loading<Permission>
					loader={coursePermission}
					params={[courseId]}
					component={permission => containsPermission(PermissionEnum.manageCourses, permission.permissions) && <Link to={`/course/${courseId}/settings`}><Button>Settings</Button></Link>}
				/>
			</Jumbotron>
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
			<Loading<Submission[]>
				loader={(courseId, reload) => getCourseSubmissions(courseId)}
				params={[courseId, reload]}
				component={submissions =>
					<DataBlockList
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
						list={submissions.map(submission => {
							console.log(submission);
							return {
								transport: `/submission/${submission.ID}`,
								title: submission.name,
								text: "Submitted by " + submission.user.name,
								time: new Date(submission.date)
							};
						})}
					/>
				}
			/>
		</Frame>
	);
}