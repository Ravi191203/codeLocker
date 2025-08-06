import mongoose, { Document, Schema } from 'mongoose';

export interface ISnippet extends Document {
  name: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isPublic: boolean;
  shareId: string;
}

const SnippetSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPublic: { type: Boolean, default: false },
    shareId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.models.Snippet || mongoose.model<ISnippet>('Snippet', SnippetSchema);
