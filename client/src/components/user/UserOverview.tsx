import React, {useState, useEffect} from "react";
import {Frame} from "../frame/Frame";
import {Loading} from "../general/loading/Loading";
import {User} from "../../../../models/api/User";
import {getUserSubmissions, getUser, getFile, getFileContents} from "../../../helpers/APIHelper";
import {Jumbotron} from "react-bootstrap";
import {CommentTab} from "./CommentTab";
import {SubmissionTab} from "./SubmissionTab";
import {CourseTab} from "./CourseTab";
import {TabBar} from "../general/TabBar";
import {FiMessageSquare, FiPaperclip, FiArchive, FiCompass, FiPackage} from "react-icons/all";

interface UserOverviewProperties {
	match: {
		params: {
			userId: string,
			tab: string
		}
	}
}

export function UserOverview({match: {params: {userId, tab}}}: UserOverviewProperties) {
	const [activeTab, setActiveTab] = useState(tab);

	useEffect(() => {
		setActiveTab(tab);
	}, [tab]);
	useEffect(() => {
		if (activeTab === undefined) {
			setActiveTab("courses");
		}
	});

	const userPath = "/user/" + userId;

	function renderTabContents(user: User) {
		if (activeTab === "courses") {
			return <CourseTab user={user}/>;
		} else if (activeTab === "submissions") {
			return <SubmissionTab user={user}/>;
		} else if (activeTab === "comments") {
			return <CommentTab user={user}/>;
		}
		return <div><h1>Tab not found!</h1></div>;
	}

	return (
		<Loading<User>
			loader={getUser}
			params={[userId]}
			component={user =>
				<Frame title={user.name} sidebar search={{user: user.name}}>
					<Jumbotron>
						<h1>{user.name}</h1>
						<p>Welcome back here! :D</p>
					</Jumbotron>
					{renderTabContents(user)}
					<TabBar
						tabs={[{
							id: "courses",
							icon: FiCompass,
							text: "Courses",
							location: userPath + "/courses"
						}, {
							id: "submissions",
							icon: FiPackage,
							text: "Submissions",
							location: userPath + "/submissions"
						}, {
							id: "comments",
							icon: FiMessageSquare,
							text: "Comments",
							location: userPath + "/comments"
						}]}
						active={activeTab}
					/>
				</Frame>
			}
		/>
	);
}