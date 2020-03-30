import React, {useEffect, useState, useMemo} from "react";
import {File} from "../../../../../models/api/File";
import {CommentSelector} from "../../comment/CommentSelector";
import {HighlightedCode, HighlightedCodeProperties, SnippetHighlight} from "../../code/HighlightedCode";
import {useHistory} from "react-router-dom";
import {Selection} from "../../../../../models/api/Snippet";
import {FileViewer, FileViewerProperties} from "../FileOverview";
import {FiCode} from "react-icons/all";
import { useFileComments, useFileBody } from "../../../helpers/api/APIHooks";
import { CommentThread } from "../../../../../models/api/CommentThread";
import { CacheItem, CacheState } from "../../../helpers/api/Cache";
import { CachedItem } from "../../general/loading/CachedItem";


export function CodeViewer({file, sendComment}: FileViewerProperties) {
    const {fileComments} = useFileComments(file.references.submissionID, file.ID);
    const {fileBody} = useFileBody(file.ID);
    const history = useHistory();
    
    // TODO: refresh comments

	const getSnippets = (threads: Array<CacheItem<CommentThread>>) => {
		const snippets: SnippetHighlight[] = [];
		for (const commentThread of threads) {
			if (commentThread.item.snippet !== undefined) {
				snippets.push({
					onClick: () => {
						console.log("clicked comment");
						history.push(`/submission/${file.references.submissionID}/${file.ID}/comments#${commentThread.item.ID}`);
					},
					...commentThread.item.snippet
				});
			}
        }
        return snippets;
    };
    
	const handleCommentSend = async(comment: string, restricted: boolean, selection: Selection) => {
		return sendComment(comment, restricted, selection);
    };

    const snippets = useMemo(() => getSnippets(fileComments.items), [fileComments]);

	return (
		<div className="mb-6">
			<CachedItem item={fileBody}>{body =>
                <CommentSelector<HighlightedCodeProperties>
                    codeViewer={HighlightedCode}
                    codeProperties={{code: body, snippets, options: {mode: file.type}}}
                    mentions={{courseID: file.references.courseID}}
                    sendHandler={handleCommentSend}
                />
            }</CachedItem>
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