import React from "react";

import {CommentThread} from "./comment/CommentThread";
import {File} from "../../../../models/database/File";
import { Loading } from "../general/Loading";
import AuthHelper from "../../../helpers/AuthHelper";
import { ExtendedThread } from "../../../../models/database/Thread";

interface CommentTabProperties {
    file: File
}

export function CommentTab({ file }: CommentTabProperties) {
    const getThreads = () => AuthHelper.fetch(`/api/comments/file/${file.fileID}`).then(res => res.json());

	return <div>
		<h1>{file.pathname}</h1>
        <Loading<ExtendedThread[]>
            loader={getThreads}
            component={threads => threads.map(thread => <CommentThread thread={thread} />)} />
	</div>;
}