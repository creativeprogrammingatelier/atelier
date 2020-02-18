import React from 'react';

interface ProjectProperties {
    setFile : (file : string) => void
}

const files = [
    "Main.java",
    "Helper.java",
    "GameLogic.java"
];

export function ProjectTab({setFile} : ProjectProperties) {
    return (
        <div>
            <h1>Project files</h1>
            {files.map((name) => {
                return (
                    <div>
                        <button onClick={() => setFile(name)}>
                            {name}
                        </button>
                        <br />
                    </div>
                )
            })}
        </div>
    )
}