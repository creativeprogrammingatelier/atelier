

import {Request} from "express";
import { Socket } from "socket.io";
export default class SocketMiddleware{

    static sendMessage(request: Request, message: String){
        const io: Socket = request.app.settings['socket-io'];
        io.emit('hello', message);
    }
}