import React from "react";
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";

import {Frame} from "../frame/Frame";
import {DataBlockList} from "../general/DataBlockList";
import {DataItemList} from "../general/DataItemList";

interface SubmissionOverviewProps {
	match: {
		params: {
			submissionId: string
		}
	}
}

export function SubmissionOverview({match: {params: {submissionId}}}: SubmissionOverviewProps) {
	const submissionPath = "/submission/" + submissionId;

	return <Frame title="Submission" user={{id: "1", name: "John Doe"}} sidebar search={submissionPath + "/search"}>
		<h1>A Project</h1>
		<p>Submitted by John Doe</p>
		<p>Just now</p>
		<Button className="mb-2"><Link to={submissionPath + "/share"}>Share</Link></Button>
		<DataItemList header="Files" list={[
			{
				transport: submissionPath+"/1/code",
				text: "FileName1"
			}, {
				transport: submissionPath+"/2/code",
				text: "FileName2",
				tags: [{name: "New comment", color: "red", dark:true}]
			}
		]}/>
		<DataBlockList header="Comments" list={[
			{
				title: "John Doe",
				text: "It broke",
				time: new Date()
			}, {
				title: "Jane Doe",
				text: "Yep, still broke",
				time: new Date()
			}, {
				title: "Mary Doe",
				text: "No? It fixed itself?",
				time: new Date()
			}
		]}/>
		<DataBlockList header="Recent" list={[
			{
				title: "FileName2",
				text: "John Doe: Dont use underscores",
				time: new Date()
			}
		]}/>
	</Frame>;
}