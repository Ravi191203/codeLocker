'use server';

import dbConnect from '@/lib/db';
import Folder from '@/models/Folder';
import Snippet from '@/models/Snippet';
import { revalidatePath } from 'next/cache';

export async function getFolders() {
  await dbConnect();
  const folders = await Folder.find({}).sort({ name: 1 });
  return JSON.parse(JSON.stringify(folders));
}

export async function addFolder(name: string) {
  await dbConnect();
  // Check if folder with the same name already exists
  const existingFolder = await Folder.findOne({ name });
  if (existingFolder) {
    throw new Error('A folder with this name already exists.');
  }
  const newFolder = new Folder({ name });
  await newFolder.save();
  revalidatePath('/');
}

export async function deleteFolder(id: string) {
  await dbConnect();
  // Unset the folder field from all snippets in this folder
  await Snippet.updateMany({ folder: id }, { $unset: { folder: 1 } });
  // Delete the folder
  await Folder.findByIdAndDelete(id);
  revalidatePath('/');
}
