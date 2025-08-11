import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IUser extends Document {
  username: string;
  apiKey: string;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    apiKey: { 
        type: String, 
        required: true, 
        unique: true, 
        default: () => `ck_live_${uuidv4().replace(/-/g, '')}`
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
