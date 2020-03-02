import React from "react";
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";

import {Frame} from "../frame/Frame";
import {File} from "../../../../models/database/File";
import {Loading} from "../general/Loading";
import { ExtendedThread } from "../../../../models/database/Thread";
import { CommentThread as CommentThreadComponent} from "./comment/CommentThread";
import {FileNameHelper} from "../../helpers/FileNameHelper";
import {Submission} from "../../../../models/database/Submission";
import {DataList} from "../general/DataList";
import {DataItem} from "../general/DataItem";
import { Course } from "../../../../models/database/Course";
import { getSubmission, getCourse, getFiles, getProjectComments, getRecentComments } from "../../../helpers/APIHelper";

interface SubmissionOverviewProps {
	match: {
		params: {
			submissionId: string
		}
	}
}

export function SubmissionOverview({match: {params: {submissionId}}}: SubmissionOverviewProps) {
	const submissionPath = "/submission/" + submissionId;

	return <Loading<Submission>
		loader={getSubmission}
		params={[submissionId]}
		component={
			submission => <Frame title={submission.name!} sidebar search={submissionPath + "/search"}>
				<h1>{submission.name}</h1>
				<p>
					Uploaded by <Link to={"/user/"+submission.userID}>{submission.userID}</Link>, for {/* User data should be given with the new API submission.user.* */}
					<Loading<Course>
						loader={getCourse}
						params={[submission.courseID!]}
						component={course => <Link to={"/course/"+course.courseID}>{course.name}</Link>}
					/>
					<br/>
					<small className="text-muted">{submission.date}</small>
				</p>
				<Button className="mb-2"><Link to={submissionPath + "/share"}>Share</Link></Button>
				<DataList header="Files">
					<Loading<File[]>
						loader={getFiles}
						params={[submissionId]}
						component={files => files.map(file => <DataItem text={FileNameHelper.fromPath(file.pathname!)} transport={submissionPath + "/" + file.fileID + "/code"}/>)}
					/>
				</DataList>
				<DataList header="Comments">
					<Loading<ExtendedThread[]>
						loader={getProjectComments}
						params={[submissionId]}
						component={threads =>threads.map(thread => <CommentThreadComponent thread={thread}/>)}
					/>
				</DataList>
				<DataList header="Recent">
					<Loading<ExtendedThread[]>
						loader={getRecentComments}
						params={[submissionId]}
						component={threads =>threads.map(thread => <CommentThreadComponent thread={thread}/>)}
					/>
				</DataList>

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
			</Frame>
		}
		wrapper={children => <Frame title="Submission" sidebar search={submissionPath + "/search"}>{children}</Frame>}
	/>;
}