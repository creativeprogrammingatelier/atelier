import React from "react";

import {CommentThread} from "../comment/CommentThread";
import {File} from "../../../../models/api/File";
import {Loading} from "../general/loading/Loading";
import {CommentThread as APICommentThread} from "../../../../models/api/CommentThread";
import {getFileComments} from "../../../helpers/APIHelper";

interface CommentTabProperties {
    file: File,
	submissionID: string
}

// TODO sort threads once new interface is implemented. Useful for switch between code and comment threads.
export function CommentTab({file}: CommentTabProperties) {
	return <div className="contentTab">
		<div className="m-3">
			<Loading<APICommentThread[]>
				loader={getFileComments}
				params={[file.ID]}
				component={threads => threads.map(thread => <CommentThread thread={thread}/>)}
			/>
		</div>
    </div>
}