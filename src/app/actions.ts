'use server';

import dbConnect from '@/lib/db';
import Snippet from '@/models/Snippet';
import SnippetVersion from '@/models/SnippetVersion';
import User from '@/models/User';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
import {-v4 as uuidv4} from 'uuid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12);

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
  revalidatePath('/dashboard');
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
    revalidatePath('/dashboard');
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
  revalidatePath('/dashboard');
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
    revalidatePath(`/s/${currentSnippet.shareId}`);
    revalidatePath('/dashboard');
}

export async function updateSnippetSharing(id: string, isPublic: boolean) {
    await dbConnect();
    const snippet = await Snippet.findById(id);
    if (!snippet) {
        throw new Error('Snippet not found');
    }

    let shareId = snippet.shareId;
    if (isPublic && !shareId) {
        shareId = nanoid();
    }

    const updatedSnippet = await Snippet.findByIdAndUpdate(id, { isPublic, shareId }, { new: true });
    
    revalidatePath(`/s/${shareId}`);
    
    return JSON.parse(JSON.stringify(updatedSnippet));
}

export async function getSharedSnippet(shareId: string) {
    await dbConnect();
    const snippet = await Snippet.findOne({ shareId, isPublic: true });
    if (!snippet) {
        return null;
    }
    return JSON.parse(JSON.stringify(snippet));
}

// For this example, we'll have a single default user.
// In a real app, you'd have user authentication and management.
export async function getUser() {
  await dbConnect();
  let user = await User.findOne({ username: 'default' });

  if (!user) {
    const apiKey = `ck_live_${uuidv4().replace(/-/g, '')}`;
    user = new User({
        username: 'default',
        apiKey: apiKey
    });
    await user.save();
  }

  return JSON.parse(JSON.stringify(user));
}