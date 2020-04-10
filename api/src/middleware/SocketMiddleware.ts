import {Request} from 'express';
import {Socket} from 'socket.io';

type Comment = any

export default class SocketMiddleware {

    static sendCommentUpdate(request: Request, fileId: string, comment: Comment): void {
        const io: Socket = request.app.settings['socket-io'];
        io.emit(fileId, {type: 'put', comment});
    }

    static sendCommentDelete(request: Request, fileId: string, comment: Comment): void {
        const io: Socket = request.app.settings['socket-io'];
        io.emit(fileId, {type: 'delete', comment});
    }
}