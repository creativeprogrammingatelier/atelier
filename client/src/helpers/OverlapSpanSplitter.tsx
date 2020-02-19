import React from 'react';
import FastPriorityQueue = require("fastpriorityqueue");

interface CommentSpan {
    startLine : number,
    endLine : number,
    startCharacter : number,
    endCharacter : number,
    id : number
}

interface CommentSpans {
    commentSpans : CommentSpan[]
}

export function commentSpans({commentSpans} : CommentSpans) {
    let x = new FastPriorityQueue(function(a : CommentSpan, b : CommentSpan) {
        if (a.startLine != b.startLine) {
            return a.startLine < b.startLine;
        }
        if (a.startCharacter != b.startCharacter) {
            return a.startCharacter < b.startCharacter;
        }
        if (a.endLine != b.endLine) {
            return a.endLine < b.endLine;
        }
        return a.endLine < b.endCharacter;
    });

    for (const [index, comment] of commentSpans.entries()) {
        console.log(comment);
        x.add(comment);
    }

    let result : CommentSpan[] = [];

    function findNext(nextSpan : CommentSpan, startLine : number, startCharacter : number) {
        return nextSpan.startLine != startLine || nextSpan.startCharacter != startCharacter;
    }

    while (!x.isEmpty()) {
        const currentSpan : CommentSpan = x.poll() as CommentSpan;
        if (x.isEmpty()) {
            result.push(currentSpan);
        } else {
            // Find next comment that starts after this comment
            const nextSpan : CommentSpan | undefined = x.removeOne((a: CommentSpan) => findNext(a, currentSpan.startLine, currentSpan.startCharacter));

            // If no comment starts after this we can add the entire comment
            if (nextSpan == undefined) {
                result.push(currentSpan);
            }
            // If we end before the next comment we can add the entire comment
            else if (currentSpan.endLine < nextSpan.startLine || (currentSpan.endLine == nextSpan.startLine && currentSpan.endCharacter <= nextSpan.startCharacter)) {
                result.push(currentSpan);
            }
            // Split comment at start of the next comment
            else {
                // First half of split
                result.push({
                    startLine : currentSpan.startLine,
                    startCharacter : currentSpan.startCharacter,
                    endLine : nextSpan.startLine,
                    endCharacter : nextSpan.startCharacter,
                    id : currentSpan.id
                });
                // Second half of split might need additional splitting
                x.add({
                    startLine : nextSpan.startLine,
                    startCharacter : nextSpan.startCharacter,
                    endLine : currentSpan.endLine,
                    endCharacter : currentSpan.endCharacter,
                    id : currentSpan.id
                })
            }

            // Add next span again to queue
            if (nextSpan != undefined) {
                x.add(nextSpan);
            }
        }
    }

    console.log(result);
    return result
}

export function generateSpanCode({testFile, commentSpanData} : any) {
    // Create array of code for adding comments etc.
    const codeBodyLines : string[] = testFile.body.replace('\r\n', '\n').split('\n');
    console.log('code body ' + codeBodyLines);
    const codeBodyCharacter : string[][] = codeBodyLines.map((line: string) => line.split(""));
    console.log('code characters ' + codeBodyCharacter);

    const spanLocations : CommentSpan[] = commentSpans(commentSpanData);
    console.log('span locations ' + spanLocations);
    for (const [index, {startLine, startCharacter, endLine, endCharacter, id}] of spanLocations.entries()) {
        const previousStartCharacter = codeBodyCharacter[startLine - 1][startCharacter];
        const previousEndCharacter = codeBodyCharacter[endLine - 1][endCharacter];

        codeBodyCharacter[startLine - 1][startCharacter] = `<span id=${id}>` + previousStartCharacter;
        codeBodyCharacter[endLine - 1][endCharacter] = `</span>` + previousEndCharacter;
    }

    console.log('including spans ' + codeBodyCharacter.map(x => x.join('')).join('\n'));

    return codeBodyCharacter.map(x => x.join('')).join('\n');
}

// Sample comment data
const commentSpanData : CommentSpans = {
    commentSpans : [
        {
            startLine : 2,
            endLine : 3,
            startCharacter : 0,
            endCharacter : 8,
            id : 1
        },
        {
            startLine : 1,
            endLine : 4,
            startCharacter : 0,
            endCharacter : 8,
            id : 2
        },
        {
            startLine: 2,
            endLine : 5,
            startCharacter : 3,
            endCharacter: 10,
            id : 3
        }
    ]};