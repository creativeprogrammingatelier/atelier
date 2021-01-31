import React, {useState, useEffect, Fragment} from "react";
import {Link} from "react-router-dom";
import {Jumbotron} from "react-bootstrap";
import {FiMessageSquare, FiPackage} from "react-icons/all";

import {Course} from "../../../../models/api/Course";
import {User} from "../../../../models/api/User";

import {getUser, getCourse, getCourseUser} from "../../helpers/api/APIHelper";

import {Frame} from "../frame/Frame";
import {Loading} from "../general/loading/Loading";
import {ErrorBoundary} from "../general/ErrorBoundary";
import {TabBar} from "../tab/TabBar";
import {CommentTab} from "./CommentTab";
import {SubmissionTab} from "./SubmissionTab";
import { Breadcrumbs, Crumb } from "../general/Breadcrumbs";
import { CourseUser, courseUserToUser } from "../../../../models/api/CourseUser";

interface UserOverviewProperties {
	match: {
		params: {
			/** Course ID within database */
			courseId: string,
			/** User ID within database */
			userId: string,
			/** Current active tab. */
			tab: string
		}
	}
}
/** 
 * Component for retrieving, and rendering, the contents of the current active tab based in the user 
 * given and specified course.
 */
export function UserCourseOverview({match: {params: {courseId, userId, tab}}}: UserOverviewProperties) {
	const [activeTab, setActiveTab] = useState(tab);
	
	const coursePath = "/course/" + courseId;
	const userPath = "/user/" + userId;
	const courseUserPath = coursePath + userPath;
	
	useEffect(() => {
		setActiveTab(tab);
	}, [tab]);
	useEffect(() => {
		if (activeTab === undefined) {
			setActiveTab("submissions");
		}
	});
	
	const renderTabContents = (user: User, course: Course) => {
		if (activeTab === "submissions") {
			return <SubmissionTab user={user} course={course}/>;
		} else if (activeTab === "comments") {
			return <CommentTab user={user} course={course}/>;
		}
		// TODO: Better error
		return <div><h1>Tab not found!</h1></div>;
	};
	
	return <Loading<CourseUser>
		loader={getCourseUser}
		params={[userId, courseId]}
		component={user =>
			<Frame title={user.userName} sidebar search={{course: courseId, user: user.userName}}>
				<Loading<Course>
					loader={getCourse}
					params={[courseId]}
					component={course =>
						<Fragment>
							<Jumbotron>
                                <Breadcrumbs>
                                    <Crumb text={course.name} link={`/course/${course.ID}`} />
                                </Breadcrumbs>
								<h1>{user.userName}</h1>
							</Jumbotron>
							<ErrorBoundary>
								{renderTabContents(courseUserToUser(user), course)}
							</ErrorBoundary>
						</Fragment>
					}
				/>
				<TabBar
					tabs={[{
						id: "submissions",
						icon: FiPackage,
						text: "Submissions",
						location: courseUserPath + "/submissions"
					}, {
						id: "comments",
						icon: FiMessageSquare,
						text: "Comments",
						location: courseUserPath + "/comments"
					}]}
					active={activeTab}
				/>
			</Frame>
		}
		wrapper={() => <Frame title="User" sidebar search={{user: userId}}/>}
	/>;
}