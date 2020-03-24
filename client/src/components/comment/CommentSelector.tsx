import React, {useState, Fragment} from "react";
import {FiSend, FiTag} from "react-icons/all";
import {Button} from "react-bootstrap";
import {Floater} from "../general/Floater";
import {CommentCreator} from "./CommentCreator";
import {Editor} from "codemirror";
import {Controlled as CodeMirror} from "react-codemirror2";
import {CodeProperties, CodeSelection} from "../code/Code";
import {Selection, noSelection} from "../../../../models/api/Snippet";

interface CommentSelectorProperties<T> {
	codeViewer: (properties: T) => JSX.Element,
	codeProperties: T,
	sendHandler: (comment: string, selection: Selection, restricted: boolean) => Promise<boolean>
}
export function CommentSelector<T>({codeViewer, codeProperties, sendHandler}: CommentSelectorProperties<T>) {
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
		setSelectionText(editor.getRange(range[0], range[1], '\r\n'));
	};

	return <Fragment>
		{codeViewer({...codeProperties, ...{
			handleClick,
			handleSelect
		}})}
		{selecting ?
			<Floater bottom={44} left={0} width="-webkit-fill-available" height="3rem" className="m-2">
				<CommentCreator
					placeholder={selectionText.length === 0 ? "Make a selection" : "Write your comment"}
					large
					round
					allowRestricted
					sendHandler={(comment, restricted) => {
						console.log("Creating new comment: " + comment + ", restricted: " + restricted);
						console.log("Selected code:");
						console.log(selectionText);
						return sendHandler(comment, selection, restricted);
					}}
				/>
			</Floater>
			:
			<Floater right={0} bottom={44} width="3rem" height="3rem" className="m-2">
				<Button className="round" onClick={() => setSelecting(true)}><FiTag size={22}/></Button>
			</Floater>
		}
	</Fragment>
}