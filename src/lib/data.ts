export type Snippet = {
  _id: string;
  name: string;
  language: string;
  code: string;
  tags: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  shareId: string | null;
};

export type SnippetVersion = {
  _id: string;
  snippetId: string;
  name: string;
  language: string;
  code: string;
  tags: string[];
  description: string;
  createdAt: Date;
};

export type Bug = {
  line: number;
  bug: string;
  suggestion: string;
};

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
