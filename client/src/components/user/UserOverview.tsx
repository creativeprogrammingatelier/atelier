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
import { Fetch } from "../../../helpers/FetchHelper";


interface UserOverviewProperties {
	match : {
		params : {
			userId : string
		}
	}
}

export function UserOverview({match: { params: { userId } } }: UserOverviewProperties) {
	const getSubmissions = (userId: string) => Fetch.fetchJson<Submission[]>(`/api/submission/user/${userId}`);
	const getUser = (userId: string) => Fetch.fetchJson<User>(`/api/user/${userId}`);
	// getComments?

	return (
		<Loading<User>
			loader={getUser}
			params={[userId]}
			component={user =>
				<Frame
					title={user.name === undefined ? "Undefined" : user.name}
					sidebar search={`/user/${user.userID}/search`}>
					<p>Introduction section</p>
					{/*<DataTable
						title="Recent"
						data={submissions}
						table={[
							["Project", x => x.name, x => `/submission/${x.submissionId}`],
							["Date", x => new Date(x.date).toLocaleString()]
						]}/>*/}
					<Loading<Submission[]>
						loader={getSubmissions}
						params={[user.userID!]}
						component={submissions =>
							<DataTable
								title="Projects"
								data={submissions}
								table={[
									["Project", x => x.name!, x => `/submission/${x.submissionID}`],
									["Date", x => new Date(x.date!).toLocaleString()]
								]} />} />
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