import React, { useState } from 'react';
import { FiNavigation } from 'react-icons/fi';

interface WriteCommentProperties { 
    /** This function will be called when a new comment is created */
    newCommentCallback: (text: string) => void
}

export function WriteComment({ newCommentCallback }: WriteCommentProperties) {
    const [text, updateText] = useState("");

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

    return (
        <form onSubmit={handleSubmit}>
            <input name="text" value={text} onChange={e => updateText(e.target.value)} />
            <button className="btn"><FiNavigation/></button>
        </form>
    );
}