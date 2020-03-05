//import {IFile} from '../../../models/File';
import {User} from '../../../models/database/User';
import {Request, Response} from 'express';
import { getCurrentUserID } from '../helpers/AuthenticationHelper';
import { UserDB } from '../database/UserDB';

/**
* @TODO this does in not the required behaviour
*/
export default class PermissionsMiddleware {

	/*private static checkFileAccessPermission(file: IFile, user: User): boolean {
		if (file && file.owner && user.userID && user.userID == file.owner || user.role == 'teacher') {
			return true;
		}
		return false;
	}*/

	private static checkCommentAccessPermission(comment: any, user: User): boolean {
		if (comment && (user.email == comment.author.email || user.role == 'teacher')) {
			return true;
		}
		return false;
	}

	//Checks if a user (using the token in the request) is authorised to access a file
	/**
	 *
	 * @param fileId
	 * @param request
	 * @param onAuthorised
	 * @param onUnauthorised
	 * @param onFailure
	 */
	/*static checkFileWithId(request: Request, response: Response, onAuthorised: Function) {
		const fileId: String | null = (request.params.fileId) ? request.params.fileId : (request.body.fileId) ? request.body.fileId : null;
		if (fileId === null) {
			console.error('File Id not provided');
			response.status(400).send();
			return;
		}
		FilesMiddleware.getFile(fileId,
			(file: IFile) => {
				UserMiddleware.getUser(request,
					(user: User, request: Request) => {
						if (PermissionsMiddleware.checkFileAccessPermission(file, user)) {
							onAuthorised();
						} else {
							response.status(401).send();
						}
					},
					(error: Error) => {
						console.error(error), response.status(500).send();
					}
				);
			},
			(error: Error) => {
				console.error(error), response.status(500).send();
			}
		);
	}*/

	static async isTa(request: Request, result: Response, onSuccess: Function) {
        const userID = await getCurrentUserID(request);
        const user = await UserDB.getUserByID(userID);
        const teacherString = 'teacher';
        if (user.permission.role.toLowerCase() === teacherString) {
            onSuccess();
        } else {
            result.status(401).send();
        }
	}

	static async isAdmin(request: Request, result: Response, onSuccess: Function) {
		const userID = await getCurrentUserID(request);
        const user = await UserDB.getUserByID(userID);
        const adminString = 'admin';
        if (user.permission.role.toLowerCase() === adminString) {
            onSuccess();
        } else {
            result.status(401).send();
        }
	}

	/*static checkComment(request: Request, response: Response, onAuthorised: Function) {
		const commentId: String | null = (request.params.commentId) ? request.params.commentId : (request.body.commentId) ? request.body.commentId : null;
		if (commentId === null) {
			console.error('File id not provided');
			response.status(400).send();
			return;
		}
		CommentMiddleware.getComment(commentId,
			(comment: IComment) => {
				UserMiddleware.getUser(request,
					(user: User, request: Request) => {
						if (PermissionsMiddleware.checkCommentAccessPermission(comment, user)) {
							onAuthorised();
						} else {
							response.status(401).send();
						}
					},
					(error: Error) => {
						console.error(error);
						response.status(500).send();
					}
				);
			},
			(error: Error) => {
				console.error(error);
				response.status(500).send();
			}
		);
	}*/

}
