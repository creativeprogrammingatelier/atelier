import React, {useState, useEffect, useRef} from "react";

import {MentionSuggestions} from "./MentionSuggestions";
import {Button} from "react-bootstrap";

interface WriteCommentProperties {
	placeholder: string,
	internalButton?: boolean,
	/** This function will be called when a new comment is created */
	newCommentCallback: (text: string) => void
}

export function WriteComment({placeholder, internalButton, newCommentCallback}: WriteCommentProperties) {
	const [text, updateText] = useState("");
	const [caretPosition, updateCaretPosition] = useState(0);
	const [mentionIndex, updateMentionIndex] = useState(undefined as number | undefined);
	const [suggestionBase, updateSuggestionBase] = useState("");

	const textarea = useRef(null as (HTMLTextAreaElement | null));

	// Poll every 100ms for the location of the caret in the textarea and update
	// the caretPosition property
	useEffect(() => {
		setInterval(() => {
			if (textarea.current !== null) {
				updateCaretPosition(textarea.current.selectionStart);
			}
		}, 100);
	}, []);

	// Check of the current caret position is after an @ and check for mention
	// suggestions using the text after @ up to the position of the caret
	useEffect(() => {
		function allIndexesOf(text: string, findChar: string) {
			return Array.from(text)
				.map((char, index) => ({char, index}))
				.filter(pair => pair.char === findChar)
				.map(pair => pair.index);
		}

		updateMentionIndex(allIndexesOf(text, "@").reverse().find(index => index < caretPosition));
		if (mentionIndex !== undefined) {
			// Cut off the @ sign from the suggestionBase
			updateSuggestionBase(text.substring(mentionIndex + 1, caretPosition));
		} else {
			updateSuggestionBase("");
		}
	}, [caretPosition]);

	const handleSubmit = (event: React.FormEvent) => {
		if (text !== null && text.trim() !== "") {
			// TODO: submit comment to server
			if (newCommentCallback) {
				newCommentCallback(text);
			}
			updateText("");
		}
		event.preventDefault();
	};

	function handleMentionSelected(name: string) {
		if (mentionIndex !== undefined) {
			const textWithMention = text.substring(0, mentionIndex + 1) + name + " ";
			const textAfter = text.substring(caretPosition);
			updateText(textWithMention + textAfter);
			if (textarea.current !== null) {
				const position = textWithMention.length;
				// Set focus back to the input textarea
				textarea.current.focus();
				// Set the caret back to the position after the insertion
				// This happens with a 1 ms delay, otherwise the caret
				// appears at the end of the textarea
				setTimeout(() => textarea.current && textarea.current.setSelectionRange(position, position), 1);
			}
		}
	}

	return (
		<form onSubmit={handleSubmit} className="position-relative" id="commentCreator">
            <textarea
	            className="px-2 py-1"
				name="text"
				value={text}
	            placeholder={placeholder}
				onChange={e => updateText(e.target.value)}
				ref={textarea}
            />
			{(internalButton === undefined || internalButton) && <Button>Submit</Button>}
			<MentionSuggestions
				suggestionBase={suggestionBase}
				onSelected={handleMentionSelected}
			/>
		</form>
	);
}