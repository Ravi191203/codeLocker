import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISnippetVersion extends Document {
  snippetId: mongoose.Schema.Types.ObjectId;
  name: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  createdAt: Date;
}

const SnippetVersionSchema: Schema = new Schema(
  {
    snippetId: { type: Schema.Types.ObjectId, ref: 'Snippet', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // Only need createdAt for versions
);

const SnippetVersion: Model<ISnippetVersion> = mongoose.models.SnippetVersion || mongoose.model<ISnippetVersion>('SnippetVersion', SnippetVersionSchema);

export default SnippetVersion;
