import React, {useState, useEffect} from "react";
import {DataTable} from "../general/DataTable";
import {Frame} from "../frame/Frame";
import {
	CommentThreadResponse,
	SubmissionResponse,
	UserResponse
} from "../../helpers/DatabaseResponseInterface";
import {Loading} from "../general/Loading";
import {User} from "../../../../models/database/User";
import {Submission} from "../../../../models/database/Submission";
import AuthHelper from './../../../helpers/AuthHelper';


interface UserOverviewProperties {
	match : {
		params : {
			userId : string
		}
	}
}

export function UserOverview({match}: UserOverviewProperties) {
	const [loading, setLoading] = useState(true);
	const [submissions, setSubmissions] = useState(null as unknown as Submission[]);
	const [user, setUser] = useState(null as unknown as User);
	const [comments, setComments] = useState(null as unknown as CommentThreadResponse[]);
	const getSubmissions = AuthHelper.fetch(`/api/submissions/user/${match.params.userId}`);
	const getUser = AuthHelper.fetch(`/api/user/${match.params.userId}`);
	// getUser?, getComments?

	useEffect(() => {
		Promise.all([getSubmissions, getUser]).then(responses =>
			Promise.all(responses.map(response => response.json()))
		).then(data => {
			setSubmissions(data[0]);
			setUser(data[1]);
			setLoading(false);
		}).catch(error => console.log(error));
	}, []);

	return (
		<div>
			{loading ?
				<Loading/>
				:
				<Frame
					title={user.name == undefined ? "Undefined" : user.name}
					user={{id: ""+user.userID, name: user.name == undefined ? "Undefined" : user.name}}
					sidebar search={`/user/${user.userID}/search`}
				>
					<p>Introduction section</p>
					{/*<DataTable
						title="To be reviewed"
						data={submissions}
						table={[
							["Project", x => x.name, x => `/submission/${x.submissionId}`],
							["Date", x => new Date(x.date).toLocaleString()]
						]}/>*/}
					<DataTable
						title="Projects"
						data={submissions}
						table={[
							["Project", x => x.name!, x => `/submission/${x.submissionID}`],
							["Date", x => new Date(x.date!).toLocaleString()]
						]}/>
					{/*<DataTable
						title="Comments"
						data={comments}
						table={[
							["Topic", x => x.name],
							["Last author", x => x.comments.slice(-1)[0].author, x => `/user/${x.comments.slice(-1)[0].userId}`],
							["Last reply", x => x.comments.slice(-1)[0].text]
						]}/>*/}
				</Frame>
			}
		</div>
	);
}