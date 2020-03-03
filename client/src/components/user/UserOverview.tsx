import React, {useState, useEffect} from "react";
import {DataTable} from "../general/DataTable";
import {Frame} from "../frame/Frame";
import {Loading} from "../general/Loading";
import {User} from "../../../../models/api/User";
import {Submission} from "../../../../models/api/Submission";
import { getUserSubmissions, getUser } from "../../../helpers/APIHelper";

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
					sidebar search={`/user/${user.ID}/search`}>
					<p>Introduction section</p>
					{/*<DataTable
						title="Recent"
						data={submissions}
						table={[
							["Project", x => x.name, x => `/submission/${x.submissionId}`],
							["Date", x => new Date(x.date).toLocaleString()]
						]}/>*/}
					<Loading<Submission[]>
						loader={getUserSubmissions}
						params={[user.ID]}
						component={submissions =>
							<DataTable
								title="Projects"
								data={submissions}
								table={[
									["Project", x => x.name!, x => `/submission/${x.ID}`],
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