import React, {Fragment} from "react";
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";

import {Frame} from "../frame/Frame";
import {DataBlockList} from "../general/DataBlockList";
import {DataItemList} from "../general/DataItemList";
import {File} from "../../../../models/database/File";
import {Loading} from "../general/Loading";
import AuthHelper from "../../../helpers/AuthHelper";
import { Header } from "../frame/Header";
import { ExtendedThread } from "../../../../models/database/Thread";
import { CommentThread } from "./comment/CommentThread";
import { Fetch } from "../../../helpers/FetchHelper";
import {FileNameHelper} from "../../helpers/FileNameHelper";
import {LoadingIcon} from "../general/LoadingIcon";
import {Submission} from "../../../../models/database/Submission";

interface SubmissionOverviewProps {
	match: {
		params: {
			submissionId: string
		}
	}
}

export function SubmissionOverview({match: {params: {submissionId}}}: SubmissionOverviewProps) {
	const submissionPath = "/submission/" + submissionId;

	console.log("Loading a submission overview page");
	console.log(submissionId);
	console.log(submissionPath);
	console.log(`/api/submission/${submissionId}`);

	const getSubmission = (submissionId: string) => Fetch.fetchJson<Submission>(`/api/submission/${submissionId}`);
    const getFiles = (submissionId: string) => Fetch.fetchJson<File[]>(`/api/files/submission/${submissionId}`);
    const getComments = (submissionId: string) => Fetch.fetchJson<ExtendedThread[]>(`/api/commentThread/submission/${submissionId}`);
    // also find a way to get recent comments

	return <Loading<Submission>
		loader={getSubmission}
		params={[submissionId]}
		component={
			submission => <Frame title={submission.name!} sidebar search={submissionPath + "/search"}>
				<h1>{submission.name}</h1>
				<p>Submitted by {submission.userID}</p>
				<p>In course {submission.courseID}</p>
				<p>Just now</p>
				<Button className="mb-2"><Link to={submissionPath + "/share"}>Share</Link></Button>
				<Loading<File[]>
					loader={getFiles}
					params={[submissionId]}
					component={files =>
						<DataItemList
							header="Files"
							list={files.map(file => {
								return {
									transport : submissionPath + `/${file.fileID}/code`,
									text : file.pathname === undefined ? "" : FileNameHelper.fromPath(file.pathname)
								}
							})}
						/>
					}
				/>

				{/* Reference for tags if needed
				 <DataItemList header="Files" list={[
				 {
				 transport: submissionPath+"/1/code",
				 text: "FileName1"
				 }, {
				 transport: submissionPath+"/2/code",
				 text: "FileName2",
				 tags: [{name: "New comment", color: "red", dark:true}]
				 }
				 ]}/>*/}

				<Header title="Comments"/>
				<Loading<ExtendedThread[]>
					loader={getComments}
					params={[submissionId]}
					component={threads =>
						<Fragment>
							{threads.map(thread => <CommentThread thread={thread}/>)}
						</Fragment>
					}
				/>

				<DataBlockList header="Recent" list={[
					{
						title: "recent",
						text: "to show here",
						time: new Date()
					}
				]}/>
			</Frame>
		}
		wrapper={children => <Frame title="Submission" sidebar search={submissionPath + "/search"}>{children}</Frame>}
	/>;
}