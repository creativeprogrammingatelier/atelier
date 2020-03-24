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

export interface FileComment {
	startLine: number,
	startCharacter: number,
	endLine: number,
	endCharacter: number,
	onClick: Function,
	commentID: number
}

export interface FileSnippet {
	startLine: number,
	startCharacter: number,
	endLine: number,
	endCharacter: number,
	onClick: Function,
	snippetID: string,
	commentThreadID: string
}

interface CodeProperties {
	submissionID: string,
	file: File,
	body: string,
	comments?: FileComment[],
}

export function CodeTab({file, body, submissionID}: CodeProperties) {
	const [commentThreads, setCommentThreads] = useState([] as CommentThread[]);
	const [snippets, setSnippets] = useState([] as FileSnippet[]);
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
		const snippets: FileSnippet[] = [];
		for (const commentThread of commentThreads) {
			if (commentThread.snippet !== undefined) {
				snippets.push({
					startLine: commentThread.snippet.start.line,
					startCharacter: commentThread.snippet.start.character,
					endLine: commentThread.snippet.end.line,
					endCharacter: commentThread.snippet.end.character,
					onClick: () => {
						console.log("clicked comment");
						history.push(`/submission/${submissionID}/${file.ID}/comments#${commentThread.ID}`);
					},
					snippetID: commentThread.snippet.ID,
					commentThreadID: commentThread.ID
				});
			}
		}
		setSnippets(snippets);
	};
	/**
	 * Create a comment
	 */
	const addComment = async(comment: string, selection: Selection, restricted: boolean) => {
		console.log("Adding comment\n----------------");

		console.log("Selection: ");
		console.log(selection);
		console.log("Comment body: " + comment);
		console.log("SubmissionID: " + submissionID);

		try {
			const thread = await createFileCommentThread(file.ID, {
				submissionID,
				commentBody: comment,
				snippet: {
					lineStart: selection.start.line,
					lineEnd: selection.start.character,
					charStart: selection.end.line,
					charEnd: selection.end.character
				}
			});
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

	useEffect(ScrollHelper.scrollToHash, []);
	useEffect(getCommentThreads, []);
	useEffect(getSnippets, [commentThreads]);

	return <div className="contentTab">
		<div className="m-3 mb-6">
			{/*<CodeViewer*/}
			{/*	submissionID={submissionID}*/}
			{/*	file={file}*/}
			{/*	fileContents={body}*/}
			{/*/>*/}
			<CommentSelector<HighlightedCodeProperties> codeViewer={HighlightedCode} codeProperties={{code: body, snippets}} sendHandler={addComment}/>
		</div>
	</div>;
}