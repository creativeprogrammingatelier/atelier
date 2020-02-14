import React from 'react';

interface FileSelectionViewerProperties {
    /** List of filenames to show */
    fileNames: string[],
    /** The currently selected file */
    selected: string,
    /** Callback to update the selected file */
    selectedUpdated: (name: string) => void
}

/** This component shows a list of files and allows the user to select one of them
 */
export function FileSelectionViewer({ fileNames, selected, selectedUpdated }: FileSelectionViewerProperties) {
    if (fileNames.length > 0) {
        return (
            <div>
                <p>Choose your main file:</p>
                <ul>{fileNames.map(name =>
                    <li>
                        <input 
                            type="radio"
                            name="main-file"
                            value={name}
                            checked={selected === name}
                            onChange={() => selectedUpdated(name)} />
                        {name}
                    </li>
                )}</ul>
            </div>
        )
    } else {
        return null;
    }
}