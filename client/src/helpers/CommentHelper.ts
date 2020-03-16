/** Amount of lines to display when minimized*/
import {Editor} from "codemirror";

export const MINIMIZED_LINES = 3;
/** Amount of lines inclusive that count as a small snippet */
const SMALL_SNIPPET_LINES = 3;
/** Amount of context lines to show above for a small snippet */
const SMALL_SNIPPET_LINES_ABOVE = 2;
/** Amount of context lines to show below for a small snippet */
const SMALL_SNIPPET_LINES_BELOW = 2;
/** Amount of context lines to show above for a small snippet */
const LARGE_SNIPPET_LINES_ABOVE = 0;
/** Amount of context lines to show below for a small snippet */
const LARGE_SNIPPET_LINES_BELOW = 0;

export function getContextLines(codeMirror : Editor, lineStart : number, lineEnd : number) {
    const snippetLength : number = lineEnd - lineStart + 1;
    const smallSnippet : boolean = snippetLength <= SMALL_SNIPPET_LINES;

    const topMargin : number = smallSnippet ? SMALL_SNIPPET_LINES_ABOVE : LARGE_SNIPPET_LINES_ABOVE;
    const btmMargin : number = smallSnippet ? SMALL_SNIPPET_LINES_BELOW : LARGE_SNIPPET_LINES_BELOW;

    const centerEnd : number = Math.min(lineEnd + 1, lineStart + MINIMIZED_LINES);

    const contextBefore : string = codeMirror.getRange(
        {line : lineStart - topMargin, ch : 0},
        {line : lineStart, ch : 0}
    );
    const center = codeMirror.getRange(
        {line : lineStart, ch : 0},
        {line : lineEnd + 1, ch : 0}
    );
    const contextAfter = codeMirror.getRange(
        {line : lineEnd + 1, ch : 0},
        {line : lineEnd + 1 + btmMargin, ch : 0}
    );

    return {
        contextBefore,
        center,
        contextAfter
    }
}

export function getCommentLines(fileContent : string[], lineStart : number, lineEnd : number) {
    const totalLines : number = fileContent.length;

    // Get margins for the snippet
    const snippetLength : number = (lineEnd - lineStart + 1);
    const smallSnippet : boolean = snippetLength <= SMALL_SNIPPET_LINES;
    let topMargin : number = smallSnippet ? SMALL_SNIPPET_LINES_ABOVE : LARGE_SNIPPET_LINES_ABOVE;
    let bottomMargin : number = smallSnippet ? SMALL_SNIPPET_LINES_BELOW : LARGE_SNIPPET_LINES_BELOW;
    topMargin = Math.min(topMargin, lineStart);
    bottomMargin = Math.min(bottomMargin, totalLines - 1 - lineEnd);

    // Corresponding lines in the file
    const fileLineStart = lineStart - topMargin;
    const fileLineEnd = lineEnd + bottomMargin + 1;

    // Main lines to highlight first
    const mainLineStart = topMargin;
    const mainLineEnd = topMargin + Math.min(MINIMIZED_LINES, snippetLength);

    return {
        fullText : fileContent.slice(fileLineStart, fileLineEnd),
        mainLines : [mainLineStart, mainLineEnd],
        fileLines : [fileLineStart, fileLineEnd]
    }
}

/** Reference for creating context on a snippet until new system in place */
// let snippet : ModelSnippet | undefined = undefined;
// if (thread.snippet != undefined && body != undefined && file != undefined) {
// 	// Parse body into lines
// 	const fileContent : string[] = body.replace('\r', '').split('\n');
// 	const totalLines : number = fileContent.length;
//
// 	// Get snippet data
// 	const threadSnippet = thread.snippet;
// 	const lineStart : number = threadSnippet.start.line;
// 	const lineEnd : number = threadSnippet.end.line;
//
// 	// Get margins for the snippet
// 	const snippetLength : number = (lineEnd - lineStart + 1);
// 	const smallSnippet : boolean = snippetLength <= SMALL_SNIPPET_LINES;
// 	let topMargin : number = smallSnippet ? SMALL_SNIPPET_LINES_ABOVE : LARGE_SNIPPET_LINES_ABOVE;
// 	let bottomMargin : number = smallSnippet ? SMALL_SNIPPET_LINES_BELOW : LARGE_SNIPPET_LINES_BELOW;
// 	topMargin = Math.min(topMargin, lineStart);
// 	bottomMargin = Math.min(bottomMargin, totalLines - 1 - lineEnd);
//
// 	// Corresponding lines in the file
// 	const fileLineStart = lineStart - topMargin;
// 	const fileLineEnd = lineEnd + bottomMargin + 1;
//
// 	// Main lines to highlight first
// 	const mainLineStart = topMargin;
// 	const mainLineEnd = topMargin + Math.min(MINIMIZED_LINES, snippetLength);
//
// 	snippet = {
// 		submissionId : submissionID,
// 		fullText : fileContent.slice(fileLineStart, fileLineEnd),
// 		mainLines : [mainLineStart, mainLineEnd],
// 		fileId : file.ID,
// 		fileLines : [fileLineStart, fileLineEnd]
// 	};
// }