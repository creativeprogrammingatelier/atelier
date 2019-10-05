import { Document } from 'mongoose';

export interface IUserDocument extends Document {
    email: string;
    role: string;
    password: string;
}