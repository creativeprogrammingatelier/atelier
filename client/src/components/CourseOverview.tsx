import React, {useState, Fragment} from "react";
import {Link} from "react-router-dom";
import {Button, Jumbotron} from "react-bootstrap";
import {FiPlus, FiX, FiInbox, FiList} from "react-icons/all";

import {PermissionEnum} from "../../../models/enums/PermissionEnum";

import {useCourse} from "../helpers/api/APIHooks";

import {FeedbackContent} from "./feedback/Feedback";
import {FeedbackSuccess} from "./feedback/FeedbackSuccess";
import {Frame} from "./frame/Frame";
import {Permissions} from "./general/Permissions";
import {Cached} from "./general/loading/Cached";
import {Uploader} from "./uploader/Uploader";
import { PersonalFeed, CourseFeed } from "./feed/Feed";
import { TabBar } from "./tab/TabBar";

interface CourseOverviewProperties {
	match: {
		params: {
            courseId: string,
            tab?: string
		}
	}
}
export function CourseOverview({match: {params: {courseId, tab = "personal"}}}: CourseOverviewProperties) {
	const [uploading, setUploading] = useState(false);
	const [uploadingSuccess, setUploadingSuccess] = useState(false as FeedbackContent);
	const course = useCourse(courseId);
    const url = `/course/${courseId}`;
	
	return <Cached
		cache={course}
		wrapper={children => <Frame title="Course" sidebar search={{course: courseId}}>{children}</Frame>}
	>
		{course =>
			<Frame title={course.name} sidebar search={{course: courseId}}>
				<Jumbotron>
					<h1>{course.name}</h1>
					<p>Created by {course.creator.name}</p>
					<Permissions
						any={[
							PermissionEnum.manageCourses,
							PermissionEnum.manageUserRegistration,
							PermissionEnum.manageUserRole,
							PermissionEnum.manageUserPermissionsView,
							PermissionEnum.manageUserPermissionsManager
						]}
						course={courseId}
					>
						<Link to={`/course/${courseId}/settings`}><Button>Settings</Button></Link>
					</Permissions>
				</Jumbotron>

                <Uploader
                    courseId={courseId}
                    onUploadComplete={() => {
                        setUploadingSuccess("Upload successful");
                    }}
                />
                <FeedbackSuccess close={setUploadingSuccess}>{uploadingSuccess}</FeedbackSuccess>

				{
                    tab === "public"
                    ? <CourseFeed courseID={courseId} />
                    : <PersonalFeed courseID={courseId} />
                }

                <TabBar
                    active={tab}
                    tabs={[{
                        id: "personal",
                        icon: FiInbox,
                        text: "Personal",
                        location: url + "/personal"
                    }, {
                        id: "public",
                        icon: FiList,
                        text: "Public",
                        location: url + "/public"
                    }]}
                />
			</Frame>
		}
	</Cached>;
}