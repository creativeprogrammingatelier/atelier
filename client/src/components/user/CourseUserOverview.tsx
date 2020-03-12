import React, {useState, useEffect, Fragment} from "react";
import {Frame} from "../frame/Frame";
import {Loading} from "../general/loading/Loading";
import {User} from "../../../../models/api/User";
import {getUserSubmissions, getUser, getFile, getFileContents, getCourse} from "../../../helpers/APIHelper";
import {Jumbotron} from "react-bootstrap";
import {CommentTab} from "./CommentTab";
import {SubmissionTab} from "./SubmissionTab";
import {CourseTab} from "./CourseTab";
import {TabBar} from "../general/TabBar";
import {FiMessageSquare, FiPaperclip, FiArchive, FiCompass, FiPackage} from "react-icons/all";
import { Course } from "../../../../models/api/Course";
import { Link } from "react-router-dom";

interface UserOverviewProperties {
	match: {
		params: {
			courseId: string,
			userId: string,
			tab: string
		}
	}
}

export function CourseUserOverview({match: {params: {courseId, userId, tab}}}: UserOverviewProperties) {
	const [activeTab, setActiveTab] = useState(tab);

	useEffect(() => {
		setActiveTab(tab);
	}, [tab]);
	useEffect(() => {
		if (activeTab === undefined) {
			setActiveTab("submissions");
		}
	});

	const coursePath = "/course/" + courseId;
	const userPath = "/user/" + userId;
	const courseUserPath = coursePath + userPath;

	function renderTabContents(user: User, course: Course) {
		if (activeTab === "submissions") {
			return <SubmissionTab user={user} course={course}/>;
		} else if (activeTab === "comments") {
			return <CommentTab user={user} course={course}/>;
		}
		return <div><h1>Tab not found!</h1></div>;
	}

	return (
		<Loading<User>
			loader={getUser}
			params={[userId]}
			component={user =>
				<Frame
					title={user.name}
					sidebar search={`/user/${user.ID}/search`}>
					<Loading<Course>
						loader={getCourse}
						params={[courseId]}
						component={course => <Fragment>
							<Jumbotron>
								<h1>{user.name}</h1>
								<p>Everything by <Link to={`/user/${user.ID}`}>{user.name}</Link> in <Link to={`/course/${course.ID}`}>{course.name}</Link></p>
							</Jumbotron>
							{renderTabContents(user, course)}
						</Fragment>
						}
					/>
					<TabBar
						tabs={[{
							id: "submissions",
							icon: <FiPackage size={28} color="#FFFFFF"/>,
							text: "Submissions",
							location: courseUserPath + "/submissions"
						}, {
							id: "comments",
							icon: <FiMessageSquare size={28} color="#FFFFFF"/>,
							text: "Comments",
							location: courseUserPath + "/comments"
						}]}
						active={activeTab}
					/>
				</Frame>
			}
			wrapper={() => <Frame title="User" sidebar search=""/>}
		/>
	);
}