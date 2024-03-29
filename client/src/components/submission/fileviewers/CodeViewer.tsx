import React, {useState, Fragment} from "react";
import {useHistory} from "react-router-dom";
import {FiCode} from "react-icons/all";
import {useObservable} from "observable-hooks";
import {map} from "rxjs/operators";

import {CommentThread} from "../../../../../models/api/CommentThread";
import {File} from "../../../../../models/api/File";
import {Selection} from "../../../../../models/api/Snippet";

import {useFileComments, useFileBody, useCollectionCombined, Refresh} from "../../../helpers/api/APIHooks";

import {HighlightedCode, HighlightedCodeProperties, SnippetHighlight} from "../../code/HighlightedCode";
import {CommentSelector} from "../../comment/CommentSelector";
import {FeedbackError} from "../../feedback/FeedbackError";
import {FeedbackContent} from "../../feedback/Feedback";
import {Cached} from "../../general/loading/Cached";
import {Floater} from "../../general/Floater";
import {FileViewer, FileViewerProperties} from "../FileOverview";

/**
 * Component for viewing a source file, highlighted snippets of comments.
 */
export function CodeViewer({file, sendComment}: FileViewerProperties) {
    const [error, setError] = useState(false as FeedbackContent);
    const history = useHistory();
    const fileBody = useFileBody(file.ID);
    const fileComments = useFileComments(file.references.submissionID, file.ID);
    const combinedCommentsObservable = useCollectionCombined(fileComments.observable);
    const snippetsObservable = useObservable(() => combinedCommentsObservable.pipe(map(item => ({...item, value: getSnippets(item.value)}))), [combinedCommentsObservable]);
    const snippets: Refresh<SnippetHighlight[]> = {
        observable: snippetsObservable,
        defaultTimeout: fileComments.defaultTimeout,
        refresh: fileComments.refresh
    };

    /**
     * Function to get all code snippets of from the given threads.
     *
     * @param threads Comment threads.
     */
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
    /**
     * Function for handling creating a new comment.
     *
     * @param comment Comment to be sent.
     * @param restricted Whether the comment is retracted, i.e. only visible to teachers and TAs.
     * @param selection Snippets selection of comment.
     * @returns False if it fails and true if it succeeds.
     */
    const handleCommentSend = async(comment: string, restricted: boolean, selection: Selection) => sendComment(comment, restricted, selection).then(feedback => {
        if (feedback.type === "error") {
            setError(feedback.content);
            return false;
        }
        // Maybe a success message can be added, although a highlighted snippet should appear to indicate success
        return true;
    });

    return <Fragment>
        <Cached cache={snippets}>
            {snippets =>
                <Cached cache={fileBody}>
                    {body =>
                        <CommentSelector<HighlightedCodeProperties>
                            codeViewer={HighlightedCode}
                            codeProperties={{code: body, snippets, selecting: false, options: {mode: file.type}}}
                            mentions={{courseID: file.references.courseID}}
                            sendHandler={handleCommentSend}
                        />
                    }
                </Cached>
            }
        </Cached>
        <Floater right={0} left={0} bottom={44} className="mx-2 my-1">
            <FeedbackError close={setError} timeout={4000}>{error}</FeedbackError>
        </Floater>
    </Fragment>;
}

/**
 * Function for whether given file viewer accepts given file type.
 *
 * @param type File type to be parsed.
 */
function acceptsType(type: string) {
    return type.startsWith("text/");
}
/**
 * Function to check if the file viewer accepts given file.
 *
 * @param file File to be parsed.
 */
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
