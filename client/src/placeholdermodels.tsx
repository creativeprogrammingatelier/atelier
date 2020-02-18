// Generic states
/////////////////
export enum LoadingState { 
    Unloaded, 
    Loading, 
    Loaded, 
    Error 
}

// Comments
///////////
/** A thread of comments and replies */
export interface CommentThread {
    /** Some kind of title for the thread */
    topic: string,
    /** An optional code snippet relating the comment to a piece of code;
     *  may be changed to include linking comments to other things as well 
     */
    snippet: Snippet | undefined,
    /** List of comments made in this thread */
    comments: Comment[],
    /** Which types of users will be able to see these comments, e.g. only
     *  for TA and above or also others
     */
    visibilityLevel: number // TODO: find a better datatype
}

/** A message in a `CommentThread` */
export interface Comment {
    /** The text of the comment, nice and simple */
    text: string,
    /** The user that created the comment; currently just their
     *  name, but can also include other information (e.g. id)
     */
    author: string,
    /** The time the comment was created */
    time: Date
}

/** Part of a code file that a comment is made on */
export interface Snippet { 
    /** Full code of the snippet, as an array of lines, which may
     *  include more context code than the user has selected
     */
    fullText: string[],
    /** Indicates the indices in the `fullText` array that are the 
     *  lines of code the user selected when creating a comment as
     *  a (start, end exclusive) pair
     */
    mainLines: [number, number],
    /** Links to the file of which this snippet is a part */
    fileId: string,
    /** Indicates the lines in the file that correspond to the `mainLines`
     *  in the snippet as a (start, end exclusive) pair
     */
    fileLines: [number, number]
}

// User
///////
export interface User {
    id: string,
    name: string
}

// Submission
/////////////
export interface Submission {
    id: string, 
    name: string, 
    date: Date
}