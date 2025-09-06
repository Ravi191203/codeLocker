import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  username: string;
  apiKey: string;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true, default: () => new mongoose.Types.ObjectId().toHexString() },
    apiKey: { 
        type: String, 
        required: true, 
        unique: true, 
        default: () => `ck_live_${new mongoose.Types.ObjectId().toHexString()}`
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
