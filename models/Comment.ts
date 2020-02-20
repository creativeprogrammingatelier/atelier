export interface Comment {
    commentID?: string,
    commentThreadID?: string, 
    userID?: string,
    date?: Date,
    body?: string
}

export interface DBComment {
    commentid: string,
    commentthreadid: string, 
    userid: string,
    date: Date,
    body: string
}

export function convert(db : DBComment) : Comment {
	return {
		commentID: db.commentid,
		commentThreadID: db.commentthreadid,
		userID: db.userid,
		date: db.date,
		body: db.body
	}
}