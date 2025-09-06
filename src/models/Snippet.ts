import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISnippet extends Document {
  name: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isPublic: boolean;
  shareId: string | null;
  createdAt: Date;
  updatedAt: Date;
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

// This is the robust way to define a model in Next.js/Mongoose.
// It checks if the model already exists before trying to create it,
// preventing errors during hot-reloading in development.
const Snippet: Model<ISnippet> = mongoose.models.Snippet || mongoose.model<ISnippet>('Snippet', SnippetSchema);

export default Snippet;
