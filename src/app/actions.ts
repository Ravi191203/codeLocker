'use server';

import dbConnect from '@/lib/db';
import Snippet from '@/models/Snippet';
import { revalidatePath } from 'next/cache';

export async function getSnippets() {
  await dbConnect();
  const snippets = await Snippet.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(snippets));
}

export async function addSnippet(data: {
  name: string;
  description: string;
  code: string;
  language: string;
  tags: string;
  folderId: string;
}) {
  await dbConnect();
  const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  const newSnippet = new Snippet({ ...data, tags: tagsArray });
  await newSnippet.save();
  revalidatePath('/');
}

export async function deleteSnippet(id: string) {
  await dbConnect();
  await Snippet.findByIdAndDelete(id);
  revalidatePath('/');
}
