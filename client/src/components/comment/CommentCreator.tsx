import React, {useEffect, useRef, useState} from "react";
import {Button, Form, FormControl, InputGroup} from "react-bootstrap";
import {FiEye, FiEyeOff, FiSend} from "react-icons/all";
import {Controlled as CodeMirror} from "react-codemirror2";
import {MentionSuggestions} from "./MentionSuggestions";
import {User} from "../../../../models/api/User";

interface MentionProperties {
	courseID: string
}
interface CommentCreatorProperties {
	placeholder?: string,
	transparent?: boolean,
	large?: boolean,
	round?: boolean,
	allowRestricted?: boolean,
	code?: CodeMirror.Editor,
	mentions?: MentionProperties
	sendHandler: (comment: string, restricted: boolean) => Promise<boolean>
}
export function CommentCreator({placeholder = "Write a comment", transparent, large, round, allowRestricted, mentions, sendHandler}: CommentCreatorProperties) {
	const [comment, setComment] = useState("");
	const [restricted, setRestricted] = useState(false);
	const [sending, setSending] = useState(false);
	const [shift, setShift] = useState(false);
	const [caretPosition, setCaretPosition] = useState(0);
	const [mentionIndex, updateMentionIndex] = useState(undefined as number | undefined);
	const [suggestionBase, updateSuggestionBase] = useState("");
	const input = useRef(null as (HTMLInputElement & FormControl<"input"> | null));

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Shift") {
			setShift(true);
		}
		if (event.key === "Enter") {
			// Pressing enter by default does some weird redirect thing, cancel that
			event.preventDefault();
			if (shift) {
				// Instead, we want it to add a new line to the input if shift is held
				// TODO: However, only textarea's accept new lines, so fix that at some point
				setComment(comment => comment + "\n");
			} else if (event.key === "Enter") {
				// Or submit the comment if not. There is an undefined promise resolve to make warnings go away
				handleCommentSubmit().then(undefined);
			}
		}
	};
	const handleKeyUp = (event: React.KeyboardEvent) => {
		if (event.key === "Shift") {
			setShift(false);
		}
	};
	const handleCommentChange = (event: React.FormEvent<HTMLInputElement>) => setComment((event.target as HTMLInputElement).value);
	const handleCommentSubmit = async() => {
		if (!sending) {
			setSending(true);

			if (await sendHandler(comment, restricted)) {
				setComment("");
			}

			setSending(false);
		}
	};
	const handleMentionSelected = (name: string) => {
		if (mentionIndex !== undefined) {
			const textWithMention = comment.substring(0, mentionIndex + 1) + name + " ";
			const textAfter = comment.substring(caretPosition);
			setComment(textWithMention + textAfter);
			if (input.current !== null) {
				const position = textWithMention.length;
				// Set focus back to the input textarea
				input.current.focus();
				// Set the caret back to the position after the insertion
				// This happens with a 1 ms delay, otherwise the caret
				// appears at the end of the textarea
				setTimeout(() => input.current && input.current.setSelectionRange(position, position), 1);
			}
		}
	};

	useEffect(() => {
		// Poll every 100ms for the location of the caret in the textarea and update
		// the caretPosition property
		setInterval(() => {
			if (input.current !== null && input.current.selectionStart !== null) {
				setCaretPosition(input.current.selectionStart);
			}
		}, 100);
	}, []);
	useEffect(() => {
		// Check of the current caret position is after an @ and check for mention
		// suggestions using the text after @ up to the position of the caret
		function allIndexesOf(text: string, findChar: string) {
			return Array.from(text)
			.map((char, index) => ({char, index}))
			.filter(pair => pair.char === findChar)
			.map(pair => pair.index);
		}

		updateMentionIndex(allIndexesOf(comment, "@").reverse().find(index => index < caretPosition));
		if (mentionIndex !== undefined) {
			// Cut off the @ sign from the suggestionBase
			updateSuggestionBase(comment.substring(mentionIndex + 1, caretPosition));
		} else {
			updateSuggestionBase("");
		}
	}, [caretPosition]);

	return <Form className={"commentCreator" + (large ? " commentCreatorLarge" : "") + (round ? " commentCreatorRound" : "") + (restricted ? " restricted" : "") + (transparent ? " bg-transparent" : "")}>
		<Form.Group>
			<InputGroup className="bg-transparent">
				<Form.Control
					type="text"
					placeholder={placeholder}
					className={"bg-transparent" + (round ? " pl-3" : "")}
					value={comment}
					onChange={handleCommentChange}
					onKeyDown={handleKeyDown}
					onKeyUp={handleKeyUp}
					ref={input}
				/>
				<InputGroup.Append>
					{allowRestricted && <Button onClick={() => setRestricted(!restricted)}>{restricted ? <FiEyeOff size={14} color="#FFFFFF"/> : <FiEye size={14} color="#FFFFFF"/>}</Button>}
					<Button onClick={handleCommentSubmit} disabled={sending}><FiSend size={14} color="#FFFFFF"/></Button>
				</InputGroup.Append>
				{mentions &&
					<MentionSuggestions
						prefix='@'
						suggestionBase={suggestionBase}
						round={round}
						courseID={mentions.courseID}
						onSelected={(user : User) => handleMentionSelected(user.name)}
					/>
				}
			</InputGroup>
		</Form.Group>
	</Form>;
}