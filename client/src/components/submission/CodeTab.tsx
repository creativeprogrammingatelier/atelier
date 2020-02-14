import React, {useState} from 'react';
import {Code} from "../../helpers/CodeHelpers";
import {IFile} from "../../../../models/file";
import CodeViewer from "../CodeViewer";
import {CommentEssential} from "../../helpers/CommentHelper";

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

    function commentClick(commentID : number) {
        console.log("clicked comment: " + commentID);
    }

    const fileComments : FileComment[] = [
        {
            startLine : 1,
            startCharacter : 0,
            endLine : 1,
            endCharacter : 3,
            onClick : () => commentClick(1),
            commentID : 1
        },
        {
            startLine : 3,
            startCharacter : 0,
            endLine : 4,
            endCharacter : 3,
            onClick : () => commentClick(2),
            commentID : 2
        },
        {
            startLine : 1,
            startCharacter : 5,
            endLine : 1,
            endCharacter : 30,
            onClick : () => commentClick(3),
            commentID : 3
        }
    ];


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
            {
                (fileName == undefined || fileName == "") ?
                    <p>Select a file in project tab</p> :
                    <div>
                        <h2>{fileName}</h2>
                        <textarea>
                                branch('feature/viewCode')
                                checkout('feature/viewCode')
                                writeCode()
                                add('.')
                                commit('implemented feature view code')
                                push()
                                checkout()
                                merge('feature/viewCode')
                                push()
                            </textarea>
                    </div>
            }
            <CodeViewer {...{
                file : formatedFile,
                commentLineNumber : lineNumber,
                commentCharacterNumber : characterNumber,
                updateCursorLocation: setCursorLocation,
                comments : fileComments
            }}/>


        </div>
    )
}