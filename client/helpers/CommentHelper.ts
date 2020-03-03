import { Fetch } from './FetchHelper';
import { Comment } from '../../models/api/Comment';

/**
 * Helpers for request for files
 * @deprecated This class uses old API endpoints and should not be used
 */
export default class CommentHelper {

	static getFileComments = (fileId: String, onSuccess: Function, onFailure: Function) => {
		Fetch.fetch(`/comments/file/${fileId}`, {
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
		Fetch.fetch(`/comments`, {
			method: 'PUT',
			body: JSON.stringify(comment)
		}).then(() => {
			onSuccess();
		}).catch(function(error: Error) {
			onFailure(error);
		});
	};

	static deleteComment = (commentId: String, onSuccess: Function, onFailure: Function) => {
		Fetch.fetch(`/comments/${commentId}`, {
			method: 'delete'
		}).then(() => {
			onSuccess();
		}).catch(function(error) {
			onFailure(error);
		});

	};
}