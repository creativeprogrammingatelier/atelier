import React, {useState} from 'react';
import {IFile} from "../../../../models/file";
import CodeViewer from "../CodeViewer";
import CodeViewer2 from "../CodeViewer2";

interface CodeProperties {
    fileName : string,
    comments? : FileComment[],
    file? : IFile,
}

export interface FileComment {
    startLine : number,
    startCharacter : number,
    endLine : number,
    endCharacter : number,
    onClick : Function,
    commentID : number
}

export function CodeTab({file, fileName, comments} : CodeProperties) {
    // File should be passed down
    // @ts-ignore
    const testFile : IFile = {
        name : 'testFile.pde',
        path : '/',
        owner : 'jarik',
        body : 'textasdfadsfasdf\nmadsfasdfasdfore text\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd'
    };

    // @ts-ignore
    const formatedFile : IFile = {
        ...testFile,
        body : testFile.body
    };

    const [lineNumber, setLineNumber] = useState(0);
    const [characterNumber, setCharacterNumber] = useState(0);

    function setCursorLocation(lineNumber : number, characterNumber : number) {
        setLineNumber(lineNumber);
        setCharacterNumber(characterNumber);
    }

    return (
        <div>
            <h1>Code Tab</h1>
            <CodeViewer2 {
                ...{
                    file : formatedFile
                }
            }
                />


        </div>
    )
}

/*
<CodeViewer {...{
                file : formatedFile,
                cursorLineNumber : lineNumber,
                cursorCharacterNumber : characterNumber,
                updateCursorLocation: setCursorLocation,
                comments : fileComments
            }}/>
 */