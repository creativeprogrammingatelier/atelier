import AuthHelper from './AuthHelper';
import {Comment} from '../../models/comment';

/**
 * Helpers for request for files
 */
export default class CommentHelper {

	static getFileComments = (fileId: String, onSuccess: Function, onFailure: Function) => {
		AuthHelper.fetch(`/comments/file/${fileId}`, {
			method: 'GET'
		}).then((response) => {
			response.json().then((json: Comment[]) => {
				onSuccess(json);
			});
		}).catch((error) => {
			onFailure(error);
		});


	};

	static putComment = (comment: any, onSuccess: Function, onFailure: Function) => {
		AuthHelper.fetch(`/comments`, {
			method: 'PUT',
			body: JSON.stringify(comment)
		}).then(() => {
			onSuccess();
		}).catch(function(error: Error) {
			onFailure(error);
		});
	};

	static deleteComment = (commentId: String, onSuccess: Function, onFailure: Function) => {
		AuthHelper.fetch(`/comments/${commentId}`, {
			method: 'delete'
		}).then(() => {
			onSuccess();
		}).catch(function(error) {
			onFailure(error);
		});

	};
}