import React, {useEffect} from "react";
import * as codemirror from "codemirror";
import {Controlled as CodeMirror} from "react-codemirror2";
import "codemirror/mode/clike/clike.js";
import "codemirror/lib/codemirror.css";

import "../../styles/codemirror.scss";

import {ScrollHelper} from "../../helpers/ScrollHelper";

// TODO: Resolve inconsistent naming around Controlled, CodeMirror and codemirror

export interface CodeSelection {
    /** Range of code within code selection */
    ranges: Array<{
        /** Starting position of code selection */
        head: CodeMirror.Position,
        /** End position of code selection */
        anchor: CodeMirror.Position
    }>
}

export interface CodeProperties {
    /** Code in string format */
    code: string,
    /** Options for configuring CodeMirror */
    options?: codemirror.EditorConfiguration,
    /** Initialization Handler */
    handleInitialize?: (editor: codemirror.Editor) => void,
    /** Handler for onSelect */
    handleSelect?: (editor: codemirror.Editor, data: CodeSelection) => void | boolean,
    /** Handler for onMouseDown */
    handleClick?: (editor: codemirror.Editor, event: Event) => void | boolean,
    /** Handler for onChange */
    handleChange?: (editor: codemirror.Editor, data: codemirror.EditorChange, value: string) => void | boolean
}

/**
 * Returns the CodeMirror with the code inside.
 *
 * @param code Code to be passed into CodeMirror
 * @param options Options for configuring CodeMirror
 */
export function Code(
    {
        code,
        options = {},
        handleInitialize = defaultHandler,
        handleSelect = defaultHandler,
        handleClick = defaultHandler,
        handleChange = defaultHandler
    }: CodeProperties
) {
    useEffect(() => ScrollHelper.scrollToHash(), []);

    /**
     * Add ID's to line in the code to allow #lineNumber in the url
     */
    function setLineIDs() {
        const codeLines = document.getElementsByClassName("CodeMirror-code")[0].childNodes;
        let lineNumber = 1;
        for (const codeLine of codeLines) {
            (codeLine as Element).id = `${lineNumber++}`;
        }
    }

    // Define syntax highlighting for MIME types
    codemirror.defineMIME("text/x-processing", "text/x-java");

    return <CodeMirror
        value={code}
        options={{...defaultOptions, ...options}}
        editorDidMount={editor => {
            // Standard code viewer initialization
            editor.setSize("100%", "100%");
            setLineIDs();

            // Given initialization
            handleInitialize(editor);
        }}
        onSelection={handleSelect}
        onMouseDown={handleClick}
        onTouchStart={handleClick}
        onBeforeChange={handleChange}
        onChange={handleChange}
    />;
}

/**
 * Default configuration for CodeMirror
 */
export const defaultOptions = {
    mode: "text/x-java",
    theme: "atelyay",
    lineNumbers: true,
    tabSize: 4,
    indentUnit: 4,
    indentWithTabs: true
};
/**
 * Default Handler
 */
// The default handler doesn't do anything, so it should be empty
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const defaultHandler = () => {};
