export interface User {
	userID?: string;
	name?: string;
	email?: string;
	role?: string;
	password?: string;
}

export interface DBUser {
	userid: string;
	name: string;
	email: string;
	role: string;
	hash?: string;
}

export function convert(db : DBUser) : User{
	return {
		userID:db.userid,
		name:db.name,
		email:db.email,
		role:db.role
	}
}


/** @DEPRECATED
 * Modeling the user object
 * Author: Andrew Heath
 * Date created: 13/08/19
 */
/**
 * Dependecies
 */
import mongoose, {Schema, Document, Model, model} from 'mongoose';
import bcrypt from 'bcrypt';
import {IUserDocument} from '../interfaces/IUserDocument';
import roleEnum from '../enums/roleEnum';

const saltRounds = 10; //Determines the efficiency vs speed
export interface IUser extends IUserDocument {
	comparePassword(password: String): boolean;
}
export const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	// Role can be {teacher | module coordinator | teaching assistant | student}
	role: {
		type: String,
		required: true
	}

});
export interface IUserModel extends Model<IUser> {
	hashPassword(password: string): string;
}

UserSchema.method('comparePassword', function(password: string): boolean {
	//@ts-ignore
	if (bcrypt.compareSync(password, this.password)) {
		return true;
	}
	return false;
});

UserSchema.pre<IUser>('save', function(next) {
	const user = this;
	if (!user.isModified('password')) return next();
	bcrypt.hash(user.password, saltRounds, function(err, hash) {
		if (err) {
			return next(err);
		}
		console.log(user.password, hash)
		user.password = hash;
		next();
	});
});

UserSchema.static('hashPassword', (password: string): string => {
	return bcrypt.hashSync(password, saltRounds);
});

export const User: IUserModel = model<IUser, IUserModel>('User', UserSchema);

export default User;