import React, {useState} from 'react';
import {IFile} from "../../../../models/File";
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
        body : 'textasdfadsfasdf\nmadsfasdfasdfore text\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd\nmadsfadsfadfore text\neadfadsfxit()\nadsfadfasdfadfadfa\nadsfadsfadfadfasd'
    };

    // @ts-ignore
    const formattedFile : IFile = {
        ...testFile,
        body : testFile.body
    };
    return (
        <div>
            <h1>Code Tab</h1>
            <CodeViewer2 file={formattedFile} />
        </div>
    )
}