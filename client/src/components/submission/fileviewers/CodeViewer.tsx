import React, {useEffect, useState} from "react";
import {File} from "../../../../../models/api/File";
import {getFileComments, getFileContents} from "../../../../helpers/APIHelper";
import {JsonFetchError} from "../../../../helpers/FetchHelper";
import {CommentThread} from "../../../../../models/api/CommentThread";
import {CommentSelector} from "../../comment/CommentSelector";
import {HighlightedCode, HighlightedCodeProperties, SnippetHighlight} from "../../code/HighlightedCode";
import {useHistory} from "react-router-dom";
import {Selection} from "../../../../../models/api/Snippet";
import {FileViewer, FileViewerProperties} from "../FileOverview";
import {Loading} from "../../general/loading/Loading";
import {FiCode} from "react-icons/all";
import {Floater} from "../../general/Floater";
import {FeedbackError} from "../../feedback/FeedbackError";
import {FeedbackContent} from "../../feedback/Feedback";

export function CodeViewer({file, sendComment}: FileViewerProperties) {
	const [commentThreads, setCommentThreads] = useState([] as CommentThread[]);
	const [snippets, setSnippets] = useState([] as SnippetHighlight[]);
	const [error, setError] = useState(false as FeedbackContent);
	const history = useHistory();

	const getCommentThreads = () => {
		try {
			getFileComments(file.ID).then(commentThreads => {
				setCommentThreads(commentThreads);
			});
		} catch (error) {
			if (error instanceof JsonFetchError) {
				setError(`Could not load existing comments`);
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
					onClick: () => history.push(`/submission/${file.references.submissionID}/${file.ID}/comments#${commentThread.ID}`),
					...commentThread.snippet
				});
			}
		}
		setSnippets(snippets);
	};
	const handleCommentSend = async(comment: string, restricted: boolean, selection: Selection) => {
		try {
			const commentThread = await sendComment(comment, restricted, selection);
			setCommentThreads(commentThreads => [
				...commentThreads,
				commentThread
			]);
			return true;
		} catch (error) {
			if (error instanceof JsonFetchError) {
				setError(`Could not create comment: ${error}`);
			} else {
				throw error;
			}
		}
		return false;
	};

	useEffect(getCommentThreads, []);
	useEffect(getSnippets, [commentThreads]);

	return (
		<div className="mb-6">
			<Loading<string>
				loader={getFileContents}
				params={[file.ID]}
				component={body =>
					<CommentSelector<HighlightedCodeProperties>
						codeViewer={HighlightedCode}
						codeProperties={{code: body, snippets, options: {mode: file.type}}}
						mentions={{courseID: file.references.courseID}}
						sendHandler={handleCommentSend}
					/>
				}
			/>
			<Floater right={0} left={0} bottom={44} className="mx-2 my-1">
				<FeedbackError close={setError} timeout={4000}>{error}</FeedbackError>
			</Floater>
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