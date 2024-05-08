import { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password: string;
}

export const user_schema = new Schema<IUser>({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

