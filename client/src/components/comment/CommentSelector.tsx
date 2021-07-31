import React, {useState, Fragment} from "react";
import {FiPlus} from "react-icons/all";
import {Button} from "react-bootstrap";
import {Editor} from "codemirror";
import {Controlled as CodeMirror} from "react-codemirror2";

import {Selection, noSelection} from "../../../../models/api/Snippet";

import {CodeSelection} from "../code/Code";
import {Block} from "../general/Block";
import {Floater} from "../general/Floater";
import {CommentCreator} from "./CommentCreator";

interface MentionProperties {
	/** CourseID of Mention */
	courseID: string
}
interface CommentSelectorProperties<T> {
	/** Code Viewer function */
	codeViewer: (properties: T) => JSX.Element,
	/** Code properties */
	codeProperties: T,
	/** Mentions */
	mentions?: MentionProperties,
	/** Function that handles sending comments */
	sendHandler: (comment: string, restricted: boolean, selection: Selection) => Promise<boolean>
}
export function CommentSelector<T>({codeViewer, codeProperties, mentions, sendHandler}: CommentSelectorProperties<T>) {
    const [selecting, setSelecting] = useState(false);
    const [selection, setSelection] = useState(noSelection);
    const [selectionText, setSelectionText] = useState("");
	
    /**
	 * We can return false to cancel the internal event of the HighlightedCode, which we want to do
	 * if we are selecting.
	 */
    const handleClick = () => !selecting;
    /**
	 * Handles selection changes
	 * @param editor, codemirror editor instance
	 * @param data, data from the selection
	 */
    const handleSelect = (editor: Editor, data: CodeSelection) => {
        // Get the selection range and sort it
        const range = [data.ranges[0].head, data.ranges[0].anchor];
        range.sort((a: CodeMirror.Position, b: CodeMirror.Position) => (a.line !== b.line) ? a.line - b.line : a.ch - b.ch);
		
        // Update selection position state
        setSelection({
            start: {
                line: range[0].line,
                character: range[0].ch
            },
            end: {
                line: range[1].line,
                character: range[1].ch
            }
        });
        setSelectionText(editor.getRange(range[0], range[1], "\r\n"));
    };
	
    return <Fragment>
        <Block>
            {codeViewer({
                ...codeProperties, ...{
                    handleClick,
                    handleSelect,
                    selecting
                }
            })}
        </Block>
        {selecting ?
        /*
			 Why the weird bottom offset?
			 28px for the fixed height of the icons in the tab bar
			 1rem for the padding of the tab bar
			 0.5rem margin for the comment creator
			 */
            <Floater right={0} bottom={"calc(28px + 1.5rem)"} width="-webkit-fill-available" height="3rem"
                className="mx-n2 my-2 mb-n2">
                <CommentCreator
                    placeholder={selectionText.length === 0 ? "Make a selection" : "Write your comment"}
                    large
                    round
                    allowRestricted
                    mentions={mentions}
                    sendHandler={(comment, restricted) => {
                        setSelecting(false);
                        return sendHandler(comment, restricted, selection);
                    }}
                />
            </Floater>
            :
            <Floater right={0} bottom={"calc(28px + 1.5rem)"} width="3rem" height="3rem"
                className="mx-n2 my-2 mb-n2 text-right">
                <Button className="round" onClick={() => setSelecting(true)}><FiPlus size={22}/> New comment</Button>
            </Floater>
        }
    </Fragment>;
}