

import {Request} from "express";
import { Socket } from "socket.io";
export default class SocketMiddleware{

    static sendCommentUpdate(request: Request, fileId: string): void{
        const io: Socket = request.app.settings['socket-io'];
        io.emit(fileId);
    }
}