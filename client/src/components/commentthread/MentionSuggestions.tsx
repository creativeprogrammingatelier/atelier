import React from 'react';

interface MentionSuggestionsProperties {
    suggestionBase: string
}

export function MentionSuggestions({ suggestionBase }: MentionSuggestionsProperties) {
    return (
        <div>
            Suggestions based on {suggestionBase}
        </div>
    );
}