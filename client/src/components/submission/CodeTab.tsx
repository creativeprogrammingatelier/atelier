import React, {useEffect, useState} from "react";
import {File} from "../../../../models/api/File";
import {ScrollHelper} from "../../helpers/ScrollHelper";
import {createFileCommentThread, getFileComments} from "../../../helpers/APIHelper";
import {JsonFetchError} from "../../../helpers/FetchHelper";
import {CommentThread} from "../../../../models/api/CommentThread";
import {CommentSelector} from "../comment/CommentSelector";
import {HighlightedCode, HighlightedCodeProperties} from "../code/HighlightedCode";
import {useHistory} from "react-router-dom";
import {Selection} from "../../../../models/api/Snippet";
import {SnippetHighlight} from "./FileOverview";
import {threadState} from "../../../../models/enums/threadStateEnum";

export interface FileComment {
	startLine: number,
	startCharacter: number,
	endLine: number,
	endCharacter: number,
	onClick: Function,
	commentID: number
}
interface CodeTabProperties {
	submissionID: string,
	file: File,
	body: string,
	comments?: FileComment[],
}
export function CodeTab({file, body, submissionID}: CodeTabProperties) {
	const [commentThreads, setCommentThreads] = useState([] as CommentThread[]);
	const [snippets, setSnippets] = useState([] as SnippetHighlight[]);
	const history = useHistory();

	const getCommentThreads = () => {
		try {
			getFileComments(file.ID).then(commentThreads => {
				setCommentThreads(commentThreads)
			});
		} catch (error) {
			if (error instanceof JsonFetchError) {
				console.log(error);
				// TODO: Give error to the user
			} else {
				throw error;
			}
		}
	};
	const getSnippets = () => {
		const snippets: SnippetHighlight[] = [];
		for (const commentThread of commentThreads) {
			if (commentThread.snippet !== undefined) {
				snippets.push({
					onClick: () => {
						console.log("clicked comment");
						history.push(`/submission/${submissionID}/${file.ID}/comments#${commentThread.ID}`);
					},
					...commentThread.snippet
				});
			}
		}
		setSnippets(snippets);
	};
	const handleCommentSend = async(comment: string, selection: Selection, restricted: boolean) => {
		try {
			const commentThread = await createFileCommentThread(file.ID, {
				submissionID,
				comment,
				snippet: selection,
				visibility: restricted ? threadState.private : threadState.public
			});
			setCommentThreads(commentThreads => [
				...commentThreads,
				commentThread
			]);
			return true;
		} catch (error) {
			if (error instanceof JsonFetchError) {
				// TODO: handle error for the user
				console.log(error);
			} else {
				throw error;
			}
		}
		return false;
	};

	useEffect(getCommentThreads, []);
	useEffect(getSnippets, [commentThreads]);

	return <div className="contentTab">
		<div className="m-3 mb-6">
			<CommentSelector<HighlightedCodeProperties> codeViewer={HighlightedCode} codeProperties={{code: body, snippets}} sendHandler={handleCommentSend}/>
		</div>
	</div>;
}