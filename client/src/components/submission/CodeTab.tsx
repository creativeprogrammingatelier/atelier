import React, {useState} from 'react';
import {File} from "../../../../models/File";
import CodeViewer2 from "../CodeViewer2";

interface CodeProperties {
    fileName : string,
    comments? : FileComment[],
    file? : File,
    fileBody? : string
}

export interface FileComment {
    startLine : number,
    startCharacter : number,
    endLine : number,
    endCharacter : number,
    onClick : Function,
    commentID : number
}

export function CodeTab({fileName, comments, file, fileBody} : CodeProperties) {
    // File should be passed down
    const testFile : File = {
        fileID: 'testFile.pde',
        pathname: '/',
    };
    
    const fb = 'textasdfadsfasdf\nmadsfasdfasdfore text\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd'

    return (
        <div>
            <h1>Code Tab</h1>
            <CodeViewer2 file={testFile} fileBody={fb} />
        </div>
    )
}