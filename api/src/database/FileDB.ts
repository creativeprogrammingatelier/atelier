import {pool, extract, map, one, pgDB, checkAvailable } from "./HelperDB";
import {File, DBFile, convertFile} from '../../../models/database/File';
import { UUIDHelper } from "../helpers/UUIDHelper";

/**
 * fileID, submissionID, pathname, type
 * @Author Rens Leendertz
 */
export class FileDB {
	static async getAllFiles(DB : pgDB = pool){
		return FileDB.getFilteredFiles({})
	}

	static async getFileByID(fileID : string, DB : pgDB = pool){
		return FileDB.getFilteredFiles({fileID}).then(one)
	}
	
	static async getFilesBySubmission(submissionID : string, DB : pgDB = pool) {
		return FileDB.getFilteredFiles({submissionID})
	}

	static async getFilteredFiles(file : File, DB : pgDB = pool){
		const {
			fileID = undefined,
			submissionID = undefined,
			pathname = undefined,
			type = undefined
		} = file;
		const fileid = UUIDHelper.toUUID(fileID),
			submissionid = UUIDHelper.toUUID(submissionID);
		return DB.query(`SELECT * FROM "Files" 
			WHERE
				($1::uuid IS NULL OR fileID=$1)
			AND ($2::uuid IS NULL OR submissionID=$2)
			AND ($3::text IS NULL OR pathname=$3)
			AND ($4::text IS NULL OR type=$4)
			`, [fileid, submissionid, pathname, type])
		.then(extract).then(map(convertFile))
	}

	static async addFile(file : File, DB : pgDB = pool) {
		checkAvailable(['submissionID','pathname','type'],file)
		const {
			submissionID,
			pathname,
			type
		} = file;
		const submissionid = UUIDHelper.toUUID(submissionID);
		return DB.query(`INSERT INTO "Files" 
			VALUES (DEFAULT, $1,$2,$3) 
			RETURNING *`, [submissionid, pathname, type])
		.then(extract).then(map(convertFile)).then(one)
	}
	
	static async updateFile(file : File, DB : pgDB = pool) {
		checkAvailable(['fileID'],file)
		const {
			fileID,
			submissionID = undefined,
			pathname = undefined,
			type = undefined
		} = file;
		const fileid = UUIDHelper.toUUID(fileID),
			submissionid = UUIDHelper.toUUID(submissionID);
		return DB.query(`UPDATE "Files" SET 
			submissionID = COALESCE($2, submissionID),
			pathname = COALESCE($3, pathname),
			type = COALESCE($4, pathname)
			WHERE fileID=$1
			RETURNING *`, [fileid, submissionid, pathname, type])
		.then(extract).then(map(convertFile)).then(one)
	}
	
	static async deleteFile(fileID : string, DB : pgDB = pool){
		const fileid = UUIDHelper.toUUID(fileID);
		return DB.query(`DELETE FROM "Files" 
			WHERE fileID=$1 
			RETURNING *`,[fileid])
		.then(extract).then(map(convertFile)).then(one)
	}
}