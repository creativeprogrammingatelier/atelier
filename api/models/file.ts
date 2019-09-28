/**
 * Modeling the file object
 * Author: Andrew Heath
 * Date created: 15/08/19
 */
/**
 * Dependecies 
 */
const User = require('../models/user')
import mongoose, { Schema, Document } from 'mongoose';


export interface IFile{
    name:String,
    path:String,
    owne:String
}
const FileSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

});


export default mongoose.model<IFile>('File', FileSchema);