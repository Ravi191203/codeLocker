import mongoose, { Document, Schema, Model } from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 24);

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  apiKey: string;
  profilePhotoUrl: string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePhotoUrl: { type: String, default: '' },
    apiKey: { 
        type: String, 
        required: true, 
        unique: true, 
        default: () => `ck_live_${nanoid()}`
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
