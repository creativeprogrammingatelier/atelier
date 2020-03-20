import './Extensions';

/** Amount of lines to display on a minimized snippet */
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

/** Get the snippet body and context from the full file body */
export function getContextLines(fileContent : string, lineStart : number, lineEnd : number) {
    const lines = fileContent.split(/\r\n|\n/);

    const snippetLength = lineEnd - lineStart + 1;
    const isSmallSnippet = snippetLength <= SMALL_SNIPPET_LINES;

    const topMargin = isSmallSnippet ? SMALL_SNIPPET_LINES_ABOVE : LARGE_SNIPPET_LINES_ABOVE;
    const btmMargin = isSmallSnippet ? SMALL_SNIPPET_LINES_BELOW : LARGE_SNIPPET_LINES_BELOW;

    const contextBefore = lines
        .slice(lineStart - topMargin, lineStart)
        .skipWhile(line => line.trim() === "")
        .join('\n') + '\n';

    const body = lines
        .slice(lineStart, lineEnd + 1)
        .join('\n');

    const contextAfter = '\n' + lines
        .slice(lineEnd + 1, lineEnd + 1 + btmMargin)
        .reverse()
        .skipWhile(line => line.trim() === "")
        .reverse()
        .join('\n');

    return { contextBefore, body, contextAfter };
}