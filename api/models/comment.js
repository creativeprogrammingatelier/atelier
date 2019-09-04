/**
 * Modeling the user object
 * Author: Andrew Heath
 * Date created: 13/08/19
 */

/**
 * Dependecies 
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new mongoose.Schema({

    about: {
        type: Schema.Types.ObjectId,
        ref: 'file'
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    body: String


});


/**
 * Done before a user object is created
 * Hashing the password and then calling callback
 */

module.exports = mongoose.model('Comment', CommentSchema);