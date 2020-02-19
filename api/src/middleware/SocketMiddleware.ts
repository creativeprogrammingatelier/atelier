import {Request} from 'express';
import {Socket} from 'socket.io';
// import {Comment} from '../../../models/Comment';
// TODO
type Comment = any;

export default class SocketMiddleware {

	static sendCommentUpdate(request: Request, fileId: string, comment: Comment): void {
		const io: Socket = request.app.settings['socket-io'];
		io.emit(fileId, {type: 'put', comment: comment});
	}

	static sendCommentDelete(request: Request, fileId: string, comment: Comment): void {
		const io: Socket = request.app.settings['socket-io'];
		io.emit(fileId, {type: 'delete', comment: comment});
	}
}