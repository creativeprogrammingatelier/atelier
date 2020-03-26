import React, {useEffect, useState} from "react";
import {File} from "../../../../../models/api/File";
import {ScrollHelper} from "../../../helpers/ScrollHelper";
import {createFileCommentThread, getFileComments, getFileContents} from "../../../../helpers/APIHelper";
import {JsonFetchError} from "../../../../helpers/FetchHelper";
import {CommentThread} from "../../../../../models/api/CommentThread";
import {CommentSelector} from "../../comment/CommentSelector";
import {HighlightedCode, HighlightedCodeProperties} from "../../code/HighlightedCode";
import {useHistory} from "react-router-dom";
import {Selection, Snippet} from "../../../../../models/api/Snippet";
import {FileProperties} from "../FileOverview";
import {threadState} from "../../../../../models/enums/threadStateEnum";
import {Loading} from "../../general/loading/Loading";

export interface SnippetHighlight extends Snippet {
	onClick: Function,
}

export function CodeTab({file}: FileProperties) {
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
						history.push(`/submission/${file.references.submissionID}/${file.ID}/comments#${commentThread.ID}`);
					},
					...commentThread.snippet
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
		console.log("SubmissionID: " + file.references.submissionID);

		try {
			const thread = await createFileCommentThread(file.ID, {
				submissionID: file.references.submissionID,
				comment,
				snippet: selection,
				visibility: restricted ? threadState.private : threadState.public
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

	useEffect(getCommentThreads, []);
	useEffect(getSnippets, [commentThreads]);

	return (
        <div className="contentTab">
            <div className="m-3 mb-6">
                <Loading<string>
                    loader={getFileContents}
                    params={[file.ID]}
                    component={body =>
                        <CommentSelector<HighlightedCodeProperties> 
                            codeViewer={HighlightedCode} 
                            codeProperties={{code: body, snippets}} 
                            sendHandler={addComment} />
                    } />
            </div>
        </div>
    );
}

export function codeTabCanHandle(file: File) {
    return file.type.startsWith("text/");
}