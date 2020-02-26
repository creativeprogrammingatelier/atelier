import React, {Fragment} from "react";

import {CommentThread} from "./comment/CommentThread";
import {File} from "../../../../models/database/File";
import {Loading} from "../general/Loading";
import AuthHelper from "../../../helpers/AuthHelper";
import {ExtendedThread} from "../../../../models/database/Thread";
import {Fetch} from "../../../helpers/FetchHelper";
import {FileNameHelper} from "../../helpers/FileNameHelper";

interface CommentTabProperties {
	file: File
}

export function CommentTab({file}: CommentTabProperties) {
	const getThreads = (fileID: string) => Fetch.fetchJson<ExtendedThread[]>(`/api/commentThread/file/${fileID}`);

	return <div className="contentTab">
		<h1>{FileNameHelper.fromPath(file.pathname!)}</h1>
		<Loading<ExtendedThread[]>
			loader={getThreads}
			params={[file.fileID]}
			component={threads => threads.map(thread => <CommentThread thread={thread}/>)}
		/>
	</div>;
}