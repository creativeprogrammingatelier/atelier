/**
 * Modeling the file object
 * Author: Andrew Heath
 * Date created: 15/08/19
 */

export interface File {
	fileID? : string,
	submissionID? : string,
	pathname? : string,
	type? : string
}

export interface DBFile {
	fileid : string,
	submissionid : string,
	pathname : string,
	type : string
}

export function convertFile(db : DBFile) : File {
	return {
		fileID: db.fileid,
		submissionID: db.submissionid,
		pathname: db.pathname,
		type: db.type
	}
}