import React, {useState, useEffect} from "react";
import {DataTable} from "../general/data/DataTable";
import {Frame} from "../frame/Frame";
import {
	CommentThreadResponse,
	SubmissionResponse,
	UserResponse
} from "../../helpers/DatabaseResponseInterface";
import {Loading} from "../general/loading/Loading";
import {User} from "../../../../models/database/User";
import {Submission} from "../../../../models/database/Submission";
import { getUserSubmissions, getUser } from "../../../helpers/APIHelper";
import {Jumbotron} from "react-bootstrap";

interface UserOverviewProperties {
	match : {
		params : {
			userId : string
		}
	}
}

export function UserOverview({match: { params: { userId } } }: UserOverviewProperties) {
	return (
		<Loading<User>
			loader={getUser}
			params={[userId]}
			component={user =>
				<Frame
					title={user.name === undefined ? "Undefined" : user.name}
					sidebar search={`/user/${user.userID}/search`}>
					<Jumbotron>
						<h1>{user.name}</h1>
						<p>Welcome back here! :D</p>
					</Jumbotron>
					{/*<DataTable
						title="Recent"
						data={submissions}
						table={[
							["Project", x => x.name, x => `/submission/${x.submissionId}`],
							["Date", x => new Date(x.date).toLocaleString()]
						]}/>*/}
					<div className="m-3">
						<Loading<Submission[]>
							loader={getUserSubmissions}
							params={[user.userID!]}
							component={submissions =>
								<DataTable
									title="Projects"
									data={submissions}
									table={[
										["Project", x => x.name!, x => `/submission/${x.submissionID}`],
										["Date", x => new Date(x.date!).toLocaleString()]
									]}
								/>
							}
						/>
					</div>
					{/*<DataTable
						title="Comments"
						data={comments}
						table={[
							["Topic", x => x.name],
							["Last author", x => x.comments.slice(-1)[0].author, x => `/user/${x.comments.slice(-1)[0].userId}`],
							["Last reply", x => x.comments.slice(-1)[0].text]
						]}/>*/}
				</Frame>
			} />
	);
}