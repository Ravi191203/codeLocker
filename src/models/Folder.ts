import mongoose, { Document, Schema } from 'mongoose';

export interface IFolder extends Document {
  name: string;
}

const FolderSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Folder || mongoose.model<IFolder>('Folder', FolderSchema);
