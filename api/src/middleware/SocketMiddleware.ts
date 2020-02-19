import {Request} from 'express';
import {Socket} from 'socket.io';
<<<<<<< HEAD
=======
// import {Comment} from '../../../models/Comment';
// TODO
type Comment = any;
>>>>>>> 82c417f74a3bf2d50f305f2ea9c4f52c8a81df9d

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