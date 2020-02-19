import FileModel, {IFile} from '../../../models/file';
import fs, {PathLike} from 'fs';
import UserModel, {IUser} from '../../../models/user';
import path from 'path';
import CommentMiddleware from './CommentMiddleware';
import {IComment} from '../../../models/comment';
import { deleteFile } from '../helpers/FilesystemHelper';

/**
 * Files middleware provides helper methods for interacting with Files in the DB
 * TODO: Restructure, this is not middleware
 * @Author Andrew Heath
 */
export default class FilesMiddleware {
	/**
	 * Return files belonging to user
	 * @param {*} userid
	 * @param {*} numberOfFiles # of files to be returned
	 * @TODO implement numberOfFiles
	 */
	static getFiles(userid: String, onSuccess: Function, onFailure: Function) {
		FileModel.find({
			owner: userid
		}, '_id name', (error: Error, response: Response) => {
			if (!error) {
				onSuccess(response);
			} else {
				onFailure(error);
			}
		});
	}
	/**
	 * Returns the files object with a given Id
	 * @param {*} fileId
	 * @param {*} next callback
	 */
	static getFile(fileId: String, onSuccess: Function, onFailure: Function) {
		FileModel.find({
			_id: fileId
		}, '_id name owner path', (error: Error, response: IFile[]) => {
			if (error) {
				onFailure(error);
			} else {
				onSuccess(response[0]);
			}
		});
	}
	/**
	 * Returns file path of files with Id
	 * @param {*} fileid
	 */
	static getFilePath(fileid: String, onSuccess: Function, onFailure: Function) {
		FileModel.find({
			_id: fileid
		}, '-_id path name', {
			limit: 1
		}, (error: Error, data: IFile[]) => {
			if (error) {
				onFailure(error);
			}
			onSuccess(data);
		});
	}

	/**
	 * Deletes file from the databaseRoutes
	 * @param {*} fileid
	 * @TODO Refactor
	 */
	static deleteFile(fileid: String, onSuccess: Function, onFailure: Function) {
		this.getFile(fileid,
			(file: IFile) => {
                deleteFile(file.path)
                .then(() => FileModel.deleteOne({ _id: fileid }, err => err ? onFailure(err) : onSuccess()))
                .catch(onFailure as any)
            },
			onFailure);
	}

	static deleteUserFiles(userId: String, onSuccess: Function, onFailure: Function) {
		FileModel.deleteMany({
			owner: userId
		}), (error: Error) => {
			if (error) {
				console.error(error);
				onFailure();
			} else {
				onSuccess();
			}
		};
	}


	static createFile(fileName: String, path: String, user: IUser, onSuccess: Function, onFailure: Function) {
		const newFile = new FileModel({
			path: path,
			owner: user,
			name: fileName
		});
		newFile.save((error: Error) => {
			if (error) {
				console.error(error);
				onFailure('Error Uploading File');
			} else {
				onSuccess('File Uploaded');
			}
		});
	}

}