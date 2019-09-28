/**
 * Modeling the user object
 * Author: Andrew Heath
 * Date created: 13/08/19
 */

/**
 * Dependecies 
 */
import mongoose, { Schema, Document } from 'mongoose';
const bcrypt = require('bcrypt');

/* TODO THIS MUST BE CHANGED BEFORE DEPLOYEMENT */

const saltRounds = 10; //Determines the efficiency vs speed
export interface IUser {
    email: String,
    password: String,
    role: String, 
}
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true
    }
});

/**
 * Done before a user object is created
 * Hashing the password and then calling callback
 */
UserSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('password')) {
        const document = this;
        bcrypt.hash(document.password, saltRounds,
            (error, hashedPassword) => {
                if (error) {
                    next(error);
                } else {
                    document.password = hashedPassword;
                    next();
                }
            })
    } else {
        next();
    }
})

/* Autheticating the user*/
UserSchema.methods.isCorrectPassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (err, same) {
        if (err) {
            callback(err);
        } else {
            callback(err, same);
        }
    });
}


export default mongoose.model<IUser>('User', UserSchema);