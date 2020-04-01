import React, {useMemo} from "react";
import {File} from "../../../../../models/api/File";
import {CommentSelector} from "../../comment/CommentSelector";
import {HighlightedCode, HighlightedCodeProperties, SnippetHighlight} from "../../code/HighlightedCode";
import {useHistory} from "react-router-dom";
import {Selection} from "../../../../../models/api/Snippet";
import {FileViewer, FileViewerProperties} from "../FileOverview";
import {FiCode} from "react-icons/all";
import { useFileComments, useFileBody, useCollectionCombined } from "../../../helpers/api/APIHooks";
import { CommentThread } from "../../../../../models/api/CommentThread";
import { CacheItem } from "../../../helpers/api/Cache";
import { Cached } from "../../general/loading/Cached";
import { useObservable } from "observable-hooks";
import { map } from "rxjs/operators";

export function CodeViewer({file, sendComment}: FileViewerProperties) {
    const fileComments = useFileComments(file.references.submissionID, file.ID);
    const combinedCommentsObservable = useCollectionCombined(fileComments.observable);
    const snippetsObservable = useObservable(() => 
        combinedCommentsObservable.pipe(map(item => ({ ...item, value: getSnippets(item.value) })))
    , [combinedCommentsObservable]);
    const fileBody = useFileBody(file.ID);
    const history = useHistory();

    const snippets = {
        observable: snippetsObservable,
        refresh: fileComments.refresh
    }

	const getSnippets = (threads: CommentThread[]) => {
		const snippets: SnippetHighlight[] = [];
		for (const commentThread of threads) {
			if (commentThread.snippet !== undefined) {
				snippets.push({
					onClick: () => {
						console.log("clicked comment");
						history.push(`/submission/${file.references.submissionID}/${file.ID}/comments#${commentThread.ID}`);
					},
					...commentThread.snippet
				});
			}
        }
        return snippets;
    };
    
	const handleCommentSend = async(comment: string, restricted: boolean, selection: Selection) => {
		return sendComment(comment, restricted, selection);
    };

	return (
		<div className="mb-6">
            <Cached cache={snippets}>{snippets =>
                <Cached cache={fileBody}>{body =>
                    <CommentSelector<HighlightedCodeProperties>
                        codeViewer={HighlightedCode}
                        codeProperties={{code: body, snippets, options: {mode: file.type}}}
                        mentions={{courseID: file.references.courseID}}
                        sendHandler={handleCommentSend}
                    />
                }</Cached>
            }</Cached>
		</div>
	);
}
function acceptsType(type: string) {
	return type.startsWith("text/");
}
function acceptsFile(file: File) {
	return acceptsType(file.type);
}

const fileViewer: FileViewer = {
	name: "Code",
	icon: FiCode,
	viewer: CodeViewer,
	acceptsType,
	acceptsFile
};
export {fileViewer as FileViewerCode};