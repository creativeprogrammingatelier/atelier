import React from "react";
import {Snippet} from "../../../../models/api/Snippet";
import {MINIMIZED_LINES} from "../../../../helpers/SnippetHelper";
import {Code} from "./Code";

interface SnippetProperties {
    snippet: Snippet,
    expanded?: boolean
}
/**
 * Returns Code component with the snippet code
 */
export function Snippet({snippet, expanded}: SnippetProperties) {
    const completeSnippet: string[] = snippet.body.split("\r").join("").split("\n");

    const databaseTop: string = snippet.contextBefore;
    const linesTop: number = (databaseTop.split("\r").join("").split("\n").length);
    const databaseBottom: string = snippet.contextAfter;

    const preLines: string = databaseTop;
    const mainLines: string = completeSnippet.slice(0, Math.min(completeSnippet.length, MINIMIZED_LINES)).join("\n");
    const postLines: string = completeSnippet.slice(MINIMIZED_LINES).join("\n") + databaseBottom;

    return <Code
        code={expanded ? preLines + mainLines + "\n" + postLines : mainLines}
        options={{
            mode: snippet.file.type,
            firstLineNumber: expanded ? snippet.start.line + 2 - linesTop : snippet.start.line + 1,
            readOnly: "nocursor"
        }}
    />;
}
