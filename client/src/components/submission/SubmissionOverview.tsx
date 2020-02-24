import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";

import {Frame} from "../frame/Frame";
import {DataBlockList} from "../general/DataBlockList";
import {DataItemList} from "../general/DataItemList";
import {Submission} from "../../../../models/Submission";
import {File} from "../../../../models/File";
import {CommentThread} from "../../placeholdermodels";
import {Loading} from "../general/Loading";
import AuthHelper from "../../../helpers/AuthHelper";

interface SubmissionOverviewProps {
	match: {
		params: {
			submissionId: string
		}
	}
}

export function SubmissionOverview({match: {params: {submissionId}}}: SubmissionOverviewProps) {
	const submissionPath = "/submission/" + submissionId;

	const [loading, setLoading] = useState(true);
	const [files, setFiles] = useState([] as File[]);
	const [comments, setComments] = useState([] as CommentThread[]);
	const [recent, setRecent] = useState([]);

	useEffect(() => {
		const submission = AuthHelper.fetch("/api/submission/"+submissionId);
		console.log("Gotten a result from a thing");
		console.log(submission);
	}, []);

	useEffect(() => {
		const getFiles = AuthHelper.fetch(`/api/files/submission/${submissionId}`);
		// TODO get comments or comment threads as well

		Promise.all([getFiles]).then(responses =>
			Promise.all(responses.map(response => response.json()))
		).then(data => {
			setFiles(data[0]);
			setLoading(false);
		}).catch((error : any) => console.log(error));

	}, []);

	return <Frame title="Submission" user={{id: "1", name: "John Doe"}} sidebar search={submissionPath + "/search"}>
		<h1>A Project</h1>
		<p>Submitted by John Doe</p>
		<p>Just now</p>
		<Button className="mb-2"><Link to={submissionPath + "/share"}>Share</Link></Button>

		{
			loading ?
				<Loading />
				:
				<div>
					<DataItemList
						header="Files"
						list={files.map((file) => {
							return {
								transport : submissionPath + `/${file.fileID}/code`,
								text : file.pathname == undefined ? "" : file.pathname
							}
						})}
					/>


				</div>

		}
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
		<DataBlockList header="Comments" list={[
			{
				title: "We need a way to",
				text: "get general comments",
				time: new Date()
			}, {
				title: "from the",
				text: "database",
				time: new Date()
			}, {
				title: "and after",
				text: "filter on ",
				time: new Date()
			}
		]}/>
		<DataBlockList header="Recent" list={[
			{
				title: "recent",
				text: "to show here",
				time: new Date()
			}
		]}/>
	</Frame>;
}