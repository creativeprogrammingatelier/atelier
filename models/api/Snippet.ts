import {File} from "./File";

export interface Position {
    line: number,
    character: number
}
export interface Selection {
    start: Position,
    end: Position
}
export interface Snippet extends Selection {
    ID: string,
    file: File,
    body: string,
    contextBefore: string,
    contextAfter: string,
    references: {
        courseID: string,
        submissionID: string,
        commentThreadID: string
    }
}

export const noPosition: Position = {line: -1, character: -1};
export const noSelection: Selection = {start: noPosition, end: noPosition};
