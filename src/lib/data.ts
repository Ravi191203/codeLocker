import { Schema } from "mongoose";

export type Snippet = {
  _id: string;
  name: string;
  language: string;
  code: string;
  tags: string[];
  description: string;
  folder?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Folder = {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const languages = [
  'javascript',
  'python',
  'html',
  'css',
  'sql',
  'typescript',
  'java',
  'csharp',
  'cpp',
  'php',
  'ruby',
  'go',
  'swift',
  'kotlin',
  'rust',
  'bash',
  'powershell',
  'json',
  'yaml',
  'markdown'
];
