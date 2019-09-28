/**
 * Modeling the user object
 * Author: Andrew Heath
 * Date created: 13/08/19
 */


import mongoose, { Schema, Document } from 'mongoose';

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


/**
 * Done before a user object is created
 * Hashing the password and then calling callback
 */

module.exports = mongoose.model('Comment', CommentSchema);