import React, { useState, useEffect, useRef } from 'react';
import { FiNavigation } from 'react-icons/fi';

import { MentionSuggestions } from './MentionSuggestions';

interface WriteCommentProperties { 
    /** This function will be called when a new comment is created */
    newCommentCallback: (text: string) => void
}

export function WriteComment({ newCommentCallback }: WriteCommentProperties) {
    const [text, updateText] = useState("");
    const [caretPosition, updateCaretPosition] = useState(0);
    const [suggestionBase, updateSuggestionBase] = useState("");

    const textarea = useRef(null as (HTMLTextAreaElement | null));

    const handleSubmit = (event: React.FormEvent) => {
        if (text !== null && text.trim() !== "") {
            // TODO: submit comment to server
            if (newCommentCallback) { 
                newCommentCallback(text);
            }
            updateText("");
        }
        event.preventDefault();
    }

    // Poll every 100ms for the location of the caret in the textarea and update
    // the caretPosition property
    useEffect(() => {
        setInterval(() => {
            if (textarea.current !== null) {
                updateCaretPosition(textarea.current.selectionStart);
            }
        }, 100)
    }, [])

    // Check of the current caret position is after an @ and check for mention
    // suggestions using the text after @ up to the position of the caret
    useEffect(() => {
        function allIndexesOf(text: string, findChar: string) {
            return Array.from(text)
            .map((char, index) => ({ char, index }))
            .filter(pair => pair.char === findChar)
            .map(pair => pair.index);
        }
        
        const mentionIndex =
            allIndexesOf(text, '@')
            .reverse()
            .find(index => index < caretPosition);
        if (mentionIndex !== undefined) {
            updateSuggestionBase(text.substring(mentionIndex, caretPosition));
        } else {
            updateSuggestionBase("");
        }
    }, [caretPosition]);

    return (
        <form onSubmit={handleSubmit}>
            <textarea name="text" 
                value={text} 
                onChange={e => updateText(e.target.value)} 
                ref={textarea} />
            <button className="btn"><FiNavigation /></button>
            <MentionSuggestions suggestionBase={suggestionBase} />
        </form>
    );
}