import React, {useState, useEffect} from "react";
import {DataTable} from "../general/data/DataTable";
import {Frame} from "../frame/Frame";
import {Loading} from "../general/loading/Loading";
import {User} from "../../../../models/api/User";
import {Submission} from "../../../../models/api/Submission";
import {getUserSubmissions, getUser} from "../../../helpers/APIHelper";
import {Jumbotron} from "react-bootstrap";

interface UserOverviewProperties {
	match: {
		params: {
			userId: string
		}
	}
}

export function UserOverview({match: {params: {userId}}}: UserOverviewProperties) {
	return (
		<Loading<User>
			loader={getUser}
			params={[userId]}
			component={user =>
				<Frame
					title={user.name === undefined ? "Undefined" : user.name}
					sidebar search={`/user/${user.ID}/search`}>
					<Jumbotron>
						<h1>{user.name}</h1>
						<p>Welcome back here! :D</p>
					</Jumbotron>
					<div>
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
									]}
								/>
							}
						/>
					</div>
				</Frame>
			}
		/>
	);
}