'use server';

import dbConnect from '@/lib/db';
import Snippet from '@/models/Snippet';
import SnippetVersion from '@/models/SnippetVersion';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

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
}) {
  await dbConnect();
  const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  const snippetData = { ...data, tags: tagsArray };

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
}) {
    await dbConnect();

    const currentSnippet = await Snippet.findById(id);
    if (!currentSnippet) {
        throw new Error('Snippet not found');
    }

    // Create a version from the current state
    const versionData = {
        snippetId: currentSnippet._id,
        name: currentSnippet.name,
        description: currentSnippet.description,
        code: currentSnippet.code,
        language: currentSnippet.language,
        tags: currentSnippet.tags,
    };
    await new SnippetVersion(versionData).save();


    const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    const updateData = { ...data, tags: tagsArray };

    await Snippet.findByIdAndUpdate(id, updateData);
    revalidatePath('/');
    revalidatePath(`/snippet/${id}/history`);
}

export async function deleteSnippet(id: string) {
  await dbConnect();
  // Using a transaction to ensure both snippet and its versions are deleted
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Snippet.findByIdAndDelete(id, { session });
    await SnippetVersion.deleteMany({ snippetId: id }, { session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
  revalidatePath('/');
}

export async function getSnippetVersions(snippetId: string) {
    await dbConnect();
    const versions = await SnippetVersion.find({ snippetId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(versions));
}

export async function restoreSnippetVersion(versionId: string) {
    await dbConnect();
    const version = await SnippetVersion.findById(versionId);
    if (!version) {
        throw new Error('Version not found');
    }

    const currentSnippet = await Snippet.findById(version.snippetId);
    if (!currentSnippet) {
        throw new Error('Snippet not found');
    }
    
    // Create a new version from the current state before restoring
    const preRestoreVersionData = {
        snippetId: currentSnippet._id,
        name: currentSnippet.name,
        description: currentSnippet.description,
        code: currentSnippet.code,
        language: currentSnippet.language,
        tags: currentSnippet.tags,
    };
    await new SnippetVersion(preRestoreVersionData).save();
    
    // Restore the snippet to the selected version's state
    const updateData = {
        name: version.name,
        description: version.description,
        code: version.code,
        language: version.language,
        tags: version.tags,
    };

    await Snippet.findByIdAndUpdate(version.snippetId, updateData);

    revalidatePath('/');
    revalidatePath(`/snippet/${version.snippetId}/history`);
}
