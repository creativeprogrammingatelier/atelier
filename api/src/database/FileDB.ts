import {pool, extract, map, one, pgDB } from "./HelperDB";
import {File, DBFile, convertFile} from '../../../models/database/File';

/**
 * fileID, submissionID, pathname, type
 * @Author Rens Leendertz
 */
export class FileDB {
	static getAllFiles(DB : pgDB = pool){
		return FileDB.getFilteredFiles({})
	}

	static getFileByID(fileID : string, DB : pgDB = pool){
		return FileDB.getFilteredFiles({fileID}).then(one)
	}
	
	static getFilesBySubmission(submissionID : string, DB : pgDB = pool) {
		return FileDB.getFilteredFiles({submissionID})
	}

	static getFilteredFiles(file : File, DB : pgDB = pool){
		const {
			fileID = undefined,
			submissionID = undefined,
			pathname = undefined,
			type = undefined
		} = file;
		return DB.query(`SELECT * FROM "Files" 
			WHERE
				($1::uuid IS NULL OR fileID=$1)
			AND ($2::uuid IS NULL OR submissionID=$2)
			AND ($3::text IS NULL OR pathname=$3)
			AND ($4::text IS NULL OR type=$4)
			`, [fileID, submissionID, pathname, type])
		.then(extract).then(map(convertFile))
	}

	static addFile(file : File, DB : pgDB = pool) {
		const {
			submissionID,
			pathname,
			type
		} = file;
		return DB.query(`INSERT INTO "Files" 
			VALUES (DEFAULT, $1,$2,$3) 
			RETURNING *`, [submissionID, pathname, type])
		.then(extract).then(map(convertFile)).then(one)
	}
	
	static updateFile(file : File, DB : pgDB = pool) {
		const {
			fileID,
			submissionID = undefined,
			pathname = undefined,
			type = undefined
		} = file;
		return DB.query(`UPDATE "Files" SET 
			submissionID = COALESCE($2, submissionID),
			pathname = COALESCE($3, pathname),
			type = COALESCE($4, pathname)
			WHERE fileID=$1
			RETURNING *`, [fileID, submissionID, pathname, type])
		.then(extract).then(map(convertFile)).then(one)
	}
	
	static deleteFile(fileID : string, DB : pgDB = pool){
		return DB.query(`DELETE FROM "Files" 
			WHERE fileID=$1 
			RETURNING *`,[fileID])
		.then(extract).then(map(convertFile)).then(one)
	}
}