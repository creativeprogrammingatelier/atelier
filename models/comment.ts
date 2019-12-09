/**
 * Modeling the user object
 * Author: Andrew Heath
 * Date created: 13/08/19
 */


import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user';


export interface IComment extends Document{
        about: Schema.Types.ObjectId,
        line: number,
        author: Schema.Types.ObjectId | IUser,
        created: Date,
        body: string
}
const CommentSchema = new mongoose.Schema({

    about: {
        type: Schema.Types.ObjectId,
        ref: 'file'
    },
    line:{
        type: Number
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    created: { 
        type: Date, 
        default: Date.now 
    },
    body: String
});


export default mongoose.model<IComment>('Comment', CommentSchema);