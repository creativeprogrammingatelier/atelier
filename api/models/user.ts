/**
 * Modeling the user object
 * Author: Andrew Heath
 * Date created: 13/08/19
 */
/**
 * Dependecies 
 */
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from "bcrypt";
/* TODO THIS MUST BE CHANGED BEFORE DEPLOYEMENT */

const saltRounds = 10; //Determines the efficiency vs speed
export interface IUser extends Document{
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
        // remove this any @TODO
        const user: any = this;
        bcrypt.hash(user.password, saltRounds,
            (error, hashedPassword) => {
                if (error) {
                    next(error);
                } else {
                    user.password = hashedPassword;
                    next();
                }
            })
    } else {
        next();
    }
})

/* Autheticating the user*/
UserSchema.methods.isCorrectPassword = function (password: String, next:Function) {
    bcrypt.compare(password, this.password, function (err, same) {
        if (err) {
            next(err);
        } else {
            next(same);
        }
    });
}

export default mongoose.model<IUser>('User', UserSchema);