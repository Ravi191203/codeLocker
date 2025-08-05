import type { LucideIcon } from 'lucide-react';
import { Component, Code, Database, Workflow, TestTube2, Book } from 'lucide-react';

export type Folder = {
  id: string;
  name: string;
  icon: LucideIcon;
};

export type Snippet = {
  _id: string;
  folderId: string;
  name: string;
  language: 'javascript' | 'python' | 'html' | 'css' | 'sql';
  code: string;
  tags: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export const folders: Folder[] = [
  { id: 'f1', name: 'React Components', icon: Component },
  { id: 'f2', name: 'Server-side Logic', icon: Code },
  { id: 'f3', name: 'Database Queries', icon: Database },
  { id: 'f4', name: 'API Integrations', icon: Workflow },
  { id: 'f5', name: 'Testing Utilities', icon: TestTube2 },
  { id: 'f6', name: 'Documentation', icon: Book },
];

export const languages = ['javascript', 'python', 'html', 'css', 'sql'];
