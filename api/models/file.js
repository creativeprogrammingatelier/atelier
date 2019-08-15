/**
 * Modeling the file object
 * Author: Andrew Heath
 * Date created: 15/08/19
 */

/**
 * Dependecies 
 */
const mongoose = require('mongoose');
const User = require('../models/user')
const Schema = mongoose.Schema;

const FileSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

});





module.exports = mongoose.model('File', FileSchema);