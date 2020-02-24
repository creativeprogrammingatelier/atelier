import React from "react";

import {CommentThread} from "./comment/CommentThread";
import {File} from "../../../../models/database/File";
import {ExtendedThread} from "../../../../models/database/Thread";

interface CommentTabProperties {
	file: File,
	threads: ExtendedThread[]
}
export function CommentTab({file: {pathname}, threads}: CommentTabProperties) {
	return <div>
		<h1>{pathname}</h1>
		{threads.map((thread) => {
			return <CommentThread thread={thread}/>;
		})}
	</div>;
}