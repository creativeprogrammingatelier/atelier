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

export function convert(db : DBFile) : File {
	return {
		fileID: db.fileid,
		submissionID: db.submissionid,
		pathname: db.pathname,
		type: db.type
	}
}

/**
 * Dependecies
 * @DEPRECATED
 */

const User = require('../models/user');
import mongoose, {Schema, Document} from 'mongoose';


export interface IFile extends Document {
	name: string,
	path: string
	owner: string,
	body?: any
}
const FileSchema = new mongoose.Schema({

	name: {
		type: String,
		required: true
	},
	path: {
		type: String,
		required: true
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}

});


export default mongoose.model<IFile>('File', FileSchema);