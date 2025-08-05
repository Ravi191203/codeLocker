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
  folder?: string;
}) {
  await dbConnect();
  const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  const snippetData: any = { ...data, tags: tagsArray };

  if (data.folder === 'no-folder') {
    delete snippetData.folder;
  }

  const newSnippet = new Snippet(snippetData);
  await newSnippet.save();
  revalidatePath('/');
}

export async function updateSnippet(id: string, data: {
    name: string;
    description: string;
    code: string;
    language: string;
    tags: string;
    folder?: string;
}) {
    await dbConnect();
    const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    const updateData: any = { ...data, tags: tagsArray };

    if (data.folder === 'no-folder') {
      updateData.$unset = { folder: 1 };
      delete updateData.folder;
    }

    await Snippet.findByIdAndUpdate(id, updateData);
    revalidatePath('/');
}

export async function deleteSnippet(id: string) {
  await dbConnect();
  await Snippet.findByIdAndDelete(id);
  revalidatePath('/');
}
