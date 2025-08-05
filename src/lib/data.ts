export type Snippet = {
  _id: string;
  name: string;
  language: 'javascript' | 'python' | 'html' | 'css' | 'sql';
  code: string;
  tags: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export const languages = ['javascript', 'python', 'html', 'css', 'sql'];
